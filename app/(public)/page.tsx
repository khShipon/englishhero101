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

export const metadata: Metadata = {
  title: "EnglishHero101 — Learn English Online",
  description:
    "SSC, HSC, University, IELTS, Spoken English, Grammar, and Vocabulary lessons for students in Bangladesh.",
};

function Section({
  title,
  viewAllHref,
  children,
}: {
  title: string;
  viewAllHref?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="mx-auto w-full max-w-6xl px-4 py-10">
      <div className="mb-5 flex items-center justify-between">
        <h2 className="text-xl font-semibold tracking-tight">{title}</h2>
        {viewAllHref && (
          <Link href={viewAllHref} className="text-sm font-medium text-primary hover:underline">
            View all
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
      <section className="border-b bg-muted/30">
        <div className="mx-auto flex max-w-3xl flex-col items-center gap-6 px-4 py-20 text-center">
          <h1 className="text-4xl font-semibold tracking-tight text-balance">
            Learn English, one clear lesson at a time
          </h1>
          <p className="max-w-xl text-lg text-muted-foreground text-balance">
            SSC, HSC, University, IELTS, Spoken English, Grammar, and Vocabulary — built for
            students in Bangladesh.
          </p>
          <SearchBox className="w-full max-w-lg" />
        </div>
      </section>

      <Section title="Learning Categories">
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
          {publishedCategories.map((category) => (
            <CategoryCard key={category.id} node={category} href={`/${category.slug}`} />
          ))}
        </div>
      </Section>

      {featuredLessons.length > 0 && (
        <Section title="Featured Lessons">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {featuredLessons.map((lesson) => (
              <LessonCard key={lesson.id} lesson={lesson} />
            ))}
          </div>
        </Section>
      )}

      {recentLessons.length > 0 && (
        <Section title="Latest Lessons">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {recentLessons.map((lesson) => (
              <LessonCard key={lesson.id} lesson={lesson} />
            ))}
          </div>
        </Section>
      )}

      {vocabulary.length > 0 && (
        <Section title="Popular Vocabulary" viewAllHref="/vocabulary">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {vocabulary.map((entry) => (
              <VocabularyCard key={entry.id} entry={entry} />
            ))}
          </div>
        </Section>
      )}

      {questionSets.length > 0 && (
        <Section title="Question Practice">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {questionSets.map((set) => (
              <QuestionSetCard key={set.id} questionSet={set} />
            ))}
          </div>
        </Section>
      )}

      <section className="mx-auto w-full max-w-6xl px-4 pb-16">
        <div className="flex flex-col items-center gap-3 rounded-xl border bg-muted/30 px-6 py-10 text-center">
          <h2 className="text-xl font-semibold tracking-tight">Ready to start learning?</h2>
          <Link href="/register" className={buttonVariants()}>
            Create a free account
          </Link>
        </div>
      </section>
    </div>
  );
}
