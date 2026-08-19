import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getQuestionById } from "@/lib/queries/question-banks";
import { QuestionForm } from "@/components/admin/question-banks/question-form";

export const metadata: Metadata = { title: "Edit question — Admin — EnglishHero101" };

export default async function EditQuestionPage({
  params,
}: {
  params: Promise<{ id: string; qid: string }>;
}) {
  const { id, qid } = await params;
  const question = await getQuestionById(qid);

  if (!question || question.questionSetId !== id) {
    notFound();
  }

  return (
    <QuestionForm
      mode="edit"
      questionId={question.id}
      questionSetId={id}
      defaultValues={question}
    />
  );
}
