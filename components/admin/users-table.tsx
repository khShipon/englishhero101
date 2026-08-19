"use client";

import { useTransition } from "react";
import { updateUserRole } from "@/lib/admin/user-actions";
import type { AdminUserRow } from "@/lib/queries/users";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

const ROLES = ["student", "editor", "admin"] as const;

export function UsersTable({
  users,
  currentUserId,
}: {
  users: AdminUserRow[];
  currentUserId: string;
}) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Name</TableHead>
          <TableHead>Email</TableHead>
          <TableHead>Joined</TableHead>
          <TableHead className="text-right">Role</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {users.map((user) => (
          <TableRow key={user.id}>
            <TableCell className="font-medium">{user.fullName || "—"}</TableCell>
            <TableCell className="text-muted-foreground">{user.email}</TableCell>
            <TableCell className="text-muted-foreground">
              {new Date(user.createdAt).toLocaleDateString()}
            </TableCell>
            <TableCell className="text-right">
              {user.id === currentUserId ? (
                <Badge variant="secondary">{user.role} (you)</Badge>
              ) : (
                <RoleSelect userId={user.id} role={user.role} />
              )}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

// Calls the Server Action directly with a hand-built FormData (using
// the value onValueChange already hands us) instead of wiring up a
// <form> + requestSubmit(), which would depend on exactly when the
// select's hidden input reflects the new value in the DOM.
function RoleSelect({ userId, role }: { userId: string; role: AdminUserRow["role"] }) {
  const [pending, startTransition] = useTransition();

  return (
    <Select
      defaultValue={role}
      disabled={pending}
      onValueChange={(value) => {
        startTransition(async () => {
          const formData = new FormData();
          formData.set("userId", userId);
          formData.set("role", String(value));
          await updateUserRole(formData);
        });
      }}
    >
      <SelectTrigger size="sm" className="ml-auto w-28">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {ROLES.map((r) => (
          <SelectItem key={r} value={r}>
            {r}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
