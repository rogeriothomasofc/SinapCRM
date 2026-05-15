import express from "express";
import isAuth from "../middleware/isAuth";
import * as FollowUpController from "../controllers/FollowUpController";

const followUpRoutes = express.Router();

followUpRoutes.get("/followup", isAuth, FollowUpController.index);
followUpRoutes.post("/followup", isAuth, FollowUpController.store);
followUpRoutes.put("/followup/:id", isAuth, FollowUpController.update);
followUpRoutes.delete("/followup/:id", isAuth, FollowUpController.remove);

export default followUpRoutes;
