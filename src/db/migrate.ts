import { drizzle } from "drizzle-orm/node-postgres";
import { migrate } from "drizzle-orm/node-postgres/migrator";
import { Pool } from "pg";
import { env } from "../config/env";
import { logger } from "../utils/logger";

async function runMigrations() {
  const pool = new Pool({
    host: env.DB_HOST,
    port: env.DB_PORT,
    database: env.DB_NAME,
    user: env.DB_USER,
    password: env.DB_PASSWORD,
  });

  const db = drizzle(pool);

  try {
    logger.info("Running migrations...");
    await migrate(db, { migrationsFolder: "./drizzle" });
    logger.info("Migrations completed successfully");
  } catch (error: any) {
    logger.error("Migration failed", { error: error.message });
    throw error;
  } finally {
    await pool.end();
  }
}

runMigrations()
  .then(() => process.exit(0))
  .catch(() => process.exit(1));
