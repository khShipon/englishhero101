import "server-only";
import { cache } from "react";
import { createClient } from "@/lib/supabase/server";

export type ReadingTestLessonSummary = {
  lessonId: string;
  lessonTitle: string;
  lessonStatus: string;
  passageCount: number;
  questionSetId: string | null;
  isPublished: boolean;
};

type ContentNodeRow = { id: string; slug: string; parent_id: string | null };

// Walks the known ielts > reading > practice-tests slug chain (see
// supabase/migrations/030_ielts_reading_practice_tests.sql) to find the
// parent node new reading-test lessons should be created under. Matched
// by parent_id chain rather than slug alone, since "reading" as a slug
// isn't guaranteed unique across the whole content tree.
function findPracticeTestsNodeId(rows: ContentNodeRow[]): string | null {
  const ielts = rows.find((row) => row.slug === "ielts" && row.parent_id === null);
  if (!ielts) return null;
  const reading = rows.find((row) => row.slug === "reading" && row.parent_id === ielts.id);
  if (!reading) return null;
  const practiceTests = rows.find((row) => row.slug === "practice-tests" && row.parent_id === reading.id);
  return practiceTests?.id ?? null;
}

// Admin overview for the "IELTS Reading" nav section — every lesson
// that has structured reading passages (i.e. every CD-style reading
// test), with at-a-glance passage/question-set status, plus the node
// id to create a new one under.
export const getIeltsReadingOverview = cache(async (): Promise<{
  lessons: ReadingTestLessonSummary[];
  newTestNodeId: string | null;
}> => {
  const supabase = await createClient();

  const [{ data: passageRows, error: passagesError }, { data: nodeRows }] = await Promise.all([
    supabase.from("reading_passages").select("lesson_id"),
    supabase
      .from("content_nodes")
      .select("id, slug, parent_id")
      .in("slug", ["ielts", "reading", "practice-tests"]),
  ]);

  if (passagesError) throw passagesError;
  const newTestNodeId = findPracticeTestsNodeId((nodeRows ?? []) as ContentNodeRow[]);

  const lessonIds = [...new Set((passageRows ?? []).map((row) => row.lesson_id as string))];
  if (lessonIds.length === 0) {
    return { lessons: [], newTestNodeId };
  }

  const [{ data: lessons, error: lessonsError }, { data: questionSets, error: qsError }] =
    await Promise.all([
      supabase.from("lessons").select("id, title, status").in("id", lessonIds),
      supabase.from("question_sets").select("id, lesson_id, is_published").in("lesson_id", lessonIds),
    ]);

  if (lessonsError) throw lessonsError;
  if (qsError) throw qsError;

  const passageCountByLesson = new Map<string, number>();
  for (const row of passageRows ?? []) {
    const lessonId = row.lesson_id as string;
    passageCountByLesson.set(lessonId, (passageCountByLesson.get(lessonId) ?? 0) + 1);
  }

  const questionSetByLesson = new Map<string, { id: string; isPublished: boolean }>();
  for (const row of questionSets ?? []) {
    if (row.lesson_id) {
      questionSetByLesson.set(row.lesson_id, { id: row.id, isPublished: row.is_published });
    }
  }

  const summaries: ReadingTestLessonSummary[] = (lessons ?? [])
    .map((lesson) => ({
      lessonId: lesson.id,
      lessonTitle: lesson.title,
      lessonStatus: lesson.status,
      passageCount: passageCountByLesson.get(lesson.id) ?? 0,
      questionSetId: questionSetByLesson.get(lesson.id)?.id ?? null,
      isPublished: questionSetByLesson.get(lesson.id)?.isPublished ?? false,
    }))
    .sort((a, b) => a.lessonTitle.localeCompare(b.lessonTitle));

  return { lessons: summaries, newTestNodeId };
});
