import "server-only";
import { cache } from "react";
import type { SupabaseClient } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/server";
import { getTierNamesForUsers } from "@/lib/queries/points";
import { displayName, initialsFromName } from "@/lib/forum/format";

export type ReactionType = "like" | "love";

export type ForumAuthor = {
  id: string;
  name: string;
  initials: string;
  tierName: string;
};

export type ForumPostSummary = {
  id: string;
  body: string;
  createdAt: string;
  author: ForumAuthor;
  likeCount: number;
  loveCount: number;
  myReaction: ReactionType | null;
  replyCount: number;
};

export type ForumReplyNode = {
  id: string;
  body: string;
  createdAt: string;
  author: ForumAuthor;
  replyToName: string | null;
  likeCount: number;
  loveCount: number;
  myReaction: ReactionType | null;
  children: ForumReplyNode[];
};

export type ForumPostDetail = ForumPostSummary & {
  replies: ForumReplyNode[];
};

type ReactionAgg = { like: number; love: number; mine: ReactionType | null };

function tallyReaction(agg: ReactionAgg, reactionType: string, isMine: boolean): ReactionAgg {
  const next = { ...agg };
  if (reactionType === "like") next.like++;
  else next.love++;
  if (isMine) next.mine = reactionType as ReactionType;
  return next;
}

// profiles_select_own restricts a plain select to the caller's own
// row (reviews stay anonymous for the same reason — see
// lib/queries/ratings.ts), so author names come from the
// get_forum_authors() RPC instead, which exposes only id + full_name.
async function getAuthors(supabase: SupabaseClient, userIds: string[]): Promise<Map<string, ForumAuthor>> {
  const uniqueIds = [...new Set(userIds)];
  if (uniqueIds.length === 0) return new Map();

  const [{ data: profileRows, error }, tierByUser] = await Promise.all([
    supabase.rpc("get_forum_authors", { author_ids: uniqueIds }),
    getTierNamesForUsers(uniqueIds),
  ]);
  if (error) throw error;

  const nameById = new Map(
    ((profileRows ?? []) as { id: string; full_name: string | null }[]).map((row) => [row.id, row.full_name]),
  );

  const result = new Map<string, ForumAuthor>();
  for (const id of uniqueIds) {
    const fullName = nameById.get(id) ?? null;
    result.set(id, {
      id,
      name: displayName(fullName),
      initials: initialsFromName(fullName),
      tierName: tierByUser.get(id) ?? "Beginner",
    });
  }
  return result;
}

export type ForumFeedPage = { posts: ForumPostSummary[]; nextCursor: string | null };

export const getForumFeed = cache(
  async ({ limit = 20, before }: { limit?: number; before?: string } = {}): Promise<ForumFeedPage> => {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    let query = supabase
      .from("forum_posts")
      .select("id, user_id, body, created_at")
      .order("created_at", { ascending: false })
      .limit(limit + 1);
    if (before) query = query.lt("created_at", before);

    const { data: rows, error } = await query;
    if (error) throw error;

    const allRows = rows ?? [];
    const hasMore = allRows.length > limit;
    const pageRows = hasMore ? allRows.slice(0, limit) : allRows;
    if (pageRows.length === 0) return { posts: [], nextCursor: null };

    const postIds = pageRows.map((row) => row.id);

    const [authors, reactionResult, replyResult] = await Promise.all([
      getAuthors(supabase, pageRows.map((row) => row.user_id)),
      supabase.from("forum_post_reactions").select("post_id, user_id, reaction_type").in("post_id", postIds),
      supabase.from("forum_replies").select("post_id").in("post_id", postIds),
    ]);
    if (reactionResult.error) throw reactionResult.error;
    if (replyResult.error) throw replyResult.error;

    const reactionsByPost = new Map<string, ReactionAgg>();
    for (const row of reactionResult.data ?? []) {
      const current = reactionsByPost.get(row.post_id) ?? { like: 0, love: 0, mine: null };
      reactionsByPost.set(row.post_id, tallyReaction(current, row.reaction_type, row.user_id === user?.id));
    }

    const replyCountByPost = new Map<string, number>();
    for (const row of replyResult.data ?? []) {
      replyCountByPost.set(row.post_id, (replyCountByPost.get(row.post_id) ?? 0) + 1);
    }

    const posts: ForumPostSummary[] = pageRows.map((row) => {
      const reactions = reactionsByPost.get(row.id) ?? { like: 0, love: 0, mine: null };
      return {
        id: row.id,
        body: row.body,
        createdAt: row.created_at,
        author: authors.get(row.user_id)!,
        likeCount: reactions.like,
        loveCount: reactions.love,
        myReaction: reactions.mine,
        replyCount: replyCountByPost.get(row.id) ?? 0,
      };
    });

    return { posts, nextCursor: hasMore ? pageRows[pageRows.length - 1].created_at : null };
  },
);

export const getForumPost = cache(async (postId: string): Promise<ForumPostDetail | null> => {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: postRow, error: postError } = await supabase
    .from("forum_posts")
    .select("id, user_id, body, created_at")
    .eq("id", postId)
    .maybeSingle();
  if (postError) throw postError;
  if (!postRow) return null;

  const { data: replyRows, error: replyError } = await supabase
    .from("forum_replies")
    .select("id, user_id, parent_reply_id, reply_to_user_id, body, created_at")
    .eq("post_id", postId)
    .order("created_at", { ascending: true });
  if (replyError) throw replyError;

  const replies = replyRows ?? [];
  const replyIds = replies.map((row) => row.id);

  const authorIds = [
    postRow.user_id,
    ...replies.map((row) => row.user_id),
    ...replies.map((row) => row.reply_to_user_id).filter((id): id is string => !!id),
  ];

  const [authors, postReactionResult, replyReactionResult] = await Promise.all([
    getAuthors(supabase, authorIds),
    supabase.from("forum_post_reactions").select("user_id, reaction_type").eq("post_id", postId),
    replyIds.length > 0
      ? supabase.from("forum_reply_reactions").select("reply_id, user_id, reaction_type").in("reply_id", replyIds)
      : Promise.resolve({ data: [] as { reply_id: string; user_id: string; reaction_type: string }[], error: null }),
  ]);
  if (postReactionResult.error) throw postReactionResult.error;
  if (replyReactionResult.error) throw replyReactionResult.error;

  let postReactions: ReactionAgg = { like: 0, love: 0, mine: null };
  for (const row of postReactionResult.data ?? []) {
    postReactions = tallyReaction(postReactions, row.reaction_type, row.user_id === user?.id);
  }

  const reactionsByReply = new Map<string, ReactionAgg>();
  for (const row of replyReactionResult.data ?? []) {
    const current = reactionsByReply.get(row.reply_id) ?? { like: 0, love: 0, mine: null };
    reactionsByReply.set(row.reply_id, tallyReaction(current, row.reaction_type, row.user_id === user?.id));
  }

  function toNode(row: (typeof replies)[number]): ForumReplyNode {
    const reactions = reactionsByReply.get(row.id) ?? { like: 0, love: 0, mine: null };
    return {
      id: row.id,
      body: row.body,
      createdAt: row.created_at,
      author: authors.get(row.user_id)!,
      replyToName: row.reply_to_user_id ? (authors.get(row.reply_to_user_id)?.name ?? null) : null,
      likeCount: reactions.like,
      loveCount: reactions.love,
      myReaction: reactions.mine,
      children: [],
    };
  }

  const nodesById = new Map(replies.map((row) => [row.id, toNode(row)]));
  const topLevel: ForumReplyNode[] = [];
  for (const row of replies) {
    const node = nodesById.get(row.id)!;
    const parent = row.parent_reply_id ? nodesById.get(row.parent_reply_id) : undefined;
    if (parent) parent.children.push(node);
    else topLevel.push(node);
  }

  return {
    id: postRow.id,
    body: postRow.body,
    createdAt: postRow.created_at,
    author: authors.get(postRow.user_id)!,
    likeCount: postReactions.like,
    loveCount: postReactions.love,
    myReaction: postReactions.mine,
    replyCount: replies.length,
    replies: topLevel,
  };
});
