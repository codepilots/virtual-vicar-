// Keep the screen awake while a component is mounted (e.g. run mode), so the
// phone doesn't sleep mid-service. Degrades silently where the Screen Wake Lock
// API is unavailable, and re-acquires the lock when the tab becomes visible
// again (the OS releases it on tab switch / lock).

import { useEffect } from 'react';

interface WakeLockSentinelLike {
  released: boolean;
  release: () => Promise<void>;
}

export function useWakeLock(active: boolean): void {
  useEffect(() => {
    if (!active) return;
    const wl = (navigator as Navigator & {
      wakeLock?: { request: (type: 'screen') => Promise<WakeLockSentinelLike> };
    }).wakeLock;
    if (!wl) return;

    let sentinel: WakeLockSentinelLike | null = null;
    let cancelled = false;

    const acquire = async () => {
      try {
        sentinel = await wl.request('screen');
      } catch {
        /* user gesture missing or denied — not critical */
      }
    };

    const onVisible = () => {
      if (document.visibilityState === 'visible' && (!sentinel || sentinel.released)) {
        void acquire();
      }
    };

    void acquire();
    document.addEventListener('visibilitychange', onVisible);

    return () => {
      cancelled = true;
      document.removeEventListener('visibilitychange', onVisible);
      if (sentinel && !sentinel.released) void sentinel.release();
      void cancelled;
    };
  }, [active]);
}
