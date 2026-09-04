"use client";

import { useActionState, useMemo, useState } from "react";
import { createQuestion, updateQuestion, type QuestionFormState } from "@/lib/admin/question-actions";
import {
  QUESTION_TYPES,
  CHOICE_TYPES,
  type QuestionType,
  type StructuredData,
} from "@/lib/admin/question-validation";
import { IELTS_READING_QUESTION_TYPES } from "@/lib/admin/ielts-reading-question-types";
import type { Question } from "@/lib/queries/question-banks";
import type { ReadingPassage } from "@/lib/queries/reading-passages";
import { OptionsEditor, PairsEditor, OrderItemsEditor, type OptionValue, type PairValue } from "./structured-editors";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";

const QUESTION_TYPE_LABELS: Record<QuestionType, string> = {
  multiple_choice: "Multiple choice (one correct answer)",
  multiple_answer: "Multiple answer (several correct)",
  true_false: "True / False",
  fill_in_blank: "Fill in the blank",
  short_answer: "Short answer",
  matching: "Matching",
  ordering: "Ordering",
  written_answer: "Written answer",
};

function defaultOptionsFor(type: QuestionType): OptionValue[] {
  if (type === "true_false") {
    return [
      { text: "True", isCorrect: true },
      { text: "False", isCorrect: false },
    ];
  }
  return [
    { text: "", isCorrect: false },
    { text: "", isCorrect: false },
  ];
}

export function QuestionForm({
  mode,
  questionId,
  questionSetId,
  defaultValues,
  passages,
  initialPassageNumber,
}: {
  mode: "create" | "edit";
  questionId?: string;
  questionSetId: string;
  defaultValues?: Question;
  passages?: ReadingPassage[];
  initialPassageNumber?: number;
}) {
  const action = mode === "create" ? createQuestion : updateQuestion;
  const [state, formAction, pending] = useActionState<QuestionFormState, FormData>(action, undefined);

  const defaultPassageNumber =
    (defaultValues?.metadata as { passage_number?: number } | undefined)?.passage_number ??
    initialPassageNumber;

  const [questionType, setQuestionType] = useState<QuestionType>(
    defaultValues?.questionType ?? "multiple_choice",
  );
  const [ieltsPreset, setIeltsPreset] = useState<string>(
    (defaultValues?.metadata as { ielts_question_type?: string } | undefined)?.ielts_question_type ?? "",
  );
  const [options, setOptions] = useState<OptionValue[]>(() => {
    if (defaultValues && CHOICE_TYPES.includes(defaultValues.questionType)) {
      return defaultValues.options.map((option) => ({
        text: option.optionText,
        isCorrect: option.isCorrect,
      }));
    }
    return defaultOptionsFor(questionType);
  });
  const [items, setItems] = useState<string[]>(() =>
    defaultValues?.questionType === "ordering"
      ? defaultValues.options.map((option) => option.optionText)
      : ["", ""],
  );
  const [pairs, setPairs] = useState<PairValue[]>(() => {
    const metaPairs = defaultValues?.metadata?.pairs;
    if (defaultValues?.questionType === "matching" && Array.isArray(metaPairs)) {
      return metaPairs as PairValue[];
    }
    return [{ left: "", right: "" }];
  });

  function handleTypeChange(next: QuestionType) {
    setQuestionType(next);
    setIeltsPreset(""); // manual override no longer matches a preset's fixed options
    if (CHOICE_TYPES.includes(next) && options.every((option) => option.text === "")) {
      setOptions(defaultOptionsFor(next));
    }
    if (next === "true_false") {
      setOptions(defaultOptionsFor(next));
    }
  }

  function handlePresetChange(key: string) {
    setIeltsPreset(key);
    const preset = IELTS_READING_QUESTION_TYPES.find((type) => type.key === key);
    if (!preset) return;
    setQuestionType(preset.questionType);
    if (preset.presetOptions) {
      setOptions(preset.presetOptions.map((text) => ({ text, isCorrect: false })));
    } else if (CHOICE_TYPES.includes(preset.questionType)) {
      setOptions(defaultOptionsFor(preset.questionType));
    } else if (preset.questionType === "matching") {
      setPairs([{ left: "", right: "" }]);
    }
  }

  const selectedPreset = IELTS_READING_QUESTION_TYPES.find((type) => type.key === ieltsPreset) ?? null;
  const optionsLocked = selectedPreset ? !!selectedPreset.presetOptions : questionType === "true_false";

  const structuredData: StructuredData = useMemo(() => {
    if (CHOICE_TYPES.includes(questionType)) {
      return { type: questionType as "multiple_choice" | "multiple_answer" | "true_false", options };
    }
    if (questionType === "ordering") {
      return { type: "ordering", items };
    }
    if (questionType === "matching") {
      return { type: "matching", pairs };
    }
    return { type: questionType as "fill_in_blank" | "short_answer" | "written_answer" };
  }, [questionType, options, items, pairs]);

  // IELTS reading questions get a wider card — the question text and
  // passage context are longer than a typical multiple-choice question,
  // so the default max-w-2xl feels cramped once a passage picker is
  // showing.
  const isIeltsReading = !!passages && passages.length > 0;

  return (
    <Card className={isIeltsReading ? "max-w-4xl" : "max-w-3xl"}>
      <CardHeader>
        <CardTitle>{mode === "create" ? "New question" : "Edit question"}</CardTitle>
      </CardHeader>
      <form action={formAction}>
        <CardContent className="flex flex-col gap-4">
          {questionId && <input type="hidden" name="id" value={questionId} />}
          <input type="hidden" name="questionSetId" value={questionSetId} />
          <input type="hidden" name="structuredData" value={JSON.stringify(structuredData)} />
          <input type="hidden" name="ieltsQuestionType" value={ieltsPreset} />
          {state?.error && (
            <Alert variant="destructive">
              <AlertDescription>{state.error}</AlertDescription>
            </Alert>
          )}

          {isIeltsReading && (
            <div className="flex flex-col gap-1.5 rounded-md border bg-muted/30 p-3">
              <Label htmlFor="ieltsPreset">IELTS reading question type</Label>
              <Select
                value={ieltsPreset || "none"}
                onValueChange={(value) => handlePresetChange(!value || value === "none" ? "" : value)}
              >
                <SelectTrigger id="ieltsPreset" className="w-full bg-background">
                  <SelectValue placeholder="Choose to auto-fill defaults" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Custom (use the question type below)</SelectItem>
                  {IELTS_READING_QUESTION_TYPES.map((type) => (
                    <SelectItem key={type.key} value={type.key}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {selectedPreset && (
                <p className="text-sm text-muted-foreground">{selectedPreset.hint}</p>
              )}
            </div>
          )}

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="questionType">Question type</Label>
            <Select
              name="questionType"
              value={questionType}
              onValueChange={(value) => handleTypeChange(value as QuestionType)}
            >
              <SelectTrigger id="questionType" className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {QUESTION_TYPES.map((type) => (
                  <SelectItem key={type} value={type}>
                    {QUESTION_TYPE_LABELS[type]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {passages && passages.length > 0 && (
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="passageNumber">Passage</Label>
              <Select
                name="passageNumber"
                defaultValue={defaultPassageNumber ? String(defaultPassageNumber) : "none"}
              >
                <SelectTrigger id="passageNumber" className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Not linked to a passage</SelectItem>
                  {passages.map((passage) => (
                    <SelectItem key={passage.id} value={String(passage.passageNumber)}>
                      Passage {passage.passageNumber}: {passage.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="questionText">Question text</Label>
            <Textarea
              id="questionText"
              name="questionText"
              defaultValue={defaultValues?.questionText ?? ""}
              rows={3}
              required
            />
            {state?.fieldErrors?.questionText && (
              <p className="text-sm text-destructive">{state.fieldErrors.questionText[0]}</p>
            )}
          </div>

          {CHOICE_TYPES.includes(questionType) && (
            <div className="flex flex-col gap-1.5">
              <Label>Options</Label>
              <OptionsEditor
                options={options}
                onChange={setOptions}
                multiple={questionType === "multiple_answer"}
                locked={optionsLocked}
              />
              {state?.fieldErrors?.structuredData && (
                <p className="text-sm text-destructive">{state.fieldErrors.structuredData[0]}</p>
              )}
            </div>
          )}

          {questionType === "ordering" && (
            <div className="flex flex-col gap-1.5">
              <Label>Items</Label>
              <OrderItemsEditor items={items} onChange={setItems} />
              {state?.fieldErrors?.structuredData && (
                <p className="text-sm text-destructive">{state.fieldErrors.structuredData[0]}</p>
              )}
            </div>
          )}

          {questionType === "matching" && (
            <div className="flex flex-col gap-1.5">
              <Label>Pairs</Label>
              <PairsEditor pairs={pairs} onChange={setPairs} />
              {state?.fieldErrors?.structuredData && (
                <p className="text-sm text-destructive">{state.fieldErrors.structuredData[0]}</p>
              )}
            </div>
          )}

          {(questionType === "fill_in_blank" ||
            questionType === "short_answer" ||
            questionType === "written_answer") && (
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="correctAnswer">
                {questionType === "written_answer" ? "Model answer (optional)" : "Correct answer"}
              </Label>
              <Textarea
                id="correctAnswer"
                name="correctAnswer"
                defaultValue={defaultValues?.correctAnswer ?? ""}
                rows={2}
                required={questionType === "fill_in_blank"}
              />
            </div>
          )}

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="explanation">Explanation (optional)</Label>
            <Textarea
              id="explanation"
              name="explanation"
              defaultValue={defaultValues?.explanation ?? ""}
              rows={2}
            />
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="marks">Marks</Label>
              <Input
                id="marks"
                name="marks"
                type="number"
                min={0.5}
                step={0.5}
                defaultValue={defaultValues?.marks ?? 1}
              />
              {state?.fieldErrors?.marks && (
                <p className="text-sm text-destructive">{state.fieldErrors.marks[0]}</p>
              )}
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="difficulty">Difficulty</Label>
              <Select name="difficulty" defaultValue={defaultValues?.difficulty ?? "none"}>
                <SelectTrigger id="difficulty" className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Not set</SelectItem>
                  <SelectItem value="beginner">Beginner</SelectItem>
                  <SelectItem value="intermediate">Intermediate</SelectItem>
                  <SelectItem value="advanced">Advanced</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
        <CardFooter>
          <Button type="submit" disabled={pending}>
            {pending ? "Saving..." : mode === "create" ? "Add question" : "Save changes"}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}
