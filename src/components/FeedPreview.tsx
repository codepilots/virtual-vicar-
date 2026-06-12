import { useState } from 'react';
import type { AddressResource } from '../data/addressResources';
import { useFeedItems } from '../lib/api/hooks';

/**
 * "Latest from this feed" expander on an address-resource card. Fetches the
 * RSS feed only when the user opens it (so a list of cards doesn't fire six
 * requests at once) and fails soft to the plain site link.
 */
export function FeedPreview({
  resource,
  online,
}: {
  resource: AddressResource;
  online: boolean;
}) {
  const [open, setOpen] = useState(false);
  const feed = useFeedItems(open ? resource.rssUrl : undefined, online);

  if (!resource.rssUrl || !online) return null;

  return (
    <div style={{ marginTop: 8 }}>
      <button
        className="btn ghost small"
        onClick={(e) => {
          e.stopPropagation();
          setOpen((o) => !o);
        }}
      >
        {open ? 'Hide latest' : '⟳ Show latest posts'}
      </button>
      {open && feed.loading && <p className="subtle">Loading the feed…</p>}
      {open && feed.failed && (
        <p className="verify-note">
          Couldn’t load this feed (it may not allow apps to read it directly).{' '}
          <a className="link" href={resource.url} target="_blank" rel="noreferrer" onClick={(e) => e.stopPropagation()}>
            Open the site instead →
          </a>
        </p>
      )}
      {open && feed.items.length > 0 && (
        <ul className="feed-items">
          {feed.items.map((item) => (
            <li key={item.link}>
              <a className="link" href={item.link} target="_blank" rel="noreferrer" onClick={(e) => e.stopPropagation()}>
                {item.title}
              </a>
              {item.date && (
                <span className="subtle" style={{ fontSize: 12 }}>
                  {' '}
                  · {new Date(item.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
                </span>
              )}
              {item.summary && <div className="feed-summary">{item.summary}</div>}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
