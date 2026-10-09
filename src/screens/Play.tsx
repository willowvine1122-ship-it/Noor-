import { useEffect, useMemo, useState } from 'react';
import type React from 'react';
import { useStore } from '../lib/store';
import { JAR, MATCH_SYMBOLS, QUIZ, type JarCard, type Question } from '../lib/play';
import { Card, Icon, SectionTitle, tap } from '../components/ui';

function shuffle<T>(xs: T[]): T[] {
  const a = [...xs];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

type Game = 'jar' | 'quiz' | 'match';

export function Play({ back }: { back?: () => void }) {
  const [game, setGame] = useState<Game>('jar');
  return (
    <div className="screen">
      <header className="hello">
        {back && <button type="button" className="back" onClick={back}><Icon name="back" size={18} /> More</button>}
        <p className="eyebrow">Play</p>
        <h1 className="display">Bored? Good.</h1>
        <p className="lede">Something small and fun instead of scrolling.</p>
      </header>
      <div className="seg">
        <button type="button" className={game === 'jar' ? 'on' : ''} onClick={() => setGame('jar')}>Boredom jar</button>
        <button type="button" className={game === 'quiz' ? 'on' : ''} onClick={() => setGame('quiz')}>Quiz</button>
        <button type="button" className={game === 'match' ? 'on' : ''} onClick={() => setGame('match')}>Match</button>
      </div>
      {game === 'jar' && <Jar />}
      {game === 'quiz' && <Quiz />}
      {game === 'match' && <Match />}
    </div>
  );
}

const KIND_TONE: Record<JarCard['kind'], string> = {
  Challenge: 'gold', Create: 'sky', Kindness: 'rose', Silly: 'lilac', Calm: 'sage', Think: 'sky',
};

function Jar() {
  const { state, update } = useStore();
  const deck = useMemo(() => shuffle(JAR), []);
  const [i, setI] = useState(-1);
  const [shake, setShake] = useState(0);
  const card = i >= 0 ? deck[i % deck.length] : null;

  const draw = () => {
    tap();
    setShake((s) => s + 1);
    setTimeout(() => setI((x) => x + 1), 380);
  };

  return (
    <>
      <Card className="jar-card">
        <button type="button" className="jar" onClick={draw} aria-label="Pick a card from the jar">
          <span key={shake} className={`jar-body ${shake ? 'shake' : ''}`}>
            <svg viewBox="0 0 120 140" width="132" height="154" aria-hidden="true">
              <rect x="34" y="6" width="52" height="14" rx="5" fill="var(--gold)" opacity=".85" />
              <path d="M30 22h60c6 0 10 5 10 11v84c0 10-8 17-18 17H38c-10 0-18-7-18-17V33c0-6 4-11 10-11Z" fill="var(--surface-2)" stroke="var(--line)" strokeWidth="2" />
              {[['var(--rose)', 44, 104, -12], ['var(--sage)', 66, 108, 8], ['var(--sky)', 54, 88, 20], ['var(--gold)', 74, 86, -6], ['var(--lilac)', 42, 74, 14], ['var(--rose)', 70, 66, -18], ['var(--sage)', 56, 56, 4]].map(([c, x, y, r], k) => (
                <rect key={k} x={Number(x) - 10} y={Number(y) - 6} width="20" height="12" rx="3" fill={String(c)} opacity=".8" transform={`rotate(${r} ${x} ${y})`} />
              ))}
            </svg>
          </span>
          <span className="jar-hint">{card ? 'Tap the jar for another' : 'Tap the jar'}</span>
        </button>
      </Card>
      {card && (
        <Card key={i} tone={KIND_TONE[card.kind]} className="pop-in">
          <p className="eyebrow">{card.kind}</p>
          <p className="act-text">{card.text}</p>
          <button type="button" className="btn btn-soft" onClick={() => { tap(); update((s) => { s.play.jarDone += 1; }); draw(); }}>
            Did it! Next one
          </button>
        </Card>
      )}
      <p className="muted small center">{state.play.jarDone ? `${state.play.jarDone} jar card${state.play.jarDone > 1 ? 's' : ''} done so far` : 'Every card you finish is counted here.'}</p>
    </>
  );
}

function Quiz() {
  const { state, update } = useStore();
  const [round, setRound] = useState(0);
  const questions = useMemo<Question[]>(() => shuffle(QUIZ).slice(0, 8), [round]);
  const [n, setN] = useState(0);
  const [picked, setPicked] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const done = n >= questions.length;
  const q = questions[n];

  useEffect(() => {
    if (done && score > state.play.quizBest) update((s) => { s.play.quizBest = score; });
  }, [done, score, state.play.quizBest, update]);

  const choose = (k: number) => {
    if (picked !== null) return;
    tap();
    setPicked(k);
    if (k === q.answer) setScore((s) => s + 1);
  };

  if (done) {
    return (
      <Card tone="gold" className="pop-in center-col">
        <p className="eyebrow">Round complete</p>
        <p className="quiz-score">{score}<small>/ {questions.length}</small></p>
        <p className="muted">{score === questions.length ? 'MashaAllah, perfect!' : score >= 6 ? 'Really good. Alhamdulillah.' : 'Every question teaches you something.'}</p>
        <p className="muted small">Best: {Math.max(score, state.play.quizBest)} / 8</p>
        <button type="button" className="btn btn-solid" onClick={() => { setRound((r) => r + 1); setN(0); setScore(0); setPicked(null); }}>Play again</button>
      </Card>
    );
  }

  return (
    <Card key={`${round}-${n}`} className="pop-in">
      <SectionTitle action={<span className="muted small">{n + 1} of {questions.length} · score {score}</span>}>Quiz</SectionTitle>
      <div className="bar"><span style={{ '--p': n / questions.length } as React.CSSProperties} /></div>
      <p className="quiz-q">{q.q}</p>
      <div className="stack tight">
        {q.options.map((o, k) => {
          const state = picked === null ? '' : k === q.answer ? 'right' : k === picked ? 'wrong' : 'dim';
          return (
            <button key={o} type="button" className={`answer ${state}`} onClick={() => choose(k)}>
              <span>{o}</span>
              {state === 'right' && <Icon name="check" size={18} stroke={2.4} />}
              {state === 'wrong' && <Icon name="x" size={18} stroke={2.4} />}
            </button>
          );
        })}
      </div>
      {picked !== null && (
        <>
          {q.note && <p className="note">{q.note}</p>}
          <button type="button" className="btn btn-solid" onClick={() => { setN((x) => x + 1); setPicked(null); }}>{n + 1 === questions.length ? 'See my score' : 'Next question'}</button>
        </>
      )}
    </Card>
  );
}

function Match() {
  const { state, update } = useStore();
  const [seed, setSeed] = useState(0);
  const cards = useMemo(() => shuffle([...MATCH_SYMBOLS, ...MATCH_SYMBOLS]).map((s, id) => ({ id, s })), [seed]);
  const [open, setOpen] = useState<number[]>([]);
  const [found, setFound] = useState<string[]>([]);
  const [moves, setMoves] = useState(0);
  const won = found.length === MATCH_SYMBOLS.length;

  useEffect(() => {
    if (open.length !== 2) return;
    const [a, b] = open.map((i) => cards[i]);
    const t = setTimeout(() => {
      if (a.s === b.s) {
        setFound((f) => [...f, a.s]);
        try { navigator.vibrate?.(20); } catch { /* no haptics */ }
      }
      setOpen([]);
    }, a.s === b.s ? 250 : 750);
    return () => clearTimeout(t);
  }, [open, cards]);

  useEffect(() => {
    if (won && (!state.play.matchBest || moves < state.play.matchBest)) update((s) => { s.play.matchBest = moves; });
  }, [won, moves, state.play.matchBest, update]);

  const flip = (i: number) => {
    if (open.length === 2 || open.includes(i) || found.includes(cards[i].s)) return;
    tap();
    const next = [...open, i];
    setOpen(next);
    if (next.length === 2) setMoves((m) => m + 1);
  };

  return (
    <Card>
      <SectionTitle action={<span className="muted small">{moves} moves{state.play.matchBest ? ` · best ${state.play.matchBest}` : ''}</span>}>Find the pairs</SectionTitle>
      <div className="match">
        {cards.map((c, i) => {
          const up = open.includes(i) || found.includes(c.s);
          return (
            <button key={`${seed}-${c.id}`} type="button" className={`mcard ${up ? 'up' : ''} ${found.includes(c.s) ? 'found' : ''}`} onClick={() => flip(i)} aria-label={up ? c.s : 'Hidden card'}>
              <span className="mcard-inner">
                <span className="mcard-back" />
                <span className="mcard-front">{c.s}</span>
              </span>
            </button>
          );
        })}
      </div>
      {won && <p className="note center">All pairs in {moves} moves. {state.play.matchBest === moves ? 'A new best!' : 'Nicely done.'}</p>}
      <button type="button" className="btn btn-ghost" onClick={() => { setSeed((s) => s + 1); setOpen([]); setFound([]); setMoves(0); }}>{won ? 'Play again' : 'Shuffle'}</button>
    </Card>
  );
}
