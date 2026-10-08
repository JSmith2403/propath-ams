import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import SessionTracker from '../SessionTracker';
import OneToOneTokens from './OneToOneTokens';

const GOLD = '#A58D69';

/**
 * Sessions — the existing session tracker, plus a "1:1 tokens" tab for the
 * rolling 1:1 allowance and athletes' 1:1 requests. The tab shows a red count
 * while requests are waiting for a coach.
 */
export default function SessionsHub({ athletes, onNavigateToNote }) {
  const [tab, setTab] = useState('tracker');
  const [pending, setPending] = useState(0);

  useEffect(() => {
    let cancelled = false;
    const check = async () => {
      const { count, error } = await supabase.from('one_to_one_requests')
        .select('id', { count: 'exact', head: true }).eq('status', 'requested');
      if (!cancelled) setPending(error ? 0 : (count || 0));
    };
    check();
    const t = setInterval(() => { if (document.visibilityState === 'visible') check(); }, 60_000);
    return () => { cancelled = true; clearInterval(t); };
  }, [tab]);

  const tabs = [['tracker', 'Session tracker'], ['tokens', '1:1 tokens']];

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <div className="flex gap-1 px-6 pt-3 border-b border-gray-200 bg-white shrink-0">
        {tabs.map(([key, label]) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className="text-sm font-semibold px-4 py-2 -mb-px border-b-2 transition-colors flex items-center gap-2"
            style={tab === key ? { borderColor: GOLD, color: '#7a6748' } : { borderColor: 'transparent', color: '#6b7280' }}
          >
            {label}
            {key === 'tokens' && pending > 0 && (
              <span className="min-w-[18px] h-[18px] px-1 rounded-full text-[10px] font-bold text-white flex items-center justify-center" style={{ backgroundColor: '#dc2626' }}>
                {pending}
              </span>
            )}
          </button>
        ))}
      </div>
      {tab === 'tracker'
        ? <SessionTracker athletes={athletes} onNavigateToNote={onNavigateToNote} />
        : <OneToOneTokens athletes={athletes} />}
    </div>
  );
}
