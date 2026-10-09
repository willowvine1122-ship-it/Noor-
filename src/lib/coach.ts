import type { DayTimes } from './routine';
import type { PrayerState } from './hooks';
import { addDays, PRAYER_NAMES, type PrayerId } from './time';

/** The partner's free hour each day (PKT). */
export const PARTNER_CALL = { start: 18, end: 19 };

export type RhythmItem = { at: Date; title: string; kind: 'prayer' | 'meal' | 'deen' | 'body' | 'work' | 'joy' | 'family' | 'rest'; prayer?: PrayerId };

export function at(day: Date, h: number, m: number) {
  const d = new Date(day);
  d.setHours(h, m, 0, 0);
  // hours before late morning belong to the night after this day
  return h < 11 ? addDays(d, 1) : d;
}

function plus(d: Date, min: number) {
  return new Date(d.getTime() + min * 60000);
}

/** The day rhythm, anchored to her routine and the real prayer times. */
export function rhythm(day: Date, prayers: PrayerState[], t: DayTimes, partner = 'your partner'): RhythmItem[] {
  const p = Object.fromEntries(prayers.map((x) => [x.id, x.start])) as Record<PrayerId, Date>;
  const items: RhythmItem[] = [
    { at: t.wake, title: t.weekend ? 'Weekend! Wake slowly, water first' : 'Wake up gently, water first', kind: 'body' },
    { at: plus(t.wake, 45), title: t.weekend ? 'Slow brunch: something you love' : 'Meal 1: something small and easy', kind: 'meal' },
    { at: plus(t.wake, 75), title: 'Quran page and a little learning', kind: 'deen' },
    { at: t.hobby, title: t.weekend ? 'Joy time: a hobby, a walk, a treat' : 'Hobby time', kind: 'joy' },
    { at: at(day, PARTNER_CALL.start, 0), title: `Call with ${partner} (pause for Maghrib)`, kind: 'joy' },
    { at: t.family, title: t.weekend ? 'Family evening: chai, talk, laugh' : 'Family time: sit with them', kind: 'family' },
    { at: plus(p.isha, 25), title: 'Meal 2: dinner with family', kind: 'meal' },
    { at: plus(p.fajr, 15), title: 'Meal 3: something warm', kind: 'meal' },
    { at: plus(t.sleep, -30), title: 'Wind down: phone face down, tasbih', kind: 'rest' },
    { at: t.sleep, title: t.late ? 'Sleep (a little later tonight)' : 'Sleep. Tasbih on your fingers', kind: 'rest' },
  ];
  if (t.lotus) {
    items.push({ at: t.lotus.start, title: t.weekend ? 'Lotus deep work: one beautiful thing' : 'Lotus focus block', kind: 'work' });
    items.push({ at: t.lotus.end, title: 'Lotus done. Note one win', kind: 'work' });
  }
  if (t.shift) {
    items.push({ at: plus(t.shift.start, -30), title: 'Get ready: water, snack, desk', kind: 'work' });
    items.push({ at: t.shift.start, title: 'Shift starts. Bismillah', kind: 'work' });
    items.push({ at: plus(t.shift.start, 240), title: 'Snack and stretch break', kind: 'body' });
    items.push({ at: t.shift.end, title: 'Shift ends', kind: 'work' });
  }
  for (const x of prayers) items.push({ at: x.start, title: PRAYER_NAMES[x.id].en, kind: 'prayer', prayer: x.id });
  return items.sort((a, b) => a.at.getTime() - b.at.getTime());
}
