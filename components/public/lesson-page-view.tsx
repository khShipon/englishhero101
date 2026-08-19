import Link from "next/link";
import type { ContentNode, Breadcrumb } from "@/types/content";
import type { Lesson } from "@/lib/queries/lessons";
import { getAdjacentLessons, getRelatedLessons } from "@/lib/queries/lessons";
import { getPublishedQuestionSetsByNode } from "@/lib/queries/question-banks";
import { BreadcrumbTrail } from "@/components/public/breadcrumb-trail";
import { TableOfContents } from "@/components/public/table-of-contents";
import { ShareButton } from "@/components/public/share-button";
import { LessonRenderer } from "@/components/lessons/lesson-renderer";
import { LessonCard } from "@/components/public/lesson-card";
import { QuestionSetCard } from "@/components/public/question-set-card";
import { extractHeadings } from "@/lib/lessons/extract-headings";
import { ArrowLeft, ArrowRight } from "lucide-react";

export async function LessonPageView({
  lesson,
  node,
  breadcrumbs,
  basePath,
}: {
  lesson: Lesson;
  node: ContentNode;
  breadcrumbs: Breadcrumb[];
  basePath: string;
}) {
  const [{ previous, next }, related, questionSets] = await Promise.all([
    getAdjacentLessons(node.id, lesson.id),
    getRelatedLessons(node.id, lesson.id),
    getPublishedQuestionSetsByNode(node.id),
  ]);

  const headings = extractHeadings(lesson.content);

  return (
    <article className="mx-auto grid w-full max-w-6xl grid-cols-1 gap-10 px-4 py-10 lg:grid-cols-[1fr_260px]">
      <div className="min-w-0">
        <BreadcrumbTrail breadcrumbs={breadcrumbs} currentTitle={lesson.title} />
        <h1 className="mt-3 text-3xl font-semibold tracking-tight text-balance">{lesson.title}</h1>
        {lesson.excerpt && <p className="mt-2 text-lg text-muted-foreground">{lesson.excerpt}</p>}
        <div className="mt-4 flex items-center gap-2">
          <ShareButton title={lesson.title} />
        </div>

        <div className="mt-8">
          <LessonRenderer content={lesson.content} />
        </div>

        {(previous || next) && (
          <nav className="mt-12 grid grid-cols-1 gap-4 border-t pt-6 sm:grid-cols-2">
            {previous ? (
              <Link
                href={`${basePath}/${previous.slug}`}
                className="flex flex-col gap-1 rounded-lg border p-4 hover:bg-muted/50"
              >
                <span className="flex items-center gap-1 text-xs text-muted-foreground">
                  <ArrowLeft className="size-3.5" /> Previous
                </span>
                <span className="font-medium">{previous.title}</span>
              </Link>
            ) : (
              <div />
            )}
            {next ? (
              <Link
                href={`${basePath}/${next.slug}`}
                className="flex flex-col items-end gap-1 rounded-lg border p-4 text-right hover:bg-muted/50"
              >
                <span className="flex items-center gap-1 text-xs text-muted-foreground">
                  Next <ArrowRight className="size-3.5" />
                </span>
                <span className="font-medium">{next.title}</span>
              </Link>
            ) : (
              <div />
            )}
          </nav>
        )}

        {related.length > 0 && (
          <section className="mt-10">
            <h2 className="mb-4 text-lg font-semibold tracking-tight">Related lessons</h2>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {related.map((item) => (
                <LessonCard key={item.id} lesson={item} />
              ))}
            </div>
          </section>
        )}

        {questionSets.length > 0 && (
          <section className="mt-10">
            <h2 className="mb-4 text-lg font-semibold tracking-tight">Related questions</h2>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {questionSets.map((set) => (
                <QuestionSetCard key={set.id} questionSet={set} />
              ))}
            </div>
          </section>
        )}
      </div>

      <aside className="hidden lg:block">
        <div className="sticky top-20">
          <TableOfContents headings={headings} />
        </div>
      </aside>
    </article>
  );
}
