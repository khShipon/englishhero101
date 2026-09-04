import type { QuestionType } from "@/lib/admin/question-validation";

// Friendly IELTS Academic Reading question-type presets, each mapped
// onto the generic question_type the schema already supports. Picking
// one in the admin UI auto-fills the right underlying type (and, for
// the fixed-choice types, the exact answer options) — the admin never
// has to know that "True / False / Not Given" is stored as
// question_type = "true_false" under the hood.
export type IeltsReadingQuestionType = {
  key: string;
  label: string;
  questionType: QuestionType;
  presetOptions?: string[];
  hint: string;
};

export const IELTS_READING_QUESTION_TYPES: IeltsReadingQuestionType[] = [
  {
    key: "true_false_not_given",
    label: "True / False / Not Given",
    questionType: "true_false",
    presetOptions: ["True", "False", "Not Given"],
    hint: "Does the statement agree with the facts given in the passage?",
  },
  {
    key: "yes_no_not_given",
    label: "Yes / No / Not Given",
    questionType: "true_false",
    presetOptions: ["Yes", "No", "Not Given"],
    hint: "Does the statement agree with the claims/views of the writer?",
  },
  {
    key: "multiple_choice",
    label: "Multiple Choice",
    questionType: "multiple_choice",
    hint: "One correct answer from several options.",
  },
  {
    key: "matching_headings",
    label: "Matching Headings",
    questionType: "matching",
    hint: "Match each paragraph (left) to the heading that best summarizes it (right).",
  },
  {
    key: "matching_information",
    label: "Matching Information",
    questionType: "matching",
    hint: "Match each piece of information (left) to the paragraph it appears in (right).",
  },
  {
    key: "matching_features",
    label: "Matching Features",
    questionType: "matching",
    hint: "Match each statement (left) to the person, place, or thing it describes (right).",
  },
  {
    key: "sentence_completion",
    label: "Sentence Completion",
    questionType: "fill_in_blank",
    hint: "Complete the sentence using words taken from the passage.",
  },
  {
    key: "summary_completion",
    label: "Summary / Note / Table Completion",
    questionType: "fill_in_blank",
    hint: "Fill each gap in the summary, notes, or table using words from the passage.",
  },
  {
    key: "short_answer",
    label: "Short Answer Questions",
    questionType: "short_answer",
    hint: "Answer using no more words than the limit given (e.g. \"NO MORE THAN TWO WORDS\").",
  },
];

export function getIeltsReadingQuestionType(key: string | null | undefined) {
  return IELTS_READING_QUESTION_TYPES.find((type) => type.key === key) ?? null;
}
