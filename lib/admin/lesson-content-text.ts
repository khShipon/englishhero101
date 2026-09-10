import type { CalloutVariant, LessonContent, LessonNode, TextAlign } from "@/types/lesson-content";
import { CALLOUT_VARIANTS } from "@/types/lesson-content";

// ============================================================
// A lightweight, markdown-like text format for lesson content,
// so bulk import (CSV and JSON) doesn't require hand-authoring the
// full Tiptap document schema (types/lesson-content.ts). This is
// exactly the format documented on the lesson import page and in
// the downloadable templates — written so an AI model can produce
// it reliably from a plain prompt.
//
//   ## Heading            -> heading level 2 (### = 3, #### = 4)
//   plain text             -> paragraph (blank line ends it)
//   - item / * item        -> bullet list (consecutive lines)
//   1. item                -> ordered list (consecutive lines)
//   > quoted text          -> blockquote (consecutive lines)
//   [note] ... blank line  -> callout (example/note/highlight/
//                             grammar-rule/question/answer)
//   ---                    -> horizontal rule
//   **bold** *italic*      -> inline marks (also __underline__,
//   _italic_ ~~strike~~       ~~strike~~)
//
// This intentionally covers a subset of what the rich-text editor
// can produce (no tables, no links, no text alignment) — those are
// still only reachable through the editor UI. Whatever comes out of
// this parser is re-validated by lessonContentSchema before it's
// ever persisted, same as hand-written JSON.
// ============================================================

const CALLOUT_MARKER = /^\[(example|note|highlight|grammar-rule|question|answer)\]\s*$/i;
const HEADING = /^(#{2,4})\s+(.+)$/;
const BULLET_ITEM = /^[-*]\s+(.+)$/;
const ORDERED_ITEM = /^\d+\.\s+(.+)$/;
const QUOTE_LINE = /^>\s?(.*)$/;
const INLINE_SPLIT = /(\*\*[^*]+\*\*|__[^_]+__|~~[^~]+~~|\*[^*]+\*|_[^_]+_)/g;

function parseInline(text: string): LessonNode[] {
  const parts = text.split(INLINE_SPLIT).filter((part) => part.length > 0);
  if (parts.length === 0) {
    return [{ type: "text", text: "" }];
  }

  return parts.map((part): LessonNode => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return { type: "text", text: part.slice(2, -2), marks: [{ type: "bold" }] };
    }
    if (part.startsWith("__") && part.endsWith("__")) {
      return { type: "text", text: part.slice(2, -2), marks: [{ type: "underline" }] };
    }
    if (part.startsWith("~~") && part.endsWith("~~")) {
      return { type: "text", text: part.slice(2, -2), marks: [{ type: "strike" }] };
    }
    if (
      (part.startsWith("*") && part.endsWith("*")) ||
      (part.startsWith("_") && part.endsWith("_"))
    ) {
      return { type: "text", text: part.slice(1, -1), marks: [{ type: "italic" }] };
    }
    return { type: "text", text: part };
  });
}

function paragraph(text: string, align?: TextAlign): LessonNode {
  return {
    type: "paragraph",
    ...(align ? { attrs: { textAlign: align } } : {}),
    content: parseInline(text),
  };
}

export function parseLessonContentText(source: string): LessonContent {
  const lines = source.replace(/\r\n/g, "\n").split("\n");
  const nodes: LessonNode[] = [];
  let i = 0;

  const isBlank = (line: string | undefined) => line === undefined || line.trim() === "";

  while (i < lines.length) {
    const line = lines[i];

    if (isBlank(line)) {
      i++;
      continue;
    }

    const heading = HEADING.exec(line);
    if (heading) {
      const level = heading[1].length as 2 | 3 | 4;
      nodes.push({ type: "heading", attrs: { level }, content: parseInline(heading[2].trim()) });
      i++;
      continue;
    }

    if (line.trim() === "---") {
      nodes.push({ type: "horizontalRule" });
      i++;
      continue;
    }

    if (BULLET_ITEM.test(line)) {
      const items: string[] = [];
      while (i < lines.length && BULLET_ITEM.test(lines[i])) {
        items.push(BULLET_ITEM.exec(lines[i])![1].trim());
        i++;
      }
      nodes.push({
        type: "bulletList",
        content: items.map((item) => ({ type: "listItem", content: [paragraph(item)] })),
      });
      continue;
    }

    if (ORDERED_ITEM.test(line)) {
      const items: string[] = [];
      while (i < lines.length && ORDERED_ITEM.test(lines[i])) {
        items.push(ORDERED_ITEM.exec(lines[i])![1].trim());
        i++;
      }
      nodes.push({
        type: "orderedList",
        content: items.map((item) => ({ type: "listItem", content: [paragraph(item)] })),
      });
      continue;
    }

    if (QUOTE_LINE.test(line)) {
      const quoted: string[] = [];
      while (i < lines.length && QUOTE_LINE.test(lines[i])) {
        quoted.push(QUOTE_LINE.exec(lines[i])![1]);
        i++;
      }
      nodes.push({ type: "blockquote", content: [paragraph(quoted.join(" ").trim())] });
      continue;
    }

    const calloutMatch = CALLOUT_MARKER.exec(line.trim());
    if (calloutMatch) {
      const variant = calloutMatch[1].toLowerCase() as CalloutVariant;
      i++;
      const body: string[] = [];
      while (i < lines.length && !isBlank(lines[i])) {
        body.push(lines[i]);
        i++;
      }
      nodes.push({
        type: "callout",
        attrs: { variant: CALLOUT_VARIANTS.includes(variant) ? variant : "note" },
        content: [paragraph(body.join(" ").trim())],
      });
      continue;
    }

    // Plain paragraph: gather consecutive non-blank lines that don't
    // start a different block, so a soft-wrapped paragraph in the
    // source text still becomes one paragraph node.
    const paragraphLines: string[] = [];
    while (
      i < lines.length &&
      !isBlank(lines[i]) &&
      !HEADING.test(lines[i]) &&
      lines[i].trim() !== "---" &&
      !BULLET_ITEM.test(lines[i]) &&
      !ORDERED_ITEM.test(lines[i]) &&
      !QUOTE_LINE.test(lines[i]) &&
      !CALLOUT_MARKER.test(lines[i].trim())
    ) {
      paragraphLines.push(lines[i]);
      i++;
    }
    nodes.push(paragraph(paragraphLines.join(" ").trim()));
  }

  return { type: "doc", content: nodes };
}
