import { useEffect, useState } from 'react';
import { KARACHI } from './time';

export type Weather = {
  at: number;
  temp: number;
  feels: number;
  humidity: number;
  code: number;
  isDay: boolean;
  max: number;
  min: number;
  days: { date: string; max: number; min: number; code: number }[];
};

const KEY = 'noor:weather';
const FRESH_MS = 30 * 60 * 1000;

// WMO weather codes, grouped for a simple sky picture
export function describe(code: number, isDay = true): { label: string; sky: 'clear' | 'cloud' | 'rain' | 'storm' | 'haze' | 'night' } {
  if (code === 0) return { label: isDay ? 'Clear and sunny' : 'Clear night', sky: isDay ? 'clear' : 'night' };
  if (code <= 2) return { label: isDay ? 'Mostly sunny' : 'Mostly clear', sky: isDay ? 'clear' : 'night' };
  if (code === 3) return { label: 'Cloudy', sky: 'cloud' };
  if (code === 45 || code === 48) return { label: 'Hazy', sky: 'haze' };
  if (code >= 51 && code <= 67) return { label: 'Rain', sky: 'rain' };
  if (code >= 80 && code <= 82) return { label: 'Showers', sky: 'rain' };
  if (code >= 95) return { label: 'Thunderstorm', sky: 'storm' };
  return { label: 'Mild', sky: 'cloud' };
}

export function weatherTip(w: Weather) {
  if (w.max >= 36) return 'Very hot today. Drink two extra glasses and stay out of the afternoon sun.';
  if (w.max >= 32) return 'Warm day. Keep your water close.';
  if (w.humidity >= 75) return 'Humid and sticky. Light clothes and plenty of water.';
  if (describe(w.code).sky === 'rain') return 'Rain in Karachi! A perfect chai-and-pakora evening.';
  if (w.min <= 16) return 'Cool tonight. Keep a shawl near your desk.';
  return 'A gentle day outside. Step onto the roof at Maghrib.';
}

function cached(): Weather | undefined {
  try {
    const w = JSON.parse(localStorage.getItem(KEY) ?? 'null');
    return w ?? undefined;
  } catch {
    return undefined;
  }
}

async function fetchWeather(): Promise<Weather> {
  const url = `https://api.open-meteo.com/v1/forecast?latitude=${KARACHI.lat}&longitude=${KARACHI.lng}` +
    '&current=temperature_2m,apparent_temperature,relative_humidity_2m,weather_code,is_day' +
    '&daily=temperature_2m_max,temperature_2m_min,weather_code&timezone=Asia%2FKarachi&forecast_days=4';
  const res = await fetch(url);
  if (!res.ok) throw new Error(`weather ${res.status}`);
  const j = await res.json();
  const w: Weather = {
    at: Date.now(),
    temp: Math.round(j.current.temperature_2m),
    feels: Math.round(j.current.apparent_temperature),
    humidity: Math.round(j.current.relative_humidity_2m),
    code: j.current.weather_code,
    isDay: j.current.is_day === 1,
    max: Math.round(j.daily.temperature_2m_max[0]),
    min: Math.round(j.daily.temperature_2m_min[0]),
    days: j.daily.time.map((date: string, i: number) => ({
      date,
      max: Math.round(j.daily.temperature_2m_max[i]),
      min: Math.round(j.daily.temperature_2m_min[i]),
      code: j.daily.weather_code[i],
    })),
  };
  try { localStorage.setItem(KEY, JSON.stringify(w)); } catch { /* ignore */ }
  return w;
}

/** Live Karachi weather (Open-Meteo, free, no account). Refreshes every 30 minutes; shows the last reading offline. */
export function useWeather() {
  const [w, setW] = useState<Weather | undefined>(cached);
  useEffect(() => {
    let alive = true;
    const load = () => {
      const c = cached();
      if (c && Date.now() - c.at < FRESH_MS) return;
      fetchWeather().then((x) => alive && setW(x)).catch(() => { /* offline: keep last reading */ });
    };
    load();
    const id = setInterval(load, 5 * 60 * 1000);
    document.addEventListener('visibilitychange', load);
    return () => { alive = false; clearInterval(id); document.removeEventListener('visibilitychange', load); };
  }, []);
  return w;
}
