"use client";

import { useState } from "react";
import { deleteLesson } from "@/lib/admin/lesson-actions";
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

export function DeleteLessonDialog({
  lessonId,
  nodeId,
  title,
}: {
  lessonId: string;
  nodeId: string;
  title: string;
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
            <DialogTitle>Delete &ldquo;{title}&rdquo;?</DialogTitle>
            <DialogDescription>
              This will permanently delete this lesson. This cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <form action={deleteLesson}>
              <input type="hidden" name="id" value={lessonId} />
              <input type="hidden" name="nodeId" value={nodeId} />
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
