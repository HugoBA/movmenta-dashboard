import { redirect } from "next/navigation";
import { PageHeader } from "@/components/layout/page-header";
import { UserProfileEmptyState } from "@/features/user-profile/empty-state";
import { UserProfileNotFoundState } from "@/features/user-profile/not-found-state";
import { UserProfileView } from "@/features/user-profile/user-profile-view";
import { getSession } from "@/lib/auth/session";
import { loadClientData, type ClientData } from "@/lib/client-data";

function sameNfcId(a: string, b: string) {
  return a.toLowerCase() === b.toLowerCase();
}

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ nfcId?: string }>;
}) {
  const { nfcId } = await searchParams;
  const session = await getSession();
  if (!session) redirect("/login");

  const orgName = session.user.brandName ?? "Enterprise";
  const data = await loadClientData(session);

  return (
    <div>
      {!nfcId && <PageHeader eyebrow={`${orgName} / USERS`} eyebrowTone="cyan" title="User" />}
      <UserContent data={data} nfcId={nfcId} orgName={orgName} />
    </div>
  );
}

function UserContent({ data, nfcId, orgName }: { data: ClientData; nfcId?: string; orgName: string }) {
  const { profiles, results, shoes, runDetailsByPostId, error } = data;

  if (!nfcId) {
    const searchableProfiles = profiles.filter((p) => p.id_nfc).map((p) => ({
      idNfc: p.id_nfc,
      firstName: p.firstName,
      lastName: p.lastName,
      email: p.email,
    }));

    return <UserProfileEmptyState profiles={searchableProfiles} error={error} basePath="/client" />;
  }

  const profile = profiles.find((p) => sameNfcId(p.id_nfc, nfcId));
  if (!profile) {
    return (
      <div>
        <PageHeader eyebrow={`${orgName} / USERS`} eyebrowTone="cyan" title="User" />
        <UserProfileNotFoundState nfcId={nfcId} basePath="/client" />
      </div>
    );
  }

  const profileResults = results.filter((r) => sameNfcId(r.id_nfc, nfcId));
  const shoe = shoes.find((s) => sameNfcId(s.id_nfc, nfcId));
  const siblings = profile.email
    ? profiles.filter(
        (p) => p.id !== profile.id && p.email && p.email.toLowerCase() === profile.email.toLowerCase(),
      )
    : [];

  return (
    <UserProfileView
      profile={profile}
      results={profileResults}
      shoe={shoe}
      siblings={siblings}
      nfcId={nfcId}
      basePath="/client"
      runDetailsByPostId={runDetailsByPostId}
    />
  );
}
