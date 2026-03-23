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

// Root-level health check (for Docker/K8s/load balancers)
app.get("/health", (_req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// API routes
app.use("/api", routes);

// 404 handler and error handler
app.use(notFoundHandler);
app.use(errorHandler);

// Start server with database connection
let server: ReturnType<typeof app.listen>;

async function startServer() {
  try {
    await connectDatabase();

    server = app.listen(PORT, () => {
      logger.info("Server started", {
        port: PORT,
        environment: env.NODE_ENV,
      });
    });

    // Handle server errors (EADDRINUSE, etc.)
    server.on("error", async (error: NodeJS.ErrnoException) => {
      logger.error("Server error", {
        error: error.message,
        code: error.code,
      });

      // Close DB connection before exiting
      await disconnectDatabase();
      process.exit(1);
    });
  } catch (error: any) {
    logger.error("Failed to start server", { error: error.message });
    await disconnectDatabase();
    process.exit(1);
  }
}

// Graceful shutdown
async function gracefulShutdown(signal: string) {
  logger.info(`${signal} received, shutting down gracefully`);

  // Stop accepting new connections
  if (server) {
    server.close(async (err) => {
      if (err) {
        logger.error("Error closing server", { error: err.message });
      } else {
        logger.info("HTTP server closed");
      }

      // Close database connection after server stops
      await disconnectDatabase();

      // Let Node.js exit naturally
    });
  } else {
    await disconnectDatabase();
  }
}

process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));
process.on("SIGINT", () => gracefulShutdown("SIGINT"));

startServer();

export default app;
