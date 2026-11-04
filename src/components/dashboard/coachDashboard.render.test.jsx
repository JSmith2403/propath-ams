import { describe, it, expect } from 'vitest';
import { renderToString as render } from 'react-dom/server';

// React inserts <!-- --> between adjacent text nodes; drop them so text assertions read naturally.
const renderToString = (el) => render(el).replace(/<!-- -->/g, '');
import AttentionCard from './AttentionCard';
import AthleteOverviewCard from './AthleteOverviewCard';
import InPersonStrip from './InPersonStrip';
import FeedCard from './FeedCard';
import { Heart } from 'lucide-react';

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
    expect(html).toContain('Needing coach attention');
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

  it('InPersonStrip tells apart two athletes with the same first name', () => {
    const days = [
      { date: '2026-11-04', hasSlots: true, attending: ['a', 'b'], pending: ['c'], notComing: [] },
      { date: '2026-11-05', hasSlots: false, attending: [], pending: [], notComing: [] },
    ];
    const html = renderToString(<InPersonStrip athletes={athletes} days={days} today="2026-11-04" reminders={{ state: {}, send: () => {} }} onRemind={() => {}} onViewTimetable={() => {}} />);
    expect(html).toContain('Maha A.');
    expect(html).toContain('Maha K.');
    expect(html).toContain('1 no reply');
    expect(html).toContain('No group session');
  });

  it('InPersonStrip says so when no timetable is published', () => {
    const html = renderToString(<InPersonStrip athletes={athletes} days={[{ date: '2026-11-04', hasSlots: false, attending: [], pending: [], notComing: [] }]} today="2026-11-04" reminders={{ state: {}, send: () => {} }} onRemind={() => {}} onViewTimetable={() => {}} />);
    expect(html).toContain('No timetable published for this week');
  });

  it('FeedCard renders items and the empty state', () => {
    const items = [{ id: '1', athleteId: 'a', when: '5 min ago', text: 'checked in.', tag: 'Good', tone: { fg: '#15803d', bg: '#dcfce7' } }];
    expect(renderToString(<FeedCard icon={Heart} title="T" items={items} loading={false} athleteById={byId} onOpenAthlete={() => {}} empty="none" />)).toContain('checked in.');
    expect(renderToString(<FeedCard icon={Heart} title="T" items={[]} loading={false} athleteById={byId} onOpenAthlete={() => {}} empty="Nothing here" />)).toContain('Nothing here');
  });
});
