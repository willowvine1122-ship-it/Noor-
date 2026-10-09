import { useState } from 'react';
import { useStore } from '../lib/store';
import { useDiscover, type Story } from '../lib/discover';
import { Card, Chip, Empty, Icon, SectionTitle, tap } from '../components/ui';
import { SubHeader } from './More';

type View = 'today' | 'saved';

const ago = (t?: number) => {
  if (!t) return '';
  const h = Math.round((Date.now() - t) / 3600000);
  return h < 1 ? 'just now' : h < 24 ? `${h}h ago` : `${Math.round(h / 24)}d ago`;
};

export function Discover({ back }: { back: () => void }) {
  const { state } = useStore();
  const { data, state: net, refresh } = useDiscover();
  const [view, setView] = useState<View>('today');

  return (
    <div className="screen">
      <SubHeader back={back} eyebrow="Discover" title="What the world learned" lede="Big science and tech breakthroughs, and only the world news that truly matters. No noise." />

      <div className="row between">
        <div className="chips">
          <Chip active={view === 'today'} onClick={() => setView('today')}>Today</Chip>
          <Chip active={view === 'saved'} onClick={() => setView('saved')}>Saved · {state.savedStories.length}</Chip>
        </div>
        <button type="button" className="link" onClick={refresh} disabled={net === 'loading'}>{net === 'loading' ? 'Loading…' : 'Refresh'}</button>
      </div>

      {view === 'saved' ? (
        state.savedStories.length ? (
          <Card><ul className="stories">{state.savedStories.map((s) => <StoryRow key={s.id} s={{ ...s, at: undefined }} />)}</ul></Card>
        ) : <Empty>Tap the bookmark on any story to read it later.</Empty>
      ) : !data ? (
        <Empty>{net === 'offline' ? 'Discover needs the internet. Connect and tap Refresh.' : 'Gathering today’s discoveries…'}</Empty>
      ) : (
        <>
          {net === 'offline' && <p className="muted small">You’re offline. Showing what Noor found earlier.</p>}

          {data.space && (
            <a className="card space" href={data.space.url} target="_blank" rel="noreferrer">
              {data.space.image && <img src={data.space.image} alt="" loading="lazy" />}
              <div className="space-text">
                <p className="eyebrow">NASA · Space picture of the day</p>
                <h3>{data.space.title}</h3>
                <p className="small">{data.space.text.split('. ').slice(0, 2).join('. ')}.</p>
              </div>
            </a>
          )}

          {data.science.length > 0 && (
            <Card tone="sage">
              <SectionTitle>Science breakthroughs</SectionTitle>
              <ul className="stories">{data.science.map((s) => <StoryRow key={s.id} s={s} />)}</ul>
            </Card>
          )}

          {data.tech.length > 0 && (
            <Card tone="sky">
              <SectionTitle>Tech everyone’s talking about</SectionTitle>
              <ul className="stories">{data.tech.map((s) => <StoryRow key={s.id} s={s} />)}</ul>
            </Card>
          )}

          {data.world.length > 0 && (
            <Card tone="gold">
              <SectionTitle>Only the important news</SectionTitle>
              <p className="muted small">The few stories Wikipedia’s editors chose as truly significant.</p>
              <ul className="stories">{data.world.map((s) => <StoryRow key={s.id} s={s} />)}</ul>
            </Card>
          )}

          {data.fact && (
            <a className="card tone-lilac fact" href={data.fact.url} target="_blank" rel="noreferrer">
              <p className="eyebrow">Learn something deep · today’s featured article</p>
              <h3>{data.fact.title}</h3>
              <p className="small">{data.fact.text.slice(0, 260)}{data.fact.text.length > 260 ? '…' : ''}</p>
            </a>
          )}

          {data.onThisDay.length > 0 && (
            <Card>
              <SectionTitle>On this day</SectionTitle>
              <ul className="otd">
                {data.onThisDay.map((e) => (
                  <li key={e.year + e.text}><strong>{e.year}</strong><span>{e.text}</span></li>
                ))}
              </ul>
            </Card>
          )}

          <p className="muted small center">Updated {new Date(data.at).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}. Sources: NASA, Hacker News, Wikipedia.</p>
        </>
      )}
    </div>
  );
}

function StoryRow({ s }: { s: Story }) {
  const { state, update } = useStore();
  const saved = state.savedStories.some((x) => x.id === s.id);
  return (
    <li className="story">
      <a href={s.url} target="_blank" rel="noreferrer">
        <strong>{s.title}</strong>
        <span className="muted small">{s.source}{s.at ? ` · ${ago(s.at)}` : ''}</span>
      </a>
      <button type="button" className={`icon-btn bookmark ${saved ? 'on' : ''}`} aria-label={saved ? 'Remove from saved' : 'Save for later'} onClick={() => {
        tap();
        update((st) => {
          st.savedStories = saved ? st.savedStories.filter((x) => x.id !== s.id) : [{ id: s.id, title: s.title, url: s.url, source: s.source, at: new Date().toISOString() }, ...st.savedStories];
        });
      }}><Icon name="bookmark" size={18} /></button>
    </li>
  );
}
