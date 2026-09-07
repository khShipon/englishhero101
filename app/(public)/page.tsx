import type { Metadata } from "next";
import Link from "next/link";
import { getChildren } from "@/lib/queries/content";
import { getFeaturedLessons, getRecentPublishedLessons } from "@/lib/queries/lessons";
import { getRecentVocabulary } from "@/lib/queries/vocabulary";
import { getRecentPublishedQuestionSets } from "@/lib/queries/question-banks";
import { getPublicSiteStats } from "@/lib/queries/site-stats";
import { SearchBox } from "@/components/public/search-box";
import { CategoryCard } from "@/components/public/category-card";
import { LessonCard } from "@/components/public/lesson-card";
import { VocabularyCard } from "@/components/public/vocabulary-card";
import { QuestionSetCard } from "@/components/public/question-set-card";
import { buttonVariants } from "@/components/ui/button";
import { SITE_URL, SITE_NAME } from "@/lib/site-config";
import { cn } from "@/lib/utils";
import {
  CATEGORY_ICONS,
  CATEGORY_COLORS,
  DEFAULT_CATEGORY_ICON,
  DEFAULT_CATEGORY_COLOR,
} from "@/lib/content-icons";
import {
  ArrowRight,
  BookOpen,
  CheckCircle2,
  ClipboardList,
  LayoutGrid,
  Languages,
  PlayCircle,
  Rocket,
  Sparkles,
  Zap,
  type LucideIcon,
} from "lucide-react";

export const metadata: Metadata = {
  title: "EnglishHero101 — Learn English Online",
  description:
    "SSC, HSC, University, IELTS, Spoken English, Grammar, and Vocabulary lessons for students in Bangladesh.",
  alternates: { canonical: "/" },
};

// Structured data (schema.org) so search engines can understand the
// site as an educational resource and, for WebSite + SearchAction,
// potentially render a sitelinks search box in results — a plain
// meta-tag description alone doesn't convey either of these.
const JSON_LD = [
  {
    "@context": "https://schema.org",
    "@type": "EducationalOrganization",
    name: SITE_NAME,
    url: SITE_URL,
    description:
      "Free SSC, HSC, University, IELTS, Spoken English, Grammar, and Vocabulary lessons for students in Bangladesh.",
    areaServed: "BD",
  },
  {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: SITE_NAME,
    url: SITE_URL,
    potentialAction: {
      "@type": "SearchAction",
      target: `${SITE_URL}/search?q={search_term_string}`,
      "query-input": "required name=search_term_string",
    },
  },
];

function Section({
  id,
  eyebrow,
  title,
  icon: Icon,
  viewAllHref,
  viewAllLabel = "View all",
  children,
}: {
  id?: string;
  eyebrow?: string;
  title: string;
  icon: LucideIcon;
  viewAllHref?: string;
  viewAllLabel?: string;
  children: React.ReactNode;
}) {
  return (
    <section id={id} className="mx-auto w-full max-w-6xl px-4 py-10 scroll-mt-20">
      <div className="mb-5 flex items-end justify-between gap-4">
        <div className="flex flex-col gap-1">
          {eyebrow && (
            <span className="text-xs font-bold tracking-[0.2em] text-brand-orange uppercase">
              {eyebrow}
            </span>
          )}
          <h2 className="flex items-center gap-2 text-xl font-semibold tracking-tight">
            <span className="flex size-8 items-center justify-center rounded-lg bg-brand-navy/10 text-brand-navy dark:bg-brand-blue/15 dark:text-brand-blue">
              <Icon className="size-4" />
            </span>
            {title}
          </h2>
        </div>
        {viewAllHref && (
          <Link
            href={viewAllHref}
            className="flex shrink-0 items-center gap-1 text-sm font-medium text-brand-orange hover:underline"
          >
            {viewAllLabel} <ArrowRight className="size-3.5" />
          </Link>
        )}
      </div>
      {children}
    </section>
  );
}

function StatItem({ icon: Icon, value, label }: { icon: LucideIcon; value: number; label: string }) {
  return (
    <div className="flex flex-col items-center gap-1 text-center sm:items-start sm:text-left">
      <Icon className="size-5 text-brand-orange" />
      <span className="text-2xl font-extrabold text-white">{value.toLocaleString()}+</span>
      <span className="text-xs text-white/70">{label}</span>
    </div>
  );
}

export default async function HomePage() {
  const [categories, featuredLessons, recentLessons, vocabulary, questionSets, stats] =
    await Promise.all([
      getChildren(null),
      getFeaturedLessons(4),
      getRecentPublishedLessons(6),
      getRecentVocabulary(8),
      getRecentPublishedQuestionSets(4),
      getPublicSiteStats(),
    ]);

  const publishedCategories = categories.filter((category) => category.isPublished);

  const primaryHref = publishedCategories[0] ? `/${publishedCategories[0].slug}` : "/register";

  const fallbackBooks = [
    { title: "IELTS", iconBg: "bg-purple-600" },
    { title: "HSC English", iconBg: "bg-orange-500" },
    { title: "SSC English", iconBg: "bg-blue-600" },
    { title: "Grammar", iconBg: "bg-emerald-600" },
    { title: "Vocabulary", iconBg: "bg-pink-500" },
  ];
  const heroBooks =
    publishedCategories.length > 0
      ? publishedCategories
          .slice(0, 5)
          .map((c) => ({ title: c.title, iconBg: (CATEGORY_COLORS[c.slug] ?? DEFAULT_CATEGORY_COLOR).iconBg }))
      : fallbackBooks;

  const featureItems = [
    ...publishedCategories.slice(0, 5).map((c) => ({
      title: c.title,
      subtitle: c.description || "Explore lessons",
      href: `/${c.slug}`,
      Icon: CATEGORY_ICONS[c.slug] ?? DEFAULT_CATEGORY_ICON,
      iconBg: (CATEGORY_COLORS[c.slug] ?? DEFAULT_CATEGORY_COLOR).iconBg,
    })),
    {
      title: "Practice Tests",
      subtitle: "Get exam ready",
      href: "/question-banks",
      Icon: ClipboardList,
      iconBg: "bg-sky-600",
    },
  ];

  return (
    <div className="flex flex-col">
      {JSON_LD.map((schema) => (
        <script
          key={schema["@type"]}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
        />
      ))}

      {/* Hero */}
      <section className="relative overflow-hidden border-b bg-gradient-to-b from-blue-50/70 via-background to-background dark:from-blue-950/10">
        <div className="mx-auto grid max-w-6xl gap-12 px-4 py-16 lg:grid-cols-2 lg:items-center lg:gap-8 lg:py-24">
          <div className="flex flex-col items-start gap-5 text-left">
            <span className="flex items-center gap-2 text-xs font-bold tracking-[0.2em] text-muted-foreground uppercase">
              Learn <span className="text-brand-orange">&bull;</span> Practice{" "}
              <span className="text-brand-orange">&bull;</span> Achieve
            </span>
            <h1 className="text-4xl font-extrabold tracking-tight text-balance sm:text-5xl">
              <span className="text-brand-navy dark:text-white">Better English,</span>
              <br />
              <span className="text-brand-orange">Brighter Future</span>
            </h1>
            <p className="max-w-md text-lg text-muted-foreground text-balance">
              EnglishHero101 is your complete guide to mastering English for SSC, HSC, IELTS and more.
              Learn at your own pace, with simple lessons, practice tests and expert tips.
            </p>
            <SearchBox className="w-full max-w-md" />
            <div className="flex flex-wrap items-center gap-4 pt-1">
              <Link
                href={primaryHref}
                className={cn(
                  buttonVariants({ size: "lg" }),
                  "rounded-full bg-brand-orange px-6 text-brand-orange-foreground hover:bg-brand-orange/90",
                )}
              >
                Start Learning Now <ArrowRight />
              </Link>
              <Link
                href="#learning-paths"
                className="flex items-center gap-2 text-sm font-semibold text-brand-navy dark:text-white"
              >
                <span className="flex size-9 items-center justify-center rounded-full border-2 border-brand-navy/20 text-brand-navy dark:border-white/30 dark:text-white">
                  <PlayCircle className="size-4" />
                </span>
                Explore Courses
              </Link>
            </div>
            <div className="flex flex-wrap items-center gap-x-6 gap-y-2 pt-2 text-sm text-muted-foreground">
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="size-4 text-emerald-600" /> Free lessons
              </span>
              <span className="flex items-center gap-1.5">
                <Languages className="size-4 text-emerald-600" /> Bangla explanations
              </span>
              <span className="flex items-center gap-1.5">
                <Zap className="size-4 text-emerald-600" /> Instant-feedback quizzes
              </span>
            </div>
          </div>

          <div className="relative mx-auto flex h-64 w-full max-w-sm items-center justify-center sm:h-80 lg:h-96">
            <div className="absolute inset-0 -z-10 rounded-full bg-gradient-to-br from-blue-100 via-orange-50 to-transparent blur-2xl dark:from-blue-950/40 dark:via-orange-950/10" />
            <div className="flex w-full max-w-[280px] flex-col">
              {heroBooks.map((book) => (
                <div
                  key={book.title}
                  className={cn(
                    "-mt-px flex items-center truncate rounded-r-lg py-2.5 pr-3 pl-4 text-sm font-bold text-white shadow-md first:mt-0",
                    book.iconBg,
                  )}
                >
                  {book.title}
                </div>
              ))}
            </div>
            <span className="absolute top-0 right-0 rotate-6 text-right font-serif text-sm font-semibold text-brand-orange italic sm:text-base">
              Small Steps,
              <br />
              Big Dreams
            </span>
            {stats.lessons > 0 && (
              <span className="absolute -bottom-4 left-1/2 flex -translate-x-1/2 items-center gap-1.5 rounded-full bg-brand-navy px-4 py-2 text-xs font-semibold whitespace-nowrap text-white shadow-lg sm:text-sm">
                <BookOpen className="size-3.5 text-brand-orange" /> {stats.lessons}+ Lessons Ready
              </span>
            )}
          </div>
        </div>
      </section>

      {/* Feature strip */}
      {featureItems.length > 0 && (
        <section className="border-b bg-muted/30">
          <div className="mx-auto grid max-w-6xl grid-cols-2 gap-x-4 gap-y-6 px-4 py-8 sm:grid-cols-3 lg:grid-cols-6">
            {featureItems.map((item) => (
              <Link
                key={item.title}
                href={item.href}
                className="group flex flex-col items-center gap-2 text-center sm:flex-row sm:text-left"
              >
                <span
                  className={cn(
                    "flex size-11 shrink-0 items-center justify-center rounded-full text-white",
                    item.iconBg,
                  )}
                >
                  <item.Icon className="size-5" />
                </span>
                <span className="flex flex-col">
                  <span className="text-sm font-semibold group-hover:text-brand-navy dark:group-hover:text-white">
                    {item.title}
                  </span>
                  <span className="text-xs text-muted-foreground">{item.subtitle}</span>
                </span>
              </Link>
            ))}
          </div>
        </section>
      )}

      <Section
        id="learning-paths"
        eyebrow="Popular Courses"
        title="Choose Your Learning Path"
        icon={LayoutGrid}
        viewAllHref="/search"
        viewAllLabel="Browse all"
      >
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
          {publishedCategories.map((category) => (
            <CategoryCard key={category.id} node={category} href={`/${category.slug}`} />
          ))}
        </div>
      </Section>

      {featuredLessons.length > 0 && (
        <Section title="Featured Lessons" icon={Sparkles}>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {featuredLessons.map((lesson) => (
              <LessonCard key={lesson.id} lesson={lesson} />
            ))}
          </div>
        </Section>
      )}

      {recentLessons.length > 0 && (
        <Section title="Latest Lessons" icon={BookOpen}>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {recentLessons.map((lesson) => (
              <LessonCard key={lesson.id} lesson={lesson} />
            ))}
          </div>
        </Section>
      )}

      {vocabulary.length > 0 && (
        <Section title="Popular Vocabulary" icon={Languages} viewAllHref="/vocabulary">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {vocabulary.map((entry) => (
              <VocabularyCard key={entry.id} entry={entry} />
            ))}
          </div>
        </Section>
      )}

      {questionSets.length > 0 && (
        <Section title="Question Practice" icon={ClipboardList}>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {questionSets.map((set) => (
              <QuestionSetCard key={set.id} questionSet={set} />
            ))}
          </div>
        </Section>
      )}

      {/* Stats + quote */}
      <section className="mx-auto w-full max-w-6xl px-4 py-6">
        <div className="grid gap-8 rounded-2xl bg-gradient-to-br from-brand-navy to-[#0d1a33] px-6 py-10 text-white sm:grid-cols-2 lg:grid-cols-[1fr_auto] lg:items-center lg:gap-12">
          <div className="grid grid-cols-2 gap-6 sm:grid-cols-4">
            <StatItem icon={LayoutGrid} value={stats.categories} label="Topics Covered" />
            <StatItem icon={BookOpen} value={stats.lessons} label="Lessons" />
            <StatItem icon={Languages} value={stats.vocabulary} label="Vocabulary Words" />
            <StatItem icon={ClipboardList} value={stats.questions} label="Practice Questions" />
          </div>
          <blockquote className="max-w-xs border-t border-white/20 pt-6 text-sm text-white/80 italic lg:border-t-0 lg:border-l lg:pt-0 lg:pl-8">
            &ldquo;Good English doesn&apos;t just open doors, it creates new ones.&rdquo;
            <footer className="mt-2 text-xs font-semibold text-brand-orange not-italic">
              — EnglishHero101
            </footer>
          </blockquote>
        </div>
      </section>

      {/* Final CTA */}
      <section className="mx-auto w-full max-w-6xl px-4 pb-16">
        <div className="flex flex-col items-center gap-3 rounded-2xl bg-gradient-to-br from-brand-orange/10 via-blue-50 to-background px-6 py-12 text-center dark:from-brand-orange/10 dark:via-blue-950/10">
          <span className="flex size-11 items-center justify-center rounded-full bg-brand-navy text-white">
            <Rocket className="size-5" />
          </span>
          <h2 className="text-2xl font-extrabold tracking-tight text-brand-navy dark:text-white">
            Ready to start learning?
          </h2>
          <p className="max-w-md text-sm text-muted-foreground">
            Join EnglishHero101 today and get instant access to every lesson, quiz, and vocabulary list.
          </p>
          <Link
            href="/register"
            className={cn(
              buttonVariants({ size: "lg" }),
              "mt-2 rounded-full bg-brand-orange px-6 text-brand-orange-foreground hover:bg-brand-orange/90",
            )}
          >
            Create a free account <ArrowRight />
          </Link>
        </div>
      </section>
    </div>
  );
}
