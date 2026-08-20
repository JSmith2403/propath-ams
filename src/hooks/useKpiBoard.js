import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '../lib/supabase';

// Same localStorage key PerformanceTestingTab.jsx already uses for
// `thresholds` — this hook only reads the legacy kpiMetrics/
// additionalMetrics fields out of it once, for migration, and then
// marks that athlete migrated so it never re-reads them.
const STORAGE_KEY = 'propath_perf_ui';

const DEFAULT_KPI_KEYS = [
  'cmjHeight', 'cmjRelPower', 'imtpPeakForce', 'rsi105', 'hamstring30',
  'hamstring90', 'adduction0', 'chinUpMaxReps', 'benchPress3RM', 'sixMinRun',
];

function readLegacyPatch(athleteId) {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}')[athleteId] || {}; }
  catch { return {}; }
}

function markMigrated(athleteId) {
  try {
    const all = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
    all[athleteId] = { ...all[athleteId], migratedToBoard: true };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(all));
  } catch { /* best effort */ }
}

/**
 * useKpiBoard — per-athlete KPI board layout, synced via the
 * athlete_kpi_board table (replaces the old localStorage-only
 * kpiMetrics/additionalMetrics fixed-slot config).
 *
 * On first load for an athlete with zero server rows and no
 * migratedToBoard flag, migrates their existing localStorage tile
 * config (or the same default 10 keys the old UI seeded) into the new
 * table once, then marks them migrated so this never runs twice.
 */
export function useKpiBoard(athleteId) {
  const [board, setBoard]     = useState([]);
  const [loading, setLoading] = useState(true);
  const migratingRef = useRef(false);

  const load = useCallback(async () => {
    if (!athleteId) { setBoard([]); setLoading(false); return; }
    setLoading(true);

    const { data, error } = await supabase
      .from('athlete_kpi_board')
      .select('*')
      .eq('athlete_id', athleteId)
      .order('position', { ascending: true });

    if (error) {
      console.error('[useKpiBoard] fetch failed', error);
      setBoard([]);
      setLoading(false);
      return;
    }

    if ((data || []).length === 0 && !migratingRef.current) {
      const legacy = readLegacyPatch(athleteId);
      if (!legacy.migratedToBoard) {
        migratingRef.current = true;
        const keys = [
          ...(legacy.kpiMetrics || DEFAULT_KPI_KEYS),
          ...(legacy.additionalMetrics || []),
        ];
        const seen = new Set();
        const rows = keys.filter(k => k && !seen.has(k) && seen.add(k)).map((key, i) => ({
          athlete_id: athleteId,
          metric_key: key,
          span: i < 4 ? 2 : 1, // first four were the old "2-up KPI Dashboard" row; rest were "Additional Metrics"
          position: i,
        }));

        if (rows.length) {
          // upsert + ignoreDuplicates rather than insert — React StrictMode
          // double-invokes this effect in dev, so two migration attempts can
          // race past the migratingRef guard before either sets it. The
          // unique (athlete_id, metric_key) constraint would only turn a
          // plain insert's second attempt into a harmless console error;
          // this avoids that entirely rather than relying on the race
          // resolving in a particular order.
          const { data: inserted, error: insertErr } = await supabase
            .from('athlete_kpi_board')
            .upsert(rows, { onConflict: 'athlete_id,metric_key', ignoreDuplicates: true })
            .select('*');
          if (insertErr) {
            console.error('[useKpiBoard] migration insert failed', insertErr);
          } else {
            markMigrated(athleteId);
            setBoard((inserted || []).sort((a, b) => a.position - b.position));
            setLoading(false);
            migratingRef.current = false;
            return;
          }
        } else {
          markMigrated(athleteId);
        }
        migratingRef.current = false;
      }
    }

    setBoard(data || []);
    setLoading(false);
  }, [athleteId]);

  useEffect(() => { load(); }, [load]);

  const addMetric = useCallback(async (metricKey) => {
    if (!athleteId || !metricKey) return;
    const position = board.length ? Math.max(...board.map(b => b.position)) + 1 : 0;
    const optimistic = { id: `tmp_${Date.now()}`, athlete_id: athleteId, metric_key: metricKey, span: 1, position };
    setBoard(prev => [...prev, optimistic]);

    const { data, error } = await supabase
      .from('athlete_kpi_board')
      .insert({ athlete_id: athleteId, metric_key: metricKey, span: 1, position })
      .select('*')
      .single();

    if (error) {
      console.error('[useKpiBoard] addMetric failed', error);
      setBoard(prev => prev.filter(b => b.id !== optimistic.id));
    } else {
      setBoard(prev => prev.map(b => b.id === optimistic.id ? data : b));
    }
  }, [athleteId, board]);

  const removeMetric = useCallback(async (metricKey) => {
    if (!athleteId) return;
    const removed = board.find(b => b.metric_key === metricKey);
    setBoard(prev => prev.filter(b => b.metric_key !== metricKey));

    const { error } = await supabase
      .from('athlete_kpi_board')
      .delete()
      .eq('athlete_id', athleteId)
      .eq('metric_key', metricKey);

    if (error) {
      console.error('[useKpiBoard] removeMetric failed', error);
      if (removed) setBoard(prev => [...prev, removed].sort((a, b) => a.position - b.position));
    }
  }, [athleteId, board]);

  const resizeMetric = useCallback(async (metricKey, span) => {
    if (!athleteId) return;
    const clamped = Math.min(4, Math.max(1, span));
    setBoard(prev => prev.map(b => b.metric_key === metricKey ? { ...b, span: clamped } : b));

    const { error } = await supabase
      .from('athlete_kpi_board')
      .update({ span: clamped, updated_at: new Date().toISOString() })
      .eq('athlete_id', athleteId)
      .eq('metric_key', metricKey);

    if (error) console.error('[useKpiBoard] resizeMetric failed', error);
  }, [athleteId]);

  return { board, loading, addMetric, removeMetric, resizeMetric };
}
