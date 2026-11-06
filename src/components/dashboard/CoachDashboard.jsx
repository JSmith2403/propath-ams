import { useMemo, useState } from 'react';
import { ArrowLeft, ChevronLeft, ChevronRight, Dumbbell, Heart } from 'lucide-react';
import { useCoachDashboard } from '../../hooks/useCoachDashboard';
import { useRecentUpdates } from '../../hooks/useRecentUpdates';
import { useReminders } from '../../lib/reminders';
import { addDaysISO, mondayOf } from '../../utils/timetable';
import { CHIPS } from '../../utils/weekBoard';
import RecentUpdatesView from '../recent/RecentUpdatesView';
import UpcomingCard from './UpcomingCard';
import AthleteOverviewCard from './AthleteOverviewCard';
import AttentionCard from './AttentionCard';
import FeedCard from './FeedCard';
import HandsOffCard from './HandsOffCard';
import InPersonStrip from './InPersonStrip';
import NutritionalOverview from './NutritionalOverview';
import { GOLD, RAG, relTime } from './parts';

const greeting = () => {
  const h = new Date().getHours();
  return h < 12 ? 'Good morning' : h < 18 ? 'Good afternoon' : 'Good evening';
};

const SECTIONS = [{ key: 'athlete', label: 'Athlete overview' }, { key: 'nutrition', label: 'Nutritional overview' }];
const loadSection = () => { try { return window.localStorage.getItem('dash:section') === 'nutrition' ? 'nutrition' : 'athlete'; } catch { return 'athlete'; } };

const CHIP_STYLE = {
  red: { bg: '#dc2626', fg: '#ffffff', border: '#dc2626' },
  gold: { bg: '#C9982E', fg: '#1C1C1C', border: '#C9982E' },
  plain: { bg: '#ffffff', fg: '#085777', border: '#085777' },
};
const TAG = {
  good: { fg: RAG.green.fg, bg: RAG.green.bg }, watch: { fg: RAG.amber.fg, bg: RAG.amber.bg }, flagged: { fg: RAG.red.fg, bg: RAG.red.bg },
  grey: { fg: '#52525b', bg: '#f4f4f5' }, done: { fg: '#085777', bg: '#dfe9ed' }, pb: { fg: '#6f5e3e', bg: '#f1eadc' },
};

/** Turns the shared updates feed into the two short lists the dashboard shows. */
function splitFeeds(updates, athleteById) {
  const mine = updates.filter(u => athleteById.has(u.athlete_id));
  const well = mine.filter(u => u.type === 'wellness' || u.type === 'meal').slice(0, 10).map(u => {
    if (u.type === 'meal') return { id: u.id, athleteId: u.athlete_id, when: relTime(u.timestamp), text: `logged ${u.meal_type || 'a meal'}.`, tag: 'Nutrition', tone: TAG.grey };
    const bits = [u.sleepHours != null && `Slept ${u.sleepHours} h`, u.flaggedCount > 0 && `${u.flaggedCount} flagged`].filter(Boolean).join(' · ');
    const tag = u.rag === 'red' ? ['Flagged', TAG.flagged] : u.rag === 'amber' ? ['Watch', TAG.watch] : u.rag === 'green' ? ['Good', TAG.good] : ['Logged', TAG.grey];
    return { id: u.id, athleteId: u.athlete_id, when: relTime(u.timestamp), text: `checked in.${bits ? ` ${bits}.` : ''}`, tag: tag[0], tone: tag[1], openTab: 'wellness' };
  });
  const train = mine.filter(u => u.type === 'session' || u.type === 'pb').slice(0, 10).map(u => {
    if (u.type === 'pb') return { id: u.id, athleteId: u.athlete_id, when: relTime(u.timestamp), text: `new PB: ${u.exercise_name}${u.e1rm_kg != null ? `, e1RM ${u.e1rm_kg} kg` : ''}.`, tag: 'PB', tone: TAG.pb };
    const bits = [u.total_rpe != null && `RPE ${u.total_rpe}`, u.duration_min != null && `${u.duration_min} min`].filter(Boolean).join(', ');
    return { id: u.id, athleteId: u.athlete_id, when: relTime(u.timestamp), text: `completed ${u.session_name}.${bits ? ` ${bits}.` : ''}`, tag: 'Done', tone: TAG.done };
  });
  return { well, train };
}

/**
 * The coach dashboard: run the week, decide today.
 *   header + filter chips → who is in this week → what needs attention + athlete overview → two short feeds.
 * Long-term progress and meals don't live here (athlete profile / Nutrition).
 */
export default function CoachDashboard({ athletes, userName, onNavigateToAthlete, onNavigate, ...feedProps }) {
  const [feed, setFeed] = useState(false);
  const [weekStart, setWeekStart] = useState(() => mondayOf());
  const [filter, setFilter] = useState(null);
  const [section, setSectionState] = useState(loadSection);
  const setSection = (k) => { setSectionState(k); try { window.localStorage.setItem('dash:section', k); } catch { /* private mode */ } };
  const reminders = useReminders();
  const athleteById = useMemo(() => new Map(athletes.map(a => [a.id, a])), [athletes]);
  const dash = useCoachDashboard(athletes, weekStart);
  const updates = useRecentUpdates();
  const feeds = useMemo(() => splitFeeds(updates.updates, athleteById), [updates.updates, athleteById]);

  if (feed) {
    return (
      <div className="flex-1 min-h-0 flex flex-col overflow-hidden">
        <button onClick={() => setFeed(false)} className="inline-flex items-center gap-1.5 text-meta font-semibold px-5 py-3 border-b border-ink-100 self-stretch text-left bg-white shrink-0" style={{ color: GOLD }}>
          <ArrowLeft size={14} /> Back to dashboard
        </button>
        <RecentUpdatesView athletes={athletes} onNavigateToAthlete={onNavigateToAthlete} {...feedProps} />
      </div>
    );
  }

  const first = (userName || '').split(/[\s@]/)[0];
  const sectionTabs = (
    <div role="tablist" className="px-4 md:px-6 flex gap-1 border-b border-ink-100 mb-3">
      {SECTIONS.map(t => (
        <button key={t.key} role="tab" aria-selected={section === t.key} onClick={() => setSection(t.key)}
          className="px-4 py-2.5 text-body font-semibold whitespace-nowrap"
          style={{ color: section === t.key ? GOLD : '#71717a', borderBottom: '2px solid ' + (section === t.key ? GOLD : 'transparent'), marginBottom: -1 }}>
          {t.label}
        </button>
      ))}
    </div>
  );
  const greetingBlock = (
    <div className="min-w-0">
      <h1 className="text-h2 font-bold text-ink-900 leading-tight">{greeting()}{first ? ', ' + first : ''}</h1>
      <p className="text-meta text-ink-500">{section === 'nutrition' ? 'Food and hydration submissions from your athletes.' : 'Your week at a glance: who is in, who has trained, and who needs you.'}</p>
    </div>
  );

  if (section === 'nutrition') {
    return (
      <div className="flex-1 min-h-0 overflow-y-auto pb-24 md:pb-4">
        <div className="px-4 md:px-6 pt-4 pb-3">{greetingBlock}</div>
        {sectionTabs}
        <NutritionalOverview athletes={athletes} onNavigateToAthlete={onNavigateToAthlete} />
      </div>
    );
  }
  const thisWeek = weekStart === mondayOf();
  const weekLabel = new Date(`${weekStart}T12:00:00`).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
  const active = CHIPS.find(c => c.key === filter);
  // Hands-off athletes sit in their own short list; everyone else is in the overview.
  const mainRows = dash.rows.filter(r => r.supportLevel !== 'hands_off');
  const handsOffRows = dash.rows.filter(r => r.supportLevel === 'hands_off');
  const shownRows = active ? mainRows.filter(active.test) : mainRows;

  return (
    <div className="flex-1 min-h-0 overflow-y-auto pb-24 md:pb-4">
      <div className="px-4 md:px-6 pt-4 pb-3 flex flex-wrap items-start justify-between gap-x-6 gap-y-3">
        {greetingBlock}
        <div className="flex flex-col items-start md:items-end gap-2 max-w-full">
          <div className="flex items-center gap-1.5">
            <span className="text-body font-semibold text-ink-900 px-3 py-1.5 rounded-lg border border-ink-200 bg-white">Week of {weekLabel}</span>
            <button aria-label="Previous week" onClick={() => setWeekStart(w => addDaysISO(w, -7))} className="w-9 h-9 rounded-lg border border-ink-200 bg-white flex items-center justify-center hover:bg-ink-50"><ChevronLeft size={16} /></button>
            <button aria-label="Next week" onClick={() => setWeekStart(w => addDaysISO(w, 7))} className="w-9 h-9 rounded-lg border border-ink-200 bg-white flex items-center justify-center hover:bg-ink-50"><ChevronRight size={16} /></button>
            {!thisWeek && <button onClick={() => setWeekStart(mondayOf())} className="text-meta font-semibold px-2.5 h-9 rounded-lg border border-ink-200 bg-white hover:bg-ink-50" style={{ color: GOLD }}>This week</button>}
          </div>
          <div className="flex gap-1.5 overflow-x-auto max-w-full pb-0.5 md:flex-wrap md:justify-end">
            {CHIPS.map(c => {
              const n = dash.rows.filter(c.test).length;
              const s = CHIP_STYLE[c.tone];
              const on = filter === c.key;
              return (
                <button key={c.key} onClick={() => setFilter(on ? null : c.key)} aria-pressed={on}
                  className="shrink-0 inline-flex items-center gap-2 h-9 px-3.5 rounded-full text-meta font-bold whitespace-nowrap transition"
                  style={{ background: n === 0 && !on ? '#ffffff' : s.bg, color: n === 0 && !on ? '#9a9aa0' : s.fg, border: `2px solid ${n === 0 && !on ? '#e5e5e7' : s.border}`, boxShadow: on ? '0 0 0 3px rgba(165,141,105,0.35)' : 'none' }}>
                  {c.label} <span>{n}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {sectionTabs}

      {dash.errors.length > 0 && (
        <p className="mx-4 md:mx-6 mb-2 text-micro rounded-lg px-3 py-1.5" style={{ background: '#fffbeb', color: '#8a4510' }}>
          Some of this couldn’t load ({[...new Set(dash.errors)].join(', ')}). What you see may be incomplete.
        </p>
      )}

      <div className="px-3 md:px-4 pb-4 space-y-3">
        <InPersonStrip athletes={athletes} days={dash.attendance} today={dash.today} reminders={reminders} onRemind={reminders.send} onViewTimetable={() => onNavigate('timetable')} />

        <div className="grid gap-3 xl:grid-cols-[minmax(340px,5fr)_minmax(0,7fr)]">
          <div className="space-y-3 min-w-0">
            <AttentionCard items={dash.attention} loading={dash.loading} athleteById={athleteById} onOpenAthlete={onNavigateToAthlete} onNavigate={onNavigate} reminders={reminders} />
            <UpcomingCard athletes={athletes} athleteById={athleteById} today={dash.today} onOpenAthlete={onNavigateToAthlete} onNavigate={onNavigate} />
          </div>
          <AthleteOverviewCard rows={shownRows} total={mainRows.length} loading={dash.loading} filterLabel={active?.label} onClearFilter={() => setFilter(null)} onOpenAthlete={onNavigateToAthlete} />
        </div>

        <HandsOffCard rows={handsOffRows} onOpenAthlete={onNavigateToAthlete} />

        <div className="grid gap-3 lg:grid-cols-2">
          <FeedCard icon={Heart} title="Wellbeing & fuelling" subtitle="Check-ins and food. Meals are reviewed in the athlete’s profile." items={feeds.well} loading={updates.loading}
            athleteById={athleteById} onOpenAthlete={onNavigateToAthlete} onViewAll={() => setFeed(true)} empty="No check-ins or meals in the last 30 days." />
          <FeedCard icon={Dumbbell} title="Training & performance" subtitle="Sessions completed and new PBs." items={feeds.train} loading={updates.loading}
            athleteById={athleteById} onOpenAthlete={onNavigateToAthlete} onViewAll={() => setFeed(true)} empty="No completed sessions in the last 30 days." />
        </div>
      </div>
    </div>
  );
}
