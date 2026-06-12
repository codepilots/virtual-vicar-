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

  15: `Lord, who shall dwell in thy tabernacle: or who shall rest upon thy holy hill?
Even he that leadeth an uncorrupt life: and doeth the thing which is right, and speaketh the truth from his heart.
He that hath used no deceit in his tongue, nor done evil to his neighbour: and hath not slandered his neighbour.
He that setteth not by himself, but is lowly in his own eyes: and maketh much of them that fear the Lord.
He that sweareth unto his neighbour, and disappointeth him not: though it were to his own hindrance.
He that hath not given his money upon usury: nor taken reward against the innocent.
Whoso doeth these things: shall never fall.`,

  19: `The heavens declare the glory of God: and the firmament sheweth his handy-work.
One day telleth another: and one night certifieth another.
There is neither speech nor language: but their voices are heard among them.
Their sound is gone out into all lands: and their words into the ends of the world.
In them hath he set a tabernacle for the sun: which cometh forth as a bridegroom out of his chamber, and rejoiceth as a giant to run his course.
It goeth forth from the uttermost part of the heaven, and runneth about unto the end of it again: and there is nothing hid from the heat thereof.
The law of the Lord is an undefiled law, converting the soul: the testimony of the Lord is sure, and giveth wisdom unto the simple.
The statutes of the Lord are right, and rejoice the heart: the commandment of the Lord is pure, and giveth light unto the eyes.
The fear of the Lord is clean, and endureth for ever: the judgements of the Lord are true, and righteous altogether.
More to be desired are they than gold, yea, than much fine gold: sweeter also than honey, and the honey-comb.
Moreover, by them is thy servant taught: and in keeping of them there is great reward.
Who can tell how oft he offendeth: O cleanse thou me from my secret faults.
Keep thy servant also from presumptuous sins, lest they get the dominion over me: so shall I be undefiled, and innocent from the great offence.
Let the words of my mouth, and the meditation of my heart: be alway acceptable in thy sight,
O Lord: my strength, and my redeemer.`,

  27: `The Lord is my light, and my salvation; whom then shall I fear: the Lord is the strength of my life; of whom then shall I be afraid?
When the wicked, even mine enemies, and my foes, came upon me to eat up my flesh: they stumbled and fell.
Though an host of men were laid against me, yet shall not my heart be afraid: and though there rose up war against me, yet will I put my trust in him.
One thing have I desired of the Lord, which I will require: even that I may dwell in the house of the Lord all the days of my life, to behold the fair beauty of the Lord, and to visit his temple.
For in the time of trouble he shall hide me in his tabernacle: yea, in the secret place of his dwelling shall he hide me, and set me up upon a rock of stone.
And now shall he lift up mine head: above mine enemies round about me.
Therefore will I offer in his dwelling an oblation with great gladness: I will sing, and speak praises unto the Lord.
Hearken unto my voice, O Lord, when I cry unto thee: have mercy upon me, and hear me.
My heart hath talked of thee, Seek ye my face: Thy face, Lord, will I seek.
O hide not thou thy face from me: nor cast thy servant away in displeasure.
Thou hast been my succour: leave me not, neither forsake me, O God of my salvation.
When my father and my mother forsake me: the Lord taketh me up.
Teach me thy way, O Lord: and lead me in the right way, because of mine enemies.
Deliver me not over into the will of mine adversaries: for there are false witnesses risen up against me, and such as speak wrong.
I should utterly have fainted: but that I believe verily to see the goodness of the Lord in the land of the living.
O tarry thou the Lord's leisure: be strong, and he shall comfort thine heart; and put thou thy trust in the Lord.`,

  34: `I will alway give thanks unto the Lord: his praise shall ever be in my mouth.
My soul shall make her boast in the Lord: the humble shall hear thereof, and be glad.
O praise the Lord with me: and let us magnify his Name together.
I sought the Lord, and he heard me: yea, he delivered me out of all my fear.
They had an eye unto him, and were lightened: and their faces were not ashamed.
Lo, the poor crieth, and the Lord heareth him: yea, and saveth him out of all his troubles.
The angel of the Lord tarrieth round about them that fear him: and delivereth them.
O taste, and see, how gracious the Lord is: blessed is the man that trusteth in him.
O fear the Lord, ye that are his saints: for they that fear him lack nothing.
The lions do lack, and suffer hunger: but they who seek the Lord shall want no manner of thing that is good.
Come, ye children, and hearken unto me: I will teach you the fear of the Lord.
What man is he that lusteth to live: and would fain see good days?
Keep thy tongue from evil: and thy lips, that they speak no guile.
Eschew evil, and do good: seek peace, and ensue it.
The eyes of the Lord are over the righteous: and his ears are open unto their prayers.
The countenance of the Lord is against them that do evil: to root out the remembrance of them from the earth.
The righteous cry, and the Lord heareth them: and delivereth them out of all their troubles.
The Lord is nigh unto them that are of a contrite heart: and will save such as be of an humble spirit.
Great are the troubles of the righteous: but the Lord delivereth him out of all.
He keepeth all his bones: so that not one of them is broken.
But misfortune shall slay the ungodly: and they that hate the righteous shall be desolate.
The Lord delivereth the souls of his servants: and all they that put their trust in him shall not be destitute.`,

  42: `Like as the hart desireth the water-brooks: so longeth my soul after thee, O God.
My soul is athirst for God, yea, even for the living God: when shall I come to appear before the presence of God?
My tears have been my meat day and night: while they daily say unto me, Where is now thy God?
Now when I think thereupon, I pour out my heart by myself: for I went with the multitude, and brought them forth into the house of God;
In the voice of praise and thanksgiving: among such as keep holy-day.
Why art thou so full of heaviness, O my soul: and why art thou so disquieted within me?
Put thy trust in God: for I will yet give him thanks for the help of his countenance.
My God, my soul is vexed within me: therefore will I remember thee concerning the land of Jordan, and the little hill of Hermon.
One deep calleth another, because of the noise of the water-pipes: all thy waves and storms are gone over me.
The Lord hath granted his loving-kindness in the day-time: and in the night-season did I sing of him, and made my prayer unto the God of my life.
I will say unto the God of my strength, Why hast thou forgotten me: why go I thus heavily, while the enemy oppresseth me?
My bones are smitten asunder as with a sword: while mine enemies that trouble me cast me in the teeth;
Namely, while they say daily unto me: Where is now thy God?
Why art thou so vexed, O my soul: and why art thou so disquieted within me?
O put thy trust in God: for I will yet thank him, which is the help of my countenance, and my God.`,

  46: `God is our hope and strength: a very present help in trouble.
Therefore will we not fear, though the earth be moved: and though the hills be carried into the midst of the sea.
Though the waters thereof rage and swell: and though the mountains shake at the tempest of the same.
The rivers of the flood thereof shall make glad the city of God: the holy place of the tabernacle of the most Highest.
God is in the midst of her, therefore shall she not be removed: God shall help her, and that right early.
The heathen make much ado, and the kingdoms are moved: but God hath shewed his voice, and the earth shall melt away.
The Lord of hosts is with us: the God of Jacob is our refuge.
O come hither, and behold the works of the Lord: what destruction he hath brought upon the earth.
He maketh wars to cease in all the world: he breaketh the bow, and knappeth the spear in sunder, and burneth the chariots in the fire.
Be still then, and know that I am God: I will be exalted among the heathen, and I will be exalted in the earth.
The Lord of hosts is with us: the God of Jacob is our refuge.`,

  51: `Have mercy upon me, O God, after thy great goodness: according to the multitude of thy mercies do away mine offences.
Wash me throughly from my wickedness: and cleanse me from my sin.
For I acknowledge my faults: and my sin is ever before me.
Against thee only have I sinned, and done this evil in thy sight: that thou mightest be justified in thy saying, and clear when thou art judged.
Behold, I was shapen in wickedness: and in sin hath my mother conceived me.
But lo, thou requirest truth in the inward parts: and shalt make me to understand wisdom secretly.
Thou shalt purge me with hyssop, and I shall be clean: thou shalt wash me, and I shall be whiter than snow.
Thou shalt make me hear of joy and gladness: that the bones which thou hast broken may rejoice.
Turn thy face from my sins: and put out all my misdeeds.
Make me a clean heart, O God: and renew a right spirit within me.
Cast me not away from thy presence: and take not thy holy Spirit from me.
O give me the comfort of thy help again: and stablish me with thy free Spirit.
Then shall I teach thy ways unto the wicked: and sinners shall be converted unto thee.
Deliver me from blood-guiltiness, O God, thou that art the God of my health: and my tongue shall sing of thy righteousness.
Thou shalt open my lips, O Lord: and my mouth shall shew thy praise.
For thou desirest no sacrifice, else would I give it thee: but thou delightest not in burnt-offerings.
The sacrifice of God is a troubled spirit: a broken and contrite heart, O God, shalt thou not despise.
O be favourable and gracious unto Sion: build thou the walls of Jerusalem.
Then shalt thou be pleased with the sacrifice of righteousness, with the burnt-offerings and oblations: then shall they offer young bullocks upon thine altar.`,

  84: `O how amiable are thy dwellings: thou Lord of hosts!
My soul hath a desire and longing to enter into the courts of the Lord: my heart and my flesh rejoice in the living God.
Yea, the sparrow hath found her an house, and the swallow a nest where she may lay her young: even thy altars, O Lord of hosts, my King and my God.
Blessed are they that dwell in thy house: they will be alway praising thee.
Blessed is the man whose strength is in thee: in whose heart are thy ways.
Who going through the vale of misery use it for a well: and the pools are filled with water.
They will go from strength to strength: and unto the God of gods appeareth every one of them in Sion.
O Lord God of hosts, hear my prayer: hearken, O God of Jacob.
Behold, O God our defender: and look upon the face of thine Anointed.
For one day in thy courts: is better than a thousand.
I had rather be a door-keeper in the house of my God: than to dwell in the tents of ungodliness.
For the Lord God is a light and defence: the Lord will give grace and worship, and no good thing shall he withhold from them that live a godly life.
O Lord God of hosts: blessed is the man that putteth his trust in thee.`,

  90: `Lord, thou hast been our refuge: from one generation to another.
Before the mountains were brought forth, or ever the earth and the world were made: thou art God from everlasting, and world without end.
Thou turnest man to destruction: again thou sayest, Come again, ye children of men.
For a thousand years in thy sight are but as yesterday: seeing that is past as a watch in the night.
As soon as thou scatterest them, they are even as a sleep: and fade away suddenly like the grass.
In the morning it is green, and groweth up: but in the evening it is cut down, dried up, and withered.
For we consume away in thy displeasure: and are afraid at thy wrathful indignation.
Thou hast set our misdeeds before thee: and our secret sins in the light of thy countenance.
For when thou art angry all our days are gone: we bring our years to an end, as it were a tale that is told.
The days of our age are threescore years and ten; and though men be so strong that they come to fourscore years: yet is their strength then but labour and sorrow; so soon passeth it away, and we are gone.
But who regardeth the power of thy wrath: for even thereafter as a man feareth, so is thy displeasure.
So teach us to number our days: that we may apply our hearts unto wisdom.
Turn thee again, O Lord, at the last: and be gracious unto thy servants.
O satisfy us with thy mercy, and that soon: so shall we rejoice and be glad all the days of our life.
Comfort us again now after the time that thou hast plagued us: and for the years wherein we have suffered adversity.
Shew thy servants thy work: and their children thy glory.
And the glorious majesty of the Lord our God be upon us: prosper thou the work of our hands upon us, O prosper thou our handy-work.`,

  91: `Whoso dwelleth under the defence of the most High: shall abide under the shadow of the Almighty.
I will say unto the Lord, Thou art my hope, and my strong hold: my God, in him will I trust.
For he shall deliver thee from the snare of the hunter: and from the noisome pestilence.
He shall defend thee under his wings, and thou shalt be safe under his feathers: his faithfulness and truth shall be thy shield and buckler.
Thou shalt not be afraid for any terror by night: nor for the arrow that flieth by day;
For the pestilence that walketh in darkness: nor for the sickness that destroyeth in the noon-day.
A thousand shall fall beside thee, and ten thousand at thy right hand: but it shall not come nigh thee.
Yea, with thine eyes shalt thou behold: and see the reward of the ungodly.
For thou, Lord, art my hope: thou hast set thine house of defence very high.
There shall no evil happen unto thee: neither shall any plague come nigh thy dwelling.
For he shall give his angels charge over thee: to keep thee in all thy ways.
They shall bear thee in their hands: that thou hurt not thy foot against a stone.
Thou shalt go upon the lion and adder: the young lion and the dragon shalt thou tread under thy feet.
Because he hath set his love upon me, therefore will I deliver him: I will set him up, because he hath known my Name.
He shall call upon me, and I will hear him: yea, I am with him in trouble; I will deliver him, and bring him to honour.
With long life will I satisfy him: and shew him my salvation.`,

  96: `O sing unto the Lord a new song: sing unto the Lord, all the whole earth.
Sing unto the Lord, and praise his Name: be telling of his salvation from day to day.
Declare his honour unto the heathen: and his wonders unto all people.
For the Lord is great, and cannot worthily be praised: he is more to be feared than all gods.
As for all the gods of the heathen, they are but idols: but it is the Lord that made the heavens.
Glory and worship are before him: power and honour are in his sanctuary.
Ascribe unto the Lord, O ye kindreds of the people: ascribe unto the Lord worship and power.
Ascribe unto the Lord the honour due unto his Name: bring presents, and come into his courts.
O worship the Lord in the beauty of holiness: let the whole earth stand in awe of him.
Tell it out among the heathen that the Lord is King: and that it is he who hath made the round world so fast that it cannot be moved; and how that he shall judge the people righteously.
Let the heavens rejoice, and let the earth be glad: let the sea make a noise, and all that therein is.
Let the field be joyful, and all that is in it: then shall all the trees of the wood rejoice before the Lord.
For he cometh, for he cometh to judge the earth: and with righteousness to judge the world, and the people with his truth.`,

  98: `O sing unto the Lord a new song: for he hath done marvellous things.
With his own right hand, and with his holy arm: hath he gotten himself the victory.
The Lord declared his salvation: his righteousness hath he openly shewed in the sight of the heathen.
He hath remembered his mercy and truth toward the house of Israel: and all the ends of the world have seen the salvation of our God.
Shew yourselves joyful unto the Lord, all ye lands: sing, rejoice, and give thanks.
Praise the Lord upon the harp: sing to the harp with a psalm of thanksgiving.
With trumpets also and shawms: O shew yourselves joyful before the Lord the King.
Let the sea make a noise, and all that therein is: the round world, and they that dwell therein.
Let the floods clap their hands, and let the hills be joyful together before the Lord: for he is come to judge the earth.
With righteousness shall he judge the world: and the people with equity.`,

  103: `Praise the Lord, O my soul: and all that is within me praise his holy Name.
Praise the Lord, O my soul: and forget not all his benefits;
Who forgiveth all thy sin: and healeth all thine infirmities;
Who saveth thy life from destruction: and crowneth thee with mercy and loving-kindness;
Who satisfieth thy mouth with good things: making thee young and lusty as an eagle.
The Lord executeth righteousness and judgement: for all them that are oppressed with wrong.
He shewed his ways unto Moses: his works unto the children of Israel.
The Lord is full of compassion and mercy: long-suffering, and of great goodness.
He will not alway be chiding: neither keepeth he his anger for ever.
He hath not dealt with us after our sins: nor rewarded us according to our wickednesses.
For look how high the heaven is in comparison of the earth: so great is his mercy also toward them that fear him.
Look how wide also the east is from the west: so far hath he set our sins from us.
Yea, like as a father pitieth his own children: even so is the Lord merciful unto them that fear him.
For he knoweth whereof we are made: he remembereth that we are but dust.
The days of man are but as grass: for he flourisheth as a flower of the field.
For as soon as the wind goeth over it, it is gone: and the place thereof shall know it no more.
But the merciful goodness of the Lord endureth for ever and ever upon them that fear him: and his righteousness upon children's children;
Even upon such as keep his covenant: and think upon his commandments to do them.
The Lord hath prepared his seat in heaven: and his kingdom ruleth over all.
O praise the Lord, ye angels of his, ye that excel in strength: ye that fulfil his commandment, and hearken unto the voice of his words.
O praise the Lord, all ye his hosts: ye servants of his that do his pleasure.
O speak good of the Lord, all ye works of his, in all places of his dominion: praise thou the Lord, O my soul.`,

  113: `Praise the Lord, ye servants: O praise the Name of the Lord.
Blessed be the Name of the Lord: from this time forth for evermore.
The Lord's Name is praised: from the rising up of the sun unto the going down of the same.
The Lord is high above all heathen: and his glory above the heavens.
Who is like unto the Lord our God, that hath his dwelling so high: and yet humbleth himself to behold the things that are in heaven and earth?
He taketh up the simple out of the dust: and lifteth the poor out of the mire;
That he may set him with the princes: even with the princes of his people.
He maketh the barren woman to keep house: and to be a joyful mother of children.`,

  114: `When Israel came out of Egypt: and the house of Jacob from among the strange people,
Judah was his sanctuary: and Israel his dominion.
The sea saw that, and fled: Jordan was driven back.
The mountains skipped like rams: and the little hills like young sheep.
What aileth thee, O thou sea, that thou fleddest: and thou Jordan, that thou wast driven back?
Ye mountains, that ye skipped like rams: and ye little hills, like young sheep?
Tremble, thou earth, at the presence of the Lord: at the presence of the God of Jacob;
Who turned the hard rock into a standing water: and the flint-stone into a springing well.`,

  116: `I am well pleased: that the Lord hath heard the voice of my prayer;
That he hath inclined his ear unto me: therefore will I call upon him as long as I live.
The snares of death compassed me round about: and the pains of hell gat hold upon me.
I shall find trouble and heaviness, and I will call upon the Name of the Lord: O Lord, I beseech thee, deliver my soul.
Gracious is the Lord, and righteous: yea, our God is merciful.
The Lord preserveth the simple: I was in misery, and he helped me.
Turn again then unto thy rest, O my soul: for the Lord hath rewarded thee.
And why? thou hast delivered my soul from death: mine eyes from tears, and my feet from falling.
I will walk before the Lord: in the land of the living.
I believed, and therefore will I speak; but I was sore troubled: I said in my haste, All men are liars.
What reward shall I give unto the Lord: for all the benefits that he hath done unto me?
I will receive the cup of salvation: and call upon the Name of the Lord.
I will pay my vows now in the presence of all his people: right dear in the sight of the Lord is the death of his saints.
Behold, O Lord, how that I am thy servant: I am thy servant, and the son of thine handmaid; thou hast broken my bonds in sunder.
I will offer to thee the sacrifice of thanksgiving: and will call upon the Name of the Lord.
I will pay my vows unto the Lord, in the sight of all his people: in the courts of the Lord's house, even in the midst of thee, O Jerusalem. Praise the Lord.`,

  126: `When the Lord turned again the captivity of Sion: then were we like unto them that dream.
Then was our mouth filled with laughter: and our tongue with joy.
Then said they among the heathen: The Lord hath done great things for them.
Yea, the Lord hath done great things for us already: whereof we rejoice.
Turn our captivity, O Lord: as the rivers in the south.
They that sow in tears: shall reap in joy.
He that now goeth on his way weeping, and beareth forth good seed: shall doubtless come again with joy, and bring his sheaves with him.`,

  133: `Behold, how good and joyful a thing it is: brethren, to dwell together in unity!
It is like the precious ointment upon the head, that ran down unto the beard: even unto Aaron's beard, and went down to the skirts of his clothing.
Like as the dew of Hermon: which fell upon the hill of Sion.
For there the Lord promised his blessing: and life for evermore.`,

  138: `I will give thanks unto thee, O Lord, with my whole heart: even before the gods will I sing praise unto thee.
I will worship toward thy holy temple, and praise thy Name, because of thy loving-kindness and truth: for thou hast magnified thy Name and thy word above all things.
When I called upon thee, thou heardest me: and enduedst my soul with much strength.
All the kings of the earth shall praise thee, O Lord: for they have heard the words of thy mouth.
Yea, they shall sing in the ways of the Lord: that great is the glory of the Lord.
For though the Lord be high, yet hath he respect unto the lowly: as for the proud, he beholdeth them afar off.
Though I walk in the midst of trouble, yet shalt thou refresh me: thou shalt stretch forth thy hand upon the furiousness of mine enemies, and thy right hand shall save me.
The Lord shall make good his loving-kindness toward me: yea, thy mercy, O Lord, endureth for ever; despise not then the works of thine own hands.`,

  146: `Praise the Lord, O my soul; while I live will I praise the Lord: yea, as long as I have any being, I will sing praises unto my God.
O put not your trust in princes, nor in any child of man: for there is no help in them.
For when the breath of man goeth forth he shall turn again to his earth: and then all his thoughts perish.
Blessed is he that hath the God of Jacob for his help: and whose hope is in the Lord his God;
Who made heaven and earth, the sea, and all that therein is: who keepeth his promise for ever;
Who helpeth them to right that suffer wrong: who feedeth the hungry.
The Lord looseth men out of prison: the Lord giveth sight to the blind.
The Lord helpeth them that are fallen: the Lord careth for the righteous.
The Lord careth for the strangers; he defendeth the fatherless and widow: as for the way of the ungodly, he turneth it upside down.
The Lord thy God, O Sion, shall be King for evermore: and throughout all generations.`,

  148: `O praise the Lord of heaven: praise him in the height.
Praise him, all ye angels of his: praise him, all his host.
Praise him, sun and moon: praise him, all ye stars and light.
Praise him, all ye heavens: and ye waters that are above the heavens.
Let them praise the Name of the Lord: for he spake the word, and they were made; he commanded, and they were created.
He hath made them fast for ever and ever: he hath given them a law which shall not be broken.
Praise the Lord upon earth: ye dragons, and all deeps;
Fire and hail, snow and vapours: wind and storm, fulfilling his word;
Mountains and all hills: fruitful trees and all cedars;
Beasts and all cattle: worms and feathered fowls;
Kings of the earth and all people: princes and all judges of the world;
Young men and maidens, old men and children, praise the Name of the Lord: for his Name only is excellent, and his praise above heaven and earth.
He shall exalt the horn of his people; all his saints shall praise him: even the children of Israel, even the people that serveth him.`,
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
