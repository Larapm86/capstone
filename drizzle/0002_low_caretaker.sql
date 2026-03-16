CREATE TABLE "craving_sessions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"userId" text NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"completed_at" timestamp,
	"level_at_time" integer NOT NULL,
	"craving" text,
	"trigger" text,
	"emotion" text,
	"is_familiar" boolean,
	"familiar_pattern" text,
	"cognitive_reframe" text,
	"body_need" text,
	"values_alignment" text,
	"choice_made" text,
	"reward_replacement" text,
	"feeling_before" integer,
	"feeling_during" integer,
	"feeling_after" integer,
	"urgesurfing_used" boolean DEFAULT false,
	"urgesurfing_duration" integer,
	"all_questions_answered" boolean DEFAULT false,
	"is_setback" boolean DEFAULT false,
	"skipped_questions" jsonb,
	"session_duration" integer,
	"offline_session" boolean DEFAULT false
);
--> statement-breakpoint
CREATE TABLE "level_progress" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text NOT NULL,
	"level" integer NOT NULL,
	"unlocked_at" timestamp,
	"sessions_completed" integer DEFAULT 0,
	"triggers_identified" integer DEFAULT 0,
	"unique_triggers" jsonb,
	"emotions_named" integer DEFAULT 0,
	"familiar_patterns_marked" integer DEFAULT 0,
	"full_sessions_completed" integer DEFAULT 0,
	"conscious_choices_made" integer DEFAULT 0,
	"conscious_response_days" integer DEFAULT 0,
	"total_days_tracked" integer DEFAULT 0
);
--> statement-breakpoint
CREATE TABLE "offline_queue" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text NOT NULL,
	"payload" jsonb NOT NULL,
	"created_offline_at" timestamp NOT NULL,
	"synced_at" timestamp,
	"sync_failed" boolean DEFAULT false
);
--> statement-breakpoint
CREATE TABLE "setbacks" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text NOT NULL,
	"session_id" uuid,
	"created_at" timestamp DEFAULT now(),
	"trigger_before" text,
	"body_need" text,
	"self_compassion" text,
	"lesson" text,
	"values_anchor" text,
	"consciously_processed" boolean DEFAULT false
);
--> statement-breakpoint
DROP TABLE "task" CASCADE;--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "currentLevel" integer DEFAULT 1;--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "startingLevel" integer DEFAULT 1;--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "onboardingAnswers" jsonb;--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "paceProfile" text DEFAULT 'steady';--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "preferredDepth" text DEFAULT 'light';--> statement-breakpoint
ALTER TABLE "craving_sessions" ADD CONSTRAINT "craving_sessions_userId_user_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "level_progress" ADD CONSTRAINT "level_progress_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "offline_queue" ADD CONSTRAINT "offline_queue_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "setbacks" ADD CONSTRAINT "setbacks_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "setbacks" ADD CONSTRAINT "setbacks_session_id_craving_sessions_id_fk" FOREIGN KEY ("session_id") REFERENCES "public"."craving_sessions"("id") ON DELETE no action ON UPDATE no action;