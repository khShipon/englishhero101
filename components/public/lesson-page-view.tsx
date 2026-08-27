import { Suspense } from "react";
import Link from "next/link";
import type { ContentNode, Breadcrumb } from "@/types/content";
import type { Lesson } from "@/lib/queries/lessons";
import { getAdjacentLessons, getRelatedLessons } from "@/lib/queries/lessons";
import {
  getPublishedQuestionSetsByNode,
  getPublishedQuestionSetsByLesson,
  getSanitizedQuestionsBySet,
} from "@/lib/queries/question-banks";
import { getReadingPassagesByLesson } from "@/lib/queries/reading-passages";
import { getCurrentUser } from "@/lib/auth/dal";
import { isLessonBookmarked } from "@/lib/queries/bookmarks";
import { getLessonProgress } from "@/lib/queries/progress";
import { BreadcrumbTrail } from "@/components/public/breadcrumb-trail";
import { TableOfContents } from "@/components/public/table-of-contents";
import { ShareButton } from "@/components/public/share-button";
import { BookmarkButton } from "@/components/lessons/bookmark-button";
import { MarkCompleteButton } from "@/components/lessons/mark-complete-button";
import { TrackLessonView } from "@/components/lessons/track-lesson-view";
import { LessonRenderer } from "@/components/lessons/lesson-renderer";
import { PracticePanel } from "@/components/lessons/practice-panel";
import { LessonCard } from "@/components/public/lesson-card";
import { QuestionSetCard } from "@/components/public/question-set-card";
import { extractHeadings } from "@/lib/lessons/extract-headings";
import { cn } from "@/lib/utils";
import { ArrowLeft, ArrowRight } from "lucide-react";

// Reads the session cookie — isolated so the lesson content around it
// (cached via lib/queries/lessons.ts) can still be part of the static
// shell instead of the whole page being forced dynamic.
async function LessonUserActions({ lessonId }: { lessonId: string }) {
  const user = await getCurrentUser();
  if (!user) {
    return (
      <Link
        href="/login"
        className="text-sm text-muted-foreground underline underline-offset-2 hover:text-foreground"
      >
        Login to bookmark and track progress
      </Link>
    );
  }

  const [bookmarked, progress] = await Promise.all([
    isLessonBookmarked(lessonId),
    getLessonProgress(lessonId),
  ]);

  return (
    <>
      <BookmarkButton lessonId={lessonId} initialBookmarked={bookmarked} />
      <MarkCompleteButton lessonId={lessonId} initialCompleted={progress?.completed ?? false} />
      <TrackLessonView lessonId={lessonId} />
    </>
  );
}

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
  const [{ previous, next }, related, questionSets, practiceSets, readingPassages] = await Promise.all([
    getAdjacentLessons(node.id, lesson.id),
    getRelatedLessons(node.id, lesson.id),
    getPublishedQuestionSetsByNode(node.id),
    getPublishedQuestionSetsByLesson(lesson.id),
    getReadingPassagesByLesson(lesson.id),
  ]);

  const practicePanels = await Promise.all(
    practiceSets.map(async (set) => ({
      set,
      questions: await getSanitizedQuestionsBySet(set.id),
    })),
  );

  const isReadingTest = readingPassages.length > 0;
  // Reading tests carry their passages/questions only in the interactive
  // split-screen test below — the lesson body would otherwise repeat
  // the exact same passages and questions as plain static text. Their
  // headings (and the TOC that would link to them) are skipped for the
  // same reason.
  const headings = isReadingTest ? [] : extractHeadings(lesson.content);

  const practiceSection = practicePanels.length > 0 && (
    <section className="mt-10 flex flex-col gap-4">
      <h2 className="text-lg font-semibold tracking-tight">Practice</h2>
      {practicePanels.map(({ set, questions }) =>
        questions.length > 0 ? (
          <PracticePanel
            key={set.id}
            questionSetId={set.id}
            title={set.title}
            questionCount={questions.length}
            questions={questions}
            passages={readingPassages}
          />
        ) : null,
      )}
    </section>
  );

  return (
    <article
      className={cn(
        "mx-auto grid w-full gap-10 px-4 py-10",
        isReadingTest
          ? "max-w-[1600px] grid-cols-1"
          : "max-w-6xl grid-cols-1 lg:grid-cols-[1fr_260px]",
      )}
    >
      <div className="min-w-0">
        <BreadcrumbTrail breadcrumbs={breadcrumbs} currentTitle={lesson.title} />
        <h1 className="mt-3 text-3xl font-semibold tracking-tight text-balance">{lesson.title}</h1>
        {lesson.excerpt && <p className="mt-2 text-lg text-muted-foreground">{lesson.excerpt}</p>}
        <div className="mt-4 flex items-center gap-2">
          <ShareButton title={lesson.title} />
          <Suspense fallback={null}>
            <LessonUserActions lessonId={lesson.id} />
          </Suspense>
        </div>

        {isReadingTest ? (
          <div className="mt-10">{practiceSection}</div>
        ) : (
          <>
            <div className="mt-8">
              <LessonRenderer content={lesson.content} />
            </div>
            {practiceSection}
          </>
        )}

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

      {!isReadingTest && (
        <aside className="hidden lg:block">
          <div className="sticky top-20">
            <TableOfContents headings={headings} />
          </div>
        </aside>
      )}
    </article>
  );
}
