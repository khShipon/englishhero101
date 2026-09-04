"use server";

import { revalidatePath } from "next/cache";
import { updateTag } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { requireRole } from "@/lib/auth/dal";

const LESSONS_TAG = "lessons";
const QUESTION_SETS_TAG = "question-sets";

// Publishes (or unpublishes) a lesson from its preview page — and,
// when it has one, its practice set together with it, since from the
// admin's point of view a lesson-plus-quiz is one piece of content
// even though they're two separate rows. Doesn't touch the parent
// category's own published state; that's a one-time setup step, not
// something each individual lesson should flip.
export async function setLessonPublished(formData: FormData) {
  await requireRole(["admin", "editor"]);

  const lessonId = String(formData.get("lessonId") ?? "");
  const questionSetId = String(formData.get("questionSetId") ?? "");
  const nextPublished = formData.get("nextPublished") === "true";
  if (!lessonId) return;

  const supabase = await createClient();

  const { data: lessonRow, error: lessonError } = await supabase
    .from("lessons")
    .select("published_at")
    .eq("id", lessonId)
    .single();
  if (lessonError) {
    throw new Error("Could not load this lesson.");
  }

  const { error: updateLessonError } = await supabase
    .from("lessons")
    .update({
      status: nextPublished ? "published" : "draft",
      published_at: nextPublished ? (lessonRow.published_at ?? new Date().toISOString()) : lessonRow.published_at,
    })
    .eq("id", lessonId);
  if (updateLessonError) {
    throw new Error("Could not update the lesson's publish state.");
  }

  if (questionSetId) {
    const { error: updateSetError } = await supabase
      .from("question_sets")
      .update({ is_published: nextPublished })
      .eq("id", questionSetId);
    if (updateSetError) {
      throw new Error("Lesson updated, but could not update the practice set's publish state.");
    }
  }

  revalidatePath(`/admin/lessons/${lessonId}/edit`);
  revalidatePath(`/admin/lessons/${lessonId}/preview`);
  revalidatePath("/admin/ielts-reading");
  if (questionSetId) {
    revalidatePath(`/admin/question-banks/${questionSetId}`);
    revalidatePath("/admin/question-banks");
  }
  updateTag(LESSONS_TAG);
  updateTag(QUESTION_SETS_TAG);
}
