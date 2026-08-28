import type { Metadata } from "next";
import { getVocabularyList } from "@/lib/queries/vocabulary";
import { SearchBox } from "@/components/public/search-box";
import { VocabularyCard } from "@/components/public/vocabulary-card";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";

export const metadata: Metadata = {
  title: "Vocabulary — EnglishHero101",
  description: "Browse English vocabulary with Bangla meanings, definitions, and examples.",
  alternates: { canonical: "/vocabulary" },
};

// searchParams (search query, page number) drives the list directly
// — same as app/(public)/[...slug]/page.tsx, opts out of the
// static-prerender path rather than needing a Suspense boundary
// around every section.
export const instant = false;

export default async function VocabularyIndexPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; page?: string }>;
}) {
  const { q, page: pageParam } = await searchParams;
  const search = q ?? "";
  const page = Math.max(1, Number(pageParam ?? "1") || 1);

  const { items, totalCount, pageSize } = await getVocabularyList(search, page);
  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));

  function pageHref(target: number) {
    const params = new URLSearchParams();
    if (search) params.set("q", search);
    params.set("page", String(target));
    return `/vocabulary?${params.toString()}`;
  }

  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-10">
      <h1 className="text-2xl font-semibold tracking-tight">Vocabulary</h1>
      <p className="mt-1 text-sm text-muted-foreground">{totalCount} words to learn.</p>
      <SearchBox
        className="mt-4 max-w-sm"
        defaultValue={search}
        action="/vocabulary"
        placeholder="Search vocabulary..."
      />

      {items.length === 0 ? (
        <p className="mt-10 text-sm text-muted-foreground">
          {search ? `No words matching "${search}".` : "No vocabulary yet."}
        </p>
      ) : (
        <>
          <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {items.map((entry) => (
              <VocabularyCard key={entry.id} entry={entry} />
            ))}
          </div>

          {totalPages > 1 && (
            <div className="mt-8 flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                Page {page} of {totalPages}
              </p>
              <div className="flex gap-2">
                <Link
                  href={pageHref(page - 1)}
                  className={cn(
                    buttonVariants({ variant: "outline", size: "sm" }),
                    page <= 1 && "pointer-events-none opacity-50",
                  )}
                >
                  <ChevronLeft /> Previous
                </Link>
                <Link
                  href={pageHref(page + 1)}
                  className={cn(
                    buttonVariants({ variant: "outline", size: "sm" }),
                    page >= totalPages && "pointer-events-none opacity-50",
                  )}
                >
                  Next <ChevronRight />
                </Link>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
