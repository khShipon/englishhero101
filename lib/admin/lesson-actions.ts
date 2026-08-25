"use server";

import { redirect } from "next/navigation";
import { revalidatePath, updateTag } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { requireRole } from "@/lib/auth/dal";
import { lessonSchema } from "@/lib/admin/lesson-validation";

// Matches the cacheTag() calls in lib/queries/lessons.ts's public-site
// functions.
const LESSONS_TAG = "lessons";

export type LessonFormState =
  | {
      error?: string;
      fieldErrors?: Record<string, string[]>;
    }
  | undefined;

type PostgrestError = { code?: string; message: string };

function humanizeLessonError(error: PostgrestError): string {
  if (error.code === "23505") {
    return "A lesson with this slug already exists under this category.";
  }
  if (error.code === "23503") {
    return "The selected category no longer exists.";
  }
  return "Could not save this lesson. Please try again.";
}

function parseLessonForm(formData: FormData) {
  return lessonSchema.safeParse({
    title: formData.get("title"),
    slug: formData.get("slug"),
    nodeId: formData.get("nodeId"),
    excerpt: formData.get("excerpt") ?? "",
    content: formData.get("content") ?? "{}",
    difficulty: formData.get("difficulty") ?? "none",
    estimatedMinutes: formData.get("estimatedMinutes") ?? "",
    seoTitle: formData.get("seoTitle") ?? "",
    seoDescription: formData.get("seoDescription") ?? "",
  });
}

export async function createLesson(
  _state: LessonFormState,
  formData: FormData,
): Promise<LessonFormState> {
  await requireRole(["admin", "editor"]);

  const parsed = parseLessonForm(formData);
  if (!parsed.success) {
    return { fieldErrors: parsed.error.flatten().fieldErrors as Record<string, string[]> };
  }

  const status = formData.get("intent") === "publish" ? "published" : "draft";

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data, error } = await supabase
    .from("lessons")
    .insert({
      node_id: parsed.data.nodeId,
      title: parsed.data.title,
      slug: parsed.data.slug,
      excerpt: parsed.data.excerpt,
      content: parsed.data.content,
      status,
      difficulty: parsed.data.difficulty,
      estimated_minutes: parsed.data.estimatedMinutes,
      author_id: user?.id ?? null,
      seo_title: parsed.data.seoTitle,
      seo_description: parsed.data.seoDescription,
      published_at: status === "published" ? new Date().toISOString() : null,
    })
    .select("node_id")
    .single();

  if (error || !data) {
    return { error: humanizeLessonError(error ?? { message: "insert returned no row" }) };
  }

  revalidatePath(`/admin/content/${data.node_id}/lessons`);
  updateTag(LESSONS_TAG);
  redirect(`/admin/content/${data.node_id}/lessons`);
}

export async function updateLesson(
  _state: LessonFormState,
  formData: FormData,
): Promise<LessonFormState> {
  await requireRole(["admin", "editor"]);

  const id = String(formData.get("id") ?? "");
  if (!id) {
    return { error: "Missing lesson id." };
  }

  const parsed = parseLessonForm(formData);
  if (!parsed.success) {
    return { fieldErrors: parsed.error.flatten().fieldErrors as Record<string, string[]> };
  }

  const intent = formData.get("intent");
  const supabase = await createClient();

  const { data: existing } = await supabase
    .from("lessons")
    .select("status, published_at")
    .eq("id", id)
    .single();

  let status = existing?.status ?? "draft";
  let publishedAt = existing?.published_at ?? null;

  if (intent === "publish") {
    status = "published";
    publishedAt = publishedAt ?? new Date().toISOString();
  } else if (intent === "unpublish" || intent === "draft") {
    status = "draft";
  }
  // intent === "save" (or anything else): keep the existing status as-is.

  const { data, error } = await supabase
    .from("lessons")
    .update({
      node_id: parsed.data.nodeId,
      title: parsed.data.title,
      slug: parsed.data.slug,
      excerpt: parsed.data.excerpt,
      content: parsed.data.content,
      status,
      difficulty: parsed.data.difficulty,
      estimated_minutes: parsed.data.estimatedMinutes,
      seo_title: parsed.data.seoTitle,
      seo_description: parsed.data.seoDescription,
      published_at: publishedAt,
    })
    .eq("id", id)
    .select("node_id")
    .single();

  if (error || !data) {
    return { error: humanizeLessonError(error ?? { message: "update returned no row" }) };
  }

  revalidatePath(`/admin/content/${data.node_id}/lessons`);
  updateTag(LESSONS_TAG);
  redirect(`/admin/content/${data.node_id}/lessons`);
}

export async function deleteLesson(formData: FormData) {
  await requireRole(["admin", "editor"]);
  const id = String(formData.get("id") ?? "");
  const nodeId = String(formData.get("nodeId") ?? "");
  if (!id) return;

  const supabase = await createClient();
  const { error } = await supabase.from("lessons").delete().eq("id", id);
  if (error) {
    throw new Error("Could not delete this lesson.");
  }

  revalidatePath(`/admin/content/${nodeId}/lessons`);
  updateTag(LESSONS_TAG);
}

export async function archiveLesson(formData: FormData) {
  await requireRole(["admin", "editor"]);
  const id = String(formData.get("id") ?? "");
  const nodeId = String(formData.get("nodeId") ?? "");
  if (!id) return;

  const supabase = await createClient();
  const { error } = await supabase.from("lessons").update({ status: "archived" }).eq("id", id);
  if (error) {
    throw new Error("Could not archive this lesson.");
  }

  revalidatePath(`/admin/content/${nodeId}/lessons`);
  updateTag(LESSONS_TAG);
}
