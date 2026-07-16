import express, { Request, Response } from "express";
import isAuth from "../middleware/isAuth";
import isSuper from "../middleware/isSuper";
import envTokenAuth from "../middleware/envTokenAuth";

import * as CompanyController from "../controllers/CompanyController";
import Whatsapp from "../models/Whatsapp";
import Queue from "../models/Queue";

const companyRoutes = express.Router();

companyRoutes.post("/companies/cadastro", envTokenAuth, CompanyController.store);
companyRoutes.put("/companies/update-by-env", envTokenAuth, CompanyController.updateByEnv);

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
