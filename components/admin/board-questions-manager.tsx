"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { GENERAL_BOARDS } from "@/lib/admin/boards";
import type { BoardQuestionSet } from "@/lib/admin/board-questions-overview";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { Plus, Pencil } from "lucide-react";

// Groups a board's "Board Questions" question sets by year (pills
// across the top) then by the fixed 9-board grid, so an admin can see
// at a glance which board papers exist for a given year and add
// what's missing — question_sets.year/board already carry this data
// (001_initial_schema.sql), this just organizes the existing list.
export function BoardQuestionsManager({
  examType,
  sectionNodeId,
  questionSets,
}: {
  examType: "SSC" | "HSC";
  sectionNodeId: string | null;
  questionSets: BoardQuestionSet[];
}) {
  const currentYear = new Date().getFullYear();

  const availableYears = useMemo(() => {
    const years = new Set(questionSets.map((set) => set.year).filter((year): year is number => !!year));
    years.add(currentYear);
    return Array.from(years).sort((a, b) => b - a);
  }, [questionSets, currentYear]);

  const [selectedYear, setSelectedYear] = useState(availableYears[0]);
  const [customYear, setCustomYear] = useState("");

  const unassigned = questionSets.filter((set) => !set.board || !set.year);

  if (!sectionNodeId) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-base">{examType} Board Questions</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            &ldquo;Board Questions&rdquo; section not found under {examType} English — check it&apos;s seeded
            under Content.
          </p>
        </CardContent>
      </Card>
    );
  }

  function addHref(board: string) {
    const params = new URLSearchParams({
      nodeId: sectionNodeId as string,
      board,
      year: String(selectedYear),
      examType,
    });
    return `/admin/question-banks/new?${params.toString()}`;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">{examType} Board Questions</CardTitle>
        <CardDescription>
          {questionSets.length} question set{questionSets.length === 1 ? "" : "s"} across all years.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <div className="flex flex-wrap items-center gap-2">
          {availableYears.map((year) => (
            <button
              key={year}
              type="button"
              onClick={() => setSelectedYear(year)}
              className={cn(
                "rounded-full px-3 py-1 text-sm font-medium transition-colors",
                year === selectedYear
                  ? "bg-brand-navy text-white dark:bg-brand-blue"
                  : "bg-muted text-muted-foreground hover:bg-muted/70",
              )}
            >
              {year}
            </button>
          ))}
          <form
            className="flex items-center gap-1.5"
            onSubmit={(event) => {
              event.preventDefault();
              const parsed = Number(customYear);
              if (parsed && parsed > 1990 && parsed < 2100) {
                setSelectedYear(parsed);
                setCustomYear("");
              }
            }}
          >
            <Input
              value={customYear}
              onChange={(event) => setCustomYear(event.target.value)}
              placeholder="Other year"
              type="number"
              className="h-8 w-28 text-sm"
            />
            <Button type="submit" size="sm" variant="outline">
              Go
            </Button>
          </form>
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {GENERAL_BOARDS.map((board) => {
            const sets = questionSets.filter((set) => set.year === selectedYear && set.board === board);
            return (
              <div key={board} className="flex flex-col gap-2 rounded-lg border p-3">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-sm font-semibold">{board.replace(" Board", "")}</p>
                  <Link
                    href={addHref(board)}
                    className={buttonVariants({ variant: "ghost", size: "icon-sm" })}
                    aria-label={`Add ${board} paper for ${selectedYear}`}
                  >
                    <Plus className="size-3.5" />
                  </Link>
                </div>
                {sets.length === 0 ? (
                  <p className="text-xs text-muted-foreground">No paper yet</p>
                ) : (
                  <div className="flex flex-col gap-1.5">
                    {sets.map((set) => (
                      <Link
                        key={set.id}
                        href={`/admin/question-banks/${set.id}/edit`}
                        className="flex items-center justify-between gap-2 rounded-md px-2 py-1 text-xs hover:bg-muted"
                      >
                        <span className="truncate">{set.title}</span>
                        <Badge
                          variant={set.isPublished ? "default" : "secondary"}
                          className="shrink-0 text-[10px]"
                        >
                          {set.questionCount}
                        </Badge>
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {unassigned.length > 0 && (
          <div className="flex flex-col gap-2 rounded-lg border border-dashed p-3">
            <p className="text-xs font-medium text-muted-foreground">
              Missing a board or year — won&apos;t appear above until fixed:
            </p>
            {unassigned.map((set) => (
              <Link
                key={set.id}
                href={`/admin/question-banks/${set.id}/edit`}
                className="flex items-center justify-between gap-2 rounded-md border px-2.5 py-1.5 text-xs hover:bg-muted"
              >
                <span className="truncate">{set.title}</span>
                <Pencil className="size-3 shrink-0 text-muted-foreground" />
              </Link>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
