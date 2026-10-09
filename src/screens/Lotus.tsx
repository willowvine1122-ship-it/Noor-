import { useState } from 'react';
import { dayOf, uid, useStore, type LotusItem, type State } from '../lib/store';
import { useToday } from '../lib/hooks';
import { Card, Empty, Icon, SectionTitle, tap } from '../components/ui';
import { celebrate } from '../components/Motion';
import { releaseButterfly } from '../components/Butterfly';
import { LotusFlower, PETALS } from '../components/LotusFlower';
import { dayTimes } from '../lib/routine';
import { fmtTime } from '../lib/time';
import type { Tab } from '../App';
import { SubHeader } from './More';

const WEEK = 7 * 86400000;
const BLESSINGS = [
  'Every petal is a promise you kept to yourself.',
  'Slow is still forward. Bismillah.',
  'Allah loves a deed done consistently, even if small.',
  'You are building something beautiful, one quiet hour at a time.',
];

function Add({ placeholder, onAdd }: { placeholder: string; onAdd: (t: string) => void }) {
  const [t, setT] = useState('');
  return (
    <form className="add-row" onSubmit={(e) => { e.preventDefault(); const v = t.trim(); if (!v) return; onAdd(v); setT(''); }}>
      <input value={t} onChange={(e) => setT(e.target.value)} placeholder={placeholder} />
      <button type="submit" className="icon-btn solid" aria-label="Add"><Icon name="plus" size={18} /></button>
    </form>
  );
}

export function Lotus({ back, go }: { back: () => void; go: (t: Tab) => void }) {
  const { state, update } = useStore();
  const { now, day, key } = useToday(30000);
  const [bloom, setBloom] = useState(0);
  const L = state.lotus;
  const t = dayTimes(state, day);
  const weekWins = L.wins.filter((w) => now.getTime() - new Date(w.at).getTime() < WEEK).length;
  const focus = L.focus[key];
  const inBlock = t.lotus && now >= t.lotus.start && now < t.lotus.end;

  const win = (s: State, text: string) => {
    s.lotus.wins.unshift({ id: uid(), text, at: new Date().toISOString() });
    s.lotus.wins = s.lotus.wins.slice(0, 200);
    const d = dayOf(s, key);
    if (!d.marks.includes('lotus')) d.marks.push('lotus');
  };
  const cheer = () => { tap(); celebrate(); releaseButterfly(); setBloom((b) => b + 1); };

  const toggleTask = (it: LotusItem) => {
    update((s) => {
      const x = s.lotus.tasks.find((y) => y.id === it.id);
      if (!x) return;
      x.done = !x.done;
      if (x.done) win(s, x.text);
    });
    if (!it.done) cheer();
  };

  return (
    <div className="screen lotus-screen">
      <SubHeader back={back} eyebrow="Lotus" title="Your Lotus garden" lede={BLESSINGS[(day.getDate() + bloom) % BLESSINGS.length]} />

      <div className="lotus-hero">
        <LotusFlower open={Math.min(PETALS, weekWins)} size={360} />
        <p className="lotus-count"><strong>{Math.min(PETALS, weekWins)}</strong> of {PETALS} petals open this week</p>
        <p className="muted small">Every Lotus win opens a petal. Fill the flower by Friday.</p>
        {t.lotus && (
          <p className={`lotus-block${inBlock ? ' live' : ''}`}>
            {inBlock ? 'Your Lotus block is on now' : `${t.weekend ? 'Weekend deep work' : 'Lotus block'} today: ${fmtTime(t.lotus.start)} to ${fmtTime(t.lotus.end)}`}
          </p>
        )}
        <div className="row gap center">
          <button type="button" className="btn btn-solid" onClick={() => { update((s) => { const d = dayOf(s, key); if (!d.marks.includes('lotus')) d.marks.push('lotus'); }); go('focus'); }}>
            <Icon name="timer" size={18} /> Start a Lotus session
          </button>
        </div>
      </div>

      <Card tone="rose">
        <SectionTitle>Today’s one Lotus thing</SectionTitle>
        {focus ? (
          <button type="button" className={`toggle-row${focus.done ? ' on' : ''}`} onClick={() => {
            update((s) => { const f = s.lotus.focus[key]; if (!f) return; f.done = !f.done; if (f.done) win(s, f.text); });
            if (!focus.done) cheer();
          }}>
            <span className="check">{focus.done ? '✓' : ''}</span>
            <span className="grow"><strong>{focus.text}</strong><br /><small className="muted">{focus.done ? 'Done. A petal opened for you.' : 'Tap when it’s done'}</small></span>
          </button>
        ) : (
          <>
            <p className="muted small">If you only did one thing for Lotus today, what would make you proud?</p>
            <Add placeholder="One thing for Lotus today…" onAdd={(text) => { tap(); update((s) => { s.lotus.focus[key] = { text }; }); }} />
          </>
        )}
        {focus && !focus.done && <button type="button" className="link muted small" onClick={() => update((s) => { delete s.lotus.focus[key]; })}>Change it</button>}
      </Card>

      <Card>
        <SectionTitle action={<span className="muted small">{L.tasks.filter((x) => !x.done).length} open</span>}>Lotus tasks</SectionTitle>
        {L.tasks.length ? (
          <ul className="tasks">
            {L.tasks.slice(0, 30).map((it) => (
              <li key={it.id} className={it.done ? 'done' : ''}>
                <button type="button" className="check" aria-label={it.done ? 'Undo' : 'Done'} onClick={() => toggleTask(it)}>{it.done ? <Icon name="check" size={15} /> : null}</button>
                <span>{it.text}</span>
                <button type="button" className="icon-btn" aria-label="Remove" onClick={() => update((s) => { s.lotus.tasks = s.lotus.tasks.filter((x) => x.id !== it.id); })}><Icon name="x" size={14} /></button>
              </li>
            ))}
          </ul>
        ) : <Empty>Break Lotus into small steps. Small steps get done.</Empty>}
        <Add placeholder="Add a Lotus task…" onAdd={(text) => update((s) => { s.lotus.tasks.unshift({ id: uid(), text, at: new Date().toISOString() }); })} />
        {L.tasks.some((x) => x.done) && <button type="button" className="link muted small" onClick={() => update((s) => { s.lotus.tasks = s.lotus.tasks.filter((x) => !x.done); })}>Clear finished tasks</button>}
      </Card>

      <Card tone="lilac">
        <SectionTitle>Ideas</SectionTitle>
        <p className="muted small">Catch every idea here so your head stays free. Turn the good ones into tasks.</p>
        <Add placeholder="An idea for Lotus…" onAdd={(text) => update((s) => { s.lotus.ideas.unshift({ id: uid(), text, at: new Date().toISOString() }); })} />
        {L.ideas.length > 0 && (
          <ul className="lotus-ideas">
            {L.ideas.slice(0, 40).map((it) => (
              <li key={it.id}>
                <span>✦ {it.text}</span>
                <button type="button" className="chip" onClick={() => { tap(); update((s) => { s.lotus.ideas = s.lotus.ideas.filter((x) => x.id !== it.id); s.lotus.tasks.unshift({ ...it, at: new Date().toISOString() }); }); }}>Make it a task</button>
                <button type="button" className="icon-btn" aria-label="Remove" onClick={() => update((s) => { s.lotus.ideas = s.lotus.ideas.filter((x) => x.id !== it.id); })}><Icon name="x" size={14} /></button>
              </li>
            ))}
          </ul>
        )}
      </Card>

      <Card tone="gold">
        <SectionTitle action={<span className="muted small">{L.wins.length} all time</span>}>Wins wall</SectionTitle>
        <Add placeholder="Something you got done…" onAdd={(text) => { update((s) => win(s, text)); cheer(); }} />
        {L.wins.length ? (
          <div className="wins">
            {L.wins.slice(0, 24).map((w, i) => (
              <div key={w.id} className={`win win-${i % 4}`}>
                <span>{w.text}</span>
                <small>{new Date(w.at).toLocaleDateString('en-US', { weekday: 'short', day: 'numeric', month: 'short' })}</small>
              </div>
            ))}
          </div>
        ) : <Empty>Your wins will bloom here.</Empty>}
      </Card>
    </div>
  );
}
