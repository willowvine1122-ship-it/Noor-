// Today with some things done: the garden blooms, butterflies come, the next step leads.
import { chromium } from 'playwright-core';
const [,, url, out] = process.argv;
const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome' });
const ctx = await b.newContext({ viewport: { width: 440, height: 956 }, deviceScaleFactor: 2, timezoneId: 'Asia/Karachi', isMobile: true, hasTouch: true });
await ctx.route('https://**/*', (r) => r.abort());
const p = await ctx.newPage();
const errors = [];
p.on('pageerror', (e) => errors.push(e.message));
p.on('console', (m) => m.type() === 'error' && !m.text().includes('ERR_FAILED') && errors.push(m.text()));
await p.clock.install({ time: new Date('2026-10-09T17:10:00+05:00') });
await p.addInitScript(() => {
  sessionStorage.setItem('noor:splash', '1');
  if (!localStorage.getItem('noor:v1')) localStorage.setItem('noor:v1', JSON.stringify({
    name: 'Afza', onboarded: true,
    days: { '2026-10-09': { prayers: { dhuhr: 'ontime' }, meals: [true, false, false], water: 3, quranPages: 1 } },
  }));
});
await p.goto(url);
await p.waitForTimeout(1500);
await p.screenshot({ path: `${out}-today.png` });
await p.screenshot({ path: `${out}-today-full.png`, fullPage: true });
// mark Asr on time from the next-step card
const btn = p.locator('.now-step .btn-solid').first();
console.log('next step:', await p.locator('.now-title').first().textContent());
await btn.click();
await p.waitForTimeout(900);
await p.screenshot({ path: `${out}-after.png` });
const garden = await p.locator('.garden-count').textContent();
console.log('garden:', garden, 'flies:', await p.locator('.garden .g-fly').count(), 'released:', await p.locator('.release').count());
await p.locator('.more-today').click();
await p.waitForTimeout(500);
console.log('more open, tiles:', await p.locator('.grid4 .tile').count());
for (const t of ['Deen', 'Me', 'Grow', 'More']) {
  await p.getByRole('button', { name: t, exact: true }).click();
  await p.waitForTimeout(900);
  await p.screenshot({ path: `${out}-${t}.png` });
}
await p.locator('.room', { hasText: 'Assistant' }).click();
await p.waitForTimeout(600);
await p.screenshot({ path: `${out}-assist.png` });
console.log('tabs:', await p.locator('.tabbar button').count());
console.log('errors:', JSON.stringify(errors));
await b.close();
