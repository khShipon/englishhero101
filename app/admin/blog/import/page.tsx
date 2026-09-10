import type { Metadata } from "next";
import { BlogImportForm } from "@/components/admin/blog/blog-import-form";

export const metadata: Metadata = { title: "Import blog posts — Admin — EnglishHero101" };

export default function ImportBlogPostsPage() {
  return <BlogImportForm />;
}
