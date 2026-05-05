import { Dumbbell, TrendingUp, BookOpen } from 'lucide-react';

// Resources isn't a top-level tab — it's a section at the bottom of
// Training. The button here just signals 'scroll me down to it' (handled
// by the parent), so we never mark it as active.
const TABS = [
  { id: 'train',     label: 'Training',  icon: Dumbbell   },
  { id: 'progress',  label: 'Progress',  icon: TrendingUp },
  { id: 'resources', label: 'Resources', icon: BookOpen   },
];

export default function TabBar({ active, onChange }) {
  return (
    <nav
      className="fixed bottom-0 left-1/2 z-30 flex w-full bg-white border-t border-ink-100 shadow-raised"
      style={{
        paddingBottom: 'env(safe-area-inset-bottom)',
        maxWidth: 480,
        transform: 'translateX(-50%)',
      }}
    >
      {TABS.map(({ id, label, icon: Icon }) => {
        // Resources is a scroll-shortcut, not a route — it never lights up.
        const isActive = active === id && id !== 'resources';
        return (
          <button
            key={id}
            onClick={() => onChange(id)}
            className="flex-1 flex flex-col items-center gap-1 py-3 transition-colors"
            style={{ color: isActive ? '#A58D69' : '#9ca3af' }}
          >
            <Icon size={20} strokeWidth={isActive ? 2.4 : 1.8} />
            <span className="text-[10px] font-semibold tracking-wide uppercase">{label}</span>
          </button>
        );
      })}
    </nav>
  );
}
