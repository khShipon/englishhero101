import {
  School,
  GraduationCap,
  Landmark,
  MessagesSquare,
  BookOpen,
  BookOpenText,
  SpellCheck,
  Globe2,
  FolderOpen,
  Headphones,
  PenLine,
  Mic,
  type LucideIcon,
} from "lucide-react";

// Top-level category slugs are a small, fixed set seeded in
// supabase/migrations/004_seed_data.sql — mapped here rather than
// stored on content_nodes.icon (which exists but is never set) since
// that would mean teaching non-technical admins to pick icon names by
// hand. Anything outside this set (a new category, or any deeper
// section/topic node) falls back to a generic folder icon.
export const CATEGORY_ICONS: Record<string, LucideIcon> = {
  "ssc-english": School,
  "hsc-english": GraduationCap,
  "university-english": Landmark,
  "spoken-english": MessagesSquare,
  vocabulary: BookOpen,
  grammar: SpellCheck,
  ielts: Globe2,
  // IELTS's own 4 sections — common enough, and prominent enough on
  // the IELTS category page, to be worth distinct icons too, rather
  // than every one of them falling back to the generic folder icon.
  listening: Headphones,
  reading: BookOpenText,
  writing: PenLine,
  speaking: Mic,
};

// A plain map lookup (not a function call) so callers can write
// `const Icon = CATEGORY_ICONS[slug] ?? DEFAULT_CATEGORY_ICON` inline
// in their render body without tripping the
// react-hooks/static-components lint rule, which flags components
// resolved via a function call as "created during render".
export const DEFAULT_CATEGORY_ICON: LucideIcon = FolderOpen;

export type CategoryColor = {
  bg: string;
  iconBg: string;
  ring: string;
  text: string;
};

// Same fixed slug set as CATEGORY_ICONS, mapped to the pastel-card /
// solid-icon color pairing used on the homepage's category grid and
// feature strip — purely cosmetic, so an unmapped slug just falls back
// to DEFAULT_CATEGORY_COLOR instead of erroring.
export const CATEGORY_COLORS: Record<string, CategoryColor> = {
  "ssc-english": {
    bg: "bg-blue-50 dark:bg-blue-950/30",
    iconBg: "bg-blue-600",
    ring: "hover:ring-blue-200 dark:hover:ring-blue-900",
    text: "text-blue-600 dark:text-blue-400",
  },
  "hsc-english": {
    bg: "bg-orange-50 dark:bg-orange-950/30",
    iconBg: "bg-orange-500",
    ring: "hover:ring-orange-200 dark:hover:ring-orange-900",
    text: "text-orange-600 dark:text-orange-400",
  },
  "university-english": {
    bg: "bg-indigo-50 dark:bg-indigo-950/30",
    iconBg: "bg-indigo-600",
    ring: "hover:ring-indigo-200 dark:hover:ring-indigo-900",
    text: "text-indigo-600 dark:text-indigo-400",
  },
  "spoken-english": {
    bg: "bg-teal-50 dark:bg-teal-950/30",
    iconBg: "bg-teal-600",
    ring: "hover:ring-teal-200 dark:hover:ring-teal-900",
    text: "text-teal-600 dark:text-teal-400",
  },
  vocabulary: {
    bg: "bg-pink-50 dark:bg-pink-950/30",
    iconBg: "bg-pink-500",
    ring: "hover:ring-pink-200 dark:hover:ring-pink-900",
    text: "text-pink-600 dark:text-pink-400",
  },
  grammar: {
    bg: "bg-emerald-50 dark:bg-emerald-950/30",
    iconBg: "bg-emerald-600",
    ring: "hover:ring-emerald-200 dark:hover:ring-emerald-900",
    text: "text-emerald-600 dark:text-emerald-400",
  },
  ielts: {
    bg: "bg-purple-50 dark:bg-purple-950/30",
    iconBg: "bg-purple-600",
    ring: "hover:ring-purple-200 dark:hover:ring-purple-900",
    text: "text-purple-600 dark:text-purple-400",
  },
};

export const DEFAULT_CATEGORY_COLOR: CategoryColor = {
  bg: "bg-slate-50 dark:bg-slate-900/40",
  iconBg: "bg-slate-600",
  ring: "hover:ring-slate-200 dark:hover:ring-slate-800",
  text: "text-slate-600 dark:text-slate-400",
};
