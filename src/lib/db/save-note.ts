import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "$lib/db/schema";
import { env } from "$env/dynamic/private";
import { notes } from "$lib/db/schema";
import ShortUniqueId from "short-unique-id";
import type { NewNote } from "../../routes/api/new/+server";
import { generateSalt, hash } from "$lib";
import { neon } from "@neondatabase/serverless";

export async function saveNote({
  confirmBeforeViewing,
  mode,
  encrypted,
  exp,
  h,
  s,
}: NewNote) {
  if (!env.DATABASE_URL) {
    throw new Error("DATABASE_URL must be configured for Neon");
  }

  const sql = neon(env.DATABASE_URL);
  const db = drizzle(sql, { schema });

  // generate id
  const uid = new ShortUniqueId({ length: 10 });
  const noteId = uid.rnd();

  // convert exp option to actual exp

  const expiryTimes = {
    "1h": Date.now() + 1000 * 60 * 60,
    "24h": Date.now() + 1000 * 60 * 60 * 24,
    "7d": Date.now() + 1000 * 60 * 60 * 24 * 7,
    "30d": Date.now() + 1000 * 60 * 60 * 24 * 30,
    viewing: 0,
  };

  const _exp = expiryTimes[exp];

  const ss = await generateSalt();
  const sh = await hash(h, ss);

  const note = {
    id: noteId,
    confirmBeforeViewing: confirmBeforeViewing,
    mode: mode,
    encrypted: encrypted,
    exp: _exp,
    h: sh,
    cs: s,
    ss: ss,
  };

  try {
    await db.insert(notes).values(note);
    return noteId;
  } catch (e) {
    console.error("Failed to write note to database", e);
    throw e;
  }
}
