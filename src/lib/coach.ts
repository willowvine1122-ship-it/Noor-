import type { DayLog } from './store';
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

/** The day rhythm, anchored to real prayer times so it moves with the seasons. */
export function rhythm(day: Date, prayers: PrayerState[], partner = 'your partner'): RhythmItem[] {
  const p = Object.fromEntries(prayers.map((x) => [x.id, x.start])) as Record<PrayerId, Date>;
  const items: RhythmItem[] = [
    { at: at(day, 13, 30), title: 'Wake up gently, water first', kind: 'body' },
    { at: at(day, 14, 15), title: 'Meal 1: something small and easy', kind: 'meal' },
    { at: at(day, 14, 45), title: 'Quran page and a little learning', kind: 'deen' },
    { at: plus(p.asr, 20), title: 'Focus: Lotus and personal tasks', kind: 'work' },
    { at: at(day, 17, 0), title: 'Hobby time', kind: 'joy' },
    { at: at(day, PARTNER_CALL.start, 0), title: `Call with ${partner} (pause for Maghrib)`, kind: 'joy' },
    { at: at(day, PARTNER_CALL.end, 0), title: 'Family time: sit with them', kind: 'family' },
    { at: plus(p.isha, 25), title: 'Meal 2: dinner with family', kind: 'meal' },
    { at: at(day, 20, 30), title: 'Get ready: water, snack, desk', kind: 'work' },
    { at: at(day, 21, 0), title: 'Shift starts. Bismillah', kind: 'work' },
    { at: at(day, 1, 0), title: 'Snack and stretch break', kind: 'body' },
    { at: at(day, 5, 0), title: 'Shift ends', kind: 'work' },
    { at: plus(p.fajr, 15), title: 'Meal 3: something warm', kind: 'meal' },
    { at: at(day, 6, 0), title: 'Wind down: phone face down, tasbih', kind: 'rest' },
    { at: at(day, 6, 30), title: 'Sleep. Tasbih on your fingers', kind: 'rest' },
  ];
  for (const x of prayers) items.push({ at: x.start, title: PRAYER_NAMES[x.id].en, kind: 'prayer', prayer: x.id });
  return items.sort((a, b) => a.at.getTime() - b.at.getTime());
}

export type Nudge = { title: string; detail: string; tone: 'gold' | 'rose' | 'sage' | 'sky' | 'lilac'; urgent?: boolean; action?: 'pray' | 'meal' | 'quran' | 'water' | 'tasbih' };

export function nextBestAction(now: Date, day: Date, prayers: PrayerState[], log: DayLog, cycle: boolean, lowEnergy: boolean, partner = 'your partner'): Nudge {
  const current = prayers.find((p) => p.phase === 'now');
  const p = Object.fromEntries(prayers.map((x) => [x.id, x])) as Record<PrayerId, PrayerState>;

  if (current && !cycle && !log.prayers[current.id]) {
    const left = (current.end.getTime() - now.getTime()) / 60000;
    const name = PRAYER_NAMES[current.id].en;
    if (left < 35) {
      return { title: `${name} is leaving in ${Math.max(1, Math.round(left))} min`, detail: 'Stand up right now. Wudu, then pray. Nothing else first.', tone: 'gold', urgent: true, action: 'pray' };
    }
    return { title: `It’s time for ${name}`, detail: 'Allah is calling you. Leave this, make wudu, and go to Him.', tone: 'gold', urgent: true, action: 'pray' };
  }

  const wake = at(day, 13, 30);
  if (now > plus(wake, 30) && now < p.maghrib.start && !log.meals[0]) {
    return { title: 'Eat something now', detail: 'Your body has been fasting since last night. Small is fine: eggs, paratha, fruit, chai.', tone: 'rose', action: 'meal' };
  }
  if (now > plus(p.isha.start, 20) && now < at(day, 21, 0) && !log.meals[1]) {
    return { title: 'Dinner with your family', detail: 'Sit at the table with them before your shift. Eat even if it isn’t exciting.', tone: 'rose', action: 'meal' };
  }
  if (now > p.fajr.start && !log.meals[2]) {
    return { title: 'A warm meal before sleep', detail: 'You worked all night. Feed yourself before you rest.', tone: 'rose', action: 'meal' };
  }
  if (!cycle && log.quranPages === 0 && now > at(day, 14, 30) && now < at(day, 5, 0)) {
    return { title: 'Your page of Quran', detail: 'One page. Five minutes. A letter from the One you love.', tone: 'gold', action: 'quran' };
  }
  const hoursAwake = (now.getTime() - wake.getTime()) / 3600000;
  if (hoursAwake > 0 && log.water < Math.min(8, Math.floor(hoursAwake / 2) + 1)) {
    return { title: 'A glass of water', detail: 'Tiredness is often thirst. Drink one now.', tone: 'sky', action: 'water' };
  }
  const tasbihDone = Object.values(log.tasbih).reduce((a, b) => a + b, 0);
  if (tasbihDone < 500 && now > at(day, 21, 0) && now < at(day, 5, 0)) {
    return { title: 'A standby moment for dhikr', detail: 'Waiting for a query? Fill the gap with SubhanAllah.', tone: 'sage', action: 'tasbih' };
  }
  if (cycle) {
    return { title: 'Your rest days are still worship', detail: 'Dhikr, dua and listening to Quran. Allah sees your heart.', tone: 'rose', action: 'tasbih' };
  }
  const callStart = at(day, PARTNER_CALL.start, 0);
  const callEnd = at(day, PARTNER_CALL.end, 0);
  if (now >= callStart && now < callEnd) {
    return { title: `Your hour with ${partner}`, detail: 'Be fully there and enjoy it. When it ends at 7, let it end gently and go to your family.', tone: 'lilac' };
  }
  if (now >= callEnd && now < at(day, 21, 0)) {
    return { title: 'Be with your family', detail: 'Sit near Ammi and Abbu. You don’t need a reason.', tone: 'rose' };
  }
  if (lowEnergy) {
    return { title: 'Gentle mode today', detail: 'Only the essentials: salah, food, water. Everything else can wait.', tone: 'lilac' };
  }
  return { title: 'You’re on track', detail: 'Breathe. Alhamdulillah for this moment.', tone: 'sage' };
}
