// Deterministic avatar background color from a user id — the same
// person always gets the same color (stable across the navbar,
// dashboard, and forum), while different people land on different
// colors so a feed of many authors' initials stays distinguishable.
const AVATAR_COLORS = [
  "bg-blue-600",
  "bg-emerald-600",
  "bg-purple-600",
  "bg-orange-500",
  "bg-pink-500",
  "bg-teal-600",
  "bg-indigo-600",
  "bg-rose-500",
  "bg-amber-600",
  "bg-cyan-600",
];

export function avatarColorClass(id: string): string {
  let hash = 0;
  for (let i = 0; i < id.length; i++) {
    hash = (hash * 31 + id.charCodeAt(i)) >>> 0;
  }
  return AVATAR_COLORS[hash % AVATAR_COLORS.length];
}
