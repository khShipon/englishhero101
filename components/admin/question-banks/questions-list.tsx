import Link from "next/link";
import type { Question } from "@/lib/queries/question-banks";
import { getIeltsReadingQuestionType } from "@/lib/admin/ielts-reading-question-types";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { moveQuestion } from "@/lib/admin/question-actions";
import { DeleteQuestionDialog } from "./delete-question-dialog";
import { ArrowUp, ArrowDown, Pencil } from "lucide-react";

const TYPE_LABELS: Record<string, string> = {
  multiple_choice: "Multiple choice",
  multiple_answer: "Multiple answer",
  true_false: "True/False",
  fill_in_blank: "Fill in blank",
  short_answer: "Short answer",
  matching: "Matching",
  ordering: "Ordering",
  written_answer: "Written answer",
};

function typeLabel(question: Question): string {
  const ieltsType = (question.metadata as { ielts_question_type?: string } | null)?.ielts_question_type;
  return (
    getIeltsReadingQuestionType(ieltsType)?.label ??
    TYPE_LABELS[question.questionType] ??
    question.questionType
  );
}

export function QuestionsList({
  questions,
  questionSetId,
}: {
  questions: Question[];
  questionSetId: string;
}) {
  if (questions.length === 0) {
    return <p className="py-8 text-center text-sm text-muted-foreground">No questions yet.</p>;
  }

  return (
    <div className="flex flex-col divide-y">
      {questions.map((question, index) => (
        <div key={question.id} className="flex items-center gap-3 py-3">
          <span className="w-6 shrink-0 text-sm text-muted-foreground">{index + 1}.</span>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium">{question.questionText}</p>
            <div className="mt-1 flex items-center gap-2">
              <Badge variant="outline">{typeLabel(question)}</Badge>
              <span className="text-xs text-muted-foreground">{question.marks} marks</span>
            </div>
          </div>
          <div className="flex shrink-0 items-center gap-0.5">
            <form action={moveQuestion}>
              <input type="hidden" name="id" value={question.id} />
              <input type="hidden" name="questionSetId" value={questionSetId} />
              <input type="hidden" name="direction" value="up" />
              <Button variant="ghost" size="icon-sm" type="submit" aria-label="Move up">
                <ArrowUp />
              </Button>
            </form>
            <form action={moveQuestion}>
              <input type="hidden" name="id" value={question.id} />
              <input type="hidden" name="questionSetId" value={questionSetId} />
              <input type="hidden" name="direction" value="down" />
              <Button variant="ghost" size="icon-sm" type="submit" aria-label="Move down">
                <ArrowDown />
              </Button>
            </form>
            <Link
              href={`/admin/question-banks/${questionSetId}/questions/${question.id}/edit`}
              className={buttonVariants({ variant: "ghost", size: "icon-sm" })}
              aria-label="Edit"
            >
              <Pencil />
            </Link>
            <DeleteQuestionDialog id={question.id} questionSetId={questionSetId} />
          </div>
        </div>
      ))}
    </div>
  );
}
