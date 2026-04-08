import { useState, useRef } from 'react';
import { Plus, Download, Upload } from 'lucide-react';
import { buildAthleteId } from '../../utils/athleteId';
import { ALL_METRICS, METRIC_MAP, METRIC_CATEGORIES } from '../../data/sessionMetrics';
import { useSessions } from '../../hooks/useSessions';
import { useCustomMetrics } from '../../hooks/useCustomMetrics';
import NewSessionForm    from './NewSessionForm';
import SessionTable      from './SessionTable';
import SessionLog        from './SessionLog';
import DataStorageTable  from './DataStorageTable';

const GOLD = '#A58D69';

// ── CSV import ────────────────────────────────────────────────────────────────
const PERF_TESTS = [
  { key: 'cmjHeight',         label: 'CMJ Jump Height',               unit: 'cm',          bilateral: false },
  { key: 'cmjPeakPower',      label: 'Peak Power CMJ',                unit: 'W/kg',        bilateral: false },
  { key: 'dsi',               label: 'Dynamic Strength Index',        unit: 'ratio',       bilateral: false },
  { key: 'rsi105',            label: '10-5 Reactive Strength Index',  unit: 'score',       bilateral: false },
  { key: 'imtpPeakForce',     label: 'IMTP Peak Force',               unit: 'N/kg',        bilateral: false },
  { key: 'isometricStrength', label: 'Isometric Strength',            unit: 'N/kg',        bilateral: false },
  { key: 'hamstringStrength', label: 'Hamstring Strength',            unit: 'N/kg',        bilateral: true  },
  { key: 'gripStrength',      label: 'Grip Strength',                 unit: 'kg',          bilateral: true  },
  { key: 'sprintSplits',      label: 'Sprint Splits (10m)',           unit: 's',           bilateral: false },
  { key: 'agility505',        label: '505 Agility',                   unit: 's',           bilateral: true  },
  { key: 'bleepTest',         label: 'Bleep Test (VO2max)',           unit: 'ml/kg/min',   bilateral: false },
  ...ALL_METRICS.filter(m => !['cmjHeight','dsi','rsi105','imtpPeakForce','hamstringStrength'].includes(m.key))
    .map(m => ({ key: m.key, label: m.label, unit: m.unit || '', bilateral: m.bilateral || false })),
];

const CSV_LABEL_MAP = Object.fromEntries(
  PERF_TESTS.map(t => [t.label.toLowerCase(), t])
);

function buildCSVPayload(test, side, value) {
  const v = parseFloat(value);
  if (isNaN(v)) return null;
  if (test.bilateral) {
    const left  = (side === 'Left'  || side === 'Both') ? v : null;
    const right = (side === 'Right' || side === 'Both') ? v : null;
    return { L: left, R: right };
  }
  return { value: v };
}

function processCSV(text, athletes) {
  const idMap = new Map();
  athletes.forEach(a => {
    idMap.set(buildAthleteId(a.name, a.dob).toLowerCase(), a.id);
    idMap.set(a.name.toLowerCase(), a.id);
  });

  const lines = text.trim().split(/\r?\n/);
  if (lines.length < 2) return { toSave: [], added: 0, skipped: 0, reasons: [] };

  const headers = lines[0].split(',').map(h => h.trim().replace(/^"|"$/g, '').toLowerCase());
  const col = (row, name) => {
    const i = headers.indexOf(name);
    return i >= 0 ? (row[i] || '').trim().replace(/^"|"$/g, '') : '';
  };

  let added = 0, skipped = 0;
  const toSave = [], reasons = [];

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim(); if (!line) continue;
    const row = line.split(',').map(v => v.trim().replace(/^"|"$/g, ''));
    const athleteIdRaw = col(row, 'athlete id');
    const testName     = col(row, 'test name');
    const sideRaw      = col(row, 'side');
    const valueStr     = col(row, 'value');
    const date         = col(row, 'date');

    if (!athleteIdRaw || !testName || !date) { skipped++; reasons.push(`Row ${i+1}: missing Athlete ID, Test Name or Date`); continue; }
    const athleteId = idMap.get(athleteIdRaw.toLowerCase());
    if (!athleteId) { skipped++; reasons.push(`Row ${i+1}: athlete "${athleteIdRaw}" not found`); continue; }
    const value = parseFloat(valueStr);
    if (isNaN(value)) { skipped++; reasons.push(`Row ${i+1}: invalid value "${valueStr}"`); continue; }
    const test = CSV_LABEL_MAP[testName.toLowerCase()];
    if (!test) { skipped++; reasons.push(`Row ${i+1}: unknown test name "${testName}"`); continue; }
    const side    = sideRaw ? sideRaw.charAt(0).toUpperCase() + sideRaw.slice(1).toLowerCase() : 'Both';
    const payload = buildCSVPayload(test, side, value);
    if (!payload) { skipped++; reasons.push(`Row ${i+1}: could not build entry`); continue; }
    toSave.push({ athleteId, date, metricKey: test.key, payload });
    added++;
  }
  return { toSave, added, skipped, reasons };
}

function downloadTemplate(athletes, customMetrics = {}) {
  // Build ordered column list from METRIC_CATEGORIES then custom metrics
  const metricCols = [];
  METRIC_CATEGORIES.forEach(cat => {
    cat.metrics.forEach(m => {
      if (m.bilateral) {
        metricCols.push({ header: `${m.label} (L)` });
        metricCols.push({ header: `${m.label} (R)` });
      } else {
        metricCols.push({ header: m.label });
      }
    });
  });
  // Custom metrics grouped by category label in insertion order
  Object.values(customMetrics).forEach(m => {
    if (m.bilateral) {
      metricCols.push({ header: `${m.label} (L)` });
      metricCols.push({ header: `${m.label} (R)` });
    } else {
      metricCols.push({ header: m.label });
    }
  });

  const fixedHeaders = ['Athlete ID', 'Athlete Name', 'Sport', 'Date'];
  const allHeaders   = [...fixedHeaders, ...metricCols.map(c => c.header)];

  // Wrap each header in quotes to safely handle commas
  const headerRow = allHeaders.map(h => `"${h}"`).join(',');
  // One empty example row
  const emptyRow  = allHeaders.map(() => '').join(',');

  const blob = new Blob([headerRow + '\n' + emptyRow + '\n'], { type: 'text/csv' });
  const url  = URL.createObjectURL(blob);
  const a    = Object.assign(document.createElement('a'), { href: url, download: 'propath_template.csv' });
  a.click();
  URL.revokeObjectURL(url);
}

function ImportSummaryModal({ summary, onClose }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ backgroundColor: 'rgba(0,0,0,0.45)' }}>
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-sm mx-4 p-6">
        <h3 className="font-bold text-gray-900 text-sm mb-4">Import Complete</h3>
        <div className="space-y-2.5 mb-4">
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Rows imported</span>
            <span className="font-bold" style={{ color: '#15803d' }}>{summary.added}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Rows skipped</span>
            <span className="font-bold" style={{ color: summary.skipped ? '#b45309' : '#6b7280' }}>{summary.skipped}</span>
          </div>
        </div>
        {summary.skipped > 0 && (
          <div className="p-3 rounded text-xs text-amber-800 space-y-1 mb-4" style={{ backgroundColor: '#fffbeb' }}>
            {summary.reasons.map((r, i) => <p key={i}>{r}</p>)}
          </div>
        )}
        <button onClick={onClose}
          className="w-full py-2 text-sm font-semibold text-white rounded-lg hover:opacity-90"
          style={{ backgroundColor: GOLD }}>Done</button>
      </div>
    </div>
  );
}

// ── Main component ─────────────────────────────────────────────────────────────
export default function PhysicalMobilitySheet({ athletes, syncSessionData, onUpdateEntry }) {
  const { sessions, createSession, upsertSession, markSaved, getSession, deleteSession } = useSessions();
  const { customMetrics, addCustomMetric } = useCustomMetrics();

  const [subTab,        setSubTab]        = useState('entry'); // 'entry' | 'storage'
  const [view,          setView]          = useState('log');   // 'log' | 'create' | 'session'
  const [activeSession, setActiveSession] = useState(null);
  const [sessionRO,     setSessionRO]     = useState(false);
  const [importSummary, setImportSummary] = useState(null);
  const csvInputRef = useRef();

  const openSession = (id, readOnly = false) => {
    const s = getSession(id);
    if (!s) return;
    setActiveSession(s);
    setSessionRO(readOnly);
    setView('session');
  };

  const handleCreated = (formData) => {
    const s = createSession(formData);
    setActiveSession(s);
    setSessionRO(false);
    setView('session');
  };

  const handleSaveSession = (updatedSession) => {
    // Merge global custom metrics so syncSessionData has full metric definitions
    const sessionWithCustom = {
      ...updatedSession,
      customMetrics: { ...customMetrics, ...updatedSession.customMetrics },
    };
    upsertSession(sessionWithCustom);
    markSaved(sessionWithCustom.id);
    syncSessionData?.(sessionWithCustom);
    setActiveSession({ ...sessionWithCustom, savedAt: new Date().toISOString() });
  };

  const handleDeleteSession = (id) => {
    if (!window.confirm('Delete this session? Athlete profile data already synced will remain.')) return;
    deleteSession(id);
  };

  const handleCSVImport = e => {
    const file = e.target.files[0]; if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => {
      const { toSave, added, skipped, reasons } = processCSV(ev.target.result, athletes);
      if (toSave.length > 0) {
        const dates       = [...new Set(toSave.map(r => r.date))].sort();
        const athleteIds  = [...new Set(toSave.map(r => r.athleteId))];
        const metricKeys  = [...new Set(toSave.map(r => r.metricKey))];
        const sessionDate = dates[0] || new Date().toISOString().slice(0, 10);
        const data = {};
        toSave.forEach(({ athleteId, metricKey, payload }) => {
          if (!data[athleteId]) data[athleteId] = {};
          data[athleteId][metricKey] = { ...(data[athleteId][metricKey] || {}), ...payload };
        });
        const csvSession = {
          id: `csv_${Date.now()}`,
          date: sessionDate,
          label: 'CSV Import',
          athleteIds,
          metricKeys,
          metricOrder: metricKeys,
          customMetrics: {},
          data,
          savedAt: new Date().toISOString(),
          createdAt: new Date().toISOString(),
        };
        upsertSession(csvSession);
        syncSessionData?.(csvSession);
      }
      setImportSummary({ added, skipped, reasons });
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  return (
    <div className="flex flex-col h-full">
      {/* Sub-tab bar */}
      {view !== 'session' && (
        <div className="flex items-center gap-1 px-4 pt-3 pb-0 bg-white border-b border-gray-200 shrink-0">
          {[{ key: 'entry', label: 'Data Entry' }, { key: 'storage', label: 'Data Storage' }].map(t => (
            <button
              key={t.key}
              onClick={() => setSubTab(t.key)}
              className="px-4 py-2 text-sm font-medium rounded-t transition-colors border-b-2"
              style={subTab === t.key
                ? { color: GOLD, borderColor: GOLD }
                : { color: '#6b7280', borderColor: 'transparent' }}
            >
              {t.label}
            </button>
          ))}
        </div>
      )}

      {/* Data Storage sub-tab */}
      {view !== 'session' && subTab === 'storage' && (
        <DataStorageTable athletes={athletes} sessions={sessions} customMetrics={customMetrics} />
      )}

      {/* Toolbar — shown for log and create views in entry sub-tab */}
      {view !== 'session' && subTab === 'entry' && (
        <div className="flex items-center justify-between px-4 py-2 border-b border-gray-200 bg-white shrink-0">
          <span className="text-sm font-semibold text-gray-700">Testing Sessions</span>
          <div className="flex items-center gap-2">
            <button onClick={() => downloadTemplate(athletes, customMetrics)}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs border border-gray-300 rounded text-gray-600 hover:bg-gray-50">
              <Download size={12} /> Template
            </button>
            <label className="flex items-center gap-1.5 px-3 py-1.5 text-xs border border-gray-300 rounded text-gray-600 hover:bg-gray-50 cursor-pointer">
              <Upload size={12} /> Import CSV
              <input ref={csvInputRef} type="file" accept=".csv,text/csv" className="hidden" onChange={handleCSVImport} />
            </label>
            <button
              onClick={() => setView('create')}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white rounded hover:opacity-90"
              style={{ backgroundColor: GOLD }}>
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
                <path d="M6 1v10M1 6h10" stroke="white" strokeWidth="1.8" strokeLinecap="round"/>
              </svg>
              New Session
            </button>
          </div>
        </div>
      )}

      {/* Views — entry sub-tab only */}
      {subTab === 'entry' && view === 'log' && (
        <SessionLog
          sessions={sessions}
          athletes={athletes}
          onOpen={openSession}
          onNew={() => setView('create')}
          onDelete={handleDeleteSession}
        />
      )}

      {subTab === 'entry' && view === 'create' && (
        <NewSessionForm
          athletes={athletes}
          onCreated={handleCreated}
          onCancel={() => setView('log')}
          globalCustomMetrics={customMetrics}
          onAddCustomMetric={addCustomMetric}
        />
      )}

      {view === 'session' && activeSession && (
        <SessionTable
          session={activeSession}
          athletes={athletes}
          onSaveSession={handleSaveSession}
          onBack={() => setView('log')}
          readOnly={sessionRO}
        />
      )}

      {importSummary && (
        <ImportSummaryModal summary={importSummary} onClose={() => setImportSummary(null)} />
      )}
    </div>
  );
}
