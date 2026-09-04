import "server-only";
import { LEVEL_TEST_QUESTIONS, type LevelBand } from "@/lib/level-test/questions";

// Harder bands are worth more, so two learners with the same raw
// correct-count land in different bands if one of them answered the
// tougher questions — a closer approximation of a real placement test
// than a flat 1-point-per-question scheme.
const BAND_WEIGHT: Record<LevelBand, number> = {
  beginner: 1,
  intermediate: 2,
  advanced: 3,
};

export type LevelTestAnswer = { questionId: string; value: string };

export type LevelTestResult = {
  score: number;
  total: number;
  percent: number;
  level: LevelBand;
};

export function gradeLevelTest(answers: LevelTestAnswer[]): LevelTestResult {
  const answerByQuestionId = new Map(answers.map((a) => [a.questionId, a.value]));

  let score = 0;
  let total = 0;

  for (const question of LEVEL_TEST_QUESTIONS) {
    const weight = BAND_WEIGHT[question.band];
    total += weight;

    const given = answerByQuestionId.get(question.id);
    if (given == null) continue;

    const correct =
      question.kind === "choice"
        ? given === question.correctOptionId
        : question.acceptedAnswers.includes(given.trim().toLowerCase());

    if (correct) score += weight;
  }

  const percent = total === 0 ? 0 : Math.round((score / total) * 100);
  const level: LevelBand = percent < 35 ? "beginner" : percent < 70 ? "intermediate" : "advanced";

  return { score, total, percent, level };
}
