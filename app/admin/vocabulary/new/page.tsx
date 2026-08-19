import type { Metadata } from "next";
import { getContentTree } from "@/lib/queries/content";
import { flattenParentOptions } from "@/lib/admin/parent-options";
import { VocabularyForm } from "@/components/admin/vocabulary/vocabulary-form";

export const metadata: Metadata = { title: "New vocabulary — Admin — EnglishHero101" };

export default async function NewVocabularyPage() {
  const tree = await getContentTree();
  const parentOptions = flattenParentOptions(tree);

  return <VocabularyForm mode="create" parentOptions={parentOptions} />;
}
