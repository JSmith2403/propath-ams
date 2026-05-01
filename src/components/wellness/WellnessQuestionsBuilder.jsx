import { useMemo, useState } from 'react';
import { X, Check, Settings2, Star } from 'lucide-react';
import { useWellnessLibrary } from '../../hooks/useWellnessLibrary';
import { useAthleteWellnessSelections } from '../../hooks/useAthleteWellnessSelections';
import QuestionThresholdEditor from './QuestionThresholdEditor';

const GOLD = '#A58D69';

const CATEGORY_LABELS = {
  lifestyle:   'Lifestyle',
  physical:    'Physical',
  medical:     'Medical',
  nutritional: 'Nutritional',
};
const CATEGORY_ORDER = ['lifestyle', 'physical', 'medical', 'nutritional'];

function canEdit(role) {
  return role === 'admin' || role === 'co_admin';
}

// ─── Tick / cross checkbox with gold accent ────────────────────────────────
function Checkbox({ checked, disabled, onClick, ariaLabel }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={ariaLabel}
      aria-checked={checked}
      role="checkbox"
      className="w-5 h-5 rounded flex items-center justify-center shrink-0 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      style={{
        backgroundColor: checked ? GOLD : '#fff',
        border: `1.5px solid ${checked ? GOLD : '#d1d5db'}`,
        cursor: disabled ? 'not-allowed' : 'pointer',
      }}
    >
      {checked && <Check size={13} strokeWidth={3} color="#fff" />}
    </button>
  );
}

// ─── Featured (roster) toggle ──────────────────────────────────────────────
function FeatureStar({ featured, disabled, onClick, title }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      title={title}
      aria-label={title}
      aria-pressed={featured}
      className="p-1 rounded shrink-0 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
      style={{ color: featured ? GOLD : '#d1d5db', cursor: disabled ? 'not-allowed' : 'pointer' }}
    >
      <Star size={15} fill={featured ? GOLD : 'transparent'} strokeWidth={featured ? 0 : 1.8} />
    </button>
  );
}

// ─── TOP BOX: Sent to Athlete ──────────────────────────────────────────────
function SentToAthletePanel({
  selectedRows, featuredIds, featuredMax,
  onRemove, onToggleFeatured, readOnly,
}) {
  const featuredCount = selectedRows.filter(r => featuredIds.has(r.id)).length;

  return (
    <div
      className="bg-white rounded-lg p-5 border border-gray-100"
      style={{
        boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
        borderLeft: `3px solid ${GOLD}`,
      }}
    >
      <div className="flex items-center gap-2 mb-1 flex-wrap">
        <h3 className="font-semibold text-gray-900 text-sm">Sent to Athlete</h3>
        <span
          className="text-[10px] font-bold px-1.5 py-0.5 rounded-full"
          style={{ backgroundColor: 'rgba(165,141,105,0.15)', color: GOLD }}
        >
          {selectedRows.length}
        </span>
        <span className="text-[10px] text-gray-400">·</span>
        <span className="text-[10px] font-semibold text-gray-500 inline-flex items-center gap-1">
          <Star size={10} fill={GOLD} strokeWidth={0} style={{ color: GOLD }} />
          {featuredCount}/{featuredMax} on roster
        </span>
      </div>
      <p className="text-xs text-gray-400 mb-3">
        These questions appear in the athlete's daily check-in. Star up to {featuredMax} to show on the athlete roster card.
      </p>

      {selectedRows.length === 0 ? (
        <div className="rounded-lg border border-dashed border-gray-200 py-6 text-center">
          <p className="text-xs text-gray-400">
            No questions selected. Choose from the library below.
          </p>
        </div>
      ) : (
        <div className="space-y-1.5">
          {selectedRows.map((q) => {
            const isFeatured = featuredIds.has(q.id);
            const wouldExceed = !isFeatured && featuredCount >= featuredMax;
            return (
              <div
                key={q.id}
                className="flex items-center gap-2 px-3 py-2 rounded-lg"
                style={{ backgroundColor: '#fafaf7' }}
              >
                <span
                  className="text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded shrink-0"
                  style={{ backgroundColor: '#e5e7eb', color: '#6b7280' }}
                >
                  {CATEGORY_LABELS[q.category] || q.category}
                </span>
                <p className="text-sm text-gray-800 flex-1 min-w-0">{q.label}</p>
                {!readOnly && (
                  <FeatureStar
                    featured={isFeatured}
                    disabled={wouldExceed}
                    onClick={() => onToggleFeatured(q.id)}
                    title={isFeatured ? 'Remove from roster card'
                      : wouldExceed ? `Roster card limit is ${featuredMax}`
                      : 'Show on roster card'}
                  />
                )}
                {!readOnly && (
                  <button
                    onClick={() => onRemove(q.id)}
                    className="p-1 rounded hover:bg-gray-100 text-gray-400 hover:text-red-500 shrink-0"
                    aria-label={`Remove "${q.label}"`}
                  >
                    <X size={14} />
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ─── BOTTOM BOX: ProPath Question Library ──────────────────────────────────
function LibraryPanel({
  library, selectedIds, featuredIds, featuredMax,
  onToggle, onToggleFeatured,
  readOnly, onLibraryRefresh,
}) {
  const [editingId, setEditing] = useState(null);
  const grouped = useMemo(() => {
    const m = {};
    for (const q of library) (m[q.category] ||= []).push(q);
    return CATEGORY_ORDER
      .filter((c) => m[c]?.length)
      .map((c) => ({ category: c, items: m[c] }));
  }, [library]);

  const featuredCount = featuredIds.size;

  return (
    <div
      className="bg-white rounded-lg p-5 border border-gray-100"
      style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}
    >
      <div className="flex items-baseline gap-2 mb-1">
        <h3 className="font-semibold text-gray-900 text-sm">ProPath Question Library</h3>
        <span
          className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-gray-100 text-gray-500"
        >
          {library.length}
        </span>
      </div>
      <p className="text-xs text-gray-400 mb-4">
        Tick to send to the athlete. Star to also show on the roster card (max {featuredMax}).
        Tap a question to edit RAG thresholds.
      </p>

      <div className="space-y-5">
        {grouped.map(({ category, items }) => (
          <div key={category}>
            <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-2">
              {CATEGORY_LABELS[category]}
            </p>
            <div className="space-y-1">
              {items.map((q) => {
                const checked    = selectedIds.has(q.id);
                const isFeatured = featuredIds.has(q.id);
                const wouldExceed = !isFeatured && featuredCount >= featuredMax;
                const starDisabled = readOnly || !checked || wouldExceed;
                const isEditing  = editingId === q.id;
                return (
                  <div key={q.id}>
                    <div className="flex items-center gap-3 px-2 py-1.5 rounded-lg hover:bg-gray-50">
                      <Checkbox
                        checked={checked}
                        disabled={readOnly}
                        onClick={() => !readOnly && onToggle(q.id)}
                        ariaLabel={q.label}
                      />
                      <button
                        type="button"
                        onClick={() => setEditing(isEditing ? null : q.id)}
                        className="flex-1 min-w-0 text-left text-sm text-gray-700 hover:text-gray-900"
                        title="Tap to edit RAG thresholds"
                      >
                        {q.label}
                      </button>
                      <FeatureStar
                        featured={isFeatured}
                        disabled={starDisabled}
                        onClick={() => onToggleFeatured(q.id)}
                        title={
                          !checked      ? 'Tick the question first to send it to the athlete'
                          : isFeatured  ? 'Remove from roster card'
                          : wouldExceed ? `Roster card limit is ${featuredMax}`
                          : 'Show on roster card'
                        }
                      />
                      <Settings2 size={13}
                        className="text-gray-300 hover:text-gray-600 cursor-pointer shrink-0"
                        onClick={() => setEditing(isEditing ? null : q.id)} />
                    </div>
                    {isEditing && (
                      <QuestionThresholdEditor
                        question={q}
                        onClose={() => setEditing(null)}
                        onSaved={() => onLibraryRefresh?.()}
                      />
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Main builder ───────────────────────────────────────────────────────────
export default function WellnessQuestionsBuilder({ athleteId, role }) {
  const { library, loading: loadingLib, refresh: refreshLib } = useWellnessLibrary();
  const {
    selectedIds, featuredIds, featuredMax,
    loading: loadingSel,
    toggle, toggleFeatured,
  } = useAthleteWellnessSelections(athleteId);

  const readOnly = !canEdit(role);

  const selectedRows = useMemo(() => {
    return library.filter(q => selectedIds.has(q.id));
  }, [library, selectedIds]);

  if (loadingLib || loadingSel) {
    return (
      <div className="flex items-center justify-center py-10">
        <div className="w-7 h-7 border-2 rounded-full animate-spin"
          style={{ borderColor: '#e5e7eb', borderTopColor: GOLD }} />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <SentToAthletePanel
        selectedRows={selectedRows}
        featuredIds={featuredIds}
        featuredMax={featuredMax}
        onRemove={toggle}
        onToggleFeatured={toggleFeatured}
        readOnly={readOnly}
      />
      <LibraryPanel
        library={library}
        selectedIds={selectedIds}
        featuredIds={featuredIds}
        featuredMax={featuredMax}
        onToggle={toggle}
        onToggleFeatured={toggleFeatured}
        readOnly={readOnly}
        onLibraryRefresh={refreshLib}
      />
    </div>
  );
}
