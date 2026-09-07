"use server";

import { redirect } from "next/navigation";
import { revalidatePath, updateTag } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { requireRole } from "@/lib/auth/dal";
import { blogPostSchema } from "@/lib/admin/blog-validation";

// Matches the cacheTag() calls in lib/queries/blog.ts's public-site
// functions.
const BLOG_TAG = "blog-posts";

export type BlogPostFormState =
  | {
      error?: string;
      fieldErrors?: Record<string, string[]>;
    }
  | undefined;

type PostgrestError = { code?: string; message: string };

function humanizeBlogError(error: PostgrestError): string {
  if (error.code === "23505") {
    return "A post with this slug already exists.";
  }
  return "Could not save this post. Please try again.";
}

function parseBlogPostForm(formData: FormData) {
  return blogPostSchema.safeParse({
    title: formData.get("title"),
    slug: formData.get("slug"),
    excerpt: formData.get("excerpt") ?? "",
    coverImageUrl: formData.get("coverImageUrl") ?? "",
    content: formData.get("content") ?? "{}",
    seoTitle: formData.get("seoTitle") ?? "",
    seoDescription: formData.get("seoDescription") ?? "",
  });
}

export async function createBlogPost(
  _state: BlogPostFormState,
  formData: FormData,
): Promise<BlogPostFormState> {
  await requireRole(["admin", "editor"]);

  const parsed = parseBlogPostForm(formData);
  if (!parsed.success) {
    return { fieldErrors: parsed.error.flatten().fieldErrors as Record<string, string[]> };
  }

  const status = formData.get("intent") === "publish" ? "published" : "draft";

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data, error } = await supabase
    .from("blog_posts")
    .insert({
      title: parsed.data.title,
      slug: parsed.data.slug,
      excerpt: parsed.data.excerpt,
      cover_image_url: parsed.data.coverImageUrl,
      content: parsed.data.content,
      status,
      author_id: user?.id ?? null,
      seo_title: parsed.data.seoTitle,
      seo_description: parsed.data.seoDescription,
      published_at: status === "published" ? new Date().toISOString() : null,
    })
    .select("id")
    .single();

  if (error || !data) {
    return { error: humanizeBlogError(error ?? { message: "insert returned no row" }) };
  }

  revalidatePath("/admin/blog");
  updateTag(BLOG_TAG);
  redirect("/admin/blog");
}

export async function updateBlogPost(
  _state: BlogPostFormState,
  formData: FormData,
): Promise<BlogPostFormState> {
  await requireRole(["admin", "editor"]);

  const id = String(formData.get("id") ?? "");
  if (!id) {
    return { error: "Missing post id." };
  }

  const parsed = parseBlogPostForm(formData);
  if (!parsed.success) {
    return { fieldErrors: parsed.error.flatten().fieldErrors as Record<string, string[]> };
  }

  const intent = formData.get("intent");
  const supabase = await createClient();

  const { data: existing } = await supabase
    .from("blog_posts")
    .select("status, published_at")
    .eq("id", id)
    .single();

  let status = existing?.status ?? "draft";
  let publishedAt = existing?.published_at ?? null;

  if (intent === "publish") {
    status = "published";
    publishedAt = publishedAt ?? new Date().toISOString();
  } else if (intent === "unpublish" || intent === "draft") {
    status = "draft";
  }

  const { error } = await supabase
    .from("blog_posts")
    .update({
      title: parsed.data.title,
      slug: parsed.data.slug,
      excerpt: parsed.data.excerpt,
      cover_image_url: parsed.data.coverImageUrl,
      content: parsed.data.content,
      status,
      seo_title: parsed.data.seoTitle,
      seo_description: parsed.data.seoDescription,
      published_at: publishedAt,
    })
    .eq("id", id);

  if (error) {
    return { error: humanizeBlogError(error) };
  }

  revalidatePath("/admin/blog");
  updateTag(BLOG_TAG);
  redirect("/admin/blog");
}

export async function deleteBlogPost(formData: FormData) {
  await requireRole(["admin", "editor"]);
  const id = String(formData.get("id") ?? "");
  if (!id) return;

  const supabase = await createClient();
  const { error } = await supabase.from("blog_posts").delete().eq("id", id);
  if (error) {
    throw new Error("Could not delete this post.");
  }

  revalidatePath("/admin/blog");
  updateTag(BLOG_TAG);
}
