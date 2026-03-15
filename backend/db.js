import mongoose from "mongoose";
import { MONGODB_URI } from "./configs/.env.configs.js";

const uri = process.env.MONGO_URI || MONGODB_URI;
let connectionPromise = null;

export const connect = async () => {
  if (connectionPromise) return connectionPromise;
  connectionPromise = mongoose
    .connect(uri)
    .then((m) => {
      console.log("MongoDB connected");
      return m;
    })
    .catch((err) => {
      connectionPromise = null;
      throw err;
    });
  return connectionPromise;
};

export default mongoose.connection;
