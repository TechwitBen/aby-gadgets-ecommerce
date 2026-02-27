import mongoose from "mongoose";
import { MONGODB_URI } from "./configs/.env.configs.js";

const mongoUri = process.env.MONGO_URI || MONGODB_URI;

const defaultOptions = {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverSelectionTimeoutMS: 10000,
};

let connectionPromise = null;

export const connect = async (uri = mongoUri, options = defaultOptions) => {
  if (connectionPromise) return connectionPromise;
  connectionPromise = mongoose
    .connect(uri, options)
    .then((m) => {
      console.log("MongoDB connected");
      return m;
    })
    .catch((err) => {
      console.error("MongoDB connection error:", err);
      connectionPromise = null;
      throw err;
    });

  return connectionPromise;
};

export const testConnection = async (timeoutMs = 10000) => {
  const timer = setTimeout(() => {
    console.error(`testConnection timed out after ${timeoutMs}ms`);
    process.exitCode = 1;
  }, timeoutMs);

  try {
    await connect();
    console.log("testConnection OK: MongoDB is reachable");
  } catch (err) {
    console.error("testConnection error:", err);
    throw err;
  } finally {
    clearTimeout(timer);
  }
};

export default mongoose.connection;
