import "server-only";
import { cache } from "react";
import { createClient } from "@/lib/supabase/server";
import type { LevelBand } from "@/lib/level-test/questions";

export type LevelTestSummary = {
  level: LevelBand;
  score: number;
  total: number;
  percent: number;
  createdAt: string;
};

export const getLatestLevelTestResult = cache(async (): Promise<LevelTestSummary | null> => {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data, error } = await supabase
    .from("level_test_results")
    .select("level, score, total, percent, created_at")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) throw error;
  if (!data) return null;

  return {
    level: data.level as LevelBand,
    score: data.score,
    total: data.total,
    percent: data.percent,
    createdAt: data.created_at,
  };
});
