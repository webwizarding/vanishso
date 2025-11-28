// returns note without the content

import { drizzle } from "drizzle-orm/libsql";
import * as schema from "$lib/db/schema";
import { env } from "$env/dynamic/private";
import { eq } from "drizzle-orm";
import { notes } from "$lib/db/schema";
import { createClient } from "@libsql/client";

export async function getNoteData(id: string) {
  if (!env.DATABASE_HOST || !env.DATABASE_TOKEN) {
    throw new Error("DATABASE_HOST and DATABASE_TOKEN must be configured");
  }

  const client = createClient({
    url: env.DATABASE_HOST,
    authToken: env.DATABASE_TOKEN,
  });

  const db = drizzle(client, { schema });

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
