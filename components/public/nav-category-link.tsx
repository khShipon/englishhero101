"use client";

import Link from "next/link";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { CATEGORY_ICONS, DEFAULT_CATEGORY_ICON } from "@/lib/content-icons";
import { ChevronDown } from "lucide-react";
import type { ContentTreeNode } from "@/types/content";

const linkClassName =
  "flex shrink-0 items-center gap-0.5 rounded-lg px-1 py-1.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground data-popup-open:bg-muted data-popup-open:text-foreground";

// A top-level nav category. Plain link when it has no published
// children; otherwise the same link doubles as a hover-opened dropdown
// trigger (openOnHover) so pointer users see the submenu (e.g. IELTS ->
// Listening/Reading/Writing/Speaking) without an extra click, while
// still navigating to the category page itself on click or Enter.
export function NavCategoryLink({ category }: { category: ContentTreeNode }) {
  const children = category.children.filter((child) => child.isPublished);

  if (children.length === 0) {
    return (
      <Link href={`/${category.slug}`} className={linkClassName}>
        {category.title}
      </Link>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        openOnHover
        delay={80}
        closeDelay={150}
        nativeButton={false}
        render={<Link href={`/${category.slug}`} />}
        className={linkClassName}
      >
        {category.title}
        <ChevronDown className="size-3 opacity-60 transition-transform duration-150 data-popup-open:rotate-180" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" sideOffset={8} className="min-w-52 p-1.5">
        {children.map((child) => {
          const ChildIcon = CATEGORY_ICONS[child.slug] ?? DEFAULT_CATEGORY_ICON;
          return (
            <Link
              key={child.id}
              href={`/${category.slug}/${child.slug}`}
              className="flex items-center gap-2 rounded-md px-2 py-1.5 text-sm text-popover-foreground hover:bg-accent hover:text-accent-foreground"
            >
              <ChildIcon className="size-3.5 text-muted-foreground" /> {child.title}
            </Link>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
