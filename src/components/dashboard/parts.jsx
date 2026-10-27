import { ArrowRight } from 'lucide-react';

export const GOLD = '#A58D69';
export const TEAL = '#437E8D';
export const RAG = {
  green: { label: 'On track',        fg: '#15803d', bg: '#dcfce7' },
  amber: { label: 'At risk',         fg: '#b45309', bg: '#fef3c7' },
  red:   { label: 'Needs attention', fg: '#b91c1c', bg: '#fee2e2' },
  grey:  { label: 'No check-in',     fg: '#6b7280', bg: '#f3f4f6' },
};

export function relTime(iso) {
  if (!iso) return '';
  const mins = Math.round((Date.now() - new Date(iso).getTime()) / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins} min ago`;
  const hrs = Math.round(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.round(hrs / 24);
  return days === 1 ? 'yesterday' : `${days}d ago`;
}

export const fmtSleep = (h) => (h == null ? '—' : `${Math.floor(h)}h ${String(Math.round((h % 1) * 60)).padStart(2, '0')}m`);
export const fmtNum = (n, d = 0) => (n == null ? '—' : Number(n).toFixed(d));

export function Avatar({ athlete, size = 36 }) {
  const name = athlete?.name || '?';
  const initials = name.split(' ').filter(Boolean).slice(0, 2).map(w => w[0].toUpperCase()).join('');
  return athlete?.photo
    ? <img src={athlete.photo} alt="" className="rounded-full object-cover shrink-0" style={{ width: size, height: size }} />
    : (
      <span className="rounded-full flex items-center justify-center font-bold shrink-0"
        style={{ width: size, height: size, fontSize: size * 0.34, backgroundColor: '#085777', color: GOLD }}>
        {initials}
      </span>
    );
}

export function Chip({ tone, children }) {
  return (
    <span className="inline-block text-[11px] font-semibold px-2 py-0.5 rounded-full whitespace-nowrap" style={{ color: tone.fg, backgroundColor: tone.bg }}>
      {children}
    </span>
  );
}

/** Card shell shared by the four dashboard panels. */
export function DashCard({ icon: Icon, title, subtitle, badge, onViewAll, viewAllLabel = 'View all', children }) {
  return (
    <section className="rounded-xl bg-white border border-ink-100 shadow-card overflow-hidden">
      <header className="flex items-start gap-3 px-5 pt-5 pb-3">
        <Icon size={22} style={{ color: GOLD }} className="shrink-0 mt-0.5" />
        <div className="flex-1 min-w-0">
          <h2 className="text-body font-bold text-ink-900 flex items-center gap-2">
            {title}
            {badge ? <span className="text-[11px] font-bold text-white rounded-full px-1.5 min-w-[18px] text-center" style={{ backgroundColor: '#dc2626' }}>{badge}</span> : null}
          </h2>
          {subtitle && <p className="text-micro text-ink-500">{subtitle}</p>}
        </div>
        {onViewAll && (
          <button onClick={onViewAll} className="inline-flex items-center gap-1 text-meta font-semibold shrink-0" style={{ color: GOLD }}>
            {viewAllLabel} <ArrowRight size={13} />
          </button>
        )}
      </header>
      <div className="px-5 pb-5">{children}</div>
    </section>
  );
}

export function Empty({ children }) {
  return <p className="text-meta text-ink-400 py-6 text-center">{children}</p>;
}
