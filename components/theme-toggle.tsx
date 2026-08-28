"use client";

import { useTheme } from "next-themes";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Check, Monitor, Moon, Sun, SunMoon } from "lucide-react";

const THEME_OPTIONS = [
  { value: "light", label: "Light", icon: Sun },
  { value: "dark", label: "Dark", icon: Moon },
  { value: "system", label: "System", icon: Monitor },
] as const;

// A static trigger icon (not swapped based on the resolved theme) so
// there's nothing for the server-rendered markup and the client's
// actual theme to disagree about — the correct .dark class is only
// known once next-themes reads localStorage/system preference on the
// client, so a trigger icon that depended on it would flash/mismatch.
export function ThemeToggle({
  className,
  showLabel = false,
}: {
  className?: string;
  showLabel?: boolean;
}) {
  const { theme, setTheme } = useTheme();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        aria-label="Change theme"
        className={
          className ??
          "flex size-8 items-center justify-center rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground"
        }
      >
        <SunMoon className="size-4" /> {showLabel && "Theme"}
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {THEME_OPTIONS.map(({ value, label, icon: Icon }) => (
          <button
            key={value}
            type="button"
            onClick={() => setTheme(value)}
            className="flex w-full cursor-default items-center gap-1.5 rounded-md px-1.5 py-1 text-left text-sm outline-hidden select-none hover:bg-accent hover:text-accent-foreground [&_svg]:size-4"
          >
            <Icon /> {label}
            {theme === value && <Check className="ml-auto size-3.5" />}
          </button>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
