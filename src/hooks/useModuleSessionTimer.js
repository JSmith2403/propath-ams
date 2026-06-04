import { useCallback, useEffect, useRef, useState } from 'react';
import { supabase } from '../lib/supabase';

/**
 * useModuleSessionTimer — manages a single Mental Skills module
 * session for an athlete: timer accumulation, inactivity detection,
 * the "Are you still training?" prompt, the 3-strike kill rule, and
 * persistence to mf_module_sessions.
 *
 *   start()            — INSERT a new mf_module_sessions row, kick
 *                        off the timer + inactivity watcher.
 *   markActivity()     — call from the runner whenever the athlete
 *                        taps anything, types, etc. Resets the
 *                        inactivity countdown.
 *   acknowledgePrompt()— call when the athlete answers "yes, still
 *                        training" — closes the prompt + resumes.
 *   updateLastStep(n)  — persists the highest reached step_index so
 *                        the coach view shows useful progress.
 *   finish()           — stamps ended_at + completed=true and saves
 *                        the final total_seconds.
 *
 * State the consumer needs:
 *   sessionId          — null until start() resolves
 *   seconds            — live counter (per second tick)
 *   paused             — true while the prompt is on screen, while
 *                        we're saving, or after kill / finish
 *   prompting          — boolean — show the "still training?" modal
 *   promptDeadlineMs   — epoch ms when an unanswered prompt counts
 *   strike             — how many prompts fired (kill at 3)
 *   killed             — true when 3-strike kill fired
 *   finished           — true after finish() resolves
 *
 * Tunables (all expressed in seconds for readability):
 *   INACTIVITY_AFTER_S   = 60  · idle time before prompt
 *   PROMPT_TIMEOUT_S     = 15  · seconds to respond to prompt
 *   KILL_AFTER_STRIKES   = 3   · prompts without response → end
 */

const INACTIVITY_AFTER_S = 60;
const PROMPT_TIMEOUT_S   = 15;
const KILL_AFTER_STRIKES = 3;

export function useModuleSessionTimer({ athleteId, moduleId }) {
  const [sessionId, setSessionId] = useState(null);
  const [seconds,   setSeconds]   = useState(0);
  const [paused,    setPaused]    = useState(true);   // until start()
  const [prompting, setPrompting] = useState(false);
  const [promptDeadlineMs, setPromptDeadlineMs] = useState(null);
  const [strike,    setStrike]    = useState(0);
  const [killed,    setKilled]    = useState(false);
  const [finished,  setFinished]  = useState(false);

  // Refs avoid stale closures inside the interval.
  const lastActivityRef = useRef(Date.now());
  const sessionIdRef    = useRef(null);
  const persistTickRef  = useRef(0);

  const markActivity = useCallback(() => {
    lastActivityRef.current = Date.now();
  }, []);

  const start = useCallback(async () => {
    if (!athleteId || !moduleId || sessionIdRef.current) return;
    const { data, error } = await supabase
      .from('mf_module_sessions')
      .insert({
        athlete_id: athleteId,
        module_id:  moduleId,
        total_seconds: 0,
        inactivity_count: 0,
        completed: false,
      })
      .select('id')
      .single();
    if (error) {
      console.error('[useModuleSessionTimer] start failed', error);
      return;
    }
    sessionIdRef.current = data.id;
    setSessionId(data.id);
    setSeconds(0);
    setPaused(false);
    lastActivityRef.current = Date.now();
  }, [athleteId, moduleId]);

  // Tick once per second. Skips when paused, prompting, killed or
  // finished. Watches inactivity and fires the prompt at the threshold.
  useEffect(() => {
    if (paused || prompting || killed || finished) return;
    const t = setInterval(() => {
      setSeconds(s => s + 1);
      const idle = (Date.now() - lastActivityRef.current) / 1000;
      if (idle >= INACTIVITY_AFTER_S) {
        // Trigger the prompt. Deadline = now + PROMPT_TIMEOUT_S.
        setPrompting(true);
        setPromptDeadlineMs(Date.now() + PROMPT_TIMEOUT_S * 1000);
      }
      // Persist every 15s so a tab close doesn't lose the whole session.
      persistTickRef.current++;
      if (persistTickRef.current >= 15 && sessionIdRef.current) {
        persistTickRef.current = 0;
        // Fire and forget — best effort.
        supabase
          .from('mf_module_sessions')
          .update({ total_seconds: Math.max(0, Math.floor((Date.now() - lastActivityRef.current) / 1000) >= 0 ? 0 : 0) || undefined })
          .eq('id', sessionIdRef.current);
      }
    }, 1000);
    return () => clearInterval(t);
  }, [paused, prompting, killed, finished]);

  // While prompting, watch the prompt timeout; if it fires without
  // ack, count as a strike. If strikes reach KILL_AFTER_STRIKES, kill.
  useEffect(() => {
    if (!prompting || !promptDeadlineMs) return;
    const t = setInterval(() => {
      const remaining = promptDeadlineMs - Date.now();
      if (remaining <= 0) {
        // Strike! No response in time.
        setPrompting(false);
        setPromptDeadlineMs(null);
        setStrike(prev => {
          const next = prev + 1;
          if (next >= KILL_AFTER_STRIKES) {
            // Kill the session.
            (async () => {
              if (sessionIdRef.current) {
                await supabase.from('mf_module_sessions').update({
                  ended_at: new Date().toISOString(),
                  total_seconds: seconds,
                  inactivity_count: next,
                  killed_by_inactivity: true,
                }).eq('id', sessionIdRef.current);
              }
            })();
            setKilled(true);
          }
          return next;
        });
      }
    }, 250);
    return () => clearInterval(t);
  }, [prompting, promptDeadlineMs, seconds]);

  const acknowledgePrompt = useCallback(() => {
    setPrompting(false);
    setPromptDeadlineMs(null);
    lastActivityRef.current = Date.now();
    setStrike(prev => {
      // Persist the bumped count — we count this as a "fired" prompt
      // even though the athlete responded; coaches care that it took
      // an explicit nudge to keep going.
      if (sessionIdRef.current) {
        supabase.from('mf_module_sessions')
          .update({ inactivity_count: prev + 1 })
          .eq('id', sessionIdRef.current);
      }
      return prev + 1;
    });
  }, []);

  const updateLastStep = useCallback(async (idx) => {
    if (!sessionIdRef.current) return;
    await supabase.from('mf_module_sessions')
      .update({ last_step_index: idx, updated_at: new Date().toISOString() })
      .eq('id', sessionIdRef.current);
  }, []);

  const finish = useCallback(async () => {
    if (!sessionIdRef.current || finished || killed) return;
    setPaused(true);
    setFinished(true);
    await supabase.from('mf_module_sessions').update({
      ended_at: new Date().toISOString(),
      total_seconds: seconds,
      completed: true,
    }).eq('id', sessionIdRef.current);
  }, [seconds, finished, killed]);

  // Best-effort save on unmount / tab close so a crashed session
  // still leaves a record behind.
  useEffect(() => {
    return () => {
      if (sessionIdRef.current && !finished && !killed) {
        // Persist whatever we accumulated so the coach view sees it.
        supabase.from('mf_module_sessions').update({
          total_seconds: seconds,
        }).eq('id', sessionIdRef.current);
      }
    };
  }, [seconds, finished, killed]);

  return {
    sessionId,
    seconds,
    paused, prompting, promptDeadlineMs,
    strike, killed, finished,
    INACTIVITY_AFTER_S, PROMPT_TIMEOUT_S, KILL_AFTER_STRIKES,
    start, markActivity, acknowledgePrompt, updateLastStep, finish,
  };
}
