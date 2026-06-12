// The Coverdale Psalter — the psalms as pointed in the Book of Common Prayer
// (1662). This text is public domain, so it can be bundled and shown fully
// offline in psalm slots.
//
// This is a curated subset of the most frequently appointed psalms. Anything
// not bundled here falls back to the Bible deep-link / lectionary as before.
// To stay correct we only serve offline text for a *whole* psalm: if a slot
// asks for a verse range (e.g. "22:18-27") we defer to the linked Bible.

import type { ScriptureRef } from './readings';

/** The lesser doxology, said at the end of each psalm or group of psalms. */
export const GLORIA = `Glory be to the Father, and to the Son: and to the Holy Ghost;
As it was in the beginning, is now, and ever shall be: world without end. Amen.`;

// Psalm number -> Coverdale text. Verse halves are divided by a colon, as in
// the Prayer Book, ready for said or chanted use.
export const PSALMS: Record<number, string> = {
  1: `Blessed is the man that hath not walked in the counsel of the ungodly, nor stood in the way of sinners: and hath not sat in the seat of the scornful.
But his delight is in the law of the Lord: and in his law will he exercise himself day and night.
And he shall be like a tree planted by the water-side: that will bring forth his fruit in due season.
His leaf also shall not wither: and look, whatsoever he doeth, it shall prosper.
As for the ungodly, it is not so with them: but they are like the chaff, which the wind scattereth away from the face of the earth.
Therefore the ungodly shall not be able to stand in the judgement: neither the sinners in the congregation of the righteous.
But the Lord knoweth the way of the righteous: and the way of the ungodly shall perish.`,

  8: `O Lord our Governor, how excellent is thy Name in all the world: thou that hast set thy glory above the heavens!
Out of the mouth of very babes and sucklings hast thou ordained strength, because of thine enemies: that thou mightest still the enemy and the avenger.
For I will consider thy heavens, even the works of thy fingers: the moon and the stars, which thou hast ordained.
What is man, that thou art mindful of him: and the son of man, that thou visitest him?
Thou madest him lower than the angels: to crown him with glory and worship.
Thou makest him to have dominion of the works of thy hands: and thou hast put all things in subjection under his feet;
All sheep and oxen: yea, and the beasts of the field;
The fowls of the air, and the fishes of the sea: and whatsoever walketh through the paths of the seas.
O Lord our Governor: how excellent is thy Name in all the world!`,

  23: `The Lord is my shepherd: therefore can I lack nothing.
He shall feed me in a green pasture: and lead me forth beside the waters of comfort.
He shall convert my soul: and bring me forth in the paths of righteousness, for his Name's sake.
Yea, though I walk through the valley of the shadow of death, I will fear no evil: for thou art with me; thy rod and thy staff comfort me.
Thou shalt prepare a table before me against them that trouble me: thou hast anointed my head with oil, and my cup shall be full.
But thy loving-kindness and mercy shall follow me all the days of my life: and I will dwell in the house of the Lord for ever.`,

  24: `The earth is the Lord's, and all that therein is: the compass of the world, and they that dwell therein.
For he hath founded it upon the seas: and prepared it upon the floods.
Who shall ascend into the hill of the Lord: or who shall rise up in his holy place?
Even he that hath clean hands, and a pure heart: and that hath not lift up his mind unto vanity, nor sworn to deceive his neighbour.
He shall receive the blessing from the Lord: and righteousness from the God of his salvation.
This is the generation of them that seek him: even of them that seek thy face, O Jacob.
Lift up your heads, O ye gates, and be ye lift up, ye everlasting doors: and the King of glory shall come in.
Who is the King of glory: it is the Lord strong and mighty, even the Lord mighty in battle.
Lift up your heads, O ye gates, and be ye lift up, ye everlasting doors: and the King of glory shall come in.
Who is the King of glory: even the Lord of hosts, he is the King of glory.`,

  67: `God be merciful unto us, and bless us: and shew us the light of his countenance, and be merciful unto us;
That thy way may be known upon earth: thy saving health among all nations.
Let the people praise thee, O God: yea, let all the people praise thee.
O let the nations rejoice and be glad: for thou shalt judge the folk righteously, and govern the nations upon earth.
Let the people praise thee, O God: yea, let all the people praise thee.
Then shall the earth bring forth her increase: and God, even our own God, shall give us his blessing.
God shall bless us: and all the ends of the world shall fear him.`,

  100: `O be joyful in the Lord, all ye lands: serve the Lord with gladness, and come before his presence with a song.
Be ye sure that the Lord he is God: it is he that hath made us, and not we ourselves; we are his people, and the sheep of his pasture.
O go your way into his gates with thanksgiving, and into his courts with praise: be thankful unto him, and speak good of his Name.
For the Lord is gracious, his mercy is everlasting: and his truth endureth from generation to generation.`,

  121: `I will lift up mine eyes unto the hills: from whence cometh my help.
My help cometh even from the Lord: who hath made heaven and earth.
He will not suffer thy foot to be moved: and he that keepeth thee will not sleep.
Behold, he that keepeth Israel: shall neither slumber nor sleep.
The Lord himself is thy keeper: the Lord is thy defence upon thy right hand;
So that the sun shall not burn thee by day: neither the moon by night.
The Lord shall preserve thee from all evil: yea, it is even he that shall keep thy soul.
The Lord shall preserve thy going out, and thy coming in: from this time forth for evermore.`,

  122: `I was glad when they said unto me: We will go into the house of the Lord.
Our feet shall stand in thy gates: O Jerusalem.
Jerusalem is built as a city: that is at unity in itself.
For thither the tribes go up, even the tribes of the Lord: to testify unto Israel, to give thanks unto the Name of the Lord.
For there is the seat of judgement: even the seat of the house of David.
O pray for the peace of Jerusalem: they shall prosper that love thee.
Peace be within thy walls: and plenteousness within thy palaces.
For my brethren and companions' sakes: I will wish thee prosperity.
Yea, because of the house of the Lord our God: I will seek to do thee good.`,

  130: `Out of the deep have I called unto thee, O Lord: Lord, hear my voice.
O let thine ears consider well: the voice of my complaint.
If thou, Lord, wilt be extreme to mark what is done amiss: O Lord, who may abide it?
For there is mercy with thee: therefore shalt thou be feared.
I look for the Lord; my soul doth wait for him: in his word is my trust.
My soul fleeth unto the Lord: before the morning watch, I say, before the morning watch.
O Israel, trust in the Lord, for with the Lord there is mercy: and with him is plenteous redemption.
And he shall redeem Israel: from all his sins.`,

  131: `Lord, I am not high-minded: I have no proud looks.
I do not exercise myself in great matters: which are too high for me.
But I refrain my soul, and keep it low, like as a child that is weaned from his mother: yea, my soul is even as a weaned child.
O Israel, trust in the Lord: from this time forth for evermore.`,

  134: `Behold now, praise the Lord: all ye servants of the Lord;
Ye that by night stand in the house of the Lord: even in the courts of the house of our God.
Lift up your hands in the sanctuary: and praise the Lord.
The Lord that made heaven and earth: give thee blessing out of Sion.`,

  150: `O praise God in his holiness: praise him in the firmament of his power.
Praise him in his noble acts: praise him according to his excellent greatness.
Praise him in the sound of the trumpet: praise him upon the lute and harp.
Praise him in the cymbals and dances: praise him upon the strings and pipe.
Praise him upon the well-tuned cymbals: praise him upon the loud cymbals.
Let every thing that hath breath: praise the Lord.`,
};

export interface PsalmText {
  number: number;
  text: string;
}

/** True when a passage refers to a whole psalm (no verse selection). */
function isWholePsalm(passage: string): boolean {
  return /^\d+$/.test(passage.trim());
}

/**
 * Offline Coverdale text for a psalm reference, when the whole psalm is bundled.
 * Returns null for verse ranges or psalms not in the curated set, so the UI
 * keeps its Bible deep-link.
 */
export function getPsalmText(ref: ScriptureRef): PsalmText | null {
  if (ref.book !== 'Psalm' || !isWholePsalm(ref.passage)) return null;
  const number = parseInt(ref.passage, 10);
  const text = PSALMS[number];
  return text ? { number, text } : null;
}

export function hasOfflinePsalm(ref: ScriptureRef): boolean {
  return getPsalmText(ref) !== null;
}
