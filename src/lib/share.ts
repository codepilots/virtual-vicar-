// Share and back up a service plan with no backend: encode it into a URL hash
// (so a leader can text the link to a colleague) or a downloadable JSON file,
// and read either back. Uses the Web Share API when available.

import type { ServicePlan } from './types';

// URL-safe base64 of UTF-8 JSON.
function encode(plan: ServicePlan): string {
  const json = JSON.stringify(plan);
  const b64 = btoa(unescape(encodeURIComponent(json)));
  return b64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function decode(token: string): ServicePlan | null {
  try {
    const b64 = token.replace(/-/g, '+').replace(/_/g, '/');
    const json = decodeURIComponent(escape(atob(b64)));
    const obj = JSON.parse(json) as ServicePlan;
    // Minimal shape check before trusting it.
    if (obj && typeof obj.serviceId === 'string' && typeof obj.dateIso === 'string') {
      return obj;
    }
    return null;
  } catch {
    return null;
  }
}

/** A shareable URL that reopens the app with this plan loaded. */
export function planUrl(plan: ServicePlan): string {
  const base = `${location.origin}${location.pathname}`;
  return `${base}#plan=${encode(plan)}`;
}

/** Read a plan from the current URL hash, if present, and clear the hash. */
export function readPlanFromUrl(): ServicePlan | null {
  const match = location.hash.match(/[#&]plan=([^&]+)/);
  if (!match) return null;
  const plan = decode(match[1]);
  if (plan) {
    // Tidy the address bar so a refresh doesn't keep re-importing.
    history.replaceState(null, '', `${location.pathname}${location.search}`);
  }
  return plan;
}

/** Share the plan link via the OS share sheet, or copy it to the clipboard. */
export async function sharePlan(plan: ServicePlan): Promise<'shared' | 'copied' | 'failed'> {
  const url = planUrl(plan);
  const nav = navigator as Navigator & {
    share?: (data: ShareData) => Promise<void>;
  };
  try {
    if (typeof nav.share === 'function') {
      await nav.share({ title: 'Virtual Vicar service plan', url });
      return 'shared';
    }
    await navigator.clipboard.writeText(url);
    return 'copied';
  } catch {
    try {
      await navigator.clipboard.writeText(url);
      return 'copied';
    } catch {
      return 'failed';
    }
  }
}

/** Download the plan as a .json file for safe keeping. */
export function downloadPlan(plan: ServicePlan): void {
  const blob = new Blob([JSON.stringify(plan, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `service-${plan.serviceId}-${plan.dateIso}.json`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

/** Parse a plan from an uploaded file. Resolves null on any problem. */
export function importPlanFile(file: File): Promise<ServicePlan | null> {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const obj = JSON.parse(String(reader.result)) as ServicePlan;
        resolve(obj && obj.serviceId && obj.dateIso ? obj : null);
      } catch {
        resolve(null);
      }
    };
    reader.onerror = () => resolve(null);
    reader.readAsText(file);
  });
}
