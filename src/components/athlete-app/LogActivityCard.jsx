import { useState } from 'react';
import { Activity, Minus, Plus, Trash2, X } from 'lucide-react';
import { useUntrackedActivity } from '../../hooks/useUntrackedActivity';

// Same anchors and gradient as the end-of-workout intensity slider, so it feels the same.
const RPE_ANCHORS = { 0: 'Rest', 1: 'Very easy', 2: 'Very easy', 3: 'Easy', 4: 'Easy', 5: 'Moderate', 6: 'Hard', 7: 'Hard', 8: 'Very hard', 9: 'Very hard', 10: 'Maximal' };
const RPE_GRADIENT = 'linear-gradient(to right, #22c55e 0%, #84cc16 30%, #facc15 50%, #f59e0b 70%, #ef4444 100%)';
const QUICK = ['Game', 'Team training', 'Run', 'Gym', 'Other'];

const todayISO = () => new Date().toLocaleDateString('en-CA');
const yesterdayISO = () => { const d = new Date(); d.setDate(d.getDate() - 1); return d.toLocaleDateString('en-CA'); };
const niceDate = (iso) => (iso === todayISO() ? 'Today' : iso === yesterdayISO() ? 'Yesterday' : new Date(`${iso}T12:00:00`).toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' }));

/**
 * "Log other activity": for anything the watch didn't capture, like a game or training without it. What, when,
 * how long and how hard (0 to 10, the same slider as the end of a workout). Shows the last few entries so a
 * mistake can be taken back out.
 */
export default function LogActivityCard({ athleteId }) {
  const { logs, available, saving, error, add, remove } = useUntrackedActivity(athleteId);
  const [open, setOpen] = useState(false);
  const [name, setName] = useState('');
  const [when, setWhen] = useState('today');
  const [rpe, setRpe] = useState(5);
  const [minutes, setMinutes] = useState(60);

  if (!available) return null;
  const safeMinutes = Math.max(1, Math.min(600, Number(minutes) || 0));

  const save = async () => {
    if (!name.trim() || saving) return;
    const ok = await add({ name, dateISO: when === 'today' ? todayISO() : yesterdayISO(), minutes: safeMinutes, rpe });
    if (ok) { setOpen(false); setName(''); setRpe(5); setMinutes(60); setWhen('today'); }
  };

  return (
    <div className="rounded-xl p-4 bg-white border border-ink-100 shadow-card">
      <div className="flex items-start gap-3">
        <div className="w-11 h-11 rounded-lg flex items-center justify-center shrink-0 bg-gold-50"><Activity size={20} className="text-gold-600" /></div>
        <div className="flex-1 min-w-0">
          <p className="text-body font-bold text-ink-900">Other activity</p>
          <p className="text-meta mt-0.5 text-ink-500">Played a game or trained without your watch? Log it here so your coach sees it.</p>
        </div>
      </div>

      {!open ? (
        <button onClick={() => setOpen(true)} className="w-full mt-3 rounded-md py-3 text-body font-bold bg-white text-ink-800 border border-ink-200 hover:border-gold-400 active:scale-[0.99]">
          Log an activity
        </button>
      ) : (
        <div className="mt-4 space-y-5">
          <div className="flex justify-between items-center -mb-2">
            <p className="text-meta font-bold text-ink-800">What was it?</p>
            <button onClick={() => setOpen(false)} aria-label="Close" className="w-8 h-8 rounded-md flex items-center justify-center text-ink-500 hover:bg-ink-100"><X size={16} /></button>
          </div>
          <div>
            <div className="flex flex-wrap gap-1.5 mb-2">
              {QUICK.map(q => (
                <button key={q} type="button" onClick={() => setName(q)} className="rounded-full border px-3 py-1.5 text-meta font-semibold active:scale-95"
                  style={{ borderColor: name === q ? '#A58D69' : '#e5e5e7', background: name === q ? '#f1eadc' : '#fff', color: '#3f3f46' }}>{q}</button>
              ))}
            </div>
            <input value={name} onChange={e => setName(e.target.value)} maxLength={80} placeholder="e.g. Club match, 5-a-side"
              className="w-full rounded-md px-3 py-2 text-body bg-white border border-ink-200 focus:border-gold-500 outline-none placeholder:text-ink-400" />
          </div>

          <div className="flex gap-2">
            {[['today', 'Today'], ['yesterday', 'Yesterday']].map(([k, l]) => (
              <button key={k} onClick={() => setWhen(k)} className="flex-1 rounded-md py-2 text-meta font-bold border"
                style={{ borderColor: when === k ? '#A58D69' : '#e5e5e7', background: when === k ? '#f1eadc' : '#fff', color: '#3f3f46' }}>{l}</button>
            ))}
          </div>

          <div>
            <p className="text-meta font-bold text-ink-800">How hard was it?</p>
            <div className="flex items-baseline justify-center gap-2 mt-1"><span className="text-h1 font-bold text-ink-900 tabular-nums">{rpe}</span><span className="text-meta text-ink-500">/ 10</span></div>
            <p className="text-center text-body font-semibold text-gold-600 mb-3">{RPE_ANCHORS[rpe]}</p>
            <input type="range" min={0} max={10} step={1} value={rpe} onChange={e => setRpe(Number(e.target.value))} className="log-rpe w-full" aria-label="Intensity, 0 to 10" />
            <div className="flex justify-between mt-1 px-1 text-micro font-bold text-ink-400"><span>0</span><span>5</span><span>10</span></div>
          </div>

          <div>
            <p className="text-meta font-bold text-ink-800 mb-2">How long? (minutes)</p>
            <div className="flex items-center justify-center gap-4">
              <button onClick={() => setMinutes(m => Math.max(1, Number(m) - 5))} aria-label="Less time" className="w-12 h-12 rounded-full bg-white border border-ink-200 flex items-center justify-center active:scale-95"><Minus size={18} /></button>
              <input type="number" min={1} max={600} value={minutes} onChange={e => setMinutes(e.target.value === '' ? '' : Number(e.target.value))} onBlur={() => setMinutes(safeMinutes)}
                className="w-24 h-14 text-center text-h1 font-bold text-ink-900 bg-white border border-ink-200 rounded-md outline-none focus:border-gold-500 tabular-nums" />
              <button onClick={() => setMinutes(m => Math.min(600, Number(m) + 5))} aria-label="More time" className="w-12 h-12 rounded-full bg-white border border-ink-200 flex items-center justify-center active:scale-95"><Plus size={18} /></button>
            </div>
          </div>

          {error && <p className="text-meta text-red-600">{error}</p>}
          <button onClick={save} disabled={!name.trim() || saving} className="w-full rounded-lg py-3.5 text-body font-bold bg-gold-500 text-white hover:bg-gold-600 disabled:opacity-40">{saving ? 'Saving…' : 'Save activity'}</button>
        </div>
      )}

      {logs.length > 0 && (
        <ul className="mt-3 divide-y divide-ink-100 border-t border-ink-100">
          {logs.slice(0, 4).map(l => (
            <li key={l.id} className="flex items-center gap-2 py-2">
              <span className="flex-1 min-w-0 text-meta text-ink-700"><b className="text-ink-900">{l.name}</b> · {niceDate(l.activity_date)} · {l.duration_min} min · {l.rpe}/10</span>
              <button onClick={() => remove(l.id)} aria-label={`Delete ${l.name}`} className="p-1.5 text-ink-400 hover:text-red-600"><Trash2 size={14} /></button>
            </li>
          ))}
        </ul>
      )}

      <style>{`
        .log-rpe { -webkit-appearance: none; appearance: none; height: 14px; border-radius: 8px; background: ${RPE_GRADIENT}; outline: none; cursor: pointer; box-shadow: inset 0 1px 2px rgba(15,15,15,0.10); }
        .log-rpe::-webkit-slider-thumb { -webkit-appearance: none; appearance: none; width: 32px; height: 32px; border-radius: 50%; background: #fff; border: 3px solid #1C1C1C; cursor: pointer; box-shadow: 0 2px 8px rgba(15,15,15,0.25); }
        .log-rpe::-moz-range-thumb { width: 32px; height: 32px; border-radius: 50%; background: #fff; border: 3px solid #1C1C1C; cursor: pointer; box-shadow: 0 2px 8px rgba(15,15,15,0.25); }
      `}</style>
    </div>
  );
}
