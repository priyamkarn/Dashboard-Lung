/**
 * schema/users.ts
 *
 * Operators, dispatchers, and admin accounts.
 * Better-Auth manages session rows; we own the user profile table.
 *
 * Indexes
 * ──────────────────────────────────────────────────────────────
 * idx_users_email          – login lookup (unique, most critical)
 * idx_users_role           – filter dispatchers vs admins vs read-only
 * idx_users_depot_id       – join to depots for multi-depot deployments
 * idx_users_is_active      – exclude deactivated accounts in list views
 */

import {
  pgTable,
  uuid,
  varchar,
  boolean,
  timestamp,
  index,
  uniqueIndex,
} from "drizzle-orm/pg-core";
import { depots } from "./depots";

export const users = pgTable(
  "users",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    email: varchar("email", { length: 255 }).notNull(),
    name: varchar("name", { length: 255 }).notNull(),
    /** dispatcher | admin | viewer */
    role: varchar("role", { length: 50 }).notNull().default("dispatcher"),
    depotId: uuid("depot_id").references(() => depots.id, {
      onDelete: "set null",
    }),
    isActive: boolean("is_active").notNull().default(true),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => [
    uniqueIndex("idx_users_email").on(t.email),
    index("idx_users_role").on(t.role),
    index("idx_users_depot_id").on(t.depotId),
    index("idx_users_is_active").on(t.isActive),
  ]
);

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
