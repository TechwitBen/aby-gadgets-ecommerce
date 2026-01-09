import { Pool } from "pg";
import {
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
} from "./configs/.env.configs.js";

const createPool = () => {
  const defaultConnTimeout = PG_CONNECTION_TIMEOUT_MS
    ? parseInt(PG_CONNECTION_TIMEOUT_MS, 10)
    : 5000;

  if (DATABASE_URL) {
    const config = {
      connectionString: DATABASE_URL,
      connectionTimeoutMillis: defaultConnTimeout,
      // keepAlive can help with some hosted providers
      keepAlive: true,
    };

    // Enable SSL for hosted Postgres providers like Neon when using a DATABASE_URL.
    // Allow override via PGSSLMODE or DATABASE_SSL env var.
    const wantsSsl =
      PGSSLMODE === "require" ||
      DATABASE_SSL === "true" ||
      (DATABASE_URL && DATABASE_URL.includes("neon"));

    if (wantsSsl) {
      config.ssl = { rejectUnauthorized: false };
    }

    return new Pool(config);
  }

  return new Pool({
    host: PGHOST || "localhost",
    user: PGUSER || DB_USER || "",
    password: PGPASSWORD || DB_PASSWORD || "",
    database: PGDATABASE || DB_NAME || "",
    port: PGPORT ? parseInt(PGPORT, 10) : 5432,
    connectionTimeoutMillis: defaultConnTimeout,
    keepAlive: true,
  });
};

const pool = createPool();

// Test connection on startup
pool
  .connect()
  .then((client) => {
    client.release();
    console.log("Postgres connected");
  })
  .catch((err) => {
    console.error("Postgres connection error:", err.stack || err);
  });

// Log unexpected errors from idle clients (helpful for debugging)
pool.on("error", (err) => {
  console.error("Unexpected idle Postgres client error:", err);
});

/**
 * Test connection helper for manual debugging. Example:
 *   node -e "import('./backend/db.js').then(m=>m.testConnection())"
 */
export const testConnection = async (timeoutMs = 10000) => {
  const timer = setTimeout(() => {
    console.error(`testConnection timed out after ${timeoutMs}ms`);
    process.exitCode = 1;
  }, timeoutMs);

  try {
    const client = await pool.connect();
    try {
      const res = await client.query("SELECT NOW()");
      console.log("testConnection OK:", res.rows[0]);
    } finally {
      client.release();
    }
  } catch (err) {
    console.error("testConnection error:", err.stack || err);
    throw err;
  } finally {
    clearTimeout(timer);
  }
};

export const query = (text, params) => pool.query(text, params);

export default pool;
