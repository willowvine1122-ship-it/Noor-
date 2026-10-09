// Assistant steps and every wallpaper on a phone-sized browser.
import { chromium } from 'playwright-core';
const [,, url, out] = process.argv;
const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome' });
const ctx = await b.newContext({ viewport: { width: 440, height: 956 }, deviceScaleFactor: 2, timezoneId: 'Asia/Karachi', isMobile: true, hasTouch: true });
await ctx.route(/open-meteo|algolia|wikipedia|nasa/, (r) => r.abort());
const p = await ctx.newPage();
const errors = [];
p.on('pageerror', (e) => errors.push(e.message));
await p.clock.install({ time: new Date('2026-10-09T16:10:00+05:00') });
await p.addInitScript(() => { if (!localStorage.getItem('noor:v1')) localStorage.setItem('noor:v1', JSON.stringify({ name: 'Afza', onboarded: true, habits: [{ id: 'h1', name: 'Morning adhkar' }] })); });
await p.goto(url);
await p.waitForTimeout(700);
await p.getByRole('button', { name: 'More', exact: true }).click(); await p.locator('.room', { hasText: 'Assistant' }).click();
await p.waitForTimeout(600);
const titles = [];
await p.screenshot({ path: `${out}-01-assist.png`, fullPage: true });
titles.push(await p.locator('.now-title').textContent());
// Asr is now: mark it prayed
await p.locator('.now-actions .btn-solid').click();
await p.waitForTimeout(500);
titles.push(await p.locator('.now-title').textContent());
const cheer = await p.locator('.cheer').textContent().catch(() => null);
// Dhuhr past: made it up late
await p.locator('.now-actions .btn-solid').click();
await p.waitForTimeout(400);
titles.push(await p.locator('.now-title').textContent());
// plan the day
if (await p.locator('.now-step input').count()) {
  const ins = p.locator('.now-step input');
  await ins.nth(0).fill('Finish the Lotus proposal');
  await ins.nth(1).fill('Reply to work emails');
  await p.getByRole('button', { name: /Save my plan/ }).click();
  await p.waitForTimeout(400);
}
titles.push(await p.locator('.now-title').textContent());
await p.getByRole('button', { name: 'Remind me in 30 min' }).click();
await p.waitForTimeout(300);
titles.push(await p.locator('.now-title').textContent());
await p.screenshot({ path: `${out}-02-assist-after.png`, fullPage: true });
const queue = await p.locator('.q strong').allTextContents();

for (const w of ['Glitter', 'Dreamy space', 'Night galaxy', 'Doodles', 'Aurora']) {
  await p.getByRole('button', { name: 'Settings' }).first().click();
  await p.locator('.palette', { hasText: w }).click();
  await p.keyboard.press('Escape');
  await p.waitForTimeout(300);
  await p.locator('.tabbar').getByRole('button', { name: 'Today', exact: true }).click();
  await p.waitForTimeout(700);
  await p.screenshot({ path: `${out}-03-${w.split(' ')[0]}-today.png` });
  await p.getByRole('button', { name: 'More', exact: true }).click(); await p.locator('.room', { hasText: 'Assistant' }).click();
  await p.waitForTimeout(500);
  await p.screenshot({ path: `${out}-04-${w.split(' ')[0]}-assist.png` });
}
const s = await p.evaluate(() => JSON.parse(localStorage.getItem('noor:v1')));
const day = s.days['2026-10-09'];
console.log(JSON.stringify({ errors, titles, cheer, queue, prayers: day.prayers, tasks: day.tasks.map((t) => t.text), marks: day.marks, wallpaper: s.wallpaper, theme: await p.evaluate(() => document.documentElement.dataset.theme) }, null, 1));
await b.close();
