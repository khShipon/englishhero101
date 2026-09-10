import type { Metadata } from "next";
import { VocabularyImportForm } from "@/components/admin/vocabulary/vocabulary-import-form";

export const metadata: Metadata = { title: "Import vocabulary — Admin — EnglishHero101" };

export default function ImportVocabularyPage() {
  return <VocabularyImportForm />;
}
