import { config } from "dotenv";
config({ path: `.env.${process.env.NODE_ENV || "development"}.local` });

export const {
  PORT,
  DATABASE_URL,
  PGSSLMODE,
  PG_CONNECTION_TIMEOUT_MS,
  PGHOST,
  PGUSER,
  PGPASSWORD,
  PGDATABASE,
  PGPORT,
  DB_USER,
  DB_PASSWORD,
  DB_NAME,
  DATABASE_SSL,
} = process.env;
