"use client";

import { useActionState, useState } from "react";
import {
  createContentNode,
  updateContentNode,
  type ContentFormState,
} from "@/lib/admin/content-actions";
import type { ParentOption } from "@/lib/admin/parent-options";
import { slugify } from "@/lib/utils/slug";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";

const NODE_TYPE_SUGGESTIONS = [
  "category",
  "section",
  "topic",
  "subtopic",
  "lesson",
  "question_bank",
  "quiz",
  "resource",
];

export type ContentNodeFormValues = {
  title?: string;
  slug?: string;
  nodeType?: string;
  parentId?: string | null;
  description?: string | null;
  icon?: string | null;
  coverImageUrl?: string | null;
  isPublished?: boolean;
  isFeatured?: boolean;
  seoTitle?: string | null;
  seoDescription?: string | null;
};

export function ContentNodeForm({
  mode,
  nodeId,
  parentOptions,
  defaultValues,
}: {
  mode: "create" | "edit";
  nodeId?: string;
  parentOptions: ParentOption[];
  defaultValues?: ContentNodeFormValues;
}) {
  const action = mode === "create" ? createContentNode : updateContentNode;
  const [state, formAction, pending] = useActionState<ContentFormState, FormData>(action, undefined);
  const [title, setTitle] = useState(defaultValues?.title ?? "");
  const [slug, setSlug] = useState(defaultValues?.slug ?? "");
  const [slugTouched, setSlugTouched] = useState(mode === "edit");

  function handleTitleChange(value: string) {
    setTitle(value);
    if (!slugTouched) {
      setSlug(slugify(value));
    }
  }

  return (
    <Card className="max-w-2xl">
      <CardHeader>
        <CardTitle>{mode === "create" ? "New content node" : "Edit content node"}</CardTitle>
      </CardHeader>
      <form action={formAction}>
        <CardContent className="flex flex-col gap-4">
          {nodeId && <input type="hidden" name="id" value={nodeId} />}
          {state?.error && (
            <Alert variant="destructive">
              <AlertDescription>{state.error}</AlertDescription>
            </Alert>
          )}

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              name="title"
              value={title}
              onChange={(event) => handleTitleChange(event.target.value)}
              required
            />
            {state?.fieldErrors?.title && (
              <p className="text-sm text-destructive">{state.fieldErrors.title[0]}</p>
            )}
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="slug">Slug</Label>
            <Input
              id="slug"
              name="slug"
              value={slug}
              onChange={(event) => {
                setSlug(event.target.value);
                setSlugTouched(true);
              }}
              required
            />
            {state?.fieldErrors?.slug && (
              <p className="text-sm text-destructive">{state.fieldErrors.slug[0]}</p>
            )}
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="nodeType">Node type</Label>
              <Input
                id="nodeType"
                name="nodeType"
                list="node-type-suggestions"
                defaultValue={defaultValues?.nodeType ?? "category"}
                required
              />
              <datalist id="node-type-suggestions">
                {NODE_TYPE_SUGGESTIONS.map((type) => (
                  <option key={type} value={type} />
                ))}
              </datalist>
              {state?.fieldErrors?.nodeType && (
                <p className="text-sm text-destructive">{state.fieldErrors.nodeType[0]}</p>
              )}
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="parentId">Parent</Label>
              <Select
                name="parentId"
                defaultValue={defaultValues?.parentId ?? "none"}
                items={[
                  { value: "none", label: "None (top level)" },
                  ...parentOptions.map((option) => ({ value: option.id, label: option.label })),
                ]}
              >
                <SelectTrigger id="parentId" className="w-full">
                  <SelectValue placeholder="None (top level)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">None (top level)</SelectItem>
                  {parentOptions.map((option) => (
                    <SelectItem key={option.id} value={option.id}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              name="description"
              defaultValue={defaultValues?.description ?? ""}
              rows={3}
            />
          </div>

          <div className="flex items-center gap-6">
            <label className="flex items-center gap-2 text-sm font-medium">
              <Switch name="isPublished" defaultChecked={defaultValues?.isPublished ?? false} />
              Published
            </label>
            <label className="flex items-center gap-2 text-sm font-medium">
              <Switch name="isFeatured" defaultChecked={defaultValues?.isFeatured ?? false} />
              Featured
            </label>
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="icon">Icon (optional)</Label>
            <Input
              id="icon"
              name="icon"
              defaultValue={defaultValues?.icon ?? ""}
              placeholder="e.g. book-open"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="coverImageUrl">Cover image URL (optional)</Label>
            <Input id="coverImageUrl" name="coverImageUrl" defaultValue={defaultValues?.coverImageUrl ?? ""} />
            {state?.fieldErrors?.coverImageUrl && (
              <p className="text-sm text-destructive">{state.fieldErrors.coverImageUrl[0]}</p>
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
        <CardFooter className="flex gap-2">
          <Button type="submit" disabled={pending}>
            {pending ? "Saving..." : mode === "create" ? "Create" : "Save changes"}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}
