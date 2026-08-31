"use client";

import { signInWithGoogle } from "@/lib/auth/actions";
import { Button } from "@/components/ui/button";

function GoogleIcon() {
  return (
    <svg viewBox="0 0 48 48" className="size-4" aria-hidden="true">
      <path
        fill="#EA4335"
        d="M24 9.5c3.4 0 6.4 1.2 8.8 3.4l6.5-6.5C35.3 2.5 30 0 24 0 14.6 0 6.5 5.4 2.6 13.2l7.6 5.9C12.1 13 17.6 9.5 24 9.5z"
      />
      <path
        fill="#4285F4"
        d="M46.5 24.5c0-1.6-.1-3.1-.4-4.5H24v9h12.6c-.5 2.9-2.2 5.4-4.7 7l7.4 5.7c4.3-4 6.8-9.9 6.8-17.2z"
      />
      <path
        fill="#FBBC05"
        d="M10.2 19.1a14.5 14.5 0 0 0 0 9.8l-7.6 5.9a24 24 0 0 1 0-21.6z"
      />
      <path
        fill="#34A853"
        d="M24 48c6 0 11.3-2 15-5.4l-7.4-5.7c-2 1.4-4.6 2.2-7.6 2.2-6.4 0-11.9-3.5-14.2-9.6l-7.6 5.9C6.5 42.6 14.6 48 24 48z"
      />
    </svg>
  );
}

export function GoogleSignInButton({ label = "Continue with Google" }: { label?: string }) {
  return (
    <form action={signInWithGoogle} className="w-full">
      <Button type="submit" variant="outline" className="w-full gap-2">
        <GoogleIcon /> {label}
      </Button>
    </form>
  );
}
