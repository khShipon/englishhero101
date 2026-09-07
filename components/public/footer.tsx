import Link from "next/link";
import { Suspense } from "react";
import { cacheLife } from "next/cache";
import { getChildren } from "@/lib/queries/content";
import { BrandLogo } from "@/components/public/brand-logo";
import {
  FooterGetStarted,
  FooterGetStartedFallback,
  FooterAuthLink,
  FooterAuthLinkFallback,
} from "@/components/public/footer-auth";
import { Home, Search } from "lucide-react";

// `new Date()` is an "unstable value" under Cache Components and can't
// be read directly in a component that isn't itself "use cache" — cache
// just the year behind its own boundary instead (a day's staleness on
// the footer's copyright year is a non-issue).
async function getCopyrightYear() {
  "use cache";
  cacheLife("days");
  return new Date().getFullYear();
}

// Not "use cache" itself (unlike the old version of this component) —
// getChildren() below is already cached internally (see
// lib/queries/content.ts), and the two auth-aware pieces need to read
// the session cookie behind their own Suspense boundaries, which only
// works when they aren't nested inside a parent "use cache" scope.
// Same shape as Navbar/AuthLink.
export async function Footer() {
  const [categories, year] = await Promise.all([getChildren(null), getCopyrightYear()]);

  return (
    <footer className="border-t border-white/10 bg-brand-navy text-white/70">
      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-12 sm:grid-cols-2 lg:grid-cols-4">
        <div className="flex flex-col gap-3 sm:col-span-2 lg:col-span-1">
          <BrandLogo inverted iconClassName="bg-white/10" />
          <p className="max-w-xs text-sm text-white/60">
            Learn English • Prepare for Your Future. Free SSC, HSC, IELTS, Grammar, and Vocabulary
            lessons for students in Bangladesh.
          </p>
        </div>

        <div className="flex flex-col gap-3">
          <h3 className="text-sm font-semibold text-white">Quick Links</h3>
          <nav className="flex flex-col gap-2 text-sm">
            <Link href="/" className="hover:text-white">
              Home
            </Link>
            <Link href="/question-banks" className="hover:text-white">
              Question Banks
            </Link>
            <Link href="/vocabulary" className="hover:text-white">
              Vocabulary
            </Link>
            <Link href="/blog" className="hover:text-white">
              Blog
            </Link>
            <Link href="/about" className="hover:text-white">
              About
            </Link>
            <Link href="/reviews" className="hover:text-white">
              Reviews
            </Link>
            <Link href="/search" className="hover:text-white">
              Search
            </Link>
          </nav>
        </div>

        {categories.length > 0 && (
          <div className="flex flex-col gap-3">
            <h3 className="text-sm font-semibold text-white">Categories</h3>
            <nav className="flex flex-col gap-2 text-sm">
              {categories.slice(0, 6).map((category) => (
                <Link key={category.id} href={`/${category.slug}`} className="hover:text-white">
                  {category.title}
                </Link>
              ))}
            </nav>
          </div>
        )}

        <Suspense fallback={<FooterGetStartedFallback />}>
          <FooterGetStarted />
        </Suspense>
      </div>

      <div className="border-t border-white/10">
        <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-5 text-sm text-white/50 sm:flex-row sm:items-center sm:justify-between">
          <p>&copy; {year} EnglishHero101. All rights reserved.</p>
          <nav className="flex items-center gap-4">
            <Link href="/" className="flex items-center gap-1.5 hover:text-white">
              <Home className="size-3.5" /> Home
            </Link>
            <Link href="/search" className="flex items-center gap-1.5 hover:text-white">
              <Search className="size-3.5" /> Search
            </Link>
            <Suspense fallback={<FooterAuthLinkFallback />}>
              <FooterAuthLink />
            </Suspense>
          </nav>
        </div>
      </div>
    </footer>
  );
}
