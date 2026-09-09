"use server";

import { revalidatePath } from "next/cache";
import { requireUser } from "@/lib/auth/dal";
import { createClient } from "@/lib/supabase/server";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { ReactionType } from "@/lib/queries/forum";

export type ReactionTarget =
  | { kind: "post"; postId: string }
  | { kind: "reply"; replyId: string; postId: string };

async function notifyReaction(
  supabase: SupabaseClient,
  actorId: string,
  target: ReactionTarget,
  reactionType: ReactionType,
) {
  let recipientId: string;
  if (target.kind === "post") {
    const { data: post, error } = await supabase.from("forum_posts").select("user_id").eq("id", target.postId).single();
    if (error) throw error;
    recipientId = post.user_id;
  } else {
    const { data: reply, error } = await supabase.from("forum_replies").select("user_id").eq("id", target.replyId).single();
    if (error) throw error;
    recipientId = reply.user_id;
  }

  if (recipientId === actorId) return;

  const { error: notifyError } = await supabase.from("forum_notifications").insert({
    user_id: recipientId,
    actor_id: actorId,
    type: target.kind === "post" ? "reaction_post" : "reaction_reply",
    post_id: target.postId,
    reply_id: target.kind === "reply" ? target.replyId : null,
    reaction_type: reactionType,
  });
  if (notifyError) throw notifyError;
}

// One reaction per user per target (unique(post_id/reply_id, user_id)
// in the migration): clicking the reaction you already picked removes
// it, clicking the other one switches, and a first-time reaction is
// the only case that raises a notification.
export async function toggleReaction(target: ReactionTarget, reactionType: ReactionType) {
  const user = await requireUser();
  const supabase = await createClient();

  const table = target.kind === "post" ? "forum_post_reactions" : "forum_reply_reactions";
  const idColumn = target.kind === "post" ? "post_id" : "reply_id";
  const targetId = target.kind === "post" ? target.postId : target.replyId;

  const { data: existing, error: fetchError } = await supabase
    .from(table)
    .select("id, reaction_type")
    .eq(idColumn, targetId)
    .eq("user_id", user.id)
    .maybeSingle();
  if (fetchError) throw fetchError;

  if (existing && existing.reaction_type === reactionType) {
    const { error } = await supabase.from(table).delete().eq("id", existing.id);
    if (error) throw error;
  } else if (existing) {
    const { error } = await supabase.from(table).update({ reaction_type: reactionType }).eq("id", existing.id);
    if (error) throw error;
  } else {
    const { error } = await supabase.from(table).insert({ [idColumn]: targetId, user_id: user.id, reaction_type: reactionType });
    if (error) throw error;
    await notifyReaction(supabase, user.id, target, reactionType);
  }

  revalidatePath(`/forum/${target.postId}`);
  revalidatePath("/forum");
}
