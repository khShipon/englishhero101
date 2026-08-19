import type { Metadata } from "next";
import { VocabularyCsvImportForm } from "@/components/admin/vocabulary/vocabulary-csv-import-form";

export const metadata: Metadata = { title: "Import vocabulary — Admin — EnglishHero101" };

export default function ImportVocabularyPage() {
  return <VocabularyCsvImportForm />;
}
