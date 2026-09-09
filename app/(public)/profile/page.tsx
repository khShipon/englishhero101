import type { Metadata } from "next";
import Link from "next/link";
import { requireUser } from "@/lib/auth/dal";
import { getContinueLearning, getCompletedLessons } from "@/lib/queries/progress";
import { getUserBookmarks } from "@/lib/queries/bookmarks";
import { getSpokenCourseProgress } from "@/lib/queries/course-progress";
import { getLatestLevelTestResult } from "@/lib/queries/level-test";
import { getUserPoints } from "@/lib/queries/points";
import { getFeaturedLessons, getLessonsByDifficulty } from "@/lib/queries/lessons";
import { getNotifications, getUnreadNotificationCount } from "@/lib/queries/forum-notifications";
import { markAllNotificationsRead } from "@/lib/forum/notification-actions";
import { WelcomeBanner } from "@/components/public/welcome-banner";
import { LessonCard } from "@/components/public/lesson-card";
import { NotificationItem } from "@/components/forum/notification-item";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  ArrowRight,
  Award,
  Bell,
  BookOpen,
  Bookmark,
  ClipboardList,
  CircleCheckBig,
  GraduationCap,
  LayoutGrid,
  Languages,
  MessagesSquare,
  Newspaper,
  Rocket,
  Settings,
  Sparkles,
  TrendingUp,
  type LucideIcon,
} from "lucide-react";

export const metadata: Metadata = { title: "Your dashboard — EnglishHero101" };

// Entirely per-user (progress, bookmarks) — no static shell to gain
// here, so it opts out of Cache Components validation rather than
// being carved up with Suspense boundaries for no benefit.
export const instant = false;

function initials(fullName: string | null, email: string) {
  if (fullName?.trim()) {
    const parts = fullName.trim().split(/\s+/);
    return (parts[0][0] + (parts[1]?.[0] ?? "")).toUpperCase();
  }
  return email[0]?.toUpperCase() ?? "?";
}

function StatCard({
  icon: Icon,
  iconClassName,
  value,
  label,
}: {
  icon: LucideIcon;
  iconClassName: string;
  value: React.ReactNode;
  label: string;
}) {
  return (
    <div className="flex items-center gap-3 rounded-xl bg-card p-3.5 ring-1 ring-foreground/10 transition-shadow hover:shadow-md sm:p-4">
      <span className={cn("flex size-10 shrink-0 items-center justify-center rounded-full text-white", iconClassName)}>
        <Icon className="size-5" />
      </span>
      <div className="min-w-0">
        <p className="truncate text-lg font-bold leading-tight">{value}</p>
        <p className="truncate text-xs text-muted-foreground">{label}</p>
      </div>
    </div>
  );
}

function DashboardCard({
  icon: Icon,
  iconClassName = "bg-brand-navy/10 text-brand-navy dark:bg-brand-blue/15 dark:text-brand-blue",
  title,
  description,
  action,
  children,
}: {
  icon: LucideIcon;
  iconClassName?: string;
  title: string;
  description?: React.ReactNode;
  action?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <span className={cn("flex size-8 shrink-0 items-center justify-center rounded-lg", iconClassName)}>
            <Icon className="size-4" />
          </span>
          {title}
        </CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
        {action && <CardAction>{action}</CardAction>}
      </CardHeader>
      <CardContent className="flex flex-col gap-2.5">{children}</CardContent>
    </Card>
  );
}

function LessonListItem({
  href,
  title,
  progressPercent,
}: {
  href: string;
  title: string;
  progressPercent?: number;
}) {
  return (
    <Link
      href={href}
      className="group flex items-center gap-3 rounded-lg border px-3 py-2.5 text-sm font-medium transition-colors hover:border-brand-orange/40 hover:bg-muted/50"
    >
      <span className="min-w-0 flex-1 truncate">{title}</span>
      {typeof progressPercent === "number" && progressPercent > 0 && (
        <span className="hidden shrink-0 items-center gap-1.5 sm:flex">
          <span className="h-1.5 w-16 overflow-hidden rounded-full bg-muted">
            <span
              className="block h-full rounded-full bg-brand-orange"
              style={{ width: `${progressPercent}%` }}
            />
          </span>
          <span className="w-8 shrink-0 text-xs text-muted-foreground">{progressPercent}%</span>
        </span>
      )}
      <ArrowRight className="size-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:text-brand-orange" />
    </Link>
  );
}

function QuickLink({
  href,
  icon: Icon,
  iconClassName,
  title,
  subtitle,
}: {
  href: string;
  icon: LucideIcon;
  iconClassName: string;
  title: string;
  subtitle: string;
}) {
  return (
    <Link href={href} className="group flex items-center gap-3 rounded-lg px-1 py-1.5 hover:bg-muted/50">
      <span className={cn("flex size-9 shrink-0 items-center justify-center rounded-full text-white", iconClassName)}>
        <Icon className="size-4" />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block truncate text-sm font-semibold group-hover:text-brand-navy dark:group-hover:text-white">
          {title}
        </span>
        <span className="block truncate text-xs text-muted-foreground">{subtitle}</span>
      </span>
      <ArrowRight className="size-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
    </Link>
  );
}

export default async function ProfilePage({
  searchParams,
}: {
  searchParams: Promise<{ welcome?: string }>;
}) {
  const [user, { welcome }] = await Promise.all([requireUser(), searchParams]);

  const [continueLearning, bookmarks, completed, courseProgress, levelTestResult, points, notifications, unreadCount] =
    await Promise.all([
      getContinueLearning(),
      getUserBookmarks(),
      getCompletedLessons(),
      getSpokenCourseProgress(),
      getLatestLevelTestResult(),
      getUserPoints(),
      getNotifications(10),
      getUnreadNotificationCount(),
    ]);

  const recommendedLessons = levelTestResult
    ? await getLessonsByDifficulty(levelTestResult.level, 4)
    : await getFeaturedLessons(4);

  const hasAnyActivity =
    (courseProgress && courseProgress.totalLessons > 0) ||
    continueLearning.length > 0 ||
    bookmarks.length > 0 ||
    completed.length > 0;

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-6 px-4 py-8 sm:py-10">
      {welcome === "1" && <WelcomeBanner />}

      {/* Hero */}
      <section className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-brand-navy to-[#0d1a33] px-5 py-7 text-white shadow-lg sm:px-8 sm:py-8">
        <div className="pointer-events-none absolute -top-16 -right-16 size-56 rounded-full bg-brand-orange/10 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-20 -left-10 size-56 rounded-full bg-brand-blue/20 blur-3xl" />
        <div className="relative flex flex-col gap-5">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <span className="flex size-12 shrink-0 items-center justify-center rounded-full bg-white/10 text-lg font-bold ring-2 ring-white/20 sm:size-14 sm:text-xl">
                {initials(user.fullName, user.email)}
              </span>
              <div>
                <h1 className="text-xl font-extrabold tracking-tight sm:text-2xl">
                  {user.fullName ? `Welcome back, ${user.fullName.split(" ")[0]}` : "Your dashboard"}
                </h1>
                <p className="mt-0.5 text-sm text-white/70">Pick up right where you left off.</p>
              </div>
            </div>
            <Link
              href="/settings"
              className="flex shrink-0 items-center gap-1.5 rounded-full border border-white/20 px-3 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-white/10 sm:text-sm"
            >
              <Settings className="size-4" /> <span className="hidden sm:inline">Settings</span>
            </Link>
          </div>

          <div className="flex flex-wrap items-center gap-3 sm:gap-4">
            <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-brand-orange px-3 py-1 text-xs font-bold text-brand-orange-foreground">
              <Sparkles className="size-3.5" /> {points?.tierName ?? "Beginner"}
            </span>
            {points && (
              <div className="flex min-w-[180px] flex-1 items-center gap-3">
                <div className="h-2 flex-1 overflow-hidden rounded-full bg-white/15">
                  <div
                    className="h-full rounded-full bg-brand-orange transition-[width]"
                    style={{ width: `${points.progressPercent}%` }}
                  />
                </div>
                <span className="flex shrink-0 items-center gap-1 text-xs font-medium text-white/80">
                  <TrendingUp className="size-3.5" />
                  {points.nextTierName ? `${points.pointsToNextTier} pts to ${points.nextTierName}` : "Top tier"}
                </span>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatCard icon={CircleCheckBig} iconClassName="bg-emerald-600" value={completed.length} label="Lessons completed" />
        <StatCard icon={Bookmark} iconClassName="bg-pink-500" value={bookmarks.length} label="Bookmarked" />
        <StatCard icon={Award} iconClassName="bg-brand-orange" value={points?.points ?? 0} label="Points" />
        <StatCard icon={TrendingUp} iconClassName="bg-brand-blue" value={points?.tierName ?? "Beginner"} label="Your level" />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main column */}
        <div className="flex flex-col gap-6 lg:col-span-2">
          {levelTestResult ? (
            <DashboardCard
              icon={Award}
              iconClassName="bg-brand-orange/10 text-brand-orange"
              title={`Placement test: ${levelTestResult.level}`}
              description={`Score: ${levelTestResult.score} / ${levelTestResult.total} (${levelTestResult.percent}%)`}
              action={
                <Link href="/level-test?retake=1" className={buttonVariants({ variant: "outline", size: "sm" })}>
                  Retake test
                </Link>
              }
            >
              <p className="text-sm text-muted-foreground">
                Lessons below are matched to your <span className="font-medium capitalize">{levelTestResult.level}</span> level.
              </p>
            </DashboardCard>
          ) : (
            <DashboardCard
              icon={Sparkles}
              iconClassName="bg-brand-orange/10 text-brand-orange"
              title="Test your English level"
              action={
                <Link
                  href="/level-test"
                  className={cn(buttonVariants({ size: "sm" }), "rounded-full bg-brand-orange text-brand-orange-foreground hover:bg-brand-orange/90")}
                >
                  Start the test
                </Link>
              }
            >
              <p className="text-sm text-muted-foreground">
                A quick 5-minute quiz covering grammar, vocabulary, fill-in-the-blank, and listening —
                we&apos;ll recommend lessons matched to your level.
              </p>
            </DashboardCard>
          )}

          {recommendedLessons.length > 0 && (
            <DashboardCard
              icon={Sparkles}
              iconClassName="bg-brand-navy/10 text-brand-navy dark:bg-brand-blue/15 dark:text-brand-blue"
              title={levelTestResult ? "Recommended for your level" : "Lessons you might like"}
            >
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                {recommendedLessons.map((lesson) => (
                  <LessonCard key={lesson.id} lesson={lesson} />
                ))}
              </div>
            </DashboardCard>
          )}

          {courseProgress && courseProgress.totalLessons > 0 && (
            <DashboardCard
              icon={GraduationCap}
              iconClassName="bg-teal-600/10 text-teal-600"
              title="Spoken English Course"
              description={
                <>
                  {courseProgress.completedLessons} / {courseProgress.totalLessons} lessons complete
                  {courseProgress.averagePercent !== null && (
                    <> · {courseProgress.averagePercent}% average practice score</>
                  )}
                </>
              }
            >
              <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                <div
                  className="h-full rounded-full bg-teal-600 transition-[width]"
                  style={{
                    width: `${Math.round((courseProgress.completedLessons / courseProgress.totalLessons) * 100)}%`,
                  }}
                />
              </div>
              {courseProgress.nextLesson && (
                <LessonListItem href={courseProgress.nextLesson.href} title={`Continue: ${courseProgress.nextLesson.title}`} />
              )}
            </DashboardCard>
          )}

          {continueLearning.length > 0 && (
            <DashboardCard icon={BookOpen} iconClassName="bg-brand-blue/10 text-brand-blue" title="Continue learning">
              {continueLearning.map(({ lesson, href, progress }) => (
                <LessonListItem key={lesson.id} href={href} title={lesson.title} progressPercent={progress.progressPercent} />
              ))}
            </DashboardCard>
          )}

          {!hasAnyActivity && (
            <Card>
              <CardContent className="flex flex-col items-center gap-3 py-10 text-center">
                <span className="flex size-12 items-center justify-center rounded-full bg-brand-orange/10 text-brand-orange">
                  <Rocket className="size-6" />
                </span>
                <div>
                  <p className="font-medium">You haven&apos;t started a lesson yet</p>
                  <p className="text-sm text-muted-foreground">
                    Pick a category and your progress will show up here.
                  </p>
                </div>
                <Link
                  href="/"
                  className={cn(buttonVariants({ size: "sm" }), "rounded-full bg-brand-orange text-brand-orange-foreground hover:bg-brand-orange/90")}
                >
                  Browse lessons
                </Link>
              </CardContent>
            </Card>
          )}

          {completed.length > 0 && (
            <DashboardCard icon={CircleCheckBig} iconClassName="bg-emerald-600/10 text-emerald-600" title="Completed lessons">
              {completed.map(({ lesson, href }) => (
                <LessonListItem key={lesson.id} href={href} title={lesson.title} />
              ))}
            </DashboardCard>
          )}
        </div>

        {/* Sidebar */}
        <div className="flex flex-col gap-6">
          <DashboardCard
            icon={Bell}
            iconClassName="bg-brand-orange/10 text-brand-orange"
            title="Notifications"
            action={
              unreadCount > 0 && (
                <form action={markAllNotificationsRead}>
                  <button type="submit" className="text-xs font-medium text-brand-orange hover:underline">
                    Mark all as read
                  </button>
                </form>
              )
            }
          >
            {notifications.length === 0 ? (
              <p className="py-2 text-sm text-muted-foreground">
                No notifications yet — replies and reactions on your forum posts will show up here.
              </p>
            ) : (
              notifications.map((notification) => (
                <NotificationItem key={notification.id} notification={notification} />
              ))
            )}
          </DashboardCard>

          <DashboardCard icon={LayoutGrid} iconClassName="bg-brand-navy/10 text-brand-navy dark:bg-brand-blue/15 dark:text-brand-blue" title="Explore more">
            <QuickLink href="/" icon={LayoutGrid} iconClassName="bg-blue-600" title="Browse categories" subtitle="SSC, HSC, IELTS & more" />
            <QuickLink href="/forum" icon={MessagesSquare} iconClassName="bg-teal-600" title="Forum" subtitle="Ask & discuss with classmates" />
            <QuickLink href="/vocabulary" icon={Languages} iconClassName="bg-pink-500" title="Vocabulary" subtitle="Grow your word bank" />
            <QuickLink href="/question-banks" icon={ClipboardList} iconClassName="bg-sky-600" title="Practice tests" subtitle="Get exam ready" />
            <QuickLink href="/blog" icon={Newspaper} iconClassName="bg-purple-600" title="Blog" subtitle="Tips & study guides" />
          </DashboardCard>

          {bookmarks.length > 0 && (
            <DashboardCard icon={Bookmark} iconClassName="bg-pink-500/10 text-pink-500" title="Bookmarked lessons">
              {bookmarks.map(({ lesson, href }) => (
                <LessonListItem key={lesson.id} href={href} title={lesson.title} />
              ))}
            </DashboardCard>
          )}
        </div>
      </div>
    </div>
  );
}
