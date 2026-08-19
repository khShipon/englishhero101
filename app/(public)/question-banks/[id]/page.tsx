import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getQuestionSetById, getQuestionsBySet } from "@/lib/queries/question-banks";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const questionSet = await getQuestionSetById(id);
  return { title: questionSet ? `${questionSet.title} — EnglishHero101` : "EnglishHero101" };
}

// Read-only preview of a question set. Interactive answering, scoring,
// and progress tracking are student features (Phase 11) — this page
// just lets a visitor see what's in a set before Phase 11 wires up
// actually taking it.
export default async function PublicQuestionSetPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const questionSet = await getQuestionSetById(id);

  if (!questionSet || !questionSet.isPublished) {
    notFound();
  }

  const questions = await getQuestionsBySet(id);

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

      <div className="mt-8 flex flex-col gap-4">
        {questions.map((question, index) => (
          <Card key={question.id}>
            <CardHeader>
              <CardTitle className="text-base font-medium">
                {index + 1}. {question.questionText}
              </CardTitle>
            </CardHeader>
            {question.options.length > 0 && (
              <CardContent>
                <ul className="flex flex-col gap-1.5 text-sm text-muted-foreground">
                  {question.options.map((option) => (
                    <li key={option.id} className="flex items-center gap-2">
                      <span className="flex size-4 shrink-0 items-center justify-center rounded-full border" />
                      {option.optionText}
                    </li>
                  ))}
                </ul>
              </CardContent>
            )}
          </Card>
        ))}
      </div>

      <p className="mt-8 text-center text-sm text-muted-foreground">
        Interactive practice with scoring is coming soon.
      </p>
    </div>
  );
}
