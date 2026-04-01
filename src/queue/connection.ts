import { env } from "../config/env";

export const redisConnection = {
  host: env.REDIS_HOST,
  port: env.REDIS_PORT,
  maxRetriesPerRequest: null, 
};
