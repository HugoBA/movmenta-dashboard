"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { updateAdminSchema, type UpdateAdminInput } from "@/schemas/admin";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { updateAdmin } from "./actions";

export function EditAdminDialog({
  admin,
  open,
  onOpenChange,
}: {
  admin: { id: number; username: string };
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const [formError, setFormError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<UpdateAdminInput>({
    resolver: zodResolver(updateAdminSchema),
    defaultValues: { username: admin.username },
  });

  const onSubmit = async (data: UpdateAdminInput) => {
    setFormError(null);
    const result = await updateAdmin(admin.id, data);
    if (result?.error) {
      setFormError(result.error);
      return;
    }
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit administrator</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} noValidate>
          <FieldGroup>
            <Field data-invalid={!!errors.username}>
              <FieldLabel htmlFor="edit-admin-username">Username</FieldLabel>
              <Input id="edit-admin-username" {...register("username")} />
              <FieldError errors={[errors.username]} />
            </Field>
          </FieldGroup>

          {formError && (
            <p className="mt-4 text-sm text-destructive" role="alert">
              {formError}
            </p>
          )}

          <DialogFooter className="mt-6">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="bg-brand-cyan text-[#04262c] hover:bg-brand-cyan/90"
            >
              Save changes
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
