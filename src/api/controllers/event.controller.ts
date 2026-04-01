import { Request, Response } from "express";
import { AppError } from "../../middleware/errorHandler";
import { logger } from "../../utils/logger";
import { EventService } from "../../services/event.service";
import { addEventToQueue } from "../../queue/eventQueue";

export class EventController {
  static async create(req: Request, res: Response) {
    const { type, payload, userId } = req.body;

    // Validate input
    if (!type) {
      throw new AppError("Event type is required", 400);
    }

    if (!payload || typeof payload !== "object") {
      throw new AppError("Event payload must be an object", 400);
    }

    logger.info("Creating event", { type, userId });

    try {
      const event = await EventService.createEvent({
        type,
        payload,
        userId,
        status: "pending",
      });

      logger.info("Event created", { eventId: event.id, type });

      // Add to queue for async processing (Phase 2 approach)
      await addEventToQueue({
        eventId: event.id,
        type: event.type,
        userId: event.userId || undefined,
      });

      res.status(201).json({
        success: true,
        data: event,
        message: "Event created and queued for processing",
      });
    } catch (error: any) {
      logger.error("Failed to create event", {
        error: error.message,
        type,
        userId,
      });
      throw new AppError("Failed to create event", 500);
    }
  }
}
