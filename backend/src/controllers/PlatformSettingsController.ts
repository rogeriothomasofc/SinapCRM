import { Request, Response } from "express";
import { Op } from "sequelize";
import Setting from "../models/Setting";
import User from "../models/User";
import AppError from "../errors/AppError";

const PLATFORM_KEYS = [
  "payment_gateway",
  "efi_client_id",
  "efi_client_secret",
  "efi_pix_key",
  "efi_pix_cert",
  "efi_sandbox",
  "asaas_api_key",
  "asaas_env",
  "trial_days"
];

const getSuperCompanyId = async (userId: number): Promise<number> => {
  const user = await User.findByPk(userId);
  if (!user || !user.super) throw new AppError("ERR_FORBIDDEN", 403);
  return user.companyId;
};

export const index = async (req: Request, res: Response): Promise<Response> => {
  const companyId = await getSuperCompanyId(Number(req.user.id));

  const settings = await Setting.findAll({
    where: { companyId, key: { [Op.in]: PLATFORM_KEYS } }
  });

  const result: Record<string, string> = {};
  PLATFORM_KEYS.forEach(k => { result[k] = ""; });
  settings.forEach(s => { result[s.key] = s.value; });

  return res.json(result);
};

export const update = async (req: Request, res: Response): Promise<Response> => {
  const companyId = await getSuperCompanyId(Number(req.user.id));
  const updates: Record<string, string> = req.body;

  await Promise.all(
    Object.entries(updates).map(async ([key, value]) => {
      if (!PLATFORM_KEYS.includes(key)) return;
      await Setting.upsert({ companyId, key, value: String(value) });
    })
  );

  return res.json({ ok: true });
};
