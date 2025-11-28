import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "$lib/db/schema";
import { env } from "$env/dynamic/private";
import { eq } from "drizzle-orm";
import { notes } from "$lib/db/schema";
import { neon } from "@neondatabase/serverless";

export async function readNote(id: string) {
  if (!env.DATABASE_URL) {
    throw new Error("DATABASE_URL must be configured for Neon");
  }

  const sql = neon(env.DATABASE_URL);
  const db = drizzle(sql, { schema });

  const note = await db.query.notes
    .findFirst({
      where: eq(notes.id, id),
    })
    .catch((error) => {
      console.error("Failed to read note", error);
      return null;
    });

  if (!note) {
    return null;
  }

  try {
    if (note.exp == 0) {
      await db.delete(notes).where(eq(notes.id, id));
    } else if (note.exp < Date.now()) {
      await db.delete(notes).where(eq(notes.id, id));
      return null;
    }
  } catch (error) {
    console.error("Failed to enforce expiry for note", error);
  }

  return note;
}
