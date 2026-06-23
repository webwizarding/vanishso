import { json } from "@sveltejs/kit";
import { env } from "$env/dynamic/private";
import { and, lt, ne } from "drizzle-orm";
import { notes } from "$lib/db/schema";
import { getDb } from "$lib/db/client";

// Scheduled purge of time-expired notes, invoked by Vercel Cron (see
// vercel.json). Expiry is otherwise only enforced lazily when a note is
// accessed, so this guarantees expired ciphertext does not linger in the
// database. One-time notes (exp === 0) have no timestamp and are removed only
// when they are read.
//
// Guarded by CRON_SECRET: Vercel Cron sends `Authorization: Bearer <secret>`.
// If the secret is unset the endpoint refuses, so it can never be triggered
// anonymously.
export async function GET({ request }) {
  const secret = env.CRON_SECRET;
  if (!secret) {
    return new Response(null, { status: 401 });
  }

  if (request.headers.get("authorization") !== `Bearer ${secret}`) {
    return new Response(null, { status: 401 });
  }

  const db = getDb();

  try {
    const deleted = await db
      .delete(notes)
      .where(and(ne(notes.exp, 0), lt(notes.exp, Date.now())))
      .returning({ id: notes.id });

    return json({ deleted: deleted.length });
  } catch (error) {
    console.error("Scheduled cleanup failed", error);
    return new Response(null, { status: 500 });
  }
}
