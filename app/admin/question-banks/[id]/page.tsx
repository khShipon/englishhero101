import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getQuestionSetById, getQuestionsBySet } from "@/lib/queries/question-banks";
import { QuestionsList } from "@/components/admin/question-banks/questions-list";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Plus, Upload } from "lucide-react";

export const metadata: Metadata = { title: "Question set — Admin — EnglishHero101" };

export default async function QuestionSetPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [questionSet, questions] = await Promise.all([
    getQuestionSetById(id),
    getQuestionsBySet(id),
  ]);

  if (!questionSet) {
    notFound();
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm text-muted-foreground">
            <Link href="/admin/question-banks" className="hover:underline">
              Question Banks
            </Link>{" "}
            / {questionSet.title}
          </p>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-semibold tracking-tight">{questionSet.title}</h1>
            <Badge variant={questionSet.isPublished ? "default" : "secondary"}>
              {questionSet.isPublished ? "Published" : "Draft"}
            </Badge>
          </div>
          {questionSet.description && (
            <p className="mt-1 text-sm text-muted-foreground">{questionSet.description}</p>
          )}
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Link
            href={`/admin/question-banks/${questionSet.id}/edit`}
            className={buttonVariants({ variant: "outline" })}
          >
            Edit details
          </Link>
          <Link
            href={`/admin/question-banks/${questionSet.id}/import`}
            className={buttonVariants({ variant: "outline" })}
          >
            <Upload /> Import CSV
          </Link>
          <Link
            href={`/admin/question-banks/${questionSet.id}/questions/new`}
            className={buttonVariants()}
          >
            <Plus /> Add question
          </Link>
        </div>
      </div>

      <Card>
        <CardContent>
          <QuestionsList questions={questions} questionSetId={questionSet.id} />
        </CardContent>
      </Card>
    </div>
  );
}
