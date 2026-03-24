import { eq } from "drizzle-orm";
import { db } from "../db/connection";
import { events, NewEvent, Event } from "../db/schema";
import { logger } from "../utils/logger";

export class EventService {
  static async createEvent(data: NewEvent): Promise<Event> {
    try {
      const [event] = await db.insert(events).values(data).returning();

      logger.info("Event inserted into database", { eventId: event.id });
      return event;
    } catch (error: any) {
      logger.error("Database error creating event", { error: error.message });
      throw error;
    }
  }

  static async updateEventStatus(
    eventId: string,
    status: string,
  ): Promise<void> {
    try {
      await db
        .update(events)
        .set({ status, updatedAt: new Date() })
        .where(eq(events.id, eventId));

      logger.info("Event status updated", { eventId, status });
    } catch (error: any) {
      logger.error("Database error updating event status", {
        error: error.message,
        eventId,
      });
      throw error;
    }
  }

  static async getEventById(eventId: string): Promise<Event | null> {
    try {
      const [event] = await db
        .select()
        .from(events)
        .where(eq(events.id, eventId))
        .limit(1);

      return event || null;
    } catch (error: any) {
      logger.error("Database error fetching event", {
        error: error.message,
        eventId,
      });
      throw error;
    }
  }
}
