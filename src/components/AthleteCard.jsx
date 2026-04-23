import { COHORT_CONFIG } from '../data/athletes';
import WellnessDonutRing from './wellness/WellnessDonutRing';
import { getMetricColour } from '../utils/wellnessFlags';
import { calculateAthleteMaturation } from '../utils/maturation';

const RAG_COLORS = {
  green: '#22c55e',
  amber: '#f59e0b',
  red:   '#ef4444',
  grey:  '#9ca3af',
};

// Fixed-height card zones so every card on the roster is the same total height
// regardless of content state (photo / no photo, wellness active / not, etc.)
const IMAGE_H   = 210;  // px — photo or initials rectangle
const COHORT_H  = 28;   // px — cohort bar height (py-1.5 ≈ 28px incl. text)
const WELLNESS_H = 80;  // px — wellness zone
const PILLAR_H  = 68;   // px — pillar dots grid

const WELLNESS_METRICS = [
  { key: 'sleep_duration',  label: 'Sleep',    max: 12 },
  { key: 'sleep_quality',   label: 'Quality',  max: 7 },
  { key: 'fatigue',         label: 'Fatigue',  max: 7 },
  { key: 'muscle_soreness', label: 'Soreness', max: 7 },
  { key: 'stress',          label: 'Stress',   max: 7 },
];

// ─── helpers ─────────────────────────────────────────────────────────────────

function calculateAge(dob) {
  if (!dob) return null;
  const today = new Date();
  const birth = new Date(dob);
  if (isNaN(birth.getTime())) return null;
  let age = today.getFullYear() - birth.getFullYear();
  const m = today.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
  return age;
}

// Days since the athlete's most recent Assessment or Check-in across every
// note location on the profile (pillar notes + physio + Overview check-ins).
// Observation entries do not count from any source.
function daysSinceLastCheckIn(athlete) {
  const timestamps = [];
  const counts = (t) => t === 'Assessment' || t === 'Check-in';

  ['physical', 'psych', 'nutrition', 'lifestyle'].forEach(domain => {
    (athlete?.ragLog?.[domain] || []).forEach(e => {
      if (counts(e.entryType) && e.timestamp) {
        const t = new Date(e.timestamp).getTime();
        if (Number.isFinite(t)) timestamps.push(t);
      }
    });
  });

  (athlete?.phase2?.physio?.entries || []).forEach(e => {
    if (counts(e.noteType) && e.date) {
      const t = new Date(e.date).getTime();
      if (Number.isFinite(t)) timestamps.push(t);
    }
  });

  (athlete?.checkIns || []).forEach(e => {
    const type = e.noteType ?? 'Check-in';
    if (counts(type) && e.date) {
      const t = new Date(e.date).getTime();
      if (Number.isFinite(t)) timestamps.push(t);
    }
  });

  if (timestamps.length === 0) return null;
  const latest = Math.max(...timestamps);
  if (!Number.isFinite(latest)) return null;
  return Math.floor((Date.now() - latest) / (1000 * 60 * 60 * 24));
}

function getInitials(name = '') {
  const parts = name.split(' ').filter(Boolean);
  if (parts.length === 0) return '?';
  if (parts.length === 1) return parts[0][0].toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

function formatShortDate(d) {
  if (!d) return '';
  const dt = new Date(d + 'T00:00:00');
  if (isNaN(dt.getTime())) return '';
  return dt.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
}

// ─── Sub-components ──────────────────────────────────────────────────────────

function CheckInBadge({ days }) {
  let bg, label;
  if (days === null) {
    bg = '#9ca3af'; label = '—';
  } else if (days <= 7) {
    bg = '#22c55e'; label = `${days}d`;
  } else if (days <= 21) {
    bg = '#f59e0b'; label = `${days}d`;
  } else {
    bg = '#ef4444'; label = `${days}d`;
  }
  return (
    <span style={{
      backgroundColor: bg,
      color: '#fff',
      fontSize: 10,
      fontWeight: 700,
      padding: '3px 7px',
      borderRadius: 6,
      lineHeight: 1,
      display: 'inline-block',
      boxShadow: '0 1px 3px rgba(0,0,0,0.25)',
    }}>
      {label}
    </span>
  );
}

// Rectangular initials fill — teal background, gold letters, fills the full
// image rectangle when an athlete has no photo.
function InitialsFill({ name }) {
  return (
    <div
      className="w-full h-full flex items-center justify-center font-bold"
      style={{
        backgroundColor: '#085777',
        color: '#A58D69',
        fontSize: 56,
        letterSpacing: '0.03em',
      }}
    >
      {getInitials(name)}
    </div>
  );
}

function RagDot({ label, status }) {
  return (
    <div className="flex items-center gap-1.5">
      <div
        className="w-2.5 h-2.5 rounded-full shrink-0"
        style={{ backgroundColor: RAG_COLORS[status] || RAG_COLORS.grey }}
      />
      <span className="text-xs text-gray-600 font-medium">{label}</span>
    </div>
  );
}

// ─── Wellness zone — three fixed-height states ──────────────────────────────

function WellnessZone({ wellnessData, athleteId, onClick }) {
  const baseStyle = {
    height: WELLNESS_H,
    padding: '8px 12px',
    borderTop: '1px solid #f3f4f6',
  };

  // State 3 — not activated
  if (!wellnessData || !wellnessData.isActive) {
    return (
      <div style={baseStyle} className="flex items-center justify-center">
        <p className="text-xs text-gray-500 text-center">
          Wellness tracking not activated.{' '}
          <button
            onClick={(e) => { e.stopPropagation(); onClick(athleteId, { tab: 'wellness' }); }}
            className="font-semibold hover:underline"
            style={{ color: '#437E8D' }}
          >
            Activate
          </button>
        </p>
      </div>
    );
  }

  // State 2 — activated, no submissions
  if (!wellnessData.latestSubmission) {
    return (
      <div style={baseStyle} className="flex items-center justify-center">
        <p className="text-xs italic text-gray-400">Awaiting first submission</p>
      </div>
    );
  }

  // State 1 — active with a submission
  const submission = wellnessData.latestSubmission;
  const dateLabel  = formatShortDate(wellnessData.latestDate);
  return (
    <div style={baseStyle} className="flex flex-col">
      <p style={{ fontSize: 10, color: '#9ca3af', marginBottom: 2 }}>
        Wellness{dateLabel ? ` · ${dateLabel}` : ''}
      </p>
      <div className="flex items-start justify-between flex-1">
        {WELLNESS_METRICS.map((m) => {
          const val    = Number(submission[m.key]);
          const colour = getMetricColour(m.key, val);
          return (
            <WellnessDonutRing
              key={m.key}
              value={val}
              max={m.max}
              colour={colour}
              label={m.label}
              size={32}
            />
          );
        })}
      </div>
    </div>
  );
}

// ─── Main card ───────────────────────────────────────────────────────────────

export default function AthleteCard({ athlete, onClick, wellnessData }) {
  const age       = calculateAge(athlete.dob);
  const tierStyle = COHORT_CONFIG[athlete.cohort] || COHORT_CONFIG['Elite'];
  const days      = daysSinceLastCheckIn(athlete);
  const matData   = calculateAthleteMaturation(athlete);

  const phvLabel = matData && !matData.outOfRange && matData.stage ? matData.stage : null;

  // Meta line beneath the name — age, PHV stage, sport
  const metaParts = [];
  if (age != null) metaParts.push(`${age}y`);
  if (phvLabel)    metaParts.push(phvLabel);
  if (athlete.sport) metaParts.push(athlete.sport);
  const meta = metaParts.join(' · ');

  return (
    <div
      onClick={() => onClick(athlete.id)}
      className="bg-white rounded-lg overflow-hidden cursor-pointer hover:shadow-lg transition-shadow duration-200 flex flex-col"
      style={{ boxShadow: '0 1px 4px rgba(0,0,0,0.08)' }}
    >
      {/* ── 1. Image area (fixed 210px) ─────────────────────────────────── */}
      <div
        className="relative overflow-hidden"
        style={{ height: IMAGE_H, backgroundColor: '#085777' }}
      >
        {athlete.photo ? (
          <img
            src={athlete.photo}
            alt={athlete.name}
            className="w-full h-full"
            style={{ objectFit: 'cover', objectPosition: 'top center' }}
          />
        ) : (
          <InitialsFill name={athlete.name} />
        )}

        {/* Days-since badge — top right */}
        <div className="absolute top-2 right-2">
          <CheckInBadge days={days} />
        </div>

        {/* Name + meta overlaid at the bottom with a dark gradient fade */}
        <div
          className="absolute left-0 right-0 bottom-0 px-3 pt-8 pb-2.5"
          style={{
            background: 'linear-gradient(to top, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0) 100%)',
          }}
        >
          <h3 className="text-white font-bold leading-tight truncate" style={{ fontSize: 15 }}>
            {athlete.name}
          </h3>
          {meta && (
            <p
              className="truncate"
              style={{ color: 'rgba(255,255,255,0.82)', fontSize: 11, marginTop: 2 }}
            >
              {meta}
            </p>
          )}
        </div>
      </div>

      {/* ── 2. Cohort bar (fixed height) ────────────────────────────────── */}
      <div
        className="text-center text-xs font-bold tracking-widest uppercase flex items-center justify-center"
        style={{ height: COHORT_H, backgroundColor: tierStyle.bg, color: tierStyle.text }}
      >
        {athlete.cohort || 'Elite'}
      </div>

      {/* ── 3. Wellness zone (fixed 80px) ───────────────────────────────── */}
      <WellnessZone wellnessData={wellnessData} athleteId={athlete.id} onClick={onClick} />

      {/* ── 4. Pillar zone (fixed 68px) ─────────────────────────────────── */}
      <div
        className="grid grid-cols-2 gap-y-2 gap-x-4 px-4 py-3"
        style={{ height: PILLAR_H, borderTop: '1px solid #f3f4f6' }}
      >
        <RagDot label="Physical"  status={athlete.rag?.physical  || 'grey'} />
        <RagDot label="Psych"     status={athlete.rag?.psych     || 'grey'} />
        <RagDot label="Nutrition" status={athlete.rag?.nutrition || 'grey'} />
        <RagDot label="Lifestyle" status={athlete.rag?.lifestyle || 'grey'} />
      </div>
    </div>
  );
}
