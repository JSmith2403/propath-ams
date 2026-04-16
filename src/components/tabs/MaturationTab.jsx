import { useMemo } from 'react';
import { calculateAthleteMaturation, calcAgeYM } from '../../utils/maturation';

const STAGE_COLORS = {
  'Pre-PHV':   { bg: '#ccfbf1', text: '#0f766e', dot: '#14b8a6', zone: '#99f6e4' },
  'Circa-PHV': { bg: '#fef3c7', text: '#92400e', dot: '#f59e0b', zone: '#fde68a' },
  'Post-PHV':  { bg: '#e5e7eb', text: '#374151', dot: '#6b7280', zone: '#d1d5db' },
};

const STAGE_NOTES = {
  'Pre-PHV':   'Ideal window for building movement foundations, coordination and fundamental athletic skills.',
  'Circa-PHV': 'Rapid growth phase. Increased injury risk. Prioritise movement control and technique with adapted load.',
  'Post-PHV':  'Growth stabilised. Develop strength, power and physical robustness with progressively higher loads.',
};

function birthQuarter(dob) {
  if (!dob) return null;
  const m = new Date(dob).getMonth() + 1;
  if (m <= 3) return 'Q1 (Jan–Mar)';
  if (m <= 6) return 'Q2 (Apr–Jun)';
  if (m <= 9) return 'Q3 (Jul–Sep)';
  return 'Q4 (Oct–Dec)';
}

function fmt1(v) {
  const n = parseFloat(v);
  return isNaN(n) ? '—' : n.toFixed(1);
}

function fmtDate(d) {
  if (!d) return '—';
  return new Date(d).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
}

// Extract biometric fields from a maturation entry (handles legacy 'stature' field)
function getHeight(entry) { return entry?.standingHeight ?? entry?.stature ?? null; }

// ─── Cohort Timeline ──────────────────────────────────────────────────────────

const MIN_PCT = 80, MAX_PCT = 105;
function timelinePos(pct) {
  return Math.min(100, Math.max(0, ((pct - MIN_PCT) / (MAX_PCT - MIN_PCT)) * 100));
}

const ZONE_PRE_END   = timelinePos(88);
const ZONE_CIRCA_END = timelinePos(95);

function CohortTimeline({ allAthletes, currentAthleteId }) {
  const cohortData = useMemo(() => {
    return allAthletes
      .map(a => {
        const mat = calculateAthleteMaturation(a);
        if (!mat) return null;
        return { id: a.id, name: a.name, pahPct: mat.pahPct, stage: mat.stage };
      })
      .filter(Boolean)
      .sort((a, b) => a.pahPct - b.pahPct);
  }, [allAthletes]);

  if (cohortData.length === 0) return null;

  // Offset overlapping labels vertically
  const labelRows = [];
  cohortData.forEach(ath => {
    const pos = timelinePos(ath.pahPct);
    let row = 0;
    while (labelRows[row] !== undefined && Math.abs(labelRows[row] - pos) < 8) row++;
    labelRows[row] = pos;
    ath._row = row;
  });
  const totalRows = Math.max(...cohortData.map(a => a._row)) + 1;
  const markerAreaH = totalRows * 22 + 10;

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
      <h3 className="font-semibold text-[#1C1C1C] text-sm uppercase tracking-wide mb-1">
        Cohort Maturation Timeline
      </h3>
      <p className="text-xs text-gray-400 mb-5">
        Horizontal scale {MIN_PCT}%–{MAX_PCT}% of Predicted Adult Height
      </p>

      <div style={{ position: 'relative', width: '100%', userSelect: 'none' }}>
        {/* Zone bar */}
        <div style={{ position: 'relative', height: 20, borderRadius: 6, overflow: 'hidden', display: 'flex' }}>
          <div style={{ width: `${ZONE_PRE_END}%`,                 backgroundColor: '#5eead4', flexShrink: 0 }} title="Pre PHV" />
          <div style={{ width: `${ZONE_CIRCA_END - ZONE_PRE_END}%`, backgroundColor: '#fde68a', flexShrink: 0 }} title="Circa PHV" />
          <div style={{ flex: 1,                                    backgroundColor: '#d1d5db' }}               title="Post PHV" />
        </div>

        {/* Scale tick labels */}
        <div style={{ position: 'relative', height: 14, marginTop: 2 }}>
          {[80, 85, 88, 90, 95, 100, 105].map(pct => (
            <span key={pct} style={{
              position: 'absolute', left: `${timelinePos(pct)}%`,
              transform: 'translateX(-50%)', fontSize: 9, color: '#9ca3af',
            }}>
              {pct}%
            </span>
          ))}
        </div>

        {/* Athlete markers */}
        <div style={{ position: 'relative', height: markerAreaH, marginTop: 4 }}>
          {cohortData.map(ath => {
            const pos        = timelinePos(ath.pahPct);
            const isCurrent  = ath.id === currentAthleteId;
            const stageColor = STAGE_COLORS[ath.stage] || STAGE_COLORS['Pre-PHV'];
            const topOffset  = ath._row * 22;
            return (
              <div key={ath.id} style={{
                position: 'absolute',
                left: `${pos}%`,
                top: topOffset,
                transform: 'translateX(-50%)',
                display: 'flex', flexDirection: 'column', alignItems: 'center',
                gap: 2,
              }}>
                {/* Connecting line to bar */}
                <div style={{
                  width: 1,
                  height: 6 + ath._row * 0,
                  backgroundColor: isCurrent ? '#A58D69' : stageColor.dot,
                  opacity: 0.5,
                }} />
                <div style={{
                  width: isCurrent ? 10 : 7,
                  height: isCurrent ? 10 : 7,
                  borderRadius: '50%',
                  backgroundColor: isCurrent ? '#A58D69' : stageColor.dot,
                  border: isCurrent ? '2px solid #A58D69' : '1.5px solid white',
                  boxShadow: isCurrent ? '0 0 0 2px rgba(165,141,105,0.25)' : 'none',
                  flexShrink: 0,
                }} />
                <span style={{
                  fontSize: 9,
                  fontWeight: isCurrent ? 800 : 500,
                  color: isCurrent ? '#A58D69' : '#374151',
                  whiteSpace: 'nowrap',
                  backgroundColor: isCurrent ? 'rgba(165,141,105,0.08)' : 'transparent',
                  padding: '0 2px', borderRadius: 2,
                }}>
                  {ath.name.split(' ')[0]}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-4 mt-3 pt-3 border-t border-gray-100">
        {[
          { label: 'Pre PHV (<88%)',     color: '#5eead4' },
          { label: 'Circa PHV (88–95%)', color: '#fde68a' },
          { label: 'Post PHV (>95%)',    color: '#d1d5db' },
        ].map(({ label, color }) => (
          <div key={label} className="flex items-center gap-1.5">
            <div style={{ width: 10, height: 10, borderRadius: 2, backgroundColor: color, flexShrink: 0 }} />
            <span className="text-xs text-gray-500">{label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Stat card ────────────────────────────────────────────────────────────────
function StatCard({ label, children }) {
  return (
    <div className="bg-gray-50 rounded-xl border border-gray-100 p-4 flex flex-col gap-1">
      <span className="text-xs font-semibold uppercase tracking-wider text-gray-400">{label}</span>
      {children}
    </div>
  );
}

// ─── Missing data prompt ──────────────────────────────────────────────────────
function MissingDataPrompt({ missing }) {
  return (
    <div className="bg-amber-50 border border-amber-200 rounded-xl p-5 space-y-3">
      <h4 className="text-sm font-semibold text-amber-800">Required biometric data missing</h4>
      <p className="text-xs text-amber-700">
        The following fields must be recorded in a Data Entry session before maturation calculations can be generated:
      </p>
      <ul className="space-y-1">
        {missing.map(f => (
          <li key={f} className="flex items-center gap-2 text-xs text-amber-700">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400 shrink-0" />
            {f}
          </li>
        ))}
      </ul>
      <p className="text-xs text-gray-500 mt-2">
        Go to <strong>Data Entry → New Session</strong> and include the Biometrics category to record these values.
      </p>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function MaturationTab({ athlete, entries = [], allAthletes = [] }) {
  // Use the most recent maturation entry
  const matEntries = useMemo(() =>
    [...entries].sort((a, b) => new Date(b.date) - new Date(a.date)),
  [entries]);
  const latest = matEntries[0] || null;

  // Resolve sex: entry → athlete profile → default Male
  const sex = latest?.sex || athlete?.sex || 'Male';

  // Check for missing required fields
  const height = getHeight(latest);
  const missingFields = [];
  if (!athlete?.dob)           missingFields.push('Date of Birth (set on athlete profile)');
  if (!height)                 missingFields.push('Athlete Height');
  if (!latest?.bodyMass)       missingFields.push('Athlete Weight');
  if (!latest?.motherHeight)   missingFields.push("Mother's Height");
  if (!latest?.fatherHeight)   missingFields.push("Father's Height");

  // Auto-calculate using centralised function
  const mat = useMemo(() => {
    return calculateAthleteMaturation(athlete);
  }, [athlete]);

  const stageColors = mat?.stage ? STAGE_COLORS[mat.stage] : null;

  // Current age (today)
  const currentAgeYM = useMemo(() => {
    if (!athlete?.dob) return null;
    return calcAgeYM(athlete.dob, new Date().toISOString().slice(0, 10));
  }, [athlete?.dob]);

  return (
    <div className="space-y-6">

      {/* ── Top grid: inputs + outputs ─────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* LEFT — Inputs */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 space-y-4">
          <h3 className="font-semibold text-[#1C1C1C] text-sm uppercase tracking-wide">Biometric Inputs</h3>

          {/* Athlete info */}
          <div className="grid grid-cols-2 gap-3 p-3 rounded-lg bg-gray-50 border border-gray-100">
            <div>
              <span className="text-xs text-gray-400 uppercase tracking-wide block mb-0.5">Date of Birth</span>
              <span className="text-sm font-medium text-gray-700">{fmtDate(athlete?.dob)}</span>
            </div>
            <div>
              <span className="text-xs text-gray-400 uppercase tracking-wide block mb-0.5">Current Age</span>
              <span className="text-sm font-medium text-gray-700">
                {currentAgeYM ? `${currentAgeYM.years}y ${currentAgeYM.months}m` : '—'}
              </span>
            </div>
          </div>

          {missingFields.length > 0 ? (
            <MissingDataPrompt missing={missingFields} />
          ) : (
            <div className="grid grid-cols-2 gap-3 text-sm text-gray-700">
              {[
                ['Date of Measurement', fmtDate(latest?.date)],
                ['Age at Measurement',  mat?.ageYM ? `${mat.ageYM.years}y ${mat.ageYM.months}m` : '—'],
                ['Sex',                 sex],
                ['Athlete Height',      height ? `${height} cm` : '—'],
                ['Athlete Weight',      latest?.bodyMass ? `${latest.bodyMass} kg` : '—'],
                ["Mother's Height",     latest?.motherHeight ? `${latest.motherHeight} cm` : '—'],
                ["Father's Height",     latest?.fatherHeight ? `${latest.fatherHeight} cm` : '—'],
                ['Staff',               latest?.staff || '—'],
              ].map(([label, val]) => (
                <div key={label}>
                  <span className="text-xs text-gray-400 uppercase tracking-wide block">{label}</span>
                  <span className="font-medium">{val}</span>
                </div>
              ))}
            </div>
          )}

          {/* Measurement history */}
          {matEntries.length > 1 && (
            <div className="pt-2">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">Previous Measurements</p>
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="border-b border-gray-100">
                      {['Date', 'Height', 'Weight', 'PAH', 'PHV%', 'Stage'].map(h => (
                        <th key={h} className="text-left pb-1.5 pr-3 font-semibold text-gray-400 uppercase tracking-wide">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {matEntries.map((e, i) => {
                      const eH   = getHeight(e);
                      const eSex = e.sex || athlete?.sex || 'Male';
                      const eMat = (eH && e.bodyMass && e.motherHeight && e.fatherHeight && athlete?.dob && e.date)
                        ? calculateAthleteMaturation({ ...athlete, phase2: { ...athlete.phase2, maturation: { entries: [e] } } })
                        : null;
                      const ePah   = eMat?.pah ?? null;
                      const ePct   = eMat?.pahPct ?? null;
                      const eStage = eMat?.stage ?? null;
                      const esc   = eStage ? STAGE_COLORS[eStage] : null;
                      return (
                        <tr key={e.id || i} className="border-b border-gray-50">
                          <td className="py-1.5 pr-3 text-gray-600">{fmtDate(e.date)}</td>
                          <td className="py-1.5 pr-3 text-gray-600">{eH ? `${eH}` : '—'}</td>
                          <td className="py-1.5 pr-3 text-gray-600">{e.bodyMass || '—'}</td>
                          <td className="py-1.5 pr-3 text-gray-600">{ePah ? `${fmt1(ePah)}` : '—'}</td>
                          <td className="py-1.5 pr-3 font-semibold" style={{ color: esc?.dot || '#9ca3af' }}>
                            {ePct ? `${fmt1(ePct)}%` : '—'}
                          </td>
                          <td className="py-1.5">
                            {eStage ? (
                              <span className="inline-flex px-1.5 py-0.5 rounded-full text-[10px] font-semibold"
                                style={{ backgroundColor: esc?.bg, color: esc?.text }}>
                                {eStage}
                              </span>
                            ) : '—'}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* RIGHT — Calculated outputs */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 space-y-4">
          <h3 className="font-semibold text-[#1C1C1C] text-sm uppercase tracking-wide">Calculated Outputs</h3>

          {!mat ? (
            <p className="text-sm text-gray-400 py-8 text-center">
              Enter biometric data via Data Entry to see calculations.
            </p>
          ) : mat.outOfRange ? (
            <div className="py-8 text-center">
              <p className="text-sm text-gray-400" title={
                mat.outOfRange === 'below'
                  ? 'Below minimum age for Khamis-Roche calculation'
                  : 'Beyond maximum age for Khamis-Roche calculation'
              }>
                <span className="text-3xl font-bold" style={{ color: '#9ca3af' }}>—</span>
              </p>
              <p className="text-xs text-gray-400 mt-2">
                {mat.outOfRange === 'below'
                  ? 'Below minimum age for Khamis-Roche calculation (4.0 years).'
                  : 'Beyond maximum age for Khamis-Roche calculation (19.0 years).'}
              </p>
            </div>
          ) : (
            <>
              {/* Extrapolation marker */}
              {mat.extrapolated && (
                <p className="text-xs text-amber-600 bg-amber-50 rounded-lg px-3 py-2">
                  * Extrapolated beyond the validated age range of the Khamis-Roche method (validated to 17.5 years). Values are approximations only.
                </p>
              )}

              {/* PAH */}
              <StatCard label="Predicted Adult Height (Khamis-Roche)">
                <div className="flex items-end gap-1 mt-1">
                  <span className="text-4xl font-bold" style={{ color: '#085777' }}>
                    {fmt1(mat.pah)}{mat.extrapolated ? '*' : ''}
                  </span>
                  <span className="text-sm text-gray-400 mb-1">cm</span>
                </div>
                <div className="text-xs text-gray-400 space-y-0.5 mt-1">
                  <p>50% CI: {mat.ci50?.low} – {mat.ci50?.high} cm</p>
                  <p>90% CI: {mat.ci90?.low} – {mat.ci90?.high} cm</p>
                </div>
              </StatCard>

              {/* Mid-parent height */}
              <StatCard label="Mid-Parent Height">
                <div className="flex items-end gap-1 mt-1">
                  <span className="text-3xl font-bold text-gray-700">
                    {mat.midParent ? fmt1(mat.midParent) : '—'}
                  </span>
                  <span className="text-sm text-gray-400 mb-1">cm</span>
                </div>
                <p className="text-xs text-gray-400 mt-1">
                  Target height adjusted for athlete sex
                </p>
              </StatCard>

              {/* PHV % and Remaining Growth */}
              <div className="grid grid-cols-2 gap-3">
                <StatCard label="% of PAH">
                  <div className="flex items-end gap-1 mt-1">
                    {mat.pahPct > 100 ? (
                      <span className="text-3xl font-bold" style={{ color: '#9ca3af' }}>—</span>
                    ) : (
                      <>
                        <span className="text-3xl font-bold" style={{ color: stageColors?.dot || '#6b7280' }}>
                          {fmt1(mat.pahPct)}{mat.extrapolated ? '*' : ''}
                        </span>
                        <span className="text-sm text-gray-400 mb-1">%</span>
                      </>
                    )}
                  </div>
                </StatCard>
                <StatCard label="Remaining Growth">
                  <div className="flex items-end gap-1 mt-1">
                    {mat.remainingGrowth <= 0 ? (
                      <span className="text-3xl font-bold" style={{ color: '#9ca3af' }}>—</span>
                    ) : (
                      <>
                        <span className="text-3xl font-bold text-gray-700">
                          {fmt1(mat.remainingGrowth)}{mat.extrapolated ? '*' : ''}
                        </span>
                        <span className="text-sm text-gray-400 mb-1">cm</span>
                      </>
                    )}
                  </div>
                </StatCard>
              </div>

              {/* PHV Proximity */}
              <StatCard label="PHV Proximity">
                <div className="mt-1 space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="inline-block w-3 h-3 rounded-full" style={{ backgroundColor: stageColors?.dot }} />
                    <span className="font-bold text-xl" style={{ color: stageColors?.text }}>
                      {mat.stage}{mat.extrapolated ? '*' : ''}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 leading-relaxed">{STAGE_NOTES[mat.stage]}</p>
                  <div className="flex gap-2 text-[10px] text-gray-400 mt-2">
                    <span className="px-1.5 py-0.5 rounded" style={{ backgroundColor: '#ccfbf1', color: '#0f766e' }}>Pre-PHV &lt;88%</span>
                    <span className="px-1.5 py-0.5 rounded" style={{ backgroundColor: '#fef3c7', color: '#92400e' }}>Circa-PHV 88-95%</span>
                    <span className="px-1.5 py-0.5 rounded" style={{ backgroundColor: '#e5e7eb', color: '#374151' }}>Post-PHV &gt;95%</span>
                  </div>
                </div>
              </StatCard>
            </>
          )}
        </div>
      </div>

      {/* ── Cohort Timeline ──────────────────────────────────────── */}
      {allAthletes.length > 0 && (
        <CohortTimeline allAthletes={allAthletes} currentAthleteId={athlete?.id} />
      )}

      {/* ── Relative Age Effect ──────────────────────────────────── */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 space-y-3">
        <h3 className="font-semibold text-[#1C1C1C] text-sm uppercase tracking-wide">Relative Age Effect</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <span className="text-xs text-gray-400 uppercase tracking-wide block mb-1">Birth Quarter</span>
            <span className="font-semibold text-gray-700">
              {athlete?.dob ? birthQuarter(athlete.dob) : '—'}
            </span>
          </div>
          <div className="sm:col-span-2">
            <span className="text-xs text-gray-400 uppercase tracking-wide block mb-1">Relative Age Note</span>
            <p className="text-sm text-gray-600 leading-relaxed">
              {athlete?.dob ? relativeAgeNote(athlete.dob) : '—'}
            </p>
          </div>
        </div>
      </div>

    </div>
  );
}

function relativeAgeNote(dob) {
  if (!dob) return '';
  const m = new Date(dob).getMonth() + 1;
  if (m >= 9)  return 'Born in the first quarter of the academic year (Sep–Aug). Likely relatively older within their age group — statistical advantage in youth selection.';
  if (m <= 4)  return 'Born in the second quarter of the academic year. Moderate relative age position.';
  return 'Born in the second half of the academic year (Sep–Aug). Likely relatively younger — may face relative age disadvantage in youth selection.';
}
