// Collects keyed by the liturgical-day `id` produced by the calendar engine.
//
// The Book of Common Prayer (1662) collects are public domain and bundled in
// full for the whole year, keyed to calendar ids (with aliases for weekdays
// and feasts, and weeks-after-Trinity computed from the date of Easter).
// The Common Worship set is © The Archbishops' Council, so those remain a
// reliable link-out. Anything missing falls back to `officialCollectUrl(day)`.
//
// PROVENANCE: the BCP texts below are hand-transcribed and have NOT yet been
// proofread against a printed Prayer Book. Entries carry `verified: false`
// until checked; the UI surfaces this so a leader can verify via the link.

import { easterSunday, type LiturgicalDay } from './calendar';

export type Tradition = 'Common Worship' | 'Book of Common Prayer';

export interface Collect {
  /** The Collect of the day. */
  collect: string;
  /** The Post Communion / additional collect, where relevant (optional). */
  postCommunion?: string;
  /** Source attribution shown in the UI. */
  source?: string;
  /** True once the transcription has been proofread against a printed copy. */
  verified?: boolean;
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
const bcp = (collect: string): Collect => ({ collect, source: BCP, verified: false });

export const BCP_COLLECTS: Record<string, Collect> = {
  // ---- Advent ----
  'advent-1': bcp(
    `Almighty God, give us grace that we may cast away the works of darkness, and put upon us the armour of light, now in the time of this mortal life, in which thy Son Jesus Christ came to visit us in great humility; that in the last day, when he shall come again in his glorious majesty to judge both the quick and the dead, we may rise to the life immortal, through him who liveth and reigneth with thee and the Holy Ghost, now and ever. Amen.`,
  ),
  'advent-2': bcp(
    `Blessed Lord, who hast caused all holy Scriptures to be written for our learning: Grant that we may in such wise hear them, read, mark, learn, and inwardly digest them, that by patience and comfort of thy holy Word, we may embrace, and ever hold fast the blessed hope of everlasting life, which thou hast given us in our Saviour Jesus Christ. Amen.`,
  ),
  'advent-3': bcp(
    `O Lord Jesus Christ, who at thy first coming didst send thy messenger to prepare thy way before thee: Grant that the ministers and stewards of thy mysteries may likewise so prepare and make ready thy way, by turning the hearts of the disobedient to the wisdom of the just, that at thy second coming to judge the world we may be found an acceptable people in thy sight, who livest and reignest with the Father and the Holy Spirit, ever one God, world without end. Amen.`,
  ),
  'advent-4': bcp(
    `O Lord, raise up, we pray thee, thy power, and come among us, and with great might succour us; that whereas, through our sins and wickedness, we are sore let and hindered in running the race that is set before us, thy bountiful grace and mercy may speedily help and deliver us; through the satisfaction of thy Son our Lord, to whom with thee and the Holy Ghost be honour and glory, world without end. Amen.`,
  ),

  // ---- Christmas & Epiphany ----
  'christmas-day': bcp(
    `Almighty God, who hast given us thy only-begotten Son to take our nature upon him, and as at this time to be born of a pure Virgin: Grant that we being regenerate, and made thy children by adoption and grace, may daily be renewed by thy Holy Spirit; through the same our Lord Jesus Christ, who liveth and reigneth with thee and the same Spirit ever, one God, world without end. Amen.`,
  ),
  circumcision: bcp(
    `Almighty God, who madest thy blessed Son to be circumcised, and obedient to the law for man: Grant us the true circumcision of the Spirit; that, our hearts, and all our members, being mortified from all worldly and carnal lusts, we may in all things obey thy blessed will; through the same thy Son Jesus Christ our Lord. Amen.`,
  ),
  epiphany: bcp(
    `O God, who by the leading of a star didst manifest thy only-begotten Son to the Gentiles: Mercifully grant, that we, which know thee now by faith, may after this life have the fruition of thy glorious Godhead; through Jesus Christ our Lord. Amen.`,
  ),
  'epiphany-1': bcp(
    `O Lord, we beseech thee mercifully to receive the prayers of thy people which call upon thee; and grant that they may both perceive and know what things they ought to do, and also may have grace and power faithfully to fulfil the same; through Jesus Christ our Lord. Amen.`,
  ),
  'epiphany-2': bcp(
    `Almighty and everlasting God, who dost govern all things in heaven and earth: Mercifully hear the supplications of thy people, and grant us thy peace all the days of our life; through Jesus Christ our Lord. Amen.`,
  ),
  'epiphany-3': bcp(
    `Almighty and everlasting God, mercifully look upon our infirmities, and in all our dangers and necessities stretch forth thy right hand to help and defend us; through Jesus Christ our Lord. Amen.`,
  ),
  'epiphany-4': bcp(
    `O God, who knowest us to be set in the midst of so many and great dangers, that by reason of the frailty of our nature we cannot always stand upright: Grant to us such strength and protection, as may support us in all dangers, and carry us through all temptations; through Jesus Christ our Lord. Amen.`,
  ),
  'epiphany-5': bcp(
    `O Lord, we beseech thee to keep thy Church and household continually in thy true religion; that they who do lean only upon the hope of thy heavenly grace may evermore be defended by thy mighty power; through Jesus Christ our Lord. Amen.`,
  ),
  'epiphany-6': bcp(
    `O God, whose blessed Son was manifested that he might destroy the works of the devil, and make us the sons of God, and heirs of eternal life: Grant us, we beseech thee, that, having this hope, we may purify ourselves, even as he is pure; that, when he shall appear again with power and great glory, we may be made like unto him in his eternal and glorious kingdom; where with thee, O Father, and thee, O Holy Ghost, he liveth and reigneth, ever one God, world without end. Amen.`,
  ),
  candlemas: bcp(
    `Almighty and everliving God, we humbly beseech thy Majesty, that, as thy only-begotten Son was this day presented in the temple in substance of our flesh, so we may be presented unto thee with pure and clean hearts, by the same thy Son Jesus Christ our Lord. Amen.`,
  ),

  // ---- Before Lent (Quinquagesima, Sexagesima, Septuagesima) ----
  'before-lent-1': bcp(
    `O Lord, who hast taught us that all our doings without charity are nothing worth: Send thy Holy Ghost, and pour into our hearts that most excellent gift of charity, the very bond of peace and of all virtues, without which whosoever liveth is counted dead before thee: Grant this for thine only Son Jesus Christ's sake. Amen.`,
  ),
  'before-lent-2': bcp(
    `O Lord God, who seest that we put not our trust in any thing that we do: Mercifully grant that by thy power we may be defended against all adversity; through Jesus Christ our Lord. Amen.`,
  ),
  'before-lent-3': bcp(
    `O Lord, we beseech thee favourably to hear the prayers of thy people; that we, who are justly punished for our offences, may be mercifully delivered by thy goodness, for the glory of thy Name; through Jesus Christ our Saviour, who liveth and reigneth with thee and the Holy Ghost, ever one God, world without end. Amen.`,
  ),

  // ---- Lent & Passiontide ----
  'ash-wednesday': bcp(
    `Almighty and everlasting God, who hatest nothing that thou hast made, and dost forgive the sins of all them that are penitent: Create and make in us new and contrite hearts, that we worthily lamenting our sins, and acknowledging our wretchedness, may obtain of thee, the God of all mercy, perfect remission and forgiveness; through Jesus Christ our Lord. Amen.`,
  ),
  'lent-1': bcp(
    `O Lord, who for our sake didst fast forty days and forty nights: Give us grace to use such abstinence, that, our flesh being subdued to the Spirit, we may ever obey thy godly motions in righteousness, and true holiness, to thy honour and glory, who livest and reignest with the Father and the Holy Ghost, one God, world without end. Amen.`,
  ),
  'lent-2': bcp(
    `Almighty God, who seest that we have no power of ourselves to help ourselves: Keep us both outwardly in our bodies, and inwardly in our souls; that we may be defended from all adversities which may happen to the body, and from all evil thoughts which may assault and hurt the soul; through Jesus Christ our Lord. Amen.`,
  ),
  'lent-3': bcp(
    `We beseech thee, Almighty God, look upon the hearty desires of thy humble servants, and stretch forth the right hand of thy Majesty, to be our defence against all our enemies; through Jesus Christ our Lord. Amen.`,
  ),
  'lent-4': bcp(
    `Grant, we beseech thee, Almighty God, that we, who for our evil deeds do worthily deserve to be punished, by the comfort of thy grace may mercifully be relieved; through our Lord and Saviour Jesus Christ. Amen.`,
  ),
  'lent-5': bcp(
    `We beseech thee, Almighty God, mercifully to look upon thy people; that by thy great goodness they may be governed and preserved evermore, both in body and soul; through Jesus Christ our Lord. Amen.`,
  ),
  'palm-sunday': bcp(
    `Almighty and everlasting God, who, of thy tender love towards mankind, hast sent thy Son our Saviour Jesus Christ, to take upon him our flesh, and to suffer death upon the cross, that all mankind should follow the example of his great humility: Mercifully grant, that we may both follow the example of his patience, and also be made partakers of his resurrection; through the same Jesus Christ our Lord. Amen.`,
  ),
  'good-friday': bcp(
    `Almighty God, we beseech thee graciously to behold this thy family, for which our Lord Jesus Christ was contented to be betrayed, and given up into the hands of wicked men, and to suffer death upon the cross, who now liveth and reigneth with thee and the Holy Ghost, ever one God, world without end. Amen.`,
  ),

  // ---- Easter to Whitsun ----
  'easter-day': bcp(
    `Almighty God, who through thine only-begotten Son Jesus Christ hast overcome death, and opened unto us the gate of everlasting life: We humbly beseech thee, that, as by thy special grace preventing us thou dost put into our minds good desires, so by thy continual help we may bring the same to good effect; through Jesus Christ our Lord, who liveth and reigneth with thee and the Holy Ghost, ever one God, world without end. Amen.`,
  ),
  'easter-2': bcp(
    `Almighty Father, who hast given thine only Son to die for our sins, and to rise again for our justification: Grant us so to put away the leaven of malice and wickedness, that we may alway serve thee in pureness of living and truth; through the merits of the same thy Son Jesus Christ our Lord. Amen.`,
  ),
  'easter-3': bcp(
    `Almighty God, who hast given thine only Son to be unto us both a sacrifice for sin, and also an ensample of godly life: Give us grace that we may always most thankfully receive that his inestimable benefit, and also daily endeavour ourselves to follow the blessed steps of his most holy life; through the same Jesus Christ our Lord. Amen.`,
  ),
  'easter-4': bcp(
    `Almighty God, who shewest to them that be in error the light of thy truth, to the intent that they may return into the way of righteousness: Grant unto all them that are admitted into the fellowship of Christ's religion, that they may eschew those things that are contrary to their profession, and follow all such things as are agreeable to the same; through our Lord Jesus Christ. Amen.`,
  ),
  'easter-5': bcp(
    `O Almighty God, who alone canst order the unruly wills and affections of sinful men: Grant unto thy people, that they may love the thing which thou commandest, and desire that which thou dost promise; that so, among the sundry and manifold changes of the world, our hearts may surely there be fixed, where true joys are to be found; through Jesus Christ our Lord. Amen.`,
  ),
  'easter-6': bcp(
    `O Lord, from whom all good things do come: Grant to us thy humble servants, that by thy holy inspiration we may think those things that be good, and by thy merciful guiding may perform the same; through our Lord Jesus Christ. Amen.`,
  ),
  'ascension-day': bcp(
    `Grant, we beseech thee, Almighty God, that like as we do believe thy only-begotten Son our Lord Jesus Christ to have ascended into the heavens; so we may also in heart and mind thither ascend, and with him continually dwell, who liveth and reigneth with thee and the Holy Ghost, one God, world without end. Amen.`,
  ),
  'easter-7': bcp(
    `O God the King of glory, who hast exalted thine only Son Jesus Christ with great triumph unto thy kingdom in heaven: We beseech thee, leave us not comfortless; but send to us thine Holy Ghost to comfort us, and exalt us unto the same place whither our Saviour Christ is gone before, who liveth and reigneth with thee and the Holy Ghost, one God, world without end. Amen.`,
  ),
  pentecost: bcp(
    `God, who as at this time didst teach the hearts of thy faithful people, by the sending to them the light of thy Holy Spirit: Grant us by the same Spirit to have a right judgement in all things, and evermore to rejoice in his holy comfort; through the merits of Christ Jesus our Saviour, who liveth and reigneth with thee, in the unity of the same Spirit, one God, world without end. Amen.`,
  ),

  // ---- Trinity and the Sundays after ----
  'trinity-sunday': bcp(
    `Almighty and everlasting God, who hast given unto us thy servants grace, by the confession of a true faith to acknowledge the glory of the eternal Trinity, and in the power of the Divine Majesty to worship the Unity: We beseech thee, that thou wouldest keep us stedfast in this faith, and evermore defend us from all adversities; who livest and reignest, one God, world without end. Amen.`,
  ),
  'trinity-1': bcp(
    `O God, the strength of all them that put their trust in thee, Mercifully accept our prayers; and because through the weakness of our mortal nature we can do no good thing without thee, grant us the help of thy grace, that in keeping thy commandments we may please thee, both in will and deed; through Jesus Christ our Lord. Amen.`,
  ),
  'trinity-2': bcp(
    `O Lord, who never failest to help and govern them whom thou dost bring up in thy stedfast fear and love: Keep us, we beseech thee, under the protection of thy good providence, and make us to have a perpetual fear and love of thy holy Name; through Jesus Christ our Lord. Amen.`,
  ),
  'trinity-3': bcp(
    `O Lord, we beseech thee mercifully to hear us; and grant that we, to whom thou hast given an hearty desire to pray, may by thy mighty aid be defended and comforted in all dangers and adversities; through Jesus Christ our Lord. Amen.`,
  ),
  'trinity-4': bcp(
    `O God, the protector of all that trust in thee, without whom nothing is strong, nothing is holy: Increase and multiply upon us thy mercy; that, thou being our ruler and guide, we may so pass through things temporal, that we finally lose not the things eternal: Grant this, O heavenly Father, for Jesus Christ's sake our Lord. Amen.`,
  ),
  'trinity-5': bcp(
    `Grant, O Lord, we beseech thee, that the course of this world may be so peaceably ordered by thy governance, that thy Church may joyfully serve thee in all godly quietness; through Jesus Christ our Lord. Amen.`,
  ),
  'trinity-6': bcp(
    `O God, who hast prepared for them that love thee such good things as pass man's understanding: Pour into our hearts such love toward thee, that we, loving thee above all things, may obtain thy promises, which exceed all that we can desire; through Jesus Christ our Lord. Amen.`,
  ),
  'trinity-7': bcp(
    `Lord of all power and might, who art the author and giver of all good things: Graft in our hearts the love of thy Name, increase in us true religion, nourish us with all goodness, and of thy great mercy keep us in the same; through Jesus Christ our Lord. Amen.`,
  ),
  'trinity-8': bcp(
    `O God, whose never-failing providence ordereth all things both in heaven and earth: We humbly beseech thee to put away from us all hurtful things, and to give us those things which be profitable for us; through Jesus Christ our Lord. Amen.`,
  ),
  'trinity-9': bcp(
    `Grant to us, Lord, we beseech thee, the spirit to think and do always such things as be rightful; that we, who cannot do any thing that is good without thee, may by thee be enabled to live according to thy will; through Jesus Christ our Lord. Amen.`,
  ),
  'trinity-10': bcp(
    `Let thy merciful ears, O Lord, be open to the prayers of thy humble servants; and that they may obtain their petitions make them to ask such things as shall please thee; through Jesus Christ our Lord. Amen.`,
  ),
  'trinity-11': bcp(
    `O God, who declarest thy almighty power most chiefly in shewing mercy and pity: Mercifully grant unto us such a measure of thy grace, that we, running the way of thy commandments, may obtain thy gracious promises, and be made partakers of thy heavenly treasure; through Jesus Christ our Lord. Amen.`,
  ),
  'trinity-12': bcp(
    `Almighty and everlasting God, who art always more ready to hear than we to pray, and art wont to give more than either we desire, or deserve: Pour down upon us the abundance of thy mercy; forgiving us those things whereof our conscience is afraid, and giving us those good things which we are not worthy to ask, but through the merits and mediation of Jesus Christ, thy Son, our Lord. Amen.`,
  ),
  'trinity-13': bcp(
    `Almighty and merciful God, of whose only gift it cometh that thy faithful people do unto thee true and laudable service: Grant, we beseech thee, that we may so faithfully serve thee in this life, that we fail not finally to attain thy heavenly promises; through the merits of Jesus Christ our Lord. Amen.`,
  ),
  'trinity-14': bcp(
    `Almighty and everlasting God, give unto us the increase of faith, hope, and charity; and, that we may obtain that which thou dost promise, make us to love that which thou dost command; through Jesus Christ our Lord. Amen.`,
  ),
  'trinity-15': bcp(
    `Keep, we beseech thee, O Lord, thy Church with thy perpetual mercy: and, because the frailty of man without thee cannot but fall, keep us ever by thy help from all things hurtful, and lead us to all things profitable to our salvation; through Jesus Christ our Lord. Amen.`,
  ),
  'trinity-16': bcp(
    `O Lord, we beseech thee, let thy continual pity cleanse and defend thy Church; and, because it cannot continue in safety without thy succour, preserve it evermore by thy help and goodness; through Jesus Christ our Lord. Amen.`,
  ),
  'trinity-17': bcp(
    `Lord, we pray thee that thy grace may always prevent and follow us, and make us continually to be given to all good works; through Jesus Christ our Lord. Amen.`,
  ),
  'trinity-18': bcp(
    `Lord, we beseech thee, grant thy people grace to withstand the temptations of the world, the flesh, and the devil, and with pure hearts and minds to follow thee the only God; through Jesus Christ our Lord. Amen.`,
  ),
  'trinity-19': bcp(
    `O God, forasmuch as without thee we are not able to please thee: Mercifully grant, that thy Holy Spirit may in all things direct and rule our hearts; through Jesus Christ our Lord. Amen.`,
  ),
  'trinity-20': bcp(
    `O Almighty and most merciful God, of thy bountiful goodness keep us, we beseech thee, from all things that may hurt us; that we, being ready both in body and soul, may cheerfully accomplish those things that thou wouldest have done; through Jesus Christ our Lord. Amen.`,
  ),
  'trinity-21': bcp(
    `Grant, we beseech thee, merciful Lord, to thy faithful people pardon and peace, that they may be cleansed from all their sins, and serve thee with a quiet mind; through Jesus Christ our Lord. Amen.`,
  ),
  'trinity-22': bcp(
    `Lord, we beseech thee to keep thy household the Church in continual godliness; that through thy protection it may be free from all adversities, and devoutly given to serve thee in good works, to the glory of thy Name; through Jesus Christ our Lord. Amen.`,
  ),
  'trinity-23': bcp(
    `O God, our refuge and strength, who art the author of all godliness: Be ready, we beseech thee, to hear the devout prayers of thy Church; and grant that those things which we ask faithfully we may obtain effectually; through Jesus Christ our Lord. Amen.`,
  ),
  'trinity-24': bcp(
    `O Lord, we beseech thee, absolve thy people from their offences; that through thy bountiful goodness we may all be delivered from the bands of those sins, which by our frailty we have committed: Grant this, O heavenly Father, for Jesus Christ's sake, our blessed Lord and Saviour. Amen.`,
  ),
  'stir-up': bcp(
    `Stir up, we beseech thee, O Lord, the wills of thy faithful people; that they, plenteously bringing forth the fruit of good works, may of thee be plenteously rewarded; through Jesus Christ our Lord. Amen.`,
  ),
};

// Aliases: calendar ids that resolve to another entry's collect. Weekdays use
// the previous Sunday's collect per the Prayer Book's pattern of repetition.
const BCP_ALIASES: Record<string, string> = {
  'christmas-1': 'christmas-day',
  'christmas-2': 'circumcision',
  'epiphany-weekday': 'epiphany',
  'baptism-of-christ': 'epiphany-1',
  'easter-weekday': 'easter-day',
  'holy-week': 'palm-sunday',
  'maundy-thursday': 'palm-sunday',
  'christ-the-king': 'stir-up',
  'trinity-25': 'stir-up',
};

const DAY_MS = 86_400_000;

/** Weeks elapsed since Trinity Sunday for a date (0 = Trinity week itself). */
function weeksAfterTrinity(date: Date): number {
  const easter = easterSunday(date.getFullYear());
  const trinity = new Date(easter.getTime() + 56 * DAY_MS);
  return Math.floor((date.getTime() - trinity.getTime()) / (7 * DAY_MS));
}

/** Resolve the BCP collect for a liturgical day, following aliases. */
export function getBcpCollect(day: LiturgicalDay): Collect | undefined {
  // Ordinary Time after Trinity is keyed by Proper number in the calendar,
  // but the BCP keys by weeks after Trinity — compute it from Easter.
  if (day.season === 'Ordinary Time after Trinity' && day.id !== 'trinity-sunday') {
    if (day.id === 'christ-the-king') return BCP_COLLECTS['stir-up'];
    const week = weeksAfterTrinity(day.date);
    if (week >= 1) {
      // Beyond Trinity 24 the BCP reuses earlier collects; we use Stir-up for
      // the final Sunday and clamp anything else to 24.
      const key = week >= 25 ? 'stir-up' : `trinity-${Math.min(week, 24)}`;
      return BCP_COLLECTS[key];
    }
    return BCP_COLLECTS['trinity-sunday'];
  }

  // Weekday ids like advent-week-2 / lent-week-3 → that week's Sunday collect.
  const weekday = day.id.match(/^(advent|lent)-week-(\d+)$/);
  const id = weekday ? `${weekday[1]}-${weekday[2]}` : (BCP_ALIASES[day.id] ?? day.id);
  return BCP_COLLECTS[id];
}

/**
 * Deep-link to the official Church of England Collects & Post Communions
 * (Additional Collects volume). The old `…/churchs-year/collects-and-post-communions`
 * URL was retired in a site restructure and now lands on a site search.
 */
export function officialCollectUrl(_day: LiturgicalDay): string {
  return 'https://www.churchofengland.org/prayer-and-worship/worship-texts-and-resources/common-worship/common-material/collects-and-post-26';
}

/**
 * The collect for the day. For Prayer Book services we prefer the bundled
 * public-domain BCP collect; for Common Worship we use only the CW seed (and
 * otherwise the official link in the UI) — a CW service must not be given a BCP
 * collect, which is a different prayer. With no tradition stated, fall back
 * across both as a best effort.
 */
export function getCollect(day: LiturgicalDay, tradition?: Tradition): Collect | undefined {
  if (tradition === 'Book of Common Prayer') {
    return getBcpCollect(day) ?? COLLECTS[day.id];
  }
  if (tradition === 'Common Worship') {
    return COLLECTS[day.id];
  }
  return COLLECTS[day.id] ?? getBcpCollect(day);
}
