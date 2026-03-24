import { Request, Response } from "express";
import { AppError } from "../../middleware/errorHandler";
import { logger } from "../../utils/logger";
import { EventService } from "../../services/event.service";
import { NotificationService } from "../../services/notification.service";

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

      // Synchronous notification generation (Phase 1 approach)
      await EventController.processEvent(event);

      res.status(201).json({
        success: true,
        data: event,
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

  // Synchronous event processing (will be moved to queue in Phase 2)
  private static async processEvent(event: any) {
    try {
      logger.info("Processing event synchronously", { eventId: event.id });

      // Generate notification data
      const notificationData =
        NotificationService.generateNotificationData(event);

      if (notificationData) {
        // Create notification using service
        await NotificationService.createNotification(notificationData);
        logger.info("Notification created", {
          eventId: event.id,
          channel: notificationData.channel,
        });
      }

      // Update event status using service
      await EventService.updateEventStatus(event.id, "processed");
    } catch (error: any) {
      logger.error("Failed to process event", {
        error: error.message,
        eventId: event.id,
      });
      // Don't throw - event is created, processing failed
    }
  }
}
