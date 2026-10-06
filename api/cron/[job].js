// Single serverless function for every /api/cron/<job> endpoint (Vercel Hobby
// allows only 12 functions per deployment — see api/athlete-auth/[action].js).
//   /api/cron/quarterly-nudges   daily 08:00 UTC
//   /api/cron/weekly-attendance  Sundays 4pm UK (scheduled at 15:00 and 16:00 UTC)
// Handlers live in api/_lib/cron/ (underscore folders aren't deployed).

import quarterlyNudges from '../_lib/cron/quarterly-nudges.js';
import weeklyAttendance from '../_lib/cron/weekly-attendance.js';

const HANDLERS = { 'quarterly-nudges': quarterlyNudges, 'weekly-attendance': weeklyAttendance };

export default async function handler(req, res) {
  const raw = req.query?.job;
  const job = Array.isArray(raw) ? raw[0] : raw;
  const fn = Object.prototype.hasOwnProperty.call(HANDLERS, job) ? HANDLERS[job] : null;
  if (!fn) {
    res.status(404).json({ ok: false, error: 'Unknown cron job.' });
    return;
  }
  return fn(req, res);
}
