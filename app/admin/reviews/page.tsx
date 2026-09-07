import type { Metadata } from "next";
import { getRatingSummary, getRecentRatings } from "@/lib/queries/ratings";
import { deleteRating } from "@/lib/admin/rating-actions";
import { RatingStars } from "@/components/public/rating-stars";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";

export const metadata: Metadata = { title: "Reviews — Admin — EnglishHero101" };

export default async function AdminReviewsPage() {
  const [summary, ratings] = await Promise.all([getRatingSummary(), getRecentRatings(200)]);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Reviews</h1>
        <p className="text-sm text-muted-foreground">
          {summary.count > 0
            ? `${summary.average.toFixed(1)} average from ${summary.count} review${summary.count === 1 ? "" : "s"}.`
            : "No reviews yet."}
        </p>
      </div>

      <Card>
        <CardContent className="flex flex-col gap-3">
          {ratings.length === 0 ? (
            <p className="py-8 text-center text-sm text-muted-foreground">No reviews yet.</p>
          ) : (
            ratings.map((review) => (
              <div
                key={review.id}
                className="flex items-start justify-between gap-4 rounded-lg border p-3"
              >
                <div className="flex flex-col gap-1">
                  <div className="flex items-center gap-2">
                    <RatingStars value={review.rating} />
                    <span className="text-xs text-muted-foreground">
                      {new Date(review.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  {review.comment && <p className="text-sm text-muted-foreground">{review.comment}</p>}
                </div>
                <form action={deleteRating}>
                  <input type="hidden" name="id" value={review.id} />
                  <Button type="submit" variant="ghost" size="icon-sm" aria-label="Delete review">
                    <Trash2 />
                  </Button>
                </form>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
}
