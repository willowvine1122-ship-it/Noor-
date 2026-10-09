// Adhan sound: a recording the user chooses (kept in IndexedDB on the phone),
// or a soft built-in chime until she adds one.

const DB = 'noor-media';
const STORE = 'files';

function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB, 1);
    req.onupgradeneeded = () => req.result.createObjectStore(STORE);
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

export async function saveAdhanFile(file: Blob) {
  const db = await openDb();
  await new Promise<void>((resolve, reject) => {
    const tx = db.transaction(STORE, 'readwrite');
    tx.objectStore(STORE).put(file, 'adhan');
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

export async function loadAdhanFile(): Promise<Blob | undefined> {
  try {
    const db = await openDb();
    return await new Promise((resolve, reject) => {
      const req = db.transaction(STORE).objectStore(STORE).get('adhan');
      req.onsuccess = () => resolve(req.result as Blob | undefined);
      req.onerror = () => reject(req.error);
    });
  } catch {
    return undefined;
  }
}

export async function clearAdhanFile() {
  const db = await openDb();
  db.transaction(STORE, 'readwrite').objectStore(STORE).delete('adhan');
}

let audio: HTMLAudioElement | null = null;
let ctx: AudioContext | null = null;

/** iOS only plays sound after a tap; call this from any user gesture. */
export function unlockAudio() {
  try {
    ctx ??= new AudioContext();
    if (ctx.state === 'suspended') void ctx.resume();
    if (!audio) {
      audio = new Audio();
      audio.preload = 'auto';
    }
  } catch {
    /* audio unavailable */
  }
}

function chime() {
  try {
    ctx ??= new AudioContext();
    const c = ctx;
    const notes = [523.25, 659.25, 783.99, 1046.5];
    notes.forEach((f, i) => {
      const o = c.createOscillator();
      const g = c.createGain();
      o.type = 'sine';
      o.frequency.value = f;
      const t = c.currentTime + i * 0.45;
      g.gain.setValueAtTime(0, t);
      g.gain.linearRampToValueAtTime(0.18, t + 0.05);
      g.gain.exponentialRampToValueAtTime(0.0001, t + 2.2);
      o.connect(g).connect(c.destination);
      o.start(t);
      o.stop(t + 2.3);
    });
  } catch {
    /* ignore */
  }
}

export async function playAdhan() {
  const file = await loadAdhanFile();
  if (!file) {
    chime();
    return 'chime' as const;
  }
  audio ??= new Audio();
  audio.src = URL.createObjectURL(file);
  try {
    await audio.play();
    return 'adhan' as const;
  } catch {
    chime();
    return 'chime' as const;
  }
}

export function stopAdhan() {
  if (audio) {
    audio.pause();
    audio.currentTime = 0;
  }
}
