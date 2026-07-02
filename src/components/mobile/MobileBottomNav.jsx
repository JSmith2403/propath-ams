import { Activity, Bell, Database, Dumbbell, Users } from 'lucide-react';

/**
 * MobileBottomNav — fixed-position bottom nav for phones (md: breakpoint
 * and below). Five thumb-reachable icons that mirror the desktop sidebar
 * items the coach uses most, per user call:
 *
 *   1. Recent Updates      — Facebook-notification-style feed
 *   2. Athlete Management  — the roster
 *   3. Data Management     — bulk data entry
 *   4. Programme           — the master programme view
 *   5. Wellness            — wellness overview
 *
 * The desktop sidebar's other items (Sessions, Shared Calendar,
 * Resources, Users, Mental Skills) intentionally don't appear here —
 * coaches use those less often, and 5 items is the ergonomic ceiling
 * for a bottom nav.
 *
 * Renders only on mobile (`md:hidden`). Sidebar carries the same
 * navigation on desktop.
 */
export default function MobileBottomNav({ view, onNavigate }) {
  const items = [
    { key: 'updates',    label: 'Updates',  icon: Bell     },
    { key: 'roster',     label: 'Athletes', icon: Users    },
    { key: 'dataentry',  label: 'Data',     icon: Database },
    { key: 'programme',  label: 'Programme', icon: Dumbbell },
    { key: 'wellness',   label: 'Wellness', icon: Activity },
  ];

  return (
    <nav
      className="md:hidden fixed bottom-0 left-0 right-0 z-40 flex items-stretch"
      style={{
        backgroundColor: '#1C1C1C',
        borderTop: '1px solid rgba(255,255,255,0.08)',
        // Respect the iOS safe area so the bar sits above the home indicator
        paddingBottom: 'env(safe-area-inset-bottom, 0px)',
      }}
      aria-label="Primary navigation"
    >
      {items.map(({ key, label, icon: Icon }) => {
        const active = view === key
          // Profile view is a child of the roster — highlight Athletes
          // when the coach is inside an athlete profile so the nav
          // reflects "where they are" not "where they clicked from".
          || (key === 'roster' && view === 'profile');
        return (
          <button
            key={key}
            onClick={() => onNavigate(key)}
            className="flex-1 flex flex-col items-center justify-center gap-0.5 py-2 transition-colors"
            style={{
              color: active ? '#A58D69' : 'rgba(255,255,255,0.55)',
              backgroundColor: active ? 'rgba(165,141,105,0.08)' : 'transparent',
            }}
            aria-current={active ? 'page' : undefined}
            aria-label={label}
          >
            <Icon size={20} strokeWidth={active ? 2.4 : 2} />
            <span className="text-[10px] font-semibold tracking-wide">{label}</span>
          </button>
        );
      })}
    </nav>
  );
}
