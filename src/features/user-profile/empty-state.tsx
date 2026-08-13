import Link from "next/link";
import { UserRoundSearch } from "lucide-react";
import { ProfileSearch, type SearchableProfile } from "./profile-search";

export function UserProfileEmptyState({
  profiles,
  error,
}: {
  profiles: SearchableProfile[];
  error: string | null;
}) {
  return (
    <div className="flex flex-col items-center px-5 py-24 text-center text-text-faint">
      <div className="mb-4 flex size-12 items-center justify-center rounded-2xl border border-primary/25 bg-primary/10">
        <UserRoundSearch className="size-5 text-primary" />
      </div>
      <h2 className="mb-2 font-heading text-base font-semibold text-muted-foreground">
        Search for a profile
      </h2>
      <p className="mb-6 max-w-[360px] text-[13px] leading-relaxed">
        Search by name, email, or NFC id to open a user profile.
      </p>

      {error ? (
        <p className="max-w-[360px] text-[12px] text-destructive">
          Couldn&apos;t load profiles from Xano: {error}
        </p>
      ) : (
        <ProfileSearch profiles={profiles} />
      )}

      <Link
        href="/admin/user-profiles"
        className="mt-6 text-[12px] text-text-faint underline-offset-4 hover:text-foreground hover:underline"
      >
        Or browse all profiles →
      </Link>
    </div>
  );
}
