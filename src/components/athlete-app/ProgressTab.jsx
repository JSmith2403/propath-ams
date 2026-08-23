import { useMemo, useState } from 'react';
import { TrendingUp, Plus, CheckCircle2, User, ChevronDown, ChevronUp } from 'lucide-react';
import { ComposedChart, Bar, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { METRIC_MAP, SPECIAL_METRICS, LABEL_OVERRIDES, DUAL_LINE_METRICS, LOWER_IS_BETTER } from '../../data/sessionMetrics';
import { useCustomMetrics } from '../../hooks/useCustomMetrics';
import { usePerformanceResults } from '../../hooks/usePerformanceResults';
import { useVALDMetrics } from '../../hooks/useVALDMetrics';
import { useAthleteGoals } from '../../hooks/useAthleteGoals';
import { useAthleteReports } from '../../hooks/useAthleteReports';
import { TIER_ORDER, TIER_META, DOMAIN_META, GOAL_STATUS_META, currentYearQuarter } from '../../utils/goalTree';
import { buildKpiData, buildDualKpiData, fmtNum, lsiColour } from '../../utils/kpiStats';

const GOLD  = '#A58D69';
const TEAL  = '#437E8D';
const AMBER = '#f59e0b';
const FADE  = '#e5e7eb';

// Athlete-friendly translation of the coach's internal RAG vocabulary —
// display-layer only, doesn't touch RAG_CONFIG itself.
const RAG_ATHLETE_LABEL = {
  green: { label: 'On track',        color: '#22c55e' },
  amber: { label: 'Needs attention', color: '#f59e0b' },
  red:   { label: 'Priority focus',  color: '#ef4444' },
  grey:  { label: 'Not yet assessed', color: '#9ca3af' },
};

function ReadOnlyGoalNode({ node }) {
  const domainMeta = DOMAIN_META[node.domain];
  const statusMeta = GOAL_STATUS_META[node.status];
  return (
    <div>
      <div className="p-3 rounded-lg border border-ink-100 bg-white">
        <div className="flex items-center gap-2 flex-wrap mb-1">
          <span className="text-micro font-bold px-1.5 py-0.5 rounded" style={{ backgroundColor: `${domainMeta.color}1a`, color: domainMeta.color }}>
            {domainMeta.label}
          </span>
          <span className="text-micro font-semibold px-1.5 py-0.5 rounded" style={{ backgroundColor: statusMeta.bg, color: statusMeta.color }}>
            {statusMeta.label}
          </span>
          {node.target_date && (
            <span className="text-micro text-ink-400 ml-auto">
              {new Date(node.target_date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
            </span>
          )}
        </div>
        <p className="text-meta text-ink-800">{node.description}</p>
      </div>
      {node.children?.length > 0 && (
        <div className="ml-4 mt-2 space-y-2 pl-3 border-l-2 border-ink-100">
          {node.children.map(child => <ReadOnlyGoalNode key={child.id} node={child} />)}
        </div>
      )}
    </div>
  );
}

function AddGoalSheet({ onAdd, onClose }) {
  const [tier, setTier] = useState('short');
  const [domain, setDomain] = useState('physical');
  const [description, setDescription] = useState('');
  const [targetDate, setTargetDate] = useState('');
  const [saving, setSaving] = useState(false);

  const submit = async () => {
    if (!description.trim()) return;
    setSaving(true);
    await onAdd({ tier, domain, description: description.trim(), targetDate: targetDate || null });
    setSaving(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-40 flex items-end justify-center" style={{ backgroundColor: 'rgba(0,0,0,0.4)' }} onClick={onClose}>
      <div className="w-full bg-white rounded-t-2xl p-5 space-y-4" style={{ maxWidth: 480 }} onClick={e => e.stopPropagation()}>
        <p className="text-body font-bold text-ink-900">Add a goal</p>

        <div>
          <label className="text-micro font-bold uppercase text-ink-400 block mb-1.5">Timeframe</label>
          <div className="grid grid-cols-4 gap-1.5">
            {TIER_ORDER.map(t => (
              <button key={t} onClick={() => setTier(t)}
                className="py-2 rounded-lg text-micro font-bold text-center border"
                style={{ borderColor: tier === t ? GOLD : '#e5e5e7', backgroundColor: tier === t ? 'rgba(165,141,105,0.1)' : '#fff', color: tier === t ? GOLD : '#6b7280' }}>
                {TIER_META[t].short}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="text-micro font-bold uppercase text-ink-400 block mb-1.5">Area</label>
          <select value={domain} onChange={e => setDomain(e.target.value)}
            className="w-full text-sm border border-ink-200 rounded-lg px-3 py-2.5 bg-white">
            {Object.entries(DOMAIN_META).map(([key, m]) => <option key={key} value={key}>{m.label}</option>)}
          </select>
        </div>

        <div>
          <label className="text-micro font-bold uppercase text-ink-400 block mb-1.5">Your goal</label>
          <textarea rows={3} value={description} onChange={e => setDescription(e.target.value)}
            placeholder="What do you want to achieve?"
            className="w-full text-sm border border-ink-200 rounded-lg px-3 py-2.5 resize-none bg-white" />
        </div>

        <div>
          <label className="text-micro font-bold uppercase text-ink-400 block mb-1.5">Target date (optional)</label>
          <input type="date" value={targetDate} onChange={e => setTargetDate(e.target.value)}
            className="w-full text-sm border border-ink-200 rounded-lg px-3 py-2.5 bg-white" />
        </div>

        <div className="flex gap-2 pt-1">
          <button onClick={submit} disabled={!description.trim() || saving}
            className="flex-1 py-3 rounded-lg text-sm font-bold text-white disabled:opacity-50"
            style={{ backgroundColor: GOLD }}>
            {saving ? 'Saving…' : 'Add Goal'}
          </button>
          <button onClick={onClose} className="px-4 py-3 rounded-lg text-sm font-semibold text-ink-500">
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Goals list shared by both the live (unsent) card and each report ────────
function GoalsBlock({ coachTree, athleteOwnGoals, onAdd }) {
  const [showAdd, setShowAdd] = useState(false);

  return (
    <>
      <div className="flex items-center justify-between mt-4 mb-2">
        <p className="text-body font-bold text-ink-900">Goals</p>
        {onAdd && (
          <button onClick={() => setShowAdd(true)} className="flex items-center gap-1 text-meta font-bold" style={{ color: GOLD }}>
            <Plus size={13} /> Add
          </button>
        )}
      </div>

      {coachTree.length === 0 && athleteOwnGoals.length === 0 && (
        <p className="text-meta text-ink-400 text-center py-4">No goals set for this quarter yet.</p>
      )}

      <div className="space-y-2">
        {coachTree.map(node => <ReadOnlyGoalNode key={node.id} node={node} />)}
      </div>

      {athleteOwnGoals.length > 0 && (
        <div className="mt-4 pt-4 border-t border-ink-100 space-y-2">
          <p className="text-micro font-bold uppercase text-ink-400 flex items-center gap-1.5">
            <User size={11} /> Submitted by you
          </p>
          {athleteOwnGoals.map(g => {
            const domainMeta = DOMAIN_META[g.domain];
            return (
              <div key={g.id} className="p-3 rounded-lg bg-ink-50">
                <div className="flex items-center gap-2 flex-wrap mb-1">
                  <span className="text-micro font-bold px-1.5 py-0.5 rounded" style={{ backgroundColor: `${domainMeta.color}1a`, color: domainMeta.color }}>
                    {domainMeta.label}
                  </span>
                  <span className="text-micro text-ink-400">{TIER_META[g.tier].label}</span>
                  {g.linked_goal_id ? (
                    <span className="text-micro font-semibold flex items-center gap-1 ml-auto" style={{ color: '#22c55e' }}>
                      <CheckCircle2 size={11} /> In your plan
                    </span>
                  ) : (
                    <span className="text-micro text-ink-400 ml-auto">Awaiting review</span>
                  )}
                </div>
                <p className="text-meta text-ink-800">{g.description}</p>
              </div>
            );
          })}
        </div>
      )}

      {showAdd && <AddGoalSheet onAdd={onAdd} onClose={() => setShowAdd(false)} />}
    </>
  );
}

// ─── One sent report — collapsible, most recent expanded by default ─────────
function ReportCard({ plan, coachTree, athleteOwnGoals, defaultOpen, onAdd }) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div className="rounded-xl bg-white border border-ink-100 shadow-card overflow-hidden">
      <button onClick={() => setOpen(o => !o)} className="w-full flex items-center justify-between p-4 text-left">
        <div>
          <p className="text-meta font-semibold" style={{ color: GOLD }}>{plan.period_label}</p>
          <p className="text-body font-bold text-ink-900 mt-0.5">Your Quarterly Report</p>
        </div>
        {open ? <ChevronUp size={18} className="text-ink-400 shrink-0" /> : <ChevronDown size={18} className="text-ink-400 shrink-0" />}
      </button>

      {open && (
        <div className="px-4 pb-4">
          {plan.narrative && (
            <p className="text-meta italic leading-snug text-ink-700 mb-3">{plan.narrative}</p>
          )}
          <div className="grid grid-cols-2 gap-2.5">
            {Object.entries(DOMAIN_META).map(([key, meta]) => {
              const status = plan.rag_summary?.[key] || 'grey';
              const r = RAG_ATHLETE_LABEL[status];
              return (
                <div key={key} className="rounded-lg p-2.5 bg-ink-50">
                  <p className="text-micro font-bold uppercase text-ink-400">{meta.label}</p>
                  <p className="text-meta font-bold mt-0.5" style={{ color: r.color }}>{r.label}</p>
                </div>
              );
            })}
          </div>
          <GoalsBlock coachTree={coachTree} athleteOwnGoals={athleteOwnGoals} onAdd={onAdd} />
        </div>
      )}
    </div>
  );
}

// ─── Quarterly report + goals section ──────────────────────────────────────
// Two sources: the live current-quarter plan (so athletes can add their own
// goals before the coach sends anything), and the full history of reports
// the coach has actually sent — so athletes can look back on past quarters,
// not just the current one.
function ReportSection({ athleteId }) {
  const { plan: livePlan, coachTree: liveTree, athleteOwnGoals: liveOwnGoals, loading: liveLoading, hasPlan, reportSent, addAthleteGoal } = useAthleteGoals(athleteId);
  const { reports, loading: reportsLoading } = useAthleteReports(athleteId);

  if (liveLoading || reportsLoading) return null;
  if (!hasPlan && reports.length === 0) return null;

  const { year: curYear, quarter: curQuarter } = currentYearQuarter();

  return (
    <div className="space-y-3 mb-4">
      {hasPlan && !reportSent && (
        <div className="rounded-xl p-4 bg-white border border-ink-100 shadow-card">
          <p className="text-meta font-semibold" style={{ color: GOLD }}>{livePlan.period_label}</p>
          <p className="text-h3 leading-tight text-ink-900 mt-0.5">This Quarter's Goals</p>
          <p className="text-meta text-ink-500 mt-1">Your coach hasn't finished this quarter's report yet — you can already add your own goals below.</p>
          <GoalsBlock coachTree={liveTree} athleteOwnGoals={liveOwnGoals} onAdd={addAthleteGoal} />
        </div>
      )}

      {reports.map((r, i) => {
        const isCurrentQuarter = r.plan.year === curYear && r.plan.quarter === curQuarter;
        return (
          <ReportCard
            key={r.plan.id}
            plan={r.plan}
            coachTree={r.coachTree}
            athleteOwnGoals={r.athleteOwnGoals}
            defaultOpen={i === 0}
            onAdd={isCurrentQuarter ? addAthleteGoal : null}
          />
        );
      })}
    </div>
  );
}

/**
 * ProgressTab — the athlete's single "how am I doing" surface: the
 * quarterly report (once the coach sends it) + goals, followed by
 * whatever performance metrics the coach has pinned (the "Show on
 * athlete progress" toggle on each KPI Dashboard tile). Reads
 * performance_test_results / vald_test_results directly (both anon-
 * SELECT, scoped by athleteId) rather than through any coach-only path.
 */
export default function ProgressTab({ athleteId, progressMetrics = [] }) {
  const { customMetrics } = useCustomMetrics();
  const { entries, loading: entriesLoading } = usePerformanceResults(athleteId);
  const { entriesFor: valdEntriesFor, defFor: valdDefFor, loading: valdLoading } = useVALDMetrics(athleteId);

  const loading = entriesLoading || valdLoading;

  const cards = useMemo(() => {
    return (progressMetrics || []).map(metricKey => {
      const isVALD = metricKey?.startsWith?.('vald:');
      const rawEntries = isVALD ? valdEntriesFor(metricKey) : (entries?.[metricKey] || []);
      const isDualLine = !isVALD && DUAL_LINE_METRICS.has(metricKey);
      // Maturation entries (bodyweight) aren't available on the athlete
      // side — only affects the two bodyweight-relative special metrics
      // (cmjRelPower / imtpRelForce), which render "no results" if pinned
      // here rather than a computed value.
      const chartData = isDualLine
        ? buildDualKpiData(rawEntries)
        : buildKpiData(rawEntries, metricKey, [], LOWER_IS_BETTER);

      const metricDef = isVALD
        ? valdDefFor(metricKey)
        : (SPECIAL_METRICS[metricKey] || METRIC_MAP[metricKey] || customMetrics?.[metricKey]);
      const unit  = metricDef?.unit || '';
      const label = LABEL_OVERRIDES[metricKey] || metricDef?.label || metricKey;
      const testLabel = isVALD ? valdDefFor(metricKey)?.testType : null;

      return { metricKey, chartData, isDualLine, unit, label, testLabel };
    });
  }, [progressMetrics, entries, valdEntriesFor, valdDefFor, customMetrics]);

  return (
    <div className="px-4 pt-4 pb-24">
      <ReportSection athleteId={athleteId} />

      {progressMetrics.length > 0 && (
        <>
          <h2 className="text-base font-bold text-ink-900 mb-1">Testing Data</h2>
          <p className="text-meta text-ink-500 mb-4">
            Metrics your coach is tracking with you — updates as new results come in.
          </p>
        </>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-16">
          <div className="w-8 h-8 rounded-full border-4 animate-spin"
               style={{ borderColor: 'rgba(165,141,105,0.25)', borderTopColor: GOLD }} />
        </div>
      ) : progressMetrics.length > 0 ? (
        <div className="space-y-3">
          {cards.map(card => <ProgressCard key={card.metricKey} {...card} />)}
        </div>
      ) : (
        <div className="pt-8 flex flex-col items-center text-center">
          <div className="w-16 h-16 rounded-full flex items-center justify-center mb-4 bg-gold-50">
            <TrendingUp size={28} className="text-gold-600" />
          </div>
          <p className="text-h3 mb-1 text-ink-900">Track Progress</p>
          <p className="text-meta max-w-xs text-ink-500">
            Your coach hasn't pinned any metrics to track here yet — check back once they've set some up.
          </p>
        </div>
      )}
    </div>
  );
}

function ProgressCard({ label, unit, testLabel, chartData, isDualLine }) {
  return (
    <div className="rounded-xl bg-white border border-ink-100 p-4" style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
      <div className="mb-2">
        <p className="text-sm font-bold text-ink-900">{label}</p>
        {(testLabel || chartData) && (
          <p className="text-micro text-ink-400">
            {[testLabel, chartData ? `${chartData.chartData.length} recorded` : null].filter(Boolean).join(' — ')}
          </p>
        )}
      </div>

      {!chartData ? (
        <p className="text-meta italic text-ink-400 py-4 text-center">No results recorded yet.</p>
      ) : isDualLine ? (
        <DualCardBody chartData={chartData} unit={unit} />
      ) : (
        <SingleCardBody chartData={chartData} unit={unit} />
      )}
    </div>
  );
}

function SingleCardBody({ chartData, unit }) {
  return (
    <>
      <ResponsiveContainer width="100%" height={110}>
        <ComposedChart data={chartData.chartData} margin={{ top: 4, right: 4, bottom: 0, left: -14 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" vertical={false} />
          <XAxis dataKey="label" tick={{ fontSize: 9, fill: '#d1d5db' }} axisLine={false} tickLine={false} interval="preserveStartEnd" />
          <YAxis tick={{ fontSize: 9, fill: '#d1d5db' }} axisLine={false} tickLine={false} width={30} />
          <Tooltip
            content={({ active, payload }) => {
              if (!active || !payload?.length) return null;
              const p = payload[0];
              return (
                <div className="bg-white border border-ink-100 rounded-lg px-2 py-1.5 shadow-md text-xs">
                  <p className="text-ink-400 mb-0.5">{p?.payload?.label}</p>
                  <p className="font-bold text-ink-900">{fmtNum(p?.value)}{unit ? ` ${unit}` : ''}</p>
                </div>
              );
            }}
          />
          <Bar dataKey="v" radius={[3, 3, 0, 0]} maxBarSize={28} isAnimationActive={false}>
            {chartData.chartData.map((d, i) => (
              <Cell key={i} fill={d.flagged ? AMBER : (i === chartData.chartData.length - 1 ? TEAL : FADE)} />
            ))}
          </Bar>
        </ComposedChart>
      </ResponsiveContainer>
      <div className="grid grid-cols-3 gap-1.5 mt-2">
        <Stat label="Latest" value={fmtNum(chartData.latest)} />
        <Stat label="All-Time" value={fmtNum(chartData.allTimeBest)} />
        <Stat label="Roll Avg" value={fmtNum(chartData.rollingAvg)} />
      </div>
    </>
  );
}

function DualCardBody({ chartData, unit }) {
  return (
    <>
      <div className="flex items-center gap-4 mb-1.5">
        <Legend colour={TEAL} label="Left" />
        <Legend colour={GOLD} label="Right" />
      </div>
      <ResponsiveContainer width="100%" height={110}>
        <ComposedChart data={chartData.chartData} margin={{ top: 4, right: 4, bottom: 0, left: -14 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" vertical={false} />
          <XAxis dataKey="label" tick={{ fontSize: 9, fill: '#d1d5db' }} axisLine={false} tickLine={false} interval="preserveStartEnd" />
          <YAxis tick={{ fontSize: 9, fill: '#d1d5db' }} axisLine={false} tickLine={false} width={30} />
          <Tooltip
            content={({ active, payload }) => {
              if (!active || !payload?.length) return null;
              const p = payload[0]?.payload;
              if (!p) return null;
              return (
                <div className="bg-white border border-ink-100 rounded-lg px-2 py-1.5 shadow-md text-xs">
                  <p className="text-ink-400 mb-0.5">{p.label}</p>
                  <p className="font-bold" style={{ color: TEAL }}>L: {p.valueL != null ? `${fmtNum(p.valueL)}${unit ? ' ' + unit : ''}` : '—'}</p>
                  <p className="font-bold" style={{ color: GOLD }}>R: {p.valueR != null ? `${fmtNum(p.valueR)}${unit ? ' ' + unit : ''}` : '—'}</p>
                </div>
              );
            }}
          />
          <Bar dataKey="valueL" fill={TEAL} radius={[2, 2, 0, 0]} maxBarSize={16} isAnimationActive={false} />
          <Bar dataKey="valueR" fill={GOLD} radius={[2, 2, 0, 0]} maxBarSize={16} isAnimationActive={false} />
        </ComposedChart>
      </ResponsiveContainer>
      <div className="mt-2 flex items-center justify-end">
        {chartData.lsi != null ? (
          <span className="text-meta font-bold" style={{ color: lsiColour(chartData.lsi) }}>LSI: {chartData.lsi.toFixed(1)}%</span>
        ) : (
          <span className="text-meta text-ink-400">LSI: insufficient data</span>
        )}
      </div>
    </>
  );
}

function Legend({ colour, label }) {
  return (
    <div className="flex items-center gap-1.5">
      <span className="inline-block" style={{ width: 9, height: 9, borderRadius: 2, backgroundColor: colour }} />
      <span className="text-micro text-ink-500">{label}</span>
    </div>
  );
}

function Stat({ label, value }) {
  return (
    <div className="flex flex-col items-center py-1 rounded-md bg-ink-50">
      <span className="text-ink-400 mb-0.5" style={{ fontSize: 9 }}>{label}</span>
      <span className="text-xs font-bold text-ink-700">{value}</span>
    </div>
  );
}
