/**
 * src/lib/db/index.ts
 *
 * Drizzle + postgres-js client.
 * Uses a module-level singleton so Next.js hot-reload doesn't
 * exhaust the Supabase connection pool in development.
 */

import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

declare global {
  // eslint-disable-next-line no-var
  var __db: ReturnType<typeof drizzle> | undefined;
}

function createDb() {
  const client = postgres(process.env.DATABASE_URL!, {
    max: process.env.NODE_ENV === "production" ? 10 : 3,
  });
  return drizzle(client, { schema });
}

export const db: ReturnType<typeof createDb> =
  process.env.NODE_ENV === "production"
    ? createDb()
    : (globalThis.__db ??= createDb());

export * from "./schema";
