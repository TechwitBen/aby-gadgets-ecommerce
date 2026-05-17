import Counter from "../models/counter.model.js";

/**
 * Generates a concurrency-safe, monthly-resetting human-readable order number.
 *
 * Format : Aby-YYMM-XXXX   (e.g. Aby-2604-0001)
 * Safety : Uses MongoDB findOneAndUpdate (atomic) scoped to the active session,
 *          so the counter rolls back automatically if the surrounding transaction
 *          is aborted — no orphaned gaps under failure.
 *
 * @param {import("mongoose").ClientSession} [session] - Active Mongoose session
 * @returns {Promise<string>}
 */
export async function generateOrderNumber(session) {
  const now = new Date();
  const yy  = String(now.getFullYear()).slice(-2);
  const mm  = String(now.getMonth() + 1).padStart(2, "0");
  const key = `order-${yy}${mm}`;

  const opts = { upsert: true, new: true };
  if (session) opts.session = session;

  const counter = await Counter.findOneAndUpdate(
    { _id: key },
    { $inc: { seq: 1 } },
    opts,
  );

  return `Aby-${yy}${mm}-${String(counter.seq).padStart(4, "0")}`;
}

/**
 * Generates a concurrency-safe, monthly-resetting human-readable payment number.
 *
 * Format : PAY-YYMM-XXXX   (e.g. PAY-2604-0001)
 * Note   : The existing `reference` field (Paystack gateway ref) is untouched.
 *          This is a separate, human-readable identifier stored in payment_number.
 *
 * @param {import("mongoose").ClientSession} [session] - Active Mongoose session
 * @returns {Promise<string>}
 */
export async function generatePaymentNumber(session) {
  const now = new Date();
  const yy  = String(now.getFullYear()).slice(-2);
  const mm  = String(now.getMonth() + 1).padStart(2, "0");
  const key = `payment-${yy}${mm}`;

  const opts = { upsert: true, new: true };
  if (session) opts.session = session;

  const counter = await Counter.findOneAndUpdate(
    { _id: key },
    { $inc: { seq: 1 } },
    opts,
  );

  return `PAY-${yy}${mm}-${String(counter.seq).padStart(4, "0")}`;
}