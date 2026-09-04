import type { Metadata } from "next";
import { getContentTree } from "@/lib/queries/content";
import { flattenParentOptions } from "@/lib/admin/parent-options";
import { getIeltsReadingOverview } from "@/lib/admin/ielts-reading";
import { ReadingTestImportForm } from "@/components/admin/reading-passages/reading-test-import-form";

export const metadata: Metadata = { title: "Import reading test — Admin — EnglishHero101" };

export default async function ImportReadingTestPage() {
  const [tree, { newTestNodeId }] = await Promise.all([getContentTree(), getIeltsReadingOverview()]);
  const parentOptions = flattenParentOptions(tree);

  return (
    <ReadingTestImportForm parentOptions={parentOptions} defaultNodeId={newTestNodeId ?? undefined} />
  );
}
