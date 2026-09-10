import { lessonContentSchema, type LessonContent } from "@/types/lesson-content";
import { parseLessonContentText } from "@/lib/admin/lesson-content-text";
import type { CsvRow } from "@/lib/admin/csv-import";

// Mirrors lib/admin/lesson-bulk-import.ts — blog posts use the exact
// same Tiptap content schema as lessons, so the same lightweight text
// format (lesson-content-text.ts) works here too.

export const MAX_BLOG_CSV_ROWS = 100;
export const MAX_BLOG_JSON_ITEMS = 100;

export const BLOG_CSV_COLUMNS = [
  "title",
  "slug",
  "excerpt",
  "cover_image_url",
  "content",
  "status",
  "seo_title",
  "seo_description",
] as const;

function csvField(value: string): string {
  return /[",\n]/.test(value) ? `"${value.replace(/"/g, '""')}"` : value;
}

const SAMPLE_CONTENT = `## 5 Tips for Better IELTS Writing

Consistent practice and clear structure make the biggest difference.

[example]
Instead of "I think that", try **"It is often argued that"** for a more formal tone.

- Plan your paragraphs before you write
- Use linking words like *however* and *therefore*
- Check your word count`;

export const BLOG_CSV_TEMPLATE =
  BLOG_CSV_COLUMNS.join(",") +
  "\n" +
  [
    [
      "5 Tips for Better IELTS Writing",
      "5-tips-for-better-ielts-writing",
      "Quick, practical advice to raise your Writing Task 2 score.",
      "",
      SAMPLE_CONTENT,
      "draft",
      "5 Tips for Better IELTS Writing — EnglishHero101",
      "Practical, easy-to-apply tips to improve your IELTS Writing Task 2 score.",
    ],
  ]
    .map((row) => row.map(csvField).join(","))
    .join("\n") +
  "\n";

export const BLOG_JSON_TEMPLATE = JSON.stringify(
  [
    {
      title: "5 Tips for Better IELTS Writing",
      slug: "5-tips-for-better-ielts-writing",
      excerpt: "Quick, practical advice to raise your Writing Task 2 score.",
      status: "draft",
      seoTitle: "5 Tips for Better IELTS Writing — EnglishHero101",
      seoDescription: "Practical, easy-to-apply tips to improve your IELTS Writing Task 2 score.",
      content: SAMPLE_CONTENT,
    },
  ],
  null,
  2,
);

export type BlogImportInsert = {
  title: string;
  slug: string;
  excerpt: string | null;
  cover_image_url: string | null;
  content: LessonContent;
  status: "draft" | "published";
  seo_title: string | null;
  seo_description: string | null;
};

export type BlogImportRowResult =
  | { ok: true; label: string; data: BlogImportInsert }
  | { ok: false; label: string; error: string };

function toTrimmedString(value: unknown): string | undefined {
  if (value === undefined || value === null) return undefined;
  return String(value).trim();
}

type ContentResolution = { ok: true; value: LessonContent } | { ok: false; error: string };

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

type BlogImportFields = {
  title: unknown;
  slug: unknown;
  excerpt: unknown;
  coverImageUrl: unknown;
  status: unknown;
  seoTitle: unknown;
  seoDescription: unknown;
  content: unknown;
};

function validateBlogImportCore(fields: BlogImportFields, label: string): BlogImportRowResult {
  const fail = (error: string): BlogImportRowResult => ({ ok: false, label, error });

  const title = toTrimmedString(fields.title) ?? "";
  if (!title) return fail("Missing required 'title'.");
  if (title.length > 200) return fail("'title' is too long (max 200 characters).");

  const slug = (toTrimmedString(fields.slug) ?? "").toLowerCase();
  if (!slug) return fail("Missing required 'slug'.");
  if (!/^[a-z0-9]+(-[a-z0-9]+)*$/.test(slug)) {
    return fail(`'slug' must use lowercase letters, numbers, and hyphens only (got "${slug}").`);
  }

  const excerptRaw = toTrimmedString(fields.excerpt);
  const excerpt = excerptRaw || null;
  if (excerpt && excerpt.length > 500) return fail("'excerpt' is too long (max 500 characters).");

  const coverImageRaw = toTrimmedString(fields.coverImageUrl);
  const coverImageUrl = coverImageRaw || null;
  if (coverImageUrl && coverImageUrl.length > 2000) {
    return fail("'coverImageUrl' is too long (max 2000 characters).");
  }

  let status: BlogImportInsert["status"] = "draft";
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
    data: {
      title,
      slug,
      excerpt,
      cover_image_url: coverImageUrl,
      content: contentResult.value,
      status,
      seo_title: seoTitle,
      seo_description: seoDescription,
    },
  };
}

export function validateBlogCsvRow(row: CsvRow, rowNumber: number): BlogImportRowResult {
  return validateBlogImportCore(
    {
      title: row.title,
      slug: row.slug,
      excerpt: row.excerpt,
      coverImageUrl: row.cover_image_url,
      status: row.status,
      seoTitle: row.seo_title,
      seoDescription: row.seo_description,
      content: row.content,
    },
    `Row ${rowNumber}`,
  );
}

export function validateBlogJsonItem(item: unknown, index: number): BlogImportRowResult {
  const label = `Post ${index + 1}`;
  if (!item || typeof item !== "object" || Array.isArray(item)) {
    return { ok: false, label, error: "Expected an object with post fields." };
  }
  const r = item as Record<string, unknown>;
  return validateBlogImportCore(
    {
      title: r.title,
      slug: r.slug,
      excerpt: r.excerpt,
      coverImageUrl: r.coverImageUrl,
      status: r.status,
      seoTitle: r.seoTitle,
      seoDescription: r.seoDescription,
      content: r.content,
    },
    label,
  );
}

export function normalizeBlogJsonPayload(raw: unknown): unknown[] | { error: string } {
  if (Array.isArray(raw)) return raw;
  if (raw && typeof raw === "object") return [raw];
  return { error: "Expected a post object or an array of post objects." };
}
