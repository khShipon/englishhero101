import type { Metadata } from "next";
import Link from "next/link";
import { getIeltsReadingOverview } from "@/lib/admin/ielts-reading";
import { createLessonQuestionSet } from "@/lib/admin/question-bank-actions";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Plus, Upload } from "lucide-react";

export const metadata: Metadata = { title: "IELTS Reading — Admin — EnglishHero101" };

export default async function IeltsReadingAdminPage() {
  const { lessons, newTestNodeId } = await getIeltsReadingOverview();

  return (
    <div className="flex max-w-5xl flex-col gap-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">IELTS Reading tests</h1>
          <p className="text-sm text-muted-foreground">
            Manage passages, questions, and answers for every CD-style reading test in one place.
          </p>
        </div>
        {newTestNodeId && (
          <div className="flex items-center gap-2">
            <Link
              href="/admin/ielts-reading/import"
              className={buttonVariants({ variant: "outline" })}
            >
              <Upload /> Import test
            </Link>
            <Link href={`/admin/lessons/new?node=${newTestNodeId}`} className={buttonVariants()}>
              <Plus /> New reading test
            </Link>
          </div>
        )}
      </div>

      {lessons.length === 0 ? (
        <Card>
          <CardContent className="py-10 text-center text-sm text-muted-foreground">
            No reading tests yet. Create a lesson under IELTS → Reading → Practice Tests, then add its
            passages here.
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="p-0">
            <ul className="flex flex-col divide-y">
              {lessons.map((lesson) => (
                <li
                  key={lesson.lessonId}
                  className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="flex min-w-0 flex-col gap-1.5">
                    <span className="truncate font-medium">{lesson.lessonTitle}</span>
                    <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                      <Badge variant={lesson.lessonStatus === "published" ? "default" : "secondary"}>
                        {lesson.lessonStatus}
                      </Badge>
                      <span>
                        {lesson.passageCount} passage{lesson.passageCount === 1 ? "" : "s"}
                      </span>
                      {lesson.questionSetId ? (
                        <Badge variant={lesson.isPublished ? "default" : "outline"}>
                          {lesson.isPublished ? "Practice set published" : "Practice set draft"}
                        </Badge>
                      ) : (
                        <Badge variant="outline">No practice set</Badge>
                      )}
                    </div>
                  </div>
                  <div className="flex shrink-0 items-center gap-2">
                    <Link
                      href={`/admin/lessons/${lesson.lessonId}/edit`}
                      className={buttonVariants({ variant: "outline", size: "sm" })}
                    >
                      Manage passages
                    </Link>
                    {lesson.questionSetId ? (
                      <Link
                        href={`/admin/question-banks/${lesson.questionSetId}`}
                        className={buttonVariants({ size: "sm" })}
                      >
                        Manage questions
                      </Link>
                    ) : (
                      <form action={createLessonQuestionSet}>
                        <input type="hidden" name="lessonId" value={lesson.lessonId} />
                        <input type="hidden" name="lessonTitle" value={lesson.lessonTitle} />
                        <Button type="submit" size="sm">
                          <Plus /> Add questions
                        </Button>
                      </form>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
