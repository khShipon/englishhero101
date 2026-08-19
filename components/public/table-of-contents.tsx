import type { HeadingEntry } from "@/lib/lessons/extract-headings";

export function TableOfContents({ headings }: { headings: HeadingEntry[] }) {
  if (headings.length === 0) return null;

  return (
    <nav aria-label="Table of contents" className="rounded-lg border p-4 text-sm">
      <p className="mb-2 font-semibold">On this page</p>
      <ul className="flex flex-col gap-1.5">
        {headings.map((heading) => (
          <li key={heading.id} style={{ paddingLeft: `${(heading.level - 2) * 0.75}rem` }}>
            <a href={`#${heading.id}`} className="text-muted-foreground hover:text-foreground">
              {heading.text}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
