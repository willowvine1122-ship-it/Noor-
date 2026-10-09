// Saturday night: weekend mode, the gift, staying up late, and the Lotus garden.
import { chromium } from 'playwright-core';
const [,, url, out, when = '2026-10-10T23:30:00+05:00'] = process.argv;
const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome' });
const ctx = await b.newContext({ viewport: { width: 440, height: 956 }, deviceScaleFactor: 2, timezoneId: 'Asia/Karachi', isMobile: true, hasTouch: true });
await ctx.route('https://**/*', (r) => r.abort());
const p = await ctx.newPage();
const errors = [];
p.on('pageerror', (e) => errors.push(e.message));
p.on('console', (m) => m.type() === 'error' && !m.text().includes('ERR_FAILED') && errors.push(m.text()));
p.on('dialog', (d) => d.accept());
await p.clock.install({ time: new Date(when) });
await p.addInitScript(() => {
  sessionStorage.setItem('noor:splash', '1');
  if (!localStorage.getItem('noor:v1')) localStorage.setItem('noor:v1', JSON.stringify({
    name: 'Afza', onboarded: true,
    days: { '2026-10-10': { prayers: { dhuhr: 'ontime', asr: 'ontime', maghrib: 'ontime', isha: 'ontime' }, meals: [true, true, false], water: 5, quranPages: 1 } },
    lotus: { focus: {}, tasks: [], ideas: [], wins: [
      { id: 'a', text: 'Wrote the landing page copy', at: '2026-10-08T22:00:00+05:00' },
      { id: 'b', text: 'Fixed the login bug', at: '2026-10-09T23:00:00+05:00' },
      { id: 'c', text: 'Sketched the logo', at: '2026-10-10T16:00:00+05:00' },
    ] },
  }));
});
let lvShot = 0;
const dismiss = async () => { await p.waitForTimeout(300); if (await p.locator('.levelup').count()) { console.log('LEVEL UP:', (await p.locator('.levelup h2').textContent())); if (!lvShot++) await p.screenshot({ path: `${out}-levelup.png` }); await p.locator('.levelup').click(); await p.waitForTimeout(300); } };
await p.goto(url);
await p.waitForTimeout(1500);
await p.screenshot({ path: `${out}-1-today.png` });
console.log('weekend banner:', await p.locator('.banner-lilac').textContent());
await p.locator('.gift').click();
await dismiss();
await p.waitForTimeout(1200);
await p.screenshot({ path: `${out}-2-gift.png` });
console.log('gift:', await p.locator('.gift-text').textContent());
console.log('assistant first:', await p.locator('.now-title').first().textContent().catch(() => 'none'));
const late = p.locator('.late-card');
console.log('late card:', await late.count());
await late.getByRole('button', { name: '+2 hours' }).click();
await dismiss();
await p.waitForTimeout(500);
console.log('late title:', await late.locator('h3, .section-title, strong').first().textContent().catch(() => ''));
console.log('level:', (await p.locator('.level').textContent()).replace(/\s+/g, ' '));
await p.locator('.late-card').scrollIntoViewIfNeeded();
await p.screenshot({ path: `${out}-3-late.png` });
await p.locator('.lotus-card').click();
await dismiss();
await p.waitForTimeout(1600);
await p.screenshot({ path: `${out}-4-lotus.png` });
console.log('petals:', await p.locator('.lotus-count').textContent());
await p.getByPlaceholder('One thing for Lotus today…').fill('Ship the pricing page');
await p.getByPlaceholder('One thing for Lotus today…').press('Enter');
await dismiss();
await p.waitForTimeout(300);
await p.locator('.toggle-row').first().click();
await dismiss();
await p.waitForTimeout(400);
await p.getByPlaceholder('Add a Lotus task…').fill('Write onboarding emails');
await p.getByPlaceholder('Add a Lotus task…').press('Enter');
await dismiss();
await p.getByPlaceholder('An idea for Lotus…').fill('A referral program with flowers');
await p.getByPlaceholder('An idea for Lotus…').press('Enter');
await dismiss();
await p.waitForTimeout(1600);
console.log('petals after:', await p.locator('.lotus-count').textContent());
await p.screenshot({ path: `${out}-5-lotus-after.png`, fullPage: true });
await p.locator('.back').click();
await dismiss();
await p.locator('.room', { hasText: 'My routine' }).click();
await dismiss();
await p.waitForTimeout(700);
await p.screenshot({ path: `${out}-6-routine.png`, fullPage: true });
await p.getByRole('button', { name: 'Today', exact: true }).click();
await dismiss();
await p.waitForTimeout(700);
await p.locator('.more-today').click();
await dismiss();
await p.waitForTimeout(300);
await p.getByRole('button', { name: 'Full day' }).click();
await dismiss();
console.log('rhythm:', (await p.locator('.timeline').textContent()).replace(/(\d\d?:\d\d ?[AP]M)/g, ' | $1 '));
console.log('errors:', JSON.stringify(errors));
await b.close();
