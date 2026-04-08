import { useState, Fragment } from 'react';
import { X } from 'lucide-react';
import { MOBILITY_NORMS } from '../../data/referenceData';

function todayStr() {
  return new Date().toISOString().slice(0, 10);
}

// ─── Joint groups & movements ────────────────────────────────────────────────
const JOINT_GROUPS = [
  {
    key: 'shoulder', label: 'Shoulder',
    movements: [
      { key: 'shoulderFlexion',   label: 'Flexion'            },
      { key: 'shoulderExtension', label: 'Extension'          },
      { key: 'shoulderIR',        label: 'Internal Rotation'  },
      { key: 'shoulderER',        label: 'External Rotation'  },
    ],
  },
  {
    key: 'hip', label: 'Hip',
    movements: [
      { key: 'hipFlexion',   label: 'Flexion'           },
      { key: 'hipExtension', label: 'Extension'         },
      { key: 'hipIR',        label: 'Internal Rotation' },
      { key: 'hipER',        label: 'External Rotation' },
    ],
  },
  {
    key: 'knee', label: 'Knee',
    movements: [
      { key: 'kneeFlexion',   label: 'Flexion'   },
      { key: 'kneeExtension', label: 'Extension' },
    ],
  },
  {
    key: 'ankle', label: 'Ankle',
    movements: [
      { key: 'ankleDorsiflexion',   label: 'Dorsiflexion'   },
      { key: 'anklePlantarFlexion', label: 'Plantarflexion' },
      { key: 'ankleInversion',      label: 'Inversion'      },
      { key: 'ankleEversion',       label: 'Eversion'       },
    ],
  },
];

// movement key → group key
const MOVEMENT_TO_GROUP = {};
JOINT_GROUPS.forEach(g => g.movements.forEach(m => { MOVEMENT_TO_GROUP[m.key] = g.key; }));

// ─── Colour coding ───────────────────────────────────────────────────────────
function getChangeStatus(change) {
  if (change === null || change === undefined) return 'grey';
  if (change >= -10) return 'green';
  if (change >= -20) return 'amber';
  return 'red';
}

const STATUS_COLORS = {
  green: { dot: '#22c55e', text: '#15803d', badge: '#dcfce7' },
  amber: { dot: '#f59e0b', text: '#92400e', badge: '#fef3c7' },
  red:   { dot: '#ef4444', text: '#b91c1c', badge: '#fee2e2' },
  grey:  { dot: '#d1d5db', text: '#6b7280', badge: '#f3f4f6' },
};

// ─── Data helpers ────────────────────────────────────────────────────────────
function getSideValues(entries, side) {
  const field = side === 'L' ? 'left' : 'right';
  const mostRecent      = entries.length >= 1 ? (entries[0]?.[field] ?? null) : null;
  const lastMeasurement = entries.length >= 2 ? (entries[1]?.[field] ?? null) : null;
  const initialScreen   = entries.length >= 1 ? (entries[entries.length - 1]?.[field] ?? null) : null;
  return { mostRecent, lastMeasurement, initialScreen };
}

function calcChange(mostRecent, initialScreen) {
  if (mostRecent === null || initialScreen === null || initialScreen === 0) return null;
  return ((mostRecent - initialScreen) / initialScreen) * 100;
}

// Worst status across all movements (both sides) in a group
function groupStatus(group, entries) {
  const priority = { red: 0, amber: 1, green: 2, grey: 3 };
  const statuses = group.movements.flatMap(m => {
    const es = entries[m.key] || [];
    return ['L', 'R'].map(side => {
      const { mostRecent, initialScreen } = getSideValues(es, side);
      return getChangeStatus(calcChange(mostRecent, initialScreen));
    });
  });
  return statuses.sort((a, b) => priority[a] - priority[b])[0] || 'grey';
}

// ─── Anatomical silhouette SVG ───────────────────────────────────────────────
// viewBox "0 0 100 270"
// Overlapping filled shapes — same colour → seamless silhouette
const C  = '#ddd8d2';   // fill
const SB = '#c8c2bc';   // subtle stroke
const SW = '0.7';

function Silhouette() {
  return (
    <>
      {/* Head */}
      <ellipse cx="50" cy="20" rx="15" ry="18" fill={C} stroke={SB} strokeWidth={SW} />

      {/* Neck bridge */}
      <rect x="43" y="35" width="14" height="15" fill={C} />

      {/* Torso — wider at shoulders & hips, narrower at waist */}
      <path
        d="M 20,49 C 19,50 18,52 18,56 L 20,76 C 21,90 22,98 22,106
           C 22,114 21,120 20,124 L 22,128 L 40,132 L 60,132 L 78,128
           L 80,124 C 79,120 78,114 78,106 C 78,98 79,90 80,76
           L 82,56 C 82,52 81,50 80,49 Z"
        fill={C} stroke={SB} strokeWidth={SW}
      />

      {/* Left arm */}
      <path
        d="M 20,50 C 17,50 13,53 11,57 L 8,112 L 8,148 C 8,153 10,156 13,157
           C 15,158 18,157 19,154 L 19,148 L 19,112 L 22,57 Z"
        fill={C} stroke={SB} strokeWidth={SW}
      />

      {/* Right arm */}
      <path
        d="M 80,50 C 83,50 87,53 89,57 L 92,112 L 92,148 C 92,153 90,156 87,157
           C 85,158 82,157 81,154 L 81,148 L 81,112 L 78,57 Z"
        fill={C} stroke={SB} strokeWidth={SW}
      />

      {/* Left upper leg */}
      <path
        d="M 22,130 L 20,130 C 18,132 18,136 18,140 L 18,192 L 20,198
           C 22,202 26,203 30,203 C 34,203 38,202 40,198 L 42,192
           L 42,140 C 42,136 42,132 40,130 Z"
        fill={C} stroke={SB} strokeWidth={SW}
      />

      {/* Right upper leg */}
      <path
        d="M 78,130 L 80,130 C 82,132 82,136 82,140 L 82,192 L 80,198
           C 78,202 74,203 70,203 C 66,203 62,202 60,198 L 58,192
           L 58,140 C 58,136 58,132 60,130 Z"
        fill={C} stroke={SB} strokeWidth={SW}
      />

      {/* Left lower leg */}
      <path
        d="M 18,200 L 18,248 C 18,252 20,254 24,255 L 36,255
           C 40,254 42,252 42,248 L 42,200 Z"
        fill={C} stroke={SB} strokeWidth={SW}
      />

      {/* Right lower leg */}
      <path
        d="M 82,200 L 82,248 C 82,252 80,254 76,255 L 64,255
           C 60,254 58,252 58,248 L 58,200 Z"
        fill={C} stroke={SB} strokeWidth={SW}
      />

      {/* Left foot */}
      <ellipse cx="27" cy="259" rx="13" ry="5" fill={C} stroke={SB} strokeWidth={SW} />

      {/* Right foot */}
      <ellipse cx="73" cy="259" rx="13" ry="5" fill={C} stroke={SB} strokeWidth={SW} />
    </>
  );
}

// Dot positions for L and R of each joint group
const BODY_DOTS = [
  { group: 'shoulder', side: 'L', x: 14,  y: 56  },
  { group: 'shoulder', side: 'R', x: 86,  y: 56  },
  { group: 'hip',      side: 'L', x: 26,  y: 130 },
  { group: 'hip',      side: 'R', x: 74,  y: 130 },
  { group: 'knee',     side: 'L', x: 30,  y: 200 },
  { group: 'knee',     side: 'R', x: 70,  y: 200 },
  { group: 'ankle',    side: 'L', x: 27,  y: 254 },
  { group: 'ankle',    side: 'R', x: 73,  y: 254 },
];

function BodyMap({ groupStatuses, onGroupClick }) {
  return (
    <svg viewBox="0 0 100 270" width="100%" style={{ maxWidth: 160 }} aria-label="Anatomical body map">
      <Silhouette />
      {BODY_DOTS.map(({ group, side, x, y }) => {
        const status = groupStatuses[group] || 'grey';
        const color  = STATUS_COLORS[status].dot;
        return (
          <circle
            key={`${group}-${side}`}
            cx={x} cy={y} r={4.5}
            fill={color}
            stroke="white"
            strokeWidth="1.5"
            style={{ cursor: 'pointer', filter: 'drop-shadow(0 1px 3px rgba(0,0,0,0.2))' }}
            onClick={() => onGroupClick(group)}
          />
        );
      })}
    </svg>
  );
}

// ─── Group entry panel (modal) ────────────────────────────────────────────────
function GroupEntryModal({ group, onSave, onClose }) {
  const [date, setDate]   = useState(todayStr);
  const [notes, setNotes] = useState('');
  const [vals, setVals]   = useState(() => {
    const init = {};
    group.movements.forEach(m => { init[m.key] = { left: '', right: '' }; });
    return init;
  });

  const setVal = (key, side, v) =>
    setVals(prev => ({ ...prev, [key]: { ...prev[key], [side]: v } }));

  const handleSave = () => {
    group.movements.forEach(m => {
      const l = vals[m.key].left  !== '' ? Number(vals[m.key].left)  : null;
      const r = vals[m.key].right !== '' ? Number(vals[m.key].right) : null;
      if (l !== null || r !== null) {
        onSave(m.key, { date, left: l, right: r, notes: notes.trim() });
      }
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ backgroundColor: 'rgba(0,0,0,0.45)' }}>
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg mx-4 p-6 max-h-screen overflow-y-auto">

        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <h3 className="font-bold text-gray-900 text-base">{group.label} — Add Measurements</h3>
          <button onClick={onClose}
            className="p-1.5 rounded hover:bg-gray-100 text-gray-400 transition-colors">
            <X size={16} />
          </button>
        </div>

        <div className="space-y-4">
          {/* Date */}
          <div>
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide block mb-1">
              Session Date
            </label>
            <input type="date" value={date} onChange={e => setDate(e.target.value)}
              className="w-full text-sm border border-gray-200 rounded px-3 py-2 focus:outline-none focus:ring-2 bg-white"
              style={{ '--tw-ring-color': '#A58D69' }} />
          </div>

          {/* Movements grid */}
          <div>
            <div className="grid mb-2" style={{ gridTemplateColumns: '1fr 90px 90px' }}>
              <div className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Movement</div>
              <div className="text-xs font-semibold text-gray-400 uppercase tracking-wide text-center">Left (°)</div>
              <div className="text-xs font-semibold text-gray-400 uppercase tracking-wide text-center">Right (°)</div>
            </div>
            <div className="divide-y divide-gray-50">
              {group.movements.map(m => (
                <div key={m.key} className="grid py-2 items-center gap-2"
                  style={{ gridTemplateColumns: '1fr 90px 90px' }}>
                  <span className="text-sm text-gray-700">{m.label}</span>
                  <input
                    type="number"
                    value={vals[m.key].left}
                    onChange={e => setVal(m.key, 'left', e.target.value)}
                    placeholder="—"
                    className="text-sm border border-gray-200 rounded px-2 py-1.5 text-center focus:outline-none focus:ring-1 bg-white w-full"
                    style={{ '--tw-ring-color': '#A58D69' }}
                  />
                  <input
                    type="number"
                    value={vals[m.key].right}
                    onChange={e => setVal(m.key, 'right', e.target.value)}
                    placeholder="—"
                    className="text-sm border border-gray-200 rounded px-2 py-1.5 text-center focus:outline-none focus:ring-1 bg-white w-full"
                    style={{ '--tw-ring-color': '#A58D69' }}
                  />
                </div>
              ))}
            </div>
            <p className="text-xs text-gray-400 mt-2">Leave blank to keep existing values unchanged.</p>
          </div>

          {/* Notes */}
          <div>
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide block mb-1">
              Session Notes <span className="font-normal text-gray-300 normal-case tracking-normal">(optional)</span>
            </label>
            <textarea rows={2} value={notes} onChange={e => setNotes(e.target.value)}
              placeholder="Clinical observations or context…"
              className="w-full text-sm border border-gray-200 rounded px-3 py-2 resize-none focus:outline-none focus:ring-2 placeholder-gray-300 bg-white"
              style={{ '--tw-ring-color': '#A58D69' }} />
          </div>
        </div>

        <div className="flex gap-3 mt-5">
          <button onClick={handleSave}
            className="px-5 py-2 text-sm font-semibold text-white rounded-lg hover:opacity-90 transition-opacity"
            style={{ backgroundColor: '#A58D69' }}>
            Save
          </button>
          <button onClick={onClose} className="px-4 py-2 text-sm text-gray-500 hover:text-gray-700 transition-colors">
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Change badge ─────────────────────────────────────────────────────────────
function ChangeBadge({ change, status }) {
  if (change === null) return <span className="text-gray-300 text-xs">—</span>;
  const { badge, text } = STATUS_COLORS[status];
  const sign = change > 0 ? '+' : '';
  return (
    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold"
      style={{ backgroundColor: badge, color: text }}>
      {sign}{change.toFixed(1)}%
    </span>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────
export default function MobilityTab({ entries = {}, onAddEntry }) {
  const [activeGroup, setActiveGroup] = useState(null);

  // Compute group statuses for body map dot colours
  const groupStatuses = {};
  JOINT_GROUPS.forEach(g => { groupStatuses[g.key] = groupStatus(g, entries); });

  const activeGroupObj = activeGroup ? JOINT_GROUPS.find(g => g.key === activeGroup) : null;

  const handleRowClick = movementKey => setActiveGroup(MOVEMENT_TO_GROUP[movementKey]);

  const handleSave = (movKey, entryData) => onAddEntry(movKey, entryData);

  return (
    <div className="space-y-4">
      {/* Legend */}
      <div className="flex items-center gap-5 flex-wrap">
        <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Change from baseline:</span>
        {[
          { status: 'green', label: '≤10% decline / improved' },
          { status: 'amber', label: '11–20% decline'          },
          { status: 'red',   label: '>20% decline'            },
          { status: 'grey',  label: 'No data'                 },
        ].map(({ status, label }) => (
          <div key={status} className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: STATUS_COLORS[status].dot }} />
            <span className="text-xs text-gray-600">{label}</span>
          </div>
        ))}
      </div>

      {/* 60/40 layout */}
      <div style={{ display: 'flex', gap: 20, alignItems: 'stretch' }}>

        {/* Table — 60% */}
        <div style={{ flex: '3 1 0', minWidth: 0 }}>
          <div className="bg-white rounded-xl border border-gray-100 overflow-hidden h-full flex flex-col">
            <div className="overflow-x-auto flex-1">
              <table className="w-full text-xs border-collapse" style={{ minWidth: 580 }}>
                <thead>
                  <tr style={{ backgroundColor: '#f9fafb' }}>
                    <th className="text-left px-3 py-2.5 font-semibold text-gray-500 border-b border-gray-100 whitespace-nowrap">Movement</th>
                    <th className="text-center px-2 py-2.5 font-semibold text-gray-500 border-b border-gray-100">Side</th>
                    <th className="text-center px-2 py-2.5 font-semibold text-gray-500 border-b border-gray-100 whitespace-nowrap">Global Norm (°)</th>
                    <th className="text-center px-2 py-2.5 font-semibold text-gray-500 border-b border-gray-100 whitespace-nowrap">Initial Screen</th>
                    <th className="text-center px-2 py-2.5 font-semibold text-gray-500 border-b border-gray-100 whitespace-nowrap">Last Measurement</th>
                    <th className="text-center px-2 py-2.5 font-semibold text-gray-500 border-b border-gray-100 whitespace-nowrap">Most Recent</th>
                    <th className="text-center px-3 py-2.5 font-semibold text-gray-500 border-b border-gray-100 whitespace-nowrap">Change from Baseline</th>
                  </tr>
                </thead>
                <tbody>
                  {JOINT_GROUPS.map(group => (
                    <Fragment key={group.key}>
                      {/* Group header row */}
                      <tr>
                        <td colSpan={7}
                          className="px-3 py-1.5 text-xs font-bold uppercase tracking-wider border-b border-gray-100"
                          style={{ color: '#6b7280', backgroundColor: '#f9fafb' }}>
                          {group.label}
                        </td>
                      </tr>

                      {group.movements.flatMap((m, mIdx) => {
                        const norm         = MOBILITY_NORMS[m.key];
                        const jointEntries = entries[m.key] || [];
                        const isEven       = mIdx % 2 === 0;

                        return ['L', 'R'].map(side => {
                          const { mostRecent, lastMeasurement, initialScreen } = getSideValues(jointEntries, side);
                          const change = calcChange(mostRecent, initialScreen);
                          const status = getChangeStatus(change);
                          const colors = STATUS_COLORS[status];

                          return (
                            <tr
                              key={`${m.key}-${side}`}
                              className="hover:bg-amber-50 cursor-pointer transition-colors"
                              style={{ backgroundColor: isEven ? 'white' : '#fafafa' }}
                              onClick={() => handleRowClick(m.key)}
                            >
                              <td className="px-3 py-2 text-gray-700 font-medium whitespace-nowrap">
                                {side === 'L' ? m.label : ''}
                              </td>
                              <td className="px-2 py-2 text-center">
                                <span className="inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold"
                                  style={{ backgroundColor: colors.badge, color: colors.text }}>
                                  {side}
                                </span>
                              </td>
                              <td className="px-2 py-2 text-center text-gray-500">
                                {norm ? `≥${norm.low}°` : '—'}
                              </td>
                              <td className="px-2 py-2 text-center text-gray-600">
                                {initialScreen !== null ? `${initialScreen}°` : <span className="text-gray-300">—</span>}
                              </td>
                              <td className="px-2 py-2 text-center text-gray-600">
                                {lastMeasurement !== null ? `${lastMeasurement}°` : <span className="text-gray-300">—</span>}
                              </td>
                              <td className="px-2 py-2 text-center font-semibold"
                                style={{ color: mostRecent !== null ? colors.text : '#d1d5db' }}>
                                {mostRecent !== null ? `${mostRecent}°` : '—'}
                              </td>
                              <td className="px-3 py-2 text-center">
                                <ChangeBadge change={change} status={status} />
                              </td>
                            </tr>
                          );
                        });
                      })}
                    </Fragment>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="text-xs text-gray-400 px-3 py-2 border-t border-gray-50 shrink-0">
              Click any row or body map dot to add measurements.
            </p>
          </div>
        </div>

        {/* Body map — 40%, vertically centred */}
        <div style={{ flex: '2 1 0', display: 'flex' }}>
          <div className="bg-white rounded-xl border border-gray-100 flex-1 flex flex-col items-center justify-center gap-4 p-6">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide self-stretch text-center">
              Body Map
            </p>
            <BodyMap groupStatuses={groupStatuses} onGroupClick={setActiveGroup} />
            <p className="text-xs text-gray-400 text-center leading-relaxed">
              Click a joint dot to add measurements for that joint.
            </p>
          </div>
        </div>

      </div>

      {/* Group entry modal */}
      {activeGroup && activeGroupObj && (
        <GroupEntryModal
          group={activeGroupObj}
          onSave={handleSave}
          onClose={() => setActiveGroup(null)}
        />
      )}
    </div>
  );
}
