"use server";

import { redirect } from "next/navigation";
import { revalidatePath, updateTag } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { requireRole } from "@/lib/auth/dal";
import { vocabularySchema } from "@/lib/admin/vocabulary-validation";
import { getNodeBySlugPath } from "@/lib/queries/content";

// Matches the cacheTag() call in lib/queries/vocabulary.ts.
const VOCABULARY_TAG = "vocabulary";
import { parseCsv, MAX_CSV_SIZE_BYTES, type CsvImportState } from "@/lib/admin/csv-import";
import {
  validateVocabularyCsvRow,
  MAX_VOCABULARY_CSV_ROWS,
  type VocabularyCsvRowResult,
} from "@/lib/admin/vocabulary-csv";

export type VocabularyFormState =
  | {
      error?: string;
      fieldErrors?: Record<string, string[]>;
    }
  | undefined;

function parseVocabularyForm(formData: FormData) {
  return vocabularySchema.safeParse({
    word: formData.get("word"),
    pronunciation: formData.get("pronunciation") ?? "",
    partOfSpeech: formData.get("partOfSpeech") ?? "",
    banglaMeaning: formData.get("banglaMeaning") ?? "",
    englishDefinition: formData.get("englishDefinition") ?? "",
    exampleSentence: formData.get("exampleSentence") ?? "",
    synonyms: formData.get("synonyms") ?? "",
    antonyms: formData.get("antonyms") ?? "",
    relatedWords: formData.get("relatedWords") ?? "",
    difficulty: formData.get("difficulty") ?? "none",
    nodeId: formData.get("nodeId") ?? "",
  });
}

export async function createVocabulary(
  _state: VocabularyFormState,
  formData: FormData,
): Promise<VocabularyFormState> {
  await requireRole(["admin", "editor"]);

  const parsed = parseVocabularyForm(formData);
  if (!parsed.success) {
    return { fieldErrors: parsed.error.flatten().fieldErrors as Record<string, string[]> };
  }

  const supabase = await createClient();
  const { error } = await supabase.from("vocabulary").insert({
    word: parsed.data.word,
    pronunciation: parsed.data.pronunciation,
    part_of_speech: parsed.data.partOfSpeech,
    bangla_meaning: parsed.data.banglaMeaning,
    english_definition: parsed.data.englishDefinition,
    example_sentence: parsed.data.exampleSentence,
    synonyms: parsed.data.synonyms,
    antonyms: parsed.data.antonyms,
    related_words: parsed.data.relatedWords,
    difficulty: parsed.data.difficulty,
    node_id: parsed.data.nodeId,
  });

  if (error) {
    return { error: "Could not save this vocabulary entry. Please try again." };
  }

  revalidatePath("/admin/vocabulary");
  updateTag(VOCABULARY_TAG);
  redirect("/admin/vocabulary");
}

export async function updateVocabulary(
  _state: VocabularyFormState,
  formData: FormData,
): Promise<VocabularyFormState> {
  await requireRole(["admin", "editor"]);

  const id = String(formData.get("id") ?? "");
  if (!id) {
    return { error: "Missing vocabulary id." };
  }

  const parsed = parseVocabularyForm(formData);
  if (!parsed.success) {
    return { fieldErrors: parsed.error.flatten().fieldErrors as Record<string, string[]> };
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("vocabulary")
    .update({
      word: parsed.data.word,
      pronunciation: parsed.data.pronunciation,
      part_of_speech: parsed.data.partOfSpeech,
      bangla_meaning: parsed.data.banglaMeaning,
      english_definition: parsed.data.englishDefinition,
      example_sentence: parsed.data.exampleSentence,
      synonyms: parsed.data.synonyms,
      antonyms: parsed.data.antonyms,
      related_words: parsed.data.relatedWords,
      difficulty: parsed.data.difficulty,
      node_id: parsed.data.nodeId,
    })
    .eq("id", id);

  if (error) {
    return { error: "Could not save this vocabulary entry. Please try again." };
  }

  revalidatePath("/admin/vocabulary");
  updateTag(VOCABULARY_TAG);
  redirect("/admin/vocabulary");
}

export async function importVocabularyCsv(
  _state: CsvImportState,
  formData: FormData,
): Promise<CsvImportState> {
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
  if (rows.length > MAX_VOCABULARY_CSV_ROWS) {
    return { error: `Too many rows — max ${MAX_VOCABULARY_CSV_ROWS} per import.` };
  }

  const validated = rows.map((row, index) => validateVocabularyCsvRow(row, index + 2));
  const failed = validated.filter(
    (result): result is Extract<VocabularyCsvRowResult, { ok: false }> => !result.ok,
  );

  if (failed.length > 0) {
    return {
      error: `${failed.length} row(s) have errors. Fix them and re-upload.`,
      rowErrors: failed.map((result) => `Row ${result.row}: ${result.error}`),
    };
  }

  const validRows = validated.filter(
    (result): result is Extract<VocabularyCsvRowResult, { ok: true }> => result.ok,
  );

  // Resolve every unique category_slug to a node id in one batch,
  // rather than trusting client-supplied ids that could point
  // anywhere.
  const uniqueSlugs = [
    ...new Set(validRows.map((r) => r.categorySlug).filter((slug): slug is string => slug !== null)),
  ];
  const resolved = await Promise.all(
    uniqueSlugs.map(async (slug) => ({
      slug,
      node: await getNodeBySlugPath(slug.split("/").filter(Boolean)),
    })),
  );
  const unresolvedSlugs = resolved.filter((r) => !r.node).map((r) => r.slug);

  if (unresolvedSlugs.length > 0) {
    return {
      error: "Some category_slug values don't match an existing category.",
      rowErrors: unresolvedSlugs.map(
        (slug) => `"${slug}" not found — check the slug path (e.g. "grammar/tense").`,
      ),
    };
  }

  const slugToId = new Map(resolved.map((r) => [r.slug, r.node!.id]));

  const supabase = await createClient();
  const { error } = await supabase.from("vocabulary").insert(
    validRows.map((r) => ({
      ...r.data,
      node_id: r.categorySlug ? (slugToId.get(r.categorySlug) ?? null) : null,
    })),
  );

  if (error) {
    return { error: "Import failed. Please try again." };
  }

  revalidatePath("/admin/vocabulary");
  updateTag(VOCABULARY_TAG);
  redirect("/admin/vocabulary");
}

export async function deleteVocabulary(formData: FormData) {
  await requireRole(["admin", "editor"]);
  const id = String(formData.get("id") ?? "");
  if (!id) return;

  const supabase = await createClient();
  const { error } = await supabase.from("vocabulary").delete().eq("id", id);
  if (error) {
    throw new Error("Could not delete this vocabulary entry.");
  }

  revalidatePath("/admin/vocabulary");
  updateTag(VOCABULARY_TAG);
}
