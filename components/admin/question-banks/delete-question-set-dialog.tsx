"use client";

import { useState } from "react";
import { deleteQuestionSet } from "@/lib/admin/question-bank-actions";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";

export function DeleteQuestionSetDialog({ id, title }: { id: string; title: string }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button variant="ghost" size="icon-sm" aria-label="Delete" onClick={() => setOpen(true)}>
        <Trash2 />
      </Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete &ldquo;{title}&rdquo;?</DialogTitle>
            <DialogDescription>
              This will permanently delete this question set and all of its questions. This
              cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <form action={deleteQuestionSet}>
              <input type="hidden" name="id" value={id} />
              <Button type="submit" variant="destructive" onClick={() => setOpen(false)}>
                Delete
              </Button>
            </form>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
