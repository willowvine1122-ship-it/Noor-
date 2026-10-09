import { CalculationMethod, Coordinates, Madhab, PrayerTimes } from 'adhan';

export type PrayerId = 'dhuhr' | 'asr' | 'maghrib' | 'isha' | 'fajr';

// Afza's day runs from waking (afternoon) through her night shift to Fajr,
// so a "Noor day" starts late morning rather than at midnight.
export const PRAYER_ORDER: PrayerId[] = ['dhuhr', 'asr', 'maghrib', 'isha', 'fajr'];

export const PRAYER_NAMES: Record<PrayerId, { en: string; ar: string }> = {
  fajr: { en: 'Fajr', ar: 'الفجر' },
  dhuhr: { en: 'Dhuhr', ar: 'الظهر' },
  asr: { en: 'Asr', ar: 'العصر' },
  maghrib: { en: 'Maghrib', ar: 'المغرب' },
  isha: { en: 'Isha', ar: 'العشاء' },
};

export const KARACHI = { lat: 24.8607, lng: 67.0011 };

export function pad(n: number) {
  return String(n).padStart(2, '0');
}

export function dateKey(d: Date) {
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

export function parseKey(key: string) {
  const [y, m, d] = key.split('-').map(Number);
  return new Date(y, m - 1, d);
}

export function addDays(d: Date, n: number) {
  const x = new Date(d);
  x.setDate(x.getDate() + n);
  return x;
}

export function daysBetween(a: Date, b: Date) {
  const ms = new Date(b.getFullYear(), b.getMonth(), b.getDate()).getTime() -
    new Date(a.getFullYear(), a.getMonth(), a.getDate()).getTime();
  return Math.round(ms / 86400000);
}

/** The calendar date her current day belongs to. Before `dayStartHour`, it's still "last night". */
export function noorDate(now: Date, dayStartHour: number) {
  const d = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  return now.getHours() < dayStartHour ? addDays(d, -1) : d;
}

export function noorKey(now: Date, dayStartHour: number) {
  return dateKey(noorDate(now, dayStartHour));
}

export type AsrMethod = 'standard' | 'hanafi';

function calc(date: Date, asr: AsrMethod) {
  const params = CalculationMethod.Karachi();
  params.madhab = asr === 'hanafi' ? Madhab.Hanafi : Madhab.Shafi;
  return new PrayerTimes(new Coordinates(KARACHI.lat, KARACHI.lng), date, params);
}

export type PrayerSlot = { id: PrayerId; start: Date; end: Date };

/** Prayers of one Noor day: Dhuhr..Isha of that date, then Fajr of the next morning. */
export function prayersForDay(day: Date, asr: AsrMethod): PrayerSlot[] {
  const t = calc(day, asr);
  const next = calc(addDays(day, 1), asr);
  return [
    { id: 'dhuhr', start: t.dhuhr, end: t.asr },
    { id: 'asr', start: t.asr, end: t.maghrib },
    { id: 'maghrib', start: t.maghrib, end: t.isha },
    { id: 'isha', start: t.isha, end: next.fajr },
    { id: 'fajr', start: next.fajr, end: next.sunrise },
  ];
}

export function fmtTime(d: Date) {
  return d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
}

export function fmtCountdown(ms: number) {
  const total = Math.max(0, Math.floor(ms / 1000));
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = total % 60;
  if (h > 0) return `${h}h ${pad(m)}m`;
  if (m > 0) return `${m}m ${pad(s)}s`;
  return `${s}s`;
}

export function hijri(d: Date) {
  try {
    return new Intl.DateTimeFormat('en-u-ca-islamic-umalqura', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    }).format(d);
  } catch {
    return '';
  }
}

export function longDate(d: Date) {
  return d.toLocaleDateString('en-US', { weekday: 'long', day: 'numeric', month: 'long' });
}

export function greetingFor(now: Date) {
  const h = now.getHours();
  if (h >= 4 && h < 12) return 'Sabah al-khair';
  if (h >= 12 && h < 17) return 'Good afternoon';
  if (h >= 17 && h < 21) return 'Good evening';
  return 'Peaceful night';
}

/** Days until the next occurrence of a MM-DD birthday (0 = today). */
export function daysUntilBirthday(mmdd: string, today: Date) {
  const [m, d] = mmdd.split('-').map(Number);
  let next = new Date(today.getFullYear(), m - 1, d);
  if (daysBetween(today, next) < 0) next = new Date(today.getFullYear() + 1, m - 1, d);
  return daysBetween(today, next);
}

export function fmtBirthday(mmdd: string) {
  const [m, d] = mmdd.split('-').map(Number);
  return new Date(2000, m - 1, d).toLocaleDateString('en-US', { day: 'numeric', month: 'long' });
}
