"use client";

import { useActionState, useMemo, useState } from "react";
import { createQuestion, updateQuestion, type QuestionFormState } from "@/lib/admin/question-actions";
import {
  QUESTION_TYPES,
  CHOICE_TYPES,
  type QuestionType,
  type StructuredData,
} from "@/lib/admin/question-validation";
import type { Question } from "@/lib/queries/question-banks";
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
}: {
  mode: "create" | "edit";
  questionId?: string;
  questionSetId: string;
  defaultValues?: Question;
}) {
  const action = mode === "create" ? createQuestion : updateQuestion;
  const [state, formAction, pending] = useActionState<QuestionFormState, FormData>(action, undefined);

  const [questionType, setQuestionType] = useState<QuestionType>(
    defaultValues?.questionType ?? "multiple_choice",
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
    if (CHOICE_TYPES.includes(next) && options.every((option) => option.text === "")) {
      setOptions(defaultOptionsFor(next));
    }
    if (next === "true_false") {
      setOptions(defaultOptionsFor(next));
    }
  }

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

  return (
    <Card className="max-w-2xl">
      <CardHeader>
        <CardTitle>{mode === "create" ? "New question" : "Edit question"}</CardTitle>
      </CardHeader>
      <form action={formAction}>
        <CardContent className="flex flex-col gap-4">
          {questionId && <input type="hidden" name="id" value={questionId} />}
          <input type="hidden" name="questionSetId" value={questionSetId} />
          <input type="hidden" name="structuredData" value={JSON.stringify(structuredData)} />
          {state?.error && (
            <Alert variant="destructive">
              <AlertDescription>{state.error}</AlertDescription>
            </Alert>
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
                locked={questionType === "true_false"}
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
