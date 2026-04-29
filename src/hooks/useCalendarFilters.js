import { useCallback, useEffect, useState } from 'react';

const STORAGE_KEY = 'propath:calendar-filters:v1';

export const FILTER_DEFAULTS = {
  competitions:   true,
  training_camps: true,
  testing:        true,
  team_events:    true,
  birthdays:      true,
  // Brief 7 — wired structurally only. Toggles render disabled with a
  // "Coming soon" tag and never let any events through.
  planned: false,
  logged:  false,
};

/**
 * Persists the Shared Calendar filter toggles to localStorage so the
 * coach's preferences survive a refresh. Falls back to defaults on any
 * parse error.
 */
export function useCalendarFilters() {
  const [filters, setFilters] = useState(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        // Always overlay onto defaults so newly-introduced filter keys
        // don't disappear when an old localStorage payload is loaded.
        return { ...FILTER_DEFAULTS, ...parsed };
      }
    } catch (e) {
      console.warn('[CalendarFilters] localStorage read failed', e);
    }
    return FILTER_DEFAULTS;
  });

  useEffect(() => {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(filters)); }
    catch (e) { console.warn('[CalendarFilters] localStorage write failed', e); }
  }, [filters]);

  const setFilter = useCallback((key, value) => {
    setFilters(prev => ({ ...prev, [key]: !!value }));
  }, []);

  return { filters, setFilter };
}

/**
 * Decide whether a single event row passes the current filter set.
 * Birthday events keyed by is_birthday, team events by is_team_event,
 * planned sessions by is_planned, everything else by event_type.
 * "Other" event_type passes through (no dedicated toggle for it).
 */
export function eventPassesFilters(event, filters) {
  if (event.is_planned)    return !!filters.planned;
  if (event.is_birthday)   return !!filters.birthdays;
  if (event.is_team_event) return !!filters.team_events;
  switch (event.event_type) {
    case 'competition':   return !!filters.competitions;
    case 'training_camp': return !!filters.training_camps;
    case 'testing':       return !!filters.testing;
    default:              return true;
  }
}
