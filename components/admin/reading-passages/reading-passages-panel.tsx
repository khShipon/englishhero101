import Link from "next/link";
import { getReadingPassagesByLessonAdmin } from "@/lib/queries/reading-passages";
import { getQuestionSetsByLesson } from "@/lib/queries/question-banks";
import { createLessonQuestionSet } from "@/lib/admin/question-bank-actions";
import { DeleteReadingPassageDialog } from "./delete-reading-passage-dialog";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus } from "lucide-react";

// Lives on the lesson edit page: lets an admin build a reading-test
// lesson end to end — the structured passages the split-screen test UI
// reads, plus a link into the existing question-set admin (which
// already supports every question type) for that lesson's practice set.
export async function ReadingPassagesPanel({
  lessonId,
  lessonTitle,
}: {
  lessonId: string;
  lessonTitle: string;
}) {
  const [passages, questionSets] = await Promise.all([
    getReadingPassagesByLessonAdmin(lessonId),
    getQuestionSetsByLesson(lessonId),
  ]);

  return (
    <Card className="max-w-5xl">
      <CardHeader>
        <CardTitle>Reading passages</CardTitle>
        <CardDescription>
          For IELTS-style reading tests: add the passages here, then tag each question in the
          practice set below with the passage it belongs to.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        {passages.length > 0 ? (
          <ul className="flex flex-col gap-2">
            {passages.map((passage) => (
              <li
                key={passage.id}
                className="flex items-center justify-between gap-2 rounded-md border px-3 py-2"
              >
                <span className="text-sm font-medium">
                  Passage {passage.passageNumber}: {passage.title}
                </span>
                <div className="flex items-center gap-1">
                  <Link
                    href={`/admin/lessons/${lessonId}/reading-passages/${passage.id}/edit`}
                    className={buttonVariants({ variant: "outline", size: "sm" })}
                  >
                    Edit
                  </Link>
                  <DeleteReadingPassageDialog
                    passageId={passage.id}
                    lessonId={lessonId}
                    title={`Passage ${passage.passageNumber}: ${passage.title}`}
                  />
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-muted-foreground">No passages yet.</p>
        )}

        <Link
          href={`/admin/lessons/${lessonId}/reading-passages/new`}
          className={buttonVariants({ variant: "outline", size: "sm", className: "w-fit" })}
        >
          <Plus /> Add passage
        </Link>

        <div className="flex flex-col gap-1.5 border-t pt-4">
          <p className="text-sm font-medium">Practice set (questions &amp; answers)</p>
          {questionSets.length > 0 ? (
            <Link
              href={`/admin/question-banks/${questionSets[0].id}`}
              className={buttonVariants({ size: "sm", className: "w-fit" })}
            >
              Manage practice set
            </Link>
          ) : (
            <form action={createLessonQuestionSet}>
              <input type="hidden" name="lessonId" value={lessonId} />
              <input type="hidden" name="lessonTitle" value={lessonTitle} />
              <Button type="submit" size="sm" variant="outline">
                Create practice set
              </Button>
            </form>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
