import { Heart, Moon, Activity, Smile, Zap, Battery } from 'lucide-react';
import { Avatar, Chip, DashCard, Empty, RAG, Scroll, fmtNum, fmtSleep } from './parts';

function Tile({ icon: Icon, value, label }) {
  return (
    <div className="flex-1 min-w-[78px] rounded-lg border border-ink-100 px-2.5 py-1.5">
      <div className="flex items-center gap-1.5"><Icon size={13} className="text-ink-400" /><span className="text-meta font-bold text-ink-900 whitespace-nowrap">{value}</span></div>
      <p className="text-[10px] text-ink-400 mt-0.5 whitespace-nowrap">{label}</p>
    </div>
  );
}

/**
 * Athlete Wellness — group averages (fixed) over a scrolling table of every athlete's latest check-in, with
 * Garmin sleep / HRV / body battery where an athlete has Garmin connected. Worst RAG first.
 */
export default function WellnessInsightsCard({ data, athleteById, onOpenAthlete, onViewAll }) {
  const w = data?.wellness;
  return (
    <DashCard icon={Heart} title="Athlete Wellness" onViewAll={onViewAll}
      subtitle={w?.hasGarmin ? 'Check-ins combined with Garmin sleep, HRV and body battery.' : 'Latest check-ins. Garmin sleep, HRV and battery appear once an athlete connects.'}>
      {!w || w.rows.length === 0 ? <Empty>No check-ins in the last 7 days.</Empty> : (
        <>
          <div className="flex flex-wrap gap-1.5 mb-2 shrink-0">
            <Tile icon={Moon} value={fmtSleep(w.avg.sleepHours)} label="Avg. sleep" />
            <Tile icon={Activity} value={fmtNum(w.avg.hrv)} label="Avg. HRV" />
            <Tile icon={Smile} value={fmtNum(w.avg.readiness, 1)} label="Readiness /10" />
            <Tile icon={Zap} value={fmtNum(w.avg.stress, 1)} label="Stress /10" />
            <Tile icon={Battery} value={fmtNum(w.avg.battery)} label="Avg. battery" />
          </div>
          <Scroll>
            <table className="w-full text-meta">
              <thead className="sticky top-0 bg-white z-[1]">
                <tr className="text-[10px] uppercase text-ink-400 text-left">
                  <th className="px-1 py-1 font-bold">Athlete</th>
                  <th className="px-1 py-1 font-bold">Sleep</th>
                  <th className="px-1 py-1 font-bold">HRV</th>
                  <th className="px-1 py-1 font-bold" title="From the check-in: higher is better">Ready</th>
                  <th className="px-1 py-1 font-bold" title="From the check-in: lower is better">Stress</th>
                  <th className="px-1 py-1 font-bold">Battery</th>
                  <th className="px-1 py-1" />
                </tr>
              </thead>
              <tbody>
                {w.rows.map(r => {
                  const a = athleteById.get(r.athleteId);
                  const tone = RAG[r.rag];
                  return (
                    <tr key={r.athleteId} onClick={() => onOpenAthlete(r.athleteId, { tab: 'wellness' })}
                      className="border-t border-ink-100 cursor-pointer hover:bg-ink-50">
                      <td className="px-1 py-1.5">
                        <span className="flex items-center gap-2"><Avatar athlete={a} size={24} /><span className="font-semibold text-ink-900 whitespace-nowrap">{a?.name || 'Athlete'}</span></span>
                      </td>
                      <td className="px-1 py-1.5 whitespace-nowrap">{fmtSleep(r.sleepHours)}</td>
                      <td className="px-1 py-1.5">{fmtNum(r.hrv)}</td>
                      <td className="px-1 py-1.5">{fmtNum(r.readiness, 1)}</td>
                      <td className="px-1 py-1.5">{fmtNum(r.stress, 1)}</td>
                      <td className="px-1 py-1.5">{r.battery != null ? `${r.battery}%` : '—'}</td>
                      <td className="px-1 py-1.5 text-right"><Chip tone={tone}>{tone.label}</Chip></td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </Scroll>
        </>
      )}
    </DashCard>
  );
}
