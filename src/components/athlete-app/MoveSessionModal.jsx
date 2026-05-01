import { Calendar } from 'lucide-react';

/**
 * Confirmation modal shown when an athlete taps "Start this session"
 * on a session whose planned_date isn't today (their local date).
 *
 * On confirm: parent calls the move handler which updates planned_date
 * → today, stamps original_date + moved_at on the planned_session, and
 * proceeds into the logger.
 */
export default function MoveSessionModal({ session, onConfirm, onCancel, submitting }) {
  if (!session) return null;

  const date = new Date(session.planned_date + 'T00:00:00');
  const dateLabel = date.toLocaleDateString('en-GB', {
    weekday: 'long', day: 'numeric', month: 'long',
  });

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center px-4"
      style={{ backgroundColor: 'rgba(15,15,15,0.45)' }}
      onClick={onCancel}>
      <div
        className="bg-white rounded-xl w-full max-w-sm overflow-hidden shadow-overlay"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-5">
          <div className="w-11 h-11 rounded-full flex items-center justify-center mb-3 bg-gold-50">
            <Calendar size={20} className="text-gold-600" />
          </div>
          <h2 className="text-h3 text-ink-900 mb-1.5">Move this session to today?</h2>
          <p className="text-meta text-ink-600 leading-relaxed">
            This session was scheduled for <span className="font-semibold text-ink-800">{dateLabel}</span>.
            Tapping yes will move it to today and your calendar will update.
          </p>
        </div>
        <div className="px-5 pb-5 pt-2 flex flex-col gap-2">
          <button
            onClick={onConfirm}
            disabled={submitting}
            className="w-full rounded-md py-3 text-body font-bold bg-gold-500 text-white hover:bg-gold-600 active:scale-[0.99] transition-all disabled:opacity-50"
            style={{ minHeight: 48 }}
          >
            {submitting ? 'Moving…' : 'Yes, move to today'}
          </button>
          <button
            onClick={onCancel}
            disabled={submitting}
            className="w-full py-2.5 text-meta font-semibold text-ink-500 hover:text-ink-800 transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
