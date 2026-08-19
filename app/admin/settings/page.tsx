import type { Metadata } from "next";
import { requireRole } from "@/lib/auth/dal";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const metadata: Metadata = { title: "Settings — Admin — EnglishHero101" };

export default async function AdminSettingsPage() {
  await requireRole(["admin"]);

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-semibold tracking-tight">Settings</h1>
      <Card>
        <CardHeader>
          <CardTitle>Coming soon</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Site-wide settings will live here once there&apos;s something concrete to configure.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
