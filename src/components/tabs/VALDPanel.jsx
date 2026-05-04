import { useEffect, useState, useCallback, useMemo } from 'react';
import { Activity, ChevronDown, ChevronRight, Download, RefreshCw } from 'lucide-react';
import { supabase } from '../../lib/supabase';

/**
 * VALDPanel — pulls every metric VALD returns for an athlete and lays
 * the imported jumps out as a dynamic-column table grouped by session.
 *
 * Each session expands to a wide table:
 *   • One row per trial (jump 1, jump 2, …)
 *   • Columns auto-derived from whatever metrics actually came back
 *     for that session — IMTP / SJ / CMJ etc surface different sets,
 *     and we don't try to force a single schema across them.
 *   • Default to bilateral 'Trial' limb values; a toggle exposes the
 *     per-side L / R / Asymmetry rows.
 *   • Headers show the metric name + unit (from VALD's resultdefinitions
 *     enrichment we do server-side at sync time).
 *
 * Idempotent re-sync: the unique vald_trial_id constraint upserts in
 * place so the same window can be synced any number of times.
 */

function fmtDate(iso) {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('en-GB', {
    day: 'numeric', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
}

function fmtValue(value, decimals = 1) {
  if (value == null || !isFinite(Number(value))) return '—';
  return Number(value).toFixed(decimals);
}

const LIMB_FILTERS = [
  { id: 'trial', label: 'Bilateral',     test: (l) => l === 'Trial' || l == null },
  { id: 'sides', label: 'L / R',         test: (l) => l === 'Left' || l === 'Right' },
  { id: 'asym',  label: 'Asymmetry',     test: (l) => l === 'Asym' },
  { id: 'all',   label: 'All',           test: ()  => true },
];

export default function VALDPanel({ athlete }) {
  const valdProfileId = athlete?.vald_profile_id?.trim() || '';

  const [rows, setRows]         = useState([]);
  const [loading, setLoading]   = useState(true);
  const [syncing, setSyncing]   = useState(false);
  const [openSessions, setOpen] = useState({}); // sessionKey -> bool
  const [limbFilter, setLimbFilter] = useState('trial');
  const [toast, setToast]       = useState(null);

  const showToast = (msg, kind = 'success') => {
    setToast({ msg, kind });
    setTimeout(() => setToast(null), 4500);
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

      const payload = trials.map(t => ({ ...t, athlete_id: athlete.id }));
      const { error: upErr } = await supabase
        .from('vald_test_results')
        .upsert(payload, { onConflict: 'vald_trial_id' });
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
    <div className="bg-white rounded-xl border border-ink-100 shadow-card p-5">
      <div className="flex items-center gap-3 mb-4">
        <div className="p-2 rounded-lg" style={{ backgroundColor: 'rgba(67,126,141,0.10)' }}>
          <Activity size={18} style={{ color: '#437E8D' }} />
        </div>
        <div className="flex-1">
          <h3 className="text-sm font-bold text-ink-900">VALD ForceDecks Imports</h3>
          <p className="text-xs text-ink-400">
            Every metric VALD returns is stored. Use the limb filter to view
            bilateral, per-side, or asymmetry rows.
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

      {/* Limb filter */}
      {sessions.length > 0 && (
        <div className="flex items-center gap-2 mb-3">
          <span className="text-[10px] font-bold uppercase tracking-widest text-ink-400">
            Show
          </span>
          <div className="inline-flex rounded-md overflow-hidden border border-ink-200">
            {LIMB_FILTERS.map(f => (
              <button
                key={f.id}
                onClick={() => setLimbFilter(f.id)}
                className="px-3 py-1 text-[11px] font-semibold transition-colors"
                style={{
                  backgroundColor: limbFilter === f.id ? '#437E8D' : '#fff',
                  color:           limbFilter === f.id ? '#fff'    : '#6b7280',
                }}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>
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
                  <SessionTable session={sess} limbFilter={limbFilter} />
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

// ─── Per-session dynamic-column table ──────────────────────────────────────
function SessionTable({ session, limbFilter }) {
  const filterFn = LIMB_FILTERS.find(f => f.id === limbFilter)?.test || (() => true);

  // Flatten this session's trials into one (trialIndex, limb, metric)→value
  // map, then derive the unique columns from whatever names appear.
  const { columns, rows } = useMemo(() => {
    // rows[i] = { trial: trialNumber, limb: 'Trial'|'Left'|..., values: { [name]: { value, decimals, unit } } }
    const out = [];
    const seenColumns = new Map(); // name -> { unit, decimals, group }

    session.trials.forEach((t, i) => {
      const metrics = Array.isArray(t.raw_metrics) ? t.raw_metrics : [];
      // Group metrics in this trial by limb so each limb becomes a row.
      const byLimb = new Map();
      for (const m of metrics) {
        if (!filterFn(m.limb)) continue;
        const limbKey = m.limb || 'Trial';
        if (!byLimb.has(limbKey)) byLimb.set(limbKey, {});
        byLimb.get(limbKey)[m.name] = m;
        if (!seenColumns.has(m.name)) {
          seenColumns.set(m.name, {
            unit:     m.unit,
            decimals: m.decimals ?? 1,
            group:    m.group  ?? 'General',
          });
        }
      }
      // Stable ordering: Trial first, then Left, Right, Asym.
      const limbOrder = ['Trial', 'Left', 'Right', 'Asym'];
      const limbsHere = Array.from(byLimb.keys()).sort(
        (a, b) => limbOrder.indexOf(a) - limbOrder.indexOf(b),
      );
      for (const lk of limbsHere) {
        out.push({ trial: i + 1, limb: lk, values: byLimb.get(lk) });
      }
    });

    // Sort columns by group then alphabetical for predictable rendering.
    const cols = Array.from(seenColumns.entries())
      .map(([name, meta]) => ({ name, ...meta }))
      .sort((a, b) =>
        (a.group || '').localeCompare(b.group || '')
        || a.name.localeCompare(b.name),
      );

    return { columns: cols, rows: out };
  }, [session, limbFilter, filterFn]);

  if (rows.length === 0) {
    return (
      <div className="px-3 py-4 text-[11px] italic text-ink-400 border-t border-ink-100">
        No metrics for the selected limb filter.
      </div>
    );
  }

  return (
    <div className="overflow-x-auto border-t border-ink-100">
      <table className="w-full text-[11px] tabular-nums">
        <thead className="bg-ink-50 sticky top-0">
          <tr className="text-left text-ink-500">
            <th className="px-3 py-1.5 font-semibold sticky left-0 bg-ink-50 z-10">#</th>
            <th className="px-3 py-1.5 font-semibold sticky left-8 bg-ink-50 z-10">Limb</th>
            {columns.map(col => (
              <th key={col.name} className="px-3 py-1.5 font-semibold whitespace-nowrap"
                title={`Group: ${col.group}`}>
                {col.name}
                {col.unit && (
                  <span className="ml-1 text-ink-400 font-normal">({col.unit})</span>
                )}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="text-ink-800">
          {rows.map((r, idx) => (
            <tr key={idx} className="border-t border-ink-100">
              <td className="px-3 py-1.5 text-ink-400 sticky left-0 bg-white z-10">{r.trial}</td>
              <td className="px-3 py-1.5 sticky left-8 bg-white z-10">
                <span
                  className="text-[10px] font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded"
                  style={{
                    color:           r.limb === 'Asym' ? '#A58D69' : '#437E8D',
                    backgroundColor: r.limb === 'Asym' ? 'rgba(165,141,105,0.12)' : 'rgba(67,126,141,0.10)',
                  }}
                >
                  {r.limb}
                </span>
              </td>
              {columns.map(col => {
                const m = r.values[col.name];
                return (
                  <td key={col.name} className="px-3 py-1.5 whitespace-nowrap">
                    {m ? fmtValue(m.value, col.decimals) : '—'}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
