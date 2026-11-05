"use client";

import { useEffect, useRef, useState } from "react";

// While the viewer is scrolled down into the table, the list they're reading
// is frozen so live updates don't move it; the caller shows a banner with
// pendingCount instead. Scrolling back up (or release()) unfreezes it.
// `activityAt` is when a row last changed (its latest scan's created_at).
export function useFrozenRows<T extends { activityAt: number }>(live: T[]) {
  const tableTopRef = useRef<HTMLDivElement>(null);
  const liveRef = useRef(live);
  useEffect(() => {
    liveRef.current = live;
  }, [live]);
  const [frozen, setFrozen] = useState<{ rows: T[]; at: number } | null>(null);

  useEffect(() => {
    const onScroll = () => {
      const top = tableTopRef.current?.getBoundingClientRect().top ?? 0;
      if (top < 0) {
        setFrozen(
          (current) =>
            current ?? {
              rows: liveRef.current,
              at: Math.max(0, ...liveRef.current.map((r) => r.activityAt)),
            },
        );
      } else {
        setFrozen(null);
      }
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const shown = frozen ? frozen.rows : live;
  const pendingCount = frozen ? live.filter((r) => r.activityAt > frozen.at).length : 0;

  const release = () => {
    setFrozen(null);
    const top = (tableTopRef.current?.getBoundingClientRect().top ?? 0) + window.scrollY - 24;
    window.scrollTo({ top: Math.max(0, top), behavior: "smooth" });
  };

  return { tableTopRef, shown, pendingCount, release };
}
