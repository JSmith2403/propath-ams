import { Pencil, Trash2, Clock, Users } from 'lucide-react';

const GOLD = '#A58D69';

function formatDate(iso) {
  if (!iso) return '';
  return new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
}

export default function SessionLog({ sessions, athletes, onOpen, onNew, onDelete }) {
  const athleteMap = Object.fromEntries(athletes.map(a => [a.id, a.name]));

  if (sessions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center flex-1 py-24 text-center">
        <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mb-4">
          <Clock size={20} className="text-gray-300" />
        </div>
        <p className="text-sm font-medium text-gray-500 mb-1">No sessions yet</p>
        <p className="text-xs text-gray-400 mb-5">Create a new testing session to get started.</p>
        <button onClick={onNew}
          className="px-4 py-2 text-sm font-semibold text-white rounded-lg hover:opacity-90"
          style={{ backgroundColor: GOLD }}>
          New Testing Session
        </button>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto px-4 py-3">
      <div className="space-y-2 max-w-3xl">
        {sessions.map(s => {
          const athleteNames = (s.athleteIds || []).map(id => athleteMap[id]).filter(Boolean);
          const metricCount  = (s.metricKeys || []).length;
          const isSaved      = !!s.savedAt;
          return (
            <div key={s.id}
              className="bg-white rounded-xl border border-gray-100 px-4 py-3 flex items-center justify-between gap-4"
              style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
              {/* Left info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-sm font-semibold text-gray-800">{formatDate(s.date)}</span>
                  {s.label && (
                    <span className="text-xs font-medium px-1.5 py-0.5 rounded bg-amber-50 text-amber-700 border border-amber-200">
                      {s.label}
                    </span>
                  )}
                  {!isSaved && (
                    <span className="text-xs font-medium px-1.5 py-0.5 rounded bg-gray-100 text-gray-500">Draft</span>
                  )}
                </div>
                <div className="flex items-center gap-3 mt-1 flex-wrap">
                  <span className="flex items-center gap-1 text-xs text-gray-400">
                    <Users size={10} /> {athleteNames.length > 0 ? athleteNames.join(', ') : '\u2014'}
                  </span>
                  <span className="text-xs text-gray-400">{metricCount} metric{metricCount !== 1 ? 's' : ''}</span>
                  {isSaved && (
                    <span className="text-xs text-gray-400">
                      Saved {formatDate(s.savedAt)}
                    </span>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-1.5 shrink-0">
                <button onClick={() => onOpen(s.id, false)}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white rounded hover:opacity-90"
                  style={{ backgroundColor: GOLD }}>
                  <Pencil size={11} /> {isSaved ? 'Edit' : 'Continue'}
                </button>
                <button onClick={() => onOpen(s.id, true)}
                  className="px-3 py-1.5 text-xs font-medium text-gray-500 rounded border border-gray-200 hover:bg-gray-50">
                  View
                </button>
                <button onClick={() => onDelete(s.id)}
                  className="p-1.5 text-gray-300 hover:text-red-400 rounded">
                  <Trash2 size={13} />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
