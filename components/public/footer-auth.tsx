import Link from "next/link";
import { getCurrentUser } from "@/lib/auth/dal";
import { LogIn, User } from "lucide-react";

// Reads the session cookie — isolated behind Suspense (see footer.tsx)
// so the rest of the footer, which is fully "use cache", isn't forced
// dynamic just because these two spots need to know if anyone's
// logged in.
export async function FooterGetStarted() {
  const user = await getCurrentUser();

  if (user) {
    return (
      <div className="flex flex-col gap-3">
        <h3 className="text-sm font-semibold text-white">Welcome back</h3>
        <p className="text-sm text-white/60">
          Jump back into your lessons and continue your progress.
        </p>
        <Link
          href="/profile"
          className="inline-flex w-fit items-center rounded-full bg-brand-orange px-4 py-2 text-sm font-medium text-brand-orange-foreground hover:bg-brand-orange/90"
        >
          Go to your dashboard
        </Link>
      </div>
    );
  }

  return (
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
  );
}

export function FooterGetStartedFallback() {
  return <div className="h-28 w-full animate-pulse rounded-lg bg-white/5" />;
}

export async function FooterAuthLink() {
  const user = await getCurrentUser();

  if (user) {
    return (
      <Link href="/profile" className="flex items-center gap-1.5 hover:text-white">
        <User className="size-3.5" /> Profile
      </Link>
    );
  }

  return (
    <Link href="/login" className="flex items-center gap-1.5 hover:text-white">
      <LogIn className="size-3.5" /> Login
    </Link>
  );
}

export function FooterAuthLinkFallback() {
  return (
    <span aria-hidden className="flex items-center gap-1.5 opacity-0">
      <LogIn className="size-3.5" /> Login
    </span>
  );
}
