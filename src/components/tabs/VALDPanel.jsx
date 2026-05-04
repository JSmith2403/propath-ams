import { useEffect, useState, useCallback, useMemo } from 'react';
import { Activity, ChevronDown, ChevronRight, Download, RefreshCw } from 'lucide-react';
import { supabase } from '../../lib/supabase';

/**
 * VALDPanel — pull ForceDecks tests for an athlete on demand and show
 * the imported jumps grouped by session.
 *
 * Coach decisions captured in the brief:
 *   • One row per jump (trial), not per session — consumers can summarise.
 *   • On-demand button only — no cron, no automatic polling.
 *   • Idempotent: vald_trial_id is unique, so re-syncing the same window
 *     never duplicates rows.
 *
 * The Vercel function at /api/vald/sync handles auth + the VALD API
 * round-trip and returns a normalised trial list. This component stays
 * client-side and writes those rows into Supabase using the user's
 * existing authenticated session.
 */

function fmtDate(iso) {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('en-GB', {
    day: 'numeric', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
}

function fmtNumber(v, digits = 1) {
  if (v == null || !isFinite(v)) return '—';
  return Number(v).toFixed(digits);
}

export default function VALDPanel({ athlete }) {
  const valdProfileId = athlete?.vald_profile_id?.trim() || '';

  const [rows, setRows]         = useState([]);
  const [loading, setLoading]   = useState(true);
  const [syncing, setSyncing]   = useState(false);
  const [openSessions, setOpen] = useState({}); // sessionKey -> bool
  const [toast, setToast]       = useState(null);

  const showToast = (msg, kind = 'success') => {
    setToast({ msg, kind });
    setTimeout(() => setToast(null), 3500);
  };

  // ── Load existing rows for this athlete ─────────────────────────────────
  const fetchRows = useCallback(async () => {
    if (!athlete?.id) { setRows([]); setLoading(false); return; }
    setLoading(true);
    const { data, error } = await supabase
      .from('vald_test_results')
      .select('*')
      .eq('athlete_id', athlete.id)
      .order('recorded_at', { ascending: false });
    if (error) {
      console.error('[VALD] fetch failed', error);
      showToast(`Couldn't load VALD imports: ${error.message}`, 'error');
      setRows([]);
    } else {
      setRows(data || []);
    }
    setLoading(false);
  }, [athlete?.id]);

  useEffect(() => { fetchRows(); }, [fetchRows]);

  // ── Sync ────────────────────────────────────────────────────────────────
  const handleSync = async () => {
    if (!valdProfileId || syncing) return;
    setSyncing(true);
    try {
      const url = `/api/vald/sync?profileId=${encodeURIComponent(valdProfileId)}`;
      const res = await fetch(url);
      const json = await res.json().catch(() => ({}));
      if (!res.ok || !json?.ok) {
        const detail = json?.detail ? ` (${String(json.detail).slice(0, 200)})` : '';
        throw new Error((json?.error || `HTTP ${res.status}`) + detail);
      }
      const trials = Array.isArray(json.trials) ? json.trials : [];
      if (trials.length === 0) {
        showToast('No new tests found in VALD for this athlete.');
        setSyncing(false);
        return;
      }

      // Stamp athlete_id and upsert by unique vald_trial_id (idempotent).
      const payload = trials.map(t => ({ ...t, athlete_id: athlete.id }));
      const { error: upErr, count } = await supabase
        .from('vald_test_results')
        .upsert(payload, { onConflict: 'vald_trial_id', count: 'exact' });
      if (upErr) throw upErr;

      const sessionsTouched = new Set(trials.map(t => t.vald_test_id)).size;
      showToast(`Imported ${trials.length} jump${trials.length === 1 ? '' : 's'} from ${sessionsTouched} session${sessionsTouched === 1 ? '' : 's'}.`);
      await fetchRows();
    } catch (e) {
      console.error('[VALD] sync failed', e);
      showToast(`Sync failed: ${e.message || e}`, 'error');
    } finally {
      setSyncing(false);
    }
  };

  // ── Group rows by vald_test_id (one tile per session) ───────────────────
  const sessions = useMemo(() => {
    const map = new Map();
    for (const r of rows) {
      const key = r.vald_test_id;
      if (!map.has(key)) {
        map.set(key, {
          key,
          test_type:    r.test_type,
          recorded_at:  r.recorded_at,
          trials:       [],
        });
      }
      map.get(key).trials.push(r);
    }
    return Array.from(map.values()).sort((a, b) =>
      String(b.recorded_at).localeCompare(String(a.recorded_at)));
  }, [rows]);

  // ── Render ──────────────────────────────────────────────────────────────
  return (
    <div className="bg-white rounded-xl border border-ink-100 shadow-card p-5 mb-6">
      <div className="flex items-center gap-3 mb-4">
        <div className="p-2 rounded-lg" style={{ backgroundColor: 'rgba(67,126,141,0.10)' }}>
          <Activity size={18} style={{ color: '#437E8D' }} />
        </div>
        <div className="flex-1">
          <h3 className="text-sm font-bold text-ink-900">VALD ForceDecks</h3>
          <p className="text-xs text-ink-400">
            Pull this athlete's tests directly from VALD. Each jump is stored
            as its own row and never duplicates on re-sync.
          </p>
        </div>
        <button
          onClick={handleSync}
          disabled={!valdProfileId || syncing}
          className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white rounded-lg transition-opacity disabled:opacity-40"
          style={{ backgroundColor: '#437E8D' }}
          title={valdProfileId ? 'Sync from VALD' : 'Set VALD Profile ID on the Overview tab first'}
        >
          {syncing
            ? <RefreshCw size={13} className="animate-spin" />
            : <Download size={13} />}
          {syncing ? 'Syncing…' : 'Sync from VALD'}
        </button>
      </div>

      {!valdProfileId && (
        <p className="text-xs italic text-ink-400 mb-3">
          No VALD Profile ID set. Add one on the Overview tab to enable sync.
        </p>
      )}

      {/* Imported sessions list */}
      {loading ? (
        <div className="flex items-center justify-center py-6">
          <div className="w-6 h-6 border-2 rounded-full animate-spin"
            style={{ borderColor: '#e5e7eb', borderTopColor: '#437E8D' }} />
        </div>
      ) : sessions.length === 0 ? (
        <p className="text-xs text-ink-400 py-3 text-center">
          No VALD tests imported yet.
        </p>
      ) : (
        <div className="space-y-2">
          {sessions.map(sess => {
            const isOpen = !!openSessions[sess.key];
            return (
              <div key={sess.key} className="rounded-lg border border-ink-100 overflow-hidden">
                <button
                  onClick={() => setOpen(o => ({ ...o, [sess.key]: !isOpen }))}
                  className="w-full flex items-center gap-3 px-3 py-2 text-left hover:bg-ink-50 transition-colors"
                >
                  {isOpen
                    ? <ChevronDown size={13} className="text-ink-400 shrink-0" />
                    : <ChevronRight size={13} className="text-ink-400 shrink-0" />}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-ink-900 truncate">
                      {sess.test_type || 'Test'} · {fmtDate(sess.recorded_at)}
                    </p>
                    <p className="text-[11px] text-ink-400">
                      {sess.trials.length} jump{sess.trials.length === 1 ? '' : 's'}
                    </p>
                  </div>
                </button>

                {isOpen && (
                  <div className="overflow-x-auto border-t border-ink-100">
                    <table className="w-full text-[11px]">
                      <thead className="bg-ink-50">
                        <tr className="text-left text-ink-500">
                          <th className="px-3 py-1.5 font-semibold">#</th>
                          <th className="px-3 py-1.5 font-semibold">Jump Ht (cm)</th>
                          <th className="px-3 py-1.5 font-semibold">Depth (cm)</th>
                          <th className="px-3 py-1.5 font-semibold">Peak Force (N)</th>
                          <th className="px-3 py-1.5 font-semibold">Peak Impulse (Ns)</th>
                          <th className="px-3 py-1.5 font-semibold">RSI Mod</th>
                          <th className="px-3 py-1.5 font-semibold">L/R Asym (%)</th>
                        </tr>
                      </thead>
                      <tbody className="text-ink-800 tabular-nums">
                        {sess.trials.map((t, i) => (
                          <tr key={t.id} className="border-t border-ink-100">
                            <td className="px-3 py-1.5 text-ink-400">{i + 1}</td>
                            <td className="px-3 py-1.5">{fmtNumber(t.jump_height_cm, 1)}</td>
                            <td className="px-3 py-1.5">{fmtNumber(t.cmj_depth_cm, 1)}</td>
                            <td className="px-3 py-1.5">{fmtNumber(t.peak_force_n, 0)}</td>
                            <td className="px-3 py-1.5">{fmtNumber(t.peak_impulse_ns, 0)}</td>
                            <td className="px-3 py-1.5">{fmtNumber(t.rsi_modified, 2)}</td>
                            <td className="px-3 py-1.5">{fmtNumber(t.lr_asymmetry_pct, 1)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {toast && (
        <div
          className="fixed bottom-6 right-6 px-4 py-2.5 rounded-lg text-xs font-semibold text-white shadow-lg z-[90] max-w-md"
          style={{ backgroundColor: toast.kind === 'error' ? '#dc2626' : '#1C1C1C' }}
        >
          {toast.msg}
        </div>
      )}
    </div>
  );
}
