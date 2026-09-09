import type { Metadata } from "next";
import { getContentTree } from "@/lib/queries/content";
import { flattenParentOptions } from "@/lib/admin/parent-options";
import { QuestionSetForm } from "@/components/admin/question-banks/question-set-form";
import type { QuestionSet } from "@/lib/queries/question-banks";

export const metadata: Metadata = { title: "New question set — Admin — EnglishHero101" };

export default async function NewQuestionSetPage({
  searchParams,
}: {
  searchParams: Promise<{ nodeId?: string; board?: string; year?: string; examType?: string }>;
}) {
  const [tree, { nodeId, board, year, examType }] = await Promise.all([getContentTree(), searchParams]);
  const parentOptions = flattenParentOptions(tree);

  // Lets the admin Board Questions manager (SSC/HSC hub) link straight
  // into a pre-filled form for a specific year + board instead of
  // making the admin pick the section/board/year manually every time.
  const defaultValues: Partial<QuestionSet> | undefined =
    nodeId || board || year || examType
      ? {
          nodeId: nodeId ?? null,
          board: board ?? null,
          year: year ? Number(year) : null,
          examType: examType ?? null,
        }
      : undefined;

  return <QuestionSetForm mode="create" parentOptions={parentOptions} defaultValues={defaultValues} />;
}
