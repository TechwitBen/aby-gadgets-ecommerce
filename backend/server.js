import express from "express";
import { authRouter } from "./routes/auth.routes.js";

const app = express();

const port = 3000;

app.get("/", (req, res) => {
  res.send("server side is working");
});

app.use("/api/v1/auth", authRouter);

app.listen(port, () => {
  console.log(`server is running on localhost ${port}`);
});
