// ---------- English ----------

export type Word = { w: string; say: string; means: string; ex: string };

export const WORDS: Word[] = [
  { w: 'articulate', say: 'ar-TIK-yoo-late', means: 'to express ideas clearly in words', ex: 'She articulated her plan so clearly that everyone agreed.' },
  { w: 'concise', say: 'kun-SICE', means: 'short and clear, with no extra words', ex: 'Please keep the update concise.' },
  { w: 'diligent', say: 'DIL-i-jent', means: 'careful and hardworking', ex: 'She is diligent with every customer query.' },
  { w: 'clarify', say: 'KLAR-i-fy', means: 'to make something clear', ex: 'Could you clarify what you mean by “urgent”?' },
  { w: 'prioritise', say: 'pry-OR-i-tize', means: 'to decide what is most important first', ex: 'I prioritise salah before anything else.' },
  { w: 'resilient', say: 'ri-ZIL-yent', means: 'able to recover after something hard', ex: 'She is more resilient than she thinks.' },
  { w: 'grateful', say: 'GRATE-ful', means: 'feeling thankful', ex: 'I am grateful for my family.' },
  { w: 'consistent', say: 'kun-SIS-tent', means: 'doing something the same way regularly', ex: 'Being consistent matters more than being perfect.' },
  { w: 'elaborate', say: 'i-LAB-o-rate', means: 'to explain in more detail', ex: 'Could you elaborate on the second point?' },
  { w: 'acknowledge', say: 'ak-NOL-ij', means: 'to accept or recognise something', ex: 'I acknowledge your email and will reply by tonight.' },
  { w: 'genuine', say: 'JEN-yoo-in', means: 'real and sincere', ex: 'Her smile was genuine.' },
  { w: 'efficient', say: 'i-FISH-ent', means: 'doing things well without wasting time', ex: 'This process is more efficient.' },
  { w: 'perspective', say: 'per-SPEK-tiv', means: 'a way of looking at something', ex: 'From his perspective, the deadline was too tight.' },
  { w: 'collaborate', say: 'kuh-LAB-o-rate', means: 'to work together', ex: 'We collaborate on every Lotus project.' },
  { w: 'initiative', say: 'i-NISH-uh-tiv', means: 'starting something without being told', ex: 'She took the initiative to fix the problem.' },
  { w: 'empathy', say: 'EM-puh-thee', means: 'understanding how someone else feels', ex: 'Good support needs empathy.' },
  { w: 'ambitious', say: 'am-BISH-us', means: 'wanting to achieve a lot', ex: 'Our goals for this year are ambitious.' },
  { w: 'compassion', say: 'kum-PASH-un', means: 'kindness towards someone who is suffering', ex: 'Treat yourself with compassion on hard days.' },
  { w: 'feasible', say: 'FEE-zuh-bul', means: 'possible and practical', ex: 'Is this timeline feasible?' },
  { w: 'meticulous', say: 'muh-TIK-yoo-lus', means: 'very careful about small details', ex: 'Her notes are meticulous.' },
  { w: 'persevere', say: 'per-suh-VEER', means: 'to keep going even when it’s hard', ex: 'Persevere, and Allah will open a way.' },
  { w: 'tranquil', say: 'TRANG-kwil', means: 'calm and peaceful', ex: 'Fajr time is tranquil.' },
  { w: 'reluctant', say: 'ri-LUK-tant', means: 'not wanting to do something', ex: 'I was reluctant at first, but it helped.' },
  { w: 'subtle', say: 'SUT-ul', means: 'small and not obvious', ex: 'There is a subtle difference between the two.' },
  { w: 'thorough', say: 'THUR-oh', means: 'complete and careful', ex: 'Thank you for the thorough explanation.' },
  { w: 'appreciate', say: 'uh-PREE-shee-ate', means: 'to value or be thankful for', ex: 'I really appreciate your help.' },
  { w: 'convey', say: 'kun-VAY', means: 'to communicate an idea or feeling', ex: 'It’s hard to convey tone in a text.' },
  { w: 'nuance', say: 'NOO-ahnss', means: 'a small difference in meaning', ex: 'Let’s talk through the nuances of this decision.' },
  { w: 'proactive', say: 'proh-AK-tiv', means: 'acting before problems happen', ex: 'Being proactive saves time later.' },
  { w: 'humble', say: 'HUM-bul', means: 'not proud; modest', ex: 'Stay humble when things go well.' },
];

export const PHRASES = [
  { p: 'Could you walk me through that?', use: 'When you want someone to explain step by step.' },
  { p: 'Just to make sure I understand…', use: 'Before repeating back what you heard.' },
  { p: 'Let me get back to you on that.', use: 'When you need time before answering.' },
  { p: 'That’s a great point. I’d add that…', use: 'To agree and build on an idea.' },
  { p: 'I see where you’re coming from, but…', use: 'To disagree politely.' },
  { p: 'Would it be possible to…?', use: 'A polite way to ask for something.' },
  { p: 'I’ll keep you posted.', use: 'Promising updates.' },
  { p: 'Thank you for your patience.', use: 'When someone has waited.' },
  { p: 'Here’s what I’d suggest.', use: 'Before giving a recommendation.' },
  { p: 'To sum up…', use: 'To finish clearly.' },
  { p: 'I’m not sure I follow. Could you rephrase that?', use: 'When something wasn’t clear.' },
  { p: 'That makes sense.', use: 'To show you understood.' },
  { p: 'Let’s take a step back.', use: 'To look at the bigger picture.' },
  { p: 'I apologise for the confusion.', use: 'To own a mistake professionally.' },
  { p: 'Happy to help!', use: 'A warm way to reply to thanks.' },
];

export const SPEAKING = [
  'Describe your perfect morning in one minute.',
  'Explain what Lotus does to someone who has never heard of it.',
  'Tell the story of your favourite childhood memory.',
  'Describe your room as if the listener can’t see it.',
  'What would you change about your city, and why?',
  'Explain how to make chai, step by step.',
  'Talk about someone you admire and why.',
  'Describe your job to a 10-year-old.',
  'What did you learn this week?',
  'Give advice to someone starting a night-shift job.',
];

export const TWISTERS = [
  'She sells seashells by the seashore.',
  'Red lorry, yellow lorry.',
  'Unique New York, unique New York.',
  'Fresh fried fish, fish fresh fried.',
  'The thirty-three thieves thought that they thrilled the throne throughout Thursday.',
  'Which wristwatches are Swiss wristwatches?',
  'I saw a kitten eating chicken in the kitchen.',
];

// ---------- Duas (Quran and authentic hadith) ----------

export type Dua = { id: string; when: string; ar: string; tr: string; means: string; source: string };

export const DUAS: Dua[] = [
  { id: 'wake', when: 'When you wake up', ar: 'ٱلْحَمْدُ لِلَّٰهِ ٱلَّذِي أَحْيَانَا بَعْدَ مَا أَمَاتَنَا وَإِلَيْهِ ٱلنُّشُورُ', tr: 'Alhamdu lillahil-ladhi ahyana baʿda ma amatana wa ilayhin-nushur', means: 'Praise be to Allah who gave us life after causing us to die, and to Him is the return.', source: 'Sahih al-Bukhari 6324' },
  { id: 'sleep', when: 'Before you sleep', ar: 'بِٱسْمِكَ ٱللَّٰهُمَّ أَمُوتُ وَأَحْيَا', tr: 'Bismika Allahumma amutu wa ahya', means: 'In Your name, O Allah, I die and I live.', source: 'Sahih al-Bukhari 6324' },
  { id: 'anxiety', when: 'When you feel anxious or sad', ar: 'ٱللَّٰهُمَّ إِنِّي أَعُوذُ بِكَ مِنَ ٱلْهَمِّ وَٱلْحَزَنِ، وَٱلْعَجْزِ وَٱلْكَسَلِ، وَٱلْبُخْلِ وَٱلْجُبْنِ، وَضَلَعِ ٱلدَّيْنِ وَغَلَبَةِ ٱلرِّجَالِ', tr: 'Allahumma inni aʿudhu bika minal-hammi wal-hazan, wal-ʿajzi wal-kasal, wal-bukhli wal-jubn, wa dalaʿid-dayn wa ghalabatir-rijal', means: 'O Allah, I seek refuge in You from worry and grief, from weakness and laziness, from miserliness and cowardice, from the burden of debt and from being overpowered by people.', source: 'Sahih al-Bukhari 6369' },
  { id: 'yunus', when: 'In distress', ar: 'لَا إِلَٰهَ إِلَّا أَنتَ سُبْحَانَكَ إِنِّي كُنتُ مِنَ ٱلظَّٰلِمِينَ', tr: 'La ilaha illa anta subhanaka inni kuntu minaz-zalimin', means: 'There is no god but You, glory be to You; I was among the wrongdoers.', source: 'Quran 21:87' },
  { id: 'hasbuna', when: 'When things feel too heavy', ar: 'حَسْبُنَا ٱللَّٰهُ وَنِعْمَ ٱلْوَكِيلُ', tr: 'Hasbunallahu wa niʿmal-wakil', means: 'Allah is enough for us, and He is the best disposer of affairs.', source: 'Quran 3:173 · Sahih al-Bukhari 4563' },
  { id: 'heart', when: 'For a steady heart', ar: 'يَا مُقَلِّبَ ٱلْقُلُوبِ ثَبِّتْ قَلْبِي عَلَىٰ دِينِكَ', tr: 'Ya muqallibal-qulub, thabbit qalbi ʿala dinik', means: 'O Turner of hearts, make my heart firm upon Your religion.', source: 'Jamiʿ at-Tirmidhi 2140' },
  { id: 'love', when: 'To grow in love for Allah', ar: 'ٱللَّٰهُمَّ إِنِّي أَسْأَلُكَ حُبَّكَ وَحُبَّ مَنْ يُحِبُّكَ وَحُبَّ عَمَلٍ يُقَرِّبُنِي إِلَىٰ حُبِّكَ', tr: 'Allahumma inni asʾaluka hubbaka wa hubba man yuhibbuka wa hubba ʿamalin yuqarribuni ila hubbik', means: 'O Allah, I ask You for Your love, the love of those who love You, and the love of deeds that bring me closer to Your love.', source: 'Jamiʿ at-Tirmidhi 3235' },
  { id: 'parents', when: 'For Ammi and Abbu', ar: 'رَّبِّ ٱرْحَمْهُمَا كَمَا رَبَّيَانِي صَغِيرًا', tr: 'Rabbir-hamhuma kama rabbayani saghira', means: 'My Lord, have mercy on them as they raised me when I was small.', source: 'Quran 17:24' },
  { id: 'knowledge', when: 'Before you study', ar: 'رَّبِّ زِدْنِي عِلْمًا', tr: 'Rabbi zidni ʿilma', means: 'My Lord, increase me in knowledge.', source: 'Quran 20:114' },
  { id: 'dunya', when: 'For everything good', ar: 'رَبَّنَا آتِنَا فِي ٱلدُّنْيَا حَسَنَةً وَفِي ٱلْآخِرَةِ حَسَنَةً وَقِنَا عَذَابَ ٱلنَّارِ', tr: 'Rabbana atina fid-dunya hasanah, wa fil-akhirati hasanah, wa qina ʿadhaban-nar', means: 'Our Lord, give us good in this world and good in the Hereafter, and protect us from the Fire.', source: 'Quran 2:201 · Sahih al-Bukhari 6389' },
  { id: 'family', when: 'For your future family', ar: 'رَبَّنَا هَبْ لَنَا مِنْ أَزْوَاجِنَا وَذُرِّيَّاتِنَا قُرَّةَ أَعْيُنٍ وَٱجْعَلْنَا لِلْمُتَّقِينَ إِمَامًا', tr: 'Rabbana hab lana min azwajina wa dhurriyyatina qurrata aʿyunin wajʿalna lil-muttaqina imama', means: 'Our Lord, grant us from our spouses and children comfort to our eyes, and make us leaders of the righteous.', source: 'Quran 25:74' },
  { id: 'home', when: 'Leaving home', ar: 'بِسْمِ ٱللَّٰهِ تَوَكَّلْتُ عَلَى ٱللَّٰهِ، وَلَا حَوْلَ وَلَا قُوَّةَ إِلَّا بِٱللَّٰهِ', tr: 'Bismillah, tawakkaltu ʿalallah, wa la hawla wa la quwwata illa billah', means: 'In the name of Allah, I rely on Allah; there is no power and no strength except with Allah.', source: 'Sunan Abi Dawud 5095 · Tirmidhi 3426' },
  { id: 'forgot', when: 'If you forgot Bismillah before eating', ar: 'بِسْمِ ٱللَّٰهِ أَوَّلَهُ وَآخِرَهُ', tr: 'Bismillahi awwalahu wa akhirahu', means: 'In the name of Allah, at its beginning and its end.', source: 'Sunan Abi Dawud 3767 · Tirmidhi 1858' },
  { id: 'after-food', when: 'After eating', ar: 'ٱلْحَمْدُ لِلَّٰهِ ٱلَّذِي أَطْعَمَنِي هَٰذَا وَرَزَقَنِيهِ مِنْ غَيْرِ حَوْلٍ مِنِّي وَلَا قُوَّةٍ', tr: 'Alhamdu lillahil-ladhi atʿamani hadha wa razaqanihi min ghayri hawlin minni wa la quwwah', means: 'Praise be to Allah who fed me this and provided it for me without any power or strength from me.', source: 'Sunan Abi Dawud 4023 · Tirmidhi 3458' },
];

// ---------- Money ----------

export const EXPENSE_CATS = ['Food', 'Transport', 'Family', 'Bills', 'Shopping', 'Health', 'Self-care', 'Sadaqah', 'Lotus', 'Other'];
export const INCOME_CATS = ['Salary', 'Lotus', 'Gift', 'Other'];

export const LIST_TEMPLATES = ['Groceries', 'Wishlist', 'Ideas for Lotus', 'Books to read', 'Things to buy for my room'];
