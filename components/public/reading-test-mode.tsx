"use client";

import { useEffect, useMemo, useRef, useState, useTransition } from "react";
import type { ReadingPassage } from "@/lib/queries/reading-passages";
import type { SanitizedQuestion } from "@/lib/queries/question-banks";
import {
  submitQuizAttempt,
  type QuizResult,
} from "@/lib/student/quiz-actions";
import {
  ChoiceInput,
  MatchingInput,
  GradeBadge,
  type AnswerState,
} from "@/components/public/question-set-quiz";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { Clock } from "lucide-react";

const TEST_SECONDS = 60 * 60;
const CHOICE_TYPES = new Set(["multiple_choice", "true_false", "multiple_answer"]);
const TEXT_TYPES = new Set(["fill_in_blank", "short_answer"]);

function formatTime(totalSeconds: number) {
  const m = Math.floor(totalSeconds / 60);
  const s = totalSeconds % 60;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

function questionLabel(question: SanitizedQuestion, index: number, all: SanitizedQuestion[]) {
  // Consecutive marks>1 questions with the same type (the combined
  // matching-headings question) get a range label; everything else
  // is numbered in document order.
  let num = 1;
  for (let i = 0; i < index; i++) num += all[i].marks > 1 && all[i].questionType === "matching" ? all[i].marks : 1;
  if (question.questionType === "matching" && question.marks > 1) {
    return `${num}–${num + question.marks - 1}`;
  }
  return String(num);
}

export function ReadingTestMode({
  questionSetId,
  title,
  passages,
  questions,
  readOnly = false,
}: {
  questionSetId: string;
  title: string;
  passages: ReadingPassage[];
  questions: SanitizedQuestion[];
  readOnly?: boolean;
}) {
  const [activePassage, setActivePassage] = useState(passages[0]?.passageNumber ?? 1);
  const [answers, setAnswers] = useState<Record<string, AnswerState>>({});
  const [result, setResult] = useState<QuizResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const [secondsLeft, setSecondsLeft] = useState(TEST_SECONDS);
  const questionRefs = useRef<Record<string, HTMLDivElement | null>>({});

  useEffect(() => {
    if (result || readOnly) return;
    const interval = setInterval(() => {
      setSecondsLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, [result, readOnly]);

  const resultByQuestionId = useMemo(() => {
    if (!result) return null;
    return new Map(result.questions.map((q) => [q.questionId, q]));
  }, [result]);

  const questionsByPassage = useMemo(() => {
    const map = new Map<number, SanitizedQuestion[]>();
    for (const q of questions) {
      const key = q.passageNumber ?? 0;
      map.set(key, [...(map.get(key) ?? []), q]);
    }
    return map;
  }, [questions]);

  function updateAnswer(questionId: string, patch: AnswerState) {
    setAnswers((prev) => ({ ...prev, [questionId]: { ...prev[questionId], ...patch } }));
  }

  function goToQuestion(questionId: string, passageNumber: number | null) {
    if (passageNumber && passageNumber !== activePassage) {
      setActivePassage(passageNumber);
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          questionRefs.current[questionId]?.scrollIntoView({ behavior: "smooth", block: "center" });
        });
      });
    } else {
      questionRefs.current[questionId]?.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }

  function isAnswered(question: SanitizedQuestion) {
    const a = answers[question.id];
    if (!a) return false;
    if (CHOICE_TYPES.has(question.questionType)) return (a.selectedOptionIds?.length ?? 0) > 0;
    if (TEXT_TYPES.has(question.questionType)) return !!a.text?.trim();
    if (question.questionType === "matching") {
      return Object.keys(a.matchingAnswer ?? {}).length === question.matchingLeft.length;
    }
    return false;
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
      } catch {
        setError("Could not submit your answers. Please try again.");
      }
    });
  }

  const activeQuestions = questionsByPassage.get(activePassage) ?? [];
  const activePassageData = passages.find((p) => p.passageNumber === activePassage);
  const answeredCount = questions.filter(isAnswered).length;

  return (
    <div className="flex flex-col overflow-hidden rounded-lg border bg-background">
      {/* Top bar: title, timer, passage tabs */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b bg-muted/30 px-4 py-3">
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold">{title}</span>
        </div>
        <div className="flex items-center gap-4">
          {readOnly ? (
            <span className="rounded-md border px-2.5 py-1 text-sm text-muted-foreground">
              Read-only — no timer, answers aren&apos;t recorded
            </span>
          ) : (
            <div
              className={cn(
                "flex items-center gap-1.5 rounded-md border px-2.5 py-1 font-mono text-sm",
                secondsLeft === 0 && !result && "border-destructive text-destructive",
              )}
            >
              <Clock className="size-3.5" />
              {secondsLeft === 0 && !result ? "Time's up" : formatTime(secondsLeft)}
            </div>
          )}
        </div>
      </div>
      <div className="flex gap-1 border-b bg-muted/10 px-4 pt-2">
        {passages.map((passage) => (
          <button
            key={passage.passageNumber}
            type="button"
            onClick={() => setActivePassage(passage.passageNumber)}
            className={cn(
              "rounded-t-md border border-b-0 px-3 py-1.5 text-sm font-medium",
              activePassage === passage.passageNumber
                ? "border-border bg-background"
                : "border-transparent text-muted-foreground hover:bg-muted/50",
            )}
          >
            Passage {passage.passageNumber}
          </button>
        ))}
      </div>

      {/* Split screen: passage left, questions right */}
      <div className="grid grid-cols-1 md:grid-cols-2">
        <div className="h-[calc(100vh-230px)] min-h-[420px] overflow-y-auto border-b p-5 md:border-b-0 md:border-r">
          <h3 className="mb-3 font-semibold">
            Passage {activePassageData?.passageNumber}: {activePassageData?.title}
          </h3>
          <div className="prose prose-neutral max-w-none dark:prose-invert">
            {activePassageData?.paragraphs.map((para, i) => (
              <p key={i}>
                {para.label && <strong>{para.label}. </strong>}
                {para.text}
              </p>
            ))}
          </div>
        </div>

        <div className="h-[calc(100vh-230px)] min-h-[420px] overflow-y-auto p-5">
          <div className="flex flex-col gap-4">
            {activeQuestions.map((question) => {
              const graded = resultByQuestionId?.get(question.id) ?? null;
              const label = questionLabel(question, questions.indexOf(question), questions);
              return (
                <div
                  key={question.id}
                  ref={(el) => {
                    questionRefs.current[question.id] = el;
                  }}
                  className="rounded-md border p-3"
                >
                  <div className="mb-2 flex items-start justify-between gap-2">
                    <p className="text-sm font-medium">
                      <span className="mr-1.5 inline-flex size-5 items-center justify-center rounded-full bg-muted text-xs font-semibold">
                        {label}
                      </span>
                      {question.questionText}
                    </p>
                    {graded && <GradeBadge graded={graded} />}
                  </div>

                  {CHOICE_TYPES.has(question.questionType) && (
                    <ChoiceInput
                      question={question}
                      multiple={question.questionType === "multiple_answer"}
                      value={answers[question.id]?.selectedOptionIds ?? []}
                      disabled={!!result || readOnly}
                      onChange={(selectedOptionIds) => updateAnswer(question.id, { selectedOptionIds })}
                      correctOptionIds={graded?.correctOptionIds ?? null}
                    />
                  )}

                  {TEXT_TYPES.has(question.questionType) && (
                    <div className="flex flex-col gap-2">
                      <Input
                        value={answers[question.id]?.text ?? ""}
                        disabled={!!result || readOnly}
                        onChange={(e) => updateAnswer(question.id, { text: e.target.value })}
                        placeholder="Type your answer"
                      />
                      {graded && !graded.correct && graded.correctText && (
                        <p className="text-sm text-muted-foreground">
                          Correct answer:{" "}
                          <span className="font-medium text-foreground">{graded.correctText}</span>
                        </p>
                      )}
                    </div>
                  )}

                  {question.questionType === "matching" && (
                    <MatchingInput
                      question={question}
                      value={answers[question.id]?.matchingAnswer ?? {}}
                      disabled={!!result || readOnly}
                      onChange={(matchingAnswer) => updateAnswer(question.id, { matchingAnswer })}
                      graded={graded}
                    />
                  )}

                  {graded?.explanation && (
                    <p className="mt-3 rounded-md bg-muted/50 p-2.5 text-sm text-muted-foreground">
                      {graded.explanation}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Bottom bar: question navigator + submit */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-t bg-muted/30 px-4 py-3">
        <div className="flex flex-wrap gap-1">
          {questions.map((question, index) => {
            const label = questionLabel(question, index, questions);
            const answered = isAnswered(question);
            const graded = resultByQuestionId?.get(question.id);
            return (
              <button
                key={question.id}
                type="button"
                onClick={() => goToQuestion(question.id, question.passageNumber)}
                title={`Question ${label}`}
                className={cn(
                  "flex h-7 min-w-7 items-center justify-center rounded border px-1 text-xs font-medium",
                  activePassage === question.passageNumber && "border-primary",
                  answered && !result && "bg-primary/10",
                  graded && (graded.correct ? "border-emerald-600 bg-emerald-600/10" : graded.correct === false ? "border-destructive bg-destructive/10" : ""),
                )}
              >
                {label}
              </button>
            );
          })}
        </div>
        <div className="flex items-center gap-3">
          {readOnly ? (
            <span className="text-xs text-muted-foreground">Read-only mode — nothing is graded or saved</span>
          ) : (
            <>
              {!result && (
                <span className="text-xs text-muted-foreground">
                  {answeredCount} / {questions.reduce((s, q) => s + q.marks, 0)} answered
                </span>
              )}
              {error && <p className="text-sm text-destructive">{error}</p>}
              {!result ? (
                <Button type="button" onClick={handleSubmit} disabled={pending}>
                  {pending ? "Submitting..." : "Submit test"}
                </Button>
              ) : (
                <div className="flex items-center gap-3">
                  <p className="text-sm font-semibold">
                    Score: {result.earnedMarks} / {result.scorableMarks} ({result.percent}%)
                  </p>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
