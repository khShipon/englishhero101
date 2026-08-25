import type { Metadata } from "next";
import { Suspense } from "react";
import { LoginForm } from "@/components/auth/login-form";

export const metadata: Metadata = { title: "Log in — EnglishHero101" };

async function LoginFormWithRedirect({
  searchParams,
}: {
  searchParams: Promise<{ redirectTo?: string }>;
}) {
  const { redirectTo } = await searchParams;
  return <LoginForm redirectTo={redirectTo} />;
}

export default function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ redirectTo?: string }>;
}) {
  return (
    <Suspense fallback={<LoginForm redirectTo={undefined} />}>
      <LoginFormWithRedirect searchParams={searchParams} />
    </Suspense>
  );
}
