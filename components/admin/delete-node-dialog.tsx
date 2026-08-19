"use client";

import { useState } from "react";
import { deleteContentNode } from "@/lib/admin/content-actions";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";

// Deliberately not using DialogTrigger nested inside the dropdown item —
// nesting one portaled primitive's trigger inside another's item is a
// known source of focus/close-timing bugs. Instead the dropdown item
// just flips local `open` state, and the Dialog is an independent
// sibling controlled by it.
export function DeleteNodeDialog({
  nodeId,
  title,
  descendantCount,
}: {
  nodeId: string;
  title: string;
  descendantCount: number;
}) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <DropdownMenuItem variant="destructive" onClick={() => setOpen(true)}>
        <Trash2 /> Delete
      </DropdownMenuItem>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete &ldquo;{title}&rdquo;?</DialogTitle>
            <DialogDescription>
              {descendantCount > 0
                ? `This will permanently delete this node and its ${descendantCount} descendant node(s), along with any lessons attached to them. This cannot be undone.`
                : "This will permanently delete this node and any lessons attached to it. This cannot be undone."}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <form action={deleteContentNode}>
              <input type="hidden" name="id" value={nodeId} />
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
