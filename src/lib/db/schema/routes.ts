/**
 * schema/routes.ts
 *
 * Bus routes served by the depot fleet.
 *
 * Indexes
 * ──────────────────────────────────────────────────────────────
 * idx_routes_number        – lookup by route number in dispatch search (unique)
 * idx_routes_depot_id      – FK; which routes operate from a depot
 * idx_routes_is_active     – filter retired routes out of scheduling views
 */

import {
  pgTable,
  uuid,
  varchar,
  real,
  boolean,
  timestamp,
  index,
  uniqueIndex,
} from "drizzle-orm/pg-core";
import { depots } from "./depots";

export const routes = pgTable(
  "routes",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    /** Public-facing route number, e.g. "Route 42" */
    routeNumber: varchar("route_number", { length: 20 }).notNull(),
    description: varchar("description", { length: 255 }),
    /** km */
    distanceKm: real("distance_km"),
    /** Estimated energy consumption per trip in kWh */
    estimatedEnergyKwh: real("estimated_energy_kwh"),
    depotId: uuid("depot_id")
      .notNull()
      .references(() => depots.id, { onDelete: "restrict" }),
    isActive: boolean("is_active").notNull().default(true),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => [
    uniqueIndex("idx_routes_number").on(t.routeNumber),
    index("idx_routes_depot_id").on(t.depotId),
    index("idx_routes_is_active").on(t.isActive),
  ]
);

export type Route = typeof routes.$inferSelect;
export type NewRoute = typeof routes.$inferInsert;
