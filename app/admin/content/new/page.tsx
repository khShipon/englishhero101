import type { Metadata } from "next";
import { getContentTree } from "@/lib/queries/content";
import { flattenParentOptions } from "@/lib/admin/parent-options";
import { ContentNodeForm } from "@/components/admin/content-node-form";

export const metadata: Metadata = { title: "New content node — Admin — EnglishHero101" };

export default async function NewContentNodePage({
  searchParams,
}: {
  searchParams: Promise<{ parent?: string }>;
}) {
  const { parent } = await searchParams;
  const tree = await getContentTree();
  const parentOptions = flattenParentOptions(tree);

  return (
    <ContentNodeForm
      mode="create"
      parentOptions={parentOptions}
      defaultValues={parent ? { parentId: parent } : undefined}
    />
  );
}
