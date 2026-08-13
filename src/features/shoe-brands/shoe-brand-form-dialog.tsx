"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { shoeBrandSchema, type ShoeBrandInput } from "@/schemas/shoe-brands";
import type { ShoeBrandRecord } from "@/lib/xano/shoe-brands";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { createShoeBrandAction, updateShoeBrandAction } from "./actions";

export function ShoeBrandFormDialog({
  brand,
  trigger,
}: {
  brand?: ShoeBrandRecord;
  trigger: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ShoeBrandInput>({
    resolver: zodResolver(shoeBrandSchema),
    defaultValues: { brandName: brand?.brand_name ?? "" },
  });

  const onSubmit = async (data: ShoeBrandInput) => {
    setFormError(null);
    const result = brand
      ? await updateShoeBrandAction(brand.id, data)
      : await createShoeBrandAction(data);
    if (result?.error) {
      setFormError(result.error);
      return;
    }
    setOpen(false);
    reset({ brandName: "" });
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        setFormError(null);
        if (next) reset({ brandName: brand?.brand_name ?? "" });
      }}
    >
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{brand ? "Edit brand" : "New brand"}</DialogTitle>
          <DialogDescription>
            {brand
              ? "Rename this shoe brand."
              : "Add a shoe brand to associate with tests (e.g. Hoka, Saucony, Kiprun)."}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} noValidate>
          <FieldGroup>
            <Field data-invalid={!!errors.brandName}>
              <FieldLabel htmlFor="brandName">Brand name</FieldLabel>
              <Input id="brandName" placeholder="E.g. Hoka" {...register("brandName")} />
              <FieldError errors={[errors.brandName]} />
            </Field>
          </FieldGroup>

          {formError && (
            <p className="mt-4 text-sm text-destructive" role="alert">
              {formError}
            </p>
          )}

          <DialogFooter className="mt-6">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {brand ? "Save" : "Create brand"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
