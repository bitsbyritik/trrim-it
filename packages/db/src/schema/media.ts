import { text, timestamp, integer, pgEnum } from "drizzle-orm/pg-core";
import { pgTableCreator } from "drizzle-orm/pg-core";
import { user } from "./auth";

const createTable = pgTableCreator((name) => `trrim_${name}`);

export const jobStatusEnum = pgEnum("job_status", [
  "PENDING",
  "PROCESSING",
  "READY",
  "FAILED",
]);

// ─── trim_jobs ────────────────────────────────────────────────────────────────
// One row per trim request. Tracks the Rust FFmpeg job lifecycle.

export const trimJob = createTable("trim_jobs", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),

  status: jobStatusEnum("status").default("PENDING").notNull(),

  sourceUrl: text("source_url").notNull(),
  startTimeSeconds: integer("start_time_seconds").notNull(),
  endTimeSeconds: integer("end_time_seconds").notNull(),

  // Process ID returned by the Rust server
  rustProcessId: text("rust_process_id"),
  errorMessage: text("error_message"),

  createdAt: timestamp("created_at")
    .notNull()
    .$defaultFn(() => new Date()),
  updatedAt: timestamp("updated_at")
    .notNull()
    .$defaultFn(() => new Date()),
});

// ─── clips ────────────────────────────────────────────────────────────────────
// Created when a trim_job reaches READY status — the downloadable output.

export const clip = createTable("clips", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  jobId: text("job_id")
    .notNull()
    .references(() => trimJob.id, { onDelete: "cascade" }),

  title: text("title"),
  durationSeconds: integer("duration_seconds").notNull(),

  outputUrl: text("output_url").notNull(),
  format: text("format").default("mp4").notNull(),

  createdAt: timestamp("created_at")
    .notNull()
    .$defaultFn(() => new Date()),
});
