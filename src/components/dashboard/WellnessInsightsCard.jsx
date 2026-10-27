import { Heart, Moon, Activity, Smile, Zap, Battery } from 'lucide-react';
import { Avatar, Chip, DashCard, Empty, RAG, fmtNum, fmtSleep } from './parts';

function Tile({ icon: Icon, value, label }) {
  return (
    <div className="flex-1 min-w-[88px] rounded-lg border border-ink-100 px-3 py-2.5">
      <div className="flex items-center gap-1.5"><Icon size={15} className="text-ink-400" /><span className="text-body font-bold text-ink-900">{value}</span></div>
      <p className="text-micro text-ink-400 mt-0.5">{label}</p>
    </div>
  );
}

/**
 * Athlete Wellness — the latest check-in per athlete, with Garmin sleep / HRV / body battery where an
 * athlete has Garmin connected. Worst RAG first, so who needs a conversation floats to the top.
 */
export default function WellnessInsightsCard({ data, athleteById, onOpenAthlete, onViewAll }) {
  const w = data?.wellness;
  const rows = (w?.rows || []).slice(0, 6);
  return (
    <DashCard icon={Heart} title="Athlete Wellness" onViewAll={onViewAll}
      subtitle={w?.hasGarmin ? 'Check-ins combined with Garmin sleep, HRV and body battery.' : 'Latest check-ins. Garmin sleep, HRV and body battery appear once an athlete connects.'}>
      {!w || w.rows.length === 0 ? <Empty>No check-ins in the last 7 days.</Empty> : (
        <>
          <div className="flex flex-wrap gap-2 mb-3">
            <Tile icon={Moon} value={fmtSleep(w.avg.sleepHours)} label="Avg. sleep" />
            <Tile icon={Activity} value={fmtNum(w.avg.hrv)} label="Avg. HRV" />
            <Tile icon={Smile} value={fmtNum(w.avg.readiness, 1)} label="Avg. readiness /10" />
            <Tile icon={Zap} value={fmtNum(w.avg.stress, 1)} label="Avg. stress /10" />
            <Tile icon={Battery} value={fmtNum(w.avg.battery)} label="Avg. battery" />
          </div>
          <div className="overflow-x-auto -mx-1">
            <table className="w-full text-meta">
              <thead>
                <tr className="text-micro uppercase text-ink-400 text-left">
                  <th className="px-1 py-1.5 font-bold">Athlete</th>
                  <th className="px-1 py-1.5 font-bold">Sleep</th>
                  <th className="px-1 py-1.5 font-bold">HRV</th>
                  <th className="px-1 py-1.5 font-bold" title="From the check-in: higher is better">Ready</th>
                  <th className="px-1 py-1.5 font-bold" title="From the check-in: lower is better">Stress</th>
                  <th className="px-1 py-1.5 font-bold">Battery</th>
                  <th className="px-1 py-1.5" />
                </tr>
              </thead>
              <tbody>
                {rows.map(r => {
                  const a = athleteById.get(r.athleteId);
                  const tone = RAG[r.rag];
                  return (
                    <tr key={r.athleteId} onClick={() => onOpenAthlete(r.athleteId, { tab: 'wellness' })}
                      className="border-t border-ink-100 cursor-pointer hover:bg-ink-50">
                      <td className="px-1 py-2">
                        <span className="flex items-center gap-2"><Avatar athlete={a} size={28} /><span className="font-semibold text-ink-900 whitespace-nowrap">{a?.name || 'Athlete'}</span></span>
                      </td>
                      <td className="px-1 py-2 whitespace-nowrap">{fmtSleep(r.sleepHours)}</td>
                      <td className="px-1 py-2">{fmtNum(r.hrv)}</td>
                      <td className="px-1 py-2">{fmtNum(r.readiness, 1)}</td>
                      <td className="px-1 py-2">{fmtNum(r.stress, 1)}</td>
                      <td className="px-1 py-2">{r.battery != null ? `${r.battery}%` : '—'}</td>
                      <td className="px-1 py-2 text-right"><Chip tone={tone}>{tone.label}</Chip></td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </>
      )}
    </DashCard>
  );
}
