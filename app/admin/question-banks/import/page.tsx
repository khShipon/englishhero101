import type { Metadata } from "next";
import { QuestionSetImportForm } from "@/components/admin/question-banks/question-set-import-form";

export const metadata: Metadata = { title: "Import a question set — Admin — EnglishHero101" };

export default function ImportQuestionSetPage() {
  return <QuestionSetImportForm />;
}
