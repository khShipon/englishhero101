import * as z from "zod";
import { lessonContentSchema } from "@/types/lesson-content";

function optionalText(max: number) {
  return z
    .string()
    .trim()
    .max(max)
    .transform((value) => (value === "" ? null : value));
}

export const lessonSchema = z.object({
  title: z.string().trim().min(1, { error: "Title is required." }).max(200),
  slug: z
    .string()
    .trim()
    .toLowerCase()
    .min(1, { error: "Slug is required." })
    .regex(/^[a-z0-9]+(-[a-z0-9]+)*$/, {
      error: "Use lowercase letters, numbers, and hyphens only.",
    }),
  nodeId: z.uuid({ error: "Choose a parent category." }),
  excerpt: optionalText(500),
  content: z
    .string()
    .transform((value, ctx) => {
      try {
        return JSON.parse(value);
      } catch {
        ctx.addIssue({ code: "custom", message: "Lesson content is corrupted." });
        return z.NEVER;
      }
    })
    .pipe(lessonContentSchema),
  difficulty: z
    .enum(["none", "beginner", "intermediate", "advanced"])
    .transform((value) => (value === "none" ? null : value)),
  estimatedMinutes: z
    .string()
    .transform((value) => (value.trim() === "" ? null : Number(value)))
    .pipe(z.number().int().positive().max(600).nullable()),
  seoTitle: optionalText(200),
  seoDescription: optionalText(300),
});

export type LessonFormValues = z.infer<typeof lessonSchema>;
