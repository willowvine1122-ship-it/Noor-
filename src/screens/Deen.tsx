import { useState } from 'react';
import { useToday } from '../lib/hooks';
import { dayOf, inCycle, readDay, useStore } from '../lib/store';
import { TASBIHAT } from '../lib/content';
import { addDays, dateKey, fmtTime, PRAYER_NAMES, PRAYER_ORDER } from '../lib/time';
import { Card, Icon, Ring, SectionTitle, tap } from '../components/ui';
import { PrayerSheet } from '../components/prayer';
import type { PrayerState } from '../lib/hooks';

const QURAN_PAGES = 604;

export function Deen() {
  const { state, update } = useStore();
  const { day, key, prayers, log, cycle } = useToday();
  const [open, setOpen] = useState<PrayerState | null>(null);
  const [active, setActive] = useState(TASBIHAT[0].id);
  const [pulse, setPulse] = useState(0);

  const dhikr = TASBIHAT.find((t) => t.id === active)!;
  const target = state.tasbihTargets[dhikr.id] ?? dhikr.target;
  const count = log.tasbih[dhikr.id] ?? 0;

  const count1 = () => {
    tap();
    setPulse((p) => p + 1);
    update((s) => {
      const d = dayOf(s, key);
      const next = (d.tasbih[dhikr.id] ?? 0) + 1;
      d.tasbih[dhikr.id] = next;
      if (next === target) {
        try { navigator.vibrate?.([30, 60, 30]); } catch { /* no haptics */ }
      }
    });
  };

  const readPage = (n: number) => {
    tap();
    update((s) => {
      const d = dayOf(s, key);
      d.quranPages = Math.max(0, d.quranPages + n);
      s.quranPage = Math.min(QURAN_PAGES, Math.max(1, s.quranPage + n));
    });
  };

  // last 28 days of prayers, oldest first
  const history = Array.from({ length: 28 }, (_, i) => {
    const d = addDays(day, i - 27);
    const k = dateKey(d);
    const l = readDay(state, k);
    const excused = inCycle(state, k);
    const done = PRAYER_ORDER.filter((p) => l.prayers[p] && l.prayers[p] !== 'missed').length;
    return { k, d, done, excused, quran: l.quranPages > 0 };
  });
  const monthPrayers = history.reduce((a, h) => a + (h.excused ? 0 : h.done), 0);
  const quranDays = history.filter((h) => h.quran).length;

  return (
    <div className="screen">
      <header className="hello">
        <p className="eyebrow">Deen</p>
        <h1 className="display">Closer to Allah</h1>
        <p className="lede">{cycle ? 'Rest days: your heart can still be in sujood.' : 'Love shows itself in actions. Here are yours today.'}</p>
      </header>

      {cycle ? (
        <Card tone="rose">
          <SectionTitle>Your rest-day worship</SectionTitle>
          <ul className="soft-list">
            <li><Icon name="sparkle" size={18} /> Your five tasbihat below, all of them count.</li>
            <li><Icon name="book" size={18} /> Listen to a page of Quran instead of reading from the mushaf.</li>
            <li><Icon name="heart" size={18} /> Make long dua at prayer times. Sit where you’d normally pray.</li>
            <li><Icon name="leaf" size={18} /> Learn: one hadith, one name of Allah, or a Seerah story.</li>
          </ul>
          <a className="btn btn-soft" href={`https://quran.com/page/${state.quranPage}`} target="_blank" rel="noreferrer">Listen to page {state.quranPage} on quran.com</a>
        </Card>
      ) : (
        <Card>
          <SectionTitle>Today’s salah</SectionTitle>
          <ul className="prayer-list">
            {prayers.map((p) => {
              const s = log.prayers[p.id];
              return (
                <li key={p.id} className={`prow ${p.phase} ${s ?? ''}`}>
                  <button type="button" onClick={() => setOpen(p)}>
                    <span className={`prow-dot grad-${p.id}`}>{s && s !== 'missed' ? <Icon name="check" size={14} stroke={2.4} /> : null}</span>
                    <span className="prow-name">{PRAYER_NAMES[p.id].en}<span className="prow-ar">{PRAYER_NAMES[p.id].ar}</span></span>
                    <span className="prow-time">{fmtTime(p.start)}</span>
                    <span className="prow-status">{s === 'ontime' ? 'On time' : s === 'late' ? 'Late' : s === 'qada' ? 'Qada' : s === 'missed' ? 'Missed' : p.phase === 'now' ? 'Now' : p.phase === 'past' ? 'Mark' : ''}</span>
                  </button>
                </li>
              );
            })}
          </ul>
        </Card>
      )}

      {!cycle && (
        <Card tone="gold" className="quran">
          <div className="quran-row">
            <Ring value={(state.quranPage - 1) / QURAN_PAGES} size={92} stroke={7} color="var(--gold)">
              <div className="ring-num">{state.quranPage}<small>/ {QURAN_PAGES}</small></div>
            </Ring>
            <div>
              <p className="eyebrow">Quran</p>
              <h3>{log.quranPages ? `${log.quranPages} page${log.quranPages > 1 ? 's' : ''} today, alhamdulillah` : 'Your page for today'}</h3>
              <p className="muted small">Next: page {state.quranPage}. {quranDays} of the last 28 days with Quran.</p>
            </div>
          </div>
          <div className="row gap">
            <button type="button" className="btn btn-solid grow" onClick={() => readPage(1)}>I read a page</button>
            {log.quranPages > 0 && <button type="button" className="btn btn-ghost" onClick={() => readPage(-1)}>Undo</button>}
          </div>
          <a className="link" href={`https://quran.com/page/${state.quranPage}`} target="_blank" rel="noreferrer">Open page {state.quranPage} with translation <Icon name="chevron" size={14} /></a>
        </Card>
      )}

      <Card className="tasbih">
        <SectionTitle>Five daily tasbihat</SectionTitle>
        <div className="chips scroll-x">
          {TASBIHAT.map((t, i) => {
            const c = log.tasbih[t.id] ?? 0;
            const tg = state.tasbihTargets[t.id] ?? t.target;
            return (
              <button key={t.id} type="button" className={`chip ${active === t.id ? 'active' : ''} ${c >= tg ? 'complete' : ''}`} onClick={() => setActive(t.id)}>
                {c >= tg && <Icon name="check" size={13} stroke={2.4} />} {i + 1}. {t.tr.split(' ').slice(0, 2).join(' ')}
              </button>
            );
          })}
        </div>
        <p className="arabic">{dhikr.ar}</p>
        <p className="translit">{dhikr.tr}</p>
        <p className="muted small center">{dhikr.meaning}</p>
        <button type="button" className={`counter ${count >= target ? 'complete' : ''}`} onClick={count1} aria-label={`Count. ${count} of ${target}`}>
          <span key={pulse} className="counter-ripple" />
          <Ring value={count / target} size={168} stroke={8} color={count >= target ? 'var(--gold)' : 'var(--sage)'}>
            <div className="counter-num">{count}<small>of {target}</small></div>
          </Ring>
          <span className="counter-hint">{count >= target ? 'Complete. Tap to keep going' : 'Tap anywhere on the circle'}</span>
        </button>
        <div className="row between">
          <p className="virtue">“{dhikr.virtue}” <span className="muted">· {dhikr.source}</span></p>
        </div>
        <div className="row gap center">
          <button type="button" className="btn btn-ghost small" onClick={() => update((s) => { const d = dayOf(s, key); d.tasbih[dhikr.id] = Math.max(0, (d.tasbih[dhikr.id] ?? 0) - 1); })}>−1</button>
          <button type="button" className="btn btn-ghost small" onClick={() => update((s) => { dayOf(s, key).tasbih[dhikr.id] = 0; })}>Reset</button>
          <button type="button" className="btn btn-ghost small" onClick={() => {
            const v = Number(prompt('Daily target for this dhikr', String(target)));
            if (v > 0) update((s) => { s.tasbihTargets[dhikr.id] = Math.round(v); });
          }}>Target {target}</button>
        </div>
      </Card>

      <Card>
        <SectionTitle action={<span className="muted small">{monthPrayers} prayers in 28 days</span>}>Your last four weeks</SectionTitle>
        <div className="heat">
          {history.map((h) => (
            <div key={h.k} className={`heat-cell ${h.excused ? 'excused' : `lvl-${h.done}`} ${h.k === key ? 'today' : ''}`} title={`${h.d.toDateString()}: ${h.excused ? 'rest days' : `${h.done}/5`}`}>
              {h.quran && <span className="heat-q" />}
            </div>
          ))}
        </div>
        <div className="legend">
          <span><i className="heat-cell lvl-5" /> all five</span>
          <span><i className="heat-cell excused" /> rest days</span>
          <span><i className="heat-cell lvl-0"><span className="heat-q" /></i> Quran read</span>
        </div>
        <p className="note">Missed days aren’t failures. The door of tawbah is always open: start again at the next prayer.</p>
      </Card>

      <PrayerSheet prayer={open} dayKey={key} current={open ? log.prayers[open.id] : undefined} onClose={() => setOpen(null)} />
    </div>
  );
}
