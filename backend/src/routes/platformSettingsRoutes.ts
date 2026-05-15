import { Router } from "express";
import isAuth from "../middleware/isAuth";
import isSuper from "../middleware/isSuper";
import * as PlatformSettingsController from "../controllers/PlatformSettingsController";

const platformSettingsRoutes = Router();

platformSettingsRoutes.get("/platform-settings", isAuth, isSuper, PlatformSettingsController.index);
platformSettingsRoutes.put("/platform-settings", isAuth, isSuper, PlatformSettingsController.update);

export default platformSettingsRoutes;
