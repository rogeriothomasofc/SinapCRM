import express, { Request, Response } from "express";
import isAuth from "../middleware/isAuth";
import isSuper from "../middleware/isSuper";
import envTokenAuth from "../middleware/envTokenAuth";

import * as CompanyController from "../controllers/CompanyController";
import Company from "../models/Company";
import Plan from "../models/Plan";
import Whatsapp from "../models/Whatsapp";
import Queue from "../models/Queue";

const companyRoutes = express.Router();

companyRoutes.post("/companies/cadastro", envTokenAuth, CompanyController.store);
companyRoutes.put("/companies/update-by-env", envTokenAuth, CompanyController.updateByEnv);

// GET /companies/plan-by-env — retorna limites do plano de uma empresa via env token
companyRoutes.get("/companies/plan-by-env", envTokenAuth, async (req: Request, res: Response): Promise<Response> => {
  const companyId = parseInt(req.query.companyId as string, 10);
  if (!companyId) return res.status(400).json({ error: "companyId obrigatório" });

  try {
    const company = await Company.findByPk(companyId);
    if (!company) return res.status(404).json({ error: "Empresa não encontrada" });

    const plan = company.planId ? await Plan.findByPk(company.planId) : null;
    return res.json({
      planId: plan?.id ?? null,
      users: plan?.users ?? 5,
      connections: plan?.connections ?? 1,
      queues: plan?.queues ?? 3,
    });
  } catch (err: any) {
    return res.status(500).json({ error: "Erro interno" });
  }
});

// PUT /companies/plan-by-env — cria ou atualiza plano dedicado de uma empresa via env token
companyRoutes.put("/companies/plan-by-env", envTokenAuth, async (req: Request, res: Response): Promise<Response> => {
  const { companyId, users, connections, queues } = req.body;
  if (!companyId) return res.status(400).json({ error: "companyId obrigatório" });

  try {
    const company = await Company.findByPk(companyId);
    if (!company) return res.status(404).json({ error: "Empresa não encontrada" });

    let plan = company.planId ? await Plan.findByPk(company.planId) : null;

    if (!plan) {
      plan = await Plan.create({
        name: `store_${companyId}`,
        users: users ?? 5,
        connections: connections ?? 1,
        queues: queues ?? 3,
        value: 0,
        useCampaigns: true,
        useExternalApi: true,
        useInternalChat: true,
        useSchedules: true,
        useKanban: true,
        useOpenAi: true,
        useIntegrations: true,
      });
      await company.update({ planId: plan.id });
    } else {
      await plan.update({
        ...(users !== undefined && { users }),
        ...(connections !== undefined && { connections }),
        ...(queues !== undefined && { queues }),
      });
    }

    return res.json({ planId: plan.id, users: plan.users, connections: plan.connections, queues: plan.queues });
  } catch (err: any) {
    return res.status(500).json({ error: "Erro interno" });
  }
});

// Retorna conexões WhatsApp e setores disponíveis para uma empresa via env token.
companyRoutes.get("/companies/options-by-env", envTokenAuth, async (req: Request, res: Response): Promise<Response> => {
  const companyId = parseInt(req.query.companyId as string, 10);
  if (!companyId) return res.status(400).json({ error: "companyId obrigatório" });

  try {
    const [connections, queues] = await Promise.all([
      Whatsapp.findAll({ where: { companyId }, attributes: ["id", "name", "status"], order: [["name", "ASC"]] }),
      Queue.findAll({ where: { companyId }, attributes: ["id", "name", "color"], order: [["name", "ASC"]] }),
    ]);
    return res.json({ connections, queues });
  } catch (err: any) {
    return res.status(500).json({ error: "Erro interno" });
  }
});
companyRoutes.get("/companies/list", isAuth, isSuper, CompanyController.list);
companyRoutes.get("/companies", isAuth, isSuper, CompanyController.index);
companyRoutes.get("/companies/:id", isAuth, CompanyController.show);
companyRoutes.post("/companies", isAuth, isSuper, CompanyController.store);
companyRoutes.put("/companies/:id", isAuth, isSuper, CompanyController.update);
companyRoutes.put("/companies/:id/schedules",isAuth,CompanyController.updateSchedules);
companyRoutes.delete("/companies/:id", isAuth, isSuper, CompanyController.remove);

// Rota para listar o plano da empresa
companyRoutes.get("/companies/listPlan/:id", isAuth, CompanyController.listPlan);
companyRoutes.get("/companiesPlan", isAuth, CompanyController.indexPlan);

export default companyRoutes;
