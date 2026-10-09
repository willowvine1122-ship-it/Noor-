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

/** Illustrated, gently moving banners for the main sections. */
export function SectionArt({ kind, progress = 0 }: { kind: 'deen' | 'me' | 'grow'; progress?: number }) {
  if (kind === 'deen') {
    return (
      <div className="art art-deen" aria-hidden="true">
        <svg viewBox="0 0 400 150" preserveAspectRatio="xMidYMid slice">
          <defs>
            <linearGradient id="deen-sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#1c2160" /><stop offset="1" stopColor="#5b4f9a" /></linearGradient>
            <radialGradient id="lamp"><stop offset="0" stopColor="#ffe6a3" stopOpacity=".95" /><stop offset="1" stopColor="#ffb547" stopOpacity="0" /></radialGradient>
          </defs>
          <rect width="400" height="150" fill="url(#deen-sky)" />
          {[[30, 20], [90, 50], [150, 16], [330, 30], [370, 70], [250, 22], [60, 100], [300, 110]].map(([x, y], i) => <circle key={i} className="tw" cx={x} cy={y} r="1.2" fill="#fff" style={{ animationDelay: `${i * 0.4}s` }} />)}
          {/* arches */}
          <path d="M120 150V86a40 40 0 0 1 80 0v64z M210 150V86a40 40 0 0 1 80 0v64z" fill="#2a2b6e" opacity=".55" />
          <path d="M0 150V120h400v30z" fill="#16194a" />
          {[{ x: 92, len: 40, d: 0 }, { x: 200, len: 58, d: .6 }, { x: 318, len: 34, d: 1.2 }].map((l, i) => (
            <g key={i} className="lantern" style={{ transformOrigin: `${l.x}px 0px`, animationDelay: `${l.d}s` }}>
              <line x1={l.x} y1="0" x2={l.x} y2={l.len} stroke="#c9a65a" strokeWidth="1.2" />
              <circle cx={l.x} cy={l.len + 20} r="34" fill="url(#lamp)" className="lamp-glow" />
              <path d={`M${l.x - 9} ${l.len + 6}h18l4 8v16l-4 8h-18l-4-8v-16z`} fill="#e9b65a" stroke="#a8792b" strokeWidth="1" />
              <path d={`M${l.x - 5} ${l.len + 12}h10v14h-10z`} fill="#fff1c4" />
              <path d={`M${l.x - 6} ${l.len + 6}l6-7 6 7z`} fill="#c9963f" />
            </g>
          ))}
          <path d="M360 34a14 14 0 1 0 9 22 11 11 0 1 1-9-22z" fill="#fdf0c8" />
        </svg>
      </div>
    );
  }
  if (kind === 'me') {
    return (
      <div className="art art-me" aria-hidden="true">
        <svg viewBox="0 0 400 150" preserveAspectRatio="xMidYMid slice">
          <defs>
            <linearGradient id="me-sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#fde1e6" /><stop offset="1" stopColor="#fff4ec" /></linearGradient>
          </defs>
          <rect width="400" height="150" fill="url(#me-sky)" />
          <circle cx="330" cy="40" r="22" fill="#fff6d8" className="soft-pulse" />
          <path d="M0 128q60-18 120-4t140-6 140 8v24H0z" fill="#cfe6d6" />
          <path d="M0 140q80-12 160 0t240-4v14H0z" fill="#b6d8c2" />
          {[{ x: 60, h: 46, c: '#f2a7b8', d: 0 }, { x: 140, h: 62, c: '#c9b4f2', d: .3 }, { x: 212, h: 50, c: '#f7c98b', d: .6 }, { x: 290, h: 70, c: '#f5a3a8', d: .9 }, { x: 360, h: 42, c: '#a9cdf2', d: 1.2 }].map((f, i) => (
            <g key={i} className="flower" style={{ transformOrigin: `${f.x}px 150px`, animationDelay: `${f.d}s` }}>
              <path d={`M${f.x} 150q-3 -${f.h / 2} 0 -${f.h}`} stroke="#7fae8e" strokeWidth="2" fill="none" />
              <path d={`M${f.x} ${150 - f.h / 2}q10-8 14 0q-8 6-14 0z`} fill="#8dbd9b" />
              <g className="bloom" style={{ transformOrigin: `${f.x}px ${150 - f.h}px`, animationDelay: `${f.d + .2}s` }}>
                {[0, 72, 144, 216, 288].map((r) => <ellipse key={r} cx={f.x} cy={150 - f.h - 7} rx="5" ry="8" fill={f.c} transform={`rotate(${r} ${f.x} ${150 - f.h})`} />)}
                <circle cx={f.x} cy={150 - f.h} r="4" fill="#fff3c4" />
              </g>
            </g>
          ))}
          <g className="butterfly">
            <path d="M0 0q-8-10-12-2t12 2q-6 8 0 10t0-10zM0 0q8-10 12-2t-12 2q6 8 0 10t0-10z" fill="#c9b4f2" opacity=".9" />
          </g>
        </svg>
      </div>
    );
  }
  const leaves = Math.max(3, Math.min(8, 2 + Math.round(progress * 6)));
  return (
    <div className="art art-grow" aria-hidden="true">
      <svg viewBox="0 0 400 150" preserveAspectRatio="xMidYMid slice">
        <defs>
          <linearGradient id="grow-sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#dff1fb" /><stop offset="1" stopColor="#f3fbf3" /></linearGradient>
        </defs>
        <rect width="400" height="150" fill="url(#grow-sky)" />
        <g className="sun-rays-slow" style={{ transformOrigin: '70px 40px' }}>
          {Array.from({ length: 10 }, (_, i) => <line key={i} x1="70" y1="12" x2="70" y2="20" stroke="#f5c76a" strokeWidth="2" strokeLinecap="round" transform={`rotate(${i * 36} 70 40)`} />)}
        </g>
        <circle cx="70" cy="40" r="13" fill="#ffd86e" />
        <path className="cloud-drift" d="M250 40a10 10 0 0 1 19-4 8 8 0 0 1 14 4 7 7 0 0 1 0 13h-32a7 7 0 0 1-1-13z" fill="#fff" />
        <path d="M0 130q100-30 200-6t200-10v36H0z" fill="#bfe0c3" />
        <path d="M0 142q120-14 220 0t180-6v14H0z" fill="#a3d1ab" />
        <path d="M180 140h40l-6 10h-28z" fill="#d79a74" />
        <path className="stem" d={`M200 140q-4 -${30 + leaves * 6} 2 -${50 + leaves * 8}`} stroke="#5e9c6c" strokeWidth="3" fill="none" strokeLinecap="round" />
        {Array.from({ length: leaves }, (_, i) => {
          const y = 132 - i * 10;
          const left = i % 2 === 0;
          return <path key={i} className="leaf" style={{ animationDelay: `${0.3 + i * 0.12}s`, transformOrigin: `200px ${y}px` }} d={left ? `M200 ${y}q-18-10-26 2q14 8 26-2z` : `M200 ${y}q18-10 26 2q-14 8-26-2z`} fill={i % 3 === 0 ? '#7fbf8e' : '#8fcf9c'} />;
        })}
        <circle cx={202} cy={90 - leaves * 8} r="5" fill="#f6a5b5" className="bud" />
      </svg>
    </div>
  );
}
