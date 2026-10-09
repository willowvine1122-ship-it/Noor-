import { useState } from 'react';
import { useStore } from '../lib/store';
import { useToday } from '../lib/hooks';
import { defaultRoutine, getRoutine, type DayPlan, type Routine as R } from '../lib/routine';
import { Card, Chip, SectionTitle, tap } from '../components/ui';
import { SubHeader } from './More';
import { dateKey } from '../lib/time';

const DAYS = [
  { d: 1, l: 'Mon' }, { d: 2, l: 'Tue' }, { d: 3, l: 'Wed' }, { d: 4, l: 'Thu' }, { d: 5, l: 'Fri' }, { d: 6, l: 'Sat' }, { d: 0, l: 'Sun' },
];

function Time({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <label className="rt-time">
      <span>{label}</span>
      <input type="time" value={value} onChange={(e) => e.target.value && onChange(e.target.value)} />
    </label>
  );
}

function Plan({ plan, set, weekend }: { plan: DayPlan; set: (p: Partial<DayPlan>) => void; weekend: boolean }) {
  return (
    <div className="rt-plan">
      <div className="rt-grid">
        <Time label="Wake up" value={plan.wake} onChange={(v) => set({ wake: v })} />
        <Time label="Sleep" value={plan.sleep} onChange={(v) => set({ sleep: v })} />
        <Time label={weekend ? 'Joy time' : 'Hobby'} value={plan.hobby} onChange={(v) => set({ hobby: v })} />
        <Time label="Family time" value={plan.family} onChange={(v) => set({ family: v })} />
      </div>
      <button type="button" className={`toggle-row${plan.lotus ? ' on' : ''}`} onClick={() => { tap(); set({ lotus: !plan.lotus }); }}>
        <span className="check">{plan.lotus ? '✓' : ''}</span>
        <span><strong>Lotus block</strong><br /><small className="muted">Time to work on Lotus</small></span>
      </button>
      {plan.lotus && (
        <div className="rt-grid">
          <Time label="Lotus starts" value={plan.lotusStart} onChange={(v) => set({ lotusStart: v })} />
          <Time label="Lotus ends" value={plan.lotusEnd} onChange={(v) => set({ lotusEnd: v })} />
        </div>
      )}
      <button type="button" className={`toggle-row${plan.shift ? ' on' : ''}`} onClick={() => { tap(); set({ shift: !plan.shift }); }}>
        <span className="check">{plan.shift ? '✓' : ''}</span>
        <span><strong>Work shift</strong><br /><small className="muted">{plan.shift ? 'Noor plans around it' : 'Day off from work'}</small></span>
      </button>
      {plan.shift && (
        <div className="rt-grid">
          <Time label="Shift starts" value={plan.shiftStart} onChange={(v) => set({ shiftStart: v })} />
          <Time label="Shift ends" value={plan.shiftEnd} onChange={(v) => set({ shiftEnd: v })} />
        </div>
      )}
    </div>
  );
}

export function RoutineScreen({ back }: { back: () => void }) {
  const { state, update } = useStore();
  const { day } = useToday(60000);
  const r = getRoutine(state);
  const todayWeekend = r.weekendDays.includes(day.getDay());
  const [which, setWhich] = useState<'weekday' | 'weekend'>(todayWeekend ? 'weekend' : 'weekday');
  const edit = (fn: (x: R) => void) => update((s) => { const x = getRoutine(s); fn(x); s.routine = x; });
  const late = r.late[dateKey(day)] ?? 0;

  return (
    <div className="screen">
      <SubHeader back={back} eyebrow="My routine" title={todayWeekend ? 'Weekend mode is on' : 'Your weekday rhythm'} lede="Change a time here and everything moves with it: your steps, your day plan and your phone reminders. Salah stays fixed to the sky." />

      <div className="seg">
        <button type="button" className={which === 'weekday' ? 'on' : ''} onClick={() => setWhich('weekday')}>Weekdays</button>
        <button type="button" className={which === 'weekend' ? 'on' : ''} onClick={() => setWhich('weekend')}>Weekend</button>
      </div>

      <Card tone={which === 'weekend' ? 'rose' : 'sage'}>
        <SectionTitle>{which === 'weekend' ? 'Weekend days' : 'Weekdays'}</SectionTitle>
        <Plan plan={r[which]} weekend={which === 'weekend'} set={(p) => edit((x) => { x[which] = { ...x[which], ...p }; })} />
      </Card>

      <Card>
        <SectionTitle>Which days are the weekend?</SectionTitle>
        <p className="muted small">Your day starts when you wake up, so “Sat” means Saturday afternoon into Sunday morning.</p>
        <div className="chips">
          {DAYS.map(({ d, l }) => (
            <Chip key={d} active={r.weekendDays.includes(d)} onClick={() => edit((x) => { x.weekendDays = x.weekendDays.includes(d) ? x.weekendDays.filter((y) => y !== d) : [...x.weekendDays, d]; })}>{l}</Chip>
          ))}
        </div>
      </Card>

      <Card tone="lilac">
        <SectionTitle>Staying up later tonight?</SectionTitle>
        <p className="muted small">Your sleep reminder moves later, and tomorrow starts later too. Only for tonight.</p>
        <LateChips value={late} onPick={(m) => edit((x) => { x.late = { ...x.late, [dateKey(day)]: m }; })} />
      </Card>

      <button type="button" className="link muted" onClick={() => { if (confirm('Go back to the routine Noor started with?')) update((s) => { s.routine = { ...defaultRoutine(), late: getRoutine(s).late }; }); }}>Reset to the original routine</button>
    </div>
  );
}

export function LateChips({ value, onPick }: { value: number; onPick: (m: number) => void }) {
  return (
    <div className="chips">
      {[0, 60, 120, 180].map((m) => (
        <Chip key={m} active={value === m} onClick={() => { tap(); onPick(m); }}>{m ? `+${m / 60} hour${m > 60 ? 's' : ''}` : 'Normal'}</Chip>
      ))}
    </div>
  );
}
