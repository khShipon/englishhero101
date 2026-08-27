import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getReadingPassagesByLessonAdmin } from "@/lib/queries/reading-passages";
import { ReadingPassageForm } from "@/components/admin/reading-passages/reading-passage-form";

export const metadata: Metadata = { title: "Edit reading passage — Admin — EnglishHero101" };

export default async function EditReadingPassagePage({
  params,
}: {
  params: Promise<{ id: string; passageId: string }>;
}) {
  const { id, passageId } = await params;
  const passages = await getReadingPassagesByLessonAdmin(id);
  const passage = passages.find((p) => p.id === passageId);

  if (!passage) {
    notFound();
  }

  return (
    <ReadingPassageForm mode="edit" passageId={passage.id} lessonId={id} defaultValues={passage} />
  );
}
