import type { Metadata } from "next";
import Link from "next/link";
import { getQuestionSets } from "@/lib/queries/question-banks";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { QuestionBankFilters } from "@/components/admin/question-banks/question-bank-filters";
import { Plus } from "lucide-react";

export const metadata: Metadata = { title: "Question Banks — Admin — EnglishHero101" };

export default async function QuestionBanksPage() {
  const questionSets = await getQuestionSets();

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Question Banks</h1>
          <p className="text-sm text-muted-foreground">
            {questionSets.length} question set{questionSets.length === 1 ? "" : "s"}.
          </p>
        </div>
        <Link href="/admin/question-banks/new" className={buttonVariants()}>
          <Plus /> New question set
        </Link>
      </div>

      <Card>
        <CardContent>
          {questionSets.length === 0 ? (
            <p className="py-8 text-center text-sm text-muted-foreground">
              No question sets yet. Create your first one.
            </p>
          ) : (
            <QuestionBankFilters questionSets={questionSets} />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
