import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getPublishedQuestionSetById, getSanitizedQuestionsBySet } from "@/lib/queries/question-banks";
import { Badge } from "@/components/ui/badge";
import { QuestionSetQuiz } from "@/components/public/question-set-quiz";

// `params` drives which question set to load directly — same as
// app/(public)/[...slug]/page.tsx, opts out of the static-prerender
// path rather than needing a Suspense boundary here.
export const instant = false;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const questionSet = await getPublishedQuestionSetById(id);
  if (!questionSet) {
    return { title: "EnglishHero101" };
  }
  const title = `${questionSet.title} — EnglishHero101`;
  const examMeta = [questionSet.examType, questionSet.subject, questionSet.year]
    .filter(Boolean)
    .join(" · ");
  const description = questionSet.description || examMeta || "Practice questions on EnglishHero101.";
  const canonical = `/question-banks/${id}`;
  return {
    title,
    description,
    alternates: { canonical },
    openGraph: { title, description, url: canonical, type: "website" },
    twitter: { title, description },
  };
}

export default async function PublicQuestionSetPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const questionSet = await getPublishedQuestionSetById(id);

  if (!questionSet || !questionSet.isPublished) {
    notFound();
  }

  const questions = await getSanitizedQuestionsBySet(id);

  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-10">
      <h1 className="text-3xl font-semibold tracking-tight">{questionSet.title}</h1>
      {questionSet.description && (
        <p className="mt-2 text-muted-foreground">{questionSet.description}</p>
      )}
      <div className="mt-3 flex flex-wrap gap-2">
        {questionSet.examType && <Badge variant="outline">{questionSet.examType}</Badge>}
        {questionSet.subject && <Badge variant="outline">{questionSet.subject}</Badge>}
        {questionSet.year && <Badge variant="outline">{questionSet.year}</Badge>}
        {questionSet.durationMinutes && (
          <Badge variant="outline">{questionSet.durationMinutes} min</Badge>
        )}
      </div>

      <div className="mt-8">
        {questions.length > 0 ? (
          <QuestionSetQuiz questionSetId={id} questions={questions} />
        ) : (
          <p className="text-center text-sm text-muted-foreground">This set has no questions yet.</p>
        )}
      </div>
    </div>
  );
}
