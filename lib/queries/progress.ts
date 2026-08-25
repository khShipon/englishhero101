import "server-only";
import { cache } from "react";
import { createClient } from "@/lib/supabase/server";
import { getBreadcrumbs } from "@/lib/queries/content";
import type { Lesson } from "@/lib/queries/lessons";
import { LESSON_COLUMNS, mapLesson, type LessonRow } from "@/lib/queries/lessons";

export type LessonProgress = {
  completed: boolean;
  progressPercent: number;
  lastOpenedAt: string | null;
  completedAt: string | null;
};

export const getLessonProgress = cache(async (lessonId: string): Promise<LessonProgress | null> => {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data } = await supabase
    .from("lesson_progress")
    .select("completed, progress_percent, last_opened_at, completed_at")
    .eq("user_id", user.id)
    .eq("lesson_id", lessonId)
    .maybeSingle();

  if (!data) return null;
  return {
    completed: data.completed,
    progressPercent: data.progress_percent,
    lastOpenedAt: data.last_opened_at,
    completedAt: data.completed_at,
  };
});

export type ProgressLesson = { lesson: Lesson; href: string; progress: LessonProgress };

async function attachLessonInfo(
  rows: { lesson_id: string; completed: boolean; progress_percent: number; last_opened_at: string | null; completed_at: string | null }[],
): Promise<ProgressLesson[]> {
  if (rows.length === 0) return [];

  const supabase = await createClient();
  const lessonIds = rows.map((row) => row.lesson_id);
  const { data: lessons, error } = await supabase.from("lessons").select(LESSON_COLUMNS).in("id", lessonIds);
  if (error) throw error;

  const lessonById = new Map(((lessons ?? []) as LessonRow[]).map((row) => [row.id, mapLesson(row)]));

  const results: ProgressLesson[] = [];
  for (const row of rows) {
    const lesson = lessonById.get(row.lesson_id);
    if (!lesson) continue;
    const breadcrumbs = await getBreadcrumbs(lesson.nodeId);
    const href = `/${breadcrumbs.map((crumb) => crumb.slug).join("/")}/${lesson.slug}`;
    results.push({
      lesson,
      href,
      progress: {
        completed: row.completed,
        progressPercent: row.progress_percent,
        lastOpenedAt: row.last_opened_at,
        completedAt: row.completed_at,
      },
    });
  }
  return results;
}

export const getContinueLearning = cache(async (limit = 5): Promise<ProgressLesson[]> => {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return [];

  const { data, error } = await supabase
    .from("lesson_progress")
    .select("lesson_id, completed, progress_percent, last_opened_at, completed_at")
    .eq("user_id", user.id)
    .eq("completed", false)
    .order("last_opened_at", { ascending: false })
    .limit(limit);

  if (error) throw error;
  return attachLessonInfo(data ?? []);
});

export const getCompletedLessons = cache(async (limit = 20): Promise<ProgressLesson[]> => {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return [];

  const { data, error } = await supabase
    .from("lesson_progress")
    .select("lesson_id, completed, progress_percent, last_opened_at, completed_at")
    .eq("user_id", user.id)
    .eq("completed", true)
    .order("completed_at", { ascending: false })
    .limit(limit);

  if (error) throw error;
  return attachLessonInfo(data ?? []);
});
