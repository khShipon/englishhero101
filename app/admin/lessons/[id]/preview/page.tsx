import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getLessonById } from "@/lib/queries/lessons";
import { getReadingPassagesByLessonAdmin } from "@/lib/queries/reading-passages";
import { getQuestionSetsByLesson, getQuestionsBySet, sanitizeQuestion } from "@/lib/queries/question-banks";
import { setLessonPublished } from "@/lib/admin/lesson-publish-actions";
import { LessonRenderer } from "@/components/lessons/lesson-renderer";
import { PracticePanel } from "@/components/lessons/practice-panel";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ArrowLeft, Eye, EyeOff } from "lucide-react";

export const metadata: Metadata = { title: "Lesson preview — Admin — EnglishHero101" };

// Lives under /admin, so it inherits the admin/editor role gate from
// app/admin/layout.tsx — this is what "only authorized users can see
// unpublished previews" actually means in practice here. Renders the
// same components a student would see (including the interactive
// reading-test/quiz practice panel, working on drafts via the preview
// bypass in lib/student/quiz-actions.ts), with Publish sitting right
// next to it so reviewing and publishing happen on one screen.
export default async function LessonPreviewPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const lesson = await getLessonById(id);

  if (!lesson) {
    notFound();
  }

  const [passages, questionSets] = await Promise.all([
    getReadingPassagesByLessonAdmin(lesson.id),
    getQuestionSetsByLesson(lesson.id),
  ]);
  const questionSet = questionSets[0] ?? null;
  const questions = questionSet
    ? (await getQuestionsBySet(questionSet.id)).map(sanitizeQuestion)
    : [];

  const isPublished = lesson.status === "published";
  const isReadingTest = passages.length > 0;

  return (
    <div
      className={cn(
        "mx-auto flex w-full flex-col gap-4 px-4 py-12",
        isReadingTest ? "max-w-[1600px]" : "max-w-3xl",
      )}
    >
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Link
          href={`/admin/lessons/${lesson.id}/edit`}
          className={buttonVariants({ variant: "outline", size: "sm" })}
        >
          <ArrowLeft /> Back to edit
        </Link>
        <form action={setLessonPublished}>
          <input type="hidden" name="lessonId" value={lesson.id} />
          <input type="hidden" name="questionSetId" value={questionSet?.id ?? ""} />
          <input type="hidden" name="nextPublished" value={(!isPublished).toString()} />
          <Button type="submit" size="sm">
            {isPublished ? (
              <>
                <EyeOff /> Unpublish
              </>
            ) : (
              <>
                <Eye /> Looks good — Publish
              </>
            )}
          </Button>
        </form>
      </div>

      <Badge variant={isPublished ? "default" : "secondary"} className="w-fit">
        {lesson.status} preview
      </Badge>
      <h1 className="text-3xl font-semibold tracking-tight">{lesson.title}</h1>
      {lesson.excerpt && <p className="text-lg text-muted-foreground">{lesson.excerpt}</p>}
      <LessonRenderer content={lesson.content} />

      {questionSet && questions.length > 0 && (
        <PracticePanel
          questionSetId={questionSet.id}
          title={questionSet.title}
          questionCount={questions.length}
          questions={questions}
          passages={passages.length > 0 ? passages : undefined}
        />
      )}
    </div>
  );
}
