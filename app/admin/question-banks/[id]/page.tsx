import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getQuestionSetById, getQuestionsBySet } from "@/lib/queries/question-banks";
import { getReadingPassagesByLessonAdmin } from "@/lib/queries/reading-passages";
import { toggleQuestionSetPublish } from "@/lib/admin/question-bank-actions";
import { QuestionsList } from "@/components/admin/question-banks/questions-list";
import { QuestionsByPassage } from "@/components/admin/question-banks/questions-by-passage";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Eye, EyeOff, Plus, Upload } from "lucide-react";

export const metadata: Metadata = { title: "Question set — Admin — EnglishHero101" };

export default async function QuestionSetPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [questionSet, questions] = await Promise.all([
    getQuestionSetById(id),
    getQuestionsBySet(id),
  ]);

  if (!questionSet) {
    notFound();
  }

  const passages = questionSet.lessonId
    ? await getReadingPassagesByLessonAdmin(questionSet.lessonId)
    : [];

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm text-muted-foreground">
            <Link href="/admin/question-banks" className="hover:underline">
              Question Banks
            </Link>{" "}
            / {questionSet.title}
          </p>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-semibold tracking-tight">{questionSet.title}</h1>
            <Badge variant={questionSet.isPublished ? "default" : "secondary"}>
              {questionSet.isPublished ? "Published" : "Draft"}
            </Badge>
          </div>
          {questionSet.description && (
            <p className="mt-1 text-sm text-muted-foreground">{questionSet.description}</p>
          )}
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <form action={toggleQuestionSetPublish}>
            <input type="hidden" name="id" value={questionSet.id} />
            <input type="hidden" name="nextPublished" value={(!questionSet.isPublished).toString()} />
            <Button type="submit" variant="outline">
              {questionSet.isPublished ? (
                <>
                  <EyeOff /> Unpublish
                </>
              ) : (
                <>
                  <Eye /> Publish
                </>
              )}
            </Button>
          </form>
          <Link
            href={`/admin/question-banks/${questionSet.id}/edit`}
            className={buttonVariants({ variant: "outline" })}
          >
            Edit details
          </Link>
          <Link
            href={`/admin/question-banks/${questionSet.id}/import`}
            className={buttonVariants({ variant: "outline" })}
          >
            <Upload /> Import CSV
          </Link>
          <Link
            href={`/admin/question-banks/${questionSet.id}/questions/new`}
            className={buttonVariants()}
          >
            <Plus /> Add question
          </Link>
        </div>
      </div>

      <Card>
        <CardContent>
          {passages.length > 0 ? (
            <QuestionsByPassage questions={questions} passages={passages} questionSetId={questionSet.id} />
          ) : (
            <QuestionsList questions={questions} questionSetId={questionSet.id} />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
