"use client";

import { useMemo, useState, useTransition } from "react";
import type { SanitizedQuestion } from "@/lib/queries/question-banks";
import { submitQuizAttempt, type QuizResult } from "@/lib/student/quiz-actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { ChevronDown, ChevronUp, CircleCheck, CircleHelp, CircleX } from "lucide-react";

export type AnswerState = {
  selectedOptionIds?: string[];
  text?: string;
  orderedOptionIds?: string[];
  matchingAnswer?: Record<string, string>;
};

const CHOICE_TYPES = new Set(["multiple_choice", "true_false", "multiple_answer"]);
const TEXT_TYPES = new Set(["fill_in_blank", "short_answer"]);

export function QuestionSetQuiz({
  questionSetId,
  questions,
}: {
  questionSetId: string;
  questions: SanitizedQuestion[];
}) {
  const [answers, setAnswers] = useState<Record<string, AnswerState>>(() =>
    Object.fromEntries(
      questions.map((question) => [
        question.id,
        question.questionType === "ordering" ? { orderedOptionIds: question.options.map((o) => o.id) } : {},
      ]),
    ),
  );
  const [result, setResult] = useState<QuizResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const resultByQuestionId = useMemo(() => {
    if (!result) return null;
    return new Map(result.questions.map((q) => [q.questionId, q]));
  }, [result]);

  function updateAnswer(questionId: string, patch: AnswerState) {
    setAnswers((prev) => ({ ...prev, [questionId]: { ...prev[questionId], ...patch } }));
  }

  function moveOrderingItem(question: SanitizedQuestion, index: number, direction: -1 | 1) {
    const current = answers[question.id]?.orderedOptionIds ?? question.options.map((o) => o.id);
    const target = index + direction;
    if (target < 0 || target >= current.length) return;
    const next = [...current];
    [next[index], next[target]] = [next[target], next[index]];
    updateAnswer(question.id, { orderedOptionIds: next });
  }

  function handleSubmit() {
    setError(null);
    startTransition(async () => {
      try {
        const payload = questions.map((question) => ({
          questionId: question.id,
          ...answers[question.id],
        }));
        const nextResult = await submitQuizAttempt(questionSetId, payload);
        setResult(nextResult);
        requestAnimationFrame(() => {
          document.getElementById("quiz-results")?.scrollIntoView({ behavior: "smooth", block: "start" });
        });
      } catch {
        setError("Could not submit your answers. Please try again.");
      }
    });
  }

  function handleRetry() {
    setResult(null);
    setError(null);
    setAnswers(
      Object.fromEntries(
        questions.map((question) => [
          question.id,
          question.questionType === "ordering" ? { orderedOptionIds: question.options.map((o) => o.id) } : {},
        ]),
      ),
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {questions.map((question, index) => {
        const graded = resultByQuestionId?.get(question.id) ?? null;
        return (
          <Card key={question.id}>
            <CardHeader>
              <CardTitle className="flex items-start justify-between gap-3 text-base font-medium">
                <span>
                  {index + 1}. {question.questionText}
                </span>
                {graded && <GradeBadge graded={graded} />}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {CHOICE_TYPES.has(question.questionType) && (
                <ChoiceInput
                  question={question}
                  multiple={question.questionType === "multiple_answer"}
                  value={answers[question.id]?.selectedOptionIds ?? []}
                  disabled={!!result}
                  onChange={(selectedOptionIds) => updateAnswer(question.id, { selectedOptionIds })}
                  correctOptionIds={graded?.correctOptionIds ?? null}
                />
              )}

              {TEXT_TYPES.has(question.questionType) && (
                <div className="flex flex-col gap-2">
                  <Input
                    value={answers[question.id]?.text ?? ""}
                    disabled={!!result}
                    onChange={(e) => updateAnswer(question.id, { text: e.target.value })}
                    placeholder="Type your answer"
                  />
                  {graded && !graded.correct && graded.correctText && (
                    <p className="text-sm text-muted-foreground">
                      Correct answer: <span className="font-medium text-foreground">{graded.correctText}</span>
                    </p>
                  )}
                </div>
              )}

              {question.questionType === "ordering" && (
                <OrderingInput
                  question={question}
                  order={answers[question.id]?.orderedOptionIds ?? question.options.map((o) => o.id)}
                  disabled={!!result}
                  onMove={(i, dir) => moveOrderingItem(question, i, dir)}
                  graded={graded}
                />
              )}

              {question.questionType === "matching" && (
                <MatchingInput
                  question={question}
                  value={answers[question.id]?.matchingAnswer ?? {}}
                  disabled={!!result}
                  onChange={(matchingAnswer) => updateAnswer(question.id, { matchingAnswer })}
                  graded={graded}
                />
              )}

              {question.questionType === "written_answer" && (
                <div className="flex flex-col gap-2">
                  <Textarea
                    value={answers[question.id]?.text ?? ""}
                    disabled={!!result}
                    onChange={(e) => updateAnswer(question.id, { text: e.target.value })}
                    placeholder="Write your answer"
                    rows={4}
                  />
                  {graded && (
                    <p className="text-sm text-muted-foreground">
                      <CircleHelp className="mr-1 inline size-3.5" />
                      Self-check — not auto-scored.
                      {graded.correctText && (
                        <>
                          {" "}
                          Model answer: <span className="font-medium text-foreground">{graded.correctText}</span>
                        </>
                      )}
                    </p>
                  )}
                </div>
              )}

              {graded?.explanation && (
                <p className="mt-3 rounded-md bg-muted/50 p-2.5 text-sm text-muted-foreground">
                  {graded.explanation}
                </p>
              )}
            </CardContent>
          </Card>
        );
      })}

      {error && <p className="text-sm text-destructive">{error}</p>}

      {!result ? (
        <Button type="button" onClick={handleSubmit} disabled={pending} className="self-start">
          {pending ? "Submitting..." : "Submit answers"}
        </Button>
      ) : (
        <div id="quiz-results" className="flex flex-col gap-3 rounded-lg border p-4">
          <p className="text-lg font-semibold">
            Score: {result.earnedMarks} / {result.scorableMarks}
            {result.scorableMarks > 0 && (
              <span className="ml-2 text-muted-foreground">({result.percent}%)</span>
            )}
          </p>
          {result.totalMarks !== result.scorableMarks && (
            <p className="text-sm text-muted-foreground">
              Some questions are self-check only and aren&apos;t included in the score.
            </p>
          )}
          <Button type="button" variant="outline" onClick={handleRetry} className="self-start">
            Try again
          </Button>
        </div>
      )}
    </div>
  );
}

export function GradeBadge({ graded }: { graded: NonNullable<QuizResult["questions"][number]> }) {
  if (!graded.autoGraded) {
    return (
      <Badge variant="outline" className="shrink-0 gap-1">
        <CircleHelp className="size-3.5" /> Self-check
      </Badge>
    );
  }
  return graded.correct ? (
    <Badge className="shrink-0 gap-1 bg-emerald-600 text-white hover:bg-emerald-600">
      <CircleCheck className="size-3.5" /> Correct
    </Badge>
  ) : (
    <Badge variant="destructive" className="shrink-0 gap-1">
      <CircleX className="size-3.5" /> Incorrect
    </Badge>
  );
}

export function ChoiceInput({
  question,
  multiple,
  value,
  disabled,
  onChange,
  correctOptionIds,
}: {
  question: SanitizedQuestion;
  multiple: boolean;
  value: string[];
  disabled: boolean;
  onChange: (ids: string[]) => void;
  correctOptionIds: string[] | null;
}) {
  return (
    <ul className="flex flex-col gap-1.5">
      {question.options.map((option) => {
        const checked = value.includes(option.id);
        const isCorrectOption = correctOptionIds?.includes(option.id) ?? false;
        const showState = correctOptionIds !== null;
        return (
          <li key={option.id}>
            <label
              className={cn(
                "flex cursor-pointer items-center gap-2 rounded-md border px-3 py-2 text-sm hover:bg-muted/50",
                disabled && "cursor-not-allowed opacity-90 hover:bg-transparent",
                showState && isCorrectOption && "border-emerald-600 bg-emerald-600/10",
                showState && checked && !isCorrectOption && "border-destructive bg-destructive/10",
              )}
            >
              <input
                type={multiple ? "checkbox" : "radio"}
                name={multiple ? undefined : `question-${question.id}`}
                checked={checked}
                disabled={disabled}
                onChange={() => {
                  if (multiple) {
                    onChange(checked ? value.filter((id) => id !== option.id) : [...value, option.id]);
                  } else {
                    onChange([option.id]);
                  }
                }}
                className="size-4"
              />
              {option.optionText}
            </label>
          </li>
        );
      })}
    </ul>
  );
}

function OrderingInput({
  question,
  order,
  disabled,
  onMove,
  graded,
}: {
  question: SanitizedQuestion;
  order: string[];
  disabled: boolean;
  onMove: (index: number, direction: -1 | 1) => void;
  graded: NonNullable<QuizResult["questions"][number]> | null;
}) {
  const optionById = new Map(question.options.map((o) => [o.id, o.optionText]));
  return (
    <div className="flex flex-col gap-3">
      <ul className="flex flex-col gap-1.5">
        {order.map((id, index) => (
          <li
            key={id}
            className="flex items-center justify-between gap-2 rounded-md border px-3 py-2 text-sm"
          >
            <span>
              {index + 1}. {optionById.get(id)}
            </span>
            {!disabled && (
              <div className="flex gap-1">
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-sm"
                  disabled={index === 0}
                  onClick={() => onMove(index, -1)}
                >
                  <ChevronUp />
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-sm"
                  disabled={index === order.length - 1}
                  onClick={() => onMove(index, 1)}
                >
                  <ChevronDown />
                </Button>
              </div>
            )}
          </li>
        ))}
      </ul>
      {graded && !graded.correct && graded.correctOrder && (
        <p className="text-sm text-muted-foreground">
          Correct order: {graded.correctOrder.map((item) => item.text).join(" → ")}
        </p>
      )}
    </div>
  );
}

export function MatchingInput({
  question,
  value,
  disabled,
  onChange,
  graded,
}: {
  question: SanitizedQuestion;
  value: Record<string, string>;
  disabled: boolean;
  onChange: (value: Record<string, string>) => void;
  graded: NonNullable<QuizResult["questions"][number]> | null;
}) {
  return (
    <div className="flex flex-col gap-3">
      <ul className="flex flex-col gap-2">
        {question.matchingLeft.map((left) => (
          <li key={left} className="flex items-center justify-between gap-3">
            <span className="text-sm">{left}</span>
            <Select
              value={value[left] ?? ""}
              onValueChange={(next) => onChange({ ...value, [left]: next ?? "" })}
              disabled={disabled}
            >
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Choose a match" />
              </SelectTrigger>
              <SelectContent>
                {question.matchingRight.map((right) => (
                  <SelectItem key={right} value={right}>
                    {right}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </li>
        ))}
      </ul>
      {graded && !graded.correct && graded.correctPairs && (
        <p className="text-sm text-muted-foreground">
          Correct matches: {graded.correctPairs.map((pair) => `${pair.left} → ${pair.right}`).join(", ")}
        </p>
      )}
    </div>
  );
}
