import type { Metadata } from "next";
import { requireRole } from "@/lib/auth/dal";
import { getAllUsers } from "@/lib/queries/users";
import { UsersTable } from "@/components/admin/users-table";
import { Card, CardContent } from "@/components/ui/card";

export const metadata: Metadata = { title: "Users — Admin — EnglishHero101" };

// Admin-only, even though the layout allows editors into /admin/* —
// user/role management specifically is restricted further here.
export default async function AdminUsersPage() {
  const user = await requireRole(["admin"]);
  const users = await getAllUsers();

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Users</h1>
        <p className="text-sm text-muted-foreground">{users.length} registered accounts.</p>
      </div>
      <Card>
        <CardContent>
          <UsersTable users={users} currentUserId={user.id} />
        </CardContent>
      </Card>
    </div>
  );
}
