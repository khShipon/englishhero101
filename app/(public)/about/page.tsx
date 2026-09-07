import type { Metadata } from "next";
import { Suspense } from "react";
import { FinalCta, FinalCtaFallback } from "@/components/public/final-cta";
import { BookOpen, GraduationCap, Heart, Languages, Target } from "lucide-react";

export const metadata: Metadata = {
  title: "About — EnglishHero101",
  description:
    "EnglishHero101 helps students in Bangladesh master English for SSC, HSC, IELTS and beyond with free, structured lessons.",
  alternates: { canonical: "/about" },
};

const VALUES = [
  {
    icon: Target,
    title: "Exam-focused",
    description: "Lessons and practice tests mapped directly to the SSC, HSC, and IELTS syllabi.",
  },
  {
    icon: Languages,
    title: "Bangla explanations",
    description: "Grammar and vocabulary explained in Bangla first, so nothing gets lost in translation.",
  },
  {
    icon: Heart,
    title: "Always free",
    description: "Every lesson, quiz, and vocabulary list is free — no paywalls, no hidden tiers.",
  },
];

export default function AboutPage() {
  return (
    <div className="flex flex-col">
      <section className="border-b bg-gradient-to-b from-blue-50/70 via-background to-background dark:from-blue-950/10">
        <div className="mx-auto flex max-w-3xl flex-col items-center gap-4 px-4 py-16 text-center">
          <span className="flex size-11 items-center justify-center rounded-full bg-brand-navy text-white">
            <GraduationCap className="size-5" />
          </span>
          <h1 className="text-4xl font-extrabold tracking-tight text-balance">
            <span className="text-brand-navy dark:text-white">About</span>{" "}
            <span className="text-brand-orange">EnglishHero101</span>
          </h1>
          <p className="max-w-xl text-lg text-muted-foreground text-balance">
            We&apos;re on a mission to make mastering English simple, structured, and free for every
            student in Bangladesh — from SSC and HSC to IELTS and beyond.
          </p>
        </div>
      </section>

      <section className="mx-auto w-full max-w-4xl px-4 py-14">
        <div className="grid gap-4 sm:grid-cols-3">
          {VALUES.map((value) => (
            <div key={value.title} className="flex flex-col gap-2 rounded-2xl border p-5">
              <span className="flex size-10 items-center justify-center rounded-lg bg-brand-navy/10 text-brand-navy dark:bg-brand-blue/15 dark:text-brand-blue">
                <value.icon className="size-5" />
              </span>
              <h3 className="font-semibold">{value.title}</h3>
              <p className="text-sm text-muted-foreground">{value.description}</p>
            </div>
          ))}
        </div>

        <div className="mt-12 flex flex-col gap-4">
          <h2 className="flex items-center gap-2 text-xl font-semibold tracking-tight">
            <BookOpen className="size-5 text-brand-orange" /> Our story
          </h2>
          <p className="text-muted-foreground">
            EnglishHero101 started as a simple idea: English shouldn&apos;t be the subject that
            holds students back from the results they&apos;re capable of. Board exams, admission
            tests, and IELTS all demand strong English — but good resources in Bangla-friendly,
            student-first form are hard to find.
          </p>
          <p className="text-muted-foreground">
            So we built a single place with clear, structured lessons for SSC and HSC English,
            IELTS preparation, grammar, spoken English, and vocabulary — each one broken into
            small, practical steps with practice questions to check understanding along the way.
          </p>
        </div>
      </section>

      <Suspense fallback={<FinalCtaFallback />}>
        <FinalCta
          loggedOutHeading="Start your English journey today"
          loggedOutSubtext="Create a free account to track your progress and save your favorite lessons."
        />
      </Suspense>
    </div>
  );
}
