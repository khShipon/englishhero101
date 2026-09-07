import Link from "next/link";
import type { ContentNode } from "@/types/content";
import { CATEGORY_ICONS, DEFAULT_CATEGORY_ICON, CATEGORY_COLORS, DEFAULT_CATEGORY_COLOR } from "@/lib/content-icons";
import { cn } from "@/lib/utils";
import { ArrowRight } from "lucide-react";

export function CategoryCard({ node, href }: { node: ContentNode; href: string }) {
  const Icon = CATEGORY_ICONS[node.slug] ?? DEFAULT_CATEGORY_ICON;
  const color = CATEGORY_COLORS[node.slug] ?? DEFAULT_CATEGORY_COLOR;

  return (
    <Link href={href} className="group block h-full">
      <div
        className={cn(
          "flex h-full flex-col gap-3 rounded-2xl p-5 ring-1 ring-transparent transition-all hover:-translate-y-0.5 hover:shadow-md",
          color.bg,
          color.ring,
        )}
      >
        <span
          className={cn(
            "flex size-11 items-center justify-center rounded-xl text-white shadow-sm",
            color.iconBg,
          )}
        >
          <Icon className="size-5" />
        </span>
        <div className="flex flex-col gap-1">
          <h3 className="font-heading text-base font-semibold tracking-tight text-brand-navy dark:text-foreground">
            {node.title}
          </h3>
          <p className="text-sm text-muted-foreground">{node.description || `Explore ${node.title}`}</p>
        </div>
        <span
          className={cn(
            "mt-auto flex items-center gap-1 text-sm font-medium",
            color.text,
          )}
        >
          Start Learning
          <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-0.5" />
        </span>
      </div>
    </Link>
  );
}
