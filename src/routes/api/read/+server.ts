import { json } from "@sveltejs/kit";
import { readNote } from "$lib/db/read-note";
import { hash } from "$lib";
import { timingSafeEqual } from "node:crypto";
import { Buffer } from "node:buffer";

const NOTE_ID_REGEX = /^[A-Za-z0-9_-]{6,32}$/;

export async function POST({ request }) {
  if (
    !request.headers
      .get("content-type")
      ?.toLowerCase()
      .includes("application/json")
  ) {
    return new Response(null, { status: 415 });
  }

  let id: string | undefined;
  let auth: string | undefined;

  try {
    const parsed = await request.json();
    id = parsed.id;
    auth = parsed.auth;
  } catch (error) {
    return new Response(null, { status: 400 });
  }

  if (!id || typeof id !== "string" || !NOTE_ID_REGEX.test(id)) {
    return new Response(null, { status: 400 });
  }

  const note = await readNote(id);

  if (!note) {
    return json({}, { status: 404 });
  }

  if (note.mode == "otp") {
    return json({ content: note.encrypted });
  }

  if (typeof auth !== "string" || auth.length !== 64) {
    return new Response(null, { status: 400 });
  }

  const sh = await hash(auth, note.ss);
  const isEqual =
    sh.length === note.h.length &&
    timingSafeEqual(Buffer.from(sh), Buffer.from(note.h));

  if (!isEqual) {
    return json({}, { status: 401 });
  }

  return json({ content: note.encrypted });
}
