import { useState } from 'react';
import { dayOf, useStore, type PrayerStatus } from '../lib/store';
import type { PrayerState } from '../lib/hooks';
import { fmtTime, PRAYER_NAMES, type PrayerId } from '../lib/time';
import { Icon, Sheet, tap } from './ui';
import { celebrate } from './Motion';

const STATUS_LABEL: Record<PrayerStatus, string> = {
  ontime: 'Prayed on time',
  late: 'Prayed late',
  qada: 'Made it up (qada)',
  missed: 'Missed',
};

export function PrayerPills({ prayers, statuses, dayKey, cycle }: { prayers: PrayerState[]; statuses: Partial<Record<PrayerId, PrayerStatus>>; dayKey: string; cycle: boolean }) {
  const [open, setOpen] = useState<PrayerState | null>(null);
  return (
    <>
      <div className="pills">
        {prayers.map((p) => {
          const s = statuses[p.id];
          const cls = cycle ? 'excused' : s ?? (p.phase === 'past' ? 'pending-past' : p.phase);
          return (
            <button key={p.id} type="button" className={`pill pill-${p.id} ${cls}`} onClick={() => !cycle && setOpen(p)} aria-label={`${PRAYER_NAMES[p.id].en}, ${s ? STATUS_LABEL[s] : 'not marked'}`}>
              <span className="pill-dot">{s === 'ontime' || s === 'late' || s === 'qada' ? <Icon name="check" size={14} stroke={2.4} /> : null}</span>
              <span className="pill-name">{PRAYER_NAMES[p.id].en}</span>
              <span className="pill-time">{fmtTime(p.start)}</span>
            </button>
          );
        })}
      </div>
      <PrayerSheet prayer={open} dayKey={dayKey} current={open ? statuses[open.id] : undefined} onClose={() => setOpen(null)} />
    </>
  );
}

export function PrayerSheet({ prayer, dayKey, current, onClose }: { prayer: PrayerState | null; dayKey: string; current?: PrayerStatus; onClose: () => void }) {
  const { update } = useStore();
  if (!prayer) return null;
  const set = (s: PrayerStatus | undefined) => {
    tap();
    update((d) => {
      const day = dayOf(d, dayKey);
      if (s) day.prayers[prayer.id] = s;
      else delete day.prayers[prayer.id];
    });
    if (s === 'ontime' || s === 'late' || s === 'qada') celebrate();
    onClose();
  };
  const options: PrayerStatus[] = prayer.phase === 'past' ? ['late', 'qada', 'ontime', 'missed'] : ['ontime', 'late'];
  return (
    <Sheet open onClose={onClose} title={`${PRAYER_NAMES[prayer.id].en} · ${PRAYER_NAMES[prayer.id].ar}`}>
      <p className="muted center">{fmtTime(prayer.start)} to {fmtTime(prayer.end)}</p>
      <div className="stack">
        {options.map((o) => (
          <button key={o} type="button" className={`btn ${o === 'missed' ? 'btn-ghost' : 'btn-soft'} ${current === o ? 'selected' : ''}`} onClick={() => set(o)}>
            {STATUS_LABEL[o]}
          </button>
        ))}
        {current && (
          <button type="button" className="btn btn-ghost" onClick={() => set(undefined)}>Clear</button>
        )}
      </div>
      {prayer.phase === 'past' && !current && (
        <p className="note">If it’s gone, pray it now as qada. Allah loves the ones who return to Him.</p>
      )}
    </Sheet>
  );
}

export function markPrayer(update: ReturnType<typeof useStore>['update'], dayKey: string, id: PrayerId, s: PrayerStatus) {
  update((d) => {
    dayOf(d, dayKey).prayers[id] = s;
  });
}
