import type { Metadata } from "next";
import { getContentTree } from "@/lib/queries/content";
import { flattenParentOptions } from "@/lib/admin/parent-options";
import { LessonForm } from "@/components/admin/lesson-editor/lesson-form";
import { ReadingPassagesPlaceholder } from "@/components/admin/reading-passages/reading-passages-placeholder";

export const metadata: Metadata = { title: "New lesson — Admin — EnglishHero101" };

export default async function NewLessonPage({
  searchParams,
}: {
  searchParams: Promise<{ node?: string }>;
}) {
  const { node } = await searchParams;
  const tree = await getContentTree();
  const parentOptions = flattenParentOptions(tree);

  return (
    <div className="grid grid-cols-1 items-start gap-6 xl:grid-cols-[1fr_420px]">
      <LessonForm mode="create" parentOptions={parentOptions} defaultNodeId={node} />
      <ReadingPassagesPlaceholder />
    </div>
  );
}
