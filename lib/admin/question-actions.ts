"use server";

import { redirect } from "next/navigation";
import { revalidatePath, updateTag } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { requireRole } from "@/lib/auth/dal";
import { questionSchema, type StructuredData } from "@/lib/admin/question-validation";
import { parseCsv, MAX_CSV_SIZE_BYTES, type CsvImportState } from "@/lib/admin/csv-import";
import {
  validateQuestionCsvRow,
  MAX_QUESTIONS_CSV_ROWS,
  type QuestionCsvRowResult,
} from "@/lib/admin/question-csv";

// Matches the cacheTag() calls in lib/queries/question-banks.ts's
// public-site functions.
const QUESTIONS_TAG = "questions";

export type QuestionFormState =
  | {
      error?: string;
      fieldErrors?: Record<string, string[]>;
    }
  | undefined;

type PostgrestError = { code?: string; message: string };

function humanizeError(error: PostgrestError): string {
  if (error.code === "23503") {
    return "The question set no longer exists.";
  }
  return "Could not save this question. Please try again.";
}

function parseQuestionForm(formData: FormData) {
  return questionSchema.safeParse({
    questionText: formData.get("questionText"),
    questionType: formData.get("questionType"),
    explanation: formData.get("explanation") ?? "",
    marks: formData.get("marks") ?? "1",
    difficulty: formData.get("difficulty") ?? "none",
    correctAnswer: formData.get("correctAnswer") ?? "",
    structuredData: formData.get("structuredData") ?? "{}",
  });
}

type SupabaseClient = Awaited<ReturnType<typeof createClient>>;

// Options only apply to choice-style and ordering questions — matching
// stores its pairs on questions.metadata instead, and fill-in-blank /
// short-answer / written-answer use questions.correct_answer.
async function writeOptions(
  supabase: SupabaseClient,
  questionId: string,
  structuredData: StructuredData,
) {
  const { error: deleteError } = await supabase
    .from("question_options")
    .delete()
    .eq("question_id", questionId);
  if (deleteError) throw deleteError;

  if (
    structuredData.type === "multiple_choice" ||
    structuredData.type === "multiple_answer" ||
    structuredData.type === "true_false"
  ) {
    const rows = structuredData.options.map((option, index) => ({
      question_id: questionId,
      option_text: option.text,
      is_correct: option.isCorrect,
      sort_order: index,
    }));
    const { error } = await supabase.from("question_options").insert(rows);
    if (error) throw error;
  } else if (structuredData.type === "ordering") {
    const rows = structuredData.items.map((item, index) => ({
      question_id: questionId,
      option_text: item,
      is_correct: true,
      sort_order: index,
    }));
    const { error } = await supabase.from("question_options").insert(rows);
    if (error) throw error;
  }
}

function metadataFor(structuredData: StructuredData): Record<string, unknown> {
  return structuredData.type === "matching" ? { pairs: structuredData.pairs } : {};
}

function correctAnswerFor(structuredData: StructuredData, rawCorrectAnswer: string | null) {
  const usesCorrectAnswer =
    structuredData.type === "fill_in_blank" ||
    structuredData.type === "short_answer" ||
    structuredData.type === "written_answer";
  return usesCorrectAnswer ? rawCorrectAnswer : null;
}

export async function createQuestion(
  _state: QuestionFormState,
  formData: FormData,
): Promise<QuestionFormState> {
  await requireRole(["admin", "editor"]);

  const questionSetId = String(formData.get("questionSetId") ?? "");
  if (!questionSetId) {
    return { error: "Missing question set id." };
  }

  const parsed = parseQuestionForm(formData);
  if (!parsed.success) {
    return { fieldErrors: parsed.error.flatten().fieldErrors as Record<string, string[]> };
  }

  const supabase = await createClient();

  const { data: lastQuestion } = await supabase
    .from("questions")
    .select("sort_order")
    .eq("question_set_id", questionSetId)
    .order("sort_order", { ascending: false })
    .limit(1);
  const sortOrder = (lastQuestion?.[0]?.sort_order ?? -1) + 1;

  const { data, error } = await supabase
    .from("questions")
    .insert({
      question_set_id: questionSetId,
      question_text: parsed.data.questionText,
      question_type: parsed.data.questionType,
      explanation: parsed.data.explanation,
      marks: parsed.data.marks,
      difficulty: parsed.data.difficulty,
      sort_order: sortOrder,
      correct_answer: correctAnswerFor(parsed.data.structuredData, parsed.data.correctAnswer),
      metadata: metadataFor(parsed.data.structuredData),
    })
    .select("id")
    .single();

  if (error || !data) {
    return { error: humanizeError(error ?? { message: "insert returned no row" }) };
  }

  await writeOptions(supabase, data.id, parsed.data.structuredData);

  revalidatePath(`/admin/question-banks/${questionSetId}`);
  updateTag(QUESTIONS_TAG);
  redirect(`/admin/question-banks/${questionSetId}`);
}

export async function updateQuestion(
  _state: QuestionFormState,
  formData: FormData,
): Promise<QuestionFormState> {
  await requireRole(["admin", "editor"]);

  const id = String(formData.get("id") ?? "");
  const questionSetId = String(formData.get("questionSetId") ?? "");
  if (!id || !questionSetId) {
    return { error: "Missing question id." };
  }

  const parsed = parseQuestionForm(formData);
  if (!parsed.success) {
    return { fieldErrors: parsed.error.flatten().fieldErrors as Record<string, string[]> };
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("questions")
    .update({
      question_text: parsed.data.questionText,
      question_type: parsed.data.questionType,
      explanation: parsed.data.explanation,
      marks: parsed.data.marks,
      difficulty: parsed.data.difficulty,
      correct_answer: correctAnswerFor(parsed.data.structuredData, parsed.data.correctAnswer),
      metadata: metadataFor(parsed.data.structuredData),
    })
    .eq("id", id);

  if (error) {
    return { error: humanizeError(error) };
  }

  await writeOptions(supabase, id, parsed.data.structuredData);

  revalidatePath(`/admin/question-banks/${questionSetId}`);
  updateTag(QUESTIONS_TAG);
  redirect(`/admin/question-banks/${questionSetId}`);
}

export async function importQuestionsCsv(
  _state: CsvImportState,
  formData: FormData,
): Promise<CsvImportState> {
  await requireRole(["admin", "editor"]);

  const questionSetId = String(formData.get("questionSetId") ?? "");
  if (!questionSetId) {
    return { error: "Missing question set id." };
  }

  const file = formData.get("file");
  if (!(file instanceof File) || file.size === 0) {
    return { error: "Choose a CSV file to upload." };
  }
  if (file.size > MAX_CSV_SIZE_BYTES) {
    return { error: "File is too large (max 2MB)." };
  }

  const text = await file.text();
  const { rows, errors: parseErrors } = parseCsv(text);

  if (parseErrors.length > 0) {
    return { error: "Could not read this CSV file.", rowErrors: parseErrors };
  }
  if (rows.length === 0) {
    return { error: "No rows found in this file." };
  }
  if (rows.length > MAX_QUESTIONS_CSV_ROWS) {
    return { error: `Too many rows — max ${MAX_QUESTIONS_CSV_ROWS} per import.` };
  }

  const validated = rows.map((row, index) => validateQuestionCsvRow(row, index + 2));
  const failed = validated.filter(
    (result): result is Extract<QuestionCsvRowResult, { ok: false }> => !result.ok,
  );

  if (failed.length > 0) {
    return {
      error: `${failed.length} row(s) have errors. Fix them and re-upload.`,
      rowErrors: failed.map((result) => `Row ${result.row}: ${result.error}`),
    };
  }

  const validRows = validated.filter(
    (result): result is Extract<QuestionCsvRowResult, { ok: true }> => result.ok,
  );

  const supabase = await createClient();

  const { data: lastQuestion } = await supabase
    .from("questions")
    .select("sort_order")
    .eq("question_set_id", questionSetId)
    .order("sort_order", { ascending: false })
    .limit(1);
  const startingSortOrder = (lastQuestion?.[0]?.sort_order ?? -1) + 1;

  const { data: insertedQuestions, error: insertError } = await supabase
    .from("questions")
    .insert(
      validRows.map((r, index) => ({
        question_set_id: questionSetId,
        question_text: r.data.question_text,
        question_type: r.data.question_type,
        explanation: r.data.explanation,
        marks: r.data.marks,
        difficulty: r.data.difficulty,
        sort_order: startingSortOrder + index,
        correct_answer: r.data.correct_answer,
        metadata: {},
      })),
    )
    .select("id");

  if (insertError || !insertedQuestions) {
    return { error: "Import failed while saving questions. Please try again." };
  }

  const optionRows = validRows.flatMap((r, index) =>
    r.data.options.map((option, optionIndex) => ({
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
          "Questions were imported, but some answer options failed to save. Check the question set and fix any missing options manually.",
      };
    }
  }

  revalidatePath(`/admin/question-banks/${questionSetId}`);
  updateTag(QUESTIONS_TAG);
  redirect(`/admin/question-banks/${questionSetId}`);
}

export async function deleteQuestion(formData: FormData) {
  await requireRole(["admin", "editor"]);
  const id = String(formData.get("id") ?? "");
  const questionSetId = String(formData.get("questionSetId") ?? "");
  if (!id) return;

  const supabase = await createClient();
  const { error } = await supabase.from("questions").delete().eq("id", id);
  if (error) {
    throw new Error("Could not delete this question.");
  }

  revalidatePath(`/admin/question-banks/${questionSetId}`);
  updateTag(QUESTIONS_TAG);
}

export async function moveQuestion(formData: FormData) {
  await requireRole(["admin", "editor"]);
  const id = String(formData.get("id") ?? "");
  const questionSetId = String(formData.get("questionSetId") ?? "");
  const direction = formData.get("direction");
  if (!id || (direction !== "up" && direction !== "down")) return;

  const supabase = await createClient();
  const { data: question, error: questionError } = await supabase
    .from("questions")
    .select("id, question_set_id, sort_order")
    .eq("id", id)
    .single();

  if (questionError || !question) {
    throw new Error("Question not found.");
  }

  const base = supabase
    .from("questions")
    .select("id, sort_order")
    .eq("question_set_id", question.question_set_id)
    .neq("id", id);

  const { data: sibling } =
    direction === "up"
      ? await base
          .lt("sort_order", question.sort_order)
          .order("sort_order", { ascending: false })
          .limit(1)
          .maybeSingle()
      : await base
          .gt("sort_order", question.sort_order)
          .order("sort_order", { ascending: true })
          .limit(1)
          .maybeSingle();

  if (!sibling) return;

  const [{ error: err1 }, { error: err2 }] = await Promise.all([
    supabase.from("questions").update({ sort_order: sibling.sort_order }).eq("id", question.id),
    supabase.from("questions").update({ sort_order: question.sort_order }).eq("id", sibling.id),
  ]);

  if (err1 || err2) {
    throw new Error("Could not reorder questions.");
  }

  revalidatePath(`/admin/question-banks/${questionSetId}`);
  updateTag(QUESTIONS_TAG);
}
