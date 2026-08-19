import type { Metadata } from "next";
import { getContentTree } from "@/lib/queries/content";
import { ContentTree } from "@/components/admin/content-tree";

export const metadata: Metadata = { title: "Content — Admin — EnglishHero101" };

export default async function AdminContentPage() {
  const tree = await getContentTree();

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Content</h1>
        <p className="text-sm text-muted-foreground">
          Manage the category, section, topic, and subtopic hierarchy.
        </p>
      </div>
      <ContentTree nodes={tree} />
    </div>
  );
}
