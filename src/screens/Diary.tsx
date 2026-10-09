import { useMemo, useState } from 'react';
import { uid, useStore, type JournalEntry, type Mood } from '../lib/store';
import { JOURNAL_PROMPTS } from '../lib/content';
import { Card, Chip, Empty, Icon, Sheet, tap } from '../components/ui';
import { MOODS, MoodFace } from './Today';
import { SubHeader } from './More';

const monthLabel = (iso: string) => new Date(iso).toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

export function Diary({ back }: { back: () => void }) {
  const { state, update } = useStore();
  const [writing, setWriting] = useState<JournalEntry | null>(null);
  const [q, setQ] = useState('');
  const [reading, setReading] = useState<JournalEntry | null>(null);

  const entries = useMemo(() => {
    const t = q.trim().toLowerCase();
    return [...state.journal]
      .sort((a, b) => b.at.localeCompare(a.at))
      .filter((j) => !t || j.text.toLowerCase().includes(t) || (j.prompt ?? '').toLowerCase().includes(t));
  }, [state.journal, q]);

  const groups = useMemo(() => {
    const m = new Map<string, JournalEntry[]>();
    for (const e of entries) {
      const k = monthLabel(e.at);
      m.set(k, [...(m.get(k) ?? []), e]);
    }
    return [...m];
  }, [entries]);

  const today = new Date();
  const onThisDay = state.journal.find((j) => {
    const d = new Date(j.at);
    return d.getDate() === today.getDate() && d.getMonth() !== today.getMonth() && d < today;
  });
  const streak = (() => {
    const days = new Set(state.journal.map((j) => new Date(j.at).toDateString()));
    let n = 0;
    const d = new Date();
    if (!days.has(d.toDateString())) d.setDate(d.getDate() - 1);
    while (days.has(d.toDateString())) { n++; d.setDate(d.getDate() - 1); }
    return n;
  })();

  const fresh = (): JournalEntry => ({ id: uid(), at: new Date().toISOString(), text: '', prompt: JOURNAL_PROMPTS[today.getDate() % JOURNAL_PROMPTS.length] });

  return (
    <div className="screen">
      <SubHeader back={back} eyebrow="Diary" title="Dear diary" lede="A locked, private place for your thoughts. Nothing here leaves your phone." />

      <button type="button" className="write-cta" onClick={() => { tap(); setWriting(fresh()); }}>
        <span className="write-cta-icon"><Icon name="pen" size={22} /></span>
        <span>
          <strong>Write today’s page</strong>
          <span className="muted small">{streak > 1 ? `${streak} days in a row. Keep the thread going.` : 'Even three lines count.'}</span>
        </span>
      </button>

      {onThisDay && (
        <Card tone="lilac" onClick={() => setReading(onThisDay)}>
          <p className="eyebrow">On this day · {new Date(onThisDay.at).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</p>
          <p className="diary-snip">{onThisDay.text.slice(0, 140)}{onThisDay.text.length > 140 ? '…' : ''}</p>
        </Card>
      )}

      {state.journal.length > 3 && (
        <label className="search">
          <Icon name="search" size={18} />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search your pages" />
        </label>
      )}

      {!entries.length && <Empty>{q ? 'Nothing matches that.' : 'Your first page is waiting. Write anything: a worry, a win, a dua.'}</Empty>}

      {groups.map(([month, list]) => (
        <section key={month} className="stack tight">
          <p className="eyebrow">{month}</p>
          {list.map((j) => {
            const d = new Date(j.at);
            return (
              <button key={j.id} type="button" className="diary-row" onClick={() => setReading(j)}>
                <span className="diary-date"><strong>{d.getDate()}</strong>{d.toLocaleDateString('en-US', { weekday: 'short' })}</span>
                <span className="diary-body">
                  {j.prompt && <span className="diary-prompt">{j.prompt}</span>}
                  <span className="diary-snip">{j.text.slice(0, 110)}{j.text.length > 110 ? '…' : ''}</span>
                </span>
                {j.mood && <span className={`mood-mini mood-${j.mood}`}><MoodFace path={MOODS[j.mood - 1].face} size={20} /></span>}
              </button>
            );
          })}
        </section>
      ))}

      <Sheet open={!!reading} onClose={() => setReading(null)}>
        {reading && (
          <>
            <p className="eyebrow">{new Date(reading.at).toLocaleDateString('en-US', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</p>
            {reading.prompt && <h2 className="sheet-title">{reading.prompt}</h2>}
            <p className="diary-full">{reading.text}</p>
            <div className="row gap">
              <button type="button" className="btn btn-soft grow" onClick={() => { setWriting(reading); setReading(null); }}>Edit</button>
              <button type="button" className="btn btn-ghost" onClick={() => {
                if (!confirm('Delete this page forever?')) return;
                update((s) => { s.journal = s.journal.filter((x) => x.id !== reading.id); });
                setReading(null);
              }}><Icon name="trash" size={18} /></button>
            </div>
          </>
        )}
      </Sheet>

      <Sheet open={!!writing} onClose={() => setWriting(null)} title={writing && state.journal.some((j) => j.id === writing.id) ? 'Edit page' : 'Today’s page'}>
        {writing && <Writer entry={writing} onDone={(e) => {
          update((s) => {
            const i = s.journal.findIndex((x) => x.id === e.id);
            if (i >= 0) s.journal[i] = e;
            else s.journal.unshift(e);
          });
          tap();
          setWriting(null);
        }} />}
      </Sheet>
    </div>
  );
}

function Writer({ entry, onDone }: { entry: JournalEntry; onDone: (e: JournalEntry) => void }) {
  const [e, setE] = useState(entry);
  const nextPrompt = () => setE({ ...e, prompt: JOURNAL_PROMPTS[(JOURNAL_PROMPTS.indexOf(e.prompt ?? '') + 1) % JOURNAL_PROMPTS.length] });
  return (
    <div className="stack">
      <div className="chips wrap">
        <Chip active={!!e.prompt} onClick={nextPrompt}>{e.prompt ? 'Another prompt ↻' : 'Give me a prompt'}</Chip>
        {e.prompt && <Chip onClick={() => setE({ ...e, prompt: undefined })}>Just write freely</Chip>}
      </div>
      {e.prompt && <p className="prompt">{e.prompt}</p>}
      <textarea className="diary-input" autoFocus value={e.text} onChange={(x) => setE({ ...e, text: x.target.value })} rows={9} placeholder="Write freely. Only you will ever see this." />
      <div className="field">How do you feel?
        <div className="moods">
          {MOODS.map((m) => (
            <button key={m.v} type="button" className={`mood mood-${m.v} ${e.mood === m.v ? 'active' : ''}`} onClick={() => setE({ ...e, mood: e.mood === m.v ? undefined : (m.v as Mood) })}>
              <MoodFace path={m.face} />
              <span>{m.label}</span>
            </button>
          ))}
        </div>
      </div>
      <button type="button" className="btn btn-solid" disabled={!e.text.trim()} onClick={() => onDone({ ...e, text: e.text.trim() })}>Save page</button>
    </div>
  );
}
