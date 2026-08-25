import "server-only";
import { cache } from "react";
import { createClient } from "@/lib/supabase/server";
import { getPublishedNodeBySlugPath, getBreadcrumbs, getChildren } from "@/lib/queries/content";
import { LESSON_COLUMNS, mapLesson } from "@/lib/queries/lessons";

export type SpokenCourseProgress = {
  totalLessons: number;
  completedLessons: number;
  averagePercent: number | null;
  nextLesson: { title: string; href: string } | null;
};

// Dashboard summary for the "100-Day Spoken Course" (spoken-english/course):
// how many of its published lessons the signed-in user has completed,
// their average practice-quiz score across those lessons, and which
// lesson to continue with next (first not-yet-completed one, in
// curriculum order).
export const getSpokenCourseProgress = cache(async (): Promise<SpokenCourseProgress | null> => {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const courseNode = await getPublishedNodeBySlugPath(["spoken-english", "course"]);
  if (!courseNode) return null;

  const levels = await getChildren(courseNode.id);
  const levelIds = levels.map((level) => level.id);
  if (levelIds.length === 0) {
    return { totalLessons: 0, completedLessons: 0, averagePercent: null, nextLesson: null };
  }
  const levelOrder = new Map(levels.map((level, index) => [level.id, index]));

  const { data: lessonRows, error: lessonError } = await supabase
    .from("lessons")
    .select(LESSON_COLUMNS)
    .in("node_id", levelIds)
    .eq("status", "published");
  if (lessonError) throw lessonError;

  const lessons = (lessonRows ?? []).map(mapLesson).sort((a, b) => {
    const levelDiff = (levelOrder.get(a.nodeId) ?? 0) - (levelOrder.get(b.nodeId) ?? 0);
    return levelDiff !== 0 ? levelDiff : a.slug.localeCompare(b.slug);
  });

  if (lessons.length === 0) {
    return { totalLessons: 0, completedLessons: 0, averagePercent: null, nextLesson: null };
  }

  const lessonIds = lessons.map((lesson) => lesson.id);

  const [{ data: progressRows, error: progressError }, { data: attemptRows, error: attemptError }] =
    await Promise.all([
      supabase.from("lesson_progress").select("lesson_id, completed").eq("user_id", user.id).in("lesson_id", lessonIds),
      supabase.from("quiz_attempts").select("percent").eq("user_id", user.id).in("lesson_id", lessonIds),
    ]);
  if (progressError) throw progressError;
  if (attemptError) throw attemptError;

  const completedIds = new Set(
    (progressRows ?? []).filter((row) => row.completed).map((row) => row.lesson_id),
  );
  const percents = (attemptRows ?? []).map((row) => row.percent as number);
  const averagePercent =
    percents.length > 0 ? Math.round(percents.reduce((sum, value) => sum + value, 0) / percents.length) : null;

  const nextLessonRow = lessons.find((lesson) => !completedIds.has(lesson.id)) ?? null;
  let nextLesson: SpokenCourseProgress["nextLesson"] = null;
  if (nextLessonRow) {
    const breadcrumbs = await getBreadcrumbs(nextLessonRow.nodeId);
    const href = `/${breadcrumbs.map((crumb) => crumb.slug).join("/")}/${nextLessonRow.slug}`;
    nextLesson = { title: nextLessonRow.title, href };
  }

  return {
    totalLessons: lessons.length,
    completedLessons: completedIds.size,
    averagePercent,
    nextLesson,
  };
});
