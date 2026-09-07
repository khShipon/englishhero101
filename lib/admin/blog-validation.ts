import * as z from "zod";
import { lessonContentSchema } from "@/types/lesson-content";

function optionalText(max: number) {
  return z
    .string()
    .trim()
    .max(max)
    .transform((value) => (value === "" ? null : value));
}

export const blogPostSchema = z.object({
  title: z.string().trim().min(1, { error: "Title is required." }).max(200),
  slug: z
    .string()
    .trim()
    .toLowerCase()
    .min(1, { error: "Slug is required." })
    .regex(/^[a-z0-9]+(-[a-z0-9]+)*$/, {
      error: "Use lowercase letters, numbers, and hyphens only.",
    }),
  excerpt: optionalText(500),
  coverImageUrl: optionalText(2000),
  content: z
    .string()
    .transform((value, ctx) => {
      try {
        return JSON.parse(value);
      } catch {
        ctx.addIssue({ code: "custom", message: "Post content is corrupted." });
        return z.NEVER;
      }
    })
    .pipe(lessonContentSchema),
  seoTitle: optionalText(200),
  seoDescription: optionalText(300),
});

export type BlogPostFormValues = z.infer<typeof blogPostSchema>;
