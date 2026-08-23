import { useEffect, useMemo, useState } from 'react';
import {
  ChevronLeft, ChevronRight, Plus, Trash2, X, Wand2, Loader2, Send,
  CheckCircle, Clock, Circle, User, Sparkles, AlertTriangle,
} from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useDevelopmentPlans } from '../../hooks/useDevelopmentPlans';
import { useAthleteApp } from '../../hooks/useAthleteApp';
import {
  TIER_ORDER, TIER_META, DOMAIN_META, GOAL_STATUS_META, QUARTER_META,
  currentYearQuarter, buildGoalTree,
} from '../../utils/goalTree';

const GOLD = '#A58D69';
const RAG_OPTIONS = ['green', 'amber', 'red', 'grey'];
const RAG_META = {
  green: { label: 'Green', color: '#22c55e', bg: 'rgba(34,197,94,0.12)' },
  amber: { label: 'Amber', color: '#f59e0b', bg: 'rgba(245,158,11,0.12)' },
  red:   { label: 'Red',   color: '#ef4444', bg: 'rgba(239,68,68,0.12)' },
  grey:  { label: 'Grey (Unassessed)', color: '#9ca3af', bg: 'rgba(156,163,175,0.12)' },
};

const PLAN_STATUS_CONFIG = {
  closed: { icon: CheckCircle, color: '#22c55e', label: 'Closed'  },
  active: { icon: Clock,       color: '#f59e0b', label: 'In Progress' },
  draft:  { icon: Clock,       color: '#f59e0b', label: 'Draft' },
  none:   { icon: Circle,      color: '#d1d5db', label: 'Not Started' },
};

function daysUntil(dateStr) {
  if (!dateStr) return null;
  const ms = new Date(dateStr + 'T00:00:00') - new Date(new Date().toLocaleDateString('en-CA') + 'T00:00:00');
  return Math.round(ms / 86400000);
}

function todayStr() { return new Date().toLocaleDateString('en-CA'); }

function formatTimestamp(iso) {
  return new Date(iso).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
}

// ─── Modal shell ──────────────────────────────────────────────────────────────
function Modal({ title, onClose, children, wide = false }) {
  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center p-4" style={{ backgroundColor: 'rgba(0,0,0,0.4)' }} onClick={onClose}>
      <div
        className={`bg-white rounded-xl w-full ${wide ? 'max-w-2xl' : 'max-w-lg'} max-h-[85vh] overflow-y-auto`}
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 sticky top-0 bg-white">
          <h2 className="text-sm font-bold text-gray-900">{title}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-700"><X size={18} /></button>
        </div>
        <div className="p-5">{children}</div>
      </div>
    </div>
  );
}

// ─── Status pill select ───────────────────────────────────────────────────────
function StatusSelect({ value, onChange }) {
  const meta = RAG_META[value] || RAG_META.grey;
  return (
    <select
      value={value}
      onChange={e => onChange(e.target.value)}
      className="w-full text-sm font-semibold rounded-lg px-3 py-2 border-0 appearance-none cursor-pointer"
      style={{ backgroundColor: meta.bg, color: meta.color }}
    >
      {RAG_OPTIONS.map(opt => <option key={opt} value={opt}>{RAG_META[opt].label}</option>)}
    </select>
  );
}

// ─── Inline add-goal form ────────────────────────────────────────────────────
function AddGoalForm({ tier, fixedDomain, onAdd, onCancel }) {
  const [domain, setDomain] = useState(fixedDomain || 'physical');
  const [description, setDescription] = useState('');
  const [targetDate, setTargetDate] = useState('');

  const submit = () => {
    if (!description.trim()) return;
    onAdd({ domain, description: description.trim(), targetDate: targetDate || null });
    setDescription(''); setTargetDate('');
  };

  return (
    <div className="p-3 rounded-lg border border-dashed border-gray-200 space-y-2 bg-gray-50">
      <div className={`grid grid-cols-1 ${fixedDomain ? 'sm:grid-cols-3' : 'sm:grid-cols-4'} gap-2`}>
        {!fixedDomain && (
          <select value={domain} onChange={e => setDomain(e.target.value)}
            className="text-sm border border-gray-200 rounded px-2.5 py-1.5 bg-white">
            {Object.entries(DOMAIN_META).map(([key, m]) => <option key={key} value={key}>{m.label}</option>)}
          </select>
        )}
        <input type="text" value={description} onChange={e => setDescription(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && submit()}
          placeholder={`${TIER_META[tier].label} goal description`}
          className={`text-sm border border-gray-200 rounded px-2.5 py-1.5 bg-white ${fixedDomain ? 'sm:col-span-2' : 'sm:col-span-2'}`} autoFocus />
        <input type="date" value={targetDate} onChange={e => setTargetDate(e.target.value)}
          className="text-sm border border-gray-200 rounded px-2.5 py-1.5 bg-white" />
      </div>
      <div className="flex gap-2">
        <button onClick={submit} disabled={!description.trim()}
          className="px-3 py-1.5 text-xs font-semibold text-white rounded disabled:opacity-40"
          style={{ backgroundColor: GOLD }}>
          Add {TIER_META[tier].label} Goal
        </button>
        <button onClick={onCancel} className="px-3 py-1.5 text-xs font-medium text-gray-500 hover:text-gray-700">
          Cancel
        </button>
      </div>
    </div>
  );
}

// ─── One goal node + its nested children (used inside Edit Targets modal) ────
function GoalNode({ node, fixedDomain, onUpdateStatus, onDelete, onAddChild, addingUnder, setAddingUnder }) {
  const statusMeta = GOAL_STATUS_META[node.status];
  const childTier = TIER_ORDER[TIER_ORDER.indexOf(node.tier) + 1];
  const isAdding = addingUnder?.parentId === node.id;

  return (
    <div className="relative">
      <div className="p-3 rounded-lg border border-gray-100 bg-white">
        <div className="flex items-center gap-2 flex-wrap mb-1">
          <span className="text-xs font-semibold px-1.5 py-0.5 rounded bg-gray-100 text-gray-500">{TIER_META[node.tier].label}</span>
          {node.owner === 'athlete' && (
            <span className="inline-flex items-center gap-1 text-xs font-medium px-1.5 py-0.5 rounded" style={{ backgroundColor: 'rgba(165,141,105,0.12)', color: GOLD }}>
              <User size={10} /> Athlete's own
            </span>
          )}
          {node.target_date && (
            <span className="text-xs text-gray-400">Target: {new Date(node.target_date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
          )}
        </div>
        <p className="text-sm text-gray-800">{node.description}</p>
        <div className="flex items-center gap-2 mt-2 flex-wrap">
          <select value={node.status} onChange={e => onUpdateStatus(node.id, e.target.value)}
            className="text-xs font-semibold rounded-full px-2 py-1 border-0"
            style={{ backgroundColor: statusMeta.bg, color: statusMeta.color }}>
            {Object.entries(GOAL_STATUS_META).map(([key, m]) => <option key={key} value={key}>{m.label}</option>)}
          </select>
          {childTier && (
            <button onClick={() => setAddingUnder({ parentId: node.id, tier: childTier })}
              className="text-xs font-semibold flex items-center gap-1" style={{ color: GOLD }}>
              <Plus size={11} /> Add {TIER_META[childTier].label}
            </button>
          )}
          <button onClick={() => onDelete(node.id)} className="text-xs text-gray-300 hover:text-red-400 ml-auto flex items-center gap-1">
            <Trash2 size={11} />
          </button>
        </div>
      </div>

      {(node.children.length > 0 || isAdding) && (
        <div className="ml-6 mt-2 space-y-2 pl-3 border-l-2 border-gray-100">
          {node.children.map(child => (
            <GoalNode key={child.id} node={child} fixedDomain={fixedDomain} onUpdateStatus={onUpdateStatus} onDelete={onDelete}
              onAddChild={onAddChild} addingUnder={addingUnder} setAddingUnder={setAddingUnder} />
          ))}
          {isAdding && (
            <AddGoalForm tier={childTier} fixedDomain={fixedDomain}
              onAdd={patch => { onAddChild(node.id, childTier, patch); setAddingUnder(null); }}
              onCancel={() => setAddingUnder(null)} />
          )}
        </div>
      )}
    </div>
  );
}

// ─── Edit Targets modal — full tier tree, scoped to one domain ───────────────
function EditTargetsModal({ domainKey, meta, tree, onAddRoot, onAddChild, onUpdateStatus, onDelete, onClose }) {
  const [addingRoot, setAddingRoot] = useState(false);
  const [addingUnder, setAddingUnder] = useState(null);

  return (
    <Modal title={`${meta.label} — Targets`} onClose={onClose} wide>
      <div className="flex items-center justify-between mb-3">
        <p className="text-xs text-gray-400">Long-term goals cascade down through medium, short-term, and process steps.</p>
        {!addingRoot && (
          <button onClick={() => setAddingRoot(true)} className="text-xs font-semibold flex items-center gap-1 shrink-0" style={{ color: GOLD }}>
            <Plus size={12} /> Add Long-term Goal
          </button>
        )}
      </div>

      {tree.length === 0 && !addingRoot && (
        <p className="text-xs text-gray-300 py-6 text-center">No goals set yet for this domain.</p>
      )}

      <div className="space-y-2">
        {tree.map(node => (
          <GoalNode key={node.id} node={node} fixedDomain={domainKey}
            onUpdateStatus={onUpdateStatus} onDelete={onDelete} onAddChild={onAddChild}
            addingUnder={addingUnder} setAddingUnder={setAddingUnder} />
        ))}
        {addingRoot && (
          <AddGoalForm tier="long" fixedDomain={domainKey}
            onAdd={patch => { onAddRoot(patch); setAddingRoot(false); }}
            onCancel={() => setAddingRoot(false)} />
        )}
      </div>
    </Modal>
  );
}

// ─── Compact per-domain summary card ──────────────────────────────────────────
function DomainSummaryCard({ meta, status, notesCount, targets, onStatusChange, onEditTargets, disabled }) {
  const ragMeta = RAG_META[status] || RAG_META.grey;
  const shown = targets.slice(0, 4);
  const extra = targets.length - shown.length;

  return (
    <div className="bg-white rounded-xl border border-gray-100 p-4 flex flex-col">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: ragMeta.color }} />
          <span className="text-sm font-bold text-gray-900">{meta.label}</span>
        </div>
        <span className="text-xs text-gray-400">{notesCount} note{notesCount === 1 ? '' : 's'}</span>
      </div>

      <label className="text-micro text-[10px] font-bold uppercase tracking-wide text-gray-400 mb-1">Status</label>
      <StatusSelect value={status} onChange={val => onStatusChange(val)} />

      <label className="text-micro text-[10px] font-bold uppercase tracking-wide text-gray-400 mt-4 mb-1.5">Targets This Quarter</label>
      <div className="space-y-1.5 flex-1">
        {shown.length === 0 ? (
          <p className="text-xs italic text-gray-300 py-1">No targets set.</p>
        ) : (
          shown.map(g => (
            <div key={g.id} className="text-xs text-gray-700 bg-gray-50 rounded px-2.5 py-1.5 truncate" title={g.description}>
              {g.description}
            </div>
          ))
        )}
        {extra > 0 && <p className="text-xs text-gray-400">+{extra} more</p>}
      </div>

      <button onClick={onEditTargets} disabled={disabled}
        className="mt-3 w-full py-2 text-xs font-semibold rounded-lg border border-gray-200 hover:bg-gray-50 text-gray-700 disabled:opacity-50">
        Edit targets
      </button>
    </div>
  );
}

// ─── Add-note modal (unified across domains) ──────────────────────────────────
function AddNoteModal({ onAdd, onClose }) {
  const [domain, setDomain] = useState('physical');
  const [sessionDate, setSessionDate] = useState(todayStr());
  const [staff, setStaff] = useState('');
  const [status, setStatus] = useState('grey');
  const [note, setNote] = useState('');

  const submit = () => {
    if (!staff.trim()) return;
    onAdd(domain, { staff: staff.trim(), note: note.trim(), status, sessionDate });
    onClose();
  };

  return (
    <Modal title="Add note" onClose={onClose}>
      <div className="space-y-3">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide block mb-1">Category</label>
            <select value={domain} onChange={e => setDomain(e.target.value)}
              className="w-full text-sm border border-gray-200 rounded px-3 py-2 bg-white">
              {Object.entries(DOMAIN_META).map(([key, m]) => <option key={key} value={key}>{m.label}</option>)}
            </select>
          </div>
          <div>
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide block mb-1">Date</label>
            <input type="date" value={sessionDate} onChange={e => setSessionDate(e.target.value)}
              className="w-full text-sm border border-gray-200 rounded px-3 py-2 bg-white" />
          </div>
        </div>
        <div>
          <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide block mb-1">Assessor *</label>
          <input type="text" value={staff} onChange={e => setStaff(e.target.value)}
            placeholder="e.g. James Whitfield"
            className="w-full text-sm border border-gray-200 rounded px-3 py-2 bg-white" />
        </div>
        <div>
          <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide block mb-1">Colour Rating</label>
          <div className="flex gap-1.5">
            {RAG_OPTIONS.map(opt => {
              const m = RAG_META[opt];
              const active = status === opt;
              return (
                <button key={opt} onClick={() => setStatus(opt)}
                  className="flex-1 py-1.5 rounded text-xs font-semibold border"
                  style={{ backgroundColor: active ? m.bg : 'transparent', borderColor: active ? m.color : '#e5e7eb', color: active ? m.color : '#6b7280' }}>
                  {m.label.replace(' (Unassessed)', '')}
                </button>
              );
            })}
          </div>
        </div>
        <div>
          <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide block mb-1">Notes</label>
          <textarea rows={4} value={note} onChange={e => setNote(e.target.value)}
            placeholder="Record observations, interventions, or context..."
            className="w-full text-sm border border-gray-200 rounded px-3 py-2 resize-none bg-white" />
        </div>
        <button onClick={submit} disabled={!staff.trim()}
          className="w-full py-2.5 text-sm font-semibold text-white rounded-lg disabled:opacity-40"
          style={{ backgroundColor: GOLD }}>
          Save Note
        </button>
      </div>
    </Modal>
  );
}

// ─── Main export ─────────────────────────────────────────────────────────────
export default function GoalsTab({
  athleteId, athleteName, rag = {}, ragLog = {}, onStatusChange, onAddRagEntry, onDeleteRagEntry,
  highlightEntry = null, onClearHighlight,
}) {
  const { plans, loading, goalsForPlan, startReview, addGoal, updateGoal, deleteGoal, adoptAthleteGoal, closeReview, saveDraft, sendToAthlete } = useDevelopmentPlans(athleteId);
  const { tokenData: athleteToken } = useAthleteApp(athleteId);

  const initial = currentYearQuarter();
  const [year, setYear] = useState(initial.year);
  const [quarter, setQuarter] = useState(initial.quarter);
  const [starting, setStarting] = useState(false);
  const [editingDomain, setEditingDomain] = useState(null);
  const [showAddNote, setShowAddNote] = useState(false);
  const [noteFilter, setNoteFilter] = useState('all');
  const [drafting, setDrafting] = useState(false);
  const [draftError, setDraftError] = useState(null);
  const [sending, setSending] = useState(false);
  const [sendError, setSendError] = useState(null);

  const plan = plans.find(p => p.year === year && p.quarter === quarter);
  const planGoals = plan ? goalsForPlan(plan.id) : [];
  const coachGoals = planGoals.filter(g => g.owner === 'coach');
  const athleteGoals = planGoals.filter(g => g.owner === 'athlete');
  const unadoptedAthleteGoals = athleteGoals.filter(g => !g.linked_goal_id);

  const [narrative, setNarrative] = useState('');
  const [conductedBy, setConductedBy] = useState('');
  const [ragSummary, setRagSummary] = useState(rag);

  useMemo(() => {
    setNarrative(plan?.narrative || '');
    setConductedBy(plan?.conducted_by || '');
    setRagSummary(plan?.rag_summary && Object.keys(plan.rag_summary).length ? plan.rag_summary : rag);
  }, [plan?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  // Deep-linked from elsewhere (e.g. Overview's "click to navigate to
  // pillar section") — filter the notes log to the right domain, scroll
  // the entry into view, then clear the highlight after a pause.
  useEffect(() => {
    if (!highlightEntry?.entryId) return;
    setNoteFilter(highlightEntry.domain || 'all');
    const frame = requestAnimationFrame(() => {
      const el = document.getElementById(`entry-${highlightEntry.entryId}`);
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    });
    const t = setTimeout(() => onClearHighlight?.(), 2500);
    return () => { cancelAnimationFrame(frame); clearTimeout(t); };
  }, [highlightEntry?.entryId]); // eslint-disable-line react-hooks/exhaustive-deps

  // Ensures a plan exists for the selected quarter before writing a
  // goal or note to it — goal rows always need a plan_id, and starting
  // a review is a one-click, no-friction action, so we chain it
  // automatically rather than blocking the coach with an extra step.
  const ensurePlan = async () => {
    if (plan) return plan;
    setStarting(true);
    const res = await startReview(year, quarter);
    setStarting(false);
    return res.ok ? res.plan : null;
  };

  const handleEditTargets = async (domainKey) => {
    await ensurePlan();
    setEditingDomain(domainKey);
  };

  const handleAddRootGoal = (domainKey) => async (patch) => {
    const p = await ensurePlan();
    if (!p) return;
    addGoal({ planId: p.id, parentGoalId: null, tier: 'long', domain: patch.domain || domainKey, description: patch.description, targetDate: patch.targetDate });
  };

  const handleAddChildGoal = (parentId, tier, patch) => {
    const parent = coachGoals.find(g => g.id === parentId);
    addGoal({ planId: plan.id, parentGoalId: parentId, tier, domain: patch.domain || parent?.domain, description: patch.description, targetDate: patch.targetDate });
  };

  const handleAddNote = (domainKey, entryData) => onAddRagEntry?.(domainKey, entryData);

  const handleSaveDraft = () => saveDraft(plan.id, { narrative, ragSummary, conductedBy });

  const handleComplete = async () => {
    await closeReview(plan.id, { narrative, ragSummary, conductedBy });
    const qLabel = plan.period_label;
    Object.entries(ragSummary).forEach(([domain, status]) => {
      onAddRagEntry?.(domain, {
        staff: conductedBy || 'Unknown',
        status,
        note: `[Quarterly Review ${qLabel}] ${narrative ? narrative.slice(0, 120) + (narrative.length > 120 ? '…' : '') : 'Review completed.'}`,
        source: 'quarterly_review',
      });
    });
  };

  // Every note across every domain, tagged, newest first.
  const allNotes = useMemo(() => {
    const flat = [];
    Object.keys(DOMAIN_META).forEach(domainKey => {
      (ragLog[domainKey] || []).forEach(entry => flat.push({ ...entry, domain: domainKey }));
    });
    return flat.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
  }, [ragLog]);

  const filteredNotes = noteFilter === 'all' ? allNotes : allNotes.filter(n => n.domain === noteFilter);
  const recentNotes = filteredNotes.filter(n => {
    const cutoff = new Date(); cutoff.setMonth(cutoff.getMonth() - 4);
    return new Date(n.timestamp) >= cutoff;
  });

  const handleGenerateDraft = async () => {
    const p = await ensurePlan();
    if (!p) return;
    setDrafting(true);
    setDraftError(null);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const notesPayload = recentNotes.map(n => ({
        domain: DOMAIN_META[n.domain]?.label || n.domain,
        date: n.timestamp ? formatTimestamp(n.timestamp) : null,
        entryType: n.entryType,
        note: n.note,
      }));
      const goalsPayload = coachGoals.map(g => ({
        domain: DOMAIN_META[g.domain]?.label || g.domain,
        tier: TIER_META[g.tier]?.label || g.tier,
        status: GOAL_STATUS_META[g.status]?.label || g.status,
        description: g.description,
      }));
      const res = await fetch('/api/ai/draft-report', {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
          ...(session ? { Authorization: `Bearer ${session.access_token}` } : {}),
        },
        body: JSON.stringify({ athleteName, periodLabel: p.period_label, notes: notesPayload, goals: goalsPayload }),
      });
      const json = await res.json();
      if (!json.ok) {
        setDraftError(json.error || 'Could not generate a draft.');
        return;
      }
      setNarrative(json.narrative);
    } catch (e) {
      setDraftError(e.message || 'Could not generate a draft.');
    } finally {
      setDrafting(false);
    }
  };

  // Stamps sent_at (surfaces the narrative/RAG summary on the athlete's
  // Progress tab) and pushes a notification. Push failure doesn't roll
  // back the send — the report is still "sent" either way, the athlete
  // just won't get the tap-to-open nudge until they next open the app.
  const handleSendToAthlete = async () => {
    setSending(true);
    setSendError(null);
    const res = await sendToAthlete(plan.id);
    if (!res.ok) {
      setSendError(res.error?.message || 'Could not send the report.');
      setSending(false);
      return;
    }
    try {
      const { data: { session } } = await supabase.auth.getSession();
      await fetch('/api/push/send', {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
          ...(session ? { Authorization: `Bearer ${session.access_token}` } : {}),
        },
        body: JSON.stringify({
          athlete_id: athleteId,
          title: 'Your quarterly report is ready',
          body: `Your ${plan.period_label} report is now available on your Progress tab.`,
          url: athleteToken?.token ? `/athlete/${athleteToken.token}?tab=progress` : '/',
        }),
      });
    } catch (e) {
      console.error('[GoalsTab] push notify failed (report still sent)', e);
    }
    setSending(false);
  };

  const currentYear = currentYearQuarter().year;
  const planStatusKey = plan ? plan.status : 'none';
  const planStatusCfg = PLAN_STATUS_CONFIG[planStatusKey];
  const StatusIcon = planStatusCfg.icon;
  const dueIn = plan && plan.status !== 'closed' ? daysUntil(plan.period_end) : null;

  const editingMeta = editingDomain ? DOMAIN_META[editingDomain] : null;
  const editingTree = editingDomain ? buildGoalTree(coachGoals.filter(g => g.domain === editingDomain)) : [];

  if (loading) {
    return <div className="py-16 text-center text-sm text-gray-400">Loading…</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-gray-900">Goals & Development</h1>
        <div className="flex items-center gap-2">
          <button onClick={() => setYear(y => y - 1)} className="p-1 rounded hover:bg-gray-100 text-gray-400 hover:text-gray-700">
            <ChevronLeft size={16} />
          </button>
          <span className="text-sm font-semibold text-gray-700 w-12 text-center">{year}</span>
          <button onClick={() => setYear(y => y + 1)} disabled={year >= currentYear}
            className="p-1 rounded hover:bg-gray-100 text-gray-400 hover:text-gray-700 disabled:opacity-30">
            <ChevronRight size={16} />
          </button>
        </div>
      </div>

      {/* Quarter chips */}
      <div className="flex gap-2">
        {[1, 2, 3, 4].map(q => {
          const p = plans.find(pl => pl.year === year && pl.quarter === q);
          const cfg = PLAN_STATUS_CONFIG[p ? p.status : 'none'];
          const Icon = cfg.icon;
          const isSelected = q === quarter;
          return (
            <button key={q} onClick={() => setQuarter(q)}
              className="flex-1 px-3 py-2.5 rounded-lg border text-left transition-colors bg-white"
              style={{ borderColor: isSelected ? GOLD : '#e5e7eb', boxShadow: isSelected ? `0 0 0 1px ${GOLD}` : 'none' }}>
              <div className="flex items-center justify-between">
                <span className="font-bold text-gray-900 text-sm">{QUARTER_META[q].label}</span>
                <Icon size={14} style={{ color: cfg.color }} />
              </div>
              <p className="text-xs text-gray-400">{QUARTER_META[q].range}</p>
            </button>
          );
        })}
      </div>

      {/* Per-domain summary cards — always available, not gated behind
          a review being open (this is ongoing athlete-level data). */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {Object.entries(DOMAIN_META).map(([key, meta]) => (
          <DomainSummaryCard
            key={key}
            meta={meta}
            status={rag[key] || 'grey'}
            notesCount={(ragLog[key] || []).length}
            targets={coachGoals.filter(g => g.domain === key)}
            onStatusChange={val => onStatusChange?.(key, val)}
            onEditTargets={() => handleEditTargets(key)}
            disabled={starting}
          />
        ))}
      </div>

      {plan && dueIn !== null && dueIn <= 14 && (
        <div className="flex items-center gap-3 flex-wrap">
          <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full" style={{ backgroundColor: 'rgba(245,158,11,0.1)', color: '#b45309' }}>
            <AlertTriangle size={11} /> {dueIn <= 0 ? 'Review period has ended' : `Due in ${dueIn} day${dueIn === 1 ? '' : 's'}`}
          </span>
        </div>
      )}

      {/* Athlete-submitted goals awaiting review */}
      {unadoptedAthleteGoals.length > 0 && (
        <div className="bg-white rounded-lg border border-gray-100 p-4">
          <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wide mb-3 flex items-center gap-2">
            <Sparkles size={14} style={{ color: GOLD }} /> Athlete's Goals
            <span className="text-gray-400 font-normal normal-case">— submitted this quarter, not yet in the plan</span>
          </h2>
          <div className="space-y-2">
            {unadoptedAthleteGoals.map(g => {
              const domainMeta = DOMAIN_META[g.domain];
              return (
                <div key={g.id} className="flex items-start gap-3 p-3 rounded-lg bg-gray-50">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <span className="text-xs font-semibold px-1.5 py-0.5 rounded" style={{ backgroundColor: `${domainMeta.color}1a`, color: domainMeta.color }}>
                        {domainMeta.label}
                      </span>
                      <span className="text-xs text-gray-400">{TIER_META[g.tier].label}</span>
                    </div>
                    <p className="text-sm text-gray-700">{g.description}</p>
                  </div>
                  <button onClick={() => adoptAthleteGoal(g)}
                    className="px-3 py-1.5 text-xs font-semibold text-white rounded shrink-0" style={{ backgroundColor: GOLD }}>
                    Adopt into plan
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* AI draft — sits above the notes it reads from. Result always
          lands in the editable Overall Narrative field further down,
          so the coach can freely edit or replace it. */}
      <div className="rounded-lg p-3 flex items-center gap-3" style={{ backgroundColor: 'rgba(165,141,105,0.08)' }}>
        <Wand2 size={16} style={{ color: GOLD }} className="shrink-0" />
        <div className="flex-1 min-w-0">
          <p className="text-xs font-semibold text-gray-800">Generate Draft {QUARTER_META[quarter].label} Report</p>
          <p className="text-xs text-gray-500">
            {draftError || `Drafts the Overall Narrative below from the ${recentNotes.length} note${recentNotes.length === 1 ? '' : 's'} in the log — always yours to edit or replace.`}
          </p>
        </div>
        <button onClick={handleGenerateDraft} disabled={drafting || starting || (!recentNotes.length && !coachGoals.length)}
          className="px-3 py-2 text-xs font-semibold text-white rounded-lg disabled:opacity-40 flex items-center gap-1.5 shrink-0"
          style={{ backgroundColor: GOLD }}>
          {drafting ? <><Loader2 size={12} className="animate-spin" /> Drafting…</> : 'Generate'}
        </button>
      </div>

      {/* Review meta / close — sits right below the Generate button so
          the drafted narrative is immediately visible, not buried below
          the notes log. */}
      {plan && (
        <div className="bg-white rounded-lg border border-gray-100 p-4 space-y-4">
          <div className="flex items-center gap-3 flex-wrap">
            <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wide">Review Summary</h2>
            <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full" style={{ backgroundColor: `${planStatusCfg.color}1a`, color: planStatusCfg.color }}>
              <StatusIcon size={11} /> {planStatusCfg.label}
            </span>
          </div>

          {plan.status === 'closed' ? (
            <div className="space-y-3">
              <p className="text-xs text-gray-400">
                Conducted by <span className="text-gray-700 font-medium">{plan.conducted_by || '—'}</span>
                {plan.closed_at && <> · {new Date(plan.closed_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}</>}
              </p>
              {plan.narrative && <p className="text-sm text-gray-700 leading-relaxed">{plan.narrative}</p>}
              <div className="flex items-center gap-3 pt-2 border-t border-gray-100">
                {plan.sent_at ? (
                  <>
                    <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full" style={{ backgroundColor: 'rgba(34,197,94,0.1)', color: '#16a34a' }}>
                      <CheckCircle size={11} /> Sent to athlete {new Date(plan.sent_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </span>
                    <button onClick={handleSendToAthlete} disabled={sending}
                      className="text-xs font-semibold text-gray-500 hover:text-gray-700 disabled:opacity-50">
                      {sending ? 'Resending…' : 'Resend'}
                    </button>
                  </>
                ) : (
                  <button onClick={handleSendToAthlete} disabled={sending}
                    className="px-4 py-2 text-sm font-semibold text-white rounded-lg disabled:opacity-50 flex items-center gap-1.5"
                    style={{ backgroundColor: GOLD }}>
                    {sending ? <><Loader2 size={13} className="animate-spin" /> Sending…</> : <><Send size={13} /> Send to Athlete</>}
                  </button>
                )}
              </div>
              {sendError && <p className="text-xs text-red-500">{sendError}</p>}
            </div>
          ) : (
            <>
              <div>
                <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1.5">Conducted By</label>
                <input type="text" value={conductedBy} onChange={e => setConductedBy(e.target.value)}
                  placeholder="Staff member name"
                  className="w-full text-sm border border-gray-200 rounded px-3 py-2 bg-white" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1.5">RAG Summary at Review</label>
                <div className="grid grid-cols-2 gap-3">
                  {Object.entries(DOMAIN_META).map(([key, meta]) => {
                    const current = ragSummary[key] || 'grey';
                    return (
                      <div key={key}>
                        <p className="text-xs text-gray-500 mb-1">{meta.label}</p>
                        <div className="flex gap-1.5">
                          {RAG_OPTIONS.map(opt => {
                            const cfg = RAG_META[opt];
                            const isActive = opt === current;
                            return (
                              <button key={opt} onClick={() => setRagSummary(s => ({ ...s, [key]: opt }))}
                                title={cfg.label}
                                className="w-6 h-6 rounded-full border-2 transition-transform hover:scale-110"
                                style={{ backgroundColor: cfg.color, borderColor: isActive ? '#1C1C1C' : 'transparent', boxShadow: isActive ? '0 0 0 2px white, 0 0 0 3px #1C1C1C' : 'none' }} />
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1.5">Overall Narrative</label>
                <textarea rows={4} value={narrative} onChange={e => setNarrative(e.target.value)}
                  placeholder="Summarise the athlete's progress this quarter — this becomes the headline of their own report. Use Generate Draft above to start from your notes."
                  className="w-full text-sm border border-gray-200 rounded px-3 py-2 resize-none bg-white" />
              </div>
              <div className="flex items-center gap-3 pt-2 border-t border-gray-100">
                <button onClick={handleComplete}
                  className="px-4 py-2 text-sm font-semibold text-white rounded-lg hover:opacity-90"
                  style={{ backgroundColor: '#22c55e' }}>
                  Mark as Complete
                </button>
                <button onClick={handleSaveDraft}
                  className="px-4 py-2 text-sm font-semibold rounded-lg border border-gray-200 hover:bg-gray-50 text-gray-700">
                  Save Draft
                </button>
              </div>
            </>
          )}
        </div>
      )}

      {/* Unified notes log — all domains, filterable */}
      <div className="bg-white rounded-lg border border-gray-100 p-4">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wide">
            Notes Log <span className="text-gray-400 font-normal normal-case">({allNotes.length})</span>
          </h2>
          <button onClick={() => setShowAddNote(true)}
            className="flex items-center gap-1.5 text-xs font-semibold px-3 py-2 text-white rounded-lg" style={{ backgroundColor: GOLD }}>
            <Plus size={12} /> Add note
          </button>
        </div>

        <div className="flex gap-1 border-b border-gray-100 mb-4">
          {['all', ...Object.keys(DOMAIN_META)].map(key => (
            <button key={key} onClick={() => setNoteFilter(key)}
              className="px-3 py-2 text-xs font-semibold border-b-2 transition-colors"
              style={{ color: noteFilter === key ? GOLD : '#6b7280', borderColor: noteFilter === key ? GOLD : 'transparent' }}>
              {key === 'all' ? 'All' : DOMAIN_META[key].label}
            </button>
          ))}
        </div>

        {recentNotes.length === 0 ? (
          <p className="text-xs text-gray-300 py-6 text-center">No notes yet. Add one using the button above.</p>
        ) : (
          <div className="space-y-1">
            {recentNotes.map(entry => {
              const cfg = RAG_META[entry.status] || RAG_META.grey;
              const isHighlighted = highlightEntry?.domain === entry.domain && highlightEntry?.entryId === entry.id;
              return (
                <div key={entry.id} id={`entry-${entry.id}`}
                  className="group flex gap-3 border-b border-gray-50 last:border-0 rounded"
                  style={{ padding: '12px 8px', backgroundColor: isHighlighted ? 'rgba(165,141,105,0.15)' : 'transparent' }}>
                  <div className="pt-0.5 shrink-0">
                    <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: cfg.color }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <span className="text-xs font-semibold text-gray-700">{entry.staff}</span>
                      {noteFilter === 'all' && (
                        <span className="text-xs font-medium px-1.5 py-0.5 rounded bg-gray-100 text-gray-500">{DOMAIN_META[entry.domain]?.label}</span>
                      )}
                      <span className="text-xs text-gray-400 ml-auto">{formatTimestamp(entry.timestamp)}</span>
                    </div>
                    {entry.note
                      ? <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-wrap">{entry.note}</p>
                      : <p className="text-sm text-gray-300 italic">No notes recorded.</p>}
                  </div>
                  <button
                    onClick={() => { if (window.confirm('Delete this entry? This cannot be undone.')) onDeleteRagEntry?.(entry.domain, entry.id); }}
                    className="shrink-0 self-start mt-0.5 p-1 rounded text-gray-300 hover:text-red-500 hover:bg-red-50 opacity-0 group-hover:opacity-100 transition-all">
                    <Trash2 size={13} />
                  </button>
                </div>
              );
            })}
          </div>
        )}
        <p className="text-xs text-gray-400 text-center pt-3 mt-2 border-t border-gray-50">
          Notes older than 4 months are hidden here — use the domain filters above to narrow down what you're looking for.
        </p>
      </div>

      {editingDomain && (
        <EditTargetsModal
          domainKey={editingDomain}
          meta={editingMeta}
          tree={editingTree}
          onAddRoot={handleAddRootGoal(editingDomain)}
          onAddChild={handleAddChildGoal}
          onUpdateStatus={(id, status) => updateGoal(id, { status })}
          onDelete={deleteGoal}
          onClose={() => setEditingDomain(null)}
        />
      )}

      {showAddNote && (
        <AddNoteModal onAdd={handleAddNote} onClose={() => setShowAddNote(false)} />
      )}
    </div>
  );
}
