// returns note without the content

import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "$lib/db/schema";
import { env } from "$env/dynamic/private";
import { eq } from "drizzle-orm";
import { notes } from "$lib/db/schema";
import { neon } from "@neondatabase/serverless";

export async function getNoteData(id: string) {
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
      console.error("Failed to read note metadata", error);
      return null;
    });

  if (!note) {
    return null;
  }

  const noteData = {
    id: note.id,
    confirmBeforeViewing: Boolean(note.confirmBeforeViewing),
    mode: note.mode,
    exp: note.exp,
    cs: note.cs,
  };

  return noteData;
}
