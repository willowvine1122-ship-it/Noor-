// Small joys that make her want to come back: a gift each day and a garden that grows with her.
import type { State } from './store';
import { AYAT } from './content3';
import { daysBetween } from './time';

export type Gift = { kind: 'ayah' | 'hadith' | 'note'; text: string; ar?: string; ref?: string };

const HADITH: Gift[] = [
  { kind: 'hadith', text: 'The most beloved deeds to Allah are those done consistently, even if they are small.', ref: 'Bukhari and Muslim' },
  { kind: 'hadith', text: 'Allah does not look at your forms or your wealth, but He looks at your hearts and your deeds.', ref: 'Muslim' },
  { kind: 'hadith', text: 'Whoever takes a path seeking knowledge, Allah makes easy for them a path to Paradise.', ref: 'Muslim' },
  { kind: 'hadith', text: 'A good word is charity.', ref: 'Bukhari and Muslim' },
  { kind: 'hadith', text: 'Your smile for your brother or sister is charity.', ref: 'Tirmidhi' },
  { kind: 'hadith', text: 'Make things easy and do not make them hard. Give good news and do not push people away.', ref: 'Bukhari' },
  { kind: 'hadith', text: 'None of you truly believes until you love for your brother what you love for yourself.', ref: 'Bukhari and Muslim' },
  { kind: 'hadith', text: 'The strong believer is better and more beloved to Allah than the weak believer, and there is good in both.', ref: 'Muslim' },
];

const NOTES: Gift[] = [
  { kind: 'note', text: 'You came back today. That is the whole secret. Keep coming back.' },
  { kind: 'note', text: 'The you of next year is already thanking you for today.' },
  { kind: 'note', text: 'You don’t have to be perfect today. Five salah and a kind heart is a beautiful day.' },
  { kind: 'note', text: 'Lotus is growing because you are. Proud of you.' },
  { kind: 'note', text: 'Your family is lucky to have you. Go hug someone today.' },
  { kind: 'note', text: 'Rest is not lazy. Rest is how flowers get ready to bloom.' },
  { kind: 'note', text: 'Every “Bismillah” you say turns an ordinary moment into worship.' },
];

export const GIFTS: Gift[] = [];
for (let i = 0; i < Math.max(AYAT.length, HADITH.length, NOTES.length); i++) {
  if (AYAT[i]) GIFTS.push({ kind: 'ayah', text: AYAT[i].en, ar: AYAT[i].ar, ref: AYAT[i].ref });
  if (HADITH[i]) GIFTS.push(HADITH[i]);
  if (NOTES[i]) GIFTS.push(NOTES[i]);
}

export const giftFor = (day: Date) => GIFTS[((daysBetween(new Date(2026, 0, 1), day) * 7) % GIFTS.length + GIFTS.length) % GIFTS.length];

export const LEVELS = [
  { name: 'Seed', at: 0 },
  { name: 'Sprout', at: 20 },
  { name: 'Bud', at: 60 },
  { name: 'Bloom', at: 140 },
  { name: 'Garden', at: 280 },
  { name: 'Paradise garden', at: 500 },
];

/** "Light": everything she has ever done in Noor, added up. */
export function light(state: State) {
  let n = 0;
  for (const d of Object.values(state.days)) {
    n += Object.values(d.prayers ?? {}).filter((s) => s && s !== 'missed').length;
    n += Object.values(d.prayers ?? {}).filter((s) => s === 'ontime').length; // on time counts double
    n += (d.meals ?? []).filter(Boolean).length + (d.tasks ?? []).filter((t) => t.done).length + (d.habits ?? []).length;
    n += (d.quranPages ? 1 : 0) + (d.familyTime?.length ? 1 : 0);
  }
  return n + (state.lotus?.wins.length ?? 0) * 2 + Object.keys(state.gifts ?? {}).length;
}

export function levelOf(n: number) {
  let i = 0;
  while (i + 1 < LEVELS.length && n >= LEVELS[i + 1].at) i++;
  const next = LEVELS[i + 1];
  return { i, name: LEVELS[i].name, next: next?.name, toNext: next ? next.at - n : 0, pct: next ? (n - LEVELS[i].at) / (next.at - LEVELS[i].at) : 1, light: n };
}

export function butterfliesAllTime(state: State) {
  return Object.values(state.days).reduce((a, d) => a + Object.values(d.prayers ?? {}).filter((s) => s === 'ontime').length, 0);
}
