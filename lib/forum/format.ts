// Shared between forum queries (lib/queries/forum.ts,
// lib/queries/forum-notifications.ts) and forum UI components — a
// forum author is only ever exposed as { id, full_name } (see
// get_forum_authors() in the 039_forum.sql migration), never email,
// so display name and initials both derive from full_name alone.

export function displayName(fullName: string | null): string {
  return fullName?.trim() || "A student";
}

export function initialsFromName(fullName: string | null): string {
  const trimmed = fullName?.trim();
  if (!trimmed) return "S";
  const parts = trimmed.split(/\s+/);
  return (parts[0][0] + (parts[1]?.[0] ?? "")).toUpperCase();
}

// Rendered only from Server Components (post/reply cards), never from
// a "use client" component — Date.now() at server-render time would
// otherwise drift from the client's clock at hydration time and throw
// a hydration mismatch on second/minute boundaries.
export function formatRelativeTime(iso: string): string {
  const date = new Date(iso);
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000);

  if (seconds < 60) return "just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d`;
  const weeks = Math.floor(days / 7);
  if (weeks < 5) return `${weeks}w`;

  return date.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: date.getFullYear() === new Date().getFullYear() ? undefined : "numeric",
  });
}
