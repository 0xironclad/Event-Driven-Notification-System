import express, { Express } from "express";
import dotenv from "dotenv";
import { env } from "./config/env";
import routes from "./api/routes";
import { requestLogger } from "./middleware/requestLogger";
import { errorHandler, notFoundHandler } from "./middleware/errorHandler";
import { logger } from "./utils/logger";
import { connectDatabase, disconnectDatabase } from "./db/connection";

dotenv.config();

const app: Express = express();
const PORT = env.PORT;

// Middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging
app.use(requestLogger);

// API routes
app.use("/api", routes);

// 404 handler and error handler
app.use(notFoundHandler);
app.use(errorHandler);

async function startServer() {
  try {
    await connectDatabase();

    app.listen(PORT, () => {
      logger.info("Server started", {
        port: PORT,
        environment: env.NODE_ENV,
      });
    });
  } catch (error: any) {
    logger.error("Failed to start server", { error: error.message });
    process.exit(1);
  }
}

// Graceful shutdown
process.on("SIGTERM", async () => {
  logger.info("SIGTERM received, shutting down gracefully");
  await disconnectDatabase();
  process.exit(0);
});

process.on("SIGINT", async () => {
  logger.info("SIGINT received, shutting down gracefully");
  await disconnectDatabase();
  process.exit(0);
});

startServer();

export default app;
