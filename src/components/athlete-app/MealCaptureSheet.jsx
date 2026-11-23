import { useEffect, useRef, useState } from 'react';
import { Apple, Camera, GlassWater, Image as ImageIcon, Loader2, Moon, Plus, Sun, Trash2, X } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { compressImage, imageSize } from '../../utils/imageCompress';
import { defaultLogDate, localISO, photoTakenAt, suggestMealType } from '../../utils/photoTime';
import { freeSnackSlot, saveMeal, usedMealTypes } from '../../lib/saveMeal';

const GOLD = '#A58D69';
const MAX_PHOTOS = 4;

const MEAL_OPTIONS = [
  { key: 'breakfast', label: 'Breakfast', icon: Sun        },
  { key: 'lunch',     label: 'Lunch',     icon: Sun        },
  { key: 'snack',     label: 'Snack',     icon: Apple      },
  { key: 'dinner',    label: 'Dinner',    icon: Moon       },
  { key: 'drink',     label: 'Drink',     icon: GlassWater },
];

/**
 * MealCaptureSheet — bottom-sheet capture flow for the athlete app.
 *   1. Pick photos (camera or library, up to 4) — compressed before
 *      upload.
 *   2. Optional description + notes.
 *   3. Submit → uploads to meal-photos bucket, inserts a meal_entries
 *      row (the DB trigger writes the "submitted" event).
 *
 * Inputs:
 *   athleteId      — for athlete_id + storage path prefix
 *   logDate        — ISO YYYY-MM-DD of the day being logged
 *   initialMealKey — 'breakfast' | 'lunch' | 'snack' | 'dinner' | 'drink'
 *   resolveSnackSlot — fn that returns 'snack_1' / 'snack_2' / 'snack_3'
 *                      when the user picks "Snack". null = none free.
 *   requirePhoto   — blocks submit when no photo attached
 *   onClose        — closes the sheet (didSave: boolean)
 */
export default function MealCaptureSheet({
  athleteId, logDate, initialMealKey,
  resolveSnackSlot, requirePhoto = true,
  onClose,
}) {
  const [mealKey,     setMealKey]     = useState(initialMealKey || 'breakfast');
  const [description, setDescription] = useState('');
  const [notes,       setNotes]       = useState('');
  const [photos,      setPhotos]      = useState([]); // [{ id, blob, previewUrl, width, height }]
  const [submitting,  setSubmitting]  = useState(false);
  const [error,       setError]       = useState(null);
  // Which day this meal belongs to. Today unless the athlete says otherwise (forgot to log it last night).
  const [dayKey,      setDayKey]      = useState('today');
  const touchedRef = useRef(false);   // the athlete has chosen the meal or the day themselves

  const cameraRef  = useRef(null);
  const libraryRef = useRef(null);

  const todayISO = localISO(new Date());
  const yesterdayISO = (() => { const d = new Date(); d.setDate(d.getDate() - 1); return localISO(d); })();
  const canPickDay = logDate === todayISO;
  const effectiveDate = dayKey === 'yesterday' && canPickDay ? yesterdayISO : logDate;

  useEffect(() => () => {
    photos.forEach(p => URL.revokeObjectURL(p.previewUrl));
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const onPickFiles = async (e, fromLibrary = false) => {
    const files = Array.from(e.target.files || []);
    e.target.value = ''; // allow re-picking the same file
    const slots = MAX_PHOTOS - photos.length;
    if (slots <= 0) return;
    const accepted = files.slice(0, slots);
    setError(null);

    const compressed = [];
    for (const f of accepted) {
      try {
        const blob = await compressImage(f, { maxEdge: 1600, quality: 0.8 });
        const { width, height } = await imageSize(blob);
        const previewUrl = URL.createObjectURL(blob);
        compressed.push({
          id: crypto.randomUUID(),
          blob, previewUrl, width, height,
        });
      } catch (err) {
        console.error('[MealCaptureSheet] compress failed', err);
        setError(`Couldn't read "${f.name}". Try a different photo.`);
        return;
      }
    }
    setPhotos(prev => [...prev, ...compressed]);

    // A photo from the library carries when it was taken: use that to suggest the meal and the day.
    if (fromLibrary && !touchedRef.current && compressed.length) {
      const taken = await photoTakenAt(accepted[0]);
      if (taken) {
        const m = suggestMealType(taken);
        setMealKey(m);
        if (canPickDay) setDayKey(defaultLogDate(taken, todayISO, logDate) === yesterdayISO ? 'yesterday' : 'today');
      }
    }
  };

  const removePhoto = (id) => {
    setPhotos(prev => {
      const next = prev.filter(p => p.id !== id);
      const removed = prev.find(p => p.id === id);
      if (removed) URL.revokeObjectURL(removed.previewUrl);
      return next;
    });
  };

  const canSubmit = !submitting && (
    !requirePhoto || photos.length > 0
  );

  const handleSubmit = async () => {
    if (!canSubmit) return;
    setError(null);
    setSubmitting(true);

    // The database meal type. 'snack' becomes the first free snack_N slot for that day.
    let dbMealType = mealKey;
    if (mealKey === 'snack') {
      if (effectiveDate === logDate) dbMealType = resolveSnackSlot ? resolveSnackSlot() : 'snack_1';
      else dbMealType = freeSnackSlot((await usedMealTypes(athleteId, [effectiveDate])).get(effectiveDate));
      if (!dbMealType) {
        setSubmitting(false);
        setError(effectiveDate === logDate ? 'Already logged 3 snacks today.' : 'Already logged 3 snacks that day.');
        return;
      }
    }

    const r = await saveMeal({ athleteId, logDate: effectiveDate, mealType: dbMealType, description, notes, photos });
    setSubmitting(false);
    if (!r.ok) { setError(r.error); return; }
    onClose?.(true);
  };

  return (
    <div
      className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center"
      style={{ backgroundColor: 'rgba(0,0,0,0.55)' }}
      onClick={(e) => { if (e.target === e.currentTarget && !submitting) onClose?.(false); }}
    >
      <div
        className="bg-white w-full sm:max-w-md sm:rounded-2xl shadow-2xl"
        style={{
          maxWidth: 480,
          maxHeight: '92dvh',
          borderTopLeftRadius: 24, borderTopRightRadius: 24,
          paddingBottom: 'env(safe-area-inset-bottom)',
        }}
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-ink-100">
          <h3 className="text-base font-bold" style={{ color: '#1C1C1C' }}>Log meal</h3>
          <button
            onClick={() => !submitting && onClose?.(false)}
            disabled={submitting}
            className="p-1.5 rounded hover:bg-ink-50 disabled:opacity-50"
          >
            <X size={18} className="text-ink-500" />
          </button>
        </div>

        <div className="px-5 py-4 space-y-4 overflow-y-auto" style={{ maxHeight: 'calc(92dvh - 130px)' }}>
          {/* Meal type chips */}
          <div>
            <p className="text-[10px] uppercase tracking-widest font-bold text-ink-400 mb-2">Meal</p>
            <div className="grid grid-cols-5 gap-1.5">
              {MEAL_OPTIONS.map(opt => {
                const on = mealKey === opt.key;
                const Icon = opt.icon;
                return (
                  <button
                    key={opt.key}
                    type="button"
                    onClick={() => { touchedRef.current = true; setMealKey(opt.key); }}
                    className="flex flex-col items-center justify-center gap-1 py-2.5 rounded-lg border transition-colors"
                    style={{
                      borderColor: on ? GOLD : '#e5e7eb',
                      backgroundColor: on ? 'rgba(165,141,105,0.10)' : '#fff',
                      color: on ? GOLD : '#6b7280',
                    }}
                  >
                    <Icon size={16} />
                    <span className="text-[11px] font-semibold">{opt.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Which day */}
          {canPickDay && (
            <div>
              <p className="text-[10px] uppercase tracking-widest font-bold text-ink-400 mb-2">Day</p>
              <div className="flex gap-1.5">
                {[['today', 'Today'], ['yesterday', 'Yesterday']].map(([k, label]) => (
                  <button key={k} type="button" onClick={() => { touchedRef.current = true; setDayKey(k); }}
                    className="flex-1 py-2 rounded-lg border text-[12px] font-semibold"
                    style={{ borderColor: dayKey === k ? GOLD : '#e5e7eb', backgroundColor: dayKey === k ? 'rgba(165,141,105,0.10)' : '#fff', color: dayKey === k ? GOLD : '#6b7280' }}>
                    {label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Photos */}
          <div>
            <p className="text-[10px] uppercase tracking-widest font-bold text-ink-400 mb-2">
              Photos {requirePhoto ? '· required' : '· optional'} · {photos.length} / {MAX_PHOTOS}
            </p>
            <div className="grid grid-cols-4 gap-2">
              {photos.map(p => (
                <div key={p.id} className="relative aspect-square rounded-lg overflow-hidden border border-ink-100">
                  <img src={p.previewUrl} alt="" className="w-full h-full object-cover" />
                  <button
                    onClick={() => removePhoto(p.id)}
                    className="absolute top-1 right-1 p-0.5 rounded-full bg-black/60 text-white"
                    aria-label="Remove photo"
                  >
                    <Trash2 size={11} />
                  </button>
                </div>
              ))}
              {photos.length < MAX_PHOTOS && (
                <>
                  <button
                    onClick={() => cameraRef.current?.click()}
                    className="aspect-square rounded-lg border border-dashed flex flex-col items-center justify-center gap-0.5"
                    style={{ borderColor: GOLD, color: GOLD }}
                    aria-label="Take a photo"
                  >
                    <Camera size={20} />
                    <span className="text-[10px] font-semibold">Camera</span>
                  </button>
                  <button
                    onClick={() => libraryRef.current?.click()}
                    className="aspect-square rounded-lg border border-dashed flex flex-col items-center justify-center gap-0.5"
                    style={{ borderColor: GOLD, color: GOLD }}
                    aria-label="Choose a photo you already took"
                  >
                    <ImageIcon size={20} />
                    <span className="text-[10px] font-semibold">Library</span>
                  </button>
                </>
              )}
            </div>
            {/* Camera opens the camera; Library opens your photos so a meal snapped earlier can be added now. */}
            <input ref={cameraRef} type="file" accept="image/*" capture="environment" multiple onChange={(e) => onPickFiles(e, false)} className="hidden" />
            <input ref={libraryRef} type="file" accept="image/*" multiple onChange={(e) => onPickFiles(e, true)} className="hidden" />
          </div>

          {/* Description */}
          <label className="flex flex-col gap-1">
            <span className="text-[10px] uppercase tracking-widest font-bold text-ink-400">What did you eat?</span>
            <input
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Oatmeal with berries…"
              className="px-3 py-2 rounded-lg border border-ink-200 text-sm focus:outline-none focus:border-gold-400"
            />
          </label>

          {/* Notes */}
          <label className="flex flex-col gap-1">
            <span className="text-[10px] uppercase tracking-widest font-bold text-ink-400">Notes (optional)</span>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={2}
              placeholder="Anything the coach should know…"
              className="px-3 py-2 rounded-lg border border-ink-200 text-sm focus:outline-none focus:border-gold-400 resize-none"
            />
          </label>

          {error && (
            <div className="text-[12px] font-semibold text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2">
              {error}
            </div>
          )}
        </div>

        <div className="px-5 py-3 border-t border-ink-100 flex items-center gap-2">
          <button
            onClick={() => !submitting && onClose?.(false)}
            disabled={submitting}
            className="flex-1 py-3 rounded-lg text-sm font-semibold text-ink-700 disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={!canSubmit}
            className="flex-[2] py-3 rounded-lg text-sm font-bold text-white inline-flex items-center justify-center gap-1.5 disabled:opacity-50"
            style={{ backgroundColor: GOLD }}
          >
            {submitting
              ? <><Loader2 size={14} className="animate-spin" /> Submitting…</>
              : <><Plus size={14} /> Submit meal</>}
          </button>
        </div>
      </div>
    </div>
  );
}
