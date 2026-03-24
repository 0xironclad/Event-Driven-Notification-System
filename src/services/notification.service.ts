import { db } from "../db/connection";
import { notifications, NewNotification, Notification } from "../db/schema";
import { logger } from "../utils/logger";

export class NotificationService {
  static async createNotification(
    data: NewNotification,
  ): Promise<Notification> {
    try {
      const [notification] = await db
        .insert(notifications)
        .values(data)
        .returning();

      logger.info("Notification inserted into database", {
        notificationId: notification.id,
        channel: notification.channel,
      });

      return notification;
    } catch (error: any) {
      logger.error("Database error creating notification", {
        error: error.message,
      });
      throw error;
    }
  }

  static generateNotificationData(event: any): NewNotification | null {
    if (!event.userId) {
      return null; // No user to notify
    }

    // Simple notification generation logic
    // In production, this would be more sophisticated
    const notificationMap: Record<string, any> = {
      "user.signup": {
        channel: "email",
        subject: "Welcome!",
        message: "Welcome to our platform!",
      },
      "order.created": {
        channel: "email",
        subject: "Order Confirmation",
        message: "Your order has been created successfully.",
      },
      "payment.success": {
        channel: "sms",
        subject: null,
        message: "Payment received successfully.",
      },
    };

    const template = notificationMap[event.type];
    if (!template) {
      logger.warn("No notification template for event type", {
        type: event.type,
      });
      return null;
    }

    return {
      eventId: event.id,
      userId: event.userId,
      channel: template.channel,
      recipient: `user-${event.userId}@example.com`, // Placeholder
      subject: template.subject,
      message: template.message,
      status: "pending",
    };
  }
}
