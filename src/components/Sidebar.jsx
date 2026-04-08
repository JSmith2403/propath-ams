import { Users, Heart, Calendar, ChevronDown, ChevronRight, Database } from 'lucide-react';

const Logo = () => (
  <div
    className="flex items-center justify-center border-b border-white/10"
    style={{ height: '72px' }}
  >
    <div
      className="rounded"
      style={{
        width: '140px',
        height: '40px',
        backgroundColor: 'rgba(255,255,255,0.06)',
        border: '1px dashed rgba(255,255,255,0.12)',
      }}
    />
  </div>
);

const NavItem = ({ icon: Icon, label, active, disabled, onClick, children, expanded }) => {
  if (disabled) {
    return (
      <div className="px-3 py-1.5">
        <div className="flex items-center gap-3 px-3 py-2 rounded text-white/30 cursor-not-allowed select-none">
          <Icon size={16} className="shrink-0" />
          <span className="text-sm font-medium">{label}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="px-3 py-0.5">
      <div
        onClick={onClick}
        className={`flex items-center gap-3 px-3 py-2 rounded cursor-pointer transition-colors ${
          active
            ? 'text-white'
            : 'text-white/60 hover:text-white hover:bg-white/5'
        }`}
        style={active ? { backgroundColor: 'rgba(165, 141, 105, 0.15)' } : {}}
      >
        <Icon size={16} className="shrink-0" style={active ? { color: '#A58D69' } : {}} />
        <span className="text-sm font-medium flex-1">{label}</span>
        {children && (
          expanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />
        )}
      </div>
      {children && expanded && (
        <div className="ml-4 mt-0.5">
          {children}
        </div>
      )}
    </div>
  );
};

const SubNavItem = ({ label, active, onClick }) => (
  <div
    onClick={onClick}
    className={`flex items-center gap-2 px-3 py-1.5 rounded cursor-pointer transition-colors text-sm ${
      active
        ? 'text-white font-medium'
        : 'text-white/50 hover:text-white/80'
    }`}
    style={active ? { color: '#A58D69' } : {}}
  >
    <div
      className="w-1 h-1 rounded-full shrink-0"
      style={{ backgroundColor: active ? '#A58D69' : 'rgba(255,255,255,0.3)' }}
    />
    {label}
  </div>
);

export default function Sidebar({ view = 'roster', onNavigate = () => {} }) {
  const isRoster    = view === 'roster' || view === 'profile';
  const isDataEntry = view === 'dataentry';

  return (
    <aside
      data-sidebar
      className="h-screen w-60 flex flex-col shrink-0 overflow-y-auto scrollbar-thin no-print"
      style={{ backgroundColor: '#1C1C1C' }}
    >
      <Logo />

      <nav className="flex-1 pt-4 pb-6">
        <div className="px-6 mb-2">
          <p className="text-xs font-semibold uppercase tracking-widest text-white/25">Main</p>
        </div>

        <NavItem
          icon={Users}
          label="Athlete Management"
          active={isRoster}
          expanded={isRoster}
          onClick={() => onNavigate('roster')}
        >
          <SubNavItem
            label="Athlete Roster"
            active={isRoster}
            onClick={() => onNavigate('roster')}
          />
        </NavItem>

        <NavItem
          icon={Database}
          label="Data Entry"
          active={isDataEntry}
          onClick={() => onNavigate('dataentry')}
        />

        <div className="px-6 mt-4 mb-2">
          <p className="text-xs font-semibold uppercase tracking-widest text-white/25">Modules</p>
        </div>

        <NavItem icon={Heart}     label="Wellness"  disabled />
        <NavItem
          icon={Calendar}
          label="Sessions"
          active={view === 'sessions'}
          onClick={() => onNavigate('sessions')}
        />
      </nav>

      <div className="px-6 py-4 border-t border-white/10">
        <p className="text-xs text-white/25">ProPath Academy</p>
        <p className="text-xs text-white/20">Abu Dhabi · Phase 1</p>
      </div>
    </aside>
  );
}
