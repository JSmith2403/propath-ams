import { useState } from 'react';
import { Trash2, Pencil } from 'lucide-react';
import { renderBold } from '../../utils/renderBold';
import WordCounter from '../WordCounter';

const TODAY = new Date().toISOString().slice(0, 10);

const NOTE_TYPES = ['Assessment', 'Check-in', 'Observation', 'Session note'];

const NOTE_TYPE_COLORS = {
  Assessment:     { bg: 'rgba(67,126,141,0.12)', text: '#085777' },
  'Check-in':     { bg: 'rgba(165,141,105,0.12)', text: '#7a6540' },
  Observation:    { bg: '#f3f4f6', text: '#6b7280' },
  // Written by the "+ Note" quick-add on a completed session in Recent
  // Updates (RecentUpdatesView.jsx) rather than typed here directly —
  // carries a `sourceSession` reference, rendered below the tag.
  'Session note': { bg: 'rgba(34,197,94,0.12)', text: '#16a34a' },
  // legacy note type backwards compat
  Screen:       { bg: 'rgba(67,126,141,0.1)', text: '#085777' },
  'Catch-up':   { bg: 'rgba(165,141,105,0.12)', text: '#7a6540' },
};

function formatSessionDate(d) {
  if (!d) return '';
  return new Date(d).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
}

function formatDate(d) {
  if (!d) return '—';
  return new Date(d).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: '2-digit' });
}

function AssessmentForm({ initial, onSave, onCancel, title, saveLabel }) {
  const [date, setDate]         = useState(initial?.date || TODAY);
  const [assessor, setAssessor] = useState(initial?.assessor || initial?.staff || '');
  const [noteType, setNoteType] = useState(initial?.noteType || NOTE_TYPES[0]);
  const [notes, setNotes]       = useState(initial?.notes || '');

  const canSave = date && assessor.trim() && notes.trim();

  const handleSave = () => {
    if (!canSave) return;
    onSave({ date, assessor: assessor.trim(), noteType, notes: notes.trim() });
  };

  return (
    <div className="bg-gray-50 border border-gray-200 rounded-xl p-5 space-y-4">
      <h3 className="text-sm font-semibold text-gray-700">{title || 'New Assessment'}</h3>

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
          placeholder="Clinical observations, findings, recommendations..."
          className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-800 placeholder-gray-300 focus:outline-none focus:border-[#437E8D] transition-colors resize-none"
        />
        {noteType === 'Assessment' && <WordCounter text={notes} limit={150} />}
      </div>

      <div className="flex items-center gap-3">
        <button
          onClick={handleSave}
          disabled={!canSave}
          className="px-4 py-2 rounded-lg text-sm font-semibold text-white disabled:opacity-40 disabled:cursor-not-allowed transition-opacity"
          style={{ backgroundColor: '#A58D69' }}
        >
          {saveLabel || 'Save Assessment'}
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

// ─── Injury History ─────────────────────────────────────────────────
const INJURY_STATUSES = ['Active', 'Recovering', 'Resolved'];
const INJURY_STATUS_COLORS = {
  Active:     { bg: 'rgba(239,68,68,0.12)',  text: '#dc2626' },
  Recovering: { bg: 'rgba(245,158,11,0.12)', text: '#b45309' },
  Resolved:   { bg: 'rgba(34,197,94,0.12)',  text: '#16a34a' },
};

function InjuryStatusTag({ status }) {
  const colors = INJURY_STATUS_COLORS[status] || INJURY_STATUS_COLORS.Active;
  return (
    <span
      className="text-xs font-semibold px-2 py-0.5 rounded"
      style={{ backgroundColor: colors.bg, color: colors.text }}
    >
      {status}
    </span>
  );
}

function InjuryForm({ initial, onSave, onCancel, title, saveLabel }) {
  const [date, setDate]                 = useState(initial?.date || TODAY);
  const [injuryName, setInjuryName]     = useState(initial?.injuryName || '');
  const [bodyPart, setBodyPart]         = useState(initial?.bodyPart || '');
  const [status, setStatus]             = useState(initial?.status || INJURY_STATUSES[0]);
  const [expectedReturn, setExpectedReturn] = useState(initial?.expectedReturn || '');
  const [notes, setNotes]               = useState(initial?.notes || '');

  const canSave = date && injuryName.trim();

  const handleSave = () => {
    if (!canSave) return;
    onSave({
      date,
      injuryName: injuryName.trim(),
      bodyPart: bodyPart.trim(),
      status,
      expectedReturn: expectedReturn || null,
      notes: notes.trim(),
    });
  };

  return (
    <div className="bg-gray-50 border border-gray-200 rounded-xl p-5 space-y-4">
      <h3 className="text-sm font-semibold text-gray-700">{title || 'New Injury'}</h3>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Date occurred</label>
          <input
            type="date"
            value={date}
            onChange={e => setDate(e.target.value)}
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-800 focus:outline-none focus:border-[#437E8D] transition-colors"
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Injury</label>
          <input
            type="text"
            value={injuryName}
            onChange={e => setInjuryName(e.target.value)}
            placeholder="e.g. Grade 1 hamstring strain"
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-800 placeholder-gray-300 focus:outline-none focus:border-[#437E8D] transition-colors"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div>
          <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Body part</label>
          <input
            type="text"
            value={bodyPart}
            onChange={e => setBodyPart(e.target.value)}
            placeholder="e.g. Left hamstring"
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-800 placeholder-gray-300 focus:outline-none focus:border-[#437E8D] transition-colors"
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Status</label>
          <select
            value={status}
            onChange={e => setStatus(e.target.value)}
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-800 focus:outline-none focus:border-[#437E8D] transition-colors bg-white"
          >
            {INJURY_STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Expected return</label>
          <input
            type="date"
            value={expectedReturn}
            onChange={e => setExpectedReturn(e.target.value)}
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-800 focus:outline-none focus:border-[#437E8D] transition-colors"
          />
        </div>
      </div>

      <div>
        <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Notes</label>
        <textarea
          value={notes}
          onChange={e => setNotes(e.target.value)}
          rows={3}
          placeholder="Mechanism of injury, diagnosis, rehab plan..."
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
          {saveLabel || 'Save Injury'}
        </button>
        <button onClick={onCancel} className="px-4 py-2 rounded-lg text-sm font-medium text-gray-500 hover:text-gray-700 transition-colors">
          Cancel
        </button>
      </div>
    </div>
  );
}

function InjuryHistory({ injuries = [], onAddInjury, onUpdateInjury, onDeleteInjury }) {
  const [showForm, setShowForm]     = useState(false);
  const [editingId, setEditingId]   = useState(null);

  const handleSave = data => {
    onAddInjury(data);
    setShowForm(false);
  };

  const handleUpdate = data => {
    onUpdateInjury?.(editingId, data);
    setEditingId(null);
  };

  const sorted = [...injuries].sort((a, b) => new Date(b.date) - new Date(a.date));

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wide">Injury History</h2>
        {!showForm && !editingId && (
          <button
            onClick={() => setShowForm(true)}
            className="px-4 py-2 rounded-lg text-sm font-semibold text-white transition-opacity hover:opacity-90"
            style={{ backgroundColor: '#A58D69' }}
          >
            + Injury
          </button>
        )}
      </div>

      {showForm && (
        <InjuryForm
          title="New Injury"
          saveLabel="Save Injury"
          onSave={handleSave}
          onCancel={() => setShowForm(false)}
        />
      )}

      {sorted.length === 0 && !showForm ? (
        <div className="bg-white rounded-xl border border-gray-100 px-6 py-8 text-center">
          <p className="text-sm text-gray-400 italic">No injuries recorded.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {sorted.map(entry => {
            if (editingId === entry.id) {
              return (
                <InjuryForm
                  key={entry.id}
                  initial={entry}
                  title="Edit Injury"
                  saveLabel="Save Changes"
                  onSave={handleUpdate}
                  onCancel={() => setEditingId(null)}
                />
              );
            }

            return (
              <div key={entry.id} className="group bg-white rounded-xl border border-gray-100 p-5">
                <div className="flex items-center gap-3 mb-2 flex-wrap">
                  <span className="text-sm font-semibold text-gray-700">{formatDate(entry.date)}</span>
                  <span className="text-sm font-bold text-gray-900">{entry.injuryName}</span>
                  {entry.bodyPart && (
                    <span className="text-xs text-gray-400">{entry.bodyPart}</span>
                  )}
                  <InjuryStatusTag status={entry.status} />
                  {entry.status !== 'Resolved' && entry.expectedReturn && (
                    <span className="text-xs text-gray-400">
                      Expected return {formatDate(entry.expectedReturn)}
                    </span>
                  )}
                  <div className="ml-auto flex items-center gap-1">
                    {onUpdateInjury && (
                      <button
                        onClick={() => { setEditingId(entry.id); setShowForm(false); }}
                        title="Edit injury"
                        className="p-1 rounded text-gray-300 hover:text-blue-500 hover:bg-blue-50 opacity-0 group-hover:opacity-100 transition-all"
                      >
                        <Pencil size={13} />
                      </button>
                    )}
                    {onDeleteInjury && (
                      <button
                        onClick={() => {
                          if (window.confirm('Are you sure you want to delete this injury record? This cannot be undone.')) {
                            onDeleteInjury(entry.id);
                          }
                        }}
                        title="Delete injury"
                        className="p-1 rounded text-gray-300 hover:text-red-500 hover:bg-red-50 opacity-0 group-hover:opacity-100 transition-all"
                      >
                        <Trash2 size={13} />
                      </button>
                    )}
                  </div>
                </div>
                {entry.notes && (
                  <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-wrap">{renderBold(entry.notes)}</p>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default function PhysioTab({
  entries = [], onAddEntry, onUpdateEntry, onDeleteEntry,
  injuries = [], onAddInjury, onUpdateInjury, onDeleteInjury,
}) {
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const handleSave = data => {
    onAddEntry(data);
    setShowForm(false);
  };

  const handleUpdate = data => {
    onUpdateEntry?.(editingId, data);
    setEditingId(null);
  };

  // Sort entries newest-first
  const sorted = [...entries].sort((a, b) => new Date(b.date) - new Date(a.date));

  return (
    <div className="space-y-8">
      <InjuryHistory
        injuries={injuries}
        onAddInjury={onAddInjury}
        onUpdateInjury={onUpdateInjury}
        onDeleteInjury={onDeleteInjury}
      />

      <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wide">Physiotherapy Assessments</h2>
        {!showForm && !editingId && (
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
        <AssessmentForm
          title="New Assessment"
          saveLabel="Save Assessment"
          onSave={handleSave}
          onCancel={() => setShowForm(false)}
        />
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

            // Editing this entry
            if (editingId === entry.id) {
              return (
                <AssessmentForm
                  key={entry.id}
                  initial={entry}
                  title="Edit Assessment"
                  saveLabel="Save Changes"
                  onSave={handleUpdate}
                  onCancel={() => setEditingId(null)}
                />
              );
            }

            return (
              <div key={entry.id} className="group bg-white rounded-xl border border-gray-100 p-5">
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-sm font-semibold text-gray-700">{formatDate(entry.date)}</span>
                  <span className="text-xs text-gray-400">{assessor}</span>
                  {noteType && <NoteTypeTag type={noteType} />}
                  <div className="ml-auto flex items-center gap-1">
                    {onUpdateEntry && (
                      <button
                        onClick={() => { setEditingId(entry.id); setShowForm(false); }}
                        title="Edit entry"
                        className="p-1 rounded text-gray-300 hover:text-blue-500 hover:bg-blue-50 opacity-0 group-hover:opacity-100 transition-all"
                      >
                        <Pencil size={13} />
                      </button>
                    )}
                    {onDeleteEntry && (
                      <button
                        onClick={() => {
                          if (window.confirm('Are you sure you want to delete this entry? This cannot be undone.')) {
                            onDeleteEntry(entry.id);
                          }
                        }}
                        title="Delete entry"
                        className="p-1 rounded text-gray-300 hover:text-red-500 hover:bg-red-50 opacity-0 group-hover:opacity-100 transition-all"
                      >
                        <Trash2 size={13} />
                      </button>
                    )}
                  </div>
                </div>
                {entry.sourceSession && (
                  <p className="text-xs text-gray-400 mb-1.5">
                    Re: <span className="font-semibold text-gray-500">{entry.sourceSession.name}</span>
                    {entry.sourceSession.date && ` (${formatSessionDate(entry.sourceSession.date)})`} — session completed
                  </p>
                )}
                <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-wrap">{renderBold(noteText)}</p>
              </div>
            );
          })}
        </div>
      )}
      </div>
    </div>
  );
}
