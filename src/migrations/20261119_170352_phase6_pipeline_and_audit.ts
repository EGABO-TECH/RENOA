// Types split out of the value import — see the note on the first
// migration. Payload's generator always emits them together, and Node,
// which loads this file directly, cannot resolve two names that do not
// exist at runtime. Split every generated migration the same way.
import { sql } from '@payloadcms/db-postgres'
import type { MigrateDownArgs, MigrateUpArgs } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_inquiries_budget_range" AS ENUM('not-sure', 'under-5k', '5k-15k', '15k-50k', 'over-50k');
  CREATE TYPE "public"."enum_activity_log_action" AS ENUM('created', 'updated', 'published', 'deleted');
  CREATE TABLE "attachments" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"label" varchar NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"url" varchar,
  	"thumbnail_u_r_l" varchar,
  	"filename" varchar,
  	"mime_type" varchar,
  	"filesize" numeric,
  	"width" numeric,
  	"height" numeric,
  	"focal_x" numeric,
  	"focal_y" numeric
  );
  
  CREATE TABLE "activity_log" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"summary" varchar NOT NULL,
  	"action" "enum_activity_log_action" NOT NULL,
  	"entity" varchar NOT NULL,
  	"document_id" varchar,
  	"admin_url" varchar,
  	"user_id" integer,
  	"user_email" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "rate_limits" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"key" varchar NOT NULL,
  	"count" numeric DEFAULT 1 NOT NULL,
  	"expires_at" timestamp(3) with time zone NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  ALTER TABLE "applications" DROP CONSTRAINT "applications_cv_file_id_media_id_fk";
  
  ALTER TABLE "inquiries" ADD COLUMN "budget_range" "enum_inquiries_budget_range";
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "attachments_id" integer;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "activity_log_id" integer;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "rate_limits_id" integer;
  ALTER TABLE "activity_log" ADD CONSTRAINT "activity_log_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  CREATE INDEX "attachments_updated_at_idx" ON "attachments" USING btree ("updated_at");
  CREATE INDEX "attachments_created_at_idx" ON "attachments" USING btree ("created_at");
  CREATE UNIQUE INDEX "attachments_filename_idx" ON "attachments" USING btree ("filename");
  CREATE INDEX "activity_log_user_idx" ON "activity_log" USING btree ("user_id");
  CREATE INDEX "activity_log_updated_at_idx" ON "activity_log" USING btree ("updated_at");
  CREATE INDEX "activity_log_created_at_idx" ON "activity_log" USING btree ("created_at");
  CREATE INDEX "rate_limits_key_idx" ON "rate_limits" USING btree ("key");
  CREATE INDEX "rate_limits_expires_at_idx" ON "rate_limits" USING btree ("expires_at");
  CREATE INDEX "rate_limits_updated_at_idx" ON "rate_limits" USING btree ("updated_at");
  CREATE INDEX "rate_limits_created_at_idx" ON "rate_limits" USING btree ("created_at");
  ALTER TABLE "applications" ADD CONSTRAINT "applications_cv_file_id_attachments_id_fk" FOREIGN KEY ("cv_file_id") REFERENCES "public"."attachments"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_attachments_fk" FOREIGN KEY ("attachments_id") REFERENCES "public"."attachments"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_activity_log_fk" FOREIGN KEY ("activity_log_id") REFERENCES "public"."activity_log"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_rate_limits_fk" FOREIGN KEY ("rate_limits_id") REFERENCES "public"."rate_limits"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "payload_locked_documents_rels_attachments_id_idx" ON "payload_locked_documents_rels" USING btree ("attachments_id");
  CREATE INDEX "payload_locked_documents_rels_activity_log_id_idx" ON "payload_locked_documents_rels" USING btree ("activity_log_id");
  CREATE INDEX "payload_locked_documents_rels_rate_limits_id_idx" ON "payload_locked_documents_rels" USING btree ("rate_limits_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "attachments" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "activity_log" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "rate_limits" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "attachments" CASCADE;
  DROP TABLE "activity_log" CASCADE;
  DROP TABLE "rate_limits" CASCADE;
  ALTER TABLE "applications" DROP CONSTRAINT "applications_cv_file_id_attachments_id_fk";
  
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_attachments_fk";
  
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_activity_log_fk";
  
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_rate_limits_fk";
  
  DROP INDEX "payload_locked_documents_rels_attachments_id_idx";
  DROP INDEX "payload_locked_documents_rels_activity_log_id_idx";
  DROP INDEX "payload_locked_documents_rels_rate_limits_id_idx";
  ALTER TABLE "applications" ADD CONSTRAINT "applications_cv_file_id_media_id_fk" FOREIGN KEY ("cv_file_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "inquiries" DROP COLUMN "budget_range";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "attachments_id";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "activity_log_id";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "rate_limits_id";
  DROP TYPE "public"."enum_inquiries_budget_range";
  DROP TYPE "public"."enum_activity_log_action";`)
}
