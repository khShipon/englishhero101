import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getLessonById } from "@/lib/queries/lessons";
import { LessonRenderer } from "@/components/lessons/lesson-renderer";
import { Badge } from "@/components/ui/badge";

export const metadata: Metadata = { title: "Lesson preview — Admin — EnglishHero101" };

// Lives under /admin, so it inherits the admin/editor role gate from
// app/admin/layout.tsx — this is what "only authorized users can see
// unpublished previews" actually means in practice here.
export default async function LessonPreviewPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const lesson = await getLessonById(id);

  if (!lesson) {
    notFound();
  }

  return (
    <article className="mx-auto flex w-full max-w-3xl flex-col gap-4 px-4 py-12">
      <Badge variant={lesson.status === "published" ? "default" : "secondary"} className="w-fit">
        {lesson.status} preview
      </Badge>
      <h1 className="text-3xl font-semibold tracking-tight">{lesson.title}</h1>
      {lesson.excerpt && <p className="text-lg text-muted-foreground">{lesson.excerpt}</p>}
      <LessonRenderer content={lesson.content} />
    </article>
  );
}
