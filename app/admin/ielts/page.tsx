import type { Metadata } from "next";
import Link from "next/link";
import { getIeltsSectionsOverview } from "@/lib/admin/ielts-overview";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BookOpenText, Headphones, PenLine, Mic, Library } from "lucide-react";
import type { ComponentType } from "react";

export const metadata: Metadata = { title: "IELTS — Admin — EnglishHero101" };

const SECTION_META: Record<
  string,
  { icon: ComponentType<{ className?: string }>; description: string; unit: string; href: (nodeId: string) => string }
> = {
  listening: {
    icon: Headphones,
    description: "Listening lessons and practice.",
    unit: "lesson",
    href: (nodeId) => `/admin/content/${nodeId}/lessons?subtree=1`,
  },
  reading: {
    icon: BookOpenText,
    description: "Full CD-style reading tests: passages, all question types, and answers.",
    unit: "lesson",
    href: () => "/admin/ielts-reading",
  },
  writing: {
    icon: PenLine,
    description: "Task 1/2 lessons and model answers.",
    unit: "lesson",
    href: (nodeId) => `/admin/content/${nodeId}/lessons?subtree=1`,
  },
  speaking: {
    icon: Mic,
    description: "Foundations plus Part 1/2/3 model answers.",
    unit: "lesson",
    href: (nodeId) => `/admin/content/${nodeId}/lessons?subtree=1`,
  },
  vocabulary: {
    icon: Library,
    description: "The 1000-word IELTS vocabulary list, organized by category.",
    unit: "word",
    href: () => "/admin/vocabulary",
  },
};

export default async function IeltsAdminHubPage() {
  const sections = await getIeltsSectionsOverview();

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">IELTS</h1>
        <p className="text-sm text-muted-foreground">Manage every IELTS section from one place.</p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {sections.map((section) => {
          const meta = SECTION_META[section.slug];
          const Icon = meta?.icon ?? BookOpenText;
          const href = meta?.href(section.nodeId) ?? `/admin/content/${section.nodeId}/lessons`;
          const unit = meta?.unit ?? "lesson";
          return (
            <Card key={section.nodeId}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <Icon className="size-4" /> {section.title}
                </CardTitle>
                <CardDescription>{meta?.description ?? ""}</CardDescription>
              </CardHeader>
              <CardContent className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">
                  {section.itemCount} {unit}
                  {section.itemCount === 1 ? "" : "s"}
                </span>
                <Link href={href} className={buttonVariants({ variant: "outline", size: "sm" })}>
                  Manage
                </Link>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
