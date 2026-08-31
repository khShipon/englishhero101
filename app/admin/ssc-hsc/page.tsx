import type { Metadata } from "next";
import Link from "next/link";
import { getSubjectOverview, type SubjectSectionSummary } from "@/lib/admin/subject-overview";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, ChevronDown } from "lucide-react";

export const metadata: Metadata = { title: "SSC / HSC — Admin — EnglishHero101" };

const BOARDS = [
  { rootSlug: "ssc-english", title: "SSC English" },
  { rootSlug: "hsc-english", title: "HSC English" },
] as const;

// 1st/2nd Paper are expandable <details> disclosures (no extra client
// state needed) since they can each carry ~10-20 topics — everything
// else (Grammar, Writing, Board Questions, Model Tests) is a flat
// "Manage" card, same shape as the IELTS hub.
function SectionCard({ section }: { section: SubjectSectionSummary }) {
  if (section.topics.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-base">{section.title}</CardTitle>
          <CardDescription>
            {section.itemCount} item{section.itemCount === 1 ? "" : "s"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Link
            href={`/admin/content/${section.nodeId}/lessons?subtree=1`}
            className={buttonVariants({ variant: "outline", size: "sm" })}
          >
            Manage
          </Link>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <details>
        <summary className="flex cursor-pointer list-none items-center justify-between gap-3 p-6 pb-0">
          <div>
            <p className="text-base font-semibold">{section.title}</p>
            <p className="text-sm text-muted-foreground">
              {section.topics.length} topic{section.topics.length === 1 ? "" : "s"} ·{" "}
              {section.itemCount} item{section.itemCount === 1 ? "" : "s"}
            </p>
          </div>
          <ChevronDown className="size-4 shrink-0 text-muted-foreground" />
        </summary>
        <CardContent className="flex flex-col gap-2 pt-4">
          {section.topics.map((topic) => (
            <div
              key={topic.nodeId}
              className="flex items-center justify-between gap-2 rounded-md border px-3 py-2 text-sm"
            >
              <span>
                {topic.title}{" "}
                <span className="text-muted-foreground">
                  ({topic.itemCount} item{topic.itemCount === 1 ? "" : "s"})
                </span>
              </span>
              <Link
                href={`/admin/content/${topic.nodeId}/lessons?subtree=1`}
                className={buttonVariants({ variant: "ghost", size: "sm" })}
              >
                Manage
              </Link>
            </div>
          ))}
          <Link
            href={`/admin/content/new?parent=${section.nodeId}&type=topic`}
            className={buttonVariants({ variant: "outline", size: "sm", className: "mt-1 self-start" })}
          >
            <Plus /> Add topic
          </Link>
        </CardContent>
      </details>
    </Card>
  );
}

export default async function SscHscAdminHubPage() {
  const [ssc, hsc] = await Promise.all(BOARDS.map((board) => getSubjectOverview(board.rootSlug)));
  const overviews = [
    { ...BOARDS[0], sections: ssc },
    { ...BOARDS[1], sections: hsc },
  ];

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">SSC / HSC</h1>
        <p className="text-sm text-muted-foreground">
          Manage every SSC and HSC English section, and add any exam topic, from one place.
        </p>
      </div>

      {overviews.map((board) => (
        <div key={board.rootSlug} className="flex flex-col gap-4">
          <h2 className="text-lg font-semibold tracking-tight">{board.title}</h2>
          {board.sections.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              &ldquo;{board.title}&rdquo; category not found — check it&apos;s seeded under Content.
            </p>
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {board.sections.map((section) => (
                <SectionCard key={section.nodeId} section={section} />
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
