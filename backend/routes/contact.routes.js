import { Router } from "express";

import { contactFormController } from  "../controllers/contact.controller.js";
 
const contactRouter = Router();
 
// POST /api/v1/contact
contactRouter.post("/", contactFormController);
 
export default contactRouter;