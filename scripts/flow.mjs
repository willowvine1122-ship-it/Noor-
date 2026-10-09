import { chromium } from 'playwright-core';
const [,, url, hash, out] = process.argv;
const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome' });
const ctx = await b.newContext({ viewport: { width: 440, height: 956 }, deviceScaleFactor: 2, timezoneId: 'Asia/Karachi', isMobile: true, hasTouch: true });
const p = await ctx.newPage();
const errors = [];
p.on('pageerror', (e) => errors.push(e.message));
await p.clock.install({ time: new Date('2026-10-09T15:39:50+05:00') });
await p.goto(url + hash);
await p.clock.runFor(15000);
await p.waitForTimeout(500);
await p.screenshot({ path: `${out}-adhan.png` });
const overlay = await p.getByRole('alertdialog').count();
await p.getByRole('button', { name: 'I already prayed' }).click();
await p.waitForTimeout(300);
const asrPill = await p.getByRole('button', { name: /Asr, Prayed on time/ }).count();
// tasbih x3
await p.getByRole('button', { name: 'Deen', exact: true }).click();
for (let i = 0; i < 3; i++) await p.getByRole('button', { name: /^Count\./ }).click();
const countLabel = await p.getByRole('button', { name: /^Count\./ }).getAttribute('aria-label');
await p.getByRole('button', { name: 'I read a page' }).click();
// period start
await p.getByRole('button', { name: 'Me', exact: true }).click();
await p.getByRole('button', { name: 'My period started today' }).click();
await p.waitForTimeout(300);
await p.getByRole('button', { name: 'Deen', exact: true }).click();
await p.waitForTimeout(500);
await p.screenshot({ path: `${out}-cycle-deen.png` });
await p.getByRole('button', { name: 'Today', exact: true }).click();
await p.waitForTimeout(500);
await p.screenshot({ path: `${out}-cycle-today.png` });
// reload persists?
await p.reload();
await p.waitForTimeout(500);
const persisted = await p.evaluate(() => { const s = JSON.parse(localStorage.getItem('noor:v1')); return { quranPage: s.quranPage, periods: s.periods, day: s.days['2026-10-09'] }; });
console.log(JSON.stringify({ overlay, asrPill, countLabel, persisted, errors }, null, 1));
await b.close();
