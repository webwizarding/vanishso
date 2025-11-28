import { getNoteData } from "$lib/db/get-note-data";

interface Params {
  params: {
    noteid: string;
  };
}

const NOTE_ID_REGEX = /^[A-Za-z0-9_-]{6,32}$/;

export async function load({ params }: Params) {
  if (!NOTE_ID_REGEX.test(params.noteid)) {
    return { noteData: null };
  }

  return {
    noteData: await getNoteData(params.noteid),
  };
}
