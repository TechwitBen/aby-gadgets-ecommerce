import { config } from "dotenv";
config(); // ← just loads .env, no more .env.development.local nonsense
console.log('GOOGLE_CLIENT_ID loaded?', !!process.env.GOOGLE_CLIENT_ID);
export const {
  PORT,
  MONGODB_URI,
  SESSION_SECRET,
  GOOGLE_CLIENT_SECRET,
  GOOGLE_CLIENT_ID,
  PAYSTACK_SECRET_KEY,
  SMTP_HOST,
  SMTP_PORT,
  SMTP_USER,
  SMTP_PASS,
  EMAIL_FROM,
  FRONTEND_URL,
  BACKEND_URL,
  ALLOWED_ORIGINS,
  FACEBOOK_APP_ID,
  FACEBOOK_APP_SECRET,
  NODE_ENV,
} = process.env;