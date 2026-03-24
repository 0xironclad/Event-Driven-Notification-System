import Redis from "ioredis";
import { env } from "../config/env";
import { logger } from "../utils/logger";

// Redis connection for BullMQ
export const redisConnection = new Redis({
  host: env.REDIS_HOST,
  port: env.REDIS_PORT,
  maxRetriesPerRequest: null, 
});

redisConnection.on("connect", () => {
  logger.info("Redis connected", {
    host: env.REDIS_HOST,
    port: env.REDIS_PORT,
  });
});

redisConnection.on("error", (error) => {
  logger.error("Redis connection error", { error: error.message });
});

export async function disconnectRedis() {
  try {
    await redisConnection.quit();
    logger.info("Redis connection closed");
  } catch (error: any) {
    logger.error("Error closing Redis connection", { error: error.message });
  }
}
