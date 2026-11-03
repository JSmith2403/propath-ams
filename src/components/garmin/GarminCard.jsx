import { useEffect, useMemo, useState } from 'react';
import { Watch, ChevronDown, ChevronUp, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { useGarmin } from '../../hooks/useGarmin';

const GOLD = '#A58D69';

const fmtSleep = (s) => (s == null ? '—' : `${Math.floor(s / 3600)}h ${String(Math.round((s % 3600) / 60)).padStart(2, '0')}m`);
const fmtDay = (iso) => (iso ? new Date(`${iso}T12:00:00`).toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' }) : '');
const fmtDur = (s) => (s == null ? '' : s >= 3600 ? `${Math.floor(s / 3600)}h ${Math.round((s % 3600) / 60)}m` : `${Math.round(s / 60)} min`);
const fmtType = (t) => String(t || 'Activity').replace(/_/g, ' ').replace(/^./, c => c.toUpperCase());

// What the page shows when Garmin sends the athlete back (?garmin=…).
const RETURN_NOTES = {
  connected: { ok: true,  text: 'Garmin connected. Your data will appear here after your watch next syncs with the Garmin Connect app.' },
  denied:    { ok: false, text: 'Garmin wasn’t connected — you chose not to share. You can try again whenever you like.' },
  expired:   { ok: false, text: 'That Garmin sign-in timed out. Please tap Connect Garmin and try again.' },
  taken:     { ok: false, text: 'That Garmin account is already linked to another athlete. Tell your coach if that’s a mistake.' },
  error:     { ok: false, text: 'Something went wrong connecting Garmin. Please try again, and tell your coach if it keeps happening.' },
};

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

/** Shown to the athlete before they leave for Garmin's own sign-in page. */
function ConnectPanel({ onConnect, busy, error }) {
  return (
    <div className="space-y-3">
      <p className="text-meta text-ink-600">
        Connect your Garmin watch so your sleep, recovery and training show up here and your coaches can see how you’re
        recovering. You’ll sign in on <strong>Garmin’s own page</strong> and choose what to share — ProPath never sees your Garmin password.
      </p>
      <ul className="text-meta text-ink-600 space-y-1 list-disc pl-5">
        <li>Your coaches can see: sleep, overnight HRV, resting heart rate, stress, steps and workouts.</li>
        <li>Only you and your coaching team can see it. It is never sold or shared. <a href="/privacy.html" target="_blank" rel="noreferrer" className="underline" style={{ color: GOLD }}>Privacy policy</a></li>
        <li>Data starts from the moment you connect — Garmin doesn’t send past history.</li>
        <li>You can disconnect at any time from here or in your Garmin Connect settings.</li>
      </ul>
      {error && <p className="text-meta text-red-600" role="alert">{error}</p>}
      <button
        onClick={onConnect} disabled={busy}
        className="w-full rounded-xl py-3 text-body font-bold text-white disabled:opacity-50"
        style={{ backgroundColor: GOLD }}
      >
        {busy ? 'Opening Garmin…' : 'Connect Garmin'}
      </button>
    </div>
  );
}

/**
 * GarminCard — connect a Garmin account and see the watch data (sleep, HRV, resting HR, steps,
 * activities). Used on the athlete's Progress tab (viewer="athlete") and the coach's athlete
 * profile (viewer="coach"). Renders nothing where Garmin isn't available.
 * Only the athlete can connect — consent has to come from them, on Garmin's own page.
 */
export default function GarminCard({ athleteId, viewer = 'athlete' }) {
  const g = useGarmin(athleteId, { forStaff: viewer === 'coach' });
  const [open, setOpen] = useState(false);
  const [confirmOff, setConfirmOff] = useState(false);
  const [note, setNote] = useState(null);

  // Garmin sends the athlete back to /athlete?tab=progress&garmin=<outcome> — say what happened, then tidy the address.
  useEffect(() => {
    if (viewer !== 'athlete') return;
    const outcome = new URLSearchParams(window.location.search).get('garmin');
    if (!outcome || !RETURN_NOTES[outcome]) return;
    setNote(RETURN_NOTES[outcome]);
    setOpen(true);
    const url = new URL(window.location.href);
    url.searchParams.delete('garmin');
    window.history.replaceState(null, '', url.pathname + url.search + url.hash);
  }, [viewer]);

  const latest = g.daily[0] || null;
  const latestWith = (k) => g.daily.find(d => d[k] != null) || null;
  const week = useMemo(() => [...g.daily].slice(0, 7).reverse(), [g.daily]);
  const sleep = latestWith('sleep_seconds');
  const hrv = latestWith('hrv_last_night');
  const rhr = latestWith('resting_hr');

  if (!g.available || g.loading) return null;
  const connected = !!g.status;
  const attention = g.status?.status === 'needs_attention';
  const expanded = open || !connected;

  return (
    <div className="rounded-xl bg-white border border-ink-100 shadow-card overflow-hidden mb-4">
      <button onClick={() => setOpen(o => !o)} className="w-full flex items-center gap-3 px-4 py-3 text-left" aria-expanded={expanded}>
        <Watch size={18} style={{ color: GOLD }} />
        <div className="flex-1 min-w-0">
          <p className="text-body font-semibold text-ink-900">Garmin</p>
          <p className="text-micro text-ink-500">
            {!connected ? (viewer === 'coach' ? 'Not connected' : 'Not connected — add your watch data')
              : attention ? 'Needs reconnecting'
              : g.status.last_sync_at ? `Connected · last data ${new Date(g.status.last_sync_at).toLocaleString('en-GB', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}`
              : 'Connected · waiting for your first sync'}
          </p>
        </div>
        {expanded ? <ChevronUp size={16} className="text-ink-400" /> : <ChevronDown size={16} className="text-ink-400" />}
      </button>

      {expanded && (
        <div className="px-4 pb-4 pt-3 border-t border-ink-100 bg-ink-50 space-y-4">
          {note && (
            <div className="flex gap-2 rounded-lg p-3 text-meta" style={note.ok ? { backgroundColor: '#ecfdf5', color: '#065f46' } : { backgroundColor: '#fef3c7', color: '#92400e' }}>
              {note.ok ? <CheckCircle2 size={16} className="shrink-0 mt-0.5" /> : <AlertTriangle size={16} className="shrink-0 mt-0.5" />}
              <span>{note.text}</span>
            </div>
          )}
          {connected && attention && (
            <div className="flex gap-2 rounded-lg p-3 text-meta" style={{ backgroundColor: '#fef3c7', color: '#92400e' }}>
              <AlertTriangle size={16} className="shrink-0 mt-0.5" />
              <span>{g.status.last_error || 'The Garmin connection needs renewing.'}{viewer === 'athlete' ? ' Tap Connect Garmin below to fix it.' : ''}</span>
            </div>
          )}
          {connected && !attention && g.status.last_error && (
            <p className="text-micro text-ink-500">Last update had a problem: {g.status.last_error}</p>
          )}

          {connected && !attention && (
            <>
              {!latest ? (
                <p className="text-meta text-ink-500">
                  Connected — nothing has come through yet. Garmin sends data after the watch syncs with the Garmin Connect app, and only from the moment of connecting.
                </p>
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

              {g.error && <p className="text-meta text-red-600" role="alert">{g.error}</p>}
              <div className="flex items-center gap-3">
                {!confirmOff ? (
                  <button onClick={() => setConfirmOff(true)} className="text-micro text-ink-400 underline underline-offset-2">Disconnect Garmin</button>
                ) : (
                  <span className="text-micro text-ink-500">
                    Disconnect?{' '}
                    <button onClick={() => { setConfirmOff(false); g.disconnect(false); }} className="font-semibold underline text-red-600">Keep history</button>{' · '}
                    <button onClick={() => { setConfirmOff(false); g.disconnect(true); }} className="font-semibold underline text-red-600">Delete my Garmin data</button>{' · '}
                    <button onClick={() => setConfirmOff(false)} className="underline">Cancel</button>
                  </span>
                )}
              </div>
            </>
          )}

          {(!connected || attention) && viewer === 'athlete' && (
            <ConnectPanel onConnect={g.connect} busy={g.busy} error={g.error} />
          )}
          {!connected && viewer === 'coach' && (
            <p className="text-meta text-ink-500">This athlete hasn’t connected Garmin. They connect it themselves from the Progress tab in their own app, so the consent comes from them.</p>
          )}
        </div>
      )}
    </div>
  );
}
