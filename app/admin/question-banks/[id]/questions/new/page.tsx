import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getQuestionSetById } from "@/lib/queries/question-banks";
import { getReadingPassagesByLessonAdmin } from "@/lib/queries/reading-passages";
import { QuestionForm } from "@/components/admin/question-banks/question-form";

export const metadata: Metadata = { title: "New question — Admin — EnglishHero101" };

export default async function NewQuestionPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ passage?: string }>;
}) {
  const { id } = await params;
  const { passage } = await searchParams;
  const questionSet = await getQuestionSetById(id);

  if (!questionSet) {
    notFound();
  }

  const passages = questionSet.lessonId
    ? await getReadingPassagesByLessonAdmin(questionSet.lessonId)
    : [];

  const initialPassageNumber = passage ? Number(passage) : undefined;

  return (
    <QuestionForm
      mode="create"
      questionSetId={questionSet.id}
      passages={passages}
      initialPassageNumber={
        initialPassageNumber && Number.isFinite(initialPassageNumber) ? initialPassageNumber : undefined
      }
    />
  );
}
