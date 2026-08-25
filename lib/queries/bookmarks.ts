import "server-only";
import { cache } from "react";
import { createClient } from "@/lib/supabase/server";
import { getBreadcrumbs } from "@/lib/queries/content";
import type { Lesson } from "@/lib/queries/lessons";
import { LESSON_COLUMNS, mapLesson, type LessonRow } from "@/lib/queries/lessons";

export const isLessonBookmarked = cache(async (lessonId: string): Promise<boolean> => {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return false;

  const { data } = await supabase
    .from("bookmarks")
    .select("id")
    .eq("user_id", user.id)
    .eq("content_id", lessonId)
    .maybeSingle();

  return data !== null;
});

export type BookmarkedLesson = { lesson: Lesson; href: string; bookmarkedAt: string };

// RLS already scopes bookmarks to the caller's own rows (user_id =
// auth.uid()), so there's no need to pass/trust a user id here. Two
// plain queries rather than a PostgREST embedded-relation select —
// simpler to reason about without a live session to verify the embed
// syntax against.
export const getUserBookmarks = cache(async (): Promise<BookmarkedLesson[]> => {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return [];

  const { data: bookmarks, error: bookmarksError } = await supabase
    .from("bookmarks")
    .select("content_id, created_at")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (bookmarksError) throw bookmarksError;
  if (!bookmarks || bookmarks.length === 0) return [];

  const lessonIds = bookmarks.map((bookmark) => bookmark.content_id);
  const { data: lessons, error: lessonsError } = await supabase
    .from("lessons")
    .select(LESSON_COLUMNS)
    .in("id", lessonIds);

  if (lessonsError) throw lessonsError;

  const lessonById = new Map(
    ((lessons ?? []) as LessonRow[]).map((row) => [row.id, mapLesson(row)]),
  );

  const results: BookmarkedLesson[] = [];
  for (const bookmark of bookmarks) {
    const lesson = lessonById.get(bookmark.content_id);
    if (!lesson) continue; // defensive — content_id has ON DELETE CASCADE, so this shouldn't happen
    const breadcrumbs = await getBreadcrumbs(lesson.nodeId);
    const href = `/${breadcrumbs.map((crumb) => crumb.slug).join("/")}/${lesson.slug}`;
    results.push({ lesson, href, bookmarkedAt: bookmark.created_at });
  }

  return results;
});
