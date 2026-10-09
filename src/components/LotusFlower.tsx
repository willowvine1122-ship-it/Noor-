// A lotus on still water. Each Lotus win this week opens one more petal.
const LAYERS = [
  { n: 7, spread: 78, len: 92, w: 30, tone: 'back' },
  { n: 5, spread: 48, len: 104, w: 30, tone: 'mid' },
  { n: 3, spread: 18, len: 96, w: 28, tone: 'front' },
] as const;
export const PETALS = LAYERS.reduce((a, l) => a + l.n, 0);

const petal = (L: number, w: number) => `M0 0 C ${w} ${-L * 0.3} ${w * 0.7} ${-L * 0.78} 0 ${-L} C ${-w * 0.7} ${-L * 0.78} ${-w} ${-L * 0.3} 0 0Z`;

export function LotusFlower({ open, size = 300 }: { open: number; size?: number }) {
  // open petals from the outside in, in pairs, the way a real lotus does
  const rank = new Map<string, number>();
  let r = 0;
  LAYERS.forEach((l, li) => {
    const ks = Array.from({ length: l.n }, (_, k) => k).sort((a, b) => Math.abs(b - (l.n - 1) / 2) - Math.abs(a - (l.n - 1) / 2) || a - b);
    ks.forEach((k) => rank.set(`${li}-${k}`, r++));
  });
  return (
    <svg className="lotus-svg" width={size} height={size * 0.787} viewBox="-150 -150 300 236" aria-hidden="true">
      <defs>
        <radialGradient id="lt-glow" cx="0" cy="-40" r="150" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#ffe3ef" stopOpacity=".95" />
          <stop offset=".55" stopColor="#ffd9c7" stopOpacity=".35" />
          <stop offset="1" stopColor="#fff" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="lt-open" x1="0" y1="0" x2="0" y2="-1" gradientUnits="objectBoundingBox">
          <stop offset="0" stopColor="#fff6f9" />
          <stop offset=".55" stopColor="#f9b9d0" />
          <stop offset="1" stopColor="#e9779f" />
        </linearGradient>
        <linearGradient id="lt-bud" x1="0" y1="0" x2="0" y2="-1" gradientUnits="objectBoundingBox">
          <stop offset="0" stopColor="#f3f6ee" />
          <stop offset="1" stopColor="#dfe9d6" />
        </linearGradient>
        <linearGradient id="lt-water" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#d9eef0" />
          <stop offset="1" stopColor="#bfdfe3" stopOpacity="0" />
        </linearGradient>
        <radialGradient id="lt-heart" cx=".5" cy=".4" r=".6">
          <stop offset="0" stopColor="#fff3b0" />
          <stop offset="1" stopColor="#e7b84a" />
        </radialGradient>
      </defs>
      <circle cx="0" cy="-40" r="150" fill="url(#lt-glow)" className="lt-glow" />
      <ellipse cx="0" cy="40" rx="158" ry="40" fill="url(#lt-water)" />
      <g className="lt-ripples">
        {[0, 1, 2].map((k) => <ellipse key={k} cx="0" cy="34" rx="60" ry="12" style={{ animationDelay: `${k * 1.6}s` }} />)}
      </g>
      <g className="lt-pads">
        <path d="M-150 44 a44 13 0 1 0 88 0 a44 13 0 1 0 -88 0 M-106 44 l40 -9" />
        <path d="M70 52 a36 10 0 1 0 72 0 a36 10 0 1 0 -72 0 M106 52 l-34 -7" />
      </g>
      <g className="lt-flower" transform="translate(0 30)">
        {LAYERS.map((l, li) => (
          <g key={l.tone} className={`lt-layer lt-${l.tone}`}>
            {Array.from({ length: l.n }, (_, k) => {
              const angle = -l.spread + (2 * l.spread * k) / (l.n - 1);
              const on = rank.get(`${li}-${k}`)! < open;
              return (
                <g key={k} className={`lt-petal${on ? ' on' : ''}`} style={{ ['--a' as string]: `${angle}deg`, transitionDelay: `${k * 60}ms` }}>
                  <path d={petal(l.len, l.w)} fill={on ? 'url(#lt-open)' : 'url(#lt-bud)'} />
                  <path d={`M0 -6 L0 ${-l.len * 0.82}`} className="lt-vein" />
                </g>
              );
            })}
          </g>
        ))}
        <ellipse cx="0" cy="-14" rx="18" ry="9" fill="url(#lt-heart)" className="lt-heart" />
      </g>
      <g className="lt-motes">
        {Array.from({ length: 9 }, (_, k) => <circle key={k} cx={-110 + k * 27} cy={10} r={k % 3 ? 1.8 : 2.6} style={{ animationDelay: `${(k * 0.9) % 6}s`, animationDuration: `${6 + (k % 4)}s` }} />)}
      </g>
    </svg>
  );
}
