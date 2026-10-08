// Daily housekeeping: a starting password that was never used within its 7 days
// is scrambled, so a leaked / forgotten one can't be used to sign in later. The
// athlete simply asks their coach for a new one ("Forgot your password?").
// Called from the daily cron (api/cron → quarterly-nudges), which runs even when
// push isn't configured.

import { unknownPassword } from '../athleteAuth.js';

export async function expireTempPasswords(admin) {
  if (!admin) return { expired: 0 };
  const now = Date.now();
  let expired = 0;

  for (let page = 1; page <= 10; page++) {
    const { data, error } = await admin.auth.admin.listUsers({ page, perPage: 200 });
    if (error || !data?.users?.length) break;

    for (const u of data.users) {
      const m = u.user_metadata || {};
      if (!m.must_change_password || !m.temp_password_expires_at) continue;
      if (new Date(m.temp_password_expires_at).getTime() > now) continue;
      const { error: updErr } = await admin.auth.admin.updateUserById(u.id, {
        password: unknownPassword(),
        user_metadata: { ...m, temp_password_expired: true },
      });
      if (!updErr) expired++;
    }
    if (data.users.length < 200) break;
  }
  return { expired };
}
