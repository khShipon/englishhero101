import type { Metadata } from "next";
import { requireUser } from "@/lib/auth/dal";
import { ProfileForm } from "@/components/auth/profile-form";
import { SignOutButton } from "@/components/auth/sign-out-button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export const metadata: Metadata = { title: "Your profile — EnglishHero101" };

export default async function ProfilePage() {
  const user = await requireUser();
  const roleLabel = user.role.charAt(0).toUpperCase() + user.role.slice(1);

  return (
    <div className="mx-auto flex w-full max-w-lg flex-1 flex-col gap-6 px-4 py-12">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Your profile</h1>
        <p className="text-sm text-muted-foreground">Manage your account details.</p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Account</CardTitle>
          <CardDescription>
            {user.email} · {roleLabel}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ProfileForm fullName={user.fullName ?? ""} />
        </CardContent>
      </Card>
      <SignOutButton />
    </div>
  );
}
