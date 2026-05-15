import express from "express";
import isAuth from "../middleware/isAuth";
import * as AdTrackingController from "../controllers/AdTrackingController";

const adTrackingRoutes = express.Router();

adTrackingRoutes.get("/ad-tracking/stats", isAuth, AdTrackingController.adStats);
adTrackingRoutes.get("/ad-tracking/tickets/:ticketId/capi-events", isAuth, AdTrackingController.ticketCAPIEvents);
adTrackingRoutes.post("/ad-tracking/capi-events/:eventId/retry", isAuth, AdTrackingController.retryCAPIEvent);
adTrackingRoutes.get("/ad-tracking/config", isAuth, AdTrackingController.getConfig);
adTrackingRoutes.put("/ad-tracking/config", isAuth, AdTrackingController.saveConfig);

export default adTrackingRoutes;
