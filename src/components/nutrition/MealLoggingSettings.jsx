import { useState } from 'react';
import { Camera, Image, Loader2 } from 'lucide-react';
import { useNutritionSettings } from '../../hooks/useNutritionSettings';

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
      style={{ width: w, height: h, backgroundColor: on ? '#A58D69' : '#e5e7eb' }}
    >
      <span
        className="absolute top-0.5 rounded-full bg-white shadow transition-all"
        style={{ width: h - 4, height: h - 4, left: on ? w - (h - 4) - 2 : 2 }}
      />
    </button>
  );
}

/**
 * MealLoggingSettings — coach-controlled Snap-and-Send toggle + require-
 * photo toggle. Sits at the top of the Food Diary sub-tab so the
 * nutritionist can flip logging on/off right where the submissions it
 * controls show up. Reads nutrition_settings; defaults to disabled /
 * photo required when no row exists for the athlete.
 */
export default function MealLoggingSettings({ athleteId }) {
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
