/**
 * Horizontal tab bar with the gold-underline active state used across
 * the AMS. Replaces the locally-defined SubTabBar pattern in
 * ProgrammeModule, PhysicalDevelopmentTab, etc.
 *
 *   tabs    [{ id, label, count? }]
 *   active  current id
 *   onChange(id)
 *   size    sm | md (default md)
 */
const SIZES = {
  sm: { pad: 'px-3 py-2',   text: 'text-meta', gap: 'gap-1.5', countPx: 'px-1.5 py-px text-[10px]' },
  md: { pad: 'px-4 py-2.5', text: 'text-body', gap: 'gap-2',   countPx: 'px-1.5 py-0.5 text-[10px]' },
};

export default function TabBar({
  tabs,
  active,
  onChange,
  size = 'md',
  className = '',
}) {
  const cfg = SIZES[size] || SIZES.md;
  return (
    <div className={`border-b border-ink-200 ${className}`} role="tablist">
      <div className="flex">
        {tabs.map(t => {
          const isOn = t.id === active;
          return (
            <button
              key={t.id}
              role="tab"
              aria-selected={isOn}
              onClick={() => onChange(t.id)}
              className={`relative inline-flex items-center ${cfg.gap} ${cfg.pad} ${cfg.text} font-medium transition-colors duration-150 ease-soft`}
              style={{
                color: isOn ? '#A58D69' : '#6b7280',
                borderBottom: isOn ? '2px solid #A58D69' : '2px solid transparent',
                marginBottom: -1, // overlap the parent border so the gold line replaces it cleanly
              }}
            >
              {t.label}
              {t.count != null && (
                <span
                  className={`rounded-full font-bold ${cfg.countPx}`}
                  style={{
                    backgroundColor: isOn ? 'rgba(165,141,105,0.15)' : '#f3f4f6',
                    color:           isOn ? '#A58D69' : '#9ca3af',
                  }}
                >
                  {t.count}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
