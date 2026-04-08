import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

const SETTINGS_KEY = 'custom_metrics';

function uid() {
  return `cm_${Date.now()}_${Math.random().toString(36).slice(2, 5)}`;
}

async function persistMetrics(metricsMap) {
  const { error } = await supabase
    .from('app_settings')
    .upsert({ key: SETTINGS_KEY, value: metricsMap, updated_at: new Date().toISOString() });
  if (error) console.error('[ProPath] Failed to save custom metrics', error);
}

// Metric shape:
// { key, label, unit, bilateral, attempts, categoryLabel, custom: true,
//   dependentCalcs: [{ key, name, formulaType, sourceA?, sourceB? }] }

export function useCustomMetrics() {
  const [metrics, setMetrics] = useState({});

  useEffect(() => {
    let isMounted = true;

    supabase.from('app_settings').select('value').eq('key', SETTINGS_KEY).single()
      .then(({ data, error }) => {
        if (!isMounted) return;
        if (error && error.code !== 'PGRST116') {
          console.error('[ProPath] Failed to load custom metrics', error);
          return;
        }
        if (data?.value) setMetrics(data.value);
      });

    const channel = supabase
      .channel('custom-metrics-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'app_settings', filter: `key=eq.${SETTINGS_KEY}` },
        payload => {
          if (!isMounted) return;
          if (payload.new?.value) setMetrics(payload.new.value);
        }
      )
      .subscribe();

    return () => {
      isMounted = false;
      supabase.removeChannel(channel);
    };
  }, []);

  const addMetric = (def) => {
    const key = def.key || uid();
    const m   = { attempts: 1, dependentCalcs: [], ...def, key, custom: true };
    setMetrics(prev => {
      const next = { ...prev, [key]: m };
      persistMetrics(next);
      return next;
    });
    return m;
  };

  const removeMetric = (key) => {
    setMetrics(prev => {
      const { [key]: _, ...rest } = prev;
      persistMetrics(rest);
      return rest;
    });
  };

  return { customMetrics: metrics, addCustomMetric: addMetric, removeCustomMetric: removeMetric };
}
