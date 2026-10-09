// Screenshots of the living sky at different times, the opening splash, section banners and confetti.
import { chromium } from 'playwright-core';
const [,, url, out] = process.argv;
const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome' });
const errors = [];
const page = async (time) => {
  const ctx = await b.newContext({ viewport: { width: 440, height: 956 }, deviceScaleFactor: 2, timezoneId: 'Asia/Karachi', isMobile: true, hasTouch: true });
  await ctx.route('https://**/*', (r) => new URL(r.request().url()).hostname === 'localhost' ? r.continue() : r.abort());
  const p = await ctx.newPage();
  p.on('pageerror', (e) => errors.push(e.message));
  await p.clock.install({ time: new Date(time) });
  await p.addInitScript(() => {
    if (!localStorage.getItem('noor:v1')) localStorage.setItem('noor:v1', JSON.stringify({ name: 'Afza', onboarded: true }));
  });
  return p;
};
// splash
let p = await page('2026-10-09T13:00:00+05:00');
await p.goto(url);
await p.waitForTimeout(1300);
await p.screenshot({ path: `${out}-splash.png` });
await p.waitForTimeout(1600);
await p.screenshot({ path: `${out}-day.png` });
for (const tab of ['Deen', 'Me', 'Grow']) {
  await p.getByRole('button', { name: tab, exact: true }).click();
  await p.waitForTimeout(1500);
  await p.screenshot({ path: `${out}-${tab}.png` });
}
await p.getByRole('button', { name: 'Today', exact: true }).click();
await p.waitForTimeout(400);
await p.evaluate(() => window.dispatchEvent(new Event('noor:celebrate')));
await p.waitForTimeout(700);
await p.screenshot({ path: `${out}-confetti.png` });
await p.context().close();
for (const [n, t] of [['dawn', '2026-10-09T06:00:00+05:00'], ['golden', '2026-10-09T17:00:00+05:00'], ['dusk', '2026-10-09T18:30:00+05:00'], ['night', '2026-10-09T23:00:00+05:00']]) {
  p = await page(t);
  await p.addInitScript(() => sessionStorage.setItem('noor:splash', '1'));
  await p.goto(url);
  await p.waitForTimeout(1200);
  await p.screenshot({ path: `${out}-${n}.png`, clip: { x: 0, y: 0, width: 440, height: 520 } });
  await p.context().close();
}
console.log('errors:', JSON.stringify(errors));
await b.close();
