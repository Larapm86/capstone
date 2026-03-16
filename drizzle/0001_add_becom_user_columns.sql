-- Add BECOM app columns to user table
ALTER TABLE "user" ADD COLUMN IF NOT EXISTS "currentLevel" integer DEFAULT 1;
--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN IF NOT EXISTS "startingLevel" integer DEFAULT 1;
--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN IF NOT EXISTS "onboardingAnswers" jsonb;
--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN IF NOT EXISTS "paceProfile" text DEFAULT 'steady';
--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN IF NOT EXISTS "preferredDepth" text DEFAULT 'light';
