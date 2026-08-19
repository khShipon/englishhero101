"use client";

import Link from "next/link";
import { useState } from "react";
import type { ContentNode } from "@/types/content";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { SearchBox } from "@/components/public/search-box";
import { Menu } from "lucide-react";

export function MobileNav({ categories }: { categories: ContentNode[] }) {
  const [open, setOpen] = useState(false);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetContent side="left" className="w-3/4 sm:max-w-xs">
        <SheetHeader>
          <SheetTitle>EnglishHero101</SheetTitle>
        </SheetHeader>
        <nav className="flex flex-col gap-1 px-4">
          <SearchBox className="mb-4" />
          <SheetClose
            nativeButton={false}
            render={
              <Link href="/" className="rounded-lg px-2.5 py-2 text-sm font-medium hover:bg-muted" />
            }
          >
            Home
          </SheetClose>
          {categories.map((category) => (
            <SheetClose
              key={category.id}
              nativeButton={false}
              render={
                <Link
                  href={`/${category.slug}`}
                  className="rounded-lg px-2.5 py-2 text-sm font-medium hover:bg-muted"
                />
              }
            >
              {category.title}
            </SheetClose>
          ))}
          <SheetClose
            nativeButton={false}
            render={
              <Link
                href="/profile"
                className="rounded-lg px-2.5 py-2 text-sm font-medium hover:bg-muted"
              />
            }
          >
            Login / Profile
          </SheetClose>
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
