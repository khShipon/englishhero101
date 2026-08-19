import type { Metadata } from "next";
import Link from "next/link";
import { getQuestionSets } from "@/lib/queries/question-banks";
import { toggleQuestionSetPublish } from "@/lib/admin/question-bank-actions";
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
import { DeleteQuestionSetDialog } from "@/components/admin/question-banks/delete-question-set-dialog";
import { Plus, Pencil, Eye, EyeOff } from "lucide-react";

export const metadata: Metadata = { title: "Question Banks — Admin — EnglishHero101" };

export default async function QuestionBanksPage() {
  const questionSets = await getQuestionSets();

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Question Banks</h1>
          <p className="text-sm text-muted-foreground">
            {questionSets.length} question set{questionSets.length === 1 ? "" : "s"}.
          </p>
        </div>
        <Link href="/admin/question-banks/new" className={buttonVariants()}>
          <Plus /> New question set
        </Link>
      </div>

      <Card>
        <CardContent>
          {questionSets.length === 0 ? (
            <p className="py-8 text-center text-sm text-muted-foreground">
              No question sets yet. Create your first one.
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Exam</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {questionSets.map((set) => (
                  <TableRow key={set.id}>
                    <TableCell className="font-medium">
                      <Link href={`/admin/question-banks/${set.id}`} className="hover:underline">
                        {set.title}
                      </Link>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {[set.examType, set.subject, set.year].filter(Boolean).join(" · ") || "—"}
                    </TableCell>
                    <TableCell>
                      <Badge variant={set.isPublished ? "default" : "secondary"}>
                        {set.isPublished ? "Published" : "Draft"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex justify-end gap-1">
                        <form action={toggleQuestionSetPublish}>
                          <input type="hidden" name="id" value={set.id} />
                          <input
                            type="hidden"
                            name="nextPublished"
                            value={(!set.isPublished).toString()}
                          />
                          <Button
                            variant="ghost"
                            size="icon-sm"
                            type="submit"
                            aria-label={set.isPublished ? "Unpublish" : "Publish"}
                          >
                            {set.isPublished ? <EyeOff /> : <Eye />}
                          </Button>
                        </form>
                        <Link
                          href={`/admin/question-banks/${set.id}/edit`}
                          className={buttonVariants({ variant: "ghost", size: "icon-sm" })}
                          aria-label="Edit"
                        >
                          <Pencil />
                        </Link>
                        <DeleteQuestionSetDialog id={set.id} title={set.title} />
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
