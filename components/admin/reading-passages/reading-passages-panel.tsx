import Link from "next/link";
import { getReadingPassagesByLessonAdmin } from "@/lib/queries/reading-passages";
import { getQuestionSetsByLesson, getQuestionsBySet } from "@/lib/queries/question-banks";
import { createLessonQuestionSet } from "@/lib/admin/question-bank-actions";
import { DeleteReadingPassageDialog } from "./delete-reading-passage-dialog";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus } from "lucide-react";

// Lives on the lesson edit page: lets an admin build a reading-test
// lesson end to end — the structured passages the split-screen test UI
// reads, plus a per-passage shortcut into the question-set admin so
// each passage's questions can be added without hunting for the right
// entry point (questions are still one flat set under the hood, tagged
// per-question with metadata.passage_number — see question-form.tsx).
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

  const questionSet = questionSets[0] ?? null;
  const questions = questionSet ? await getQuestionsBySet(questionSet.id) : [];

  const countByPassage = new Map<number, number>();
  for (const question of questions) {
    const passageNumber = (question.metadata as { passage_number?: number } | null)?.passage_number;
    if (typeof passageNumber === "number") {
      countByPassage.set(passageNumber, (countByPassage.get(passageNumber) ?? 0) + 1);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Reading passages</CardTitle>
        <CardDescription>
          For IELTS-style reading tests: add each passage, then add that passage&apos;s own
          questions right next to it.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        {passages.length > 0 ? (
          <ul className="flex flex-col gap-2">
            {passages.map((passage) => (
              <li
                key={passage.id}
                className="flex flex-wrap items-center justify-between gap-2 rounded-md border px-3 py-2"
              >
                <span className="flex items-center gap-2 text-sm font-medium">
                  Passage {passage.passageNumber}: {passage.title}
                  <Badge variant="outline">
                    {countByPassage.get(passage.passageNumber) ?? 0} question
                    {countByPassage.get(passage.passageNumber) === 1 ? "" : "s"}
                  </Badge>
                </span>
                <div className="flex items-center gap-1">
                  {questionSet && (
                    <Link
                      href={`/admin/question-banks/${questionSet.id}/questions/new?passage=${passage.passageNumber}`}
                      className={buttonVariants({ size: "sm" })}
                    >
                      <Plus /> Add question
                    </Link>
                  )}
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
          {questionSet ? (
            <div className="flex flex-wrap items-center gap-2">
              <Link
                href={`/admin/question-banks/${questionSet.id}`}
                className={buttonVariants({ size: "sm" })}
              >
                Manage all questions ({questions.length})
              </Link>
              {!questionSet.isPublished && (
                <span className="text-xs text-muted-foreground">
                  Draft — publish it from the practice set page once it&apos;s ready.
                </span>
              )}
            </div>
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
