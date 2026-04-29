import { useState } from 'react';
import { Layers, Library, Pencil, Trash2 } from 'lucide-react';
import { useBlockTemplates } from '../../../hooks/useBlockTemplates';
import {
  deleteBlockTemplate,
  loadBlockTemplate,
  updateBlockTemplate,
} from '../../../utils/programmeTemplates';
import ConfirmDialog from '../blocks/ConfirmDialog';
import BlockBuilderModal from './builder/BlockBuilderModal';

function formatDate(iso) {
  if (!iso) return '';
  const d = new Date(iso);
  return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
}

/**
 * TemplatesTab — list of saved block templates.
 *
 *  - Pencil   → loads the template back into the builder modal so the
 *               coach can adjust it. On save, the previous block_template
 *               row is replaced (save-then-delete).
 *  - Trash    → deletes the template. Already-applied athlete blocks
 *               are independent snapshots and are NOT affected.
 */
export default function TemplatesTab({ tick, onChange }) {
  const { templates, loading, error, refresh } = useBlockTemplates(tick);

  const [editing, setEditing] = useState(null);          // { id, draft }
  const [loadingEdit, setLoadingEdit] = useState(false);
  const [editError, setEditError] = useState(null);

  const [confirmDelete, setConfirmDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const handleEdit = async (template) => {
    setLoadingEdit(true);
    setEditError(null);
    const res = await loadBlockTemplate(template.id);
    setLoadingEdit(false);
    if (res.ok) {
      setEditing({ id: template.id, draft: res.draft });
    } else {
      setEditError(res.error?.message || 'Failed to load template.');
    }
  };

  const handleSaveEdit = async (draft) => {
    if (!editing) return { ok: false, error: new Error('No template in edit state.') };
    const res = await updateBlockTemplate(editing.id, draft);
    if (res.ok) {
      refresh();
      if (onChange) onChange();
    }
    return res;
  };

  const handleDelete = async () => {
    if (!confirmDelete) return;
    setDeleting(true);
    const res = await deleteBlockTemplate(confirmDelete.id);
    setDeleting(false);
    if (res.ok) {
      setConfirmDelete(null);
      refresh();
      if (onChange) onChange();
    } else {
      alert(`Delete failed: ${res.error?.message || 'unknown'}`);
    }
  };

  if (loading) {
    return <div className="text-xs text-center py-12" style={{ color: '#9ca3af' }}>Loading templates…</div>;
  }

  if (error) {
    return (
      <div className="rounded-xl px-4 py-3 text-xs" style={{ backgroundColor: 'rgba(220,38,38,0.06)', color: '#dc2626' }}>
        Failed to load templates: {error.message}
      </div>
    );
  }

  if (!templates.length) {
    return (
      <div
        className="rounded-xl px-8 py-16 text-center"
        style={{ backgroundColor: '#fff', border: '1px solid #e5e7eb' }}
      >
        <div
          className="mx-auto flex items-center justify-center mb-4"
          style={{
            width: 56, height: 56, borderRadius: '50%',
            backgroundColor: 'rgba(67,126,141,0.10)', color: '#437E8D',
          }}
        >
          <Library size={26} strokeWidth={1.75} />
        </div>
        <h3 className="text-sm font-bold mb-1" style={{ color: '#1C1C1C' }}>
          No templates yet
        </h3>
        <p className="text-xs max-w-md mx-auto" style={{ color: '#6b7280' }}>
          Build your first session or block in the Build tab. Saved templates will appear here.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {editError && (
        <div className="rounded-lg px-3 py-2 text-xs" style={{ backgroundColor: 'rgba(220,38,38,0.06)', color: '#dc2626' }}>
          {editError}
        </div>
      )}

      {templates.map(t => (
        <div
          key={t.id}
          className="rounded-lg px-4 py-3 flex items-center gap-4 group"
          style={{ backgroundColor: '#fff', border: '1px solid #e5e7eb' }}
        >
          <div
            className="shrink-0 flex items-center justify-center"
            style={{
              width: 36, height: 36, borderRadius: '50%',
              backgroundColor: 'rgba(67,126,141,0.10)', color: '#437E8D',
            }}
          >
            <Layers size={16} strokeWidth={1.75} />
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-sm font-bold truncate" style={{ color: '#1C1C1C' }}>
              {t.name}
            </div>
            <div className="text-[11px] flex items-center gap-3 mt-0.5" style={{ color: '#6b7280' }}>
              <span>{t.session_count} {t.session_count === 1 ? 'session' : 'sessions'}</span>
              <span>·</span>
              <span>{t.default_duration_weeks}-week</span>
              <span>·</span>
              <span>Saved {formatDate(t.created_at)}</span>
            </div>
            {t.description && (
              <div className="text-[11px] italic truncate mt-0.5" style={{ color: '#9ca3af' }}>
                {t.description}
              </div>
            )}
          </div>

          <button
            onClick={() => handleEdit(t)}
            disabled={loadingEdit}
            className="opacity-0 group-hover:opacity-100 p-2 rounded hover:bg-gray-100 transition-all shrink-0 disabled:opacity-30"
            style={{ color: '#437E8D' }}
            title="Edit template"
          >
            <Pencil size={14} />
          </button>
          <button
            onClick={() => setConfirmDelete(t)}
            className="opacity-0 group-hover:opacity-100 p-2 rounded hover:bg-gray-100 transition-all shrink-0"
            style={{ color: '#dc2626' }}
            title="Delete template"
          >
            <Trash2 size={14} />
          </button>
        </div>
      ))}

      {editing && (
        <BlockBuilderModal
          initialDraft={editing.draft}
          onSave={handleSaveEdit}
          onClose={() => setEditing(null)}
        />
      )}

      {confirmDelete && (
        <ConfirmDialog
          title="Delete template?"
          body={`"${confirmDelete.name}" will be removed. Athletes who already have this block applied are not affected — templates and applied blocks are independent.`}
          confirmLabel={deleting ? 'Deleting…' : 'Delete'}
          danger
          onConfirm={handleDelete}
          onCancel={() => setConfirmDelete(null)}
        />
      )}
    </div>
  );
}
