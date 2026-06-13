// The Order for Morning and Evening Prayer from the Book of Common Prayer
// (1662). The BCP text is in the public domain, so — unlike the Common Worship
// offices — these services ship with their full, authentic wording.
//
// These two offices may be led by a lay person. The one priestly act, the
// Absolution, is handled with a rubric: in the absence of a priest the leader
// omits it (or all may use the Collect for forgiveness / a time of silence).

import type { ServiceDefinition, ServiceSection } from './services';

const GLORIA = `Glory be to the Father, and to the Son: and to the Holy Ghost;
As it was in the beginning, is now, and ever shall be: world without end. Amen.`;

const OPENING_SENTENCE = `The Lord is in his holy temple: let all the earth keep silence before him. (Habakkuk 2.20)

I will arise, and go to my Father, and will say unto him, Father, I have sinned against heaven, and before thee, and am no more worthy to be called thy son. (St Luke 15.18,19)`;

const EXHORTATION = `Dearly beloved brethren, the Scripture moveth us in sundry places to acknowledge and confess our manifold sins and wickedness; and that we should not dissemble nor cloke them before the face of Almighty God our heavenly Father; but confess them with an humble, lowly, penitent, and obedient heart; to the end that we may obtain forgiveness of the same, by his infinite goodness and mercy. And although we ought at all times humbly to acknowledge our sins before God; yet ought we most chiefly so to do, when we assemble and meet together to render thanks for the great benefits that we have received at his hands, to set forth his most worthy praise, to hear his most holy Word, and to ask those things which are requisite and necessary, as well for the body as the soul. Wherefore I pray and beseech you, as many as are here present, to accompany me with a pure heart, and humble voice, unto the throne of the heavenly grace, saying after me:`;

const GENERAL_CONFESSION = `Almighty and most merciful Father; We have erred, and strayed from thy ways like lost sheep. We have followed too much the devices and desires of our own hearts. We have offended against thy holy laws. We have left undone those things which we ought to have done; And we have done those things which we ought not to have done; And there is no health in us. But thou, O Lord, have mercy upon us, miserable offenders. Spare thou them, O God, which confess their faults. Restore thou them that are penitent; According to thy promises declared unto mankind in Christ Jesu our Lord. And grant, O most merciful Father, for his sake; That we may hereafter live a godly, righteous, and sober life, To the glory of thy holy Name. Amen.`;

const ABSOLUTION_RUBRIC = `The Absolution is pronounced by a priest alone. When a lay person or deacon leads the office, the Absolution is omitted; instead all may keep a short silence, or say together the Collect: “O God, whose nature and property is ever to have mercy and to forgive, receive our humble petitions… through Jesus Christ our Lord. Amen.”`;

const LORDS_PRAYER = `Our Father, which art in heaven, Hallowed be thy Name. Thy kingdom come. Thy will be done, in earth as it is in heaven. Give us this day our daily bread. And forgive us our trespasses, As we forgive them that trespass against us. And lead us not into temptation; But deliver us from evil. Amen.`;

const OPENING_VERSICLES = `O Lord, open thou our lips;
And our mouth shall shew forth thy praise.
O God, make speed to save us;
O Lord, make haste to help us.

${GLORIA}

Praise ye the Lord;
The Lord's Name be praised.`;

const VENITE = `O come, let us sing unto the Lord: let us heartily rejoice in the strength of our salvation.
Let us come before his presence with thanksgiving: and shew ourselves glad in him with psalms.
For the Lord is a great God: and a great King above all gods.
In his hand are all the corners of the earth: and the strength of the hills is his also.
The sea is his, and he made it: and his hands prepared the dry land.
O come, let us worship and fall down: and kneel before the Lord our Maker.
For he is the Lord our God: and we are the people of his pasture, and the sheep of his hand.
To day if ye will hear his voice, harden not your hearts: as in the provocation, and as in the day of temptation in the wilderness;
When your fathers tempted me: proved me, and saw my works.
Forty years long was I grieved with this generation, and said: It is a people that do err in their hearts, for they have not known my ways;
Unto whom I sware in my wrath: that they should not enter into my rest.

${GLORIA}`;

const TE_DEUM = `We praise thee, O God: we acknowledge thee to be the Lord.
All the earth doth worship thee: the Father everlasting.
To thee all Angels cry aloud: the Heavens, and all the Powers therein.
To thee Cherubin and Seraphin: continually do cry,
Holy, Holy, Holy: Lord God of Sabaoth;
Heaven and earth are full of the Majesty: of thy glory.
The glorious company of the Apostles: praise thee.
The goodly fellowship of the Prophets: praise thee.
The noble army of Martyrs: praise thee.
The holy Church throughout all the world: doth acknowledge thee;
The Father: of an infinite Majesty;
Thine honourable, true: and only Son;
Also the Holy Ghost: the Comforter.
Thou art the King of Glory: O Christ.
Thou art the everlasting Son: of the Father.
When thou tookest upon thee to deliver man: thou didst not abhor the Virgin's womb.
When thou hadst overcome the sharpness of death: thou didst open the Kingdom of Heaven to all believers.
Thou sittest at the right hand of God: in the glory of the Father.
We believe that thou shalt come: to be our Judge.
We therefore pray thee, help thy servants: whom thou hast redeemed with thy precious blood.
Make them to be numbered with thy Saints: in glory everlasting.
O Lord, save thy people: and bless thine heritage.
Govern them: and lift them up for ever.
Day by day: we magnify thee;
And we worship thy Name: ever world without end.
Vouchsafe, O Lord: to keep us this day without sin.
O Lord, have mercy upon us: have mercy upon us.
O Lord, let thy mercy lighten upon us: as our trust is in thee.
O Lord, in thee have I trusted: let me never be confounded.`;

const BENEDICTUS = `Blessed be the Lord God of Israel: for he hath visited and redeemed his people;
And hath raised up a mighty salvation for us: in the house of his servant David;
As he spake by the mouth of his holy Prophets: which have been since the world began;
That we should be saved from our enemies: and from the hands of all that hate us.
To perform the mercy promised to our forefathers: and to remember his holy Covenant;
To perform the oath which he sware to our forefather Abraham: that he would give us;
That we being delivered out of the hands of our enemies: might serve him without fear;
In holiness and righteousness before him: all the days of our life.
And thou, Child, shalt be called the Prophet of the Highest: for thou shalt go before the face of the Lord to prepare his ways;
To give knowledge of salvation unto his people: for the remission of their sins,
Through the tender mercy of our God: whereby the day-spring from on high hath visited us;
To give light to them that sit in darkness, and in the shadow of death: and to guide our feet into the way of peace.

${GLORIA}`;

const MAGNIFICAT = `My soul doth magnify the Lord: and my spirit hath rejoiced in God my Saviour.
For he hath regarded: the lowliness of his handmaiden.
For behold, from henceforth: all generations shall call me blessed.
For he that is mighty hath magnified me: and holy is his Name.
And his mercy is on them that fear him: throughout all generations.
He hath shewed strength with his arm: he hath scattered the proud in the imagination of their hearts.
He hath put down the mighty from their seat: and hath exalted the humble and meek.
He hath filled the hungry with good things: and the rich he hath sent empty away.
He remembering his mercy hath holpen his servant Israel: as he promised to our forefathers, Abraham and his seed, for ever.

${GLORIA}`;

const NUNC_DIMITTIS = `Lord, now lettest thou thy servant depart in peace: according to thy word.
For mine eyes have seen: thy salvation,
Which thou hast prepared: before the face of all people;
To be a light to lighten the Gentiles: and to be the glory of thy people Israel.

${GLORIA}`;

const APOSTLES_CREED = `I believe in God the Father Almighty, Maker of heaven and earth:
And in Jesus Christ his only Son our Lord, Who was conceived by the Holy Ghost, Born of the Virgin Mary, Suffered under Pontius Pilate, Was crucified, dead, and buried: He descended into hell; The third day he rose again from the dead, He ascended into heaven, And sitteth on the right hand of God the Father Almighty; From thence he shall come to judge the quick and the dead.
I believe in the Holy Ghost; The holy Catholick Church; The Communion of Saints; The Forgiveness of sins; The Resurrection of the body, And the life everlasting. Amen.`;

const LESSER_VERSICLES = `The Lord be with you;
And with thy spirit.
Let us pray.
Lord, have mercy upon us.
Christ, have mercy upon us.
Lord, have mercy upon us.`;

const SUFFRAGES = `O Lord, shew thy mercy upon us;
And grant us thy salvation.
O Lord, save the King;
And mercifully hear us when we call upon thee.
Endue thy Ministers with righteousness;
And make thy chosen people joyful.
O Lord, save thy people;
And bless thine inheritance.
Give peace in our time, O Lord;
Because there is none other that fighteth for us, but only thou, O God.
O God, make clean our hearts within us;
And take not thy holy Spirit from us.`;

const COLLECT_PEACE_MORNING = `O God, who art the author of peace and lover of concord, in knowledge of whom standeth our eternal life, whose service is perfect freedom: Defend us thy humble servants in all assaults of our enemies; that we, surely trusting in thy defence, may not fear the power of any adversaries, through the might of Jesus Christ our Lord. Amen.`;

const COLLECT_GRACE = `O Lord, our heavenly Father, Almighty and everlasting God, who hast safely brought us to the beginning of this day: Defend us in the same with thy mighty power; and grant that this day we fall into no sin, neither run into any kind of danger; but that all our doings may be ordered by thy governance, to do always that is righteous in thy sight; through Jesus Christ our Lord. Amen.`;

const COLLECT_PEACE_EVENING = `O God, from whom all holy desires, all good counsels, and all just works do proceed: Give unto thy servants that peace which the world cannot give; that both our hearts may be set to obey thy commandments, and also that by thee we being defended from the fear of our enemies may pass our time in rest and quietness; through the merits of Jesus Christ our Saviour. Amen.`;

const COLLECT_PERILS = `Lighten our darkness, we beseech thee, O Lord; and by thy great mercy defend us from all perils and dangers of this night; for the love of thy only Son, our Saviour, Jesus Christ. Amen.`;

const CHRYSOSTOM = `Almighty God, who hast given us grace at this time with one accord to make our common supplications unto thee; and dost promise that when two or three are gathered together in thy Name thou wilt grant their requests: Fulfil now, O Lord, the desires and petitions of thy servants, as may be most expedient for them; granting us in this world knowledge of thy truth, and in the world to come life everlasting. Amen.`;

const GRACE = `The grace of our Lord Jesus Christ, and the love of God, and the fellowship of the Holy Ghost, be with us all evermore. Amen. (2 Corinthians 13.14)`;

// Shared opening of both offices (penitential introduction).
function penitentialIntro(): ServiceSection[] {
  return [
    { id: 'opening-sentence', title: 'Opening Sentence', kind: 'said', role: 'officiant', optional: true, text: OPENING_SENTENCE, note: 'One or more sentences of Scripture. Choose any appointed for the season.' },
    { id: 'exhortation', title: 'The Exhortation', kind: 'said', role: 'officiant', optional: true, text: EXHORTATION },
    { id: 'confession', title: 'General Confession', kind: 'said', role: 'all', optional: false, text: GENERAL_CONFESSION, note: 'Said by the whole congregation, kneeling.' },
    { id: 'absolution', title: 'The Absolution', kind: 'rubric', role: 'none', optional: true, text: ABSOLUTION_RUBRIC, note: 'Priestly act — a lay leader omits it (see the rubric).' },
    { id: 'lords-prayer-1', title: 'The Lord’s Prayer', kind: 'said', role: 'all', optional: false, text: LORDS_PRAYER },
    { id: 'versicles', title: 'O Lord, open thou our lips', kind: 'responsive', role: 'officiant', optional: false, text: OPENING_VERSICLES },
  ];
}

// Shared closing of both offices (creed, suffrages, collects, prayers).
function commonPrayersAndCollects(eveningCollects: boolean): ServiceSection[] {
  return [
    { id: 'creed', title: 'The Apostles’ Creed', kind: 'said', role: 'all', optional: false, text: APOSTLES_CREED },
    { id: 'lesser-versicles', title: 'The Lesser Litany', kind: 'responsive', role: 'officiant', optional: false, text: LESSER_VERSICLES },
    { id: 'lords-prayer-2', title: 'The Lord’s Prayer', kind: 'said', role: 'all', optional: false, text: LORDS_PRAYER },
    { id: 'suffrages', title: 'The Suffrages', kind: 'responsive', role: 'officiant', optional: false, text: SUFFRAGES },
    { id: 'collect-day', title: 'The Collect of the Day', kind: 'collect', role: 'officiant', optional: false },
    {
      id: 'collect-peace',
      title: eveningCollects ? 'The Second Collect, for Peace' : 'The Second Collect, for Peace',
      kind: 'said',
      role: 'officiant',
      optional: false,
      text: eveningCollects ? COLLECT_PEACE_EVENING : COLLECT_PEACE_MORNING,
    },
    {
      id: 'collect-third',
      title: eveningCollects ? 'The Third Collect, for Aid against all Perils' : 'The Third Collect, for Grace',
      kind: 'said',
      role: 'officiant',
      optional: false,
      text: eveningCollects ? COLLECT_PERILS : COLLECT_GRACE,
    },
    { id: 'anthem', title: 'Anthem / Hymn', kind: 'hymn', role: 'all', optional: true, note: 'In quires and places where they sing, here followeth the Anthem.' },
    { id: 'sermon', title: 'Reflection', kind: 'sermon', role: 'officiant', optional: true, note: 'Optional at the daily office (see Settings for who may give one).' },
    { id: 'prayers', title: 'The Occasional Prayers', kind: 'prayers', role: 'officiant', optional: true, note: 'Prayers for the King’s Majesty, the Royal Family, the Clergy and People, and other occasions.' },
    { id: 'chrysostom', title: 'A Prayer of St Chrysostom', kind: 'said', role: 'officiant', optional: true, text: CHRYSOSTOM },
    { id: 'grace', title: 'The Grace', kind: 'said', role: 'all', optional: false, text: GRACE },
  ];
}

const bcpMorningPrayer: ServiceDefinition = {
  id: 'morning-prayer-bcp',
  name: 'Morning Prayer (BCP 1662)',
  tradition: 'Book of Common Prayer',
  summary: 'Mattins from the 1662 Prayer Book — full traditional text, lay-leadable.',
  layLed: true,
  timeOfDay: 'morning',
  sections: [
    { id: 'opening-hymn', title: 'Opening Hymn', kind: 'hymn', role: 'all', optional: true },
    ...penitentialIntro(),
    { id: 'venite', title: 'Venite (Psalm 95)', kind: 'said', role: 'all', optional: true, text: VENITE },
    { id: 'psalms', title: 'The Psalms appointed', kind: 'psalm', role: 'all', optional: false, note: 'The Psalms for the day from the Prayer Book lectionary.' },
    { id: 'first-lesson', title: 'The First Lesson (Old Testament)', kind: 'reading', role: 'reader', optional: false },
    { id: 'te-deum', title: 'Te Deum Laudamus', kind: 'said', role: 'all', optional: true, text: TE_DEUM, note: 'Or the Benedicite, omnia opera.' },
    { id: 'second-lesson', title: 'The Second Lesson (New Testament)', kind: 'reading', role: 'reader', optional: false },
    { id: 'benedictus', title: 'Benedictus (St Luke 1)', kind: 'said', role: 'all', optional: true, text: BENEDICTUS, note: 'Or the Jubilate Deo (Psalm 100).' },
    ...commonPrayersAndCollects(false),
    { id: 'closing-hymn', title: 'Closing Hymn', kind: 'hymn', role: 'all', optional: true },
  ],
};

const bcpEveningPrayer: ServiceDefinition = {
  id: 'evening-prayer-bcp',
  name: 'Evening Prayer (BCP 1662)',
  tradition: 'Book of Common Prayer',
  summary: 'Evensong from the 1662 Prayer Book — full traditional text, lay-leadable.',
  layLed: true,
  timeOfDay: 'evening',
  sections: [
    { id: 'opening-hymn', title: 'Opening Hymn', kind: 'hymn', role: 'all', optional: true },
    ...penitentialIntro(),
    { id: 'psalms', title: 'The Psalms appointed', kind: 'psalm', role: 'all', optional: false, note: 'The Psalms for the day from the Prayer Book lectionary.' },
    { id: 'first-lesson', title: 'The First Lesson (Old Testament)', kind: 'reading', role: 'reader', optional: false },
    { id: 'magnificat', title: 'Magnificat (St Luke 1)', kind: 'said', role: 'all', optional: true, text: MAGNIFICAT, note: 'Or the Cantate Domino (Psalm 98).' },
    { id: 'second-lesson', title: 'The Second Lesson (New Testament)', kind: 'reading', role: 'reader', optional: false },
    { id: 'nunc-dimittis', title: 'Nunc Dimittis (St Luke 2)', kind: 'said', role: 'all', optional: true, text: NUNC_DIMITTIS, note: 'Or the Deus misereatur (Psalm 67).' },
    ...commonPrayersAndCollects(true),
    { id: 'closing-hymn', title: 'Closing Hymn', kind: 'hymn', role: 'all', optional: true },
  ],
};

// PROVENANCE: every fixed text above is hand-transcribed from the 1662 book
// and has not yet been proofread against a printed copy. Mark them so the UI
// can say so honestly (rubrics are our own wording, not transcriptions).
function markUnverified(service: ServiceDefinition): ServiceDefinition {
  return {
    ...service,
    sections: service.sections.map((s: ServiceSection) =>
      s.text && s.kind !== 'rubric' ? { ...s, unverified: true } : s,
    ),
  };
}

export const BCP_SERVICES: ServiceDefinition[] = [bcpMorningPrayer, bcpEveningPrayer].map(
  markUnverified,
);
