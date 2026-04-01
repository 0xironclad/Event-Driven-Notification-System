import {
  pgTable,
  uuid,
  varchar,
  text,
  timestamp,
  jsonb,
  boolean,
  index,
  unique,
} from "drizzle-orm/pg-core";

// Events table
export const events = pgTable(
  "events",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    type: varchar("type", { length: 100 }).notNull(),
    payload: jsonb("payload").notNull(),
    userId: varchar("user_id", { length: 255 }),
    status: varchar("status", { length: 50 }).notNull().default("pending"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
  },
  (table) => ({
    typeIdx: index("events_type_idx").on(table.type),
    userIdIdx: index("events_user_id_idx").on(table.userId),
    statusIdx: index("events_status_idx").on(table.status),
    createdAtIdx: index("events_created_at_idx").on(table.createdAt),
  }),
);

// Notifications table
export const notifications = pgTable(
  "notifications",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    eventId: uuid("event_id")
      .notNull()
      .references(() => events.id, { onDelete: "cascade" }),
    userId: varchar("user_id", { length: 255 }).notNull(),
    channel: varchar("channel", { length: 50 }).notNull(), // email, sms, push, etc.
    recipient: varchar("recipient", { length: 255 }).notNull(), // email address, phone number, etc.
    subject: varchar("subject", { length: 255 }),
    message: text("message").notNull(),
    status: varchar("status", { length: 50 }).notNull().default("pending"),
    sentAt: timestamp("sent_at"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
  },
  (table) => ({
    eventIdIdx: index("notifications_event_id_idx").on(table.eventId),
    userIdIdx: index("notifications_user_id_idx").on(table.userId),
    statusIdx: index("notifications_status_idx").on(table.status),
    channelIdx: index("notifications_channel_idx").on(table.channel),
    createdAtIdx: index("notifications_created_at_idx").on(table.createdAt),
  }),
);


// User preferences table
export const userPreferences = pgTable(
  "user_preferences",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: varchar("user_id", { length: 255 }).notNull(),
    channel: varchar("channel", { length: 50 }).notNull(), // "email" | "sms"
    enabled: boolean("enabled").notNull().default(true),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
  },
  (table) => ({
    userIdIdx: index("user_preferences_user_id_idx").on(table.userId),
    userChannelUnique: unique("user_preferences_user_channel_unique").on(
      table.userId,
      table.channel
    ),
  })
);

export type Event = typeof events.$inferSelect;
export type NewEvent = typeof events.$inferInsert;
export type Notification = typeof notifications.$inferSelect;
export type NewNotification = typeof notifications.$inferInsert;
export type UserPreference = typeof userPreferences.$inferSelect;
export type NewUserPreference = typeof userPreferences.$inferInsert;
