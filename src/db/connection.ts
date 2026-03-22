import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import { env } from "../config/env";
import { logger } from "../utils/logger";

// Create PostgreSQL connection pool
const pool = new Pool({
  host: env.DB_HOST,
  port: env.DB_PORT,
  database: env.DB_NAME,
  user: env.DB_USER,
  password: env.DB_PASSWORD,
  max: 20, // Maximum number of clients in the pool
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

// Initialize Drizzle ORM
export const db = drizzle(pool);

// Test database connection
export async function connectDatabase() {
  try {
    const client = await pool.connect();
    logger.info("Database connected successfully", {
      host: env.DB_HOST,
      database: env.DB_NAME,
    });
    client.release();
  } catch (error: any) {
    logger.error("Database connection failed", {
      error: error.message,
      host: env.DB_HOST,
    });
    throw error;
  }
}

// Graceful shutdown
export async function disconnectDatabase() {
  try {
    await pool.end();
    logger.info("Database connection closed");
  } catch (error: any) {
    logger.error("Error closing database connection", {
      error: error.message,
    });
  }
}
