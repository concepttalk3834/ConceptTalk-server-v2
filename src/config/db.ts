import { Pool } from "pg";
import dotenv from "dotenv";
import pino from "pino";

dotenv.config();

// Setup logger
const logger = pino({
  transport: process.env.NODE_ENV === "development" ? {
    target: "pino-pretty",
    options: { colorize: true }
  } : undefined,
});

// Create DB pool
export const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

// Test connection
(async () => {
  try {
    const client = await pool.connect();
    logger.info("✅ Database connected successfully");

    // release client back to pool
    client.release();
  } catch (err) {
    logger.error({ err }, "❌ Database connection failed");
    process.exit(1); // Exit process if DB is critical
  }
})();
