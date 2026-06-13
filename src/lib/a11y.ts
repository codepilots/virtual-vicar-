import type { KeyboardEvent } from 'react';

/**
 * Props that make a non-button element (a clickable card or list item) operable
 * by keyboard and announced as a button to screen readers: focusable, and
 * activated by Enter or Space. Spread alongside the element's `onClick`.
 */
export function pressable(onActivate: () => void) {
  return {
    role: 'button' as const,
    tabIndex: 0,
    onKeyDown: (e: KeyboardEvent) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        onActivate();
      }
    },
  };
}
