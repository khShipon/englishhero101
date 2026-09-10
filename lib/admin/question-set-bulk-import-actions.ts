"use server";

import { redirect } from "next/navigation";
import { revalidatePath, updateTag } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { requireRole } from "@/lib/auth/dal";
import { getNodeBySlugPath } from "@/lib/queries/content";
import {
  validateQuestionSetMeta,
  validateQuestionSetImportQuestion,
  MAX_QUESTION_SET_IMPORT_QUESTIONS,
  type QuestionSetImportQuestionResult,
} from "@/lib/admin/question-set-bulk-import";

// Matches the cacheTag() calls in lib/queries/question-banks.ts's
// public-site functions.
const QUESTION_SETS_TAG = "question-sets";
const QUESTIONS_TAG = "questions";

export type QuestionSetImportState =
  | {
      error?: string;
      issues?: string[];
    }
  | undefined;

export async function importQuestionSet(
  _state: QuestionSetImportState,
  formData: FormData,
): Promise<QuestionSetImportState> {
  await requireRole(["admin", "editor"]);

  let raw: unknown;
  try {
    raw = JSON.parse(String(formData.get("payload") ?? ""));
  } catch {
    return { error: "That isn't valid JSON — check for a missing comma or bracket." };
  }

  if (!raw || typeof raw !== "object" || Array.isArray(raw)) {
    return { error: "Expected an object with \"set\" and \"questions\"." };
  }
  const document = raw as Record<string, unknown>;

  const metaResult = validateQuestionSetMeta(document.set);
  if (!metaResult.ok) {
    return { error: metaResult.error };
  }

  if (!Array.isArray(document.questions) || document.questions.length === 0) {
    return { error: "\"questions\" must be a non-empty array." };
  }
  if (document.questions.length > MAX_QUESTION_SET_IMPORT_QUESTIONS) {
    return { error: `Too many questions — max ${MAX_QUESTION_SET_IMPORT_QUESTIONS} per import.` };
  }

  const validated = document.questions.map((q, index) => validateQuestionSetImportQuestion(q, index));
  const failed = validated.filter(
    (result): result is Extract<QuestionSetImportQuestionResult, { ok: false }> => !result.ok,
  );
  if (failed.length > 0) {
    return {
      error: "Some questions couldn't be understood — fix these and re-import.",
      issues: failed.map((result) => `${result.label}: ${result.error}`),
    };
  }
  const questions = validated.filter(
    (result): result is Extract<QuestionSetImportQuestionResult, { ok: true }> => result.ok,
  );

  let nodeId: string | null = null;
  if (metaResult.data.category) {
    const node = await getNodeBySlugPath(metaResult.data.category.split("/").filter(Boolean));
    if (!node) {
      return { error: `"${metaResult.data.category}" doesn't match an existing category.` };
    }
    nodeId = node.id;
  }

  const supabase = await createClient();
  const { data: setRow, error: setError } = await supabase
    .from("question_sets")
    .insert({
      node_id: nodeId,
      title: metaResult.data.title,
      description: metaResult.data.description,
      exam_type: metaResult.data.examType,
      subject: metaResult.data.subject,
      board: metaResult.data.board,
      year: metaResult.data.year,
      difficulty: metaResult.data.difficulty,
      duration_minutes: metaResult.data.durationMinutes,
      marks: metaResult.data.marks,
      is_published: metaResult.data.isPublished,
    })
    .select("id")
    .single();

  if (setError || !setRow) {
    return { error: `Could not create the question set: ${setError?.message ?? "unknown error"}` };
  }
  const questionSetId = setRow.id;

  const { data: insertedQuestions, error: questionsError } = await supabase
    .from("questions")
    .insert(
      questions.map((q, index) => ({
        question_set_id: questionSetId,
        question_text: q.data.question_text,
        question_type: q.data.question_type,
        explanation: q.data.explanation,
        marks: q.data.marks,
        difficulty: q.data.difficulty,
        sort_order: index,
        correct_answer: q.data.correct_answer,
        metadata: q.data.metadata,
      })),
    )
    .select("id");

  if (questionsError || !insertedQuestions) {
    return {
      error: `The question set was created, but saving questions failed: ${
        questionsError?.message ?? "unknown error"
      }. Open the set and add questions manually, or delete it and try again.`,
    };
  }

  const optionRows = questions.flatMap((q, index) =>
    q.data.options.map((option, optionIndex) => ({
      question_id: insertedQuestions[index].id,
      option_text: option.text,
      is_correct: option.isCorrect,
      sort_order: optionIndex,
    })),
  );

  if (optionRows.length > 0) {
    const { error: optionsError } = await supabase.from("question_options").insert(optionRows);
    if (optionsError) {
      return {
        error:
          "The question set and questions were created, but some answer options failed to save. Open the set and check each question's options.",
      };
    }
  }

  revalidatePath("/admin/question-banks");
  revalidatePath(`/admin/question-banks/${questionSetId}`);
  updateTag(QUESTION_SETS_TAG);
  updateTag(QUESTIONS_TAG);

  redirect(`/admin/question-banks/${questionSetId}`);
}
