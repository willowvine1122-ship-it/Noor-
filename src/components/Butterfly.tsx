import { useEffect, useState, type CSSProperties } from 'react';

/** Wing colours: base, glow near the body, dark edge. Real species, gently softened. */
export const SPECIES = {
  monarch: ['#f08a24', '#ffc15e', '#1d1410'],
  morpho: ['#2f7fe0', '#8fd3ff', '#0e1a3a'],
  rose: ['#f27ea3', '#ffd0df', '#5a1d33'],
  lemon: ['#f6d64a', '#fff4b8', '#5b4a12'],
  lilac: ['#a98ef0', '#e6dcff', '#2c1f52'],
} as const;
export type Species = keyof typeof SPECIES;

let n = 0;

/** One half of a butterfly, drawn as the right side; the left is the same, mirrored. */
function Half({ sp, id }: { sp: Species; id: string }) {
  const [base, glow, edge] = SPECIES[sp];
  return (
    <svg viewBox="0 0 50 60" className="bf-svg">
      <defs>
        <radialGradient id={`${id}f`} cx="0" cy="0.45" r="1">
          <stop offset="0" stopColor={glow} />
          <stop offset="0.55" stopColor={base} />
          <stop offset="0.9" stopColor={edge} />
        </radialGradient>
        <radialGradient id={`${id}h`} cx="0" cy="0.1" r="1">
          <stop offset="0" stopColor={glow} />
          <stop offset="0.6" stopColor={base} />
          <stop offset="0.95" stopColor={edge} />
        </radialGradient>
      </defs>
      {/* forewing */}
      <path d="M1 28 C 6 8, 24 -2, 44 4 C 50 6, 48 16, 42 22 C 34 30, 16 32, 1 30 Z" fill={`url(#${id}f)`} />
      {/* hindwing */}
      <path d="M1 31 C 14 32, 32 34, 36 44 C 38 52, 30 58, 22 56 C 12 54, 4 44, 1 34 Z" fill={`url(#${id}h)`} />
      {/* veins */}
      <g stroke={edge} strokeOpacity=".55" strokeWidth=".7" fill="none">
        <path d="M2 28 C 14 18, 26 10, 42 6" /><path d="M2 29 C 16 24, 30 20, 44 14" /><path d="M2 29.5 C 16 28, 30 27, 40 24" />
        <path d="M2 32 C 12 38, 22 46, 28 55" /><path d="M2 32 C 16 34, 28 38, 35 45" />
      </g>
      {/* edge spots */}
      <g fill="#fff" opacity=".85">
        <circle cx="42" cy="9" r="1.3" /><circle cx="45" cy="14" r="1" /><circle cx="38" cy="5.5" r="1" /><circle cx="40" cy="20" r=".9" />
        <circle cx="33" cy="47" r="1.1" /><circle cx="27" cy="53" r="1" /><circle cx="20" cy="54" r=".8" />
      </g>
    </svg>
  );
}

/** A butterfly that really flaps: two wings that turn in 3D around its body. */
export function Butterfly({ sp = 'monarch', size = 40, speed = 0.32, style, className = '' }: { sp?: Species; size?: number; speed?: number; style?: CSSProperties; className?: string }) {
  const [id] = useState(() => `bf${n++}`);
  return (
    <span className={`bf ${className}`} style={{ ...style, width: size, height: size * 0.6, ['--flap' as string]: `${speed}s` }} aria-hidden="true">
      <span className="bf-wing bf-l"><Half sp={sp} id={`${id}l`} /></span>
      <span className="bf-wing bf-r"><Half sp={sp} id={`${id}r`} /></span>
      <span className="bf-body" />
    </span>
  );
}

const ROAMERS: { sp: Species; size: number; dur: number; delay: number; path: number }[] = [
  { sp: 'monarch', size: 34, dur: 26, delay: 2, path: 0 },
  { sp: 'morpho', size: 30, dur: 32, delay: 12, path: 1 },
  { sp: 'rose', size: 26, dur: 29, delay: 20, path: 2 },
];

/** Butterflies drifting across the app now and then; one more flies up whenever she prays on time. */
export function FlyingButterflies() {
  const [released, setReleased] = useState<{ id: number; sp: Species }[]>([]);
  useEffect(() => {
    const on = () => {
      if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
      const id = Date.now();
      const kinds: Species[] = ['monarch', 'morpho', 'rose', 'lemon', 'lilac'];
      setReleased((r) => [...r, { id, sp: kinds[id % kinds.length] }]);
      setTimeout(() => setReleased((r) => r.filter((x) => x.id !== id)), 4200);
    };
    window.addEventListener('noor:butterfly', on);
    return () => window.removeEventListener('noor:butterfly', on);
  }, []);
  return (
    <div className="roamers" aria-hidden="true">
      {ROAMERS.map((r, i) => (
        <span key={i} className={`roam roam-${r.path}`} style={{ animationDuration: `${r.dur}s`, animationDelay: `${r.delay}s` }}>
          <Butterfly sp={r.sp} size={r.size} />
        </span>
      ))}
      {released.map((r) => (
        <span key={r.id} className="release"><Butterfly sp={r.sp} size={54} speed={0.18} /></span>
      ))}
    </div>
  );
}

/** Set a butterfly free, e.g. when a prayer is marked on time. */
export function releaseButterfly() {
  window.dispatchEvent(new Event('noor:butterfly'));
}
