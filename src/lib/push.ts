// Real phone reminders. Noor sends its upcoming reminders to a tiny free server
// (Supabase); the server pushes each one to the phone at its time, even when
// Noor is closed. Only reminder text and times leave the phone: no names, no notes.
import type { State } from './store';
import { readDay, inCycle } from './store';
import { dayTimes } from './routine';
import { TASBIHAT } from './content';
import { addDays, dateKey, noorDate, prayersForDay, PRAYER_NAMES } from './time';

const URL = 'https://ckqhvmpoztyujntxwffg.supabase.co/functions/v1/noor-push';
const TOKEN = 'noor:push-token';
const ON = 'noor:push-on';

export type PushStatus = 'unsupported' | 'install' | 'denied' | 'off' | 'on';
export type Reminder = { key: string; at: string; title: string; body: string; tag?: string };

const get = (k: string) => { try { return localStorage.getItem(k); } catch { return null; } };
const set = (k: string, v: string | null) => { try { if (v === null) localStorage.removeItem(k); else localStorage.setItem(k, v); } catch { /* ignore */ } };

function token() {
  let t = get(TOKEN);
  if (!t) {
    t = Array.from(crypto.getRandomValues(new Uint8Array(24)), (b) => b.toString(16).padStart(2, '0')).join('');
    set(TOKEN, t);
  }
  return t;
}

async function call(body: Record<string, unknown>) {
  const res = await fetch(URL, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || `Server said ${res.status}`);
  return data;
}

export function pushStatus(): PushStatus {
  const standalone = matchMedia('(display-mode: standalone)').matches || (navigator as Navigator & { standalone?: boolean }).standalone;
  const ios = /iPhone|iPad|iPod/.test(navigator.userAgent);
  if (ios && !standalone) return 'install';
  if (!('serviceWorker' in navigator) || !('PushManager' in window) || !('Notification' in window)) return 'unsupported';
  if (Notification.permission === 'denied') return 'denied';
  return get(ON) === '1' && Notification.permission === 'granted' ? 'on' : 'off';
}

const fromB64u = (s: string) => Uint8Array.from(atob(s.replace(/-/g, '+').replace(/_/g, '/') + '==='.slice((s.length + 3) % 4)), (c) => c.charCodeAt(0));

/** Ask permission and connect this phone. Must run from a tap. */
export async function enablePush(state: State) {
  const perm = await Notification.requestPermission();
  if (perm !== 'granted') throw new Error('Notifications were not allowed. Turn them on for Noor in iPhone Settings, then try again.');
  const reg = await navigator.serviceWorker.ready;
  const { publicKey } = await call({ action: 'key' });
  const old = await reg.pushManager.getSubscription();
  const sub = old ?? await reg.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: fromB64u(publicKey) });
  await call({ action: 'subscribe', token: token(), subscription: sub.toJSON() });
  set(ON, '1');
  await syncReminders(state);
}

export async function testPush() {
  return call({ action: 'test', token: token() });
}

export async function disablePush() {
  try { await call({ action: 'forget', token: token() }); } catch { /* offline: the server forgets on its own */ }
  try { await (await navigator.serviceWorker.ready).pushManager.getSubscription().then((s) => s?.unsubscribe()); } catch { /* ignore */ }
  set(ON, null);
}

let last = '';
/** Send the next three days of reminders. Cheap to call often; skips when nothing changed. */
export async function syncReminders(state: State, now = new Date()) {
  if (get(ON) !== '1') return;
  const list = buildReminders(state, now);
  const sig = JSON.stringify(list);
  if (sig === last) return;
  await call({ action: 'sync', token: token(), reminders: list });
  last = sig;
}

const plus = (d: Date, m: number) => new Date(d.getTime() + m * 60000);

/** Every reminder from now until three days ahead. Things already done are left out. */
export function buildReminders(state: State, now: Date): Reminder[] {
  const out: Reminder[] = [];
  const add = (key: string, when: Date, title: string, body: string, tag?: string) => {
    if (when > now) out.push({ key, at: when.toISOString(), title, body, tag });
  };
  const today = noorDate(now, state.dayStartHour);
  for (let i = 0; i < 3; i++) {
    const day = addDays(today, i);
    const key = dateKey(day);
    const log = readDay(state, key);
    const prayers = prayersForDay(day, state.asr);
    const p = Object.fromEntries(prayers.map((x) => [x.id, x])) as Record<(typeof prayers)[number]['id'], (typeof prayers)[number]>;
    const rest = inCycle(state, key);
    const t = dayTimes(state, day);
    const wake = plus(t.wake, 5);

    if (rest) {
      add(`${key}-dhikr`, plus(p.asr.start, 5), 'A moment for dhikr', 'SubhanAllah, Alhamdulillah, Allahu Akbar. On rest days, your dhikr is your worship.', 'dhikr');
    } else {
      for (const pr of prayers) {
        if (log.prayers[pr.id]) continue;
        const name = PRAYER_NAMES[pr.id].en;
        // Dhuhr comes in while she sleeps: call her for it when she wakes instead
        const first = pr.id === 'dhuhr' && pr.start < wake ? wake : pr.start;
        add(`${key}-${pr.id}-adhan`, first, pr.id === 'dhuhr' && first === wake ? 'Good morning. Dhuhr first' : `It’s time for ${name}`, 'Allah is calling you. Leave everything for ten minutes, make wudu and go to Him.', pr.id);
        add(`${key}-${pr.id}-check`, plus(first, 25), `Did you pray ${name}?`, 'Open Noor and mark it. If not yet, get up now. There is still time.', pr.id);
        const last = pr.id === 'isha' ? plus(pr.start, 100) : plus(pr.end, -30);
        if (last > plus(pr.start, 45)) {
          add(`${key}-${pr.id}-last`, last, pr.id === 'isha' ? 'Isha is still waiting for you' : `Only 30 minutes left for ${name}`, 'Don’t let it pass. Pray now, before anything else.', pr.id);
        }
      }
    }

    if (!log.tasks.length) add(`${key}-wake`, plus(t.wake, 35), 'Choose your three things', 'Open Noor and plan today in one minute. Three is enough.', 'day');
    if (!log.meals[0]) add(`${key}-meal0`, plus(t.wake, 45), 'Time to eat something', 'Small is fine: toast, fruit, anything. Your body needs fuel.', 'meal');
    if (!rest && !log.quranPages) add(`${key}-quran`, plus(t.wake, 80), 'One page of Quran', 'Five minutes with the words of your Rabb. Open Noor and read it.', 'quran');
    const tasbih = TASBIHAT.reduce((a, t) => a + (log.tasbih[t.id] ?? 0), 0);
    if (!tasbih) add(`${key}-tasbih`, plus(t.wake, 180), 'Your tasbih', 'A few minutes of SubhanAllah, Alhamdulillah, Allahu Akbar.', 'tasbih');
    if (t.lotus && !log.marks.includes('lotus')) add(`${key}-lotus`, t.lotus.start, t.weekend ? 'Lotus deep work time' : 'Your Lotus block', 'Phone face down, one thing at a time. Open your Lotus space and begin.', 'lotus');
    if (!log.meals[1]) add(`${key}-meal1`, plus(p.isha.start, 25), 'Dinner with your family', 'Sit with them and eat, even a little.', 'meal');
    [[210, 3], [450, 5], [690, 7]].forEach(([m, need]) => {
      if (log.water < need) add(`${key}-water-${m}`, plus(t.wake, m), 'Drink a glass of water', `Aim for ${need} glasses by now. Go fill one; it takes a minute.`, 'water');
    });
    if (!log.meals[2]) add(`${key}-meal2`, plus(p.fajr.start, 20), 'Eat something warm before sleep', 'A small bowl of anything. Then rest.', 'meal');
    if (!log.marks.includes('sleep')) add(`${key}-sleep`, plus(t.sleep, -10), t.late ? 'Lotus can wait now. Time to sleep' : 'Phone down. Time to sleep', 'Tasbih on your fingers until you drift off. Tomorrow starts kinder when you rest.', 'sleep');
  }
  return out.sort((a, b) => a.at.localeCompare(b.at)).slice(0, 120);
}
