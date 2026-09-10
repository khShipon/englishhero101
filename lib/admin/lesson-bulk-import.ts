import { lessonContentSchema, type LessonContent } from "@/types/lesson-content";
import { parseLessonContentText } from "@/lib/admin/lesson-content-text";
import type { CsvRow } from "@/lib/admin/csv-import";

export const MAX_LESSON_CSV_ROWS = 200;
export const MAX_LESSON_JSON_ITEMS = 200;

export const LESSON_CSV_COLUMNS = [
  "title",
  "slug",
  "category",
  "excerpt",
  "content",
  "difficulty",
  "estimated_minutes",
  "status",
  "seo_title",
  "seo_description",
] as const;

function csvField(value: string): string {
  return /[",\n]/.test(value) ? `"${value.replace(/"/g, '""')}"` : value;
}

const SAMPLE_CONTENT_1 = `## Present Simple

The present simple describes habits, facts, and routines.

[example]
She **walks** to school every day.

- Use it for daily routines
- Use it for facts that are always true
- Add *-s* or *-es* for he/she/it

[note]
Don't confuse this with the present continuous, which describes actions happening right now.`;

const SAMPLE_CONTENT_2 = `## Key vocabulary

Match each word with its Bangla meaning before moving on.

1. Meticulous — showing great attention to detail
2. Resilient — able to recover quickly from difficulties

> "Success is the sum of small efforts, repeated day in and day out."`;

export const LESSON_CSV_TEMPLATE =
  LESSON_CSV_COLUMNS.join(",") +
  "\n" +
  [
    [
      "Present Simple Tense",
      "present-simple-tense",
      "grammar/tenses",
      "Learn how and when to use the present simple.",
      SAMPLE_CONTENT_1,
      "beginner",
      "15",
      "draft",
      "Present Simple Tense — EnglishHero101",
      "Learn the present simple tense with examples and rules.",
    ],
    [
      "Everyday Vocabulary: Part 1",
      "everyday-vocabulary-part-1",
      "vocabulary",
      "Ten common words with meanings and examples.",
      SAMPLE_CONTENT_2,
      "intermediate",
      "10",
      "",
      "",
      "",
    ],
  ]
    .map((row) => row.map(csvField).join(","))
    .join("\n") +
  "\n";

export const LESSON_JSON_TEMPLATE = JSON.stringify(
  [
    {
      title: "Present Simple Tense",
      slug: "present-simple-tense",
      category: "grammar/tenses",
      excerpt: "Learn how and when to use the present simple.",
      difficulty: "beginner",
      estimatedMinutes: 15,
      status: "draft",
      seoTitle: "Present Simple Tense — EnglishHero101",
      seoDescription: "Learn the present simple tense with examples and rules.",
      content: SAMPLE_CONTENT_1,
    },
    {
      title: "Everyday Vocabulary: Part 1",
      slug: "everyday-vocabulary-part-1",
      category: "vocabulary",
      excerpt: "Ten common words with meanings and examples.",
      difficulty: "intermediate",
      estimatedMinutes: 10,
      content: SAMPLE_CONTENT_2,
    },
  ],
  null,
  2,
);

export type LessonImportInsert = {
  title: string;
  slug: string;
  excerpt: string | null;
  content: LessonContent;
  difficulty: "beginner" | "intermediate" | "advanced" | null;
  estimated_minutes: number | null;
  status: "draft" | "published";
  seo_title: string | null;
  seo_description: string | null;
};

export type LessonImportRowResult =
  | { ok: true; label: string; category: string; data: LessonImportInsert }
  | { ok: false; label: string; error: string };

function toTrimmedString(value: unknown): string | undefined {
  if (value === undefined || value === null) return undefined;
  return String(value).trim();
}

type ContentResolution = { ok: true; value: LessonContent } | { ok: false; error: string };

// Content can be either the lightweight text format (see
// lesson-content-text.ts — what the CSV template and JSON template
// both use) or a full Tiptap document object, for callers that want
// exact control over the saved content.
function resolveContent(raw: unknown): ContentResolution {
  if (typeof raw === "string") {
    if (!raw.trim()) return { ok: false, error: "'content' is required." };
    return { ok: true, value: parseLessonContentText(raw) };
  }
  if (raw && typeof raw === "object") {
    const parsed = lessonContentSchema.safeParse(raw);
    if (!parsed.success) {
      return { ok: false, error: "'content' must be text or a valid lesson content document." };
    }
    return { ok: true, value: parsed.data };
  }
  return { ok: false, error: "'content' is required (text, or a lesson content document)." };
}

type LessonImportFields = {
  title: unknown;
  slug: unknown;
  category: unknown;
  excerpt: unknown;
  difficulty: unknown;
  estimatedMinutes: unknown;
  status: unknown;
  seoTitle: unknown;
  seoDescription: unknown;
  content: unknown;
};

function validateLessonImportCore(fields: LessonImportFields, label: string): LessonImportRowResult {
  const fail = (error: string): LessonImportRowResult => ({ ok: false, label, error });

  const title = toTrimmedString(fields.title) ?? "";
  if (!title) return fail("Missing required 'title'.");
  if (title.length > 200) return fail("'title' is too long (max 200 characters).");

  const slug = (toTrimmedString(fields.slug) ?? "").toLowerCase();
  if (!slug) return fail("Missing required 'slug'.");
  if (!/^[a-z0-9]+(-[a-z0-9]+)*$/.test(slug)) {
    return fail(`'slug' must use lowercase letters, numbers, and hyphens only (got "${slug}").`);
  }

  const category = toTrimmedString(fields.category) ?? "";
  if (!category) {
    return fail('Missing required \'category\' (the category slug path, e.g. "grammar/tenses").');
  }

  const excerptRaw = toTrimmedString(fields.excerpt);
  const excerpt = excerptRaw || null;
  if (excerpt && excerpt.length > 500) return fail("'excerpt' is too long (max 500 characters).");

  let difficulty: LessonImportInsert["difficulty"] = null;
  const difficultyRaw = toTrimmedString(fields.difficulty)?.toLowerCase();
  if (difficultyRaw) {
    if (!["beginner", "intermediate", "advanced"].includes(difficultyRaw)) {
      return fail(`'difficulty' must be beginner, intermediate, advanced, or blank (got "${difficultyRaw}").`);
    }
    difficulty = difficultyRaw as LessonImportInsert["difficulty"];
  }

  let estimatedMinutes: number | null = null;
  const estimatedRaw = fields.estimatedMinutes;
  if (estimatedRaw !== undefined && estimatedRaw !== null && estimatedRaw !== "") {
    const n = typeof estimatedRaw === "number" ? estimatedRaw : Number(estimatedRaw);
    if (!Number.isFinite(n) || !Number.isInteger(n) || n <= 0 || n > 600) {
      return fail(`'estimatedMinutes' must be a whole number between 1 and 600 (got "${estimatedRaw}").`);
    }
    estimatedMinutes = n;
  }

  let status: LessonImportInsert["status"] = "draft";
  const statusRaw = toTrimmedString(fields.status)?.toLowerCase();
  if (statusRaw) {
    if (statusRaw !== "draft" && statusRaw !== "published") {
      return fail(`'status' must be draft or published, or blank (got "${statusRaw}").`);
    }
    status = statusRaw;
  }

  const seoTitleRaw = toTrimmedString(fields.seoTitle);
  const seoTitle = seoTitleRaw || null;
  if (seoTitle && seoTitle.length > 200) return fail("'seoTitle' is too long (max 200 characters).");

  const seoDescriptionRaw = toTrimmedString(fields.seoDescription);
  const seoDescription = seoDescriptionRaw || null;
  if (seoDescription && seoDescription.length > 300) {
    return fail("'seoDescription' is too long (max 300 characters).");
  }

  const contentResult = resolveContent(fields.content);
  if (!contentResult.ok) return fail(contentResult.error);
  if (contentResult.value.content.length === 0) {
    return fail("'content' produced no content — check the formatting against the template.");
  }

  return {
    ok: true,
    label,
    category,
    data: {
      title,
      slug,
      excerpt,
      content: contentResult.value,
      difficulty,
      estimated_minutes: estimatedMinutes,
      status,
      seo_title: seoTitle,
      seo_description: seoDescription,
    },
  };
}

export function validateLessonCsvRow(row: CsvRow, rowNumber: number): LessonImportRowResult {
  return validateLessonImportCore(
    {
      title: row.title,
      slug: row.slug,
      category: row.category,
      excerpt: row.excerpt,
      difficulty: row.difficulty,
      estimatedMinutes: row.estimated_minutes,
      status: row.status,
      seoTitle: row.seo_title,
      seoDescription: row.seo_description,
      content: row.content,
    },
    `Row ${rowNumber}`,
  );
}

export function validateLessonJsonItem(item: unknown, index: number): LessonImportRowResult {
  const label = `Lesson ${index + 1}`;
  if (!item || typeof item !== "object" || Array.isArray(item)) {
    return { ok: false, label, error: "Expected an object with lesson fields." };
  }
  const r = item as Record<string, unknown>;
  return validateLessonImportCore(
    {
      title: r.title,
      slug: r.slug,
      category: r.category,
      excerpt: r.excerpt,
      difficulty: r.difficulty,
      estimatedMinutes: r.estimatedMinutes,
      status: r.status,
      seoTitle: r.seoTitle,
      seoDescription: r.seoDescription,
      content: r.content,
    },
    label,
  );
}

// A JSON import document is either one lesson object or an array of
// them, so a single-lesson export from an AI tool doesn't need to be
// hand-wrapped in `[ ]`.
export function normalizeLessonJsonPayload(raw: unknown): unknown[] | { error: string } {
  if (Array.isArray(raw)) return raw;
  if (raw && typeof raw === "object") return [raw];
  return { error: "Expected a lesson object or an array of lesson objects." };
}
