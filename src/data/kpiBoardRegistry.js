// Builds the test → metric groups for the KPI board's "+ Add metric"
// picker. Pulls from the exact same three sources the old dropdown did
// (METRIC_CATEGORIES, custom metrics, VALD imports) — this only changes
// how they're browsed (test, then metric) not what's available.
import { METRIC_CATEGORIES, SPECIAL_METRICS, LABEL_OVERRIDES } from './sessionMetrics';

export function getKpiTestGroups({ valdMetrics = [], customMetrics = {}, excludeKeys = [] } = {}) {
  const exclude = new Set(excludeKeys);
  const groups = [];

  // Manual-entry categories — same 9 categories as the old dropdown's
  // optgroups, plus the two derived "special" metrics slotted into their
  // parent category.
  METRIC_CATEGORIES.forEach(cat => {
    const specialsFor =
      cat.key === 'power'    ? [SPECIAL_METRICS.cmjRelPower] :
      cat.key === 'strength' ? [SPECIAL_METRICS.imtpRelForce] :
      [];
    const items = [
      ...cat.metrics.filter(m => !exclude.has(m.key)),
      ...specialsFor.filter(s => !exclude.has(s.key)),
    ].map(m => ({ key: m.key, label: LABEL_OVERRIDES[m.key] || m.label, unit: m.unit || '' }));
    if (items.length) groups.push({ test: cat.label, metrics: items });
  });

  // Custom metrics — one pseudo-test bucket, same as the old "Custom" optgroup.
  const customItems = Object.values(customMetrics)
    .filter(m => !exclude.has(m.key))
    .map(m => ({ key: m.key, label: m.label, unit: m.unit || '' }));
  if (customItems.length) groups.push({ test: 'Custom', metrics: customItems });

  // VALD imports — grouped by the real test_type this athlete has synced
  // data for (CMJ, SJ, IMTP, DJ, …), rather than one long "VALD Imports"
  // list like the old dropdown.
  const byTestType = new Map();
  valdMetrics.filter(m => !exclude.has(m.key)).forEach(m => {
    const tt = m.testType || 'VALD';
    if (!byTestType.has(tt)) byTestType.set(tt, []);
    byTestType.get(tt).push({ key: m.key, label: m.name, unit: m.unit || '' });
  });
  [...byTestType.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .forEach(([testType, items]) => groups.push({ test: `VALD — ${testType}`, metrics: items }));

  return groups;
}
