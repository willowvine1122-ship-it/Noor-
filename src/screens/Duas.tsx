import { useState } from 'react';
import { useStore } from '../lib/store';
import { DUAS } from '../lib/content2';
import { Card, Chip, Empty, Icon, tap } from '../components/ui';
import { SubHeader } from './More';

export function Duas({ back }: { back: () => void }) {
  const { state, update } = useStore();
  const [only, setOnly] = useState(false);
  const list = only ? DUAS.filter((d) => state.savedDuas.includes(d.id)) : DUAS;

  return (
    <div className="screen">
      <SubHeader back={back} eyebrow="Duas" title="Words for every moment" lede="From the Quran and authentic hadith. Tap the heart to keep the ones you need close." />
      <div className="chips">
        <Chip active={!only} onClick={() => setOnly(false)}>All duas</Chip>
        <Chip active={only} onClick={() => setOnly(true)}>My duas · {state.savedDuas.length}</Chip>
      </div>
      {!list.length && <Empty>Tap the heart on any dua to keep it here.</Empty>}
      {list.map((d) => {
        const saved = state.savedDuas.includes(d.id);
        return (
          <Card key={d.id} className="dua">
            <div className="row between">
              <p className="eyebrow">{d.when}</p>
              <button type="button" className={`icon-btn heart ${saved ? 'on' : ''}`} aria-label={saved ? 'Remove from my duas' : 'Save to my duas'} onClick={() => {
                tap();
                update((s) => { s.savedDuas = saved ? s.savedDuas.filter((x) => x !== d.id) : [...s.savedDuas, d.id]; });
              }}><Icon name="heart" size={18} /></button>
            </div>
            <p className="arabic" lang="ar" dir="rtl">{d.ar}</p>
            <p className="translit">{d.tr}</p>
            <p>{d.means}</p>
            <p className="muted small">{d.source}</p>
          </Card>
        );
      })}
    </div>
  );
}
