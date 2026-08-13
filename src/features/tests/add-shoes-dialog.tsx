"use client";

import { useMemo, useState, useTransition } from "react";
import { Plus, Search, X } from "lucide-react";
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
import { Pill } from "@/components/layout/pill";
import { useDebouncedValue } from "@/hooks/use-debounced-value";
import type { ShoeRecord } from "@/lib/xano/shoes";
import type { SensorRefRecord } from "@/lib/xano/sensor-refs";
import { assignShoesToTest } from "./actions";
import { REF_MAGNET_OPTIONS } from "./constants";

const MAX_RESULTS = 30;

function fullName(shoe: ShoeRecord): string {
  return [shoe.firstname, shoe.lastname].filter(Boolean).join(" ");
}

function matches(shoe: ShoeRecord, query: string): boolean {
  const haystack = [shoe.id_nfc, fullName(shoe), shoe.email].join(" ").toLowerCase();
  return haystack.includes(query.toLowerCase());
}

export function AddShoesDialog({
  testId,
  availableShoes,
  sensorRefs,
}: {
  testId: number;
  availableShoes: ShoeRecord[];
  sensorRefs: SensorRefRecord[];
}) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebouncedValue(search, 150);
  const [selectedShoes, setSelectedShoes] = useState<ShoeRecord[]>([]);
  const [refMagnet, setRefMagnet] = useState<string>(REF_MAGNET_OPTIONS[0]);
  const [refSensor, setRefSensor] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const mostRecentSensorRef = useMemo(() => {
    if (sensorRefs.length === 0) return null;
    return [...sensorRefs].sort((a, b) => b.created_at - a.created_at)[0];
  }, [sensorRefs]);

  const selectedIds = useMemo(() => new Set(selectedShoes.map((shoe) => shoe.id)), [selectedShoes]);

  const results = useMemo(() => {
    const query = debouncedSearch.trim();
    const pool = availableShoes.filter((shoe) => !selectedIds.has(shoe.id));
    const filtered = query ? pool.filter((shoe) => matches(shoe, query)) : pool;
    return filtered.slice(0, MAX_RESULTS);
  }, [availableShoes, debouncedSearch, selectedIds]);

  const reset = () => {
    setSearch("");
    setSelectedShoes([]);
    setRefMagnet(REF_MAGNET_OPTIONS[0]);
    setRefSensor(mostRecentSensorRef ? String(mostRecentSensorRef.id) : "");
    setError(null);
  };

  const handleConfirm = () => {
    const sensorName = sensorRefs.find((sensor) => String(sensor.id) === refSensor)?.name;
    if (!sensorName) {
      setError("Select a sensor ref.");
      return;
    }
    if (selectedShoes.length === 0) {
      setError("Select at least one shoe.");
      return;
    }
    setError(null);
    startTransition(async () => {
      const result = await assignShoesToTest(
        testId,
        selectedShoes.map((shoe) => shoe.id),
        { refMagnet, refSensor: sensorName },
      );
      if (result.error) {
        setError(result.error);
        return;
      }
      setOpen(false);
      reset();
    });
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        if (next) reset();
      }}
    >
      <DialogTrigger asChild>
        <Pill type="button" tone="invert">
          <Plus />
          Add shoes
        </Pill>
      </DialogTrigger>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Add shoes to test</DialogTitle>
          <DialogDescription>
            Search by NFC id, name or email, pick one or several shoes, then set the magnet and
            sensor to apply to all of them.
          </DialogDescription>
        </DialogHeader>

        {selectedShoes.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {selectedShoes.map((shoe) => (
              <span
                key={shoe.id}
                className="flex items-center gap-1.5 rounded-full border border-border bg-white/[0.03] py-1 pr-1.5 pl-3 text-xs"
              >
                {shoe.id_nfc || shoe.serial_number}
                <button
                  type="button"
                  onClick={() =>
                    setSelectedShoes((prev) => prev.filter((s) => s.id !== shoe.id))
                  }
                  className="flex size-4 items-center justify-center rounded-full text-text-faint hover:text-foreground [&_svg]:size-3"
                >
                  <X />
                </button>
              </span>
            ))}
          </div>
        )}

        <div className="flex items-center gap-2 rounded-lg border border-border bg-white/[0.02] px-3 py-2">
          <Search className="size-4 text-text-faint" />
          <input
            autoFocus
            placeholder="Search by NFC id, name, email…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-transparent text-sm outline-none placeholder:text-text-faint"
          />
        </div>

        <div className="max-h-48 overflow-y-auto rounded-lg border border-border-soft">
          {results.length === 0 && (
            <p className="px-3 py-3 text-sm text-text-faint">
              {availableShoes.length === selectedShoes.length
                ? "All shoes are selected or already assigned."
                : "No matching shoe."}
            </p>
          )}
          {results.map((shoe) => {
            const name = fullName(shoe);
            const title = name || shoe.id_nfc || shoe.serial_number;
            const subtitleParts = name ? [shoe.id_nfc, shoe.email] : [shoe.email];
            const subtitle = subtitleParts.filter(Boolean).join(" · ") || "No profile";
            return (
              <button
                key={shoe.id}
                type="button"
                onClick={() => setSelectedShoes((prev) => [...prev, shoe])}
                className="flex w-full items-center justify-between gap-3 px-3 py-2 text-left text-sm hover:bg-accent"
              >
                <div className="min-w-0">
                  <div className="truncate font-medium">{title}</div>
                  <div className="truncate text-xs text-text-faint">{subtitle}</div>
                </div>
                <Plus className="size-4 shrink-0 text-text-faint" />
              </button>
            );
          })}
        </div>

        <FieldGroup>
          <Field>
            <FieldLabel htmlFor="refMagnet">Ref magnet</FieldLabel>
            <Select value={refMagnet} onValueChange={setRefMagnet}>
              <SelectTrigger id="refMagnet" className="w-full">
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
            <FieldLabel htmlFor="refSensor">Ref sensor</FieldLabel>
            <Select value={refSensor} onValueChange={setRefSensor}>
              <SelectTrigger id="refSensor" className="w-full">
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
            disabled={isPending || selectedShoes.length === 0 || !refSensor}
            onClick={handleConfirm}
          >
            {isPending
              ? "Adding…"
              : `Add ${selectedShoes.length || ""} shoe${selectedShoes.length === 1 ? "" : "s"}`}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
