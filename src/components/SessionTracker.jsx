import { useState, useMemo } from 'react';
import { Plus, X, Pencil, Trash2, Settings2, ArrowUpRight, ChevronRight } from 'lucide-react';
import { useProviders } from '../hooks/useProviders';

const GOLD = '#A58D69';

// ── Pillar metadata ────────────────────────────────────────────────────────────
const PILLAR_META = {
  psych:     { label: 'Psychological',   bg: '#faf5ff', text: '#7e22ce', tab: 'rag-psych',    domain: 'psych'     },
  nutrition: { label: 'Nutritional',     bg: '#f0fdf4', text: '#15803d', tab: 'rag-nutrition', domain: 'nutrition' },
  physio:    { label: 'Physio Assess.',  bg: '#eff6ff', text: '#1d4ed8', tab: 'physio',        domain: null        },
};
const SELECTABLE_PILLARS = Object.keys(PILLAR_META);

// ── Helpers ────────────────────────────────────────────────────────────────────
function normName(s) { return (s || '').trim().toLowerCase(); }

function fmtDate(d) {
  if (!d) return '—';
  return new Date(d + 'T12:00:00').toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: '2-digit' });
}

function fmtDateRange(start, end) {
  return `${fmtDate(start)} – ${fmtDate(end)}`;
}

function getDateBounds(period, customStart, customEnd) {
  const today = new Date().toISOString().slice(0, 10);
  if (period === 'week') {
    const d = new Date(); d.setDate(d.getDate() - 6);
    return { start: d.toISOString().slice(0, 10), end: today };
  }
  if (period === 'month') {
    const d = new Date(); d.setDate(d.getDate() - 29);
    return { start: d.toISOString().slice(0, 10), end: today };
  }
  return { start: customStart || '', end: customEnd || today };
}

// ── Session extraction (Psych + Nutrition RAG logs + Physio entries) ──────────
function extractAllSessions(athletes) {
  const out = [];
  athletes.forEach(ath => {
    ['psych', 'nutrition'].forEach(domain => {
      (ath.ragLog?.[domain] || []).forEach(entry => {
        if (!entry.staff) return;
        out.push({
          id:          entry.id,
          athleteId:   ath.id,
          athleteName: ath.name,
          domain,
          staff:       entry.staff,
          date:        entry.timestamp ? entry.timestamp.split('T')[0] : null,
          noteType:    entry.entryType || 'General note',
          note:        entry.note || '',
        });
      });
    });
    (ath.phase2?.physio?.entries || []).forEach(entry => {
      const staff = entry.assessor || entry.staff;
      if (!staff) return;
      out.push({
        id:          entry.id,
        athleteId:   ath.id,
        athleteName: ath.name,
        domain:      'physio',
        staff,
        date:        entry.date || null,
        noteType:    entry.noteType || 'Screen',
        note:        entry.notes || '',
      });
    });
  });
  return out;
}

// ── Small UI pieces ────────────────────────────────────────────────────────────
function PillarTag({ domain, small }) {
  const m = PILLAR_META[domain];
  if (!m) return null;
  return (
    <span style={{
      backgroundColor: m.bg, color: m.text,
      fontSize: small ? 9 : 10, fontWeight: 700,
      padding: small ? '1px 5px' : '2px 7px',
      borderRadius: 4, whiteSpace: 'nowrap',
    }}>
      {m.label}
    </span>
  );
}

function AccessBadge({ level }) {
  const isExt = level === 'external';
  return (
    <span style={{
      fontSize: 9, fontWeight: 700, padding: '1px 5px', borderRadius: 3, whiteSpace: 'nowrap',
      backgroundColor: isExt ? '#fef3c7' : '#f0fdf4',
      color: isExt ? '#92400e' : '#15803d',
    }}>
      {isExt ? 'EXTERNAL' : 'INTERNAL'}
    </span>
  );
}

// ── Provider form (add / edit) ─────────────────────────────────────────────────
function ProviderForm({ initial, onSave, onCancel }) {
  const blank = { name: '', pillars: [], sessionRate: '', accessLevel: 'internal' };
  const [form, setForm] = useState(() => initial ? { ...blank, ...initial, pillars: initial.pillars || [] } : blank);

  const togglePillar = (p) =>
    setForm(f => ({ ...f, pillars: f.pillars.includes(p) ? f.pillars.filter(x => x !== p) : [...f.pillars, p] }));

  const canSave = form.name.trim() && form.pillars.length > 0;

  const handleSave = () => {
    if (!canSave) return;
    onSave({
      ...form,
      name: form.name.trim(),
      sessionRate: form.sessionRate === '' ? null : parseFloat(form.sessionRate),
    });
  };

  return (
    <div className="space-y-3 p-4 bg-gray-50 rounded-xl border border-gray-100">
      <p className="text-xs font-bold text-gray-700 uppercase tracking-wide">
        {initial ? 'Edit Provider' : 'New Provider'}
      </p>

      <div>
        <label className="text-xs font-semibold text-gray-500 block mb-1">Name *</label>
        <input type="text" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
          placeholder="e.g. Dr. Sarah Kamal"
          className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:border-amber-400" />
      </div>

      <div>
        <label className="text-xs font-semibold text-gray-500 block mb-1.5">Pillars *</label>
        <div className="flex flex-wrap gap-2">
          {SELECTABLE_PILLARS.map(p => {
            const m   = PILLAR_META[p];
            const on  = form.pillars.includes(p);
            return (
              <label key={p} className="flex items-center gap-1.5 cursor-pointer" style={{ fontSize: 12 }}>
                <input type="checkbox" checked={on} onChange={() => togglePillar(p)} className="accent-amber-600" />
                <span style={{ color: on ? m.text : '#9ca3af', fontWeight: on ? 600 : 400 }}>{m.label}</span>
              </label>
            );
          })}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-xs font-semibold text-gray-500 block mb-1">
            Session Rate <span className="font-normal text-gray-400">(optional)</span>
          </label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs">$</span>
            <input type="number" min="0" step="0.01"
              value={form.sessionRate}
              onChange={e => setForm(f => ({ ...f, sessionRate: e.target.value }))}
              placeholder="0.00"
              className="w-full text-sm border border-gray-200 rounded-lg pl-6 pr-3 py-2 focus:outline-none focus:border-amber-400" />
          </div>
        </div>
        <div>
          <label className="text-xs font-semibold text-gray-500 block mb-1">Access Level</label>
          <div className="flex gap-3 mt-2">
            {['internal', 'external'].map(lvl => (
              <label key={lvl} className="flex items-center gap-1.5 cursor-pointer text-xs font-medium text-gray-600">
                <input type="radio" name="accessLevel" value={lvl} checked={form.accessLevel === lvl}
                  onChange={() => setForm(f => ({ ...f, accessLevel: lvl }))} className="accent-amber-600" />
                {lvl.charAt(0).toUpperCase() + lvl.slice(1)}
              </label>
            ))}
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2 pt-1">
        <button onClick={handleSave} disabled={!canSave}
          className="px-4 py-2 text-xs font-semibold text-white rounded-lg hover:opacity-90 disabled:opacity-40"
          style={{ backgroundColor: GOLD }}>
          {initial ? 'Update' : 'Add Provider'}
        </button>
        <button onClick={onCancel} className="text-xs text-gray-400 hover:text-gray-700">Cancel</button>
      </div>
    </div>
  );
}

// ── Provider management panel ──────────────────────────────────────────────────
function ProviderPanel({ providers, onAdd, onUpdate, onDelete, onClose }) {
  const [editing, setEditing] = useState(null); // provider id | 'new' | null
  const editingProvider = providers.find(p => p.id === editing);

  return (
    <div className="w-80 shrink-0 border-l border-gray-200 bg-white flex flex-col overflow-hidden">
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 shrink-0">
        <p className="text-sm font-bold text-gray-800">Manage Providers</p>
        <button onClick={onClose} className="text-gray-400 hover:text-gray-700"><X size={16} /></button>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3">
        {providers.length === 0 && editing !== 'new' && (
          <p className="text-xs text-gray-400 italic text-center py-6">No providers yet.</p>
        )}

        {providers.map(p => (
          editing === p.id ? (
            <ProviderForm key={p.id} initial={p}
              onSave={updated => { onUpdate({ ...p, ...updated }); setEditing(null); }}
              onCancel={() => setEditing(null)} />
          ) : (
            <div key={p.id} className="bg-white border border-gray-100 rounded-xl px-3 py-3 space-y-1.5"
              style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-gray-800 leading-tight truncate">{p.name}</p>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {(p.pillars || []).map(pl => <PillarTag key={pl} domain={pl} small />)}
                    <AccessBadge level={p.accessLevel} />
                  </div>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <button onClick={() => setEditing(p.id)} className="p-1 text-gray-300 hover:text-gray-600 rounded">
                    <Pencil size={13} />
                  </button>
                  <button onClick={() => { if (window.confirm(`Remove ${p.name}?`)) onDelete(p.id); }}
                    className="p-1 text-gray-300 hover:text-red-400 rounded">
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>
              {p.sessionRate != null && (
                <p className="text-xs text-gray-400">${p.sessionRate.toFixed(2)} / session</p>
              )}
            </div>
          )
        ))}

        {editing === 'new' && (
          <ProviderForm
            onSave={p => { onAdd(p); setEditing(null); }}
            onCancel={() => setEditing(null)} />
        )}
      </div>

      {editing !== 'new' && (
        <div className="shrink-0 px-4 py-3 border-t border-gray-100">
          <button onClick={() => setEditing('new')}
            className="flex items-center gap-2 w-full px-4 py-2 text-sm font-semibold text-white rounded-lg hover:opacity-90"
            style={{ backgroundColor: GOLD }}>
            <Plus size={14} /> Add Provider
          </button>
        </div>
      )}
    </div>
  );
}

// ── Drill-down modal ───────────────────────────────────────────────────────────
function DrillDownModal({ sessions, providerName, athleteName, dateRange, onNavigateToNote, onClose }) {
  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center px-4 pb-4 sm:pb-0"
      style={{ backgroundColor: 'rgba(0,0,0,0.45)' }}>
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-xl max-h-[80vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-start justify-between px-5 py-4 border-b border-gray-100 shrink-0">
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-sm font-bold text-gray-900">{providerName}</span>
              <ChevronRight size={13} className="text-gray-300" />
              <span className="text-sm font-semibold text-gray-700">{athleteName}</span>
            </div>
            <p className="text-xs text-gray-400 mt-0.5">{dateRange} · {sessions.length} session{sessions.length !== 1 ? 's' : ''}</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-700 mt-0.5"><X size={16} /></button>
        </div>

        {/* Session list */}
        <div className="flex-1 overflow-y-auto divide-y divide-gray-50">
          {sessions.length === 0 ? (
            <p className="text-sm text-gray-400 italic text-center py-10">No sessions in this period.</p>
          ) : (
            sessions
              .sort((a, b) => (b.date || '') > (a.date || '') ? 1 : -1)
              .map(s => (
                <div key={s.id} className="px-5 py-3.5 hover:bg-gray-50 transition-colors">
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2 flex-wrap min-w-0">
                      <span className="text-xs font-semibold text-gray-500 whitespace-nowrap">{fmtDate(s.date)}</span>
                      <PillarTag domain={s.domain} small />
                      <span className="text-xs text-gray-400">{s.noteType}</span>
                    </div>
                    {onNavigateToNote && (
                      <button onClick={() => { onNavigateToNote(s); onClose(); }}
                        className="flex items-center gap-1 text-xs font-semibold shrink-0 hover:opacity-75 transition-opacity"
                        style={{ color: GOLD }}>
                        View Note <ArrowUpRight size={12} />
                      </button>
                    )}
                  </div>
                  {s.note && (
                    <p className="text-xs text-gray-500 mt-1.5 leading-relaxed line-clamp-2">{s.note}</p>
                  )}
                </div>
              ))
          )}
        </div>
      </div>
    </div>
  );
}

// ── Period selector ────────────────────────────────────────────────────────────
function PeriodSelector({ period, setPeriod, customStart, setCustomStart, customEnd, setCustomEnd }) {
  return (
    <div className="flex items-center gap-2 flex-wrap">
      <div className="flex rounded-lg border border-gray-200 overflow-hidden">
        {[['week', 'Week'], ['month', 'Month'], ['custom', 'Custom']].map(([v, l]) => (
          <button key={v} onClick={() => setPeriod(v)}
            className="px-3 py-1.5 text-xs font-semibold transition-colors"
            style={{
              backgroundColor: period === v ? GOLD : '#fff',
              color: period === v ? '#fff' : '#6b7280',
              borderRight: v !== 'custom' ? '1px solid #e5e7eb' : 'none',
            }}>
            {l}
          </button>
        ))}
      </div>
      {period === 'custom' && (
        <div className="flex items-center gap-1.5">
          <input type="date" value={customStart} onChange={e => setCustomStart(e.target.value)}
            className="text-xs border border-gray-200 rounded px-2 py-1.5 focus:outline-none" />
          <span className="text-xs text-gray-400">–</span>
          <input type="date" value={customEnd} onChange={e => setCustomEnd(e.target.value)}
            className="text-xs border border-gray-200 rounded px-2 py-1.5 focus:outline-none" />
        </div>
      )}
    </div>
  );
}

function filterByPeriod(sessions, period, customStart, customEnd) {
  const { start, end } = getDateBounds(period, customStart, customEnd);
  if (!start && !end) return sessions;
  return sessions.filter(s => {
    if (!s.date) return false;
    if (start && s.date < start) return false;
    if (end && s.date > end) return false;
    return true;
  });
}

// ── Main SessionTracker ────────────────────────────────────────────────────────
export default function SessionTracker({ athletes, onNavigateToNote }) {
  const { providers, addProvider, updateProvider, deleteProvider } = useProviders();

  const [period,        setPeriod]        = useState('month');
  const [customStart,   setCustomStart]   = useState('');
  const [customEnd,     setCustomEnd]     = useState('');
  const [showPanel,     setShowPanel]     = useState(false);
  const [drillDown,     setDrillDown]     = useState(null); // { provider, athlete, sessions }
  const [viewAs,        setViewAs]        = useState('manager'); // 'manager' | provider.id

  // Extract sessions once per athletes change
  const allSessions = useMemo(() => extractAllSessions(athletes), [athletes]);

  // Date-filtered sessions
  const sessions = useMemo(
    () => filterByPeriod(allSessions, period, customStart, customEnd),
    [allSessions, period, customStart, customEnd],
  );

  const dateRange = useMemo(() => {
    const { start, end } = getDateBounds(period, customStart, customEnd);
    return fmtDateRange(start, end);
  }, [period, customStart, customEnd]);

  // View mode
  const viewingAsProvider = viewAs !== 'manager' ? providers.find(p => p.id === viewAs) : null;
  const isExternal        = !!viewingAsProvider && viewingAsProvider.accessLevel === 'external';

  // Providers to show in the grid
  const visibleProviders = viewingAsProvider ? [viewingAsProvider] : providers;

  // Athletes that appear in any session in the period (for columns)
  const gridAthletes = useMemo(() => {
    const providerNames = new Set(visibleProviders.map(p => normName(p.name)));
    const relevant      = sessions.filter(s => providerNames.has(normName(s.staff)));
    const seen          = new Map();
    relevant.forEach(s => { if (!seen.has(s.athleteId)) seen.set(s.athleteId, s.athleteName); });
    return [...seen.entries()].map(([id, name]) => ({ id, name })).sort((a, b) => a.name.localeCompare(b.name));
  }, [sessions, visibleProviders]);

  // Count sessions per provider per athlete
  const getCount = (providerName, athleteId) =>
    sessions.filter(s => normName(s.staff) === normName(providerName) && s.athleteId === athleteId).length;

  const getProviderTotal = (providerName) =>
    sessions.filter(s => normName(s.staff) === normName(providerName)).length;

  const getAthleteTotal = (athleteId) =>
    sessions.filter(s =>
      visibleProviders.some(p => normName(p.name) === normName(s.staff)) && s.athleteId === athleteId
    ).length;

  const grandTotal = visibleProviders.reduce((sum, p) => sum + getProviderTotal(p.name), 0);

  const openDrillDown = (provider, athlete) => {
    if (isExternal) return;
    const relevant = sessions.filter(
      s => normName(s.staff) === normName(provider.name) && s.athleteId === athlete.id
    );
    setDrillDown({ provider, athlete, sessions: relevant });
  };

  // Table styles
  const thBase = {
    fontSize: 10, fontWeight: 700, textTransform: 'uppercase',
    letterSpacing: '0.04em', color: '#6b7280', backgroundColor: '#f9fafb',
    border: '1px solid #e5e7eb', padding: '6px 10px', whiteSpace: 'nowrap',
    textAlign: 'center',
  };

  return (
    <div className="flex flex-col h-full overflow-hidden" style={{ backgroundColor: '#f4f5f7' }}>
      {/* Header */}
      <div className="shrink-0 bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-lg font-bold text-gray-900">Session Tracker</h1>
            <p className="text-xs text-gray-400 mt-0.5">
              Counts all logged notes in Psychological, Nutritional, and Physio Assessment pillars
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <PeriodSelector
              period={period} setPeriod={setPeriod}
              customStart={customStart} setCustomStart={setCustomStart}
              customEnd={customEnd} setCustomEnd={setCustomEnd}
            />

            {/* View as selector (only if providers exist) */}
            {providers.length > 0 && (
              <select value={viewAs} onChange={e => setViewAs(e.target.value)}
                className="text-xs border border-gray-200 rounded px-2 py-1.5 bg-white focus:outline-none text-gray-600">
                <option value="manager">Manager view (Internal)</option>
                {providers.map(p => (
                  <option key={p.id} value={p.id}>
                    View as: {p.name} ({p.accessLevel})
                  </option>
                ))}
              </select>
            )}

            {viewAs === 'manager' && (
              <button onClick={() => setShowPanel(v => !v)}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold border rounded-lg transition-colors"
                style={{
                  borderColor: showPanel ? GOLD : '#e5e7eb',
                  color: showPanel ? GOLD : '#6b7280',
                  backgroundColor: showPanel ? 'rgba(165,141,105,0.05)' : '#fff',
                }}>
                <Settings2 size={13} /> Manage Providers
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Body */}
      <div className="flex-1 flex overflow-hidden">

        {/* Grid area */}
        <div className="flex-1 overflow-auto p-4">
          {providers.length === 0 ? (
            /* Empty state */
            <div className="flex flex-col items-center justify-center h-full text-center py-24">
              <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mb-4">
                <Settings2 size={20} className="text-gray-300" />
              </div>
              <p className="text-sm font-medium text-gray-500 mb-1">No providers configured</p>
              <p className="text-xs text-gray-400 mb-5">Add providers to start tracking sessions.</p>
              <button onClick={() => setShowPanel(true)}
                className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white rounded-lg hover:opacity-90"
                style={{ backgroundColor: GOLD }}>
                <Plus size={14} /> Add First Provider
              </button>
            </div>
          ) : (
            <div className="bg-white rounded-xl border border-gray-100 overflow-auto"
              style={{ boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>

              {/* External view notice */}
              {isExternal && (
                <div className="px-5 py-3 border-b border-amber-100 bg-amber-50">
                  <p className="text-xs font-semibold text-amber-700">
                    External provider view — {viewingAsProvider.name} · Read-only summary
                  </p>
                </div>
              )}

              <table style={{ borderCollapse: 'collapse', width: '100%', minWidth: 400 }}>
                <thead>
                  <tr>
                    {/* Provider header */}
                    <th style={{
                      ...thBase, textAlign: 'left', minWidth: 200,
                      position: 'sticky', left: 0, zIndex: 10,
                    }}>
                      Provider
                    </th>
                    {/* Athlete columns */}
                    {gridAthletes.map(ath => (
                      <th key={ath.id} style={{ ...thBase, minWidth: 90 }}>
                        {ath.name.split(' ')[0]}
                        <div style={{ fontSize: 9, fontWeight: 400, color: '#9ca3af', textTransform: 'none', letterSpacing: 0 }}>
                          {ath.name.split(' ').slice(1).join(' ')}
                        </div>
                      </th>
                    ))}
                    {gridAthletes.length === 0 && (
                      <th style={{ ...thBase, color: '#d1d5db', fontStyle: 'italic', textTransform: 'none' }}>
                        No sessions in period
                      </th>
                    )}
                    {/* Total column */}
                    <th style={{ ...thBase, minWidth: 70, backgroundColor: '#f3f4f6', color: '#374151' }}>
                      Total
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {visibleProviders.map((prov, ri) => {
                    const rowBg = ri % 2 === 0 ? '#ffffff' : '#fafafa';
                    const total = getProviderTotal(prov.name);

                    return (
                      <tr key={prov.id} style={{ backgroundColor: rowBg }}>
                        {/* Provider info cell — sticky */}
                        <td style={{
                          padding: '10px 12px', border: '1px solid #f0f0f0',
                          position: 'sticky', left: 0, zIndex: 4,
                          backgroundColor: rowBg, minWidth: 200,
                        }}>
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <p style={{ fontSize: 13, fontWeight: 700, color: '#1f2937', lineHeight: 1.3 }}>
                                {prov.name}
                              </p>
                              <div className="flex flex-wrap gap-1 mt-1">
                                {(prov.pillars || []).map(pl => <PillarTag key={pl} domain={pl} small />)}
                              </div>
                            </div>
                            {!isExternal && <AccessBadge level={prov.accessLevel} />}
                          </div>
                        </td>

                        {/* Count cells */}
                        {gridAthletes.map(ath => {
                          const count     = getCount(prov.name, ath.id);
                          const clickable = !isExternal && count > 0;
                          return (
                            <td key={ath.id}
                              onClick={() => clickable && openDrillDown(prov, ath)}
                              style={{
                                padding: '10px 6px', textAlign: 'center',
                                border: '1px solid #f0f0f0',
                                fontSize: 14, fontWeight: 700,
                                backgroundColor: count > 0 ? 'rgba(165,141,105,0.07)' : rowBg,
                                color: count > 0 ? '#7c5c2a' : '#e5e7eb',
                                cursor: clickable ? 'pointer' : 'default',
                                transition: 'background-color 0.1s',
                              }}
                              onMouseEnter={e => { if (clickable) e.currentTarget.style.backgroundColor = 'rgba(165,141,105,0.15)'; }}
                              onMouseLeave={e => { if (clickable) e.currentTarget.style.backgroundColor = count > 0 ? 'rgba(165,141,105,0.07)' : rowBg; }}
                            >
                              {count > 0 ? count : <span style={{ fontSize: 11, color: '#e5e7eb' }}>—</span>}
                            </td>
                          );
                        })}

                        {/* Empty athletes placeholder */}
                        {gridAthletes.length === 0 && (
                          <td style={{ border: '1px solid #f0f0f0', backgroundColor: rowBg }} />
                        )}

                        {/* Total cell */}
                        <td style={{
                          padding: '10px 8px', textAlign: 'center',
                          border: '1px solid #f0f0f0',
                          fontSize: 14, fontWeight: 800,
                          backgroundColor: total > 0 ? 'rgba(165,141,105,0.1)' : '#f9fafb',
                          color: total > 0 ? '#7c5c2a' : '#d1d5db',
                        }}>
                          {total > 0 ? total : '—'}
                        </td>
                      </tr>
                    );
                  })}

                  {/* Totals row (internal/manager view only, when multiple providers) */}
                  {!isExternal && visibleProviders.length > 1 && gridAthletes.length > 0 && (
                    <tr style={{ backgroundColor: '#f9fafb', borderTop: '2px solid #e5e7eb' }}>
                      <td style={{
                        padding: '8px 12px', border: '1px solid #f0f0f0',
                        position: 'sticky', left: 0, zIndex: 4, backgroundColor: '#f9fafb',
                        fontSize: 11, fontWeight: 800, color: '#374151',
                        textTransform: 'uppercase', letterSpacing: '0.05em',
                      }}>
                        All Providers
                      </td>
                      {gridAthletes.map(ath => {
                        const t = getAthleteTotal(ath.id);
                        return (
                          <td key={ath.id} style={{
                            padding: '8px 6px', textAlign: 'center',
                            border: '1px solid #f0f0f0',
                            fontSize: 13, fontWeight: 800,
                            color: t > 0 ? '#374151' : '#d1d5db',
                            backgroundColor: '#f9fafb',
                          }}>
                            {t > 0 ? t : '—'}
                          </td>
                        );
                      })}
                      <td style={{
                        padding: '8px 8px', textAlign: 'center',
                        border: '1px solid #f0f0f0',
                        fontSize: 14, fontWeight: 900,
                        color: grandTotal > 0 ? '#1f2937' : '#d1d5db',
                        backgroundColor: grandTotal > 0 ? 'rgba(165,141,105,0.12)' : '#f9fafb',
                      }}>
                        {grandTotal > 0 ? grandTotal : '—'}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Provider management panel */}
        {showPanel && viewAs === 'manager' && (
          <ProviderPanel
            providers={providers}
            onAdd={addProvider}
            onUpdate={updateProvider}
            onDelete={deleteProvider}
            onClose={() => setShowPanel(false)}
          />
        )}
      </div>

      {/* Drill-down modal */}
      {drillDown && (
        <DrillDownModal
          sessions={drillDown.sessions}
          providerName={drillDown.provider.name}
          athleteName={drillDown.athlete.name}
          dateRange={dateRange}
          onNavigateToNote={onNavigateToNote}
          onClose={() => setDrillDown(null)}
        />
      )}
    </div>
  );
}
