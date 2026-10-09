// Noor phone reminders. The app sends its upcoming reminders here; a cron job
// calls "tick" every minute and this function pushes whatever is due.
// Stores no names or notes: only reminder text, times and the push address.
import * as webpush from 'jsr:@negrel/webpush@^0.5.0';
import { createClient } from 'jsr:@supabase/supabase-js@2';

const db = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!);
const CONTACT = 'https://willowvine1122-ship-it.github.io/Noor-/';
const cors = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'content-type, authorization, apikey, x-client-info',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};
const json = (body: unknown, status = 200) => new Response(JSON.stringify(body), { status, headers: { ...cors, 'Content-Type': 'application/json' } });

const b64u = (s: string) => Uint8Array.from(atob(s.replace(/-/g, '+').replace(/_/g, '/') + '==='.slice((s.length + 3) % 4)), (c) => c.charCodeAt(0));
const toB64u = (b: Uint8Array) => btoa(String.fromCharCode(...b)).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');

type Exported = Awaited<ReturnType<typeof webpush.exportVapidKeys>>;
let server: webpush.ApplicationServer | null = null;
let publicKey = '';

async function vapid() {
  if (server) return server;
  const { data } = await db.from('noor_settings').select('v').eq('k', 'vapid').maybeSingle();
  let exported = data?.v as Exported | undefined;
  if (!exported) {
    exported = await webpush.exportVapidKeys(await webpush.generateVapidKeys({ extractable: true }));
    // first caller wins, so two cold starts can't end up with different keys
    await db.from('noor_settings').upsert({ k: 'vapid', v: exported }, { onConflict: 'k', ignoreDuplicates: true });
    const again = await db.from('noor_settings').select('v').eq('k', 'vapid').single();
    exported = again.data!.v as Exported;
  }
  const pub = exported.publicKey as JsonWebKey;
  const raw = new Uint8Array(65);
  raw[0] = 4; raw.set(b64u(pub.x!), 1); raw.set(b64u(pub.y!), 33);
  publicKey = toB64u(raw);
  const keys = await webpush.importVapidKeys(exported, { extractable: false });
  server = await webpush.ApplicationServer.new({ contactInformation: CONTACT, vapidKeys: keys });
  return server;
}

async function device(token: unknown) {
  if (typeof token !== 'string' || token.length < 20) return null;
  const { data } = await db.from('noor_devices').select('id, subscription').eq('token', token).maybeSingle();
  return data;
}

async function send(subscription: webpush.PushSubscription, msg: { title: string; body: string; tag?: string | null }) {
  const app = await vapid();
  try {
    await app.subscribe(subscription).pushTextMessage(JSON.stringify(msg), { urgency: webpush.Urgency.High, ttl: 1800 });
    return 'sent';
  } catch (e) {
    if (e instanceof webpush.PushMessageError && e.isGone()) return 'gone';
    console.error('push failed', String(e));
    return 'failed';
  }
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: cors });
  let body: Record<string, unknown> = {};
  try { body = await req.json(); } catch { return json({ error: 'bad json' }, 400); }

  switch (body.action) {
    case 'key': {
      await vapid();
      return json({ publicKey });
    }

    case 'subscribe': {
      const sub = body.subscription as webpush.PushSubscription | undefined;
      if (typeof body.token !== 'string' || body.token.length < 20 || !sub?.endpoint || !sub.keys?.p256dh || !sub.keys?.auth) return json({ error: 'bad subscription' }, 400);
      const { count } = await db.from('noor_devices').select('id', { count: 'exact', head: true });
      const known = await device(body.token);
      if (!known && (count ?? 0) >= 10) return json({ error: 'too many devices' }, 429);
      const { error } = await db.from('noor_devices').upsert({ token: body.token, subscription: sub, last_seen: new Date().toISOString() }, { onConflict: 'token' });
      return error ? json({ error: error.message }, 500) : json({ ok: true });
    }

    case 'sync': {
      const d = await device(body.token);
      if (!d) return json({ error: 'unknown device' }, 404);
      const now = Date.now();
      const list = (Array.isArray(body.reminders) ? body.reminders : []).slice(0, 120)
        .filter((r): r is { key: string; at: string; title: string; body: string; tag?: string } =>
          !!r && typeof r.key === 'string' && typeof r.at === 'string' && typeof r.title === 'string' && typeof r.body === 'string')
        .filter((r) => { const t = Date.parse(r.at); return t > now - 5 * 60000 && t < now + 3 * 86400000; })
        .map((r) => ({ device_id: d.id, key: r.key.slice(0, 80), due_at: r.at, title: r.title.slice(0, 120), body: r.body.slice(0, 300), tag: r.tag?.slice(0, 40) ?? null }));
      await db.from('noor_reminders').delete().eq('device_id', d.id).is('sent_at', null);
      if (list.length) {
        const { error } = await db.from('noor_reminders').upsert(list, { onConflict: 'device_id,key', ignoreDuplicates: true });
        if (error) return json({ error: error.message }, 500);
      }
      await db.from('noor_devices').update({ last_seen: new Date().toISOString() }).eq('id', d.id);
      return json({ ok: true, scheduled: list.length });
    }

    case 'forget': {
      if (typeof body.token !== 'string' || body.token.length < 20) return json({ error: 'bad token' }, 400);
      await db.from('noor_devices').delete().eq('token', body.token);
      return json({ ok: true });
    }

    case 'test': {
      const d = await device(body.token);
      if (!d) return json({ error: 'unknown device' }, 404);
      const r = await send(d.subscription, { title: 'Noor is with you', body: 'Reminders are on. I’ll call you for every salah, and check on you if you miss one.', tag: 'test' });
      return json({ result: r });
    }

    case 'tick': {
      const now = new Date();
      const { data: due } = await db.from('noor_reminders')
        .update({ sent_at: now.toISOString() })
        .is('sent_at', null)
        .lte('due_at', now.toISOString())
        .gte('due_at', new Date(now.getTime() - 20 * 60000).toISOString())
        .select('device_id, title, body, tag');
      let sent = 0;
      if (due?.length) {
        const ids = [...new Set(due.map((r) => r.device_id))];
        const { data: devs } = await db.from('noor_devices').select('id, subscription').in('id', ids);
        const subs = new Map((devs ?? []).map((x) => [x.id, x.subscription]));
        for (const r of due) {
          const sub = subs.get(r.device_id);
          if (!sub) continue;
          const res = await send(sub, r);
          if (res === 'sent') sent++;
          if (res === 'gone') { await db.from('noor_devices').delete().eq('id', r.device_id); subs.delete(r.device_id); }
        }
      }
      // tidy: old sent reminders and ones that were never sent in time
      await db.from('noor_reminders').delete().lt('due_at', new Date(now.getTime() - 2 * 86400000).toISOString());
      return json({ due: due?.length ?? 0, sent });
    }
  }
  return json({ error: 'unknown action' }, 400);
});
