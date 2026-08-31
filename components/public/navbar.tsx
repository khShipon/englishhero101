import { Suspense } from "react";
import Link from "next/link";
import { getChildren } from "@/lib/queries/content";
import { getCurrentUser } from "@/lib/auth/dal";
import { SearchBox } from "@/components/public/search-box";
import { MobileNav } from "@/components/public/mobile-nav";
import { ThemeToggle } from "@/components/theme-toggle";
import { buttonVariants } from "@/components/ui/button";
import { CATEGORY_ICONS, DEFAULT_CATEGORY_ICON } from "@/lib/content-icons";
import { ClipboardList, GraduationCap, Home, User } from "lucide-react";
import { cn } from "@/lib/utils";

// Reads the session cookie, so it's the one part of the navbar that
// can't be part of the static shell — isolated behind its own
// Suspense boundary (see AuthLink below) so the categories list and
// the rest of the page can still be cached/prerendered.
async function AuthLink() {
  const user = await getCurrentUser();
  return (
    <Link
      href={user ? "/profile" : "/login"}
      className={cn(buttonVariants({ variant: "outline", size: "sm" }), "shrink-0")}
    >
      <User /> {user ? "Profile" : "Login"}
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
  const categories = await getChildren(null);
  const publishedCategories = categories.filter((category) => category.isPublished);

  return (
    <header className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur-xs supports-backdrop-filter:bg-background/60">
      <div className="mx-auto flex h-14 max-w-6xl items-center gap-3 px-4">
        <MobileNav categories={publishedCategories} />
        <Link href="/" className="flex shrink-0 items-center gap-1.5 text-lg font-semibold tracking-tight">
          <GraduationCap className="size-5 text-primary" />
          EnglishHero101
        </Link>
        {/* Switches over at lg (1024px), not md (768px) — at tablet
            width, 7+ category links plus search plus login don't fit
            no matter how tight the spacing, so tablets keep the mobile
            drawer nav. overflow-x-auto is a defensive fallback: if an
            admin adds enough top-level categories to overflow even a
            wide desktop viewport, the nav scrolls horizontally instead
            of breaking the page layout. */}
        <nav className="hidden min-w-0 flex-1 items-center gap-1 overflow-x-auto lg:flex">
          <Link
            href="/"
            className="flex shrink-0 items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground"
          >
            <Home className="size-3.5" /> Home
          </Link>
          <Link
            href="/question-banks"
            className="flex shrink-0 items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground"
          >
            <ClipboardList className="size-3.5" /> Question Banks
          </Link>
          {publishedCategories.map((category) => {
            const Icon = CATEGORY_ICONS[category.slug] ?? DEFAULT_CATEGORY_ICON;
            return (
              <Link
                key={category.id}
                href={`/${category.slug}`}
                className="flex shrink-0 items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground"
              >
                <Icon className="size-3.5" /> {category.title}
              </Link>
            );
          })}
        </nav>
        <SearchBox className="hidden max-w-xs shrink-0 lg:block" />
        <ThemeToggle className="hidden shrink-0 items-center justify-center rounded-lg p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground sm:flex" />
        <Suspense fallback={<AuthLinkFallback />}>
          <AuthLink />
        </Suspense>
      </div>
    </header>
  );
}
