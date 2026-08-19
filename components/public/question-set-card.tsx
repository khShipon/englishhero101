import Link from "next/link";
import type { QuestionSet } from "@/lib/queries/question-banks";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

export function QuestionSetCard({ questionSet }: { questionSet: QuestionSet }) {
  return (
    <Link href={`/question-banks/${questionSet.id}`} className="block h-full">
      <Card className="h-full transition-shadow hover:shadow-md">
        <CardHeader>
          <CardTitle>{questionSet.title}</CardTitle>
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
