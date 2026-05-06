import { useEffect, useMemo, useState, useCallback } from 'react';
import { Activity, ChevronDown, ChevronRight, Download, RefreshCw, AlertTriangle } from 'lucide-react';
import { supabase } from '../../lib/supabase';

/**
 * VALDDataStorage — master view of every VALD ForceDecks import across
 * the whole roster. Lives inside Data Management → Data Storage → VALD API.
 *
 *   • One "Sync All Athletes" button at the top — loops every athlete that
 *     has a VALD Profile ID set on their Overview tab and pulls any tests
 *     not already in the database. Idempotent (vald_trial_id is unique).
 *   • Imported sessions render grouped by athlete, then by session.
 *     Each session expands to a wide dynamic-column table showing every
 *     metric VALD returns for that test type.
 *   • A limb filter chip group toggles bilateral / per-side / asymmetry
 *     rows.
 *
 * Athlete name resolution: each vald_test_results row has athlete_id; we
 * join against the athletes prop (already loaded by the parent) to label
 * imports with the athlete's display name.
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
  { id: 'trial', label: 'Bilateral', test: (l) => l === 'Trial' || l == null },
  { id: 'sides', label: 'L / R',     test: (l) => l === 'Left' || l === 'Right' },
  { id: 'asym',  label: 'Asymmetry', test: (l) => l === 'Asym' },
  { id: 'all',   label: 'All',       test: ()  => true },
];

export default function VALDDataStorage({ athletes = [] }) {
  const athletesWithVald = useMemo(
    () => athletes.filter(a => (a?.vald_profile_id || '').trim()),
    [athletes],
  );
  const athleteById = useMemo(
    () => Object.fromEntries(athletes.map(a => [a.id, a])),
    [athletes],
  );

  // Live VALD result-definitions catalogue used to resolve resultId →
  // name/unit for any raw_metrics row that was imported before
  // server-side enrichment existed. Cached at the edge so the call is
  // basically free.
  const [definitions, setDefinitions] = useState({});
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch('/api/vald/result-definitions');
        if (!res.ok) return;
        const json = await res.json();
        if (cancelled) return;
        if (json?.ok && json.definitions) setDefinitions(json.definitions);
      } catch (_) { /* non-fatal */ }
    })();
    return () => { cancelled = true; };
  }, []);

  const [rows, setRows]           = useState([]);
  const [loading, setLoading]     = useState(true);
  const [syncing, setSyncing]     = useState(false);
  const [progress, setProgress]   = useState(null); // { current, total, name }
  const [openAthletes, setAthletesOpen] = useState({});
  const [openSessions, setSessionsOpen] = useState({});
  const [limbFilter, setLimbFilter]     = useState('trial');
  const [toast, setToast]               = useState(null);
  const [errors, setErrors]             = useState([]);

  const showToast = (msg, kind = 'success') => {
    setToast({ msg, kind });
    setTimeout(() => setToast(null), 5000);
  };

  // ── Load all imported rows ──────────────────────────────────────────────
  const fetchRows = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('vald_test_results')
      .select('*')
      .order('recorded_at', { ascending: false });
    if (error) {
      console.error('[VALD master] fetch failed', error);
      showToast(`Couldn't load VALD imports: ${error.message}`, 'error');
      setRows([]);
    } else {
      setRows(data || []);
    }
    setLoading(false);
  }, []);

  useEffect(() => { fetchRows(); }, [fetchRows]);

  // ── Master sync — loop every athlete with a Profile ID ──────────────────
  const handleSyncAll = async () => {
    if (syncing || athletesWithVald.length === 0) return;
    setSyncing(true);
    setErrors([]);
    let importedTotal = 0;
    let sessionsTotal = 0;
    const errorList = [];

    try {
      for (let i = 0; i < athletesWithVald.length; i++) {
        const a = athletesWithVald[i];
        setProgress({ current: i + 1, total: athletesWithVald.length, name: a.name });
        try {
          const url = `/api/vald/sync?profileId=${encodeURIComponent(a.vald_profile_id.trim())}`;
          const res = await fetch(url);
          const json = await res.json().catch(() => ({}));
          if (!res.ok || !json?.ok) {
            errorList.push({ athlete: a.name, error: json?.error || `HTTP ${res.status}` });
            continue;
          }
          const trials = Array.isArray(json.trials) ? json.trials : [];
          if (trials.length === 0) continue;

          const payload = trials.map(t => ({ ...t, athlete_id: a.id }));
          const { error: upErr } = await supabase
            .from('vald_test_results')
            .upsert(payload, { onConflict: 'vald_trial_id' });
          if (upErr) {
            errorList.push({ athlete: a.name, error: upErr.message });
            continue;
          }
          importedTotal += trials.length;
          sessionsTotal += new Set(trials.map(t => t.vald_test_id)).size;
        } catch (e) {
          errorList.push({ athlete: a.name, error: e.message || String(e) });
        }
      }
      const skipped = errorList.length;
      const okMsg = `Imported ${importedTotal} jump${importedTotal === 1 ? '' : 's'} from ${sessionsTotal} session${sessionsTotal === 1 ? '' : 's'} across ${athletesWithVald.length - skipped} athlete${(athletesWithVald.length - skipped) === 1 ? '' : 's'}.`;
      showToast(skipped ? `${okMsg} ${skipped} athlete${skipped === 1 ? '' : 's'} failed — see details below.` : okMsg, skipped ? 'error' : 'success');
      setErrors(errorList);
      await fetchRows();
    } finally {
      setSyncing(false);
      setProgress(null);
    }
  };

  // ── Group rows: athlete → session → trials ──────────────────────────────
  const grouped = useMemo(() => {
    const byAthlete = new Map();
    for (const r of rows) {
      if (!byAthlete.has(r.athlete_id)) {
        byAthlete.set(r.athlete_id, {
          athleteId:   r.athlete_id,
          athleteName: athleteById[r.athlete_id]?.name || '(unknown athlete)',
          sessions:    new Map(),
        });
      }
      const a = byAthlete.get(r.athlete_id);
      if (!a.sessions.has(r.vald_test_id)) {
        a.sessions.set(r.vald_test_id, {
          key:         r.vald_test_id,
          test_type:   r.test_type,
          recorded_at: r.recorded_at,
          trials:      [],
        });
      }
      a.sessions.get(r.vald_test_id).trials.push(r);
    }
    return Array.from(byAthlete.values()).map(a => ({
      ...a,
      sessions: Array.from(a.sessions.values()).sort(
        (s1, s2) => String(s2.recorded_at).localeCompare(String(s1.recorded_at)),
      ),
    })).sort((a, b) => a.athleteName.localeCompare(b.athleteName));
  }, [rows, athleteById]);

  // ── Render ──────────────────────────────────────────────────────────────
  return (
    <div className="flex flex-col h-full">
      {/* Toolbar */}
      <div className="flex items-center gap-3 px-4 py-3 border-b border-gray-200 bg-white shrink-0">
        <div className="p-2 rounded-lg" style={{ backgroundColor: 'rgba(67,126,141,0.10)' }}>
          <Activity size={16} style={{ color: '#437E8D' }} />
        </div>
        <div className="flex-1">
          <p className="text-sm font-bold text-gray-900">VALD ForceDecks Imports</p>
          <p className="text-[11px] text-gray-500">
            {athletesWithVald.length} of {athletes.length} athlete{athletes.length === 1 ? '' : 's'} have a VALD Profile ID set.
            {progress && ` Syncing ${progress.current}/${progress.total} — ${progress.name}…`}
          </p>
        </div>

        <div className="inline-flex rounded-md overflow-hidden border border-gray-200">
          {LIMB_FILTERS.map(f => (
            <button
              key={f.id}
              onClick={() => setLimbFilter(f.id)}
              className="px-2.5 py-1 text-[11px] font-semibold transition-colors"
              style={{
                backgroundColor: limbFilter === f.id ? '#437E8D' : '#fff',
                color:           limbFilter === f.id ? '#fff'    : '#6b7280',
              }}
            >
              {f.label}
            </button>
          ))}
        </div>

        <button
          onClick={handleSyncAll}
          disabled={syncing || athletesWithVald.length === 0}
          className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white rounded-lg transition-opacity disabled:opacity-40"
          style={{ backgroundColor: '#437E8D' }}
          title={athletesWithVald.length ? 'Pull every athlete\'s latest VALD tests' : 'No athletes have a VALD Profile ID yet'}
        >
          {syncing
            ? <RefreshCw size={13} className="animate-spin" />
            : <Download size={13} />}
          {syncing ? 'Syncing…' : 'Sync All Athletes'}
        </button>
      </div>

      {/* Errors from the last sync */}
      {errors.length > 0 && (
        <div className="px-4 py-2 border-b border-amber-200 bg-amber-50 shrink-0">
          <div className="flex items-center gap-2 mb-1">
            <AlertTriangle size={12} className="text-amber-600" />
            <p className="text-[11px] font-semibold text-amber-700">
              {errors.length} athlete{errors.length === 1 ? '' : 's'} failed to sync
            </p>
          </div>
          <ul className="text-[10px] text-amber-700 space-y-0.5">
            {errors.map((e, i) => (
              <li key={i} className="truncate"><span className="font-semibold">{e.athlete}:</span> {e.error}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Grouped list */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="w-8 h-8 border-2 rounded-full animate-spin"
              style={{ borderColor: '#e5e7eb', borderTopColor: '#437E8D' }} />
          </div>
        ) : grouped.length === 0 ? (
          <div className="text-center py-12 text-xs text-gray-400">
            No VALD tests imported yet.
            {athletesWithVald.length === 0 && (
              <> Add a VALD Profile ID to any athlete's Overview tab to enable syncing.</>
            )}
          </div>
        ) : (
          grouped.map(athlete => {
            const isAOpen = openAthletes[athlete.athleteId] !== false; // default open
            const totalJumps = athlete.sessions.reduce((n, s) => n + s.trials.length, 0);
            return (
              <div key={athlete.athleteId} className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                <button
                  onClick={() => setAthletesOpen(o => ({ ...o, [athlete.athleteId]: !isAOpen }))}
                  className="w-full flex items-center gap-3 px-4 py-2.5 text-left hover:bg-gray-50 transition-colors"
                >
                  {isAOpen
                    ? <ChevronDown size={14} className="text-gray-400 shrink-0" />
                    : <ChevronRight size={14} className="text-gray-400 shrink-0" />}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-gray-900 truncate">{athlete.athleteName}</p>
                    <p className="text-[11px] text-gray-500">
                      {athlete.sessions.length} session{athlete.sessions.length === 1 ? '' : 's'} ·
                      {' '}{totalJumps} jump{totalJumps === 1 ? '' : 's'}
                    </p>
                  </div>
                </button>

                {isAOpen && (
                  <div className="border-t border-gray-100 divide-y divide-gray-100">
                    {athlete.sessions.map(sess => {
                      const sessKey = `${athlete.athleteId}-${sess.key}`;
                      const isSOpen = !!openSessions[sessKey];
                      return (
                        <div key={sess.key}>
                          <button
                            onClick={() => setSessionsOpen(o => ({ ...o, [sessKey]: !isSOpen }))}
                            className="w-full flex items-center gap-3 px-4 py-2 text-left hover:bg-gray-50 transition-colors pl-10"
                          >
                            {isSOpen
                              ? <ChevronDown size={12} className="text-gray-400 shrink-0" />
                              : <ChevronRight size={12} className="text-gray-400 shrink-0" />}
                            <div className="flex-1 min-w-0">
                              <p className="text-[12px] font-semibold text-gray-800 truncate">
                                {sess.test_type || 'Test'} · {fmtDate(sess.recorded_at)}
                              </p>
                              <p className="text-[10px] text-gray-400">
                                {sess.trials.length} jump{sess.trials.length === 1 ? '' : 's'}
                              </p>
                            </div>
                          </button>
                          {isSOpen && (
                            <SessionTable session={sess} limbFilter={limbFilter} definitions={definitions} />
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

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
// One row per trial by default. Bilateral tests (CMJ / IMTP / SJ /…) show
// the Trial-aggregate values; single-leg tests (SLHJ / SLDJ /…) show
// whichever leg the trial was on, sourced from `trial_limb` (set by the
// API) or inferred from the metrics. In "All" mode each trial gets an
// expand chevron that reveals the per-leg + asymmetry breakdown.
function SessionTable({ session, limbFilter, definitions = {} }) {
  const filterFn       = LIMB_FILTERS.find(f => f.id === limbFilter)?.test || (() => true);
  const expandableMode = limbFilter === 'all';
  const [openTrials, setOpenTrials] = useState(() => new Set());

  const toggleTrial = (key) => {
    setOpenTrials(prev => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key); else next.add(key);
      return next;
    });
  };

  // Resolve a raw_metrics item against the live catalogue when the
  // server-side enrichment fields are missing (older imports).
  const resolve = (m) => {
    if (m?.name) return m;
    const def = definitions[m?.resultId];
    if (def) return { ...m, name: def.name, unit: def.unit, group: def.group, decimals: def.decimals };
    return { ...m, name: m?.resultId != null ? `Metric ${m.resultId}` : 'Unknown' };
  };

  const { columns, trialRows } = useMemo(() => {
    const out = [];
    const seen = new Map();
    const limbOrder = ['Trial', 'Left', 'Right', 'Asym'];

    session.trials.forEach((t, i) => {
      const metrics = Array.isArray(t.raw_metrics) ? t.raw_metrics : [];
      const byLimb = new Map();
      for (const raw of metrics) {
        if (!filterFn(raw.limb)) continue;
        const m = resolve(raw);
        const lk = m.limb || 'Trial';
        if (!byLimb.has(lk)) byLimb.set(lk, {});
        byLimb.get(lk)[m.name] = m;
        if (!seen.has(m.name)) {
          seen.set(m.name, {
            unit:     m.unit,
            decimals: m.decimals ?? 1,
            group:    m.group  ?? 'General',
          });
        }
      }

      const present = limbOrder.filter(lk => byLimb.has(lk));
      if (present.length === 0) return;

      const trialLimb = t.trial_limb || null;

      // ── L/R mode: emit up to two primary rows per trial (one per leg) ──
      if (limbFilter === 'sides') {
        for (const lk of ['Left', 'Right']) {
          if (byLimb.has(lk)) {
            out.push({
              key:       `${t.vald_trial_id}-${lk}`,
              trial:     i + 1,
              labelLimb: lk,
              dataLimb:  lk,
              values:    byLimb.get(lk),
              subRows:   [],
            });
          }
        }
        return;
      }

      // ── Pick the primary limb whose values drive the row ──
      // Asym filter: just use Asym.
      // Bilateral: prefer Trial; for single-leg tests there's no Trial
      //   bucket, so the trial's limb-labelled bucket (or its sole
      //   non-Asym bucket) is the source.
      // All: same priority as Bilateral, plus the chevron reveals subs.
      let dataLimb;
      if (limbFilter === 'asym')               dataLimb = 'Asym';
      else if (byLimb.has('Trial'))            dataLimb = 'Trial';
      else if (trialLimb && byLimb.has(trialLimb)) dataLimb = trialLimb;
      else                                     dataLimb = present.find(lk => lk !== 'Asym') || present[0];

      if (!byLimb.has(dataLimb)) return;

      // Display badge — for single-leg tests we override the 'Trial'
      // grouping with the actual leg from trial_limb so the badge
      // shows LEFT / RIGHT, not TRIAL. Only Left and Right qualify;
      // anything else (Both, Trial, vendor strings) falls through to
      // the data limb so we don't mislabel bilateral aggregates.
      const isLegTag  = trialLimb === 'Left' || trialLimb === 'Right';
      const labelLimb = (dataLimb === 'Trial' && isLegTag) ? trialLimb : dataLimb;

      const subRows = expandableMode
        ? present
            .filter(lk => lk !== dataLimb)
            .map(lk => ({ limb: lk, values: byLimb.get(lk) }))
        : [];

      out.push({
        key:       t.vald_trial_id,
        trial:     i + 1,
        labelLimb,
        dataLimb,
        values:    byLimb.get(dataLimb),
        subRows,
      });
    });

    const cols = Array.from(seen.entries())
      .map(([name, m]) => ({ name, ...m }))
      .sort((a, b) =>
        (a.group || '').localeCompare(b.group || '')
        || a.name.localeCompare(b.name),
      );
    return { columns: cols, trialRows: out };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session, limbFilter, definitions]);

  if (trialRows.length === 0) {
    return (
      <div className="px-4 py-3 text-[10px] italic text-gray-400 pl-12 border-t border-gray-100">
        No metrics for the selected limb filter.
      </div>
    );
  }

  const colCount = 3 + columns.length; // chevron + # + limb + metrics

  return (
    <div className="overflow-x-auto border-t border-gray-100">
      <table className="w-full text-[10px] tabular-nums">
        <thead className="bg-gray-50">
          <tr className="text-left text-gray-500">
            <th className="px-2 py-1 w-4" />
            <th className="px-2 py-1 font-semibold">#</th>
            <th className="px-2 py-1 font-semibold">Limb</th>
            {columns.map(col => (
              <th key={col.name} className="px-2 py-1 font-semibold whitespace-nowrap"
                  title={`Group: ${col.group}`}>
                {col.name}
                {col.unit && <span className="ml-0.5 text-gray-400 font-normal">({col.unit})</span>}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="text-gray-800">
          {trialRows.flatMap((r) => {
            const hasSubs = r.subRows && r.subRows.length > 0;
            const isOpen  = hasSubs && openTrials.has(r.key);
            const rows = [];

            rows.push(
              <tr
                key={r.key}
                className={`border-t border-gray-100 ${hasSubs ? 'cursor-pointer hover:bg-gray-50' : ''}`}
                onClick={hasSubs ? () => toggleTrial(r.key) : undefined}
              >
                <td className="px-2 py-1 text-gray-400">
                  {hasSubs && (
                    isOpen ? <ChevronDown size={11} /> : <ChevronRight size={11} />
                  )}
                </td>
                <td className="px-2 py-1 text-gray-400">{r.trial}</td>
                <td className="px-2 py-1">
                  <LimbBadge limb={r.labelLimb} />
                </td>
                {columns.map(col => {
                  const m = r.values[col.name];
                  return (
                    <td key={col.name} className="px-2 py-1 whitespace-nowrap">
                      {m ? fmtValue(m.value, col.decimals) : '—'}
                    </td>
                  );
                })}
              </tr>
            );

            if (isOpen) {
              for (const sub of r.subRows) {
                rows.push(
                  <tr
                    key={`${r.key}-${sub.limb}`}
                    className="border-t border-gray-50"
                    style={{ backgroundColor: 'rgba(67,126,141,0.025)' }}
                  >
                    <td />
                    <td className="px-2 py-1" />
                    <td className="px-2 py-1 pl-4">
                      <LimbBadge limb={sub.limb} muted />
                    </td>
                    {columns.map(col => {
                      const m = sub.values[col.name];
                      return (
                        <td key={col.name} className="px-2 py-1 whitespace-nowrap text-gray-600">
                          {m ? fmtValue(m.value, col.decimals) : '—'}
                        </td>
                      );
                    })}
                  </tr>
                );
              }
            }

            return rows;
          })}
        </tbody>
      </table>
    </div>
  );
}

function LimbBadge({ limb, muted = false }) {
  // Asym uses the gold accent; Left / Right / Trial share the teal.
  const isAsym = limb === 'Asym';
  return (
    <span
      className="text-[9px] font-semibold uppercase tracking-wider px-1 py-0.5 rounded"
      style={{
        color:           isAsym ? '#A58D69' : '#437E8D',
        backgroundColor: isAsym
          ? 'rgba(165,141,105,0.12)'
          : 'rgba(67,126,141,0.10)',
        opacity: muted ? 0.7 : 1,
      }}
    >
      {limb}
    </span>
  );
}
