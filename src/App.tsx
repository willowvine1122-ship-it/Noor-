import { useEffect, useState } from 'react';
import { useStore, uid } from './lib/store';
import { readSetupHash } from './lib/export';
import { unlockAudio } from './lib/adhan-audio';
import { Icon } from './components/ui';
import { Settings } from './components/Settings';
import { AdhanOverlay } from './components/AdhanOverlay';
import { Today } from './screens/Today';
import { Deen } from './screens/Deen';
import { Me } from './screens/Me';
import { Grow } from './screens/Grow';
import { People } from './screens/People';

export type Tab = 'today' | 'deen' | 'me' | 'grow' | 'people';

const TABS: { id: Tab; label: string; icon: Parameters<typeof Icon>[0]['name'] }[] = [
  { id: 'today', label: 'Today', icon: 'sun' },
  { id: 'deen', label: 'Deen', icon: 'moon' },
  { id: 'me', label: 'Me', icon: 'heart' },
  { id: 'grow', label: 'Grow', icon: 'leaf' },
  { id: 'people', label: 'People', icon: 'user' },
];

export function App() {
  const { state, update } = useStore();
  const [tab, setTab] = useState<Tab>(() => (sessionStorage.getItem('noor:tab') as Tab) || 'today');
  const [settings, setSettings] = useState(false);

  useEffect(() => {
    try { sessionStorage.setItem('noor:tab', tab); } catch { /* ignore */ }
    window.scrollTo({ top: 0 });
  }, [tab]);

  // one-time setup link: personal details travel in the link, never in the code
  useEffect(() => {
    const setup = readSetupHash(location.hash) ?? readSetupHash(import.meta.env.VITE_SEED ?? '');
    if (!setup) return;
    update((s) => {
      if (setup.name) s.name = setup.name;
      for (const p of setup.people ?? []) {
        if (!s.people.some((x) => x.name === p.name)) s.people.push({ ...p, id: p.id || uid() });
      }
      for (const p of setup.periods ?? []) {
        if (!s.periods.some((x) => x.start === p.start)) s.periods.push(p);
      }
      if (setup.cycleLength) s.cycleLength = setup.cycleLength;
      s.onboarded = true;
    });
    history.replaceState(null, '', location.pathname + location.search);
  }, [update]);

  useEffect(() => {
    const root = document.documentElement;
    const dark = state.theme === 'dark' || (state.theme === 'auto' && matchMedia('(prefers-color-scheme: dark)').matches);
    root.dataset.theme = dark ? 'dark' : 'light';
    document.querySelector('meta[name="theme-color"]')?.setAttribute('content', dark ? '#16191c' : '#fbfaf7');
  }, [state.theme]);

  return (
    <div className="app" onPointerDown={unlockAudio}>
      <button type="button" className="gear" aria-label="Settings" onClick={() => setSettings(true)}><Icon name="gear" size={20} /></button>
      <main key={tab} className="fade-in">
        {tab === 'today' && <Today go={setTab} />}
        {tab === 'deen' && <Deen />}
        {tab === 'me' && <Me />}
        {tab === 'grow' && <Grow />}
        {tab === 'people' && <People />}
      </main>
      <nav className="tabbar" aria-label="Sections">
        {TABS.map((t) => (
          <button key={t.id} type="button" className={tab === t.id ? 'on' : ''} onClick={() => setTab(t.id)} aria-current={tab === t.id ? 'page' : undefined}>
            <Icon name={t.icon} size={22} />
            <span>{t.label}</span>
          </button>
        ))}
      </nav>
      <AdhanOverlay />
      <Settings open={settings} onClose={() => setSettings(false)} />
      {!state.onboarded && <Welcome onDone={() => update((s) => { s.onboarded = true; })} />}
    </div>
  );
}

function Welcome({ onDone }: { onDone: () => void }) {
  const { state, update } = useStore();
  const standalone = matchMedia('(display-mode: standalone)').matches || (navigator as Navigator & { standalone?: boolean }).standalone;
  return (
    <div className="welcome">
      <div className="welcome-glow" />
      <p className="eyebrow">Bismillah</p>
      <h1 className="display">Welcome to Noor</h1>
      <p className="lede">A calm place for your deen, your body, your people and your growth.</p>
      <label className="field">What should Noor call you?
        <input value={state.name} onChange={(e) => update((s) => { s.name = e.target.value; })} placeholder="Your name" />
      </label>
      {!standalone && (
        <div className="note">
          <strong>Put Noor on your home screen:</strong> tap the Share button in Safari, then “Add to Home Screen”. It will open full screen like any app and work offline.
        </div>
      )}
      <button type="button" className="btn btn-solid" onClick={onDone}>Begin</button>
    </div>
  );
}
