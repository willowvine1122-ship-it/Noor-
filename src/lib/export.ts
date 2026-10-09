import type { State } from './store';
import { addDays, PRAYER_NAMES, prayersForDay, type AsrMethod } from './time';

function icsStamp(d: Date) {
  return d.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
}

const LINES: Record<string, string> = {
  fajr: 'Your day ends with Him. Pray before you rest.',
  dhuhr: 'Wake up for Allah. Wudu, then Dhuhr.',
  asr: 'Leave what you’re doing. Asr first.',
  maghrib: 'The sun is going. Stand for Maghrib now.',
  isha: 'Isha before work. Give Him your evening.',
};

/** Calendar file with every prayer for the next `days` days, each with an alert at adhan time. */
export function prayerCalendar(asr: AsrMethod, days = 60) {
  const out = ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//Noor//Prayer times//EN', 'CALSCALE:GREGORIAN', 'X-WR-CALNAME:Salah (Noor)'];
  const start = new Date();
  start.setHours(0, 0, 0, 0);
  const stamp = icsStamp(new Date());
  for (let i = 0; i < days; i++) {
    const day = addDays(start, i);
    for (const p of prayersForDay(day, asr)) {
      if (p.start < new Date()) continue;
      const end = new Date(p.start.getTime() + 15 * 60000);
      out.push(
        'BEGIN:VEVENT',
        `UID:noor-${p.id}-${icsStamp(p.start)}@noor`,
        `DTSTAMP:${stamp}`,
        `DTSTART:${icsStamp(p.start)}`,
        `DTEND:${icsStamp(end)}`,
        `SUMMARY:🤍 ${PRAYER_NAMES[p.id].en}`,
        `DESCRIPTION:${LINES[p.id]}`,
        'BEGIN:VALARM',
        'ACTION:DISPLAY',
        `DESCRIPTION:${PRAYER_NAMES[p.id].en}: ${LINES[p.id]}`,
        'TRIGGER:PT0M',
        'END:VALARM',
        'END:VEVENT',
      );
    }
  }
  out.push('END:VCALENDAR');
  return out.join('\r\n');
}

export function download(name: string, text: string, type: string) {
  const blob = new Blob([text], { type });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = name;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 2000);
}

export function backupJson(state: State) {
  return JSON.stringify({ app: 'noor', exportedAt: new Date().toISOString(), state }, null, 2);
}

export function parseBackup(text: string): State | undefined {
  try {
    const data = JSON.parse(text);
    if (data?.app === 'noor' && data.state) return data.state as State;
  } catch {
    /* not a backup */
  }
  return undefined;
}

/** Decode a one-time setup link (#setup=<base64url json>). Personal details live only in the link, never in the code. */
export function readSetupHash(hash: string): Partial<State> | undefined {
  const m = hash.match(/^#setup=(.+)$/);
  if (!m) return undefined;
  try {
    const b64 = m[1].replace(/-/g, '+').replace(/_/g, '/');
    const json = decodeURIComponent(escape(atob(b64)));
    return JSON.parse(json);
  } catch {
    return undefined;
  }
}
