import type { ReactNode } from 'react';
import { useStore } from '../lib/store';
import { useToday } from '../lib/hooks';
import { monthKey, spentIn } from './Money';
import { Icon, type IconName } from '../components/ui';
import type { Tab } from '../App';

type Room = { id: Tab; title: string; hint: string; icon: IconName; tone: string };

export const ROOMS: Room[] = [
  { id: 'discover', title: 'Discover', hint: 'Science and tech today', icon: 'globe', tone: 'sky' },
  { id: 'habits', title: 'Habits', hint: 'Small daily wins', icon: 'flame', tone: 'gold' },
  { id: 'diary', title: 'Diary', hint: 'Private pages', icon: 'pen', tone: 'rose' },
  { id: 'money', title: 'Money', hint: 'Budget and spending', icon: 'wallet', tone: 'gold' },
  { id: 'english', title: 'English', hint: 'One thing a day', icon: 'chat', tone: 'sky' },
  { id: 'people', title: 'People', hint: 'Family and love', icon: 'user', tone: 'sage' },
  { id: 'duas', title: 'Duas', hint: 'For every moment', icon: 'hands', tone: 'sage' },
  { id: 'focus', title: 'Focus', hint: 'Timer for deep work', icon: 'timer', tone: 'lilac' },
  { id: 'lists', title: 'Lists', hint: 'Groceries, wishes, ideas', icon: 'list', tone: 'sky' },
  { id: 'week', title: 'My week', hint: 'Sunday review', icon: 'chart', tone: 'gold' },
  { id: 'play', title: 'Play', hint: 'When you’re bored', icon: 'sparkle', tone: 'rose' },
];

export function More({ go, openSettings }: { go: (t: Tab) => void; openSettings: () => void }) {
  const { state } = useStore();
  const { key } = useToday(60000);
  const eng = state.english.days[key];
  const engDone = [eng?.word, eng?.phrase, eng?.spoke].filter(Boolean).length;
  const spent = spentIn(state, monthKey(new Date()));
  const badges: Partial<Record<Tab, string>> = {
    diary: state.journal.length ? `${state.journal.length} ${state.journal.length === 1 ? 'page' : 'pages'}` : 'Start today',
    money: spent ? `Rs ${spent.toLocaleString('en-PK')} this month` : 'Add your budget',
    english: engDone === 3 ? 'Done today ✓' : `${engDone} of 3 today`,
    people: `${state.people.length} people`,
    duas: state.savedDuas.length ? `${state.savedDuas.length} saved` : '14 duas',
    habits: state.habits.length ? `${state.habits.filter((h) => state.days[key]?.habits?.includes(h.id)).length} of ${state.habits.length} today` : 'Start small',
    lists: state.lists.length ? `${state.lists.length} ${state.lists.length === 1 ? 'list' : 'lists'}` : 'Make one',
  };
  return (
    <div className="screen">
      <header className="hello">
        <p className="eyebrow">More</p>
        <h1 className="display">Every corner of your life</h1>
        <p className="lede">Everything in its place, so your mind doesn’t have to hold it.</p>
      </header>
      <div className="rooms">
        {ROOMS.map((r) => (
          <button key={r.id} type="button" className={`room tone-${r.tone}`} onClick={() => go(r.id)}>
            <span className="room-icon"><Icon name={r.icon} size={22} /></span>
            <strong>{r.title}</strong>
            <span className="room-hint">{badges[r.id] ?? r.hint}</span>
          </button>
        ))}
        <button type="button" className="room tone-lilac" onClick={openSettings}>
          <span className="room-icon"><Icon name="gear" size={22} /></span>
          <strong>Settings</strong>
          <span className="room-hint">Themes, adhan, PIN</span>
        </button>
      </div>
    </div>
  );
}

/** Header for screens opened from More, with a way back. */
export function SubHeader({ eyebrow, title, lede, back }: { eyebrow: string; title: ReactNode; lede?: ReactNode; back: () => void }) {
  return (
    <header className="hello">
      <button type="button" className="back" onClick={back}><Icon name="back" size={18} /> More</button>
      <p className="eyebrow">{eyebrow}</p>
      <h1 className="display">{title}</h1>
      {lede && <p className="lede">{lede}</p>}
    </header>
  );
}
