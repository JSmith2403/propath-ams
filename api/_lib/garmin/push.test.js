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
    bodyComps: [{ userId: 'u1', calendarDate: '2026-11-03' }],
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
    expect(out.ignored).toEqual(['bodyComps']);
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
    expect(mapDaily({ moderateIntensityDurationInSeconds: 2700, vigorousIntensityDurationInSeconds: 900 })).toEqual({ moderate_min: 45, vigorous_min: 15 });
    expect(mapDaily({ moderateIntensityDurationInSeconds: 0 })).toEqual({ moderate_min: 0 });
    expect(mapSleep({})).toEqual({});
    expect(mapActivity({ activityId: 'nope' })).toBeNull();
  });
});

import { mapStressDetails, mapRespiration, mapPulseOx, mapUserMetrics, mapSnapshot, isWomensHealth } from './push.js';

describe('Stage B types', () => {
  it('Stress Details → average stress (ignoring "couldn’t measure") and body battery high / low', () => {
    expect(mapStressDetails({
      timeOffsetStressLevelValues: { 0: 20, 180: 40, 360: -1, 540: 30 },
      timeOffsetBodyBatteryValues: { 0: 55, 180: 80, 360: 62 },
    })).toEqual({ avg_stress: 30, body_battery_high: 80, body_battery_low: 55 });
    expect(mapStressDetails({})).toEqual({});
  });
  it('Respiration and Pulse Ox are reduced to averages / the lowest reading', () => {
    expect(mapRespiration({ timeOffsetEpochToBreaths: { 0: 14, 900: 16, 1800: 0 } })).toEqual({ resp_avg: 15 });
    expect(mapPulseOx({ timeOffsetSpo2Values: { 0: 97, 60: 95, 120: 93 } })).toEqual({ spo2_avg: 95, spo2_min: 93 });
  });
  it('User Metrics → VO2 max and fitness age', () => {
    expect(mapUserMetrics({ vo2Max: 52.5, fitnessAge: 24 })).toEqual({ vo2_max: 52.5, fitness_age: 24 });
  });
  it('Health Snapshot → one reading with its summaries pulled out', () => {
    const s = mapSnapshot({
      userId: 'u1', summaryId: 'snap-1', calendarDate: '2026-11-04', startTimeInSeconds: 1793700000, durationInSeconds: 120,
      summaries: [
        { summaryType: 'heart_rate', avgValue: 58 }, { summaryType: 'rmssd_hrv', avgValue: 71.2 },
        { summaryType: 'respiration', avgValue: 14.5 }, { summaryType: 'spo2', avgValue: 97 }, { summaryType: 'stress', avgValue: 22 },
      ],
    });
    expect(s).toMatchObject({ summary_id: 'snap-1', day: '2026-11-04', duration_s: 120, hr_avg: 58, hrv_rmssd: 71.2, resp_avg: 14.5, spo2_avg: 97, stress_avg: 22 });
  });
  it('parsePush routes them and merges derived daily numbers without a raw copy', () => {
    const out = parsePush({
      stressDetails: [{ userId: 'u1', calendarDate: '2026-11-04', timeOffsetBodyBatteryValues: { 0: 90, 60: 40 } }],
      userMetrics: [{ userId: 'u1', calendarDate: '2026-11-04', vo2Max: 50 }],
      healthSnapshot: [{ userId: 'u1', summaryId: 's', startTimeInSeconds: 1793700000, summaries: [] }],
      manuallyUpdatedActivities: [{ userId: 'u1', activityId: 9, activityType: 'RUNNING', startTimeInSeconds: 1793700000, durationInSeconds: 60 }],
    });
    expect(out.daily.map(d => d.cols)).toEqual([{ body_battery_high: 90, body_battery_low: 40 }, { vo2_max: 50 }]);
    expect(out.daily.every(d => d.rawCol === null)).toBe(true);
    expect(out.snapshots).toHaveLength(1);
    expect(out.activities[0].row.activity_id).toBe(9);
  });
  it('never stores women’s-health data — it is skipped and only named as ignored', () => {
    expect(isWomensHealth('menstrualCycleTracking')).toBe(true);
    expect(isWomensHealth('dailies')).toBe(false);
    const out = parsePush({ menstrualCycleTracking: [{ userId: 'u1', calendarDate: '2026-11-04', periodDay: 2 }], mct: [{ userId: 'u1' }] });
    expect(out.daily).toEqual([]);
    expect(out.ignored).toEqual(['menstrualCycleTracking', 'mct']);
  });
});
