import "server-only";
import { cacheLife, cacheTag } from "next/cache";
import { createPublicClient } from "@/lib/supabase/public";

const VOCABULARY_TAG = "vocabulary";

export type VocabularyEntry = {
  id: string;
  word: string;
  pronunciation: string | null;
  partOfSpeech: string | null;
  banglaMeaning: string | null;
  englishDefinition: string | null;
  exampleSentence: string | null;
  synonyms: string[];
  antonyms: string[];
  relatedWords: string[];
  difficulty: string | null;
  nodeId: string | null;
  createdAt: string;
  updatedAt: string;
};

export type VocabularyRow = {
  id: string;
  word: string;
  pronunciation: string | null;
  part_of_speech: string | null;
  bangla_meaning: string | null;
  english_definition: string | null;
  example_sentence: string | null;
  synonyms: string[] | null;
  antonyms: string[] | null;
  related_words: string[] | null;
  difficulty: string | null;
  node_id: string | null;
  created_at: string;
  updated_at: string;
};

export const VOCABULARY_COLUMNS =
  "id, word, pronunciation, part_of_speech, bangla_meaning, english_definition, example_sentence, synonyms, antonyms, related_words, difficulty, node_id, created_at, updated_at";

export function mapVocabulary(row: VocabularyRow): VocabularyEntry {
  return {
    id: row.id,
    word: row.word,
    pronunciation: row.pronunciation,
    partOfSpeech: row.part_of_speech,
    banglaMeaning: row.bangla_meaning,
    englishDefinition: row.english_definition,
    exampleSentence: row.example_sentence,
    synonyms: row.synonyms ?? [],
    antonyms: row.antonyms ?? [],
    relatedWords: row.related_words ?? [],
    difficulty: row.difficulty,
    nodeId: row.node_id,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

const PAGE_SIZE = 20;

// Read access is identical for anon and authenticated (no draft/publish
// state on vocabulary — see the "vocabulary_select_all" RLS policy), so
// this is safe to cache for both the public and admin list pages.
export async function getVocabularyList(
  search: string,
  page: number,
): Promise<{ items: VocabularyEntry[]; totalCount: number; pageSize: number }> {
  "use cache";
  cacheLife("hours");
  cacheTag(VOCABULARY_TAG);

  const supabase = createPublicClient();
  const from = (page - 1) * PAGE_SIZE;
  const to = from + PAGE_SIZE - 1;

  let query = supabase.from("vocabulary").select(VOCABULARY_COLUMNS, { count: "exact" }).order("word");

  if (search.trim()) {
    // Single-column ilike, not .or(...) — that method needs the
    // caller to hand-escape commas/parens in the search string to
    // stay safe from PostgREST filter injection, which isn't worth
    // the risk for a CMS search box.
    query = query.ilike("word", `%${search.trim()}%`);
  }

  const { data, error, count } = await query.range(from, to);
  if (error) throw error;

  return {
    items: (data ?? []).map(mapVocabulary),
    totalCount: count ?? 0,
    pageSize: PAGE_SIZE,
  };
}

export async function getVocabularyById(id: string): Promise<VocabularyEntry | null> {
  "use cache";
  cacheLife("hours");
  cacheTag(VOCABULARY_TAG);

  const supabase = createPublicClient();
  const { data, error } = await supabase
    .from("vocabulary")
    .select(VOCABULARY_COLUMNS)
    .eq("id", id)
    .maybeSingle();

  if (error) throw error;
  return data ? mapVocabulary(data) : null;
}

// Vocabulary scoped to one content node (e.g. an IELTS vocabulary
// category like "Education") -- used by CategoryPageView so a node's
// own word list shows on its page, in addition to the site-wide
// /vocabulary listing (which is unscoped and shows every word).
export async function getVocabularyByNode(nodeId: string): Promise<VocabularyEntry[]> {
  "use cache";
  cacheLife("hours");
  cacheTag(VOCABULARY_TAG);

  const supabase = createPublicClient();
  const { data, error } = await supabase
    .from("vocabulary")
    .select(VOCABULARY_COLUMNS)
    .eq("node_id", nodeId)
    .order("word");

  if (error) throw error;
  return (data ?? []).map(mapVocabulary);
}

// Vocabulary has no popularity/usage tracking yet, so "popular" is
// approximated with a recent selection — a reasonable stand-in until
// there's real usage data to rank by.
export async function getRecentVocabulary(limit = 8): Promise<VocabularyEntry[]> {
  "use cache";
  cacheLife("hours");
  cacheTag(VOCABULARY_TAG);

  const supabase = createPublicClient();
  const { data, error } = await supabase
    .from("vocabulary")
    .select(VOCABULARY_COLUMNS)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) throw error;
  return (data ?? []).map(mapVocabulary);
}
