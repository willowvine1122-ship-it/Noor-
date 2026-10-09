import { useEffect, useState } from 'react';
import { useToday } from '../lib/hooks';
import { useStore } from '../lib/store';
import { playAdhan, stopAdhan } from '../lib/adhan-audio';
import { PRAYER_NAMES, type PrayerId } from '../lib/time';
import { markPrayer } from './prayer';

const SHOWN = 'noor:adhan-shown';

const CALL: Record<PrayerId, string> = {
  fajr: 'Your night’s work is done. Now stand before the One who gave you the strength.',
  dhuhr: 'Wake up for Allah. Before your phone, before food, go to Him.',
  asr: 'Leave what you’re doing. The Prophet ﷺ warned about missing Asr. Go now.',
  maghrib: 'The sun is setting. Maghrib’s time is short. Stand up now.',
  isha: 'Give Him your evening before you give the night to work.',
};

/** Full-screen call to prayer when a prayer time arrives while Noor is open. */
export function AdhanOverlay() {
  const { state, update } = useStore();
  const { now, prayers, key, cycle } = useToday();
  const [active, setActive] = useState<PrayerId | null>(null);
  const [sound, setSound] = useState<'adhan' | 'chime' | null>(null);

  useEffect(() => {
    const due = prayers.find((p) => now >= p.start && now.getTime() - p.start.getTime() < 3 * 60000);
    if (!due) return;
    const tag = `${key}:${due.id}`;
    let shown: string[] = [];
    try {
      shown = JSON.parse(localStorage.getItem(SHOWN) ?? '[]');
    } catch {
      shown = [];
    }
    if (shown.includes(tag)) return;
    try {
      localStorage.setItem(SHOWN, JSON.stringify([...shown.slice(-20), tag]));
    } catch {
      /* ignore */
    }
    setActive(due.id);
    if (state.adhanSound) void playAdhan().then(setSound);
  }, [now, prayers, key, state.adhanSound]);

  if (!active) return null;
  const close = () => {
    stopAdhan();
    setActive(null);
    setSound(null);
  };
  return (
    <div className={`adhan-overlay grad-${active}`} role="alertdialog" aria-label={`Time for ${PRAYER_NAMES[active].en}`}>
      <div className="adhan-glow" />
      <p className="eyebrow">Hayya ʿalas-salah</p>
      <h1 className="adhan-ar">{PRAYER_NAMES[active].ar}</h1>
      <h2 className="adhan-en">It’s time for {PRAYER_NAMES[active].en}</h2>
      <p className="adhan-call">{cycle ? 'You’re resting from salah today. Sit for a moment of dhikr, Allah is near.' : CALL[active]}</p>
      <div className="stack adhan-actions">
        <button type="button" className="btn btn-solid" onClick={close}>{cycle ? 'SubhanAllah' : 'I’m going to pray'}</button>
        {!cycle && (
          <button type="button" className="btn btn-ghost-light" onClick={() => { markPrayer(update, key, active, 'ontime'); close(); }}>
            I already prayed
          </button>
        )}
        {sound && <button type="button" className="link-light" onClick={stopAdhan}>Stop sound</button>}
      </div>
    </div>
  );
}
