import WellnessSlider from '../wellness/WellnessSlider';
import FlexSlider from './FlexSlider';

// Per-question-type field renderer — shared by the inline Training-tab
// wellness card and the full-screen daily check-in gate, so both surfaces
// stay visually identical to whatever the coach has configured.
export default function WellnessQuestionField({ question, value, onChange }) {
  const { question_type: type, label, config = {} } = question;

  if (type === 'slider_1_7') {
    return (
      <WellnessSlider label={label} value={value ?? 4} onChange={onChange}
        leftAnchor={config.leftAnchor || ''} rightAnchor={config.rightAnchor || ''} />
    );
  }

  if (type === 'slider') {
    return (
      <FlexSlider label={label} value={value} onChange={onChange}
        min={config.min ?? 1} max={config.max ?? 5}
        leftAnchor={config.leftAnchor || ''} rightAnchor={config.rightAnchor || ''} />
    );
  }

  if (type === 'number') {
    return (
      <div className="mb-5">
        <label className="block text-meta font-semibold mb-1.5 text-ink-800">
          {label}{config.unit ? <span className="text-ink-500"> ({config.unit})</span> : null}
        </label>
        <input type="number"
          min={config.min} max={config.max} step={config.step || 1}
          value={value ?? ''}
          onChange={(e) => onChange(e.target.value === '' ? null : Number(e.target.value))}
          className="w-full rounded-md px-3 py-2.5 text-body outline-none bg-white text-ink-900 border border-ink-200 focus:border-gold-500" />
      </div>
    );
  }

  if (type === 'yes_no') {
    return (
      <div className="mb-5">
        <label className="block text-meta font-semibold mb-2 text-ink-800">{label}</label>
        <div className="flex gap-2">
          {['yes','no'].map(v => {
            const isOn = value === v;
            return (
              <button key={v} type="button" onClick={() => onChange(v)}
                className={`flex-1 py-2.5 rounded-md text-meta font-bold uppercase tracking-wider active:scale-95 transition-all border ${
                  isOn
                    ? 'bg-gold-500 text-white border-gold-500'
                    : 'bg-white text-ink-600 border-ink-200 hover:border-gold-400'
                }`}>
                {v}
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  if (type === 'multi_choice') {
    const choices = config.choices || [];
    return (
      <div className="mb-5">
        <label className="block text-meta font-semibold mb-2 text-ink-800">{label}</label>
        <div className="space-y-1.5">
          {choices.map((c) => {
            const isOn = value === c;
            return (
              <button key={c} type="button" onClick={() => onChange(c)}
                className={`w-full text-left py-2.5 px-3 rounded-md text-body font-semibold active:scale-[0.99] transition-all border ${
                  isOn
                    ? 'bg-gold-500 text-white border-gold-500'
                    : 'bg-white text-ink-800 border-ink-200 hover:border-gold-400'
                }`}>
                {c}
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  if (type === 'text') {
    return (
      <div className="mb-5">
        <label className="block text-meta font-semibold mb-1.5 text-ink-800">{label}</label>
        <textarea rows={3}
          value={value ?? ''}
          onChange={(e) => onChange(e.target.value)}
          placeholder={config.placeholder || ''}
          className="w-full rounded-md px-3 py-2 text-body outline-none resize-none bg-white text-ink-900 border border-ink-200 focus:border-gold-500 placeholder:text-ink-400" />
      </div>
    );
  }

  return null;
}

export function countAnswered(responses, questions) {
  if (!responses) return 0;
  return questions.filter(q => responses[q.id] != null && responses[q.id] !== '').length;
}
