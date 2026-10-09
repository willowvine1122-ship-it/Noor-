import { chromium } from 'playwright-core';
const [,, url, hash, out, time] = process.argv;
const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome' });
const ctx = await b.newContext({ viewport: { width: 440, height: 956 }, deviceScaleFactor: 2, timezoneId: 'Asia/Karachi', isMobile: true, hasTouch: true });
const p = await ctx.newPage();
const errors = [];
p.on('pageerror', (e) => errors.push(e.message));
p.on('console', (m) => m.type() === 'error' && errors.push(m.text()));
if (time) await p.clock.install({ time: new Date(time) });
await p.goto(url + hash);
await p.waitForTimeout(800);
await p.screenshot({ path: `${out}-0-welcome-or-today.png` });
const tabs = ['Today', 'Deen', 'Me', 'Grow', 'People'];
for (const [i, t] of tabs.entries()) {
  await p.getByRole('button', { name: t, exact: true }).click();
  await p.waitForTimeout(700);
  await p.screenshot({ path: `${out}-${i + 1}-${t}.png`, fullPage: true });
}
console.log('errors:', JSON.stringify(errors));
await b.close();
