"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { ADMIN_NAV_ITEMS } from "@/components/admin/admin-nav-items";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Menu } from "lucide-react";

export function AdminMobileNav({ isAdmin }: { isAdmin: boolean }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetContent side="left" className="w-3/4 sm:max-w-xs">
        <SheetHeader>
          <SheetTitle>EnglishHero101</SheetTitle>
        </SheetHeader>
        <nav className="flex flex-col gap-1 px-4">
          {ADMIN_NAV_ITEMS.filter((item) => !item.adminOnly || isAdmin).map((item) => {
            const active = item.exact ? pathname === item.href : pathname.startsWith(item.href);
            const Icon = item.icon;
            return (
              <SheetClose
                key={item.href}
                nativeButton={false}
                render={
                  <Link
                    href={item.href}
                    className={cn(
                      "flex items-center gap-2 rounded-lg px-2.5 py-2 text-sm font-medium",
                      active
                        ? "bg-primary text-primary-foreground"
                        : "text-muted-foreground hover:bg-muted",
                    )}
                  />
                }
              >
                <Icon className="size-4" />
                {item.label}
              </SheetClose>
            );
          })}
        </nav>
      </SheetContent>
      <Button
        variant="ghost"
        size="icon"
        aria-label="Open menu"
        className="lg:hidden"
        onClick={() => setOpen(true)}
      >
        <Menu />
      </Button>
    </Sheet>
  );
}
