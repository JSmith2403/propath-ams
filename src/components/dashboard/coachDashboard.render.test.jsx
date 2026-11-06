import { describe, it, expect } from 'vitest';
import { renderToString as render } from 'react-dom/server';

// React inserts <!-- --> between adjacent text nodes; drop them so text assertions read naturally.
const renderToString = (el) => render(el).replace(/<!-- -->/g, '');
import AttentionCard from './AttentionCard';
import AthleteOverviewCard from './AthleteOverviewCard';
import InPersonStrip from './InPersonStrip';
import FeedCard from './FeedCard';
import { Heart } from 'lucide-react';
import KpiStrip from './KpiStrip';
import RecentHighlights from './RecentHighlights';

const athletes = [
  { id: 'a', name: 'Maha Ali', cohort: 'Elite' }, { id: 'b', name: 'Maha Khan', cohort: 'Elite' }, { id: 'c', name: 'Omar S', cohort: 'Gold' },
];
const byId = new Map(athletes.map(a => [a.id, a]));
const reminders = { state: { chase: 'sent' }, send: () => {} };
const row = (a, over = {}) => ({
  id: a.id, name: a.name, athlete: a, programmingActive: true, sessions: { done: 1, planned: 3 }, missed: 0,
  runway: { state: 'ok', last: '2026-11-20', days: 16 }, checkIn: { state: 'green', expected: true, flagged: [], pain: false, streak: 0 },
  watch: { state: 'none' }, timetablePending: false, verdict: { label: 'On track', tone: 'go' }, ...over,
});

describe('coach dashboard components render', () => {
  it('AttentionCard shows items, group counts and states', () => {
    const items = [
      { id: 'flag:a', tone: 'red', tag: 'Pain', who: 'Maha Ali', ids: ['a'], action: 'open', what: 'Reported pain in today’s check-in.' },
      { id: 'chase', tone: 'amber', tag: 'Check-in', who: '2 athletes', ids: ['b', 'c'], action: 'remind-checkin', what: 'No check-in today: Maha Khan, Omar S.' },
    ];
    const html = renderToString(<AttentionCard items={items} loading={false} athleteById={byId} onOpenAthlete={() => {}} onNavigate={() => {}} reminders={reminders} />);
    expect(html).toContain('Needs you today');
    expect(html).toContain('Reported pain');
    expect(html).toContain('Sent');
    expect(renderToString(<AttentionCard items={[]} loading={false} athleteById={byId} onOpenAthlete={() => {}} onNavigate={() => {}} reminders={reminders} />)).toContain('Nothing needs you');
  });

  it('AthleteOverviewCard renders rows, rings and discs, and a filter label', () => {
    const rows = [row(athletes[0], { verdict: { label: 'Pain reported', tone: 'act' }, checkIn: { state: 'red', expected: true, flagged: [], pain: true, streak: 0 } }), row(athletes[2], { watch: { state: 'ok' } })];
    const html = renderToString(<AthleteOverviewCard rows={rows} total={3} loading={false} filterLabel="Check-in flagged" onClearFilter={() => {}} onOpenAthlete={() => {}} />);
    expect(html).toContain('Pain reported');
    expect(html).toContain('1/3');
    expect(html).toContain('Check-in flagged');
  });

  it('AthleteOverviewCard lines each athlete up as a row with sleep, HRV, readiness and activity', () => {
    const garmin = {
      day: '2026-11-04',
      sleep: { value: 7.7, avg: 7.5, delta: 0.2, dir: 'up' },
      hrv: { value: 61, avg: 69, delta: -8, dir: 'down' },
      kcal: { value: 3760, avg: 3500, delta: 260, dir: 'up' },
      intensity: null, battery: 82, batteryBand: 'green',
      series: { sleep: [7, 7.2, 7.4, 7.5, 7.6, 7.7, 7.5, 7.4, 7.6, 7.7, 7.5, 7.6, 7.7, 7.7], hrv: [], battery: [70, 75, 80, 78, 82, 80, 79, 81, 82, 80, 83, 81, 82, 82], intensity: [], kcal: [3000, 3100, 3200, 3300, 3400, 3500, 3600, 3500, 3400, 3500, 3600, 3700, 3750, 3760] },
    };
    const rows = [row(athletes[0], { garmin, checkIn: { state: 'green', expected: true, flagged: [], pain: false, streak: 0, readiness: 3, readinessRag: 'amber' } })];
    const html = renderToString(<AthleteOverviewCard rows={rows} total={1} loading={false} onClearFilter={() => {}} onOpenAthlete={() => {}} />);
    expect(html).toContain('Sleep &amp; recovery');
    expect(html).toContain('7h 42m');
    expect(html).toContain('+12m');
    expect(html).toContain('61');
    expect(html).toContain('-8');
    expect(html).toContain('3/7');             // self-reported readiness
    expect(html).toContain('82');              // Garmin body battery
    expect(html).toContain('≠');               // feel (amber) and watch (green) disagree
    expect(html).toContain('3,760');
    expect(html).toContain('<polyline');       // a trend line is drawn
    expect(html).toContain('Active calories'); // no intensity readings yet, so calories only
  });

  it('KpiStrip shows the headline numbers and the meals tile', () => {
    const kpi = { total: 18, sessionsToday: { planned: 18, done: 16 }, sessionsPct: 89, needProgramming: 2, needCheckIn: 3, wellness: { done: 17, expected: 18 }, wellnessPct: 94, meals: { athleteId: 'a', count: 7, total: 20 } };
    const html = renderToString(<KpiStrip kpi={kpi} athleteById={byId} activeFilter={null} onFilter={() => {}} onOpenNutrition={() => {}} />);
    expect(html).toContain('16 / 18');
    expect(html).toContain('89%');
    expect(html).toContain('Need programming');
    expect(html).toContain('17 / 18');
    expect(html).toContain('Maha');
    expect(html).toContain('7</span> meals submitted in 24 hours');
  });

  it('RecentHighlights shows the latest session, PB and meal with insights', () => {
    const updates = [
      { id: 's', type: 'session', athlete_id: 'a', session_name: 'Session C', timestamp: new Date().toISOString(), pb_count: 1 },
      { id: 'p', type: 'pb', athlete_id: 'b', exercise_name: 'Back Squat', e1rm_kg: 140, timestamp: new Date().toISOString() },
      { id: 'm', type: 'meal', athlete_id: 'c', meal_type: 'breakfast', timestamp: new Date().toISOString() },
    ];
    const html = renderToString(<RecentHighlights updates={updates} athleteById={byId} loading={false} onOpenAthlete={() => {}} insights={[{ tone: 'down', text: 'Sleep down 18% vs last week' }]} />);
    expect(html).toContain('Session C');
    expect(html).toContain('New PB');
    expect(html).toContain('Back Squat 140 kg');
    expect(html).toContain('Meal logged');
    expect(html).toContain('Key insights');
    expect(html).toContain('Sleep down 18% vs last week');
  });

  it('InPersonStrip tells apart two athletes with the same first name', () => {
    const days = [
      { date: '2026-11-04', hasSlots: true, attending: ['a', 'b'], pending: ['c'], notComing: [], programme: ['c'], expected: ['a', 'b', 'c'] },
      { date: '2026-11-05', hasSlots: false, attending: [], pending: [], notComing: [], programme: [], expected: [] },
    ];
    const html = renderToString(<InPersonStrip athletes={athletes} days={days} today="2026-11-04" reminders={{ state: {}, send: () => {} }} onRemind={() => {}} onViewTimetable={() => {}} />);
    expect(html).toContain('Maha A.');
    expect(html).toContain('Maha K.');
    expect(html).toContain('No reply to the timetable: Omar');
    expect(html).toContain('3 athletes');
    expect(html).toContain('3 expected');
    expect(html).toContain('Own programme');
    expect(html).toContain('Rest day');
  });

  it('InPersonStrip still shows own-programme days when no timetable is published', () => {
    const html = renderToString(<InPersonStrip athletes={athletes} days={[{ date: '2026-11-04', hasSlots: false, attending: [], pending: [], notComing: [], programme: ['a'], expected: ['a'] }]} today="2026-11-04" reminders={{ state: {}, send: () => {} }} onRemind={() => {}} onViewTimetable={() => {}} />);
    expect(html).toContain('No group session');
    expect(html).toContain('1 expected');
  });

  it('FeedCard renders items and the empty state', () => {
    const items = [{ id: '1', athleteId: 'a', when: '5 min ago', text: 'checked in.', tag: 'Good', tone: { fg: '#15803d', bg: '#dcfce7' } }];
    expect(renderToString(<FeedCard icon={Heart} title="T" items={items} loading={false} athleteById={byId} onOpenAthlete={() => {}} empty="none" />)).toContain('checked in.');
    expect(renderToString(<FeedCard icon={Heart} title="T" items={[]} loading={false} athleteById={byId} onOpenAthlete={() => {}} empty="Nothing here" />)).toContain('Nothing here');
  });
});
