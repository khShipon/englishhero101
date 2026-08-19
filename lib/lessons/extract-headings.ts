import { createHeadingIdAssigner } from "./heading-ids";
import type { LessonContent, LessonNode } from "@/types/lesson-content";

export type HeadingEntry = { id: string; level: 2 | 3 | 4; text: string };

export function extractText(node: LessonNode): string {
  if (node.type === "text") return node.text;
  if ("content" in node && node.content) {
    return node.content.map(extractText).join("");
  }
  return "";
}

export function extractHeadings(content: LessonContent): HeadingEntry[] {
  const headings: HeadingEntry[] = [];
  const assignId = createHeadingIdAssigner();

  function walk(nodes: LessonNode[]) {
    for (const node of nodes) {
      if (node.type === "heading") {
        const text = extractText(node);
        headings.push({ id: assignId(text), level: node.attrs.level, text });
      }
      if ("content" in node && node.content) {
        walk(node.content);
      }
    }
  }

  walk(content.content);
  return headings;
}
