import { useEffect, useState } from 'react';

/** Ask the app to throw confetti, e.g. after a prayer is marked. */
export function celebrate() {
  window.dispatchEvent(new Event('noor:celebrate'));
}

const COLORS = ['#f7c6d9', '#e6c96b', '#cdb8f3', '#9fd3c2', '#ffd59e', '#f59fb1', '#a9c8f5'];

export function Confetti() {
  const [bursts, setBursts] = useState<number[]>([]);
  useEffect(() => {
    const on = () => {
      if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
      const id = Date.now();
      setBursts((b) => [...b, id]);
      setTimeout(() => setBursts((b) => b.filter((x) => x !== id)), 2600);
    };
    window.addEventListener('noor:celebrate', on);
    return () => window.removeEventListener('noor:celebrate', on);
  }, []);
  return (
    <>
      {bursts.map((id) => (
        <div key={id} className="confetti" aria-hidden="true">
          {Array.from({ length: 46 }, (_, i) => {
            const shape = i % 3;
            return (
              <i key={i} className={`cf cf-${shape}`} style={{
                ['--x' as string]: `${(Math.random() * 2 - 1) * 46}vw`,
                ['--y' as string]: `${-40 - Math.random() * 45}vh`,
                ['--r' as string]: `${Math.random() * 720 - 360}deg`,
                ['--d' as string]: `${Math.random() * 0.25}s`,
                background: COLORS[i % COLORS.length],
              }} />
            );
          })}
        </div>
      ))}
    </>
  );
}

/** A short opening: the crescent draws itself, the star lights, Noor fades in. Once per app launch. */
export function Splash() {
  const [show, setShow] = useState(() => {
    try { return !sessionStorage.getItem('noor:splash'); } catch { return false; }
  });
  useEffect(() => {
    if (!show) return;
    try { sessionStorage.setItem('noor:splash', '1'); } catch { /* ignore */ }
    const t = setTimeout(() => setShow(false), 2300);
    return () => clearTimeout(t);
  }, [show]);
  if (!show) return null;
  return (
    <div className="splash" aria-hidden="true" onClick={() => setShow(false)}>
      <div className="splash-rays" />
      <svg viewBox="0 0 120 120" className="splash-mark">
        <defs>
          <linearGradient id="splash-gold" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#f3d58f" />
            <stop offset="1" stopColor="#b8862f" />
          </linearGradient>
        </defs>
        <path className="splash-moon" d="M78 26a36 36 0 1 0 18 56A30 30 0 1 1 78 26Z" fill="none" stroke="url(#splash-gold)" strokeWidth="3.5" strokeLinecap="round" />
        <path className="splash-star" d="M86 40l3.4 8.6L98 52l-8.6 3.4L86 64l-3.4-8.6L74 52l8.6-3.4z" fill="url(#splash-gold)" />
      </svg>
      <h1 className="splash-word">{'Noor'.split('').map((c, i) => <span key={i} style={{ animationDelay: `${0.9 + i * 0.09}s` }}>{c}</span>)}</h1>
      <p className="splash-sub">light for your day</p>
    </div>
  );
}
