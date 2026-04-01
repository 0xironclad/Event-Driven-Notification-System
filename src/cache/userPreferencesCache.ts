import { redisClient } from "./redisClient";
import { logger } from "../utils/logger";


const PREFERENCES_TTL_SECONDS = 60 * 60;

// Key format: "user:preferences:{userId}"
const cacheKey = (userId: string) => `user:preferences:${userId}`;

export interface CachedPreference {
  channel: string;
  enabled: boolean;
}


// Hit  → parse JSON from Redis, return immediately (no DB call).
// Miss → caller is responsible for fetching from DB and calling setPreferences().
export async function getPreferences(
  userId: string
): Promise<CachedPreference[] | null> {
  try {
    const cached = await redisClient.get(cacheKey(userId));

    if (cached) {
      logger.info("Cache hit: user preferences", { userId });
      return JSON.parse(cached) as CachedPreference[];
    }

    logger.info("Cache miss: user preferences", { userId });
    return null;
  } catch (error: any) {
    logger.error("Failed to read preferences from cache", {
      userId,
      error: error.message,
    });
    return null; // Cache failure should never break the main flow
  }
}

// Write preferences to Redis with a TTL.
// Called after a cache miss to populate the cache for future reads.
export async function setPreferences(
  userId: string,
  preferences: CachedPreference[]
): Promise<void> {
  try {
    await redisClient.set(
      cacheKey(userId),
      JSON.stringify(preferences),
      "EX",
      PREFERENCES_TTL_SECONDS
    );
    logger.info("Preferences cached", { userId, ttl: PREFERENCES_TTL_SECONDS });
  } catch (error: any) {
    logger.error("Failed to cache preferences", {
      userId,
      error: error.message,
    });
  }
}


// Must be called whenever preferences are updated via the API,
// otherwise the worker will keep using the stale cached version.
export async function invalidatePreferences(userId: string): Promise<void> {
  try {
    await redisClient.del(cacheKey(userId));
    logger.info("Preferences cache invalidated", { userId });
  } catch (error: any) {
    logger.error("Failed to invalidate preferences cache", {
      userId,
      error: error.message,
    });
  }
}
