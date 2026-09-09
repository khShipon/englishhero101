"use server";

import { createClient } from "@/lib/supabase/server";
import { getCurrentUser } from "@/lib/auth/dal";

// Fired once per post view (see TrackPostView), which is rendered
// unconditionally on the post detail page. Best-effort: a failed
// write here shouldn't break reading the post, so errors are logged
// rather than thrown — mirrors recordLessonView().
export async function recordForumPostView(postId: string) {
  const user = await getCurrentUser();
  if (!user) return;
  const supabase = await createClient();

  const { error } = await supabase
    .from("forum_post_views")
    .upsert(
      { user_id: user.id, post_id: postId, viewed_at: new Date().toISOString() },
      { onConflict: "user_id,post_id" },
    );

  if (error) {
    console.error("recordForumPostView failed:", error.message);
  }
}
