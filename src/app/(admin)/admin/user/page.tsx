import { Suspense } from "react";
import { PageHeader } from "@/components/layout/page-header";
import { Panel } from "@/components/layout/panel";
import { ContentLoader } from "@/components/layout/content-loader";
import { getSession } from "@/lib/auth/session";
import { safeListUserProfiles, type UserProfileRecord } from "@/lib/xano/user-profiles";
import { safeListResults } from "@/lib/xano/results";
import { safeListShoes, type ShoeRecord } from "@/lib/xano/shoes";
import type { ResultRecord } from "@/lib/xano/results";
import { UserProfileEmptyState } from "@/features/user-profile/empty-state";
import { UserProfileNotFoundState } from "@/features/user-profile/not-found-state";
import { UserProfileView } from "@/features/user-profile/user-profile-view";

function sameNfcId(a: string, b: string) {
  return a.toLowerCase() === b.toLowerCase();
}

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ nfcId?: string }>;
}) {
  const { nfcId } = await searchParams;

  return (
    <div>
      {!nfcId && <PageHeader eyebrow="ADMIN CONSOLE / USERS" eyebrowTone="cyan" title="User" />}
      <Suspense fallback={<ContentLoader />}>
        <UserContent nfcId={nfcId} />
      </Suspense>
    </div>
  );
}

async function UserContent({ nfcId }: { nfcId?: string }) {
  const session = await getSession();

  if (!nfcId) {
    const { profiles, error } = session
      ? await safeListUserProfiles(session.token)
      : { profiles: [] as UserProfileRecord[], error: null as string | null };

    const searchableProfiles = profiles
      .filter((p) => p.id_nfc)
      .map((p) => ({ idNfc: p.id_nfc, firstName: p.firstName, lastName: p.lastName, email: p.email }));

    return <UserProfileEmptyState profiles={searchableProfiles} error={error} />;
  }

  // Three independent Xano reads (profile, results, shoe) joined client-side
  // on id_nfc — Xano doesn't expose a single endpoint for this yet.
  const [
    { profiles, error: profilesError },
    { results, error: resultsError },
    { shoes, error: shoesError },
  ] = session
    ? await Promise.all([
        safeListUserProfiles(session.token),
        safeListResults(session.token, { idNfc: nfcId }),
        safeListShoes(session.token),
      ])
    : [
        { profiles: [] as UserProfileRecord[], error: null as string | null },
        { results: [] as ResultRecord[], error: null as string | null },
        { shoes: [] as ShoeRecord[], error: null as string | null },
      ];

  const error = profilesError ?? resultsError ?? shoesError;
  if (error) {
    return (
      <div>
        <PageHeader eyebrow="ADMIN CONSOLE / USERS" eyebrowTone="cyan" title="User" />
        <Panel title="User">
          <p className="text-sm text-destructive">Couldn&apos;t load this profile from Xano: {error}</p>
        </Panel>
      </div>
    );
  }

  const profile = profiles.find((p) => sameNfcId(p.id_nfc, nfcId));
  if (!profile) {
    return (
      <div>
        <PageHeader eyebrow="ADMIN CONSOLE / USERS" eyebrowTone="cyan" title="User" />
        <UserProfileNotFoundState nfcId={nfcId} />
      </div>
    );
  }

  const shoe = shoes.find((s) => sameNfcId(s.id_nfc, nfcId));
  const siblings = profile.email
    ? profiles.filter(
        (p) => p.id !== profile.id && p.email && p.email.toLowerCase() === profile.email.toLowerCase(),
      )
    : [];

  return <UserProfileView profile={profile} results={results} shoe={shoe} siblings={siblings} nfcId={nfcId} />;
}
