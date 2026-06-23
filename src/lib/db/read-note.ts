import { eq } from "drizzle-orm";
import { notes } from "$lib/db/schema";
import { getDb } from "$lib/db/client";

// Fetch a note for reading. Time-based expiry is enforced eagerly here (an
// expired note is deleted and treated as if it never existed). One-time
// ("viewing", exp === 0) notes are NOT deleted here: burning must happen only
// after a successful read/auth, which is handled by `burnNote` from the
// endpoint. This prevents a failed password attempt from destroying the note.
export async function readNote(id: string) {
  const db = getDb();

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

  if (note.exp !== 0 && note.exp < Date.now()) {
    await db
      .delete(notes)
      .where(eq(notes.id, id))
      .catch((error) => {
        console.error("Failed to enforce expiry for note", error);
      });
    return null;
  }

  return note;
}

// Atomically delete a one-time note. Returns true only for the single caller
// that actually removed the row, so concurrent reads of a one-time note cannot
// both succeed.
export async function burnNote(id: string): Promise<boolean> {
  const db = getDb();

  try {
    const deleted = await db
      .delete(notes)
      .where(eq(notes.id, id))
      .returning({ id: notes.id });
    return deleted.length > 0;
  } catch (error) {
    console.error("Failed to burn note", error);
    return false;
  }
}
