import { Router } from "express";

import { getAuditLogs, getUnreadCount } from "../controllers/auditLog.controller.js";
import { isAuthenticated, isAdmin } from "../middlewares/auth.middleware.js";

const auditRouter = Router();

auditRouter.get("/",         isAuthenticated, isAdmin, getAuditLogs);
auditRouter.get("/unread",   isAuthenticated, isAdmin, getUnreadCount);

export default auditRouter;