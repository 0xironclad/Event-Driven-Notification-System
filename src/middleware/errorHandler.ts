import { Request, Response, NextFunction } from "express";
import { logger } from "../utils/logger";

// Custom error class
export class AppError extends Error {
  statusCode: number;
  isOperational: boolean;

  constructor(message: string, statusCode: number = 500) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }
}

// Global error handler middleware
export const errorHandler = (
  err: Error | AppError,
  req: Request,
  res: Response,
  _next: NextFunction,
) => {
  const isOperational = err instanceof AppError;
  const statusCode = isOperational ? err.statusCode : 500;
  const clientMessage = isOperational ? err.message : "Internal Server Error";

  // Log error (always include real message for diagnostics)
  logger.error("Request error", {
    method: req.method,
    path: req.path,
    statusCode,
    message: err.message,
    stack: err.stack,
  });

  // Send response (hide internal details for unexpected errors)
  res.status(statusCode).json({
    status: "error",
    statusCode,
    message: clientMessage,
    ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
  });
};

// 404 handler
export const notFoundHandler = (req: Request, res: Response) => {
  logger.warn("Route not found", {
    method: req.method,
    path: req.path,
  });

  res.status(404).json({
    status: "error",
    statusCode: 404,
    message: `Route ${req.method} ${req.path} not found`,
  });
};
