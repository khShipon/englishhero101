import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getContentTree } from "@/lib/queries/content";
import { getVocabularyById } from "@/lib/queries/vocabulary";
import { flattenParentOptions } from "@/lib/admin/parent-options";
import { VocabularyForm } from "@/components/admin/vocabulary/vocabulary-form";

export const metadata: Metadata = { title: "Edit vocabulary — Admin — EnglishHero101" };

export default async function EditVocabularyPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [entry, tree] = await Promise.all([getVocabularyById(id), getContentTree()]);

  if (!entry) {
    notFound();
  }

  const parentOptions = flattenParentOptions(tree);

  return (
    <VocabularyForm
      mode="edit"
      vocabularyId={entry.id}
      parentOptions={parentOptions}
      defaultValues={entry}
    />
  );
}
