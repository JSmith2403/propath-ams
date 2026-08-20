// Shared KPI calculation helpers — used by PerformanceTestingTab.jsx
// (DiagnosticQuadrant) and by the KPI board tiles (KpiTile.jsx). Moved out
// of PerformanceTestingTab.jsx so both can import without a circular
// module dependency.

export function extractScalar(entry) {
  if (!entry) return null;
  const l = entry.left ?? entry.bestL ?? null;
  const r = entry.right ?? entry.bestR ?? null;
  if (l != null && r != null) return (l + r) / 2;
  if (l != null) return l;
  if (r != null) return r;
  return entry.value ?? entry.best ?? null;
}

export function getBodyweightAt(date, matEntries) {
  if (!matEntries?.length) return null;
  const hit = [...matEntries]
    .filter(e => e.bodyMass != null && e.date <= date)
    .sort((a, b) => new Date(b.date) - new Date(a.date));
  return hit[0]?.bodyMass ?? null;
}

export function fmtDate(d) {
  return new Date(d).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: '2-digit' });
}

export function fmtNum(v) {
  if (v == null || !isFinite(v)) return '—';
  return v < 10 ? v.toFixed(2) : v.toFixed(1);
}

export function rollingStats(values, window = 5) {
  if (!values.length) return { avg: null, sd: 0 };
  const w   = values.slice(-window);
  const avg = w.reduce((s, v) => s + v, 0) / w.length;
  const sd  = w.length > 1
    ? Math.sqrt(w.reduce((s, v) => s + (v - avg) ** 2, 0) / w.length)
    : 0;
  return { avg, sd };
}

export function linearTrend(pts) {
  const n = pts.length;
  if (n < 2) return pts.map(d => ({ ...d, trend: d.v }));
  let sx = 0, sy = 0, sxy = 0, sx2 = 0;
  pts.forEach((d, i) => { sx += i; sy += d.v; sxy += i * d.v; sx2 += i * i; });
  const den = n * sx2 - sx * sx;
  if (!den) return pts.map(d => ({ ...d, trend: d.v }));
  const m = (n * sxy - sx * sy) / den;
  const b = (sy - m * sx) / n;
  return pts.map((d, i) => ({ ...d, trend: parseFloat((m * i + b).toFixed(3)) }));
}

// Extract separate Left and Right scalars from an entry (no averaging).
export function extractLR(entry) {
  if (!entry) return { l: null, r: null };
  const l = entry.left  ?? entry.bestL ?? null;
  const r = entry.right ?? entry.bestR ?? null;
  return { l: l != null ? Number(l) : null, r: r != null ? Number(r) : null };
}

// Rolling window of non-null values only — used per-side for dual-line charts.
export function rollingAvgWindow(values, window = 5) {
  const w = values.filter(v => v != null).slice(-window);
  if (!w.length) return null;
  return w.reduce((s, v) => s + v, 0) / w.length;
}

// Compute LSI (Limb Symmetry Index) from the most recent entry.
// LSI = (lower / higher) * 100.  Returns null if either side is missing.
export function computeLSI(entries) {
  if (!entries?.length) return null;
  const sorted = [...entries].sort((a, b) => new Date(b.date) - new Date(a.date));
  for (const e of sorted) {
    const { l, r } = extractLR(e);
    if (l != null && r != null && (l !== 0 || r !== 0)) {
      const lower  = Math.min(Math.abs(l), Math.abs(r));
      const higher = Math.max(Math.abs(l), Math.abs(r));
      if (higher === 0) return null;
      return parseFloat(((lower / higher) * 100).toFixed(1));
    }
  }
  return null;
}

export function lsiColour(lsi) {
  if (lsi == null) return '#6b7280';
  if (lsi >= 90)    return '#15803d';
  if (lsi >= 80)    return '#92400e';
  return '#b91c1c';
}

// Dual-line data: one point per entry, carrying both L and R plus rolling
// averages per side. No Rolling SD band (not meaningful for L/R split).
export function buildDualKpiData(rawEntries) {
  if (!rawEntries?.length) return null;
  const sorted = [...rawEntries].sort((a, b) => new Date(a.date) - new Date(b.date));

  const pts = sorted.map(e => {
    const { l, r } = extractLR(e);
    if (l == null && r == null) return null;
    return { date: e.date, l, r };
  }).filter(Boolean);

  if (!pts.length) return null;

  const lVals = pts.map(p => p.l);
  const rVals = pts.map(p => p.r);

  // Per-point running averages (using all prior values up to and including i,
  // capped to last 5). This gives a smooth line on the chart.
  const chartData = pts.map((p, i) => {
    const ls = lVals.slice(Math.max(0, i - 4), i + 1).filter(v => v != null);
    const rs = rVals.slice(Math.max(0, i - 4), i + 1).filter(v => v != null);
    return {
      date:     p.date,
      label:    fmtDate(p.date),
      valueL:   p.l,
      valueR:   p.r,
      rollAvgL: ls.length ? parseFloat((ls.reduce((s, v) => s + v, 0) / ls.length).toFixed(2)) : null,
      rollAvgR: rs.length ? parseFloat((rs.reduce((s, v) => s + v, 0) / rs.length).toFixed(2)) : null,
    };
  });

  const latestL = lVals.slice().reverse().find(v => v != null) ?? null;
  const latestR = rVals.slice().reverse().find(v => v != null) ?? null;

  return {
    chartData,
    latestL,
    latestR,
    rollingAvgL: rollingAvgWindow(lVals),
    rollingAvgR: rollingAvgWindow(rVals),
    lsi:         computeLSI(rawEntries),
  };
}

export function buildKpiData(rawEntries, metricKey, matEntries, lowerIsBetterSet) {
  if (!rawEntries?.length) return null;
  const isRelPower = metricKey === 'cmjRelPower';
  const isRelForce = metricKey === 'imtpRelForce';
  const sorted     = [...rawEntries].sort((a, b) => new Date(a.date) - new Date(b.date));

  const pts = sorted.map(e => {
    let v;
    if (isRelPower) {
      const pw = extractScalar(e);
      const bw = getBodyweightAt(e.date, matEntries);
      v = pw != null && bw ? parseFloat((pw / bw).toFixed(2)) : null;
    } else if (isRelForce) {
      // IMTP Relative Force = peak force (N) / (bodyweight (kg) * 9.81)
      const f  = extractScalar(e);
      const bw = getBodyweightAt(e.date, matEntries);
      v = f != null && bw ? parseFloat((f / (bw * 9.81)).toFixed(1)) : null;
    } else {
      v = extractScalar(e);
    }
    return v != null ? { date: e.date, v } : null;
  }).filter(Boolean);

  if (!pts.length) return null;

  const vals       = pts.map(d => d.v);
  const lowerBetter = lowerIsBetterSet?.has?.(metricKey) || false;
  const latest     = vals[vals.length - 1];
  const allTimeBest = lowerBetter ? Math.min(...vals) : Math.max(...vals);
  const { avg: rollingAvg, sd: rollingSD } = rollingStats(vals);

  const isFlagged = rollingAvg != null && rollingSD > 0 && (
    lowerBetter ? latest > rollingAvg + rollingSD : latest < rollingAvg - rollingSD
  );

  const trended   = linearTrend(pts);
  const chartData = trended.map(d => ({
    ...d,
    label:   fmtDate(d.date),
    flagged: rollingAvg != null && rollingSD > 0 && (
      lowerBetter ? d.v > rollingAvg + rollingSD : d.v < rollingAvg - rollingSD
    ),
  }));

  return { chartData, latest, allTimeBest, rollingAvg, rollingSD, isFlagged, lowerBetter };
}
