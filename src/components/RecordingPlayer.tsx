import { useState } from 'react';

/**
 * One-tap playback of a chosen recording (a podcast episode). Media elements
 * stream a cross-origin file without CORS, so playback "just works" online (and
 * on iOS it uses the media channel, unaffected by the silent switch — unlike
 * the Web-Audio hymn MIDIs). "Save for offline" is best-effort: it caches the
 * file via the Cache API so the service worker can serve it later, which works
 * when the host allows it (CORS / no redirect) and silently no-ops otherwise.
 */
export function RecordingPlayer({ url }: { url: string }) {
  const [saved, setSaved] = useState<'idle' | 'saving' | 'done' | 'failed'>('idle');
  const saveOffline = async () => {
    if (!('caches' in window)) return setSaved('failed');
    setSaved('saving');
    try {
      const cache = await caches.open('vv-recordings');
      await cache.add(new Request(url, { mode: 'no-cors' }));
      setSaved('done');
    } catch {
      setSaved('failed');
    }
  };
  return (
    <div className="muted-box" style={{ marginTop: 10 }}>
      <div style={{ marginBottom: 6 }}>▶ Recording</div>
      <audio controls preload="none" src={url} style={{ width: '100%' }}>
        <a href={url}>Open the recording</a>
      </audio>
      <div className="btn-row" style={{ marginTop: 6 }}>
        <button
          className="btn ghost small"
          onClick={saveOffline}
          disabled={saved === 'saving' || saved === 'done'}
        >
          {saved === 'done'
            ? '✓ Saved for offline'
            : saved === 'saving'
              ? 'Saving…'
              : saved === 'failed'
                ? 'Couldn’t save — will stream online'
                : '⬇ Save for offline'}
        </button>
      </div>
    </div>
  );
}
