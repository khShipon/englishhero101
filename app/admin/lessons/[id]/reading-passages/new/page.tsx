import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getLessonById } from "@/lib/queries/lessons";
import { ReadingPassageForm } from "@/components/admin/reading-passages/reading-passage-form";

export const metadata: Metadata = { title: "New reading passage — Admin — EnglishHero101" };

export default async function NewReadingPassagePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const lesson = await getLessonById(id);

  if (!lesson) {
    notFound();
  }

  return <ReadingPassageForm mode="create" lessonId={lesson.id} />;
}
