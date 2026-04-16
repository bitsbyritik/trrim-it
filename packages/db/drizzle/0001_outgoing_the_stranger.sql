CREATE TYPE "public"."credit_tx_type" AS ENUM('FREE_GRANT', 'PURCHASE', 'CONSUMED', 'REFUND');--> statement-breakpoint
CREATE TYPE "public"."invoice_status" AS ENUM('PENDING', 'PAID', 'FAILED', 'VOID');--> statement-breakpoint
CREATE TYPE "public"."plan_type" AS ENUM('FREE', 'PAYG', 'PRO');--> statement-breakpoint
CREATE TYPE "public"."subscription_status" AS ENUM('ACTIVE', 'CANCELLED', 'PAST_DUE', 'TRIALING');--> statement-breakpoint
CREATE TYPE "public"."job_status" AS ENUM('PENDING', 'PROCESSING', 'READY', 'FAILED');--> statement-breakpoint
CREATE TYPE "public"."usage_event_type" AS ENUM('CLIP_DOWNLOADED', 'VIDEO_FETCHED', 'TRIM_JOB_STARTED');--> statement-breakpoint
CREATE TYPE "public"."waitlist_source" AS ENUM('DASHBOARD', 'LANDING');--> statement-breakpoint
CREATE TABLE "trrim_credit_ledger" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"amount" integer NOT NULL,
	"type" "credit_tx_type" NOT NULL,
	"balance_after" integer NOT NULL,
	"clip_id" text,
	"provider_payment_id" text,
	"created_at" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE "trrim_invoices" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"provider_invoice_id" text,
	"provider_customer_id" text,
	"amount_usd_cents" integer NOT NULL,
	"status" "invoice_status" DEFAULT 'PENDING' NOT NULL,
	"credits_purchased" integer,
	"paid_at" timestamp,
	"created_at" timestamp NOT NULL,
	"updated_at" timestamp NOT NULL,
	CONSTRAINT "trrim_invoices_provider_invoice_id_unique" UNIQUE("provider_invoice_id")
);
--> statement-breakpoint
CREATE TABLE "trrim_plans" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"slug" text NOT NULL,
	"type" "plan_type" NOT NULL,
	"monthly_price_usd_cents" integer,
	"credits_included" integer,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp NOT NULL,
	"updated_at" timestamp NOT NULL,
	CONSTRAINT "trrim_plans_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "trrim_subscriptions" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"plan_id" text NOT NULL,
	"status" "subscription_status" DEFAULT 'ACTIVE' NOT NULL,
	"provider_customer_id" text,
	"provider_subscription_id" text,
	"current_period_start" timestamp,
	"current_period_end" timestamp,
	"cancelled_at" timestamp,
	"created_at" timestamp NOT NULL,
	"updated_at" timestamp NOT NULL,
	CONSTRAINT "trrim_subscriptions_user_id_unique" UNIQUE("user_id"),
	CONSTRAINT "trrim_subscriptions_provider_customer_id_unique" UNIQUE("provider_customer_id"),
	CONSTRAINT "trrim_subscriptions_provider_subscription_id_unique" UNIQUE("provider_subscription_id")
);
--> statement-breakpoint
CREATE TABLE "trrim_clips" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"job_id" text NOT NULL,
	"title" text,
	"duration_seconds" integer NOT NULL,
	"output_url" text NOT NULL,
	"format" text DEFAULT 'mp4' NOT NULL,
	"created_at" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE "trrim_trim_jobs" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"status" "job_status" DEFAULT 'PENDING' NOT NULL,
	"source_url" text NOT NULL,
	"start_time_seconds" integer NOT NULL,
	"end_time_seconds" integer NOT NULL,
	"rust_process_id" text,
	"error_message" text,
	"created_at" timestamp NOT NULL,
	"updated_at" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE "trrim_monthly_usage" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"billing_period" text NOT NULL,
	"clips_downloaded" integer DEFAULT 0 NOT NULL,
	"videos_fetched" integer DEFAULT 0 NOT NULL,
	"total_credits_used" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp NOT NULL,
	"updated_at" timestamp NOT NULL,
	CONSTRAINT "trrim_monthly_usage_user_id_billing_period_unique" UNIQUE("user_id","billing_period")
);
--> statement-breakpoint
CREATE TABLE "trrim_usage_events" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"type" "usage_event_type" NOT NULL,
	"credit_cost" integer DEFAULT 0 NOT NULL,
	"billing_period" text NOT NULL,
	"clip_id" text,
	"trim_job_id" text,
	"created_at" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE "trrim_waitlist" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text,
	"email" text NOT NULL,
	"notify_me" boolean DEFAULT true NOT NULL,
	"founding_member" boolean DEFAULT false NOT NULL,
	"source" "waitlist_source" DEFAULT 'DASHBOARD' NOT NULL,
	"created_at" timestamp NOT NULL,
	CONSTRAINT "trrim_waitlist_email_unique" UNIQUE("email")
);
--> statement-breakpoint
ALTER TABLE "trrim_credit_ledger" ADD CONSTRAINT "trrim_credit_ledger_user_id_trrim_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."trrim_user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "trrim_credit_ledger" ADD CONSTRAINT "trrim_credit_ledger_clip_id_trrim_clips_id_fk" FOREIGN KEY ("clip_id") REFERENCES "public"."trrim_clips"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "trrim_invoices" ADD CONSTRAINT "trrim_invoices_user_id_trrim_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."trrim_user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "trrim_subscriptions" ADD CONSTRAINT "trrim_subscriptions_user_id_trrim_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."trrim_user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "trrim_subscriptions" ADD CONSTRAINT "trrim_subscriptions_plan_id_trrim_plans_id_fk" FOREIGN KEY ("plan_id") REFERENCES "public"."trrim_plans"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "trrim_clips" ADD CONSTRAINT "trrim_clips_user_id_trrim_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."trrim_user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "trrim_clips" ADD CONSTRAINT "trrim_clips_job_id_trrim_trim_jobs_id_fk" FOREIGN KEY ("job_id") REFERENCES "public"."trrim_trim_jobs"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "trrim_trim_jobs" ADD CONSTRAINT "trrim_trim_jobs_user_id_trrim_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."trrim_user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "trrim_monthly_usage" ADD CONSTRAINT "trrim_monthly_usage_user_id_trrim_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."trrim_user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "trrim_usage_events" ADD CONSTRAINT "trrim_usage_events_user_id_trrim_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."trrim_user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "trrim_usage_events" ADD CONSTRAINT "trrim_usage_events_clip_id_trrim_clips_id_fk" FOREIGN KEY ("clip_id") REFERENCES "public"."trrim_clips"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "trrim_usage_events" ADD CONSTRAINT "trrim_usage_events_trim_job_id_trrim_trim_jobs_id_fk" FOREIGN KEY ("trim_job_id") REFERENCES "public"."trrim_trim_jobs"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "trrim_waitlist" ADD CONSTRAINT "trrim_waitlist_user_id_trrim_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."trrim_user"("id") ON DELETE set null ON UPDATE no action;