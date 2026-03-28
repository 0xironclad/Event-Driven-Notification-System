import { Request, Response } from "express";
import { AppError } from "../../middleware/errorHandler";
import { PreferencesService } from "../../services/preferences.service";
import { logger } from "../../utils/logger";

const VALID_CHANNELS = ["email", "sms"];

export class PreferencesController {
  // GET /preferences/:userId
  // Returns all preference rows for a user.
  static async getByUser(req: Request, res: Response) {
    const userId = req.params.userId as string;

    const preferences = await PreferencesService.getByUserId(userId);

    res.status(200).json({
      success: true,
      data: preferences,
    });
  }

  // POST /preferences
  // Body: { userId, channel, enabled }
  // Upserts a preference and invalidates the cache.
  static async upsert(req: Request, res: Response) {
    const { userId, channel, enabled } = req.body;

    if (!userId) {
      throw new AppError("userId is required", 400);
    }

    if (!channel || !VALID_CHANNELS.includes(channel)) {
      throw new AppError(`channel must be one of: ${VALID_CHANNELS.join(", ")}`, 400);
    }

    if (typeof enabled !== "boolean") {
      throw new AppError("enabled must be a boolean", 400);
    }

    logger.info("Upserting user preference", { userId, channel, enabled });

    const preference = await PreferencesService.upsert(userId, channel, enabled);

    res.status(200).json({
      success: true,
      data: preference,
    });
  }
}
