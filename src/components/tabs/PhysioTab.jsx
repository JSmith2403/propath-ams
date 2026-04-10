import { useState } from 'react';
import { Trash2 } from 'lucide-react';

const TODAY = new Date().toISOString().slice(0, 10);

const NOTE_TYPES = ['Assessment', 'Check-in', 'Observation'];

const NOTE_TYPE_COLORS = {
  Assessment:   { bg: 'rgba(67,126,141,0.12)', text: '#085777' },
  'Check-in':   { bg: 'rgba(165,141,105,0.12)', text: '#7a6540' },
  Observation:  { bg: '#f3f4f6', text: '#6b7280' },
  // legacy note type backwards compat
  Screen:       { bg: 'rgba(67,126,141,0.1)', text: '#085777' },
  'Catch-up':   { bg: 'rgba(165,141,105,0.12)', text: '#7a6540' },
};

function formatDate(d) {
  if (!d) return '—';
  return new Date(d).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: '2-digit' });
}

function AddAssessmentForm({ onSave, onCancel }) {
  const [date, setDate]         = useState(TODAY);
  const [assessor, setAssessor] = useState('');
  const [noteType, setNoteType] = useState(NOTE_TYPES[0]);
  const [notes, setNotes]       = useState('');

  const canSave = date && assessor.trim() && notes.trim();

  const handleSave = () => {
    if (!canSave) return;
    onSave({ date, assessor: assessor.trim(), noteType, notes: notes.trim() });
  };

  return (
    <div className="bg-gray-50 border border-gray-200 rounded-xl p-5 space-y-4">
      <h3 className="text-sm font-semibold text-gray-700">New Assessment</h3>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div>
          <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Date</label>
          <input
            type="date"
            value={date}
            onChange={e => setDate(e.target.value)}
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-800 focus:outline-none focus:border-[#437E8D] transition-colors"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Assessor</label>
          <input
            type="text"
            value={assessor}
            onChange={e => setAssessor(e.target.value)}
            placeholder="Staff name"
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-800 placeholder-gray-300 focus:outline-none focus:border-[#437E8D] transition-colors"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Note Type</label>
          <select
            value={noteType}
            onChange={e => setNoteType(e.target.value)}
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-800 focus:outline-none focus:border-[#437E8D] transition-colors bg-white"
          >
            {NOTE_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
          </select>
        </div>
      </div>

      <div>
        <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Notes</label>
        <textarea
          value={notes}
          onChange={e => setNotes(e.target.value)}
          rows={4}
          placeholder="Clinical observations, findings, recommendations…"
          className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-800 placeholder-gray-300 focus:outline-none focus:border-[#437E8D] transition-colors resize-none"
        />
      </div>

      <div className="flex items-center gap-3">
        <button
          onClick={handleSave}
          disabled={!canSave}
          className="px-4 py-2 rounded-lg text-sm font-semibold text-white disabled:opacity-40 disabled:cursor-not-allowed transition-opacity"
          style={{ backgroundColor: '#A58D69' }}
        >
          Save Assessment
        </button>
        <button onClick={onCancel} className="px-4 py-2 rounded-lg text-sm font-medium text-gray-500 hover:text-gray-700 transition-colors">
          Cancel
        </button>
      </div>
    </div>
  );
}

function NoteTypeTag({ type }) {
  const colors = NOTE_TYPE_COLORS[type] || { bg: '#f3f4f6', text: '#6b7280' };
  return (
    <span
      className="text-xs font-semibold px-2 py-0.5 rounded"
      style={{ backgroundColor: colors.bg, color: colors.text }}
    >
      {type}
    </span>
  );
}

export default function PhysioTab({ entries = [], onAddEntry, onDeleteEntry }) {
  const [showForm, setShowForm] = useState(false);

  const handleSave = data => {
    onAddEntry(data);
    setShowForm(false);
  };

  // Sort entries newest-first (handle both old and new entry shapes)
  const sorted = [...entries].sort((a, b) => new Date(b.date) - new Date(a.date));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wide">Physiotherapy Assessments</h2>
        {!showForm && (
          <button
            onClick={() => setShowForm(true)}
            className="px-4 py-2 rounded-lg text-sm font-semibold text-white transition-opacity hover:opacity-90"
            style={{ backgroundColor: '#A58D69' }}
          >
            + Add Assessment
          </button>
        )}
      </div>

      {showForm && (
        <AddAssessmentForm onSave={handleSave} onCancel={() => setShowForm(false)} />
      )}

      {sorted.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-100 px-6 py-12 text-center">
          <p className="text-sm text-gray-400 italic">No assessments recorded yet.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {sorted.map(entry => {
            // Support both old (metric/value/staff) and new (assessor/noteType/notes) shapes
            const assessor  = entry.assessor || entry.staff || '—';
            const noteType  = entry.noteType || (entry.metric ? 'Screen' : null);
            const noteText  = entry.notes || (entry.metric ? `${entry.metric}${entry.value ? ': ' + entry.value : ''}` : '—');

            return (
              <div key={entry.id} className="group bg-white rounded-xl border border-gray-100 p-5">
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-sm font-semibold text-gray-700">{formatDate(entry.date)}</span>
                  <span className="text-xs text-gray-400">{assessor}</span>
                  {noteType && <NoteTypeTag type={noteType} />}
                  {onDeleteEntry && (
                    <button
                      onClick={() => {
                        if (window.confirm('Are you sure you want to delete this entry? This cannot be undone.')) {
                          onDeleteEntry(entry.id);
                        }
                      }}
                      title="Delete entry"
                      className="ml-auto p-1 rounded text-gray-300 hover:text-red-500 hover:bg-red-50 opacity-0 group-hover:opacity-100 transition-all"
                    >
                      <Trash2 size={13} />
                    </button>
                  )}
                </div>
                <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-wrap">{noteText}</p>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
