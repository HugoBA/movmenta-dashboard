"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { EntityAvatar } from "@/components/ui/entity-avatar";
import { initials } from "@/lib/formatting/initials";
import { cn } from "@/lib/utils";

export interface SearchableProfile {
  idNfc: string;
  firstName: string;
  lastName: string;
  email: string;
}

function matches(profile: SearchableProfile, query: string): boolean {
  const q = query.toLowerCase();
  return (
    `${profile.firstName} ${profile.lastName}`.toLowerCase().includes(q) ||
    profile.email.toLowerCase().includes(q) ||
    profile.idNfc.toLowerCase().includes(q)
  );
}

export function ProfileSearch({ profiles }: { profiles: SearchableProfile[] }) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [activeIndex, setActiveIndex] = useState(0);
  const [focused, setFocused] = useState(false);

  const results = useMemo(() => {
    const q = query.trim();
    if (!q) return [];
    return profiles.filter((profile) => matches(profile, q)).slice(0, 6);
  }, [profiles, query]);

  const showResults = focused && query.trim().length > 0;
  const select = (profile: SearchableProfile) => {
    router.push(`/admin/user?nfcId=${encodeURIComponent(profile.idNfc)}`);
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
        placeholder="Search a profile — name, email, or NFC id…"
        className="h-11 pl-10"
        autoComplete="off"
      />

      {showResults && results.length > 0 && (
        <div className="absolute inset-x-0 top-[calc(100%+6px)] z-20 overflow-hidden rounded-lg bg-popover p-1.5 text-popover-foreground shadow-lg ring-1 ring-foreground/10">
          {results.map((profile, index) => (
            <button
              key={profile.idNfc}
              type="button"
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => select(profile)}
              onMouseEnter={() => setActiveIndex(index)}
              className={cn(
                "flex w-full items-center gap-2.5 rounded-md px-2.5 py-2 text-left transition-colors",
                index === activeIndex && "bg-accent",
              )}
            >
              <EntityAvatar initials={initials(`${profile.firstName} ${profile.lastName}`) || "?"} />
              <div className="min-w-0 flex-1">
                <div className="truncate text-[13px] font-semibold">
                  {profile.firstName} {profile.lastName}
                </div>
                <div className="truncate text-[11px] text-text-faint">{profile.email}</div>
              </div>
              <span className="shrink-0 font-mono text-[10px] text-text-faint">{profile.idNfc}</span>
            </button>
          ))}
        </div>
      )}

      {showResults && results.length === 0 && (
        <div className="absolute inset-x-0 top-[calc(100%+6px)] z-20 rounded-lg bg-popover p-3 text-center text-[12px] text-text-faint shadow-lg ring-1 ring-foreground/10">
          No profile matches &quot;{query.trim()}&quot;.
        </div>
      )}
    </div>
  );
}
