import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

export function RatingStars({ value, className }: { value: number; className?: string }) {
  return (
    <span className="inline-flex items-center gap-0.5" aria-label={`${value} out of 5 stars`}>
      {[1, 2, 3, 4, 5].map((n) => (
        <Star
          key={n}
          className={cn(
            "size-4",
            n <= Math.round(value) ? "fill-brand-orange text-brand-orange" : "text-muted-foreground/30",
            className,
          )}
        />
      ))}
    </span>
  );
}
