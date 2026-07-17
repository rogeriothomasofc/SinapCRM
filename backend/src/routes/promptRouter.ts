import { Router } from "express";
import * as PromptController from "../controllers/PromptController";
import isAuth from "../middleware/isAuth";


const promptRoutes = Router();

promptRoutes.get("/prompt", isAuth, PromptController.index);

promptRoutes.post("/prompt", isAuth, PromptController.store);

promptRoutes.get("/prompt/:promptId", isAuth, PromptController.show);

promptRoutes.put("/prompt/:promptId", isAuth, PromptController.update);

promptRoutes.delete("/prompt/:promptId", isAuth, PromptController.remove);

promptRoutes.patch("/prompt/:promptId/toggle", isAuth, PromptController.togglePrompt);

promptRoutes.post("/prompt/:promptId/test", isAuth, PromptController.testPrompt);

export default promptRoutes;
