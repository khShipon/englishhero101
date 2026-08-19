import * as z from "zod";

function optionalText(max: number) {
  return z
    .string()
    .trim()
    .max(max)
    .transform((value) => (value === "" ? null : value));
}

export const contentNodeSchema = z.object({
  title: z.string().trim().min(1, { error: "Title is required." }).max(200),
  slug: z
    .string()
    .trim()
    .toLowerCase()
    .min(1, { error: "Slug is required." })
    .regex(/^[a-z0-9]+(-[a-z0-9]+)*$/, {
      error: "Use lowercase letters, numbers, and hyphens only (e.g. present-simple-tense).",
    }),
  nodeType: z.string().trim().min(1, { error: "Node type is required." }).max(50),
  parentId: z.string().transform((value) => (value === "" || value === "none" ? null : value)),
  description: optionalText(2000),
  icon: optionalText(100),
  coverImageUrl: optionalText(500).refine((value) => value === null || z.url().safeParse(value).success, {
    error: "Enter a valid URL.",
  }),
  isPublished: z.coerce.boolean(),
  isFeatured: z.coerce.boolean(),
  seoTitle: optionalText(200),
  seoDescription: optionalText(300),
});

export type ContentNodeFormValues = z.infer<typeof contentNodeSchema>;

export const userRoleSchema = z.object({
  userId: z.uuid(),
  role: z.enum(["admin", "editor", "student"]),
});
