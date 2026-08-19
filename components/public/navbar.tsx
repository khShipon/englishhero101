import Link from "next/link";
import { getChildren } from "@/lib/queries/content";
import { getCurrentUser } from "@/lib/auth/dal";
import { SearchBox } from "@/components/public/search-box";
import { MobileNav } from "@/components/public/mobile-nav";
import { buttonVariants } from "@/components/ui/button";
import { User } from "lucide-react";
import { cn } from "@/lib/utils";

export async function Navbar() {
  const [categories, user] = await Promise.all([getChildren(null), getCurrentUser()]);
  const publishedCategories = categories.filter((category) => category.isPublished);

  return (
    <header className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur-xs supports-backdrop-filter:bg-background/60">
      <div className="mx-auto flex h-14 max-w-6xl items-center gap-3 px-4">
        <MobileNav categories={publishedCategories} />
        <Link href="/" className="shrink-0 text-lg font-semibold tracking-tight">
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
            className="shrink-0 rounded-lg px-2.5 py-1.5 text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground"
          >
            Home
          </Link>
          {publishedCategories.map((category) => (
            <Link
              key={category.id}
              href={`/${category.slug}`}
              className="shrink-0 rounded-lg px-2.5 py-1.5 text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground"
            >
              {category.title}
            </Link>
          ))}
        </nav>
        <SearchBox className="hidden max-w-xs shrink-0 lg:block" />
        <Link
          href={user ? "/profile" : "/login"}
          className={cn(buttonVariants({ variant: "outline", size: "sm" }), "shrink-0")}
        >
          <User /> {user ? "Profile" : "Login"}
        </Link>
      </div>
    </header>
  );
}
