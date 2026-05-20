import { redisClient } from "./redisClient";
import { env } from "../config/env";
import { logger } from "../utils/logger";
import { Notification } from "../db/schema";

// Always cache the top MAX_CACHED notifications and slice on read.
// Keeps a single cache entry per user regardless of the request's `limit`.
export const MAX_CACHED_NOTIFICATIONS = 100;

const cacheKey = (userId: string) => `notifications:recent:${userId}`;

export async function getRecent(
  userId: string,
): Promise<Notification[] | null> {
  try {
    const cached = await redisClient.get(cacheKey(userId));

    if (cached) {
      logger.info("Cache hit: recent notifications", { userId });
      return JSON.parse(cached) as Notification[];
    }

    logger.info("Cache miss: recent notifications", { userId });
    return null;
  } catch (error: any) {
    logger.error("Failed to read notifications from cache", {
      userId,
      error: error.message,
    });
    return null;
  }
}

export async function setRecent(
  userId: string,
  notifications: Notification[],
): Promise<void> {
  try {
    await redisClient.set(
      cacheKey(userId),
      JSON.stringify(notifications),
      "EX",
      env.NOTIFICATIONS_CACHE_TTL_SECONDS,
    );
    logger.info("Notifications cached", {
      userId,
      count: notifications.length,
      ttl: env.NOTIFICATIONS_CACHE_TTL_SECONDS,
    });
  } catch (error: any) {
    logger.error("Failed to cache notifications", {
      userId,
      error: error.message,
    });
  }
}

// Called after the worker writes a new notification so the next read
// repopulates from the database.
export async function invalidate(userId: string): Promise<void> {
  try {
    await redisClient.del(cacheKey(userId));
    logger.info("Notifications cache invalidated", { userId });
  } catch (error: any) {
    logger.error("Failed to invalidate notifications cache", {
      userId,
      error: error.message,
    });
  }
}
