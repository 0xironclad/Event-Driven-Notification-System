import dotenv from "dotenv";
import { logger } from "./utils/logger";
import { connectDatabase, disconnectDatabase } from "./db/connection";
import { eventWorker, closeWorker } from "./workers/eventWorker";

dotenv.config();

async function startWorker() {
  try {
    // Connect to database
    await connectDatabase();

    logger.info("Worker started", {
      concurrency: eventWorker.opts.concurrency,
    });

    // Worker is already listening (created in eventWorker.ts)
  } catch (error: any) {
    logger.error("Failed to start worker", { error: error.message });
    process.exit(1);
  }
}

// Graceful shutdown
async function gracefulShutdown(signal: string) {
  logger.info(`${signal} received, shutting down worker gracefully`);

  try {
    // Close worker (waits for active jobs to complete)
    // This will also close Redis connections managed by BullMQ
    await closeWorker();

    // Close database connection
    await disconnectDatabase();

    logger.info("Worker shutdown complete");
    process.exit(0);
  } catch (error: any) {
    logger.error("Error during worker shutdown", { error: error.message });
    process.exit(1);
  }
}

process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));
process.on("SIGINT", () => gracefulShutdown("SIGINT"));

startWorker();
