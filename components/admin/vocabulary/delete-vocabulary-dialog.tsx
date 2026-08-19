"use client";

import { useState } from "react";
import { deleteVocabulary } from "@/lib/admin/vocabulary-actions";
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

export function DeleteVocabularyDialog({ id, word }: { id: string; word: string }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button variant="ghost" size="icon-sm" aria-label="Delete" onClick={() => setOpen(true)}>
        <Trash2 />
      </Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete &ldquo;{word}&rdquo;?</DialogTitle>
            <DialogDescription>This cannot be undone.</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <form action={deleteVocabulary}>
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
