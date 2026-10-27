import { useMemo, useState } from 'react';
import { X, AlertTriangle } from 'lucide-react';
import { METRIC_CATEGORIES, METRIC_MAP } from '../../data/sessionMetrics';
import { BASE_PROGRESS, BASE_KEYS } from '../../data/progressBase';

const GOLD = '#A58D69';
const todayISO = () => new Date().toLocaleDateString('en-CA');
const fmtDate = (iso) => new Date(`${String(iso).slice(0, 10)}T12:00:00`).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
const fmtVal = (e) => (e.value != null ? e.value : `${e.left ?? '—'} / ${e.right ?? '—'}`);

/**
 * Quick add result — one test result for one athlete on one date, without creating a testing-day sheet.
 * For the odd extra: a one-off retest, something measured on a different device, a result from last
 * month that never got entered. `entries` is the athlete's results ({ metricKey: [{ date, value | left,
 * right }] }) — used to show recent results and warn about a same-day duplicate.
 */
export default function QuickAddResult({ athleteName, entries = {}, customMetrics = {}, initialMetric = '', onSave, onClose }) {
  const [metricKey, setMetricKey] = useState(initialMetric || BASE_PROGRESS[0].key);
  const [date, setDate] = useState(todayISO());
  const [value, setValue] = useState('');
  const [left, setLeft] = useState('');
  const [right, setRight] = useState('');
  const [error, setError] = useState(null);

  const groups = useMemo(() => {
    const out = [{ label: 'Core tests (every athlete)', items: BASE_PROGRESS.map(b => ({ key: b.key, label: b.label })) }];
    for (const cat of METRIC_CATEGORIES) {
      const items = cat.metrics.filter(m => !BASE_KEYS.has(m.key)).map(m => ({ key: m.key, label: m.label }));
      if (items.length) out.push({ label: cat.label, items });
    }
    const custom = Object.entries(customMetrics).map(([key, m]) => ({ key, label: m.label || key }));
    if (custom.length) out.push({ label: 'Custom', items: custom });
    return out;
  }, [customMetrics]);

  const metric = METRIC_MAP[metricKey] || customMetrics[metricKey] || null;
  const bilateral = !!metric?.bilateral;
  const unit = metric?.unit || '';
  const all = entries[metricKey] || [];
  const recent = useMemo(() => [...all].sort((a, b) => String(b.date).localeCompare(String(a.date))).slice(0, 3), [all]);
  const sameDay = all.find(e => String(e.date).slice(0, 10) === date);

  const submit = (e) => {
    e.preventDefault();
    if (!date) { setError('Choose the date it was measured.'); return; }
    if (date > todayISO()) { setError('That date is in the future.'); return; }
    let entry;
    if (bilateral) {
      const l = Number(left), r = Number(right);
      if (left === '' || right === '' || !Number.isFinite(l) || !Number.isFinite(r)) { setError('Enter both a left and a right value.'); return; }
      entry = { date, left: l, right: r };
    } else {
      const v = Number(value);
      if (value === '' || !Number.isFinite(v)) { setError('Enter the result as a number.'); return; }
      entry = { date, value: v };
    }
    onSave(metricKey, entry);
  };

  const input = 'w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:border-[#A58D69]';
  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center p-4" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <form onSubmit={submit} className="bg-white rounded-xl shadow-2xl w-full" style={{ maxWidth: 440 }}>
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <div>
            <h2 className="text-base font-bold text-gray-900">Add a result</h2>
            <p className="text-xs text-gray-400">{athleteName}</p>
          </div>
          <button type="button" onClick={onClose} className="text-gray-400 hover:text-gray-600" aria-label="Close"><X size={18} /></button>
        </div>

        <div className="px-5 py-4 space-y-3">
          <div>
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide block mb-1" htmlFor="qa-metric">Test</label>
            <select id="qa-metric" value={metricKey} onChange={(e) => { setMetricKey(e.target.value); setError(null); }} className={input}>
              {groups.map(g => (
                <optgroup key={g.label} label={g.label}>
                  {g.items.map(i => <option key={i.key} value={i.key}>{i.label}</option>)}
                </optgroup>
              ))}
            </select>
          </div>

          <div>
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide block mb-1" htmlFor="qa-date">Date measured</label>
            <input id="qa-date" type="date" value={date} max={todayISO()} onChange={(e) => setDate(e.target.value)} className={input} />
          </div>

          {bilateral ? (
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide block mb-1" htmlFor="qa-left">Left{unit ? ` (${unit})` : ''}</label>
                <input id="qa-left" type="number" step="any" inputMode="decimal" value={left} onChange={(e) => setLeft(e.target.value)} className={input} />
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide block mb-1" htmlFor="qa-right">Right{unit ? ` (${unit})` : ''}</label>
                <input id="qa-right" type="number" step="any" inputMode="decimal" value={right} onChange={(e) => setRight(e.target.value)} className={input} />
              </div>
            </div>
          ) : (
            <div>
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide block mb-1" htmlFor="qa-value">Result{unit ? ` (${unit})` : ''}</label>
              <input id="qa-value" type="number" step="any" inputMode="decimal" autoFocus value={value} onChange={(e) => setValue(e.target.value)} className={input} />
            </div>
          )}

          {sameDay && (
            <p className="flex items-start gap-2 text-xs rounded-lg px-3 py-2" style={{ backgroundColor: '#fef3c7', color: '#92400e' }}>
              <AlertTriangle size={14} className="shrink-0 mt-0.5" />
              <span>There's already a result on {fmtDate(date)} ({fmtVal(sameDay)}{unit ? ` ${unit}` : ''}). Saving adds another.</span>
            </p>
          )}

          {recent.length > 0 && (
            <div>
              <p className="text-[10px] font-bold uppercase text-gray-400 mb-1">Recent results</p>
              <ul className="text-xs text-gray-600 space-y-0.5">
                {recent.map(e => <li key={e.id || e.date}>{fmtDate(e.date)} — {fmtVal(e)}{unit ? ` ${unit}` : ''}</li>)}
              </ul>
            </div>
          )}

          {error && <p className="text-xs text-red-600" role="alert">{error}</p>}
        </div>

        <div className="flex gap-2 px-5 py-4 border-t border-gray-100">
          <button type="submit" className="flex-1 py-2.5 rounded-lg text-sm font-bold text-white" style={{ backgroundColor: GOLD }}>Save result</button>
          <button type="button" onClick={onClose} className="px-4 py-2.5 rounded-lg text-sm font-semibold text-gray-600 border border-gray-200">Cancel</button>
        </div>
      </form>
    </div>
  );
}
