import * as z from "zod";

function optionalText(max: number) {
  return z
    .string()
    .trim()
    .max(max)
    .transform((value) => (value === "" ? null : value));
}

// Comma-separated input (e.g. "omnipresent, pervasive") becomes a
// trimmed string[] — the simplest UI for a text[] column without
// pulling in a dedicated tag-input component.
function wordList(max: number) {
  return z
    .string()
    .transform((value) =>
      value
        .split(",")
        .map((item) => item.trim())
        .filter((item) => item.length > 0),
    )
    .pipe(z.array(z.string().max(100)).max(max));
}

export const vocabularySchema = z.object({
  word: z.string().trim().min(1, { error: "Word is required." }).max(200),
  pronunciation: optionalText(200),
  partOfSpeech: optionalText(50),
  banglaMeaning: optionalText(500),
  englishDefinition: optionalText(1000),
  exampleSentence: optionalText(1000),
  synonyms: wordList(50),
  antonyms: wordList(50),
  relatedWords: wordList(50),
  difficulty: z
    .enum(["none", "beginner", "intermediate", "advanced"])
    .transform((value) => (value === "none" ? null : value)),
  nodeId: z.string().transform((value) => (value === "" || value === "none" ? null : value)),
});

export type VocabularyFormValues = z.infer<typeof vocabularySchema>;
