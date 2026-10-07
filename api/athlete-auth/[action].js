// Single serverless function for every /api/athlete-auth/<action> endpoint.
//
// Vercel's Hobby plan allows at most 12 serverless functions per deployment
// and every file under api/ counts as one, so the athlete-auth handlers live
// in api/_lib/athlete-auth/ (folders starting with "_" are NOT deployed as
// functions) and this file dispatches to them. The public URLs are:
//   /api/athlete-auth/setup | me | status | reset | accounts
//   /api/athlete-auth/request-setup | setup-status | complete-setup
//   /api/athlete-auth/family-view   (public, parent read-only link)
//
// Add a new action by dropping a handler in api/_lib/athlete-auth/ and
// registering it below — it won't cost another function.

import setup from '../_lib/athlete-auth/setup.js';
import me from '../_lib/athlete-auth/me.js';
import status from '../_lib/athlete-auth/status.js';
import reset from '../_lib/athlete-auth/reset.js';
import accounts from '../_lib/athlete-auth/accounts.js';
import { requestSetup, setupStatus, completeSetup } from '../_lib/athlete-auth/athlete-setup.js';
import familyView from '../_lib/athlete-auth/family.js';

const HANDLERS = {
  setup, me, status, reset, accounts,
  'request-setup': requestSetup,
  'setup-status': setupStatus,
  'complete-setup': completeSetup,
  'family-view': familyView,
};

export default async function handler(req, res) {
  const raw = req.query?.action;
  const action = Array.isArray(raw) ? raw[0] : raw;
  const fn = Object.prototype.hasOwnProperty.call(HANDLERS, action) ? HANDLERS[action] : null;
  if (!fn) {
    res.status(404).json({ ok: false, error: 'Unknown athlete-auth action.' });
    return;
  }
  return fn(req, res);
}
