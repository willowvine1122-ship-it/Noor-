// Walks every room of Noor on a phone-sized browser with a fake Karachi forecast.
import { chromium } from 'playwright-core';
const [,, url, out, time = '2026-10-11T15:00:00+05:00'] = process.argv;
const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome' });
const ctx = await b.newContext({ viewport: { width: 440, height: 956 }, deviceScaleFactor: 2, timezoneId: 'Asia/Karachi', isMobile: true, hasTouch: true });
await ctx.route('https://api.open-meteo.com/**', (r) => r.fulfill({ json: {
  current: { temperature_2m: 31.4, apparent_temperature: 35.2, relative_humidity_2m: 68, weather_code: 1, is_day: 1 },
  daily: { time: ['2026-10-11', '2026-10-12', '2026-10-13', '2026-10-14'], temperature_2m_max: [34, 33, 32, 35], temperature_2m_min: [26, 25, 25, 27], weather_code: [1, 3, 61, 0] },
} }));
const p = await ctx.newPage();
const errors = [];
p.on('pageerror', (e) => errors.push(e.message));
p.on('console', (m) => m.type() === 'error' && errors.push(m.text()));
await p.clock.install({ time: new Date(time) });
await p.addInitScript(() => {
  if (!localStorage.getItem('noor:v1')) localStorage.setItem('noor:v1', JSON.stringify({ name: 'Afza', onboarded: true }));
});
await p.goto(url);
await p.waitForTimeout(900);
const shot = async (n) => { await p.waitForTimeout(500); await p.screenshot({ path: `${out}-${n}.png`, fullPage: true }); };
await shot('01-today');
await p.getByRole('button', { name: 'More', exact: true }).click();
await shot('02-more');

const room = async (name) => { await p.getByRole('button', { name: 'More', exact: true }).last().click(); await p.locator('.room', { hasText: name }).click(); };

// Money
await room('Money');
await p.getByRole('button', { name: 'Set budgets' }).click();
await p.locator('.budget-edit', { hasText: 'Food' }).locator('input').fill('15000');
await p.locator('.budget-edit', { hasText: 'Bills' }).locator('input').fill('8000');
await p.getByRole('button', { name: 'Done' }).last().click();
await p.getByRole('button', { name: 'Received' }).click();
await p.locator('.amount-input input').fill('90000');
await p.getByRole('button', { name: /^Save/ }).click();
await p.getByRole('button', { name: 'Spent' }).click();
await p.locator('.amount-input input').fill('2350');
await p.getByPlaceholder('What was it? (optional)').fill('Groceries for the week');
await p.getByRole('button', { name: /^Save/ }).click();
await shot('03-money');

// Diary
await room('Diary');
await p.getByRole('button', { name: /Write today/ }).click();
await p.locator('.diary-input').fill('Today I finally felt a little organised. Prayed Dhuhr on time and ate a proper meal.');
await p.locator('.sheet .mood-4').click();
await p.getByRole('button', { name: 'Save page' }).click();
await shot('04-diary');

// English
await room('English');
await p.getByRole('button', { name: 'I said it out loud' }).click();
await p.getByRole('button', { name: 'I used it today' }).click();
await shot('05-english');

await room('Duas');
await p.locator('.icon-btn.heart').first().click();
await shot('06-duas');

await room('Lists');
await p.locator('.chip', { hasText: 'Groceries' }).click();
await p.getByPlaceholder('Add an item').fill('Milk');
await p.getByPlaceholder('Add an item').press('Enter');
await p.getByPlaceholder('Add an item').fill('Eggs');
await p.getByPlaceholder('Add an item').press('Enter');
await p.locator('.tasks .check').first().click();
await shot('07-lists');

await room('Focus');
await p.getByRole('button', { name: /Begin/ }).click();
await p.clock.runFor(60_000 * 3);
await shot('08-focus-running');
await p.clock.runFor(60_000 * 23);
await p.waitForTimeout(600);
const logged = await p.locator('.soft-list li').count();
await shot('09-focus-done');

await room('My week');
await shot('10-week');
await room('People');
await shot('11-people');
await room('Play');
await shot('12-play');

// Today after everything, then PIN
await p.getByRole('button', { name: 'Today', exact: true }).click();
await shot('13-today-after');
await p.getByRole('button', { name: 'Settings' }).click();
await p.getByRole('button', { name: /Set a PIN/ }).click();
const pin = async (digits) => { for (const d of digits) await p.locator('.keypad button', { hasText: new RegExp(`^${d}$`) }).click(); await p.waitForTimeout(300); };
await pin('1234');
await pin('1234');
await p.waitForTimeout(400);
const pinMsg = await p.locator('.sheet').getByText('PIN is on').count();
// opening Noor fresh asks for the PIN
await p.reload();
await p.waitForTimeout(700);
await shot('14-locked');
const lockedBefore = await p.locator('.lock').count();
await pin('9999');
await p.waitForTimeout(700);
const stillLocked = await p.locator('.lock').count();
await pin('1234');
await p.waitForTimeout(500);
const lockedAfter = await p.locator('.lock').count();
const s = await p.evaluate(() => JSON.parse(localStorage.getItem('noor:v1')));
console.log(JSON.stringify({ errors, logged, pinMsg, lockedBefore, stillLocked, lockedAfter,
  tx: s.money.tx.length, budgets: s.money.budgets, journal: s.journal.length, english: s.english.days, lists: s.lists.map((l) => l.items), focus: s.focus, savedDuas: s.savedDuas, pinSet: !!s.pin }, null, 1));
await b.close();
