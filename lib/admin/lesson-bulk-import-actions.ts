"use server";

import { redirect } from "next/navigation";
import { revalidatePath, updateTag } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { requireRole } from "@/lib/auth/dal";
import { getNodeBySlugPath } from "@/lib/queries/content";
import { parseCsv, MAX_CSV_SIZE_BYTES } from "@/lib/admin/csv-import";
import {
  validateLessonCsvRow,
  validateLessonJsonItem,
  normalizeLessonJsonPayload,
  MAX_LESSON_CSV_ROWS,
  MAX_LESSON_JSON_ITEMS,
  type LessonImportRowResult,
} from "@/lib/admin/lesson-bulk-import";

// Matches the cacheTag() calls in lib/queries/lessons.ts's public-site
// functions.
const LESSONS_TAG = "lessons";

export type LessonImportState =
  | {
      error?: string;
      rowErrors?: string[];
    }
  | undefined;

type ValidLessonRow = Extract<LessonImportRowResult, { ok: true }>;

// Shared by both the CSV and JSON import actions once their rows have
// passed field-level validation: resolves each row's `category` slug
// path to a content node, inserts every lesson in one batch, and
// redirects to wherever the admin can see the result. Calls
// redirect() itself (which throws), so this only ever *returns* on an
// error path.
async function insertValidatedLessons(validRows: ValidLessonRow[]): Promise<LessonImportState> {
  const uniqueCategories = [...new Set(validRows.map((r) => r.category))];
  const resolved = await Promise.all(
    uniqueCategories.map(async (category) => ({
      category,
      node: await getNodeBySlugPath(category.split("/").filter(Boolean)),
    })),
  );
  const unresolved = resolved.filter((r) => !r.node).map((r) => r.category);

  if (unresolved.length > 0) {
    return {
      error: "Some category values don't match an existing category.",
      rowErrors: unresolved.map(
        (category) => `"${category}" not found — check the slug path (e.g. "grammar/tenses").`,
      ),
    };
  }

  const categoryToNodeId = new Map(resolved.map((r) => [r.category, r.node!.id]));

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { error } = await supabase.from("lessons").insert(
    validRows.map((r) => ({
      node_id: categoryToNodeId.get(r.category)!,
      title: r.data.title,
      slug: r.data.slug,
      excerpt: r.data.excerpt,
      content: r.data.content,
      status: r.data.status,
      difficulty: r.data.difficulty,
      estimated_minutes: r.data.estimated_minutes,
      author_id: user?.id ?? null,
      seo_title: r.data.seo_title,
      seo_description: r.data.seo_description,
      published_at: r.data.status === "published" ? new Date().toISOString() : null,
    })),
  );

  if (error) {
    if (error.code === "23505") {
      return {
        error:
          "One or more lessons have a slug that already exists under their category. Fix the slugs and re-upload.",
      };
    }
    return { error: "Import failed. Please try again." };
  }

  const touchedNodeIds = [...new Set(categoryToNodeId.values())];
  for (const nodeId of touchedNodeIds) {
    revalidatePath(`/admin/content/${nodeId}/lessons`);
  }
  updateTag(LESSONS_TAG);

  redirect(touchedNodeIds.length === 1 ? `/admin/content/${touchedNodeIds[0]}/lessons` : "/admin/content");
}

function collectRowErrors(failed: Extract<LessonImportRowResult, { ok: false }>[]): string[] {
  return failed.map((result) => `${result.label}: ${result.error}`);
}

export async function importLessonsCsv(
  _state: LessonImportState,
  formData: FormData,
): Promise<LessonImportState> {
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
  if (rows.length > MAX_LESSON_CSV_ROWS) {
    return { error: `Too many rows — max ${MAX_LESSON_CSV_ROWS} per import.` };
  }

  const validated = rows.map((row, index) => validateLessonCsvRow(row, index + 2));
  const failed = validated.filter(
    (result): result is Extract<LessonImportRowResult, { ok: false }> => !result.ok,
  );

  if (failed.length > 0) {
    return {
      error: `${failed.length} row(s) have errors. Fix them and re-upload.`,
      rowErrors: collectRowErrors(failed),
    };
  }

  const validRows = validated.filter((result): result is ValidLessonRow => result.ok);
  return insertValidatedLessons(validRows);
}

export async function importLessonsJson(
  _state: LessonImportState,
  formData: FormData,
): Promise<LessonImportState> {
  await requireRole(["admin", "editor"]);

  let raw: unknown;
  try {
    raw = JSON.parse(String(formData.get("payload") ?? ""));
  } catch {
    return { error: "That isn't valid JSON — check for a missing comma or bracket." };
  }

  const items = normalizeLessonJsonPayload(raw);
  if (!Array.isArray(items)) {
    return { error: items.error };
  }
  if (items.length === 0) {
    return { error: "No lessons found in this document." };
  }
  if (items.length > MAX_LESSON_JSON_ITEMS) {
    return { error: `Too many lessons — max ${MAX_LESSON_JSON_ITEMS} per import.` };
  }

  const validated = items.map((item, index) => validateLessonJsonItem(item, index));
  const failed = validated.filter(
    (result): result is Extract<LessonImportRowResult, { ok: false }> => !result.ok,
  );

  if (failed.length > 0) {
    return {
      error: `${failed.length} lesson(s) have errors. Fix them and re-import.`,
      rowErrors: collectRowErrors(failed),
    };
  }

  const validRows = validated.filter((result): result is ValidLessonRow => result.ok);
  return insertValidatedLessons(validRows);
}
