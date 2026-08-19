import { slugify } from "@/lib/utils/slug";

// A fresh assigner must be created per lesson render so heading ids
// are deterministic and stable for a given document, and so the same
// ids are produced whether they're consumed by the table of contents
// (extract-headings.ts) or by LessonRenderer itself — both walk the
// tree depth-first in the same order, so a per-render counter keeps
// them in sync without passing data between the two.
export function createHeadingIdAssigner() {
  const seen = new Map<string, number>();
  return (text: string): string => {
    const base = slugify(text) || "section";
    const count = seen.get(base) ?? 0;
    seen.set(base, count + 1);
    return count === 0 ? base : `${base}-${count}`;
  };
}
