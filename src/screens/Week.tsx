import { useState } from 'react';
import { inCycle, readDay, uid, useStore } from '../lib/store';
import { useToday } from '../lib/hooks';
import { addDays, dateKey, PRAYER_ORDER } from '../lib/time';
import { Card, SectionTitle, tap } from '../components/ui';
import { MOODS, MoodFace } from './Today';
import { rs } from './Money';
import { SubHeader } from './More';

export function Week({ back }: { back: () => void }) {
  const { state, update } = useStore();
  const { day, now } = useToday(60000);
  const [well, setWell] = useState('');
  const [next, setNext] = useState('');
  const [saved, setSaved] = useState(false);

  const days = Array.from({ length: 7 }, (_, i) => addDays(day, i - 6)).map((d) => {
    const k = dateKey(d);
    const log = readDay(state, k);
    const rest = inCycle(state, k);
    const prayed = PRAYER_ORDER.filter((p) => log.prayers[p] && log.prayers[p] !== 'missed').length;
    const ontime = PRAYER_ORDER.filter((p) => log.prayers[p] === 'ontime').length;
    return { d, k, log, rest, prayed, ontime };
  });

  const prayerDays = days.filter((x) => !x.rest);
  const prayed = prayerDays.reduce((a, x) => a + x.prayed, 0);
  const possible = prayerDays.length * 5;
  const ontime = prayerDays.reduce((a, x) => a + x.ontime, 0);
  const quran = days.reduce((a, x) => a + x.log.quranPages, 0);
  const meals = days.reduce((a, x) => a + x.log.meals.filter(Boolean).length, 0);
  const water = days.reduce((a, x) => a + x.log.water, 0);
  const moods = days.filter((x) => x.log.mood).map((x) => x.log.mood!);
  const avgMood = moods.length ? Math.round(moods.reduce((a, b) => a + b, 0) / moods.length) : undefined;

  const from = dateKey(days[0].d);
  const spent = state.money.tx.filter((t) => t.type === 'expense' && t.date >= from).reduce((a, t) => a + t.amount, 0);
  const weekAgo = addDays(now, -7);
  const focus = state.focus.filter((f) => new Date(f.at) >= weekAgo).reduce((a, f) => a + f.minutes, 0);
  const pages = state.journal.filter((j) => new Date(j.at) >= weekAgo).length;
  const english = days.filter((x) => { const e = state.english.days[x.k]; return e && (e.word || e.phrase || e.spoke); }).length;

  const pct = possible ? prayed / possible : 1;
  const headline = pct >= 0.9 ? 'A beautiful week with your Rabb.'
    : pct >= 0.6 ? 'A steady week. Keep building.'
    : possible ? 'A hard week. Next week starts with one prayer on time.' : 'A week of rest. Your dhikr still counted.';

  const isSunday = now.getDay() === 0;

  return (
    <div className="screen">
      <SubHeader back={back} eyebrow={isSunday ? 'Sunday review' : 'Last 7 days'} title={headline} lede="Look back with kindness, then choose one thing for next week." />

      <Card tone="sage">
        <SectionTitle action={<span className="muted small">{possible ? `${prayed} of ${possible}` : 'Rest days'}</span>}>Salah</SectionTitle>
        <div className="week-bars">
          {days.map((x) => (
            <div key={x.k} className={`wb ${x.rest ? 'rest' : ''}`}>
              <div className="wb-track"><span style={{ ['--p' as string]: x.rest ? 1 : x.prayed / 5 }} /></div>
              <small>{x.d.toLocaleDateString('en-US', { weekday: 'narrow' })}</small>
            </div>
          ))}
        </div>
        <p className="muted small">{ontime} on time{days.some((x) => x.rest) ? ' · rose bars are rest days' : ''}</p>
      </Card>

      <div className="grid2">
        <Card tone="gold"><p className="eyebrow">Quran</p><p className="stat">{quran}<small> pages</small></p></Card>
        <Card tone="rose"><p className="eyebrow">Meals</p><p className="stat">{meals}<small> of 21</small></p></Card>
        <Card tone="sky"><p className="eyebrow">Water</p><p className="stat">{(water / 7).toFixed(1)}<small> glasses a day</small></p></Card>
        <Card tone="lilac">
          <p className="eyebrow">Mood</p>
          {avgMood ? <p className={`stat mood-${avgMood} active`}><MoodFace path={MOODS[avgMood - 1].face} size={26} /> <small>{MOODS[avgMood - 1].label}</small></p> : <p className="muted small">Log your mood on Today</p>}
        </Card>
        <Card><p className="eyebrow">Spent</p><p className="stat small-stat">{rs(spent)}</p></Card>
        <Card><p className="eyebrow">Focus</p><p className="stat">{focus}<small> min</small></p></Card>
        <Card><p className="eyebrow">Diary</p><p className="stat">{pages}<small> {pages === 1 ? 'page' : 'pages'}</small></p></Card>
        <Card><p className="eyebrow">English</p><p className="stat">{english}<small> of 7 days</small></p></Card>
      </div>

      <Card>
        <SectionTitle>Reflect</SectionTitle>
        <label className="field">What went well this week?<textarea value={well} onChange={(e) => setWell(e.target.value)} rows={3} /></label>
        <label className="field">One thing I’ll do differently next week<textarea value={next} onChange={(e) => setNext(e.target.value)} rows={2} /></label>
        <button type="button" className="btn btn-solid" disabled={!well.trim() && !next.trim()} onClick={() => {
          tap();
          update((s) => { s.journal.unshift({ id: uid(), at: new Date().toISOString(), prompt: 'Weekly review', text: `What went well: ${well.trim()}\n\nNext week: ${next.trim()}` }); });
          setWell(''); setNext(''); setSaved(true);
        }}>Save to my diary</button>
        {saved && <p className="muted small">Saved. May next week be even better.</p>}
      </Card>
    </div>
  );
}
