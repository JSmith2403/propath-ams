import { useState } from 'react';
import { Download } from 'lucide-react';
import InitialsAvatar from '../InitialsAvatar';
import { RAG_CONFIG, RAG_DOMAINS, COHORT_CONFIG } from '../../data/athletes';
import { PERFORMANCE_METRICS } from '../../data/referenceData';

// ─── Date helpers ──────────────────────────────────────────────────────────────

function formatDate(d) {
  if (!d) return '—';
  return new Date(d).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
}

function formatShortDate(d) {
  if (!d) return '—';
  return new Date(d).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
}

// ─── Maturation calculation helpers (Khamis-Roche) ────────────────────────────

function getHeight(entry) { return entry?.standingHeight ?? entry?.stature ?? null; }

function calcAgeDecimal(dob, measureDate) {
  return (new Date(measureDate) - new Date(dob)) / (365.25 * 24 * 60 * 60 * 1000);
}

function calcAgeYM(dob, measureDate) {
  const d1 = new Date(dob);
  const d2 = new Date(measureDate);
  let years = d2.getFullYear() - d1.getFullYear();
  let months = d2.getMonth() - d1.getMonth();
  if (d2.getDate() < d1.getDate()) months--;
  if (months < 0) { years--; months += 12; }
  return { years, months };
}

function calcPAH(sex, stature, fatherHeight, motherHeight, mass, ageDecimal) {
  const s = parseFloat(stature);
  const f = parseFloat(fatherHeight);
  const m = parseFloat(motherHeight);
  const b = parseFloat(mass);
  const a = parseFloat(ageDecimal);
  if ([s, f, m, b, a].some(v => isNaN(v) || v <= 0)) return null;
  if (sex === 'Female') {
    return (0.369 * s) + (0.271 * f) + (0.306 * m) + (0.037 * b) - (0.009 * a * a) + 8.96;
  }
  return (0.378 * s) + (0.308 * f) + (0.270 * m) + (0.054 * b) - (0.016 * a * a) + 12.13;
}

const SEE = { Male: 2.1, Female: 1.7 };

function calcCI(pah, sex, zScore) {
  if (!pah) return null;
  const margin = (SEE[sex] || SEE.Male) * zScore;
  return { low: (pah - margin).toFixed(1), high: (pah + margin).toFixed(1) };
}

function calcStage(pahPct) {
  if (pahPct == null) return null;
  if (pahPct < 88)  return 'Pre PHV';
  if (pahPct <= 95) return 'Circa PHV';
  return 'Post PHV';
}

const STAGE_COLORS = {
  'Pre PHV':   { bg: '#ccfbf1', text: '#0f766e' },
  'Circa PHV': { bg: '#fef3c7', text: '#92400e' },
  'Post PHV':  { bg: '#e5e7eb', text: '#374151' },
};

// ─── BRAG config ───────────────────────────────────────────────────────────────

const BRAG_OPTIONS = [
  { value: 'grey',  label: 'No Assessment', bg: '#9ca3af' },
  { value: 'blue',  label: 'Exceeding',     bg: '#3b82f6' },
  { value: 'green', label: 'Meeting',        bg: '#22c55e' },
  { value: 'amber', label: 'Below',          bg: '#f59e0b' },
  { value: 'red',   label: 'Well Below',     bg: '#ef4444' },
];

// ─── Section wrapper ───────────────────────────────────────────────────────────

function Section({ title, children }) {
  return (
    <div className="mb-8 break-inside-avoid">
      <div className="flex items-center gap-3 mb-4">
        <h2 className="text-sm font-bold uppercase tracking-widest" style={{ color: '#1C1C1C' }}>{title}</h2>
        <div className="flex-1 h-px" style={{ backgroundColor: '#A58D69' }} />
      </div>
      {children}
    </div>
  );
}

function NoData() {
  return <p className="text-xs italic text-gray-300">No data entered yet.</p>;
}

// ─── 1. Maturation ─────────────────────────────────────────────────────────────

function MaturationSection({ athlete, maturationEntries }) {
  if (!maturationEntries?.length) return <NoData />;

  const sorted = [...maturationEntries].sort((a, b) => new Date(b.date) - new Date(a.date));
  const latest = sorted[0];
  const stature = getHeight(latest);
  const { bodyMass, motherHeight, fatherHeight, date: measureDate } = latest;
  const dob  = athlete.dob;
  const sex  = athlete.sex;

  const ageDecimal = dob && measureDate ? calcAgeDecimal(dob, measureDate) : null;
  const ageYM      = dob && measureDate ? calcAgeYM(dob, measureDate) : null;
  const pah        = (sex && stature && motherHeight && fatherHeight && bodyMass && ageDecimal)
    ? calcPAH(sex, stature, fatherHeight, motherHeight, bodyMass, ageDecimal)
    : null;
  const pahPct     = pah && stature ? (parseFloat(stature) / pah) * 100 : null;
  const stage      = calcStage(pahPct);
  const ci50       = pah ? calcCI(pah, sex === 'Female' ? 'Female' : 'Male', 0.674) : null;
  const ci90       = pah ? calcCI(pah, sex === 'Female' ? 'Female' : 'Male', 1.645) : null;
  const remaining  = pah && stature ? (pah - parseFloat(stature)).toFixed(1) : null;
  const stageStyle = stage ? STAGE_COLORS[stage] : null;

  const rows = [
    ['Measurement Date',      measureDate ? formatShortDate(measureDate) : '—'],
    ['Age',                   ageYM ? `${ageYM.years}y ${ageYM.months}m` : '—'],
    ['Standing Height',       stature ? `${stature} cm` : '—'],
    ['Body Mass',             bodyMass ? `${bodyMass} kg` : '—'],
    ['PAH (Khamis-Roche)',    pah  ? `${pah.toFixed(1)} cm` : '—'],
    ['50% CI',                ci50 ? `${ci50.low}–${ci50.high} cm` : '—'],
    ['90% CI',                ci90 ? `${ci90.low}–${ci90.high} cm` : '—'],
    ['% of PAH',              pahPct ? `${pahPct.toFixed(1)}%` : '—'],
    ['Remaining Growth',      remaining ? `${remaining} cm` : '—'],
    ['Maturation Stage',      stage || '—'],
  ];

  return (
    <div className="flex flex-wrap gap-6 items-start">
      <div className="space-y-1 flex-1 min-w-[200px]">
        {rows.map(([k, v]) => (
          <div key={k} className="flex items-center justify-between py-1 border-b border-gray-50">
            <span className="text-xs text-gray-500">{k}</span>
            <span className="text-xs font-semibold text-gray-800">{v}</span>
          </div>
        ))}
      </div>
      {stage && stageStyle && (
        <div className="rounded-xl border border-gray-100 p-4 min-w-[160px]" style={{ backgroundColor: stageStyle.bg }}>
          <p className="text-xs font-bold uppercase tracking-wide mb-1" style={{ color: stageStyle.text }}>{stage}</p>
          <p className="text-xs" style={{ color: stageStyle.text, opacity: 0.85 }}>
            {pahPct ? `${pahPct.toFixed(1)}% of PAH` : ''}
          </p>
        </div>
      )}
    </div>
  );
}

// ─── 2. RAG Rating Summary ─────────────────────────────────────────────────────

const WORKING_ON_FOR = (domain, phase2) => {
  if (domain === 'psych')      return phase2?.psych?.workingOn;
  if (domain === 'nutrition')  return phase2?.nutrition?.workingOn;
  if (domain === 'physical')   return phase2?.physical?.workingOn;
  if (domain === 'lifestyle')  return phase2?.lifestyle?.workingOn;
  return null;
};

function RagSummarySection({ athlete, phase2 }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      {RAG_DOMAINS.map(({ key, label }) => {
        const status     = athlete.rag?.[key] || 'grey';
        const cfg        = RAG_CONFIG[status];
        const workingOn  = WORKING_ON_FOR(key, phase2) || [];
        const hasAny     = workingOn.some(c => c.title || c.description);

        return (
          <div key={key} className="border border-gray-100 rounded-xl p-4 space-y-3">
            {/* Header */}
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wide text-gray-700">{label}</span>
              <div className="flex items-center gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: cfg.color }} />
                <span className="text-xs font-medium text-gray-600">{cfg.label}</span>
              </div>
            </div>
            {/* Working On areas */}
            {hasAny ? (
              <div className="space-y-2">
                {workingOn.map((card, i) => (
                  card.title || card.description ? (
                    <div key={i} className="text-xs">
                      {card.title && <p className="font-semibold text-gray-700">{card.title}</p>}
                      {card.description && <p className="text-gray-500 leading-relaxed">{card.description}</p>}
                    </div>
                  ) : null
                ))}
              </div>
            ) : (
              <p className="text-xs italic text-gray-300">No areas recorded yet.</p>
            )}
          </div>
        );
      })}
    </div>
  );
}

// ─── 3. Physio Findings ────────────────────────────────────────────────────────

function PhysioFindingsSection({ physioEntries }) {
  if (!physioEntries?.length) return <NoData />;

  const sorted = [...physioEntries].sort((a, b) => new Date(b.date) - new Date(a.date));
  const entry  = sorted[0];

  const assessor  = entry.assessor || entry.staff || '—';
  const noteType  = entry.noteType || (entry.metric ? 'Screen' : null);
  const noteText  = entry.notes || (entry.metric ? `${entry.metric}${entry.value ? ': ' + entry.value : ''}` : '—');

  return (
    <div className="border border-gray-100 rounded-xl p-4 space-y-2">
      <div className="flex items-center gap-3 flex-wrap">
        <span className="text-xs font-semibold text-gray-700">{formatShortDate(entry.date)}</span>
        <span className="text-xs text-gray-400">{assessor}</span>
        {noteType && (
          <span className="text-xs font-semibold px-2 py-0.5 rounded"
            style={{ backgroundColor: 'rgba(67,126,141,0.1)', color: '#085777' }}>
            {noteType}
          </span>
        )}
      </div>
      <p className="text-xs text-gray-600 leading-relaxed whitespace-pre-wrap">{noteText}</p>
    </div>
  );
}

// ─── 4. Performance Testing ────────────────────────────────────────────────────

function formatPerfVal(metricKey, entry) {
  if (!entry) return '—';
  if (entry.left != null || entry.right != null) {
    const l = entry.left  != null ? entry.left  : '—';
    const r = entry.right != null ? entry.right : '—';
    return `L: ${l} / R: ${r}`;
  }
  if (entry.value != null) {
    const meta = PERFORMANCE_METRICS[metricKey];
    return meta?.unit ? `${entry.value} ${meta.unit}` : `${entry.value}`;
  }
  // multi-field entries (sprint splits, bleep, etc.)
  const parts = [];
  if (entry.split5m  != null) parts.push(`5m: ${entry.split5m}s`);
  if (entry.split10m != null) parts.push(`10m: ${entry.split10m}s`);
  if (entry.split20m != null) parts.push(`20m: ${entry.split20m}s`);
  if (entry.split30m != null) parts.push(`30m: ${entry.split30m}s`);
  if (entry.level    != null) parts.push(`Level ${entry.level}.${entry.shuttle ?? 0}`);
  if (entry.vo2max   != null) parts.push(`VO₂max: ${entry.vo2max}`);
  return parts.join(' / ') || '—';
}

const BRAG_COLORS = {
  grey:  { bg: '#e5e7eb', text: '#374151' },
  blue:  { bg: '#dbeafe', text: '#1d4ed8' },
  green: { bg: '#dcfce7', text: '#15803d' },
  amber: { bg: '#fef3c7', text: '#92400e' },
  red:   { bg: '#fee2e2', text: '#b91c1c' },
};

function PerformanceTestingSection({ performanceEntries, bragRatings, onSaveBrag }) {
  const [localBrag, setLocalBrag] = useState(() => ({ ...bragRatings }));

  const handleBragChange = (metricKey, color) => {
    setLocalBrag(prev => ({ ...prev, [metricKey]: color }));
    onSaveBrag?.(metricKey, color);
  };

  // Collect metric keys that have at least one entry
  const metricKeys = Object.keys(performanceEntries || {})
    .filter(k => (performanceEntries[k] || []).length > 0);

  if (metricKeys.length === 0) return <NoData />;

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-xs border-collapse">
        <thead>
          <tr style={{ backgroundColor: '#f9fafb' }}>
            <th className="px-3 py-2 text-left font-semibold text-gray-500">Metric</th>
            <th className="px-3 py-2 text-left font-semibold text-gray-500">Previous</th>
            <th className="px-3 py-2 text-left font-semibold text-gray-500">Current</th>
            <th className="px-3 py-2 text-center font-semibold text-gray-500 w-36 no-print">BRAG Rating</th>
            <th className="px-3 py-2 text-center font-semibold text-gray-500 w-20 print-only" style={{ display: 'none' }}>BRAG</th>
          </tr>
        </thead>
        <tbody>
          {metricKeys.map(key => {
            const list    = [...(performanceEntries[key] || [])].sort((a, b) => new Date(b.date) - new Date(a.date));
            const current  = list[0] || null;
            const previous = list[1] || null;
            const brag     = localBrag[key] || 'grey';
            const bragStyle = BRAG_COLORS[brag] || BRAG_COLORS.grey;
            const meta     = PERFORMANCE_METRICS[key];
            const label    = meta?.label || key;

            return (
              <tr key={key} className="border-t border-gray-50">
                <td className="px-3 py-2.5 font-medium text-gray-700">{label}</td>
                <td className="px-3 py-2.5 text-gray-400">{formatPerfVal(key, previous)}</td>
                <td className="px-3 py-2.5 text-gray-700">{formatPerfVal(key, current)}</td>
                <td className="px-3 py-2.5 text-center no-print">
                  <select
                    value={brag}
                    onChange={e => handleBragChange(key, e.target.value)}
                    className="text-xs font-semibold px-2 py-1 rounded border-0 focus:outline-none cursor-pointer"
                    style={{ backgroundColor: bragStyle.bg, color: bragStyle.text }}
                  >
                    {BRAG_OPTIONS.map(o => (
                      <option key={o.value} value={o.value}>{o.label}</option>
                    ))}
                  </select>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

// ─── Main export ───────────────────────────────────────────────────────────────

export default function ReportTab({ athlete, phase2, onSaveBrag }) {
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
      restorations.forEach(({ canvas, img }) => {
        canvas.style.display = '';
        img.remove();
      });
    }, { once: true });

    window.print();
  };

  const cohortStyle = COHORT_CONFIG[athlete.cohort] || COHORT_CONFIG['Elite'];
  const today = formatDate(new Date().toISOString());

  return (
    <div>
      <div className="flex justify-end mb-6 no-print">
        <button onClick={handlePrint}
          className="flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-white rounded-lg hover:opacity-90"
          style={{ backgroundColor: '#A58D69' }}>
          <Download size={15} /> Download Report
        </button>
      </div>

      <div id="report-content" className="bg-white rounded-xl border border-gray-100 p-10 max-w-4xl mx-auto">

        {/* Header */}
        <div className="flex items-start justify-between pb-6 mb-8 border-b-2" style={{ borderColor: '#A58D69' }}>
          <div className="flex items-center gap-5">
            <div className="w-20 h-20 rounded-full overflow-hidden flex items-center justify-center" style={{ backgroundColor: '#111827' }}>
              {athlete.photo
                ? <img src={athlete.photo} alt={athlete.name} className="w-full h-full object-cover" />
                : <InitialsAvatar name={athlete.name} size="xl" />}
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest mb-1" style={{ color: '#A58D69' }}>ProPath Academy · Abu Dhabi</p>
              <h1 className="text-2xl font-bold text-gray-900">{athlete.name}</h1>
              <div className="flex items-center gap-3 mt-1">
                <span className="text-xs font-bold px-2.5 py-1 rounded uppercase tracking-wide"
                  style={{ backgroundColor: cohortStyle.bg, color: cohortStyle.text }}>{athlete.cohort || 'Elite'}</span>
                <span className="text-sm text-gray-500">{athlete.sport}</span>
              </div>
            </div>
          </div>
          <div className="text-right">
            <p className="text-xs text-gray-400">Date of Report</p>
            <p className="text-sm font-semibold text-gray-700">{today}</p>
          </div>
        </div>

        {/* 1. Maturation */}
        <Section title="Maturation">
          <MaturationSection
            athlete={athlete}
            maturationEntries={phase2?.maturation?.entries}
          />
        </Section>

        {/* 2. RAG Rating Summary */}
        <Section title="RAG Rating Summary">
          <RagSummarySection athlete={athlete} phase2={phase2} />
        </Section>

        {/* 3. Physio Findings */}
        <Section title="Physio Findings">
          <PhysioFindingsSection physioEntries={phase2?.physio?.entries} />
        </Section>

        {/* 4. Performance Testing */}
        <Section title="Performance Testing">
          <PerformanceTestingSection
            performanceEntries={phase2?.performance?.entries || {}}
            bragRatings={phase2?.performanceBrag || {}}
            onSaveBrag={onSaveBrag}
          />
        </Section>

      </div>
    </div>
  );
}
