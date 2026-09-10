"use client";

import Link from "next/link";
import { useActionState, useRef, useState } from "react";
import {
  importQuestionSet,
  type QuestionSetImportState,
} from "@/lib/admin/question-set-bulk-import-actions";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ChevronDown, ChevronUp } from "lucide-react";

export function QuestionSetImportForm() {
  const [state, formAction, pending] = useActionState<QuestionSetImportState, FormData>(
    importQuestionSet,
    undefined,
  );
  const [showFormat, setShowFormat] = useState(false);
  const [payload, setPayload] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  async function handleLoadFile(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    setPayload(await file.text());
    event.target.value = "";
  }

  return (
    <Card className="max-w-4xl">
      <CardHeader>
        <CardTitle>Import a question set</CardTitle>
        <CardDescription>
          Create a whole question set — its details plus every question — from one JSON document.
          Generate one with any AI model, starting from{" "}
          <Link href="/admin/question-banks/import/template-json" className="underline">
            the template
          </Link>
          . For adding questions to a set that already exists, use that set&apos;s own{" "}
          <Link href="/admin/question-banks" className="underline">
            CSV import
          </Link>{" "}
          instead.
        </CardDescription>
      </CardHeader>
      <form action={formAction}>
        <CardContent className="flex flex-col gap-4">
          {state?.error && (
            <Alert variant="destructive">
              <AlertDescription>
                <p>{state.error}</p>
                {state.issues && state.issues.length > 0 && (
                  <ul className="mt-2 list-inside list-disc text-sm">
                    {state.issues.slice(0, 20).map((issue, i) => (
                      <li key={i}>{issue}</li>
                    ))}
                  </ul>
                )}
              </AlertDescription>
            </Alert>
          )}

          <div className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between">
              <Label htmlFor="payload">Question set document (JSON)</Label>
              <div className="flex items-center gap-1">
                <Button type="button" variant="ghost" size="sm" onClick={() => fileInputRef.current?.click()}>
                  Load from file
                </Button>
                <Button type="button" variant="ghost" size="sm" onClick={() => setShowFormat((v) => !v)}>
                  {showFormat ? <ChevronUp /> : <ChevronDown />}
                  {showFormat ? "Hide format" : "Show format"}
                </Button>
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept=".json,application/json"
                hidden
                onChange={handleLoadFile}
              />
            </div>
            {showFormat && (
              <div className="flex flex-col gap-2 rounded-md border bg-muted/30 p-3 text-sm text-muted-foreground">
                <p>
                  One JSON document = one question set. <code>set</code> holds the set&apos;s
                  details (only <code>title</code> is required — <code>category</code> is the
                  category&apos;s slug path, e.g. <code>&quot;grammar/tenses&quot;</code>, and can
                  be left out for an unlinked set). <code>questions</code> is an array where each
                  item has a <code>questionType</code>:
                </p>
                <ul className="list-inside list-disc">
                  <li>
                    <code>multiple_choice</code> / <code>multiple_answer</code> /{" "}
                    <code>true_false</code> — need an <code>options</code> array of{" "}
                    <code>{"{ text, isCorrect }"}</code> (multiple_choice takes exactly one
                    correct option).
                  </li>
                  <li>
                    <code>fill_in_blank</code> / <code>short_answer</code> /{" "}
                    <code>written_answer</code> — need a <code>correctAnswer</code> string.
                  </li>
                  <li>
                    <code>ordering</code> — needs an <code>items</code> array in the correct
                    order.
                  </li>
                  <li>
                    <code>matching</code> — needs a <code>pairs</code> array of{" "}
                    <code>{"{ left, right }"}</code>.
                  </li>
                </ul>
                <p>
                  Every question also accepts optional <code>marks</code>, <code>difficulty</code>,
                  and <code>explanation</code>.
                </p>
              </div>
            )}
            <Textarea
              id="payload"
              name="payload"
              rows={20}
              placeholder="Paste the JSON document here..."
              className="font-mono text-xs"
              value={payload}
              onChange={(e) => setPayload(e.target.value)}
              required
            />
          </div>

          <Button type="submit" disabled={pending} className="w-fit">
            {pending ? "Importing..." : "Import question set"}
          </Button>
        </CardContent>
      </form>
    </Card>
  );
}
