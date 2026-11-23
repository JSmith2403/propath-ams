import { useEffect, useRef, useState } from 'react';
import { Apple, GlassWater, ImagePlus, Loader2, Moon, Sun, Trash2, Upload, X } from 'lucide-react';
import { compressImage, imageSize } from '../../utils/imageCompress';
import { defaultLogDate, localISO, photoTakenAt, suggestMealType } from '../../utils/photoTime';
import { freeSnackSlot, saveMeal, usedMealTypes } from '../../lib/saveMeal';

const GOLD = '#A58D69';
const MAX_ITEMS = 12;
const MEALS = [
  { key: 'breakfast', label: 'Breakfast', icon: Sun },
  { key: 'lunch', label: 'Lunch', icon: Sun },
  { key: 'snack', label: 'Snack', icon: Apple },
  { key: 'dinner', label: 'Dinner', icon: Moon },
  { key: 'drink', label: 'Drink', icon: GlassWater },
];

const niceDate = (iso) => new Date(`${iso}T12:00:00`).toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' });
const fmtTime = (d) => (d ? d.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }) : '');

/**
 * Add several meals at once from photos already on the phone: snap each meal as you eat, then pick them all at the
 * end of the day. Each photo gets a meal and a day (guessed from when it was taken; change either), then they go in
 * together as separate meals.
 */
export default function MealBatchSheet({ athleteId, logDate, onClose }) {
  const [items, setItems] = useState([]);        // [{ id, blob, previewUrl, width, height, takenAt, mealKey, date, description }]
  const [reading, setReading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [progress, setProgress] = useState(null);
  const fileRef = useRef(null);
  const itemsRef = useRef(items);
  itemsRef.current = items;

  const todayISO = localISO(new Date());
  const minDate = (() => { const d = new Date(); d.setDate(d.getDate() - 6); return localISO(d); })();

  useEffect(() => () => itemsRef.current.forEach(i => URL.revokeObjectURL(i.previewUrl)), []);

  const pick = async (e) => {
    const files = Array.from(e.target.files || []);
    e.target.value = '';
    const room = MAX_ITEMS - items.length;
    if (!files.length || room <= 0) return;
    setReading(true); setError(null);
    const added = [];
    for (const f of files.slice(0, room)) {
      try {
        const takenAt = await photoTakenAt(f);
        const blob = await compressImage(f, { maxEdge: 1600, quality: 0.8 });
        const { width, height } = await imageSize(blob);
        added.push({
          id: crypto.randomUUID(), blob, width, height, takenAt, previewUrl: URL.createObjectURL(blob),
          mealKey: suggestMealType(takenAt), date: defaultLogDate(takenAt, todayISO, logDate), description: '',
        });
      } catch {
        setError(`Couldn’t read “${f.name}”. Try a different photo.`);
      }
    }
    if (files.length > room) setError(`You can add up to ${MAX_ITEMS} at a time. The rest were left out.`);
    setItems(prev => [...prev, ...added].sort((a, b) => (a.takenAt?.getTime() || 0) - (b.takenAt?.getTime() || 0)));
    setReading(false);
  };

  const patch = (id, p) => setItems(prev => prev.map(i => (i.id === id ? { ...i, ...p } : i)));
  const remove = (id) => setItems(prev => {
    const gone = prev.find(i => i.id === id);
    if (gone) URL.revokeObjectURL(gone.previewUrl);
    return prev.filter(i => i.id !== id);
  });

  const submit = async () => {
    if (!items.length || submitting) return;
    setSubmitting(true); setError(null);

    // Work out each meal's slot first, so a full day of snacks is caught before anything is saved.
    const dates = [...new Set(items.map(i => i.date))];
    const used = await usedMealTypes(athleteId, dates);
    const plan = [];
    for (const it of items) {
      const set = used.get(it.date);
      let type = it.mealKey;
      if (type === 'snack') {
        type = freeSnackSlot(set);
        if (!type) { setSubmitting(false); setError(`Three snacks are already logged for ${niceDate(it.date)}. Change one of these to a meal, or another day.`); return; }
      }
      set.add(type);
      plan.push({ it, type });
    }

    let saved = 0;
    for (const { it, type } of plan) {
      setProgress({ done: saved, total: plan.length });
      const r = await saveMeal({ athleteId, logDate: it.date, mealType: type, description: it.description, photos: [{ blob: it.blob, width: it.width, height: it.height }] });
      if (!r.ok) {
        setSubmitting(false); setProgress(null);
        setError(`${saved} of ${plan.length} saved. ${r.error} The rest are still here: try again.`);
        setItems(prev => prev.filter(p => !plan.slice(0, saved).some(s => s.it.id === p.id)));
        return;
      }
      saved += 1;
    }
    setSubmitting(false); setProgress(null);
    onClose?.(true);
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center" style={{ backgroundColor: 'rgba(0,0,0,0.55)' }}
      onClick={(e) => { if (e.target === e.currentTarget && !submitting) onClose?.(false); }}>
      <div className="bg-white w-full sm:max-w-md sm:rounded-2xl shadow-2xl flex flex-col"
        style={{ maxWidth: 480, maxHeight: '92dvh', borderTopLeftRadius: 24, borderTopRightRadius: 24, paddingBottom: 'env(safe-area-inset-bottom)' }}>
        <div className="flex items-center justify-between px-5 py-4 border-b border-ink-100 shrink-0">
          <div>
            <h3 className="text-base font-bold" style={{ color: '#1C1C1C' }}>Add meals from your photos</h3>
            <p className="text-meta text-ink-500">Snapped your meals through the day? Add them all here.</p>
          </div>
          <button onClick={() => !submitting && onClose?.(false)} disabled={submitting} aria-label="Close" className="p-1.5 rounded hover:bg-ink-50 disabled:opacity-50"><X size={18} className="text-ink-500" /></button>
        </div>

        <div className="px-5 py-4 space-y-3 overflow-y-auto flex-1">
          <button onClick={() => fileRef.current?.click()} disabled={reading || submitting || items.length >= MAX_ITEMS}
            className="w-full rounded-xl border border-dashed py-4 flex items-center justify-center gap-2 text-sm font-bold disabled:opacity-50"
            style={{ borderColor: GOLD, color: GOLD }}>
            {reading ? <><Loader2 size={16} className="animate-spin" /> Reading photos…</> : <><ImagePlus size={18} /> {items.length ? 'Add more photos' : 'Choose photos from your phone'}</>}
          </button>
          <input ref={fileRef} type="file" accept="image/*" multiple onChange={pick} className="hidden" />

          {items.map(it => (
            <div key={it.id} className="rounded-xl border border-ink-100 p-3">
              <div className="flex gap-3">
                <img src={it.previewUrl} alt="" className="w-20 h-20 rounded-lg object-cover shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-[11px] text-ink-500">{it.takenAt ? `Taken ${fmtTime(it.takenAt)}` : 'Time unknown'}</p>
                    <button onClick={() => remove(it.id)} disabled={submitting} aria-label="Remove photo" className="p-1 text-ink-400 hover:text-red-600"><Trash2 size={14} /></button>
                  </div>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {MEALS.map(m => {
                      const on = it.mealKey === m.key;
                      return (
                        <button key={m.key} type="button" onClick={() => patch(it.id, { mealKey: m.key })}
                          className="px-2 py-1 rounded-md border text-[11px] font-semibold"
                          style={{ borderColor: on ? GOLD : '#e5e7eb', backgroundColor: on ? 'rgba(165,141,105,0.12)' : '#fff', color: on ? '#6f5e3e' : '#6b7280' }}>
                          {m.label}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
              <div className="flex gap-2 mt-2">
                <input type="date" value={it.date} min={minDate} max={todayISO} onChange={(e) => e.target.value && patch(it.id, { date: e.target.value })}
                  aria-label="Day" className="px-2 py-1.5 rounded-lg border border-ink-200 text-[13px]" />
                <input value={it.description} onChange={(e) => patch(it.id, { description: e.target.value })} placeholder="What was it? (optional)"
                  className="flex-1 min-w-0 px-3 py-1.5 rounded-lg border border-ink-200 text-[13px] focus:outline-none focus:border-gold-400" />
              </div>
            </div>
          ))}

          {error && <div className="text-[12px] font-semibold text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2">{error}</div>}
        </div>

        <div className="px-5 py-3 border-t border-ink-100 flex items-center gap-2 shrink-0">
          <button onClick={() => !submitting && onClose?.(false)} disabled={submitting} className="flex-1 py-3 rounded-lg text-sm font-semibold text-ink-700 disabled:opacity-50">Cancel</button>
          <button onClick={submit} disabled={!items.length || submitting}
            className="flex-[2] py-3 rounded-lg text-sm font-bold text-white inline-flex items-center justify-center gap-1.5 disabled:opacity-50" style={{ backgroundColor: GOLD }}>
            {submitting ? <><Loader2 size={14} className="animate-spin" /> {progress ? `Saving ${progress.done + 1} of ${progress.total}…` : 'Saving…'}</> : <><Upload size={14} /> Add {items.length || ''} meal{items.length === 1 ? '' : 's'}</>}
          </button>
        </div>
      </div>
    </div>
  );
}
