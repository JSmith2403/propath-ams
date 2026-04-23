import InitialsAvatar from './InitialsAvatar';
import { COHORT_CONFIG } from '../data/athletes';
import WellnessMiniRings from './wellness/WellnessMiniRings';
import { calculateAthleteMaturation } from '../utils/maturation';

const RAG_COLORS = {
  green: '#22c55e',
  amber: '#f59e0b',
  red:   '#ef4444',
  grey:  '#9ca3af',
};

function RagDot({ label, status }) {
  return (
    <div className="flex items-center gap-1.5">
      <div
        className="w-2.5 h-2.5 rounded-full shrink-0"
        style={{ backgroundColor: RAG_COLORS[status] || RAG_COLORS.grey }}
      />
      <span className="text-xs text-gray-500 font-medium">{label}</span>
    </div>
  );
}

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
// note location on the profile:
//   - Physical / Psychological / Nutritional / Lifestyle pillar notes
//   - Physio Assessment notes
//   - Overview tab check-in log (athlete.checkIns)
// Observation entries do not count from any source.
function daysSinceLastCheckIn(athlete) {
  const timestamps = [];

  // Helper — accept both 'Assessment' and 'Check-in' (case-sensitive as used
  // in the app). Observation is never counted.
  const counts = (t) => t === 'Assessment' || t === 'Check-in';

  // Pillar note logs (Physical / Psych / Nutrition / Lifestyle) — entryType
  // field, timestamp field (ISO).
  ['physical', 'psych', 'nutrition', 'lifestyle'].forEach(domain => {
    (athlete?.ragLog?.[domain] || []).forEach(e => {
      if (counts(e.entryType) && e.timestamp) {
        const t = new Date(e.timestamp).getTime();
        if (Number.isFinite(t)) timestamps.push(t);
      }
    });
  });

  // Physio Assessment notes — noteType field, date field (YYYY-MM-DD).
  (athlete?.phase2?.physio?.entries || []).forEach(e => {
    if (counts(e.noteType) && e.date) {
      const t = new Date(e.date).getTime();
      if (Number.isFinite(t)) timestamps.push(t);
    }
  });

  // Overview tab check-in log — date field, noteType field.
  (athlete?.checkIns || []).forEach(e => {
    // Legacy entries may not have noteType set; treat those as Check-in
    // (the log is explicitly a check-in log).
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

function CheckInBadge({ days }) {
  let bg, label;
  if (days === null) {
    bg = '#9ca3af'; label = '\u2014'; // em dash
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
      boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
    }}>
      {label}
    </span>
  );
}

export default function AthleteCard({ athlete, onClick, wellnessData }) {
  const age      = calculateAge(athlete.dob);
  const tierStyle = COHORT_CONFIG[athlete.cohort] || COHORT_CONFIG['Elite'];
  const days     = daysSinceLastCheckIn(athlete);
  const matData  = calculateAthleteMaturation(athlete);

  return (
    <div
      onClick={() => onClick(athlete.id)}
      className="bg-white rounded-lg overflow-hidden cursor-pointer hover:shadow-lg transition-shadow duration-200 flex flex-col"
      style={{ boxShadow: '0 1px 4px rgba(0,0,0,0.08)' }}
    >
      {/* Photo / Initials area */}
      <div
        className="relative flex items-center justify-center"
        style={{ height: '160px', backgroundColor: '#111827' }}
      >
        {athlete.photo ? (
          <img src={athlete.photo} alt={athlete.name} className="w-full h-full object-cover" />
        ) : (
          <InitialsAvatar name={athlete.name} size="xl" />
        )}

        {/* Days since last check-in badge — top right */}
        <div className="absolute top-2 right-2">
          <CheckInBadge days={days} />
        </div>
      </div>

      {/* Cohort bar — shows Elite / Mini, not gender */}
      <div
        className="text-center py-1.5 text-xs font-bold tracking-widest uppercase"
        style={{ backgroundColor: tierStyle.bg, color: tierStyle.text }}
      >
        {athlete.cohort || 'Elite'}
      </div>

      {/* Content */}
      <div className="p-4 flex flex-col gap-3 flex-1">
        <div>
          <h3 className="font-semibold text-gray-900 text-base leading-tight">{athlete.name}</h3>
          <p className="text-xs text-gray-500 mt-1">
            {age != null ? `${age}y` : ''}
            {age != null && matData?.stage && !matData.outOfRange ? '\u00a0|\u00a0' : ''}
            {(!matData?.outOfRange && matData?.stage) ? matData.stage : (age == null ? '—' : '')}
          </p>
          {matData && !matData.outOfRange && matData.pahPct <= 100 && (
            <p className="text-xs mt-0.5" style={{ color: '#9ca3af' }}>
              {matData.pahPct.toFixed(1)}% PAH
            </p>
          )}
        </div>

        {/* Sport tag */}
        <div>
          <span
            className="inline-block text-xs font-medium px-2 py-0.5 rounded"
            style={{ backgroundColor: '#f0f4f8', color: '#437E8D' }}
          >
            {athlete.sport}
          </span>
        </div>

        {/* Wellness status */}
        <div className="pt-1 border-t border-gray-100">
          {!wellnessData || !wellnessData.isActive ? (
            <div>
              <p className="text-xs text-gray-400">Wellness tracking not activated</p>
              <button
                onClick={(e) => { e.stopPropagation(); onClick(athlete.id, { tab: 'wellness' }); }}
                className="text-xs font-medium mt-0.5"
                style={{ color: '#A58D69' }}
              >
                Activate
              </button>
            </div>
          ) : wellnessData.latestSubmission ? (
            <WellnessMiniRings
              submission={wellnessData.latestSubmission}
              date={wellnessData.latestDate}
            />
          ) : (
            <p className="text-xs text-gray-400 italic">Awaiting first submission</p>
          )}
        </div>

        {/* RAG 2×2 grid */}
        <div className="grid grid-cols-2 gap-y-2 gap-x-3 pt-1 border-t border-gray-100 mt-auto">
          <RagDot label="Physical"  status={athlete.rag?.physical  || 'grey'} />
          <RagDot label="Psych"     status={athlete.rag?.psych     || 'grey'} />
          <RagDot label="Nutrition" status={athlete.rag?.nutrition || 'grey'} />
          <RagDot label="Lifestyle" status={athlete.rag?.lifestyle || 'grey'} />
        </div>
      </div>
    </div>
  );
}
