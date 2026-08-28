import type { Metadata } from "next";
import Link from "next/link";
import { requireUser } from "@/lib/auth/dal";
import { getContinueLearning, getCompletedLessons } from "@/lib/queries/progress";
import { getUserBookmarks } from "@/lib/queries/bookmarks";
import { getSpokenCourseProgress } from "@/lib/queries/course-progress";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { buttonVariants } from "@/components/ui/button";
import { BookOpen, Bookmark, CircleCheckBig, GraduationCap, Rocket, Settings } from "lucide-react";

export const metadata: Metadata = { title: "Your profile — EnglishHero101" };

// Entirely per-user (progress, bookmarks) — no static shell to gain
// here, so it opts out of Cache Components validation rather than
// being carved up with Suspense boundaries for no benefit.
export const instant = false;

export default async function ProfilePage() {
  const user = await requireUser();

  const [continueLearning, bookmarks, completed, courseProgress] = await Promise.all([
    getContinueLearning(),
    getUserBookmarks(),
    getCompletedLessons(),
    getSpokenCourseProgress(),
  ]);

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-6 px-4 py-12">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            {user.fullName ? `Welcome back, ${user.fullName.split(" ")[0]}` : "Your profile"}
          </h1>
          <p className="text-sm text-muted-foreground">Pick up right where you left off.</p>
        </div>
        <Link
          href="/settings"
          className={buttonVariants({ variant: "outline", size: "sm", className: "shrink-0" })}
        >
          <Settings /> Settings
        </Link>
      </div>
      {courseProgress && courseProgress.totalLessons > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <GraduationCap className="size-4" /> Spoken English Course
            </CardTitle>
            <CardDescription>
              {courseProgress.completedLessons} / {courseProgress.totalLessons} lessons complete
              {courseProgress.averagePercent !== null && (
                <> · {courseProgress.averagePercent}% average practice score</>
              )}
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
              <div
                className="h-full rounded-full bg-primary transition-[width]"
                style={{
                  width: `${Math.round((courseProgress.completedLessons / courseProgress.totalLessons) * 100)}%`,
                }}
              />
            </div>
            {courseProgress.nextLesson && (
              <Link
                href={courseProgress.nextLesson.href}
                className="self-start rounded-md border px-3 py-2 text-sm font-medium hover:bg-muted/50"
              >
                Continue: {courseProgress.nextLesson.title} →
              </Link>
            )}
          </CardContent>
        </Card>
      )}

      {continueLearning.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <BookOpen className="size-4" /> Continue learning
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-2">
            {continueLearning.map(({ lesson, href }) => (
              <Link
                key={lesson.id}
                href={href}
                className="rounded-md border px-3 py-2 text-sm font-medium hover:bg-muted/50"
              >
                {lesson.title}
              </Link>
            ))}
          </CardContent>
        </Card>
      )}

      {!(courseProgress && courseProgress.totalLessons > 0) &&
        continueLearning.length === 0 &&
        bookmarks.length === 0 &&
        completed.length === 0 && (
          <Card>
            <CardContent className="flex flex-col items-center gap-3 py-8 text-center">
              <span className="flex size-10 items-center justify-center rounded-full bg-primary/10 text-primary">
                <Rocket className="size-5" />
              </span>
              <div>
                <p className="font-medium">You haven&apos;t started a lesson yet</p>
                <p className="text-sm text-muted-foreground">
                  Pick a category and your progress will show up here.
                </p>
              </div>
              <Link href="/" className={buttonVariants({ size: "sm" })}>
                Browse lessons
              </Link>
            </CardContent>
          </Card>
        )}

      {bookmarks.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Bookmark className="size-4" /> Bookmarked lessons
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-2">
            {bookmarks.map(({ lesson, href }) => (
              <Link
                key={lesson.id}
                href={href}
                className="rounded-md border px-3 py-2 text-sm font-medium hover:bg-muted/50"
              >
                {lesson.title}
              </Link>
            ))}
          </CardContent>
        </Card>
      )}

      {completed.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <CircleCheckBig className="size-4" /> Completed lessons
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-2">
            {completed.map(({ lesson, href }) => (
              <Link
                key={lesson.id}
                href={href}
                className="rounded-md border px-3 py-2 text-sm font-medium hover:bg-muted/50"
              >
                {lesson.title}
              </Link>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
