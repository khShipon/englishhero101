import type { Metadata } from "next";
import Link from "next/link";
import { requireUser } from "@/lib/auth/dal";
import { getContinueLearning, getCompletedLessons } from "@/lib/queries/progress";
import { getUserBookmarks } from "@/lib/queries/bookmarks";
import { getSpokenCourseProgress } from "@/lib/queries/course-progress";
import { getLatestLevelTestResult } from "@/lib/queries/level-test";
import { getUserPoints } from "@/lib/queries/points";
import { getFeaturedLessons, getLessonsByDifficulty } from "@/lib/queries/lessons";
import { WelcomeBanner } from "@/components/public/welcome-banner";
import { LessonCard } from "@/components/public/lesson-card";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { buttonVariants } from "@/components/ui/button";
import {
  Award,
  BookOpen,
  Bookmark,
  CircleCheckBig,
  GraduationCap,
  Rocket,
  Settings,
  Sparkles,
  TrendingUp,
} from "lucide-react";

export const metadata: Metadata = { title: "Your profile — EnglishHero101" };

// Entirely per-user (progress, bookmarks) — no static shell to gain
// here, so it opts out of Cache Components validation rather than
// being carved up with Suspense boundaries for no benefit.
export const instant = false;

export default async function ProfilePage({
  searchParams,
}: {
  searchParams: Promise<{ welcome?: string }>;
}) {
  const [user, { welcome }] = await Promise.all([requireUser(), searchParams]);

  const [continueLearning, bookmarks, completed, courseProgress, levelTestResult, points] =
    await Promise.all([
      getContinueLearning(),
      getUserBookmarks(),
      getCompletedLessons(),
      getSpokenCourseProgress(),
      getLatestLevelTestResult(),
      getUserPoints(),
    ]);

  const recommendedLessons = levelTestResult
    ? await getLessonsByDifficulty(levelTestResult.level, 4)
    : await getFeaturedLessons(4);

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-6 px-4 py-12">
      {welcome === "1" && <WelcomeBanner />}
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

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <div className="rounded-lg border px-3 py-2.5 text-center">
          <p className="text-lg font-semibold">{completed.length}</p>
          <p className="text-xs text-muted-foreground">Lessons completed</p>
        </div>
        <div className="rounded-lg border px-3 py-2.5 text-center">
          <p className="text-lg font-semibold">{bookmarks.length}</p>
          <p className="text-xs text-muted-foreground">Bookmarked</p>
        </div>
        <div className="rounded-lg border px-3 py-2.5 text-center">
          <p className="text-lg font-semibold">{points?.points ?? 0}</p>
          <p className="text-xs text-muted-foreground">Points</p>
        </div>
        <div className="rounded-lg border px-3 py-2.5 text-center">
          <p className="text-lg font-semibold">{points?.tierName ?? "Beginner"}</p>
          <p className="text-xs text-muted-foreground">Your level</p>
        </div>
      </div>

      {points && (
        <div className="flex flex-col gap-1.5">
          <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
            <div
              className="h-full rounded-full bg-primary transition-[width]"
              style={{ width: `${points.progressPercent}%` }}
            />
          </div>
          <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <TrendingUp className="size-3.5" />
            {points.nextTierName
              ? `${points.pointsToNextTier} points to ${points.nextTierName} — earn points by completing lessons and quizzes`
              : "You've reached the top tier — keep completing lessons to stay sharp"}
          </p>
        </div>
      )}

      {levelTestResult ? (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Award className="size-4 text-primary" /> Placement test:{" "}
              <span className="capitalize">{levelTestResult.level}</span>
            </CardTitle>
            <CardDescription>
              Score: {levelTestResult.score} / {levelTestResult.total} ({levelTestResult.percent}%)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/level-test?retake=1" className={buttonVariants({ variant: "outline", size: "sm" })}>
              Retake test
            </Link>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Sparkles className="size-4 text-primary" /> Test your English level
            </CardTitle>
            <CardDescription>
              A quick 5-minute quiz covering grammar, vocabulary, fill-in-the-blank, and listening —
              we&apos;ll recommend lessons matched to your level.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/level-test" className={buttonVariants({ size: "sm" })}>
              Start the test
            </Link>
          </CardContent>
        </Card>
      )}

      {recommendedLessons.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Sparkles className="size-4" />{" "}
              {levelTestResult ? "Recommended for your level" : "Lessons you might like"}
            </CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {recommendedLessons.map((lesson) => (
              <LessonCard key={lesson.id} lesson={lesson} />
            ))}
          </CardContent>
        </Card>
      )}

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
