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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { Clock, X } from "lucide-react";

const TEST_SECONDS = 60 * 60;
const CHOICE_TYPES = new Set(["multiple_choice", "true_false", "multiple_answer"]);
const TEXT_TYPES = new Set(["fill_in_blank", "short_answer"]);

// "Which paragraph contains the following information? Write the
// correct letter, A-F." (IELTS Matching Information) questions were
// transcribed as free-text fill-in-blank, so the real test's own
// range tells us which letters are actually valid — same real-CD-test
// reasoning as the split-screen layout itself: constrain the answer to
// what's actually possible instead of a bare text box.
const PARAGRAPH_LETTER_RE = /Write the correct letter,\s*([A-Z])[–-]([A-Z])\./;

function paragraphLetterOptions(question: SanitizedQuestion): string[] | null {
  if (!TEXT_TYPES.has(question.questionType)) return null;
  const match = question.questionText.match(PARAGRAPH_LETTER_RE);
  if (!match) return null;
  const start = match[1].charCodeAt(0);
  const end = match[2].charCodeAt(0);
  if (end < start || end - start > 25) return null;
  return Array.from({ length: end - start + 1 }, (_, i) => String.fromCharCode(start + i));
}

// "Complete the summary" questions were transcribed as one row per
// blank, each carrying the *entire* shared paragraph as its question
// text (only the blank number differs) — correct for grading, but
// rendered flat that's the same long paragraph repeated once per
// blank. This detects that shape so the paragraph can be shown once
// with each blank as an inline input, the way the real test presents
// it, instead of N near-identical cards.
const SUMMARY_QUESTION_RE =
  /^Complete the summary below\.\s*(.*?)\s*Blank\s*\((\d+)\)\.\s*Summary:\s*([\s\S]+)$/;

type RenderItem =
  | { kind: "single"; question: SanitizedQuestion }
  | {
      kind: "summary";
      instructions: string;
      summaryBody: string;
      questions: SanitizedQuestion[];
    };

function matchSummaryQuestion(question: SanitizedQuestion) {
  if (question.questionType !== "fill_in_blank") return null;
  const match = question.questionText.match(SUMMARY_QUESTION_RE);
  if (!match) return null;
  return { instructions: match[1].trim(), blankNumber: Number(match[2]), summaryBody: match[3].trim() };
}

// Groups consecutive questions that share an identical summary body
// into one cluster; anything else (including a summary question with
// no matching neighbor, which shouldn't happen but is handled safely)
// passes through as its own single-question item.
function buildRenderItems(questions: SanitizedQuestion[]): RenderItem[] {
  const items: RenderItem[] = [];
  let i = 0;
  while (i < questions.length) {
    const parsed = matchSummaryQuestion(questions[i]);
    if (!parsed) {
      items.push({ kind: "single", question: questions[i] });
      i++;
      continue;
    }
    const cluster = [questions[i]];
    let j = i + 1;
    while (j < questions.length) {
      const nextParsed = matchSummaryQuestion(questions[j]);
      if (!nextParsed || nextParsed.summaryBody !== parsed.summaryBody) break;
      cluster.push(questions[j]);
      j++;
    }
    if (cluster.length > 1) {
      items.push({
        kind: "summary",
        instructions: parsed.instructions,
        summaryBody: parsed.summaryBody,
        questions: cluster,
      });
    } else {
      items.push({ kind: "single", question: questions[i] });
    }
    i = j;
  }
  return items;
}

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

// Renders a "complete the summary" cluster as one flowing paragraph
// with each blank as an inline input, splitting the shared summary
// text on its "(NN)........." markers and matching each captured
// number back to the question that owns that blank number.
function SummaryCluster({
  instructions,
  summaryBody,
  questions,
  answers,
  disabled,
  onChange,
  resultByQuestionId,
  setQuestionRef,
}: {
  instructions: string;
  summaryBody: string;
  questions: SanitizedQuestion[];
  answers: Record<string, AnswerState>;
  disabled: boolean;
  onChange: (questionId: string, patch: AnswerState) => void;
  resultByQuestionId: Map<string, NonNullable<QuizResult["questions"][number]>> | null;
  setQuestionRef: (questionId: string, el: HTMLElement | null) => void;
}) {
  const byBlankNumber = new Map<number, SanitizedQuestion>();
  for (const question of questions) {
    const parsed = matchSummaryQuestion(question);
    if (parsed) byBlankNumber.set(parsed.blankNumber, question);
  }

  const parts = summaryBody.split(/\((\d+)\)\.+/);
  const explanations = questions
    .map((question) => ({ question, graded: resultByQuestionId?.get(question.id) }))
    .filter((entry) => entry.graded?.explanation);

  return (
    <div className="rounded-md border p-3">
      <p className="mb-2 text-sm font-medium">Complete the summary below. {instructions}</p>
      <p className="leading-loose">
        {parts.map((part, index) => {
          if (index % 2 === 0) return <span key={index}>{part}</span>;
          const question = byBlankNumber.get(Number(part));
          if (!question) return <span key={index}>({part})...........</span>;
          const graded = resultByQuestionId?.get(question.id) ?? null;
          return (
            <span
              key={index}
              ref={(el) => setQuestionRef(question.id, el)}
              className="mx-1 inline-flex items-baseline gap-1"
            >
              <Input
                value={answers[question.id]?.text ?? ""}
                disabled={disabled}
                onChange={(e) => onChange(question.id, { text: e.target.value })}
                placeholder={part}
                className={cn(
                  "inline-block h-7 w-32 px-1.5 py-0.5 align-baseline text-sm",
                  graded && (graded.correct ? "border-emerald-600" : "border-destructive"),
                )}
              />
              {graded && !graded.correct && graded.correctText && (
                <span className="text-xs whitespace-nowrap text-muted-foreground">
                  ({graded.correctText})
                </span>
              )}
            </span>
          );
        })}
      </p>
      {explanations.length > 0 && (
        <div className="mt-3 flex flex-col gap-1.5">
          {explanations.map(({ question, graded }) => {
            const parsed = matchSummaryQuestion(question);
            return (
              <p key={question.id} className="rounded-md bg-muted/50 p-2.5 text-sm text-muted-foreground">
                <strong>({parsed?.blankNumber}):</strong> {graded!.explanation}
              </p>
            );
          })}
        </div>
      )}
    </div>
  );
}

export function ReadingTestMode({
  questionSetId,
  title,
  passages,
  questions,
  readOnly = false,
  onExit,
}: {
  questionSetId: string;
  title: string;
  passages: ReadingPassage[];
  questions: SanitizedQuestion[];
  readOnly?: boolean;
  onExit?: () => void;
}) {
  const [activePassage, setActivePassage] = useState(passages[0]?.passageNumber ?? 1);
  const [answers, setAnswers] = useState<Record<string, AnswerState>>({});
  const [result, setResult] = useState<QuizResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const [secondsLeft, setSecondsLeft] = useState(TEST_SECONDS);
  const questionRefs = useRef<Record<string, HTMLElement | null>>({});
  const setQuestionRef = (questionId: string, el: HTMLElement | null) => {
    questionRefs.current[questionId] = el;
  };

  useEffect(() => {
    if (result || readOnly) return;
    const interval = setInterval(() => {
      setSecondsLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, [result, readOnly]);

  // This renders as a fixed full-viewport overlay (see the root div
  // below) so the page behind it must not also scroll — same reasoning
  // any full-screen modal/dialog has for locking body scroll while open.
  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, []);

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

  const activeQuestions = useMemo(
    () => questionsByPassage.get(activePassage) ?? [],
    [questionsByPassage, activePassage],
  );
  const activePassageData = passages.find((p) => p.passageNumber === activePassage);
  const answeredCount = questions.filter(isAnswered).length;
  const renderItems = useMemo(() => buildRenderItems(activeQuestions), [activeQuestions]);

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-background">
      {/* Top bar: title, exit, timer, passage tabs */}
      <div className="flex shrink-0 flex-wrap items-center justify-between gap-3 border-b bg-muted/30 px-4 py-3">
        <div className="flex items-center gap-2">
          {onExit && (
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              aria-label="Exit test"
              onClick={onExit}
            >
              <X />
            </Button>
          )}
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
      <div className="flex shrink-0 gap-1 border-b bg-muted/10 px-4 pt-2">
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

      {/* Split screen: passage left, questions right (stacked on
          mobile). flex-1 + min-h-0 on both the row and each pane makes
          every pane share the remaining viewport height equally and
          scroll independently, instead of the page itself scrolling. */}
      <div className="flex min-h-0 flex-1 flex-col md:flex-row">
        <div className="min-h-0 flex-1 overflow-y-auto border-b p-5 md:border-b-0 md:border-r">
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

        <div className="min-h-0 flex-1 overflow-y-auto p-5">
          <div className="flex flex-col gap-4">
            {renderItems.map((item) => {
              if (item.kind === "summary") {
                return (
                  <SummaryCluster
                    key={item.questions[0].id}
                    instructions={item.instructions}
                    summaryBody={item.summaryBody}
                    questions={item.questions}
                    answers={answers}
                    disabled={!!result || readOnly}
                    onChange={updateAnswer}
                    resultByQuestionId={resultByQuestionId}
                    setQuestionRef={setQuestionRef}
                  />
                );
              }

              const question = item.question;
              const graded = resultByQuestionId?.get(question.id) ?? null;
              const label = questionLabel(question, questions.indexOf(question), questions);
              const letterOptions = paragraphLetterOptions(question);
              return (
                <div
                  key={question.id}
                  ref={(el) => setQuestionRef(question.id, el)}
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
                      {letterOptions ? (
                        <Select
                          value={answers[question.id]?.text ?? ""}
                          onValueChange={(value) => updateAnswer(question.id, { text: value ?? "" })}
                          disabled={!!result || readOnly}
                        >
                          <SelectTrigger
                            className={cn(
                              "w-28",
                              graded &&
                                (graded.correct ? "border-emerald-600" : "border-destructive"),
                            )}
                          >
                            <SelectValue placeholder="Letter" />
                          </SelectTrigger>
                          <SelectContent>
                            {letterOptions.map((letter) => (
                              <SelectItem key={letter} value={letter}>
                                {letter}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      ) : (
                        <Input
                          value={answers[question.id]?.text ?? ""}
                          disabled={!!result || readOnly}
                          onChange={(e) => updateAnswer(question.id, { text: e.target.value })}
                          placeholder="Type your answer"
                        />
                      )}
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

      {/* Bottom bar: question navigator + submit. The chip navigator
          scrolls on its own (capped height) for long tests so it can
          never push the submit button/status off screen. */}
      <div className="flex shrink-0 flex-wrap items-center justify-between gap-3 border-t bg-muted/30 px-4 py-3">
        <div className="flex max-h-20 flex-wrap gap-1 overflow-y-auto">
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
