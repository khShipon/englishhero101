import { SignOutButton } from "@/components/auth/sign-out-button";
import { AdminMobileNav } from "@/components/admin/admin-mobile-nav";
import { Badge } from "@/components/ui/badge";

export function AdminHeader({
  email,
  role,
  isAdmin,
}: {
  email: string;
  role: string;
  isAdmin: boolean;
}) {
  return (
    <header className="flex items-center justify-between gap-2 border-b px-4 py-3 sm:px-6">
      <div className="flex min-w-0 items-center gap-2">
        <AdminMobileNav isAdmin={isAdmin} />
        <span className="truncate text-sm text-muted-foreground">{email}</span>
        <Badge variant="secondary" className="shrink-0">
          {role}
        </Badge>
      </div>
      <SignOutButton />
    </header>
  );
}
