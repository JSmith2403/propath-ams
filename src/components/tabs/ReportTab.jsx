import { useState } from 'react';
import { Download } from 'lucide-react';
import InitialsAvatar from '../InitialsAvatar';
import { COHORT_CONFIG } from '../../data/athletes';
import { METRIC_MAP } from '../../data/sessionMetrics';
import { useCustomMetrics } from '../../hooks/useCustomMetrics';
import { renderBold } from '../../utils/renderBold';
import logoPath from '../../assets/Propath_Primary Logo_White.png';

// ─── Constants ────────────────────────────────────────────────────────────────

// Metrics where a lower value is better (e.g. sprint times)
const LOWER_IS_BETTER = new Set([
  'sprint10m', 'sprint20m', 'sprint40m', 'mod505', 'reactionTime',
]);

const LABEL_OVERRIDES = {
  cmjHeight:   'CMJ (Unilateral)',
  cmjBilateral:'CMJ (Bilateral)',
  adduction0:  'Adductor Squeeze',
};

const BRAG_OPTIONS = [
  { value: 'grey',  label: 'Not yet assessed',       bg: '#e5e7eb', text: '#374151' },
  { value: 'blue',  label: 'Exceeding expectations', bg: '#dbeafe', text: '#1d4ed8' },
  { value: 'green', label: 'On track',               bg: '#dcfce7', text: '#15803d' },
  { value: 'amber', label: 'Area to develop',        bg: '#fef3c7', text: '#92400e' },
  { value: 'red',   label: 'Priority area',          bg: '#fee2e2', text: '#b91c1c' },
];

// ─── Date helpers ─────────────────────────────────────────────────────────────

function formatDate(d) {
  if (!d) return '—';
  return new Date(d).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
}

function formatShortDate(d) {
  if (!d) return '—';
  return new Date(d).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
}

function formatTimestamp(iso) {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
}

// ─── Maturation helpers (centralised) ────────────────────────────────────────

import { calculateMaturation, getMostRecentMaturationInputs, calcAgeYM } from '../../utils/maturation';

const STAGE_STYLE = {
  'Pre-PHV':   { bg: '#ccfbf1', text: '#0f766e' },
  'Circa-PHV': { bg: '#fef3c7', text: '#92400e' },
  'Post-PHV':  { bg: '#e5e7eb', text: '#374151' },
};

const STAGE_EXPLAINER = {
  'Pre-PHV':   'The athlete has not yet reached their peak period of growth.',
  'Circa-PHV': 'The athlete is currently in or approaching their peak growth period.',
  'Post-PHV':  'The athlete has passed their main growth phase and is approaching physical maturity.',
};

// ─── Performance helpers ──────────────────────────────────────────────────────

function extractScalar(entry) {
  if (!entry) return null;
  const l = entry.left ?? entry.bestL ?? null;
  const r = entry.right ?? entry.bestR ?? null;
  if (l != null && r != null) return (Number(l) + Number(r)) / 2;
  if (l != null) return Number(l);
  if (r != null) return Number(r);
  const v = entry.value ?? entry.best ?? null;
  return v != null ? Number(v) : null;
}

function fmtEntry(entry, mDef) {
  if (!entry) return '—';
  const u = mDef?.unit ? ` ${mDef.unit}` : '';
  const l = entry.left ?? entry.bestL ?? null;
  const r = entry.right ?? entry.bestR ?? null;
  if (l != null || r != null)
    return `L: ${l != null ? l + u : '—'} / R: ${r != null ? r + u : '—'}`;
  const v = entry.value ?? entry.best ?? null;
  return v != null ? `${v}${u}` : '—';
}

// ─── Shared UI ────────────────────────────────────────────────────────────────

function Section({ title, children }) {
  return (
    <div className="mb-10 break-inside-avoid">
      <div className="flex items-center gap-3 mb-5">
        <h2 className="text-sm font-bold uppercase tracking-widest" style={{ color: '#1C1C1C' }}>
          {title}
        </h2>
        <div className="flex-1 h-px" style={{ backgroundColor: '#A58D69' }} />
      </div>
      {children}
    </div>
  );
}

const NOTE_TAG_COLORS = {
  Assessment:   { bg: 'rgba(67,126,141,0.12)', text: '#085777' },
  'Check-in':   { bg: 'rgba(165,141,105,0.12)', text: '#7a6540' },
  Observation:  { bg: '#f3f4f6', text: '#6b7280' },
  // legacy
  Screen:       { bg: 'rgba(67,126,141,0.1)', text: '#085777' },
  'Catch-up':   { bg: 'rgba(165,141,105,0.12)', text: '#7a6540' },
};

function NoteTag({ type }) {
  if (!type) return null;
  const c = NOTE_TAG_COLORS[type] || { bg: '#f3f4f6', text: '#6b7280' };
  return (
    <span className="text-xs font-semibold px-2 py-0.5 rounded"
      style={{ backgroundColor: c.bg, color: c.text }}>
      {type}
    </span>
  );
}

function NoAssessment({ msg }) {
  return <p className="text-sm italic text-gray-400">{msg}</p>;
}

// ─── Section 2: Maturation ────────────────────────────────────────────────────

function MaturationSection({ athlete, maturationEntries }) {
  if (!maturationEntries?.length) {
    return <NoAssessment msg="No maturation data recorded yet." />;
  }

  const inputs = getMostRecentMaturationInputs(athlete);
  const mat = inputs ? calculateMaturation(inputs) : null;
  const ageYM = inputs ? calcAgeYM(inputs.dob, inputs.measureDate) : null;

  // Raw inputs for display
  const sorted = [...maturationEntries].sort((a, b) => new Date(b.date) - new Date(a.date));
  const latest = sorted[0];
  const stature = latest?.standingHeight ?? latest?.stature ?? null;
  const bodyMass = latest?.bodyMass ?? null;

  const pahDisplay = mat ? `${mat.pah} cm` : '—';
  const pahPctDisplay = mat && mat.pahPct <= 100 ? `${mat.pahPct}%` : '—';
  const remainingDisplay = mat && mat.remainingGrowth > 0 ? `${mat.remainingGrowth} cm` : '—';
  const stage = mat?.stage || null;
  const stageStyle = stage ? STAGE_STYLE[stage] : null;

  const rows = [
    ['Measurement Date',                      inputs?.measureDate ? formatShortDate(inputs.measureDate) : '—'],
    ['Age at Measurement',                    ageYM ? `${ageYM.years}y ${ageYM.months}m` : '—'],
    ['Standing Height',                       stature ? `${stature} cm` : '—'],
    ['Body Mass',                             bodyMass ? `${bodyMass} kg` : '—'],
    ['Predicted Adult Height (Khamis-Roche)', pahDisplay],
    ['% of Predicted Adult Height',           pahPctDisplay],
    ['Remaining Growth',                      remainingDisplay],
    ['Maturation Stage',                      stage || '—'],
  ];

  return (
    <div className="flex flex-wrap gap-6 items-start">
      {/* Data table */}
      <div className="flex-1 min-w-[220px] border border-gray-100 rounded-xl overflow-hidden">
        {rows.map(([k, v], i) => (
          <div key={k} className="flex items-center justify-between px-4 py-2.5"
            style={{ backgroundColor: i % 2 === 0 ? '#fff' : '#f9fafb' }}>
            <span className="text-xs text-gray-500">{k}</span>
            <span className="text-xs font-semibold text-gray-800">{v}</span>
          </div>
        ))}
      </div>

      {/* Stage badge */}
      {stage && stageStyle && (
        <div className="rounded-xl border border-gray-100 p-5 min-w-[180px] max-w-[220px]"
          style={{ backgroundColor: stageStyle.bg }}>
          <p className="text-xs font-bold uppercase tracking-wide mb-2" style={{ color: stageStyle.text }}>
            {stage}
          </p>
          {mat && mat.pahPct <= 100 && (
            <p className="text-2xl font-bold mb-2" style={{ color: stageStyle.text }}>
              {mat.pahPct}%
            </p>
          )}
          <p className="text-xs leading-relaxed" style={{ color: stageStyle.text }}>
            {STAGE_EXPLAINER[stage]}
          </p>
        </div>
      )}
    </div>
  );
}

// ─── Section 3: Physio Screen ────────────────────────────────────────────────

function PhysioSection({ physioEntries }) {
  const assessments = (physioEntries || []).filter(e => e.noteType === 'Assessment');
  if (!assessments.length) {
    return <NoAssessment msg="No physio assessment recorded yet." />;
  }
  const entry    = [...assessments].sort((a, b) => new Date(b.date) - new Date(a.date))[0];
  const assessor = entry.assessor || entry.staff || '—';
  const noteText = entry.notes || '—';

  return (
    <div className="border border-gray-100 rounded-xl p-5 space-y-3">
      <div className="flex items-center gap-3 flex-wrap">
        <span className="text-sm font-semibold text-gray-700">{formatShortDate(entry.date)}</span>
        <span className="text-xs text-gray-500">{assessor}</span>
        <NoteTag type={entry.noteType} />
      </div>
      <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-wrap">{renderBold(noteText)}</p>
    </div>
  );
}

// ─── Sections 4 & 5: Pillar Assessment (Lifestyle / Nutrition) ───────────────

function PillarAssessmentSection({ entries, emptyMsg }) {
  const assessments = (entries || []).filter(e => e.entryType === 'Assessment');
  if (!assessments.length) return <NoAssessment msg={emptyMsg} />;

  const entry = [...assessments].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))[0];

  return (
    <div className="border border-gray-100 rounded-xl p-5 space-y-3">
      <div className="flex items-center gap-3 flex-wrap">
        <span className="text-sm font-semibold text-gray-700">{formatTimestamp(entry.timestamp)}</span>
        <span className="text-xs text-gray-500">{entry.staff || '—'}</span>
        <NoteTag type={entry.entryType} />
      </div>
      <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-wrap">{renderBold(entry.note || '—')}</p>
    </div>
  );
}

// ─── Section 6: Performance Testing ──────────────────────────────────────────

function PerformanceSection({ performanceEntries, bragRatings, onSaveBrag, customMetrics = {} }) {
  const [localBrag, setLocalBrag] = useState(() => ({ ...bragRatings }));

  const handleBragChange = (key, color) => {
    setLocalBrag(prev => ({ ...prev, [key]: color }));
    onSaveBrag?.(key, color);
  };

  const metricKeys = Object.keys(performanceEntries || {})
    .filter(k => (performanceEntries[k] || []).length > 0);

  if (!metricKeys.length) {
    return <NoAssessment msg="No performance data recorded yet." />;
  }

  return (
    <div className="border border-gray-100 rounded-xl overflow-hidden">
      <table className="w-full text-xs border-collapse">
        <thead>
          <tr style={{ backgroundColor: '#f9fafb' }}>
            {['Metric', 'Previous', 'Current', 'Change', 'BRAG Rating'].map(h => (
              <th key={h} className="px-4 py-3 text-left font-semibold text-gray-500 uppercase tracking-wide text-xs border-b border-gray-100">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {metricKeys.map((key, ri) => {
            const list     = [...(performanceEntries[key] || [])].sort((a, b) => new Date(b.date) - new Date(a.date));
            const current  = list[0] ?? null;
            const previous = list[1] ?? null;
            const mDef     = METRIC_MAP[key] || customMetrics[key];
            const label    = LABEL_OVERRIDES[key] || mDef?.label || key;
            const unit     = mDef?.unit ? ` ${mDef.unit}` : '';
            const lowerBetter = LOWER_IS_BETTER.has(key);

            // Change calculation
            const currScalar = extractScalar(current);
            const prevScalar = extractScalar(previous);
            let changeNode   = <span className="text-gray-300">—</span>;
            if (currScalar != null && prevScalar != null && prevScalar !== 0) {
              const absChange = currScalar - prevScalar;
              const pctChange = (absChange / Math.abs(prevScalar)) * 100;
              const improved  = lowerBetter ? absChange < 0 : absChange > 0;
              const color     = absChange === 0 ? '#6b7280' : improved ? '#15803d' : '#b91c1c';
              const sign      = absChange > 0 ? '+' : '';
              changeNode = (
                <span style={{ color, fontWeight: 600 }}>
                  {sign}{absChange.toFixed(1)}{unit} ({sign}{pctChange.toFixed(1)}%)
                </span>
              );
            }

            // BRAG
            const brag    = localBrag[key] || 'grey';
            const bragOpt = BRAG_OPTIONS.find(o => o.value === brag) || BRAG_OPTIONS[0];

            return (
              <tr key={key} style={{ backgroundColor: ri % 2 === 0 ? '#fff' : '#f9fafb' }}>
                <td className="px-4 py-3 font-medium text-gray-800">{label}</td>
                <td className="px-4 py-3 text-gray-400">{fmtEntry(previous, mDef)}</td>
                <td className="px-4 py-3 text-gray-800 font-medium">{fmtEntry(current, mDef)}</td>
                <td className="px-4 py-3">{changeNode}</td>
                <td className="px-4 py-3">
                  <select
                    value={brag}
                    onChange={e => handleBragChange(key, e.target.value)}
                    className="text-xs font-semibold px-2 py-1 rounded border-0 focus:outline-none cursor-pointer"
                    style={{ backgroundColor: bragOpt.bg, color: bragOpt.text }}
                  >
                    {BRAG_OPTIONS.map(o => (
                      <option key={o.value} value={o.value}>{o.label}</option>
                    ))}
                  </select>
                  {/* Plain-text fallback for print */}
                  <span className="print-only text-xs font-semibold px-2 py-1 rounded"
                    style={{ backgroundColor: bragOpt.bg, color: bragOpt.text }}>
                    {bragOpt.label}
                  </span>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

// ─── Section 7: Areas to Address ─────────────────────────────────────────────

const PILLARS = [
  { key: 'physical',  label: 'Physical',     workingOnPath: p2 => p2?.physical?.workingOn },
  { key: 'psych',     label: 'Psychological', workingOnPath: p2 => p2?.psych?.workingOn },
  { key: 'nutrition', label: 'Nutritional',  workingOnPath: p2 => p2?.nutrition?.workingOn },
  { key: 'lifestyle', label: 'Lifestyle',    workingOnPath: p2 => p2?.lifestyle?.workingOn },
];

function AreasToAddressSection({ phase2 }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      {PILLARS.map(({ key, label, workingOnPath }) => {
        const items = (workingOnPath(phase2) || []).filter(c => c.title || c.description);
        return (
          <div key={key} className="border border-gray-100 rounded-xl p-5">
            <h3 className="text-xs font-bold uppercase tracking-widest text-gray-600 mb-3 pb-2 border-b border-gray-50">
              {label}
            </h3>
            {items.length > 0 ? (
              <div className="space-y-3">
                {items.map((card, i) => (
                  <div key={i}>
                    {card.title && (
                      <p className="text-xs font-semibold text-gray-800 mb-0.5">{card.title}</p>
                    )}
                    {card.description && (
                      <p className="text-xs text-gray-500 leading-relaxed">{card.description}</p>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs italic text-gray-300">—</p>
            )}
          </div>
        );
      })}
    </div>
  );
}

// ─── Main export ──────────────────────────────────────────────────────────────

export default function ReportTab({ athlete, phase2, onSaveBrag }) {
  const { customMetrics } = useCustomMetrics();
  const handlePrint = () => {
    const canvases = document.querySelectorAll('#report-content canvas');
    const restorations = [];
    canvases.forEach(canvas => {
      try {
        const img = document.createElement('img');
        img.src = canvas.toDataURL('image/png');
        img.style.cssText = canvas.style.cssText;
        img.width  = canvas.offsetWidth  || canvas.width;
        img.height = canvas.offsetHeight || canvas.height;
        canvas.parentNode.insertBefore(img, canvas);
        canvas.style.display = 'none';
        restorations.push({ canvas, img });
      } catch (_) { /* cross-origin canvas: skip */ }
    });
    window.addEventListener('afterprint', () => {
      restorations.forEach(({ canvas, img }) => { canvas.style.display = ''; img.remove(); });
    }, { once: true });
    window.print();
  };

  const cohortStyle = COHORT_CONFIG[athlete.cohort] || COHORT_CONFIG['Elite'];
  const today = formatDate(new Date().toISOString());

  return (
    <div>
      {/* Print button */}
      <div className="flex flex-col items-end mb-6 no-print gap-1">
        <button onClick={handlePrint}
          className="flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-white rounded-lg hover:opacity-90 transition-opacity"
          style={{ backgroundColor: '#A58D69' }}>
          <Download size={15} /> Download Report
        </button>
        <p className="text-xs text-gray-400">Select 'Save as PDF' in the print dialog to download</p>
      </div>

      <div id="report-content" className="bg-white rounded-xl border border-gray-100 max-w-4xl mx-auto">

        {/* ── Cover Page ─────────────────────────────────────────────── */}
        <div className="report-cover flex flex-col justify-between p-14"
          style={{ minHeight: '1000px', backgroundColor: '#ffffff' }}>

          {/* Top block: logo + rule + label */}
          <div>
            <div className="inline-block rounded-lg p-6 mb-6" style={{ backgroundColor: '#1C1C1C' }}>
              <img src={logoPath} alt="ProPath Academy" style={{ width: '180px', objectFit: 'contain' }} />
            </div>
            <div style={{ height: '1px', backgroundColor: '#A58D69', width: '100%' }} className="mb-6" />
            <p className="text-xs font-semibold uppercase tracking-[0.25em]"
              style={{ color: '#437E8D' }}>
              ProPath Academy Assessment
            </p>
          </div>

          {/* Middle block: athlete name + cohort + sport */}
          <div className="my-16">
            <h1 className="cover-athlete-name font-bold leading-tight mb-6"
              style={{ color: '#1C1C1C', fontSize: '44px' }}>
              {athlete.name}
            </h1>
            <div className="flex items-center gap-4">
              <span className="text-xs font-bold px-3 py-1 rounded uppercase tracking-wide"
                style={{ backgroundColor: cohortStyle.bg, color: cohortStyle.text }}>
                {athlete.cohort || 'Elite'}
              </span>
              <span className="text-base" style={{ color: '#6b7280' }}>{athlete.sport}</span>
            </div>
          </div>

          {/* Bottom block: date of report */}
          <div>
            <p className="text-xs uppercase tracking-widest mb-1" style={{ color: '#9ca3af' }}>
              Date of Report
            </p>
            <p className="text-base font-semibold" style={{ color: '#1C1C1C' }}>{today}</p>
          </div>
        </div>

        {/* ── Content pages ──────────────────────────────────────────── */}
        <div className="p-10">

        {/* ── Section 1: Header (for on-screen view of content pages) ─ */}
        <div className="flex items-start justify-between pb-7 mb-10 border-b-2 no-print" style={{ borderColor: '#A58D69' }}>
          <div className="flex items-center gap-5">
            <div className="w-20 h-20 rounded-full overflow-hidden flex items-center justify-center shrink-0"
              style={{ backgroundColor: '#111827' }}>
              {athlete.photo
                ? <img src={athlete.photo} alt={athlete.name} className="w-full h-full object-cover" />
                : <InitialsAvatar name={athlete.name} size="xl" />}
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest mb-1" style={{ color: '#A58D69' }}>
                ProPath Academy · Abu Dhabi
              </p>
              <h1 className="text-2xl font-bold text-gray-900">{athlete.name}</h1>
              <div className="flex items-center gap-3 mt-1.5">
                <span className="text-xs font-bold px-2.5 py-1 rounded uppercase tracking-wide"
                  style={{ backgroundColor: cohortStyle.bg, color: cohortStyle.text }}>
                  {athlete.cohort || 'Elite'}
                </span>
                <span className="text-sm text-gray-500">{athlete.sport}</span>
              </div>
            </div>
          </div>
          <div className="text-right shrink-0">
            <p className="text-xs text-gray-400 mb-0.5">Date of Report</p>
            <p className="text-sm font-semibold text-gray-700">{today}</p>
          </div>
        </div>

        {/* ── Section 2: Maturation ───────────────────────────────── */}
        <Section title="Maturation">
          <MaturationSection
            athlete={athlete}
            maturationEntries={phase2?.maturation?.entries}
          />
        </Section>

        {/* ── Section 3: Physio Screen ────────────────────────────── */}
        <Section title="Physio Screen">
          <PhysioSection physioEntries={phase2?.physio?.entries} />
        </Section>

        {/* ── Section 4: Lifestyle ────────────────────────────────── */}
        <Section title="Lifestyle">
          <PillarAssessmentSection
            entries={athlete.ragLog?.lifestyle}
            emptyMsg="No lifestyle assessment recorded yet."
          />
        </Section>

        {/* ── Section 5: Nutrition ────────────────────────────────── */}
        <Section title="Nutrition">
          <PillarAssessmentSection
            entries={athlete.ragLog?.nutrition}
            emptyMsg="No nutrition assessment recorded yet."
          />
        </Section>

        {/* ── Section 6: Performance Testing ─────────────────────── */}
        <Section title="Performance Testing">
          <PerformanceSection
            performanceEntries={phase2?.performance?.entries || {}}
            bragRatings={phase2?.performanceBrag || {}}
            onSaveBrag={onSaveBrag}
            customMetrics={customMetrics}
          />
        </Section>

        {/* ── Section 7: Areas to Address ────────────────────────── */}
        <Section title="Areas to Address">
          <AreasToAddressSection phase2={phase2} />
        </Section>

        </div>{/* /p-10 content wrapper */}
      </div>
    </div>
  );
}
