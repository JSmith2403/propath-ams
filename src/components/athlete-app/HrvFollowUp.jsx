export const HRV_FOLLOWUP_KEY = 'hrv_followup';
export const HRV_FOLLOWUP_QUESTION = 'What did you do yesterday, and how are you feeling today?';

const QUICK = ['Hard session', 'Match or game', 'Late night', 'Felt unwell', 'Nothing different'];

/**
 * The extra check-in question shown on a day their watch says HRV is lower than usual.
 * Free text, with a few quick starters. It's there to catch what the coach wouldn't otherwise know:
 * a hard session away from the programme, a late night, or illness coming on.
 */
export default function HrvFollowUp({ value, onChange }) {
  const text = value || '';
  return (
    <div>
      <p className="text-meta font-semibold text-ink-800">{HRV_FOLLOWUP_QUESTION}</p>
      <p className="text-micro text-ink-500 mt-0.5 mb-2">Your watch shows your recovery is lower than usual, so we’re asking one extra question.</p>
      <div className="flex flex-wrap gap-1.5 mb-2">
        {QUICK.map(q => (
          <button key={q} type="button" onClick={() => onChange(text.includes(q) ? text : (text ? `${text}. ${q}` : q))}
            className="rounded-full border border-ink-200 bg-white px-3 py-1.5 text-meta font-semibold text-ink-700 active:scale-95">
            {q}
          </button>
        ))}
      </div>
      <textarea rows={3} value={text} onChange={(e) => onChange(e.target.value)} maxLength={500}
        placeholder="A few words is fine"
        className="w-full rounded-md px-3 py-2 text-body bg-white border border-ink-200 focus:border-gold-500 outline-none resize-none placeholder:text-ink-400" />
    </div>
  );
}
