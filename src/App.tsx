import { useEffect, useState } from 'react';
import { useStore, uid, type State } from './lib/store';
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
import { Play } from './screens/Play';
import { More } from './screens/More';
import { Diary } from './screens/Diary';
import { Money } from './screens/Money';
import { English } from './screens/English';
import { Duas } from './screens/Duas';
import { Lists } from './screens/Lists';
import { Focus } from './screens/Focus';
import { Week } from './screens/Week';
import { LockGate } from './components/Lock';
import { Discover } from './screens/Discover';
import { Habits } from './screens/Habits';
import { Assistant } from './screens/Assistant';
import { Wallpaper } from './components/Wallpaper';
import { Confetti, Splash } from './components/Motion';

type MainTab = 'today' | 'deen' | 'assist' | 'me' | 'grow' | 'more';
type Room = 'discover' | 'habits' | 'people' | 'play' | 'diary' | 'money' | 'english' | 'duas' | 'lists' | 'focus' | 'week';
export type Tab = MainTab | Room;

const TABS: { id: MainTab; label: string; icon: Parameters<typeof Icon>[0]['name'] }[] = [
  { id: 'today', label: 'Today', icon: 'sun' },
  { id: 'deen', label: 'Deen', icon: 'moon' },
  { id: 'assist', label: 'Assistant', icon: 'sparkle' },
  { id: 'me', label: 'Me', icon: 'heart' },
  { id: 'grow', label: 'Grow', icon: 'leaf' },
  { id: 'more', label: 'More', icon: 'grid' },
];
const isMain = (t: Tab): t is MainTab => TABS.some((x) => x.id === t);

type Update = ReturnType<typeof useStore>['update'];

function applySetup(update: Update, setup: Partial<State>) {
  update((s) => {
    if (setup.name) s.name = setup.name;
    for (const p of setup.people ?? []) {
      const same = s.people.find((x) => x.name === p.name || (p.birthday && x.birthday === p.birthday && x.relation === p.relation));
      if (same) same.name = p.name;
      else s.people.push({ ...p, id: p.id || uid() });
    }
    for (const p of setup.periods ?? []) {
      if (!s.periods.some((x) => x.start === p.start)) s.periods.push(p);
    }
    if (setup.cycleLength) s.cycleLength = setup.cycleLength;
    s.onboarded = true;
  });
}

/** Accepts a whole setup link or just the part after #. */
export function setupFromText(text: string) {
  const i = text.indexOf('#setup=');
  return i >= 0 ? readSetupHash(text.slice(i).trim()) : undefined;
}

export function App() {
  const { state, update } = useStore();
  const [tab, setTab] = useState<Tab>(() => (sessionStorage.getItem('noor:tab') as Tab) || 'today');
  const toMore = () => setTab('more');
  const shown: MainTab = isMain(tab) ? tab : 'more';
  const [settings, setSettings] = useState(false);

  useEffect(() => {
    try { sessionStorage.setItem('noor:tab', tab); } catch { /* ignore */ }
    window.scrollTo({ top: 0 });
  }, [tab]);

  // one-time setup link: personal details travel in the link, never in the code
  useEffect(() => {
    const setup = readSetupHash(location.hash) ?? readSetupHash(import.meta.env.VITE_SEED ?? '');
    if (!setup) return;
    applySetup(update, setup);
    history.replaceState(null, '', location.pathname + location.search);
  }, [update]);

  useEffect(() => {
    const root = document.documentElement;
    const dark = state.wallpaper === 'galaxy' || state.theme === 'dark' || (state.theme === 'auto' && matchMedia('(prefers-color-scheme: dark)').matches);
    root.dataset.theme = dark ? 'dark' : 'light';
    root.dataset.palette = state.palette ?? 'pearl';
    root.dataset.wallpaper = state.wallpaper ?? 'none';
    document.querySelector('meta[name="theme-color"]')?.setAttribute('content', dark ? '#16191c' : getComputedStyle(root).getPropertyValue('--bg').trim() || '#fbfaf7');
  }, [state.theme, state.palette, state.wallpaper]);

  return (
    <div className="app" onPointerDown={unlockAudio}>
      <Wallpaper id={state.wallpaper ?? 'none'} />
      <button type="button" className="gear" aria-label="Settings" onClick={() => setSettings(true)}><Icon name="gear" size={20} /></button>
      <main key={tab} className="fade-in">
        {tab === 'today' && <Today go={setTab} />}
        {tab === 'deen' && <Deen />}
        {tab === 'assist' && <Assistant go={setTab} />}
        {tab === 'me' && <Me go={setTab} />}
        {tab === 'grow' && <Grow />}
        {tab === 'more' && <More go={setTab} openSettings={() => setSettings(true)} />}
        {tab === 'people' && <People back={toMore} />}
        {tab === 'play' && <Play back={toMore} />}
        {tab === 'diary' && <Diary back={toMore} />}
        {tab === 'money' && <Money back={toMore} />}
        {tab === 'english' && <English back={toMore} />}
        {tab === 'duas' && <Duas back={toMore} />}
        {tab === 'lists' && <Lists back={toMore} />}
        {tab === 'focus' && <Focus back={toMore} />}
        {tab === 'week' && <Week back={toMore} />}
        {tab === 'discover' && <Discover back={toMore} />}
        {tab === 'habits' && <Habits back={toMore} />}
      </main>
      <nav className="tabbar" aria-label="Sections" style={{ ['--i' as string]: TABS.findIndex((t) => t.id === shown) }}>
        <span className="tab-pill" aria-hidden="true" />
        {TABS.map((t) => (
          <button key={t.id} type="button" className={shown === t.id ? 'on' : ''} onClick={() => setTab(t.id)} aria-current={shown === t.id ? 'page' : undefined}>
            <Icon name={t.icon} size={22} />
            <span>{t.label}</span>
          </button>
        ))}
      </nav>
      <AdhanOverlay />
      <Confetti />
      <Splash />
      <Settings open={settings} onClose={() => setSettings(false)} />
      {!state.onboarded && <Welcome onDone={() => update((s) => { s.onboarded = true; })} />}
      <LockGate />
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
      <SetupPaste onApplied={onDone} />
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

function SetupPaste({ onApplied }: { onApplied?: () => void }) {
  const { update } = useStore();
  const [text, setText] = useState('');
  const [msg, setMsg] = useState('');
  return (
    <div className="field">Have a setup link? Paste it here
      <div className="add-row">
        <input value={text} onChange={(e) => { setText(e.target.value); setMsg(''); }} placeholder="https://…#setup=…" />
        <button type="button" className="icon-btn solid" aria-label="Use setup link" onClick={() => {
          const setup = setupFromText(text);
          if (!setup) { setMsg('That doesn’t look like a Noor setup link. Copy the whole link and try again.'); return; }
          applySetup(update, setup);
          setText('');
          setMsg('Your family and details are in. Bismillah.');
          onApplied?.();
        }}><Icon name="check" size={18} /></button>
      </div>
      {msg && <span className="muted small">{msg}</span>}
    </div>
  );
}

export { SetupPaste };
