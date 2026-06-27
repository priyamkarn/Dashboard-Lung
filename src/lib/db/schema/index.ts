/**
 * src/lib/db/schema/index.ts
 *
 * Single entry-point for all Drizzle schema tables.
 * Import order matters: tables with no FK dependencies first.
 */

export * from "./depots";
export * from "./users";
export * from "./buses";
export * from "./routes";
export * from "./dispatch_assignments";
export * from "./charging_sessions";
export * from "./maintenance_records";
