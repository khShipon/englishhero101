"use client";

import { useActionState } from "react";
import { updateProfile } from "@/lib/auth/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";

export function ProfileForm({ fullName }: { fullName: string }) {
  const [state, formAction, pending] = useActionState(updateProfile, undefined);

  return (
    <form action={formAction} className="flex flex-col gap-4">
      {state?.error && (
        <Alert variant="destructive">
          <AlertDescription>{state.error}</AlertDescription>
        </Alert>
      )}
      {state?.success && (
        <Alert>
          <AlertDescription>{state.success}</AlertDescription>
        </Alert>
      )}
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="fullName">Full name</Label>
        <Input
          id="fullName"
          name="fullName"
          defaultValue={state?.values?.fullName ?? fullName}
          required
        />
        {state?.fieldErrors?.fullName && (
          <p className="text-sm text-destructive">{state.fieldErrors.fullName[0]}</p>
        )}
      </div>
      <Button type="submit" disabled={pending} className="w-fit">
        {pending ? "Saving..." : "Save changes"}
      </Button>
    </form>
  );
}
