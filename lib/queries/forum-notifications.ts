import "server-only";
import { cache } from "react";
import { createClient } from "@/lib/supabase/server";
import { displayName, initialsFromName } from "@/lib/forum/format";
import type { ReactionType } from "@/lib/queries/forum";

export type NotificationType = "reply_to_post" | "reply_to_reply" | "reaction_post" | "reaction_reply";

export type ForumNotification = {
  id: string;
  type: NotificationType;
  actorName: string;
  actorInitials: string;
  reactionType: ReactionType | null;
  postId: string;
  replyId: string | null;
  isRead: boolean;
  createdAt: string;
};

export const getNotifications = cache(async (limit = 20): Promise<ForumNotification[]> => {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return [];

  const { data: rows, error } = await supabase
    .from("forum_notifications")
    .select("id, type, actor_id, reaction_type, post_id, reply_id, is_read, created_at")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(limit);
  if (error) throw error;

  const notificationRows = rows ?? [];
  if (notificationRows.length === 0) return [];

  const actorIds = [...new Set(notificationRows.map((row) => row.actor_id))];
  const { data: actorRows, error: actorError } = await supabase.rpc("get_forum_authors", {
    author_ids: actorIds,
  });
  if (actorError) throw actorError;

  const nameById = new Map(
    ((actorRows ?? []) as { id: string; full_name: string | null }[]).map((row) => [row.id, row.full_name]),
  );

  return notificationRows.map((row) => {
    const fullName = nameById.get(row.actor_id) ?? null;
    return {
      id: row.id,
      type: row.type as NotificationType,
      actorName: displayName(fullName),
      actorInitials: initialsFromName(fullName),
      reactionType: row.reaction_type as ReactionType | null,
      postId: row.post_id,
      replyId: row.reply_id,
      isRead: row.is_read,
      createdAt: row.created_at,
    };
  });
});

export const getUnreadNotificationCount = cache(async (): Promise<number> => {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return 0;

  const { count, error } = await supabase
    .from("forum_notifications")
    .select("*", { count: "exact", head: true })
    .eq("user_id", user.id)
    .eq("is_read", false);
  if (error) throw error;
  return count ?? 0;
});
