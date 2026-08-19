import type { Metadata } from "next";
import { RegisterForm } from "@/components/auth/register-form";

export const metadata: Metadata = { title: "Sign up — EnglishHero101" };

export default function RegisterPage() {
  return <RegisterForm />;
}
