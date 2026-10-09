// Prints the phone reminders Noor would schedule, to check times and wording.
import { createServer } from 'vite';
const vite = await createServer({ server: { middlewareMode: true }, appType: 'custom', logLevel: 'error' });
globalThis.localStorage = { getItem: () => null, setItem() {}, removeItem() {} };
const { buildReminders } = await vite.ssrLoadModule('/src/lib/push.ts');
const { defaultState } = await vite.ssrLoadModule('/src/lib/store.tsx');
const s = defaultState();
s.days['2026-10-09'] = { ...(s.days['2026-10-09'] ?? {}), prayers: { dhuhr: 'ontime' }, meals: [true, false, false], tasks: [], habits: [], marks: [], tasbih: {}, water: 1, quranPages: 0, familyTime: [], acts: [] };
const list = buildReminders(s, new Date(process.argv[2] ?? '2026-10-09T17:10:00+05:00'));
console.log(list.length, 'reminders');
for (const r of list.slice(0, Number(process.env.N ?? 22))) console.log(new Date(r.at).toLocaleString('en-GB', { timeZone: 'Asia/Karachi', weekday: 'short', hour: '2-digit', minute: '2-digit' }), '|', r.title);
await vite.close();
