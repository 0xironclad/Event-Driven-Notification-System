import { z } from "zod";

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "production", "staging"]),
  PORT: z.string().transform(Number),

  // Database
  DB_HOST: z.string(),
  DB_PORT: z.string().transform(Number),
  DB_NAME: z.string(),
  DB_USER: z.string(),
  DB_PASSWORD: z.string(),

  // Redis
  REDIS_HOST: z.string().optional(),
  REDIS_PORT: z.string().transform(Number).optional(),

  // Queue
  QUEUE_CONCURRENCY: z.string().transform(Number).default(5),
});

export const env = envSchema.parse(process.env);
