import { Search } from "lucide-react";

export function SearchInput({ placeholder }: { placeholder: string }) {
  return (
    <div className="flex min-w-[220px] items-center gap-2 rounded-lg border border-border bg-white/[0.02] px-3 py-2.5">
      <Search className="size-4 text-text-faint" />
      <input
        placeholder={placeholder}
        className="w-full bg-transparent text-sm outline-none placeholder:text-text-faint"
      />
    </div>
  );
}
