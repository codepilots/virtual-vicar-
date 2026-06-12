// Collects keyed by the liturgical-day `id` produced by the calendar engine.
//
// The Book of Common Prayer (1662) collects are public domain and bundled in
// full for the days below, keyed to the same ids the calendar engine produces.
// The Common Worship set is © The Archbishops' Council, so those remain a
// reliable link-out. Anything missing falls back to `officialCollectUrl(day)`.

import type { LiturgicalDay } from './calendar';

export type Tradition = 'Common Worship' | 'Book of Common Prayer';

export interface Collect {
  /** The Collect of the day. */
  collect: string;
  /** The Post Communion / additional collect, where relevant (optional). */
  postCommunion?: string;
  /** Source attribution shown in the UI. */
  source?: string;
}

// Common Worship collects are link-out only (copyright). Seeded placeholders
// keep the UI honest; the official link is always shown alongside.
export const COLLECTS: Record<string, Collect> = {
  'trinity-sunday': {
    collect:
      '[Collect for Trinity Sunday — see the official Common Worship text via the link below.]',
    source: 'Common Worship',
  },
  'easter-day': {
    collect:
      '[Collect for Easter Day — see the official Common Worship text via the link below.]',
    source: 'Common Worship',
  },
  'christmas-day': {
    collect:
      '[Collect for Christmas Day — see the official Common Worship text via the link below.]',
    source: 'Common Worship',
  },
};

// Book of Common Prayer (1662) collects — public domain, bundled in full.
const BCP = 'The Book of Common Prayer (1662)';
export const BCP_COLLECTS: Record<string, Collect> = {
  'advent-1': {
    source: BCP,
    collect: `Almighty God, give us grace that we may cast away the works of darkness, and put upon us the armour of light, now in the time of this mortal life, in which thy Son Jesus Christ came to visit us in great humility; that in the last day, when he shall come again in his glorious majesty to judge both the quick and the dead, we may rise to the life immortal, through him who liveth and reigneth with thee and the Holy Ghost, now and ever. Amen.`,
  },
  'advent-2': {
    source: BCP,
    collect: `Blessed Lord, who hast caused all holy Scriptures to be written for our learning: Grant that we may in such wise hear them, read, mark, learn, and inwardly digest them, that by patience and comfort of thy holy Word, we may embrace, and ever hold fast the blessed hope of everlasting life, which thou hast given us in our Saviour Jesus Christ. Amen.`,
  },
  'advent-3': {
    source: BCP,
    collect: `O Lord Jesus Christ, who at thy first coming didst send thy messenger to prepare thy way before thee: Grant that the ministers and stewards of thy mysteries may likewise so prepare and make ready thy way, by turning the hearts of the disobedient to the wisdom of the just, that at thy second coming to judge the world we may be found an acceptable people in thy sight, who livest and reignest with the Father and the Holy Spirit, ever one God, world without end. Amen.`,
  },
  'advent-4': {
    source: BCP,
    collect: `O Lord, raise up, we pray thee, thy power, and come among us, and with great might succour us; that whereas, through our sins and wickedness, we are sore let and hindered in running the race that is set before us, thy bountiful grace and mercy may speedily help and deliver us; through the satisfaction of thy Son our Lord, to whom with thee and the Holy Ghost be honour and glory, world without end. Amen.`,
  },
  'christmas-day': {
    source: BCP,
    collect: `Almighty God, who hast given us thy only-begotten Son to take our nature upon him, and as at this time to be born of a pure Virgin: Grant that we being regenerate, and made thy children by adoption and grace, may daily be renewed by thy Holy Spirit; through the same our Lord Jesus Christ, who liveth and reigneth with thee and the same Spirit ever, one God, world without end. Amen.`,
  },
  epiphany: {
    source: BCP,
    collect: `O God, who by the leading of a star didst manifest thy only-begotten Son to the Gentiles: Mercifully grant, that we, which know thee now by faith, may after this life have the fruition of thy glorious Godhead; through Jesus Christ our Lord. Amen.`,
  },
  'ash-wednesday': {
    source: BCP,
    collect: `Almighty and everlasting God, who hatest nothing that thou hast made, and dost forgive the sins of all them that are penitent: Create and make in us new and contrite hearts, that we worthily lamenting our sins, and acknowledging our wretchedness, may obtain of thee, the God of all mercy, perfect remission and forgiveness; through Jesus Christ our Lord. Amen.`,
  },
  'easter-day': {
    source: BCP,
    collect: `Almighty God, who through thine only-begotten Son Jesus Christ hast overcome death, and opened unto us the gate of everlasting life: We humbly beseech thee, that, as by thy special grace preventing us thou dost put into our minds good desires, so by thy continual help we may bring the same to good effect; through Jesus Christ our Lord, who liveth and reigneth with thee and the Holy Ghost, ever one God, world without end. Amen.`,
  },
  pentecost: {
    source: BCP,
    collect: `God, who as at this time didst teach the hearts of thy faithful people, by the sending to them the light of thy Holy Spirit: Grant us by the same Spirit to have a right judgement in all things, and evermore to rejoice in his holy comfort; through the merits of Christ Jesus our Saviour, who liveth and reigneth with thee, in the unity of the same Spirit, one God, world without end. Amen.`,
  },
  'trinity-sunday': {
    source: BCP,
    collect: `Almighty and everlasting God, who hast given unto us thy servants grace, by the confession of a true faith to acknowledge the glory of the eternal Trinity, and in the power of the Divine Majesty to worship the Unity: We beseech thee, that thou wouldest keep us stedfast in this faith, and evermore defend us from all adversities; who livest and reignest, one God, world without end. Amen.`,
  },
  'trinity-1': {
    source: BCP,
    collect: `O God, the strength of all them that put their trust in thee, Mercifully accept our prayers; and because through the weakness of our mortal nature we can do no good thing without thee, grant us the help of thy grace, that in keeping thy commandments we may please thee, both in will and deed; through Jesus Christ our Lord. Amen.`,
  },
};

/** Deep-link to the official Church of England Collects & Post Communions. */
export function officialCollectUrl(_day: LiturgicalDay): string {
  return 'https://www.churchofengland.org/prayer-and-worship/worship-texts-and-resources/common-worship/churchs-year/collects-and-post-communions';
}

/**
 * The collect for the day. For Prayer Book services we prefer the bundled
 * public-domain BCP collect; otherwise (or if that day isn't bundled) we use
 * the Common Worship seed, and finally the official link.
 */
export function getCollect(day: LiturgicalDay, tradition?: Tradition): Collect | undefined {
  if (tradition === 'Book of Common Prayer') {
    return BCP_COLLECTS[day.id] ?? COLLECTS[day.id];
  }
  return COLLECTS[day.id] ?? BCP_COLLECTS[day.id];
}
