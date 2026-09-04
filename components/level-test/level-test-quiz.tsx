"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import type { PublicLevelTestQuestion } from "@/lib/level-test/questions";
import { submitLevelTest } from "@/lib/level-test/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { ArrowLeft, ArrowRight, Volume2 } from "lucide-react";

const SKILL_LABEL: Record<PublicLevelTestQuestion["skill"], string> = {
  grammar: "Grammar",
  vocabulary: "Vocabulary",
  fill_blank: "Fill in the blank",
  listening: "Listening",
};

function speak(text: string) {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = "en-US";
  utterance.rate = 0.95;
  window.speechSynthesis.speak(utterance);
}

export function LevelTestQuiz({ questions }: { questions: PublicLevelTestQuestion[] }) {
  const router = useRouter();
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const question = questions[index];
  const answered = Boolean(answers[question.id]?.trim());
  const isLast = index === questions.length - 1;
  const progressPercent = Math.round(((index + 1) / questions.length) * 100);

  const canSpeak = useMemo(
    () => typeof window !== "undefined" && "speechSynthesis" in window,
    [],
  );

  function setAnswer(value: string) {
    setAnswers((prev) => ({ ...prev, [question.id]: value }));
  }

  function handleNext() {
    if (!isLast) {
      setIndex((i) => i + 1);
      return;
    }

    setError(null);
    startTransition(async () => {
      try {
        const payload = questions.map((q) => ({ questionId: q.id, value: answers[q.id] ?? "" }));
        await submitLevelTest(payload);
        router.refresh();
      } catch {
        setError("Could not submit your answers. Please try again.");
      }
    });
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between text-sm text-muted-foreground">
        <span>
          Question {index + 1} of {questions.length}
        </span>
        <Badge variant="outline">{SKILL_LABEL[question.skill]}</Badge>
      </div>
      <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
        <div
          className="h-full rounded-full bg-primary transition-[width]"
          style={{ width: `${progressPercent}%` }}
        />
      </div>

      <Card>
        <CardHeader>
          {question.skill === "listening" && question.audioText && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="mb-2 self-start"
              onClick={() => speak(question.audioText!)}
              disabled={!canSpeak}
            >
              <Volume2 /> {canSpeak ? "Play audio" : "Audio unavailable on this device"}
            </Button>
          )}
          <CardTitle className="text-base font-medium">{question.prompt}</CardTitle>
        </CardHeader>
        <CardContent>
          {question.kind === "choice" ? (
            <ul className="flex flex-col gap-1.5">
              {question.options.map((option, i) => {
                const checked = answers[question.id] === option.id;
                return (
                  <li key={option.id}>
                    <label
                      className={cn(
                        "flex cursor-pointer items-center gap-2 rounded-md border px-3 py-2 text-sm hover:bg-muted/50",
                        checked && "border-primary bg-primary/5",
                      )}
                    >
                      <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-muted text-[11px] font-semibold">
                        {String.fromCharCode(65 + i)}
                      </span>
                      <input
                        type="radio"
                        name={`question-${question.id}`}
                        checked={checked}
                        onChange={() => setAnswer(option.id)}
                        className="size-4"
                      />
                      {option.text}
                    </label>
                  </li>
                );
              })}
            </ul>
          ) : (
            <Input
              value={answers[question.id] ?? ""}
              onChange={(e) => setAnswer(e.target.value)}
              placeholder="Type your answer"
              autoFocus
            />
          )}
        </CardContent>
      </Card>

      {error && <p className="text-sm text-destructive">{error}</p>}

      <div className="flex items-center justify-between">
        <Button
          type="button"
          variant="outline"
          onClick={() => setIndex((i) => Math.max(0, i - 1))}
          disabled={index === 0 || pending}
        >
          <ArrowLeft /> Back
        </Button>
        <Button type="button" onClick={handleNext} disabled={!answered || pending}>
          {pending ? "Grading..." : isLast ? "See my result" : "Next"}
          {!pending && <ArrowRight />}
        </Button>
      </div>
    </div>
  );
}
