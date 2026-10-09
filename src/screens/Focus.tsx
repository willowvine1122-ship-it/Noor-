import { useEffect, useState } from 'react';
import { uid, useStore } from '../lib/store';
import { useNow } from '../lib/hooks';
import { chime, unlockAudio } from '../lib/adhan-audio';
import { addDays, dateKey } from '../lib/time';
import { Card, Chip, Empty, Icon, Ring, SectionTitle, tap } from '../components/ui';
import { SubHeader } from './More';

const LENGTHS = [15, 25, 50];
const LABELS = ['Work', 'Lotus', 'Study', 'Quran', 'Reading', 'Tidy up'];
const RUN = 'noor:focus-run';

type Run = { end: number; minutes: number; label: string; paused?: number };

function loadRun(): Run | null {
  try { return JSON.parse(localStorage.getItem(RUN) ?? 'null'); } catch { return null; }
}
function saveRun(r: Run | null) {
  try { if (r) localStorage.setItem(RUN, JSON.stringify(r)); else localStorage.removeItem(RUN); } catch { /* ignore */ }
}

export function Focus({ back }: { back: () => void }) {
  const { state, update } = useStore();
  const now = useNow(500);
  const [minutes, setMinutes] = useState(25);
  const [label, setLabel] = useState('Work');
  const [run, setRunState] = useState<Run | null>(loadRun);
  const setRun = (r: Run | null) => { saveRun(r); setRunState(r); };

  const remaining = run ? (run.paused ?? Math.max(0, run.end - now.getTime())) : minutes * 60000;
  const total = (run?.minutes ?? minutes) * 60000;

  // the timer keeps time while the phone is locked: it only stores when it ends
  useEffect(() => {
    if (!run || run.paused !== undefined || run.end > now.getTime()) return;
    update((s) => { s.focus.unshift({ id: uid(), at: new Date(run.end).toISOString(), minutes: run.minutes, label: run.label }); });
    setRun(null);
    chime();
    try { navigator.vibrate?.([200, 100, 200]); } catch { /* no haptics */ }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [now, run]);

  const mm = Math.floor(remaining / 60000);
  const ss = Math.floor((remaining % 60000) / 1000);
  const todayKey = dateKey(new Date());
  const todayMins = state.focus.filter((f) => dateKey(new Date(f.at)) === todayKey).reduce((a, f) => a + f.minutes, 0);
  const weekStart = addDays(new Date(), -6);
  const weekMins = state.focus.filter((f) => new Date(f.at) >= weekStart).reduce((a, f) => a + f.minutes, 0);

  return (
    <div className="screen">
      <SubHeader back={back} eyebrow="Focus" title="One thing at a time" lede="Phone face down. One task. When the timer ends, rest for five minutes." />

      <Card className="focus-card">
        <Ring value={run ? 1 - remaining / total : 0} size={220} stroke={10} color="var(--lilac)">
          <div className="focus-time">
            <span>{String(mm).padStart(2, '0')}:{String(ss).padStart(2, '0')}</span>
            <small>{run ? run.label : 'Ready'}</small>
          </div>
        </Ring>
        {!run ? (
          <>
            <div className="chips">
              {LENGTHS.map((l) => <Chip key={l} active={minutes === l} onClick={() => setMinutes(l)}>{l} min</Chip>)}
            </div>
            <div className="chips wrap center-chips">
              {LABELS.map((l) => <Chip key={l} active={label === l} onClick={() => setLabel(l)}>{l}</Chip>)}
            </div>
            <button type="button" className="btn btn-solid wide" onClick={() => { tap(); unlockAudio(); setRun({ end: Date.now() + minutes * 60000, minutes, label }); }}>
              <Icon name="play" size={18} /> Begin · Bismillah
            </button>
          </>
        ) : (
          <div className="row gap">
            {run.paused === undefined ? (
              <button type="button" className="btn btn-soft" onClick={() => setRun({ ...run, paused: remaining })}>Pause</button>
            ) : (
              <button type="button" className="btn btn-solid" onClick={() => setRun({ ...run, end: Date.now() + (run.paused ?? 0), paused: undefined })}>Resume</button>
            )}
            <button type="button" className="btn btn-ghost" onClick={() => confirm('Stop this session?') && setRun(null)}>Stop</button>
          </div>
        )}
      </Card>

      <div className="grid2">
        <Card tone="lilac"><p className="eyebrow">Today</p><p className="stat">{todayMins}<small> min</small></p></Card>
        <Card tone="sky"><p className="eyebrow">This week</p><p className="stat">{weekMins >= 60 ? `${Math.floor(weekMins / 60)}h ${weekMins % 60}` : weekMins}<small> min</small></p></Card>
      </div>

      <Card>
        <SectionTitle>Recent sessions</SectionTitle>
        {!state.focus.length && <Empty>Your finished sessions will appear here.</Empty>}
        <ul className="soft-list">
          {state.focus.slice(0, 8).map((f) => (
            <li key={f.id}><Icon name="check" size={16} /><div><strong>{f.label}</strong><span className="muted small"> · {f.minutes} min · {new Date(f.at).toLocaleString('en-US', { weekday: 'short', hour: 'numeric', minute: '2-digit' })}</span></div></li>
          ))}
        </ul>
      </Card>
    </div>
  );
}
