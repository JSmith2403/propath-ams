// Single serverless function for /api/vald/<action> (Vercel Hobby allows only
// 12 functions per deployment, so related endpoints share one file).
//   /api/vald/sync | /api/vald/result-definitions
// Handlers live in api/_lib/vald/ (underscore folders aren't deployed).

import sync from '../_lib/vald/sync.js';
import resultDefinitions from '../_lib/vald/result-definitions.js';

const HANDLERS = { sync, 'result-definitions': resultDefinitions };

export default async function handler(req, res) {
  const raw = req.query?.action;
  const action = Array.isArray(raw) ? raw[0] : raw;
  const fn = Object.prototype.hasOwnProperty.call(HANDLERS, action) ? HANDLERS[action] : null;
  if (!fn) {
    res.status(404).json({ ok: false, error: 'Unknown vald action.' });
    return;
  }
  return fn(req, res);
}
