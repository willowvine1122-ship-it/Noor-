import { useState } from 'react';
import { useToday } from '../lib/hooks';
import { dayOf, nextPeriodPrediction, uid, useStore, type Energy, type Mood } from '../lib/store';
import { nextBestAction, rhythm } from '../lib/coach';
import { ACTS_OF_LOVE, TASBIHAT } from '../lib/content';
import { daysBetween, daysUntilBirthday, fmtCountdown, fmtTime, greetingFor, hijri, longDate, PRAYER_NAMES } from '../lib/time';
import { Card, Icon, Ring, SectionTitle, tap } from '../components/ui';
import { PrayerPills, PrayerSheet } from '../components/prayer';
import type { Tab } from '../App';
import { useWeather } from '../lib/weather';
import { WeatherCard, WeatherChip } from '../components/Weather';
import { WORDS } from '../lib/content2';
import { englishIndex, speak } from './English';

export const MOODS: { v: Mood; label: string; face: string }[] = [
  { v: 1, label: 'Heavy', face: 'M8 16c1-1.3 2.4-2 4-2s3 .7 4 2' },
  { v: 2, label: 'Low', face: 'M8.5 15.5c1-.6 2.2-.9 3.5-.9s2.5.3 3.5.9' },
  { v: 3, label: 'Okay', face: 'M8.5 15h7' },
  { v: 4, label: 'Good', face: 'M8.5 14.5c1 .8 2.2 1.2 3.5 1.2s2.5-.4 3.5-1.2' },
  { v: 5, label: 'Light', face: 'M8 14c1 1.6 2.4 2.4 4 2.4s3-.8 4-2.4' },
];

export function MoodFace({ path, size = 30 }: { path: string; size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round">
      <circle cx="12" cy="12" r="9" />
      <circle cx="9" cy="10" r=".6" fill="currentColor" />
      <circle cx="15" cy="10" r=".6" fill="currentColor" />
      <path d={path} />
    </svg>
  );
}

export function Today({ go }: { go: (t: Tab) => void }) {
  const { state, update } = useStore();
  const { now, day, key, prayers, nextPrayer, current, log, cycle } = useToday();
  const [prayerOpen, setPrayerOpen] = useState(false);
  const [showRhythm, setShowRhythm] = useState(false);
  const [taskText, setTaskText] = useState('');

  const partner = state.people.find((p) => p.partner)?.name;
  const nudge = nextBestAction(now, day, prayers, log, cycle, log.energy === 'low', partner);
  const items = rhythm(day, prayers, partner);
  const nowIdx = items.findIndex((i) => i.at > now);
  const tasbihTotal = TASBIHAT.reduce((a, t) => a + Math.min(log.tasbih[t.id] ?? 0, state.tasbihTargets[t.id] ?? t.target), 0);
  const tasbihGoal = TASBIHAT.reduce((a, t) => a + (state.tasbihTargets[t.id] ?? t.target), 0);
  const act = ACTS_OF_LOVE[daysBetween(new Date(2026, 0, 1), day) % ACTS_OF_LOVE.length];
  const birthdays = state.people
    .filter((p) => p.birthday)
    .map((p) => ({ p, in: daysUntilBirthday(p.birthday!, new Date(now.getFullYear(), now.getMonth(), now.getDate())) }))
    .filter((x) => x.in <= 14)
    .sort((a, b) => a.in - b.in);
  const prediction = nextPeriodPrediction(state);
  const periodSoon = !cycle && prediction && Math.abs(daysBetween(now, prediction)) <= 2;

  const mut = (fn: (d: ReturnType<typeof dayOf>) => void) => update((s) => fn(dayOf(s, key)));

  const runAction = () => {
    tap();
    switch (nudge.action) {
      case 'pray':
        setPrayerOpen(true);
        break;
      case 'meal':
        go('me');
        break;
      case 'quran':
      case 'tasbih':
        go('deen');
        break;
      case 'water':
        mut((d) => { d.water = Math.min(12, d.water + 1); });
        break;
    }
  };

  const toGo = nextPrayer.start.getTime() - now.getTime();
  const weather = useWeather();
  const word = WORDS[englishIndex(day) % WORDS.length];
  const wordDone = !!state.english.days[key]?.word;

  return (
    <div className="screen">
      <header className="hello">
        <div>
          <p className="eyebrow">{longDate(now)} · {hijri(now)}</p>
          <h1 className="display">{greetingFor(now)}{state.name ? `, ${state.name}` : ''}</h1>
          <WeatherChip w={weather} />
        </div>
      </header>

      {now.getDay() === 0 && (
        <button type="button" className="banner banner-gold" onClick={() => go('week')}>
          <Icon name="chart" size={18} /> It’s Sunday. Take two minutes to look back at your week. <Icon name="chevron" size={16} />
        </button>
      )}

      {cycle && (
        <div className="banner banner-rose">
          <Icon name="heart" size={18} /> Rest days. Your prayers are excused; your dhikr still reaches Him.
        </div>
      )}
      {periodSoon && (
        <button type="button" className="banner banner-rose" onClick={() => go('me')}>
          <Icon name="calendar" size={18} /> Your rest days may begin around now. Tap to mark them when they do.
        </button>
      )}

      <Card className={`hero grad-${current && !cycle && !log.prayers[current.id] ? current.id : nextPrayer.id}`}>
        <div className="hero-top">
          <div>
            <p className="eyebrow dark">{current && !cycle && !log.prayers[current.id] ? 'Now' : cycle ? 'Next adhan · a moment for dhikr' : 'Next prayer'}</p>
            <h2 className="hero-name">
              {current && !cycle && !log.prayers[current.id] ? PRAYER_NAMES[current.id].en : PRAYER_NAMES[nextPrayer.id].en}
            </h2>
          </div>
          <span className="hero-ar">{current && !cycle && !log.prayers[current.id] ? PRAYER_NAMES[current.id].ar : PRAYER_NAMES[nextPrayer.id].ar}</span>
        </div>
        {current && !cycle && !log.prayers[current.id] ? (
          <>
            <p className="hero-count">ends in {fmtCountdown(current.end.getTime() - now.getTime())}</p>
            <button type="button" className="btn btn-solid hero-btn" onClick={() => { tap(); setPrayerOpen(true); }}>I’ve prayed {PRAYER_NAMES[current.id].en}</button>
          </>
        ) : (
          <p className="hero-count">at {fmtTime(nextPrayer.start)} · in {fmtCountdown(toGo)}</p>
        )}
      </Card>

      <PrayerPills prayers={prayers} statuses={log.prayers} dayKey={key} cycle={cycle} />

      <Card tone={nudge.tone} className={`nudge ${nudge.urgent ? 'urgent' : ''}`} onClick={nudge.action ? runAction : undefined}>
        <p className="eyebrow">Your one next thing</p>
        <h3 className="nudge-title">{nudge.title}</h3>
        <p className="nudge-detail">{nudge.detail}</p>
        {nudge.action && (
          <span className="nudge-cta">
            {nudge.action === 'water' ? 'Tap to log a glass' : nudge.action === 'pray' ? 'Mark it' : 'Go'} <Icon name="chevron" size={16} />
          </span>
        )}
      </Card>

      <div className="grid4">
        <button type="button" className="tile" onClick={() => go('deen')}>
          <Ring value={cycle ? 0 : Math.min(1, log.quranPages)} color="var(--gold)" size={54}><Icon name="book" size={20} /></Ring>
          <span className="tile-label">{cycle ? 'Listen' : log.quranPages ? `${log.quranPages} page${log.quranPages > 1 ? 's' : ''}` : 'Quran'}</span>
        </button>
        <button type="button" className="tile" onClick={() => go('deen')}>
          <Ring value={tasbihTotal / tasbihGoal} color="var(--sage)" size={54}><Icon name="sparkle" size={20} /></Ring>
          <span className="tile-label">{Math.round((tasbihTotal / tasbihGoal) * 100)}% dhikr</span>
        </button>
        <button type="button" className="tile" onClick={() => go('me')}>
          <Ring value={log.meals.filter(Boolean).length / 3} color="var(--rose)" size={54}><Icon name="bowl" size={20} /></Ring>
          <span className="tile-label">{log.meals.filter(Boolean).length}/3 meals</span>
        </button>
        <button type="button" className="tile" onClick={() => { tap(); mut((d) => { d.water = Math.min(12, d.water + 1); }); }}>
          <Ring value={log.water / 8} color="var(--sky)" size={54}><Icon name="drop" size={20} /></Ring>
          <span className="tile-label">{log.water}/8 water</span>
        </button>
      </div>

      <WeatherCard w={weather} />

      <Card>
        <SectionTitle>How are you, really?</SectionTitle>
        <div className="moods">
          {MOODS.map((m) => (
            <button key={m.v} type="button" className={`mood ${log.mood === m.v ? 'active' : ''} mood-${m.v}`} onClick={() => { tap(); mut((d) => { d.mood = m.v; }); }}>
              <MoodFace path={m.face} />
              <span>{m.label}</span>
            </button>
          ))}
        </div>
        <div className="seg">
          {(['low', 'okay', 'good'] as Energy[]).map((e) => (
            <button key={e} type="button" className={log.energy === e ? 'on' : ''} onClick={() => { tap(); mut((d) => { d.energy = e; }); }}>
              {e === 'low' ? 'Low energy' : e === 'okay' ? 'Okay energy' : 'Good energy'}
            </button>
          ))}
        </div>
        {log.energy === 'low' && <p className="note">Gentle mode is on. Today only asks for salah, food and water. That’s enough.</p>}
        {log.mood && log.mood <= 2 && (
          <button type="button" className="link" onClick={() => go('me')}>Things that help, without needing anyone <Icon name="chevron" size={14} /></button>
        )}
      </Card>

      <Card>
        <SectionTitle action={<span className="muted small">{log.tasks.filter((t) => t.done).length}/{log.tasks.length}</span>}>Today’s three</SectionTitle>
        <p className="muted small">Only three. What would make today feel organised?</p>
        <ul className="tasks">
          {log.tasks.map((t) => (
            <li key={t.id} className={t.done ? 'done' : ''}>
              <button type="button" className="check" aria-label={t.done ? 'Mark not done' : 'Mark done'} onClick={() => { tap(); mut((d) => { const x = d.tasks.find((y) => y.id === t.id); if (x) x.done = !x.done; }); }}>
                {t.done && <Icon name="check" size={14} stroke={2.4} />}
              </button>
              <span>{t.text}</span>
              <button type="button" className="icon-btn" aria-label="Remove" onClick={() => mut((d) => { d.tasks = d.tasks.filter((y) => y.id !== t.id); })}><Icon name="x" size={16} /></button>
            </li>
          ))}
        </ul>
        {log.tasks.length < 3 && (
          <form className="add-row" onSubmit={(e) => { e.preventDefault(); const text = taskText.trim(); if (!text) return; mut((d) => { d.tasks.push({ id: uid(), text, done: false }); }); setTaskText(''); }}>
            <input value={taskText} onChange={(e) => setTaskText(e.target.value)} placeholder={['The most important thing…', 'Something for Lotus or work…', 'Something just for you…'][log.tasks.length]} />
            <button type="submit" className="icon-btn solid" aria-label="Add"><Icon name="plus" size={18} /></button>
          </form>
        )}
      </Card>

      <Card tone="sky" className="learn" onClick={() => go('english')}>
        <p className="eyebrow">Learn one thing · English</p>
        <div className="row between">
          <h3 className="learn-word">{word.w}</h3>
          <button type="button" className="icon-btn speak" aria-label="Hear it" onClick={(e) => { e.stopPropagation(); speak(word.w, 0.75); }}><Icon name="speaker" size={18} /></button>
        </div>
        <p className="muted small">{word.means}</p>
        <span className="nudge-cta">{wordDone ? 'Learned today ✓' : 'Practise it'} <Icon name="chevron" size={16} /></span>
      </Card>

      {birthdays.map(({ p, in: n }) => (
        <Card key={p.id} tone="rose" className="bday" onClick={() => go('people')}>
          <Icon name="gift" size={22} />
          <div>
            <h3>{n === 0 ? `It’s ${p.name}’s birthday today` : `${p.name}’s birthday in ${n} day${n > 1 ? 's' : ''}`}</h3>
            <p className="muted small">{n === 0 ? 'Make dua for them and tell them they matter.' : 'Plan something small and thoughtful.'}</p>
          </div>
        </Card>
      ))}

      <Card tone="gold" className="act">
        <p className="eyebrow">An act of love for Allah</p>
        <p className="act-text">{act}</p>
        <button type="button" className={`btn ${log.acts.includes(act) ? 'btn-soft selected' : 'btn-soft'}`} onClick={() => { tap(); mut((d) => { d.acts = d.acts.includes(act) ? d.acts.filter((a) => a !== act) : [...d.acts, act]; }); }}>
          {log.acts.includes(act) ? 'Done, alhamdulillah' : 'I did this'}
        </button>
      </Card>

      <Card>
        <SectionTitle action={<button type="button" className="link" onClick={() => setShowRhythm((v) => !v)}>{showRhythm ? 'Less' : 'Full day'}</button>}>Your rhythm</SectionTitle>
        <ol className="timeline">
          {(showRhythm ? items : items.slice(Math.max(0, nowIdx - 1), Math.max(0, nowIdx - 1) + 4)).map((i) => {
            const idx = items.indexOf(i);
            const state = idx < nowIdx - 1 ? 'past' : idx === nowIdx - 1 ? 'current' : 'future';
            return (
              <li key={i.title + i.at.getTime()} className={`tl tl-${i.kind} ${state}`}>
                <span className="tl-time">{fmtTime(i.at)}</span>
                <span className="tl-dot" />
                <span className="tl-title">{i.kind === 'prayer' && cycle ? `${i.title} · dhikr moment` : i.title}</span>
              </li>
            );
          })}
        </ol>
      </Card>

      <PrayerSheet prayer={prayerOpen ? current ?? null : null} dayKey={key} current={current ? log.prayers[current.id] : undefined} onClose={() => setPrayerOpen(false)} />
    </div>
  );
}
