import { useState } from 'react';
import type { AddressResource } from '../data/addressResources';
import type { FeedItem } from '../lib/api/rss';
import { useFeedItems } from '../lib/api/hooks';

/**
 * "Latest from this feed" expander on an address-resource card. Fetches the
 * RSS feed only when the user opens it (so a list of cards doesn't fire six
 * requests at once) and fails soft to the plain site link.
 *
 * Tapping an item selects that specific post/episode into the plan (via
 * `onSelectItem`); the external-link arrow opens it to read.
 */
export function FeedPreview({
  resource,
  online,
  selectedUrl,
  onSelectItem,
}: {
  resource: AddressResource;
  online: boolean;
  /** The item URL currently chosen in the plan, to mark the selection. */
  selectedUrl?: string;
  /** Called when the user picks an item to build into the plan. */
  onSelectItem?: (item: FeedItem) => void;
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
        <>
          {onSelectItem && (
            <p className="subtle" style={{ fontSize: 12, margin: '6px 0 4px' }}>
              Tap a post to build it into the plan; use ↗ to read it.
            </p>
          )}
          <ul className="feed-items">
            {feed.items.map((item) => {
              const selected = Boolean(selectedUrl) && selectedUrl === item.link;
              return (
                <li
                  key={item.link}
                  onClick={(e) => {
                    e.stopPropagation();
                    onSelectItem?.(item);
                  }}
                  style={
                    onSelectItem
                      ? {
                          cursor: 'pointer',
                          borderLeft: selected ? '3px solid var(--primary)' : '3px solid transparent',
                          paddingLeft: 6,
                        }
                      : undefined
                  }
                >
                  {selected ? '✓ ' : ''}
                  {item.title}
                  <a
                    className="link"
                    href={item.link}
                    target="_blank"
                    rel="noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    aria-label={`Open “${item.title}”`}
                    style={{ marginLeft: 6 }}
                  >
                    ↗
                  </a>
                  {item.date && (
                    <span className="subtle" style={{ fontSize: 12 }}>
                      {' '}
                      · {new Date(item.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
                    </span>
                  )}
                  {item.summary && <div className="feed-summary">{item.summary}</div>}
                </li>
              );
            })}
          </ul>
        </>
      )}
    </div>
  );
}
