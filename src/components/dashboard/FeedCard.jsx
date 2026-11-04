import { Avatar, Chip, DashCard, Empty, Scroll } from './parts';

/** A short activity list: when, who and what, and a tag. Used for "Wellbeing & fuelling" and "Training & performance". */
export default function FeedCard({ icon, title, subtitle, items, loading, athleteById, onOpenAthlete, onViewAll, empty }) {
  return (
    <DashCard icon={icon} title={title} subtitle={subtitle} onViewAll={onViewAll}>
      {loading ? <Empty>Loading…</Empty> : items.length === 0 ? <Empty>{empty}</Empty> : (
        <Scroll className="max-h-[420px]">
          <ul className="divide-y divide-ink-100">
            {items.map(it => {
              const a = athleteById.get(it.athleteId);
              return (
                <li key={it.id}>
                  <button onClick={() => onOpenAthlete(it.athleteId, it.openTab ? { tab: it.openTab } : undefined)}
                    className="w-full flex items-center gap-3 py-2 text-left hover:bg-ink-50 transition-colors">
                    <Avatar athlete={a} size={30} />
                    <span className="flex-1 min-w-0 text-meta text-ink-700">
                      <b className="text-ink-900">{a?.name || 'Athlete'}</b> {it.text}
                      <span className="block text-micro text-ink-400">{it.when}</span>
                    </span>
                    <Chip tone={it.tone}>{it.tag}</Chip>
                  </button>
                </li>
              );
            })}
          </ul>
        </Scroll>
      )}
    </DashCard>
  );
}
