// What an athlete lets their coaches see from their Garmin data. Four switches, each yes/no:
//   sleep           hours slept, sleep score, overnight HRV
//   stress          average stress
//   body_battery    body battery high / low
//   womens_health   menstrual cycle and related data (off unless the athlete turns it on)
// Steps, resting heart rate and workouts come with connecting — they are not switchable.
//
// The switches are enforced in the database (garmin_daily_for() blanks switched-off columns for coaches);
// this file only validates what the browser sends.

export const SHARE_KEYS = ['sleep', 'stress', 'body_battery', 'womens_health'];
export const DEFAULT_SHARE = { sleep: true, stress: true, body_battery: true, womens_health: false };

/** Anything not explicitly true/false falls back to the default — so junk can never switch something ON by accident. */
export function cleanShare(input) {
  const out = { ...DEFAULT_SHARE };
  if (input && typeof input === 'object') {
    for (const k of SHARE_KEYS) if (typeof input[k] === 'boolean') out[k] = input[k];
  }
  return out;
}
