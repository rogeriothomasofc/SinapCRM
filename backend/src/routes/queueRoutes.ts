import { Router, Request, Response } from "express";
import isAuth from "../middleware/isAuth";

import * as QueueController from "../controllers/QueueController";
import User from "../models/User";
import Queue from "../models/Queue";

const queueRoutes = Router();

queueRoutes.get("/queue", isAuth, QueueController.index);

queueRoutes.post("/queue", isAuth, QueueController.store);

queueRoutes.get("/queue/:queueId", isAuth, QueueController.show);

queueRoutes.put("/queue/:queueId", isAuth, QueueController.update);

queueRoutes.delete("/queue/:queueId", isAuth, QueueController.remove);

// Atribui atendentes a um setor (gerencia UserQueue junction).
queueRoutes.put("/queue/:queueId/users", isAuth, async (req: Request, res: Response): Promise<Response> => {
  const queueId = parseInt(req.params.queueId, 10);
  const { userIds } = req.body as { userIds: number[] };
  const { companyId } = req.user;

  // Usuários que atualmente pertencem a este setor
  const currentUsers = await User.findAll({
    where: { companyId },
    include: [{ model: Queue, as: "queues", where: { id: queueId }, required: true }],
  });

  const currentIds = currentUsers.map(u => u.id);
  const toAdd = (userIds || []).filter(id => !currentIds.includes(id));
  const toRemove = currentIds.filter(id => !(userIds || []).includes(id));

  for (const userId of toAdd) {
    const user = await User.findOne({ where: { id: userId, companyId } });
    if (user) await user.$add("queues", queueId);
  }
  for (const userId of toRemove) {
    const user = await User.findOne({ where: { id: userId, companyId } });
    if (user) await user.$remove("queues", queueId);
  }

  return res.json({ ok: true });
});

export default queueRoutes;
