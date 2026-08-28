import Link from "next/link";
import type { QuestionSet } from "@/lib/queries/question-banks";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ClipboardList } from "lucide-react";

export function QuestionSetCard({ questionSet }: { questionSet: QuestionSet }) {
  return (
    <Link href={`/question-banks/${questionSet.id}`} className="group block h-full">
      <Card className="h-full transition-all hover:-translate-y-0.5 hover:shadow-md hover:ring-primary/30">
        <CardHeader>
          <CardTitle className="flex items-start gap-2">
            <ClipboardList className="mt-0.5 size-4 shrink-0 text-primary" />
            {questionSet.title}
          </CardTitle>
          <CardDescription>
            {[questionSet.examType, questionSet.subject, questionSet.year]
              .filter(Boolean)
              .join(" · ") || "Practice questions"}
          </CardDescription>
        </CardHeader>
      </Card>
    </Link>
  );
}
