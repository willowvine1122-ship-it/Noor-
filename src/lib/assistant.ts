import type { Tab } from '../App';
import type { PrayerState } from './hooks';
import { at } from './coach';
import { TASBIHAT } from './content';
import type { DayLog, PrayerStatus, State } from './store';
import { addDays, dateKey, PRAYER_NAMES } from './time';

/** What a step does when she says "done". */
export type StepDo =
  | { kind: 'prayer'; prayer: PrayerState['id']; status: PrayerStatus }
  | { kind: 'meal'; i: 0 | 1 | 2 }
  | { kind: 'water' }
  | { kind: 'quran' }
  | { kind: 'task'; id: string }
  | { kind: 'habit'; id: string }
  | { kind: 'family' }
  | { kind: 'mark'; id: string }
  | { kind: 'go'; tab: Tab };

export type Step = {
  id: string;
  title: string;
  why: string;
  tone: 'gold' | 'rose' | 'sage' | 'sky' | 'lilac';
  icon: 'moon' | 'bowl' | 'drop' | 'book' | 'check' | 'flame' | 'user' | 'sparkle' | 'chat' | 'pen' | 'bed' | 'timer';
  urgent?: boolean;
  plan?: boolean; // the "plan your day" step, filled in place
  done: StepDo;
  alt?: { label: string; done: StepDo }; // a second way to finish, e.g. prayed late
  doneLabel?: string;
  min?: number; // rough minutes it takes
};

const plus = (d: Date, m: number) => new Date(d.getTime() + m * 60000);

/**
 * Everything she should do right now, most important first.
 * Prayer always leads; then food, water and the small promises she made today.
 */
export function buildSteps(state: State, now: Date, day: Date, key: string, prayers: PrayerState[], log: DayLog, cycle: boolean, marks: string[]): Step[] {
  const steps: Step[] = [];
  const pr = Object.fromEntries(prayers.map((p) => [p.id, p])) as Record<PrayerState['id'], PrayerState>;
  const wake = at(day, 13, 30);

  if (!cycle) {
    const order = [...prayers].sort((a, b) => Number(b.phase === 'now') - Number(a.phase === 'now'));
    for (const p of order) {
      if (log.prayers[p.id] || p.phase === 'upcoming') continue;
      const name = PRAYER_NAMES[p.id].en;
      if (p.phase === 'now') {
        const left = Math.round((p.end.getTime() - now.getTime()) / 60000);
        steps.push({
          id: `pray-${p.id}`, title: `Pray ${name} now`, urgent: true, tone: 'gold', icon: 'moon', min: 10,
          why: left < 40 ? `Only ${left} minutes left. Get up, make wudu, and go to Allah before anything else.` : 'Allah is calling you. Leave what you’re doing for ten minutes. Everything else can wait.',
          done: { kind: 'prayer', prayer: p.id, status: 'ontime' }, doneLabel: 'I prayed',
        });
      } else {
        steps.push({
          id: `pray-${p.id}`, title: `Did you pray ${name}?`, tone: 'gold', icon: 'moon', min: 10,
          why: 'If you missed it, pray it now as qada. Allah loves the one who returns.',
          done: { kind: 'prayer', prayer: p.id, status: 'late' }, doneLabel: 'Prayed late',
          alt: { label: 'Made it up now', done: { kind: 'prayer', prayer: p.id, status: 'qada' } },
        });
      }
    }
  }

  if (!log.tasks.length && now >= wake && !marks.includes('plan')) {
    steps.push({ id: 'plan', title: 'Plan your day: choose three things', why: 'Three is enough. When your head knows the plan, your heart can rest.', tone: 'lilac', icon: 'pen', plan: true, done: { kind: 'mark', id: 'plan' }, min: 2 });
  }

  const meals: [Date, string][] = [[at(day, 14, 15), 'Eat your first meal'], [plus(pr.isha.start, 25), 'Eat dinner with your family'], [plus(pr.fajr.start, 15), 'Eat something warm before sleep']];
  meals.forEach(([t, title], i) => {
    if (now >= t && !log.meals[i]) steps.push({ id: `meal-${i}`, title, why: 'Small is fine: toast, fruit, a bowl of anything. Your body needs fuel to worship and work.', tone: 'rose', icon: 'bowl', done: { kind: 'meal', i: i as 0 | 1 | 2 }, min: 15 });
  });

  const hoursUp = (now.getTime() - wake.getTime()) / 3600000;
  if (hoursUp > 0 && log.water < Math.min(8, Math.ceil(hoursUp / 2))) {
    steps.push({ id: 'water', title: 'Drink a glass of water', why: `You’re at ${log.water} of 8 today. Go fill it now; it takes one minute.`, tone: 'sky', icon: 'drop', done: { kind: 'water' }, doneLabel: 'Drank one', min: 1 });
  }

  if (!cycle && !log.quranPages && now >= at(day, 14, 45)) {
    steps.push({ id: 'quran', title: `Read one page of Quran (page ${state.quranPage})`, why: 'Just one page. Five minutes with the words of your Rabb.', tone: 'gold', icon: 'book', done: { kind: 'quran' }, doneLabel: 'Read it', min: 5 });
  }

  const tasbih = TASBIHAT.reduce((a, t) => a + Math.min(log.tasbih[t.id] ?? 0, state.tasbihTargets[t.id] ?? t.target), 0);
  if (tasbih === 0 && now >= at(day, 16, 0) && !marks.includes('tasbih')) {
    steps.push({ id: 'tasbih', title: 'Do your tasbih', why: cycle ? 'On rest days, dhikr is your worship. Your heart stays close.' : 'SubhanAllah, Alhamdulillah, Allahu Akbar. A few minutes, big reward.', tone: 'sage', icon: 'sparkle', done: { kind: 'go', tab: 'deen' }, doneLabel: 'Open tasbih', min: 5 });
  }

  for (const t of log.tasks.filter((x) => !x.done)) {
    steps.push({ id: `task-${t.id}`, title: t.text, why: 'You chose this today. Start with five minutes; momentum will do the rest.', tone: 'lilac', icon: 'check', done: { kind: 'task', id: t.id }, min: 25 });
  }

  for (const h of state.habits.filter((x) => !log.habits.includes(x.id))) {
    steps.push({ id: `habit-${h.id}`, title: h.name, why: 'A small habit, kept today, is a promise to yourself kept.', tone: 'sage', icon: 'flame', done: { kind: 'habit', id: h.id }, min: 5 });
  }

  if (now >= at(day, 19, 0) && now < at(day, 21, 0) && !log.familyTime.length) {
    steps.push({ id: 'family', title: 'Sit with your family for 15 minutes', why: 'Even if nobody talks much. Being there is the love.', tone: 'rose', icon: 'user', done: { kind: 'family' }, min: 15 });
  }

  if (now >= at(day, 15, 0) && !state.english.days[key]?.word && !marks.includes('english')) {
    steps.push({ id: 'english', title: 'Learn today’s English word', why: 'Two minutes. Say it out loud three times.', tone: 'sky', icon: 'chat', done: { kind: 'go', tab: 'english' }, doneLabel: 'Open English', min: 3 });
  }

  const wroteToday = state.journal.some((j) => new Date(j.at) >= wake);
  if (now >= plus(pr.isha.start, 60) && !wroteToday && !marks.includes('diary')) {
    steps.push({ id: 'diary', title: 'Write three lines in your diary', why: 'What happened, how you felt, one thing you’re grateful for.', tone: 'lilac', icon: 'pen', done: { kind: 'go', tab: 'diary' }, doneLabel: 'Open diary', min: 5 });
  }

  if (now >= at(day, 6, 0) && !marks.includes('sleep')) {
    steps.push({ id: 'sleep', title: 'Phone down. Time to sleep', why: 'Tasbih on your fingers until you drift off. Tomorrow starts kinder when you rest.', tone: 'sky', icon: 'bed', done: { kind: 'mark', id: 'sleep' }, doneLabel: 'Going to sleep', min: 1 });
  }

  return steps;
}

/** How many of today's things are done, out of everything today asked for. */
export function doneToday(state: State, key: string, log: DayLog) {
  return (
    Object.values(log.prayers).filter((s) => s && s !== 'missed').length +
    log.meals.filter(Boolean).length +
    log.tasks.filter((t) => t.done).length +
    log.habits.length +
    (log.quranPages ? 1 : 0) +
    (log.familyTime.length ? 1 : 0) +
    (state.english.days[key]?.word ? 1 : 0) +
    log.marks.filter((m) => m === 'plan' || m === 'sleep').length
  );
}

/** Days in a row with all five prayers kept. Rest days don't break it. */
export function prayerStreak(state: State, today: Date, todayKey: string, rest: (key: string) => boolean) {
  const full = (k: string) => {
    const p = state.days[k]?.prayers ?? {};
    return (['dhuhr', 'asr', 'maghrib', 'isha', 'fajr'] as const).every((id) => p[id] && p[id] !== 'missed');
  };
  let n = full(todayKey) ? 1 : 0;
  for (let i = 1; i < 400; i++) {
    const k = dateKey(addDays(today, -i));
    if (rest(k)) continue;
    if (!full(k)) break;
    n++;
  }
  return n;
}
