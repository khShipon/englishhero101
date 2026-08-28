import Link from "next/link";
import type { ContentNode } from "@/types/content";
import { CATEGORY_ICONS, DEFAULT_CATEGORY_ICON } from "@/lib/content-icons";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ArrowRight } from "lucide-react";

export function CategoryCard({ node, href }: { node: ContentNode; href: string }) {
  const Icon = CATEGORY_ICONS[node.slug] ?? DEFAULT_CATEGORY_ICON;

  return (
    <Link href={href} className="group block h-full">
      <Card className="h-full transition-all hover:-translate-y-0.5 hover:shadow-md hover:ring-primary/30">
        <CardHeader>
          <div className="mb-1 flex items-center justify-between">
            <span className="flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <Icon className="size-5" />
            </span>
            <ArrowRight className="size-4 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
          </div>
          <CardTitle>{node.title}</CardTitle>
          <CardDescription>{node.description || `Explore ${node.title}`}</CardDescription>
        </CardHeader>
      </Card>
    </Link>
  );
}
