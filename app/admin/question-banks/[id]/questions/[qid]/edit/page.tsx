import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getQuestionById, getQuestionSetById } from "@/lib/queries/question-banks";
import { getReadingPassagesByLessonAdmin } from "@/lib/queries/reading-passages";
import { QuestionForm } from "@/components/admin/question-banks/question-form";

export const metadata: Metadata = { title: "Edit question — Admin — EnglishHero101" };

export default async function EditQuestionPage({
  params,
}: {
  params: Promise<{ id: string; qid: string }>;
}) {
  const { id, qid } = await params;
  const [question, questionSet] = await Promise.all([getQuestionById(qid), getQuestionSetById(id)]);

  if (!question || question.questionSetId !== id) {
    notFound();
  }

  const passages = questionSet?.lessonId
    ? await getReadingPassagesByLessonAdmin(questionSet.lessonId)
    : [];

  return (
    <QuestionForm
      mode="edit"
      questionId={question.id}
      questionSetId={id}
      defaultValues={question}
      passages={passages}
    />
  );
}
