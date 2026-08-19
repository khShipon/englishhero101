import "server-only";
import { createClient } from "@/lib/supabase/server";

export type AdminStats = {
  totalCategories: number;
  totalLessons: number;
  publishedLessons: number;
  draftLessons: number;
  totalQuestions: number;
  totalVocabulary: number;
  totalStudents: number;
};

export async function getAdminStats(): Promise<AdminStats> {
  const supabase = await createClient();

  const [categories, lessons, publishedLessons, draftLessons, questions, vocabulary, students] =
    await Promise.all([
      supabase.from("content_nodes").select("*", { count: "exact", head: true }),
      supabase.from("lessons").select("*", { count: "exact", head: true }),
      supabase
        .from("lessons")
        .select("*", { count: "exact", head: true })
        .eq("status", "published"),
      supabase.from("lessons").select("*", { count: "exact", head: true }).eq("status", "draft"),
      supabase.from("questions").select("*", { count: "exact", head: true }),
      supabase.from("vocabulary").select("*", { count: "exact", head: true }),
      supabase.from("profiles").select("*", { count: "exact", head: true }).eq("role", "student"),
    ]);

  return {
    totalCategories: categories.count ?? 0,
    totalLessons: lessons.count ?? 0,
    publishedLessons: publishedLessons.count ?? 0,
    draftLessons: draftLessons.count ?? 0,
    totalQuestions: questions.count ?? 0,
    totalVocabulary: vocabulary.count ?? 0,
    totalStudents: students.count ?? 0,
  };
}

export type RecentActivityItem = {
  id: string;
  title: string;
  type: "lesson" | "content_node";
  status: string;
  updatedAt: string;
};

export async function getRecentActivity(limit = 8): Promise<RecentActivityItem[]> {
  const supabase = await createClient();

  const [{ data: nodes }, { data: lessons }] = await Promise.all([
    supabase
      .from("content_nodes")
      .select("id, title, updated_at, is_published")
      .order("updated_at", { ascending: false })
      .limit(limit),
    supabase
      .from("lessons")
      .select("id, title, updated_at, status")
      .order("updated_at", { ascending: false })
      .limit(limit),
  ]);

  const items: RecentActivityItem[] = [
    ...(nodes ?? []).map((n) => ({
      id: n.id,
      title: n.title,
      type: "content_node" as const,
      status: n.is_published ? "published" : "draft",
      updatedAt: n.updated_at,
    })),
    ...(lessons ?? []).map((l) => ({
      id: l.id,
      title: l.title,
      type: "lesson" as const,
      status: l.status,
      updatedAt: l.updated_at,
    })),
  ];

  items.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
  return items.slice(0, limit);
}
