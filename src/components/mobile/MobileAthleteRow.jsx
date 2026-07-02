import { Archive } from 'lucide-react';
import { calculateAthleteMaturation } from '../../utils/maturation';
import { COHORT_CONFIG } from '../../data/athletes';

const RAG_COLORS = {
  green: '#22c55e',
  amber: '#f59e0b',
  red:   '#ef4444',
  grey:  '#d1d5db',
};

function calculateAge(dob) {
  if (!dob) return null;
  const b = new Date(dob);
  if (Number.isNaN(b.getTime())) return null;
  const now = new Date();
  let age = now.getFullYear() - b.getFullYear();
  const m = now.getMonth() - b.getMonth();
  if (m < 0 || (m === 0 && now.getDate() < b.getDate())) age--;
  return age;
}

function initials(name) {
  if (!name) return '?';
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0][0].toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

/**
 * MobileAthleteRow — horizontal athlete row for the phone roster.
 * Photo left, name / meta / RAG dots right, archive icon on the far
 * right. About 5-6 athletes visible per screen at 375 × 812 (iPhone).
 * Tap the row to open the profile. Standard iOS/Android contact-list
 * pattern.
 *
 * Only rendered on mobile (parent gates via `md:hidden`); desktop keeps
 * the AthleteCard grid.
 */
export default function MobileAthleteRow({ athlete, onClick, onRequestArchive }) {
  const age = calculateAge(athlete.dob);
  const tierStyle = COHORT_CONFIG[athlete.cohort] || COHORT_CONFIG['Elite'];
  const matData = calculateAthleteMaturation(athlete);
  const phvLabel = matData && !matData.outOfRange && matData.stage ? matData.stage : null;

  const metaParts = [];
  if (age != null) metaParts.push(`${age}y`);
  if (phvLabel) metaParts.push(phvLabel);
  if (athlete.sport) metaParts.push(athlete.sport);
  const meta = metaParts.join(' · ');

  return (
    <div
      onClick={() => onClick(athlete.id)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') onClick(athlete.id); }}
      className="flex items-center gap-3 px-3 py-2.5 bg-white border-b border-ink-100 active:bg-gold-50/40 transition-colors cursor-pointer"
    >
      {/* Avatar — 48px round, object-fit cover */}
      <div
        className="shrink-0 relative rounded-full overflow-hidden"
        style={{ width: 48, height: 48, backgroundColor: '#085777' }}
      >
        {athlete.photo ? (
          <img
            src={athlete.photo}
            alt={athlete.name}
            className="w-full h-full"
            style={{ objectFit: 'cover', objectPosition: 'top center' }}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-white font-bold" style={{ fontSize: 15 }}>
            {initials(athlete.name)}
          </div>
        )}
      </div>

      {/* Name + meta + RAG dots */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5 mb-0.5">
          <span className="text-[14px] font-bold truncate" style={{ color: '#1C1C1C' }}>
            {athlete.name}
          </span>
          <span
            className="shrink-0 text-[8px] font-bold uppercase tracking-widest px-1.5 py-0.5 rounded"
            style={{ backgroundColor: tierStyle.bg, color: tierStyle.text }}
          >
            {athlete.cohort || 'Elite'}
          </span>
        </div>
        {meta && (
          <div className="text-[11px] truncate mb-1" style={{ color: '#6b7280' }}>
            {meta}
          </div>
        )}
        <div className="flex items-center gap-1.5">
          {['physical', 'psych', 'nutrition', 'lifestyle'].map(dom => (
            <span
              key={dom}
              className="shrink-0 rounded-full"
              style={{
                width: 7,
                height: 7,
                backgroundColor: RAG_COLORS[athlete.rag?.[dom] || 'grey'],
              }}
              title={dom}
            />
          ))}
        </div>
      </div>

      {/* Archive icon — visible always on mobile; stopPropagation so it
          doesn't open the profile. */}
      {onRequestArchive && (
        <button
          onPointerDown={(e) => e.stopPropagation()}
          onClick={(e) => {
            e.stopPropagation();
            onRequestArchive(athlete);
          }}
          className="shrink-0 p-2 rounded-full transition-colors"
          style={{ color: '#9ca3af' }}
          aria-label={`Archive ${athlete.name}`}
        >
          <Archive size={14} />
        </button>
      )}
    </div>
  );
}
