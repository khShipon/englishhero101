import type { Metadata } from "next";
import { BlogForm } from "@/components/admin/blog/blog-form";

export const metadata: Metadata = { title: "New post — Admin — EnglishHero101" };

export default function NewBlogPostPage() {
  return <BlogForm mode="create" />;
}
