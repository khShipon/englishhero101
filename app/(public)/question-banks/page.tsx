import type { Metadata } from "next";
import {
  searchPublishedQuestionSets,
  getQuestionBankFilterOptions,
} from "@/lib/queries/question-banks";
import { QuestionSetCard } from "@/components/public/question-set-card";
import { QuestionBankFilters } from "@/components/public/question-bank-filters";

export const metadata: Metadata = {
  title: "Question Banks — EnglishHero101",
  description:
    "Search and practice real SSC, HSC, and IELTS board exam question papers, filterable by board, subject, and year.",
  alternates: { canonical: "/question-banks" },
};

// Filter state lives entirely in the query string, so there's no
// meaningful static shell without it — same reasoning as
// app/(public)/search/page.tsx.
export const instant = false;

export default async function QuestionBanksPage({
  searchParams,
}: {
  searchParams: Promise<{ examType?: string; board?: string; subject?: string; year?: string; q?: string }>;
}) {
  const params = await searchParams;
  const year = params.year ? Number(params.year) : undefined;

  const [results, options] = await Promise.all([
    searchPublishedQuestionSets({
      examType: params.examType,
      board: params.board,
      subject: params.subject,
      year,
      query: params.q,
    }),
    getQuestionBankFilterOptions(),
  ]);

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-10">
      <h1 className="text-3xl font-semibold tracking-tight">Question Banks</h1>
      <p className="mt-2 max-w-2xl text-muted-foreground">
        Real SSC, HSC, and IELTS board exam papers — search and filter by board, subject, and year to
        find one to practice.
      </p>

      <div className="mt-6">
        <QuestionBankFilters options={options} initial={params} />
      </div>

      {results.length > 0 ? (
        <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {results.map((set) => (
            <QuestionSetCard key={set.id} questionSet={set} />
          ))}
        </div>
      ) : (
        <p className="mt-10 text-sm text-muted-foreground">
          No question banks match those filters yet — try widening your search.
        </p>
      )}
    </div>
  );
}
