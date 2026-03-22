import { Request, Response } from "express";
import { env } from "../../config/env";

export class HealthController {
  static async check(_req: Request, res: Response) {
    // TODO: Add DB and Redis health checks in Phase 1+
    res.json({
      status: "ok",
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: env.NODE_ENV || "development",
    });
  }
}
