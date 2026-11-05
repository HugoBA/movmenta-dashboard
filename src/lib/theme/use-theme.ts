"use client";

import { useCallback, useSyncExternalStore } from "react";

export type Theme = "dark" | "light";

import { THEME_STORAGE_KEY } from "./constants";

// The `dark` class on <html> is the single source of truth: it's set before
// first paint by the inline script in the root layout (see THEME_INIT_SCRIPT),
// and every toggle just flips it — so components subscribe to the class.
function subscribe(onChange: () => void) {
  const observer = new MutationObserver(onChange);
  observer.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
  return () => observer.disconnect();
}

function getSnapshot(): Theme {
  return document.documentElement.classList.contains("dark") ? "dark" : "light";
}

export function useTheme() {
  const theme = useSyncExternalStore(subscribe, getSnapshot, () => "dark" as const);

  const setTheme = useCallback((next: Theme) => {
    document.documentElement.classList.toggle("dark", next === "dark");
    try {
      localStorage.setItem(THEME_STORAGE_KEY, next);
    } catch {
      // Storage blocked — the choice just won't persist across reloads.
    }
  }, []);

  return { theme, setTheme };
}
