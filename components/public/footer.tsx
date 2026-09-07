import Link from "next/link";
import { cacheLife } from "next/cache";
import { getChildren } from "@/lib/queries/content";
import { BrandLogo } from "@/components/public/brand-logo";
import { Home, LogIn, Search } from "lucide-react";

export async function Footer() {
  "use cache";
  cacheLife("days");

  const categories = await getChildren(null);

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

        <div className="flex flex-col gap-3">
          <h3 className="text-sm font-semibold text-white">Get Started</h3>
          <p className="text-sm text-white/60">
            Create a free account to track your progress and save your favorite lessons.
          </p>
          <Link
            href="/register"
            className="inline-flex w-fit items-center rounded-full bg-brand-orange px-4 py-2 text-sm font-medium text-brand-orange-foreground hover:bg-brand-orange/90"
          >
            Sign Up Free
          </Link>
        </div>
      </div>

      <div className="border-t border-white/10">
        <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-5 text-sm text-white/50 sm:flex-row sm:items-center sm:justify-between">
          <p>&copy; {new Date().getFullYear()} EnglishHero101. All rights reserved.</p>
          <nav className="flex items-center gap-4">
            <Link href="/" className="flex items-center gap-1.5 hover:text-white">
              <Home className="size-3.5" /> Home
            </Link>
            <Link href="/search" className="flex items-center gap-1.5 hover:text-white">
              <Search className="size-3.5" /> Search
            </Link>
            <Link href="/login" className="flex items-center gap-1.5 hover:text-white">
              <LogIn className="size-3.5" /> Login
            </Link>
          </nav>
        </div>
      </div>
    </footer>
  );
}
