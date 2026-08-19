import "server-only";
import { createClient } from "@/lib/supabase/server";

export type AdminUserRow = {
  id: string;
  email: string;
  fullName: string | null;
  role: "admin" | "editor" | "student";
  createdAt: string;
};

export async function getAllUsers(): Promise<AdminUserRow[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("profiles")
    .select("id, email, full_name, role, created_at")
    .order("created_at", { ascending: false });

  if (error) throw error;

  return (data ?? []).map((row) => ({
    id: row.id,
    email: row.email,
    fullName: row.full_name,
    role: row.role as AdminUserRow["role"],
    createdAt: row.created_at,
  }));
}
