import { useState } from 'react';
import { Cake, ChevronDown, ChevronRight, ClipboardList, Trophy, Tent, Activity, Users } from 'lucide-react';

const ROWS = [
  { key: 'competitions',   label: 'Competitions',           icon: Trophy,         enabled: true },
  { key: 'training_camps', label: 'Training camps',         icon: Tent,           enabled: true },
  { key: 'testing',        label: 'Testing',                icon: Activity,       enabled: true },
  { key: 'team_events',    label: 'Team events',            icon: Users,          enabled: true },
  { key: 'birthdays',      label: 'Birthdays',              icon: Cake,           enabled: true },
  { key: 'planned',        label: 'Planned training sessions', icon: ClipboardList, enabled: true  },
  { key: 'logged',         label: 'Logged training sessions',  icon: ClipboardList, enabled: false },
];

const SHORT_LABELS = {
  competitions:   'Competitions',
  training_camps: 'Training camps',
  testing:        'Testing',
  team_events:    'Team events',
  birthdays:      'Birthdays',
  planned:        'Planned',
  logged:         'Logged',
};

/**
 * CalendarFilterPanel — toggle which event types appear on the Shared
 * Calendar. Brief 5a Part D.
 *
 *   • Collapsible — chevron flips between expanded checklist and a
 *     single-line summary of the active toggles.
 *   • Two bottom toggles ("Planned" / "Logged") render disabled with a
 *     "Coming soon" tag — Brief 7 wires them up.
 *   • State persistence is handled by useCalendarFilters; this panel
 *     just renders the controls.
 */
export default function CalendarFilterPanel({ filters, onChange }) {
  const [expanded, setExpanded] = useState(true);

  const summary = ROWS
    .filter(r => r.enabled && filters[r.key])
    .map(r => SHORT_LABELS[r.key])
    .join(', ') || 'Nothing';

  return (
    <section
      className="rounded-xl"
      style={{ backgroundColor: '#fff', border: '1px solid #e5e7eb' }}
    >
      <button
        onClick={() => setExpanded(e => !e)}
        className="w-full flex items-center justify-between px-3 py-2.5"
        style={{ color: '#1C1C1C' }}
      >
        <span className="text-[10px] font-bold uppercase tracking-widest" style={{ color: '#6b7280' }}>
          Show on calendar
        </span>
        {expanded ? <ChevronDown size={14} style={{ color: '#9ca3af' }} /> : <ChevronRight size={14} style={{ color: '#9ca3af' }} />}
      </button>

      {expanded ? (
        <div className="px-3 pb-3 pt-1 space-y-1.5">
          {ROWS.map(row => {
            const Icon = row.icon;
            const checked = !!filters[row.key];
            const isDisabled = !row.enabled;
            return (
              <label
                key={row.key}
                className={`flex items-center gap-2.5 py-1 ${isDisabled ? 'cursor-not-allowed' : 'cursor-pointer'}`}
              >
                <input
                  type="checkbox"
                  checked={isDisabled ? false : checked}
                  disabled={isDisabled}
                  onChange={(e) => onChange(row.key, e.target.checked)}
                  className="shrink-0"
                  style={{ accentColor: '#A58D69' }}
                />
                <Icon size={13} style={{ color: isDisabled ? '#d1d5db' : '#6b7280' }} />
                <span
                  className="text-xs flex-1"
                  style={{ color: isDisabled ? '#9ca3af' : '#1C1C1C' }}
                >
                  {row.label}
                </span>
                {isDisabled && (
                  <span
                    className="text-[9px] uppercase tracking-wider px-1.5 py-0.5 rounded"
                    style={{ backgroundColor: '#f3f4f6', color: '#9ca3af' }}
                  >
                    Coming soon
                  </span>
                )}
              </label>
            );
          })}
        </div>
      ) : (
        <div className="px-3 pb-2.5 pt-0.5">
          <p className="text-[11px] truncate" style={{ color: '#6b7280' }}>
            <span className="font-semibold" style={{ color: '#9ca3af' }}>Showing: </span>
            {summary}
          </p>
        </div>
      )}
    </section>
  );
}
