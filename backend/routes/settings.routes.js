import { Router } from "express";
import {
  getSettings, updateSettings, getDeliveryZones,
} from "../controllers/settings.controller.js";
import { isAuthenticated, isAdmin } from "../middlewares/auth.middleware.js";

const settingsRouter = Router();

// Admin-only — full settings read/write
settingsRouter.get("/",               isAuthenticated, isAdmin, getSettings);
settingsRouter.put("/",               isAuthenticated, isAdmin, updateSettings);

// Authenticated users — delivery zones + fulfillment config needed at checkout
settingsRouter.get("/delivery-zones", isAuthenticated, getDeliveryZones);

export default settingsRouter;