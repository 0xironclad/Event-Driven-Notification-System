import { eq } from "drizzle-orm";
import { db } from "../db/connection";
import { userPreferences, UserPreference, NewUserPreference } from "../db/schema";
import { invalidatePreferences } from "../cache/userPreferencesCache";
import { logger } from "../utils/logger";

export class PreferencesService {
  static async getByUserId(userId: string): Promise<UserPreference[]> {
    try {
      const prefs = await db
        .select()
        .from(userPreferences)
        .where(eq(userPreferences.userId, userId));

      return prefs;
    } catch (error: any) {
      logger.error("Database error fetching preferences", {
        error: error.message,
        userId,
      });
      throw error;
    }
  }


  static async upsert(
    userId: string,
    channel: string,
    enabled: boolean
  ): Promise<UserPreference> {
    try {
      const [pref] = await db
        .insert(userPreferences)
        .values({ userId, channel, enabled } as NewUserPreference)
        .onConflictDoUpdate({
          target: [userPreferences.userId, userPreferences.channel],
          set: { enabled, updatedAt: new Date() },
        })
        .returning();

      logger.info("Preference upserted", { userId, channel, enabled });

      // Invalidate cache so the next read fetches fresh data from DB
      await invalidatePreferences(userId);

      return pref;
    } catch (error: any) {
      logger.error("Database error upserting preference", {
        error: error.message,
        userId,
        channel,
      });
      throw error;
    }
  }
}
