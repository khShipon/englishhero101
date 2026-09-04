"use client";

import { useActionState } from "react";
import {
  createQuestionSet,
  updateQuestionSet,
  type QuestionSetFormState,
} from "@/lib/admin/question-bank-actions";
import type { ParentOption } from "@/lib/admin/parent-options";
import type { QuestionSet } from "@/lib/queries/question-banks";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";

const EXAM_TYPE_SUGGESTIONS = ["SSC", "HSC", "IELTS"];
const SUBJECT_SUGGESTIONS = ["English 1st Paper", "English 2nd Paper"];
// The 8 general education boards plus Madrasah and Technical — still
// free text (not a hard enum) so nothing already saved ever becomes
// invalid, this just keeps new entries consistent enough for the
// board/year filters on /question-banks to actually work.
const BOARD_SUGGESTIONS = [
  "Dhaka Board",
  "Rajshahi Board",
  "Chattogram Board",
  "Cumilla Board",
  "Barishal Board",
  "Jashore Board",
  "Sylhet Board",
  "Dinajpur Board",
  "Mymensingh Board",
  "Madrasah Board",
  "Technical Board",
];

// Base UI's Select.Value shows the raw stored value unless Select.Root
// is given an items map to resolve labels from — see components/ui/select.tsx.
const DIFFICULTY_ITEMS = [
  { value: "none", label: "Not set" },
  { value: "beginner", label: "Beginner" },
  { value: "intermediate", label: "Intermediate" },
  { value: "advanced", label: "Advanced" },
];

export function QuestionSetForm({
  mode,
  questionSetId,
  parentOptions,
  defaultValues,
}: {
  mode: "create" | "edit";
  questionSetId?: string;
  parentOptions: ParentOption[];
  defaultValues?: QuestionSet;
}) {
  const action = mode === "create" ? createQuestionSet : updateQuestionSet;
  const [state, formAction, pending] = useActionState<QuestionSetFormState, FormData>(action, undefined);

  return (
    <Card className="max-w-3xl">
      <CardHeader>
        <CardTitle>{mode === "create" ? "New question set" : "Edit question set"}</CardTitle>
      </CardHeader>
      <form action={formAction}>
        <CardContent className="flex flex-col gap-4">
          {questionSetId && <input type="hidden" name="id" value={questionSetId} />}
          {state?.error && (
            <Alert variant="destructive">
              <AlertDescription>{state.error}</AlertDescription>
            </Alert>
          )}

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="title">Title</Label>
            <Input id="title" name="title" defaultValue={defaultValues?.title ?? ""} required />
            {state?.fieldErrors?.title && (
              <p className="text-sm text-destructive">{state.fieldErrors.title[0]}</p>
            )}
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              name="description"
              defaultValue={defaultValues?.description ?? ""}
              rows={2}
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="nodeId">Category (optional)</Label>
            <Select
              name="nodeId"
              defaultValue={defaultValues?.nodeId ?? "none"}
              items={[
                { value: "none", label: "None" },
                ...parentOptions.map((option) => ({ value: option.id, label: option.label })),
              ]}
            >
              <SelectTrigger id="nodeId" className="w-full">
                <SelectValue placeholder="None" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">None</SelectItem>
                {parentOptions.map((option) => (
                  <SelectItem key={option.id} value={option.id}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="examType">Exam type</Label>
              <Input
                id="examType"
                name="examType"
                list="exam-type-suggestions"
                defaultValue={defaultValues?.examType ?? ""}
                placeholder="e.g. SSC, HSC, IELTS"
              />
              <datalist id="exam-type-suggestions">
                {EXAM_TYPE_SUGGESTIONS.map((type) => (
                  <option key={type} value={type} />
                ))}
              </datalist>
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="subject">Subject</Label>
              <Input
                id="subject"
                name="subject"
                list="subject-suggestions"
                defaultValue={defaultValues?.subject ?? ""}
              />
              <datalist id="subject-suggestions">
                {SUBJECT_SUGGESTIONS.map((subject) => (
                  <option key={subject} value={subject} />
                ))}
              </datalist>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="board">Board</Label>
              <Input id="board" name="board" list="board-suggestions" defaultValue={defaultValues?.board ?? ""} />
              <datalist id="board-suggestions">
                {BOARD_SUGGESTIONS.map((board) => (
                  <option key={board} value={board} />
                ))}
              </datalist>
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="year">Year</Label>
              <Input
                id="year"
                name="year"
                type="number"
                defaultValue={defaultValues?.year ?? ""}
              />
              {state?.fieldErrors?.year && (
                <p className="text-sm text-destructive">{state.fieldErrors.year[0]}</p>
              )}
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="durationMinutes">Duration (min)</Label>
              <Input
                id="durationMinutes"
                name="durationMinutes"
                type="number"
                defaultValue={defaultValues?.durationMinutes ?? ""}
              />
              {state?.fieldErrors?.durationMinutes && (
                <p className="text-sm text-destructive">{state.fieldErrors.durationMinutes[0]}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="difficulty">Difficulty</Label>
              <Select
                name="difficulty"
                defaultValue={defaultValues?.difficulty ?? "none"}
                items={DIFFICULTY_ITEMS}
              >
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
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="marks">Total marks</Label>
              <Input id="marks" name="marks" type="number" defaultValue={defaultValues?.marks ?? ""} />
              {state?.fieldErrors?.marks && (
                <p className="text-sm text-destructive">{state.fieldErrors.marks[0]}</p>
              )}
            </div>
          </div>

          <label className="flex w-fit items-center gap-2 text-sm font-medium">
            <Switch name="isPublished" defaultChecked={defaultValues?.isPublished ?? false} />
            Published
          </label>
        </CardContent>
        <CardFooter>
          <Button type="submit" disabled={pending}>
            {pending ? "Saving..." : mode === "create" ? "Create" : "Save changes"}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}
