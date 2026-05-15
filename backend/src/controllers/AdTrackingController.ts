import { Request, Response } from "express";
import { Op } from "sequelize";
import Ticket from "../models/Ticket";
import CAPIEvent from "../models/CAPIEvent";
import Contact from "../models/Contact";
import Setting from "../models/Setting";
import { retryCAPIEvent as doRetry } from "../services/MetaCAPIService";

export const adStats = async (req: Request, res: Response): Promise<Response> => {
  const { companyId } = req.user;
  const { startDate, endDate } = req.query as { startDate?: string; endDate?: string };

  const dateFilter: Record<string, unknown> = {};
  if (startDate) dateFilter[Op.gte as any] = new Date(startDate);
  if (endDate) {
    const end = new Date(endDate);
    end.setHours(23, 59, 59, 999);
    dateFilter[Op.lte as any] = end;
  }

  const where: Record<string, unknown> = {
    companyId,
    ctwaClid: { [Op.ne]: null }
  };
  if (startDate || endDate) where.createdAt = dateFilter;

  const capiWhere: Record<string, unknown> = { companyId, status: "failed" };
  if (startDate || endDate) capiWhere.createdAt = dateFilter;

  const [total, closed, tickets, failedEvents] = await Promise.all([
    Ticket.count({ where }),
    Ticket.count({ where: { ...where, status: "closed" } }),
    Ticket.findAll({
      where,
      attributes: ["id", "adTitle", "adSourceId", "adSourceUrl", "status", "createdAt", "ctwaClid"],
      include: [{ model: Contact, attributes: ["name", "number"] }],
      order: [["createdAt", "DESC"]],
      limit: 200
    }),
    CAPIEvent.findAll({
      where: capiWhere,
      order: [["createdAt", "DESC"]],
      limit: 100
    })
  ]);

  const byAd: Record<string, { title: string; count: number; closed: number }> = {};
  for (const t of tickets) {
    const key = t.adTitle || t.adSourceId || "Anúncio sem título";
    if (!byAd[key]) byAd[key] = { title: key, count: 0, closed: 0 };
    byAd[key].count++;
    if (t.status === "closed") byAd[key].closed++;
  }

  return res.json({
    total,
    closed,
    conversionRate: total > 0 ? ((closed / total) * 100).toFixed(1) : "0.0",
    byAd: Object.values(byAd).sort((a, b) => b.count - a.count),
    tickets: tickets.slice(0, 50),
    failedEvents
  });
};

export const ticketCAPIEvents = async (req: Request, res: Response): Promise<Response> => {
  const { companyId } = req.user;
  const { ticketId } = req.params;

  const events = await CAPIEvent.findAll({
    where: { ticketId: Number(ticketId), companyId },
    order: [["createdAt", "ASC"]]
  });

  return res.json(events);
};

export const retryCAPIEvent = async (req: Request, res: Response): Promise<Response> => {
  const { companyId } = req.user;
  const { eventId } = req.params;

  try {
    const event = await doRetry(Number(eventId), companyId);
    return res.json(event);
  } catch (e: any) {
    return res.status(400).json({ error: e.message });
  }
};

export const getConfig = async (req: Request, res: Response): Promise<Response> => {
  const { companyId } = req.user;

  const [pixelSetting, tokenSetting, enabledSetting, rulesSetting] = await Promise.all([
    Setting.findOne({ where: { companyId, key: "metaPixelId" } }),
    Setting.findOne({ where: { companyId, key: "metaAccessToken" } }),
    Setting.findOne({ where: { companyId, key: "metaCAPIEnabled" } }),
    Setting.findOne({ where: { companyId, key: "capiRules" } })
  ]);

  const defaultRules = { leadOnNewFromAd: true, completeOnClose: true, eventOnClose: "CompleteRegistration" };

  return res.json({
    pixelId: pixelSetting?.value || "",
    accessToken: tokenSetting?.value || "",
    enabled: enabledSetting?.value === "enabled",
    rules: rulesSetting?.value ? { ...defaultRules, ...JSON.parse(rulesSetting.value) } : defaultRules
  });
};

async function upsertSetting(companyId: number, key: string, value: string) {
  const [setting] = await Setting.findOrCreate({ where: { companyId, key }, defaults: { value } as any });
  if ((setting as any).value !== value) await (setting as any).update({ value });
}

export const saveConfig = async (req: Request, res: Response): Promise<Response> => {
  const { companyId } = req.user;
  const { pixelId, accessToken, enabled, rules } = req.body;

  await Promise.all([
    upsertSetting(companyId, "metaPixelId", String(pixelId || "")),
    upsertSetting(companyId, "metaAccessToken", String(accessToken || "")),
    upsertSetting(companyId, "metaCAPIEnabled", enabled ? "enabled" : "disabled"),
    upsertSetting(companyId, "capiRules", JSON.stringify(rules || {}))
  ]);

  return res.json({ ok: true });
};
