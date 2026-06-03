import { lazy, Suspense, useState } from 'react';
import { Camera, Image, Loader2 } from 'lucide-react';
import { useNutritionSettings } from '../../hooks/useNutritionSettings';

// Food Diary view is lazy — only loaded when the coach clicks the
// sub-tab, since the meal data fetch + signed URL plumbing is heavier
// than the simple focus-area cards on Overview.
const FoodDiaryView = lazy(() => import('../nutrition/FoodDiaryView'));

const SUB_TABS = [
  { id: 'overview',    label: 'Overview'    },
  { id: 'food_diary',  label: 'Food Diary'  },
  { id: 'meal_plans',  label: 'Meal Plans'  },
  { id: 'analytics',   label: 'Analytics'   },
];

// Coach-controlled meal-logging settings panel. Sits at the top of the
// Nutritional tab so the nutritionist can flip Snap-and-Send on / off
// and decide whether a photo is mandatory before each submit. Reads
// nutrition_settings; defaults to disabled / photo required when no
// row exists for the athlete.
function MealLoggingSettings({ athleteId }) {
  const { settings, loading, updating, update } = useNutritionSettings(athleteId);
  const [errMsg, setErrMsg] = useState(null);

  const handleUpdate = async (patch) => {
    setErrMsg(null);
    const res = await update(patch);
    if (!res?.ok) {
      setErrMsg(res?.error?.message || 'Failed to save. Try again.');
    }
  };

  if (loading || !settings) {
    return (
      <div className="rounded-xl border border-gray-100 bg-white px-5 py-4 mb-6 flex items-center gap-2 text-xs text-gray-400">
        <Loader2 size={14} className="animate-spin" /> Loading meal-logging settings…
      </div>
    );
  }

  const enabled = !!settings.meal_logging_enabled;
  const requirePhoto = settings.require_photo !== false; // default true

  return (
    <div className="rounded-xl border border-gray-100 bg-white px-5 py-4 mb-6"
         style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
      <div className="flex items-start gap-3">
        <div
          className="shrink-0 w-9 h-9 rounded-lg flex items-center justify-center"
          style={{ backgroundColor: 'rgba(165,141,105,0.12)', color: '#A58D69' }}
        >
          <Camera size={16} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <div>
              <p className="text-sm font-bold text-gray-900">Snap-and-Send meal logging</p>
              <p className="text-[11px] text-gray-500 mt-0.5">
                Athlete can photograph and describe meals from the mobile app.
                Submissions appear in the Food Diary panel below.
              </p>
            </div>
            <Toggle
              on={enabled}
              busy={updating}
              onChange={(next) => handleUpdate({ meal_logging_enabled: next })}
            />
          </div>

          {enabled && (
            <div className="mt-3 pt-3 border-t border-gray-100 flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 text-[12px] text-gray-700">
                <Image size={12} className="text-gray-400" />
                Require photo on every submission
              </div>
              <Toggle
                on={requirePhoto}
                busy={updating}
                onChange={(next) => handleUpdate({ require_photo: next })}
                small
              />
            </div>
          )}

          {errMsg && (
            <div className="mt-3 pt-3 border-t border-red-100">
              <p className="text-[11px] font-semibold text-red-600">
                Couldn't save: {errMsg}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function Toggle({ on, busy = false, onChange, small = false }) {
  const w = small ? 32 : 40;
  const h = small ? 18 : 22;
  return (
    <button
      type="button"
      role="switch"
      aria-checked={on}
      disabled={busy}
      onClick={() => onChange(!on)}
      className="relative rounded-full transition-colors shrink-0 disabled:opacity-60"
      style={{
        width: w, height: h,
        backgroundColor: on ? '#A58D69' : '#e5e7eb',
      }}
    >
      <span
        className="absolute top-0.5 rounded-full bg-white shadow transition-all"
        style={{
          width: h - 4, height: h - 4,
          left: on ? w - (h - 4) - 2 : 2,
        }}
      />
    </button>
  );
}

function WorkingOnCard({ card, onChange, onSave, isDirty }) {
  return (
    <div
      className="bg-white rounded-xl border border-gray-100 p-5 flex flex-col gap-3 min-h-[180px]"
      style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}
    >
      <input
        type="text"
        value={card.title}
        onChange={e => onChange('title', e.target.value)}
        onBlur={onSave}
        placeholder="Focus area..."
        className="text-sm font-semibold text-gray-900 w-full bg-transparent border-b border-transparent hover:border-gray-200 focus:border-gray-300 focus:outline-none transition-colors placeholder-gray-300"
      />
      <textarea
        rows={4}
        value={card.description}
        onChange={e => onChange('description', e.target.value)}
        onBlur={onSave}
        placeholder="Describe current focus, targets, or notes..."
        className="flex-1 text-sm text-gray-600 w-full bg-transparent border border-transparent hover:border-gray-200 focus:border-gray-300 rounded px-1 py-1 focus:outline-none transition-colors resize-none placeholder-gray-300 leading-relaxed"
      />
      {isDirty && (
        <button
          onClick={onSave}
          className="self-end text-xs font-semibold px-3 py-1.5 rounded hover:opacity-90 text-white transition-opacity"
          style={{ backgroundColor: '#A58D69' }}
        >
          Save
        </button>
      )}
    </div>
  );
}

export default function NutritionTab({
  workingOn: initialWorkingOn, onSaveWorkingOn,
  athleteId, athleteName,
  // hideSubTabs — when NutritionDomainTab is the wrapper, it owns the
  // sub-tab nav and we just render the Overview content (settings +
  // focus cards). Defaults false so the legacy mount path still works.
  hideSubTabs = false,
}) {
  const [subTab, setSubTab] = useState('overview');
  const [cards, setCards] = useState(() => {
    const src = initialWorkingOn || [];
    return [0, 1, 2].map(i => ({
      title:       src[i]?.title       || '',
      description: src[i]?.description || '',
    }));
  });
  const [savedCards, setSavedCards] = useState(() => cards.map(c => ({ ...c })));

  const updateCard = (i, field, val) =>
    setCards(prev => prev.map((c, idx) => idx === i ? { ...c, [field]: val } : c));

  const saveCard = () => {
    onSaveWorkingOn?.(cards);
    setSavedCards(cards.map(c => ({ ...c })));
  };

  const isCardDirty = (i) =>
    cards[i].title !== savedCards[i].title ||
    cards[i].description !== savedCards[i].description;

  // Overview content — settings panel + Currently-Working-On cards.
  // When NutritionDomainTab is the wrapper, hideSubTabs is true and we
  // render only this content (the wrapper owns the sub-tab nav).
  const overview = (
    <>
      <MealLoggingSettings athleteId={athleteId} />
      <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wide mb-4">Currently Working On</h2>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {cards.map((card, i) => (
          <WorkingOnCard
            key={i}
            card={card}
            onChange={(field, val) => updateCard(i, field, val)}
            onSave={saveCard}
            isDirty={isCardDirty(i)}
          />
        ))}
      </div>
    </>
  );

  if (hideSubTabs) {
    return overview;
  }

  // Legacy mount path (no wrapper) — keep the local sub-tab nav so the
  // file stays useful if it gets rendered standalone elsewhere.
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-1 border-b border-gray-200">
        {SUB_TABS.map(t => {
          const active = subTab === t.id;
          return (
            <button
              key={t.id}
              onClick={() => setSubTab(t.id)}
              className="px-3 py-1.5 text-xs font-semibold transition-colors border-b-2"
              style={active
                ? { color: '#A58D69', borderColor: '#A58D69' }
                : { color: '#6b7280', borderColor: 'transparent' }}
            >
              {t.label}
            </button>
          );
        })}
      </div>

      {subTab === 'overview' && overview}

      {subTab === 'food_diary' && (
        <Suspense fallback={<div className="text-xs italic text-gray-400 px-1">Loading Food Diary…</div>}>
          <FoodDiaryView athleteId={athleteId} athleteName={athleteName} />
        </Suspense>
      )}

      {(subTab === 'meal_plans' || subTab === 'analytics') && (
        <div className="rounded-xl bg-white border border-gray-100 p-6 text-xs italic text-gray-400 text-center"
             style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
          {subTab === 'meal_plans' ? 'Meal Plans' : 'Analytics'} — coming in a later phase.
        </div>
      )}
    </div>
  );
}
