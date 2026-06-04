import { lazy, Suspense, useEffect, useState } from 'react';
import { Brain, ChevronRight, Loader2 } from 'lucide-react';
import { supabase } from '../../lib/supabase';

const ModuleRunner = lazy(() => import('./ModuleRunner'));

const GOLD = '#A58D69';

/**
 * MentalSkillsTab — athlete-facing entry point for the Mental Game
 * course. Lists every module (draft + published — coaches see both
 * while content is in flux) and, when tapped, launches the
 * data-driven ModuleRunner that walks through each step, tracks time,
 * and handles the "are you still training?" inactivity prompt.
 *
 * All athletes get access automatically — no toggle.
 */
export default function MentalSkillsTab({ athleteId }) {
  const [modules, setModules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [open,    setOpen]    = useState(null); // module being played

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from('mf_modules')
        .select('id, slug, title, description, domain, icon, xp_reward, status, order_index')
        .order('domain', { ascending: true })
        .order('order_index', { ascending: true });
      if (cancelled) return;
      if (error) console.error('[MentalSkillsTab] fetch failed', error);
      setModules(data || []);
      setLoading(false);
    })();
    return () => { cancelled = true; };
  }, []);

  if (open) {
    return (
      <Suspense fallback={<RunnerLoader />}>
        <ModuleRunner
          athleteId={athleteId}
          module={open}
          onExit={() => setOpen(null)}
        />
      </Suspense>
    );
  }

  return (
    <div className="px-4 pt-4 pb-24">
      <header className="flex items-center gap-3 mb-5">
        <div
          className="w-10 h-10 rounded-lg flex items-center justify-center"
          style={{ backgroundColor: 'rgba(165,141,105,0.12)', color: GOLD }}
        >
          <Brain size={20} />
        </div>
        <div>
          <h2 className="text-base font-bold text-ink-900">Mental Skills</h2>
          <p className="text-meta text-ink-500">Short modules. The mind trains like the body.</p>
        </div>
      </header>

      {loading ? (
        <div className="py-12 text-center text-xs text-ink-400 flex items-center justify-center gap-2">
          <Loader2 size={14} className="animate-spin" /> Loading modules…
        </div>
      ) : modules.length === 0 ? (
        <div className="rounded-xl bg-white border border-ink-100 p-6 text-center text-xs italic text-ink-400"
             style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
          New modules will appear here once your coach publishes them.
        </div>
      ) : (
        <ul className="space-y-2.5">
          {modules.map(m => (
            <li key={m.id}>
              <button
                onClick={() => setOpen(m)}
                className="w-full flex items-center gap-3 p-4 rounded-xl bg-white border border-ink-100 text-left active:bg-ink-50 transition-colors"
                style={{ boxShadow: '0 1px 2px rgba(0,0,0,0.04)' }}
              >
                <div
                  className="shrink-0 w-11 h-11 rounded-lg flex items-center justify-center"
                  style={{ backgroundColor: 'rgba(165,141,105,0.10)', color: GOLD }}
                >
                  <Brain size={20} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-ink-900">{m.title}</p>
                  <p className="text-meta text-ink-500 line-clamp-2">{m.description}</p>
                  <div className="flex items-center gap-1.5 mt-1.5">
                    <span className="text-[10px] uppercase tracking-widest font-bold" style={{ color: GOLD }}>
                      {m.domain}
                    </span>
                    <span className="text-[10px] text-ink-400">·</span>
                    <span className="text-[10px] uppercase tracking-widest font-bold text-ink-400">
                      {m.xp_reward} XP
                    </span>
                  </div>
                </div>
                <ChevronRight size={16} className="text-ink-300 shrink-0" />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function RunnerLoader() {
  return (
    <div className="py-16 flex flex-col items-center gap-2 text-xs text-ink-400">
      <Loader2 size={20} className="animate-spin" style={{ color: GOLD }} />
      Preparing module…
    </div>
  );
}
