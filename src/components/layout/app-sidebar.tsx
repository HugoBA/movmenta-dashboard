"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { logout } from "@/features/auth/actions";
import { cn } from "@/lib/utils";
import type { NavGroup } from "./nav-item";

type Variant = "client" | "admin";

const variantStyles: Record<
  Variant,
  {
    brandMark: string;
    brandMarkText: string;
    orgAvatar: string;
    orgAvatarText: string;
    activeBg: string;
    activeText: string;
    activeBar: string;
  }
> = {
  client: {
    brandMark: "bg-gradient-to-br from-primary to-[#c73f10]",
    brandMarkText: "text-[#1a0a04]",
    orgAvatar: "bg-gradient-to-br from-[#2b3040] to-[#1a1d26] border border-border",
    orgAvatarText: "text-brand-cyan",
    activeBg: "bg-primary/15",
    activeText: "text-primary",
    activeBar: "bg-primary",
  },
  admin: {
    brandMark: "bg-gradient-to-br from-[#3a3f4d] to-[#1c1f27] border border-border",
    brandMarkText: "text-brand-cyan",
    orgAvatar: "bg-gradient-to-br from-primary to-[#c73f10]",
    orgAvatarText: "text-[#1a0a04]",
    activeBg: "bg-brand-cyan/12",
    activeText: "text-brand-cyan",
    activeBar: "bg-brand-cyan",
  },
};

export function AppSidebar({
  variant,
  groups,
  org,
}: {
  variant: Variant;
  groups: NavGroup[];
  org: { name: string; role: string; initials: string };
}) {
  const pathname = usePathname();
  const styles = variantStyles[variant];

  return (
    <aside className="hidden lg:sticky lg:top-0 lg:flex lg:h-screen lg:w-[248px] lg:shrink-0 lg:flex-col border-r border-border-soft p-5">
      <div className="flex items-center gap-2.5 px-1 pb-7">
        <div
          className={cn(
            "flex h-7 w-7 items-center justify-center rounded-md font-heading text-base font-bold",
            styles.brandMark,
            styles.brandMarkText,
          )}
        >
          S
        </div>
        <div className="font-heading text-base font-semibold tracking-tight">
          Sollo <span className="font-normal text-text-faint">/ {variant}</span>
        </div>
      </div>

      <nav className="flex flex-1 flex-col gap-5 overflow-y-auto">
        {groups.map((group) => (
          <div key={group.label}>
            <div className="px-2.5 pb-2 text-xs font-semibold tracking-wider text-text-faint uppercase">
              {group.label}
            </div>
            <div className="flex flex-col gap-0.5">
              {group.items.map((item) => {
                const isActive = pathname.startsWith(item.href);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "relative flex items-center gap-2.5 rounded-lg px-2.5 py-2.5 text-sm font-medium text-muted-foreground transition-colors",
                      "hover:bg-card hover:text-foreground [&_svg]:size-4 [&_svg]:shrink-0 [&_svg]:opacity-85",
                      isActive && [styles.activeBg, styles.activeText, "[&_svg]:opacity-100"],
                    )}
                  >
                    {isActive && (
                      <span
                        className={cn(
                          "absolute -left-2 top-1/2 h-4 w-[3px] -translate-y-1/2 rounded-full",
                          styles.activeBar,
                        )}
                      />
                    )}
                    {item.icon}
                    <span>{item.title}</span>
                    {item.count && (
                      <span className="ml-auto font-mono text-xs text-text-faint">
                        {item.count}
                      </span>
                    )}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      <div className="mt-auto border-t border-border-soft pt-4">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex w-full items-center gap-2.5 rounded-lg bg-card px-2.5 py-2.5 text-left hover:bg-accent">
              <div
                className={cn(
                  "flex h-8 w-8 items-center justify-center rounded-lg font-heading text-xs font-bold",
                  styles.orgAvatar,
                  styles.orgAvatarText,
                )}
              >
                {org.initials}
              </div>
              <div>
                <div className="text-sm font-semibold">{org.name}</div>
                <div className="text-xs text-text-faint">{org.role}</div>
              </div>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" side="top">
            <DropdownMenuItem>Profil</DropdownMenuItem>
            <DropdownMenuItem asChild>
              <form action={logout} className="w-full">
                <button type="submit" className="w-full text-left">
                  Se déconnecter
                </button>
              </form>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </aside>
  );
}
