import mongoose from "mongoose";

/**
 * Counter model for generating atomic, monthly-resetting sequences.
 * Each document tracks a named counter (e.g., "order-2604", "payment-2604").
 * Keys are scoped by YYMM so the sequence resets automatically every month.
 */
const CounterSchema = new mongoose.Schema({
  _id: { type: String, required: true }, // e.g. "order-2604", "payment-2604"
  seq: { type: Number, default: 0 },
});

const Counter =
  mongoose.models.Counter || mongoose.model("Counter", CounterSchema);

export default Counter;