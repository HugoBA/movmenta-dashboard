"use client";

import { useState } from "react";
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
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import type { ResultRecord } from "@/lib/xano/results";
import { formatShortDate } from "@/lib/formatting/date";
import { updateResultAction } from "./actions";

function toEditable(n: number): string {
  return String(n);
}

export function EditResultDialog({
  result,
  onUpdated,
  trigger,
}: {
  result: ResultRecord;
  onUpdated: () => void;
  trigger: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState(toEditable(result.value));
  const [mm, setMm] = useState(toEditable(result.mm));
  const [percent, setPercent] = useState(toEditable(result.percent));
  const [km, setKm] = useState(toEditable(result.km));
  const [duration, setDuration] = useState(toEditable(result.duration));
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const resetFields = () => {
    setValue(toEditable(result.value));
    setMm(toEditable(result.mm));
    setPercent(toEditable(result.percent));
    setKm(toEditable(result.km));
    setDuration(toEditable(result.duration));
  };

  const handleSave = async () => {
    const parsed = {
      value: Number(value),
      mm: Number(mm),
      percent: Number(percent),
      km: Number(km),
      duration: Number(duration),
    };
    if (Object.values(parsed).some((n) => Number.isNaN(n))) {
      setError("All fields must be valid numbers.");
      return;
    }
    setError(null);
    setIsSubmitting(true);
    const result_ = await updateResultAction(result.id, parsed);
    setIsSubmitting(false);
    if (result_?.error) {
      setError(result_.error);
      return;
    }
    setOpen(false);
    onUpdated();
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        setError(null);
        if (next) resetFields();
      }}
    >
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit result</DialogTitle>
          <DialogDescription>
            {result.id_nfc || result.id} — {formatShortDate(result.created_at)}, {result.period || "—"}
          </DialogDescription>
        </DialogHeader>

        <FieldGroup>
          <Field>
            <FieldLabel htmlFor="editValue">Value</FieldLabel>
            <Input id="editValue" type="number" value={value} onChange={(e) => setValue(e.target.value)} />
          </Field>

          <Field>
            <FieldLabel htmlFor="editMm">mm</FieldLabel>
            <Input
              id="editMm"
              type="number"
              step="0.1"
              value={mm}
              onChange={(e) => setMm(e.target.value)}
            />
          </Field>

          <Field>
            <FieldLabel htmlFor="editPercent">Wear (%)</FieldLabel>
            <Input
              id="editPercent"
              type="number"
              step="0.1"
              value={percent}
              onChange={(e) => setPercent(e.target.value)}
            />
          </Field>

          <Field>
            <FieldLabel htmlFor="editKm">Distance (km)</FieldLabel>
            <Input
              id="editKm"
              type="number"
              step="0.1"
              value={km}
              onChange={(e) => setKm(e.target.value)}
            />
          </Field>

          <Field>
            <FieldLabel htmlFor="editDuration">Duration (minutes)</FieldLabel>
            <Input
              id="editDuration"
              type="number"
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
            />
          </Field>
        </FieldGroup>

        {error && (
          <p className="text-sm text-destructive" role="alert">
            {error}
          </p>
        )}

        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button type="button" disabled={isSubmitting} onClick={handleSave}>
            {isSubmitting ? "Saving…" : "Save"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
