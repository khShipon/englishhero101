"use client";

import { useActionState } from "react";
import { createBlogPost, updateBlogPost, type BlogPostFormState } from "@/lib/admin/blog-actions";
import type { BlogPost } from "@/lib/queries/blog";
import { LessonRichTextEditor } from "@/components/admin/lesson-editor/lesson-rich-text-editor";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";

export function BlogForm({
  mode,
  postId,
  defaultValues,
}: {
  mode: "create" | "edit";
  postId?: string;
  defaultValues?: Partial<BlogPost>;
}) {
  const action = mode === "create" ? createBlogPost : updateBlogPost;
  const [state, formAction, pending] = useActionState<BlogPostFormState, FormData>(action, undefined);
  const status = defaultValues?.status ?? "draft";

  return (
    <Card className="max-w-4xl">
      <CardHeader>
        <CardTitle>{mode === "create" ? "New post" : "Edit post"}</CardTitle>
      </CardHeader>
      <form action={formAction}>
        <CardContent className="flex flex-col gap-4">
          {postId && <input type="hidden" name="id" value={postId} />}
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
            <Label htmlFor="excerpt">Excerpt</Label>
            <Textarea
              id="excerpt"
              name="excerpt"
              defaultValue={defaultValues?.excerpt ?? ""}
              rows={2}
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="coverImageUrl">Cover image URL (optional)</Label>
            <Input
              id="coverImageUrl"
              name="coverImageUrl"
              type="url"
              defaultValue={defaultValues?.coverImageUrl ?? ""}
              placeholder="https://..."
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label>Content</Label>
            <LessonRichTextEditor name="content" initialContent={defaultValues?.content} />
            {state?.fieldErrors?.content && (
              <p className="text-sm text-destructive">{state.fieldErrors.content[0]}</p>
            )}
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
        </CardFooter>
      </form>
    </Card>
  );
}
