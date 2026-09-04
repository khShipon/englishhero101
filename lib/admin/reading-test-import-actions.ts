"use server";

import { redirect } from "next/navigation";
import { revalidatePath, updateTag } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { requireRole } from "@/lib/auth/dal";
import { EMPTY_LESSON_CONTENT } from "@/types/lesson-content";
import {
  readingTestImportSchema,
  expandPassageQuestions,
  type ExpandedQuestion,
} from "@/lib/admin/reading-test-import";
import { getIeltsReadingQuestionType } from "@/lib/admin/ielts-reading-question-types";

const LESSONS_TAG = "lessons";
const READING_PASSAGES_TAG = "reading-passages";
const QUESTION_SETS_TAG = "question-sets";
const QUESTIONS_TAG = "questions";

export type ImportReadingTestState =
  | {
      error?: string;
      issues?: string[];
    }
  | undefined;

type SupabaseClient = Awaited<ReturnType<typeof createClient>>;

async function insertExpandedQuestion(
  supabase: SupabaseClient,
  questionSetId: string,
  passageNumber: number,
  sortOrder: number,
  q: ExpandedQuestion,
) {
  const preset = getIeltsReadingQuestionType(q.ieltsType);
  const questionType = preset?.questionType ?? "short_answer";

  const metadata: Record<string, unknown> = {
    passage_number: passageNumber,
    ielts_question_type: q.ieltsType,
  };
  if (q.kind === "matching") {
    metadata.pairs = q.pairs;
  }

  const { data, error } = await supabase
    .from("questions")
    .insert({
      question_set_id: questionSetId,
      question_text: q.prompt,
      question_type: questionType,
      explanation: q.explanation,
      marks: q.marks,
      sort_order: sortOrder,
      correct_answer: q.kind === "fill" ? q.correctAnswer : null,
      metadata,
    })
    .select("id")
    .single();

  if (error || !data) {
    throw new Error(`Could not save question "${q.prompt.slice(0, 60)}": ${error?.message}`);
  }

  if (q.kind === "choice") {
    const rows = q.options.map((text, index) => ({
      question_id: data.id,
      option_text: text,
      is_correct: text.trim().toLowerCase() === q.correctOption.trim().toLowerCase(),
      sort_order: index,
    }));
    const { error: optionsError } = await supabase.from("question_options").insert(rows);
    if (optionsError) {
      throw new Error(`Could not save options for "${q.prompt.slice(0, 60)}": ${optionsError.message}`);
    }
  }
}

export async function importReadingTest(
  _state: ImportReadingTestState,
  formData: FormData,
): Promise<ImportReadingTestState> {
  await requireRole(["admin", "editor"]);

  const nodeId = String(formData.get("nodeId") ?? "");
  if (!nodeId) {
    return { error: "Choose a parent category." };
  }

  let raw: unknown;
  try {
    raw = JSON.parse(String(formData.get("payload") ?? ""));
  } catch {
    return { error: "That isn't valid JSON — check for a missing comma or bracket." };
  }

  const parsed = readingTestImportSchema.safeParse(raw);
  if (!parsed.success) {
    return {
      error: "The document doesn't match the expected format.",
      issues: parsed.error.issues.map((issue) => `${issue.path.join(".")}: ${issue.message}`).slice(0, 20),
    };
  }

  const passageNumbers = parsed.data.passages.map((p) => p.passageNumber);
  if (new Set(passageNumbers).size !== passageNumbers.length) {
    return { error: "Two passages share the same passageNumber — each must be unique." };
  }

  const expandedByPassage: { passageNumber: number; title: string; questions: ExpandedQuestion[] }[] = [];
  const allErrors: string[] = [];
  for (const passage of parsed.data.passages) {
    const { questions, errors } = expandPassageQuestions(passage);
    if (errors.length > 0) {
      allErrors.push(...errors.map((e) => `Passage ${e.passageNumber}: ${e.message}`));
    }
    expandedByPassage.push({ passageNumber: passage.passageNumber, title: passage.title, questions });
  }

  if (allErrors.length > 0) {
    return { error: "Some questions couldn't be understood — fix these and re-paste.", issues: allErrors };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { lesson } = parsed.data;
  const { data: lessonRow, error: lessonError } = await supabase
    .from("lessons")
    .insert({
      node_id: nodeId,
      title: lesson.title,
      slug: lesson.slug,
      excerpt: lesson.excerpt ?? null,
      content: EMPTY_LESSON_CONTENT,
      status: "draft",
      difficulty: lesson.difficulty ?? null,
      estimated_minutes: lesson.estimatedMinutes ?? null,
      author_id: user?.id ?? null,
      seo_title: lesson.seoTitle ?? null,
      seo_description: lesson.seoDescription ?? null,
    })
    .select("id")
    .single();

  if (lessonError || !lessonRow) {
    if (lessonError?.code === "23505") {
      return { error: "A lesson with this slug already exists under this category." };
    }
    return { error: `Could not create the lesson: ${lessonError?.message}` };
  }
  const lessonId = lessonRow.id;

  const { error: passagesError } = await supabase.from("reading_passages").insert(
    parsed.data.passages.map((p) => ({
      lesson_id: lessonId,
      passage_number: p.passageNumber,
      title: p.title,
      paragraphs: p.paragraphs,
    })),
  );
  if (passagesError) {
    return {
      error: `Lesson created, but saving passages failed: ${passagesError.message}. The lesson is saved as a draft — open it and add passages manually, or delete it and try again.`,
    };
  }

  const { data: questionSetRow, error: questionSetError } = await supabase
    .from("question_sets")
    .insert({ lesson_id: lessonId, title: `Practice: ${lesson.title}`, is_published: false })
    .select("id")
    .single();
  if (questionSetError || !questionSetRow) {
    return {
      error: `Lesson and passages created, but the practice set failed: ${questionSetError?.message}. Open the lesson and create it manually.`,
    };
  }
  const questionSetId = questionSetRow.id;

  let sortOrder = 0;
  try {
    for (const passage of expandedByPassage) {
      for (const question of passage.questions) {
        await insertExpandedQuestion(supabase, questionSetId, passage.passageNumber, sortOrder, question);
        sortOrder += 1;
      }
    }
  } catch (err) {
    return {
      error: `Lesson, passages, and the practice set were created, but saving questions stopped partway (${
        err instanceof Error ? err.message : "unknown error"
      }). Open the lesson to see what's there and finish adding the rest manually.`,
    };
  }

  revalidatePath(`/admin/content/${nodeId}/lessons`);
  revalidatePath(`/admin/lessons/${lessonId}/edit`);
  revalidatePath("/admin/ielts-reading");
  updateTag(LESSONS_TAG);
  updateTag(READING_PASSAGES_TAG);
  updateTag(QUESTION_SETS_TAG);
  updateTag(QUESTIONS_TAG);

  redirect(`/admin/lessons/${lessonId}/edit`);
}
