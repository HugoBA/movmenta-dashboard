import { cn } from "@/lib/utils";

export function DataTable({ children }: { children: React.ReactNode }) {
  return <table className="w-full border-collapse text-sm">{children}</table>;
}

export function DataTableHeadRow({ headers }: { headers: string[] }) {
  return (
    <thead>
      <tr>
        {headers.map((head) => (
          <th
            key={head}
            className="border-b border-border-soft pb-3 pr-3 text-left text-xs font-medium tracking-wide text-text-faint uppercase"
          >
            {head}
          </th>
        ))}
      </tr>
    </thead>
  );
}

export function DataTableRow({ children }: { children: React.ReactNode }) {
  return (
    <tr className="[&:not(:last-child)>td]:border-b [&>td]:border-border-soft hover:bg-white/[0.03]">
      {children}
    </tr>
  );
}

export function DataTableCell({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return <td className={cn("py-3.5 pr-3", className)}>{children}</td>;
}
