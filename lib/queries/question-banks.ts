import "server-only";
import { cache } from "react";
import { createClient } from "@/lib/supabase/server";
import type { QuestionType } from "@/lib/admin/question-validation";

export type QuestionSet = {
  id: string;
  nodeId: string | null;
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
  "id, node_id, title, description, exam_type, subject, year, board, difficulty, duration_minutes, marks, is_published, created_at, updated_at";

function mapQuestionSet(row: QuestionSetRow): QuestionSet {
  return {
    id: row.id,
    nodeId: row.node_id,
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

export const getPublishedQuestionSetsByNode = cache(
  async (nodeId: string): Promise<QuestionSet[]> => {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("question_sets")
      .select(QUESTION_SET_COLUMNS)
      .eq("node_id", nodeId)
      .eq("is_published", true)
      .order("created_at", { ascending: false });

    if (error) throw error;
    return (data ?? []).map(mapQuestionSet);
  },
);

export const getRecentPublishedQuestionSets = cache(async (limit = 6): Promise<QuestionSet[]> => {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("question_sets")
    .select(QUESTION_SET_COLUMNS)
    .eq("is_published", true)
    .order("created_at", { ascending: false })
    .limit(limit);

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
