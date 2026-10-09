import { useEffect, useRef, useState } from 'react';
import { useStore } from '../lib/store';
import { Icon, tap } from './ui';

export async function hashPin(pin: string, salt: string) {
  const data = new TextEncoder().encode(`${salt}:${pin}`);
  const buf = await crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(buf)).map((b) => b.toString(16).padStart(2, '0')).join('');
}

export function newSalt() {
  return Array.from(crypto.getRandomValues(new Uint8Array(12))).map((b) => b.toString(16).padStart(2, '0')).join('');
}

const RELOCK_MS = 2 * 60 * 1000;
// kept in memory only, so opening Noor fresh always asks for the PIN
let hiddenAt = 0;

/** Covers the app until the right PIN is entered. Locks again after two minutes away. */
export function LockGate() {
  const { state } = useStore();
  const [locked, setLocked] = useState(() => !!state.pin);

  useEffect(() => {
    if (!state.pin) { setLocked(false); return; }
    const onVis = () => {
      if (document.hidden) hiddenAt = Date.now();
      else if (hiddenAt && Date.now() - hiddenAt > RELOCK_MS) setLocked(true);
    };
    document.addEventListener('visibilitychange', onVis);
    return () => document.removeEventListener('visibilitychange', onVis);
  }, [state.pin]);

  if (!locked || !state.pin) return null;
  return <PinPad title="Welcome back" subtitle="Enter your PIN" check={state.pin} onDone={() => setLocked(false)} />;
}

export function PinPad({ title, subtitle, check, onDone, onCancel }: { title: string; subtitle: string; check?: { salt: string; hash: string }; onDone: (pin: string) => void; onCancel?: () => void }) {
  const [pin, setPin] = useState('');
  const [error, setError] = useState(false);
  const done = useRef(onDone);
  done.current = onDone;

  useEffect(() => {
    if (pin.length !== 4) return;
    if (!check) { done.current(pin); setPin(''); return; }
    void hashPin(pin, check.salt).then((h) => {
      if (h === check.hash) done.current(pin);
      else {
        setError(true);
        try { navigator.vibrate?.([40, 40, 40]); } catch { /* no haptics */ }
        setTimeout(() => { setPin(''); setError(false); }, 500);
      }
    });
  }, [pin, check]);

  const press = (d: string) => {
    tap();
    setPin((p) => (p.length < 4 ? p + d : p));
  };

  return (
    <div className="lock">
      <div className="welcome-glow" />
      <div className="lock-inner">
        <span className="lock-moon">☾</span>
        <h1 className="display small">{title}</h1>
        <p className="muted">{subtitle}</p>
        <div className={`pin-dots ${error ? 'shake' : ''}`}>
          {[0, 1, 2, 3].map((i) => <span key={i} className={i < pin.length ? 'on' : ''} />)}
        </div>
        <div className="keypad">
          {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((d) => (
            <button key={d} type="button" onClick={() => press(d)}>{d}</button>
          ))}
          <button type="button" className="key-quiet" onClick={onCancel} disabled={!onCancel}>{onCancel ? 'Cancel' : ''}</button>
          <button type="button" onClick={() => press('0')}>0</button>
          <button type="button" className="key-quiet" aria-label="Delete" onClick={() => setPin((p) => p.slice(0, -1))}><Icon name="x" size={20} /></button>
        </div>
      </div>
    </div>
  );
}
