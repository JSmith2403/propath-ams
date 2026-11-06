import { ArrowDown, ArrowUp, Info, Lightbulb, Minus, Trophy, UtensilsCrossed, Dumbbell, Zap } from 'lucide-react';
import { Avatar, DashCard, relTime } from './parts';

const TEAL = '#437E8D';
const ICON = { up: { Icon: ArrowUp, color: '#15803d' }, down: { Icon: ArrowDown, color: '#b91c1c' }, flat: { Icon: Minus, color: '#71717a' }, info: { Icon: Info, color: TEAL } };

function Highlight({ athlete, icon: Icon, title, line, when, badge, onOpen }) {
  return (
    <button onClick={onOpen} className="flex items-start gap-3 rounded-xl border border-ink-100 bg-white px-4 py-3 text-left shadow-card hover:bg-ink-50 min-w-0">
      {athlete ? <Avatar athlete={athlete} size={42} /> : <Icon size={30} style={{ color: TEAL }} className="shrink-0 mt-1" />}
      <span className="min-w-0 flex-1">
        <span className="flex items-center gap-2"><Icon size={14} style={{ color: TEAL }} className="shrink-0" /><span className="text-body font-bold text-ink-900 truncate">{title}</span></span>
        <span className="block text-meta text-ink-700 truncate">{line}</span>
        <span className="block text-micro text-ink-400 mt-0.5">{when}</span>
      </span>
      {badge && <span className="text-[10px] font-bold rounded-md px-1.5 py-0.5 shrink-0" style={{ background: '#e6dcc4', color: '#6f5e3e' }}>{badge}</span>}
    </button>
  );
}

/**
 * Recent activity: the latest completed session, personal best and meal, next to a short list of
 * things worth knowing about the squad. The full lists are in the two feeds underneath.
 */
export default function RecentHighlights({ updates, athleteById, insights, loading, onOpenAthlete }) {
  const mine = updates.filter(u => athleteById.has(u.athlete_id));
  const session = mine.find(u => u.type === 'session');
  const pb = mine.find(u => u.type === 'pb');
  const meal = mine.find(u => u.type === 'meal');
  const name = (u) => athleteById.get(u.athlete_id)?.name || 'Athlete';

  return (
    <DashCard icon={Zap} title="Recent activity">
      <div className="grid gap-3 lg:grid-cols-2 xl:grid-cols-[1fr_1fr_1fr_1.1fr]">
        {session ? (
          <Highlight athlete={athleteById.get(session.athlete_id)} icon={Dumbbell} title={session.session_name} line={`Completed by ${name(session)}`} when={relTime(session.timestamp)} badge={session.pb_count > 0 ? 'PB' : null} onOpen={() => onOpenAthlete(session.athlete_id)} />
        ) : <p className="text-meta text-ink-400 self-center">{loading ? 'Loading…' : 'No completed sessions yet.'}</p>}
        {pb ? (
          <Highlight athlete={athleteById.get(pb.athlete_id)} icon={Trophy} title="New PB" line={`${name(pb)} · ${pb.exercise_name}${pb.e1rm_kg != null ? ` ${pb.e1rm_kg} kg` : ''}`} when={relTime(pb.timestamp)} onOpen={() => onOpenAthlete(pb.athlete_id)} />
        ) : <p className="text-meta text-ink-400 self-center">{loading ? '' : 'No new PBs lately.'}</p>}
        {meal ? (
          <Highlight athlete={athleteById.get(meal.athlete_id)} icon={UtensilsCrossed} title="Meal logged" line={`by ${name(meal)} · ${meal.meal_type}`} when={relTime(meal.timestamp)} onOpen={() => onOpenAthlete(meal.athlete_id)} />
        ) : <p className="text-meta text-ink-400 self-center">{loading ? '' : 'No meals logged lately.'}</p>}

        <div className="rounded-xl px-4 py-3" style={{ background: '#e6eff2' }}>
          <p className="flex items-center gap-2 text-body font-bold text-ink-900 mb-1.5"><Lightbulb size={16} style={{ color: TEAL }} /> Key insights</p>
          {insights.length === 0 ? <p className="text-meta text-ink-500">Insights appear once there is data to compare.</p> : (
            <ul className="space-y-1.5">
              {insights.map((i, k) => {
                const { Icon, color } = ICON[i.tone] || ICON.info;
                return (
                  <li key={k} className="flex items-start gap-2 text-meta text-ink-800">
                    <span className="mt-px w-4 h-4 rounded-full flex items-center justify-center shrink-0" style={{ background: color }}><Icon size={10} color="#fff" strokeWidth={3} /></span>
                    {i.text}
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </div>
    </DashCard>
  );
}
