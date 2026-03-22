import { env } from "../config/env";

enum LogLevel {
  ERROR = "ERROR",
  WARN = "WARN",
  INFO = "INFO",
  DEBUG = "DEBUG",
}

class Logger {
  private log(level: LogLevel, message: string, meta?: Record<string, any>) {
    const timestamp = new Date().toISOString();
    const logEntry = {
      timestamp,
      level,
      message,
      environment: env.NODE_ENV,
      ...(meta && { meta }),
    };

    // In development, pretty print the log entry
    if (env.NODE_ENV === "development") {
      console.log(`[${level}] ${message}`, meta || "");
    } else {
      console.log(JSON.stringify(logEntry));
    }
  }

  error(message: string, meta?: Record<string, any>) {
    this.log(LogLevel.ERROR, message, meta);
  }

  warn(message: string, meta?: Record<string, any>) {
    this.log(LogLevel.WARN, message, meta);
  }

  info(message: string, meta?: Record<string, any>) {
    this.log(LogLevel.INFO, message, meta);
  }

  debug(message: string, meta?: Record<string, any>) {
    if (env.NODE_ENV === "development") {
      this.log(LogLevel.DEBUG, message, meta);
    }
  }
}

export const logger = new Logger();
