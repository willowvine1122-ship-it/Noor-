import { useState } from 'react';
import { useToday } from '../lib/hooks';
import { dayOf, uid, useStore, type Person } from '../lib/store';
import { FAMILY_IDEAS, PARTNER_PAUSE } from '../lib/content';
import { daysBetween, daysUntilBirthday, fmtBirthday, parseKey } from '../lib/time';
import { Card, Empty, Icon, SectionTitle, Sheet, tap } from '../components/ui';

export function People() {
  const { state, update } = useStore();
  const { now, key, log } = useToday(60000);
  const [edit, setEdit] = useState<Person | null>(null);
  const [note, setNote] = useState('');
  const [noteKind, setNoteKind] = useState<'love' | 'gratitude'>('love');
  const [pause, setPause] = useState(false);
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  const partner = state.people.find((p) => p.partner);
  const family = state.people.filter((p) => !p.partner);
  const sorted = [...family].sort((a, b) =>
    (a.birthday ? daysUntilBirthday(a.birthday, today) : 999) - (b.birthday ? daysUntilBirthday(b.birthday, today) : 999));
  const idea = FAMILY_IDEAS[today.getDate() % FAMILY_IDEAS.length];

  const sat = (p: Person) => {
    tap();
    update((s) => {
      const x = s.people.find((y) => y.id === p.id);
      if (x) x.lastTime = key;
      const d = dayOf(s, key);
      if (!d.familyTime.includes(p.id)) d.familyTime.push(p.id);
    });
  };

  return (
    <div className="screen">
      <header className="hello">
        <p className="eyebrow">People</p>
        <h1 className="display">Love, without holding on too tight</h1>
      </header>

      <Card tone="rose">
        <p className="eyebrow">Today’s small idea</p>
        <p className="act-text">{idea}</p>
        <p className="muted small">{log.familyTime.length ? `You spent time with ${log.familyTime.length} ${log.familyTime.length === 1 ? 'person' : 'people'} today. That matters.` : 'Tap “Time together” on someone after you sit with them.'}</p>
      </Card>

      <Card>
        <SectionTitle action={<button type="button" className="link" onClick={() => setEdit({ id: '', name: '', relation: '' })}><Icon name="plus" size={14} /> Add</button>}>Family</SectionTitle>
        {sorted.length === 0 && <Empty>Add your family and their birthdays. Noor will remind you before each one.</Empty>}
        <ul className="people">
          {sorted.map((p) => {
            const n = p.birthday ? daysUntilBirthday(p.birthday, today) : undefined;
            const ago = p.lastTime ? daysBetween(parseKey(p.lastTime), today) : undefined;
            const todayDone = log.familyTime.includes(p.id);
            return (
              <li key={p.id} className="person">
                <button type="button" className="avatar" onClick={() => setEdit(p)} aria-label={`Edit ${p.name}`}>{p.name.slice(0, 1)}</button>
                <div className="grow" onClick={() => setEdit(p)}>
                  <strong>{p.name}</strong> <span className="muted small">{p.relation}</span>
                  <div className="muted small">
                    {p.birthday && <>{fmtBirthday(p.birthday)}{n === 0 ? ' · today!' : n !== undefined && n <= 30 ? ` · in ${n} days` : ''}</>}
                    {ago !== undefined && ago > 0 && <> · together {ago === 1 ? 'yesterday' : `${ago} days ago`}</>}
                  </div>
                </div>
                <button type="button" className={`chip ${todayDone ? 'active' : ''}`} onClick={() => sat(p)}>{todayDone ? 'Today ✓' : 'Time together'}</button>
              </li>
            );
          })}
        </ul>
      </Card>

      <Card tone="lilac" className="partner">
        <SectionTitle action={partner ? <button type="button" className="link" onClick={() => setEdit(partner)}>Edit</button> : <button type="button" className="link" onClick={() => setEdit({ id: '', name: '', relation: 'Partner', partner: true })}>Add</button>}>
          {partner ? partner.name : 'Your partner'}
        </SectionTitle>
        {partner?.birthday && <p className="muted small">Birthday {fmtBirthday(partner.birthday)} · in {daysUntilBirthday(partner.birthday, today)} days</p>}
        <p className="muted small">A place to grow love that doesn’t depend on replies.</p>
        <button type="button" className="btn btn-soft" onClick={() => setPause(true)}>Waiting for a reply? Take a pause</button>
        <div className="seg">
          <button type="button" className={noteKind === 'love' ? 'on' : ''} onClick={() => setNoteKind('love')}>Something I love about him</button>
          <button type="button" className={noteKind === 'gratitude' ? 'on' : ''} onClick={() => setNoteKind('gratitude')}>Grateful for us</button>
        </div>
        <form className="add-row" onSubmit={(e) => { e.preventDefault(); const t = note.trim(); if (!t) return; update((s) => { s.partnerNotes.unshift({ id: uid(), at: new Date().toISOString(), text: t, kind: noteKind }); }); setNote(''); tap(); }}>
          <input value={note} onChange={(e) => setNote(e.target.value)} placeholder={noteKind === 'love' ? 'The way he…' : 'Today I’m grateful that we…'} />
          <button type="submit" className="icon-btn solid" aria-label="Save note"><Icon name="heart" size={18} /></button>
        </form>
        <ul className="notes">
          {state.partnerNotes.slice(0, 6).map((n) => (
            <li key={n.id}><Icon name={n.kind === 'love' ? 'heart' : 'sparkle'} size={14} /> {n.text}</li>
          ))}
        </ul>
      </Card>

      <Sheet open={pause} onClose={() => setPause(false)} title="A gentle pause">
        <div className="stack">
          {PARTNER_PAUSE.map((p) => <p key={p} className="note">{p}</p>)}
          <p className="muted center">While you wait: make wudu, try your hobby for ten minutes, or sit with your family.</p>
          <button type="button" className="btn btn-solid" onClick={() => setPause(false)}>I’m okay. Back to my day</button>
        </div>
      </Sheet>

      <PersonSheet person={edit} onClose={() => setEdit(null)} />
    </div>
  );
}

function PersonSheet({ person, onClose }: { person: Person | null; onClose: () => void }) {
  const { update } = useStore();
  if (!person) return null;
  const isNew = !person.id;
  const [m, d] = person.birthday?.split('-') ?? ['', ''];
  return (
    <Sheet open onClose={onClose} title={isNew ? 'Add someone' : person.name}>
      <form className="stack" onSubmit={(e) => {
        e.preventDefault();
        const f = new FormData(e.currentTarget);
        const name = String(f.get('name')).trim();
        if (!name) return;
        const month = String(f.get('month'));
        const day = String(f.get('day')).padStart(2, '0');
        const birthday = month && f.get('day') ? `${month}-${day}` : undefined;
        update((s) => {
          if (isNew) s.people.push({ id: uid(), name, relation: String(f.get('relation')).trim(), birthday, partner: person.partner });
          else {
            const x = s.people.find((y) => y.id === person.id);
            if (x) Object.assign(x, { name, relation: String(f.get('relation')).trim(), birthday });
          }
        });
        onClose();
      }}>
        <label className="field">Name<input name="name" defaultValue={person.name} required /></label>
        <label className="field">Who they are to you<input name="relation" defaultValue={person.relation} placeholder="Abbu, sister, cousin…" /></label>
        <div className="row gap">
          <label className="field grow">Birthday month
            <select name="month" defaultValue={m}>
              <option value="">—</option>
              {Array.from({ length: 12 }, (_, i) => <option key={i} value={String(i + 1).padStart(2, '0')}>{new Date(2000, i, 1).toLocaleDateString('en-US', { month: 'long' })}</option>)}
            </select>
          </label>
          <label className="field" style={{ width: 90 }}>Day<input name="day" type="number" min={1} max={31} defaultValue={d ? Number(d) : ''} /></label>
        </div>
        <button type="submit" className="btn btn-solid">Save</button>
        {!isNew && (
          <button type="button" className="btn btn-ghost" onClick={() => { if (confirm(`Remove ${person.name}?`)) { update((s) => { s.people = s.people.filter((y) => y.id !== person.id); }); onClose(); } }}>Remove</button>
        )}
      </form>
    </Sheet>
  );
}
