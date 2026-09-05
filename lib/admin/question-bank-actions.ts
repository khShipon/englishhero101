"use server";

import { redirect } from "next/navigation";
import { revalidatePath, updateTag } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { requireRole } from "@/lib/auth/dal";
import { questionSetSchema } from "@/lib/admin/question-validation";

// Matches the cacheTag() calls in lib/queries/question-banks.ts's
// public-site functions.
const QUESTION_SETS_TAG = "question-sets";

export type QuestionSetFormState =
  | {
      error?: string;
      fieldErrors?: Record<string, string[]>;
    }
  | undefined;

type PostgrestError = { code?: string; message: string };

function humanizeError(error: PostgrestError): string {
  if (error.code === "23503") {
    return "The selected category no longer exists.";
  }
  return "Could not save this question set. Please try again.";
}

function parseQuestionSetForm(formData: FormData) {
  return questionSetSchema.safeParse({
    title: formData.get("title"),
    nodeId: formData.get("nodeId") ?? "",
    description: formData.get("description") ?? "",
    examType: formData.get("examType") ?? "",
    subject: formData.get("subject") ?? "",
    board: formData.get("board") ?? "",
    year: formData.get("year") ?? "",
    difficulty: formData.get("difficulty") ?? "none",
    durationMinutes: formData.get("durationMinutes") ?? "",
    marks: formData.get("marks") ?? "",
    isPublished: formData.get("isPublished"),
  });
}

export async function createQuestionSet(
  _state: QuestionSetFormState,
  formData: FormData,
): Promise<QuestionSetFormState> {
  await requireRole(["admin", "editor"]);

  const parsed = parseQuestionSetForm(formData);
  if (!parsed.success) {
    return { fieldErrors: parsed.error.flatten().fieldErrors as Record<string, string[]> };
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("question_sets")
    .insert({
      node_id: parsed.data.nodeId,
      title: parsed.data.title,
      description: parsed.data.description,
      exam_type: parsed.data.examType,
      subject: parsed.data.subject,
      board: parsed.data.board,
      year: parsed.data.year,
      difficulty: parsed.data.difficulty,
      duration_minutes: parsed.data.durationMinutes,
      marks: parsed.data.marks,
      is_published: parsed.data.isPublished,
    })
    .select("id")
    .single();

  if (error || !data) {
    return { error: humanizeError(error ?? { message: "insert returned no row" }) };
  }

  revalidatePath("/admin/question-banks");
  updateTag(QUESTION_SETS_TAG);
  redirect(`/admin/question-banks/${data.id}`);
}

export async function updateQuestionSet(
  _state: QuestionSetFormState,
  formData: FormData,
): Promise<QuestionSetFormState> {
  await requireRole(["admin", "editor"]);

  const id = String(formData.get("id") ?? "");
  if (!id) {
    return { error: "Missing question set id." };
  }

  const parsed = parseQuestionSetForm(formData);
  if (!parsed.success) {
    return { fieldErrors: parsed.error.flatten().fieldErrors as Record<string, string[]> };
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("question_sets")
    .update({
      node_id: parsed.data.nodeId,
      title: parsed.data.title,
      description: parsed.data.description,
      exam_type: parsed.data.examType,
      subject: parsed.data.subject,
      board: parsed.data.board,
      year: parsed.data.year,
      difficulty: parsed.data.difficulty,
      duration_minutes: parsed.data.durationMinutes,
      marks: parsed.data.marks,
      is_published: parsed.data.isPublished,
    })
    .eq("id", id);

  if (error) {
    return { error: humanizeError(error) };
  }

  revalidatePath("/admin/question-banks");
  updateTag(QUESTION_SETS_TAG);
  revalidatePath(`/admin/question-banks/${id}`);
  redirect(`/admin/question-banks/${id}`);
}

export async function deleteQuestionSet(formData: FormData) {
  await requireRole(["admin", "editor"]);
  const id = String(formData.get("id") ?? "");
  if (!id) return;

  const supabase = await createClient();
  const { error } = await supabase.from("question_sets").delete().eq("id", id);
  if (error) {
    throw new Error("Could not delete this question set.");
  }

  revalidatePath("/admin/question-banks");
  updateTag(QUESTION_SETS_TAG);
}

// Creates the lesson's own dedicated practice question set — the same
// lesson-scoped mechanism getPublishedQuestionSetsByLesson reads on the
// public site. Kept as a plain form action (not useActionState) since
// it takes no free-text input: it's a single "make me one of these"
// button on the lesson edit page's reading-passages panel.
export async function createLessonQuestionSet(formData: FormData) {
  await requireRole(["admin", "editor"]);
  const lessonId = String(formData.get("lessonId") ?? "");
  const lessonTitle = String(formData.get("lessonTitle") ?? "");
  const nodeId = String(formData.get("nodeId") ?? "");
  if (!lessonId) return;

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("question_sets")
    .insert({
      lesson_id: lessonId,
      title: `Practice: ${lessonTitle}`,
      is_published: false,
    })
    .select("id")
    .single();

  if (error || !data) {
    throw new Error("Could not create a practice set for this lesson.");
  }

  revalidatePath(`/admin/lessons/${lessonId}/edit`);
  if (nodeId) revalidatePath(`/admin/content/${nodeId}/lessons`);
  updateTag(QUESTION_SETS_TAG);
  redirect(`/admin/question-banks/${data.id}`);
}

export async function toggleQuestionSetPublish(formData: FormData) {
  await requireRole(["admin", "editor"]);
  const id = String(formData.get("id") ?? "");
  const nextPublished = formData.get("nextPublished") === "true";
  if (!id) return;

  const supabase = await createClient();
  const { error } = await supabase
    .from("question_sets")
    .update({ is_published: nextPublished })
    .eq("id", id);

  if (error) {
    throw new Error("Could not update the publish state.");
  }

  revalidatePath("/admin/question-banks");
  revalidatePath(`/admin/question-banks/${id}`);
  updateTag(QUESTION_SETS_TAG);
}
