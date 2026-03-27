import { Worker, Job } from "bullmq";
import { redisConnection } from "../queue/connection";
import { ProcessEventJobData } from "../queue/eventQueue";
import { EventService } from "../services/event.service";
import { NotificationService } from "../services/notification.service";
import { logger } from "../utils/logger";
import { env } from "../config/env";

// Worker to process events from the queue
export const eventWorker = new Worker<ProcessEventJobData>(
  "event-processing",
  async (job: Job<ProcessEventJobData>) => {
    const { eventId, type } = job.data;

    logger.info("Processing event from queue", {
      jobId: job.id,
      eventId,
      type,
      attempt: job.attemptsMade + 1,
    });

    try {
      // Fetch event from database
      const event = await EventService.getEventById(eventId);

      if (!event) {
        throw new Error(`Event not found: ${eventId}`);
      }

      // Generate notification data
      const notificationData =
        NotificationService.generateNotificationData(event);

      if (notificationData) {
        await NotificationService.createNotification(notificationData);
        logger.info("Notification created by worker", {
          eventId,
          channel: notificationData.channel,
        });
      }

      // Update event status to processed
      await EventService.updateEventStatus(eventId, "processed");

      logger.info("Event processed successfully", { eventId, jobId: job.id });

      return { success: true, eventId };
    } catch (error: any) {
      logger.error("Failed to process event in worker", {
        error: error.message,
        eventId,
        jobId: job.id,
        attempt: job.attemptsMade + 1,
      });

      if (job.attemptsMade >= 2) {
        await EventService.updateEventStatus(eventId, "failed");
      }

      throw error;
    }
  },
  {
    connection: redisConnection,
    concurrency: env.QUEUE_CONCURRENCY,
  },
);

// Worker event listeners
eventWorker.on("completed", (job) => {
  logger.info("Job completed", {
    jobId: job.id,
    eventId: job.data.eventId,
  });
});

eventWorker.on("failed", (job, error) => {
  logger.error("Job failed", {
    jobId: job?.id,
    eventId: job?.data.eventId,
    error: error.message,
    attempts: job?.attemptsMade,
  });
});

eventWorker.on("error", (error) => {
  logger.error("Worker error", { error: error.message });
});

// Graceful shutdown
export async function closeWorker() {
  try {
    await eventWorker.close();
    logger.info("Event worker closed");
  } catch (error: any) {
    logger.error("Error closing event worker", { error: error.message });
  }
}
