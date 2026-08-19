"use client";

import { useState } from "react";
import { deleteQuestion } from "@/lib/admin/question-actions";
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

export function DeleteQuestionDialog({
  id,
  questionSetId,
}: {
  id: string;
  questionSetId: string;
}) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button variant="ghost" size="icon-sm" aria-label="Delete" onClick={() => setOpen(true)}>
        <Trash2 />
      </Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete this question?</DialogTitle>
            <DialogDescription>This cannot be undone.</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <form action={deleteQuestion}>
              <input type="hidden" name="id" value={id} />
              <input type="hidden" name="questionSetId" value={questionSetId} />
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
