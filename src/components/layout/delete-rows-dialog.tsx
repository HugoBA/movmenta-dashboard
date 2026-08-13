"use client";

import { useState } from "react";
import { Trash2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

export function DeleteRowsDialog({
  count,
  entityLabel,
  onConfirm,
  onDeleted,
}: {
  count: number;
  entityLabel: string;
  onConfirm: () => Promise<{ deletedCount: number; error?: string }>;
  onDeleted: () => void;
}) {
  const [open, setOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const plural = count === 1 ? "" : "s";

  const handleConfirm = async () => {
    setIsDeleting(true);
    setError(null);
    const result = await onConfirm();
    setIsDeleting(false);

    if (result.error) {
      setError(
        result.deletedCount > 0
          ? `${result.error} (${result.deletedCount} deleted before stopping.)`
          : result.error,
      );
      if (result.deletedCount > 0) onDeleted();
      return;
    }

    setOpen(false);
    onDeleted();
  };

  return (
    <>
      <Button type="button" variant="destructive" onClick={() => setOpen(true)}>
        <Trash2 />
        Delete {count} {entityLabel}
        {plural}
      </Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              Delete {count} {entityLabel}
              {plural}?
            </DialogTitle>
            <DialogDescription>This can&apos;t be undone.</DialogDescription>
          </DialogHeader>

          {error && (
            <p className="text-sm text-destructive" role="alert">
              {error}
            </p>
          )}

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="button" variant="destructive" disabled={isDeleting} onClick={handleConfirm}>
              {isDeleting ? "Deleting…" : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
