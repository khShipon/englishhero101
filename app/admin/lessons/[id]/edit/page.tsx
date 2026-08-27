import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getContentTree } from "@/lib/queries/content";
import { getLessonById } from "@/lib/queries/lessons";
import { flattenParentOptions } from "@/lib/admin/parent-options";
import { LessonForm } from "@/components/admin/lesson-editor/lesson-form";
import { ReadingPassagesPanel } from "@/components/admin/reading-passages/reading-passages-panel";

export const metadata: Metadata = { title: "Edit lesson — Admin — EnglishHero101" };

export default async function EditLessonPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [lesson, tree] = await Promise.all([getLessonById(id), getContentTree()]);

  if (!lesson) {
    notFound();
  }

  const parentOptions = flattenParentOptions(tree);

  return (
    <div className="flex flex-col gap-6">
      <LessonForm mode="edit" lessonId={lesson.id} parentOptions={parentOptions} defaultValues={lesson} />
      <ReadingPassagesPanel lessonId={lesson.id} lessonTitle={lesson.title} />
    </div>
  );
}
