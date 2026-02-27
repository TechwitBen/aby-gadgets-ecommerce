import { Router } from "express";

const productRouter = Router();

productRouter.get("/", async (req, res) => {
  res.send("Product routes path");
});

export default productRouter;
