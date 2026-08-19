import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getContentTree, getNodeById } from "@/lib/queries/content";
import { flattenParentOptions } from "@/lib/admin/parent-options";
import { ContentNodeForm } from "@/components/admin/content-node-form";

export const metadata: Metadata = { title: "Edit content node — Admin — EnglishHero101" };

export default async function EditContentNodePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [node, tree] = await Promise.all([getNodeById(id), getContentTree()]);

  if (!node) {
    notFound();
  }

  const parentOptions = flattenParentOptions(tree, id);

  return (
    <ContentNodeForm
      mode="edit"
      nodeId={node.id}
      parentOptions={parentOptions}
      defaultValues={{
        title: node.title,
        slug: node.slug,
        nodeType: node.nodeType,
        parentId: node.parentId,
        description: node.description,
        icon: node.icon,
        coverImageUrl: node.coverImageUrl,
        isPublished: node.isPublished,
        isFeatured: node.isFeatured,
        seoTitle: node.seoTitle,
        seoDescription: node.seoDescription,
      }}
    />
  );
}
