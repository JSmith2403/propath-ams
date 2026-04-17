import { useState } from 'react';
import { Pencil, Trash2, Plus } from 'lucide-react';
import { useWellnessQuestions } from '../hooks/useWellnessQuestions';

const GOLD = '#A58D69';

const TYPE_LABELS = {
  scale:     'Scale',
  numerical: 'Numerical',
  text:      'Text',
  yes_no:    'Yes/No',
};

const TYPE_COLOURS = {
  scale:     { bg: 'rgba(67,126,141,0.12)',  text: '#085777' },
  numerical: { bg: 'rgba(165,141,105,0.12)', text: '#7a6540' },
  text:      { bg: '#f3f4f6',                text: '#6b7280' },
  yes_no:    { bg: '#ecfdf5',                text: '#047857' },
};

const EMPTY_FORM = {
  question_text:   '',
  question_type:   'scale',
  scale_min:       1,
  scale_max:       7,
  scale_min_label: '',
  scale_max_label: '',
  numerical_min:   0,
  numerical_max:   10,
  numerical_step:  1,
  numerical_unit:  '',
  higher_is_worse: true,
  green_threshold: null,
  amber_threshold: null,
  display_order:   0,
  is_active:       true,
};

function TypeBadge({ type }) {
  const c = TYPE_COLOURS[type] || TYPE_COLOURS.text;
  return (
    <span className="text-xs font-semibold px-2 py-0.5 rounded"
      style={{ backgroundColor: c.bg, color: c.text }}>
      {TYPE_LABELS[type] || type}
    </span>
  );
}

function QuestionForm({ initial, onSave, onCancel, title, saveLabel }) {
  const [form, setForm] = useState({ ...EMPTY_FORM, ...(initial || {}) });
  const set = (k) => (v) => setForm(prev => ({ ...prev, [k]: v }));

  const canSave = form.question_text.trim().length > 0;

  const handleSave = () => {
    if (!canSave) return;
    // Clean payload: only send fields relevant to the type
    const payload = {
      question_text:  form.question_text.trim(),
      question_type:  form.question_type,
      display_order:  Number(form.display_order) || 0,
      is_active:      !!form.is_active,
    };
    if (form.question_type === 'scale') {
      payload.scale_min       = Number(form.scale_min) || 1;
      payload.scale_max       = Number(form.scale_max) || 7;
      payload.scale_min_label = form.scale_min_label || null;
      payload.scale_max_label = form.scale_max_label || null;
      payload.higher_is_worse = !!form.higher_is_worse;
      payload.green_threshold = form.green_threshold === '' || form.green_threshold == null ? null : Number(form.green_threshold);
      payload.amber_threshold = form.amber_threshold === '' || form.amber_threshold == null ? null : Number(form.amber_threshold);
    } else if (form.question_type === 'numerical') {
      payload.numerical_min  = form.numerical_min === '' || form.numerical_min == null ? null : Number(form.numerical_min);
      payload.numerical_max  = form.numerical_max === '' || form.numerical_max == null ? null : Number(form.numerical_max);
      payload.numerical_step = form.numerical_step === '' || form.numerical_step == null ? null : Number(form.numerical_step);
      payload.numerical_unit = form.numerical_unit || null;
      payload.higher_is_worse = !!form.higher_is_worse;
      payload.green_threshold = form.green_threshold === '' || form.green_threshold == null ? null : Number(form.green_threshold);
      payload.amber_threshold = form.amber_threshold === '' || form.amber_threshold == null ? null : Number(form.amber_threshold);
    }
    onSave(payload);
  };

  const isScale   = form.question_type === 'scale';
  const isNum     = form.question_type === 'numerical';
  const showThresh = isScale || isNum;

  return (
    <div className="bg-gray-50 border border-gray-200 rounded-xl p-5 space-y-4 mb-6">
      <h3 className="text-sm font-semibold text-gray-700">{title || 'New Question'}</h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="md:col-span-2">
          <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Question Text</label>
          <input type="text" value={form.question_text} onChange={e => set('question_text')(e.target.value)}
            placeholder="How did you feel today?"
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#437E8D]" />
        </div>

        <div>
          <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Type</label>
          <select value={form.question_type} onChange={e => set('question_type')(e.target.value)}
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:border-[#437E8D]">
            <option value="scale">Scale</option>
            <option value="numerical">Numerical</option>
            <option value="text">Text</option>
            <option value="yes_no">Yes/No</option>
          </select>
        </div>

        <div>
          <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Display Order</label>
          <input type="number" value={form.display_order} onChange={e => set('display_order')(e.target.value)}
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#437E8D]" />
        </div>
      </div>

      {isScale && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-2 border-t border-gray-100">
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Min Value</label>
            <input type="number" value={form.scale_min} onChange={e => set('scale_min')(e.target.value)}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#437E8D]" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Max Value</label>
            <input type="number" value={form.scale_max} onChange={e => set('scale_max')(e.target.value)}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#437E8D]" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Min Label</label>
            <input type="text" value={form.scale_min_label} onChange={e => set('scale_min_label')(e.target.value)}
              placeholder="e.g. Very, very good"
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#437E8D]" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Max Label</label>
            <input type="text" value={form.scale_max_label} onChange={e => set('scale_max_label')(e.target.value)}
              placeholder="e.g. Very, very poor"
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#437E8D]" />
          </div>
        </div>
      )}

      {isNum && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-2 border-t border-gray-100">
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Min</label>
            <input type="number" value={form.numerical_min ?? ''} onChange={e => set('numerical_min')(e.target.value)}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#437E8D]" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Max</label>
            <input type="number" value={form.numerical_max ?? ''} onChange={e => set('numerical_max')(e.target.value)}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#437E8D]" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Step</label>
            <input type="number" value={form.numerical_step ?? ''} onChange={e => set('numerical_step')(e.target.value)}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#437E8D]" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Unit</label>
            <input type="text" value={form.numerical_unit ?? ''} onChange={e => set('numerical_unit')(e.target.value)}
              placeholder="e.g. hours, kg"
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#437E8D]" />
          </div>
        </div>
      )}

      {showThresh && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2 border-t border-gray-100">
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Higher is worse</label>
            <select value={form.higher_is_worse ? 'yes' : 'no'} onChange={e => set('higher_is_worse')(e.target.value === 'yes')}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:border-[#437E8D]">
              <option value="yes">Yes (higher = worse)</option>
              <option value="no">No (lower = worse)</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Green threshold</label>
            <input type="number" step="any" value={form.green_threshold ?? ''} onChange={e => set('green_threshold')(e.target.value)}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#437E8D]" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Amber threshold</label>
            <input type="number" step="any" value={form.amber_threshold ?? ''} onChange={e => set('amber_threshold')(e.target.value)}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#437E8D]" />
          </div>
        </div>
      )}

      <div className="flex items-center gap-4 pt-2">
        <label className="flex items-center gap-2 text-xs text-gray-600">
          <input type="checkbox" checked={!!form.is_active} onChange={e => set('is_active')(e.target.checked)} />
          Active
        </label>
      </div>

      <div className="flex items-center gap-3">
        <button onClick={handleSave} disabled={!canSave}
          className="px-4 py-2 rounded-lg text-sm font-semibold text-white disabled:opacity-40 disabled:cursor-not-allowed"
          style={{ backgroundColor: GOLD }}>
          {saveLabel || 'Save Question'}
        </button>
        <button onClick={onCancel} className="px-4 py-2 rounded-lg text-sm font-medium text-gray-500 hover:text-gray-700">
          Cancel
        </button>
      </div>
    </div>
  );
}

export default function SurveyQuestionsAdmin() {
  const { questions, loading, createQuestion, updateQuestion, deleteQuestion } = useWellnessQuestions();
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);

  const handleCreate = async (payload) => {
    await createQuestion(payload);
    setShowForm(false);
  };
  const handleUpdate = async (payload) => {
    await updateQuestion(editing.id, payload);
    setEditing(null);
  };
  const handleDelete = async (q) => {
    if (!window.confirm('This will remove this question from all athlete surveys. Are you sure?')) return;
    await deleteQuestion(q.id);
  };

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="px-8 pt-8 pb-6">
        <div className="flex items-start justify-between mb-2">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Survey Questions</h1>
            <p className="text-sm text-gray-500 mt-1">
              Manage the global question bank used for athlete wellness surveys.
            </p>
          </div>
          {!showForm && !editing && (
            <button onClick={() => setShowForm(true)}
              className="flex items-center gap-2 px-4 py-2.5 text-sm font-semibold text-white rounded-lg hover:opacity-90"
              style={{ backgroundColor: GOLD }}>
              <Plus size={16} />
              Add Question
            </button>
          )}
        </div>
      </div>

      <div className="px-8 pb-8">
        {showForm && (
          <QuestionForm
            title="New Question"
            saveLabel="Save Question"
            onSave={handleCreate}
            onCancel={() => setShowForm(false)}
          />
        )}

        {loading ? (
          <p className="text-sm text-gray-400 py-12 text-center">Loading questions...</p>
        ) : questions.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-100 px-6 py-12 text-center">
            <p className="text-sm text-gray-400 italic">No questions yet. Add one above to get started.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {questions.map(q => {
              if (editing?.id === q.id) {
                return (
                  <QuestionForm
                    key={q.id}
                    title="Edit Question"
                    saveLabel="Save Changes"
                    initial={q}
                    onSave={handleUpdate}
                    onCancel={() => setEditing(null)}
                  />
                );
              }
              return (
                <div key={q.id} className="group bg-white rounded-xl border border-gray-100 p-4">
                  <div className="flex items-center gap-3 flex-wrap">
                    <span className="text-xs text-gray-400 font-medium">#{q.display_order}</span>
                    <TypeBadge type={q.question_type} />
                    {!q.is_active && (
                      <span className="text-xs font-semibold px-2 py-0.5 rounded"
                        style={{ backgroundColor: '#f3f4f6', color: '#9ca3af' }}>
                        Inactive
                      </span>
                    )}
                    <span className="text-sm font-semibold text-gray-800 flex-1 min-w-0">{q.question_text}</span>
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => { setEditing(q); setShowForm(false); }}
                        title="Edit question"
                        className="p-1.5 rounded text-gray-400 hover:text-blue-500 hover:bg-blue-50">
                        <Pencil size={14} />
                      </button>
                      <button onClick={() => handleDelete(q)}
                        title="Delete question"
                        className="p-1.5 rounded text-gray-400 hover:text-red-500 hover:bg-red-50">
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                  {(q.question_type === 'scale' || q.question_type === 'numerical') && (
                    <p className="text-xs text-gray-400 mt-1.5">
                      {q.question_type === 'scale'
                        ? `${q.scale_min}-${q.scale_max} | ${q.scale_min_label || ''}${q.scale_min_label ? ' → ' : ''}${q.scale_max_label || ''}`
                        : `${q.numerical_min}-${q.numerical_max}${q.numerical_step ? ` step ${q.numerical_step}` : ''}${q.numerical_unit ? ` ${q.numerical_unit}` : ''}`}
                      {q.green_threshold != null && (
                        <> | green {q.higher_is_worse ? '≤' : '≥'} {q.green_threshold}, amber {q.higher_is_worse ? '≤' : '≥'} {q.amber_threshold}</>
                      )}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
