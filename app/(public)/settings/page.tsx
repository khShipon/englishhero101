import type { Metadata } from "next";
import Link from "next/link";
import { requireUser } from "@/lib/auth/dal";
import { ThemeToggle } from "@/components/theme-toggle";
import { SignOutButton } from "@/components/auth/sign-out-button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { buttonVariants } from "@/components/ui/button";
import { ArrowLeft, Palette, User } from "lucide-react";
import { cn } from "@/lib/utils";

export const metadata: Metadata = { title: "Settings — EnglishHero101" };

// Per-user, no static shell to gain — same reasoning as /profile.
export const instant = false;

export default async function SettingsPage() {
  const user = await requireUser();
  const roleLabel = user.role.charAt(0).toUpperCase() + user.role.slice(1);

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-6 px-4 py-12">
      <div>
        <Link
          href="/profile"
          className="mb-2 flex w-fit items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="size-3.5" /> Back to profile
        </Link>
        <h1 className="text-2xl font-semibold tracking-tight">Settings</h1>
        <p className="text-sm text-muted-foreground">Your account and site preferences.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <User className="size-4" /> Profile
          </CardTitle>
          <CardDescription>
            Set when your account was created — get in touch if either needs to change.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-3 text-sm">
          <div className="flex items-center justify-between border-b pb-3">
            <span className="text-muted-foreground">Full name</span>
            <span className="font-medium">{user.fullName || "—"}</span>
          </div>
          <div className="flex items-center justify-between border-b pb-3">
            <span className="text-muted-foreground">Email</span>
            <span className="font-medium">{user.email}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Role</span>
            <span className="font-medium">{roleLabel}</span>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Palette className="size-4" /> Appearance
          </CardTitle>
          <CardDescription>Choose how EnglishHero101 looks on this device.</CardDescription>
        </CardHeader>
        <CardContent>
          <ThemeToggle
            showLabel
            className={cn(buttonVariants({ variant: "outline" }), "w-fit gap-2")}
          />
        </CardContent>
      </Card>

      <SignOutButton />
    </div>
  );
}
