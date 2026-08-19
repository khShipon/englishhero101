import type { Metadata } from "next";
import { getContentTree } from "@/lib/queries/content";
import { flattenParentOptions } from "@/lib/admin/parent-options";
import { QuestionSetForm } from "@/components/admin/question-banks/question-set-form";

export const metadata: Metadata = { title: "New question set — Admin — EnglishHero101" };

export default async function NewQuestionSetPage() {
  const tree = await getContentTree();
  const parentOptions = flattenParentOptions(tree);

  return <QuestionSetForm mode="create" parentOptions={parentOptions} />;
}
