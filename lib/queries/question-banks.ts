import "server-only";
import { cache } from "react";
import { cacheLife, cacheTag } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { createPublicClient } from "@/lib/supabase/public";
import type { QuestionType } from "@/lib/admin/question-validation";

const QUESTION_SETS_TAG = "question-sets";
const QUESTIONS_TAG = "questions";

export type QuestionSet = {
  id: string;
  nodeId: string | null;
  lessonId: string | null;
  title: string;
  description: string | null;
  examType: string | null;
  subject: string | null;
  year: number | null;
  board: string | null;
  difficulty: string | null;
  durationMinutes: number | null;
  marks: number | null;
  isPublished: boolean;
  createdAt: string;
  updatedAt: string;
};

export type QuestionOption = {
  id: string;
  questionId: string;
  optionText: string;
  isCorrect: boolean;
  sortOrder: number;
};

export type Question = {
  id: string;
  questionSetId: string;
  questionText: string;
  questionType: QuestionType;
  explanation: string | null;
  marks: number;
  difficulty: string | null;
  sortOrder: number;
  correctAnswer: string | null;
  metadata: Record<string, unknown>;
  options: QuestionOption[];
};

type QuestionSetRow = {
  id: string;
  node_id: string | null;
  lesson_id: string | null;
  title: string;
  description: string | null;
  exam_type: string | null;
  subject: string | null;
  year: number | null;
  board: string | null;
  difficulty: string | null;
  duration_minutes: number | null;
  marks: number | null;
  is_published: boolean;
  created_at: string;
  updated_at: string;
};

type QuestionRow = {
  id: string;
  question_set_id: string;
  question_text: string;
  question_type: string;
  explanation: string | null;
  marks: number;
  difficulty: string | null;
  sort_order: number;
  correct_answer: string | null;
  metadata: Record<string, unknown> | null;
};

type QuestionOptionRow = {
  id: string;
  question_id: string;
  option_text: string;
  is_correct: boolean;
  sort_order: number;
};

const QUESTION_SET_COLUMNS =
  "id, node_id, lesson_id, title, description, exam_type, subject, year, board, difficulty, duration_minutes, marks, is_published, created_at, updated_at";

function mapQuestionSet(row: QuestionSetRow): QuestionSet {
  return {
    id: row.id,
    nodeId: row.node_id,
    lessonId: row.lesson_id,
    title: row.title,
    description: row.description,
    examType: row.exam_type,
    subject: row.subject,
    year: row.year,
    board: row.board,
    difficulty: row.difficulty,
    durationMinutes: row.duration_minutes,
    marks: row.marks,
    isPublished: row.is_published,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export const getQuestionSets = cache(async (): Promise<QuestionSet[]> => {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("question_sets")
    .select(QUESTION_SET_COLUMNS)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return (data ?? []).map(mapQuestionSet);
});

// --- Public-site queries (explicitly published-only; see the note in
// lib/queries/lessons.ts about why this isn't left to RLS alone) ------

export async function getPublishedQuestionSetsByNode(nodeId: string): Promise<QuestionSet[]> {
  "use cache";
  cacheLife("hours");
  cacheTag(QUESTION_SETS_TAG);

  const supabase = createPublicClient();
  const { data, error } = await supabase
    .from("question_sets")
    .select(QUESTION_SET_COLUMNS)
    .eq("node_id", nodeId)
    .eq("is_published", true)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return (data ?? []).map(mapQuestionSet);
}

// This lesson's own dedicated practice exercise(s) — distinct from
// getPublishedQuestionSetsByNode, which returns every question set
// scoped to the shared topic node and so can't isolate one lesson's
// exercise when several lessons share a node (as the spoken-course
// levels do).
export async function getPublishedQuestionSetsByLesson(lessonId: string): Promise<QuestionSet[]> {
  "use cache";
  cacheLife("hours");
  cacheTag(QUESTION_SETS_TAG);

  const supabase = createPublicClient();
  const { data, error } = await supabase
    .from("question_sets")
    .select(QUESTION_SET_COLUMNS)
    .eq("lesson_id", lessonId)
    .eq("is_published", true)
    .order("created_at", { ascending: true });

  if (error) throw error;
  return (data ?? []).map(mapQuestionSet);
}

export async function getRecentPublishedQuestionSets(limit = 6): Promise<QuestionSet[]> {
  "use cache";
  cacheLife("hours");
  cacheTag(QUESTION_SETS_TAG);

  const supabase = createPublicClient();
  const { data, error } = await supabase
    .from("question_sets")
    .select(QUESTION_SET_COLUMNS)
    .eq("is_published", true)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) throw error;
  return (data ?? []).map(mapQuestionSet);
}

export type QuestionSetSearchFilters = {
  examType?: string;
  board?: string;
  subject?: string;
  year?: number;
  query?: string;
  limit?: number;
};

// Backs the public /question-banks browse page and its board/year/
// subject filters — a board exam paper is just a question set with
// exam_type/board/subject/year filled in, so this is plain conditional
// filtering, no new schema. Filters are exact-match (board/exam type/
// year are picked from a fixed list on the page, not free text) except
// `query`, which is a title search like the other public queries here.
export async function searchPublishedQuestionSets(
  filters: QuestionSetSearchFilters = {},
): Promise<QuestionSet[]> {
  "use cache";
  cacheLife("hours");
  cacheTag(QUESTION_SETS_TAG);

  const supabase = createPublicClient();
  let queryBuilder = supabase
    .from("question_sets")
    .select(QUESTION_SET_COLUMNS)
    .eq("is_published", true);

  if (filters.examType) queryBuilder = queryBuilder.eq("exam_type", filters.examType);
  if (filters.board) queryBuilder = queryBuilder.eq("board", filters.board);
  if (filters.subject) queryBuilder = queryBuilder.eq("subject", filters.subject);
  if (filters.year) queryBuilder = queryBuilder.eq("year", filters.year);
  if (filters.query?.trim()) queryBuilder = queryBuilder.ilike("title", `%${filters.query.trim()}%`);

  const { data, error } = await queryBuilder
    .order("year", { ascending: false })
    .order("created_at", { ascending: false })
    .limit(filters.limit ?? 60);

  if (error) throw error;
  return (data ?? []).map(mapQuestionSet);
}

export type QuestionBankFilterOptions = {
  examTypes: string[];
  boards: string[];
  subjects: string[];
  years: number[];
};

// Distinct filter values actually present in published question sets
// — drives the filter dropdowns on /question-banks so options never
// go stale against a hardcoded list as admins add more board papers.
export async function getQuestionBankFilterOptions(): Promise<QuestionBankFilterOptions> {
  "use cache";
  cacheLife("hours");
  cacheTag(QUESTION_SETS_TAG);

  const supabase = createPublicClient();
  const { data, error } = await supabase
    .from("question_sets")
    .select("exam_type, board, subject, year")
    .eq("is_published", true);

  if (error) throw error;

  const rows = (data ?? []) as Pick<QuestionSetRow, "exam_type" | "board" | "subject" | "year">[];
  const uniqueSorted = (values: (string | null)[]) =>
    Array.from(new Set(values.filter((v): v is string => !!v))).sort();

  return {
    examTypes: uniqueSorted(rows.map((r) => r.exam_type)),
    boards: uniqueSorted(rows.map((r) => r.board)),
    subjects: uniqueSorted(rows.map((r) => r.subject)),
    years: Array.from(new Set(rows.map((r) => r.year).filter((y): y is number => !!y))).sort(
      (a, b) => b - a,
    ),
  };
}

// Admin-shared lookup (drafts included, relies on the caller's own RLS
// access) — used by both the admin editor and, after an explicit
// is_published check, by the public page's generateMetadata.
// Admin-scoped lookup of a lesson's own linked question set(s) (drafts
// included) — used by the reading-passages admin panel to show
// "manage practice set" instead of "create practice set" once one
// exists, mirroring the lessonId scoping on the public-site
// getPublishedQuestionSetsByLesson above.
export const getQuestionSetsByLesson = cache(async (lessonId: string): Promise<QuestionSet[]> => {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("question_sets")
    .select(QUESTION_SET_COLUMNS)
    .eq("lesson_id", lessonId)
    .order("created_at", { ascending: true });

  if (error) throw error;
  return (data ?? []).map(mapQuestionSet);
});

export const getQuestionSetById = cache(async (id: string): Promise<QuestionSet | null> => {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("question_sets")
    .select(QUESTION_SET_COLUMNS)
    .eq("id", id)
    .maybeSingle();

  if (error) throw error;
  return data ? mapQuestionSet(data) : null;
});

// Public-site version — anon-scoped and cacheable, for the public quiz
// page itself (as opposed to its generateMetadata, which still needs
// to work for an admin previewing an unpublished set's URL).
export async function getPublishedQuestionSetById(id: string): Promise<QuestionSet | null> {
  "use cache";
  cacheLife("hours");
  cacheTag(QUESTION_SETS_TAG);

  const supabase = createPublicClient();
  const { data, error } = await supabase
    .from("question_sets")
    .select(QUESTION_SET_COLUMNS)
    .eq("id", id)
    .eq("is_published", true)
    .maybeSingle();

  if (error) throw error;
  return data ? mapQuestionSet(data) : null;
}

export const getQuestionsBySet = cache(async (questionSetId: string): Promise<Question[]> => {
  const supabase = await createClient();
  const [{ data: questions, error: questionsError }, { data: options, error: optionsError }] =
    await Promise.all([
      supabase
        .from("questions")
        .select(
          "id, question_set_id, question_text, question_type, explanation, marks, difficulty, sort_order, correct_answer, metadata",
        )
        .eq("question_set_id", questionSetId)
        .order("sort_order"),
      supabase
        .from("question_options")
        .select("id, question_id, option_text, is_correct, sort_order")
        .order("sort_order"),
    ]);

  if (questionsError) throw questionsError;
  if (optionsError) throw optionsError;

  const optionsByQuestion = new Map<string, QuestionOptionRow[]>();
  for (const option of (options ?? []) as QuestionOptionRow[]) {
    const list = optionsByQuestion.get(option.question_id) ?? [];
    list.push(option);
    optionsByQuestion.set(option.question_id, list);
  }

  return ((questions ?? []) as QuestionRow[]).map((row) => ({
    id: row.id,
    questionSetId: row.question_set_id,
    questionText: row.question_text,
    questionType: row.question_type as QuestionType,
    explanation: row.explanation,
    marks: row.marks,
    difficulty: row.difficulty,
    sortOrder: row.sort_order,
    correctAnswer: row.correct_answer,
    metadata: row.metadata ?? {},
    options: (optionsByQuestion.get(row.id) ?? []).map((option) => ({
      id: option.id,
      questionId: option.question_id,
      optionText: option.option_text,
      isCorrect: option.is_correct,
      sortOrder: option.sort_order,
    })),
  }));
});

// Public-site version of getQuestionsBySet — anon-scoped (RLS only
// exposes rows for published sets), and filters question_options down
// to this set's own questions instead of fetching every option row in
// the table.
async function getPublishedQuestionsBySet(questionSetId: string): Promise<Question[]> {
  "use cache";
  cacheLife("hours");
  cacheTag(QUESTIONS_TAG);

  const supabase = createPublicClient();
  const { data: questions, error: questionsError } = await supabase
    .from("questions")
    .select(
      "id, question_set_id, question_text, question_type, explanation, marks, difficulty, sort_order, correct_answer, metadata",
    )
    .eq("question_set_id", questionSetId)
    .order("sort_order");

  if (questionsError) throw questionsError;

  const questionIds = ((questions ?? []) as QuestionRow[]).map((row) => row.id);
  let options: QuestionOptionRow[] = [];
  if (questionIds.length > 0) {
    const { data, error: optionsError } = await supabase
      .from("question_options")
      .select("id, question_id, option_text, is_correct, sort_order")
      .in("question_id", questionIds)
      .order("sort_order");
    if (optionsError) throw optionsError;
    options = (data ?? []) as QuestionOptionRow[];
  }

  const optionsByQuestion = new Map<string, QuestionOptionRow[]>();
  for (const option of (options ?? []) as QuestionOptionRow[]) {
    const list = optionsByQuestion.get(option.question_id) ?? [];
    list.push(option);
    optionsByQuestion.set(option.question_id, list);
  }

  return ((questions ?? []) as QuestionRow[]).map((row) => ({
    id: row.id,
    questionSetId: row.question_set_id,
    questionText: row.question_text,
    questionType: row.question_type as QuestionType,
    explanation: row.explanation,
    marks: row.marks,
    difficulty: row.difficulty,
    sortOrder: row.sort_order,
    correctAnswer: row.correct_answer,
    metadata: row.metadata ?? {},
    options: (optionsByQuestion.get(row.id) ?? []).map((option) => ({
      id: option.id,
      questionId: option.question_id,
      optionText: option.option_text,
      isCorrect: option.is_correct,
      sortOrder: option.sort_order,
    })),
  }));
}

// --- Client-safe view (Phase 11 interactive quiz) -------------------
// Everything below strips the answer key (is_correct, correct_answer,
// metadata.pairs, and the sort_order that IS the answer for "ordering"
// questions) before this data is ever allowed to reach a Client
// Component's props. The grading Server Action re-fetches the full
// Question server-side and never returns the raw key either — only
// per-field "correct" values for review, after a submission exists.

export type MatchingPair = { left: string; right: string };

export function getMatchingPairs(question: Question): MatchingPair[] {
  const pairs = (question.metadata as { pairs?: unknown } | null)?.pairs;
  if (!Array.isArray(pairs)) return [];
  return pairs.filter(
    (pair): pair is MatchingPair =>
      typeof pair === "object" &&
      pair !== null &&
      typeof (pair as Record<string, unknown>).left === "string" &&
      typeof (pair as Record<string, unknown>).right === "string",
  );
}

function shuffle<T>(items: T[]): T[] {
  const result = [...items];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

export type SanitizedOption = { id: string; optionText: string };

export type SanitizedQuestion = {
  id: string;
  questionText: string;
  questionType: QuestionType;
  marks: number;
  options: SanitizedOption[];
  matchingLeft: string[];
  matchingRight: string[];
  // Which reading passage this question belongs to (reading-test
  // questions only, tagged via metadata.passage_number) -- lets the
  // split-screen practice UI show a question next to its own passage.
  passageNumber: number | null;
};

export function sanitizeQuestion(question: Question): SanitizedQuestion {
  const matchingPairs = getMatchingPairs(question);
  const rawPassageNumber = (question.metadata as { passage_number?: unknown } | null)?.passage_number;
  return {
    id: question.id,
    questionText: question.questionText,
    questionType: question.questionType,
    marks: question.marks,
    options: shuffle(question.options.map((option) => ({ id: option.id, optionText: option.optionText }))),
    matchingLeft: matchingPairs.map((pair) => pair.left),
    matchingRight: shuffle(matchingPairs.map((pair) => pair.right)),
    passageNumber: typeof rawPassageNumber === "number" ? rawPassageNumber : null,
  };
}

// Cached as a whole, including the shuffle — Math.random() is only
// allowed inside a "use cache" scope because the result gets cached
// along with everything else, so the shuffled order is stable for a
// cache window (see cacheLife("hours") above) rather than reshuffled
// on literally every visit. That's an acceptable trade for not having
// to carve this into its own request-time-only sliver.
export async function getSanitizedQuestionsBySet(questionSetId: string): Promise<SanitizedQuestion[]> {
  "use cache";
  cacheLife("hours");
  cacheTag(QUESTIONS_TAG);

  const questions = await getPublishedQuestionsBySet(questionSetId);
  return [...questions].sort((a, b) => a.sortOrder - b.sortOrder).map(sanitizeQuestion);
}

export const getQuestionById = cache(async (id: string): Promise<Question | null> => {
  const supabase = await createClient();
  const { data: row, error } = await supabase
    .from("questions")
    .select(
      "id, question_set_id, question_text, question_type, explanation, marks, difficulty, sort_order, correct_answer, metadata",
    )
    .eq("id", id)
    .maybeSingle();

  if (error) throw error;
  if (!row) return null;

  const { data: options, error: optionsError } = await supabase
    .from("question_options")
    .select("id, question_id, option_text, is_correct, sort_order")
    .eq("question_id", id)
    .order("sort_order");

  if (optionsError) throw optionsError;

  const typedRow = row as QuestionRow;
  return {
    id: typedRow.id,
    questionSetId: typedRow.question_set_id,
    questionText: typedRow.question_text,
    questionType: typedRow.question_type as QuestionType,
    explanation: typedRow.explanation,
    marks: typedRow.marks,
    difficulty: typedRow.difficulty,
    sortOrder: typedRow.sort_order,
    correctAnswer: typedRow.correct_answer,
    metadata: typedRow.metadata ?? {},
    options: ((options ?? []) as QuestionOptionRow[]).map((option) => ({
      id: option.id,
      questionId: option.question_id,
      optionText: option.option_text,
      isCorrect: option.is_correct,
      sortOrder: option.sort_order,
    })),
  };
});
