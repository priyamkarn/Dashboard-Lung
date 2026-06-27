/**
 * schema/depots.ts
 *
 * Physical charging depots / bus garages.
 *
 * Indexes
 * ──────────────────────────────────────────────────────────────
 * idx_depots_code          – short lookup by depot code (unique)
 * idx_depots_is_active     – filter active depots in dropdowns / maps
 */

import {
  pgTable,
  uuid,
  varchar,
  integer,
  boolean,
  real,
  timestamp,
  index,
  uniqueIndex,
} from "drizzle-orm/pg-core";

export const depots = pgTable(
  "depots",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    /** e.g. "DEPOT-01" */
    code: varchar("code", { length: 20 }).notNull(),
    name: varchar("name", { length: 255 }).notNull(),
    latitude: real("latitude"),
    longitude: real("longitude"),
    /** Total number of charging bays */
    totalChargers: integer("total_chargers").notNull().default(0),
    isActive: boolean("is_active").notNull().default(true),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => [
    uniqueIndex("idx_depots_code").on(t.code),
    index("idx_depots_is_active").on(t.isActive),
  ]
);

export type Depot = typeof depots.$inferSelect;
export type NewDepot = typeof depots.$inferInsert;
