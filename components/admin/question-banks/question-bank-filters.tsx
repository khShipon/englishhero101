"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import type { QuestionSet } from "@/lib/queries/question-banks";
import { toggleQuestionSetPublish } from "@/lib/admin/question-bank-actions";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { DeleteQuestionSetDialog } from "@/components/admin/question-banks/delete-question-set-dialog";
import { Pencil, Eye, EyeOff } from "lucide-react";

const ANY = "any";

// Client-side filtering of the already-fetched list rather than a new
// query — this is an admin-only, moderate-sized list (question sets
// across the whole site), so re-fetching per filter change would just
// add latency for no real benefit.
export function QuestionBankFilters({ questionSets }: { questionSets: QuestionSet[] }) {
  const [examType, setExamType] = useState(ANY);
  const [board, setBoard] = useState(ANY);
  const [query, setQuery] = useState("");

  const { examTypes, boards } = useMemo(() => {
    const uniqueSorted = (values: (string | null)[]) =>
      Array.from(new Set(values.filter((v): v is string => !!v))).sort();
    return {
      examTypes: uniqueSorted(questionSets.map((s) => s.examType)),
      boards: uniqueSorted(questionSets.map((s) => s.board)),
    };
  }, [questionSets]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return questionSets.filter((set) => {
      if (examType !== ANY && set.examType !== examType) return false;
      if (board !== ANY && set.board !== board) return false;
      if (q && !set.title.toLowerCase().includes(q)) return false;
      return true;
    });
  }, [questionSets, examType, board, query]);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-end gap-3">
        <div className="flex flex-col gap-1.5">
          <span className="text-xs font-medium text-muted-foreground">Exam type</span>
          <Select value={examType} onValueChange={(v) => setExamType(v ?? ANY)}>
            <SelectTrigger className="w-36">
              {/* See the matching comment in the public question-bank
                  filters — Select.Value needs the "any" sentinel
                  resolved to its label explicitly. */}
              <SelectValue>{(v: string | null) => (v && v !== ANY ? v : "Any exam type")}</SelectValue>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={ANY}>Any exam type</SelectItem>
              {examTypes.map((v) => (
                <SelectItem key={v} value={v}>
                  {v}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex flex-col gap-1.5">
          <span className="text-xs font-medium text-muted-foreground">Board</span>
          <Select value={board} onValueChange={(v) => setBoard(v ?? ANY)}>
            <SelectTrigger className="w-40">
              <SelectValue>{(v: string | null) => (v && v !== ANY ? v : "Any board")}</SelectValue>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={ANY}>Any board</SelectItem>
              {boards.map((v) => (
                <SelectItem key={v} value={v}>
                  {v}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex flex-1 flex-col gap-1.5">
          <span className="text-xs font-medium text-muted-foreground">Search</span>
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by title..."
            className="max-w-xs"
          />
        </div>
      </div>

      {filtered.length === 0 ? (
        <p className="py-8 text-center text-sm text-muted-foreground">
          No question sets match these filters.
        </p>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Title</TableHead>
              <TableHead>Exam</TableHead>
              <TableHead>Board</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map((set) => (
              <TableRow key={set.id}>
                <TableCell className="font-medium">
                  <Link href={`/admin/question-banks/${set.id}`} className="hover:underline">
                    {set.title}
                  </Link>
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {[set.examType, set.subject, set.year].filter(Boolean).join(" · ") || "—"}
                </TableCell>
                <TableCell className="text-muted-foreground">{set.board || "—"}</TableCell>
                <TableCell>
                  <Badge variant={set.isPublished ? "default" : "secondary"}>
                    {set.isPublished ? "Published" : "Draft"}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="flex justify-end gap-1">
                    <form action={toggleQuestionSetPublish}>
                      <input type="hidden" name="id" value={set.id} />
                      <input type="hidden" name="nextPublished" value={(!set.isPublished).toString()} />
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
    </div>
  );
}
