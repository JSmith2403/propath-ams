import { useMemo, useState } from 'react';
import {
  ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
} from 'recharts';
import { Clock, Dumbbell, Flame, Target, ChevronDown, ChevronRight } from 'lucide-react';
import { useAthleteLogs } from '../../hooks/useAthleteLogs';
import { mayhew1RM, bestE1RM, roundKg } from '../../utils/strengthMath';
import ProgressDashboard from '../programming/ProgressDashboard';
import ExerciseProgressGrid from '../programming/ExerciseProgressGrid';

const TEAL = '#437E8D';
const GOLD = '#A58D69';

function fmtClock(s) {
  if (s == null) return '—';
  const m = Math.floor(s / 60), sec = s % 60;
  return `${m}:${String(sec).padStart(2, '0')}`;
}
function fmtDate(iso) {
  return new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
}

// ─── Stat card ──────────────────────────────────────────────────────────────
function Stat({ icon: Icon, label, value, sub }) {
  return (
    <div className="bg-white rounded-lg border border-gray-100 p-4 flex flex-col gap-1"
      style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
      <div className="flex items-center gap-2">
        <Icon size={14} style={{ color: GOLD }} />
        <p className="text-[10px] uppercase tracking-widest font-semibold text-gray-400">{label}</p>
      </div>
      <p className="text-xl font-bold text-gray-900">{value}</p>
      {sub && <p className="text-xs text-gray-400">{sub}</p>}
    </div>
  );
}

// ─── Bilateral / Unilateral split ──────────────────────────────────────────
function SplitBar({ bilateralCount, unilateralCount, otherCount }) {
  const total = bilateralCount + unilateralCount + otherCount;
  if (!total) return null;
  const bp = (bilateralCount / total) * 100;
  const up = (unilateralCount / total) * 100;
  const op = (otherCount / total) * 100;

  return (
    <div className="bg-white rounded-lg border border-gray-100 p-4"
      style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
      <p className="text-[10px] uppercase tracking-widest font-semibold text-gray-400 mb-3">
        Bilateral vs Unilateral (by sets logged)
      </p>
      <div className="flex h-4 rounded-full overflow-hidden mb-3" style={{ backgroundColor: '#f3f4f6' }}>
        {bp > 0 && <div style={{ width: `${bp}%`, backgroundColor: TEAL }} />}
        {up > 0 && <div style={{ width: `${up}%`, backgroundColor: GOLD }} />}
        {op > 0 && <div style={{ width: `${op}%`, backgroundColor: '#9ca3af' }} />}
      </div>
      <div className="grid grid-cols-3 gap-2 text-xs">
        <Legend dot={TEAL} label="Bilateral" value={`${bilateralCount} (${bp.toFixed(0)}%)`} />
        <Legend dot={GOLD} label="Unilateral" value={`${unilateralCount} (${up.toFixed(0)}%)`} />
        <Legend dot="#9ca3af" label="Unspecified" value={`${otherCount} (${op.toFixed(0)}%)`} />
      </div>
    </div>
  );
}
function Legend({ dot, label, value }) {
  return (
    <div className="flex items-center gap-1.5">
      <span className="w-2 h-2 rounded-full" style={{ backgroundColor: dot }} />
      <div>
        <p className="text-[10px] text-gray-400 uppercase tracking-wider">{label}</p>
        <p className="text-xs font-semibold text-gray-700">{value}</p>
      </div>
    </div>
  );
}

// ─── 1RM trend chart per exercise ───────────────────────────────────────────
function E1RMChart({ data, exerciseName }) {
  if (!data.length) return null;
  return (
    <div className="bg-white rounded-lg border border-gray-100 p-4"
      style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
      <div className="flex items-center justify-between mb-2">
        <p className="text-sm font-semibold text-gray-800">{exerciseName}</p>
        <p className="text-[10px] uppercase tracking-widest font-semibold text-gray-400">
          Estimated 1RM (Mayhew)
        </p>
      </div>
      <ResponsiveContainer width="100%" height={160}>
        <LineChart data={data} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
          <CartesianGrid stroke="#f3f4f6" />
          <XAxis dataKey="date" tick={{ fontSize: 10, fill: '#9ca3af' }} />
          <YAxis tick={{ fontSize: 10, fill: '#9ca3af' }} />
          <Tooltip
            formatter={(v) => [`${v} kg`, 'e1RM']}
            contentStyle={{ fontSize: 11, borderRadius: 6 }}
          />
          <Line type="monotone" dataKey="e1rm" stroke={TEAL} strokeWidth={2}
            dot={{ r: 3, fill: TEAL }} activeDot={{ r: 5 }} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

// ─── Per-session expandable row ─────────────────────────────────────────────
function SessionRow({ session }) {
  const [open, setOpen] = useState(false);
  const setCount = session.sets.length;
  const tonnage = session.sets.reduce(
    (sum, s) => sum + (Number(s.weight_kg || 0) * Number(s.reps || 0)), 0
  );

  return (
    <div className="bg-white rounded-lg border border-gray-100 overflow-hidden"
      style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
      <button onClick={() => setOpen(o => !o)}
        className="w-full flex items-center gap-3 p-3 text-left hover:bg-gray-50">
        {open ? <ChevronDown size={14} className="text-gray-400" /> : <ChevronRight size={14} className="text-gray-400" />}
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-gray-800">{fmtDate(session.started_at)}</p>
          <p className="text-xs text-gray-400">
            {fmtClock(session.duration_seconds)} · {setCount} sets · RPE {session.session_rpe ?? '—'} · {Math.round(tonnage)} kg total
          </p>
        </div>
      </button>

      {open && (
        <div className="p-3 border-t border-gray-100 space-y-1">
          {session.sets.length === 0 && (
            <p className="text-xs text-gray-400 px-1">No sets logged.</p>
          )}
          {session.sets.map(s => {
            const e1 = mayhew1RM(s.weight_kg, s.reps);
            return (
              <div key={s.id} className="flex items-center gap-3 px-2 py-1.5 rounded">
                <p className="flex-1 text-xs font-medium text-gray-700 truncate">{s.exercise_name}</p>
                <p className="text-xs font-semibold text-gray-700 tabular-nums">
                  {s.weight_kg ?? '—'}{s.weight_kg != null ? ' kg' : ''} × {s.reps ?? '—'}
                </p>
                {e1 != null && (
                  <span className="text-[10px] px-1.5 py-0.5 rounded font-semibold"
                    style={{ backgroundColor: 'rgba(67,126,141,0.1)', color: TEAL }}>
                    e1RM {roundKg(e1)} kg
                  </span>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ─── Main tab ───────────────────────────────────────────────────────────────
export default function LoggedSessionsTab({ athlete }) {
  const { sessions, loading } = useAthleteLogs(athlete.id);

  // ── Aggregations ────────────────────────────────────────────────────────
  const stats = useMemo(() => {
    let totalDuration = 0, totalTonnage = 0, totalSets = 0, rpeSum = 0, rpeN = 0;
    let bi = 0, uni = 0, other = 0;

    for (const s of sessions) {
      totalDuration += s.duration_seconds || 0;
      if (s.session_rpe != null) { rpeSum += s.session_rpe; rpeN++; }
      for (const set of s.sets) {
        totalSets++;
        totalTonnage += (Number(set.weight_kg || 0) * Number(set.reps || 0));
        const tag = (set.bilateral_unilateral || '').toLowerCase();
        if (tag.includes('bi')) bi++;
        else if (tag.includes('uni')) uni++;
        else other++;
      }
    }
    return {
      sessionCount: sessions.length,
      totalDuration,
      totalTonnage,
      totalSets,
      avgRpe: rpeN ? rpeSum / rpeN : null,
      bi, uni, other,
    };
  }, [sessions]);

  // E1RM trends per exercise (only exercises with ≥ 2 data points)
  const e1rmSeries = useMemo(() => {
    const byEx = new Map(); // exId -> { name, points: [{ date, e1rm }] }
    for (const sess of sessions) {
      // Best e1RM from this session per exercise
      const bySetEx = new Map();
      for (const s of sess.sets) {
        if (!s.exercise_id) continue;
        const list = bySetEx.get(s.exercise_id) || [];
        list.push(s);
        bySetEx.set(s.exercise_id, list);
      }
      for (const [exId, sets] of bySetEx) {
        const best = bestE1RM(sets);
        if (best == null) continue;
        const entry = byEx.get(exId) || { name: sets[0].exercise_name, points: [] };
        entry.points.push({
          date: new Date(sess.started_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' }),
          e1rm: roundKg(best),
          ts: new Date(sess.started_at).getTime(),
        });
        byEx.set(exId, entry);
      }
    }
    // Sort points oldest→newest, drop series with < 2 points
    const out = [];
    for (const [exId, { name, points }] of byEx) {
      if (points.length < 2) continue;
      points.sort((a, b) => a.ts - b.ts);
      out.push({ exId, name, points });
    }
    // Sort series by most-recent-first
    out.sort((a, b) =>
      (b.points[b.points.length - 1].ts) - (a.points[a.points.length - 1].ts)
    );
    return out;
  }, [sessions]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="w-8 h-8 border-2 rounded-full animate-spin"
          style={{ borderColor: '#e5e7eb', borderTopColor: GOLD }} />
      </div>
    );
  }

  if (!sessions.length) {
    return (
      <div className="space-y-6">
        {/* Dashboard still renders so coaches see compliance vs planned
            even when no sessions have been logged yet. */}
        <ProgressDashboard athlete={athlete} />

        <div className="rounded-lg border border-dashed border-gray-200 p-10 text-center bg-white">
          <Dumbbell size={28} className="mx-auto mb-3 text-gray-300" />
          <p className="text-sm font-semibold text-gray-700 mb-1">No logged sessions yet</p>
          <p className="text-xs text-gray-400 max-w-sm mx-auto">
            When this athlete logs a training session in the athlete app, the sets, durations, RPE, and
            estimated 1RM trends will appear here automatically.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Progress Dashboard — KPIs, load + ACWR charts, exercise 1RM trends. */}
      <ProgressDashboard athlete={athlete} />

      {/* Header stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Stat icon={Dumbbell} label="Sessions" value={stats.sessionCount} />
        <Stat icon={Clock}    label="Time Trained" value={fmtClock(stats.totalDuration)} sub="hh:mm:ss" />
        <Stat icon={Target}   label="Total Tonnage" value={`${Math.round(stats.totalTonnage)} kg`} sub={`${stats.totalSets} sets`} />
        <Stat icon={Flame}    label="Avg Session RPE" value={stats.avgRpe != null ? stats.avgRpe.toFixed(1) : '—'} />
      </div>

      {/* Bilateral / unilateral */}
      <SplitBar bilateralCount={stats.bi} unilateralCount={stats.uni} otherCount={stats.other} />

      {/* Exercise Progress Grid — replaces the old per-exercise 1RM
          mini-charts cluster. Multi-select picker picks any 4 exercises;
          each card auto-uses Estimated 1RM (Mayhew) for weighted lifts
          and Best Reps per Session for bodyweight movements. */}
      <ExerciseProgressGrid sessions={sessions} weeks={8} />

      {/* Session log */}
      <div>
        <p className="text-[10px] uppercase tracking-widest font-semibold text-gray-400 mb-2">
          Session Log
        </p>
        <div className="space-y-2">
          {sessions.map(s => <SessionRow key={s.id} session={s} />)}
        </div>
      </div>
    </div>
  );
}
