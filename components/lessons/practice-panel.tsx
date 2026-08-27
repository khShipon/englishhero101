"use client";

import { useState } from "react";
import type { SanitizedQuestion } from "@/lib/queries/question-banks";
import type { ReadingPassage } from "@/lib/queries/reading-passages";
import { QuestionSetQuiz } from "@/components/public/question-set-quiz";
import { ReadingTestMode } from "@/components/public/reading-test-mode";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Dumbbell, Clock3 } from "lucide-react";

// Gates the (already-fetched) practice quiz behind a "Start Practice"
// CTA, so a lesson always reads as "teach, then practice" rather than
// dropping straight into an exercise under the lesson text. When the
// lesson has structured reading passages (a reading-test lesson),
// this gates into the split-screen "CD test" experience instead of
// the plain stacked quiz.
export function PracticePanel({
  questionSetId,
  title,
  questionCount,
  questions,
  passages,
}: {
  questionSetId: string;
  title: string;
  questionCount: number;
  questions: SanitizedQuestion[];
  passages?: ReadingPassage[];
}) {
  const [started, setStarted] = useState(false);
  const isTestMode = !!passages && passages.length > 0;

  if (!started) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            {isTestMode ? <Clock3 className="size-4" /> : <Dumbbell className="size-4" />} {title}
          </CardTitle>
          <CardDescription>
            {isTestMode
              ? `${questionCount} questions, ${passages!.length} passages — attempt it like the real computer-delivered test, with a 60-minute timer.`
              : `${questionCount} question${questionCount === 1 ? "" : "s"} — check what you just learned.`}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button type="button" onClick={() => setStarted(true)}>
            {isTestMode ? "Begin test" : "Start practice"}
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (isTestMode) {
    return (
      <ReadingTestMode questionSetId={questionSetId} title={title} passages={passages!} questions={questions} />
    );
  }

  return <QuestionSetQuiz questionSetId={questionSetId} questions={questions} />;
}
