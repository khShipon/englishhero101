import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getNodeById } from "@/lib/queries/content";
import { getLessonsByNode, getLessonsBySubtree } from "@/lib/queries/lessons";
import { getQuestionSetStatusByLessons } from "@/lib/queries/question-banks";
import { createLessonQuestionSet } from "@/lib/admin/question-bank-actions";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { DeleteLessonDialog } from "@/components/admin/lesson-editor/delete-lesson-dialog";
import { Plus, Pencil, Eye } from "lucide-react";

export const metadata: Metadata = { title: "Lessons — Admin — EnglishHero101" };

export default async function NodeLessonsPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ subtree?: string }>;
}) {
  const { id } = await params;
  const { subtree } = await searchParams;
  const [node, lessons] = await Promise.all([
    getNodeById(id),
    subtree ? getLessonsBySubtree(id) : getLessonsByNode(id),
  ]);

  if (!node) {
    notFound();
  }

  const questionSetByLesson = await getQuestionSetStatusByLessons(lessons.map((lesson) => lesson.id));

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm text-muted-foreground">
            <Link href="/admin/content" className="hover:underline">
              Content
            </Link>{" "}
            / {node.title}
          </p>
          <h1 className="text-2xl font-semibold tracking-tight">Lessons</h1>
        </div>
        <Link href={`/admin/lessons/new?node=${node.id}`} className={buttonVariants()}>
          <Plus /> New lesson
        </Link>
      </div>

      <Card>
        <CardContent>
          {lessons.length === 0 ? (
            <p className="py-8 text-center text-sm text-muted-foreground">
              No lessons yet under &ldquo;{node.title}&rdquo;.
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Questions</TableHead>
                  <TableHead>Updated</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {lessons.map((lesson) => {
                  const questionSet = questionSetByLesson.get(lesson.id) ?? null;
                  return (
                    <TableRow key={lesson.id}>
                      <TableCell className="font-medium">{lesson.title}</TableCell>
                      <TableCell>
                        <Badge variant={lesson.status === "published" ? "default" : "secondary"}>
                          {lesson.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {questionSet ? (
                          <Badge variant={questionSet.isPublished ? "default" : "outline"}>
                            {questionSet.questionCount} question
                            {questionSet.questionCount === 1 ? "" : "s"}
                          </Badge>
                        ) : (
                          <Badge variant="outline">None</Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {new Date(lesson.updatedAt).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <div className="flex justify-end gap-1">
                          {questionSet ? (
                            <Link
                              href={`/admin/question-banks/${questionSet.id}`}
                              className={buttonVariants({ variant: "outline", size: "sm" })}
                            >
                              Manage questions
                            </Link>
                          ) : (
                            <form action={createLessonQuestionSet}>
                              <input type="hidden" name="lessonId" value={lesson.id} />
                              <input type="hidden" name="lessonTitle" value={lesson.title} />
                              <input type="hidden" name="nodeId" value={node.id} />
                              <Button type="submit" variant="outline" size="sm">
                                <Plus /> Add questions
                              </Button>
                            </form>
                          )}
                          <Link
                            href={`/admin/lessons/${lesson.id}/preview`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className={buttonVariants({ variant: "ghost", size: "icon-sm" })}
                            aria-label="Preview"
                          >
                            <Eye />
                          </Link>
                          <Link
                            href={`/admin/lessons/${lesson.id}/edit`}
                            className={buttonVariants({ variant: "ghost", size: "icon-sm" })}
                            aria-label="Edit"
                          >
                            <Pencil />
                          </Link>
                          <DeleteLessonDialog
                            lessonId={lesson.id}
                            nodeId={node.id}
                            title={lesson.title}
                          />
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
