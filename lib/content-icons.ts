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
