import { GraduationCap } from "lucide-react";
import { cn } from "@/lib/utils";

// The site wordmark as live text (colored per-segment) rather than a
// rasterized logo image, so it stays crisp at any size and adapts to
// dark mode without needing a second asset.
export function BrandLogo({
  className,
  iconClassName,
  inverted = false,
}: {
  className?: string;
  iconClassName?: string;
  /** Use on a permanently-dark surface (e.g. the navy footer) where the
   * "English" segment can't rely on dark-mode to stay legible. */
  inverted?: boolean;
}) {
  return (
    <span className={cn("flex shrink-0 items-center gap-1.5", className)}>
      <span
        className={cn(
          "flex size-8 items-center justify-center rounded-lg bg-brand-navy text-white",
          iconClassName,
        )}
      >
        <GraduationCap className="size-4.5" />
      </span>
      <span className="text-lg font-extrabold tracking-tight">
        <span className={inverted ? "text-white" : "text-brand-navy dark:text-white"}>English</span>
        <span className="text-brand-blue">Hero</span>
        <span className="text-brand-orange">101</span>
      </span>
    </span>
  );
}
