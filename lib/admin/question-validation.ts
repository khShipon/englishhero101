import * as z from "zod";

function optionalText(max: number) {
  return z
    .string()
    .trim()
    .max(max)
    .transform((value) => (value === "" ? null : value));
}

export const QUESTION_TYPES = [
  "multiple_choice",
  "multiple_answer",
  "true_false",
  "fill_in_blank",
  "short_answer",
  "matching",
  "ordering",
  "written_answer",
] as const;

export type QuestionType = (typeof QUESTION_TYPES)[number];

export const CHOICE_TYPES: QuestionType[] = ["multiple_choice", "multiple_answer", "true_false"];

export const questionSetSchema = z.object({
  title: z.string().trim().min(1, { error: "Title is required." }).max(200),
  nodeId: z.string().transform((value) => (value === "" || value === "none" ? null : value)),
  description: optionalText(1000),
  examType: optionalText(100),
  subject: optionalText(100),
  board: optionalText(100),
  year: z
    .string()
    .transform((value) => (value.trim() === "" ? null : Number(value)))
    .pipe(z.number().int().min(1900).max(2200).nullable()),
  difficulty: z
    .enum(["none", "beginner", "intermediate", "advanced"])
    .transform((value) => (value === "none" ? null : value)),
  durationMinutes: z
    .string()
    .transform((value) => (value.trim() === "" ? null : Number(value)))
    .pipe(z.number().int().positive().max(600).nullable()),
  marks: z
    .string()
    .transform((value) => (value.trim() === "" ? null : Number(value)))
    .pipe(z.number().positive().max(1000).nullable()),
  isPublished: z.coerce.boolean(),
});

export type QuestionSetFormValues = z.infer<typeof questionSetSchema>;

const optionSchema = z.object({
  text: z.string().trim().min(1),
  isCorrect: z.boolean().default(false),
});

const pairSchema = z.object({
  left: z.string().trim().min(1),
  right: z.string().trim().min(1),
});

// What the client-side type-specific editors (options/pairs/ordered
// items) serialize into the hidden "structuredData" field. Kept
// separate from the questions table's own columns because the shape
// depends entirely on question_type.
export const structuredDataSchema = z.discriminatedUnion("type", [
  z.object({
    type: z.enum(["multiple_choice", "multiple_answer", "true_false"]),
    options: z.array(optionSchema).min(2, { error: "Add at least 2 options." }),
  }),
  z.object({
    type: z.literal("ordering"),
    items: z.array(z.string().trim().min(1)).min(2, { error: "Add at least 2 items." }),
  }),
  z.object({
    type: z.literal("matching"),
    pairs: z.array(pairSchema).min(1, { error: "Add at least 1 pair." }),
  }),
  z.object({
    type: z.enum(["fill_in_blank", "short_answer", "written_answer"]),
  }),
]);

export type StructuredData = z.infer<typeof structuredDataSchema>;

export const questionSchema = z.object({
  questionText: z.string().trim().min(1, { error: "Question text is required." }).max(2000),
  questionType: z.enum(QUESTION_TYPES),
  explanation: optionalText(2000),
  marks: z
    .string()
    .transform((value) => (value.trim() === "" ? 1 : Number(value)))
    .pipe(z.number().positive().max(100)),
  difficulty: z
    .enum(["none", "beginner", "intermediate", "advanced"])
    .transform((value) => (value === "none" ? null : value)),
  correctAnswer: optionalText(500),
  structuredData: z
    .string()
    .transform((value, ctx) => {
      try {
        return JSON.parse(value);
      } catch {
        ctx.addIssue({ code: "custom", message: "Question data is corrupted." });
        return z.NEVER;
      }
    })
    .pipe(structuredDataSchema),
});

export type QuestionFormValues = z.infer<typeof questionSchema>;
