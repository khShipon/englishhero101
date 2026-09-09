"use client";

import { Trash2 } from "lucide-react";

// Generic confirm-then-delete icon button around a native form action —
// shared by the feed card, reply items, and the admin moderation page.
// Who's actually allowed to delete is enforced by RLS on the server
// action's table call, not here (see deletePost/deleteReply's
// comments) — this only guards against an accidental click.
export function DeleteForm({
  action,
  hiddenFields,
  label,
}: {
  action: (formData: FormData) => void | Promise<void>;
  hiddenFields: Record<string, string>;
  label: string;
}) {
  return (
    <form
      action={action}
      onSubmit={(event) => {
        if (!window.confirm("Delete this? This can't be undone.")) {
          event.preventDefault();
        }
      }}
    >
      {Object.entries(hiddenFields).map(([name, value]) => (
        <input key={name} type="hidden" name={name} value={value} />
      ))}
      <button
        type="submit"
        aria-label={label}
        className="shrink-0 rounded-md p-1 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
      >
        <Trash2 className="size-3.5" />
      </button>
    </form>
  );
}
