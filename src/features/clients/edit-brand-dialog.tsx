"use client";

import { useRef, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { updateBrandSchema, type UpdateBrandInput } from "@/schemas/admin";
import type { ShoeBrandRecord } from "@/lib/xano/shoe-brands";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PasswordField } from "@/components/ui/password-field";
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { EntityAvatar } from "@/components/ui/entity-avatar";
import { initials } from "@/lib/formatting/initials";
import { generateTempPassword } from "@/lib/formatting/generate-password";
import { updateBrand, uploadBrandLogoAction } from "./actions";

export function EditBrandDialog({
  brand,
  brands,
  open,
  onOpenChange,
}: {
  brand: { id: number; username: string; brand_id?: number | null; logo?: { url: string } | null };
  brands: ShoeBrandRecord[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const [formError, setFormError] = useState<string | null>(null);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(brand.logo?.url ?? null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<UpdateBrandInput>({
    resolver: zodResolver(updateBrandSchema),
    defaultValues: {
      username: brand.username,
      brandId: brand.brand_id ?? undefined,
      password: "",
    },
  });

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setLogoFile(file);
    setLogoPreview(URL.createObjectURL(file));
  };

  const onSubmit = async (data: UpdateBrandInput) => {
    setFormError(null);
    const result = await updateBrand(brand.id, data);
    if (result?.error) {
      setFormError(result.error);
      return;
    }

    if (logoFile) {
      const formData = new FormData();
      formData.append("logo", logoFile);
      const uploadResult = await uploadBrandLogoAction(brand.id, formData);
      if (uploadResult?.error) {
        setFormError(uploadResult.error);
        return;
      }
    }

    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit brand access</DialogTitle>
          <DialogDescription>Update the account&apos;s username, brand or password.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} noValidate>
          <FieldGroup>
            <Field data-invalid={!!errors.username}>
              <FieldLabel htmlFor="edit-brand-username">Username</FieldLabel>
              <Input id="edit-brand-username" {...register("username")} />
              <FieldError errors={[errors.username]} />
            </Field>

            <Field data-invalid={!!errors.brandId}>
              <FieldLabel htmlFor="edit-brand-brandId">Brand</FieldLabel>
              <Controller
                control={control}
                name="brandId"
                render={({ field }) => (
                  <Select
                    value={field.value ? String(field.value) : ""}
                    onValueChange={(value) => field.onChange(Number(value))}
                  >
                    <SelectTrigger id="edit-brand-brandId" className="w-full">
                      <SelectValue placeholder="Select a brand" />
                    </SelectTrigger>
                    <SelectContent>
                      {brands.map((b) => (
                        <SelectItem key={b.id} value={String(b.id)}>
                          {b.brand_name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
              <FieldError errors={[errors.brandId]} />
            </Field>

            <Field>
              <FieldLabel>Logo</FieldLabel>
              <div className="flex items-center gap-3">
                <EntityAvatar initials={initials(brand.username)} src={logoPreview} />
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleLogoChange}
                  className="hidden"
                  id="edit-brand-logo"
                />
                <Button type="button" variant="outline" onClick={() => fileInputRef.current?.click()}>
                  {logoPreview ? "Change logo" : "Upload logo"}
                </Button>
              </div>
            </Field>

            <Field data-invalid={!!errors.password}>
              <FieldLabel htmlFor="edit-brand-password">New password</FieldLabel>
              <PasswordField
                id="edit-brand-password"
                value={watch("password")}
                placeholder="Leave blank to keep the current password"
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
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              Save changes
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
