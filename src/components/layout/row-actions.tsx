import type { ReactNode } from "react";

export interface RowAction {
  label: string;
  icon: ReactNode;
  onClick?: () => void;
}

export function RowActions({ actions }: { actions: RowAction[] }) {
  return (
    <div className="flex justify-end gap-1.5">
      {actions.map((action) => (
        <button
          key={action.label}
          type="button"
          title={action.label}
          onClick={action.onClick}
          className="flex h-8 w-8 items-center justify-center rounded-lg border border-border bg-white/[0.015] text-muted-foreground hover:text-foreground [&_svg]:size-4"
        >
          {action.icon}
        </button>
      ))}
    </div>
  );
}
