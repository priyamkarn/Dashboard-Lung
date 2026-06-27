/**
 * schema/dispatch_assignments.ts
 *
 * Core operational table: which bus runs which route at what time.
 * This is the highest-read table in the system — every dashboard
 * refresh touches it.
 *
 * Indexes
 * ──────────────────────────────────────────────────────────────
 * idx_dispatch_bus_id          – FK; assignment history for a bus
 * idx_dispatch_route_id        – FK; which buses have served a route
 * idx_dispatch_assigned_by     – FK; audit trail per dispatcher
 * idx_dispatch_scheduled_start – time-range queries for "today's schedule"
 * idx_dispatch_status          – filter pending / active / completed / cancelled
 * idx_dispatch_status_start    – composite; active dispatches for the live board
 * idx_dispatch_bus_status      – composite; "is this bus currently dispatched?"
 */

import {
  pgTable,
  uuid,
  varchar,
  timestamp,
  text,
  index,
} from "drizzle-orm/pg-core";
import { buses } from "./buses";
import { routes } from "./routes";
import { users } from "./users";

export const dispatchAssignments = pgTable(
  "dispatch_assignments",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    busId: uuid("bus_id")
      .notNull()
      .references(() => buses.id, { onDelete: "restrict" }),
    routeId: uuid("route_id")
      .notNull()
      .references(() => routes.id, { onDelete: "restrict" }),
    assignedById: uuid("assigned_by_id").references(() => users.id, {
      onDelete: "set null",
    }),
    scheduledStart: timestamp("scheduled_start", {
      withTimezone: true,
    }).notNull(),
    scheduledEnd: timestamp("scheduled_end", { withTimezone: true }).notNull(),
    actualStart: timestamp("actual_start", { withTimezone: true }),
    actualEnd: timestamp("actual_end", { withTimezone: true }),
    /** pending | active | completed | cancelled */
    status: varchar("status", { length: 30 }).notNull().default("pending"),
    notes: text("notes"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => [
    // FK indexes (prevent sequential scans on joins)
    index("idx_dispatch_bus_id").on(t.busId),
    index("idx_dispatch_route_id").on(t.routeId),
    index("idx_dispatch_assigned_by").on(t.assignedById),
    // Time-range scan: "today's schedule" / "upcoming dispatches"
    index("idx_dispatch_scheduled_start").on(t.scheduledStart),
    // Status filter
    index("idx_dispatch_status").on(t.status),
    // Live board: "show all active dispatches starting today"
    index("idx_dispatch_status_start").on(t.status, t.scheduledStart),
    // "Is bus X currently in service?" lookup
    index("idx_dispatch_bus_status").on(t.busId, t.status),
  ]
);

export type DispatchAssignment = typeof dispatchAssignments.$inferSelect;
export type NewDispatchAssignment = typeof dispatchAssignments.$inferInsert;
