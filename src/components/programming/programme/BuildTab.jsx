import { useState } from 'react';
import { FileText, Layers, Plus } from 'lucide-react';
import SessionBuilderModal from './build/SessionBuilderModal';

/**
 * BuildTab — Programme module → Build sub-tab.
 *
 * Two cards: "New session template" / "New block template". Clicking
 * either opens the session builder modal. Block template mode (multi-
 * session container) is wired in Checkpoint 5; for now both cards open
 * the same single-session modal.
 *
 * Save-to-DB lands in Checkpoint 5 — modal close currently logs the
 * session payload to the console for verification.
 */
export default function BuildTab() {
  const [modalOpen, setModalOpen] = useState(false);

  const handleClose = (sessionPayload) => {
    if (sessionPayload) {
      // eslint-disable-next-line no-console
      console.log('[Build] session done:', sessionPayload);
    }
    setModalOpen(false);
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <button
          onClick={() => setModalOpen(true)}
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
            Build a single training session — sections, exercises, weekly progressions.
          </p>
          <div className="mt-4 inline-flex items-center gap-1.5 text-xs font-semibold" style={{ color: '#A58D69' }}>
            <Plus size={13} />
            Start building
          </div>
        </button>

        <div
          className="rounded-xl p-6"
          style={{ backgroundColor: '#fff', border: '1px solid #e5e7eb', opacity: 0.6 }}
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
            Group multiple sessions into a multi-week block template.
          </p>
          <div className="mt-4 inline-flex items-center gap-1.5 text-xs font-semibold" style={{ color: '#9ca3af' }}>
            Coming in Checkpoint 5
          </div>
        </div>
      </div>

      {modalOpen && (
        <SessionBuilderModal onClose={handleClose} />
      )}
    </div>
  );
}
