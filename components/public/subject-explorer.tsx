"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import type { ContentNode } from "@/types/content";
import { SearchBox } from "@/components/public/search-box";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ClipboardList } from "lucide-react";

// Quick paper -> topic navigator + search, shown only on the SSC
// English / HSC English landing pages (see CategoryPageView) — these
// two subjects are wide enough (6 sections, ~20-30 topics under the
// 1st/2nd Paper sections) that jumping straight to a topic beats
// scrolling the Browse grid.
export function SubjectExplorer({
  basePath,
  sections,
  sectionChildren,
  examType,
}: {
  basePath: string;
  sections: ContentNode[];
  sectionChildren: Record<string, ContentNode[]>;
  examType: "SSC" | "HSC";
}) {
  const router = useRouter();
  const sectionsWithTopics = useMemo(
    () => sections.filter((section) => (sectionChildren[section.id]?.length ?? 0) > 0),
    [sections, sectionChildren],
  );
  const [sectionId, setSectionId] = useState(sectionsWithTopics[0]?.id ?? "");
  const topics = sectionChildren[sectionId] ?? [];

  return (
    <div className="mb-8 flex flex-col gap-4 rounded-xl border bg-muted/30 p-4 sm:flex-row sm:items-end sm:justify-between">
      <div className="flex flex-1 flex-col gap-3 sm:flex-row sm:items-end">
        <div className="flex flex-col gap-1.5">
          <span className="text-xs font-medium text-muted-foreground">Paper</span>
          <Select value={sectionId} onValueChange={(v) => setSectionId(v ?? "")}>
            <SelectTrigger className="w-full sm:w-44">
              {/* Select.Value stringifies the raw value with no render
                  function given, and the value here is the section's
                  id (needed below to look up its topics) — so it has
                  to be resolved back to a title, not just displayed. */}
              <SelectValue placeholder="Choose a paper">
                {(value: string | null) =>
                  sectionsWithTopics.find((section) => section.id === value)?.title ?? "Choose a paper"
                }
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              {sectionsWithTopics.map((section) => (
                <SelectItem key={section.id} value={section.id}>
                  {section.title}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex flex-col gap-1.5">
          <span className="text-xs font-medium text-muted-foreground">Topic</span>
          <Select
            value=""
            onValueChange={(topicSlug) => {
              const section = sections.find((s) => s.id === sectionId);
              if (section) router.push(`${basePath}/${section.slug}/${topicSlug}`);
            }}
            disabled={topics.length === 0}
          >
            <SelectTrigger className="w-full sm:w-64">
              <SelectValue placeholder={topics.length ? "Jump to a topic" : "No topics yet"} />
            </SelectTrigger>
            <SelectContent>
              {topics.map((topic) => (
                <SelectItem key={topic.id} value={topic.slug}>
                  {topic.title}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <SearchBox
          className="flex-1 sm:max-w-xs"
          action="/search"
          placeholder={`Search ${examType} English...`}
        />
      </div>

      <a
        href={`/question-banks?examType=${examType}`}
        className={cn(buttonVariants({ variant: "outline", size: "sm" }), "shrink-0 gap-1.5")}
      >
        <ClipboardList className="size-4" />
        Board questions
      </a>
    </div>
  );
}
