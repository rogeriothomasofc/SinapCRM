import { Router, Request, Response } from "express";
import isAuth from "../middleware/isAuth";
import WsAutomation, { WS_DEFAULT_TEMPLATES, WS_EVENT_TYPES, WsEventType } from "../models/WsAutomation";

const wsAutomationRoutes = Router();

// GET /ws-automation — lista todas as automações da empresa, preenchendo defaults onde não configurado
wsAutomationRoutes.get("/ws-automation", isAuth, async (req: Request, res: Response) => {
  const companyId = req.user.companyId;

  const saved = await WsAutomation.findAll({ where: { companyId } });
  const savedByType = Object.fromEntries(saved.map((a) => [a.eventType, a]));

  const result = WS_EVENT_TYPES.map((eventType) => {
    const existing = savedByType[eventType];
    return {
      eventType,
      message: existing?.message ?? WS_DEFAULT_TEMPLATES[eventType],
      enabled: existing?.enabled ?? true,
      isCustom: !!existing,
    };
  });

  res.json(result);
});

// PUT /ws-automation/:eventType — salva (upsert) o template de um tipo de evento
wsAutomationRoutes.put("/ws-automation/:eventType", isAuth, async (req: Request, res: Response) => {
  const companyId = req.user.companyId;
  const eventType = req.params.eventType as WsEventType;
  const { message, enabled } = req.body;

  if (!WS_EVENT_TYPES.includes(eventType)) {
    return res.status(400).json({ error: "eventType inválido" });
  }

  const [record] = await WsAutomation.findOrCreate({
    where: { companyId, eventType },
    defaults: { message: WS_DEFAULT_TEMPLATES[eventType], enabled: true },
  });

  await record.update({
    ...(message !== undefined && { message }),
    ...(enabled !== undefined && { enabled }),
  });

  return res.json(record);
});

// DELETE /ws-automation/:eventType — reseta para o template padrão
wsAutomationRoutes.delete("/ws-automation/:eventType", isAuth, async (req: Request, res: Response) => {
  const companyId = req.user.companyId;
  const eventType = req.params.eventType as WsEventType;

  await WsAutomation.destroy({ where: { companyId, eventType } });

  return res.json({
    eventType,
    message: WS_DEFAULT_TEMPLATES[eventType as WsEventType] ?? "",
    enabled: true,
    isCustom: false,
  });
});

export default wsAutomationRoutes;
