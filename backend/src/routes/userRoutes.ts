import { Router, Request, Response } from "express";

import isAuth from "../middleware/isAuth";
import envTokenAuth from "../middleware/envTokenAuth";
import * as UserController from "../controllers/UserController";
import User from "../models/User";

const userRoutes = Router();

userRoutes.get("/users", isAuth, UserController.index);

userRoutes.get("/users/list", isAuth, UserController.list);

userRoutes.post("/users", isAuth, UserController.store);

userRoutes.put("/users/:userId", isAuth, UserController.update);

userRoutes.get("/users/:userId", isAuth, UserController.show);

userRoutes.delete("/users/:userId", isAuth, UserController.remove);

userRoutes.post("/users/set-language/:newLanguage", isAuth, UserController.setLanguage);

// Cria (ou atualiza existente) um usuário dentro de uma empresa via env token.
// Usado pelo WhatsApp Store ao adicionar um membro na loja.
userRoutes.post("/users/create-by-env", envTokenAuth, async (req: Request, res: Response): Promise<Response> => {
  const { companyId, email, name, avatarUrl, whatsappId, queueIds } = req.body;

  if (!companyId || !email || !name) {
    return res.status(400).json({ error: "companyId, email e name são obrigatórios" });
  }

  try {
    let user = await User.findOne({ where: { email, companyId } });
    if (user) {
      const updates: any = {};
      if (avatarUrl && user.avatarUrl !== avatarUrl) updates.avatarUrl = avatarUrl;
      if (whatsappId !== undefined) updates.whatsappId = whatsappId || null;
      if (Object.keys(updates).length) await user.update(updates);
      if (queueIds !== undefined) await user.$set("queues", queueIds || []);
      return res.json({ id: user.id, email: user.email, name: user.name, alreadyExisted: true });
    }

    const tempPassword = Math.random().toString(36).slice(-12) + "!A1";
    user = await User.create({
      email,
      name,
      password: tempPassword,
      profile: "admin",
      companyId,
      avatarUrl: avatarUrl || null,
      whatsappId: whatsappId || null,
    }, { include: ["queues"] });

    if (queueIds?.length) await user.$set("queues", queueIds);

    return res.status(201).json({ id: user.id, email: user.email, name: user.name, alreadyExisted: false });
  } catch (err: any) {
    return res.status(500).json({ error: "Erro interno", details: err?.message });
  }
});

// Atualiza conexão e setores de um usuário existente via env token.
userRoutes.put("/users/update-by-env", envTokenAuth, async (req: Request, res: Response): Promise<Response> => {
  const { companyId, email, whatsappId, queueIds } = req.body;

  if (!companyId || !email) {
    return res.status(400).json({ error: "companyId e email são obrigatórios" });
  }

  try {
    const user = await User.findOne({ where: { email, companyId } });
    if (!user) return res.status(404).json({ error: "Usuário não encontrado" });

    const updates: any = {};
    if (whatsappId !== undefined) updates.whatsappId = whatsappId || null;
    if (Object.keys(updates).length) await user.update(updates);
    if (queueIds !== undefined) await user.$set("queues", queueIds || []);

    return res.json({ ok: true });
  } catch (err: any) {
    return res.status(500).json({ error: "Erro interno", details: err?.message });
  }
});

export default userRoutes;
