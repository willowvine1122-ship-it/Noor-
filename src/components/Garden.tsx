import { Butterfly, type Species } from './Butterfly';

const PETALS = ['#f6a5b9', '#c9b4f2', '#ffcf86', '#f59ea8', '#a9cdf2', '#ffd6e4', '#b9e3c6', '#f7b267'];
const KINDS: Species[] = ['monarch', 'morpho', 'rose', 'lemon', 'lilac'];

/**
 * Today's garden: every thing she finishes blooms into a flower,
 * every prayer on time brings a butterfly. Unfinished things wait as buds.
 */
export function Garden({ done, total, butterflies, streak, onOpen }: { done: number; total: number; butterflies: number; streak: number; onOpen?: () => void }) {
  const slots = Math.max(6, Math.min(16, total));
  const bloomed = Math.min(done, slots);
  const pct = total ? done / total : 0;
  const line = pct >= 1 ? 'Your garden is in full bloom. Alhamdulillah.' : done === 0 ? 'Finish one thing and watch your first flower open.' : `${total - done} more to go. Each one opens a flower.`;
  return (
    <button type="button" className="garden" onClick={onOpen}>
      <div className="garden-scene">
        <svg viewBox="0 0 400 170" preserveAspectRatio="xMidYMax slice" aria-hidden="true">
          <defs>
            <linearGradient id="g-sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#fdeef3" /><stop offset="1" stopColor="#f2f8ee" /></linearGradient>
            <radialGradient id="g-sun"><stop offset="0" stopColor="#fff6cf" /><stop offset="1" stopColor="#fff6cf" stopOpacity="0" /></radialGradient>
          </defs>
          <rect width="400" height="170" fill="url(#g-sky)" />
          <circle cx="340" cy="34" r="60" fill="url(#g-sun)" className="soft-pulse" />
          <circle cx="340" cy="34" r="16" fill="#ffe9a6" />
          <path d="M0 120 Q 90 92 190 112 T 400 104 V170 H0Z" fill="#cfe7cf" />
          <path d="M0 140 Q 120 120 230 138 T 400 132 V170 H0Z" fill="#b5d9b8" />
          {Array.from({ length: slots }, (_, i) => {
            const x = 22 + (i * 356) / (slots - 1);
            const h = 34 + ((i * 37) % 26);
            const base = 160 - ((i * 13) % 12);
            const open = i < bloomed;
            const c = PETALS[i % PETALS.length];
            return (
              <g key={i} className={`g-plant ${open ? 'open' : 'bud'}`} style={{ transformOrigin: `${x}px ${base}px`, animationDelay: `${(i % 5) * 0.4}s` }}>
                <path d={`M${x} ${base} q ${i % 2 ? -4 : 4} ${-h / 2} 0 ${-h}`} stroke="#6fa77d" strokeWidth="2.2" fill="none" />
                <path d={`M${x} ${base - h / 2.4} q ${i % 2 ? 11 : -11} -7 ${i % 2 ? 15 : -15} 1 q -8 5 ${i % 2 ? -15 : 15} -1z`} fill="#86c095" />
                {open ? (
                  <g className="g-bloom" style={{ transformOrigin: `${x}px ${base - h}px`, animationDelay: `${0.15 + i * 0.08}s` }}>
                    {[0, 60, 120, 180, 240, 300].map((r) => <ellipse key={r} cx={x} cy={base - h - 8} rx="5.5" ry="9" fill={c} transform={`rotate(${r} ${x} ${base - h})`} />)}
                    <circle cx={x} cy={base - h} r="4.5" fill="#ffe08a" />
                  </g>
                ) : (
                  <ellipse cx={x} cy={base - h - 3} rx="3.5" ry="6" fill="#9cc9a6" />
                )}
              </g>
            );
          })}
        </svg>
        {Array.from({ length: Math.min(5, butterflies) }, (_, i) => (
          <span key={i} className={`g-fly g-fly-${i}`}><Butterfly sp={KINDS[i]} size={30} /></span>
        ))}
      </div>
      <div className="garden-info">
        <div>
          <p className="eyebrow">Your garden today</p>
          <h3 className="garden-count">{done}<small> of {total} done</small></h3>
          <p className="muted small">{line}</p>
        </div>
        <div className="garden-badges">
          <span className="badge-pill"><Butterfly sp="monarch" size={18} /> {butterflies} on time</span>
          <span className="badge-pill flame">{streak}-day salah streak</span>
        </div>
      </div>
      <span className="garden-bar"><i style={{ width: `${Math.round(pct * 100)}%` }} /></span>
    </button>
  );
}
