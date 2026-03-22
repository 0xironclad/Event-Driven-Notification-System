CREATE TABLE "events" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"type" varchar(100) NOT NULL,
	"payload" jsonb NOT NULL,
	"user_id" varchar(255),
	"status" varchar(50) DEFAULT 'pending' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "notifications" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"event_id" uuid NOT NULL,
	"user_id" varchar(255) NOT NULL,
	"channel" varchar(50) NOT NULL,
	"recipient" varchar(255) NOT NULL,
	"subject" varchar(255),
	"message" text NOT NULL,
	"status" varchar(50) DEFAULT 'pending' NOT NULL,
	"sent_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_event_id_events_id_fk" FOREIGN KEY ("event_id") REFERENCES "public"."events"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "events_type_idx" ON "events" USING btree ("type");--> statement-breakpoint
CREATE INDEX "events_user_id_idx" ON "events" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "events_status_idx" ON "events" USING btree ("status");--> statement-breakpoint
CREATE INDEX "events_created_at_idx" ON "events" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "notifications_event_id_idx" ON "notifications" USING btree ("event_id");--> statement-breakpoint
CREATE INDEX "notifications_user_id_idx" ON "notifications" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "notifications_status_idx" ON "notifications" USING btree ("status");--> statement-breakpoint
CREATE INDEX "notifications_channel_idx" ON "notifications" USING btree ("channel");--> statement-breakpoint
CREATE INDEX "notifications_created_at_idx" ON "notifications" USING btree ("created_at");