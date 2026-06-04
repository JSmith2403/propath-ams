import { useEffect, useMemo, useState } from 'react';
import { Brain, BookOpen, Clock, Loader2, User, ChevronDown, ChevronRight } from 'lucide-react';
import { supabase } from '../../lib/supabase';

const GOLD = '#A58D69';

/**
 * MentalSkillsCoachView — top-level admin module for the Mental Game
 * course. Two stacked panels:
 *
 *   1. Course catalogue — every mf_modules row with its draft/published
 *      status, step count, and XP reward. Click a row to expand its
 *      step list (read-only for now; authoring is data-only this phase).
 *
 *   2. Athlete time-spent table — for each visible athlete, sum the
 *      total_seconds across mf_module_sessions and show the most-
 *      recently-attempted module. Sortable by total time so coaches
 *      can spot who's engaging vs who's not.
 */
export default function MentalSkillsCoachView({ allAthletes = [] }) {
  return (
    <div className="flex-1 min-h-0 overflow-y-auto bg-gray-50 p-6 space-y-6">
      <header className="flex items-center gap-3">
        <div
          className="w-10 h-10 rounded-lg flex items-center justify-center"
          style={{ backgroundColor: 'rgba(165,141,105,0.12)', color: GOLD }}
        >
          <Brain size={18} />
        </div>
        <div>
          <h1 className="text-base font-bold text-gray-900">Mental Skills</h1>
          <p className="text-[11px] text-gray-500">
            Course catalogue + per-athlete engagement time. Athletes see every published
            module automatically; no toggle.
          </p>
        </div>
      </header>

      <Catalogue />
      <AthleteEngagement allAthletes={allAthletes} />
    </div>
  );
}

// ─── Course catalogue ────────────────────────────────────────────────
function Catalogue() {
  const [modules, setModules] = useState([]);
  const [stepsByModule, setStepsByModule] = useState({});
  const [loading, setLoading] = useState(true);
  const [openId, setOpenId] = useState(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      const [mRes, sRes] = await Promise.all([
        supabase.from('mf_modules').select('*').order('domain', { ascending: true }).order('order_index', { ascending: true }),
        supabase.from('mf_module_steps').select('module_id, order_index, step_type, content'),
      ]);
      if (cancelled) return;
      const byModule = {};
      for (const s of (sRes.data || [])) {
        if (!byModule[s.module_id]) byModule[s.module_id] = [];
        byModule[s.module_id].push(s);
      }
      for (const arr of Object.values(byModule)) arr.sort((a, b) => a.order_index - b.order_index);
      setStepsByModule(byModule);
      setModules(mRes.data || []);
      setLoading(false);
    })();
    return () => { cancelled = true; };
  }, []);

  return (
    <section
      className="rounded-xl bg-white border border-gray-100 overflow-hidden"
      style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}
    >
      <header className="px-5 py-3 border-b border-gray-100 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <BookOpen size={14} style={{ color: GOLD }} />
          <p className="text-sm font-bold text-gray-900">Course catalogue</p>
        </div>
        <span className="text-[11px] text-gray-500">
          {loading ? 'Loading…' : `${modules.length} module${modules.length === 1 ? '' : 's'}`}
        </span>
      </header>

      {loading ? (
        <div className="px-5 py-8 text-xs text-gray-400 flex items-center gap-2">
          <Loader2 size={12} className="animate-spin" /> Loading modules…
        </div>
      ) : modules.length === 0 ? (
        <div className="px-5 py-8 text-xs italic text-gray-400">
          No modules yet.
        </div>
      ) : (
        <ul className="divide-y divide-gray-100">
          {modules.map(m => {
            const steps = stepsByModule[m.id] || [];
            const isOpen = openId === m.id;
            return (
              <li key={m.id}>
                <button
                  onClick={() => setOpenId(isOpen ? null : m.id)}
                  className="w-full flex items-center gap-3 px-5 py-3 text-left hover:bg-gray-50 transition-colors"
                >
                  {isOpen
                    ? <ChevronDown size={14} className="text-gray-400 shrink-0" />
                    : <ChevronRight size={14} className="text-gray-400 shrink-0" />}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="text-sm font-bold text-gray-900 truncate">{m.title}</p>
                      <span
                        className="text-[9px] uppercase tracking-widest font-bold px-1.5 py-0.5 rounded"
                        style={{
                          color:           m.status === 'published' ? '#15803d' : '#9ca3af',
                          backgroundColor: m.status === 'published' ? 'rgba(22,163,74,0.10)' : 'rgba(156,163,175,0.10)',
                        }}
                      >
                        {m.status}
                      </span>
                      <span className="text-[10px] uppercase tracking-widest text-gray-400">{m.domain}</span>
                    </div>
                    <p className="text-[11px] text-gray-500 mt-0.5 truncate">{m.description}</p>
                  </div>
                  <div className="shrink-0 text-right">
                    <p className="text-[11px] font-semibold text-gray-700">{steps.length} step{steps.length === 1 ? '' : 's'}</p>
                    <p className="text-[10px] text-gray-400">{m.xp_reward} XP</p>
                  </div>
                </button>
                {isOpen && (
                  <ol className="px-5 pb-4 pl-12 space-y-1">
                    {steps.map(s => (
                      <li key={s.order_index} className="text-[11px] text-gray-600 flex items-center gap-2">
                        <span className="font-semibold tabular-nums text-gray-400 w-4 text-right">{s.order_index}</span>
                        <span className="font-semibold uppercase tracking-wider text-[10px] px-1.5 py-0.5 rounded shrink-0"
                              style={{ color: GOLD, backgroundColor: 'rgba(165,141,105,0.08)' }}>
                          {s.step_type}
                        </span>
                        {s.step_type === 'learn'       && <span className="truncate">{s.content?.headline}</span>}
                        {s.step_type === 'interaction' && <span className="truncate">{s.content?.interaction}: {s.content?.prompt || s.content?.sentence}</span>}
                        {s.step_type === 'quiz'        && <span className="truncate">{s.content?.tier}: {s.content?.prompt}</span>}
                        {s.step_type === 'builder'     && <span className="truncate">{s.content?.prompt}</span>}
                        {s.step_type === 'reflection'  && <span className="truncate">{s.content?.prompt}</span>}
                        {s.step_type === 'assessment'  && <span className="truncate">{s.content?.instrument} — {s.content?.items?.length || 0} items</span>}
                      </li>
                    ))}
                  </ol>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}

// ─── Athlete engagement table ────────────────────────────────────────
function AthleteEngagement({ allAthletes }) {
  const [sessions, setSessions] = useState([]);
  const [modules, setModules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState('time'); // time | name | recent

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      const [sRes, mRes] = await Promise.all([
        supabase.from('mf_module_sessions').select('athlete_id, module_id, total_seconds, started_at, completed').order('started_at', { ascending: false }),
        supabase.from('mf_modules').select('id, title'),
      ]);
      if (cancelled) return;
      setSessions(sRes.data || []);
      setModules(mRes.data || []);
      setLoading(false);
    })();
    return () => { cancelled = true; };
  }, []);

  const modById = useMemo(() => Object.fromEntries(modules.map(m => [m.id, m.title])), [modules]);

  // Aggregate per athlete
  const rows = useMemo(() => {
    const byAthlete = new Map();
    for (const s of sessions) {
      const key = s.athlete_id;
      let entry = byAthlete.get(key);
      if (!entry) {
        entry = { athlete_id: key, total_seconds: 0, attempts: 0, completed: 0, latest_at: null, latest_module: null };
        byAthlete.set(key, entry);
      }
      entry.total_seconds += s.total_seconds || 0;
      entry.attempts++;
      if (s.completed) entry.completed++;
      if (!entry.latest_at || s.started_at > entry.latest_at) {
        entry.latest_at = s.started_at;
        entry.latest_module = modById[s.module_id] || '(deleted module)';
      }
    }

    // Include athletes with no sessions yet so the coach sees the whole roster.
    const out = [...byAthlete.values()];
    const seen = new Set(out.map(r => r.athlete_id));
    for (const a of allAthletes) {
      if (!seen.has(a.id)) {
        out.push({ athlete_id: a.id, total_seconds: 0, attempts: 0, completed: 0, latest_at: null, latest_module: null });
      }
    }
    const nameById = Object.fromEntries(allAthletes.map(a => [a.id, a.name]));
    for (const r of out) r._name = nameById[r.athlete_id] || r.athlete_id;

    if (sortBy === 'time')   out.sort((a, b) => b.total_seconds - a.total_seconds);
    if (sortBy === 'name')   out.sort((a, b) => a._name.localeCompare(b._name));
    if (sortBy === 'recent') out.sort((a, b) => (b.latest_at || '').localeCompare(a.latest_at || ''));
    return out;
  }, [sessions, modById, allAthletes, sortBy]);

  return (
    <section
      className="rounded-xl bg-white border border-gray-100 overflow-hidden"
      style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}
    >
      <header className="px-5 py-3 border-b border-gray-100 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Clock size={14} style={{ color: GOLD }} />
          <p className="text-sm font-bold text-gray-900">Athlete engagement</p>
        </div>
        <div className="inline-flex items-center rounded border border-gray-200 overflow-hidden">
          {[
            { id: 'time',   label: 'By time'   },
            { id: 'name',   label: 'A → Z'     },
            { id: 'recent', label: 'Recent'    },
          ].map(o => (
            <button
              key={o.id}
              onClick={() => setSortBy(o.id)}
              className="text-[11px] font-semibold px-2.5 py-1 transition-colors"
              style={{
                color:           sortBy === o.id ? '#fff' : '#6b7280',
                backgroundColor: sortBy === o.id ? GOLD : 'transparent',
              }}
            >
              {o.label}
            </button>
          ))}
        </div>
      </header>

      {loading ? (
        <div className="px-5 py-8 text-xs text-gray-400 flex items-center gap-2">
          <Loader2 size={12} className="animate-spin" /> Loading sessions…
        </div>
      ) : rows.length === 0 ? (
        <div className="px-5 py-8 text-xs italic text-gray-400">
          No athletes available.
        </div>
      ) : (
        <table className="w-full text-[11px]">
          <thead>
            <tr className="text-gray-500" style={{ borderBottom: '1px solid #f3f4f6' }}>
              <th className="text-left px-5 py-2 font-semibold uppercase tracking-widest text-[9px]">Athlete</th>
              <th className="text-right px-3 py-2 font-semibold uppercase tracking-widest text-[9px]">Time spent</th>
              <th className="text-right px-3 py-2 font-semibold uppercase tracking-widest text-[9px]">Attempts</th>
              <th className="text-right px-3 py-2 font-semibold uppercase tracking-widest text-[9px]">Completed</th>
              <th className="text-left px-3 py-2 font-semibold uppercase tracking-widest text-[9px]">Latest module</th>
              <th className="text-right px-5 py-2 font-semibold uppercase tracking-widest text-[9px]">Last opened</th>
            </tr>
          </thead>
          <tbody>
            {rows.map(r => (
              <tr key={r.athlete_id} style={{ borderBottom: '1px solid #f3f4f6' }}>
                <td className="px-5 py-2.5 font-semibold text-gray-900 inline-flex items-center gap-2">
                  <User size={11} className="text-gray-300" /> {r._name}
                </td>
                <td className="px-3 py-2.5 text-right font-semibold tabular-nums" style={{ color: r.total_seconds ? '#1C1C1C' : '#cbd5e1' }}>
                  {fmtDuration(r.total_seconds)}
                </td>
                <td className="px-3 py-2.5 text-right tabular-nums text-gray-600">{r.attempts || '—'}</td>
                <td className="px-3 py-2.5 text-right tabular-nums text-gray-600">{r.completed || '—'}</td>
                <td className="px-3 py-2.5 text-gray-600 truncate" style={{ maxWidth: 220 }}>
                  {r.latest_module || <span className="italic text-gray-300">—</span>}
                </td>
                <td className="px-5 py-2.5 text-right text-gray-500 tabular-nums">{fmtRelativeDate(r.latest_at)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </section>
  );
}

function fmtDuration(seconds) {
  if (!seconds || seconds <= 0) return '—';
  if (seconds < 60) return `${seconds}s`;
  const m = Math.floor(seconds / 60);
  if (m < 60) return `${m}m`;
  const h = Math.floor(m / 60);
  const rem = m % 60;
  return rem ? `${h}h ${rem}m` : `${h}h`;
}

function fmtRelativeDate(iso) {
  if (!iso) return '—';
  const d = new Date(iso);
  const days = Math.floor((Date.now() - d.getTime()) / 86_400_000);
  if (days <= 0) return 'today';
  if (days === 1) return 'yesterday';
  if (days < 14) return `${days}d ago`;
  if (days < 84) return `${Math.floor(days / 7)}w ago`;
  return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
}
