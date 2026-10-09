import { useState } from 'react';
import { dayOf, useStore, type State } from '../lib/store';
import { useToday } from '../lib/hooks';
import { buildSteps, doneToday, type Step, type StepDo } from '../lib/assistant';
import { Icon, Ring, tap } from '../components/ui';
import type { Tab } from '../App';
import { celebrate as confetti } from '../components/Motion';
import { releaseButterfly } from '../components/Butterfly';

const SNOOZE = 'noor:snooze';
const loadSnooze = (): Record<string, number> => { try { return JSON.parse(localStorage.getItem(SNOOZE) ?? '{}'); } catch { return {}; } };

const CHEERS = ['MashaAllah! One more done.', 'Beautiful. Keep going.', 'Alhamdulillah, that’s done.', 'Look at you, getting it done.', 'Proud of you. Next one.'];

export function Assistant({ go, back, embedded = false }: { go: (t: Tab) => void; back?: () => void; embedded?: boolean }) {
  const { state, update } = useStore();
  const { now, day, key, prayers, log, cycle } = useToday(15000);
  const [snooze, setSnooze] = useState(loadSnooze);
  const [cheer, setCheer] = useState<string | null>(null);
  const [burst, setBurst] = useState(0);

  const all = buildSteps(state, now, day, key, prayers, log, cycle, log.marks);
  const steps = all.filter((s) => !(snooze[s.id] > now.getTime()));
  const later = all.filter((s) => snooze[s.id] > now.getTime());
  const [first, ...rest] = steps;

  const doneCount = doneToday(state, key, log);
  const total = doneCount + all.length;

  const celebrate = () => {
    tap();
    try { navigator.vibrate?.([10, 40, 10]); } catch { /* no haptics */ }
    setCheer(CHEERS[(doneCount + burst) % CHEERS.length]);
    confetti();
    setBurst((b) => b + 1);
    setTimeout(() => setCheer(null), 2200);
  };

  const perform = (s: Step, d: StepDo) => {
    if (d.kind === 'go') { go(d.tab); return; }
    update((st: State) => {
      const l = dayOf(st, key);
      switch (d.kind) {
        case 'prayer': l.prayers[d.prayer] = d.status; if (d.status === 'ontime') releaseButterfly(); break;
        case 'meal': l.meals[d.i] = true; break;
        case 'water': l.water = Math.min(12, l.water + 1); break;
        case 'quran': l.quranPages += 1; st.quranPage = Math.min(604, st.quranPage + 1); break;
        case 'task': { const t = l.tasks.find((x) => x.id === d.id); if (t) t.done = true; break; }
        case 'habit': if (!l.habits.includes(d.id)) l.habits.push(d.id); break;
        case 'family': l.familyTime.push('family'); break;
        case 'mark': if (!l.marks.includes(d.id)) l.marks.push(d.id); break;
      }
    });
    if (s.id === 'water') { tap(); setCheer(`Glass ${log.water + 1} of 8. Keep sipping!`); setTimeout(() => setCheer(null), 1800); return; }
    celebrate();
  };

  const later30 = (s: Step) => {
    const next = { ...snooze, [s.id]: now.getTime() + 30 * 60000 };
    setSnooze(next);
    try { localStorage.setItem(SNOOZE, JSON.stringify(next)); } catch { /* ignore */ }
  };
  const skip = (s: Step) => update((st) => { const l = dayOf(st, key); if (!l.marks.includes(s.id)) l.marks.push(s.id); });

  const hour = now.getHours();
  const hello = hour >= 5 && hour < 12 ? 'Almost bedtime' : hour < 17 ? 'Let’s get today done' : hour < 21 ? 'Your evening, sorted' : 'Shift time. I’ve got the rest';

  const card = first ? (
    <section className={`now-step tone-${first.tone} ${first.urgent ? 'urgent' : ''}`} key={first.id}>
      <div className="row between">
        <p className="eyebrow">{first.urgent ? 'Right now' : 'Your next step'}</p>
        {first.min && <span className="mins"><Icon name="timer" size={14} /> {first.min} min</span>}
      </div>
      <span className="now-icon"><Icon name={first.icon} size={26} /></span>
      <h2 className="now-title">{first.title}</h2>
      <p className="now-why">{first.why}</p>
      {first.plan ? (
        <PlanDay onDone={(tasks) => {
          update((st) => { const l = dayOf(st, key); tasks.forEach((t, i) => l.tasks.push({ id: `${Date.now()}${i}`, text: t, done: false })); l.marks.push('plan'); });
          celebrate();
        }} />
      ) : (
        <div className="now-actions">
          <button type="button" className="btn btn-solid" onClick={() => perform(first, first.done)}>{first.doneLabel ?? 'Done'} <Icon name="check" size={18} /></button>
          {first.alt && <button type="button" className="btn btn-soft" onClick={() => perform(first, first.alt!.done)}>{first.alt.label}</button>}
          {first.done.kind === 'task' && <button type="button" className="btn btn-soft" onClick={() => go('focus')}><Icon name="timer" size={16} /> Focus on it</button>}
        </div>
      )}
      <div className="row gap later-row">
        {!first.urgent && <button type="button" className="link" onClick={() => later30(first)}>Remind me in 30 min</button>}
        {!first.id.startsWith('pray') && <button type="button" className="link muted-link" onClick={() => skip(first)}>Skip today</button>}
        {embedded && rest.length > 0 && <button type="button" className="link push-right" onClick={() => go('assist')}>{rest.length} more <Icon name="chevron" size={14} /></button>}
      </div>
    </section>
  ) : (
    <section className="now-step tone-gold all-done">
      <Sparkles />
      <p className="eyebrow">All done for now</p>
      <h2 className="now-title">You did everything. Alhamdulillah.</h2>
      <p className="now-why">Rest, read, or do something you love. I’ll bring the next thing when it’s time.</p>
    </section>
  );

  if (embedded) {
    return (
      <>
        {cheer && <div className="cheer" key={burst}>{cheer}<Sparkles /></div>}
        {card}
      </>
    );
  }

  return (
    <div className="screen">
      {back && <button type="button" className="back" onClick={back}><Icon name="back" size={18} /> Today</button>}
      <header className="hello assist-hello">
        <div>
          <p className="eyebrow">Your assistant</p>
          <h1 className="display">{hello}</h1>
          <p className="lede">One step at a time. Do the card in front of you, and I’ll hand you the next one.</p>
        </div>
        <Ring value={total ? doneCount / total : 0} size={74} stroke={7} color="var(--sage)">
          <div className="ring-num small-ring">{doneCount}<small>of {total}</small></div>
        </Ring>
      </header>

      {cheer && <div className="cheer" key={burst}>{cheer}<Sparkles /></div>}

      {card}

      {rest.length > 0 && (
        <section className="card">
          <p className="eyebrow">Up next · {rest.length}</p>
          <ul className="queue">
            {rest.map((s) => (
              <li key={s.id} className={`q q-${s.tone}`}>
                <button type="button" className="q-check" aria-label={`Done: ${s.title}`} onClick={() => perform(s, s.done)}>
                  {s.done.kind === 'go' ? <Icon name="chevron" size={14} /> : null}
                </button>
                <span className="grow"><strong>{s.title}</strong>{s.min && <span className="muted small"> · {s.min} min</span>}</span>
                <span className="q-icon"><Icon name={s.icon} size={16} /></span>
              </li>
            ))}
          </ul>
        </section>
      )}

      {later.length > 0 && (
        <p className="muted small center">Later: {later.map((s) => s.title).join(' · ')}</p>
      )}
    </div>
  );
}

function PlanDay({ onDone }: { onDone: (tasks: string[]) => void }) {
  const [t, setT] = useState(['', '', '']);
  const hints = ['The most important thing…', 'Something for Lotus or work…', 'Something just for you…'];
  const filled = t.map((x) => x.trim()).filter(Boolean);
  return (
    <div className="stack tight">
      {t.map((v, i) => (
        <input key={i} value={v} placeholder={hints[i]} onChange={(e) => setT(t.map((x, j) => (j === i ? e.target.value : x)))} />
      ))}
      <button type="button" className="btn btn-solid" disabled={!filled.length} onClick={() => onDone(filled)}>Save my plan <Icon name="check" size={18} /></button>
    </div>
  );
}

function Sparkles() {
  return (
    <span className="sparkles" aria-hidden="true">
      {Array.from({ length: 14 }, (_, i) => <i key={i} style={{ ['--i' as string]: i }} />)}
    </span>
  );
}
