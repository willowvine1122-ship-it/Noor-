// Discover, Habits and themes with mocked feeds (the real ones are unreachable from the build machine).
import { chromium } from 'playwright-core';
import { readFileSync } from 'node:fs';
const [,, url, out] = process.argv;
const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome' });
const ctx = await b.newContext({ viewport: { width: 440, height: 956 }, deviceScaleFactor: 2, timezoneId: 'Asia/Karachi', isMobile: true, hasTouch: true });
const now = Math.floor(Date.parse('2026-10-09T08:00:00Z') / 1000);
const hit = (id, title, u, points) => ({ objectID: String(id), title, url: u, points, created_at_i: now - 3600 * (id % 30) });
let hnCalls = 0;
await ctx.route('https://hn.algolia.com/**', (r) => {
  hnCalls++;
  const q = new URL(r.request().url()).searchParams;
  if (q.get('tags') === 'front_page') return r.fulfill({ json: { hits: [
    hit(1, 'A new open-source model runs entirely on your phone', 'https://example.com/a', 640),
    hit(2, 'Ask HN: What are you working on?', '', 300),
    hit(3, 'Apple unveils a chip with a new neural engine', 'https://www.example.org/chip', 420),
    hit(4, 'Election results thread', 'https://example.com/e', 900),
  ] } });
  const n = q.get('query').length;
  return r.fulfill({ json: { hits: [
    hit(100 + n, `Astronomers spot water vapour on a distant exoplanet (${q.get('query')})`, 'https://science.example.com/' + n, 200 + n),
    hit(5, 'Researchers grow working heart tissue from stem cells', 'https://nature.example.com/heart', 510),
  ] } });
});
await ctx.route('https://en.wikipedia.org/api/rest_v1/feed/**', (r) => r.fulfill({ json: {
  news: [{ story: '<!--Oct 8--> The <a href="./Nobel">Nobel Prize in Chemistry</a> is awarded for work on molecular machines.', links: [{ content_urls: { mobile: { page: 'https://en.m.wikipedia.org/wiki/Nobel' } } }] }],
  onthisday: [{ year: 1957, text: 'Sputnik 1 transmits its last signals.', pages: [] }, { year: 1871, text: 'The Great Chicago Fire burns.', pages: [] }],
  tfa: { normalizedtitle: 'Coral reef', extract: 'Coral reefs are underwater ecosystems built by colonies of tiny animals. They cover less than 0.1% of the ocean yet support a quarter of all marine species.', content_urls: { mobile: { page: 'https://en.m.wikipedia.org/wiki/Coral_reef' } } },
} }));
await ctx.route('https://api.nasa.gov/**', (r) => r.fulfill({ json: { title: 'The Pillars of Creation', explanation: 'These towers of gas and dust are stellar nurseries. New stars are forming inside them. The image was taken by a space telescope.', media_type: 'image', url: 'https://apod.nasa.gov/apod/image/pillars.jpg' } }));
await ctx.route('https://apod.nasa.gov/**', (r) => r.fulfill({ body: readFileSync('public/icon-512.png'), contentType: 'image/png' }));
await ctx.route('https://api.open-meteo.com/**', (r) => r.abort());
const p = await ctx.newPage();
const errors = [];
p.on('pageerror', (e) => errors.push(e.message));
await p.clock.install({ time: new Date('2026-10-09T13:00:00+05:00') });
await p.addInitScript(() => { if (!localStorage.getItem('noor:v1')) localStorage.setItem('noor:v1', JSON.stringify({ name: 'Afza', onboarded: true })); });
await p.goto(url);
await p.waitForTimeout(800);
const shot = async (n) => { await p.waitForTimeout(500); await p.screenshot({ path: `${out}-${n}.png`, fullPage: true }); };
await shot('01-today');
await p.getByRole('button', { name: 'More', exact: true }).click();
await shot('02-more');
await p.locator('.room', { hasText: 'Discover' }).click();
await p.waitForTimeout(800);
await p.locator('.icon-btn.bookmark').first().click();
await shot('03-discover');
const titles = await p.locator('.story strong').allTextContents();
await p.getByRole('button', { name: 'More', exact: true }).last().click();
await p.locator('.room', { hasText: 'Habits' }).click();
await p.locator('.chip', { hasText: 'Morning adhkar' }).click();
await p.locator('.chip', { hasText: 'Walk 10 minutes' }).click();
await p.locator('.habit-dot.today').first().click();
await p.locator('.habit').first().locator('.habit-dot').nth(5).click();
await shot('04-habits');
const streakText = await p.locator('.habit').first().textContent();
await p.getByRole('button', { name: 'Settings' }).first().click();
for (const name of ['Rose garden', 'Lavender', 'Morning sky']) {
  await p.locator('.palette', { hasText: name }).click();
  await p.waitForTimeout(300);
  await p.screenshot({ path: `${out}-05-settings-${name.split(' ')[0]}.png` });
}
await p.keyboard.press('Escape');
await p.getByRole('button', { name: 'Today', exact: true }).click();
await shot('06-today-sky');
const s = await p.evaluate(() => JSON.parse(localStorage.getItem('noor:v1')));
console.log(JSON.stringify({ errors, hnCalls, titles, streakText, palette: s.palette, saved: s.savedStories, habits: s.habits }, null, 1));
await b.close();
