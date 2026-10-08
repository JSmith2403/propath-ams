// Single serverless function for /api/push/<action> (Vercel Hobby allows only
// 12 functions per deployment, so related endpoints share one file).
//   /api/push/send              — generic push to an athlete's devices
//   /api/push/message           — coach → athlete(s): stored message + push
//   /api/push/reply             — athlete → coaching team: stored message + push
//   /api/push/subscribe-staff   — register a coach device for push
//   /api/push/timetable-publish — publish a week's timetable + notify athletes
//   /api/push/chat-staff | chat-create | chat-members | chat-send
//                               — group & direct chats (see push-handlers/chat.js)
//   /api/push/subscribe-athlete | push-status | push-test
//                               — athlete device registration, who-has-notifications, test push
//   /api/push/one-to-one-request | one-to-one-decide
//                               — 1:1 session requests (token-limited) and coach decisions
// Handlers live in api/_lib/push-handlers/ (underscore folders aren't deployed).

import send from '../_lib/push-handlers/send.js';
import message from '../_lib/push-handlers/message.js';
import reply from '../_lib/push-handlers/reply.js';
import subscribeStaff from '../_lib/push-handlers/subscribe-staff.js';
import timetablePublish from '../_lib/push-handlers/timetable-publish.js';
import { chatStaff, chatCreate, chatMembers, chatSend } from '../_lib/push-handlers/chat.js';
import { subscribeAthlete, pushStatus, testPush } from '../_lib/push-handlers/diagnostics.js';
import { oneToOneRequest, oneToOneDecide } from '../_lib/push-handlers/one-to-one.js';

const HANDLERS = {
  send, message, reply,
  'subscribe-staff': subscribeStaff,
  'timetable-publish': timetablePublish,
  'chat-staff': chatStaff,
  'chat-create': chatCreate,
  'chat-members': chatMembers,
  'chat-send': chatSend,
  'subscribe-athlete': subscribeAthlete,
  'push-status': pushStatus,
  'push-test': testPush,
  'one-to-one-request': oneToOneRequest,
  'one-to-one-decide': oneToOneDecide,
};

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
