"use client";

import { useActionState } from "react";
import {
  createVocabulary,
  updateVocabulary,
  type VocabularyFormState,
} from "@/lib/admin/vocabulary-actions";
import type { ParentOption } from "@/lib/admin/parent-options";
import type { VocabularyEntry } from "@/lib/queries/vocabulary";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";

export function VocabularyForm({
  mode,
  vocabularyId,
  parentOptions,
  defaultValues,
}: {
  mode: "create" | "edit";
  vocabularyId?: string;
  parentOptions: ParentOption[];
  defaultValues?: VocabularyEntry;
}) {
  const action = mode === "create" ? createVocabulary : updateVocabulary;
  const [state, formAction, pending] = useActionState<VocabularyFormState, FormData>(
    action,
    undefined,
  );

  return (
    <Card className="max-w-2xl">
      <CardHeader>
        <CardTitle>{mode === "create" ? "New vocabulary entry" : "Edit vocabulary entry"}</CardTitle>
      </CardHeader>
      <form action={formAction}>
        <CardContent className="flex flex-col gap-4">
          {vocabularyId && <input type="hidden" name="id" value={vocabularyId} />}
          {state?.error && (
            <Alert variant="destructive">
              <AlertDescription>{state.error}</AlertDescription>
            </Alert>
          )}

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="word">Word</Label>
              <Input id="word" name="word" defaultValue={defaultValues?.word ?? ""} required />
              {state?.fieldErrors?.word && (
                <p className="text-sm text-destructive">{state.fieldErrors.word[0]}</p>
              )}
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="pronunciation">Pronunciation</Label>
              <Input
                id="pronunciation"
                name="pronunciation"
                defaultValue={defaultValues?.pronunciation ?? ""}
                placeholder="/wɜːd/"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="partOfSpeech">Part of speech</Label>
              <Input
                id="partOfSpeech"
                name="partOfSpeech"
                defaultValue={defaultValues?.partOfSpeech ?? ""}
                placeholder="noun, verb, adjective..."
              />
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

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="banglaMeaning">Bangla meaning</Label>
            <Input
              id="banglaMeaning"
              name="banglaMeaning"
              defaultValue={defaultValues?.banglaMeaning ?? ""}
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="englishDefinition">English definition</Label>
            <Textarea
              id="englishDefinition"
              name="englishDefinition"
              defaultValue={defaultValues?.englishDefinition ?? ""}
              rows={2}
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="exampleSentence">Example sentence</Label>
            <Textarea
              id="exampleSentence"
              name="exampleSentence"
              defaultValue={defaultValues?.exampleSentence ?? ""}
              rows={2}
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="synonyms">Synonyms</Label>
            <Input
              id="synonyms"
              name="synonyms"
              defaultValue={defaultValues?.synonyms.join(", ") ?? ""}
              placeholder="Comma-separated, e.g. omnipresent, pervasive"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="antonyms">Antonyms</Label>
            <Input
              id="antonyms"
              name="antonyms"
              defaultValue={defaultValues?.antonyms.join(", ") ?? ""}
              placeholder="Comma-separated"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="relatedWords">Related words</Label>
            <Input
              id="relatedWords"
              name="relatedWords"
              defaultValue={defaultValues?.relatedWords.join(", ") ?? ""}
              placeholder="Comma-separated"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="nodeId">Category (optional)</Label>
            <Select name="nodeId" defaultValue={defaultValues?.nodeId ?? "none"}>
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
