// Her routine, weekday and weekend, so the whole app (steps, rhythm, phone reminders)
// moves when she changes a time.
import type { State } from './store';
import { addDays, dateKey } from './time';

export type DayPlan = {
  wake: string; // "HH:MM" in the afternoon/evening part of her day
  sleep: string; // "HH:MM", usually early morning
  shift: boolean;
  shiftStart: string;
  shiftEnd: string;
  lotus: boolean;
  lotusStart: string;
  lotusEnd: string;
  hobby: string;
  family: string;
};

export type Routine = {
  weekday: DayPlan;
  weekend: DayPlan;
  weekendDays: number[]; // 0 = Sunday … 6 = Saturday, for the Noor day that starts that afternoon
  late: Record<string, number>; // Noor day key → minutes she's staying up later that night
};

export const defaultRoutine = (): Routine => ({
  weekday: { wake: '13:30', sleep: '06:30', shift: true, shiftStart: '21:00', shiftEnd: '05:00', lotus: true, lotusStart: '16:30', lotusEnd: '17:45', hobby: '17:45', family: '19:00' },
  weekend: { wake: '14:00', sleep: '06:30', shift: false, shiftStart: '21:00', shiftEnd: '05:00', lotus: true, lotusStart: '22:00', lotusEnd: '01:00', hobby: '17:00', family: '19:00' },
  weekendDays: [6, 0],
  late: {},
});

export function getRoutine(state: State): Routine {
  const d = defaultRoutine();
  const r = state.routine;
  return r ? { ...d, ...r, weekday: { ...d.weekday, ...r.weekday }, weekend: { ...d.weekend, ...r.weekend }, late: r.late ?? {} } : d;
}

/** "HH:MM" on her day: hours before late morning belong to the night after. */
export function clock(day: Date, hhmm: string) {
  const [h, m] = hhmm.split(':').map(Number);
  const d = new Date(day.getFullYear(), day.getMonth(), day.getDate(), h, m || 0);
  return h < 11 ? addDays(d, 1) : d;
}

const plus = (d: Date, min: number) => new Date(d.getTime() + min * 60000);

export function isWeekend(state: State, day: Date) {
  return getRoutine(state).weekendDays.includes(day.getDay());
}

export type DayTimes = {
  weekend: boolean;
  wake: Date;
  sleep: Date;
  shift?: { start: Date; end: Date };
  lotus?: { start: Date; end: Date };
  hobby: Date;
  family: Date;
  late: number;
};

/** The real times for one Noor day, with tonight's "staying up later" applied. */
export function dayTimes(state: State, day: Date): DayTimes {
  const r = getRoutine(state);
  const weekend = r.weekendDays.includes(day.getDay());
  const p = weekend ? r.weekend : r.weekday;
  const late = r.late[dateKey(day)] ?? 0;
  const lateBefore = r.late[dateKey(addDays(day, -1))] ?? 0;
  return {
    weekend,
    wake: plus(clock(day, p.wake), lateBefore),
    sleep: plus(clock(day, p.sleep), late),
    shift: p.shift ? { start: clock(day, p.shiftStart), end: clock(day, p.shiftEnd) } : undefined,
    lotus: p.lotus ? { start: clock(day, p.lotusStart), end: clock(day, p.lotusEnd) } : undefined,
    hobby: clock(day, p.hobby),
    family: clock(day, p.family),
    late,
  };
}
