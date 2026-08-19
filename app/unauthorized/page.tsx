import type { Metadata } from "next";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";

export const metadata: Metadata = { title: "Unauthorized — EnglishHero101" };

export default function UnauthorizedPage() {
  return (
    <div className="flex flex-1 items-center justify-center px-4 py-12">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle>Access denied</CardTitle>
        </CardHeader>
        <CardContent>
          <Alert variant="destructive">
            <AlertDescription>
              You don&apos;t have permission to view this page.{" "}
              <Link href="/" className="underline">
                Return home
              </Link>
              .
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    </div>
  );
}
