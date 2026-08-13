"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { CustomDateRangePicker } from "./custom-date-range-picker";
import { DATE_RANGE_OPTIONS, type DateRangeValue } from "./date-range";

const PLATFORM_OPTIONS = [
  { value: "all", label: "All platforms" },
  { value: "ios", label: "iOS" },
  { value: "android", label: "Android" },
];

export function ResultsFilters({
  range,
  onRangeChange,
  customFrom,
  customTo,
  onCustomRangeChange,
  platform,
  onPlatformChange,
  idNfc,
  onIdNfcChange,
}: {
  range: DateRangeValue;
  onRangeChange: (range: DateRangeValue) => void;
  customFrom?: Date;
  customTo?: Date;
  onCustomRangeChange: (range: { from?: Date; to?: Date }) => void;
  platform: string;
  onPlatformChange: (value: string) => void;
  idNfc: string;
  onIdNfcChange: (value: string) => void;
}) {
  return (
    <div className="flex flex-wrap items-center gap-2.5">
      <Select value={range} onValueChange={(v) => onRangeChange(v as DateRangeValue)}>
        <SelectTrigger className="w-[170px]">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {DATE_RANGE_OPTIONS.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {range === "custom" && (
        <CustomDateRangePicker from={customFrom} to={customTo} onChange={onCustomRangeChange} />
      )}

      <Select
        value={platform || "all"}
        onValueChange={(v) => onPlatformChange(v === "all" ? "" : v)}
      >
        <SelectTrigger className="w-[150px]">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {PLATFORM_OPTIONS.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Input
        placeholder="Search by NFC ID"
        value={idNfc}
        onChange={(e) => onIdNfcChange(e.target.value)}
        className="w-[200px]"
      />
    </div>
  );
}
