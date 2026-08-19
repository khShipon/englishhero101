"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { ADMIN_NAV_ITEMS } from "@/components/admin/admin-nav-items";

// Desktop only (lg+) — AdminMobileNav covers phones/tablets via a
// Sheet drawer, same split as the public site's Navbar/MobileNav.
export function AdminSidebar({ isAdmin }: { isAdmin: boolean }) {
  const pathname = usePathname();

  return (
    <nav className="hidden w-56 shrink-0 flex-col gap-1 border-r bg-muted/30 p-4 lg:flex">
      <Link href="/" className="mb-4 px-2 text-lg font-semibold tracking-tight">
        EnglishHero101
      </Link>
      {ADMIN_NAV_ITEMS.filter((item) => !item.adminOnly || isAdmin).map((item) => {
        const active = item.exact ? pathname === item.href : pathname.startsWith(item.href);
        const Icon = item.icon;
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex items-center gap-2 rounded-lg px-2.5 py-2 text-sm font-medium transition-colors",
              active
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:bg-muted hover:text-foreground",
            )}
          >
            <Icon className="size-4" />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
