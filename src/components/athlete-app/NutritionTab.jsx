import { lazy, Suspense, useMemo, useState } from 'react';
import { Apple, ChefHat, Check, Moon, Plus, Sun } from 'lucide-react';
import { useNutritionSettings } from '../../hooks/useNutritionSettings';
import { useMealEntries, nextSnackSlot } from '../../hooks/useMealEntries';
import { useRecipes } from '../../hooks/useRecipes';

const MealCaptureSheet = lazy(() => import('./MealCaptureSheet'));
const RecipesBrowser   = lazy(() => import('./RecipesBrowser'));
const GuidanceSheet    = lazy(() => import('./GuidanceSheet'));

const GOLD = '#A58D69';

// The four cards the athlete sees. Maps a UI-level concept (Snack) to
// the database meal_type column when needed (snack_1/2/3).
const MEAL_CARDS = [
  { key: 'breakfast', label: 'Breakfast', icon: Sun,   prompt: 'Add your first meal' },
  { key: 'lunch',     label: 'Lunch',     icon: Sun,   prompt: 'Add your next meal'  },
  { key: 'snack',     label: 'Snack',     icon: Apple, prompt: 'Add a snack'         },
  { key: 'dinner',    label: 'Dinner',    icon: Moon,  prompt: 'Add your last meal'  },
];

function todayIso() {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d.toISOString().slice(0, 10);
}

export default function AthleteNutritionTab({ athleteId }) {
  const [logDate] = useState(todayIso());
  const { settings, loading: settingsLoading } = useNutritionSettings(athleteId);
  const { entries, refresh } = useMealEntries(athleteId, logDate);

  const [capturing,    setCapturing]    = useState(null); // mealKey or null
  const [recipesOpen,  setRecipesOpen]  = useState(false);
  const [guidanceOpen, setGuidanceOpen] = useState(false);

  // Pull a couple of recipes with images so the "Needing inspiration?"
  // card has a real hero photo behind it. Falls back to a clean
  // gradient when nothing is uploaded yet.
  const { recipes: imageRecipes } = useRecipes({ mealType: 'all', activeOnly: true });
  const heroImage = useMemo(() => {
    const withPhoto = imageRecipes.find(r => r.image_url);
    return withPhoto?.image_url || null;
  }, [imageRecipes]);

  // Count of submissions per card key so we can show a tick / count.
  const filled = useMemo(() => {
    const out = { breakfast: 0, lunch: 0, snack: 0, dinner: 0 };
    for (const e of entries) {
      if (e.meal_type === 'breakfast') out.breakfast++;
      else if (e.meal_type === 'lunch') out.lunch++;
      else if (e.meal_type === 'dinner') out.dinner++;
      else if (e.meal_type?.startsWith('snack')) out.snack++;
    }
    return out;
  }, [entries]);

  const allowed = !settingsLoading && settings?.meal_logging_enabled;
  const requirePhoto = settings?.require_photo !== false;

  const resolveSnackSlot = () => nextSnackSlot(entries);

  return (
    <div className="px-4 pt-4 pb-24">
      <h2 className="text-base font-bold text-ink-900 mb-4">Nutrition</h2>

      {/* Recommended food structure hero — always visible per brief. */}
      <div className="rounded-xl bg-gold-50 p-5 mb-3 border border-gold-100" style={{ backgroundColor: 'rgba(165,141,105,0.10)' }}>
        <p className="text-base font-bold text-ink-900 mb-1">View your recommended food structure</p>
        <p className="text-meta text-ink-600 mb-3">
          Simple guidance on how to structure your meals today for optimal performance.
        </p>
        <button
          type="button"
          onClick={() => setGuidanceOpen(true)}
          className="text-xs font-bold text-white px-4 py-2 rounded-lg"
          style={{ backgroundColor: GOLD }}
        >
          View recommended food
        </button>
      </div>

      {/* "Needing inspiration?" — image-led tile with text overlay.
          Uses the first recipe image we can find; falls back to a
          tonal gradient when the library is image-less. */}
      <button
        type="button"
        onClick={() => setRecipesOpen(true)}
        className="w-full rounded-xl mb-6 relative overflow-hidden text-left active:scale-[0.99] transition-all"
        style={{
          aspectRatio: '16 / 9',
          backgroundImage: heroImage
            ? `url("${heroImage}")`
            : 'linear-gradient(135deg, #A58D69 0%, #6b5b48 100%)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          boxShadow: '0 4px 12px rgba(0,0,0,0.10)',
        }}
      >
        {/* Dark gradient overlay for legible text */}
        <div
          className="absolute inset-0"
          style={{ background: 'linear-gradient(0deg, rgba(0,0,0,0.65) 0%, rgba(0,0,0,0.15) 55%, rgba(0,0,0,0.30) 100%)' }}
        />

        {/* Top chip */}
        <div className="absolute top-3 left-3 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full"
             style={{ backgroundColor: 'rgba(255,255,255,0.18)', backdropFilter: 'blur(6px)', WebkitBackdropFilter: 'blur(6px)' }}>
          <ChefHat size={11} className="text-white" />
          <span className="text-[10px] uppercase tracking-widest font-bold text-white">Recipes</span>
        </div>

        {/* Title block */}
        <div className="absolute bottom-0 left-0 right-0 p-4">
          <p className="text-lg font-bold text-white leading-tight drop-shadow">Needing inspiration?</p>
          <div className="flex items-center justify-between gap-2 mt-1">
            <p className="text-meta text-white/85">
              Check out our recipes — breakfast, lunch, snack or dinner.
            </p>
            <span className="text-xs font-bold text-white shrink-0">Browse →</span>
          </div>
        </div>
      </button>

      {/* Meal cards — only when the nutritionist has switched logging on. */}
      {allowed ? (
        <>
          <h3 className="text-sm font-bold text-ink-900 mb-3">Food diary</h3>
          <div className="space-y-2">
            {MEAL_CARDS.map(card => {
              const Icon  = card.icon;
              const count = filled[card.key];
              return (
                <button
                  key={card.key}
                  onClick={() => setCapturing(card.key)}
                  className="w-full flex items-center gap-3 p-3 rounded-xl bg-white border border-ink-100 text-left transition-colors active:bg-ink-50"
                  style={{ boxShadow: '0 1px 2px rgba(0,0,0,0.04)' }}
                >
                  <div
                    className="shrink-0 w-10 h-10 rounded-lg flex items-center justify-center"
                    style={{ backgroundColor: 'rgba(165,141,105,0.10)', color: GOLD }}
                  >
                    <Icon size={18} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-ink-900">{card.label}</p>
                    <p className="text-meta text-ink-500">
                      {count > 0
                        ? `${count} logged today${card.key === 'snack' && count > 1 ? ' · tap to add another' : ''}`
                        : card.prompt}
                    </p>
                  </div>
                  <div
                    className="shrink-0 w-9 h-9 rounded-lg flex items-center justify-center"
                    style={{ backgroundColor: count > 0 ? '#16a34a' : 'rgba(165,141,105,0.10)' }}
                  >
                    {count > 0
                      ? <Check size={16} className="text-white" />
                      : <Plus size={16} style={{ color: GOLD }} />}
                  </div>
                </button>
              );
            })}
          </div>
        </>
      ) : !settingsLoading && (
        <p className="text-xs italic text-ink-400 px-1">
          Your coach hasn't enabled meal logging yet.
        </p>
      )}

      {/* Recipe browser — full-screen overlay, lazy. */}
      {recipesOpen && (
        <Suspense fallback={null}>
          <RecipesBrowser onClose={() => setRecipesOpen(false)} />
        </Suspense>
      )}

      {/* Guidance sheet — recommended-plate content written by the
          nutritionist in the Meal Structure & Guidance sub-tab. */}
      {guidanceOpen && (
        <Suspense fallback={null}>
          <GuidanceSheet athleteId={athleteId} onClose={() => setGuidanceOpen(false)} />
        </Suspense>
      )}

      {/* Capture sheet — lazy chunk, mounts on first tap. */}
      {capturing && (
        <Suspense fallback={null}>
          <MealCaptureSheet
            athleteId={athleteId}
            logDate={logDate}
            initialMealKey={capturing}
            resolveSnackSlot={resolveSnackSlot}
            requirePhoto={requirePhoto}
            onClose={(didSave) => {
              setCapturing(null);
              if (didSave) refresh();
            }}
          />
        </Suspense>
      )}
    </div>
  );
}
