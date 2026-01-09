import { Router } from "express";

export const authRouter = Router();

authRouter.post("/login", (req, res) => {
  try {
  } catch (error) {}
  res.send("this is the login route");
});

authRouter.post("/register", (req, res) => {
  try {
  } catch (error) {}
  res.send("this  is the signin route");
});
