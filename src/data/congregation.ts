// Congregation types used to filter hymn suggestions, address resources and
// the general tone of the service.

export type CongregationType =
  | 'traditional'
  | 'contemporary'
  | 'all-age'
  | 'family'
  | 'cathedral'
  | 'small-rural';

export interface CongregationOption {
  id: CongregationType;
  label: string;
  description: string;
}

export const CONGREGATION_TYPES: CongregationOption[] = [
  { id: 'traditional', label: 'Traditional', description: 'Robed choir, organ, classic hymnody and formal language.' },
  { id: 'contemporary', label: 'Contemporary', description: 'Worship band, modern songs, informal style.' },
  { id: 'all-age', label: 'All-age', description: 'Mixed ages together; accessible and participatory.' },
  { id: 'family', label: 'Family / Café', description: 'Young families, relaxed, plenty of variety.' },
  { id: 'cathedral', label: 'Cathedral / Choral', description: 'Choral tradition, sung responses and canticles.' },
  { id: 'small-rural', label: 'Small / Rural', description: 'Small numbers, no musicians; simple and said.' },
];
