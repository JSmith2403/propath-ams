import { describe, it, expect } from 'vitest';
import { parsePush, mapDaily, mapSleep, mapActivity, localDay } from './push.js';

describe('parsePush', () => {
  const body = {
    dailies: [{ userId: 'u1', calendarDate: '2026-11-03', steps: 9421, restingHeartRateInBeatsPerMinute: 52, averageStressLevel: 31, activeKilocalories: 640 }],
    sleeps: [{ userId: 'u1', calendarDate: '2026-11-03', durationInSeconds: 27300, overallSleepScore: { value: 84, qualifierKey: 'GOOD' } }],
    hrv: [{ userId: 'u1', calendarDate: '2026-11-03', lastNightAvg: 68 }],
    activities: [{ userId: 'u1', activityId: 123456, activityType: 'RUNNING', activityName: 'Morning run', startTimeInSeconds: 1793600000, startTimeOffsetInSeconds: 14400, durationInSeconds: 2700, distanceInMeters: 8200, averageHeartRateInBeatsPerMinute: 151, maxHeartRateInBeatsPerMinute: 176, activeKilocalories: 520 }],
    deregistrations: [{ userId: 'u9' }],
    userPermissionsChange: [{ userId: 'u1', permissions: ['ACTIVITY_EXPORT', 'HEALTH_EXPORT'] }],
    stressDetails: [{ userId: 'u1', calendarDate: '2026-11-03' }],
  };
  const out = parsePush(body);

  it('maps daily, sleep and HRV records onto the right columns and raw slots', () => {
    const by = (raw) => out.daily.find(d => d.rawCol === raw);
    expect(by('raw_daily').cols).toEqual({ steps: 9421, resting_hr: 52, avg_stress: 31, active_kcal: 640 });
    expect(by('raw_sleep').cols).toEqual({ sleep_seconds: 27300, sleep_score: 84 });
    expect(by('raw_hrv').cols).toEqual({ hrv_last_night: 68 });
    expect(out.daily.every(d => d.userId === 'u1' && d.day === '2026-11-03')).toBe(true);
  });

  it('maps an activity, with the local date from the watch’s own UTC offset', () => {
    const a = out.activities[0].row;
    expect(a).toMatchObject({ activity_id: 123456, activity_type: 'running', name: 'Morning run', duration_s: 2700, distance_m: 8200, avg_hr: 151, max_hr: 176, calories: 520 });
    expect(a.started_at).toBe(new Date(1793600000 * 1000).toISOString());
    expect(a.day).toBe(localDay(1793600000, 14400));
  });

  it('picks up deregistrations and permission changes', () => {
    expect(out.deregistered).toEqual(['u9']);
    expect(out.permissions).toEqual([{ userId: 'u1', permissions: ['ACTIVITY_EXPORT', 'HEALTH_EXPORT'] }]);
  });

  it('reports data types it does not store yet instead of failing', () => {
    expect(out.ignored).toEqual(['stressDetails']);
  });

  it('survives junk', () => {
    for (const junk of [null, undefined, 'x', 5, [], {}, { dailies: 'no' }, { dailies: [null, 3, {}] }, { activities: [{ userId: 'u', activityId: 'abc' }] }]) {
      expect(() => parsePush(junk)).not.toThrow();
    }
    expect(parsePush({ dailies: [{ calendarDate: '2026-11-03', steps: 1 }] }).daily).toEqual([]);   // no userId → can't match an athlete
  });
});

describe('mappers never write nulls over existing data', () => {
  it('leaves out fields Garmin did not send', () => {
    expect(mapDaily({ steps: 100 })).toEqual({ steps: 100 });
    expect(mapSleep({})).toEqual({});
    expect(mapActivity({ activityId: 'nope' })).toBeNull();
  });
});
