import { Request, Response, NextFunction } from "express";
import { randomBytes } from "crypto";
import { redisClient } from "../cache/redisClient";
import { env } from "../config/env";
import { logger } from "../utils/logger";

const keyFor = (id: string) => `ratelimit:events:${id}`;

// Sliding-window rate limiter using a Redis sorted set.
// Fails OPEN: if Redis is unreachable, the request is allowed through.
// A Redis outage must not take down event ingestion.
export async function eventsRateLimiter(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  const max = env.RATE_LIMIT_MAX;
  const windowMs = env.RATE_LIMIT_WINDOW_SECONDS * 1000;

  const bodyUserId =
    req.body && typeof req.body.userId === "string" ? req.body.userId : null;
  const identifier = bodyUserId || req.ip || "unknown";
  const key = keyFor(identifier);

  const now = Date.now();
  const windowStart = now - windowMs;
  const member = `${now}-${randomBytes(4).toString("hex")}`;

  try {
    const pipeline = redisClient.multi();
    pipeline.zremrangebyscore(key, 0, windowStart);
    pipeline.zcard(key);
    pipeline.zadd(key, now, member);
    pipeline.expire(key, env.RATE_LIMIT_WINDOW_SECONDS);
    const results = await pipeline.exec();

    if (!results) {
      // Pipeline aborted — fail open
      logger.warn("Rate limiter pipeline returned no results, allowing", {
        identifier,
      });
      next();
      return;
    }

    // results[1] is the ZCARD reply: [err, count]. Count is BEFORE this request was added.
    const count = Number(results[1]?.[1] ?? 0);

    if (count >= max) {
      // Compute retry-after from the oldest in-window entry's timestamp.
      const oldest = await redisClient.zrange(key, 0, 0, "WITHSCORES");
      let retryAfter = env.RATE_LIMIT_WINDOW_SECONDS;
      if (oldest.length >= 2) {
        const oldestScore = Number(oldest[1]);
        retryAfter = Math.max(
          1,
          Math.ceil((oldestScore + windowMs - now) / 1000),
        );
      }

      logger.warn("Rate limit exceeded", {
        identifier,
        count,
        max,
        retryAfter,
      });

      res.setHeader("Retry-After", retryAfter);
      res.status(429).json({
        error: "Rate limit exceeded",
        retryAfter,
        limit: max,
        window: env.RATE_LIMIT_WINDOW_SECONDS,
      });
      return;
    }

    next();
  } catch (error: any) {
    // Fail open on any Redis error.
    logger.error("Rate limiter error, allowing request", {
      identifier,
      error: error.message,
    });
    next();
  }
}
