"use client";

import { signOut } from "@/lib/auth/actions";
import { Button } from "@/components/ui/button";

export function SignOutButton() {
  return (
    <form action={signOut}>
      <Button type="submit" variant="outline">
        Log out
      </Button>
    </form>
  );
}
