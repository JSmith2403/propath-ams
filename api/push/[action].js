// Single serverless function for /api/push/<action> (Vercel Hobby allows only
// 12 functions per deployment, so related endpoints share one file).
//   /api/push/send     — generic push to an athlete's devices
//   /api/push/message  — coach message: inbox row + push (was /api/messages/send)
// Handlers live in api/_lib/push-handlers/ (underscore folders aren't deployed).

import send from '../_lib/push-handlers/send.js';
import message from '../_lib/push-handlers/message.js';

const HANDLERS = { send, message };

export default async function handler(req, res) {
  const raw = req.query?.action;
  const action = Array.isArray(raw) ? raw[0] : raw;
  const fn = Object.prototype.hasOwnProperty.call(HANDLERS, action) ? HANDLERS[action] : null;
  if (!fn) {
    res.status(404).json({ ok: false, error: 'Unknown push action.' });
    return;
  }
  return fn(req, res);
}
