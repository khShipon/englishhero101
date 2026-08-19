import * as z from "zod";
import { splitMultiValue, type CsvRow } from "@/lib/admin/csv-import";

export const MAX_VOCABULARY_CSV_ROWS = 500;

export const VOCABULARY_CSV_COLUMNS = [
  "word",
  "pronunciation",
  "part_of_speech",
  "bangla_meaning",
  "english_definition",
  "example_sentence",
  "synonyms",
  "antonyms",
  "related_words",
  "difficulty",
  "category_slug",
] as const;

export const VOCABULARY_CSV_TEMPLATE = `word,pronunciation,part_of_speech,bangla_meaning,english_definition,example_sentence,synonyms,antonyms,related_words,difficulty,category_slug
Meticulous,/mə'tɪkjələs/,adjective,সূক্ষ্ম,Showing great attention to detail,She is meticulous about her work.,careful; thorough,careless; sloppy,precision; diligence,intermediate,vocabulary
Resilient,/rɪ'zɪliənt/,adjective,স্থিতিস্থাপক,Able to recover quickly from difficulties,Children are often remarkably resilient.,tough; adaptable,fragile; weak,,advanced,
`;

const difficultySchema = z
  .string()
  .transform((value) => value.toLowerCase())
  .pipe(z.enum(["", "beginner", "intermediate", "advanced"]))
  .transform((value) => (value === "" ? null : value));

export type VocabularyCsvInsert = {
  word: string;
  pronunciation: string | null;
  part_of_speech: string | null;
  bangla_meaning: string | null;
  english_definition: string | null;
  example_sentence: string | null;
  synonyms: string[];
  antonyms: string[];
  related_words: string[];
  difficulty: string | null;
  node_id: string | null;
};

export type VocabularyCsvRowResult =
  | { ok: true; data: VocabularyCsvInsert; categorySlug: string | null }
  | { ok: false; row: number; error: string };

const orNull = (value: string | undefined) => (value && value.trim() !== "" ? value.trim() : null);

// Validates one already-parsed CSV row. Category slugs are resolved
// separately in a batch (see vocabulary-actions.ts) since that needs a
// database round trip; this function stays synchronous and pure so it
// can also drive the client-side instant preview.
export function validateVocabularyCsvRow(row: CsvRow, rowNumber: number): VocabularyCsvRowResult {
  const word = row.word?.trim();
  if (!word) {
    return { ok: false, row: rowNumber, error: "Missing required 'word' value." };
  }
  if (word.length > 200) {
    return { ok: false, row: rowNumber, error: "'word' is too long (max 200 characters)." };
  }

  const difficultyResult = difficultySchema.safeParse(row.difficulty ?? "");
  if (!difficultyResult.success) {
    return {
      ok: false,
      row: rowNumber,
      error: `'difficulty' must be beginner, intermediate, advanced, or blank (got "${row.difficulty}").`,
    };
  }

  const categorySlug = row.category_slug?.trim() || null;

  return {
    ok: true,
    categorySlug,
    data: {
      word,
      pronunciation: orNull(row.pronunciation),
      part_of_speech: orNull(row.part_of_speech),
      bangla_meaning: orNull(row.bangla_meaning),
      english_definition: orNull(row.english_definition),
      example_sentence: orNull(row.example_sentence),
      synonyms: splitMultiValue(row.synonyms),
      antonyms: splitMultiValue(row.antonyms),
      related_words: splitMultiValue(row.related_words),
      difficulty: difficultyResult.data,
      node_id: null, // filled in after batch slug resolution
    },
  };
}
