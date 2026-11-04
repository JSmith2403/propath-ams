import { useCallback, useState } from 'react';
import { supabase } from './supabase';

/** The push reminders a coach can send from the dashboard (same endpoint the Wellness Compliance card uses). */
export const REMINDERS = {
  checkin: { title: 'Daily check-in', body: 'Quick one — please complete today’s wellness check-in.' },
  timetable: { title: 'This week’s sessions', body: 'Please let us know if you’re coming to this week’s group sessions.' },
  watch: { title: 'Garmin', body: 'Your watch hasn’t synced for a couple of days. Open the Garmin app to sync it.' },
};

async function sendOne(athleteId, kind, token) {
  try {
    const res = await fetch('/api/push/send', {
      method: 'POST',
      headers: { 'content-type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ athlete_id: athleteId, ...REMINDERS[kind], url: '/athlete' }),
    });
    const json = await res.json().catch(() => ({}));
    return res.ok && json.ok;
  } catch { return false; }
}

/** state: { [key]: 'sending' | 'sent' | 'failed' }. send(key, athleteIds, kind) reminds each in turn. */
export function useReminders() {
  const [state, setState] = useState({});
  const send = useCallback(async (key, athleteIds, kind) => {
    setState(s => ({ ...s, [key]: 'sending' }));
    const { data: { session } } = await supabase.auth.getSession();
    let allOk = true;
    for (const id of athleteIds) {
      if (!(await sendOne(id, kind, session?.access_token || ''))) allOk = false;
    }
    setState(s => ({ ...s, [key]: allOk ? 'sent' : 'failed' }));
  }, []);
  return { state, send };
}
