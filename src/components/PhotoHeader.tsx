import { useState, type ReactNode } from 'react';
import { Butterfly, type Species } from './Butterfly';

export type Photo = { src: string; color: string; by: string; user: string };

/** Real photos from Unsplash (free to use), loaded from their servers as their guidelines ask. */
export const PHOTOS = {
  deen: { src: 'https://images.unsplash.com/photo-1569924259120-22d9307489cf', color: '#8c7340', by: 'Phillip Glickman', user: 'phillipglickman' },
  me: { src: 'https://images.unsplash.com/photo-1601728799607-7da40c711eed', color: '#e8a9c4', by: 'Veronika Kireeva', user: 'nikkusha' },
  grow: { src: 'https://images.unsplash.com/photo-1682315912291-26f4de2d0ae8', color: '#4f5a22', by: 'Brittany Lee', user: 'brittanys_meadow' },
  more: { src: 'https://images.unsplash.com/flagged/photo-1558113118-e42e558b352a', color: '#c9a27c', by: 'Farhan Khan', user: 'farhan5792' },
} satisfies Record<string, Photo>;

/** A big photo header with a slow drift, a soft shade for the words, and butterflies passing over it. */
export function PhotoHeader({ photo, eyebrow, title, lede, flies = ['monarch', 'rose'], children }: { photo: Photo; eyebrow: string; title: string; lede?: string; flies?: Species[]; children?: ReactNode }) {
  const [loaded, setLoaded] = useState(false);
  return (
    <header className="photo-head" style={{ background: photo.color }}>
      <img
        className={`ph-img ${loaded ? 'in' : ''}`}
        src={`${photo.src}?auto=format&fit=crop&w=900&h=640&q=70`}
        alt=""
        onLoad={() => setLoaded(true)}
      />
      <span className="ph-shade" />
      {flies.map((sp, i) => <span key={sp} className={`ph-fly ph-fly-${i}`}><Butterfly sp={sp} size={i ? 36 : 46} /></span>)}
      <div className="ph-text">
        <p className="eyebrow">{eyebrow}</p>
        <h1 className="display">{title}</h1>
        {lede && <p className="lede">{lede}</p>}
        {children}
      </div>
      <a className="ph-credit" href={`https://unsplash.com/@${photo.user}?utm_source=noor&utm_medium=referral`} target="_blank" rel="noreferrer">Photo · {photo.by} / Unsplash</a>
    </header>
  );
}
