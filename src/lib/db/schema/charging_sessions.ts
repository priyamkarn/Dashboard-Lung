/**
 * schema/charging_sessions.ts
 *
 * Tracks each charging session per bus at a depot charger.
 * Used for energy reporting, scheduling decisions, and battery health.
 *
 * Indexes
 * ──────────────────────────────────────────────────────────────
 * idx_charging_bus_id          – FK; full charging history per bus
 * idx_charging_depot_id        – FK; depot-level energy reports
 * idx_charging_started_at      – time-range queries for energy dashboards
 * idx_charging_bus_started_at  – composite; "latest session for bus X"
 * idx_charging_status          – filter in_progress / completed / interrupted
 */

import {
  pgTable,
  uuid,
  varchar,
  real,
  timestamp,
  index,
} from "drizzle-orm/pg-core";
import { buses } from "./buses";
import { depots } from "./depots";

export const chargingSessions = pgTable(
  "charging_sessions",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    busId: uuid("bus_id")
      .notNull()
      .references(() => buses.id, { onDelete: "restrict" }),
    depotId: uuid("depot_id")
      .notNull()
      .references(() => depots.id, { onDelete: "restrict" }),
    /** Charger bay identifier within the depot, e.g. "BAY-03" */
    chargerBay: varchar("charger_bay", { length: 20 }),
    batteryLevelStartPct: real("battery_level_start_pct"),
    batteryLevelEndPct: real("battery_level_end_pct"),
    /** kWh delivered */
    energyDeliveredKwh: real("energy_delivered_kwh"),
    startedAt: timestamp("started_at", { withTimezone: true }).notNull(),
    endedAt: timestamp("ended_at", { withTimezone: true }),
    /** in_progress | completed | interrupted */
    status: varchar("status", { length: 30 }).notNull().default("in_progress"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => [
    index("idx_charging_bus_id").on(t.busId),
    index("idx_charging_depot_id").on(t.depotId),
    index("idx_charging_started_at").on(t.startedAt),
    // "Get the most recent charge for bus X" – very common pre-dispatch check
    index("idx_charging_bus_started_at").on(t.busId, t.startedAt),
    index("idx_charging_status").on(t.status),
  ]
);

export type ChargingSession = typeof chargingSessions.$inferSelect;
export type NewChargingSession = typeof chargingSessions.$inferInsert;
