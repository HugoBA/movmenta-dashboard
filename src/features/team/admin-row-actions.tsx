"use client";

import { useState } from "react";
import { Pencil, MoreHorizontal } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { EditAdminDialog } from "./edit-admin-dialog";
import { DeleteAdminDialog } from "./delete-admin-dialog";

const iconButtonClass =
  "flex h-8 w-8 items-center justify-center rounded-lg border border-border bg-white/[0.015] text-muted-foreground hover:text-foreground [&_svg]:size-4";

export function AdminRowActions({ admin }: { admin: { id: number; username: string } }) {
  const [editOpen, setEditOpen] = useState(false);
  const [editKey, setEditKey] = useState(0);
  const [deleteOpen, setDeleteOpen] = useState(false);

  return (
    <div className="flex justify-end gap-1.5">
      <button
        type="button"
        title="Edit"
        onClick={() => {
          setEditKey((key) => key + 1);
          setEditOpen(true);
        }}
        className={iconButtonClass}
      >
        <Pencil />
      </button>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button type="button" title="More options" className={iconButtonClass}>
            <MoreHorizontal />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem variant="destructive" onClick={() => setDeleteOpen(true)}>
            Delete account
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <EditAdminDialog key={editKey} admin={admin} open={editOpen} onOpenChange={setEditOpen} />
      <DeleteAdminDialog admin={admin} open={deleteOpen} onOpenChange={setDeleteOpen} />
    </div>
  );
}
