import "server-only";
import { cache } from "react";
import { createClient } from "@/lib/supabase/server";
import { getTierInfo } from "@/lib/gamification/tiers";

// Points are computed from current state (not an accumulated ledger),
// so toggling a lesson's completion off and back on, or retaking a
// quiz, can't be farmed for extra points.
const POINTS_PER_COMPLETED_LESSON = 10;
const LEVEL_TEST_BONUS = 15;

export type UserPoints = {
  points: number;
  tierName: string;
  nextTierName: string | null;
  pointsToNextTier: number | null;
  progressPercent: number;
};

export const getUserPoints = cache(async (): Promise<UserPoints | null> => {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const [
    { data: lessonRows, error: lessonError },
    { data: quizRows, error: quizError },
    { count: levelTestCount, error: levelTestError },
  ] = await Promise.all([
    supabase.from("lesson_progress").select("id").eq("user_id", user.id).eq("completed", true),
    supabase.from("quiz_attempts").select("question_set_id, percent").eq("user_id", user.id),
    supabase
      .from("level_test_results")
      .select("id", { count: "exact", head: true })
      .eq("user_id", user.id),
  ]);
  if (lessonError) throw lessonError;
  if (quizError) throw quizError;
  if (levelTestError) throw levelTestError;

  const lessonPoints = (lessonRows?.length ?? 0) * POINTS_PER_COMPLETED_LESSON;

  // Best attempt per question set — retaking a quiz can improve your
  // score's contribution, but spamming attempts can't inflate it.
  const bestPercentBySet = new Map<string, number>();
  for (const row of quizRows ?? []) {
    const current = bestPercentBySet.get(row.question_set_id) ?? 0;
    if (row.percent > current) bestPercentBySet.set(row.question_set_id, row.percent);
  }
  const quizPoints = [...bestPercentBySet.values()].reduce(
    (sum, percent) => sum + Math.round(percent / 20),
    0,
  );

  const levelTestPoints = (levelTestCount ?? 0) > 0 ? LEVEL_TEST_BONUS : 0;

  const points = lessonPoints + quizPoints + levelTestPoints;
  const { tier, next } = getTierInfo(points);

  return {
    points,
    tierName: tier.name,
    nextTierName: next?.name ?? null,
    pointsToNextTier: next ? next.min - points : null,
    progressPercent: next ? Math.round(((points - tier.min) / (next.min - tier.min)) * 100) : 100,
  };
});
