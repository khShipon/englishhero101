import "server-only";
import { cache } from "react";
import { cacheLife, cacheTag } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { createPublicClient } from "@/lib/supabase/public";

const READING_PASSAGES_TAG = "reading-passages";

export type ReadingPassageParagraph = { label: string | null; text: string };

export type ReadingPassage = {
  id: string;
  lessonId: string;
  passageNumber: number;
  title: string;
  paragraphs: ReadingPassageParagraph[];
};

type ReadingPassageRow = {
  id: string;
  lesson_id: string;
  passage_number: number;
  title: string;
  paragraphs: ReadingPassageParagraph[] | null;
};

function mapReadingPassage(row: ReadingPassageRow): ReadingPassage {
  return {
    id: row.id,
    lessonId: row.lesson_id,
    passageNumber: row.passage_number,
    title: row.title,
    paragraphs: row.paragraphs ?? [],
  };
}

// Structured passages for a reading-test lesson, ordered 1, 2, 3...
// Empty for any lesson that isn't a reading test (nothing to link) --
// callers use that to decide whether to render the split-screen "CD
// test" practice UI at all.
export async function getReadingPassagesByLesson(lessonId: string): Promise<ReadingPassage[]> {
  "use cache";
  cacheLife("hours");
  cacheTag(READING_PASSAGES_TAG);

  const supabase = createPublicClient();
  const { data, error } = await supabase
    .from("reading_passages")
    .select("id, lesson_id, passage_number, title, paragraphs")
    .eq("lesson_id", lessonId)
    .order("passage_number");

  if (error) throw error;
  return (data ?? []).map(mapReadingPassage);
}

// Admin-scoped lookup (drafts included, relies on the caller's own RLS
// access) — mirrors getQuestionSetById vs. its public-only counterpart,
// since an admin needs to see/edit a reading-test lesson's passages
// before it's published.
export const getReadingPassagesByLessonAdmin = cache(
  async (lessonId: string): Promise<ReadingPassage[]> => {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("reading_passages")
      .select("id, lesson_id, passage_number, title, paragraphs")
      .eq("lesson_id", lessonId)
      .order("passage_number");

    if (error) throw error;
    return (data ?? []).map(mapReadingPassage);
  },
);
