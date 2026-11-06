import { CalendarClock, CheckCircle2, ChevronRight, HeartPulse, Laptop, UtensilsCrossed, Users } from 'lucide-react';

const TEAL = '#437E8D';

function Tile({ icon: Icon, tone = TEAL, value, label, pill, onClick, active, title }) {
  const Tag = onClick ? 'button' : 'div';
  return (
    <Tag onClick={onClick} aria-pressed={onClick ? !!active : undefined} title={title}
      className="flex items-center gap-3 rounded-xl border bg-white px-4 py-3 text-left shadow-card min-w-0"
      style={{ borderColor: active ? '#A58D69' : '#f4f4f5', boxShadow: active ? '0 0 0 3px rgba(165,141,105,0.3)' : undefined }}>
      <Icon size={30} style={{ color: tone }} className="shrink-0" />
      <span className="min-w-0 flex-1">
        <span className="flex items-baseline gap-2 flex-wrap">
          <span className="text-h2 font-bold text-ink-900 leading-none whitespace-nowrap">{value}</span>
          {pill != null && <span className="text-[11px] font-bold rounded-md px-1.5 py-0.5" style={{ background: '#dcfce7', color: '#15803d' }}>{pill}%</span>}
        </span>
        <span className="block text-meta text-ink-500 truncate">{label}</span>
      </span>
    </Tag>
  );
}

/** The headline numbers. The "need" tiles filter the athlete table; the meals tile opens the nutritional overview. */
export default function KpiStrip({ kpi, athleteById, activeFilter, onFilter, onOpenNutrition }) {
  if (!kpi) return null;
  const s = kpi.sessionsToday;
  const mealAthlete = kpi.meals ? athleteById.get(kpi.meals.athleteId) : null;
  const first = (mealAthlete?.name || '').split(' ')[0];
  return (
    <div className="grid gap-3 grid-cols-2 lg:grid-cols-3 xl:grid-cols-[repeat(5,minmax(0,1fr))_minmax(0,1.6fr)]">
      <Tile icon={Users} value={kpi.total} label="Total athletes" />
      <Tile icon={CheckCircle2} tone="#15803d" value={s.planned ? `${s.done} / ${s.planned}` : '–'} pill={kpi.sessionsPct} label={s.planned ? 'Sessions today' : 'No sessions planned today'} />
      <Tile icon={Laptop} value={kpi.needProgramming} label="Need programming" onClick={() => onFilter('programme')} active={activeFilter === 'programme'} title="Show only these athletes" />
      <Tile icon={CalendarClock} value={kpi.needCheckIn} label="Need check-in" onClick={() => onFilter('checkin')} active={activeFilter === 'checkin'} title="Show only these athletes" />
      <Tile icon={HeartPulse} tone="#b91c1c" value={`${kpi.wellness.done} / ${kpi.wellness.expected}`} pill={kpi.wellnessPct} label="Wellness compliant" />
      <button onClick={onOpenNutrition} className="flex items-center gap-3 rounded-xl px-4 py-3 text-left min-w-0 col-span-2 lg:col-span-1 hover:brightness-95" style={{ background: '#e6eff2' }}>
        <UtensilsCrossed size={30} style={{ color: TEAL }} className="shrink-0" />
        <span className="min-w-0 flex-1 text-meta font-semibold text-ink-900">
          {kpi.meals ? <>{first} <span className="font-bold">{kpi.meals.count}</span> meal{kpi.meals.count === 1 ? '' : 's'} submitted in 24 hours<span className="block text-micro font-normal text-ink-500">{kpi.meals.total} in total across the squad</span></> : 'No meals submitted in the last 24 hours'}
        </span>
        <ChevronRight size={16} className="text-ink-400 shrink-0" />
      </button>
    </div>
  );
}
