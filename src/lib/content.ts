export type Dhikr = {
  id: string;
  ar: string;
  tr: string;
  meaning: string;
  target: number;
  source: string;
  virtue: string;
};

// Five daily tasbihat, each from an authentic hadith.
export const TASBIHAT: Dhikr[] = [
  {
    id: 'subhanallah-bihamdihi',
    ar: 'سُبْحَانَ ٱللَّٰهِ وَبِحَمْدِهِ',
    tr: 'SubhanAllahi wa bihamdihi',
    meaning: 'Glory be to Allah, and praise be to Him',
    target: 100,
    source: 'Sahih al-Bukhari 6405',
    virtue: 'Sins are forgiven even if they are like the foam of the sea.',
  },
  {
    id: 'tahlil',
    ar: 'لَا إِلَٰهَ إِلَّا ٱللَّٰهُ وَحْدَهُ لَا شَرِيكَ لَهُ، لَهُ ٱلْمُلْكُ وَلَهُ ٱلْحَمْدُ وَهُوَ عَلَىٰ كُلِّ شَيْءٍ قَدِيرٌ',
    tr: 'La ilaha illallahu wahdahu la sharika lah, lahul-mulku wa lahul-hamdu wa huwa ʿala kulli shayʾin qadir',
    meaning: 'None has the right to be worshipped but Allah alone, without partner. His is the dominion and the praise, and He is over all things capable.',
    target: 100,
    source: 'Sahih al-Bukhari 6403',
    virtue: 'Like freeing ten slaves; a hundred good deeds written, a hundred sins erased, and protection from Shaytan that day.',
  },
  {
    id: 'istighfar',
    ar: 'أَسْتَغْفِرُ ٱللَّٰهَ وَأَتُوبُ إِلَيْهِ',
    tr: 'Astaghfirullaha wa atubu ilayh',
    meaning: 'I seek Allah’s forgiveness and turn to Him in repentance',
    target: 100,
    source: 'Sahih Muslim 2702',
    virtue: 'The Prophet ﷺ sought forgiveness a hundred times a day.',
  },
  {
    id: 'salawat',
    ar: 'ٱللَّٰهُمَّ صَلِّ عَلَىٰ مُحَمَّدٍ وَعَلَىٰ آلِ مُحَمَّدٍ',
    tr: 'Allahumma salli ʿala Muhammadin wa ʿala ali Muhammad',
    meaning: 'O Allah, send blessings upon Muhammad and the family of Muhammad',
    target: 100,
    source: 'Sahih Muslim 408',
    virtue: 'Whoever sends one blessing upon him, Allah sends ten upon them.',
  },
  {
    id: 'baqiyat',
    ar: 'سُبْحَانَ ٱللَّٰهِ، وَٱلْحَمْدُ لِلَّٰهِ، وَلَا إِلَٰهَ إِلَّا ٱللَّٰهُ، وَٱللَّٰهُ أَكْبَرُ',
    tr: 'SubhanAllah, walhamdulillah, wa la ilaha illallah, wallahu akbar',
    meaning: 'Glory be to Allah, praise be to Allah, none is worthy of worship but Allah, Allah is the Greatest',
    target: 100,
    source: 'Sahih Muslim 2137',
    virtue: 'The most beloved words to Allah.',
  },
];

export const ACTS_OF_LOVE = [
  'Make dua for someone by name, without telling them',
  'Give a little sadaqah today, even Rs. 50',
  'Pray two rakat of nafl just for Him',
  'Read the meaning of the page you recite today',
  'Help at home without being asked',
  'Send salawat ten times slowly, meaning every word',
  'Say “Alhamdulillah” out loud for three specific blessings',
  'Forgive someone in your heart, quietly',
  'Smile at Ammi and ask how her day was',
  'Make wudu before you sleep',
  'Learn one of Allah’s names and its meaning',
  'Tell Allah, in your own words, what you’re afraid of',
  'Pray Fajr and stay for the adhkar afterwards',
  'Feed someone, or make chai for the family',
];

export type Hobby = { id: string; name: string; why: string; firstStep: string; tone: 'sage' | 'rose' | 'gold' | 'sky' | 'lilac' };

// A twelve-week tasting menu, two new things a week.
export const HOBBIES: Hobby[] = [
  { id: 'calligraphy', name: 'Arabic calligraphy', why: 'Slow, beautiful, and close to the Quran.', firstStep: 'Write “بسم الله” ten times with any marker. Slower each time.', tone: 'gold' },
  { id: 'baking', name: 'Baking', why: 'Your hands busy, the house smelling good, something to share.', firstStep: 'Bake a simple mug cake or banana bread.', tone: 'rose' },
  { id: 'plants', name: 'Plants', why: 'Something alive that grows because you cared.', firstStep: 'Get one pothos or mint plant. Give it a name and a spot.', tone: 'sage' },
  { id: 'sketching', name: 'Sketching', why: 'Seeing ordinary things properly.', firstStep: 'Draw your cup of chai. No erasing.', tone: 'sky' },
  { id: 'reading', name: 'Reading', why: 'Other worlds, other minds, quiet time.', firstStep: 'Read 10 pages of any book that pulls you.', tone: 'lilac' },
  { id: 'cooking', name: 'Cooking a new dish', why: 'Find food that tastes good to you again.', firstStep: 'Pick one dish you loved as a child and cook it with Ammi.', tone: 'gold' },
  { id: 'arabic', name: 'Learning Arabic', why: 'Understand Allah’s words without a translation.', firstStep: 'Learn the 10 most repeated words in the Quran.', tone: 'sage' },
  { id: 'crochet', name: 'Crochet', why: 'Calm, repetitive, and you end up with something to gift.', firstStep: 'Watch one beginner video and make a chain stitch row.', tone: 'rose' },
  { id: 'journaling', name: 'Creative journaling', why: 'Make your thoughts into something pretty.', firstStep: 'Decorate one page about today with colour and stickers.', tone: 'lilac' },
  { id: 'photography', name: 'Phone photography', why: 'Notice light, colour and little moments.', firstStep: 'Take 10 photos of the sky from your roof at Maghrib.', tone: 'sky' },
  { id: 'mehndi', name: 'Mehndi design', why: 'Art you can wear, and share with your sisters.', firstStep: 'Practise one simple floral pattern on paper first.', tone: 'rose' },
  { id: 'watercolor', name: 'Watercolour', why: 'Soft colours and happy accidents.', firstStep: 'Paint three blobs of colour and blend them.', tone: 'sky' },
  { id: 'poetry', name: 'Writing poetry', why: 'Put feelings somewhere other than people.', firstStep: 'Write four lines about something you saw today.', tone: 'lilac' },
  { id: 'stretching', name: 'Stretching at home', why: 'Your body after long hours at the desk.', firstStep: 'Ten minutes of gentle stretching after Asr.', tone: 'sage' },
  { id: 'embroidery', name: 'Embroidery', why: 'Tiny stitches, big calm.', firstStep: 'Stitch your initial on a scrap of cloth.', tone: 'gold' },
  { id: 'scrapbook', name: 'Memory scrapbook', why: 'Keep the good days somewhere you can hold.', firstStep: 'Print three photos of family and make one page.', tone: 'rose' },
  { id: 'puzzles', name: 'Puzzles & sudoku', why: 'A focused mind and a little win.', firstStep: 'Do one easy sudoku with your chai.', tone: 'sky' },
  { id: 'origami', name: 'Paper crafts', why: 'Turn a plain sheet into something lovely.', firstStep: 'Fold a paper crane or a little box.', tone: 'lilac' },
  { id: 'herbs', name: 'Kitchen herbs', why: 'Grow mint and dhaniya you can actually eat.', firstStep: 'Plant mint cuttings in a glass of water.', tone: 'sage' },
  { id: 'candles', name: 'Candle making', why: 'Make your room smell like you.', firstStep: 'Melt an old candle into a teacup with a new wick.', tone: 'gold' },
  { id: 'digitalart', name: 'Digital drawing', why: 'Draw on the phone you already hold all day.', firstStep: 'Install a free drawing app and doodle for 10 minutes.', tone: 'sky' },
  { id: 'storytelling', name: 'Seerah stories', why: 'Fall in love with the Prophet’s ﷺ life.', firstStep: 'Listen to one short Seerah episode and note one lesson.', tone: 'sage' },
  { id: 'decor', name: 'Room styling', why: 'Make the upstairs room yours.', firstStep: 'Rearrange one corner with what you already have.', tone: 'rose' },
  { id: 'letters', name: 'Handwritten letters', why: 'Love on paper, without pressure to reply.', firstStep: 'Write a short note to Ammi or a sibling and leave it for them.', tone: 'lilac' },
];

export const JOURNAL_PROMPTS = [
  'What is weighing on your heart right now?',
  'One thing that went right today, however small.',
  'What would you tell Allah if no one else could hear?',
  'What did your body need today that it didn’t get?',
  'Who made you smile today, and why?',
  'What are you avoiding, and what is the smallest first step?',
  'Three blessings you almost forgot to notice.',
  'What would the calm, organised you do tomorrow?',
];

export const FEEL_BETTER = [
  { title: 'Make wudu', detail: 'Cool water on your face and arms. It resets the nervous system and the heart.' },
  { title: 'Step onto the roof', detail: 'Five minutes of sky. Look as far as you can see.' },
  { title: 'Eat something warm', detail: 'Low mood is often low fuel. Chai and something small counts.' },
  { title: 'Say it to Allah', detail: 'Two rakat, or just sit and tell Him everything in your own words.' },
  { title: 'Try your hobby for 10 minutes', detail: 'Hands busy, mind quieter.' },
  { title: 'Sit near Ammi', detail: 'You don’t have to talk. Just be in the same room.' },
];

export const FAMILY_IDEAS = [
  'Make chai for them and sit together, even quietly',
  'Ask about something from their day, then really listen',
  'Watch one thing together that they like',
  'Help with something they’re doing',
  'Share one old memory and laugh about it',
  'Eat dinner at the same table, phone away',
];

export const PARTNER_PAUSE = [
  'He’s living his day too. A slow reply isn’t a message about you.',
  'Your peace belongs to you. Put it somewhere safe: Allah, your hobby, your family.',
  'Love feels lighter when it isn’t waiting. Do something kind for yourself, and tell him about it later.',
];
