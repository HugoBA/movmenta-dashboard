"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

export interface SearchableTest {
  id: number;
  name: string;
  brandName: string;
}

function matches(test: SearchableTest, query: string): boolean {
  const q = query.toLowerCase();
  return test.name.toLowerCase().includes(q) || test.brandName.toLowerCase().includes(q);
}

export function TestSearch({ tests }: { tests: SearchableTest[] }) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [activeIndex, setActiveIndex] = useState(0);
  const [focused, setFocused] = useState(false);

  const results = useMemo(() => {
    const q = query.trim();
    const pool = q ? tests.filter((test) => matches(test, q)) : tests;
    return pool.slice(0, 8);
  }, [tests, query]);

  const showResults = focused && results.length > 0;
  const select = (test: SearchableTest) => {
    router.push(`/admin/test-results?testId=${test.id}`);
  };

  return (
    <div className="relative w-full max-w-md text-left">
      <Search className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-primary/70" />
      <Input
        value={query}
        onChange={(e) => {
          setQuery(e.target.value);
          setActiveIndex(0);
        }}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        onKeyDown={(e) => {
          if (results.length === 0) return;
          if (e.key === "ArrowDown") {
            e.preventDefault();
            setActiveIndex((i) => Math.min(i + 1, results.length - 1));
          } else if (e.key === "ArrowUp") {
            e.preventDefault();
            setActiveIndex((i) => Math.max(i - 1, 0));
          } else if (e.key === "Enter") {
            e.preventDefault();
            select(results[activeIndex]);
          } else if (e.key === "Escape") {
            setQuery("");
          }
        }}
        placeholder="Search a test — name or brand…"
        className="h-11 pl-10"
        autoComplete="off"
      />

      {showResults && (
        <div className="absolute inset-x-0 top-[calc(100%+6px)] z-20 overflow-hidden rounded-lg bg-popover p-1.5 text-popover-foreground shadow-lg ring-1 ring-foreground/10">
          {results.map((test, index) => (
            <button
              key={test.id}
              type="button"
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => select(test)}
              onMouseEnter={() => setActiveIndex(index)}
              className={cn(
                "flex w-full items-center justify-between gap-2.5 rounded-md px-2.5 py-2 text-left transition-colors",
                index === activeIndex && "bg-accent",
              )}
            >
              <span className="truncate text-[13px] font-semibold">{test.name}</span>
              <span className="shrink-0 text-[11px] text-text-faint">{test.brandName}</span>
            </button>
          ))}
        </div>
      )}

      {focused && query.trim().length > 0 && results.length === 0 && (
        <div className="absolute inset-x-0 top-[calc(100%+6px)] z-20 rounded-lg bg-popover p-3 text-center text-[12px] text-text-faint shadow-lg ring-1 ring-foreground/10">
          No test matches &quot;{query.trim()}&quot;.
        </div>
      )}
    </div>
  );
}
