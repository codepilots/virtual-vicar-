// Parse free-text scripture references (as returned by lectionary APIs, e.g.
// "1 Kings 19:1-15a" or "Psalm 22:18-27") into our structured ScriptureRef.
// Strings that don't resolve to a known Bible book are rejected, which lets us
// safely hunt for readings inside loosely-shaped API payloads.

import type { ScriptureRef } from '../../data/readings';

// Canonical book names plus common variants seen in lectionary data.
const BOOKS = [
  'Genesis', 'Exodus', 'Leviticus', 'Numbers', 'Deuteronomy', 'Joshua',
  'Judges', 'Ruth', '1 Samuel', '2 Samuel', '1 Kings', '2 Kings',
  '1 Chronicles', '2 Chronicles', 'Ezra', 'Nehemiah', 'Esther', 'Job',
  'Psalm', 'Psalms', 'Proverbs', 'Ecclesiastes', 'Song of Solomon',
  'Song of Songs', 'Isaiah', 'Jeremiah', 'Lamentations', 'Ezekiel', 'Daniel',
  'Hosea', 'Joel', 'Amos', 'Obadiah', 'Jonah', 'Micah', 'Nahum', 'Habakkuk',
  'Zephaniah', 'Haggai', 'Zechariah', 'Malachi',
  'Matthew', 'Mark', 'Luke', 'John', 'Acts', 'Romans',
  '1 Corinthians', '2 Corinthians', 'Galatians', 'Ephesians', 'Philippians',
  'Colossians', '1 Thessalonians', '2 Thessalonians', '1 Timothy',
  '2 Timothy', 'Titus', 'Philemon', 'Hebrews', 'James', '1 Peter', '2 Peter',
  '1 John', '2 John', '3 John', 'Jude', 'Revelation',
  // Apocrypha appearing in the C of E lectionary
  'Wisdom', 'Wisdom of Solomon', 'Sirach', 'Ecclesiasticus', 'Baruch',
  'Tobit', 'Judith', '1 Maccabees', '2 Maccabees',
];

const BOOK_LOOKUP = new Map(BOOKS.map((b) => [b.toLowerCase(), b]));

/**
 * Try to parse a string like "2 Corinthians 13:11-13" or "Psalm 8".
 * Returns null when the leading words are not a recognised book.
 */
export function parseScriptureRef(input: string): ScriptureRef | null {
  const cleaned = input
    .replace(/\([^)]*\)/g, ' ') // drop parenthetical alternates
    .replace(/\s+/g, ' ')
    .trim();
  // Book = optional leading 1/2/3 + words; passage = first digit onwards.
  const m = cleaned.match(/^([1-3]?\s?[A-Za-z][A-Za-z .']*?)\s+(\d[\d:.,;\s\-–—a-z]*)$/);
  if (!m) {
    // Whole-book references like "Philemon" or "Jude".
    const whole = BOOK_LOOKUP.get(cleaned.toLowerCase());
    return whole ? { book: normaliseBook(whole), passage: '' } : null;
  }
  const book = BOOK_LOOKUP.get(m[1].trim().toLowerCase());
  if (!book) return null;
  return {
    book: normaliseBook(book),
    passage: m[2].trim().replace(/\s+/g, ''),
  };
}

function normaliseBook(book: string): string {
  if (book === 'Psalms') return 'Psalm';
  if (book === 'Song of Songs') return 'Song of Solomon';
  return book;
}

export function isPsalmRef(ref: ScriptureRef): boolean {
  return ref.book === 'Psalm';
}

const APOCRYPHA = new Set([
  'Wisdom', 'Wisdom of Solomon', 'Sirach', 'Ecclesiasticus', 'Baruch',
  'Tobit', 'Judith', '1 Maccabees', '2 Maccabees',
]);

/** Label a parsed ref by canonical position (OT / Psalm / NT / Gospel). */
export function labelRef(ref: ScriptureRef): ScriptureRef {
  if (ref.label) return ref;
  const gospels = ['Matthew', 'Mark', 'Luke', 'John'];
  const ntStart = BOOKS.indexOf('Matthew');
  const ntEnd = BOOKS.indexOf('Revelation');
  const idx = BOOKS.indexOf(ref.book === 'Psalm' ? 'Psalm' : ref.book);
  let label: string;
  if (isPsalmRef(ref)) label = 'Psalm';
  else if (gospels.includes(ref.book)) label = 'Gospel';
  else if (idx >= ntStart && idx <= ntEnd && !APOCRYPHA.has(ref.book)) label = 'New Testament';
  else label = 'Old Testament'; // includes apocrypha (first-reading position)
  return { ...ref, label };
}
