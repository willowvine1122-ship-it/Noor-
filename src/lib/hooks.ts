import { useEffect, useMemo, useState } from 'react';
import { useStore, readDay, inCycle } from './store';
import { addDays, dateKey, noorDate, prayersForDay, type PrayerSlot } from './time';

export function useNow(intervalMs = 1000) {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), intervalMs);
    const onVis = () => setNow(new Date());
    document.addEventListener('visibilitychange', onVis);
    return () => {
      clearInterval(id);
      document.removeEventListener('visibilitychange', onVis);
    };
  }, [intervalMs]);
  return now;
}

export type PrayerState = PrayerSlot & { phase: 'upcoming' | 'now' | 'past' };

/** Everything about "today" in Afza's day, recomputed as time passes. */
export function useToday(intervalMs = 1000) {
  const { state } = useStore();
  const now = useNow(intervalMs);
  const day = noorDate(now, state.dayStartHour);
  const key = dateKey(day);
  const minuteKey = Math.floor(now.getTime() / 60000);

  const prayers = useMemo<PrayerState[]>(() => {
    return prayersForDay(day, state.asr).map((p) => ({
      ...p,
      phase: now < p.start ? 'upcoming' : now < p.end ? 'now' : 'past',
    }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key, state.asr, minuteKey]);

  const nextPrayer = useMemo(() => {
    const upcoming = prayers.find((p) => p.phase === 'upcoming');
    if (upcoming) return upcoming;
    const tomorrow = prayersForDay(addDays(day, 1), state.asr)[0];
    return { ...tomorrow, phase: 'upcoming' as const };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [prayers]);

  const current = prayers.find((p) => p.phase === 'now');
  const log = readDay(state, key);
  const cycle = inCycle(state, dateKey(now)) || inCycle(state, key);

  return { now, day, key, prayers, nextPrayer, current, log, cycle };
}
