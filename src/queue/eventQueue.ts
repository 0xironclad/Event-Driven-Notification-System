import { Queue } from "bullmq";
import { redisConnection } from "./connection";
import { logger } from "../utils/logger";


export interface ProcessEventJobData {
  eventId: string;
  type: string;
  userId?: string;
}

// Create event processing queue
export const eventQueue = new Queue<ProcessEventJobData>("event-processing", {
  connection: redisConnection,
  defaultJobOptions: {
    attempts: 3,
    backoff: {
      type: "exponential",
      delay: 2000,
    },
    removeOnComplete: {
      count: 100, 
      age: 24 * 3600, // Keep for 24 hours
    },
    removeOnFail: {
      count: 500,
    },
  },
});

// Add job to queue
export async function addEventToQueue(data: ProcessEventJobData) {
  try {
    const job = await eventQueue.add("process-event", data, {
      jobId: data.eventId, 
    });

    logger.info("Event added to queue", {
      jobId: job.id,
      eventId: data.eventId,
      type: data.type,
    });

    return job;
  } catch (error: any) {
    logger.error("Failed to add event to queue", {
      error: error.message,
      eventId: data.eventId,
    });
    throw error;
  }
}

// Graceful shutdown
export async function closeQueue() {
  try {
    await eventQueue.close();
    logger.info("Event queue closed");
  } catch (error: any) {
    logger.error("Error closing event queue", { error: error.message });
  }
}
