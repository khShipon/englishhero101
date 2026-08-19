"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { requireRole } from "@/lib/auth/dal";
import { userRoleSchema } from "@/lib/admin/validation";

export async function updateUserRole(formData: FormData) {
  await requireRole(["admin"]);

  const parsed = userRoleSchema.safeParse({
    userId: formData.get("userId"),
    role: formData.get("role"),
  });
  if (!parsed.success) {
    throw new Error("Invalid role update request.");
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("profiles")
    .update({ role: parsed.data.role })
    .eq("id", parsed.data.userId);

  if (error) {
    throw new Error("Could not update this user's role.");
  }

  revalidatePath("/admin/users");
}
