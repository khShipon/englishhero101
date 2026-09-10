import { QUESTION_TYPES, type QuestionType } from "@/lib/admin/question-validation";

// Bulk "create a whole question set" import: one JSON document = one
// question set plus all of its questions, so an admin can generate a
// full practice test with an AI model instead of clicking through the
// question editor one question at a time. Unlike the per-set CSV
// import (question-csv.ts), this also supports "matching" questions,
// since JSON isn't limited to flat columns.

export const MAX_QUESTION_SET_IMPORT_QUESTIONS = 300;

const DIFFICULTIES = ["beginner", "intermediate", "advanced"] as const;
type Difficulty = (typeof DIFFICULTIES)[number];

export const QUESTION_SET_JSON_TEMPLATE = JSON.stringify(
  {
    set: {
      title: "Grammar Practice: Tenses",
      category: "grammar/tenses",
      description: "A short practice set covering the present, past, and future tenses.",
      examType: "",
      subject: "",
      board: "",
      year: null,
      difficulty: "beginner",
      durationMinutes: 15,
      marks: null,
      isPublished: false,
    },
    questions: [
      {
        questionText: "She ___ to school every day.",
        questionType: "multiple_choice",
        options: [
          { text: "goes", isCorrect: true },
          { text: "go", isCorrect: false },
          { text: "going", isCorrect: false },
          { text: "gone", isCorrect: false },
        ],
        explanation: "Third-person singular present simple takes -s/-es.",
        marks: 1,
      },
      {
        questionText: "Which are prime numbers?",
        questionType: "multiple_answer",
        options: [
          { text: "2", isCorrect: true },
          { text: "3", isCorrect: true },
          { text: "4", isCorrect: false },
          { text: "9", isCorrect: false },
        ],
        marks: 2,
      },
      {
        questionText: "The sun rises in the east.",
        questionType: "true_false",
        options: [
          { text: "True", isCorrect: true },
          { text: "False", isCorrect: false },
        ],
      },
      {
        questionText: "The capital of Bangladesh is ___.",
        questionType: "fill_in_blank",
        correctAnswer: "Dhaka",
      },
      {
        questionText: "Put these words in the correct order.",
        questionType: "ordering",
        items: ["She", "is", "always", "late"],
      },
      {
        questionText: "Match each tense to its example.",
        questionType: "matching",
        pairs: [
          { left: "Present simple", right: "She walks to school." },
          { left: "Past simple", right: "She walked to school." },
        ],
      },
    ],
  },
  null,
  2,
);

export type QuestionSetImportMeta = {
  title: string;
  category: string | null;
  description: string | null;
  examType: string | null;
  subject: string | null;
  board: string | null;
  year: number | null;
  difficulty: Difficulty | null;
  durationMinutes: number | null;
  marks: number | null;
  isPublished: boolean;
};

export type QuestionSetMetaResult =
  | { ok: true; data: QuestionSetImportMeta }
  | { ok: false; error: string };

function trimmedOrUndefined(value: unknown): string | undefined {
  if (value === undefined || value === null) return undefined;
  return String(value).trim();
}

export function validateQuestionSetMeta(raw: unknown): QuestionSetMetaResult {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) {
    return { ok: false, error: "'set' must be an object with question set fields." };
  }
  const r = raw as Record<string, unknown>;

  const title = trimmedOrUndefined(r.title) ?? "";
  if (!title) return { ok: false, error: "'set.title' is required." };
  if (title.length > 200) return { ok: false, error: "'set.title' is too long (max 200 characters)." };

  const category = trimmedOrUndefined(r.category) || null;

  const description = trimmedOrUndefined(r.description) || null;
  if (description && description.length > 1000) {
    return { ok: false, error: "'set.description' is too long (max 1000 characters)." };
  }

  const examType = trimmedOrUndefined(r.examType) || null;
  const subject = trimmedOrUndefined(r.subject) || null;
  const board = trimmedOrUndefined(r.board) || null;

  let year: number | null = null;
  if (r.year !== undefined && r.year !== null && r.year !== "") {
    const n = typeof r.year === "number" ? r.year : Number(r.year);
    if (!Number.isFinite(n) || !Number.isInteger(n) || n < 1900 || n > 2200) {
      return { ok: false, error: `'set.year' must be a whole number between 1900 and 2200 (got "${r.year}").` };
    }
    year = n;
  }

  let difficulty: Difficulty | null = null;
  const difficultyRaw = trimmedOrUndefined(r.difficulty)?.toLowerCase();
  if (difficultyRaw) {
    if (!DIFFICULTIES.includes(difficultyRaw as Difficulty)) {
      return { ok: false, error: `'set.difficulty' must be beginner, intermediate, advanced, or blank (got "${difficultyRaw}").` };
    }
    difficulty = difficultyRaw as Difficulty;
  }

  let durationMinutes: number | null = null;
  if (r.durationMinutes !== undefined && r.durationMinutes !== null && r.durationMinutes !== "") {
    const n = typeof r.durationMinutes === "number" ? r.durationMinutes : Number(r.durationMinutes);
    if (!Number.isFinite(n) || !Number.isInteger(n) || n <= 0 || n > 600) {
      return { ok: false, error: `'set.durationMinutes' must be a whole number between 1 and 600 (got "${r.durationMinutes}").` };
    }
    durationMinutes = n;
  }

  let marks: number | null = null;
  if (r.marks !== undefined && r.marks !== null && r.marks !== "") {
    const n = typeof r.marks === "number" ? r.marks : Number(r.marks);
    if (!Number.isFinite(n) || n <= 0 || n > 1000) {
      return { ok: false, error: `'set.marks' must be a positive number up to 1000 (got "${r.marks}").` };
    }
    marks = n;
  }

  const isPublished = r.isPublished === true;

  return {
    ok: true,
    data: {
      title,
      category,
      description,
      examType,
      subject,
      board,
      year,
      difficulty,
      durationMinutes,
      marks,
      isPublished,
    },
  };
}

export type QuestionSetImportQuestion = {
  question_text: string;
  question_type: QuestionType;
  explanation: string | null;
  marks: number;
  difficulty: Difficulty | null;
  correct_answer: string | null;
  metadata: Record<string, unknown>;
  options: { text: string; isCorrect: boolean }[];
};

export type QuestionSetImportQuestionResult =
  | { ok: true; label: string; data: QuestionSetImportQuestion }
  | { ok: false; label: string; error: string };

export function validateQuestionSetImportQuestion(raw: unknown, index: number): QuestionSetImportQuestionResult {
  const label = `Question ${index + 1}`;
  const fail = (error: string): QuestionSetImportQuestionResult => ({ ok: false, label, error });

  if (!raw || typeof raw !== "object" || Array.isArray(raw)) {
    return fail("Expected an object with question fields.");
  }
  const r = raw as Record<string, unknown>;

  const questionText = trimmedOrUndefined(r.questionText) ?? "";
  if (!questionText) return fail("'questionText' is required.");
  if (questionText.length > 2000) return fail("'questionText' is too long (max 2000 characters).");

  const questionType = trimmedOrUndefined(r.questionType)?.toLowerCase() as QuestionType | undefined;
  if (!questionType || !QUESTION_TYPES.includes(questionType)) {
    return fail(`'questionType' must be one of: ${QUESTION_TYPES.join(", ")} (got "${r.questionType}").`);
  }

  let marks = 1;
  if (r.marks !== undefined && r.marks !== null && r.marks !== "") {
    const n = typeof r.marks === "number" ? r.marks : Number(r.marks);
    if (!Number.isFinite(n) || n <= 0 || n > 100) {
      return fail(`'marks' must be a positive number up to 100 (got "${r.marks}").`);
    }
    marks = n;
  }

  let difficulty: Difficulty | null = null;
  const difficultyRaw = trimmedOrUndefined(r.difficulty)?.toLowerCase();
  if (difficultyRaw) {
    if (!DIFFICULTIES.includes(difficultyRaw as Difficulty)) {
      return fail(`'difficulty' must be beginner, intermediate, advanced, or blank (got "${difficultyRaw}").`);
    }
    difficulty = difficultyRaw as Difficulty;
  }

  const explanation = trimmedOrUndefined(r.explanation) || null;
  if (explanation && explanation.length > 2000) return fail("'explanation' is too long (max 2000 characters).");

  if (questionType === "multiple_choice" || questionType === "multiple_answer" || questionType === "true_false") {
    if (!Array.isArray(r.options) || r.options.length < 2) {
      return fail(`'${questionType}' needs an 'options' array with at least 2 entries.`);
    }
    const options = r.options.map((o) => {
      const text = o && typeof o === "object" ? trimmedOrUndefined((o as Record<string, unknown>).text) : undefined;
      const isCorrect = o && typeof o === "object" ? (o as Record<string, unknown>).isCorrect === true : false;
      return { text: text ?? "", isCorrect };
    });
    if (options.some((o) => !o.text)) {
      return fail("Every option needs a non-empty 'text'.");
    }
    const correctCount = options.filter((o) => o.isCorrect).length;
    if (correctCount === 0) {
      return fail("At least one option needs \"isCorrect\": true.");
    }
    if (questionType === "multiple_choice" && correctCount > 1) {
      return fail("multiple_choice takes exactly one correct option.");
    }
    return {
      ok: true,
      label,
      data: {
        question_text: questionText,
        question_type: questionType,
        explanation,
        marks,
        difficulty,
        correct_answer: null,
        metadata: {},
        options,
      },
    };
  }

  if (questionType === "ordering") {
    if (!Array.isArray(r.items) || r.items.length < 2) {
      return fail("'ordering' needs an 'items' array (in the correct order) with at least 2 entries.");
    }
    const items = r.items.map((item) => (typeof item === "string" ? item.trim() : ""));
    if (items.some((item) => !item)) {
      return fail("Every item in 'items' must be non-empty text.");
    }
    return {
      ok: true,
      label,
      data: {
        question_text: questionText,
        question_type: questionType,
        explanation,
        marks,
        difficulty,
        correct_answer: null,
        metadata: {},
        options: items.map((text) => ({ text, isCorrect: true })),
      },
    };
  }

  if (questionType === "matching") {
    if (!Array.isArray(r.pairs) || r.pairs.length < 1) {
      return fail("'matching' needs a 'pairs' array with at least 1 entry.");
    }
    const pairs = r.pairs.map((p) => {
      const left = p && typeof p === "object" ? trimmedOrUndefined((p as Record<string, unknown>).left) : undefined;
      const right = p && typeof p === "object" ? trimmedOrUndefined((p as Record<string, unknown>).right) : undefined;
      return { left: left ?? "", right: right ?? "" };
    });
    if (pairs.some((p) => !p.left || !p.right)) {
      return fail("Every pair needs non-empty 'left' and 'right' text.");
    }
    return {
      ok: true,
      label,
      data: {
        question_text: questionText,
        question_type: questionType,
        explanation,
        marks,
        difficulty,
        correct_answer: null,
        metadata: { pairs },
        options: [],
      },
    };
  }

  // fill_in_blank / short_answer / written_answer
  const correctAnswer = trimmedOrUndefined(r.correctAnswer) || null;
  if (!correctAnswer) {
    return fail(`'${questionType}' needs a non-empty 'correctAnswer'.`);
  }
  return {
    ok: true,
    label,
    data: {
      question_text: questionText,
      question_type: questionType,
      explanation,
      marks,
      difficulty,
      correct_answer: correctAnswer,
      metadata: {},
      options: [],
    },
  };
}
