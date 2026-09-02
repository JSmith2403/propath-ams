import { useState } from 'react';
import { ChevronDown, CheckCircle2, Play } from 'lucide-react';
import { tintForExercise } from '../../utils/letterTints';
import { parsePrescription } from '../../utils/prescriptionRender';

// Strip em dashes from coach-authored session names for house style.
function cleanName(name) {
  if (!name) return '';
  return String(name).replace(/\s+[—–]\s+/g, ': ');
}

export default function SessionCard({ session, index = 0, defaultOpen = false, onStart, isCompleted = false }) {
  const [open, setOpen] = useState(defaultOpen);

  // Group items by section so we get a TeamBuildr-style breakdown
  const grouped = [];
  let currentSection = null;
  for (const item of session.items) {
    if (item.kind === 'exercise') {
      const sec = item.sectionName || 'Main';
      if (!currentSection || currentSection.name !== sec) {
        currentSection = { name: sec, rows: [] };
        grouped.push(currentSection);
      }
      currentSection.rows.push(item);
    } else if (item.kind === 'note') {
      if (!currentSection) {
        currentSection = { name: 'Notes', rows: [] };
        grouped.push(currentSection);
      }
      currentSection.rows.push(item);
    }
  }

  const exerciseCount = session.items.filter(i => i.kind === 'exercise').length;

  return (
    <div className="rounded-xl overflow-hidden bg-white border border-ink-100 shadow-card">
      {/* Header (always visible) */}
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center gap-3 p-4 text-left hover:bg-ink-50/40 transition-colors"
      >
        <div className="w-11 h-11 rounded-lg flex items-center justify-center shrink-0 bg-gold-500">
          <span className="text-body font-bold text-white">
            S{index + 1}
          </span>
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-micro font-bold uppercase text-ink-400">
            Session {index + 1}
          </p>
          <p className="text-body font-semibold truncate text-ink-900">
            {cleanName(session.session_name)}
          </p>
          <p className="text-meta mt-0.5 text-ink-500">
            {exerciseCount === 0 ? 'Technical session' : `${exerciseCount} exercise${exerciseCount === 1 ? '' : 's'}`}
          </p>
        </div>
        <ChevronDown
          size={20}
          className="text-ink-400"
          style={{
            transform: open ? 'rotate(180deg)' : 'rotate(0)',
            transition: 'transform 0.2s',
          }}
        />
      </button>

      {/* Body */}
      {open && (
        <div className="px-4 pb-4 border-t border-ink-100">
          {grouped.map((sec, si) => (
            <div key={si} className="mb-4 last:mb-0 mt-3">
              <p className="text-micro font-bold uppercase mb-2 px-1 text-gold-600">
                {sec.name}
              </p>
              <div className="space-y-2">
                {sec.rows.map((row, ri) => {
                  if (row.kind === 'note') {
                    return (
                      <p
                        key={ri}
                        className="text-meta italic px-3 py-2 rounded-md leading-relaxed bg-ink-50 text-ink-600"
                      >
                        {row.content}
                      </p>
                    );
                  }
                  const tint = tintForExercise({ letter: row.letter, isWarmUp: row.sectionIsWarmUp });
                  const summary = parsePrescription(row).summary;
                  return (
                    <div
                      key={ri}
                      className="flex items-center gap-3 px-3 py-2.5 rounded-md bg-ink-50/60 border border-ink-100"
                    >
                      <div
                        className="w-8 h-8 rounded-full flex items-center justify-center shrink-0"
                        style={{ backgroundColor: tint.bg, border: `1px solid ${tint.border}` }}
                      >
                        <span className="text-meta font-bold" style={{ color: tint.border }}>
                          {row.letter}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-body font-semibold truncate text-ink-900">
                          {row.name}
                        </p>
                        {summary && (
                          <p className="text-meta font-semibold mt-0.5 text-gold-600">
                            {summary}
                          </p>
                        )}
                        {row.notes && (
                          <p className="text-meta mt-0.5 italic whitespace-pre-line text-ink-500">{row.notes}</p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}

          {/* Log CTA */}
          {isCompleted ? (
            <div className="w-full mt-4 rounded-md py-3 text-meta font-bold flex items-center justify-center gap-2 bg-green-50 text-green-700 border border-green-200">
              <CheckCircle2 size={16} /> Session logged
            </div>
          ) : (
            <button
              onClick={() => onStart && onStart(session)}
              className="w-full mt-4 rounded-md py-3 text-body font-bold transition-all flex items-center justify-center gap-2 active:scale-[0.99] bg-gold-500 text-white hover:bg-gold-600 shadow-xs"
            >
              <Play size={16} fill="currentColor" />
              Start this session
            </button>
          )}
        </div>
      )}
    </div>
  );
}
