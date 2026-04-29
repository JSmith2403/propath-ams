import { useEffect, useMemo, useState } from 'react';
import { Calendar, CheckCircle2, Search, Send, Users } from 'lucide-react';
import { supabase } from '../../../lib/supabase';
import { useBlockTemplates } from '../../../hooks/useBlockTemplates';
import { applyBlockTemplate } from '../../../utils/programmeTemplates';

/**
 * Lightweight athlete fetch — Assign only needs id, name, cohort, and
 * the programming_active flag. The heavy useAthletes hook pulls
 * real-time subscriptions and a large reference-data import we don't
 * need here.
 */
function useAthleteOptions() {
  const [athletes, setAthletes] = useState([]);
  const [loading,  setLoading]  = useState(true);
  useEffect(() => {
    let cancelled = false;
    (async () => {
      const [{ data: athleteRows, error: aErr },
             { data: settingsRows, error: sErr }] = await Promise.all([
        supabase.from('athletes').select('id, data').order('id', { ascending: true }),
        supabase.from('programming_settings').select('athlete_id, is_active').eq('is_active', true),
      ]);
      if (cancelled) return;
      if (aErr) console.error('[Assign] athletes fetch failed', aErr);
      if (sErr) console.error('[Assign] programming_settings fetch failed', sErr);
      const activeIds = new Set((settingsRows || []).map(r => r.athlete_id));
      const list = (athleteRows || []).map(row => {
        const tier   = row.data?.tier || '';
        const cohort = row.data?.cohort
          || (tier.includes('Mini') ? 'Mini' : tier.includes('Gold') ? 'Gold' : 'Elite');
        return {
          id:     row.id,
          name:   row.data?.name || row.id,
          cohort,
          active: activeIds.has(row.id),
        };
      });
      setAthletes(list);
      setLoading(false);
    })();
    return () => { cancelled = true; };
  }, []);
  return { athletes, loading };
}

function nextMondayISO() {
  const d = new Date();
  const dow = d.getDay();           // 0=Sun..6=Sat
  const daysUntilMon = (8 - dow) % 7 || 7;
  d.setDate(d.getDate() + daysUntilMon);
  return d.toISOString().slice(0, 10);
}

const DAY_NAMES = [
  { num: 1, label: 'Monday',    short: 'Mon' },
  { num: 2, label: 'Tuesday',   short: 'Tue' },
  { num: 3, label: 'Wednesday', short: 'Wed' },
  { num: 4, label: 'Thursday',  short: 'Thu' },
  { num: 5, label: 'Friday',    short: 'Fri' },
  { num: 6, label: 'Saturday',  short: 'Sat' },
  { num: 7, label: 'Sunday',    short: 'Sun' },
];

const COHORT_ORDER = ['Elite', 'Gold', 'Mini'];

/**
 * AssignTab — three-step flow:
 *   1. Pick a template (block template; session count auto-detected).
 *   2. Pick one or more athletes (multi-select grouped by cohort).
 *   3. Set start date + intended training days + Apply.
 *
 * On Apply, applyBlockTemplate runs once per athlete, creating the
 * block tree AND the planned_sessions rows that the per-athlete
 * calendar surfaces in Brief 5e.
 */
export default function AssignTab({ tick }) {
  const { athletes,  loading: athletesLoading }  = useAthleteOptions();
  const { templates, loading: templatesLoading } = useBlockTemplates(tick);

  const [templateId, setTemplateId] = useState('');
  const [tplQuery,   setTplQuery]   = useState('');
  const [athleteIds, setAthleteIds] = useState(() => new Set());
  const [startDate,  setStartDate]  = useState(nextMondayISO());
  const [days,       setDays]       = useState(() => new Set([1, 3, 5])); // Mon/Wed/Fri default
  const [busy,       setBusy]       = useState(false);
  const [result,     setResult]     = useState(null);

  const sortedAthletes = useMemo(() =>
    (athletes || [])
      .filter(a => a.active)
      .slice()
      .sort((a, b) => a.name.localeCompare(b.name)),
    [athletes],
  );

  const cohortGroups = useMemo(() => {
    const groups = new Map(COHORT_ORDER.map(c => [c, []]));
    for (const a of sortedAthletes) {
      const list = groups.get(a.cohort) || groups.set(a.cohort, []).get(a.cohort);
      list.push(a);
    }
    return [...groups.entries()].filter(([, list]) => list.length > 0);
  }, [sortedAthletes]);

  const filteredTemplates = useMemo(() => {
    const q = tplQuery.trim().toLowerCase();
    if (!q) return templates;
    return templates.filter(t => (t.name || '').toLowerCase().includes(q));
  }, [tplQuery, templates]);

  const selectedTemplate = templates.find(t => t.id === templateId) || null;
  const sessionCount = selectedTemplate?.session_count || 0;
  const dayCount = days.size;
  const dayCountMatches = sessionCount > 0 && dayCount === sessionCount;

  // Live preview of session→day mapping
  const sortedDays = useMemo(() =>
    [...days].sort((a, b) => a - b).map(num => DAY_NAMES[num - 1]),
    [days],
  );
  const sessionPreview = useMemo(() => {
    if (!sessionCount) return null;
    return sortedDays.map((d, i) => `Session ${i + 1} → ${d.label}`).join(', ');
  }, [sortedDays, sessionCount]);

  const toggleSet = (s, value) => {
    const next = new Set(s);
    if (next.has(value)) next.delete(value);
    else                 next.add(value);
    return next;
  };

  const ready = !!templateId && athleteIds.size > 0 && !!startDate && dayCountMatches && !busy;

  const handleApply = async () => {
    if (!ready) return;
    setBusy(true);
    setResult(null);
    const intendedDays = [...sortedDays].map(d => d.num);
    const targets = [...athleteIds];
    let ok = 0, fail = 0;
    const errors = [];
    for (const aid of targets) {
      const res = await applyBlockTemplate({
        blockTemplateId: templateId,
        athleteId:       aid,
        startDate,
        intendedDays,
      });
      if (res.ok) ok++;
      else { fail++; errors.push(res.error?.message || 'unknown'); }
    }
    setBusy(false);
    if (fail === 0) {
      setResult({ ok: true, ok_count: ok });
      setTemplateId('');
      setAthleteIds(new Set());
    } else {
      setResult({ ok: false, ok_count: ok, fail_count: fail, errors });
    }
  };

  if (athletesLoading || templatesLoading) {
    return <div className="text-xs text-center py-12" style={{ color: '#9ca3af' }}>Loading…</div>;
  }

  if (!templates.length) {
    return (
      <div className="rounded-xl px-8 py-16 text-center" style={{ backgroundColor: '#fff', border: '1px solid #e5e7eb' }}>
        <div className="mx-auto flex items-center justify-center mb-4" style={{ width: 56, height: 56, borderRadius: '50%', backgroundColor: 'rgba(67,126,141,0.10)', color: '#437E8D' }}>
          <Send size={26} strokeWidth={1.75} />
        </div>
        <h3 className="text-sm font-bold mb-1" style={{ color: '#1C1C1C' }}>No templates to assign</h3>
        <p className="text-xs max-w-md mx-auto" style={{ color: '#6b7280' }}>
          Build a template in the Build tab first, then come back here to assign it.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4 max-w-3xl">
      <h3 className="text-sm font-bold" style={{ color: '#1C1C1C' }}>Assign template</h3>
      <p className="text-xs" style={{ color: '#6b7280' }}>
        Pick a template, choose which athletes to apply it to, then set the schedule.
        Each athlete gets their own snapshot — editing one later doesn't change the others.
      </p>

      {/* Step 1 — template */}
      <Step number="1" title="Select template" complete={!!templateId}>
        <div className="space-y-2">
          <div className="relative">
            <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2" style={{ color: '#9ca3af' }} />
            <input
              type="text"
              value={tplQuery}
              onChange={(e) => setTplQuery(e.target.value)}
              placeholder="Filter templates…"
              className="w-full pl-8 pr-3 py-2 text-sm rounded border border-gray-200 focus:outline-none focus:border-gray-400"
            />
          </div>
          <div className="rounded-lg overflow-hidden" style={{ border: '1px solid #e5e7eb', maxHeight: 220 }}>
            <div className="overflow-y-auto" style={{ maxHeight: 220 }}>
              {filteredTemplates.length === 0 ? (
                <div className="px-3 py-4 text-xs text-center" style={{ color: '#9ca3af' }}>
                  No templates match "{tplQuery}".
                </div>
              ) : filteredTemplates.map(t => {
                const active = t.id === templateId;
                return (
                  <button
                    key={t.id}
                    onClick={() => setTemplateId(t.id)}
                    className="w-full text-left px-3 py-2.5 flex items-center justify-between border-b border-gray-50 last:border-b-0 transition-colors"
                    style={{
                      backgroundColor: active ? 'rgba(67,126,141,0.08)' : '#fff',
                    }}
                  >
                    <div className="min-w-0">
                      <div className="text-sm font-semibold truncate" style={{ color: '#1C1C1C' }}>{t.name}</div>
                      <div className="text-[11px]" style={{ color: '#9ca3af' }}>
                        {t.session_count} {t.session_count === 1 ? 'session' : 'sessions'} · {t.default_duration_weeks}-week
                      </div>
                    </div>
                    {active && <CheckCircle2 size={14} style={{ color: '#437E8D' }} />}
                  </button>
                );
              })}
            </div>
          </div>
          {selectedTemplate && (
            <div className="text-[11px]" style={{ color: '#6b7280' }}>
              <strong>{selectedTemplate.name}</strong> selected — {selectedTemplate.session_count} sessions per week, {selectedTemplate.default_duration_weeks}-week duration.
            </div>
          )}
        </div>
      </Step>

      {/* Step 2 — athletes */}
      <Step number="2" title="Select athletes" complete={athleteIds.size > 0}>
        {sortedAthletes.length === 0 ? (
          <p className="text-xs" style={{ color: '#9ca3af' }}>
            No athletes have programming active. Activate programming on an athlete's profile (Physical Development → Programme) first.
          </p>
        ) : (
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-[11px]" style={{ color: '#6b7280' }}>
              <Users size={12} />
              <span>{athleteIds.size} of {sortedAthletes.length} selected</span>
              <button
                onClick={() => setAthleteIds(new Set(sortedAthletes.map(a => a.id)))}
                className="ml-auto text-[11px] font-semibold underline"
                style={{ color: '#437E8D' }}
              >
                Select all
              </button>
              <button
                onClick={() => setAthleteIds(new Set())}
                className="text-[11px] font-semibold underline"
                style={{ color: '#dc2626' }}
              >
                Clear
              </button>
            </div>
            {cohortGroups.map(([cohort, list]) => (
              <div key={cohort}>
                <div className="text-[10px] font-bold uppercase tracking-widest mb-1.5" style={{ color: '#9ca3af' }}>
                  {cohort}
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {list.map(a => {
                    const checked = athleteIds.has(a.id);
                    return (
                      <button
                        key={a.id}
                        onClick={() => setAthleteIds(prev => toggleSet(prev, a.id))}
                        className="text-[11px] font-semibold px-2.5 py-1 rounded-full transition-colors"
                        style={{
                          backgroundColor: checked ? '#437E8D' : '#f3f4f6',
                          color:           checked ? '#fff'    : '#1C1C1C',
                        }}
                      >
                        {a.name}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </Step>

      {/* Step 3 — schedule */}
      <Step number="3" title="Schedule" complete={dayCountMatches && !!startDate}>
        <div className="space-y-3">
          {/* Start date */}
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider mb-1.5" style={{ color: '#6b7280' }}>
              Block start date
            </label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="px-3 py-2 text-sm rounded border border-gray-200 focus:outline-none focus:border-gray-400"
            />
          </div>

          {/* Intended training days */}
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider mb-1.5" style={{ color: '#6b7280' }}>
              Intended training days
            </label>
            <div className="flex flex-wrap gap-1.5">
              {DAY_NAMES.map(d => {
                const active = days.has(d.num);
                return (
                  <button
                    key={d.num}
                    onClick={() => setDays(prev => toggleSet(prev, d.num))}
                    className="text-[11px] font-semibold px-2.5 py-1.5 rounded transition-colors"
                    style={{
                      backgroundColor: active ? '#437E8D' : '#f3f4f6',
                      color:           active ? '#fff'    : '#1C1C1C',
                      minWidth: 56,
                    }}
                  >
                    {d.short}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Validation + preview */}
          {sessionCount > 0 && (
            <div className="rounded-md px-3 py-2 text-[11px]" style={{
              backgroundColor: dayCountMatches ? 'rgba(34,197,94,0.10)' : 'rgba(245,158,11,0.10)',
              color: dayCountMatches ? '#15803d' : '#a16207',
            }}>
              <div className="flex items-center gap-1.5">
                <Calendar size={12} />
                <strong>
                  {sessionCount} sessions per week
                </strong>
                <span>· you've selected {dayCount} {dayCount === 1 ? 'day' : 'days'}</span>
              </div>
              {dayCountMatches && sessionPreview && (
                <div className="mt-1" style={{ color: '#1C1C1C' }}>
                  {sessionPreview}
                </div>
              )}
              {!dayCountMatches && (
                <div className="mt-1">
                  Select exactly {sessionCount} {sessionCount === 1 ? 'day' : 'days'} to continue.
                </div>
              )}
            </div>
          )}
        </div>
      </Step>

      {/* Apply */}
      <div className="flex items-center gap-3 pt-2">
        <button
          onClick={handleApply}
          disabled={!ready}
          className="px-5 py-2 text-sm font-semibold text-white rounded transition-opacity hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed"
          style={{ backgroundColor: '#A58D69' }}
        >
          {busy ? 'Applying…' : 'Apply Template'}
        </button>
        {result?.ok && (
          <span className="flex items-center gap-1.5 text-[12px]" style={{ color: '#085777' }}>
            <CheckCircle2 size={14} />
            Template applied to {result.ok_count} {result.ok_count === 1 ? 'athlete' : 'athletes'}.
          </span>
        )}
        {result && !result.ok && (
          <span className="text-[12px]" style={{ color: '#dc2626' }}>
            Applied to {result.ok_count}, {result.fail_count} failed: {result.errors[0]}
          </span>
        )}
      </div>
    </div>
  );
}

// ─── Step ────────────────────────────────────────────────────────────
function Step({ number, title, complete, children }) {
  return (
    <section className="rounded-xl p-4" style={{ backgroundColor: '#fff', border: '1px solid #e5e7eb' }}>
      <div className="flex items-center gap-2 mb-3">
        <span
          className="inline-flex items-center justify-center text-[11px] font-bold rounded-full"
          style={{
            width: 22, height: 22,
            backgroundColor: complete ? '#437E8D' : '#f3f4f6',
            color:           complete ? '#fff'    : '#6b7280',
          }}
        >
          {number}
        </span>
        <h4 className="text-sm font-bold" style={{ color: '#1C1C1C' }}>{title}</h4>
      </div>
      {children}
    </section>
  );
}
