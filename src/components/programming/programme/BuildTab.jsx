import SessionBuilder from './build/SessionBuilder';

/**
 * BuildTab — Programme module → Build sub-tab.
 *
 * Checkpoint 2 scope: session template builder only. Block template
 * mode (multi-session container) lands in Checkpoint 5 once the
 * session builder is fully functional.
 */
export default function BuildTab() {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-[10px] font-bold uppercase tracking-widest" style={{ color: '#9ca3af' }}>
          Build a session template
        </h3>
        <span className="text-[10px]" style={{ color: '#9ca3af' }}>
          Save-as-template lands in Checkpoint 5
        </span>
      </div>

      <SessionBuilder />
    </div>
  );
}
