import { useState } from 'react';

const KEY = 'propath_custom_metrics';

function load() {
  try { return JSON.parse(localStorage.getItem(KEY) || '{}'); } catch { return {}; }
}

function uid() {
  return `cm_${Date.now()}_${Math.random().toString(36).slice(2, 5)}`;
}

// Metric shape:
// { key, label, unit, bilateral, attempts, categoryLabel, custom: true,
//   dependentCalcs: [{ key, name, formulaType, sourceA?, sourceB? }] }

export function useCustomMetrics() {
  const [metrics, setMetrics] = useState(load);

  const addMetric = (def) => {
    const key = def.key || uid();
    const m   = { attempts: 1, dependentCalcs: [], ...def, key, custom: true };
    setMetrics(prev => {
      const next = { ...prev, [key]: m };
      try { localStorage.setItem(KEY, JSON.stringify(next)); } catch {}
      return next;
    });
    return m;
  };

  const removeMetric = (key) => {
    setMetrics(prev => {
      const { [key]: _, ...rest } = prev;
      try { localStorage.setItem(KEY, JSON.stringify(rest)); } catch {}
      return rest;
    });
  };

  return { customMetrics: metrics, addCustomMetric: addMetric, removeCustomMetric: removeMetric };
}
