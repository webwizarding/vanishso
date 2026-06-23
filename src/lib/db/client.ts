import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "$lib/db/schema";
import { env } from "$env/dynamic/private";
import { neon } from "@neondatabase/serverless";

// Single place that reads DATABASE_URL and builds a Neon-backed Drizzle client.
// The Neon serverless driver is stateless (each query is an independent HTTP
// request), so creating a client per call is cheap and safe in serverless.
export function getDb() {
  if (!env.DATABASE_URL) {
    throw new Error("DATABASE_URL must be configured for Neon");
  }

  const sql = neon(env.DATABASE_URL);
  return drizzle(sql, { schema });
}
