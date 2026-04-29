import { useState } from 'react';
import { FileText, Layers, Plus } from 'lucide-react';
import BlockBuilderModal from './builder/BlockBuilderModal';

function tempId(prefix) { return `${prefix}-${Math.random().toString(36).slice(2, 10)}`; }

function makeDraft({ defaultSessionCount = 1 } = {}) {
  return {
    block: {
      name: defaultSessionCount > 1 ? 'Untitled block' : 'Untitled session',
      duration_weeks: 4,
      description: '',
    },
    sessions: Array.from({ length: defaultSessionCount }, (_, i) => ({
      tempId: tempId('sess'),
      name: `Session ${i + 1}`,
      notes: '',
      sections: [{ tempId: tempId('sec'), name: 'Warm-up', is_warm_up: true, display_order: 0, exercises: [] }],
    })),
  };
}

/**
 * BuildTab — Programme module → Build sub-tab.
 *
 * Two entry cards. Both open the same block-scoped builder modal; the
 * difference is the default session count (1 for a session template,
 * 3 for a block template). Coach can adjust freely inside the modal.
 *
 * Save-to-DB lands in Checkpoint 5 — modal close currently logs the
 * draft payload to the console for verification.
 */
export default function BuildTab() {
  const [draft, setDraft] = useState(null);

  const openSessionTemplate = () => setDraft(makeDraft({ defaultSessionCount: 1 }));
  const openBlockTemplate   = () => setDraft(makeDraft({ defaultSessionCount: 3 }));
  const handleClose = (payload) => {
    if (payload) {
      // eslint-disable-next-line no-console
      console.log('[Build] draft done:', payload);
    }
    setDraft(null);
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <button
          onClick={openSessionTemplate}
          className="rounded-xl p-6 text-left transition-shadow hover:shadow-md"
          style={{ backgroundColor: '#fff', border: '1px solid #e5e7eb' }}
        >
          <div
            className="inline-flex items-center justify-center mb-4"
            style={{
              width: 48, height: 48, borderRadius: '50%',
              backgroundColor: 'rgba(67,126,141,0.10)', color: '#437E8D',
            }}
          >
            <FileText size={22} strokeWidth={1.75} />
          </div>
          <h3 className="text-sm font-bold mb-1" style={{ color: '#1C1C1C' }}>
            New session template
          </h3>
          <p className="text-xs" style={{ color: '#6b7280' }}>
            A single session with sections and a horizontal week grid.
          </p>
          <div className="mt-4 inline-flex items-center gap-1.5 text-xs font-semibold" style={{ color: '#A58D69' }}>
            <Plus size={13} />
            Start building
          </div>
        </button>

        <button
          onClick={openBlockTemplate}
          className="rounded-xl p-6 text-left transition-shadow hover:shadow-md"
          style={{ backgroundColor: '#fff', border: '1px solid #e5e7eb' }}
        >
          <div
            className="inline-flex items-center justify-center mb-4"
            style={{
              width: 48, height: 48, borderRadius: '50%',
              backgroundColor: 'rgba(165,141,105,0.10)', color: '#A58D69',
            }}
          >
            <Layers size={22} strokeWidth={1.75} />
          </div>
          <h3 className="text-sm font-bold mb-1" style={{ color: '#1C1C1C' }}>
            New block template
          </h3>
          <p className="text-xs" style={{ color: '#6b7280' }}>
            Multiple sessions across several weeks — e.g. a 6-week strength block.
          </p>
          <div className="mt-4 inline-flex items-center gap-1.5 text-xs font-semibold" style={{ color: '#A58D69' }}>
            <Plus size={13} />
            Start building
          </div>
        </button>
      </div>

      {draft && (
        <BlockBuilderModal initialDraft={draft} onClose={handleClose} />
      )}
    </div>
  );
}
