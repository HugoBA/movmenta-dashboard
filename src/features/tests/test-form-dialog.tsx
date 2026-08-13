"use client";

import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { testSchema, type TestInput } from "@/schemas/tests";
import type { TestRecord } from "@/lib/xano/tests";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { createTestAction, updateTestAction } from "./actions";

export function TestFormDialog({
  test,
  brands,
  trigger,
}: {
  test?: TestRecord;
  brands: ShoeBrandRecord[];
  trigger: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<TestInput>({
    resolver: zodResolver(testSchema),
    defaultValues: { name: test?.name ?? "", brandId: test?.brand_id ?? undefined },
  });

  const onSubmit = async (data: TestInput) => {
    setFormError(null);
    const result = test
      ? await updateTestAction(test.id, data)
      : await createTestAction(data);
    if (result?.error) {
      setFormError(result.error);
      return;
    }
    setOpen(false);
    reset({ name: "", brandId: undefined });
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        setFormError(null);
        if (next) reset({ name: test?.name ?? "", brandId: test?.brand_id ?? undefined });
      }}
    >
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{test ? "Edit test" : "New test"}</DialogTitle>
          <DialogDescription>
            {test
              ? "Update the test name or brand."
              : "Create a shoe-test phase and associate it to a brand."}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} noValidate>
          <FieldGroup>
            <Field data-invalid={!!errors.name}>
              <FieldLabel htmlFor="name">Name</FieldLabel>
              <Input id="name" placeholder="E.g. TLD Kiprun" {...register("name")} />
              <FieldError errors={[errors.name]} />
            </Field>

            <Field data-invalid={!!errors.brandId}>
              <FieldLabel htmlFor="brandId">Brand</FieldLabel>
              <Controller
                control={control}
                name="brandId"
                render={({ field }) => (
                  <Select
                    value={field.value ? String(field.value) : ""}
                    onValueChange={(value) => field.onChange(Number(value))}
                  >
                    <SelectTrigger id="brandId" className="w-full">
                      <SelectValue placeholder="Select a brand" />
                    </SelectTrigger>
                    <SelectContent>
                      {brands.map((brand) => (
                        <SelectItem key={brand.id} value={String(brand.id)}>
                          {brand.brand_name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
              <FieldError errors={[errors.brandId]} />
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
              {test ? "Save" : "Create test"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
