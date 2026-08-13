import Link from "next/link";
import { LineChart } from "lucide-react";
import { TestSearch, type SearchableTest } from "./test-search";

export function TestResultsEmptyState({
  tests,
  error,
}: {
  tests: SearchableTest[];
  error: string | null;
}) {
  return (
    <div className="flex flex-col items-center px-5 py-24 text-center text-text-faint">
      <div className="mb-4 flex size-12 items-center justify-center rounded-2xl border border-primary/25 bg-primary/10">
        <LineChart className="size-5 text-primary" />
      </div>
      <h2 className="mb-2 font-heading text-base font-semibold text-muted-foreground">
        Select a test
      </h2>
      <p className="mb-6 max-w-[360px] text-[13px] leading-relaxed">
        Search by test name or brand to open its results overview.
      </p>

      {error ? (
        <p className="max-w-[360px] text-[12px] text-destructive">
          Couldn&apos;t load tests from Xano: {error}
        </p>
      ) : (
        <TestSearch tests={tests} />
      )}

      <Link
        href="/admin/tests"
        className="mt-6 text-[12px] text-text-faint underline-offset-4 hover:text-foreground hover:underline"
      >
        Or browse all tests →
      </Link>
    </div>
  );
}
