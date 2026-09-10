"use server";

import { redirect } from "next/navigation";
import { revalidatePath, updateTag } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { requireRole } from "@/lib/auth/dal";
import { parseCsv, MAX_CSV_SIZE_BYTES } from "@/lib/admin/csv-import";
import {
  validateBlogCsvRow,
  validateBlogJsonItem,
  normalizeBlogJsonPayload,
  MAX_BLOG_CSV_ROWS,
  MAX_BLOG_JSON_ITEMS,
  type BlogImportRowResult,
} from "@/lib/admin/blog-bulk-import";

// Matches the cacheTag() calls in lib/queries/blog.ts's public-site
// functions.
const BLOG_TAG = "blog-posts";

export type BlogImportState =
  | {
      error?: string;
      rowErrors?: string[];
    }
  | undefined;

type ValidBlogRow = Extract<BlogImportRowResult, { ok: true }>;

async function insertValidatedPosts(validRows: ValidBlogRow[]): Promise<BlogImportState> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { error } = await supabase.from("blog_posts").insert(
    validRows.map((r) => ({
      title: r.data.title,
      slug: r.data.slug,
      excerpt: r.data.excerpt,
      cover_image_url: r.data.cover_image_url,
      content: r.data.content,
      status: r.data.status,
      author_id: user?.id ?? null,
      seo_title: r.data.seo_title,
      seo_description: r.data.seo_description,
      published_at: r.data.status === "published" ? new Date().toISOString() : null,
    })),
  );

  if (error) {
    if (error.code === "23505") {
      return { error: "One or more posts have a slug that already exists. Fix the slugs and re-upload." };
    }
    return { error: "Import failed. Please try again." };
  }

  revalidatePath("/admin/blog");
  updateTag(BLOG_TAG);
  redirect("/admin/blog");
}

function collectRowErrors(failed: Extract<BlogImportRowResult, { ok: false }>[]): string[] {
  return failed.map((result) => `${result.label}: ${result.error}`);
}

export async function importBlogPostsCsv(
  _state: BlogImportState,
  formData: FormData,
): Promise<BlogImportState> {
  await requireRole(["admin", "editor"]);

  const file = formData.get("file");
  if (!(file instanceof File) || file.size === 0) {
    return { error: "Choose a CSV file to upload." };
  }
  if (file.size > MAX_CSV_SIZE_BYTES) {
    return { error: "File is too large (max 2MB)." };
  }

  const text = await file.text();
  const { rows, errors: parseErrors } = parseCsv(text);

  if (parseErrors.length > 0) {
    return { error: "Could not read this CSV file.", rowErrors: parseErrors };
  }
  if (rows.length === 0) {
    return { error: "No rows found in this file." };
  }
  if (rows.length > MAX_BLOG_CSV_ROWS) {
    return { error: `Too many rows — max ${MAX_BLOG_CSV_ROWS} per import.` };
  }

  const validated = rows.map((row, index) => validateBlogCsvRow(row, index + 2));
  const failed = validated.filter(
    (result): result is Extract<BlogImportRowResult, { ok: false }> => !result.ok,
  );

  if (failed.length > 0) {
    return {
      error: `${failed.length} row(s) have errors. Fix them and re-upload.`,
      rowErrors: collectRowErrors(failed),
    };
  }

  const validRows = validated.filter((result): result is ValidBlogRow => result.ok);
  return insertValidatedPosts(validRows);
}

export async function importBlogPostsJson(
  _state: BlogImportState,
  formData: FormData,
): Promise<BlogImportState> {
  await requireRole(["admin", "editor"]);

  let raw: unknown;
  try {
    raw = JSON.parse(String(formData.get("payload") ?? ""));
  } catch {
    return { error: "That isn't valid JSON — check for a missing comma or bracket." };
  }

  const items = normalizeBlogJsonPayload(raw);
  if (!Array.isArray(items)) {
    return { error: items.error };
  }
  if (items.length === 0) {
    return { error: "No posts found in this document." };
  }
  if (items.length > MAX_BLOG_JSON_ITEMS) {
    return { error: `Too many posts — max ${MAX_BLOG_JSON_ITEMS} per import.` };
  }

  const validated = items.map((item, index) => validateBlogJsonItem(item, index));
  const failed = validated.filter(
    (result): result is Extract<BlogImportRowResult, { ok: false }> => !result.ok,
  );

  if (failed.length > 0) {
    return {
      error: `${failed.length} post(s) have errors. Fix them and re-import.`,
      rowErrors: collectRowErrors(failed),
    };
  }

  const validRows = validated.filter((result): result is ValidBlogRow => result.ok);
  return insertValidatedPosts(validRows);
}
