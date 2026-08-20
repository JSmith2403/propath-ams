import { useEffect, useRef, useState } from 'react';
import { Apple, Camera, GlassWater, Loader2, Moon, Plus, Sun, Trash2, X } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { compressImage, imageSize } from '../../utils/imageCompress';

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

  const fileRef = useRef(null);

  useEffect(() => () => {
    photos.forEach(p => URL.revokeObjectURL(p.previewUrl));
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const onPickFiles = async (e) => {
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

    // Resolve the database meal_type. 'snack' → first free snack_N slot.
    let dbMealType = mealKey;
    if (mealKey === 'snack') {
      dbMealType = resolveSnackSlot ? resolveSnackSlot() : 'snack_1';
      if (!dbMealType) {
        setSubmitting(false);
        setError('Already logged 3 snacks today.');
        return;
      }
    }

    // 1. Insert the entry — DB trigger writes the "submitted" event.
    const { data: entry, error: entryErr } = await supabase
      .from('meal_entries')
      .insert({
        athlete_id:  athleteId,
        log_date:    logDate,
        meal_type:   dbMealType,
        description: description.trim() || null,
        notes:       notes.trim() || null,
        source:      'mobile_app',
      })
      .select('id')
      .single();

    if (entryErr) {
      console.error('[MealCaptureSheet] entry insert failed', entryErr);
      setSubmitting(false);
      setError(entryErr.message || 'Submit failed.');
      return;
    }

    // 2. Upload each photo to storage, then write the meal_photos row.
    for (const p of photos) {
      const fileName = `${crypto.randomUUID()}.jpg`;
      const storagePath = `${athleteId}/${entry.id}/${fileName}`;
      const { error: upErr } = await supabase.storage
        .from('meal-photos')
        .upload(storagePath, p.blob, {
          contentType: 'image/jpeg',
          cacheControl: '31536000',
          upsert: false,
        });
      if (upErr) {
        console.error('[MealCaptureSheet] upload failed', upErr);
        setSubmitting(false);
        setError(`Upload failed: ${upErr.message}`);
        return;
      }
      const { error: photoErr } = await supabase
        .from('meal_photos')
        .insert({
          entry_id:     entry.id,
          storage_path: storagePath,
          width:        p.width,
          height:       p.height,
        });
      if (photoErr) {
        console.error('[MealCaptureSheet] photo row insert failed', photoErr);
        setSubmitting(false);
        setError(`Photo save failed: ${photoErr.message}`);
        return;
      }
    }

    setSubmitting(false);
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
                    onClick={() => setMealKey(opt.key)}
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
                <button
                  onClick={() => fileRef.current?.click()}
                  className="aspect-square rounded-lg border border-dashed flex items-center justify-center"
                  style={{ borderColor: GOLD, color: GOLD }}
                >
                  <Camera size={20} />
                </button>
              )}
            </div>
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              capture="environment"
              multiple
              onChange={onPickFiles}
              className="hidden"
            />
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
