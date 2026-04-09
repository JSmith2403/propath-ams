import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { DUMMY_ATHLETES } from '../data/athletes';
import { SYNC_MAP, METRIC_MAP } from '../data/sessionMetrics';

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

  if (!base.cohort) {
    const t = base.tier || '';
    base.cohort = t.includes('Mini') ? 'Mini' : t.includes('Gold') ? 'Gold' : 'Elite';
    base.gender = base.gender || (t.includes('Female') ? 'Female' : 'Male');
  }

  return base;
}

function uid() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

async function persistAthlete(athlete) {
  const { error } = await supabase
    .from('athletes')
    .upsert({ id: athlete.id, data: athlete, updated_at: new Date().toISOString() });
  if (error) console.error('[ProPath] Failed to save athlete', athlete.id, error);
}

export function useAthletes() {
  const [athletes, setAthletes] = useState([]);
  const [loading, setLoading]   = useState(true);

  // ── Initial load + real-time subscription ───────────────────
  useEffect(() => {
    let isMounted = true;

    supabase.from('athletes').select('id, data').then(async ({ data, error }) => {
      if (!isMounted) return;
      if (error) {
        console.error('[ProPath] Failed to load athletes', error);
        setLoading(false);
        return;
      }

      if (!data || data.length === 0) {
        // Seed with dummy data on first run
        const seeded = DUMMY_ATHLETES.map(ensureAthlete);
        setAthletes(seeded);
        await Promise.all(
          seeded.map(a =>
            supabase.from('athletes').upsert({ id: a.id, data: a, updated_at: new Date().toISOString() })
          )
        );
      } else {
        setAthletes(data.map(row => ensureAthlete(row.data)));
      }
      if (isMounted) setLoading(false);
    });

    const channel = supabase
      .channel('athletes-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'athletes' },
        payload => {
          if (!isMounted) return;
          if (payload.eventType === 'INSERT' || payload.eventType === 'UPDATE') {
            const incoming = ensureAthlete(payload.new.data);
            setAthletes(prev => {
              const exists = prev.some(a => a.id === incoming.id);
              return exists
                ? prev.map(a => a.id === incoming.id ? incoming : a)
                : [...prev, incoming];
            });
          } else if (payload.eventType === 'DELETE') {
            setAthletes(prev => prev.filter(a => a.id !== payload.old.id));
          }
        }
      )
      .subscribe();

    return () => {
      isMounted = false;
      supabase.removeChannel(channel);
    };
  }, []);

  // ── Mutation helpers ─────────────────────────────────────────
  const update = useCallback((id, updater) => {
    setAthletes(prev => {
      const next    = prev.map(a => a.id === id ? updater(a) : a);
      const updated = next.find(a => a.id === id);
      if (updated) persistAthlete(updated);
      return next;
    });
  }, []);

  // ── Phase 1 operations ────────────────────────────────────
  const addAthlete = useCallback((data) => {
    const a = {
      ...data,
      id:              uid(),
      photo:           data.photo || null,
      rag:             { physical: 'grey', psych: 'grey', nutrition: 'grey', lifestyle: 'grey' },
      ragLog:          { physical: [], psych: [], nutrition: [], lifestyle: [] },
      quarterlyReviews: [],
      checkIns:        [],
      phase2:          DEFAULT_PHASE2(),
    };
    setAthletes(prev => {
      const next = [...prev, a];
      persistAthlete(a);
      return next;
    });
    return a.id;
  }, []);

  const updateAthlete = useCallback((id, updates) =>
    update(id, a => ({ ...a, ...updates })), [update]);

  const updateRag = useCallback((id, domain, status) =>
    update(id, a => ({ ...a, rag: { ...a.rag, [domain]: status } })), [update]);

  const addRagEntry = useCallback((id, domain, entry) =>
    update(id, a => ({
      ...a,
      ragLog: { ...a.ragLog, [domain]: [entry, ...(a.ragLog?.[domain] || [])] },
    })), [update]);

  const saveQuarterlyReview = useCallback((id, review) =>
    update(id, a => {
      const list = a.quarterlyReviews || [];
      const idx  = list.findIndex(r => r.id === review.id);
      return {
        ...a,
        quarterlyReviews: idx >= 0
          ? list.map(r => r.id === review.id ? review : r)
          : [...list, review],
      };
    }), [update]);

  const updatePhoto = useCallback((id, url) =>
    update(id, a => ({ ...a, photo: url })), [update]);

  // ── Phase 2 operations ────────────────────────────────────
  const p2update = useCallback((id, updater) =>
    update(id, a => ({ ...a, phase2: updater(a.phase2 || DEFAULT_PHASE2()) })), [update]);

  const addMaturationEntry = useCallback((id, entry) =>
    p2update(id, p2 => ({
      ...p2,
      maturation: { entries: [{ ...entry, id: uid() }, ...p2.maturation.entries] },
    })), [p2update]);

  const addMobilityEntry = useCallback((id, joint, entry) =>
    p2update(id, p2 => {
      const existing = p2.mobility.entries[joint] || [];
      return {
        ...p2,
        mobility: {
          entries: { ...p2.mobility.entries, [joint]: [{ ...entry, id: uid() }, ...existing] },
        },
      };
    }), [p2update]);

  const addPerformanceEntry = useCallback((id, metric, entry) =>
    p2update(id, p2 => {
      const existing = p2.performance.entries[metric] || [];
      return {
        ...p2,
        performance: {
          entries: { ...p2.performance.entries, [metric]: [{ ...entry, id: uid() }, ...existing] },
        },
      };
    }), [p2update]);

  const addPhysioEntry = useCallback((id, entry) =>
    p2update(id, p2 => ({
      ...p2,
      physio: { entries: [{ ...entry, id: uid() }, ...p2.physio.entries] },
    })), [p2update]);

  const addNutritionEntry = useCallback((id, type, entry) =>
    p2update(id, p2 => {
      const existing = p2.nutrition.entries[type] || [];
      return {
        ...p2,
        nutrition: {
          entries: { ...p2.nutrition.entries, [type]: [{ ...entry, id: uid() }, ...existing] },
        },
      };
    }), [p2update]);

  const addAcsi28Entry = useCallback((id, entry) =>
    p2update(id, p2 => ({
      ...p2,
      psych: { ...p2.psych, acsi28: [{ ...entry, id: uid() }, ...p2.psych.acsi28] },
    })), [p2update]);

  const addPsychNote = useCallback((id, type, entry) =>
    p2update(id, p2 => ({
      ...p2,
      psych: {
        ...p2.psych,
        [type]: [{ ...entry, id: uid() }, ...(p2.psych[type] || [])],
      },
    })), [p2update]);

  const savePsychWorkingOn = useCallback((id, workingOn) =>
    p2update(id, p2 => ({
      ...p2,
      psych: { ...p2.psych, workingOn },
    })), [p2update]);

  const saveNutritionWorkingOn = useCallback((id, workingOn) =>
    p2update(id, p2 => ({
      ...p2,
      nutrition: { ...p2.nutrition, workingOn },
    })), [p2update]);

  const savePhysicalWorkingOn = useCallback((id, workingOn) =>
    p2update(id, p2 => ({
      ...p2,
      physical: { ...(p2.physical || {}), workingOn },
    })), [p2update]);

  const saveLifestyleWorkingOn = useCallback((id, workingOn) =>
    p2update(id, p2 => ({
      ...p2,
      lifestyle: { ...(p2.lifestyle || {}), workingOn },
    })), [p2update]);

  const addCheckIn = useCallback((id, entry) =>
    update(id, a => ({
      ...a,
      checkIns: [entry, ...(a.checkIns || [])],
    })), [update]);

  const savePerformanceBrag = useCallback((id, metricKey, color) =>
    p2update(id, p2 => ({
      ...p2,
      performanceBrag: { ...(p2.performanceBrag || {}), [metricKey]: color },
    })), [p2update]);

  const updateLatestEntry = useCallback((id, bucket, metricKey, field, value) =>
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
    }), [p2update]);

  const getAthlete = useCallback((id) => athletes.find(a => a.id === id), [athletes]);

  // ── Session sync ──────────────────────────────────────────────────────────
  function hasCellValue(cell) {
    if (!cell) return false;
    return Object.values(cell).some(v => v != null && v !== '' && !(typeof v === 'number' && isNaN(v)));
  }

  function buildSessionEntry(metricDef, cell, date, sessionId) {
    const base = { id: uid(), date, sessionId };
    if (!metricDef) return { ...base, value: cell.value ?? null };
    if (metricDef.bilateral && metricDef.attempts > 1) {
      // bestL/bestR from SessionTable; L/R from CSV import or DataStorage inline edit
      return {
        ...base,
        left:  cell.bestL ?? cell.L ?? cell.left  ?? null,
        right: cell.bestR ?? cell.R ?? cell.right ?? null,
      };
    }
    if (metricDef.bilateral) {
      return { ...base, left: cell.L ?? cell.left ?? null, right: cell.R ?? cell.right ?? null };
    }
    if (metricDef.attempts > 1) {
      return { ...base, value: cell.best ?? cell.value ?? null };
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

  const syncSessionData = useCallback((session) => {
    const { id: sessionId, date, data = {}, customMetrics = {} } = session;
    const allMetricDefs = { ...METRIC_MAP, ...customMetrics };

    Object.entries(data).forEach(([athleteId, cellData]) => {
      p2update(athleteId, p2 => {
        const cleaned    = stripSessionEntries(p2, sessionId);
        const perf       = { ...cleaned.performance?.entries };
        const mob        = { ...cleaned.mobility?.entries   };
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
  }, [p2update]);

  return {
    athletes,
    loading,
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
