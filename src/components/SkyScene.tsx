import { addDays, sunTimes } from '../lib/time';

export type Phase = 'night' | 'dawn' | 'day' | 'golden' | 'dusk';

const SKY: Record<Phase, [string, string, string]> = {
  night: ['#0b1036', '#1d2360', '#3a3f85'],
  dawn: ['#8d86cf', '#f2b2b4', '#fde2c4'],
  day: ['#5fb0ea', '#9fd3f5', '#e3f4ff'],
  golden: ['#f19a6a', '#f9c98f', '#fff0d2'],
  dusk: ['#2f2f72', '#b56a9a', '#f6ae8e'],
};

const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const clamp = (t: number) => Math.max(0, Math.min(1, t));

export function skyPhase(now: Date): { phase: Phase; sun?: number; moon?: number } {
  const today = sunTimes(now);
  const yest = sunTimes(addDays(now, -1));
  const tom = sunTimes(addDays(now, 1));
  const n = now.getTime();
  const sun = clamp((n - today.sunrise.getTime()) / (today.sunset.getTime() - today.sunrise.getTime()));
  if (n >= today.sunrise.getTime() + 40 * 60000 && n < today.asr.getTime()) return { phase: 'day', sun };
  if (n >= today.asr.getTime() && n < today.sunset.getTime()) return { phase: 'golden', sun };
  if (n >= today.fajr.getTime() && n < today.sunrise.getTime() + 40 * 60000) return { phase: 'dawn', sun };
  if (n >= today.sunset.getTime() && n < today.isha.getTime() + 20 * 60000) return { phase: 'dusk' };
  // night runs from Isha to the next Fajr
  const [from, to] = n >= today.isha.getTime() ? [today.isha, tom.fajr] : [yest.isha, today.fajr];
  return { phase: 'night', moon: clamp((n - from.getTime()) / (to.getTime() - from.getTime())) };
}

/** An illustrated, moving Karachi sky: sun or moon on its real path, clouds, birds, the sea and the skyline. */
export function SkyScene({ now }: { now: Date }) {
  const { phase, sun, moon } = skyPhase(now);
  const [top, mid, low] = SKY[phase];
  const dark = phase === 'night' || phase === 'dusk';
  const arc = (t: number) => ({ x: lerp(30, 370, t), y: 175 - Math.sin(Math.PI * t) * 135 });
  const s = sun !== undefined ? arc(sun) : undefined;
  const m = moon !== undefined ? arc(moon) : phase === 'dusk' ? { x: 320, y: 70 } : undefined;
  const city = dark ? '#151a45' : phase === 'golden' ? '#9b6b6b' : phase === 'dawn' ? '#7d78ad' : '#6f93b5';
  const city2 = dark ? '#0f1438' : phase === 'golden' ? '#7f5560' : phase === 'dawn' ? '#615c94' : '#557ba0';
  const sea = dark ? ['#1b2160', '#0d1240'] : phase === 'golden' ? ['#f2b48a', '#d98c78'] : phase === 'dawn' ? ['#c9a6c8', '#9a8cc4'] : ['#5aa6d8', '#3f86bd'];

  return (
    <svg className={`sky sky-${phase}`} viewBox="0 0 400 260" preserveAspectRatio="xMidYMax slice" aria-hidden="true">
      <defs>
        <linearGradient id="sky-g" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={top} />
          <stop offset=".55" stopColor={mid} />
          <stop offset="1" stopColor={low} />
        </linearGradient>
        <radialGradient id="sun-g">
          <stop offset="0" stopColor="#fffbe8" />
          <stop offset=".45" stopColor={phase === 'golden' ? '#ffd27a' : '#fff1b0'} />
          <stop offset="1" stopColor="#ffd27a" stopOpacity="0" />
        </radialGradient>
        <radialGradient id="moon-g">
          <stop offset="0" stopColor="#fff" stopOpacity=".55" />
          <stop offset="1" stopColor="#fff" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="sea-g" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={sea[0]} />
          <stop offset="1" stopColor={sea[1]} />
        </linearGradient>
        <mask id="crescent">
          <rect x="-20" y="-20" width="40" height="40" fill="#fff" />
          <circle cx="7" cy="-5" r="13" fill="#000" />
        </mask>
      </defs>

      <rect width="400" height="260" fill="url(#sky-g)" />

      {(phase === 'night' || phase === 'dusk' || phase === 'dawn') && (
        <g className="stars" opacity={phase === 'night' ? 1 : 0.5}>
          {STARS.map(([x, y, r], i) => <circle key={i} cx={x} cy={y} r={r} fill="#fff" style={{ animationDelay: `${(i * 0.37) % 3}s` }} />)}
        </g>
      )}

      {s && (
        <g transform={`translate(${s.x} ${s.y})`}>
          <circle r="62" fill="url(#sun-g)" className="sun-glow" />
          <g className="sun-rays" stroke="#fff6cf" strokeWidth="2" strokeLinecap="round" opacity=".7">
            {Array.from({ length: 12 }, (_, i) => <line key={i} x1="0" y1="-26" x2="0" y2="-34" transform={`rotate(${i * 30})`} />)}
          </g>
          <circle r="18" fill="#fff6d2" />
        </g>
      )}

      {m && (
        <g transform={`translate(${m.x} ${m.y})`}>
          <circle r="46" fill="url(#moon-g)" className="moon-glow" />
          <circle r="15" fill="#fdf4d7" mask="url(#crescent)" transform="rotate(-25)" />
          <path className="twinkle-star" d="M24 -18l2 5 5 2-5 2-2 5-2-5-5-2 5-2z" fill="#fff" />
        </g>
      )}

      <g className={`clouds ${dark ? 'clouds-dark' : ''}`}>
        <path className="cloud c1" d="M20 70a14 14 0 0 1 26-6 11 11 0 0 1 19 6 9 9 0 0 1 0 18H22a9 9 0 0 1-2-18z" />
        <path className="cloud c2" d="M210 46a12 12 0 0 1 22-5 9 9 0 0 1 16 5 8 8 0 0 1 0 15h-37a8 8 0 0 1-1-15z" />
        <path className="cloud c3" d="M300 104a16 16 0 0 1 30-7 12 12 0 0 1 22 7 10 10 0 0 1 0 20h-50a10 10 0 0 1-2-20z" />
      </g>

      {(phase === 'day' || phase === 'golden' || phase === 'dawn') && (
        <g className="birds" fill="none" stroke={phase === 'day' ? '#2d4a63' : '#5b3a4a'} strokeWidth="1.6" strokeLinecap="round">
          <path className="bird" d="M0 0q4-4 8 0q4-4 8 0" />
          <path className="bird b2" d="M0 0q3-3 6 0q3-3 6 0" />
          <path className="bird b3" d="M0 0q3-3 6 0q3-3 6 0" />
        </g>
      )}

      {/* Karachi skyline: towers, a great dome, a minaret */}
      <g fill={city2}>
        <rect x="0" y="196" width="26" height="40" /><rect x="22" y="182" width="18" height="54" /><rect x="96" y="176" width="16" height="60" />
        <rect x="252" y="170" width="20" height="66" /><rect x="268" y="186" width="24" height="50" /><rect x="352" y="180" width="22" height="56" /><rect x="372" y="192" width="28" height="44" />
      </g>
      <g fill={city}>
        <rect x="38" y="190" width="22" height="46" /><rect x="58" y="166" width="14" height="70" /><path d="M58 166l7-10 7 10z" />
        <rect x="112" y="194" width="30" height="42" />
        {/* mosque */}
        <path d="M150 236v-26h80v26z" />
        <path d="M160 210a30 30 0 0 1 60 0z" />
        <path d="M188 180h4v-8h-4z" /><circle cx="190" cy="170" r="2.4" />
        <rect x="232" y="150" width="7" height="86" /><path d="M230 150h11l-5.5-14z" /><rect x="229" y="176" width="13" height="3" />
        <rect x="292" y="178" width="18" height="58" /><rect x="310" y="196" width="40" height="40" /><rect x="330" y="160" width="12" height="76" />
      </g>
      {dark && (
        <g className="windows" fill="#ffd98a">
          {WINDOWS.map(([x, y], i) => <rect key={i} x={x} y={y} width="2.4" height="3" style={{ animationDelay: `${(i * 0.71) % 5}s` }} />)}
        </g>
      )}

      {/* the Arabian Sea */}
      <rect x="0" y="234" width="400" height="26" fill="url(#sea-g)" />
      {s && <ellipse cx={s.x} cy="242" rx="26" ry="3" fill="#fff6cf" opacity=".55" className="glint" />}
      {m && <ellipse cx={m.x} cy="242" rx="16" ry="2" fill="#fdf4d7" opacity=".4" className="glint" />}
      <g className="waves" fill="none" stroke="#fff" strokeOpacity={dark ? 0.18 : 0.4} strokeWidth="1.4">
        <path className="wave w1" d="M-40 244q10-4 20 0t20 0 20 0 20 0 20 0 20 0 20 0 20 0 20 0 20 0 20 0 20 0 20 0 20 0 20 0 20 0 20 0 20 0 20 0 20 0 20 0 20 0 20 0 20 0" />
        <path className="wave w2" d="M-40 252q10-3 20 0t20 0 20 0 20 0 20 0 20 0 20 0 20 0 20 0 20 0 20 0 20 0 20 0 20 0 20 0 20 0 20 0 20 0 20 0 20 0 20 0 20 0 20 0 20 0" />
      </g>
    </svg>
  );
}

const STARS: [number, number, number][] = [
  [20, 20, 1.1], [52, 48, .8], [84, 14, 1.3], [120, 60, .7], [150, 28, 1], [182, 82, .8], [214, 18, 1.2], [246, 56, .7], [278, 30, 1], [310, 90, .8],
  [342, 22, 1.3], [374, 54, .9], [36, 104, .7], [98, 120, .9], [166, 112, .6], [262, 120, .8], [330, 130, .6], [390, 110, 1], [6, 70, .8], [200, 140, .6],
];

const WINDOWS: [number, number][] = [
  [26, 190], [32, 204], [62, 176], [66, 196], [100, 186], [104, 206], [118, 202], [132, 212], [256, 180], [262, 200], [272, 194], [284, 210],
  [296, 188], [302, 206], [334, 172], [336, 194], [316, 206], [340, 214], [356, 190], [364, 206], [378, 200], [44, 200], [48, 216], [6, 206],
];
