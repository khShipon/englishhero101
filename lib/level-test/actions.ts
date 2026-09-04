"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getCurrentUser } from "@/lib/auth/dal";
import { gradeLevelTest, type LevelTestAnswer, type LevelTestResult } from "@/lib/level-test/scoring";

export async function submitLevelTest(answers: LevelTestAnswer[]): Promise<LevelTestResult> {
  const user = await getCurrentUser();
  if (!user) {
    throw new Error("You must be logged in to take the level test.");
  }

  const result = gradeLevelTest(Array.isArray(answers) ? answers : []);

  const supabase = await createClient();
  const { error } = await supabase.from("level_test_results").insert({
    user_id: user.id,
    level: result.level,
    score: result.score,
    total: result.total,
    percent: result.percent,
  });
  if (error) {
    throw new Error("Could not save your result. Please try again.");
  }

  revalidatePath("/profile");
  revalidatePath("/level-test");

  return result;
}
