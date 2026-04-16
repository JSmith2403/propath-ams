import InitialsAvatar from './InitialsAvatar';
import { COHORT_CONFIG } from '../data/athletes';
import WellnessMiniRings from './wellness/WellnessMiniRings';

// Khamis-Roche PAH — compute live PHV proximity + PAH% from maturation entries
function computeMatCard(athlete) {
  const entries = [...(athlete.phase2?.maturation?.entries || [])]
    .sort((a, b) => new Date(b.date) - new Date(a.date));
  const latest = entries[0];
  if (!latest) return null;
  const height = latest.standingHeight ?? latest.stature ?? null;
  const dob    = athlete.dob;
  const sex    = latest.sex || athlete.gender || 'Male';
  if (!height || !latest.bodyMass || !latest.motherHeight || !latest.fatherHeight || !dob) return null;
  const ageDecimal = (new Date(latest.date) - new Date(dob)) / (365.25 * 86400000);
  if (ageDecimal <= 0) return null;
  const [s, f, m, b, a] = [height, latest.fatherHeight, latest.motherHeight, latest.bodyMass, ageDecimal].map(Number);
  if ([s, f, m, b, a].some(v => isNaN(v) || v <= 0)) return null;
  const pah = sex === 'Female'
    ? (0.369*s)+(0.271*f)+(0.306*m)+(0.037*b)-(0.009*a*a)+8.96
    : (0.378*s)+(0.308*f)+(0.270*m)+(0.054*b)-(0.016*a*a)+12.13;
  if (!pah || pah <= 0) return null;
  const pahPct = (s / pah) * 100;
  const stage  = pahPct < 88 ? 'Pre-PHV' : pahPct <= 95 ? 'Circa-PHV' : 'Post-PHV';
  return { pahPct, stage };
}

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

function daysSinceLastCheckIn(checkIns) {
  if (!checkIns || checkIns.length === 0) return null;
  const latest = checkIns
    .map(c => c.date)
    .filter(Boolean)
    .sort((a, b) => b.localeCompare(a))[0];
  if (!latest) return null;
  const today = new Date().toISOString().slice(0, 10);
  return Math.floor((new Date(today) - new Date(latest)) / (1000 * 60 * 60 * 24));
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
  const days     = daysSinceLastCheckIn(athlete.checkIns);
  const matData  = computeMatCard(athlete);

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
            {age != null && matData?.stage ? '\u00a0|\u00a0' : ''}
            {matData?.stage ?? (age == null ? '—' : '')}
          </p>
          {matData && matData.pahPct <= 100 && (
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
