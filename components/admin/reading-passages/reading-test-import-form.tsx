"use client";

import { useActionState, useState } from "react";
import {
  importReadingTest,
  type ImportReadingTestState,
} from "@/lib/admin/reading-test-import-actions";
import type { ParentOption } from "@/lib/admin/parent-options";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChevronDown, ChevronUp } from "lucide-react";

const EXAMPLE = `{
  "lesson": {
    "title": "Example Reading Test",
    "slug": "example-reading-test",
    "excerpt": "One sentence describing the test.",
    "difficulty": "intermediate",
    "estimatedMinutes": 20
  },
  "passages": [
    {
      "passageNumber": 1,
      "title": "Passage title",
      "paragraphs": [
        { "label": "A", "text": "First paragraph text..." },
        { "label": "B", "text": "Second paragraph text..." }
      ],
      "questions": [
        {
          "kind": "choice",
          "ieltsType": "true_false_not_given",
          "prompt": "A statement to judge against the passage.",
          "correctOption": "True"
        },
        {
          "kind": "cloze_fill",
          "ieltsType": "summary_completion",
          "instructions": "Choose NO MORE THAN TWO WORDS for each answer.",
          "text": "A summary sentence with a [[1]] blank, and another [[2]] blank.",
          "answers": { "1": "first answer", "2": "second answer" }
        },
        {
          "kind": "matching",
          "ieltsType": "matching_information",
          "prompt": "Which paragraph contains the following information?",
          "pairs": [{ "left": "a description of X", "right": "B" }]
        }
      ]
    }
  ]
}`;

export function ReadingTestImportForm({
  parentOptions,
  defaultNodeId,
}: {
  parentOptions: ParentOption[];
  defaultNodeId?: string;
}) {
  const [state, formAction, pending] = useActionState<ImportReadingTestState, FormData>(
    importReadingTest,
    undefined,
  );
  const [showFormat, setShowFormat] = useState(false);

  return (
    <Card className="max-w-4xl">
      <CardHeader>
        <CardTitle>Import a full reading test</CardTitle>
      </CardHeader>
      <form action={formAction}>
        <CardContent className="flex flex-col gap-4">
          {state?.error && (
            <Alert variant="destructive">
              <AlertDescription>
                <p>{state.error}</p>
                {state.issues && state.issues.length > 0 && (
                  <ul className="mt-2 list-inside list-disc text-sm">
                    {state.issues.map((issue, i) => (
                      <li key={i}>{issue}</li>
                    ))}
                  </ul>
                )}
              </AlertDescription>
            </Alert>
          )}

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="nodeId">Parent category</Label>
            <Select
              name="nodeId"
              defaultValue={defaultNodeId}
              items={parentOptions.map((option) => ({ value: option.id, label: option.label }))}
            >
              <SelectTrigger id="nodeId" className="w-full">
                <SelectValue placeholder="Choose a category" />
              </SelectTrigger>
              <SelectContent>
                {parentOptions.map((option) => (
                  <SelectItem key={option.id} value={option.id}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between">
              <Label htmlFor="payload">Test document (JSON)</Label>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setShowFormat((v) => !v)}
              >
                {showFormat ? <ChevronUp /> : <ChevronDown />}
                {showFormat ? "Hide format" : "Show format & example"}
              </Button>
            </div>
            {showFormat && (
              <div className="flex flex-col gap-2 rounded-md border bg-muted/30 p-3 text-sm">
                <p className="text-muted-foreground">
                  One JSON document = one lesson with one or more passages. Each question has a{" "}
                  <code>kind</code>:
                </p>
                <ul className="list-inside list-disc text-muted-foreground">
                  <li>
                    <code>choice</code> — True/False/Not Given, Yes/No/Not Given, or Multiple Choice.
                    Needs <code>prompt</code> and <code>correctOption</code>; <code>options</code> is
                    optional for TFNG/YNNG (defaults to the standard 3 options).
                  </li>
                  <li>
                    <code>matching</code> — Matching Headings/Information/Features. Needs{" "}
                    <code>prompt</code> and a <code>pairs</code> array of <code>{"{ left, right }"}</code>.
                  </li>
                  <li>
                    <code>fill</code> — a single Sentence Completion / Short Answer blank. Needs{" "}
                    <code>prompt</code> and <code>correctAnswer</code>.
                  </li>
                  <li>
                    <code>cloze_fill</code> — a Summary/Note Completion paragraph with several blanks
                    marked <code>[[1]]</code>, <code>[[2]]</code>, etc. in <code>text</code>, plus an{" "}
                    <code>answers</code> map (<code>{'{ "1": "word", "2": "word" }'}</code>). Each blank
                    becomes its own question automatically.
                  </li>
                  <li>
                    <code>cloze_choice</code> — same as <code>cloze_fill</code>, but blanks are filled
                    from a shared <code>wordBank</code> array instead of free text.
                  </li>
                </ul>
                <p className="text-muted-foreground">
                  Every question also accepts optional <code>marks</code> and <code>explanation</code>
                  (or <code>instructions</code> for cloze blocks).
                </p>
                <pre className="overflow-x-auto rounded-md bg-background p-3 text-xs">{EXAMPLE}</pre>
              </div>
            )}
            <Textarea
              id="payload"
              name="payload"
              rows={20}
              placeholder="Paste the JSON document here..."
              className="font-mono text-xs"
              required
            />
          </div>

          <Button type="submit" disabled={pending} className="w-fit">
            {pending ? "Importing..." : "Import test"}
          </Button>
        </CardContent>
      </form>
    </Card>
  );
}
