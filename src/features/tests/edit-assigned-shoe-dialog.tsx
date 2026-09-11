"use client";

import { useMemo, useState } from "react";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import type { ShoeRecord } from "@/lib/xano/shoes";
import type { SensorRefRecord } from "@/lib/xano/sensor-refs";
import type { ShoeBrandRecord } from "@/lib/xano/shoe-brands";
import { updateAssignedShoeConfig } from "./actions";
import { REF_MAGNET_OPTIONS } from "./constants";

function fullName(shoe: ShoeRecord): string {
  return [shoe.firstname, shoe.lastname].filter(Boolean).join(" ");
}

export function EditAssignedShoeDialog({
  shoe,
  sensorRefs,
  modelNames,
  brands,
  trigger,
}: {
  shoe: ShoeRecord;
  sensorRefs: SensorRefRecord[];
  modelNames: string[];
  brands: ShoeBrandRecord[];
  trigger: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const [model, setModel] = useState(shoe.model ?? "");
  const [refMagnet, setRefMagnet] = useState(shoe.ref_magnet || REF_MAGNET_OPTIONS[0]);
  // The shoe's current model may predate the shoe_model reference table —
  // keep it selectable even if it's not one of the canonical names.
  const modelOptions = useMemo(() => {
    if (!shoe.model || modelNames.includes(shoe.model)) return modelNames;
    return [shoe.model, ...modelNames];
  }, [modelNames, shoe.model]);
  const [refSensor, setRefSensor] = useState(
    sensorRefs.find((sensor) => sensor.name === shoe.ref_sensor)?.id.toString() ?? "",
  );
  const [brandId, setBrandId] = useState(shoe.brand_id ? String(shoe.brand_id) : "");
  const [factoryValue, setFactoryValue] = useState(String(shoe.factory_value ?? ""));
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSave = async () => {
    const sensorName = sensorRefs.find((sensor) => String(sensor.id) === refSensor)?.name;
    if (!sensorName) {
      setError("Select a sensor ref.");
      return;
    }
    if (!brandId) {
      setError("Select a brand.");
      return;
    }
    const parsedFactoryValue = Number(factoryValue);
    if (factoryValue === "" || Number.isNaN(parsedFactoryValue)) {
      setError("Enter a valid factory value.");
      return;
    }
    setError(null);
    setIsSubmitting(true);
    const result = await updateAssignedShoeConfig(shoe.id, {
      model,
      refMagnet,
      refSensor: sensorName,
      brandId: Number(brandId),
      factoryValue: parsedFactoryValue,
    });
    setIsSubmitting(false);
    if (result?.error) {
      setError(result.error);
      return;
    }
    setOpen(false);
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        setError(null);
        if (next) {
          setModel(shoe.model ?? "");
          setRefMagnet(shoe.ref_magnet || REF_MAGNET_OPTIONS[0]);
          setRefSensor(sensorRefs.find((sensor) => sensor.name === shoe.ref_sensor)?.id.toString() ?? "");
          setBrandId(shoe.brand_id ? String(shoe.brand_id) : "");
          setFactoryValue(String(shoe.factory_value ?? ""));
        }
      }}
    >
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit shoe</DialogTitle>
          <DialogDescription>
            {fullName(shoe) || shoe.id_nfc || shoe.serial_number} — update the model, magnet and
            sensor of this shoe.
          </DialogDescription>
        </DialogHeader>

        <FieldGroup>
          <Field>
            <FieldLabel htmlFor="editBrand">Brand</FieldLabel>
            <Select value={brandId} onValueChange={setBrandId}>
              <SelectTrigger id="editBrand" className="w-full">
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
            {brands.length === 0 && (
              <p className="text-sm text-text-faint">
                No shoe brand yet — add one under Data / Shoe brands.
              </p>
            )}
          </Field>

          <Field>
            <FieldLabel htmlFor="editFactoryValue">Factory value</FieldLabel>
            <Input
              id="editFactoryValue"
              type="number"
              value={factoryValue}
              onChange={(e) => setFactoryValue(e.target.value)}
            />
          </Field>

          <Field>
            <FieldLabel htmlFor="editModel">Model</FieldLabel>
            <Select value={model} onValueChange={setModel}>
              <SelectTrigger id="editModel" className="w-full">
                <SelectValue placeholder="Select a model" />
              </SelectTrigger>
              <SelectContent>
                {modelOptions.map((option) => (
                  <SelectItem key={option} value={option}>
                    {option}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {modelOptions.length === 0 && (
              <p className="text-sm text-text-faint">
                No shoe model yet — add one under Data / Shoe models.
              </p>
            )}
          </Field>

          <Field>
            <FieldLabel htmlFor="editRefMagnet">Ref magnet</FieldLabel>
            <Select value={refMagnet} onValueChange={setRefMagnet}>
              <SelectTrigger id="editRefMagnet" className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {REF_MAGNET_OPTIONS.map((option) => (
                  <SelectItem key={option} value={option}>
                    {option}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>

          <Field>
            <FieldLabel htmlFor="editRefSensor">Ref sensor</FieldLabel>
            <Select value={refSensor} onValueChange={setRefSensor}>
              <SelectTrigger id="editRefSensor" className="w-full">
                <SelectValue placeholder="Select a sensor ref" />
              </SelectTrigger>
              <SelectContent>
                {sensorRefs.map((sensor) => (
                  <SelectItem key={sensor.id} value={String(sensor.id)}>
                    {sensor.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {sensorRefs.length === 0 && (
              <p className="text-sm text-text-faint">
                No sensor ref yet — add one under Data / Sensor refs.
              </p>
            )}
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
          <Button
            type="button"
            disabled={isSubmitting || !refSensor || !brandId || factoryValue === ""}
            onClick={handleSave}
          >
            {isSubmitting ? "Saving…" : "Save"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
