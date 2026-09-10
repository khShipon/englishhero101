import { splitMultiValue } from "@/lib/admin/csv-import";
import type { VocabularyCsvInsert } from "@/lib/admin/vocabulary-csv";

// JSON counterpart to lib/admin/vocabulary-csv.ts's CSV row validator
// — same insert shape, but reads camelCase fields and accepts either
// a real array or a ";"-joined string for multi-value fields, so an
// AI model can produce whichever is more natural.

export const MAX_VOCABULARY_JSON_ITEMS = 500;

const SAMPLE_1 = {
  word: "Meticulous",
  pronunciation: "/mə'tɪkjələs/",
  partOfSpeech: "adjective",
  banglaMeaning: "সূক্ষ্ম",
  englishDefinition: "Showing great attention to detail",
  exampleSentence: "She is meticulous about her work.",
  synonyms: ["careful", "thorough"],
  antonyms: ["careless", "sloppy"],
  relatedWords: ["precision", "diligence"],
  difficulty: "intermediate",
  category: "vocabulary",
};

const SAMPLE_2 = {
  word: "Resilient",
  pronunciation: "/rɪ'zɪliənt/",
  partOfSpeech: "adjective",
  banglaMeaning: "স্থিতিস্থাপক",
  englishDefinition: "Able to recover quickly from difficulties",
  exampleSentence: "Children are often remarkably resilient.",
  synonyms: ["tough", "adaptable"],
  antonyms: ["fragile", "weak"],
  difficulty: "advanced",
};

export const VOCABULARY_JSON_TEMPLATE = JSON.stringify([SAMPLE_1, SAMPLE_2], null, 2);

export type VocabularyJsonRowResult =
  | { ok: true; label: string; data: VocabularyCsvInsert; categorySlug: string | null }
  | { ok: false; label: string; error: string };

function toArray(value: unknown): string[] {
  if (Array.isArray(value)) return value.map((v) => String(v).trim()).filter((v) => v.length > 0);
  if (typeof value === "string") return splitMultiValue(value);
  return [];
}

function orNull(value: unknown): string | null {
  return typeof value === "string" && value.trim() !== "" ? value.trim() : null;
}

export function validateVocabularyJsonItem(item: unknown, index: number): VocabularyJsonRowResult {
  const label = `Word ${index + 1}`;
  if (!item || typeof item !== "object" || Array.isArray(item)) {
    return { ok: false, label, error: "Expected an object with word fields." };
  }
  const r = item as Record<string, unknown>;

  const word = typeof r.word === "string" ? r.word.trim() : "";
  if (!word) {
    return { ok: false, label, error: "Missing required 'word'." };
  }
  if (word.length > 200) {
    return { ok: false, label, error: "'word' is too long (max 200 characters)." };
  }

  const difficultyRaw = typeof r.difficulty === "string" ? r.difficulty.trim().toLowerCase() : "";
  if (difficultyRaw && !["beginner", "intermediate", "advanced"].includes(difficultyRaw)) {
    return {
      ok: false,
      label,
      error: `'difficulty' must be beginner, intermediate, advanced, or blank (got "${r.difficulty}").`,
    };
  }

  const categoryRaw = typeof r.category === "string" ? r.category : r.categorySlug;
  const categorySlug = typeof categoryRaw === "string" && categoryRaw.trim() ? categoryRaw.trim() : null;

  return {
    ok: true,
    label,
    categorySlug,
    data: {
      word,
      pronunciation: orNull(r.pronunciation),
      part_of_speech: orNull(r.partOfSpeech),
      bangla_meaning: orNull(r.banglaMeaning),
      english_definition: orNull(r.englishDefinition),
      example_sentence: orNull(r.exampleSentence),
      synonyms: toArray(r.synonyms),
      antonyms: toArray(r.antonyms),
      related_words: toArray(r.relatedWords),
      difficulty: difficultyRaw || null,
      node_id: null,
    },
  };
}

export function normalizeVocabularyJsonPayload(raw: unknown): unknown[] | { error: string } {
  if (Array.isArray(raw)) return raw;
  if (raw && typeof raw === "object") return [raw];
  return { error: "Expected a word object or an array of word objects." };
}
