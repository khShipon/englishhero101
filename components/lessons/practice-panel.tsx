"use client";

import { useState } from "react";
import type { SanitizedQuestion } from "@/lib/queries/question-banks";
import { QuestionSetQuiz } from "@/components/public/question-set-quiz";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Dumbbell } from "lucide-react";

// Gates the (already-fetched) practice quiz behind a "Start Practice"
// CTA, so a lesson always reads as "teach, then practice" rather than
// dropping straight into an exercise under the lesson text.
export function PracticePanel({
  questionSetId,
  title,
  questionCount,
  questions,
}: {
  questionSetId: string;
  title: string;
  questionCount: number;
  questions: SanitizedQuestion[];
}) {
  const [started, setStarted] = useState(false);

  if (!started) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Dumbbell className="size-4" /> {title}
          </CardTitle>
          <CardDescription>
            {questionCount} question{questionCount === 1 ? "" : "s"} — check what you just learned.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button type="button" onClick={() => setStarted(true)}>
            Start practice
          </Button>
        </CardContent>
      </Card>
    );
  }

  return <QuestionSetQuiz questionSetId={questionSetId} questions={questions} />;
}
