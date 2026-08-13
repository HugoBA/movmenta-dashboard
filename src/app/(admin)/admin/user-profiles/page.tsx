import { PageHeader } from "@/components/layout/page-header";
import { Panel } from "@/components/layout/panel";
import { getSession } from "@/lib/auth/session";
import { safeListUserProfiles } from "@/lib/xano/user-profiles";
import { UserProfilesExplorer } from "@/features/user-profiles/user-profiles-explorer";

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ idNfc?: string }>;
}) {
  const session = await getSession();
  const { profiles, error } = session
    ? await safeListUserProfiles(session.token)
    : { profiles: [], error: null };
  const { idNfc } = await searchParams;

  return (
    <div>
      <PageHeader
        eyebrow="ADMIN CONSOLE / USER PROFILES"
        eyebrowTone="cyan"
        title="User profiles"
        subtitle="Everyone who has registered a profile in the app"
      />

      {error ? (
        <Panel title="User profiles">
          <p className="text-sm text-destructive">Couldn&apos;t load user profiles from Xano: {error}</p>
        </Panel>
      ) : (
        <UserProfilesExplorer data={profiles} initialIdNfc={idNfc} />
      )}
    </div>
  );
}
