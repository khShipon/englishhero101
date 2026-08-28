import Link from "next/link";
import type { Lesson } from "@/lib/queries/lessons";
import { getBreadcrumbs } from "@/lib/queries/content";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { BookOpen, Clock, SignalMedium } from "lucide-react";

export async function LessonCard({ lesson }: { lesson: Lesson }) {
  const breadcrumbs = await getBreadcrumbs(lesson.nodeId);
  const href = `/${breadcrumbs.map((crumb) => crumb.slug).join("/")}/${lesson.slug}`;

  return (
    <Link href={href} className="group block h-full">
      <Card className="h-full transition-all hover:-translate-y-0.5 hover:shadow-md hover:ring-primary/30">
        <CardHeader>
          <CardTitle className="flex items-start gap-2 line-clamp-2">
            <BookOpen className="mt-0.5 size-4 shrink-0 text-primary" />
            {lesson.title}
          </CardTitle>
          {lesson.excerpt && (
            <CardDescription className="line-clamp-2">{lesson.excerpt}</CardDescription>
          )}
        </CardHeader>
        {(lesson.difficulty || lesson.estimatedMinutes) && (
          <CardContent className="flex items-center gap-3 text-xs text-muted-foreground">
            {lesson.difficulty && (
              <Badge variant="outline" className="gap-1">
                <SignalMedium className="size-3" /> {lesson.difficulty}
              </Badge>
            )}
            {lesson.estimatedMinutes && (
              <span className="flex items-center gap-1">
                <Clock className="size-3.5" /> {lesson.estimatedMinutes} min read
              </span>
            )}
          </CardContent>
        )}
      </Card>
    </Link>
  );
}
