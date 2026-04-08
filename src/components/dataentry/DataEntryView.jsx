import PhysicalMobilitySheet from './PhysicalMobilitySheet';

export default function DataEntryView({
  athletes,
  syncSessionData,
  updateLatestEntry,
}) {
  return (
    <div className="flex flex-col h-full overflow-hidden" style={{ backgroundColor: '#f4f5f7' }}>
      {/* Header */}
      <div className="shrink-0 bg-white border-b border-gray-200 px-6 py-4">
        <h1 className="text-lg font-bold text-gray-900">Data Entry</h1>
        <p className="text-xs text-gray-400 mt-0.5">Physical &amp; Mobility testing — all athletes</p>
      </div>

      {/* Sheet */}
      <div className="flex-1 overflow-hidden bg-white">
        <PhysicalMobilitySheet
          athletes={athletes}
          syncSessionData={syncSessionData}
          onUpdateEntry={updateLatestEntry}
        />
      </div>
    </div>
  );
}
