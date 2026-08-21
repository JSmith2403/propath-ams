import { lazy, Suspense, useMemo, useState } from 'react';
import { Apple, ChefHat, Check, GlassWater, Moon, Plus, Sun } from 'lucide-react';
import { useNutritionSettings } from '../../hooks/useNutritionSettings';
import { useTodayMealStructure, BLOCK_TYPES } from '../../hooks/useMealStructures';
import { useMealEntries, nextSnackSlot } from '../../hooks/useMealEntries';
import { useRecipes } from '../../hooks/useRecipes';
import WaterIntakeWidget from './WaterIntakeWidget';

const MealCaptureSheet = lazy(() => import('./MealCaptureSheet'));
const RecipesBrowser   = lazy(() => import('./RecipesBrowser'));
const GuidanceSheet    = lazy(() => import('./GuidanceSheet'));

const GOLD = '#A58D69';

const TYPE_ICONS = { breakfast: Sun, lunch: Sun, snack: Apple, dinner: Moon, drink: GlassWater };
const TYPE_PROMPTS = {
  breakfast: 'Add your first meal', lunch: 'Add your next meal',
  snack: 'Add a snack', dinner: 'Add your last meal', drink: 'Log a drink',
};

// en-CA gives YYYY-MM-DD directly in local calendar terms — unlike
// setHours(0,0,0,0)+toISOString(), which rolls back a day in any
// positive-UTC-offset timezone (local midnight is still "yesterday" in
// UTC there).
function todayIso() {
  return new Date().toLocaleDateString('en-CA');
}

export default function AthleteNutritionTab({ athleteId }) {
  const [logDate] = useState(todayIso());
  const { settings, loading: settingsLoading, updateWaterTarget } = useNutritionSettings(athleteId);
  const { today, loading: structureLoading, hasBlocks, hasGuidanceContent } = useTodayMealStructure(athleteId);
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

  // Submissions logged today, grouped by meal type (snack_1/2/3 collapse
  // into one 'snack' bucket) — drives both the checkmarks below and
  // resolveSnackSlot.
  const filledByType = useMemo(() => {
    const out = {};
    for (const e of entries) {
      const t = e.meal_type?.startsWith('snack') ? 'snack' : e.meal_type;
      if (t) out[t] = (out[t] || 0) + 1;
    }
    return out;
  }, [entries]);

  // Today's structure blocks, each matched against how many of that
  // type have already been logged today — the Nth block of a given
  // type is "done" once at least N entries of that type exist, so two
  // Snack blocks in the same structure track independently.
  const positionalBlocks = useMemo(() => {
    if (!today?.blocks?.length) return [];
    const seen = {};
    return today.blocks.map(block => {
      const type = block.type;
      let isFilled = false;
      if (type) {
        const idx = seen[type] || 0;
        isFilled = (filledByType[type] || 0) > idx;
        seen[type] = idx + 1;
      }
      return { ...block, isFilled };
    });
  }, [today, filledByType]);

  const loadingAny = settingsLoading || structureLoading;
  const allowed = !settingsLoading && settings?.meal_logging_enabled;
  const requirePhoto = settings?.require_photo !== false;
  // A structure with no blocks (or no structure applying today at all)
  // has nothing to walk through — fall back to one generic entry point.
  const showSimplifiedDiary = allowed && !structureLoading && !hasBlocks;

  const resolveSnackSlot = () => nextSnackSlot(entries);
  const waterTarget = settings?.water_daily_target ?? 6;

  return (
    <div className="px-4 pt-4 pb-24">
      <h2 className="text-base font-bold text-ink-900 mb-4">Nutrition</h2>

      {/* Recommended food structure hero — only when the nutritionist
          has actually written one; nothing to view otherwise. */}
      {!structureLoading && hasGuidanceContent && (
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
      )}

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

      <WaterIntakeWidget
        athleteId={athleteId}
        target={waterTarget}
        onChangeTarget={updateWaterTarget}
      />

      {/* Meal cards — only when the nutritionist has switched logging on. */}
      {!loadingAny && (allowed ? (
        <>
          <h3 className="text-sm font-bold text-ink-900 mb-3">Food diary</h3>
          {showSimplifiedDiary ? (
            <button
              onClick={() => setCapturing('breakfast')}
              className="w-full flex flex-col items-center justify-center gap-2 py-10 rounded-xl bg-white border border-ink-100 text-center transition-colors active:bg-ink-50"
              style={{ boxShadow: '0 1px 2px rgba(0,0,0,0.04)' }}
            >
              <div
                className="w-12 h-12 rounded-full flex items-center justify-center"
                style={{ backgroundColor: 'rgba(165,141,105,0.10)', color: GOLD }}
              >
                <Plus size={22} />
              </div>
              <p className="text-sm font-bold text-ink-900">+ Meal / Snack</p>
              <p className="text-meta text-ink-500">Log your meal or snack</p>
            </button>
          ) : (
            <div className="space-y-2">
              {positionalBlocks.map((block, i) => {
                const meta  = BLOCK_TYPES.find(t => t.key === block.type);
                const Icon  = TYPE_ICONS[block.type] || Plus;
                const label = meta?.label || 'Meal / Snack';
                return (
                  <button
                    key={block.id}
                    onClick={() => setCapturing(block.type || 'breakfast')}
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
                      <p className="text-sm font-bold text-ink-900">{i + 1}. {label}</p>
                      <p className="text-meta text-ink-500">
                        {block.isFilled ? 'Logged today' : (TYPE_PROMPTS[block.type] || 'Tap to log')}
                      </p>
                    </div>
                    <div
                      className="shrink-0 w-9 h-9 rounded-lg flex items-center justify-center"
                      style={{ backgroundColor: block.isFilled ? '#16a34a' : 'rgba(165,141,105,0.10)' }}
                    >
                      {block.isFilled
                        ? <Check size={16} className="text-white" />
                        : <Plus size={16} style={{ color: GOLD }} />}
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </>
      ) : (
        <p className="text-xs italic text-ink-400 px-1">
          Your coach hasn't enabled meal logging yet.
        </p>
      ))}

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
