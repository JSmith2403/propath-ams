// Single serverless function for /api/garmin/<action> (Vercel Hobby allows only 12 functions per
// deployment, so related endpoints share one file).
//   /api/garmin/connect | sync | disconnect | diagnose
// Handlers live in api/_lib/garmin/ (underscore folders aren't deployed).

import actions from '../_lib/garmin/actions.js';

export default async function handler(req, res) {
  const raw = req.query?.action;
  const action = Array.isArray(raw) ? raw[0] : raw;
  const fn = Object.prototype.hasOwnProperty.call(actions, action) ? actions[action] : null;
  if (!fn) {
    res.status(404).json({ ok: false, error: 'Unknown garmin action.' });
    return;
  }
  return fn(req, res);
}
