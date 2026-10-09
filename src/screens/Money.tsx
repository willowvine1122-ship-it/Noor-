import { useState } from 'react';
import { uid, useStore, type State, type Tx } from '../lib/store';
import { EXPENSE_CATS, INCOME_CATS } from '../lib/content2';
import { dateKey } from '../lib/time';
import { Card, Chip, Empty, Icon, SectionTitle, Sheet, tap } from '../components/ui';
import { SubHeader } from './More';

export const rs = (n: number) => `Rs ${Math.round(n).toLocaleString('en-PK')}`;
export const monthKey = (d: Date) => dateKey(d).slice(0, 7);

export function spentIn(state: State, month: string, cat?: string) {
  return state.money.tx
    .filter((t) => t.type === 'expense' && t.date.startsWith(month) && (!cat || t.cat === cat))
    .reduce((a, t) => a + t.amount, 0);
}

const CAT_TONE: Record<string, string> = {
  Food: 'rose', Transport: 'sky', Family: 'sage', Bills: 'gold', Shopping: 'lilac', Health: 'sage',
  'Self-care': 'rose', Sadaqah: 'gold', Lotus: 'sky', Other: 'lilac', Salary: 'sage', Gift: 'rose',
};

export function Money({ back }: { back: () => void }) {
  const { state, update } = useStore();
  const [month, setMonth] = useState(() => monthKey(new Date()));
  const [adding, setAdding] = useState<Tx['type'] | null>(null);
  const [budgetCat, setBudgetCat] = useState<string | null>(null);

  const [y, m] = month.split('-').map(Number);
  const shift = (n: number) => setMonth(monthKey(new Date(y, m - 1 + n, 1)));
  const label = new Date(y, m - 1, 1).toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  const isThisMonth = month === monthKey(new Date());

  const txs = state.money.tx.filter((t) => t.date.startsWith(month)).sort((a, b) => b.date.localeCompare(a.date) || b.id.localeCompare(a.id));
  const income = txs.filter((t) => t.type === 'income').reduce((a, t) => a + t.amount, 0);
  const spent = txs.filter((t) => t.type === 'expense').reduce((a, t) => a + t.amount, 0);
  const totalBudget = Object.values(state.money.budgets).reduce((a, b) => a + b, 0);
  const left = (totalBudget || income) - spent;
  const daysInMonth = new Date(y, m, 0).getDate();
  const daysLeft = isThisMonth ? daysInMonth - new Date().getDate() + 1 : 0;
  const cats = EXPENSE_CATS.filter((c) => state.money.budgets[c] || spentIn(state, month, c));

  return (
    <div className="screen">
      <SubHeader back={back} eyebrow="Money" title="Your money, calmly" lede="Know where every rupee goes. No guilt, just clarity." />

      <div className="month-nav">
        <button type="button" className="icon-btn" aria-label="Previous month" onClick={() => shift(-1)}><Icon name="back" size={18} /></button>
        <strong>{label}</strong>
        <button type="button" className="icon-btn" aria-label="Next month" onClick={() => shift(1)} disabled={isThisMonth}><Icon name="chevron" size={18} /></button>
      </div>

      <Card className="money-hero">
        <p className="eyebrow">{totalBudget ? 'Left in your budget' : income ? 'Left from income' : 'Spent this month'}</p>
        <p className={`money-big ${left < 0 ? 'over' : ''}`}>{totalBudget || income ? rs(left) : rs(spent)}</p>
        {isThisMonth && (totalBudget || income) > 0 && left > 0 && <p className="muted small">About {rs(left / daysLeft)} a day for the next {daysLeft} days</p>}
        {left < 0 && <p className="muted small">Over by {rs(-left)}. It happens. Next month, start with the budget.</p>}
        <div className="money-split">
          <span><small>In</small>{rs(income)}</span>
          <span><small>Out</small>{rs(spent)}</span>
          <span><small>Budget</small>{totalBudget ? rs(totalBudget) : '–'}</span>
        </div>
      </Card>

      <div className="grid2">
        <button type="button" className="btn btn-solid" onClick={() => { tap(); setAdding('expense'); }}><Icon name="plus" size={18} /> Spent</button>
        <button type="button" className="btn btn-soft" onClick={() => { tap(); setAdding('income'); }}><Icon name="plus" size={18} /> Received</button>
      </div>

      <Card>
        <SectionTitle action={<button type="button" className="link" onClick={() => setBudgetCat(EXPENSE_CATS[0])}>Set budgets</button>}>Where it went</SectionTitle>
        {!cats.length && <Empty>Set a monthly budget for food, bills and the rest, then log what you spend. Noor keeps the maths.</Empty>}
        <div className="stack tight">
          {cats.map((c) => {
            const s = spentIn(state, month, c);
            const b = state.money.budgets[c];
            return (
              <button key={c} type="button" className="budget-row" onClick={() => setBudgetCat(c)}>
                <span className="row between">
                  <span><span className={`dot tone-${CAT_TONE[c]}`} /> {c}</span>
                  <span className="muted small">{rs(s)}{b ? ` of ${rs(b)}` : ''}</span>
                </span>
                {b ? <span className={`bar ${s > b ? 'over' : ''}`}><span style={{ ['--p' as string]: Math.min(1, s / b) }} /></span> : null}
              </button>
            );
          })}
        </div>
      </Card>

      <Card>
        <SectionTitle>{isThisMonth ? 'This month' : label}</SectionTitle>
        {!txs.length && <Empty>Nothing logged yet.</Empty>}
        <ul className="tx-list">
          {txs.map((t) => (
            <li key={t.id}>
              <span className={`tx-icon tone-${CAT_TONE[t.cat] ?? 'sage'}`}>{t.cat.slice(0, 1)}</span>
              <span className="grow">
                <strong>{t.note || t.cat}</strong>
                <span className="muted small">{t.note ? `${t.cat} · ` : ''}{new Date(t.date + 'T12:00').toLocaleDateString('en-US', { day: 'numeric', month: 'short' })}</span>
              </span>
              <span className={`tx-amt ${t.type}`}>{t.type === 'income' ? '+' : '−'}{rs(t.amount)}</span>
              <button type="button" className="icon-btn" aria-label="Delete" onClick={() => confirm('Delete this entry?') && update((s) => { s.money.tx = s.money.tx.filter((x) => x.id !== t.id); })}><Icon name="x" size={16} /></button>
            </li>
          ))}
        </ul>
      </Card>

      <Sheet open={!!adding} onClose={() => setAdding(null)} title={adding === 'income' ? 'Money received' : 'Money spent'}>
        {adding && <TxForm type={adding} onDone={(t) => {
          update((s) => { s.money.tx.push(t); });
          setMonth(monthKey(new Date(t.date + 'T12:00')));
          tap();
          setAdding(null);
        }} />}
      </Sheet>

      <Sheet open={!!budgetCat} onClose={() => setBudgetCat(null)} title="Monthly budgets">
        <p className="muted small">How much do you want to spend each month? Leave empty for no limit.</p>
        <div className="stack tight">
          {EXPENSE_CATS.map((c) => (
            <label key={c} className="budget-edit">
              <span><span className={`dot tone-${CAT_TONE[c]}`} /> {c}</span>
              <input inputMode="numeric" placeholder="Rs" autoFocus={c === budgetCat} value={state.money.budgets[c] ?? ''} onChange={(e) => {
                const v = Number(e.target.value.replace(/[^\d]/g, ''));
                update((s) => { if (v) s.money.budgets[c] = v; else delete s.money.budgets[c]; });
              }} />
            </label>
          ))}
        </div>
        <button type="button" className="btn btn-solid" onClick={() => setBudgetCat(null)}>Done</button>
      </Sheet>
    </div>
  );
}

function TxForm({ type, onDone }: { type: Tx['type']; onDone: (t: Tx) => void }) {
  const cats = type === 'income' ? INCOME_CATS : EXPENSE_CATS;
  const [amount, setAmount] = useState('');
  const [cat, setCat] = useState(cats[0]);
  const [note, setNote] = useState('');
  const [date, setDate] = useState(() => dateKey(new Date()));
  const n = Number(amount.replace(/[^\d.]/g, ''));
  return (
    <div className="stack">
      <label className="amount-input">
        <span>Rs</span>
        <input inputMode="decimal" autoFocus value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="0" />
      </label>
      <div className="chips wrap">
        {cats.map((c) => <Chip key={c} active={cat === c} onClick={() => setCat(c)}>{c}</Chip>)}
      </div>
      <input value={note} onChange={(e) => setNote(e.target.value)} placeholder={type === 'income' ? 'From… (optional)' : 'What was it? (optional)'} />
      <label className="field">Date<input type="date" value={date} max={dateKey(new Date())} onChange={(e) => setDate(e.target.value || dateKey(new Date()))} /></label>
      <button type="button" className="btn btn-solid" disabled={!n} onClick={() => onDone({ id: uid(), date, amount: n, type, cat, note: note.trim() || undefined })}>
        Save {n ? rs(n) : ''}
      </button>
    </div>
  );
}
