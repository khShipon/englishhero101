"use server";

import * as z from "zod";
import { revalidatePath } from "next/cache";
import { requireUser } from "@/lib/auth/dal";
import { createClient } from "@/lib/supabase/server";

const bodySchema = z
  .string()
  .trim()
  .min(1, { error: "Write something before posting." })
  .max(5000, { error: "Keep it under 5000 characters." });

export type ForumFormState = { error?: string } | undefined;

export async function createPost(_state: ForumFormState, formData: FormData): Promise<ForumFormState> {
  const user = await requireUser();

  const parsed = bodySchema.safeParse(formData.get("body"));
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid post." };
  }

  const supabase = await createClient();
  const { error } = await supabase.from("forum_posts").insert({ user_id: user.id, body: parsed.data });
  if (error) {
    return { error: "Could not publish your post. Please try again." };
  }

  revalidatePath("/forum");
  return undefined;
}

// Shared by the post owner's own delete button and the admin
// moderation page — ownership vs. manager-role authorization is
// enforced entirely by RLS (forum_posts_delete_own /
// forum_posts_delete_manager), not here, so a request that fails
// authorization just deletes zero rows rather than throwing.
export async function deletePost(formData: FormData) {
  await requireUser();
  const postId = String(formData.get("postId") ?? "");
  if (!postId) return;

  const supabase = await createClient();
  const { error } = await supabase.from("forum_posts").delete().eq("id", postId);
  if (error) throw error;

  revalidatePath("/forum");
  revalidatePath("/admin/forum");
}
