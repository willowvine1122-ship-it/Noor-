import { describe, weatherTip, type Weather } from '../lib/weather';
import { Icon, type IconName } from './ui';

const skyIcon = (sky: ReturnType<typeof describe>['sky']): IconName =>
  sky === 'clear' ? 'sun' : sky === 'night' ? 'moon' : sky === 'rain' || sky === 'storm' ? 'drop' : 'cloud';

export function WeatherChip({ w }: { w?: Weather }) {
  if (!w) return null;
  const d = describe(w.code, w.isDay);
  return <span className="wx-chip"><Icon name={skyIcon(d.sky)} size={15} /> {w.temp}° Karachi</span>;
}

export function WeatherCard({ w }: { w?: Weather }) {
  if (!w) return null;
  const d = describe(w.code, w.isDay);
  const updated = new Date(w.at).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
  return (
    <section className={`card wx sky-${d.sky}`}>
      <div className="wx-top">
        <div>
          <p className="eyebrow dark">Karachi now</p>
          <p className="wx-temp">{w.temp}°</p>
          <p className="wx-label">{d.label} · feels {w.feels}°</p>
        </div>
        <span className="wx-icon"><Icon name={skyIcon(d.sky)} size={40} stroke={1.3} /></span>
      </div>
      <p className="wx-tip">{weatherTip(w)}</p>
      <div className="wx-days">
        {w.days.slice(1, 4).map((x) => {
          const dd = describe(x.code);
          return (
            <span key={x.date}>
              <small>{new Date(x.date + 'T12:00').toLocaleDateString('en-US', { weekday: 'short' })}</small>
              <Icon name={skyIcon(dd.sky)} size={18} />
              <b>{x.max}°</b><small>{x.min}°</small>
            </span>
          );
        })}
      </div>
      <p className="wx-meta">High {w.max}° · low {w.min}° · humidity {w.humidity}% · updated {updated}</p>
    </section>
  );
}
