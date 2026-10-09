import { useState } from 'react';
import { useStore } from '../lib/store';
import { disablePush, enablePush, pushStatus, testPush, type PushStatus } from '../lib/push';
import { Icon } from './ui';

/** Turn real phone reminders on or off. `compact` is the Today banner shown while they're off. */
export function Reminders({ compact = false }: { compact?: boolean }) {
  const { state } = useStore();
  const [status, setStatus] = useState<PushStatus>(pushStatus);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState('');

  const turnOn = async () => {
    setBusy(true); setMsg('');
    try {
      await enablePush(state);
      setStatus(pushStatus());
      await testPush();
      setMsg('Done. You should feel a test reminder now.');
    } catch (e) {
      setMsg(e instanceof Error ? e.message : 'That didn’t work. Try again in a moment.');
      setStatus(pushStatus());
    }
    setBusy(false);
  };

  if (compact && status !== 'off' && status !== 'install') return null;

  const text: Record<PushStatus, string> = {
    on: 'On. Your phone will call you for every salah, check on you 25 minutes later if you haven’t marked it, and remind you to eat, drink water, read Quran and sleep.',
    off: 'Let Noor buzz your phone even when it’s closed: every adhan, a follow-up if you haven’t marked the prayer, and gentle nudges for food, water, Quran and sleep.',
    install: 'Open Noor from its icon on your home screen to turn on phone reminders. (Safari tabs can’t receive them.)',
    denied: 'Notifications are blocked. Open iPhone Settings → Noor → Notifications and allow them.',
    unsupported: 'This phone can’t receive reminders from Noor. Update iOS to 16.4 or later.',
  };

  return (
    <div className={compact ? 'remind-banner' : 'field'}>
      {compact ? <span className="remind-bell"><Icon name="bell" size={20} /></span> : 'Phone reminders'}
      <div className="grow">
        {compact && <strong>Never miss a salah</strong>}
        <span className={compact ? 'small' : 'muted small'}>{compact && status === 'off' ? 'Let Noor buzz your phone for every adhan, and check on you if you miss one.' : text[status]}</span>
        {msg && <span className="small remind-msg">{msg}</span>}
      </div>
      {status === 'off' && <button type="button" className="btn btn-solid" disabled={busy} onClick={turnOn}>{busy ? 'Turning on…' : 'Turn on'}</button>}
      {status === 'on' && !compact && (
        <div className="row gap">
          <button type="button" className="btn btn-soft" onClick={async () => { setMsg(''); try { const r = await testPush(); setMsg(r.result === 'sent' ? 'Sent. Check your phone.' : 'The phone didn’t accept it. Turn reminders off and on again.'); } catch (e) { setMsg(String((e as Error).message)); } }}>Send a test</button>
          <button type="button" className="btn btn-ghost" onClick={async () => { await disablePush(); setStatus(pushStatus()); setMsg('Reminders are off.'); }}>Turn off</button>
        </div>
      )}
    </div>
  );
}
