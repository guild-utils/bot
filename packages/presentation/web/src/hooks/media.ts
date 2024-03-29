import { useEffect } from "react";

export function useMedia(
  query: string,
  effect: (matches: boolean) => void
): void {
  useEffect(() => {
    const mql = window.matchMedia(query);
    effect(mql.matches);
    if (!mql.addListener) {
      return;
    }
    const f = (e: MediaQueryListEvent) => {
      effect(e.matches);
    };
    mql.addListener(f);
    return () => mql.removeListener(f);
  }, [query, effect]);
}
