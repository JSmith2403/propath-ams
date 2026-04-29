import { useState } from 'react';
import { Plus, Pencil, Trash2 } from 'lucide-react';

/**
 * SessionTabStrip — horizontal strip of session tabs at the top of the
 * block builder. Click to activate, hover-pencil to rename inline,
 * hover-trash on non-active tabs to remove (with confirm done by parent).
 */
export default function SessionTabStrip({
  sessions,
  activeIdx,
  onActivate,
  onRename,
  onAdd,
  onRemove,
  canAdd = true,
}) {
  const [renamingIdx, setRenamingIdx] = useState(null);
  const [draft, setDraft] = useState('');

  const startRename = (idx) => {
    setRenamingIdx(idx);
    setDraft(sessions[idx].name);
  };
  const commitRename = () => {
    if (renamingIdx == null) return;
    const trimmed = draft.trim();
    if (trimmed && trimmed !== sessions[renamingIdx].name) {
      onRename(renamingIdx, trimmed);
    }
    setRenamingIdx(null);
  };

  return (
    <div className="flex items-stretch gap-1 px-6 pt-3 border-b border-gray-100 overflow-x-auto">
      {sessions.map((s, idx) => {
        const isActive = idx === activeIdx;
        const isRenaming = renamingIdx === idx;
        return (
          <div
            key={s.tempId}
            className="group relative flex items-center gap-1.5 px-3 py-2 cursor-pointer transition-colors shrink-0"
            style={{
              borderBottom: isActive ? '2px solid #A58D69' : '2px solid transparent',
              color:        isActive ? '#A58D69' : '#6b7280',
              fontWeight:   isActive ? 600 : 500,
              fontSize:     12,
              marginBottom: -1,
            }}
            onClick={() => !isRenaming && onActivate(idx)}
          >
            {isRenaming ? (
              <input
                autoFocus
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                onBlur={commitRename}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') commitRename();
                  else if (e.key === 'Escape') { setDraft(sessions[idx].name); setRenamingIdx(null); }
                }}
                className="px-1 text-xs rounded border border-gray-200 focus:outline-none focus:border-gray-300"
                style={{ color: '#1C1C1C', width: Math.max(80, draft.length * 8) }}
                onClick={(e) => e.stopPropagation()}
              />
            ) : (
              <span className="whitespace-nowrap">{s.name}</span>
            )}

            {!isRenaming && isActive && (
              <button
                onClick={(e) => { e.stopPropagation(); startRename(idx); }}
                className="opacity-0 group-hover:opacity-60 hover:opacity-100 transition-opacity"
                title="Rename session"
                style={{ color: '#6b7280' }}
              >
                <Pencil size={11} />
              </button>
            )}
            {!isRenaming && sessions.length > 1 && (
              <button
                onClick={(e) => { e.stopPropagation(); onRemove(idx); }}
                className="opacity-0 group-hover:opacity-60 hover:opacity-100 transition-opacity"
                title="Remove session"
                style={{ color: '#dc2626' }}
              >
                <Trash2 size={11} />
              </button>
            )}
          </div>
        );
      })}

      {canAdd && (
        <button
          onClick={onAdd}
          className="flex items-center gap-1 px-3 py-2 text-xs font-semibold transition-colors shrink-0"
          style={{ color: '#437E8D' }}
          title="Add session"
        >
          <Plus size={13} />
          Add session
        </button>
      )}
    </div>
  );
}
