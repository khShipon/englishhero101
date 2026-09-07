"use server";

import { revalidatePath, updateTag } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { requireRole } from "@/lib/auth/dal";

const RATINGS_TAG = "site-ratings";

export async function deleteRating(formData: FormData) {
  await requireRole(["admin", "editor"]);
  const id = String(formData.get("id") ?? "");
  if (!id) return;

  const supabase = await createClient();
  const { error } = await supabase.from("site_ratings").delete().eq("id", id);
  if (error) {
    throw new Error("Could not delete this review.");
  }

  revalidatePath("/admin/reviews");
  revalidatePath("/reviews");
  revalidatePath("/");
  updateTag(RATINGS_TAG);
}
