import { useEffect, useMemo, useState, useCallback } from 'react';
import { supabase } from '../lib/supabase';

/**
 * useVALDMetrics — for a single athlete, fetch their imported VALD test
 * trials and surface them as a metric registry that the KPI Dashboard
 * can plug into the same way it consumes manual session metrics.
 *
 * Returned shape:
 *   loading  : boolean
 *   metrics  : [{ key, label, unit, testType, name, decimals, group }]
 *   entriesFor(metricKey) : [{ date, value }] — sorted oldest→newest
 *   defFor(metricKey)     : { key, label, unit, ... }  | undefined
 *
 * Metric key format: `vald:<TEST_TYPE>:<metric name>` (stable, human-readable).
 * Example: `vald:CMJ:Concentric Peak Force [N]`.
 *
 * Only the bilateral 'Trial' limb is surfaced as a KPI metric — per-side
 * (Left/Right) and Asymmetry rows are visible in Data Storage but kept
 * out of the KPI picker so the dropdown doesn't multiply by 4.
 *
 * Each VALD trial becomes its own data point — coaches can see the spread
 * of jumps per session in the chart, just like the manual entry path
 * surfaces every recorded value.
 */
export function useVALDMetrics(athleteId) {
  const [rows, setRows]       = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!athleteId) { setRows([]); setLoading(false); return; }
    let cancelled = false;
    setLoading(true);
    (async () => {
      const { data, error } = await supabase
        .from('vald_test_results')
        .select('*')
        .eq('athlete_id', athleteId)
        .order('recorded_at', { ascending: true });
      if (cancelled) return;
      if (error) {
        console.error('[useVALDMetrics] fetch failed', error);
        setRows([]);
      } else {
        setRows(data || []);
      }
      setLoading(false);
    })();
    return () => { cancelled = true; };
  }, [athleteId]);

  // Walk every imported trial and capture each unique (test_type, name)
  // combination as a selectable KPI metric. Keep the first decimals/unit
  // we see so display is consistent across sessions.
  const metrics = useMemo(() => {
    const map = new Map();
    for (const r of rows) {
      const tt = r.test_type || 'VALD';
      const ms = Array.isArray(r.raw_metrics) ? r.raw_metrics : [];
      for (const m of ms) {
        if (m.limb && m.limb !== 'Trial') continue;
        const key = `vald:${tt}:${m.name}`;
        if (!map.has(key)) {
          map.set(key, {
            key,
            label:    `${tt} — ${m.name}`,
            unit:     m.unit || '',
            testType: tt,
            name:     m.name,
            decimals: m.decimals ?? 1,
            group:    m.group || 'General',
          });
        }
      }
    }
    return Array.from(map.values()).sort((a, b) =>
      a.testType.localeCompare(b.testType) || a.name.localeCompare(b.name));
  }, [rows]);

  const entriesFor = useCallback((metricKey) => {
    if (!metricKey?.startsWith?.('vald:')) return [];
    // Parse key directly so we don't need a metrics lookup (and so series
    // resolve even before the metrics list has rendered the picker once).
    const colon1 = metricKey.indexOf(':');
    const colon2 = metricKey.indexOf(':', colon1 + 1);
    const tt   = metricKey.slice(colon1 + 1, colon2);
    const name = metricKey.slice(colon2 + 1);

    const out = [];
    for (const r of rows) {
      if ((r.test_type || 'VALD') !== tt) continue;
      const ms = Array.isArray(r.raw_metrics) ? r.raw_metrics : [];
      const hit = ms.find(m => m.name === name && (m.limb === 'Trial' || m.limb == null));
      if (!hit || hit.value == null || !isFinite(Number(hit.value))) continue;
      out.push({ date: r.recorded_at, value: Number(hit.value) });
    }
    return out.sort((a, b) => new Date(a.date) - new Date(b.date));
  }, [rows]);

  const defFor = useCallback((metricKey) =>
    metrics.find(m => m.key === metricKey),
    [metrics],
  );

  return { rows, metrics, loading, entriesFor, defFor };
}
