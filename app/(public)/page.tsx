import type { Metadata } from "next";
import Link from "next/link";
import { getChildren } from "@/lib/queries/content";
import { getFeaturedLessons, getRecentPublishedLessons } from "@/lib/queries/lessons";
import { getRecentVocabulary } from "@/lib/queries/vocabulary";
import { getRecentPublishedQuestionSets } from "@/lib/queries/question-banks";
import { SearchBox } from "@/components/public/search-box";
import { CategoryCard } from "@/components/public/category-card";
import { LessonCard } from "@/components/public/lesson-card";
import { VocabularyCard } from "@/components/public/vocabulary-card";
import { QuestionSetCard } from "@/components/public/question-set-card";
import { buttonVariants } from "@/components/ui/button";
import { SITE_URL, SITE_NAME } from "@/lib/site-config";
import {
  ArrowRight,
  BookOpen,
  CheckCircle2,
  ClipboardList,
  GraduationCap,
  LayoutGrid,
  Languages,
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
  title,
  icon: Icon,
  viewAllHref,
  children,
}: {
  title: string;
  icon: LucideIcon;
  viewAllHref?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="mx-auto w-full max-w-6xl px-4 py-10">
      <div className="mb-5 flex items-center justify-between">
        <h2 className="flex items-center gap-2 text-xl font-semibold tracking-tight">
          <span className="flex size-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <Icon className="size-4" />
          </span>
          {title}
        </h2>
        {viewAllHref && (
          <Link
            href={viewAllHref}
            className="flex items-center gap-1 text-sm font-medium text-primary hover:underline"
          >
            View all <ArrowRight className="size-3.5" />
          </Link>
        )}
      </div>
      {children}
    </section>
  );
}

export default async function HomePage() {
  const [categories, featuredLessons, recentLessons, vocabulary, questionSets] =
    await Promise.all([
      getChildren(null),
      getFeaturedLessons(4),
      getRecentPublishedLessons(6),
      getRecentVocabulary(8),
      getRecentPublishedQuestionSets(4),
    ]);

  const publishedCategories = categories.filter((category) => category.isPublished);

  return (
    <div className="flex flex-col">
      {JSON_LD.map((schema) => (
        <script
          key={schema["@type"]}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
        />
      ))}
      <section className="relative overflow-hidden border-b bg-gradient-to-b from-primary/5 via-muted/30 to-background">
        <div className="mx-auto flex max-w-3xl flex-col items-center gap-6 px-4 py-20 text-center">
          <span className="flex items-center gap-1.5 rounded-full border bg-background px-3 py-1 text-xs font-medium text-muted-foreground shadow-sm">
            <GraduationCap className="size-3.5 text-primary" /> Built for students in Bangladesh
          </span>
          <h1 className="text-4xl font-semibold tracking-tight text-balance">
            Learn English, one clear lesson at a time
          </h1>
          <p className="max-w-xl text-lg text-muted-foreground text-balance">
            SSC, HSC, University, IELTS, Spoken English, Grammar, and Vocabulary — built for
            students in Bangladesh.
          </p>
          <SearchBox className="w-full max-w-lg" />
          <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="size-4 text-primary" /> Free lessons
            </span>
            <span className="flex items-center gap-1.5">
              <Languages className="size-4 text-primary" /> Bangla explanations
            </span>
            <span className="flex items-center gap-1.5">
              <Zap className="size-4 text-primary" /> Instant-feedback quizzes
            </span>
          </div>
        </div>
      </section>

      <Section title="Learning Categories" icon={LayoutGrid}>
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

      <section className="mx-auto w-full max-w-6xl px-4 pb-16">
        <div className="flex flex-col items-center gap-3 rounded-xl border bg-gradient-to-br from-primary/10 via-muted/30 to-background px-6 py-10 text-center">
          <span className="flex size-10 items-center justify-center rounded-full bg-primary/10 text-primary">
            <Rocket className="size-5" />
          </span>
          <h2 className="text-xl font-semibold tracking-tight">Ready to start learning?</h2>
          <Link href="/register" className={buttonVariants()}>
            Create a free account <ArrowRight />
          </Link>
        </div>
      </section>
    </div>
  );
}
