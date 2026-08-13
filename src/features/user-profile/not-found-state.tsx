import Link from "next/link";
import { UserRoundX } from "lucide-react";

export function UserProfileNotFoundState({ nfcId }: { nfcId: string }) {
  return (
    <div className="flex flex-col items-center px-5 py-28 text-center text-text-faint">
      <UserRoundX className="mb-4 size-9 opacity-50" />
      <h2 className="mb-2 font-heading text-base font-semibold text-muted-foreground">
        No profile for this sensor
      </h2>
      <p className="max-w-[380px] text-[13px] leading-relaxed">
        No user profile is linked to{" "}
        <code className="rounded-md bg-card px-1.5 py-0.5 font-mono text-brand-cyan">{nfcId}</code>. It
        could be a lab test sensor, or a profile that hasn&apos;t been registered yet.
      </p>
      <div className="mt-4 flex gap-2">
        <Link
          href={`/admin/raw-data?idNfc=${encodeURIComponent(nfcId)}`}
          className="rounded-[10px] border border-border bg-card px-3.5 py-2 text-[12px] text-muted-foreground transition-colors hover:border-white/16 hover:text-foreground"
        >
          View raw results →
        </Link>
        <Link
          href="/admin/user-profiles"
          className="rounded-[10px] border border-border bg-card px-3.5 py-2 text-[12px] text-muted-foreground transition-colors hover:border-white/16 hover:text-foreground"
        >
          View user profiles →
        </Link>
      </div>
    </div>
  );
}
