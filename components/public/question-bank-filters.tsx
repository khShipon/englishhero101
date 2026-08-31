"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { QuestionBankFilterOptions } from "@/lib/queries/question-banks";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search } from "lucide-react";

const ANY = "any";

export function QuestionBankFilters({
  options,
  initial,
}: {
  options: QuestionBankFilterOptions;
  initial: { examType?: string; board?: string; subject?: string; year?: string; q?: string };
}) {
  const router = useRouter();
  const [examType, setExamType] = useState(initial.examType ?? ANY);
  const [board, setBoard] = useState(initial.board ?? ANY);
  const [subject, setSubject] = useState(initial.subject ?? ANY);
  const [year, setYear] = useState(initial.year ?? ANY);
  const [query, setQuery] = useState(initial.q ?? "");

  function navigate(next: { examType: string; board: string; subject: string; year: string; q: string }) {
    const params = new URLSearchParams();
    if (next.examType !== ANY) params.set("examType", next.examType);
    if (next.board !== ANY) params.set("board", next.board);
    if (next.subject !== ANY) params.set("subject", next.subject);
    if (next.year !== ANY) params.set("year", next.year);
    if (next.q.trim()) params.set("q", next.q.trim());
    const qs = params.toString();
    router.push(qs ? `/question-banks?${qs}` : "/question-banks");
  }

  function updateAndNavigate(patch: Partial<typeof initial> & Record<string, string>) {
    const next = { examType, board, subject, year, q: query, ...patch };
    setExamType(next.examType);
    setBoard(next.board);
    setSubject(next.subject);
    setYear(next.year);
    if (typeof patch.q === "string") setQuery(patch.q);
    navigate(next);
  }

  return (
    <div className="flex flex-col gap-3 rounded-xl border bg-muted/30 p-4">
      <div className="flex flex-wrap gap-3">
        <FilterSelect
          label="Exam"
          value={examType}
          onChange={(v) => updateAndNavigate({ examType: v })}
          values={options.examTypes}
        />
        <FilterSelect
          label="Board"
          value={board}
          onChange={(v) => updateAndNavigate({ board: v })}
          values={options.boards}
        />
        <FilterSelect
          label="Subject"
          value={subject}
          onChange={(v) => updateAndNavigate({ subject: v })}
          values={options.subjects}
        />
        <FilterSelect
          label="Year"
          value={year}
          onChange={(v) => updateAndNavigate({ year: v })}
          values={options.years.map(String)}
        />
      </div>
      <form
        className="flex gap-2"
        onSubmit={(e) => {
          e.preventDefault();
          updateAndNavigate({ q: query });
        }}
      >
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search by title..."
          aria-label="Search question banks"
          className="max-w-xs"
        />
        <Button type="submit" size="icon" variant="outline" aria-label="Search">
          <Search />
        </Button>
      </form>
    </div>
  );
}

function FilterSelect({
  label,
  value,
  onChange,
  values,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  values: string[];
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <span className="text-xs font-medium text-muted-foreground">{label}</span>
      <Select value={value} onValueChange={(v) => onChange(v ?? ANY)}>
        <SelectTrigger className="w-36">
          {/* Select.Value stringifies the raw value with no render
              function given — the "any" sentinel's label ("Any
              board", etc.) differs from the value itself, so it has
              to be resolved explicitly instead of just displayed. */}
          <SelectValue>
            {(v: string | null) => (v && v !== ANY ? v : `Any ${label.toLowerCase()}`)}
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          <SelectItem value={ANY}>Any {label.toLowerCase()}</SelectItem>
          {values.map((v) => (
            <SelectItem key={v} value={v}>
              {v}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
