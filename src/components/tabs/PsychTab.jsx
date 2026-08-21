import { useState } from 'react';
import { Plus } from 'lucide-react';
import AcsiRadar from '../charts/AcsiRadar';
import { ACSI_SUBSCALES } from '../../data/referenceData';

const TODAY = new Date().toISOString().slice(0, 10);

// ─── ACSI-28 entry form ───────────────────────────────────────────────────────
function AcsiForm({ onSave, onCancel }) {
  const [date, setDate]     = useState(TODAY);
  const [staff, setStaff]   = useState('');
  const [scores, setScores] = useState(() =>
    Object.fromEntries(ACSI_SUBSCALES.map(s => [s.key, '']))
  );

  const total = ACSI_SUBSCALES.reduce((sum, s) => {
    const v = Number(scores[s.key]);
    return sum + (isNaN(v) ? 0 : v);
  }, 0);

  const setScore = (key, val) => setScores(p => ({ ...p, [key]: val }));

  const handleSave = () => {
    const entry = {
      date,
      staff: staff.trim(),
      total,
      ...Object.fromEntries(ACSI_SUBSCALES.map(s => [s.key, Number(scores[s.key]) || 0])),
    };
    onSave(entry);
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5 space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1.5">Date</label>
          <input type="date" value={date} onChange={e => setDate(e.target.value)}
            className="w-full text-sm border border-gray-200 rounded px-3 py-2 focus:outline-none bg-white" />
        </div>
        <div>
          <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1.5">Staff</label>
          <input type="text" value={staff} onChange={e => setStaff(e.target.value)} placeholder="Your name"
            className="w-full text-sm border border-gray-200 rounded px-3 py-2 focus:outline-none bg-white" />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {ACSI_SUBSCALES.map(s => (
          <div key={s.key}>
            <label className="block text-xs font-medium text-gray-600 mb-1">
              {s.label} <span className="text-gray-400">(0–28)</span>
            </label>
            <input type="number" min="0" max="28" value={scores[s.key]}
              onChange={e => setScore(s.key, e.target.value)}
              className="w-full text-sm border border-gray-200 rounded px-3 py-1.5 focus:outline-none bg-white" />
          </div>
        ))}
      </div>

      <div className="flex items-center justify-between py-3 px-4 rounded-lg" style={{ backgroundColor: '#f9fafb' }}>
        <span className="text-sm font-semibold text-gray-700">Total Score</span>
        <span className="text-xl font-bold" style={{ color: '#A58D69' }}>
          {total} <span className="text-sm font-normal text-gray-400">/ 196</span>
        </span>
      </div>

      <div className="flex gap-2">
        <button onClick={handleSave} disabled={!staff.trim()}
          className="px-5 py-2 text-sm font-semibold text-white rounded-lg disabled:opacity-40 hover:opacity-90"
          style={{ backgroundColor: '#A58D69' }}>
          Save Assessment
        </button>
        <button onClick={onCancel} className="px-4 py-2 text-sm text-gray-500 hover:text-gray-700">Cancel</button>
      </div>
    </div>
  );
}

// ─── Main export ──────────────────────────────────────────────────────────────
// RAG status/notes/"Working On" moved to Goals & Development — this tab
// is now just the ACSI-28 assessment log.
export default function PsychTab({ acsi28 = [], onAddAcsi28 }) {
  const [showAcsiForm, setShowAcsiForm] = useState(false);
  const [compareDate, setCompareDate]   = useState('');

  const sortedAcsi    = [...acsi28].sort((a, b) => new Date(b.date) - new Date(a.date));
  const comparableDates = sortedAcsi.slice(1).map(e => e.date);

  const acsiBlock = (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wide">ACSI-28 Assessments</h2>
        {!showAcsiForm && (
          <button
            onClick={() => setShowAcsiForm(true)}
            className="flex items-center gap-1.5 text-xs font-semibold px-3 py-2 text-white rounded-lg"
            style={{ backgroundColor: '#A58D69' }}
          >
            <Plus size={13} /> Add Assessment
          </button>
        )}
      </div>

      {showAcsiForm && (
        <div className="mb-4">
          <AcsiForm
            onSave={entry => { onAddAcsi28(entry); setShowAcsiForm(false); }}
            onCancel={() => setShowAcsiForm(false)}
          />
        </div>
      )}

      {sortedAcsi.length > 0 ? (
        <div className="bg-white rounded-xl border border-gray-100 p-5">
          {comparableDates.length > 0 && (
            <div className="flex items-center gap-3 mb-4 pb-4 border-b border-gray-100">
              <label className="text-xs font-semibold text-gray-500">Compare with earlier assessment:</label>
              <select
                value={compareDate}
                onChange={e => setCompareDate(e.target.value)}
                className="text-sm border border-gray-200 rounded px-2 py-1 focus:outline-none bg-white"
              >
                <option value="">— Select date —</option>
                {comparableDates.map(d => (
                  <option key={d} value={d}>
                    {new Date(d).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </option>
                ))}
              </select>
              {compareDate && (
                <button onClick={() => setCompareDate('')}
                  className="text-xs text-gray-400 hover:text-gray-600 underline">
                  Clear
                </button>
              )}
            </div>
          )}
          <AcsiRadar entries={sortedAcsi} compareDate={compareDate || null} />
        </div>
      ) : (
        !showAcsiForm && (
          <div className="bg-white rounded-xl border border-gray-100 p-10 text-center">
            <p className="text-sm text-gray-400">No ACSI-28 assessments recorded yet.</p>
          </div>
        )
      )}
    </div>
  );

  return acsiBlock;
}
