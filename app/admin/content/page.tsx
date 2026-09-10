import type { Metadata } from "next";
import Link from "next/link";
import { getContentTree } from "@/lib/queries/content";
import { ContentTree } from "@/components/admin/content-tree";
import { buttonVariants } from "@/components/ui/button";
import { Upload } from "lucide-react";

export const metadata: Metadata = { title: "Content — Admin — EnglishHero101" };

export default async function AdminContentPage() {
  const tree = await getContentTree();

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Content</h1>
          <p className="text-sm text-muted-foreground">
            Manage the category, section, topic, and subtopic hierarchy.
          </p>
        </div>
        <Link href="/admin/lessons/import" className={buttonVariants({ variant: "outline" })}>
          <Upload /> Import lessons
        </Link>
      </div>
      <ContentTree nodes={tree} />
    </div>
  );
}
