import Link from "next/link";
import { getCurrentUser } from "@/lib/auth/dal";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ArrowRight, Rocket } from "lucide-react";

// Reads the session cookie to decide between a "sign up" and a
// "welcome back" pitch — isolated so callers can wrap it in Suspense
// and keep the rest of the page part of the static shell, same
// pattern as Navbar's AuthLink.
export async function FinalCta({
  loggedOutHeading = "Ready to start learning?",
  loggedOutSubtext = "Join EnglishHero101 today and get instant access to every lesson, quiz, and vocabulary list.",
}: {
  loggedOutHeading?: string;
  loggedOutSubtext?: string;
}) {
  const user = await getCurrentUser();

  return (
    <section className="mx-auto w-full max-w-6xl px-4 pb-16">
      <div className="flex flex-col items-center gap-3 rounded-2xl bg-gradient-to-br from-brand-orange/10 via-blue-50 to-background px-6 py-12 text-center dark:from-brand-orange/10 dark:via-blue-950/10">
        <span className="flex size-11 items-center justify-center rounded-full bg-brand-navy text-white">
          <Rocket className="size-5" />
        </span>
        {user ? (
          <>
            <h2 className="text-2xl font-extrabold tracking-tight text-brand-navy dark:text-white">
              Welcome back{user.fullName ? `, ${user.fullName.split(" ")[0]}` : ""}!
            </h2>
            <p className="max-w-md text-sm text-muted-foreground">
              Pick up right where you left off — your lessons and progress are waiting.
            </p>
            <Link
              href="/profile"
              className={cn(
                buttonVariants({ size: "lg" }),
                "mt-2 rounded-full bg-brand-orange px-6 text-brand-orange-foreground hover:bg-brand-orange/90",
              )}
            >
              Go to your dashboard <ArrowRight />
            </Link>
          </>
        ) : (
          <>
            <h2 className="text-2xl font-extrabold tracking-tight text-brand-navy dark:text-white">
              {loggedOutHeading}
            </h2>
            <p className="max-w-md text-sm text-muted-foreground">{loggedOutSubtext}</p>
            <Link
              href="/register"
              className={cn(
                buttonVariants({ size: "lg" }),
                "mt-2 rounded-full bg-brand-orange px-6 text-brand-orange-foreground hover:bg-brand-orange/90",
              )}
            >
              Create a free account <ArrowRight />
            </Link>
          </>
        )}
      </div>
    </section>
  );
}

export function FinalCtaFallback() {
  return (
    <section className="mx-auto w-full max-w-6xl px-4 pb-16">
      <div className="h-56 animate-pulse rounded-2xl bg-muted/30" />
    </section>
  );
}
