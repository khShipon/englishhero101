"use client";

import { useActionState, useState } from "react";
import { submitRating, type RatingFormState } from "@/lib/ratings-actions";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Star, Check } from "lucide-react";
import { cn } from "@/lib/utils";

export function RatingForm({
  initialRating,
  initialComment,
}: {
  initialRating?: number;
  initialComment?: string | null;
}) {
  const [state, formAction, pending] = useActionState<RatingFormState, FormData>(submitRating, undefined);
  const [rating, setRating] = useState(initialRating ?? 0);
  const [hover, setHover] = useState(0);

  return (
    <form action={formAction} className="flex flex-col gap-3 rounded-2xl border p-5">
      <h3 className="font-semibold">{initialRating ? "Update your review" : "Rate EnglishHero101"}</h3>
      <input type="hidden" name="rating" value={rating} />
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((n) => (
          <button
            key={n}
            type="button"
            aria-label={`${n} star${n > 1 ? "s" : ""}`}
            onMouseEnter={() => setHover(n)}
            onMouseLeave={() => setHover(0)}
            onClick={() => setRating(n)}
          >
            <Star
              className={cn(
                "size-7 transition-colors",
                (hover || rating) >= n ? "fill-brand-orange text-brand-orange" : "text-muted-foreground/30",
              )}
            />
          </button>
        ))}
      </div>
      {state?.fieldErrors?.rating && <p className="text-sm text-destructive">{state.fieldErrors.rating[0]}</p>}

      <Textarea
        name="comment"
        placeholder="Share your experience (optional)"
        defaultValue={initialComment ?? ""}
        rows={3}
        maxLength={500}
      />
      {state?.fieldErrors?.comment && (
        <p className="text-sm text-destructive">{state.fieldErrors.comment[0]}</p>
      )}

      {state?.error && (
        <Alert variant="destructive">
          <AlertDescription>{state.error}</AlertDescription>
        </Alert>
      )}

      <div className="flex items-center gap-3">
        <Button
          type="submit"
          disabled={pending || rating === 0}
          className="w-fit rounded-full bg-brand-orange text-brand-orange-foreground hover:bg-brand-orange/90"
        >
          {pending ? "Saving..." : initialRating ? "Update review" : "Submit review"}
        </Button>
        {state?.success && (
          <span className="flex items-center gap-1 text-sm font-medium text-emerald-600">
            <Check className="size-4" /> Saved
          </span>
        )}
      </div>
    </form>
  );
}
