import Redis from "ioredis";
import { env } from "../config/env";
import { logger } from "../utils/logger";

// Separate Redis client for cache operations.
// BullMQ manages its own internal connection — this one is for direct reads/writes.
export const redisClient = new Redis({
  host: env.REDIS_HOST,
  port: env.REDIS_PORT,
});

redisClient.on("connect", () => {
  logger.info("Redis cache client connected");
});

redisClient.on("error", (error: Error) => {
  logger.error("Redis cache client error", { error: error.message });
});
