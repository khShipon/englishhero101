import type { Metadata } from "next";
import { ForgotPasswordForm } from "@/components/auth/forgot-password-form";

export const metadata: Metadata = { title: "Forgot password — EnglishHero101" };

export default function ForgotPasswordPage() {
  return <ForgotPasswordForm />;
}
