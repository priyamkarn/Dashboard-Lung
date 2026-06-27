/**
 * schema/buses.ts
 *
 * EV bus fleet inventory.
 *
 * Indexes
 * ──────────────────────────────────────────────────────────────
 * idx_buses_fleet_number   – human-readable lookup used in dispatch UI (unique)
 * idx_buses_depot_id       – FK; list all buses at a depot
 * idx_buses_status         – filter by available / charging / in_service / maintenance
 * idx_buses_depot_status   – composite; dashboard "available buses at depot X"
 * idx_buses_battery_level  – range scan for low-battery alerts (< 20%)
 */

import {
  pgTable,
  uuid,
  varchar,
  integer,
  real,
  timestamp,
  index,
  uniqueIndex,
} from "drizzle-orm/pg-core";
import { depots } from "./depots";

export const buses = pgTable(
  "buses",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    /** Operator-visible ID, e.g. "BUS-042" */
    fleetNumber: varchar("fleet_number", { length: 50 }).notNull(),
    model: varchar("model", { length: 100 }),
    /** kWh */
    batteryCapacityKwh: real("battery_capacity_kwh").notNull(),
    /** 0–100 */
    batteryLevelPct: real("battery_level_pct").notNull().default(100),
    /** available | charging | in_service | maintenance */
    status: varchar("status", { length: 30 }).notNull().default("available"),
    depotId: uuid("depot_id")
      .notNull()
      .references(() => depots.id, { onDelete: "restrict" }),
    lastSeenAt: timestamp("last_seen_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => [
    uniqueIndex("idx_buses_fleet_number").on(t.fleetNumber),
    index("idx_buses_depot_id").on(t.depotId),
    index("idx_buses_status").on(t.status),
    // Composite: "show me available buses at depot X" – the most common dashboard query
    index("idx_buses_depot_status").on(t.depotId, t.status),
    // Range scan: low-battery alerts
    index("idx_buses_battery_level").on(t.batteryLevelPct),
  ]
);

export type Bus = typeof buses.$inferSelect;
export type NewBus = typeof buses.$inferInsert;
