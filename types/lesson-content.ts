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

const markSchema = z.union([
  z.object({ type: z.literal("bold") }),
  z.object({ type: z.literal("italic") }),
  z.object({ type: z.literal("underline") }),
]);

const textNodeSchema = z.object({
  type: z.literal("text"),
  text: z.string(),
  marks: z.array(markSchema).optional(),
});

export type LessonNode =
  | z.infer<typeof textNodeSchema>
  | { type: "paragraph"; content?: LessonNode[] }
  | { type: "heading"; attrs: { level: 2 | 3 | 4 }; content?: LessonNode[] }
  | { type: "bulletList"; content?: LessonNode[] }
  | { type: "orderedList"; content?: LessonNode[] }
  | { type: "listItem"; content?: LessonNode[] }
  | { type: "blockquote"; content?: LessonNode[] }
  | { type: "table"; content?: LessonNode[] }
  | { type: "tableRow"; content?: LessonNode[] }
  | { type: "tableCell"; content?: LessonNode[] }
  | { type: "tableHeader"; content?: LessonNode[] }
  | { type: "hardBreak" }
  | { type: "callout"; attrs: { variant: CalloutVariant }; content?: LessonNode[] };

// Whitelist-based, recursive: only node/mark types the editor and
// renderer both know about survive validation. This is what makes
// storing/rendering lesson content safe from XSS — the renderer never
// touches dangerouslySetInnerHTML, it walks this exact shape and maps
// each known node type to a React element, so nothing outside this
// schema can ever reach the DOM as markup.
const lessonNodeSchema: z.ZodType<LessonNode> = z.lazy(() =>
  z.discriminatedUnion("type", [
    textNodeSchema,
    z.object({ type: z.literal("paragraph"), content: z.array(lessonNodeSchema).optional() }),
    z.object({
      type: z.literal("heading"),
      attrs: z.object({ level: z.union([z.literal(2), z.literal(3), z.literal(4)]) }),
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
    z.object({
      type: z.literal("callout"),
      attrs: z.object({ variant: z.enum(CALLOUT_VARIANTS) }),
      content: z.array(lessonNodeSchema).optional(),
    }),
  ]),
);

export const lessonContentSchema = z.object({
  type: z.literal("doc"),
  content: z.array(lessonNodeSchema),
});

export type LessonContent = z.infer<typeof lessonContentSchema>;

export const EMPTY_LESSON_CONTENT: LessonContent = { type: "doc", content: [] };
