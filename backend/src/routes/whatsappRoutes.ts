import express, { Request, Response } from "express";
import isAuth from "../middleware/isAuth";

import * as WhatsAppController from "../controllers/WhatsAppController";
import User from "../models/User";

const whatsappRoutes = express.Router();

whatsappRoutes.get("/whatsapp/", isAuth, WhatsAppController.index);

whatsappRoutes.post("/whatsapp/", isAuth, WhatsAppController.store);

whatsappRoutes.get("/whatsapp/:whatsappId", isAuth, WhatsAppController.show);

whatsappRoutes.put("/whatsapp/:whatsappId", isAuth, WhatsAppController.update);

whatsappRoutes.delete(
  "/whatsapp/:whatsappId",
  isAuth,
  WhatsAppController.remove
);

whatsappRoutes.post(
  "/whatsapp/:whatsappId/sync-contacts",
  isAuth,
  WhatsAppController.syncContacts
);

// Atribui atendentes a uma conexão WhatsApp (define user.whatsappId).
whatsappRoutes.put("/whatsapp/:whatsappId/users", isAuth, async (req: Request, res: Response): Promise<Response> => {
  const whatsappId = parseInt(req.params.whatsappId, 10);
  const { userIds } = req.body as { userIds: number[] };
  const { companyId } = req.user;

  // Limpa conexão de quem tinha esta antes e não está mais selecionado
  await User.update({ whatsappId: null }, { where: { companyId, whatsappId } });

  // Atribui a conexão aos usuários selecionados
  if (userIds?.length) {
    await User.update({ whatsappId }, { where: { id: userIds, companyId } });
  }

  return res.json({ ok: true });
});

export default whatsappRoutes;
