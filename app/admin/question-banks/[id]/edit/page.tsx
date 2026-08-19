import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getContentTree } from "@/lib/queries/content";
import { getQuestionSetById } from "@/lib/queries/question-banks";
import { flattenParentOptions } from "@/lib/admin/parent-options";
import { QuestionSetForm } from "@/components/admin/question-banks/question-set-form";

export const metadata: Metadata = { title: "Edit question set — Admin — EnglishHero101" };

export default async function EditQuestionSetPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [questionSet, tree] = await Promise.all([getQuestionSetById(id), getContentTree()]);

  if (!questionSet) {
    notFound();
  }

  const parentOptions = flattenParentOptions(tree);

  return (
    <QuestionSetForm
      mode="edit"
      questionSetId={questionSet.id}
      parentOptions={parentOptions}
      defaultValues={questionSet}
    />
  );
}
