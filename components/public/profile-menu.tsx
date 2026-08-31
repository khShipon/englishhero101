"use client";

import Link from "next/link";
import { signOut } from "@/lib/auth/actions";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { LayoutDashboard, Settings, LogOut } from "lucide-react";

const menuItemClassName =
  "flex w-full cursor-default items-center gap-1.5 rounded-md px-1.5 py-1 text-left text-sm outline-hidden select-none hover:bg-accent hover:text-accent-foreground [&_svg]:size-4";

function initials(fullName: string | null, email: string) {
  if (fullName?.trim()) {
    const parts = fullName.trim().split(/\s+/);
    return (parts[0][0] + (parts[1]?.[0] ?? "")).toUpperCase();
  }
  return email[0]?.toUpperCase() ?? "?";
}

// Replaces the plain "Profile" text button with a circular avatar
// menu in the top-right corner (initials, no image upload feature
// exists yet) opening Dashboard/Settings/Log out — a more standard
// place to put account actions than a lone link.
export function ProfileMenu({ fullName, email }: { fullName: string | null; email: string }) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        className="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-semibold text-primary-foreground hover:opacity-90"
        aria-label="Account menu"
      >
        {initials(fullName, email)}
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-48">
        {/* A plain styled element, not DropdownMenuLabel — Base UI's
            Menu.GroupLabel throws unless it's nested in a Menu.Group,
            which this simple flat list of links doesn't need. */}
        <p className="truncate px-1.5 py-1 text-sm text-muted-foreground">{fullName || email}</p>
        <DropdownMenuSeparator />
        <Link href="/profile" className={menuItemClassName}>
          <LayoutDashboard /> Dashboard
        </Link>
        <Link href="/settings" className={menuItemClassName}>
          <Settings /> Settings
        </Link>
        <DropdownMenuSeparator />
        <form action={signOut}>
          <button type="submit" className={menuItemClassName}>
            <LogOut /> Log out
          </button>
        </form>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
