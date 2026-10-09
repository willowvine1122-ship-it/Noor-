import { useEffect, useState } from 'react';
import { useToday } from '../lib/hooks';
import { avgCycleLength, dayOf, inCycle, isPredicted, nextPeriodPrediction, periodOn, sortedPeriods, uid, useStore } from '../lib/store';
import { FEEL_BETTER, JOURNAL_PROMPTS } from '../lib/content';
import { dateKey, daysBetween, parseKey } from '../lib/time';
import { Card, Icon, SectionTitle, Sheet, tap } from '../components/ui';
import { MOODS, MoodFace } from './Today';

const MEALS = ['Meal 1 · after waking', 'Meal 2 · with family', 'Meal 3 · after shift'];

export function Me() {
  const { state, update } = useStore();
  const { now, key, log, cycle } = useToday(30000);
  const [prompt, setPrompt] = useState(() => JOURNAL_PROMPTS[now.getDate() % JOURNAL_PROMPTS.length]);
  const [text, setText] = useState('');
  const [breathing, setBreathing] = useState(false);
  const mut = (fn: (d: ReturnType<typeof dayOf>) => void) => update((s) => fn(dayOf(s, key)));

  const saveJournal = () => {
    const t = text.trim();
    if (!t) return;
    update((s) => {
      s.journal.unshift({ id: uid(), at: new Date().toISOString(), prompt, text: t, mood: log.mood });
    });
    setText('');
    tap();
  };

  return (
    <div className="screen">
      <header className="hello">
        <p className="eyebrow">Me</p>
        <h1 className="display">Take care of you</h1>
        <p className="lede">Your body and heart are an amanah. Look after them gently.</p>
      </header>

      <Card tone="rose">
        <SectionTitle action={<span className="muted small">{log.meals.filter(Boolean).length} of 3</span>}>Meals</SectionTitle>
        <div className="stack tight">
          {MEALS.map((m, i) => (
            <button key={m} type="button" className={`toggle-row ${log.meals[i] ? 'on' : ''}`} onClick={() => { tap(); mut((d) => { d.meals[i] = !d.meals[i]; }); }}>
              <span className="check">{log.meals[i] && <Icon name="check" size={14} stroke={2.4} />}</span>
              {m}
            </button>
          ))}
        </div>
        <p className="note">No appetite? Eat small and often. Something warm, something salty, something you loved as a child. Food that tastes good is part of the hobby journey too.</p>
      </Card>

      <div className="grid2">
        <Card tone="sky">
          <p className="eyebrow">Water</p>
          <div className="glasses">
            {Array.from({ length: 8 }, (_, i) => (
              <button key={i} type="button" className={`glass ${i < log.water ? 'full' : ''}`} aria-label={`${i + 1} glasses`} onClick={() => { tap(); mut((d) => { d.water = d.water === i + 1 ? i : i + 1; }); }}>
                <Icon name="drop" size={18} />
              </button>
            ))}
          </div>
          <p className="muted small">{log.water} of 8 glasses</p>
        </Card>
        <Card tone="lilac">
          <p className="eyebrow">Sleep last night</p>
          <div className="sleep">
            <button type="button" className="icon-btn" aria-label="Less" onClick={() => mut((d) => { d.sleepHours = Math.max(0, (d.sleepHours ?? 7) - 0.5); })}>−</button>
            <span className="sleep-num">{log.sleepHours ?? '–'}<small>h</small></span>
            <button type="button" className="icon-btn" aria-label="More" onClick={() => mut((d) => { d.sleepHours = Math.min(14, (d.sleepHours ?? 6.5) + 0.5); })}>+</button>
          </div>
          <p className="muted small">{log.sleepHours === undefined ? 'Goal: 6:30 AM to 2 PM' : log.sleepHours >= 7 ? 'Well rested, alhamdulillah' : 'Try for 7 tonight'}</p>
        </Card>
      </div>

      <CycleCard />

      <Card>
        <SectionTitle>Journal</SectionTitle>
        <button type="button" className="prompt" onClick={() => setPrompt(JOURNAL_PROMPTS[(JOURNAL_PROMPTS.indexOf(prompt) + 1) % JOURNAL_PROMPTS.length])}>
          {prompt} <span className="muted small">↻</span>
        </button>
        <textarea value={text} onChange={(e) => setText(e.target.value)} rows={4} placeholder="Write freely. Only you will ever see this." />
        <button type="button" className="btn btn-solid" disabled={!text.trim()} onClick={saveJournal}>Save to my journal</button>
        {state.journal.slice(0, 5).map((j) => (
          <details key={j.id} className="entry">
            <summary>
              {j.mood && <span className={`mood-mini mood-${j.mood}`}><MoodFace path={MOODS[j.mood - 1].face} size={18} /></span>}
              {new Date(j.at).toLocaleDateString('en-US', { day: 'numeric', month: 'short' })} · {j.prompt ?? 'Note'}
            </summary>
            <p>{j.text}</p>
            <button type="button" className="link danger" onClick={() => confirm('Delete this entry?') && update((s) => { s.journal = s.journal.filter((x) => x.id !== j.id); })}>Delete</button>
          </details>
        ))}
      </Card>

      <Card tone="sage">
        <SectionTitle>Feel better, on your own</SectionTitle>
        <p className="muted small">Things that fill you up without needing anyone to answer.</p>
        <button type="button" className="btn btn-soft" onClick={() => setBreathing(true)}>Breathe with me · 1 minute</button>
        <ul className="soft-list">
          {FEEL_BETTER.map((f) => (
            <li key={f.title}><Icon name="leaf" size={18} /><div><strong>{f.title}</strong><span className="muted small"> {f.detail}</span></div></li>
          ))}
        </ul>
      </Card>

      {cycle && <p className="note center">Cycle mode is on. Your Deen tab has switched to rest-day worship.</p>}
      <Breathe open={breathing} onClose={() => setBreathing(false)} />
    </div>
  );
}

function CycleCard() {
  const { state, update } = useStore();
  const [month, setMonth] = useState(() => {
    const d = new Date();
    return new Date(d.getFullYear(), d.getMonth(), 1);
  });
  const [picked, setPicked] = useState<string | null>(null);
  const today = dateKey(new Date());
  const current = periodOn(state, today);
  const active = inCycle(state, today);
  const prediction = nextPeriodPrediction(state);
  const len = avgCycleLength(state);
  const dayN = current ? daysBetween(parseKey(current.start), new Date()) + 1 : 0;

  const first = new Date(month);
  const offset = (first.getDay() + 6) % 7; // Monday first
  const daysIn = new Date(month.getFullYear(), month.getMonth() + 1, 0).getDate();
  const cells = Array.from({ length: offset + daysIn }, (_, i) => (i < offset ? null : new Date(month.getFullYear(), month.getMonth(), i - offset + 1)));

  const start = (k: string) => update((s) => {
    s.periods = s.periods.filter((p) => p.start !== k);
    s.periods.push({ start: k });
  });
  const end = (k: string) => update((s) => {
    const p = sortedPeriods(s).filter((x) => x.start <= k).pop();
    if (p) {
      const real = s.periods.find((x) => x.start === p.start)!;
      real.end = k;
    }
  });

  return (
    <Card className="cycle">
      <SectionTitle action={<span className="muted small">private</span>}>My cycle</SectionTitle>
      {active && current ? (
        <div className="cycle-status rose">
          <strong>Day {dayN} of your period</strong>
          <span className="muted small">Salah and touching the mushaf are paused. Dhikr, dua and listening continue.</span>
          {!current.end && <button type="button" className="btn btn-soft" onClick={() => { tap(); end(today); }}>It ended today</button>}
        </div>
      ) : (
        <div className="cycle-status">
          <strong>{prediction ? (daysBetween(new Date(), prediction) > 0 ? `Expected in about ${daysBetween(new Date(), prediction)} day${daysBetween(new Date(), prediction) > 1 ? 's' : ''}` : daysBetween(new Date(), prediction) === 0 ? 'Expected around today' : `Expected ${-daysBetween(new Date(), prediction)} day${daysBetween(new Date(), prediction) < -1 ? 's' : ''} ago`) : 'Not tracked yet'}</strong>
          <span className="muted small">Average cycle: {len} days</span>
          <button type="button" className="btn btn-soft" onClick={() => { tap(); start(today); }}>My period started today</button>
        </div>
      )}

      <div className="cal-head">
        <button type="button" className="icon-btn" aria-label="Previous month" onClick={() => setMonth(new Date(month.getFullYear(), month.getMonth() - 1, 1))}><span style={{ display: 'inline-flex', transform: 'scaleX(-1)' }}><Icon name="chevron" size={18} /></span></button>
        <strong>{month.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</strong>
        <button type="button" className="icon-btn" aria-label="Next month" onClick={() => setMonth(new Date(month.getFullYear(), month.getMonth() + 1, 1))}><Icon name="chevron" size={18} /></button>
      </div>
      <div className="cal">
        {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((d, i) => <span key={i} className="cal-dow">{d}</span>)}
        {cells.map((d, i) => {
          if (!d) return <span key={`e${i}`} />;
          const k = dateKey(d);
          const on = inCycle(state, k);
          const pred = isPredicted(state, k);
          return (
            <button key={k} type="button" className={`cal-day ${on ? 'period' : ''} ${pred ? 'predicted' : ''} ${k === today ? 'today' : ''}`} onClick={() => setPicked(k)}>
              {d.getDate()}
            </button>
          );
        })}
      </div>
      <div className="legend">
        <span><i className="cal-key period" /> period</span>
        <span><i className="cal-key predicted" /> predicted</span>
      </div>

      <Sheet open={!!picked} onClose={() => setPicked(null)} title={picked ? parseKey(picked).toLocaleDateString('en-US', { weekday: 'long', day: 'numeric', month: 'long' }) : ''}>
        {picked && (
          <div className="stack">
            <button type="button" className="btn btn-soft" onClick={() => { start(picked); setPicked(null); }}>Period started this day</button>
            <button type="button" className="btn btn-soft" onClick={() => { end(picked); setPicked(null); }}>Period ended this day</button>
            {state.periods.some((p) => p.start === picked) && (
              <button type="button" className="btn btn-ghost" onClick={() => { update((s) => { s.periods = s.periods.filter((p) => p.start !== picked); }); setPicked(null); }}>Remove this period</button>
            )}
          </div>
        )}
      </Sheet>
      {prediction && !active && <p className="muted small">Next expected: {prediction.toLocaleDateString('en-US', { day: 'numeric', month: 'long' })}. On those days Noor switches your Deen tab to rest-day worship.</p>}
      {state.periods.length === 0 && <p className="muted small">Tap a date to mark when your last period started. Predictions get better with each cycle.</p>}
    </Card>
  );
}

function Breathe({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [phase, setPhase] = useState(0);
  const [left, setLeft] = useState(60);
  useEffect(() => {
    if (!open) return;
    setLeft(60);
    setPhase(0);
    const steps = [4000, 4000, 6000];
    let i = 0;
    let t: ReturnType<typeof setTimeout>;
    const next = () => {
      i = (i + 1) % 3;
      setPhase(i);
      t = setTimeout(next, steps[i]);
    };
    t = setTimeout(next, steps[0]);
    const c = setInterval(() => setLeft((l) => Math.max(0, l - 1)), 1000);
    return () => { clearTimeout(t); clearInterval(c); };
  }, [open]);
  return (
    <Sheet open={open} onClose={onClose}>
      <div className="breathe">
        <div className={`breathe-orb phase-${phase}`} />
        <h2 className="display small">{left === 0 ? 'Alhamdulillah' : ['Breathe in…', 'Hold…', 'Breathe out, slowly…'][phase]}</h2>
        <p className="muted">{left === 0 ? 'Well done. Notice how you feel now.' : phase === 2 ? 'Say “Astaghfirullah” as you let go' : `${left}s`}</p>
        <button type="button" className="btn btn-ghost" onClick={onClose}>{left === 0 ? 'Close' : 'Stop'}</button>
      </div>
    </Sheet>
  );
}
