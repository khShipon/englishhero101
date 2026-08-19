import * as z from "zod";

export const loginSchema = z.object({
  email: z.email({ error: "Enter a valid email address." }).trim(),
  password: z.string().min(1, { error: "Password is required." }),
});

export const registerSchema = z.object({
  fullName: z
    .string()
    .trim()
    .min(2, { error: "Name must be at least 2 characters long." }),
  email: z.email({ error: "Enter a valid email address." }).trim(),
  password: z
    .string()
    .min(8, { error: "Password must be at least 8 characters long." })
    .regex(/[a-zA-Z]/, { error: "Password must contain at least one letter." })
    .regex(/[0-9]/, { error: "Password must contain at least one number." }),
});

export const forgotPasswordSchema = z.object({
  email: z.email({ error: "Enter a valid email address." }).trim(),
});

export const resetPasswordSchema = z
  .object({
    password: z
      .string()
      .min(8, { error: "Password must be at least 8 characters long." }),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    error: "Passwords do not match.",
    path: ["confirmPassword"],
  });

export const updateProfileSchema = z.object({
  fullName: z
    .string()
    .trim()
    .min(2, { error: "Name must be at least 2 characters long." }),
});
