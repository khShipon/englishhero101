import "server-only";
import type { Question } from "@/lib/queries/question-banks";
import { getMatchingPairs } from "@/lib/queries/question-banks";
import type { QuestionType } from "@/lib/admin/question-validation";

export type SubmittedAnswer = {
  questionId: string;
  selectedOptionIds?: string[];
  text?: string;
  orderedOptionIds?: string[];
  matchingAnswer?: Record<string, string>;
};

export type GradedQuestion = {
  questionId: string;
  questionText: string;
  questionType: QuestionType;
  marks: number;
  earnedMarks: number;
  autoGraded: boolean;
  correct: boolean | null;
  explanation: string | null;
  correctOptionIds: string[] | null;
  correctText: string | null;
  correctOrder: { id: string; text: string }[] | null;
  correctPairs: { left: string; right: string }[] | null;
};

function normalize(value: string): string {
  return value.trim().toLowerCase().replace(/\s+/g, " ");
}

function sameSet(a: string[], b: string[]): boolean {
  if (a.length !== b.length) return false;
  const sortedA = [...a].sort();
  const sortedB = [...b].sort();
  return sortedA.every((value, index) => value === sortedB[index]);
}

function sameSequence(a: string[], b: string[]): boolean {
  return a.length === b.length && a.every((value, index) => value === b[index]);
}

// Full-or-nothing per question — no partial credit within a single
// multi-part answer (multiple_answer / ordering / matching).
export function gradeQuestion(question: Question, answer: SubmittedAnswer | undefined): GradedQuestion {
  const base = {
    questionId: question.id,
    questionText: question.questionText,
    questionType: question.questionType,
    marks: question.marks,
    explanation: question.explanation,
  };

  switch (question.questionType) {
    case "multiple_choice":
    case "true_false":
    case "multiple_answer": {
      const correctIds = question.options.filter((option) => option.isCorrect).map((option) => option.id);
      const selected = answer?.selectedOptionIds ?? [];
      const correct = sameSet(selected, correctIds);
      return {
        ...base,
        autoGraded: true,
        correct,
        earnedMarks: correct ? question.marks : 0,
        correctOptionIds: correctIds,
        correctText: null,
        correctOrder: null,
        correctPairs: null,
      };
    }
    case "fill_in_blank":
    case "short_answer": {
      const correctText = question.correctAnswer ?? "";
      const submitted = answer?.text ?? "";
      const correct = correctText !== "" && normalize(submitted) === normalize(correctText);
      return {
        ...base,
        autoGraded: true,
        correct,
        earnedMarks: correct ? question.marks : 0,
        correctOptionIds: null,
        correctText,
        correctOrder: null,
        correctPairs: null,
      };
    }
    case "ordering": {
      const correctOrder = [...question.options].sort((a, b) => a.sortOrder - b.sortOrder);
      const correctIds = correctOrder.map((option) => option.id);
      const submitted = answer?.orderedOptionIds ?? [];
      const correct = correctIds.length > 0 && sameSequence(submitted, correctIds);
      return {
        ...base,
        autoGraded: true,
        correct,
        earnedMarks: correct ? question.marks : 0,
        correctOptionIds: null,
        correctText: null,
        correctOrder: correctOrder.map((option) => ({ id: option.id, text: option.optionText })),
        correctPairs: null,
      };
    }
    case "matching": {
      const pairs = getMatchingPairs(question);
      const submitted = answer?.matchingAnswer ?? {};
      const correct = pairs.length > 0 && pairs.every((pair) => submitted[pair.left] === pair.right);
      return {
        ...base,
        autoGraded: true,
        correct,
        earnedMarks: correct ? question.marks : 0,
        correctOptionIds: null,
        correctText: null,
        correctOrder: null,
        correctPairs: pairs,
      };
    }
    case "written_answer":
    default: {
      // Free-form text can't be reliably auto-graded — show the model
      // answer (if any) for the student to self-check instead.
      return {
        ...base,
        autoGraded: false,
        correct: null,
        earnedMarks: 0,
        correctOptionIds: null,
        correctText: question.correctAnswer,
        correctOrder: null,
        correctPairs: null,
      };
    }
  }
}
