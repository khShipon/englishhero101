"use client";

import { useActionState } from "react";
import Link from "next/link";
import { createLesson, updateLesson, type LessonFormState } from "@/lib/admin/lesson-actions";
import type { ParentOption } from "@/lib/admin/parent-options";
import type { Lesson } from "@/lib/queries/lessons";
import { LessonRichTextEditor } from "./lesson-rich-text-editor";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";

export function LessonForm({
  mode,
  lessonId,
  parentOptions,
  defaultNodeId,
  defaultValues,
}: {
  mode: "create" | "edit";
  lessonId?: string;
  parentOptions: ParentOption[];
  defaultNodeId?: string;
  defaultValues?: Partial<Lesson>;
}) {
  const action = mode === "create" ? createLesson : updateLesson;
  const [state, formAction, pending] = useActionState<LessonFormState, FormData>(action, undefined);
  const status = defaultValues?.status ?? "draft";

  return (
    <Card className="max-w-3xl">
      <CardHeader>
        <CardTitle>{mode === "create" ? "New lesson" : "Edit lesson"}</CardTitle>
      </CardHeader>
      <form action={formAction}>
        <CardContent className="flex flex-col gap-4">
          {lessonId && <input type="hidden" name="id" value={lessonId} />}
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
            <Label htmlFor="slug">Slug</Label>
            <Input id="slug" name="slug" defaultValue={defaultValues?.slug ?? ""} required />
            {state?.fieldErrors?.slug && (
              <p className="text-sm text-destructive">{state.fieldErrors.slug[0]}</p>
            )}
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="nodeId">Parent category</Label>
            <Select name="nodeId" defaultValue={defaultValues?.nodeId ?? defaultNodeId}>
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
            {state?.fieldErrors?.nodeId && (
              <p className="text-sm text-destructive">{state.fieldErrors.nodeId[0]}</p>
            )}
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="excerpt">Excerpt</Label>
            <Textarea
              id="excerpt"
              name="excerpt"
              defaultValue={defaultValues?.excerpt ?? ""}
              rows={2}
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label>Content</Label>
            <LessonRichTextEditor name="content" initialContent={defaultValues?.content} />
            {state?.fieldErrors?.content && (
              <p className="text-sm text-destructive">{state.fieldErrors.content[0]}</p>
            )}
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
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

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="estimatedMinutes">Estimated reading time (minutes)</Label>
              <Input
                id="estimatedMinutes"
                name="estimatedMinutes"
                type="number"
                min={1}
                max={600}
                defaultValue={defaultValues?.estimatedMinutes ?? ""}
              />
              {state?.fieldErrors?.estimatedMinutes && (
                <p className="text-sm text-destructive">{state.fieldErrors.estimatedMinutes[0]}</p>
              )}
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="seoTitle">SEO title (optional)</Label>
            <Input id="seoTitle" name="seoTitle" defaultValue={defaultValues?.seoTitle ?? ""} />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="seoDescription">SEO description (optional)</Label>
            <Textarea
              id="seoDescription"
              name="seoDescription"
              defaultValue={defaultValues?.seoDescription ?? ""}
              rows={2}
            />
          </div>
        </CardContent>
        <CardFooter className="flex flex-wrap items-center gap-2">
          {status === "published" ? (
            <>
              <Button type="submit" name="intent" value="save" disabled={pending}>
                {pending ? "Saving..." : "Save changes"}
              </Button>
              <Button type="submit" name="intent" value="unpublish" variant="outline" disabled={pending}>
                Unpublish
              </Button>
            </>
          ) : (
            <>
              <Button type="submit" name="intent" value="draft" variant="outline" disabled={pending}>
                {pending ? "Saving..." : "Save Draft"}
              </Button>
              <Button type="submit" name="intent" value="publish" disabled={pending}>
                Publish
              </Button>
            </>
          )}
          {lessonId && (
            <Link
              href={`/admin/lessons/${lessonId}/preview`}
              target="_blank"
              rel="noopener noreferrer"
              className={buttonVariants({ variant: "ghost" })}
            >
              Preview
            </Link>
          )}
        </CardFooter>
      </form>
    </Card>
  );
}
