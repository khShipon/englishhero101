import Link from "next/link";
import { cacheLife } from "next/cache";
import { GraduationCap, Home, LogIn, Search } from "lucide-react";

export async function Footer() {
  "use cache";
  cacheLife("days");

  return (
    <footer className="border-t bg-muted/30">
      <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-8 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
        <p className="flex items-center gap-1.5">
          <GraduationCap className="size-4 text-primary" />
          &copy; {new Date().getFullYear()} EnglishHero101. All rights reserved.
        </p>
        <nav className="flex items-center gap-4">
          <Link href="/" className="flex items-center gap-1.5 hover:text-foreground">
            <Home className="size-3.5" /> Home
          </Link>
          <Link href="/search" className="flex items-center gap-1.5 hover:text-foreground">
            <Search className="size-3.5" /> Search
          </Link>
          <Link href="/login" className="flex items-center gap-1.5 hover:text-foreground">
            <LogIn className="size-3.5" /> Login
          </Link>
        </nav>
      </div>
    </footer>
  );
}
