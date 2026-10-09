import { SectionArt } from '../components/Motion';
import type React from 'react';
import { useState } from 'react';
import { useToday } from '../lib/hooks';
import { dayOf, uid, useStore } from '../lib/store';
import { HOBBIES, type Hobby } from '../lib/content';
import { daysBetween, parseKey } from '../lib/time';
import { Card, Empty, Icon, SectionTitle, Sheet, tap } from '../components/ui';

export function Grow() {
  const { state, update } = useStore();
  const { day, key, log } = useToday(60000);
  const [rate, setRate] = useState<Hobby | null>(null);
  const [showAll, setShowAll] = useState(false);
  const [goal, setGoal] = useState('');
  const [learned, setLearned] = useState(log.learned ?? '');

  const week = Math.max(0, Math.floor(daysBetween(parseKey(state.hobbyStart), day) / 7));
  const pair = [HOBBIES[(week * 2) % HOBBIES.length], HOBBIES[(week * 2 + 1) % HOBBIES.length]];
  const tried = Object.keys(state.hobbies).length;
  const loved = HOBBIES.filter((h) => state.hobbies[h.id]?.verdict === 'more');

  return (
    <div className="screen">
      <SectionArt kind="grow" progress={Object.keys(state.hobbies).length / 8} />
      <header className="hello">
        <p className="eyebrow">Grow</p>
        <h1 className="display">Find what you love</h1>
        <p className="lede">Two new things each week. No pressure to be good at them, only curious.</p>
      </header>

      <Card className="hobby-hero">
        <SectionTitle action={<span className="muted small">Week {week + 1} · {tried} tried</span>}>This week’s two</SectionTitle>
        <div className="hobby-pair">
          {pair.map((h) => {
            const t = state.hobbies[h.id];
            return (
              <button key={h.id} type="button" className={`hobby tone-${h.tone} ${t ? 'tried' : ''}`} onClick={() => setRate(h)}>
                <span className="hobby-name">{h.name}</span>
                <span className="hobby-why">{h.why}</span>
                <span className="hobby-step"><strong>Start:</strong> {h.firstStep}</span>
                <span className="hobby-cta">{t ? `${'♥'.repeat(t.rating)}${'♡'.repeat(5 - t.rating)}` : 'I tried it →'}</span>
              </button>
            );
          })}
        </div>
      </Card>

      {loved.length > 0 && (
        <Card tone="rose">
          <SectionTitle>Things you love</SectionTitle>
          <div className="chips wrap">
            {loved.map((h) => <span key={h.id} className="chip active">{h.name}</span>)}
          </div>
          <p className="muted small">These are yours now. Make time for them when you need to feel like yourself.</p>
        </Card>
      )}

      <Card>
        <SectionTitle action={<button type="button" className="link" onClick={() => setShowAll((v) => !v)}>{showAll ? 'Hide' : 'See all'}</button>}>The tasting menu</SectionTitle>
        {showAll ? (
          <ul className="menu">
            {HOBBIES.map((h) => {
              const t = state.hobbies[h.id];
              return (
                <li key={h.id}>
                  <button type="button" onClick={() => setRate(h)}>
                    <span className={`dot tone-${h.tone}`} />
                    <span className="grow">{h.name}</span>
                    <span className="muted small">{t ? (t.verdict === 'more' ? 'Love it' : t.verdict === 'no' ? 'Not for me' : `${t.rating}/5`) : 'Not yet'}</span>
                  </button>
                </li>
              );
            })}
          </ul>
        ) : (
          <p className="muted small">{HOBBIES.length} things to try over twelve weeks. Jump ahead whenever something calls you.</p>
        )}
      </Card>

      <Card tone="sage">
        <SectionTitle>One thing I learned today</SectionTitle>
        <textarea rows={2} value={learned} onChange={(e) => setLearned(e.target.value)} onBlur={() => update((s) => { dayOf(s, key).learned = learned.trim() || undefined; })} placeholder="A word, an ayah, a skill, a fact…" />
        {log.learned && <p className="muted small"><Icon name="check" size={13} /> Saved for today</p>}
      </Card>

      <Card>
        <SectionTitle>Learning roadmaps</SectionTitle>
        {state.learning.length === 0 && <Empty>Add a skill you want to grow, then break it into small steps.</Empty>}
        {state.learning.map((g) => {
          const done = g.steps.filter((s) => s.done).length;
          return (
            <details key={g.id} className="goal" open>
              <summary>
                <span className="grow">{g.title}</span>
                <span className="muted small">{done}/{g.steps.length}</span>
              </summary>
              <div className="bar"><span style={{ '--p': g.steps.length ? done / g.steps.length : 0 } as React.CSSProperties} /></div>
              <ul className="tasks">
                {g.steps.map((st) => (
                  <li key={st.id} className={st.done ? 'done' : ''}>
                    <button type="button" className="check" aria-label="Toggle step" onClick={() => { tap(); update((s) => { const x = s.learning.find((y) => y.id === g.id)?.steps.find((y) => y.id === st.id); if (x) x.done = !x.done; }); }}>
                      {st.done && <Icon name="check" size={14} stroke={2.4} />}
                    </button>
                    <span>{st.text}</span>
                  </li>
                ))}
              </ul>
              <StepAdder onAdd={(text) => update((s) => { s.learning.find((y) => y.id === g.id)?.steps.push({ id: uid(), text, done: false }); })} />
              <button type="button" className="link danger" onClick={() => confirm(`Remove “${g.title}”?`) && update((s) => { s.learning = s.learning.filter((y) => y.id !== g.id); })}>Remove roadmap</button>
            </details>
          );
        })}
        <form className="add-row" onSubmit={(e) => { e.preventDefault(); const t = goal.trim(); if (!t) return; update((s) => { s.learning.push({ id: uid(), title: t, steps: [] }); }); setGoal(''); }}>
          <input value={goal} onChange={(e) => setGoal(e.target.value)} placeholder="e.g. Quranic Arabic, Excel, Design…" />
          <button type="submit" className="icon-btn solid" aria-label="Add roadmap"><Icon name="plus" size={18} /></button>
        </form>
      </Card>

      <HobbySheet hobby={rate} onClose={() => setRate(null)} />
    </div>
  );
}

function StepAdder({ onAdd }: { onAdd: (t: string) => void }) {
  const [t, setT] = useState('');
  return (
    <form className="add-row small" onSubmit={(e) => { e.preventDefault(); if (t.trim()) onAdd(t.trim()); setT(''); }}>
      <input value={t} onChange={(e) => setT(e.target.value)} placeholder="Next small step…" />
      <button type="submit" className="icon-btn" aria-label="Add step"><Icon name="plus" size={16} /></button>
    </form>
  );
}

function HobbySheet({ hobby, onClose }: { hobby: Hobby | null; onClose: () => void }) {
  const { state, update } = useStore();
  if (!hobby) return null;
  const t = state.hobbies[hobby.id];
  const set = (patch: Partial<{ rating: number; verdict: 'more' | 'maybe' | 'no'; note: string }>) =>
    update((s) => {
      s.hobbies[hobby.id] = { ...(s.hobbies[hobby.id] ?? { rating: 3, at: new Date().toISOString() }), ...patch };
    });
  return (
    <Sheet open onClose={onClose} title={hobby.name}>
      <p className="muted center">{hobby.why}</p>
      <p className="note"><strong>First tiny step:</strong> {hobby.firstStep}</p>
      <p className="eyebrow center">How did it feel?</p>
      <div className="hearts">
        {[1, 2, 3, 4, 5].map((n) => (
          <button key={n} type="button" className={(t?.rating ?? 0) >= n ? 'on' : ''} onClick={() => { tap(); set({ rating: n }); }} aria-label={`${n} hearts`}>
            <Icon name="heart" size={30} />
          </button>
        ))}
      </div>
      <div className="seg">
        {(['more', 'maybe', 'no'] as const).map((v) => (
          <button key={v} type="button" className={t?.verdict === v ? 'on' : ''} onClick={() => { tap(); set({ verdict: v }); }}>
            {v === 'more' ? 'I want more' : v === 'maybe' ? 'Maybe again' : 'Not for me'}
          </button>
        ))}
      </div>
      <textarea rows={2} defaultValue={t?.note ?? ''} onBlur={(e) => set({ note: e.target.value })} placeholder="What did you notice?" />
      <button type="button" className="btn btn-solid" onClick={onClose}>Done</button>
    </Sheet>
  );
}
