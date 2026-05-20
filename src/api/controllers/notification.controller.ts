import { Request, Response } from "express";
import { AppError } from "../../middleware/errorHandler";
import { NotificationService } from "../../services/notification.service";
import {
  getRecent,
  setRecent,
  MAX_CACHED_NOTIFICATIONS,
} from "../../cache/notificationsCache";

const DEFAULT_LIMIT = 20;
const MAX_LIMIT = 100;

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export class NotificationController {
  // GET /notifications?userId=<uuid>&limit=<n>
  static async getRecent(req: Request, res: Response) {
    const userId = req.query.userId;

    if (typeof userId !== "string" || !UUID_RE.test(userId)) {
      throw new AppError("userId is required and must be a valid UUID", 400);
    }

    let limit = DEFAULT_LIMIT;
    if (req.query.limit !== undefined) {
      const parsed = Number(req.query.limit);
      if (!Number.isInteger(parsed) || parsed < 1 || parsed > MAX_LIMIT) {
        throw new AppError(
          `limit must be an integer between 1 and ${MAX_LIMIT}`,
          400,
        );
      }
      limit = parsed;
    }

    let cached = await getRecent(userId);

    if (!cached) {
      const rows = await NotificationService.getRecentNotifications(
        userId,
        MAX_CACHED_NOTIFICATIONS,
      );
      await setRecent(userId, rows);
      cached = rows;
    }

    res.status(200).json({
      success: true,
      data: cached.slice(0, limit),
    });
  }
}
