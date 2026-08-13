"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";

const GENDER_OPTIONS = [
  { value: "all", label: "All genders" },
  { value: "male", label: "Male" },
  { value: "female", label: "Female" },
];

export function ShoesFilters({
  gender,
  onGenderChange,
  idNfc,
  onIdNfcChange,
}: {
  gender: string;
  onGenderChange: (value: string) => void;
  idNfc: string;
  onIdNfcChange: (value: string) => void;
}) {
  return (
    <div className="flex flex-wrap items-center gap-2.5">
      <Select value={gender || "all"} onValueChange={(v) => onGenderChange(v === "all" ? "" : v)}>
        <SelectTrigger className="w-[150px]">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {GENDER_OPTIONS.map((option) => (
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
