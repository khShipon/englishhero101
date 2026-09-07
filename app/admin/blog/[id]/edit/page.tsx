import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getBlogPostById } from "@/lib/queries/blog";
import { BlogForm } from "@/components/admin/blog/blog-form";

export const metadata: Metadata = { title: "Edit post — Admin — EnglishHero101" };

export default async function EditBlogPostPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const post = await getBlogPostById(id);

  if (!post) {
    notFound();
  }

  return <BlogForm mode="edit" postId={post.id} defaultValues={post} />;
}
