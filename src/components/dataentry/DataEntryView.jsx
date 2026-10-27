import { useState } from 'react';
import PhysicalMobilitySheet from './PhysicalMobilitySheet';
import UploadResultsView from './UploadResultsView';
import { useCustomMetrics } from '../../hooks/useCustomMetrics';

const GOLD = '#A58D69';

export default function DataEntryView({
  athletes,
  syncSessionData,
  updateLatestEntry,
  updateEntryById,
  onUpdateAthlete,
  onAddPerformanceEntry,
}) {
  const [tab, setTab] = useState('sheets');         // 'sheets' | 'upload'
  const { customMetrics } = useCustomMetrics();
  const tabBtn = (id, label) => (
    <button
      onClick={() => setTab(id)}
      className="px-4 py-1.5 rounded-md text-sm font-semibold transition-colors"
      style={tab === id ? { backgroundColor: '#fff', color: '#1C1C1C', boxShadow: '0 1px 2px rgba(0,0,0,0.08)' } : { color: '#6b7280' }}
    >
      {label}
    </button>
  );

  return (
    <div className="flex flex-col h-full overflow-hidden" style={{ backgroundColor: '#f4f5f7' }}>
      {/* Header */}
      <div className="shrink-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-lg font-bold text-gray-900">Data Management</h1>
          <p className="text-xs text-gray-400 mt-0.5">Testing sheets, uploads (paste, file or photo), plus VALD API imports</p>
        </div>
        <div className="inline-flex rounded-lg p-0.5" style={{ backgroundColor: '#f3f4f6' }} role="tablist">
          {tabBtn('sheets', 'Testing sheets')}
          {tabBtn('upload', 'Upload results')}
        </div>
      </div>

      {tab === 'sheets' ? (
        <div className="flex-1 overflow-hidden bg-white">
          <PhysicalMobilitySheet
            athletes={athletes}
            syncSessionData={syncSessionData}
            onUpdateEntry={updateLatestEntry}
            updateEntryById={updateEntryById}
            onUpdateAthlete={onUpdateAthlete}
          />
        </div>
      ) : (
        <div className="flex-1 overflow-y-auto bg-white" style={{ accentColor: GOLD }}>
          <UploadResultsView athletes={athletes} customMetrics={customMetrics} onAddEntry={onAddPerformanceEntry} />
        </div>
      )}
    </div>
  );
}
