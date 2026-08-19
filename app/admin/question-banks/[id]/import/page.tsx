import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getQuestionSetById } from "@/lib/queries/question-banks";
import { QuestionsCsvImportForm } from "@/components/admin/question-banks/questions-csv-import-form";

export const metadata: Metadata = { title: "Import questions — Admin — EnglishHero101" };

export default async function ImportQuestionsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const questionSet = await getQuestionSetById(id);

  if (!questionSet) {
    notFound();
  }

  return <QuestionsCsvImportForm questionSetId={questionSet.id} />;
}
