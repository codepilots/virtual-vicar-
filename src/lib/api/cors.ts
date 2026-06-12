// Public CORS passthroughs for resources whose origins don't send
// Access-Control-Allow-Origin (most blog RSS feeds, Hymnary's API).
//
// Live testing showed AllOrigins alone is unreliable, so we try a chain of
// free passthroughs in order and take the first response that the caller can
// actually parse. Each attempt is cached (see http.ts), and total worst-case
// latency is bounded by per-attempt timeouts — acceptable because these
// fetches only happen on explicit user actions (e.g. "Show latest posts").

import { cachedText } from './http';

const PROXIES: ((url: string) => string)[] = [
  (u) => `https://corsproxy.io/?url=${encodeURIComponent(u)}`,
  (u) => `https://api.allorigins.win/raw?url=${encodeURIComponent(u)}`,
  (u) => `https://api.codetabs.com/v1/proxy?quest=${encodeURIComponent(u)}`,
];

/**
 * Fetch `url` as text: directly first, then via each passthrough. `validate`
 * decides whether a response is usable (a proxy can return its own error page
 * with HTTP 200); the first candidate that validates wins. Returns null when
 * every route fails.
 */
export async function fetchTextViaCors(
  url: string,
  validate: (body: string) => boolean,
): Promise<string | null> {
  const candidates = [url, ...PROXIES.map((p) => p(url))];
  for (const candidate of candidates) {
    const body = await cachedText(candidate, { timeoutMs: 7000 });
    if (body && validate(body)) return body;
  }
  return null;
}
