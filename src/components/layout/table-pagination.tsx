import { cn } from "@/lib/utils";

export function TablePagination({
  from,
  to,
  total,
  pages,
}: {
  from: number;
  to: number;
  total: number;
  pages?: (string | number)[];
}) {
  return (
    <div className="mt-4 flex items-center justify-between text-sm text-text-faint">
      <span>
        Showing {from}–{to} of {total}
      </span>
      {pages && (
        <div className="flex gap-1.5">
          {pages.map((page, i) => (
            <span
              key={`${page}-${i}`}
              className={cn(
                "flex h-7 w-7 items-center justify-center rounded-md border text-sm",
                i === 0
                  ? "border-border bg-white/5 text-foreground"
                  : "border-border-soft text-text-faint",
              )}
            >
              {page}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
