import { Router } from "express";

import {
  getAllStaff, getStaffById, inviteStaff,
  getInviteInfo, acceptInvite,
  updateStaffPermissions, updateStaffStatus, deleteStaff,
} from "../controllers/staff.controller.js";
import { isAuthenticated, isAdmin, isAdminOrStaff } from "../middlewares/auth.middleware.js";

const staffRouter = Router();

staffRouter.get( "/invite/:token",  getInviteInfo);
staffRouter.post("/invite/:token",  acceptInvite);


staffRouter.get("/",        isAuthenticated, isAdmin,        getAllStaff);
staffRouter.get("/:id",     isAuthenticated, isAdmin,        getStaffById);
staffRouter.post("/invite",      isAuthenticated, isAdmin, inviteStaff);
staffRouter.patch("/:id/permissions", isAuthenticated, isAdmin, updateStaffPermissions);
staffRouter.patch("/:id/status",      isAuthenticated, isAdmin, updateStaffStatus);
staffRouter.delete("/:id",  isAuthenticated, isAdmin,        deleteStaff);

export default staffRouter;