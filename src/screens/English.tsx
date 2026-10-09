import { useEffect, useRef, useState } from 'react';
import { useStore } from '../lib/store';
import { useToday } from '../lib/hooks';
import { PHRASES, SPEAKING, TWISTERS, WORDS } from '../lib/content2';
import { addDays, dateKey, daysBetween } from '../lib/time';
import { Card, Icon, SectionTitle, tap } from '../components/ui';
import { SubHeader } from './More';

const TIPS = [
  'Slow down by 20%. Clear beats fast, every time.',
  'Pause at commas and full stops. Silence sounds confident.',
  'Finish the last word of each sentence; don’t let it fade.',
  'Open your mouth a little wider than feels natural.',
  'Before you speak, decide your first five words.',
  'Replace “um” with a short breath.',
  'Read one paragraph out loud every day. Your mouth learns like a muscle.',
];

export function speak(text: string, rate = 0.9) {
  try {
    const synth = window.speechSynthesis;
    synth.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.lang = 'en-US';
    u.rate = rate;
    const voice = synth.getVoices().find((v) => /en-(US|GB)/.test(v.lang) && /Samantha|Karen|Daniel|Google|Female/i.test(v.name));
    if (voice) u.voice = voice;
    synth.speak(u);
  } catch { /* no speech on this device */ }
}

type Rec = { start: () => void; stop: () => void; onresult: ((e: { results: ArrayLike<ArrayLike<{ transcript: string }>> }) => void) | null; onend: (() => void) | null; lang: string; continuous: boolean; interimResults: boolean };
const Recognition = (window as unknown as { SpeechRecognition?: new () => Rec; webkitSpeechRecognition?: new () => Rec }).SpeechRecognition
  ?? (window as unknown as { webkitSpeechRecognition?: new () => Rec }).webkitSpeechRecognition;

export function englishIndex(day: Date) {
  return daysBetween(new Date(2026, 0, 1), day);
}

export function English({ back }: { back: () => void }) {
  const { state, update } = useStore();
  const { day, key } = useToday(60000);
  const i = englishIndex(day);
  const word = WORDS[i % WORDS.length];
  const phrase = PHRASES[i % PHRASES.length];
  const prompt = SPEAKING[i % SPEAKING.length];
  const twister = TWISTERS[i % TWISTERS.length];
  const tip = TIPS[i % TIPS.length];
  const today = state.english.days[key] ?? {};
  const done = [today.word, today.phrase, today.spoke].filter(Boolean).length;
  const saved = state.english.saved.includes(word.w);

  const mark = (k: 'word' | 'phrase' | 'spoke', said?: string) => {
    tap();
    update((s) => {
      const d = (s.english.days[key] ??= {});
      d[k] = k === 'spoke' ? true : !d[k];
      if (said) d.said = said;
    });
  };

  const did = (k: string) => { const x = state.english.days[k]; return !!(x && (x.word || x.phrase || x.spoke)); };
  let streak = 0;
  for (let d = did(key) ? day : addDays(day, -1); did(dateKey(d)) && streak < 999; d = addDays(d, -1)) streak++;

  return (
    <div className="screen">
      <SubHeader back={back} eyebrow="English" title="Learn one thing" lede="Five quiet minutes a day. Say everything out loud; that’s where articulation grows." />

      <div className="eng-progress">
        {['Word', 'Phrase', 'Speak'].map((l, n) => (
          <span key={l} className={[today.word, today.phrase, today.spoke][n] ? 'on' : ''}>{l}</span>
        ))}
        <small>{done === 3 ? 'All done today. Beautiful.' : streak > 1 ? `${streak}-day streak` : `${done} of 3`}</small>
      </div>

      <Card tone="sky" className="word-card">
        <p className="eyebrow">Word of the day</p>
        <div className="row between">
          <h2 className="word">{word.w}</h2>
          <button type="button" className="icon-btn speak" aria-label="Hear it" onClick={() => speak(word.w, 0.75)}><Icon name="speaker" size={20} /></button>
        </div>
        <p className="say">{word.say}</p>
        <p>{word.means}</p>
        <button type="button" className="example" onClick={() => speak(word.ex)}>“{word.ex}” <Icon name="speaker" size={14} /></button>
        <p className="muted small">Now make your own sentence with <em>{word.w}</em> and say it out loud three times.</p>
        <div className="row gap">
          <button type="button" className={`btn grow ${today.word ? 'btn-soft selected' : 'btn-solid'}`} onClick={() => mark('word')}>{today.word ? 'Said it ✓' : 'I said it out loud'}</button>
          <button type="button" className={`btn btn-ghost ${saved ? 'selected' : ''}`} aria-label="Save word" onClick={() => update((s) => {
            s.english.saved = saved ? s.english.saved.filter((w) => w !== word.w) : [word.w, ...s.english.saved];
          })}><Icon name="heart" size={18} /></button>
        </div>
      </Card>

      <Card tone="sage">
        <p className="eyebrow">Phrase for work</p>
        <button type="button" className="phrase" onClick={() => speak(phrase.p)}>{phrase.p} <Icon name="speaker" size={16} /></button>
        <p className="muted small">{phrase.use} Use it once today, in a message or a call.</p>
        <button type="button" className={`btn ${today.phrase ? 'btn-soft selected' : 'btn-soft'}`} onClick={() => mark('phrase')}>{today.phrase ? 'Used it ✓' : 'I used it today'}</button>
      </Card>

      <SpeakCard prompt={prompt} done={!!today.spoke} said={today.said} onDone={(said) => mark('spoke', said)} />

      <Card tone="lilac">
        <SectionTitle>Warm up your mouth</SectionTitle>
        <button type="button" className="phrase" onClick={() => speak(twister, 0.8)}>{twister} <Icon name="speaker" size={16} /></button>
        <p className="muted small">Say it slowly three times, then a little faster. Exaggerate every sound.</p>
      </Card>

      <Card>
        <p className="eyebrow">Today’s tip</p>
        <p className="prompt">{tip}</p>
      </Card>

      {state.english.saved.length > 0 && (
        <Card>
          <SectionTitle>My words</SectionTitle>
          <div className="chips wrap">
            {state.english.saved.map((w) => {
              const x = WORDS.find((y) => y.w === w);
              return <button key={w} type="button" className="chip" onClick={() => speak(x ? `${w}. ${x.means}` : w)}>{w}</button>;
            })}
          </div>
        </Card>
      )}
    </div>
  );
}

function SpeakCard({ prompt, done, said, onDone }: { prompt: string; done: boolean; said?: string; onDone: (said?: string) => void }) {
  const [left, setLeft] = useState<number | null>(null);
  const [text, setTextState] = useState(said ?? '');
  const textRef = useRef(text);
  const setText = (t: string) => { textRef.current = t; setTextState(t); };
  const rec = useRef<Rec | null>(null);

  useEffect(() => {
    if (left === null) return;
    if (left <= 0) { stop(); return; }
    const id = setTimeout(() => setLeft(left - 1), 1000);
    return () => clearTimeout(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [left]);

  const start = () => {
    tap();
    setText('');
    setLeft(60);
    if (!Recognition) return;
    try {
      const r = new Recognition();
      r.lang = 'en-US';
      r.continuous = true;
      r.interimResults = true;
      r.onresult = (e) => setText(Array.from(e.results).map((x) => x[0].transcript).join(' '));
      r.onend = () => { rec.current = null; };
      r.start();
      rec.current = r;
    } catch { /* microphone not allowed; the timer still works */ }
  };

  const stop = () => {
    rec.current?.stop();
    rec.current = null;
    setLeft(null);
    onDone(textRef.current || undefined);
  };

  const words = text.trim() ? text.trim().split(/\s+/).length : 0;

  return (
    <Card tone="gold">
      <p className="eyebrow">Speak for one minute</p>
      <p className="prompt">{prompt}</p>
      {left !== null ? (
        <>
          <div className="speak-timer"><span className="pulse" /> {left}s</div>
          {text && <p className="transcript">{text}</p>}
          <button type="button" className="btn btn-solid" onClick={stop}>I’m done</button>
        </>
      ) : (
        <>
          {text && <p className="transcript">{text}</p>}
          {words > 0 && <p className="muted small">{words} words. Read it back: where did you pause? Which word would you change?</p>}
          <button type="button" className={`btn ${done ? 'btn-soft selected' : 'btn-solid'}`} onClick={start}>
            <Icon name="mic" size={18} /> {done ? 'Spoke today ✓ · Go again' : 'Start the minute'}
          </button>
          <p className="muted small">{Recognition ? 'Noor writes down what you say so you can read it back. Nothing is saved anywhere else.' : 'Talk to yourself, a mirror, or a voice note. The timer keeps you going.'}</p>
        </>
      )}
    </Card>
  );
}
