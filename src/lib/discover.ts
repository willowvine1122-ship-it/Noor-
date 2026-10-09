import { useEffect, useState } from 'react';

// Free, keyless sources that allow browser requests. Fetched at most every few hours and kept for offline.
export type Story = { id: string; title: string; url: string; source: string; points?: number; at?: number };
export type Discover = {
  at: number;
  space?: { title: string; text: string; image?: string; url: string };
  science: Story[];
  tech: Story[];
  world: Story[];
  onThisDay: { year: number; text: string; url?: string }[];
  fact?: { title: string; text: string; url: string };
};

const KEY = 'noor:discover';
const FRESH_MS = 3 * 60 * 60 * 1000;

const SCIENCE_WORDS = ['scientists', 'researchers discover', 'breakthrough', 'NASA', 'physicists', 'astronomers', 'new species', 'study finds', 'vaccine', 'fusion'];
// Keep the feed about knowledge, not politics or drama.
const SKIP = /\b(trump|election|war|shooting|killed|lawsuit|layoffs?|crypto|ask hn|show hn|hiring|who is hiring)\b/i;

const host = (u: string) => { try { return new URL(u).hostname.replace(/^www\./, ''); } catch { return 'news.ycombinator.com'; } };
const strip = (html: string) => html.replace(/<[^>]+>/g, '').replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&').replace(/&#39;/g, '’').replace(/&quot;/g, '"').trim();

type Hit = { objectID: string; title: string; url?: string; points: number; created_at_i: number };
async function hn(params: string): Promise<Story[]> {
  const r = await fetch(`https://hn.algolia.com/api/v1/search?${params}`);
  if (!r.ok) throw new Error('hn');
  const j: { hits: Hit[] } = await r.json();
  return j.hits
    .filter((h) => h.title && !SKIP.test(h.title))
    .map((h) => ({ id: h.objectID, title: h.title, url: h.url || `https://news.ycombinator.com/item?id=${h.objectID}`, source: host(h.url || ''), points: h.points, at: h.created_at_i * 1000 }));
}

async function load(): Promise<Discover> {
  const now = new Date();
  const week = Math.floor(now.getTime() / 1000) - 7 * 86400;
  const y = now.getUTCFullYear();
  const m = String(now.getUTCMonth() + 1).padStart(2, '0');
  const d = String(now.getUTCDate()).padStart(2, '0');

  const [wiki, space, tech, ...sci] = await Promise.allSettled([
    fetch(`https://en.wikipedia.org/api/rest_v1/feed/featured/${y}/${m}/${d}`).then((r) => r.json()),
    fetch('https://api.nasa.gov/planetary/apod?api_key=DEMO_KEY&thumbs=true').then((r) => r.json()),
    hn('tags=front_page&hitsPerPage=40'),
    ...SCIENCE_WORDS.map((q) => hn(`query=${encodeURIComponent(q)}&tags=story&numericFilters=created_at_i>${week},points>60&hitsPerPage=8`)),
  ]);

  const out: Discover = { at: Date.now(), science: [], tech: [], world: [], onThisDay: [] };

  const seen = new Set<string>();
  const sciHits = sci.flatMap((s) => (s.status === 'fulfilled' ? s.value : []))
    .filter((s) => (seen.has(s.id) ? false : (seen.add(s.id), true)))
    .sort((a, b) => (b.points ?? 0) - (a.points ?? 0));
  out.science = sciHits.slice(0, 8);

  if (tech.status === 'fulfilled') {
    out.tech = tech.value.filter((s) => !seen.has(s.id) && (s.points ?? 0) >= 120).sort((a, b) => (b.points ?? 0) - (a.points ?? 0)).slice(0, 8);
  }

  if (wiki.status === 'fulfilled' && wiki.value) {
    const w = wiki.value;
    out.world = (w.news ?? []).slice(0, 5).map((n: { story: string; links?: { content_urls?: { mobile?: { page?: string } } }[] }, i: number) => ({
      id: `w${i}`, title: strip(n.story), url: n.links?.[0]?.content_urls?.mobile?.page ?? 'https://en.m.wikipedia.org/wiki/Portal:Current_events', source: 'Wikipedia · In the news',
    }));
    out.onThisDay = (w.onthisday ?? [])
      .filter((e: { text: string }) => !SKIP.test(e.text))
      .slice(0, 4)
      .map((e: { year: number; text: string; pages?: { content_urls?: { mobile?: { page?: string } } }[] }) => ({ year: e.year, text: e.text, url: e.pages?.[0]?.content_urls?.mobile?.page }));
    if (w.tfa) out.fact = { title: strip(w.tfa.normalizedtitle ?? w.tfa.title ?? ''), text: w.tfa.extract ?? '', url: w.tfa.content_urls?.mobile?.page ?? '' };
  }

  if (space.status === 'fulfilled' && space.value?.title) {
    const s = space.value;
    out.space = { title: s.title, text: s.explanation, image: s.media_type === 'image' ? s.url : s.thumbnail_url, url: `https://apod.nasa.gov/apod/astropix.html` };
  }

  if (!out.science.length && !out.tech.length && !out.world.length && !out.space) throw new Error('offline');
  try { localStorage.setItem(KEY, JSON.stringify(out)); } catch { /* ignore */ }
  return out;
}

function cached(): Discover | undefined {
  try { return JSON.parse(localStorage.getItem(KEY) ?? 'null') ?? undefined; } catch { return undefined; }
}

export function useDiscover() {
  const [data, setData] = useState<Discover | undefined>(cached);
  const [state, setState] = useState<'idle' | 'loading' | 'offline'>('idle');
  const refresh = (force = false) => {
    const c = cached();
    if (!force && c && Date.now() - c.at < FRESH_MS) return;
    setState('loading');
    load().then((d) => { setData(d); setState('idle'); }).catch(() => setState('offline'));
  };
  useEffect(() => {
    refresh();
    const onVis = () => !document.hidden && refresh();
    document.addEventListener('visibilitychange', onVis);
    return () => document.removeEventListener('visibilitychange', onVis);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return { data, state, refresh: () => refresh(true) };
}
