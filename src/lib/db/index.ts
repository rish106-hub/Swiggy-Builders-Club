import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

let db: ReturnType<typeof drizzle> | null = null;

export function getDb() {
  if (!process.env.DATABASE_URL) return null;
  if (!db) {
    const client = postgres(process.env.DATABASE_URL);
    db = drizzle(client, { schema });
  }
  return db;
}

export { schema };
