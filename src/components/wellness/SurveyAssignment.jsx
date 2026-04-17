import { useState, useEffect } from 'react';
import { GripVertical } from 'lucide-react';

const GOLD = '#A58D69';

const TYPE_LABELS = { scale: 'Scale', numerical: 'Numerical', text: 'Text', yes_no: 'Yes/No' };
const TYPE_COLOURS = {
  scale:     { bg: 'rgba(67,126,141,0.12)',  text: '#085777' },
  numerical: { bg: 'rgba(165,141,105,0.12)', text: '#7a6540' },
  text:      { bg: '#f3f4f6',                text: '#6b7280' },
  yes_no:    { bg: '#ecfdf5',                text: '#047857' },
};

const MAX_ROSTER = 5;

export default function SurveyAssignment({ questions, initialAssignments, onSave }) {
  // items is ordered list of { question_id, assigned, show_on_roster }
  const [items, setItems] = useState([]);
  const [saveMessage, setSaveMessage] = useState(null);
  const [warning, setWarning] = useState(null);

  // Initialise state when inputs change
  useEffect(() => {
    // Build ordered list — assigned items first in their saved order, then unassigned questions in question-bank order
    const assignedMap = new Map((initialAssignments || []).map(a => [a.question_id, a]));

    const assigned = (initialAssignments || [])
      .slice()
      .sort((a, b) => a.display_order - b.display_order)
      .map(a => {
        const q = questions.find(q => q.id === a.question_id);
        if (!q) return null;
        return { question_id: a.question_id, assigned: true, show_on_roster: !!a.show_on_roster, question: q };
      })
      .filter(Boolean);

    const unassigned = questions
      .filter(q => q.is_active && !assignedMap.has(q.id))
      .map(q => ({ question_id: q.id, assigned: false, show_on_roster: false, question: q }));

    setItems([...assigned, ...unassigned]);
  }, [questions, initialAssignments]);

  const rosterCount = items.filter(i => i.assigned && i.show_on_roster).length;

  const setField = (id, key, value) => {
    setItems(prev => prev.map(i => i.question_id === id ? { ...i, [key]: value } : i));
  };

  const toggleAssigned = (id) => {
    setWarning(null);
    setItems(prev => prev.map(i => {
      if (i.question_id !== id) return i;
      // If unassigning, also clear show_on_roster
      if (i.assigned) return { ...i, assigned: false, show_on_roster: false };
      return { ...i, assigned: true };
    }));
  };

  const toggleRoster = (id) => {
    setWarning(null);
    const item = items.find(i => i.question_id === id);
    if (!item) return;
    if (item.question.question_type === 'text' || item.question.question_type === 'yes_no') return;
    if (!item.show_on_roster && rosterCount >= MAX_ROSTER) {
      setWarning(`Maximum ${MAX_ROSTER} metrics can be displayed on the roster card`);
      return;
    }
    setField(id, 'show_on_roster', !item.show_on_roster);
  };

  // Drag and drop reorder within assigned section
  const [dragId, setDragId] = useState(null);
  const onDragStart = (e, id) => { setDragId(id); e.dataTransfer.effectAllowed = 'move'; };
  const onDragOver = (e) => { e.preventDefault(); e.dataTransfer.dropEffect = 'move'; };
  const onDrop = (e, targetId) => {
    e.preventDefault();
    if (!dragId || dragId === targetId) { setDragId(null); return; }
    setItems(prev => {
      const next = [...prev];
      const fromIdx = next.findIndex(i => i.question_id === dragId);
      const toIdx = next.findIndex(i => i.question_id === targetId);
      if (fromIdx < 0 || toIdx < 0) return prev;
      const [moved] = next.splice(fromIdx, 1);
      next.splice(toIdx, 0, moved);
      return next;
    });
    setDragId(null);
  };

  const handleSave = async () => {
    const payload = items
      .filter(i => i.assigned)
      .map((i, idx) => ({
        question_id: i.question_id,
        show_on_roster: !!i.show_on_roster,
        display_order: idx,
      }));
    try {
      await onSave(payload);
      setSaveMessage('Survey saved');
      setTimeout(() => setSaveMessage(null), 2500);
    } catch (err) {
      setWarning('Failed to save: ' + (err.message || err));
    }
  };

  const assignedItems = items.filter(i => i.assigned);
  const unassignedItems = items.filter(i => !i.assigned);

  return (
    <div className="rounded-xl p-5 bg-white" style={{ border: '1px solid #e5e7eb' }}>
      <div className="flex items-start justify-between mb-3 flex-wrap gap-2">
        <div>
          <h3 className="text-sm font-semibold text-gray-700">Survey Questions</h3>
          <p className="text-xs text-gray-400 mt-0.5">
            Choose which questions this athlete will answer. Max {MAX_ROSTER} may show on the roster card.
          </p>
        </div>
        <div className="flex items-center gap-3">
          {saveMessage && <span className="text-xs font-medium" style={{ color: '#22c55e' }}>{saveMessage}</span>}
          <button onClick={handleSave}
            className="px-4 py-1.5 text-xs font-semibold text-white rounded-lg hover:opacity-90"
            style={{ backgroundColor: GOLD }}>
            Save Survey
          </button>
        </div>
      </div>

      {warning && (
        <p className="text-xs text-red-600 bg-red-50 rounded px-3 py-2 mb-3">{warning}</p>
      )}

      {/* Assigned section */}
      <div className="mb-3">
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Assigned to this athlete</p>
        {assignedItems.length === 0 ? (
          <p className="text-xs text-gray-400 italic py-2">No questions assigned yet.</p>
        ) : (
          <div className="space-y-1.5">
            {assignedItems.map((i) => {
              const q = i.question;
              const col = TYPE_COLOURS[q.question_type] || TYPE_COLOURS.text;
              const rosterAllowed = q.question_type === 'scale' || q.question_type === 'numerical';
              return (
                <div
                  key={q.id}
                  draggable
                  onDragStart={(e) => onDragStart(e, q.id)}
                  onDragOver={onDragOver}
                  onDrop={(e) => onDrop(e, q.id)}
                  className="flex items-center gap-3 p-2.5 rounded-lg border border-gray-100 bg-gray-50 cursor-move"
                >
                  <GripVertical size={14} className="text-gray-300" />
                  <input
                    type="checkbox"
                    checked={true}
                    onChange={() => toggleAssigned(q.id)}
                  />
                  <span className="text-xs font-semibold px-2 py-0.5 rounded shrink-0"
                    style={{ backgroundColor: col.bg, color: col.text }}>
                    {TYPE_LABELS[q.question_type]}
                  </span>
                  <span className="text-sm text-gray-800 flex-1 min-w-0 truncate">{q.question_text}</span>
                  {rosterAllowed && (
                    <label className="flex items-center gap-1.5 text-xs text-gray-500 shrink-0">
                      <input
                        type="checkbox"
                        checked={!!i.show_on_roster}
                        onChange={() => toggleRoster(q.id)}
                      />
                      Show on roster
                    </label>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Available to add */}
      {unassignedItems.length > 0 && (
        <div>
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Available from question bank</p>
          <div className="space-y-1.5">
            {unassignedItems.map((i) => {
              const q = i.question;
              const col = TYPE_COLOURS[q.question_type] || TYPE_COLOURS.text;
              return (
                <div key={q.id} className="flex items-center gap-3 p-2.5 rounded-lg border border-gray-100">
                  <input
                    type="checkbox"
                    checked={false}
                    onChange={() => toggleAssigned(q.id)}
                  />
                  <span className="text-xs font-semibold px-2 py-0.5 rounded shrink-0"
                    style={{ backgroundColor: col.bg, color: col.text }}>
                    {TYPE_LABELS[q.question_type]}
                  </span>
                  <span className="text-sm text-gray-600 flex-1 min-w-0 truncate">{q.question_text}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
