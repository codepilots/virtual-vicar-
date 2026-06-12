// Fetch helper for the online integrations (LectServe, bible-api.com,
// Hymnary). All calls are:
//
//  - cached in localStorage with a TTL, so a service prepared at home on
//    wi-fi still works in a poorly connected church;
//  - time-limited with AbortController;
//  - failure-tolerant: on any error we serve a stale cache entry if one
//    exists, otherwise null — callers always have an offline fallback.

const CACHE_PREFIX = 'vv.cache.';

interface CacheEntry<T> {
  /** Epoch ms when stored. */
  t: number;
  v: T;
}

function cacheRead<T>(url: string): CacheEntry<T> | null {
  try {
    const raw = localStorage.getItem(CACHE_PREFIX + url);
    return raw ? (JSON.parse(raw) as CacheEntry<T>) : null;
  } catch {
    return null;
  }
}

function cacheWrite<T>(url: string, value: T): void {
  try {
    localStorage.setItem(CACHE_PREFIX + url, JSON.stringify({ t: Date.now(), v: value }));
  } catch {
    /* storage full or unavailable — caching is best-effort */
  }
}

export interface FetchOptions {
  /** How long a cached response stays fresh. Default 7 days. */
  ttlMs?: number;
  /** Network timeout. Default 8 s. */
  timeoutMs?: number;
}

/**
 * GET a JSON resource with cache + timeout. Returns null when the resource is
 * unreachable and nothing (even stale) is cached.
 */
export async function cachedJson<T>(url: string, opts: FetchOptions = {}): Promise<T | null> {
  const ttl = opts.ttlMs ?? 7 * 24 * 3600_000;
  const cached = cacheRead<T>(url);
  if (cached && Date.now() - cached.t < ttl) return cached.v;

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), opts.timeoutMs ?? 8000);
  try {
    const res = await fetch(url, {
      signal: controller.signal,
      headers: { Accept: 'application/json' },
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const value = (await res.json()) as T;
    cacheWrite(url, value);
    return value;
  } catch {
    // Offline, CORS-blocked, timed out, or bad payload: fall back to stale.
    return cached ? cached.v : null;
  } finally {
    clearTimeout(timer);
  }
}

/**
 * GET a text/XML resource (e.g. an RSS feed) with the same cache + timeout +
 * stale-fallback behaviour as `cachedJson`.
 */
export async function cachedText(url: string, opts: FetchOptions = {}): Promise<string | null> {
  const ttl = opts.ttlMs ?? 6 * 3600_000; // feeds refresh more often
  const cached = cacheRead<string>(url);
  if (cached && Date.now() - cached.t < ttl) return cached.v;

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), opts.timeoutMs ?? 8000);
  try {
    const res = await fetch(url, { signal: controller.signal });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const value = await res.text();
    cacheWrite(url, value);
    return value;
  } catch {
    return cached ? cached.v : null;
  } finally {
    clearTimeout(timer);
  }
}
