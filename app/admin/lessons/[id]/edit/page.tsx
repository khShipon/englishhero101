import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getContentTree } from "@/lib/queries/content";
import { getLessonById } from "@/lib/queries/lessons";
import { getQuestionSetsByLesson } from "@/lib/queries/question-banks";
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
  const [lesson, tree, questionSets] = await Promise.all([
    getLessonById(id),
    getContentTree(),
    getQuestionSetsByLesson(id),
  ]);

  if (!lesson) {
    notFound();
  }

  const parentOptions = flattenParentOptions(tree);

  return (
    <div className="grid grid-cols-1 items-start gap-6 xl:grid-cols-[1fr_420px]">
      <LessonForm
        mode="edit"
        lessonId={lesson.id}
        parentOptions={parentOptions}
        defaultValues={lesson}
        questionSetId={questionSets[0]?.id ?? null}
      />
      <div className="xl:sticky xl:top-6">
        <ReadingPassagesPanel lessonId={lesson.id} lessonTitle={lesson.title} />
      </div>
    </div>
  );
}
