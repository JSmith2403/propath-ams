import { useEffect, useMemo, useState, useCallback } from 'react';
import { supabase } from '../lib/supabase';

/**
 * useVALDMetrics — for a single athlete, fetch their imported VALD test
 * trials and surface them as a metric registry that the KPI Dashboard
 * can plug into the same way it consumes manual session metrics.
 *
 * Returned shape:
 *   loading  : boolean
 *   metrics  : [{ key, label, unit, testType, name, decimals }]
 *   entriesFor(metricKey) : [{ date, value }] — sorted oldest→newest
 *   defFor(metricKey)     : { key, label, unit, ... }  | undefined
 *
 * Metric key format: `vald:<TEST_TYPE>:<metric name>` (stable, human-readable).
 *
 * Resilience: raw_metrics rows imported before server-side enrichment
 * existed lack name/unit/decimals — they only have { resultId, value,
 * limb }. The hook fetches the live VALD result-definitions catalogue
 * (via /api/vald/result-definitions, edge-cached for a day) and uses it
 * to resolve names client-side as a fallback. So old data renders with
 * proper labels without needing a re-sync first.
 *
 * Only the bilateral 'Trial' limb is surfaced as a KPI metric — per-side
 * (Left/Right) and Asymmetry rows live in Data Storage.
 */
export function useVALDMetrics(athleteId) {
  const [rows, setRows]                 = useState([]);
  const [loading, setLoading]           = useState(true);
  const [definitions, setDefinitions]   = useState({});

  // Pull rows for this athlete.
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

  // Pull the VALD result-definitions catalogue once. Edge-cached server
  // side; we just hold it in memory. Failure is non-fatal — anything
  // server-enriched still renders correctly without it.
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch('/api/vald/result-definitions');
        if (!res.ok) return;
        const json = await res.json();
        if (cancelled) return;
        if (json?.ok && json.definitions) setDefinitions(json.definitions);
      } catch (_) { /* ignore */ }
    })();
    return () => { cancelled = true; };
  }, []);

  // Resolve a single raw_metrics item — prefer the server-enriched name,
  // fall back to looking up the resultId in the live catalogue, last
  // resort just stamps the resultId.
  const resolve = useCallback((m) => {
    if (m?.name) return m;
    const def = definitions[m?.resultId];
    if (def) {
      return {
        ...m,
        name:     def.name,
        unit:     def.unit,
        group:    def.group,
        decimals: def.decimals,
      };
    }
    return { ...m, name: m?.resultId != null ? `Metric ${m.resultId}` : 'Unknown' };
  }, [definitions]);

  // Walk every imported trial and capture each unique (test_type, name)
  // combination as a selectable KPI metric.
  const metrics = useMemo(() => {
    const map = new Map();
    for (const r of rows) {
      const tt = r.test_type || 'VALD';
      const ms = Array.isArray(r.raw_metrics) ? r.raw_metrics : [];
      for (const raw of ms) {
        if (raw.limb && raw.limb !== 'Trial') continue;
        const m = resolve(raw);
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
  }, [rows, resolve]);

  const entriesFor = useCallback((metricKey) => {
    if (!metricKey?.startsWith?.('vald:')) return [];
    const colon1 = metricKey.indexOf(':');
    const colon2 = metricKey.indexOf(':', colon1 + 1);
    const tt   = metricKey.slice(colon1 + 1, colon2);
    const name = metricKey.slice(colon2 + 1);

    const out = [];
    for (const r of rows) {
      if ((r.test_type || 'VALD') !== tt) continue;
      const ms = Array.isArray(r.raw_metrics) ? r.raw_metrics : [];
      const hit = ms
        .map(raw => resolve(raw))
        .find(m => m.name === name && (m.limb === 'Trial' || m.limb == null));
      if (!hit || hit.value == null || !isFinite(Number(hit.value))) continue;
      out.push({ date: r.recorded_at, value: Number(hit.value) });
    }
    return out.sort((a, b) => new Date(a.date) - new Date(b.date));
  }, [rows, resolve]);

  const defFor = useCallback((metricKey) =>
    metrics.find(m => m.key === metricKey),
    [metrics],
  );

  return { rows, metrics, loading, entriesFor, defFor, definitions };
}
