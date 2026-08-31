import {
  LayoutDashboard,
  FolderTree,
  CircleQuestionMark,
  BookOpen,
  Users,
  Settings,
  GraduationCap,
  School,
} from "lucide-react";

export const ADMIN_NAV_ITEMS = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard, exact: true, adminOnly: false },
  {
    href: "/admin/ielts",
    label: "IELTS",
    icon: GraduationCap,
    exact: false,
    adminOnly: false,
  },
  {
    href: "/admin/ssc-hsc",
    label: "SSC / HSC",
    icon: School,
    exact: false,
    adminOnly: false,
  },
  { href: "/admin/content", label: "Content", icon: FolderTree, exact: false, adminOnly: false },
  {
    href: "/admin/question-banks",
    label: "Question Banks",
    icon: CircleQuestionMark,
    exact: false,
    adminOnly: false,
  },
  { href: "/admin/vocabulary", label: "Vocabulary", icon: BookOpen, exact: false, adminOnly: false },
  { href: "/admin/users", label: "Users", icon: Users, exact: false, adminOnly: true },
  { href: "/admin/settings", label: "Settings", icon: Settings, exact: false, adminOnly: true },
] as const;
