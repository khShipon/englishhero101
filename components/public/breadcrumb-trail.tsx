import Link from "next/link";
import type { Breadcrumb } from "@/types/content";
import { ChevronRight } from "lucide-react";

export function BreadcrumbTrail({
  breadcrumbs,
  currentTitle,
}: {
  breadcrumbs: Breadcrumb[];
  currentTitle?: string;
}) {
  const pathSoFar: string[] = [];

  return (
    <nav
      aria-label="Breadcrumb"
      className="flex flex-wrap items-center gap-1 text-sm text-muted-foreground"
    >
      <Link href="/" className="hover:text-foreground">
        Home
      </Link>
      {breadcrumbs.map((crumb) => {
        pathSoFar.push(crumb.slug);
        return (
          <span key={crumb.id} className="flex items-center gap-1">
            <ChevronRight className="size-3.5" />
            <Link href={`/${pathSoFar.join("/")}`} className="hover:text-foreground">
              {crumb.title}
            </Link>
          </span>
        );
      })}
      {currentTitle && (
        <span className="flex items-center gap-1">
          <ChevronRight className="size-3.5" />
          <span className="text-foreground">{currentTitle}</span>
        </span>
      )}
    </nav>
  );
}
