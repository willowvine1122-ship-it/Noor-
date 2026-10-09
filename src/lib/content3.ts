// ---------- Themes ----------

export type PaletteId = 'pearl' | 'rose' | 'sky' | 'lavender' | 'sand' | 'mint';

export const PALETTES: { id: PaletteId; name: string; swatch: [string, string, string] }[] = [
  { id: 'pearl', name: 'Pearl', swatch: ['#fff6e8', '#eef5f0', '#6f9a86'] },
  { id: 'rose', name: 'Rose garden', swatch: ['#fde4e4', '#f6eaf3', '#c27b86'] },
  { id: 'sky', name: 'Morning sky', swatch: ['#e3eefa', '#eef6f4', '#5f8fbf'] },
  { id: 'lavender', name: 'Lavender', swatch: ['#ece6f8', '#f8e9f1', '#8a7bc0'] },
  { id: 'sand', name: 'Desert gold', swatch: ['#fbecd0', '#f5efe2', '#b48a3e'] },
  { id: 'mint', name: 'Fresh mint', swatch: ['#dff3ec', '#eef7f3', '#4f9e8a'] },
];

// ---------- Verse of the day (short, well-known ayat) ----------

export type Ayah = { ar: string; en: string; ref: string };

export const AYAT: Ayah[] = [
  { ar: 'إِنَّ مَعَ ٱلْعُسْرِ يُسْرًا', en: 'Indeed, with hardship comes ease.', ref: 'Ash-Sharh 94:6' },
  { ar: 'أَلَا بِذِكْرِ ٱللَّهِ تَطْمَئِنُّ ٱلْقُلُوبُ', en: 'Truly, in the remembrance of Allah do hearts find rest.', ref: 'Ar-Raʿd 13:28' },
  { ar: 'فَٱذْكُرُونِىٓ أَذْكُرْكُمْ', en: 'So remember Me; I will remember you.', ref: 'Al-Baqarah 2:152' },
  { ar: 'وَمَن يَتَوَكَّلْ عَلَى ٱللَّهِ فَهُوَ حَسْبُهُۥٓ', en: 'Whoever relies upon Allah, He is enough for them.', ref: 'At-Talaq 65:3' },
  { ar: 'لَا يُكَلِّفُ ٱللَّهُ نَفْسًا إِلَّا وُسْعَهَا', en: 'Allah does not burden a soul beyond what it can bear.', ref: 'Al-Baqarah 2:286' },
  { ar: 'لَا تَقْنَطُوا۟ مِن رَّحْمَةِ ٱللَّهِ', en: 'Do not despair of the mercy of Allah.', ref: 'Az-Zumar 39:53' },
  { ar: 'فَإِنِّى قَرِيبٌ', en: 'Indeed, I am near.', ref: 'Al-Baqarah 2:186' },
  { ar: 'وَلَا تَهِنُوا۟ وَلَا تَحْزَنُوا۟', en: 'So do not lose heart, and do not grieve.', ref: 'Al ʿImran 3:139' },
  { ar: 'وَلَسَوْفَ يُعْطِيكَ رَبُّكَ فَتَرْضَىٰٓ', en: 'And your Lord is going to give you, and you will be pleased.', ref: 'Ad-Duha 93:5' },
  { ar: 'إِنَّ ٱللَّهَ مَعَ ٱلصَّٰبِرِينَ', en: 'Indeed, Allah is with the patient.', ref: 'Al-Baqarah 2:153' },
  { ar: 'لَا تَخَافَآ ۖ إِنَّنِى مَعَكُمَآ أَسْمَعُ وَأَرَىٰ', en: 'Do not fear. I am with you both; I hear and I see.', ref: 'Ta-Ha 20:46' },
  { ar: 'وَنَحْنُ أَقْرَبُ إِلَيْهِ مِنْ حَبْلِ ٱلْوَرِيدِ', en: 'And We are closer to him than his jugular vein.', ref: 'Qaf 50:16' },
  { ar: 'لَئِن شَكَرْتُمْ لَأَزِيدَنَّكُمْ', en: 'If you are grateful, I will surely give you more.', ref: 'Ibrahim 14:7' },
  { ar: 'وَٱلَّذِينَ جَٰهَدُوا۟ فِينَا لَنَهْدِيَنَّهُمْ سُبُلَنَا', en: 'Those who strive for Us, We will surely guide them to Our ways.', ref: 'Al-ʿAnkabut 29:69' },
  { ar: 'وَلَا تَا۟يْـَٔسُوا۟ مِن رَّوْحِ ٱللَّهِ', en: 'And do not lose hope in the relief of Allah.', ref: 'Yusuf 12:87' },
];

// ---------- Habits ----------

export const HABIT_IDEAS = [
  'Morning adhkar', 'Evening adhkar', 'Walk 10 minutes', 'No phone for 30 min after waking', 'Read 10 pages',
  'Skincare', 'Vitamins', 'Stretch 5 minutes', 'Sit with family', 'Make my bed', 'Sadaqah, even small', 'Sunlight on my face',
];
