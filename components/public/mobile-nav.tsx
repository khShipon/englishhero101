"use client";

import Link from "next/link";
import { useState } from "react";
import type { ContentTreeNode } from "@/types/content";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button, buttonVariants } from "@/components/ui/button";
import { SearchBox } from "@/components/public/search-box";
import { ThemeToggle } from "@/components/theme-toggle";
import { BrandLogo } from "@/components/public/brand-logo";
import { CATEGORY_ICONS, DEFAULT_CATEGORY_ICON } from "@/lib/content-icons";
import { cn } from "@/lib/utils";
import { ClipboardList, Home, Info, LogIn, Menu, Newspaper, User } from "lucide-react";

export function MobileNav({
  categories,
  isLoggedIn,
}: {
  categories: ContentTreeNode[];
  isLoggedIn: boolean;
}) {
  const [open, setOpen] = useState(false);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetContent side="left" className="w-3/4 sm:max-w-xs">
        <SheetHeader>
          <SheetTitle className="flex items-center justify-between gap-1.5">
            <BrandLogo />
            <ThemeToggle className="flex size-8 items-center justify-center rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground" />
          </SheetTitle>
        </SheetHeader>
        <nav className="flex flex-col gap-1 px-4">
          <SearchBox className="mb-4" />
          {!isLoggedIn && (
            <SheetClose
              nativeButton={false}
              render={
                <Link
                  href="/register"
                  className={cn(
                    buttonVariants(),
                    "mb-2 rounded-full bg-brand-orange text-brand-orange-foreground hover:bg-brand-orange/90",
                  )}
                />
              }
            >
              Sign Up Free
            </SheetClose>
          )}
          <SheetClose
            nativeButton={false}
            render={
              <Link
                href="/"
                className="flex items-center gap-2 rounded-lg px-2.5 py-2 text-sm font-medium hover:bg-muted"
              />
            }
          >
            <Home className="size-4 text-muted-foreground" /> Home
          </SheetClose>
          <SheetClose
            nativeButton={false}
            render={
              <Link
                href="/question-banks"
                className="flex items-center gap-2 rounded-lg px-2.5 py-2 text-sm font-medium hover:bg-muted"
              />
            }
          >
            <ClipboardList className="size-4 text-muted-foreground" /> Question Banks
          </SheetClose>
          {categories.map((category) => {
            const Icon = CATEGORY_ICONS[category.slug] ?? DEFAULT_CATEGORY_ICON;
            const children = category.children.filter((child) => child.isPublished);
            return (
              <div key={category.id}>
                <SheetClose
                  nativeButton={false}
                  render={
                    <Link
                      href={`/${category.slug}`}
                      className="flex items-center gap-2 rounded-lg px-2.5 py-2 text-sm font-medium hover:bg-muted"
                    />
                  }
                >
                  <Icon className="size-4 text-muted-foreground" /> {category.title}
                </SheetClose>
                {children.length > 0 && (
                  <div className="ml-5 flex flex-col gap-0.5 border-l pl-3.5">
                    {children.map((child) => {
                      const ChildIcon = CATEGORY_ICONS[child.slug] ?? DEFAULT_CATEGORY_ICON;
                      return (
                        <SheetClose
                          key={child.id}
                          nativeButton={false}
                          render={
                            <Link
                              href={`/${category.slug}/${child.slug}`}
                              className="flex items-center gap-2 rounded-lg px-2 py-1.5 text-sm text-muted-foreground hover:bg-muted hover:text-foreground"
                            />
                          }
                        >
                          <ChildIcon className="size-3.5" /> {child.title}
                        </SheetClose>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
          <SheetClose
            nativeButton={false}
            render={
              <Link
                href="/blog"
                className="flex items-center gap-2 rounded-lg px-2.5 py-2 text-sm font-medium hover:bg-muted"
              />
            }
          >
            <Newspaper className="size-4 text-muted-foreground" /> Blog
          </SheetClose>
          <SheetClose
            nativeButton={false}
            render={
              <Link
                href="/about"
                className="flex items-center gap-2 rounded-lg px-2.5 py-2 text-sm font-medium hover:bg-muted"
              />
            }
          >
            <Info className="size-4 text-muted-foreground" /> About
          </SheetClose>
          {isLoggedIn ? (
            <SheetClose
              nativeButton={false}
              render={
                <Link
                  href="/profile"
                  className="flex items-center gap-2 rounded-lg px-2.5 py-2 text-sm font-medium hover:bg-muted"
                />
              }
            >
              <User className="size-4 text-muted-foreground" /> My Profile
            </SheetClose>
          ) : (
            <SheetClose
              nativeButton={false}
              render={
                <Link
                  href="/login"
                  className="flex items-center gap-2 rounded-lg px-2.5 py-2 text-sm font-medium hover:bg-muted"
                />
              }
            >
              <LogIn className="size-4 text-muted-foreground" /> Login
            </SheetClose>
          )}
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
