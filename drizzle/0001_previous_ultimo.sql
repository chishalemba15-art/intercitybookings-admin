DO $$ BEGIN
 CREATE TYPE "agent_status" AS ENUM('pending_review', 'approved', 'suspended', 'rejected');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "id_type" AS ENUM('national_id', 'drivers_license', 'passport');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "receipt_status" AS ENUM('pending', 'verified', 'rejected');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "ticket_request_status" AS ENUM('open', 'claimed_by_agent', 'completed', 'expired');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "transaction_status" AS ENUM('pending', 'completed', 'failed');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "transaction_type" AS ENUM('purchase', 'refund', 'usage');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "agent_daily_quota_logs" (
	"id" serial PRIMARY KEY NOT NULL,
	"agent_id" integer NOT NULL,
	"date" varchar(10),
	"requests_viewed" integer DEFAULT 0,
	"quota_limit" integer DEFAULT 0,
	"float_balance_on_date" numeric(10, 2),
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "agent_float" (
	"id" serial PRIMARY KEY NOT NULL,
	"agent_id" integer NOT NULL,
	"current_balance" numeric(10, 2) DEFAULT '0',
	"daily_quota_remaining" integer DEFAULT 0,
	"daily_quota_limit" integer DEFAULT 0,
	"last_quota_reset" timestamp DEFAULT now(),
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "agent_float_agent_id_unique" UNIQUE("agent_id")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "agent_float_transactions" (
	"id" serial PRIMARY KEY NOT NULL,
	"agent_id" integer NOT NULL,
	"transaction_type" "transaction_type" NOT NULL,
	"amount_zmw" numeric(10, 2) NOT NULL,
	"requests_allocated" integer,
	"payment_method" "payment_method",
	"payment_reference" varchar(100),
	"status" "transaction_status" DEFAULT 'pending',
	"notes" text,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "agent_processed_tickets" (
	"id" serial PRIMARY KEY NOT NULL,
	"ticket_request_id" integer NOT NULL,
	"agent_id" integer NOT NULL,
	"passenger_name" varchar(255) NOT NULL,
	"seat_number" varchar(10),
	"bus_id" integer,
	"booking_reference" varchar(20),
	"receipt_image_url" varchar(500),
	"receipt_verification_status" "receipt_status" DEFAULT 'pending',
	"verified_by" integer,
	"user_sms_sent" boolean DEFAULT false,
	"user_sms_sent_at" timestamp,
	"notes_to_user" text,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "agent_processed_tickets_booking_reference_unique" UNIQUE("booking_reference")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "agents" (
	"id" serial PRIMARY KEY NOT NULL,
	"phone_number" varchar(20) NOT NULL,
	"first_name" varchar(255) NOT NULL,
	"last_name" varchar(255) NOT NULL,
	"email" varchar(255),
	"id_type" "id_type" NOT NULL,
	"id_number" varchar(50) NOT NULL,
	"profile_picture_url" varchar(500),
	"location_city" varchar(100),
	"location_address" varchar(255),
	"referral_code" varchar(20),
	"status" "agent_status" DEFAULT 'pending_review',
	"approved_by" integer,
	"approved_at" timestamp,
	"rejection_reason" text,
	"suspended_at" timestamp,
	"suspension_reason" text,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "agents_phone_number_unique" UNIQUE("phone_number"),
	CONSTRAINT "agents_id_number_unique" UNIQUE("id_number"),
	CONSTRAINT "agents_referral_code_unique" UNIQUE("referral_code")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "ticket_requests" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_phone" varchar(20) NOT NULL,
	"from_city" varchar(100) NOT NULL,
	"to_city" varchar(100) NOT NULL,
	"travel_date" timestamp NOT NULL,
	"passenger_count" integer NOT NULL,
	"passenger_names" text,
	"contact_phone" varchar(20) NOT NULL,
	"contact_email" varchar(255),
	"preferred_operator" varchar(255),
	"status" "ticket_request_status" DEFAULT 'open',
	"agent_id" integer,
	"agent_claimed_at" timestamp,
	"request_expires_at" timestamp,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "agent_daily_quota_logs" ADD CONSTRAINT "agent_daily_quota_logs_agent_id_agents_id_fk" FOREIGN KEY ("agent_id") REFERENCES "agents"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "agent_float" ADD CONSTRAINT "agent_float_agent_id_agents_id_fk" FOREIGN KEY ("agent_id") REFERENCES "agents"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "agent_float_transactions" ADD CONSTRAINT "agent_float_transactions_agent_id_agents_id_fk" FOREIGN KEY ("agent_id") REFERENCES "agents"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "agent_processed_tickets" ADD CONSTRAINT "agent_processed_tickets_ticket_request_id_ticket_requests_id_fk" FOREIGN KEY ("ticket_request_id") REFERENCES "ticket_requests"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "agent_processed_tickets" ADD CONSTRAINT "agent_processed_tickets_agent_id_agents_id_fk" FOREIGN KEY ("agent_id") REFERENCES "agents"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "agent_processed_tickets" ADD CONSTRAINT "agent_processed_tickets_bus_id_buses_id_fk" FOREIGN KEY ("bus_id") REFERENCES "buses"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "agent_processed_tickets" ADD CONSTRAINT "agent_processed_tickets_verified_by_admin_users_id_fk" FOREIGN KEY ("verified_by") REFERENCES "admin_users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "agents" ADD CONSTRAINT "agents_approved_by_admin_users_id_fk" FOREIGN KEY ("approved_by") REFERENCES "admin_users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "ticket_requests" ADD CONSTRAINT "ticket_requests_agent_id_agents_id_fk" FOREIGN KEY ("agent_id") REFERENCES "agents"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
