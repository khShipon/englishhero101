import { splitMultiValue, type CsvRow } from "@/lib/admin/csv-import";

export const MAX_QUESTIONS_CSV_ROWS = 300;

// "matching" needs paired left/right values that don't map cleanly
// onto flat CSV columns — left out of CSV import on purpose, add those
// by hand in the editor.
export const QUESTION_CSV_TYPES = [
  "multiple_choice",
  "multiple_answer",
  "true_false",
  "fill_in_blank",
  "short_answer",
  "written_answer",
  "ordering",
] as const;

export type QuestionCsvType = (typeof QUESTION_CSV_TYPES)[number];

const OPTION_COLUMNS = ["option_1", "option_2", "option_3", "option_4", "option_5", "option_6"] as const;

export const QUESTIONS_CSV_TEMPLATE = `question_text,question_type,option_1,option_2,option_3,option_4,option_5,option_6,correct_options,correct_answer,explanation,marks,difficulty
She ___ to school every day.,multiple_choice,goes,go,going,gone,,,1,,Third-person singular present simple takes -s/-es.,1,beginner
Which are prime numbers?,multiple_answer,2,3,4,9,,,1;2,,2 and 3 are prime; 4 and 9 are not.,2,intermediate
The sun rises in the east.,true_false,,,,,,,,true,General knowledge fact.,1,beginner
The capital of Bangladesh is ___.,fill_in_blank,,,,,,,,Dhaka,,1,beginner
Put these words in order: always / she / late / is,ordering,she,is,always,late,,,,,Subject + verb + adverb + adjective.,1,intermediate
`;

export type QuestionCsvOption = { text: string; isCorrect: boolean };

export type QuestionCsvInsert = {
  question_text: string;
  question_type: QuestionCsvType;
  explanation: string | null;
  marks: number;
  difficulty: string | null;
  correct_answer: string | null;
  options: QuestionCsvOption[];
};

export type QuestionCsvRowResult =
  | { ok: true; data: QuestionCsvInsert }
  | { ok: false; row: number; error: string };

const orNull = (value: string | undefined) => (value && value.trim() !== "" ? value.trim() : null);

export function validateQuestionCsvRow(row: CsvRow, rowNumber: number): QuestionCsvRowResult {
  const questionText = row.question_text?.trim();
  if (!questionText) {
    return { row: rowNumber, ok: false, error: "Missing required 'question_text' value." };
  }
  if (questionText.length > 2000) {
    return { row: rowNumber, ok: false, error: "'question_text' is too long (max 2000 characters)." };
  }

  const questionType = row.question_type?.trim().toLowerCase() as QuestionCsvType | undefined;
  if (!questionType || !QUESTION_CSV_TYPES.includes(questionType)) {
    return {
      row: rowNumber,
      ok: false,
      error: `'question_type' must be one of: ${QUESTION_CSV_TYPES.join(", ")} (got "${row.question_type}"). Note: "matching" isn't supported via CSV — add it in the editor.`,
    };
  }

  let marks = 1;
  if (row.marks?.trim()) {
    const parsedMarks = Number(row.marks);
    if (!Number.isFinite(parsedMarks) || parsedMarks <= 0) {
      return { row: rowNumber, ok: false, error: `'marks' must be a positive number (got "${row.marks}").` };
    }
    marks = parsedMarks;
  }

  const difficultyRaw = row.difficulty?.trim().toLowerCase();
  if (difficultyRaw && !["beginner", "intermediate", "advanced"].includes(difficultyRaw)) {
    return {
      row: rowNumber,
      ok: false,
      error: `'difficulty' must be beginner, intermediate, advanced, or blank (got "${row.difficulty}").`,
    };
  }
  const difficulty = difficultyRaw || null;

  const optionTexts = OPTION_COLUMNS.map((col) => row[col]?.trim() || "").filter((v) => v.length > 0);

  if (questionType === "multiple_choice" || questionType === "multiple_answer") {
    if (optionTexts.length < 2) {
      return { row: rowNumber, ok: false, error: "Choice questions need at least 2 non-empty options." };
    }
    const correctIndexes = splitMultiValue(row.correct_options).map((v) => Number(v) - 1);
    if (correctIndexes.length === 0 || correctIndexes.some((i) => Number.isNaN(i))) {
      return {
        row: rowNumber,
        ok: false,
        error: "'correct_options' must list option number(s), e.g. \"1\" or \"1;3\".",
      };
    }
    if (questionType === "multiple_choice" && correctIndexes.length > 1) {
      return { row: rowNumber, ok: false, error: "multiple_choice takes exactly one correct option." };
    }
    if (correctIndexes.some((i) => i < 0 || i >= optionTexts.length)) {
      return {
        row: rowNumber,
        ok: false,
        error: `'correct_options' references an option number outside 1-${optionTexts.length}.`,
      };
    }
    return {
      ok: true,
      data: {
        question_text: questionText,
        question_type: questionType,
        explanation: orNull(row.explanation),
        marks,
        difficulty,
        correct_answer: null,
        options: optionTexts.map((text, i) => ({ text, isCorrect: correctIndexes.includes(i) })),
      },
    };
  }

  if (questionType === "true_false") {
    const answer = row.correct_answer?.trim().toLowerCase();
    if (answer !== "true" && answer !== "false") {
      return {
        row: rowNumber,
        ok: false,
        error: `true_false needs 'correct_answer' of exactly "true" or "false" (got "${row.correct_answer}").`,
      };
    }
    return {
      ok: true,
      data: {
        question_text: questionText,
        question_type: questionType,
        explanation: orNull(row.explanation),
        marks,
        difficulty,
        correct_answer: null,
        options: [
          { text: "True", isCorrect: answer === "true" },
          { text: "False", isCorrect: answer === "false" },
        ],
      },
    };
  }

  if (questionType === "ordering") {
    if (optionTexts.length < 2) {
      return { row: rowNumber, ok: false, error: "'ordering' needs at least 2 items (option_1, option_2, ...)." };
    }
    return {
      ok: true,
      data: {
        question_text: questionText,
        question_type: questionType,
        explanation: orNull(row.explanation),
        marks,
        difficulty,
        correct_answer: null,
        // Listed order is the correct order — matches how the
        // interactive editor stores ordering items.
        options: optionTexts.map((text) => ({ text, isCorrect: true })),
      },
    };
  }

  // fill_in_blank / short_answer / written_answer
  const correctAnswer = orNull(row.correct_answer);
  if (!correctAnswer) {
    return {
      row: rowNumber,
      ok: false,
      error: `'${questionType}' needs a 'correct_answer' value.`,
    };
  }
  return {
    ok: true,
    data: {
      question_text: questionText,
      question_type: questionType,
      explanation: orNull(row.explanation),
      marks,
      difficulty,
      correct_answer: correctAnswer,
      options: [],
    },
  };
}
