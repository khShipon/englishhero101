import type { Metadata } from "next";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { ResetPasswordForm } from "@/components/auth/reset-password-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";

export const metadata: Metadata = { title: "Reset password — EnglishHero101" };

export default async function ResetPasswordPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Link expired</CardTitle>
        </CardHeader>
        <CardContent>
          <Alert variant="destructive">
            <AlertDescription>
              This password reset link is invalid or has expired.{" "}
              <Link href="/forgot-password" className="underline">
                Request a new one
              </Link>
              .
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  return <ResetPasswordForm />;
}
