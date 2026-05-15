import mongoose from "mongoose";
import { MONGODB_URI } from "./configs/.env.configs.js";

const uri = process.env.MONGO_URI || MONGODB_URI;

export const connect = async (retries = 5, delayMs = 3000) => {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      await mongoose.connect(uri, {
        serverSelectionTimeoutMS: 5000, // give up on a single attempt after 5s
        maxPoolSize: 10,                // max 10 simultaneous DB connections
      });
      console.log("MongoDB connected");
      return;
    } catch (err) {
      if (attempt < retries) {
        console.log(`MongoDB connection attempt ${attempt} failed — retrying in ${delayMs / 1000}s...`);
        await new Promise((r) => setTimeout(r, delayMs));
      } else {
        console.error("MongoDB connection failed after all retries:", err.message);
        throw err; // give up after all retries exhausted
      }
    }
  }
};

// Handle connection events after initial connect
mongoose.connection.on("disconnected", () => {
  console.warn("MongoDB disconnected");
});

mongoose.connection.on("reconnected", () => {
  console.log("MongoDB reconnected");
});

mongoose.connection.on("error", (err) => {
  console.error("MongoDB connection error:", err.message);
});

export default mongoose.connection;