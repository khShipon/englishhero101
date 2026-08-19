import type { Metadata } from "next";
import Link from "next/link";
import { searchSite } from "@/lib/queries/search";
import { getBreadcrumbs } from "@/lib/queries/content";
import { SearchBox } from "@/components/public/search-box";
import { LessonCard } from "@/components/public/lesson-card";
import { VocabularyCard } from "@/components/public/vocabulary-card";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

export const metadata: Metadata = { title: "Search — EnglishHero101" };

async function NodeResultCard({ node }: { node: Awaited<ReturnType<typeof searchSite>>["nodes"][number] }) {
  const breadcrumbs = await getBreadcrumbs(node.id);
  const href = `/${breadcrumbs.map((crumb) => crumb.slug).join("/")}`;

  return (
    <Link href={href} className="block h-full">
      <Card className="h-full transition-shadow hover:shadow-md">
        <CardHeader>
          <CardTitle>{node.title}</CardTitle>
          <CardDescription>{node.description || `Browse ${node.title}`}</CardDescription>
        </CardHeader>
      </Card>
    </Link>
  );
}

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;
  const query = q ?? "";
  const results = query.trim() ? await searchSite(query) : { nodes: [], lessons: [], vocabulary: [] };
  const hasResults = results.nodes.length + results.lessons.length + results.vocabulary.length > 0;

  return (
    <div className="mx-auto w-full max-w-4xl px-4 py-10">
      <h1 className="text-2xl font-semibold tracking-tight">Search</h1>
      <SearchBox className="mt-4 max-w-lg" defaultValue={query} />

      {query.trim() && (
        <p className="mt-6 text-sm text-muted-foreground">
          {hasResults ? "Results for" : "No results for"} &ldquo;{query}&rdquo;
        </p>
      )}

      {results.nodes.length > 0 && (
        <section className="mt-6">
          <h2 className="mb-3 text-lg font-semibold tracking-tight">Categories</h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {results.nodes.map((node) => (
              <NodeResultCard key={node.id} node={node} />
            ))}
          </div>
        </section>
      )}

      {results.lessons.length > 0 && (
        <section className="mt-8">
          <h2 className="mb-3 text-lg font-semibold tracking-tight">Lessons</h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {results.lessons.map((lesson) => (
              <LessonCard key={lesson.id} lesson={lesson} />
            ))}
          </div>
        </section>
      )}

      {results.vocabulary.length > 0 && (
        <section className="mt-8">
          <h2 className="mb-3 text-lg font-semibold tracking-tight">Vocabulary</h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {results.vocabulary.map((entry) => (
              <VocabularyCard key={entry.id} entry={entry} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
