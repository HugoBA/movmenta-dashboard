import { Suspense } from "react";
import { PageHeader } from "@/components/layout/page-header";
import { Panel } from "@/components/layout/panel";
import { ContentLoader } from "@/components/layout/content-loader";
import { getSession } from "@/lib/auth/session";
import { safeListUserProfiles } from "@/lib/xano/user-profiles";
import { UserProfilesExplorer } from "@/features/user-profiles/user-profiles-explorer";

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ idNfc?: string }>;
}) {
  const { idNfc } = await searchParams;

  return (
    <div>
      <PageHeader
        eyebrow="ADMIN CONSOLE / USER PROFILES"
        eyebrowTone="cyan"
        title="User profiles"
        subtitle="Everyone who has registered a profile in the app"
      />

      <Suspense fallback={<ContentLoader />}>
        <UserProfilesContent idNfc={idNfc} />
      </Suspense>
    </div>
  );
}

async function UserProfilesContent({ idNfc }: { idNfc?: string }) {
  const session = await getSession();
  const { profiles, error } = session
    ? await safeListUserProfiles(session.token)
    : { profiles: [], error: null };

  if (error) {
    return (
      <Panel title="User profiles">
        <p className="text-sm text-destructive">Couldn&apos;t load user profiles from Xano: {error}</p>
      </Panel>
    );
  }

  return <UserProfilesExplorer data={profiles} initialIdNfc={idNfc} />;
}
