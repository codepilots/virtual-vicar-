// Prepared forms for the Prayers / Intercessions slot.
//
// The structure prompts are this app's own wording. The prayers themselves are
// from the Book of Common Prayer (1662) — public domain — hand-transcribed and
// flagged `verified: false` until proofread against a printed copy (the UI
// marks them ⚠, consistent with the rest of the app).

export interface PreparedPrayer {
  id: string;
  title: string;
  text: string;
  source: string;
  verified: boolean;
  /** Hint for when this prayer is most fitting. */
  occasion?: string;
}

/** A simple, classic shape for free intercessions. */
export const INTERCESSION_PROMPTS: string[] = [
  'The Church: our bishop, this parish, and the church throughout the world.',
  'The world: places of war and disaster; those who govern; our nation and the King.',
  'Our community: this village/town, our neighbours, schools and workplaces.',
  'Those in need: the sick, the anxious, the lonely; any known to us by name.',
  'The departed: those who have died recently, and those whose memory we keep.',
];

const BCP = 'The Book of Common Prayer (1662)';

export const PREPARED_PRAYERS: PreparedPrayer[] = [
  {
    id: 'general-thanksgiving',
    title: 'A General Thanksgiving',
    source: BCP,
    verified: false,
    occasion: 'Fits almost any service; often said by all together.',
    text: `Almighty God, Father of all mercies, we thine unworthy servants do give thee most humble and hearty thanks for all thy goodness and loving-kindness to us, and to all men. We bless thee for our creation, preservation, and all the blessings of this life; but above all, for thine inestimable love in the redemption of the world by our Lord Jesus Christ; for the means of grace, and for the hope of glory. And, we beseech thee, give us that due sense of all thy mercies, that our hearts may be unfeignedly thankful, and that we shew forth thy praise, not only with our lips, but in our lives; by giving up our selves to thy service, and by walking before thee in holiness and righteousness all our days; through Jesus Christ our Lord, to whom, with thee and the Holy Ghost, be all honour and glory, world without end. Amen.`,
  },
  {
    id: 'all-conditions',
    title: 'A Prayer for all Conditions of Men',
    source: BCP,
    verified: false,
    occasion: 'A broad intercession for the world, the Church and the suffering.',
    text: `O God, the Creator and Preserver of all mankind, we humbly beseech thee for all sorts and conditions of men; that thou wouldest be pleased to make thy ways known unto them, thy saving health unto all nations. More especially we pray for the good estate of the Catholick Church; that it may be so guided and governed by thy good Spirit, that all who profess and call themselves Christians may be led into the way of truth, and hold the faith in unity of spirit, in the bond of peace, and in righteousness of life. Finally we commend to thy fatherly goodness all those who are any ways afflicted, or distressed, in mind, body, or estate; that it may please thee to comfort and relieve them, according to their several necessities, giving them patience under their sufferings, and a happy issue out of all their afflictions. And this we beg for Jesus Christ his sake. Amen.`,
  },
  {
    id: 'kings-majesty',
    title: 'A Prayer for the King’s Majesty',
    source: BCP,
    verified: false,
    occasion: 'For the Sovereign; customary at Mattins and Evensong.',
    text: `O Lord our heavenly Father, high and mighty, King of kings, Lord of lords, the only Ruler of princes, who dost from thy throne behold all the dwellers upon earth: Most heartily we beseech thee with thy favour to behold our most gracious Sovereign Lord, King Charles; and so replenish him with the grace of thy Holy Spirit, that he may alway incline to thy will, and walk in thy way: Endue him plenteously with heavenly gifts; grant him in health and wealth long to live; strengthen him that he may vanquish and overcome all his enemies; and finally after this life he may attain everlasting joy and felicity; through Jesus Christ our Lord. Amen.`,
  },
  {
    id: 'clergy-and-people',
    title: 'A Prayer for the Clergy and People',
    source: BCP,
    verified: false,
    occasion: 'For the ministry and congregation of the church.',
    text: `Almighty and everlasting God, who alone workest great marvels: Send down upon our Bishops, and Curates, and all Congregations committed to their charge, the healthful Spirit of thy grace; and that they may truly please thee, pour upon them the continual dew of thy blessing. Grant this, O Lord, for the honour of our Advocate and Mediator, Jesus Christ. Amen.`,
  },
  {
    id: 'chrysostom',
    title: 'A Prayer of St Chrysostom',
    source: BCP,
    verified: false,
    occasion: 'A fitting close to a time of intercession.',
    text: `Almighty God, who hast given us grace at this time with one accord to make our common supplications unto thee; and dost promise, that when two or three are gathered together in thy Name thou wilt grant their requests: Fulfil now, O Lord, the desires and petitions of thy servants, as may be most expedient for them; granting us in this world knowledge of thy truth, and in the world to come life everlasting. Amen.`,
  },
];
