import type { Metadata } from "next";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";

export const metadata: Metadata = { title: "Link expired — EnglishHero101" };

export default function AuthCodeErrorPage() {
  return (
    <div className="flex flex-1 items-center justify-center px-4 py-12">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle>Link expired or invalid</CardTitle>
        </CardHeader>
        <CardContent>
          <Alert variant="destructive">
            <AlertDescription>
              This confirmation link is no longer valid. Please{" "}
              <Link href="/login" className="underline">
                log in
              </Link>{" "}
              or request a new link.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    </div>
  );
}
