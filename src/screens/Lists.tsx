import { useState } from 'react';
import { uid, useStore } from '../lib/store';
import { LIST_TEMPLATES } from '../lib/content2';
import { Card, Chip, Empty, Icon, SectionTitle, tap } from '../components/ui';
import { SubHeader } from './More';

export function Lists({ back }: { back: () => void }) {
  const { state, update } = useStore();
  const [title, setTitle] = useState('');
  const [drafts, setDrafts] = useState<Record<string, string>>({});

  const addList = (t: string) => {
    const name = t.trim();
    if (!name) return;
    tap();
    update((s) => { s.lists.unshift({ id: uid(), title: name, items: [] }); });
    setTitle('');
  };

  const unused = LIST_TEMPLATES.filter((t) => !state.lists.some((l) => l.title === t));

  return (
    <div className="screen">
      <SubHeader back={back} eyebrow="Lists" title="Out of your head" lede="Groceries, wishes, ideas. Write it down once and stop carrying it." />

      <Card>
        <div className="add-row">
          <input value={title} onChange={(e) => setTitle(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && addList(title)} placeholder="New list name" />
          <button type="button" className="icon-btn solid" aria-label="Add list" onClick={() => addList(title)}><Icon name="plus" size={18} /></button>
        </div>
        {unused.length > 0 && (
          <div className="chips wrap">
            {unused.map((t) => <Chip key={t} onClick={() => addList(t)}>+ {t}</Chip>)}
          </div>
        )}
      </Card>

      {!state.lists.length && <Empty>Start with groceries. It’s the one everyone forgets.</Empty>}

      {state.lists.map((l) => {
        const left = l.items.filter((i) => !i.done).length;
        const draft = drafts[l.id] ?? '';
        const addItem = () => {
          if (!draft.trim()) return;
          tap();
          update((s) => { s.lists.find((x) => x.id === l.id)?.items.push({ id: uid(), text: draft.trim(), done: false }); });
          setDrafts({ ...drafts, [l.id]: '' });
        };
        return (
          <Card key={l.id}>
            <SectionTitle action={<span className="muted small">{l.items.length ? `${left} left` : ''}</span>}>{l.title}</SectionTitle>
            <ul className="tasks">
              {[...l.items].sort((a, b) => Number(a.done) - Number(b.done)).map((i) => (
                <li key={i.id} className={i.done ? 'done' : ''}>
                  <button type="button" className="check" aria-label={i.done ? 'Not done' : 'Done'} onClick={() => { tap(); update((s) => {
                    const it = s.lists.find((x) => x.id === l.id)?.items.find((x) => x.id === i.id);
                    if (it) it.done = !it.done;
                  }); }}>{i.done && <Icon name="check" size={14} stroke={2.4} />}</button>
                  <span>{i.text}</span>
                </li>
              ))}
            </ul>
            <div className="add-row small">
              <input value={draft} onChange={(e) => setDrafts({ ...drafts, [l.id]: e.target.value })} onKeyDown={(e) => e.key === 'Enter' && addItem()} placeholder="Add an item" />
              <button type="button" className="icon-btn" aria-label="Add item" onClick={addItem}><Icon name="plus" size={18} /></button>
            </div>
            <div className="row gap">
              {l.items.some((i) => i.done) && (
                <button type="button" className="link" onClick={() => update((s) => { const x = s.lists.find((y) => y.id === l.id); if (x) x.items = x.items.filter((i) => !i.done); })}>Clear ticked</button>
              )}
              <button type="button" className="link danger" onClick={() => confirm(`Delete “${l.title}”?`) && update((s) => { s.lists = s.lists.filter((x) => x.id !== l.id); })}>Delete list</button>
            </div>
          </Card>
        );
      })}
    </div>
  );
}
