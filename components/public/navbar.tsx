import { Suspense } from "react";
import Link from "next/link";
import { getPublishedContentTree } from "@/lib/queries/content";
import { getCurrentUser } from "@/lib/auth/dal";
import { SearchBox } from "@/components/public/search-box";
import { MobileNav } from "@/components/public/mobile-nav";
import { NavCategoryLink } from "@/components/public/nav-category-link";
import { ProfileMenu } from "@/components/public/profile-menu";
import { ThemeToggle } from "@/components/theme-toggle";
import { buttonVariants } from "@/components/ui/button";
import { GraduationCap, User } from "lucide-react";
import { cn } from "@/lib/utils";

// Reads the session cookie, so it's the one part of the navbar that
// can't be part of the static shell — isolated behind its own
// Suspense boundary (see AuthLink below) so the categories list and
// the rest of the page can still be cached/prerendered.
async function AuthLink() {
  const user = await getCurrentUser();
  if (user) {
    return <ProfileMenu fullName={user.fullName} email={user.email} />;
  }
  return (
    <Link href="/login" className={cn(buttonVariants({ variant: "outline", size: "sm" }), "shrink-0")}>
      <User /> Login
    </Link>
  );
}

function AuthLinkFallback() {
  return (
    <span
      aria-hidden
      className={cn(buttonVariants({ variant: "outline", size: "sm" }), "shrink-0 opacity-0")}
    >
      <User /> Login
    </span>
  );
}

export async function Navbar() {
  // Roots of the published tree — same top-level categories getChildren(null)
  // used to return, but with each category's own children attached so the
  // desktop nav can show them as a hover dropdown (e.g. IELTS ->
  // Listening/Reading/Writing/Speaking) instead of a flat list.
  const categories = await getPublishedContentTree();

  return (
    <header className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur-xs supports-backdrop-filter:bg-background/60">
      <div className="mx-auto flex h-14 max-w-[1800px] items-center gap-2 px-3 lg:px-4 2xl:gap-3 2xl:px-6">
        <MobileNav categories={categories} />
        <Link href="/" className="flex shrink-0 items-center gap-1.5 text-lg font-semibold tracking-tight">
          <GraduationCap className="size-5 text-primary" />
          EnglishHero101
        </Link>
        {/* Switches over at lg (1024px), not md (768px) — at tablet
            width, 7+ category links plus search plus login don't fit
            no matter how tight the spacing, so tablets keep the mobile
            drawer nav. The container is nearly full-width (not capped
            to the page's usual max-w-6xl) specifically to give this
            row room to breathe; overflow-x-auto stays only as a
            defensive fallback for an admin adding enough top-level
            categories to overflow even that. */}
        <nav className="hidden min-w-0 flex-1 items-center overflow-x-auto lg:flex">
          <Link
            href="/"
            className="flex shrink-0 items-center rounded-lg px-1 py-1.5 text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground"
          >
            Home
          </Link>
          <Link
            href="/question-banks"
            className="flex shrink-0 items-center rounded-lg px-1 py-1.5 text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground"
          >
            Question Banks
          </Link>
          {categories.map((category) => (
            <NavCategoryLink key={category.id} category={category} />
          ))}
        </nav>
        <SearchBox className="hidden w-24 shrink-0 transition-[width] duration-200 ease-out focus-within:w-72 lg:block 2xl:w-28" />
        <ThemeToggle className="hidden shrink-0 items-center justify-center rounded-lg p-1 text-muted-foreground hover:bg-muted hover:text-foreground sm:flex" />
        <Suspense fallback={<AuthLinkFallback />}>
          <AuthLink />
        </Suspense>
      </div>
    </header>
  );
}
