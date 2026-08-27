"use client";

import { useActionState, useMemo, useState } from "react";
import {
  createReadingPassage,
  updateReadingPassage,
  type ReadingPassageFormState,
} from "@/lib/admin/reading-passage-actions";
import type { ReadingPassage } from "@/lib/queries/reading-passages";
import { ParagraphsEditor, type ParagraphValue } from "./paragraphs-editor";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";

export function ReadingPassageForm({
  mode,
  passageId,
  lessonId,
  defaultValues,
}: {
  mode: "create" | "edit";
  passageId?: string;
  lessonId: string;
  defaultValues?: ReadingPassage;
}) {
  const action = mode === "create" ? createReadingPassage : updateReadingPassage;
  const [state, formAction, pending] = useActionState<ReadingPassageFormState, FormData>(
    action,
    undefined,
  );

  const [paragraphs, setParagraphs] = useState<ParagraphValue[]>(
    () =>
      defaultValues?.paragraphs.map((paragraph) => ({
        label: paragraph.label ?? "",
        text: paragraph.text,
      })) ?? [{ label: "", text: "" }],
  );

  const paragraphsJson = useMemo(() => JSON.stringify(paragraphs), [paragraphs]);

  return (
    <Card className="max-w-5xl">
      <CardHeader>
        <CardTitle>{mode === "create" ? "New reading passage" : "Edit reading passage"}</CardTitle>
      </CardHeader>
      <form action={formAction}>
        <CardContent className="flex flex-col gap-4">
          {passageId && <input type="hidden" name="id" value={passageId} />}
          <input type="hidden" name="lessonId" value={lessonId} />
          <input type="hidden" name="paragraphs" value={paragraphsJson} />
          {state?.error && (
            <Alert variant="destructive">
              <AlertDescription>{state.error}</AlertDescription>
            </Alert>
          )}

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-[120px_1fr]">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="passageNumber">Passage #</Label>
              <Input
                id="passageNumber"
                name="passageNumber"
                type="number"
                min={1}
                max={20}
                defaultValue={defaultValues?.passageNumber ?? ""}
                required
              />
              {state?.fieldErrors?.passageNumber && (
                <p className="text-sm text-destructive">{state.fieldErrors.passageNumber[0]}</p>
              )}
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="title">Title</Label>
              <Input id="title" name="title" defaultValue={defaultValues?.title ?? ""} required />
              {state?.fieldErrors?.title && (
                <p className="text-sm text-destructive">{state.fieldErrors.title[0]}</p>
              )}
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <Label>Paragraphs</Label>
            <ParagraphsEditor paragraphs={paragraphs} onChange={setParagraphs} />
            {state?.fieldErrors?.paragraphs && (
              <p className="text-sm text-destructive">{state.fieldErrors.paragraphs[0]}</p>
            )}
          </div>
        </CardContent>
        <CardFooter>
          <Button type="submit" disabled={pending}>
            {pending ? "Saving..." : mode === "create" ? "Add passage" : "Save changes"}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}
