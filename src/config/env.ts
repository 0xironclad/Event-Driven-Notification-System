import { z } from "zod";

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "production", "staging"]),
  PORT: z.coerce.number().int().positive(),

  // Database
  DB_HOST: z.string(),
  DB_PORT: z.coerce.number().int().positive(),
  DB_NAME: z.string(),
  DB_USER: z.string(),
  DB_PASSWORD: z.string(),

  // Redis
  REDIS_HOST: z.string().optional(),
  REDIS_PORT: z.coerce.number().int().positive().optional(),

  // Queue
  QUEUE_CONCURRENCY: z.coerce.number().int().positive().default(5),
});

export const env = envSchema.parse(process.env);
