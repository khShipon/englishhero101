import Link from "next/link";
import type { Lesson } from "@/lib/queries/lessons";
import { getBreadcrumbs } from "@/lib/queries/content";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";

export async function LessonCard({ lesson }: { lesson: Lesson }) {
  const breadcrumbs = await getBreadcrumbs(lesson.nodeId);
  const href = `/${breadcrumbs.map((crumb) => crumb.slug).join("/")}/${lesson.slug}`;

  return (
    <Link href={href} className="block h-full">
      <Card className="h-full transition-shadow hover:shadow-md">
        <CardHeader>
          <CardTitle className="line-clamp-2">{lesson.title}</CardTitle>
          {lesson.excerpt && (
            <CardDescription className="line-clamp-2">{lesson.excerpt}</CardDescription>
          )}
        </CardHeader>
        {(lesson.difficulty || lesson.estimatedMinutes) && (
          <CardContent className="flex items-center gap-2 text-xs text-muted-foreground">
            {lesson.difficulty && <Badge variant="outline">{lesson.difficulty}</Badge>}
            {lesson.estimatedMinutes && <span>{lesson.estimatedMinutes} min read</span>}
          </CardContent>
        )}
      </Card>
    </Link>
  );
}
