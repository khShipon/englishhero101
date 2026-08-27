"use server";

import { redirect } from "next/navigation";
import { revalidatePath, updateTag } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { requireRole } from "@/lib/auth/dal";
import { readingPassageSchema } from "@/lib/admin/reading-passage-validation";

// Matches the cacheTag() call in lib/queries/reading-passages.ts's
// public-site query.
const READING_PASSAGES_TAG = "reading-passages";

export type ReadingPassageFormState =
  | {
      error?: string;
      fieldErrors?: Record<string, string[]>;
    }
  | undefined;

type PostgrestError = { code?: string; message: string };

function humanizeError(error: PostgrestError): string {
  if (error.code === "23505") {
    return "This lesson already has a passage with that number.";
  }
  return "Could not save this passage. Please try again.";
}

function parseReadingPassageForm(formData: FormData) {
  return readingPassageSchema.safeParse({
    lessonId: formData.get("lessonId"),
    passageNumber: formData.get("passageNumber"),
    title: formData.get("title"),
    paragraphs: formData.get("paragraphs") ?? "[]",
  });
}

export async function createReadingPassage(
  _state: ReadingPassageFormState,
  formData: FormData,
): Promise<ReadingPassageFormState> {
  await requireRole(["admin", "editor"]);

  const parsed = parseReadingPassageForm(formData);
  if (!parsed.success) {
    return { fieldErrors: parsed.error.flatten().fieldErrors as Record<string, string[]> };
  }

  const supabase = await createClient();
  const { error } = await supabase.from("reading_passages").insert({
    lesson_id: parsed.data.lessonId,
    passage_number: parsed.data.passageNumber,
    title: parsed.data.title,
    paragraphs: parsed.data.paragraphs,
  });

  if (error) {
    return { error: humanizeError(error) };
  }

  revalidatePath(`/admin/lessons/${parsed.data.lessonId}/edit`);
  updateTag(READING_PASSAGES_TAG);
  redirect(`/admin/lessons/${parsed.data.lessonId}/edit`);
}

export async function updateReadingPassage(
  _state: ReadingPassageFormState,
  formData: FormData,
): Promise<ReadingPassageFormState> {
  await requireRole(["admin", "editor"]);

  const id = String(formData.get("id") ?? "");
  if (!id) {
    return { error: "Missing passage id." };
  }

  const parsed = parseReadingPassageForm(formData);
  if (!parsed.success) {
    return { fieldErrors: parsed.error.flatten().fieldErrors as Record<string, string[]> };
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("reading_passages")
    .update({
      passage_number: parsed.data.passageNumber,
      title: parsed.data.title,
      paragraphs: parsed.data.paragraphs,
    })
    .eq("id", id);

  if (error) {
    return { error: humanizeError(error) };
  }

  revalidatePath(`/admin/lessons/${parsed.data.lessonId}/edit`);
  updateTag(READING_PASSAGES_TAG);
  redirect(`/admin/lessons/${parsed.data.lessonId}/edit`);
}

export async function deleteReadingPassage(formData: FormData) {
  await requireRole(["admin", "editor"]);
  const id = String(formData.get("id") ?? "");
  const lessonId = String(formData.get("lessonId") ?? "");
  if (!id) return;

  const supabase = await createClient();
  const { error } = await supabase.from("reading_passages").delete().eq("id", id);
  if (error) {
    throw new Error("Could not delete this passage.");
  }

  revalidatePath(`/admin/lessons/${lessonId}/edit`);
  updateTag(READING_PASSAGES_TAG);
}
