import { useState } from 'react';
import { dayOf, readDay, uid, useStore } from '../lib/store';
import { useToday } from '../lib/hooks';
import { HABIT_IDEAS } from '../lib/content3';
import { addDays, dateKey } from '../lib/time';
import { Card, Chip, Empty, Icon, SectionTitle, tap } from '../components/ui';
import { SubHeader } from './More';

export function Habits({ back }: { back: () => void }) {
  const { state, update } = useStore();
  const { day, key } = useToday(60000);
  const [name, setName] = useState('');
  const week = Array.from({ length: 7 }, (_, i) => addDays(day, i - 6));
  const doneOn = (k: string, id: string) => readDay(state, k).habits.includes(id);

  const streak = (id: string) => {
    let n = 0;
    for (let d = doneOn(key, id) ? day : addDays(day, -1); doneOn(dateKey(d), id) && n < 999; d = addDays(d, -1)) n++;
    return n;
  };

  const add = (n: string) => {
    const t = n.trim();
    if (!t || state.habits.some((h) => h.name === t)) return;
    tap();
    update((s) => { s.habits.push({ id: uid(), name: t }); });
    setName('');
  };

  const toggle = (k: string, id: string) => {
    tap();
    update((s) => {
      const d = dayOf(s, k);
      d.habits = d.habits.includes(id) ? d.habits.filter((x) => x !== id) : [...d.habits, id];
    });
  };

  const doneToday = state.habits.filter((h) => doneOn(key, h.id)).length;

  return (
    <div className="screen">
      <SubHeader back={back} eyebrow="Habits" title="Small things, every day" lede="Tiny habits, kept gently, become who you are. Start with two." />

      {state.habits.length > 0 && (
        <Card>
          <SectionTitle action={<span className="muted small">{doneToday} of {state.habits.length} today</span>}>Today</SectionTitle>
          <div className="habit-head">
            <span />
            {week.map((d) => <small key={dateKey(d)} className={dateKey(d) === key ? 'today' : ''}>{d.toLocaleDateString('en-US', { weekday: 'narrow' })}</small>)}
          </div>
          {state.habits.map((h) => {
            const n = streak(h.id);
            return (
              <div key={h.id} className="habit">
                <span className="habit-name">
                  <strong>{h.name}</strong>
                  <span className="muted small">{n > 1 ? `${n}-day streak` : n === 1 ? 'Started' : 'Not yet'}
                    {' · '}<button type="button" className="link danger inline" onClick={() => confirm(`Remove “${h.name}”?`) && update((s) => { s.habits = s.habits.filter((x) => x.id !== h.id); })}>remove</button>
                  </span>
                </span>
                {week.map((d) => {
                  const k = dateKey(d);
                  const on = doneOn(k, h.id);
                  return (
                    <button key={k} type="button" className={`habit-dot ${on ? 'on' : ''} ${k === key ? 'today' : ''}`} aria-label={`${h.name} ${d.toDateString()}`} onClick={() => toggle(k, h.id)}>
                      {on && <Icon name="check" size={13} stroke={2.6} />}
                    </button>
                  );
                })}
              </div>
            );
          })}
        </Card>
      )}

      <Card tone="sage">
        <SectionTitle>Add a habit</SectionTitle>
        <div className="add-row">
          <input value={name} onChange={(e) => setName(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && add(name)} placeholder="e.g. Morning adhkar" />
          <button type="button" className="icon-btn solid" aria-label="Add habit" onClick={() => add(name)}><Icon name="plus" size={18} /></button>
        </div>
        <div className="chips wrap">
          {HABIT_IDEAS.filter((i) => !state.habits.some((h) => h.name === i)).map((i) => <Chip key={i} onClick={() => add(i)}>+ {i}</Chip>)}
        </div>
      </Card>

      {!state.habits.length && <Empty>Pick one or two ideas above. Small and kept beats big and dropped.</Empty>}
    </div>
  );
}
