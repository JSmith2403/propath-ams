import { useState, useEffect } from 'react';
import { DUMMY_ATHLETES } from '../data/athletes';
import { SYNC_MAP, METRIC_MAP } from '../data/sessionMetrics';

const STORAGE_KEY = 'propath_athletes_v4';

const EMPTY_WORKING_ON = () => [
  { title: '', description: '' },
  { title: '', description: '' },
  { title: '', description: '' },
];

const DEFAULT_PHASE2 = () => ({
  maturation: { entries: [] },
  mobility: { entries: {} },
  performance: { entries: {} },
  physio: { entries: [] },
  physical: { workingOn: EMPTY_WORKING_ON() },
  lifestyle: { workingOn: EMPTY_WORKING_ON() },
  performanceBrag: {},
  nutrition: {
    workingOn: EMPTY_WORKING_ON(),
    entries: {
      screeningNotes: [],
      hydrationNotes: [],
      fuellingNotes: [],
      supplementLog: [],
      sessionNotes: [],
    },
  },
  psych: {
    acsi28: [],
    sessionNotes: [],
    goalSettingLog: [],
    mentalPerformanceNotes: [],
    generalObservations: [],
    workingOn: EMPTY_WORKING_ON(),
  },
});

function ensurePhase2(athlete) {
  if (!athlete.phase2) return { ...athlete, phase2: DEFAULT_PHASE2() };
  const p2 = athlete.phase2;
  const d  = DEFAULT_PHASE2();
  return {
    ...athlete,
    phase2: {
      ...d,
      ...p2,
      physical:        p2.physical        || d.physical,
      lifestyle:       p2.lifestyle       || d.lifestyle,
      performanceBrag: p2.performanceBrag || {},
    },
  };
}

function ensureAthlete(a) {
  let base = { checkIns: [], ...ensurePhase2(a) };

  // Migrate old tier field (e.g. 'Elite Female') → cohort + gender
  if (!base.cohort) {
    const t = base.tier || '';
    base.cohort = t.includes('Mini') ? 'Mini' : t.includes('Gold') ? 'Gold' : 'Elite';
    base.gender = base.gender || (t.includes('Female') ? 'Female' : 'Male');
  }

  return base;
}

function loadAthletes() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) return JSON.parse(stored).map(ensureAthlete);
  } catch (e) {
    console.error('Failed to load athletes', e);
  }
  return DUMMY_ATHLETES.map(ensureAthlete);
}

function saveAthletes(athletes) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(athletes));
  } catch (e) {
    console.error('Failed to save athletes', e);
  }
}

function uid() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

export function useAthletes() {
  const [athletes, setAthletes] = useState(() => loadAthletes());

  useEffect(() => { saveAthletes(athletes); }, [athletes]);

  const update = (id, updater) =>
    setAthletes(prev => prev.map(a => a.id === id ? updater(a) : a));

  // ── Phase 1 operations ────────────────────────────────────
  const addAthlete = (data) => {
    const a = {
      ...data,
      id: uid(),
      photo: data.photo || null,
      rag: { physical: 'grey', psych: 'grey', nutrition: 'grey', lifestyle: 'grey' },
      ragLog: { physical: [], psych: [], nutrition: [], lifestyle: [] },
      quarterlyReviews: [],
      checkIns: [],
      phase2: DEFAULT_PHASE2(),
    };
    setAthletes(prev => [...prev, a]);
    return a.id;
  };

  const updateAthlete = (id, updates) =>
    update(id, a => ({ ...a, ...updates }));

  const updateRag = (id, domain, status) =>
    update(id, a => ({ ...a, rag: { ...a.rag, [domain]: status } }));

  const addRagEntry = (id, domain, entry) =>
    update(id, a => ({
      ...a,
      ragLog: { ...a.ragLog, [domain]: [entry, ...(a.ragLog?.[domain] || [])] },
    }));

  const saveQuarterlyReview = (id, review) =>
    update(id, a => {
      const list = a.quarterlyReviews || [];
      const idx = list.findIndex(r => r.id === review.id);
      return {
        ...a,
        quarterlyReviews: idx >= 0
          ? list.map(r => r.id === review.id ? review : r)
          : [...list, review],
      };
    });

  const updatePhoto = (id, url) =>
    update(id, a => ({ ...a, photo: url }));

  // ── Phase 2 operations ────────────────────────────────────
  const p2update = (id, updater) =>
    update(id, a => ({ ...a, phase2: updater(a.phase2 || DEFAULT_PHASE2()) }));

  const addMaturationEntry = (id, entry) =>
    p2update(id, p2 => ({
      ...p2,
      maturation: { entries: [{ ...entry, id: uid() }, ...p2.maturation.entries] },
    }));

  const addMobilityEntry = (id, joint, entry) =>
    p2update(id, p2 => {
      const existing = p2.mobility.entries[joint] || [];
      return {
        ...p2,
        mobility: {
          entries: {
            ...p2.mobility.entries,
            [joint]: [{ ...entry, id: uid() }, ...existing],
          },
        },
      };
    });

  const addPerformanceEntry = (id, metric, entry) =>
    p2update(id, p2 => {
      const existing = p2.performance.entries[metric] || [];
      return {
        ...p2,
        performance: {
          entries: {
            ...p2.performance.entries,
            [metric]: [{ ...entry, id: uid() }, ...existing],
          },
        },
      };
    });

  const addPhysioEntry = (id, entry) =>
    p2update(id, p2 => ({
      ...p2,
      physio: { entries: [{ ...entry, id: uid() }, ...p2.physio.entries] },
    }));

  const addNutritionEntry = (id, type, entry) =>
    p2update(id, p2 => {
      const existing = p2.nutrition.entries[type] || [];
      return {
        ...p2,
        nutrition: {
          entries: {
            ...p2.nutrition.entries,
            [type]: [{ ...entry, id: uid() }, ...existing],
          },
        },
      };
    });

  const addAcsi28Entry = (id, entry) =>
    p2update(id, p2 => ({
      ...p2,
      psych: { ...p2.psych, acsi28: [{ ...entry, id: uid() }, ...p2.psych.acsi28] },
    }));

  const addPsychNote = (id, type, entry) =>
    p2update(id, p2 => ({
      ...p2,
      psych: {
        ...p2.psych,
        [type]: [{ ...entry, id: uid() }, ...(p2.psych[type] || [])],
      },
    }));

  const savePsychWorkingOn = (id, workingOn) =>
    p2update(id, p2 => ({
      ...p2,
      psych: { ...p2.psych, workingOn },
    }));

  const saveNutritionWorkingOn = (id, workingOn) =>
    p2update(id, p2 => ({
      ...p2,
      nutrition: { ...p2.nutrition, workingOn },
    }));

  const savePhysicalWorkingOn = (id, workingOn) =>
    p2update(id, p2 => ({
      ...p2,
      physical: { ...(p2.physical || {}), workingOn },
    }));

  const saveLifestyleWorkingOn = (id, workingOn) =>
    p2update(id, p2 => ({
      ...p2,
      lifestyle: { ...(p2.lifestyle || {}), workingOn },
    }));

  const addCheckIn = (id, entry) =>
    update(id, a => ({
      ...a,
      checkIns: [entry, ...(a.checkIns || [])],
    }));

  const savePerformanceBrag = (id, metricKey, color) =>
    p2update(id, p2 => ({
      ...p2,
      performanceBrag: { ...(p2.performanceBrag || {}), [metricKey]: color },
    }));

  const updateLatestEntry = (id, bucket, metricKey, field, value) =>
    p2update(id, p2 => {
      if (bucket === 'performance') {
        const list = [...(p2.performance?.entries[metricKey] || [])];
        if (list.length === 0) return p2;
        list[0] = { ...list[0], [field]: value };
        return { ...p2, performance: { entries: { ...p2.performance.entries, [metricKey]: list } } };
      }
      if (bucket === 'mobility') {
        const list = [...(p2.mobility?.entries[metricKey] || [])];
        if (list.length === 0) return p2;
        list[0] = { ...list[0], [field]: value };
        return { ...p2, mobility: { entries: { ...p2.mobility.entries, [metricKey]: list } } };
      }
      if (bucket === 'maturation') {
        const list = [...(p2.maturation?.entries || [])];
        if (list.length === 0) return p2;
        list[0] = { ...list[0], [field]: value };
        return { ...p2, maturation: { entries: list } };
      }
      return p2;
    });

  const getAthlete = (id) => athletes.find(a => a.id === id);

  // ── Session sync ──────────────────────────────────────────────────────────
  function hasCellValue(cell) {
    if (!cell) return false;
    return Object.values(cell).some(v => v != null && v !== '' && !(typeof v === 'number' && isNaN(v)));
  }

  function buildSessionEntry(metricDef, cell, date, sessionId) {
    const base = { id: uid(), date, sessionId };
    if (!metricDef) return { ...base, value: cell.value ?? null };
    if (metricDef.bilateral && metricDef.attempts > 1) {
      return { ...base, left: cell.bestL ?? null, right: cell.bestR ?? null };
    }
    if (metricDef.bilateral) {
      return { ...base, left: cell.L ?? null, right: cell.R ?? null };
    }
    if (metricDef.attempts > 1) {
      return { ...base, value: cell.best ?? null };
    }
    return { ...base, value: cell.value ?? null };
  }

  function stripSessionEntries(p2, sessionId) {
    const perf = {};
    Object.entries(p2.performance?.entries || {}).forEach(([k, list]) => {
      const f = (list || []).filter(e => e.sessionId !== sessionId);
      if (f.length) perf[k] = f;
    });
    const mob = {};
    Object.entries(p2.mobility?.entries || {}).forEach(([k, list]) => {
      const f = (list || []).filter(e => e.sessionId !== sessionId);
      if (f.length) mob[k] = f;
    });
    const matEntries = (p2.maturation?.entries || []).filter(e => e.sessionId !== sessionId);
    return { ...p2, performance: { entries: perf }, mobility: { entries: mob }, maturation: { entries: matEntries } };
  }

  const syncSessionData = (session) => {
    const { id: sessionId, date, data = {}, customMetrics = {} } = session;
    const allMetricDefs = { ...METRIC_MAP, ...customMetrics };

    Object.entries(data).forEach(([athleteId, cellData]) => {
      p2update(athleteId, p2 => {
        const cleaned = stripSessionEntries(p2, sessionId);
        const perf    = { ...cleaned.performance?.entries };
        const mob     = { ...cleaned.mobility?.entries   };
        const matEntries = [...(cleaned.maturation?.entries || [])];
        const matPatch   = {};

        Object.entries(cellData).forEach(([metricKey, cell]) => {
          if (!hasCellValue(cell)) return;
          const syncTarget = SYNC_MAP[metricKey];
          const metricDef  = allMetricDefs[metricKey];

          if (!syncTarget) {
            const entry = buildSessionEntry(metricDef, cell, date, sessionId);
            perf[metricKey] = [entry, ...(perf[metricKey] || [])];
            return;
          }

          if (syncTarget.type === 'performance') {
            const entry = buildSessionEntry(metricDef, cell, date, sessionId);
            perf[syncTarget.key] = [entry, ...(perf[syncTarget.key] || [])];
          } else if (syncTarget.type === 'mobility') {
            const entry = buildSessionEntry(metricDef, cell, date, sessionId);
            mob[syncTarget.key] = [entry, ...(mob[syncTarget.key] || [])];
          } else if (syncTarget.type === 'maturation') {
            const v = cell.value ?? cell.L ?? cell.R;
            if (v != null && v !== '') matPatch[syncTarget.field] = v;
          }
        });

        if (Object.keys(matPatch).length > 0) {
          matEntries.unshift({ id: uid(), date, sessionId, ...matPatch });
        }

        return {
          ...cleaned,
          performance: { entries: perf },
          mobility:    { entries: mob  },
          maturation:  { entries: matEntries },
        };
      });
    });
  };

  return {
    athletes,
    getAthlete,
    // Phase 1
    addAthlete, updateAthlete, updateRag, addRagEntry,
    saveQuarterlyReview, updatePhoto,
    addCheckIn,
    // Phase 2 — individual
    addMaturationEntry, addMobilityEntry, addPerformanceEntry,
    addPhysioEntry, addNutritionEntry, addAcsi28Entry, addPsychNote,
    savePsychWorkingOn, saveNutritionWorkingOn,
    savePhysicalWorkingOn, saveLifestyleWorkingOn, savePerformanceBrag,
    updateLatestEntry,
    // Session sync
    syncSessionData,
  };
}
