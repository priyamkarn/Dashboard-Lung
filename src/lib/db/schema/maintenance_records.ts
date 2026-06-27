/**
 * schema/maintenance_records.ts
 *
 * Scheduled and unscheduled maintenance events per bus.
 * Dispatchers check this before assigning a bus to a route.
 *
 * Indexes
 * ──────────────────────────────────────────────────────────────
 * idx_maintenance_bus_id            – FK; full maintenance log per bus
 * idx_maintenance_scheduled_date    – time-range scans for upcoming work
 * idx_maintenance_status            – filter scheduled / in_progress / completed
 * idx_maintenance_bus_status        – composite; "has bus X any open maintenance?"
 */

import {
  pgTable,
  uuid,
  varchar,
  text,
  timestamp,
  date,
  index,
} from "drizzle-orm/pg-core";
import { buses } from "./buses";
import { users } from "./users";

export const maintenanceRecords = pgTable(
  "maintenance_records",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    busId: uuid("bus_id")
      .notNull()
      .references(() => buses.id, { onDelete: "restrict" }),
    /** scheduled | in_progress | completed | cancelled */
    status: varchar("status", { length: 30 }).notNull().default("scheduled"),
    /** routine | repair | inspection | battery_check */
    type: varchar("type", { length: 50 }).notNull(),
    description: text("description"),
    scheduledDate: date("scheduled_date"),
    completedAt: timestamp("completed_at", { withTimezone: true }),
    performedById: uuid("performed_by_id").references(() => users.id, {
      onDelete: "set null",
    }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => [
    index("idx_maintenance_bus_id").on(t.busId),
    index("idx_maintenance_scheduled_date").on(t.scheduledDate),
    index("idx_maintenance_status").on(t.status),
    // Pre-dispatch check: "does bus X have any open/in-progress work?"
    index("idx_maintenance_bus_status").on(t.busId, t.status),
  ]
);

export type MaintenanceRecord = typeof maintenanceRecords.$inferSelect;
export type NewMaintenanceRecord = typeof maintenanceRecords.$inferInsert;
