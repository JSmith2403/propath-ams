import { useState } from 'react';
import { ChevronDown, ChevronRight, Loader2 } from 'lucide-react';
import { useSessionLogDetail } from '../hooks/useSessionLogDetail';

// 74.5 -> "74.5", 80.0 -> "80"
function trimNum(n) {
  const r = Math.round(n * 10) / 10;
  return Number.isInteger(r) ? String(r) : String(r);
}

// One exercise's logged sets -> a compact line, e.g.:
//   "3 x 10 @ 75, 80, 85kg"   (same reps every set, weights vary)
//   "4 x 12"                 (bodyweight, same reps every set)
//   "10 @ 75kg, 8 @ 80kg"    (reps AND weight vary set to set)
function formatSetGroup(sets) {
  const sorted = [...sets].sort((a, b) => (a.set_number ?? 0) - (b.set_number ?? 0));
  const reps = sorted.map(s => s.reps);
  const weights = sorted.map(s => s.weight_kg);
  const allSameReps = reps.every(r => r === reps[0]) && reps[0] != null;
  const anyWeight = weights.some(w => w != null);

  if (!anyWeight) {
    return allSameReps
      ? `${sorted.length} x ${reps[0]}`
      : `${reps.map(r => r ?? '—').join(', ')} reps`;
  }
  if (allSameReps) {
    const weightStr = weights.map(w => (w != null ? trimNum(w) : '—')).join(', ');
    return `${sorted.length} x ${reps[0]} @ ${weightStr}kg`;
  }
  return sorted.map(s => `${s.reps ?? '—'}${s.weight_kg != null ? ` @ ${trimNum(s.weight_kg)}kg` : ''}`).join(', ');
}

/**
 * SessionDetailCard — expand-on-demand exercise/set breakdown for a
 * completed session, given its session_logs id (carried as
 * `sourceSession.id` on notes created via Recent Updates' "+ Note").
 * Lets a physio see exactly what loads/exercises preceded a note like
 * "responded badly to exercise X" without leaving the page.
 */
export default function SessionDetailCard({ sessionLogId }) {
  const [expanded, setExpanded] = useState(false);
  const { groups, loading } = useSessionLogDetail(sessionLogId, { enabled: expanded });

  if (!sessionLogId) return null;

  return (
    <div className="mt-1.5">
      <button
        onClick={() => setExpanded(e => !e)}
        className="inline-flex items-center gap-1 text-[11px] font-semibold"
        style={{ color: '#437E8D' }}
      >
        {expanded ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
        {expanded ? 'Hide session detail' : 'Show session detail'}
      </button>

      {expanded && (
        <div className="mt-1.5 rounded-lg border border-gray-100 p-3 space-y-2" style={{ backgroundColor: '#fafafa' }}>
          {loading ? (
            <p className="text-[11px] italic text-gray-400 flex items-center gap-1.5">
              <Loader2 size={11} className="animate-spin" /> Loading…
            </p>
          ) : groups.length === 0 ? (
            <p className="text-[11px] italic text-gray-400">No logged sets for this session.</p>
          ) : (
            groups.map(g => (
              <div key={g.key}>
                <p className="text-xs font-bold text-gray-800">{g.name}</p>
                <p className="text-[11px] text-gray-500">{formatSetGroup(g.sets)}</p>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
