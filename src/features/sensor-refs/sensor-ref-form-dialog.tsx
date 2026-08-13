"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { sensorRefSchema, type SensorRefInput } from "@/schemas/sensor-refs";
import type { SensorRefRecord } from "@/lib/xano/sensor-refs";
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
import { createSensorRefAction, updateSensorRefAction } from "./actions";

export function SensorRefFormDialog({
  sensorRef,
  trigger,
}: {
  sensorRef?: SensorRefRecord;
  trigger: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<SensorRefInput>({
    resolver: zodResolver(sensorRefSchema),
    defaultValues: { name: sensorRef?.name ?? "" },
  });

  const onSubmit = async (data: SensorRefInput) => {
    setFormError(null);
    const result = sensorRef
      ? await updateSensorRefAction(sensorRef.id, data)
      : await createSensorRefAction(data);
    if (result?.error) {
      setFormError(result.error);
      return;
    }
    setOpen(false);
    reset({ name: "" });
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        setFormError(null);
        if (next) reset({ name: sensorRef?.name ?? "" });
      }}
    >
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{sensorRef ? "Edit sensor ref" : "New sensor ref"}</DialogTitle>
          <DialogDescription>
            {sensorRef
              ? "Rename this sensor reference."
              : "Add a sensor reference to select when configuring a shoe."}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} noValidate>
          <FieldGroup>
            <Field data-invalid={!!errors.name}>
              <FieldLabel htmlFor="name">Name</FieldLabel>
              <Input id="name" placeholder="E.g. Sensor new gen" {...register("name")} />
              <FieldError errors={[errors.name]} />
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
              {sensorRef ? "Save" : "Create sensor ref"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
