import { json } from "@sveltejs/kit";
import { saveNote } from "$lib/db/save-note.js";

const expiries = ["viewing", "1h", "24h", "7d", "30d"];
const modes = ["p", "k", "otp"];
const MAX_BODY_SIZE = 1_800_000; // allow encrypted payloads with small images while protecting Neon free tier
const HASH_REGEX = /^[a-f0-9]{64}$/i;

export interface NewNote {
  confirmBeforeViewing: boolean;
  mode: "p" | "k" | "otp";
  encrypted: string;
  exp: "viewing" | "1h" | "24h" | "7d" | "30d";
  h: string;
  s: string;
}

export async function POST({ request }) {
  if (
    !request.headers
      .get("content-type")
      ?.toLowerCase()
      .includes("application/json")
  ) {
    return new Response(null, { status: 415 });
  }

  let payload: Partial<NewNote>;
  try {
    payload = await request.json();
  } catch (error) {
    return new Response(null, { status: 400 });
  }

  const { mode, encrypted, exp, h, confirmBeforeViewing, s = "" } = payload;

  if (
    typeof encrypted !== "string" ||
    encrypted.length === 0 ||
    encrypted.length > MAX_BODY_SIZE
  ) {
    return new Response(null, { status: 400 });
  }

  if (mode !== "otp") {
    if (typeof h !== "string" || !HASH_REGEX.test(h)) {
      return new Response(null, { status: 400 });
    }
  }

  if (mode === "p") {
    if (typeof s !== "string" || s.length === 0 || s.length > 64) {
      return new Response(null, { status: 400 });
    }
  }

  if (!expiries.includes(exp)) {
    return new Response(null, { status: 400 });
  }

  if (!modes.includes(mode)) {
    return new Response(null, { status: 400 });
  }

  const confirmFlag =
    typeof confirmBeforeViewing === "boolean" ? confirmBeforeViewing : false;

  const shouldConfirm =
    mode === "p" || exp !== "viewing" ? true : confirmFlag;

  const newNote = {
    confirmBeforeViewing: shouldConfirm,
    mode,
    encrypted,
    exp,
    h,
    s,
  };

  try {
    const noteId = await saveNote(newNote);

    return json({ noteid: noteId }, { status: 201 });
  } catch (error) {
    console.error("Failed to persist note", error);
    return new Response(null, { status: 500 });
  }
}
