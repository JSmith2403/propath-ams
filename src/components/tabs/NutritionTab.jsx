import { useState } from 'react';

function WorkingOnCard({ card, onChange, onSave, isDirty }) {
  return (
    <div
      className="bg-white rounded-xl border border-gray-100 p-5 flex flex-col gap-3 min-h-[180px]"
      style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}
    >
      <input
        type="text"
        value={card.title}
        onChange={e => onChange('title', e.target.value)}
        onBlur={onSave}
        placeholder="Focus area..."
        className="text-sm font-semibold text-gray-900 w-full bg-transparent border-b border-transparent hover:border-gray-200 focus:border-gray-300 focus:outline-none transition-colors placeholder-gray-300"
      />
      <textarea
        rows={4}
        value={card.description}
        onChange={e => onChange('description', e.target.value)}
        onBlur={onSave}
        placeholder="Describe current focus, targets, or notes..."
        className="flex-1 text-sm text-gray-600 w-full bg-transparent border border-transparent hover:border-gray-200 focus:border-gray-300 rounded px-1 py-1 focus:outline-none transition-colors resize-none placeholder-gray-300 leading-relaxed"
      />
      {isDirty && (
        <button
          onClick={onSave}
          className="self-end text-xs font-semibold px-3 py-1.5 rounded hover:opacity-90 text-white transition-opacity"
          style={{ backgroundColor: '#A58D69' }}
        >
          Save
        </button>
      )}
    </div>
  );
}

export default function NutritionTab({ workingOn: initialWorkingOn, onSaveWorkingOn }) {
  const [cards, setCards] = useState(() => {
    const src = initialWorkingOn || [];
    return [0, 1, 2].map(i => ({
      title:       src[i]?.title       || '',
      description: src[i]?.description || '',
    }));
  });
  const [savedCards, setSavedCards] = useState(() => cards.map(c => ({ ...c })));

  const updateCard = (i, field, val) =>
    setCards(prev => prev.map((c, idx) => idx === i ? { ...c, [field]: val } : c));

  const saveCard = () => {
    onSaveWorkingOn?.(cards);
    setSavedCards(cards.map(c => ({ ...c })));
  };

  const isCardDirty = (i) =>
    cards[i].title !== savedCards[i].title ||
    cards[i].description !== savedCards[i].description;

  return (
    <div>
      <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wide mb-4">Currently Working On</h2>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {cards.map((card, i) => (
          <WorkingOnCard
            key={i}
            card={card}
            onChange={(field, val) => updateCard(i, field, val)}
            onSave={saveCard}
            isDirty={isCardDirty(i)}
          />
        ))}
      </div>
    </div>
  );
}
