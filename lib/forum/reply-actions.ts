"use server";

import * as z from "zod";
import { revalidatePath } from "next/cache";
import { requireUser } from "@/lib/auth/dal";
import { createClient } from "@/lib/supabase/server";
import type { SupabaseClient } from "@supabase/supabase-js";

const bodySchema = z
  .string()
  .trim()
  .min(1, { error: "Write a reply first." })
  .max(2000, { error: "Keep it under 2000 characters." });

export type ForumFormState = { error?: string } | undefined;

// Notifies whoever this reply is directly addressing: the post's
// author for a top-level reply, or the specific reply's author for a
// nested one. Silently skipped when that's the replier themself (also
// enforced by forum_notifications_insert_actor's RLS check).
async function notifyReply(
  supabase: SupabaseClient,
  actorId: string,
  postId: string,
  replyId: string,
  parentReplyId: string | null,
  replyToUserId: string | null,
) {
  let recipientId: string;
  const type = parentReplyId && replyToUserId ? "reply_to_reply" : "reply_to_post";

  if (type === "reply_to_reply") {
    recipientId = replyToUserId!;
  } else {
    const { data: post, error } = await supabase.from("forum_posts").select("user_id").eq("id", postId).single();
    if (error) throw error;
    recipientId = post.user_id;
  }

  if (recipientId === actorId) return;

  const { error: notifyError } = await supabase.from("forum_notifications").insert({
    user_id: recipientId,
    actor_id: actorId,
    type,
    post_id: postId,
    reply_id: replyId,
  });
  if (notifyError) throw notifyError;
}

// parentReplyId is whichever reply the composer was opened from — a
// top-level one, or an already-nested one. Nesting is flattened to one
// level (see forum_reply_check_parent() in the migration): replying to
// a nested reply attaches under its top-level parent instead of
// growing a third level, while reply_to_user_id still records exactly
// who's being addressed so the UI can show "replying to @Name".
export async function createReply(
  postId: string,
  parentReplyId: string | null,
  _state: ForumFormState,
  formData: FormData,
): Promise<ForumFormState> {
  const user = await requireUser();

  const parsed = bodySchema.safeParse(formData.get("body"));
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid reply." };
  }

  const supabase = await createClient();

  let finalParentId: string | null = null;
  let replyToUserId: string | null = null;

  if (parentReplyId) {
    const { data: parent, error } = await supabase
      .from("forum_replies")
      .select("id, user_id, parent_reply_id")
      .eq("id", parentReplyId)
      .single();
    if (error) return { error: "That reply no longer exists." };
    finalParentId = parent.parent_reply_id ?? parent.id;
    replyToUserId = parent.user_id;
  }

  const { data: inserted, error: insertError } = await supabase
    .from("forum_replies")
    .insert({
      post_id: postId,
      user_id: user.id,
      parent_reply_id: finalParentId,
      reply_to_user_id: replyToUserId,
      body: parsed.data,
    })
    .select("id")
    .single();
  if (insertError || !inserted) {
    return { error: "Could not post your reply. Please try again." };
  }

  await notifyReply(supabase, user.id, postId, inserted.id, finalParentId, replyToUserId);

  revalidatePath(`/forum/${postId}`);
  revalidatePath("/forum");
  return undefined;
}

// Shared by the reply owner's own delete button and the admin
// moderation page, same reasoning as deletePost() in post-actions.ts.
export async function deleteReply(formData: FormData) {
  await requireUser();
  const replyId = String(formData.get("replyId") ?? "");
  const postId = String(formData.get("postId") ?? "");
  if (!replyId || !postId) return;

  const supabase = await createClient();
  const { error } = await supabase.from("forum_replies").delete().eq("id", replyId);
  if (error) throw error;

  revalidatePath(`/forum/${postId}`);
  revalidatePath("/forum");
  revalidatePath("/admin/forum");
}
