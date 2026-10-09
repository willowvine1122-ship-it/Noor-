import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import type { AsrMethod, PrayerId } from './time';
import { addDays, dateKey, daysBetween, parseKey } from './time';

export type PrayerStatus = 'ontime' | 'late' | 'qada' | 'missed';
export type Mood = 1 | 2 | 3 | 4 | 5;
export type Energy = 'low' | 'okay' | 'good';

export type DayLog = {
  prayers: Partial<Record<PrayerId, PrayerStatus>>;
  quranPages: number;
  tasbih: Record<string, number>;
  meals: [boolean, boolean, boolean];
  water: number;
  sleepHours?: number;
  mood?: Mood;
  energy?: Energy;
  acts: string[];
  learned?: string;
  tasks: { id: string; text: string; done: boolean }[];
  familyTime: string[];
};

export type Person = {
  id: string;
  name: string;
  relation: string;
  birthday?: string; // MM-DD
  lastTime?: string; // date key of last quality time
  partner?: boolean;
};

export type Period = { start: string; end?: string };

export type JournalEntry = { id: string; at: string; prompt?: string; text: string; mood?: Mood };

export type HobbyTry = { rating: number; verdict?: 'more' | 'maybe' | 'no'; note?: string; at: string };

export type LearningGoal = { id: string; title: string; steps: { id: string; text: string; done: boolean }[] };

export type State = {
  version: 1;
  name: string;
  asr: AsrMethod;
  dayStartHour: number;
  theme: 'light' | 'auto' | 'dark';
  adhanSound: boolean;
  tasbihTargets: Record<string, number>;
  quranPage: number; // next page to read, 1..604
  days: Record<string, DayLog>;
  periods: Period[];
  cycleLength: number;
  periodLength: number;
  people: Person[];
  journal: JournalEntry[];
  hobbyStart: string; // date key the hobby journey began
  hobbies: Record<string, HobbyTry>;
  learning: LearningGoal[];
  partnerNotes: { id: string; at: string; text: string; kind: 'love' | 'gratitude' }[];
  onboarded: boolean;
};

const KEY = 'noor:v1';

export function uid() {
  return Math.random().toString(36).slice(2, 10);
}

export function emptyDay(): DayLog {
  return {
    prayers: {},
    quranPages: 0,
    tasbih: {},
    meals: [false, false, false],
    water: 0,
    acts: [],
    tasks: [],
    familyTime: [],
  };
}

export function defaultState(): State {
  return {
    version: 1,
    name: '',
    asr: 'standard',
    dayStartHour: 11,
    theme: 'light',
    adhanSound: true,
    tasbihTargets: {},
    quranPage: 1,
    days: {},
    periods: [],
    cycleLength: 30,
    periodLength: 6,
    people: [],
    journal: [],
    hobbyStart: dateKey(new Date()),
    hobbies: {},
    learning: [],
    partnerNotes: [],
    onboarded: false,
  };
}

function load(): State {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) return { ...defaultState(), ...JSON.parse(raw) };
  } catch {
    /* fall through to a fresh state */
  }
  return defaultState();
}

type Ctx = {
  state: State;
  update: (fn: (draft: State) => void) => void;
  replace: (next: State) => void;
};

const StoreCtx = createContext<Ctx | null>(null);

export function StoreProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<State>(load);

  useEffect(() => {
    try {
      localStorage.setItem(KEY, JSON.stringify(state));
    } catch {
      /* storage full or blocked; the app still works for this session */
    }
  }, [state]);

  const update = useCallback((fn: (draft: State) => void) => {
    setState((prev) => {
      const draft = structuredClone(prev);
      fn(draft);
      return draft;
    });
  }, []);

  const replace = useCallback((next: State) => setState({ ...defaultState(), ...next }), []);

  const value = useMemo(() => ({ state, update, replace }), [state, update, replace]);
  return <StoreCtx.Provider value={value}>{children}</StoreCtx.Provider>;
}

export function useStore() {
  const ctx = useContext(StoreCtx);
  if (!ctx) throw new Error('useStore outside provider');
  return ctx;
}

/** Returns the log for a day, creating it in the draft if missing. */
export function dayOf(draft: State, key: string): DayLog {
  if (!draft.days[key]) draft.days[key] = emptyDay();
  const d = draft.days[key];
  // fill fields added in later versions
  return Object.assign(d, { ...emptyDay(), ...d });
}

export function readDay(state: State, key: string): DayLog {
  return { ...emptyDay(), ...(state.days[key] ?? {}) };
}

// ---------- cycle ----------

export function sortedPeriods(state: State) {
  return [...state.periods].sort((a, b) => a.start.localeCompare(b.start));
}

export function avgCycleLength(state: State) {
  const p = sortedPeriods(state);
  if (p.length < 2) return state.cycleLength;
  const gaps: number[] = [];
  for (let i = 1; i < p.length; i++) gaps.push(daysBetween(parseKey(p[i - 1].start), parseKey(p[i].start)));
  const recent = gaps.slice(-4).filter((g) => g >= 20 && g <= 45);
  if (!recent.length) return state.cycleLength;
  return Math.round(recent.reduce((a, b) => a + b, 0) / recent.length);
}

/** The period covering this date, if any. A period with no end marked stays open for at most 10 days. */
export function periodOn(state: State, key: string): Period | undefined {
  const d = parseKey(key);
  return state.periods.find((p) => {
    const s = parseKey(p.start);
    const e = p.end ? parseKey(p.end) : addDays(s, 9);
    return daysBetween(s, d) >= 0 && daysBetween(d, e) >= 0;
  });
}

export function inCycle(state: State, key: string) {
  const p = periodOn(state, key);
  if (!p) return false;
  if (p.end) return true;
  // open period: only counts up to today
  return key <= dateKey(new Date());
}

export function nextPeriodPrediction(state: State) {
  const p = sortedPeriods(state);
  if (!p.length) return undefined;
  const last = parseKey(p[p.length - 1].start);
  return addDays(last, avgCycleLength(state));
}

export function isPredicted(state: State, key: string) {
  const next = nextPeriodPrediction(state);
  if (!next) return false;
  const d = parseKey(key);
  const off = daysBetween(next, d);
  return off >= 0 && off < state.periodLength && !inCycle(state, key);
}
