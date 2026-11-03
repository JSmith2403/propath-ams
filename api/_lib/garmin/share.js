// What an athlete lets their coaches see from their Garmin data. Yes/no switches:
//   sleep           hours slept, sleep score, overnight HRV
//   stress          average stress
//   body_battery    body battery high / low
//   vitals          breathing rate, blood oxygen, Health Snapshots
//   fitness         VO2 max, fitness age
//   womens_health   menstrual cycle and related data (off unless the athlete turns it on)
// Steps, resting heart rate and workouts come with connecting — they are not switchable.
//
// The switches are enforced in the database (garmin_daily_for() / garmin_snapshots_for() blank switched-off data for
// coaches); this file only validates what the browser sends. A switch an athlete has never been asked about counts as
// NO in the database, so nothing new is shown to coaches until they choose.

export const SHARE_KEYS = ['sleep', 'stress', 'body_battery', 'vitals', 'fitness', 'womens_health'];
export const DEFAULT_SHARE = { sleep: true, stress: true, body_battery: true, vitals: true, fitness: true, womens_health: false };

/** Anything not explicitly true/false falls back to the default — so junk can never switch something ON by accident. */
export function cleanShare(input) {
  const out = { ...DEFAULT_SHARE };
  if (input && typeof input === 'object') {
    for (const k of SHARE_KEYS) if (typeof input[k] === 'boolean') out[k] = input[k];
  }
  return out;
}
