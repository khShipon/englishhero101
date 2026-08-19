import type { Metadata } from "next";
import { getContentTree } from "@/lib/queries/content";
import { flattenParentOptions } from "@/lib/admin/parent-options";
import { LessonForm } from "@/components/admin/lesson-editor/lesson-form";

export const metadata: Metadata = { title: "New lesson — Admin — EnglishHero101" };

export default async function NewLessonPage({
  searchParams,
}: {
  searchParams: Promise<{ node?: string }>;
}) {
  const { node } = await searchParams;
  const tree = await getContentTree();
  const parentOptions = flattenParentOptions(tree);

  return <LessonForm mode="create" parentOptions={parentOptions} defaultNodeId={node} />;
}
