import { useState } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  Plus,
  Trash2,
  CheckCircle,
  Clock,
  Circle,
} from 'lucide-react';
import { RAG_CONFIG, RAG_DOMAINS } from '../data/athletes';

// ─── Constants ─────────────────────────────────────────────────────────────
const QUARTER_META = {
  1: { label: 'Q1', range: 'Jan – Mar' },
  2: { label: 'Q2', range: 'Apr – Jun' },
  3: { label: 'Q3', range: 'Jul – Sep' },
  4: { label: 'Q4', range: 'Oct – Dec' },
};

const PILLARS = ['Physical', 'Nutritional', 'Psychological', 'Lifestyle'];
const GOAL_STATUSES = ['Not Started', 'In Progress', 'Complete'];
const RAG_OPTIONS = ['green', 'amber', 'red', 'grey'];

const STATUS_CONFIG = {
  Complete:    { icon: CheckCircle, color: '#22c55e', bg: 'rgba(34,197,94,0.08)',   label: 'Complete'    },
  'In Progress': { icon: Clock,       color: '#f59e0b', bg: 'rgba(245,158,11,0.08)', label: 'In Progress' },
  'Not Started': { icon: Circle,      color: '#9ca3af', bg: 'rgba(156,163,175,0.08)', label: 'Not Started' },
};

function uid() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

// ─── Sub-components ─────────────────────────────────────────────────────────

function StatusBadge({ status }) {
  const cfg = STATUS_CONFIG[status] || STATUS_CONFIG['Not Started'];
  const Icon = cfg.icon;
  return (
    <span
      className="inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full"
      style={{ backgroundColor: cfg.bg, color: cfg.color }}
    >
      <Icon size={11} />
      {cfg.label}
    </span>
  );
}

function RagSummaryDot({ domain, status }) {
  const cfg = RAG_CONFIG[status] || RAG_CONFIG.grey;
  const domainLabel = RAG_DOMAINS.find((d) => d.key === domain)?.label || domain;
  return (
    <div className="flex items-center gap-1.5">
      <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: cfg.color }} />
      <span className="text-xs text-gray-600">{domainLabel}</span>
    </div>
  );
}

// Read-only completed review display
function CompletedReviewView({ review }) {
  return (
    <div className="space-y-5 pt-2">
      {/* Meta row */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-sm">
        <div>
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">Date Completed</p>
          <p className="font-medium text-gray-800">
            {review.dateCompleted
              ? new Date(review.dateCompleted).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })
              : '—'}
          </p>
        </div>
        <div>
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">Conducted By</p>
          <p className="font-medium text-gray-800">{review.conductedBy || '—'}</p>
        </div>
        <div>
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">RAG Summary</p>
          <div className="grid grid-cols-2 gap-x-3 gap-y-1">
            {Object.entries(review.ragSummary || {}).map(([domain, status]) => (
              <RagSummaryDot key={domain} domain={domain} status={status} />
            ))}
          </div>
        </div>
      </div>

      {/* Narrative */}
      {review.narrative && (
        <div>
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">Overall Narrative</p>
          <p className="text-sm text-gray-700 leading-relaxed">{review.narrative}</p>
        </div>
      )}

      {/* Goals */}
      {review.goals?.length > 0 && (
        <div>
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">Goals & Actions</p>
          <div className="space-y-2">
            {review.goals.map((goal) => {
              const statusColor = goal.status === 'Complete' ? '#22c55e' : goal.status === 'In Progress' ? '#f59e0b' : '#9ca3af';
              return (
                <div key={goal.id} className="flex items-start gap-3 p-3 rounded-lg" style={{ backgroundColor: '#f9fafb' }}>
                  <div className="w-2 h-2 rounded-full mt-1.5 shrink-0" style={{ backgroundColor: statusColor }} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-0.5">
                      <span
                        className="text-xs font-semibold px-1.5 py-0.5 rounded"
                        style={{ backgroundColor: 'rgba(67,126,141,0.1)', color: '#437E8D' }}
                      >
                        {goal.pillar}
                      </span>
                      <span className="text-xs text-gray-400">{goal.status}</span>
                      {goal.targetDate && (
                        <span className="text-xs text-gray-400">
                          · Target: {new Date(goal.targetDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-700">{goal.description}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

// Editable goal row inside the form
function GoalRow({ goal, onChange, onRemove }) {
  const inputClass = 'w-full text-sm border border-gray-200 rounded px-2.5 py-1.5 focus:outline-none focus:ring-1 bg-white';
  const ringStyle = { '--tw-ring-color': '#A58D69' };

  return (
    <div className="flex items-start gap-2 p-3 rounded-lg" style={{ backgroundColor: '#f9fafb' }}>
      <div className="flex-1 grid grid-cols-1 sm:grid-cols-4 gap-2">
        <select
          value={goal.pillar}
          onChange={(e) => onChange({ ...goal, pillar: e.target.value })}
          className={`${inputClass} col-span-1`}
          style={ringStyle}
        >
          {PILLARS.map((p) => <option key={p}>{p}</option>)}
        </select>
        <input
          type="text"
          value={goal.description}
          onChange={(e) => onChange({ ...goal, description: e.target.value })}
          placeholder="Goal description"
          className={`${inputClass} col-span-1 sm:col-span-2`}
          style={ringStyle}
        />
        <div className="grid grid-cols-2 gap-2">
          <input
            type="date"
            value={goal.targetDate}
            onChange={(e) => onChange({ ...goal, targetDate: e.target.value })}
            className={inputClass}
            style={ringStyle}
          />
          <select
            value={goal.status}
            onChange={(e) => onChange({ ...goal, status: e.target.value })}
            className={inputClass}
            style={ringStyle}
          >
            {GOAL_STATUSES.map((s) => <option key={s}>{s}</option>)}
          </select>
        </div>
      </div>
      <button onClick={onRemove} className="p-1.5 text-gray-300 hover:text-red-400 transition-colors shrink-0">
        <Trash2 size={14} />
      </button>
    </div>
  );
}

// Editable review form (In Progress / Not Started)
function ReviewForm({ review, onSave, onComplete, onCancel }) {
  const [form, setForm] = useState(() => ({
    conductedBy: review?.conductedBy || '',
    ragSummary: review?.ragSummary || { physical: 'grey', psych: 'grey', nutrition: 'grey', lifestyle: 'grey' },
    narrative: review?.narrative || '',
    goals: review?.goals || [],
  }));
  const [addingGoal, setAddingGoal] = useState(false);
  const [newGoal, setNewGoal] = useState({ pillar: 'Physical', description: '', targetDate: '', status: 'Not Started' });

  const set = (field, val) => setForm((f) => ({ ...f, [field]: val }));

  const handleAddGoal = () => {
    if (!newGoal.description.trim()) return;
    set('goals', [...form.goals, { ...newGoal, id: uid() }]);
    setNewGoal({ pillar: 'Physical', description: '', targetDate: '', status: 'Not Started' });
    setAddingGoal(false);
  };

  const handleGoalChange = (idx, updated) => {
    const goals = form.goals.map((g, i) => (i === idx ? updated : g));
    set('goals', goals);
  };

  const handleGoalRemove = (idx) => {
    set('goals', form.goals.filter((_, i) => i !== idx));
  };

  const inputClass = 'w-full text-sm border border-gray-200 rounded px-3 py-2 focus:outline-none focus:ring-2 bg-white placeholder-gray-300';
  const ringStyle = { '--tw-ring-color': '#A58D69' };
  const labelClass = 'block text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1.5';

  return (
    <div className="space-y-5 pt-2">
      {/* Conducted by */}
      <div>
        <label className={labelClass}>Conducted By</label>
        <input
          type="text"
          value={form.conductedBy}
          onChange={(e) => set('conductedBy', e.target.value)}
          placeholder="Staff member name"
          className={inputClass}
          style={ringStyle}
        />
      </div>

      {/* RAG summary */}
      <div>
        <label className={labelClass}>RAG Summary at Review</label>
        <div className="grid grid-cols-2 gap-3">
          {RAG_DOMAINS.map(({ key, label }) => {
            const current = form.ragSummary[key] || 'grey';
            return (
              <div key={key}>
                <p className="text-xs text-gray-500 mb-1">{label}</p>
                <div className="flex gap-1.5">
                  {RAG_OPTIONS.map((opt) => {
                    const cfg = RAG_CONFIG[opt];
                    const isActive = opt === current;
                    return (
                      <button
                        key={opt}
                        onClick={() => set('ragSummary', { ...form.ragSummary, [key]: opt })}
                        title={cfg.label}
                        className="w-6 h-6 rounded-full border-2 transition-transform hover:scale-110"
                        style={{
                          backgroundColor: cfg.color,
                          borderColor: isActive ? '#1C1C1C' : 'transparent',
                          boxShadow: isActive ? '0 0 0 2px white, 0 0 0 3px #1C1C1C' : 'none',
                        }}
                      />
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Narrative */}
      <div>
        <label className={labelClass}>Overall Narrative</label>
        <textarea
          rows={4}
          value={form.narrative}
          onChange={(e) => set('narrative', e.target.value)}
          placeholder="Summarise the athlete's progress this quarter..."
          className={`${inputClass} resize-none`}
          style={ringStyle}
        />
      </div>

      {/* Goals */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <label className={labelClass + ' mb-0'}>Goals & Actions</label>
          {!addingGoal && (
            <button
              onClick={() => setAddingGoal(true)}
              className="flex items-center gap-1 text-xs font-semibold"
              style={{ color: '#A58D69' }}
            >
              <Plus size={12} /> Add Goal
            </button>
          )}
        </div>

        <div className="space-y-2">
          {form.goals.map((goal, idx) => (
            <GoalRow
              key={goal.id}
              goal={goal}
              onChange={(updated) => handleGoalChange(idx, updated)}
              onRemove={() => handleGoalRemove(idx)}
            />
          ))}
        </div>

        {/* Inline new-goal form */}
        {addingGoal && (
          <div className="mt-2 p-3 rounded-lg border border-dashed border-gray-200 space-y-2">
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-2">
              <select
                value={newGoal.pillar}
                onChange={(e) => setNewGoal((g) => ({ ...g, pillar: e.target.value }))}
                className="text-sm border border-gray-200 rounded px-2.5 py-1.5 focus:outline-none bg-white"
              >
                {PILLARS.map((p) => <option key={p}>{p}</option>)}
              </select>
              <input
                type="text"
                value={newGoal.description}
                onChange={(e) => setNewGoal((g) => ({ ...g, description: e.target.value }))}
                placeholder="Goal description"
                className="text-sm border border-gray-200 rounded px-2.5 py-1.5 focus:outline-none bg-white sm:col-span-2"
                autoFocus
              />
              <input
                type="date"
                value={newGoal.targetDate}
                onChange={(e) => setNewGoal((g) => ({ ...g, targetDate: e.target.value }))}
                className="text-sm border border-gray-200 rounded px-2.5 py-1.5 focus:outline-none bg-white"
              />
            </div>
            <div className="flex gap-2">
              <button
                onClick={handleAddGoal}
                disabled={!newGoal.description.trim()}
                className="px-3 py-1.5 text-xs font-semibold text-white rounded disabled:opacity-40"
                style={{ backgroundColor: '#A58D69' }}
              >
                Add
              </button>
              <button
                onClick={() => setAddingGoal(false)}
                className="px-3 py-1.5 text-xs font-medium text-gray-500 hover:text-gray-700"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Action buttons */}
      <div className="flex items-center gap-3 pt-2 border-t border-gray-100">
        <button
          onClick={() => onComplete(form)}
          className="px-4 py-2 text-sm font-semibold text-white rounded-lg hover:opacity-90 transition-opacity"
          style={{ backgroundColor: '#22c55e' }}
        >
          Mark as Complete
        </button>
        <button
          onClick={() => onSave(form)}
          className="px-4 py-2 text-sm font-semibold rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors text-gray-700"
        >
          Save Draft
        </button>
        <button
          onClick={onCancel}
          className="px-3 py-2 text-sm text-gray-400 hover:text-gray-600 transition-colors"
        >
          Discard
        </button>
      </div>
    </div>
  );
}

// ─── Main Component ─────────────────────────────────────────────────────────

export default function QuarterlyReviews({ reviews = [], onSaveReview, onAddRagEntry }) {
  const currentYear = new Date().getFullYear();
  const [year, setYear] = useState(currentYear);
  const [expandedQ, setExpandedQ] = useState(null);

  const getReview = (q) => reviews.find((r) => r.year === year && r.quarter === q);

  const toggleExpand = (q) => {
    setExpandedQ((prev) => (prev === q ? null : q));
  };

  const buildReviewBase = (quarter, existing) => ({
    id: existing?.id || uid(),
    year,
    quarter,
    status: existing?.status || 'In Progress',
    dateCompleted: existing?.dateCompleted || '',
    conductedBy: existing?.conductedBy || '',
    ragSummary: existing?.ragSummary || { physical: 'grey', psych: 'grey', nutrition: 'grey', lifestyle: 'grey' },
    narrative: existing?.narrative || '',
    goals: existing?.goals || [],
  });

  const handleSaveDraft = (quarter, formData) => {
    const existing = getReview(quarter);
    const review = {
      ...buildReviewBase(quarter, existing),
      ...formData,
      status: 'In Progress',
    };
    onSaveReview(review);
    setExpandedQ(null);
  };

  const handleComplete = (quarter, formData) => {
    const existing = getReview(quarter);
    const today = new Date().toISOString().split('T')[0];
    const review = {
      ...buildReviewBase(quarter, existing),
      ...formData,
      status: 'Complete',
      dateCompleted: today,
    };
    onSaveReview(review);

    // Auto-add timestamped entries to each RAG domain log
    const qLabel = `Q${quarter} ${year}`;
    RAG_DOMAINS.forEach(({ key }) => {
      const ragStatus = formData.ragSummary[key] || 'grey';
      onAddRagEntry(key, {
        staff: formData.conductedBy || 'Unknown',
        status: ragStatus,
        note: `[Quarterly Review ${qLabel}] ${formData.narrative ? formData.narrative.slice(0, 120) + (formData.narrative.length > 120 ? '…' : '') : 'Review completed.'}`,
        source: 'quarterly_review',
      });
    });

    setExpandedQ(null);
  };

  const handleDiscard = () => setExpandedQ(null);

  return (
    <div>
      {/* Section header + year nav */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wide">Quarterly Reviews</h2>
        <div className="flex items-center gap-2">
          <button
            onClick={() => { setYear((y) => y - 1); setExpandedQ(null); }}
            className="p-1 rounded hover:bg-gray-100 text-gray-400 hover:text-gray-700 transition-colors"
          >
            <ChevronLeft size={16} />
          </button>
          <span className="text-sm font-semibold text-gray-700 w-12 text-center">{year}</span>
          <button
            onClick={() => { setYear((y) => y + 1); setExpandedQ(null); }}
            disabled={year >= currentYear}
            className="p-1 rounded hover:bg-gray-100 text-gray-400 hover:text-gray-700 transition-colors disabled:opacity-30"
          >
            <ChevronRight size={16} />
          </button>
        </div>
      </div>

      {/* Quarter slots */}
      <div className="space-y-3">
        {[1, 2, 3, 4].map((q) => {
          const meta = QUARTER_META[q];
          const review = getReview(q);
          const reviewStatus = review?.status || 'Not Started';
          const isExpanded = expandedQ === q;
          const isComplete = reviewStatus === 'Complete';

          return (
            <div
              key={q}
              className="bg-white rounded-lg border overflow-hidden"
              style={{
                borderColor: isExpanded ? '#A58D69' : '#e5e7eb',
                boxShadow: isExpanded ? '0 0 0 1px #A58D69' : '0 1px 3px rgba(0,0,0,0.04)',
              }}
            >
              {/* Quarter header row */}
              <button
                onClick={() => toggleExpand(q)}
                className="w-full flex items-center justify-between px-5 py-4 text-left hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div>
                    <span className="font-bold text-gray-900 text-sm">{meta.label}</span>
                    <span className="text-gray-400 text-xs ml-2">{meta.range}</span>
                  </div>
                  <StatusBadge status={reviewStatus} />
                  {isComplete && review?.conductedBy && (
                    <span className="text-xs text-gray-400 hidden sm:inline">
                      {review.conductedBy} · {new Date(review.dateCompleted).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
                    </span>
                  )}
                </div>
                <div className="text-gray-400">
                  {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                </div>
              </button>

              {/* Expanded content */}
              {isExpanded && (
                <div className="px-5 pb-5 border-t border-gray-50">
                  {isComplete ? (
                    <CompletedReviewView review={review} />
                  ) : (
                    <ReviewForm
                      review={review}
                      onSave={(formData) => handleSaveDraft(q, formData)}
                      onComplete={(formData) => handleComplete(q, formData)}
                      onCancel={handleDiscard}
                    />
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
