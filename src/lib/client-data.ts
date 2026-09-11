import type { Session } from "@/types/auth";
import type { TestRecord } from "@/lib/xano/tests";
import type { TestShoeRecord } from "@/lib/xano/test-shoe";
import type { ShoeRecord } from "@/lib/xano/shoes";
import type { ResultRecord } from "@/lib/xano/results";
import type { UserProfileRecord } from "@/lib/xano/user-profiles";
import type { ShoeBrandRecord } from "@/lib/xano/shoe-brands";
import { safeListClientTests } from "@/lib/xano/tests";
import { safeListClientTestShoes } from "@/lib/xano/test-shoe";
import { safeListClientShoes } from "@/lib/xano/shoes";
import { safeListClientResults } from "@/lib/xano/results";
import { safeListClientUserProfiles } from "@/lib/xano/user-profiles";
import { buildRunDetailsFromResults, type RunDetails } from "@/features/user-profile/run-details";
import {
  MYBRAND_BRAND,
  MYBRAND_PROFILES,
  MYBRAND_RESULTS,
  MYBRAND_RUN_DETAILS,
  MYBRAND_SHOES,
  MYBRAND_TESTS,
  MYBRAND_TEST_SHOES,
} from "@/lib/mock/mybrand";

export interface ClientData {
  tests: TestRecord[];
  shoes: ShoeRecord[];
  testShoes: TestShoeRecord[];
  results: ResultRecord[];
  profiles: UserProfileRecord[];
  brands: ShoeBrandRecord[];
  runDetailsByPostId: Map<number, RunDetails>;
  isDemo: boolean;
  error: string | null;
}

// MYBRAND is a permanent sales demo running on mock data — every other
// organization gets its real, org-scoped Xano data. Every /client/* page
// calls this instead of touching MYBRAND_* or the Xano lib directly, so the
// demo/real branch lives in exactly one place.
export async function loadClientData(session: Session): Promise<ClientData> {
  if (session.user.username.toLowerCase() === "mybrand") {
    return {
      tests: MYBRAND_TESTS,
      shoes: MYBRAND_SHOES,
      testShoes: MYBRAND_TEST_SHOES,
      results: MYBRAND_RESULTS,
      profiles: MYBRAND_PROFILES,
      brands: [MYBRAND_BRAND],
      runDetailsByPostId: MYBRAND_RUN_DETAILS,
      isDemo: true,
      error: null,
    };
  }

  const [testsRes, shoesRes, testShoesRes, resultsRes, profilesRes] = await Promise.all([
    safeListClientTests(session.token),
    safeListClientShoes(session.token),
    safeListClientTestShoes(session.token),
    safeListClientResults(session.token, {}),
    safeListClientUserProfiles(session.token),
  ]);

  // The session already carries the account's own brand (brandId/brandName,
  // resolved server-side from dashboard_user.brand_id) — no need to derive
  // it from the fetched tests.
  const brands: ShoeBrandRecord[] = [
    { id: session.user.brandId ?? 0, created_at: 0, brand_name: session.user.brandName ?? "—" },
  ];

  // Tagged with the source endpoint so a failure can be pinpointed from the
  // rendered message alone — the 5 calls above run in parallel and any one
  // of them can be the actual culprit.
  const error = testsRes.error
    ? `[/test] ${testsRes.error}`
    : shoesRes.error
      ? `[/shoe] ${shoesRes.error}`
      : testShoesRes.error
        ? `[/test_shoe] ${testShoesRes.error}`
        : resultsRes.error
          ? `[/result] ${resultsRes.error}`
          : profilesRes.error
            ? `[/user_profile] ${profilesRes.error}`
            : null;

  return {
    tests: testsRes.tests,
    shoes: shoesRes.shoes,
    testShoes: testShoesRes.testShoes,
    results: resultsRes.results,
    profiles: profilesRes.profiles,
    brands,
    runDetailsByPostId: buildRunDetailsFromResults(resultsRes.results),
    isDemo: false,
    error,
  };
}
