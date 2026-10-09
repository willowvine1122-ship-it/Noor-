import { useEffect, useRef, useState } from 'react';
import { useStore } from '../lib/store';
import { backupJson, download, parseBackup, prayerCalendar } from '../lib/export';
import { clearAdhanFile, loadAdhanFile, playAdhan, saveAdhanFile, stopAdhan, unlockAudio } from '../lib/adhan-audio';
import { Sheet } from './ui';
import { SetupPaste } from '../App';
import { hashPin, newSalt, PinPad } from './Lock';

export function Settings({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { state, update, replace } = useStore();
  const [hasAdhan, setHasAdhan] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const backupRef = useRef<HTMLInputElement>(null);
  const [pinStep, setPinStep] = useState<null | 'check' | 'remove' | 'new' | 'confirm'>(null);
  const [firstPin, setFirstPin] = useState('');
  const [pinMsg, setPinMsg] = useState('');

  useEffect(() => {
    if (open) void loadAdhanFile().then((f) => setHasAdhan(!!f));
  }, [open]);

  return (
    <Sheet open={open} onClose={onClose} title="Settings">
      <div className="stack">
        <label className="field">Your name<input value={state.name} onChange={(e) => update((s) => { s.name = e.target.value; })} /></label>

        <div className="field">Asr time
          <div className="seg">
            <button type="button" className={state.asr === 'standard' ? 'on' : ''} onClick={() => update((s) => { s.asr = 'standard'; })}>Standard (earlier)</button>
            <button type="button" className={state.asr === 'hanafi' ? 'on' : ''} onClick={() => update((s) => { s.asr = 'hanafi'; })}>Hanafi (later)</button>
          </div>
          <span className="muted small">Times are calculated for Karachi (University of Islamic Sciences method).</span>
        </div>

        <div className="field">Appearance
          <div className="seg">
            {(['light', 'auto', 'dark'] as const).map((t) => (
              <button key={t} type="button" className={state.theme === t ? 'on' : ''} onClick={() => update((s) => { s.theme = t; })}>{t === 'light' ? 'Light' : t === 'auto' ? 'Match phone' : 'Dark'}</button>
            ))}
          </div>
        </div>

        <div className="field">Adhan
          <div className="seg">
            <button type="button" className={state.adhanSound ? 'on' : ''} onClick={() => update((s) => { s.adhanSound = true; })}>Sound on</button>
            <button type="button" className={!state.adhanSound ? 'on' : ''} onClick={() => update((s) => { s.adhanSound = false; })}>Silent</button>
          </div>
          <span className="muted small">{hasAdhan ? 'Your adhan recording is saved on this phone.' : 'Using a soft chime. Add an adhan recording (mp3) from your Files to hear the real adhan.'}</span>
          <div className="row gap">
            <button type="button" className="btn btn-soft grow" onClick={() => { unlockAudio(); fileRef.current?.click(); }}>{hasAdhan ? 'Change recording' : 'Choose adhan file'}</button>
            <button type="button" className="btn btn-ghost" onClick={() => { unlockAudio(); void playAdhan(); }}>Test</button>
            <button type="button" className="btn btn-ghost" onClick={stopAdhan}>Stop</button>
          </div>
          {hasAdhan && <button type="button" className="link danger" onClick={() => { void clearAdhanFile(); setHasAdhan(false); }}>Remove recording</button>}
          <input ref={fileRef} type="file" accept="audio/*" hidden onChange={async (e) => {
            const f = e.target.files?.[0];
            if (f) { await saveAdhanFile(f); setHasAdhan(true); }
          }} />
          <span className="muted small">The adhan plays when Noor is open. For alerts when it’s closed, add the prayer calendar below.</span>
        </div>

        <div className="field">Prayer alerts on your iPhone
          <button type="button" className="btn btn-soft" onClick={() => download('noor-salah.ics', prayerCalendar(state.asr, 60), 'text/calendar')}>Add next 60 days of salah to Calendar</button>
          <span className="muted small">Opens in Calendar with an alert at every adhan time. Repeat every two months, or after changing the Asr setting.</span>
        </div>

        <div className="field">Your day starts at
          <div className="seg">
            {[9, 11, 13].map((h) => (
              <button key={h} type="button" className={state.dayStartHour === h ? 'on' : ''} onClick={() => update((s) => { s.dayStartHour = h; })}>{h > 12 ? h - 12 : h} {h >= 12 ? 'PM' : 'AM'}</button>
            ))}
          </div>
          <span className="muted small">Fajr after your shift still counts as the same day until then.</span>
        </div>

        <div className="field">PIN lock
          <span className="muted small">{state.pin ? 'Noor asks for your PIN when you open it, and again after two minutes away.' : 'Keep your diary, money and rest days private with a 4-digit PIN.'}</span>
          <div className="row gap">
            {state.pin ? (
              <>
                <button type="button" className="btn btn-soft grow" onClick={() => setPinStep('check')}>Change PIN</button>
                <button type="button" className="btn btn-ghost grow" onClick={() => setPinStep('remove')}>Turn off</button>
              </>
            ) : (
              <button type="button" className="btn btn-soft grow" onClick={() => setPinStep('new')}><span aria-hidden="true">🔒</span> Set a PIN</button>
            )}
          </div>
          {pinMsg && <span className="muted small">{pinMsg}</span>}
          <span className="muted small">If you forget it, there is no reset. Save a backup first.</span>
        </div>

        <SetupPaste />

        <div className="field">Your data
          <span className="muted small">Everything stays on this phone. Nothing is sent anywhere.</span>
          <div className="row gap">
            <button type="button" className="btn btn-soft grow" onClick={() => download(`noor-backup-${new Date().toISOString().slice(0, 10)}.json`, backupJson(state), 'application/json')}>Save a backup</button>
            <button type="button" className="btn btn-ghost grow" onClick={() => backupRef.current?.click()}>Restore</button>
          </div>
          <input ref={backupRef} type="file" accept="application/json,.json" hidden onChange={async (e) => {
            const f = e.target.files?.[0];
            if (!f) return;
            const s = parseBackup(await f.text());
            if (s && confirm('Replace everything in Noor with this backup?')) replace(s);
            else if (!s) alert('That file isn’t a Noor backup.');
          }} />
        </div>

        <button type="button" className="btn btn-solid" onClick={onClose}>Done</button>
      </div>
      {pinStep === 'check' && state.pin && <PinPad title="Current PIN" subtitle="Enter your PIN to change it" check={state.pin} onCancel={() => setPinStep(null)} onDone={() => setPinStep('new')} />}
      {pinStep === 'remove' && state.pin && <PinPad title="Turn off PIN" subtitle="Enter your PIN to confirm" check={state.pin} onCancel={() => setPinStep(null)} onDone={() => {
        update((s) => { delete s.pin; });
        setPinStep(null);
        setPinMsg('PIN turned off.');
      }} />}
      {pinStep === 'new' && <PinPad title="Choose a PIN" subtitle="Four digits you’ll remember" onCancel={() => setPinStep(null)} onDone={(p) => { setFirstPin(p); setPinStep('confirm'); }} />}
      {pinStep === 'confirm' && <PinPad key="confirm" title="Once more" subtitle="Enter the same PIN again" onCancel={() => setPinStep(null)} onDone={async (p) => {
        if (p !== firstPin) { setPinStep('new'); setPinMsg('Those didn’t match. Try again.'); return; }
        const salt = newSalt();
        const hash = await hashPin(p, salt);
        update((s) => { s.pin = { salt, hash }; });
        setPinStep(null);
        setPinMsg('PIN is on. Noor is locked to you.');
      }} />}
    </Sheet>
  );
}
