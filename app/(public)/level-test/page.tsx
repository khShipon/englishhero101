import type { Metadata } from "next";
import { requireUser } from "@/lib/auth/dal";
import { getLatestLevelTestResult } from "@/lib/queries/level-test";
import { getLessonsByDifficulty } from "@/lib/queries/lessons";
import { getPublicLevelTestQuestions } from "@/lib/level-test/questions";
import { LevelTestQuiz } from "@/components/level-test/level-test-quiz";
import { LevelTestResultCard } from "@/components/level-test/level-test-result-card";

export const metadata: Metadata = { title: "Test your English level — EnglishHero101" };

// Per-user (auth + saved result) — no static shell to gain here.
export const instant = false;

export default async function LevelTestPage({
  searchParams,
}: {
  searchParams: Promise<{ retake?: string }>;
}) {
  await requireUser();
  const { retake } = await searchParams;

  const latest = retake === "1" ? null : await getLatestLevelTestResult();

  if (latest) {
    const recommended = await getLessonsByDifficulty(latest.level, 4);
    return (
      <div className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-6 px-4 py-12">
        <LevelTestResultCard result={latest} recommended={recommended} />
      </div>
    );
  }

  const questions = getPublicLevelTestQuestions();

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-6 px-4 py-12">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Test your English level</h1>
        <p className="text-sm text-muted-foreground">
          {questions.length} quick questions covering grammar, vocabulary, fill-in-the-blank, and
          listening. Takes about 5 minutes.
        </p>
      </div>
      <LevelTestQuiz questions={questions} />
    </div>
  );
}
