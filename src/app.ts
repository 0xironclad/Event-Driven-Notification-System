import express, { Express, Request, Response } from "express";
import dotenv from "dotenv";
import routes from "./api/routes";
import { requestLogger } from "./middleware/requestLogger";
import { errorHandler, notFoundHandler } from "./middleware/errorHandler";
import { logger } from "./utils/logger";

dotenv.config();
const { env } = require("./config/env");

const app: Express = express();
const PORT = env.PORT;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging
app.use(requestLogger);

// Root route
app.get("/", (_req: Request, res: Response) => {
  res.json({ message: "Event-Driven Notification System API" });
});

// API routes
app.use("/api", routes);

// Health check (also available at root level for Docker/K8s)
app.get("/health", (_req: Request, res: Response) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// 404 handler (must be after all routes)
app.use(notFoundHandler);

// Global error handler (must be last)
app.use(errorHandler);

app.listen(PORT, () => {
  logger.info(`Server started`, {
    port: PORT,
    environment: env.NODE_ENV,
  });
});

export default app;
