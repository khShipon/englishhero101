"use client";

import { useState } from "react";
import { CircleCheck, X } from "lucide-react";

// A one-time flash confirming signup worked, shown when the profile
// page is reached via /profile?welcome=1 (see register() in
// lib/auth/actions.ts). Dismissing it also drops the query param so a
// refresh doesn't bring it back.
export function WelcomeBanner() {
  const [dismissed, setDismissed] = useState(false);
  if (dismissed) return null;

  return (
    <div className="flex items-center justify-between gap-3 rounded-lg border border-emerald-600/30 bg-emerald-600/10 px-4 py-3 text-sm text-emerald-700 dark:text-emerald-400">
      <span className="flex items-center gap-2">
        <CircleCheck className="size-4 shrink-0" />
        Signed up successfully — welcome to EnglishHero101!
      </span>
      <button
        type="button"
        aria-label="Dismiss"
        onClick={() => {
          setDismissed(true);
          window.history.replaceState(null, "", "/profile");
        }}
        className="shrink-0 text-emerald-700/70 hover:text-emerald-700 dark:text-emerald-400/70 dark:hover:text-emerald-400"
      >
        <X className="size-4" />
      </button>
    </div>
  );
}
