import { useEffect } from "react";
import { useState } from "react";

export function useMedia(query: string): boolean {
  const [state, update] = useState(false);
  useEffect(() => {
    const mql = window.matchMedia(query);
    update(mql.matches);
    if (!mql.addListener) {
      return;
    }
    mql.addListener((e: MediaQueryListEvent) => {
      update(e.matches);
    });
  }, []);
  return state;
}
