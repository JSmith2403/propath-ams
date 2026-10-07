import { Dumbbell, TrendingUp, Apple, BookOpen, MessageCircle } from 'lucide-react';

// Resources isn't a top-level tab — it's a section at the bottom of
// Training. The button here just signals 'scroll me down to it' (handled
// by the parent), so we never mark it as active.
//
// Messages isn't a tab either — it opens the inbox sheet over whatever
// tab you're on (handled by the parent). Its red badge is the unread count.
//
// Progress hosts both the quarterly report (once the coach sends it)
// and testing data — there's no separate Report tab, see ProgressTab.jsx.
const TABS = [
  { id: 'train',     label: 'Training',  icon: Dumbbell      },
  { id: 'progress',  label: 'Progress',  icon: TrendingUp    },
  { id: 'nutrition', label: 'Nutrition', icon: Apple         },
  { id: 'messages',  label: 'Messages',  icon: MessageCircle },
  { id: 'resources', label: 'Resources', icon: BookOpen      },
];

const SCROLL_OR_OVERLAY = new Set(['resources', 'messages']);

export default function TabBar({ active, onChange, badges = {} }) {
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
        // Resources / Messages aren't routes — they never light up as "active".
        const isActive = active === id && !SCROLL_OR_OVERLAY.has(id);
        const badge = badges[id] || 0;
        return (
          <button
            key={id}
            onClick={() => onChange(id)}
            className="flex-1 flex flex-col items-center gap-1 py-3 transition-colors"
            style={{ color: isActive ? '#A58D69' : '#9ca3af' }}
            aria-label={badge ? `${label}, ${badge} unread` : label}
          >
            <span className="relative">
              <Icon size={20} strokeWidth={isActive ? 2.4 : 1.8} />
              {badge > 0 && (
                <span
                  className="absolute -top-1.5 -right-2.5 min-w-[16px] h-4 px-1 rounded-full text-[9px] font-bold text-white flex items-center justify-center"
                  style={{ backgroundColor: '#dc2626' }}
                >
                  {badge > 9 ? '9+' : badge}
                </span>
              )}
            </span>
            <span className="text-[10px] font-semibold tracking-wide uppercase">{label}</span>
          </button>
        );
      })}
    </nav>
  );
}
