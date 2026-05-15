import { Request, Response } from "express";
import CreateService from "../services/FollowUpService/CreateService";
import ListService from "../services/FollowUpService/ListService";
import UpdateService from "../services/FollowUpService/UpdateService";
import DeleteService from "../services/FollowUpService/DeleteService";

export const index = async (req: Request, res: Response): Promise<Response> => {
  const { companyId } = req.user;
  const followUps = await ListService(companyId);
  return res.json(followUps);
};

export const store = async (req: Request, res: Response): Promise<Response> => {
  const { companyId } = req.user;
  const { name, funnelConfig, triggerType, triggerTime, actions, rules, active } = req.body;
  const followUp = await CreateService({ name, funnelConfig, triggerType, triggerTime, actions, rules, active, companyId });
  return res.status(200).json(followUp);
};

export const update = async (req: Request, res: Response): Promise<Response> => {
  const { id } = req.params;
  const { companyId } = req.user;
  const { name, funnelConfig, triggerType, triggerTime, actions, rules, active } = req.body;
  const followUp = await UpdateService({ id: parseInt(id), companyId, name, funnelConfig, triggerType, triggerTime, actions, rules, active });
  return res.status(200).json(followUp);
};

export const remove = async (req: Request, res: Response): Promise<Response> => {
  const { id } = req.params;
  const { companyId } = req.user;
  await DeleteService(parseInt(id), companyId);
  return res.status(200).json({ ok: true });
};
