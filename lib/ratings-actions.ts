"use server";

import * as z from "zod";
import { revalidatePath, updateTag } from "next/cache";
import { requireUser } from "@/lib/auth/dal";
import { createClient } from "@/lib/supabase/server";

// Matches the cacheTag() calls in lib/queries/ratings.ts.
const RATINGS_TAG = "site-ratings";

const ratingSchema = z.object({
  rating: z.coerce.number().int().min(1, { error: "Choose a star rating." }).max(5),
  comment: z
    .string()
    .trim()
    .max(500, { error: "Keep it under 500 characters." })
    .transform((value) => (value === "" ? null : value)),
});

export type RatingFormState =
  | {
      error?: string;
      fieldErrors?: Record<string, string[]>;
      success?: boolean;
    }
  | undefined;

// One row per student — upsert on user_id so resubmitting updates the
// existing rating instead of erroring on the unique constraint.
export async function submitRating(
  _state: RatingFormState,
  formData: FormData,
): Promise<RatingFormState> {
  const user = await requireUser();

  const parsed = ratingSchema.safeParse({
    rating: formData.get("rating"),
    comment: formData.get("comment") ?? "",
  });
  if (!parsed.success) {
    return { fieldErrors: parsed.error.flatten().fieldErrors as Record<string, string[]> };
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("site_ratings")
    .upsert(
      { user_id: user.id, rating: parsed.data.rating, comment: parsed.data.comment },
      { onConflict: "user_id" },
    );

  if (error) {
    return { error: "Could not save your rating. Please try again." };
  }

  revalidatePath("/reviews");
  revalidatePath("/");
  updateTag(RATINGS_TAG);
  return { success: true };
}
