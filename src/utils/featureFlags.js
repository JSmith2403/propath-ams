/**
 * Feature flags — single source of truth for opt-in UI variants.
 *
 *   ── HOW TO TOGGLE ───────────────────────────────────────────────
 *
 *   1. Permanent change (whole app, all users)
 *      Edit the DEFAULTS object below — flip false ↔ true and ship.
 *
 *   2. Runtime testing (your browser only, no rebuild)
 *      In the dev console:
 *        localStorage.setItem('ff:calendar_deemphasised_empty_days', 'true')
 *        // refresh the page
 *      Clear with:
 *        localStorage.removeItem('ff:calendar_deemphasised_empty_days')
 *
 *   ── REVERSIBILITY ───────────────────────────────────────────────
 *   Every flag is wired such that flipping it back to false restores
 *   the pre-flag UI without any other code change. Each flagged code
 *   path lives behind an `isFeatureOn(...)` guard, with the original
 *   rendering preserved in the else branch.
 */

const DEFAULTS = {
  // When true, days with no session render without a card / border /
  // "No session" text — see AthleteWeekViewV2.jsx. False keeps the
  // original AthleteWeekView rendering exactly as it was.
  calendar_deemphasised_empty_days: false,
};

export function isFeatureOn(name) {
  // localStorage override wins — set 'ff:<name>' to 'true' or 'false'
  // in the browser to flip a flag without a rebuild.
  if (typeof window !== 'undefined' && window.localStorage) {
    const v = window.localStorage.getItem(`ff:${name}`);
    if (v === 'true')  return true;
    if (v === 'false') return false;
  }
  return !!DEFAULTS[name];
}

export const FEATURE_FLAGS = DEFAULTS;
