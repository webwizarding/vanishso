// returns note metadata without the encrypted content

import { eq } from "drizzle-orm";
import { notes } from "$lib/db/schema";
import { getDb } from "$lib/db/client";

export async function getNoteData(id: string) {
  const db = getDb();

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

  // Purge time-expired notes on access so stale ciphertext does not linger in
  // the database. One-time notes (exp === 0) are only burned on an actual read.
  if (note.exp !== 0 && note.exp < Date.now()) {
    await db
      .delete(notes)
      .where(eq(notes.id, id))
      .catch((error) => {
        console.error("Failed to enforce expiry for note metadata", error);
      });
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
