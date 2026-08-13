"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Plus } from "lucide-react";
import { createBrandSchema, type CreateBrandInput } from "@/schemas/admin";
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
import { PasswordField } from "@/components/ui/password-field";
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Pill } from "@/components/layout/pill";
import { generateTempPassword } from "@/lib/formatting/generate-password";
import { createBrand } from "./actions";

export function CreateBrandDialog() {
  const [open, setOpen] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<CreateBrandInput>({
    resolver: zodResolver(createBrandSchema),
    defaultValues: { organizationName: "", username: "", password: generateTempPassword() },
  });

  const onSubmit = async (data: CreateBrandInput) => {
    setFormError(null);
    const result = await createBrand(data);
    if (result?.error) {
      setFormError(result.error);
      return;
    }
    setOpen(false);
    reset({ organizationName: "", username: "", password: generateTempPassword() });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Pill type="button" tone="invert">
          <Plus />
          Add brand access
        </Pill>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>New brand</DialogTitle>
          <DialogDescription>
            Create the brand&apos;s access account (one account per brand).
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} noValidate>
          <FieldGroup>
            <Field data-invalid={!!errors.username}>
              <FieldLabel htmlFor="username">Username</FieldLabel>
              <Input
                id="username"
                placeholder="E.g. salomon or contact.salomon"
                {...register("username")}
              />
              <FieldError errors={[errors.username]} />
            </Field>
            
            <Field data-invalid={!!errors.organizationName}>
              <FieldLabel htmlFor="organizationName">Brand (organization_name)</FieldLabel>
              <Input
                id="organizationName"
                placeholder="E.g. Salomon"
                {...register("organizationName")}
              />
              <FieldError errors={[errors.organizationName]} />
            </Field>

            <Field data-invalid={!!errors.password}>
              <FieldLabel htmlFor="password">Password</FieldLabel>
              <PasswordField
                id="password"
                value={watch("password")}
                onGenerate={() => setValue("password", generateTempPassword())}
                {...register("password")}
              />
              <FieldError errors={[errors.password]} />
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
              Create access
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
