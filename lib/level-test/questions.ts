import "server-only";

// Curated placement-test question bank. Kept server-only: page.tsx
// strips correct answers via toPublicQuestion() before the question
// list ever reaches the client, and the grading server action grades
// against this file directly — so correct answers never ship in the
// client JS bundle.

export type LevelBand = "beginner" | "intermediate" | "advanced";
export type QuestionSkill = "grammar" | "vocabulary" | "fill_blank" | "listening";

type BaseQuestion = {
  id: string;
  band: LevelBand;
  skill: QuestionSkill;
  prompt: string;
  // Listening questions: text spoken aloud (via the browser's Web
  // Speech API) before the prompt/options are shown.
  audioText?: string;
};

export type ChoiceQuestion = BaseQuestion & {
  kind: "choice";
  options: { id: string; text: string }[];
  correctOptionId: string;
};

export type TextQuestion = BaseQuestion & {
  kind: "text";
  acceptedAnswers: string[];
};

export type LevelTestQuestion = ChoiceQuestion | TextQuestion;

export const LEVEL_TEST_QUESTIONS: LevelTestQuestion[] = [
  // --- Grammar ---
  {
    id: "gr-1",
    band: "beginner",
    skill: "grammar",
    kind: "choice",
    prompt: "She ___ to school every day.",
    options: [
      { id: "a", text: "go" },
      { id: "b", text: "goes" },
      { id: "c", text: "going" },
      { id: "d", text: "gone" },
    ],
    correctOptionId: "b",
  },
  {
    id: "gr-2",
    band: "beginner",
    skill: "grammar",
    kind: "choice",
    prompt: "They ___ playing football right now.",
    options: [
      { id: "a", text: "is" },
      { id: "b", text: "am" },
      { id: "c", text: "are" },
      { id: "d", text: "be" },
    ],
    correctOptionId: "c",
  },
  {
    id: "gr-3",
    band: "beginner",
    skill: "grammar",
    kind: "choice",
    prompt: "I ___ a doctor.",
    options: [
      { id: "a", text: "am" },
      { id: "b", text: "is" },
      { id: "c", text: "are" },
      { id: "d", text: "be" },
    ],
    correctOptionId: "a",
  },
  {
    id: "gr-4",
    band: "intermediate",
    skill: "grammar",
    kind: "choice",
    prompt: "By the time we arrived, the movie ___.",
    options: [
      { id: "a", text: "already started" },
      { id: "b", text: "has already started" },
      { id: "c", text: "had already started" },
      { id: "d", text: "was already starting" },
    ],
    correctOptionId: "c",
  },
  {
    id: "gr-5",
    band: "intermediate",
    skill: "grammar",
    kind: "choice",
    prompt: "If I ___ more time, I would learn French.",
    options: [
      { id: "a", text: "have" },
      { id: "b", text: "had" },
      { id: "c", text: "has" },
      { id: "d", text: "having" },
    ],
    correctOptionId: "b",
  },
  {
    id: "gr-6",
    band: "advanced",
    skill: "grammar",
    kind: "choice",
    prompt: "Hardly ___ the meeting begun when the fire alarm rang.",
    options: [
      { id: "a", text: "had" },
      { id: "b", text: "has" },
      { id: "c", text: "did" },
      { id: "d", text: "was" },
    ],
    correctOptionId: "a",
  },

  // --- Vocabulary ---
  {
    id: "vo-1",
    band: "beginner",
    skill: "vocabulary",
    kind: "choice",
    prompt: "Which word means the same as \"happy\"?",
    options: [
      { id: "a", text: "sad" },
      { id: "b", text: "glad" },
      { id: "c", text: "angry" },
      { id: "d", text: "tired" },
    ],
    correctOptionId: "b",
  },
  {
    id: "vo-2",
    band: "beginner",
    skill: "vocabulary",
    kind: "choice",
    prompt: "Which word is the opposite of \"difficult\"?",
    options: [
      { id: "a", text: "easy" },
      { id: "b", text: "hard" },
      { id: "c", text: "slow" },
      { id: "d", text: "heavy" },
    ],
    correctOptionId: "a",
  },
  {
    id: "vo-3",
    band: "intermediate",
    skill: "vocabulary",
    kind: "choice",
    prompt: "\"Benevolent\" is closest in meaning to:",
    options: [
      { id: "a", text: "cruel" },
      { id: "b", text: "kind" },
      { id: "c", text: "lazy" },
      { id: "d", text: "nervous" },
    ],
    correctOptionId: "b",
  },
  {
    id: "vo-4",
    band: "intermediate",
    skill: "vocabulary",
    kind: "choice",
    prompt: "\"Ambiguous\" means:",
    options: [
      { id: "a", text: "clear" },
      { id: "b", text: "loud" },
      { id: "c", text: "open to more than one interpretation" },
      { id: "d", text: "certain" },
    ],
    correctOptionId: "c",
  },
  {
    id: "vo-5",
    band: "advanced",
    skill: "vocabulary",
    kind: "choice",
    prompt: "\"Ubiquitous\" is closest in meaning to:",
    options: [
      { id: "a", text: "rare" },
      { id: "b", text: "omnipresent" },
      { id: "c", text: "expensive" },
      { id: "d", text: "hidden" },
    ],
    correctOptionId: "b",
  },

  // --- Fill in the blank ---
  {
    id: "fb-1",
    band: "beginner",
    skill: "fill_blank",
    kind: "text",
    prompt: "My brother ___ (be) a teacher.",
    acceptedAnswers: ["is"],
  },
  {
    id: "fb-2",
    band: "intermediate",
    skill: "fill_blank",
    kind: "text",
    prompt: "She has lived in Dhaka ___ 2015.",
    acceptedAnswers: ["since"],
  },
  {
    id: "fb-3",
    band: "advanced",
    skill: "fill_blank",
    kind: "text",
    prompt: "No sooner ___ he arrived than it started raining.",
    acceptedAnswers: ["had"],
  },

  // --- Listening ---
  {
    id: "li-1",
    band: "beginner",
    skill: "listening",
    kind: "choice",
    audioText: "My name is Rina. I am ten years old and I live in Dhaka.",
    prompt: "How old is Rina?",
    options: [
      { id: "a", text: "8" },
      { id: "b", text: "9" },
      { id: "c", text: "10" },
      { id: "d", text: "12" },
    ],
    correctOptionId: "c",
  },
  {
    id: "li-2",
    band: "intermediate",
    skill: "listening",
    kind: "choice",
    audioText:
      "The train to Chittagong was delayed by two hours because of heavy rain.",
    prompt: "Why was the train delayed?",
    options: [
      { id: "a", text: "An accident" },
      { id: "b", text: "Heavy rain" },
      { id: "c", text: "A strike" },
      { id: "d", text: "Mechanical failure" },
    ],
    correctOptionId: "b",
  },
  {
    id: "li-3",
    band: "advanced",
    skill: "listening",
    kind: "choice",
    audioText:
      "Despite the initial skepticism from investors, the startup managed to secure funding just before its cash reserves were depleted.",
    prompt: "What happened just before the startup ran out of money?",
    options: [
      { id: "a", text: "It closed down" },
      { id: "b", text: "It secured funding" },
      { id: "c", text: "It hired new investors" },
      { id: "d", text: "Investor skepticism increased" },
    ],
    correctOptionId: "b",
  },
];

export type PublicLevelTestQuestion =
  | (Omit<ChoiceQuestion, "correctOptionId"> & { kind: "choice" })
  | (Omit<TextQuestion, "acceptedAnswers"> & { kind: "text" });

export function getPublicLevelTestQuestions(): PublicLevelTestQuestion[] {
  return LEVEL_TEST_QUESTIONS.map((question) => {
    if (question.kind === "choice") {
      const { id, band, skill, prompt, audioText, kind, options } = question;
      return { id, band, skill, prompt, audioText, kind, options };
    }
    const { id, band, skill, prompt, audioText, kind } = question;
    return { id, band, skill, prompt, audioText, kind };
  });
}
