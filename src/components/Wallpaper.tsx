import { useEffect, useRef } from 'react';

export type WallpaperId = 'none' | 'glitter' | 'dreamy' | 'galaxy' | 'doodle' | 'aurora';

export const WALLPAPERS: { id: WallpaperId; name: string; preview: string }[] = [
  { id: 'none', name: 'Plain', preview: 'linear-gradient(140deg, #fff6e8, #fbfaf7 55%, #eef5f0)' },
  { id: 'glitter', name: 'Glitter', preview: 'linear-gradient(135deg, #fde2ec, #efe3fb 45%, #fff1d6)' },
  { id: 'dreamy', name: 'Dreamy space', preview: 'radial-gradient(circle at 70% 30%, #fff 0 6%, transparent 7%), linear-gradient(160deg, #e4dcfb, #f9dceb 60%, #fde9d6)' },
  { id: 'galaxy', name: 'Night galaxy', preview: 'radial-gradient(circle at 30% 30%, #6c4bb4, transparent 50%), radial-gradient(circle at 70% 70%, #1f5f8b, transparent 55%), #0b0a1f' },
  { id: 'doodle', name: 'Doodles', preview: 'radial-gradient(circle at 25% 30%, #e7b8c0 0 8%, transparent 9%), radial-gradient(circle at 70% 65%, #b9d4c6 0 8%, transparent 9%), #fffaf5' },
  { id: 'aurora', name: 'Aurora', preview: 'linear-gradient(120deg, #c9f0e4, #d9d6fb 45%, #fcd9e6 80%)' },
];

const DOODLES = encodeURIComponent(`<svg xmlns='http://www.w3.org/2000/svg' width='220' height='220' fill='none' stroke='#b98a95' stroke-width='1.6' stroke-linecap='round' stroke-linejoin='round' opacity='.5'>
<path d='M30 22l3 8 8 3-8 3-3 8-3-8-8-3 8-3z'/>
<path d='M178 40a14 14 0 1 1-12-20 11 11 0 0 0 12 20z'/>
<path d='M110 92c-6-8-18-4-16 6 2 8 16 14 16 14s14-6 16-14c2-10-10-14-16-6z'/>
<circle cx='40' cy='150' r='6'/><path d='M40 136v-6M40 170v-6M26 150h-6M60 150h-6M30 140l-4-4M54 164l-4-4M50 140l4-4M26 164l4-4'/>
<path d='M160 150c10-14 30-12 34 2-14 6-26 6-34-2zM160 150c6 10 6 20 0 28'/>
<path d='M96 186c4-6 10-6 14 0s10 6 14 0 10-6 14 0'/>
<path d='M188 108l2 5 5 2-5 2-2 5-2-5-5-2 5-2z'/>
<path d='M74 54c0-6 10-6 10 0s-10 10-10 16'/><circle cx='74' cy='78' r='1'/>
<path d='M128 30c4 0 6 4 4 7s-8 1-7-4 7-7 11-3'/>
<circle cx='196' cy='196' r='3'/><circle cx='14' cy='96' r='2'/><circle cx='140' cy='130' r='2'/>
</svg>`);

/** A living background behind the whole app. Pauses when hidden; still when reduced motion is on. */
export function Wallpaper({ id }: { id: WallpaperId }) {
  const canvas = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (id !== 'glitter' && id !== 'galaxy' && id !== 'dreamy') return;
    const c = canvas.current;
    const ctx = c?.getContext('2d');
    if (!c || !ctx) return;
    const still = matchMedia('(prefers-reduced-motion: reduce)').matches;
    const dpr = Math.min(2, devicePixelRatio || 1);
    const resize = () => { c.width = innerWidth * dpr; c.height = innerHeight * dpr; };
    resize();
    addEventListener('resize', resize);

    const count = id === 'galaxy' ? 140 : id === 'glitter' ? 90 : 60;
    const colors = id === 'glitter' ? ['#f7c6d9', '#e6c96b', '#ffffff', '#cdb8f3', '#f9e2a4'] : id === 'galaxy' ? ['#ffffff', '#cfd8ff', '#ffe9c4', '#e5d1ff'] : ['#ffffff', '#f6d7e6', '#e3d9ff'];
    const stars = Array.from({ length: count }, () => ({
      x: Math.random(), y: Math.random(), r: Math.random() * (id === 'glitter' ? 2.4 : 1.6) + 0.4,
      p: Math.random() * Math.PI * 2, s: 0.6 + Math.random() * 1.6, c: colors[Math.floor(Math.random() * colors.length)],
      dy: id === 'glitter' ? 0.00004 + Math.random() * 0.00008 : 0,
    }));
    let shoot = { x: 0, y: 0, t: -1 };
    let raf = 0;
    let last = performance.now();

    const draw = (now: number) => {
      const dt = now - last;
      last = now;
      ctx.clearRect(0, 0, c.width, c.height);
      for (const st of stars) {
        st.p += dt * 0.002 * st.s;
        st.y -= st.dy * dt;
        if (st.y < -0.02) st.y = 1.02;
        const a = 0.35 + 0.65 * Math.abs(Math.sin(st.p));
        const x = st.x * c.width;
        const y = st.y * c.height;
        const r = st.r * dpr;
        ctx.globalAlpha = a;
        ctx.fillStyle = st.c;
        if (id === 'glitter' && st.r > 1.7) {
          // four-point sparkle
          ctx.beginPath();
          const k = r * 2.6 * (0.6 + 0.4 * a);
          ctx.moveTo(x, y - k); ctx.quadraticCurveTo(x, y, x + k, y); ctx.quadraticCurveTo(x, y, x, y + k); ctx.quadraticCurveTo(x, y, x - k, y); ctx.quadraticCurveTo(x, y, x, y - k);
          ctx.fill();
        } else {
          ctx.beginPath();
          ctx.arc(x, y, r, 0, Math.PI * 2);
          ctx.fill();
        }
      }
      if (id === 'galaxy') {
        if (shoot.t < 0 && Math.random() < 0.002) shoot = { x: Math.random() * 0.7 + 0.2, y: Math.random() * 0.4, t: 0 };
        if (shoot.t >= 0) {
          shoot.t += dt / 900;
          const x = (shoot.x - shoot.t * 0.35) * c.width;
          const y = (shoot.y + shoot.t * 0.2) * c.height;
          const g = ctx.createLinearGradient(x, y, x + 120 * dpr, y - 70 * dpr);
          g.addColorStop(0, 'rgba(255,255,255,.9)');
          g.addColorStop(1, 'rgba(255,255,255,0)');
          ctx.globalAlpha = 1 - shoot.t;
          ctx.strokeStyle = g;
          ctx.lineWidth = 1.6 * dpr;
          ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + 120 * dpr, y - 70 * dpr); ctx.stroke();
          if (shoot.t >= 1) shoot.t = -1;
        }
      }
      ctx.globalAlpha = 1;
      if (!still) raf = requestAnimationFrame(draw);
    };
    const onVis = () => {
      cancelAnimationFrame(raf);
      if (!document.hidden) { last = performance.now(); raf = requestAnimationFrame(draw); }
    };
    raf = requestAnimationFrame(draw);
    document.addEventListener('visibilitychange', onVis);
    return () => { cancelAnimationFrame(raf); removeEventListener('resize', resize); document.removeEventListener('visibilitychange', onVis); };
  }, [id]);

  if (id === 'none') return null;
  return (
    <div className={`wallpaper wp-${id}`} aria-hidden="true" style={id === 'doodle' ? { backgroundImage: `url("data:image/svg+xml,${DOODLES}")` } : undefined}>
      {id === 'dreamy' && <><span className="planet p1" /><span className="planet p2" /><span className="moon-glow" /></>}
      {id === 'galaxy' && <span className="nebula" />}
      {id === 'aurora' && <><span className="aur a1" /><span className="aur a2" /><span className="aur a3" /></>}
      {id === 'glitter' && <span className="shimmer" />}
      <canvas ref={canvas} />
    </div>
  );
}
