import Link from "next/link";
import type { Question } from "@/lib/queries/question-banks";
import type { ReadingPassage } from "@/lib/queries/reading-passages";
import { QuestionsList } from "./questions-list";
import { buttonVariants } from "@/components/ui/button";
import { Plus } from "lucide-react";

// Splits a reading-test question set's flat question list into one
// section per passage (plus a leftover "not linked" section), each
// with its own "Add question" shortcut pre-selecting that passage.
// Reordering (move up/down) still operates on the whole set's
// sort_order under the hood, so it works best when a passage's
// questions are added together rather than interleaved with another
// passage's.
export function QuestionsByPassage({
  questions,
  passages,
  questionSetId,
}: {
  questions: Question[];
  passages: ReadingPassage[];
  questionSetId: string;
}) {
  const byPassage = new Map<number, Question[]>();
  const unassigned: Question[] = [];

  for (const question of questions) {
    const passageNumber = (question.metadata as { passage_number?: number } | null)?.passage_number;
    if (typeof passageNumber === "number") {
      byPassage.set(passageNumber, [...(byPassage.get(passageNumber) ?? []), question]);
    } else {
      unassigned.push(question);
    }
  }

  return (
    <div className="flex flex-col gap-6">
      {passages.map((passage) => {
        const items = byPassage.get(passage.passageNumber) ?? [];
        return (
          <div key={passage.id} className="flex flex-col gap-2">
            <div className="flex items-center justify-between gap-2">
              <h3 className="text-sm font-semibold">
                Passage {passage.passageNumber}: {passage.title}{" "}
                <span className="font-normal text-muted-foreground">({items.length})</span>
              </h3>
              <Link
                href={`/admin/question-banks/${questionSetId}/questions/new?passage=${passage.passageNumber}`}
                className={buttonVariants({ variant: "outline", size: "sm" })}
              >
                <Plus /> Add question
              </Link>
            </div>
            <QuestionsList questions={items} questionSetId={questionSetId} />
          </div>
        );
      })}

      {unassigned.length > 0 && (
        <div className="flex flex-col gap-2">
          <h3 className="text-sm font-semibold text-muted-foreground">
            Not linked to a passage ({unassigned.length})
          </h3>
          <QuestionsList questions={unassigned} questionSetId={questionSetId} />
        </div>
      )}
    </div>
  );
}
