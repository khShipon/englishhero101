import * as z from "zod";

const paragraphSchema = z.object({
  label: z
    .string()
    .trim()
    .max(20)
    .transform((value) => (value === "" ? null : value)),
  text: z.string().trim().min(1),
});

export const readingPassageSchema = z.object({
  lessonId: z.string().min(1),
  passageNumber: z
    .string()
    .transform((value) => Number(value))
    .pipe(z.number().int().min(1).max(20)),
  title: z.string().trim().min(1, { error: "Title is required." }).max(200),
  paragraphs: z
    .string()
    .transform((value, ctx) => {
      try {
        return JSON.parse(value);
      } catch {
        ctx.addIssue({ code: "custom", message: "Paragraph data is corrupted." });
        return z.NEVER;
      }
    })
    .pipe(z.array(paragraphSchema).min(1, { error: "Add at least 1 paragraph." })),
});

export type ReadingPassageFormValues = z.infer<typeof readingPassageSchema>;
