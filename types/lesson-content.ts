import * as z from "zod";

// Semantic callout blocks the brief asks for (examples, notes,
// highlighted sections, grammar rules, questions, answers) are one
// custom Tiptap node with a `variant` attribute rather than six
// separate node types.
export const CALLOUT_VARIANTS = [
  "example",
  "note",
  "highlight",
  "grammar-rule",
  "question",
  "answer",
] as const;

export type CalloutVariant = (typeof CALLOUT_VARIANTS)[number];

// Word-style text highlighter colors (a small fixed palette, matching
// how Word's highlighter offers a handful of preset swatches rather
// than an open color picker).
export const HIGHLIGHT_COLORS = ["yellow", "green", "blue", "pink"] as const;
export type HighlightColor = (typeof HIGHLIGHT_COLORS)[number];

// Paragraph/heading alignment, Word's own set (no full-justify-only
// edge cases to worry about since this is just a CSS text-align).
export const TEXT_ALIGNS = ["left", "center", "right", "justify"] as const;
export type TextAlign = (typeof TEXT_ALIGNS)[number];

// Only http(s), mailto, same-site-relative, and in-page anchor links
// are accepted — closes off `javascript:`/`data:` URLs at the one
// place all lesson content is validated before being persisted
// (lib/admin/lesson-validation.ts pipes through lessonContentSchema),
// so a link mark can never become a script-execution vector even
// though the renderer sets its href directly.
const SAFE_HREF = /^(https?:\/\/|mailto:|\/|#)/i;

const markSchema = z.union([
  z.object({ type: z.literal("bold") }),
  z.object({ type: z.literal("italic") }),
  z.object({ type: z.literal("underline") }),
  z.object({ type: z.literal("strike") }),
  z.object({ type: z.literal("highlight"), attrs: z.object({ color: z.enum(HIGHLIGHT_COLORS) }) }),
  z.object({
    type: z.literal("link"),
    attrs: z.object({
      href: z.string().min(1).max(2000).regex(SAFE_HREF, { error: "Unsupported link type." }),
    }),
  }),
]);

export type LessonMark = z.infer<typeof markSchema>;

const textNodeSchema = z.object({
  type: z.literal("text"),
  text: z.string(),
  marks: z.array(markSchema).optional(),
});

export type LessonNode =
  | z.infer<typeof textNodeSchema>
  | { type: "paragraph"; attrs?: { textAlign?: TextAlign | null }; content?: LessonNode[] }
  | {
      type: "heading";
      attrs: { level: 2 | 3 | 4; textAlign?: TextAlign | null };
      content?: LessonNode[];
    }
  | { type: "bulletList"; content?: LessonNode[] }
  | { type: "orderedList"; content?: LessonNode[] }
  | { type: "listItem"; content?: LessonNode[] }
  | { type: "blockquote"; content?: LessonNode[] }
  | { type: "table"; content?: LessonNode[] }
  | { type: "tableRow"; content?: LessonNode[] }
  | { type: "tableCell"; content?: LessonNode[] }
  | { type: "tableHeader"; content?: LessonNode[] }
  | { type: "hardBreak" }
  | { type: "horizontalRule" }
  | { type: "callout"; attrs: { variant: CalloutVariant }; content?: LessonNode[] }
  | { type: "pronounce"; attrs: { text: string; label?: string } };

// Whitelist-based, recursive: only node/mark types the editor and
// renderer both know about survive validation. This is what makes
// storing/rendering lesson content safe from XSS — the renderer never
// touches dangerouslySetInnerHTML, it walks this exact shape and maps
// each known node type to a React element, so nothing outside this
// schema can ever reach the DOM as markup.
const lessonNodeSchema: z.ZodType<LessonNode> = z.lazy(() =>
  z.discriminatedUnion("type", [
    textNodeSchema,
    z.object({
      type: z.literal("paragraph"),
      attrs: z.object({ textAlign: z.enum(TEXT_ALIGNS).nullable().optional() }).optional(),
      content: z.array(lessonNodeSchema).optional(),
    }),
    z.object({
      type: z.literal("heading"),
      attrs: z.object({
        level: z.union([z.literal(2), z.literal(3), z.literal(4)]),
        textAlign: z.enum(TEXT_ALIGNS).nullable().optional(),
      }),
      content: z.array(lessonNodeSchema).optional(),
    }),
    z.object({ type: z.literal("bulletList"), content: z.array(lessonNodeSchema).optional() }),
    z.object({ type: z.literal("orderedList"), content: z.array(lessonNodeSchema).optional() }),
    z.object({ type: z.literal("listItem"), content: z.array(lessonNodeSchema).optional() }),
    z.object({ type: z.literal("blockquote"), content: z.array(lessonNodeSchema).optional() }),
    z.object({ type: z.literal("table"), content: z.array(lessonNodeSchema).optional() }),
    z.object({ type: z.literal("tableRow"), content: z.array(lessonNodeSchema).optional() }),
    z.object({ type: z.literal("tableCell"), content: z.array(lessonNodeSchema).optional() }),
    z.object({ type: z.literal("tableHeader"), content: z.array(lessonNodeSchema).optional() }),
    z.object({ type: z.literal("hardBreak") }),
    z.object({ type: z.literal("horizontalRule") }),
    z.object({
      type: z.literal("callout"),
      attrs: z.object({ variant: z.enum(CALLOUT_VARIANTS) }),
      content: z.array(lessonNodeSchema).optional(),
    }),
    z.object({
      type: z.literal("pronounce"),
      attrs: z.object({ text: z.string().min(1), label: z.string().optional() }),
    }),
  ]),
);

export const lessonContentSchema = z.object({
  type: z.literal("doc"),
  content: z.array(lessonNodeSchema),
});

export type LessonContent = z.infer<typeof lessonContentSchema>;

export const EMPTY_LESSON_CONTENT: LessonContent = { type: "doc", content: [] };
