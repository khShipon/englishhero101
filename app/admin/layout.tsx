import { requireRole } from "@/lib/auth/dal";
import { AdminSidebar } from "@/components/admin/admin-sidebar";
import { AdminHeader } from "@/components/admin/admin-header";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const user = await requireRole(["admin", "editor"]);
  const isAdmin = user.role === "admin";

  return (
    <div className="flex min-h-full flex-1">
      <AdminSidebar isAdmin={isAdmin} />
      <div className="flex min-w-0 flex-1 flex-col">
        <AdminHeader email={user.email} role={user.role} isAdmin={isAdmin} />
        <main className="flex-1 overflow-y-auto overflow-x-hidden p-4 sm:p-6">{children}</main>
      </div>
    </div>
  );
}
