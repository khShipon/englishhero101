import Link from "next/link";
import type { ContentNode } from "@/types/content";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

export function CategoryCard({ node, href }: { node: ContentNode; href: string }) {
  return (
    <Link href={href} className="block h-full">
      <Card className="h-full transition-shadow hover:shadow-md">
        <CardHeader>
          <CardTitle>{node.title}</CardTitle>
          <CardDescription>{node.description || `Explore ${node.title}`}</CardDescription>
        </CardHeader>
      </Card>
    </Link>
  );
}
