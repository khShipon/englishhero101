import type { Metadata } from "next";
import { Suspense } from "react";
import Link from "next/link";
import { getRatingSummary, getRecentRatings, getMyRating } from "@/lib/queries/ratings";
import { getCurrentUser } from "@/lib/auth/dal";
import { RatingStars } from "@/components/public/rating-stars";
import { RatingForm } from "@/components/public/rating-form";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { MessageSquareQuote, Star } from "lucide-react";

export const metadata: Metadata = {
  title: "Student Reviews — EnglishHero101",
  description: "See what students say about EnglishHero101, and leave your own review.",
  alternates: { canonical: "/reviews" },
};

// Reads the session cookie to prefill the form with the visitor's own
// existing rating — isolated behind Suspense so the summary/list above
// (cached, public) can stay part of the static shell.
async function RatingFormSection() {
  const user = await getCurrentUser();

  if (!user) {
    return (
      <div className="flex flex-col items-start gap-3 rounded-2xl border p-5">
        <h3 className="font-semibold">Rate EnglishHero101</h3>
        <p className="text-sm text-muted-foreground">Log in to leave a star rating and review.</p>
        <Link
          href="/login"
          className={cn(buttonVariants(), "rounded-full bg-brand-orange text-brand-orange-foreground hover:bg-brand-orange/90")}
        >
          Login to review
        </Link>
      </div>
    );
  }

  const mine = await getMyRating(user.id);
  return <RatingForm initialRating={mine?.rating} initialComment={mine?.comment} />;
}

function RatingFormFallback() {
  return <div className="h-48 animate-pulse rounded-2xl border bg-muted/30" />;
}

export default async function ReviewsPage() {
  const [summary, ratings] = await Promise.all([getRatingSummary(), getRecentRatings(30)]);

  return (
    <div className="mx-auto w-full max-w-4xl px-4 py-10">
      <div className="mb-8 flex flex-col items-center gap-2 text-center">
        <span className="flex items-center gap-2 text-xs font-bold tracking-[0.2em] text-brand-orange uppercase">
          <MessageSquareQuote className="size-3.5" /> Student Reviews
        </span>
        <h1 className="text-3xl font-extrabold tracking-tight text-brand-navy dark:text-white">
          What students say
        </h1>
        {summary.count > 0 ? (
          <div className="mt-1 flex flex-col items-center gap-1">
            <span className="flex items-center gap-2">
              <span className="text-3xl font-extrabold">{summary.average.toFixed(1)}</span>
              <RatingStars value={summary.average} className="size-5" />
            </span>
            <span className="text-sm text-muted-foreground">
              Based on {summary.count} {summary.count === 1 ? "review" : "reviews"}
            </span>
          </div>
        ) : (
          <p className="text-muted-foreground">No reviews yet — be the first to rate us.</p>
        )}
      </div>

      <div className="mb-10">
        <Suspense fallback={<RatingFormFallback />}>
          <RatingFormSection />
        </Suspense>
      </div>

      {ratings.length > 0 && (
        <div className="flex flex-col gap-4">
          {ratings.map((review) => (
            <div key={review.id} className="rounded-xl border p-4">
              <div className="flex items-center justify-between gap-2">
                <RatingStars value={review.rating} />
                <span className="text-xs text-muted-foreground">
                  {new Date(review.createdAt).toLocaleDateString(undefined, {
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                  })}
                </span>
              </div>
              {review.comment ? (
                <p className="mt-2 text-sm text-muted-foreground">{review.comment}</p>
              ) : (
                <p className="mt-2 flex items-center gap-1 text-sm text-muted-foreground italic">
                  <Star className="size-3.5" /> Rated the platform
                </p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
