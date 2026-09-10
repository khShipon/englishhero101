import type { Metadata } from "next";
import { LessonImportForm } from "@/components/admin/lesson-editor/lesson-import-form";

export const metadata: Metadata = { title: "Import lessons — Admin — EnglishHero101" };

export default function ImportLessonsPage() {
  return <LessonImportForm />;
}
