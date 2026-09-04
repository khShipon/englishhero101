import Link from "next/link";
import type { LevelTestSummary } from "@/lib/queries/level-test";
import type { Lesson } from "@/lib/queries/lessons";
import { LessonCard } from "@/components/public/lesson-card";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { buttonVariants } from "@/components/ui/button";
import { Award, RotateCcw } from "lucide-react";

const LEVEL_COPY: Record<LevelTestSummary["level"], { label: string; blurb: string }> = {
  beginner: {
    label: "Beginner",
    blurb: "You're just getting started — focus on core grammar and everyday vocabulary.",
  },
  intermediate: {
    label: "Intermediate",
    blurb: "You've got a solid base — sharpen your grammar and build more advanced vocabulary.",
  },
  advanced: {
    label: "Advanced",
    blurb: "Strong command of English — push into nuanced grammar, idioms, and exam skills.",
  },
};

export function LevelTestResultCard({
  result,
  recommended,
}: {
  result: LevelTestSummary;
  recommended: Lesson[];
}) {
  const copy = LEVEL_COPY[result.level];

  return (
    <div className="flex flex-col gap-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Award className="size-4 text-primary" /> Your English level: {copy.label}
          </CardTitle>
          <CardDescription>{copy.blurb}</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap items-center justify-between gap-3">
          <p className="text-sm text-muted-foreground">
            Score: {result.score} / {result.total} ({result.percent}%)
          </p>
          <Link href="/level-test?retake=1" className={buttonVariants({ variant: "outline", size: "sm" })}>
            <RotateCcw /> Retake test
          </Link>
        </CardContent>
      </Card>

      {recommended.length > 0 && (
        <div className="flex flex-col gap-3">
          <h2 className="text-lg font-semibold tracking-tight">Recommended for your level</h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {recommended.map((lesson) => (
              <LessonCard key={lesson.id} lesson={lesson} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
