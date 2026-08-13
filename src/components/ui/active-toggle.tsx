"use client";

import { useState, useTransition } from "react";
import { Switch } from "@/components/ui/switch";

export function ActiveToggle({
  defaultChecked,
  onToggle,
}: {
  defaultChecked: boolean;
  onToggle?: (active: boolean) => Promise<void>;
}) {
  const [checked, setChecked] = useState(defaultChecked);
  const [, startTransition] = useTransition();

  return (
    <Switch
      checked={checked}
      onCheckedChange={(next) => {
        setChecked(next);
        if (onToggle) startTransition(() => onToggle(next));
      }}
      className="data-checked:bg-brand-good"
    />
  );
}
