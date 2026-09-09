"use server";

import { revalidatePath } from "next/cache";
import { requireUser } from "@/lib/auth/dal";
import { createClient } from "@/lib/supabase/server";

export async function markAllNotificationsRead() {
  const user = await requireUser();
  const supabase = await createClient();

  const { error } = await supabase
    .from("forum_notifications")
    .update({ is_read: true })
    .eq("user_id", user.id)
    .eq("is_read", false);
  if (error) throw error;

  revalidatePath("/profile");
}
