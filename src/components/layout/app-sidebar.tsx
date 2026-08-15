"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";
import { logout } from "@/features/auth/actions";
import { cn } from "@/lib/utils";
import { SolloLogo } from "./sollo-logo";
import type { NavGroup } from "./nav-item";

type Variant = "client" | "admin";

const variantStyles: Record<
  Variant,
  {
    orgAvatar: string;
    orgAvatarText: string;
    activeBg: string;
    activeText: string;
    activeBar: string;
  }
> = {
  client: {
    orgAvatar: "bg-gradient-to-br from-[#2b3040] to-[#1a1d26] border border-border",
    orgAvatarText: "text-brand-cyan",
    activeBg: "bg-primary/15",
    activeText: "text-primary",
    activeBar: "bg-primary",
  },
  admin: {
    orgAvatar: "bg-gradient-to-br from-primary to-[#c73f10]",
    orgAvatarText: "text-[#1a0a04]",
    activeBg: "bg-brand-cyan/12",
    activeText: "text-brand-cyan",
    activeBar: "bg-brand-cyan",
  },
};

type Org = { name: string; role: string; initials: string };
type Styles = (typeof variantStyles)[Variant];

function SidebarNav({
  groups,
  styles,
  pathname,
  onNavigate,
}: {
  groups: NavGroup[];
  styles: Styles;
  pathname: string;
  onNavigate?: () => void;
}) {
  return (
    <nav className="flex flex-1 flex-col gap-5 overflow-y-auto">
      {groups.map((group) => (
        <div key={group.label}>
          <div className="px-2.5 pb-2 text-xs font-semibold tracking-wider text-text-faint uppercase">
            {group.label}
          </div>
          <div className="flex flex-col gap-0.5">
            {group.items.map((item) => {
              const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={onNavigate}
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
  );
}

function OrgMenu({ org, styles }: { org: Org; styles: Styles }) {
  return (
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
  );
}

export function AppSidebar({
  variant,
  groups,
  org,
}: {
  variant: Variant;
  groups: NavGroup[];
  org: Org;
}) {
  const pathname = usePathname();
  const styles = variantStyles[variant];
  const [open, setOpen] = useState(false);

  return (
    <>
      <div className="flex items-center justify-between border-b border-border-soft px-4 py-3 lg:hidden">
        <SolloLogo className="h-5 w-auto text-foreground" />
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground hover:bg-card hover:text-foreground"
          aria-label="Ouvrir le menu"
        >
          <Menu className="size-5" />
        </button>
      </div>

      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent side="left" className="flex w-[248px] flex-col gap-0 p-5 py-7">
          <SheetTitle className="sr-only">Menu</SheetTitle>
          <div className="flex items-center gap-2.5 px-1 pb-7">
            <SolloLogo className="h-6 w-auto text-foreground" />
          </div>
          <SidebarNav
            groups={groups}
            styles={styles}
            pathname={pathname}
            onNavigate={() => setOpen(false)}
          />
          <div className="mt-auto border-t border-border-soft pt-4">
            <OrgMenu org={org} styles={styles} />
          </div>
        </SheetContent>
      </Sheet>

      <aside className="hidden lg:sticky lg:top-0 lg:flex lg:h-screen lg:w-[248px] lg:shrink-0 lg:flex-col border-r border-border-soft p-5 py-7">
        <div className="flex items-center gap-2.5 px-1 pb-7">
          <SolloLogo className="h-6 w-auto text-foreground" />
        </div>

        <SidebarNav groups={groups} styles={styles} pathname={pathname} />

        <div className="mt-auto border-t border-border-soft pt-4">
          <OrgMenu org={org} styles={styles} />
        </div>
      </aside>
    </>
  );
}
