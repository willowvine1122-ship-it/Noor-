import { useEffect, useState } from 'react';
import { useStore } from '../lib/store';
import { giftFor, levelOf, light, LEVELS } from '../lib/delight';
import { celebrate } from './Motion';
import { releaseButterfly } from './Butterfly';
import { tap } from './ui';

/** A wrapped gift on the first open of each day. Tap to open. */
export function DailyGift({ day, dayKey }: { day: Date; dayKey: string }) {
  const { state, update } = useStore();
  const opened = state.gifts?.[dayKey] !== undefined;
  const [flip, setFlip] = useState(opened);
  const g = giftFor(day);

  const open = () => {
    if (flip) return;
    tap();
    setFlip(true);
    celebrate();
    releaseButterfly();
    update((s) => { s.gifts = { ...(s.gifts ?? {}), [dayKey]: 1 }; });
  };

  return (
    <div className={`gift${flip ? ' flipped' : ''}`} onClick={open} role="button" tabIndex={0} aria-label={flip ? 'Today’s gift' : 'Open today’s gift'}>
      <div className="gift-inner">
        <div className="gift-front">
          <svg className="gift-box" viewBox="0 0 80 80" aria-hidden="true">
            <defs>
              <linearGradient id="gb" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#ffd6e5" /><stop offset="1" stopColor="#f29bbd" /></linearGradient>
              <linearGradient id="gr" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#ffe9a8" /><stop offset="1" stopColor="#e2b04a" /></linearGradient>
            </defs>
            <rect x="12" y="32" width="56" height="40" rx="6" fill="url(#gb)" />
            <rect x="8" y="24" width="64" height="14" rx="5" fill="url(#gb)" />
            <rect x="35" y="24" width="10" height="48" fill="url(#gr)" />
            <path d="M40 24c-6-12-22-12-18-3 3 5 12 3 18 3Zm0 0c6-12 22-12 18-3-3 5-12 3-18 3Z" fill="url(#gr)" />
          </svg>
          <div>
            <p className="eyebrow">A gift for today</p>
            <strong>Something sweet is waiting</strong>
            <span className="muted small">Tap to open it</span>
          </div>
          <span className="gift-shine" aria-hidden="true" />
        </div>
        <div className="gift-back">
          <p className="eyebrow">{g.kind === 'ayah' ? 'From the Quran' : g.kind === 'hadith' ? 'The Prophet ﷺ said' : 'A note from Noor'}</p>
          {g.ar && <p className="gift-ar" dir="rtl" lang="ar">{g.ar}</p>}
          <p className="gift-text">{g.kind === 'hadith' ? `“${g.text}”` : g.text}</p>
          {g.ref && <small className="muted">{g.ref}</small>}
        </div>
      </div>
    </div>
  );
}

/** Her level, from all the light she has gathered. */
export function LevelStrip() {
  const { state } = useStore();
  const l = levelOf(light(state));
  return (
    <div className="level">
      <span className={`level-seal lv-${l.i}`} aria-hidden="true">{['🌱', '🌿', '🌷', '🌸', '🏡', '✨'][l.i]}</span>
      <div className="grow">
        <div className="row between"><strong>{l.name}</strong><small className="muted">{l.light} light</small></div>
        <div className="level-bar"><span style={{ width: `${Math.round(l.pct * 100)}%` }} /></div>
        <small className="muted">{l.next ? `${l.toNext} more to become ${/^[AEIOU]/.test(l.next) ? 'an' : 'a'} ${l.next}` : 'You reached the highest level. MashaAllah.'}</small>
      </div>
    </div>
  );
}

const LV = 'noor:level';
/** Celebrates the moment she grows into the next level. */
export function LevelUp() {
  const { state } = useStore();
  const [shown, setShown] = useState<number | null>(null);
  const i = levelOf(light(state)).i;
  useEffect(() => {
    let before: number | null = null;
    try { const v = localStorage.getItem(LV); before = v === null ? null : Number(v); localStorage.setItem(LV, String(i)); } catch { /* ignore */ }
    if (before !== null && i > before) {
      setShown(i);
      celebrate();
      for (let k = 0; k < 3; k++) setTimeout(releaseButterfly, k * 400);
    }
  }, [i]);
  if (shown === null) return null;
  return (
    <div className="levelup" onClick={() => setShown(null)} role="dialog" aria-label="You grew">
      <div className="levelup-card">
        <span className="levelup-seal">{['🌱', '🌿', '🌷', '🌸', '🏡', '✨'][shown]}</span>
        <p className="eyebrow">You grew</p>
        <h2 className="display">You’re now {/^[AEIOU]/.test(LEVELS[shown].name) ? 'an' : 'a'} {LEVELS[shown].name}</h2>
        <p className="muted">Every salah, every glass of water, every Lotus win. It all added up. MashaAllah.</p>
        <button type="button" className="btn btn-solid">Alhamdulillah</button>
      </div>
    </div>
  );
}
