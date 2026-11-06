import { ChevronRight, Flame, HeartPulse, Moon, Users, X } from 'lucide-react';
import { fmtDeltaHM, fmtHM } from '../../utils/garminTrend';
import { Avatar, DashCard, Empty, RAG } from './parts';
import { SessionRing, Sparkline, TONE } from './status';

const GOOD = '#15803d';
const BAD = '#b91c1c';
const TEAL = '#437E8D';
const num = (rag) => (RAG[rag] ? RAG[rag].fg : '#1C1C1C');

const disagree = (selfRag, watchRag) => selfRag && watchRag && selfRag !== watchRag && (selfRag === 'green' || watchRag === 'green');

const GROUP = 'px-4 py-2 border-l border-ink-100 bg-ink-50 align-bottom';
const CELL = 'px-4 py-2 align-middle border-b border-ink-100';
const Muted = ({ title, children = '·' }) => <span className="text-ink-300" title={title}>{children}</span>;

function GroupHead({ icon: Icon, title, sub }) {
  return (
    <span className="flex items-center gap-2">
      <Icon size={18} style={{ color: TEAL }} />
      <span><span className="block text-meta font-bold text-ink-900">{title}</span><span className="block text-[10px] font-medium text-ink-500">{sub}</span></span>
    </span>
  );
}

/** "+12m vs their two-week average", for the hover text. */
const vs = (t, fmtDelta) => (t && t.delta != null ? ` (${fmtDelta(t.delta)} vs their two-week average)` : '');

/**
 * Athlete overview as one table. Each athlete is a row and the metrics line up under three headings:
 *   Sleep & recovery (sleep | HRV), Readiness (self-reported | Garmin), Activity (intensity | calories),
 * each with a trend line for the last two weeks. Hover a number for how it compares with their own average.
 */
export default function AthleteOverviewCard({ rows, total, loading, filterLabel, onClearFilter, onOpenAthlete }) {
  const hasIntensity = rows.some(r => r.garmin?.intensity);
  return (
    <DashCard icon={Users} title="Athlete overview" subtitle={filterLabel ? undefined : 'Each athlete on one line, with the last two weeks as a trend.'}>
      {filterLabel && (
        <button onClick={onClearFilter} className="self-start mb-2 inline-flex items-center gap-1.5 text-meta font-semibold rounded-full border border-ink-200 px-2.5 py-1 text-ink-700 hover:bg-ink-50">
          {filterLabel} · {rows.length} of {total} <X size={12} />
        </button>
      )}
      {loading ? <Empty>Loading…</Empty> : rows.length === 0 ? <Empty>No athletes match.</Empty> : (
        <div className="overflow-x-auto -mx-1 px-1">
          <table className="w-full min-w-[1020px] border-separate border-spacing-0 text-left">
            <thead>
              <tr>
                <th className="px-4 py-2 text-[11px] font-bold uppercase tracking-wide text-ink-500 bg-ink-50 sticky left-0 z-[1]">Athlete</th>
                <th className="px-2 py-2 text-[11px] font-bold uppercase tracking-wide text-ink-500 bg-ink-50">This week</th>
                <th className={GROUP}><GroupHead icon={Moon} title="Sleep & recovery" sub="Sleep | HRV" /></th>
                <th className={GROUP}><GroupHead icon={HeartPulse} title="Readiness" sub="Self | Garmin" /></th>
                <th className={GROUP} colSpan={2}><GroupHead icon={Flame} title="Activity" sub={hasIntensity ? 'Intensity | Calories' : 'Active calories'} /></th>
              </tr>
            </thead>
            <tbody>
              {rows.map(r => {
                const tone = TONE[r.verdict.tone];
                const bg = tone.bg === 'transparent' ? '#ffffff' : tone.bg;
                const g = r.garmin;
                const selfRag = r.checkIn.readinessRag;
                const mismatch = disagree(selfRag, g?.batteryBand);
                const kcalPct = g?.kcal && g.kcal.avg ? Math.round((g.kcal.delta / g.kcal.avg) * 100) : null;
                const chip = r.verdict.tone === 'go' ? { label: 'On track', fg: GOOD, bg: '#dcfce7' } : { label: 'Attention', fg: tone.fg, bg: r.verdict.tone === 'act' ? '#fee2e2' : r.verdict.tone === 'watch' ? '#fef3c7' : '#e5e5e7' };
                const hrvRound = g?.hrv ? Math.round(g.hrv.value) : null;
                return (
                  <tr key={r.id} style={{ background: bg }}>
                    <td className={`${CELL} sticky left-0 z-[1]`} style={{ background: bg }}>
                      <button onClick={() => onOpenAthlete(r.id)} className="flex items-center gap-3 text-left hover:opacity-80" title={r.verdict.label}>
                        <Avatar athlete={r.athlete} size={36} />
                        <span className="min-w-0">
                          <span className="block text-body font-semibold text-ink-900 whitespace-nowrap">{r.name}</span>
                          <span className="inline-block mt-0.5 rounded-full px-2 py-px text-[11px] font-bold whitespace-nowrap" style={{ background: chip.bg, color: chip.fg }}>{chip.label}</span>
                          {r.verdict.tone !== 'go' && <span className="block text-[11px] text-ink-500 whitespace-nowrap">{r.verdict.label}</span>}
                        </span>
                      </button>
                    </td>
                    <td className={`${CELL} px-2`}><SessionRing done={r.sessions.done} planned={r.sessions.planned} size={38} /></td>

                    <td className={`${CELL} border-l`}>
                      {g ? (
                        <span className="flex items-center gap-3">
                          <span className="text-body font-bold text-ink-900 whitespace-nowrap" title={`Sleep last night${vs(g.sleep, fmtDeltaHM)}. HRV overnight${vs(g.hrv, d => `${d > 0 ? '+' : ''}${Math.round(d)}`)}`}>
                            {g.sleep ? fmtHM(g.sleep.value) : '–'} <span className="text-ink-300 font-normal">|</span> {hrvRound ?? '–'}
                          </span>
                          <Sparkline values={g.series.sleep} />
                        </span>
                      ) : <Muted title="Not tracked" />}
                    </td>

                    <td className={`${CELL} border-l`}>
                      {g ? (
                        <span className="flex items-center gap-3">
                          <span className="text-body font-bold whitespace-nowrap" title="Self-reported readiness today (out of 7) | Garmin Body Battery on waking (out of 100)">
                            <span style={{ color: r.checkIn.readiness != null ? num(selfRag) : '#9a9aa0' }}>{r.checkIn.readiness != null ? `${r.checkIn.readiness}/7` : '–'}</span>
                            {' '}<span className="text-ink-300 font-normal">|</span>{' '}
                            <span style={{ color: g.battery != null ? num(g.batteryBand) : '#9a9aa0' }}>{g.battery ?? '–'}</span>
                            {mismatch && <span className="ml-1 text-[11px]" style={{ color: '#8a4510' }} title="How they feel and what the watch says don't agree">≠</span>}
                          </span>
                          <Sparkline values={g.series.battery.some(v => v != null) ? g.series.battery : r.readinessSeries} />
                        </span>
                      ) : (
                        <span className="flex items-center gap-3">
                          <span className="text-body font-bold whitespace-nowrap" style={{ color: r.checkIn.readiness != null ? num(selfRag) : '#9a9aa0' }} title="Self-reported readiness today (out of 7)">{r.checkIn.readiness != null ? `${r.checkIn.readiness}/7` : '–'}</span>
                          <Sparkline values={r.readinessSeries} />
                        </span>
                      )}
                    </td>

                    <td className={`${CELL} border-l`}>
                      {g ? (
                        <span className="flex items-center gap-3">
                          <span className="text-body font-bold text-ink-900 whitespace-nowrap" title={`Active calories${vs(g.kcal, d => `${d > 0 ? '+' : ''}${Math.round(d).toLocaleString()}`)}`}>
                            {hasIntensity && <>{g.intensity ? `${Math.round(g.intensity.value)} min` : '–'} <span className="text-ink-300 font-normal">|</span> </>}
                            {g.kcal ? `${Math.round(g.kcal.value).toLocaleString()} kcal` : '–'}
                          </span>
                          <Sparkline values={g.series.kcal} />
                        </span>
                      ) : <Muted title="Not tracked" />}
                    </td>
                    <td className={`${CELL} pr-3`}>
                      <span className="flex items-center justify-end gap-2">
                        {kcalPct != null && (
                          <span className="text-meta font-bold whitespace-nowrap" style={{ color: kcalPct >= 0 ? GOOD : BAD }} title="Active calories vs their two-week average">
                            {kcalPct >= 0 ? '▲' : '▼'} {kcalPct >= 0 ? '+' : ''}{kcalPct}%
                          </span>
                        )}
                        <ChevronRight size={16} className="text-ink-300" />
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
      <p className="text-[10px] text-ink-400 mt-2 shrink-0">
        Readiness: how they feel (out of 7) | Garmin Body Battery on waking (out of 100). <span className="font-bold">≠</span> they disagree · <span className="font-bold">·</span> not tracked · <span className="font-bold">–</span> no reading. Hover a number to compare with their own average.
      </p>
    </DashCard>
  );
}

