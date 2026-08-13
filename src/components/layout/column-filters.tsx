"use client";

import { useState } from "react";
import { Filter } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";

function FilterTrigger({ active }: { active: boolean }) {
  return (
    <PopoverTrigger asChild>
      <button
        type="button"
        onClick={(e) => e.stopPropagation()}
        title="Filter"
        className={cn(
          "rounded p-0.5 transition-colors",
          active ? "text-primary" : "text-text-faint hover:text-foreground",
        )}
      >
        <Filter className="size-3" />
      </button>
    </PopoverTrigger>
  );
}

// AG Grid-style "set filter": pick which distinct values stay visible.
// `included: null` means no filter applied (everything shown).
export function SetColumnFilter({
  options,
  included,
  onChange,
}: {
  options: string[];
  included: Set<string> | null;
  onChange: (included: Set<string> | null) => void;
}) {
  const [search, setSearch] = useState("");
  const effective = included ?? new Set(options);
  const visibleOptions = options.filter((o) => o.toLowerCase().includes(search.toLowerCase()));
  const allVisibleChecked = visibleOptions.length > 0 && visibleOptions.every((o) => effective.has(o));

  const commit = (next: Set<string>) => {
    onChange(next.size === options.length ? null : next);
  };

  const toggleValue = (value: string, checked: boolean) => {
    const next = new Set(effective);
    if (checked) next.add(value);
    else next.delete(value);
    commit(next);
  };

  const toggleAllVisible = (checked: boolean) => {
    const next = new Set(effective);
    for (const option of visibleOptions) {
      if (checked) next.add(option);
      else next.delete(option);
    }
    commit(next);
  };

  return (
    <Popover>
      <FilterTrigger active={included !== null} />
      <PopoverContent className="w-60 p-0" align="start" onClick={(e) => e.stopPropagation()}>
        <div className="border-b border-border-soft p-2">
          <Input
            autoFocus
            placeholder="Search…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-8"
          />
        </div>
        <div className="max-h-64 overflow-y-auto p-1">
          <label className="flex cursor-pointer items-center gap-2 rounded-md px-2 py-1.5 text-sm font-medium hover:bg-accent">
            <Checkbox
              checked={allVisibleChecked}
              onCheckedChange={(checked) => toggleAllVisible(checked === true)}
            />
            Select all
          </label>
          {visibleOptions.map((option) => (
            <label
              key={option}
              className="flex cursor-pointer items-center gap-2 rounded-md px-2 py-1.5 text-sm hover:bg-accent"
            >
              <Checkbox
                checked={effective.has(option)}
                onCheckedChange={(checked) => toggleValue(option, checked === true)}
              />
              <span className="truncate">{option || "(empty)"}</span>
            </label>
          ))}
          {visibleOptions.length === 0 && (
            <p className="px-2 py-1.5 text-sm text-text-faint">No matches.</p>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}
