import { useMemo, useState } from 'react';
import { Watch, RefreshCw, ChevronDown, ChevronUp, ExternalLink, AlertTriangle } from 'lucide-react';
import { useGarmin } from '../../hooks/useGarmin';

const GOLD = '#A58D69';
const KEY_PAGE = 'https://connect.garmin.com/app/settings/personalApiToken';
const EXPIRY_CHOICES = [
  { label: '1 year', days: 365 },
  { label: '180 days', days: 180 },
  { label: '90 days', days: 90 },
  { label: '30 days', days: 30 },
];

const fmtSleep = (s) => (s == null ? '—' : `${Math.floor(s / 3600)}h ${String(Math.round((s % 3600) / 60)).padStart(2, '0')}m`);
const fmtDay = (iso) => (iso ? new Date(`${iso}T12:00:00`).toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' }) : '');
const fmtDur = (s) => (s == null ? '' : s >= 3600 ? `${Math.floor(s / 3600)}h ${Math.round((s % 3600) / 60)}m` : `${Math.round(s / 60)} min`);
const fmtType = (t) => String(t || 'Activity').replace(/_/g, ' ').replace(/^./, c => c.toUpperCase());
const plusDays = (n) => { const d = new Date(); d.setDate(d.getDate() + n); return d.toISOString().slice(0, 10); };

function Tile({ label, value, sub }) {
  return (
    <div className="rounded-lg border border-ink-100 bg-white px-3 py-2.5">
      <p className="text-micro text-ink-400 uppercase font-bold">{label}</p>
      <p className="text-h3 font-bold text-ink-900 leading-tight">{value ?? '—'}</p>
      {sub && <p className="text-micro text-ink-400">{sub}</p>}
    </div>
  );
}

function Bars({ title, rows, pick, format }) {
  const vals = rows.map(pick);
  const max = Math.max(1, ...vals.filter(v => v != null));
  return (
    <div>
      <p className="text-micro font-bold uppercase text-ink-400 mb-1.5">{title}</p>
      <div className="flex items-end gap-1.5 h-14">
        {rows.map((r, i) => (
          <div key={r.day} className="flex-1 flex flex-col items-center justify-end h-full" title={`${fmtDay(r.day)}: ${vals[i] == null ? 'no data' : format(vals[i])}`}>
            <div className="w-full rounded-t" style={{ height: vals[i] == null ? 2 : `${Math.max(6, (vals[i] / max) * 100)}%`, backgroundColor: vals[i] == null ? '#e5e7eb' : GOLD }} />
          </div>
        ))}
      </div>
      <div className="flex gap-1.5 mt-1">
        {rows.map(r => <span key={r.day} className="flex-1 text-center text-[10px] text-ink-400">{new Date(`${r.day}T12:00:00`).toLocaleDateString('en-GB', { weekday: 'narrow' })}</span>)}
      </div>
    </div>
  );
}

function ConnectForm({ onConnect, busy, error, viewer }) {
  const [key, setKey] = useState('');
  const [days, setDays] = useState(365);
  const who = viewer === 'coach' ? 'this athlete’s' : 'your';
  return (
    <div className="space-y-3">
      <ol className="text-meta text-ink-600 space-y-1.5 list-decimal pl-5">
        <li>
          Sign in to Garmin Connect and open{' '}
          <a href={KEY_PAGE} target="_blank" rel="noreferrer" className="font-semibold underline inline-flex items-center gap-0.5" style={{ color: GOLD }}>
            Personal API key <ExternalLink size={11} />
          </a>.
        </li>
        <li>Tap <strong>Create Key</strong>, accept the terms, choose how long it lasts, then <strong>copy it</strong> — Garmin only shows it once.</li>
        <li>Paste it below, and tell us how long you chose so we can remind you before it runs out.</li>
      </ol>
      <input
        type="text" value={key} onChange={(e) => setKey(e.target.value)}
        placeholder={`Paste ${who} Garmin key`}
        autoComplete="off" autoCorrect="off" autoCapitalize="off" spellCheck={false} name="garmin-key-not-a-password"
        className="w-full text-body border border-ink-200 rounded-xl px-3 py-3 font-mono"
      />
      <div className="flex items-center gap-2">
        <label className="text-micro text-ink-500" htmlFor="garmin-exp">Key lasts</label>
        <select id="garmin-exp" value={days} onChange={(e) => setDays(Number(e.target.value))} className="text-meta border border-ink-200 rounded-lg px-2 py-1.5 bg-white">
          {EXPIRY_CHOICES.map(c => <option key={c.days} value={c.days}>{c.label}</option>)}
        </select>
      </div>
      {error && <p className="text-meta text-red-600" role="alert">{error}</p>}
      <button
        onClick={() => onConnect(key, plusDays(days))} disabled={busy || key.replace(/\s/g, '').length < 16}
        className="w-full rounded-xl py-3 text-body font-bold text-white disabled:opacity-50"
        style={{ backgroundColor: GOLD }}
      >
        {busy ? 'Connecting…' : 'Connect Garmin'}
      </button>
      <p className="text-micro text-ink-400">
        Only {viewer === 'coach' ? 'the athlete and coaches' : 'you and your coaches'} can see this data. The key is stored encrypted, only reads your data (it can’t change anything on your account), and you can disconnect any time.
      </p>
    </div>
  );
}

/**
 * GarminCard — connect a Garmin account and see the watch data (sleep, HRV, resting HR, steps,
 * activities). Used on the athlete's Progress tab (viewer="athlete") and the coach's athlete
 * profile (viewer="coach"). Renders nothing where Garmin isn't available.
 */
export default function GarminCard({ athleteId, viewer = 'athlete' }) {
  const g = useGarmin(athleteId, { forStaff: viewer === 'coach' });
  const [open, setOpen] = useState(false);
  const [confirmOff, setConfirmOff] = useState(false);
  const [diag, setDiag] = useState(null);   // coach-only: what Garmin actually sends back (field names only)

  const latest = g.daily[0] || null;
  const latestWith = (k) => g.daily.find(d => d[k] != null) || null;
  const week = useMemo(() => [...g.daily].slice(0, 7).reverse(), [g.daily]);
  const sleep = latestWith('sleep_seconds');
  const hrv = latestWith('hrv_last_night');
  const rhr = latestWith('resting_hr');
  const expDays = g.status?.key_expires_on ? Math.ceil((new Date(g.status.key_expires_on) - Date.now()) / 86400000) : null;

  if (!g.available || g.loading) return null;
  const connected = !!g.status;
  const attention = g.status?.status === 'needs_attention' || (expDays != null && expDays <= 0);

  return (
    <div className="rounded-xl bg-white border border-ink-100 shadow-card overflow-hidden mb-4">
      <button onClick={() => setOpen(o => !o)} className="w-full flex items-center gap-3 px-4 py-3 text-left" aria-expanded={open || !connected}>
        <Watch size={18} style={{ color: GOLD }} />
        <div className="flex-1 min-w-0">
          <p className="text-body font-semibold text-ink-900">Garmin</p>
          <p className="text-micro text-ink-500">
            {!connected ? 'Not connected — add your watch data'
              : attention ? 'Needs reconnecting'
              : `Connected${g.status.last_sync_at ? ` · updated ${new Date(g.status.last_sync_at).toLocaleString('en-GB', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}` : ''}`}
          </p>
        </div>
        {(open || !connected) ? <ChevronUp size={16} className="text-ink-400" /> : <ChevronDown size={16} className="text-ink-400" />}
      </button>

      {(open || !connected) && (
        <div className="px-4 pb-4 pt-3 border-t border-ink-100 bg-ink-50 space-y-4">
          {connected && attention && (
            <div className="flex gap-2 rounded-lg p-3 text-meta" style={{ backgroundColor: '#fef3c7', color: '#92400e' }}>
              <AlertTriangle size={16} className="shrink-0 mt-0.5" />
              <span>{g.status.last_error || 'This Garmin key has run out.'} Create a new key below to carry on.</span>
            </div>
          )}
          {connected && !attention && expDays != null && expDays <= 14 && (
            <p className="text-micro" style={{ color: '#92400e' }}>Your Garmin key runs out in {expDays} day{expDays === 1 ? '' : 's'} — create a new one before then.</p>
          )}
          {connected && !attention && g.status.last_error && (
            <p className="text-micro text-ink-500">Last update had a problem: {g.status.last_error}</p>
          )}

          {connected && !attention && (
            <>
              {!latest ? (
                <p className="text-meta text-ink-500">Connected — nothing has come through yet. Tap <strong>Update now</strong> in a moment, after your watch has synced with the Garmin app.</p>
              ) : (
                <>
                  <div className="grid grid-cols-2 gap-2">
                    <Tile label="Sleep" value={fmtSleep(sleep?.sleep_seconds)} sub={sleep?.sleep_score != null ? `score ${sleep.sleep_score} · ${fmtDay(sleep.day)}` : (sleep ? fmtDay(sleep.day) : null)} />
                    <Tile label="HRV (overnight)" value={hrv ? `${hrv.hrv_last_night} ms` : null} sub={hrv ? [hrv.hrv_status && String(hrv.hrv_status).toLowerCase(), hrv.hrv_weekly_avg != null && `week avg ${hrv.hrv_weekly_avg}`].filter(Boolean).join(' · ') : null} />
                    <Tile label="Resting heart rate" value={rhr ? `${rhr.resting_hr} bpm` : null} sub={rhr ? fmtDay(rhr.day) : null} />
                    <Tile label="Steps" value={latest.steps != null ? latest.steps.toLocaleString() : null} sub={fmtDay(latest.day)} />
                  </div>
                  {week.length > 1 && (
                    <div className="grid grid-cols-2 gap-4 rounded-lg border border-ink-100 bg-white p-3">
                      <Bars title="Sleep" rows={week} pick={d => d.sleep_seconds} format={fmtSleep} />
                      <Bars title="HRV" rows={week} pick={d => d.hrv_last_night} format={v => `${v} ms`} />
                    </div>
                  )}
                </>
              )}

              {g.activities.length > 0 && (
                <div>
                  <p className="text-micro font-bold uppercase text-ink-400 mb-1.5">Recent activities</p>
                  <div className="rounded-lg border border-ink-100 bg-white divide-y divide-ink-100">
                    {g.activities.slice(0, 6).map(a => (
                      <div key={a.activity_id} className="flex items-center gap-3 px-3 py-2">
                        <div className="flex-1 min-w-0">
                          <p className="text-meta font-semibold text-ink-900 truncate">{a.name || fmtType(a.activity_type)}</p>
                          <p className="text-micro text-ink-400">{fmtDay(a.day)} · {fmtType(a.activity_type)}</p>
                        </div>
                        <p className="text-micro text-ink-600 text-right whitespace-nowrap">
                          {fmtDur(a.duration_s)}{a.avg_hr ? ` · ${a.avg_hr} bpm` : ''}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {viewer === 'coach' && (
                <div>
                  <button onClick={async () => setDiag(await g.diagnose())} className="text-micro text-ink-400 underline underline-offset-2">Check what Garmin sends back</button>
                  {diag && <pre className="mt-2 max-h-56 overflow-auto rounded-lg bg-white border border-ink-100 p-2 text-[10px] text-ink-600">{JSON.stringify(diag, null, 1)}</pre>}
                </div>
              )}
              {g.error && <p className="text-meta text-red-600" role="alert">{g.error}</p>}
              <div className="flex items-center gap-3">
                <button onClick={g.syncNow} disabled={g.busy} className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full border border-ink-200 bg-white text-meta font-semibold text-ink-700 disabled:opacity-50">
                  <RefreshCw size={13} className={g.busy ? 'animate-spin' : ''} /> {g.busy ? 'Updating…' : 'Update now'}
                </button>
                {!confirmOff ? (
                  <button onClick={() => setConfirmOff(true)} className="text-micro text-ink-400 underline underline-offset-2">Disconnect</button>
                ) : (
                  <span className="text-micro text-ink-500">
                    Disconnect?{' '}
                    <button onClick={() => { setConfirmOff(false); g.disconnect(false); }} className="font-semibold underline text-red-600">Keep history</button>{' · '}
                    <button onClick={() => { setConfirmOff(false); g.disconnect(true); }} className="font-semibold underline text-red-600">Delete data</button>{' · '}
                    <button onClick={() => setConfirmOff(false)} className="underline">Cancel</button>
                  </span>
                )}
              </div>
            </>
          )}

          {(!connected || attention) && (
            <ConnectForm onConnect={async (k, exp) => { const r = await g.connect(k, exp); if (r.ok) setOpen(true); }} busy={g.busy} error={g.error} viewer={viewer} />
          )}
        </div>
      )}
    </div>
  );
}
