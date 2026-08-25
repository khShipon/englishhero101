"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { requireUser } from "@/lib/auth/dal";

export async function toggleBookmark(lessonId: string, currentlyBookmarked: boolean) {
  const user = await requireUser();
  const supabase = await createClient();

  if (currentlyBookmarked) {
    const { error } = await supabase
      .from("bookmarks")
      .delete()
      .eq("user_id", user.id)
      .eq("content_id", lessonId);
    if (error) throw new Error("Could not remove this bookmark.");
  } else {
    const { error } = await supabase
      .from("bookmarks")
      .insert({ user_id: user.id, content_id: lessonId });
    // Ignore a duplicate-bookmark race (unique(user_id, content_id)) —
    // the end state is what matters, and it's already what we want.
    if (error && error.code !== "23505") {
      throw new Error("Could not save this bookmark.");
    }
  }

  revalidatePath("/profile");
}
