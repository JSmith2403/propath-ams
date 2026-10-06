import { useEffect, useMemo, useState } from 'react';
import { X, Send, Loader2, CheckCheck } from 'lucide-react';
import { supabase } from '../../lib/supabase';

const GOLD = '#A58D69';
const COHORTS = ['Elite', 'Gold', 'Mini'];

/**
 * MessageComposerModal — coach writes a message to everyone, a cohort, or
 * hand-picked athletes. Stored in each athlete's in-app inbox AND pushed as
 * a notification (see api/messages/send.js). The lower half shows recent
 * sends with how many recipients have opened them.
 */
export default function MessageComposerModal({ athletes = [], senderName, onClose }) {
  const [selected, setSelected] = useState(() => new Set());
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [sending, setSending] = useState(false);
  const [result, setResult] = useState(null); // { kind: 'ok' | 'error', text }
  const [history, setHistory] = useState(null);
  const [historyTick, setHistoryTick] = useState(0);

  const sorted = useMemo(
    () => [...athletes].sort((a, b) => (a.name || '').localeCompare(b.name || '')),
    [athletes],
  );

  const toggle = (id) => setSelected(prev => {
    const next = new Set(prev);
    if (next.has(id)) next.delete(id); else next.add(id);
    return next;
  });
  const selectAll = () => setSelected(new Set(sorted.map(a => a.id)));
  const selectNone = () => setSelected(new Set());
  const selectCohort = (c) => setSelected(new Set(sorted.filter(a => a.cohort === c).map(a => a.id)));

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const { data, error } = await supabase
        .from('athlete_messages')
        .select('batch_id, title, created_at, read_at')
        .order('created_at', { ascending: false })
        .limit(400);
      if (cancelled) return;
      if (error) { setHistory([]); return; }
      const byBatch = new Map();
      for (const r of data || []) {
        const b = byBatch.get(r.batch_id) || { batch_id: r.batch_id, title: r.title, created_at: r.created_at, total: 0, read: 0 };
        b.total += 1;
        if (r.read_at) b.read += 1;
        byBatch.set(r.batch_id, b);
      }
      setHistory([...byBatch.values()].slice(0, 8));
    })();
    return () => { cancelled = true; };
  }, [historyTick]);

  const canSend = title.trim() && selected.size > 0 && !sending;

  const send = async () => {
    if (!canSend) return;
    setSending(true);
    setResult(null);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const res = await fetch('/api/messages/send', {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
          ...(session ? { Authorization: `Bearer ${session.access_token}` } : {}),
        },
        body: JSON.stringify({
          athlete_ids: [...selected],
          title: title.trim(),
          body: body.trim(),
          sent_by: senderName || undefined,
        }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok || !json.ok) {
        setResult({ kind: 'error', text: json.error || `Couldn't send (${res.status}).` });
      } else {
        const push = json.pushConfigured === false
          ? ' Push notifications aren’t set up on the server yet, so they’ll see it in the app inbox only.'
          : ` ${json.pushed} notification${json.pushed === 1 ? '' : 's'} delivered.`;
        setResult({ kind: 'ok', text: `Sent to ${json.stored} athlete${json.stored === 1 ? '' : 's'}.${push}` });
        setTitle(''); setBody(''); setSelected(new Set());
        setHistoryTick(t => t + 1);
      }
    } catch (e) {
      setResult({ kind: 'error', text: e.message || 'Network error.' });
    } finally {
      setSending(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-[70] flex items-center justify-center p-4"
      style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}
      onClick={onClose}
    >
      <div
        className="bg-white rounded-xl w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 sticky top-0 bg-white z-10">
          <h2 className="text-sm font-bold text-gray-900 flex items-center gap-1.5">
            <Send size={14} style={{ color: GOLD }} /> Message athletes
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-700" aria-label="Close"><X size={18} /></button>
        </div>

        <div className="p-5 space-y-4">
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                To · {selected.size} selected
              </label>
              <div className="flex items-center gap-1.5 text-[11px] font-semibold">
                <button onClick={selectAll} style={{ color: GOLD }}>Everyone</button>
                {COHORTS.map(c => (
                  <button key={c} onClick={() => selectCohort(c)} style={{ color: GOLD }}>{c}</button>
                ))}
                <button onClick={selectNone} className="text-gray-400">Clear</button>
              </div>
            </div>
            <div className="max-h-40 overflow-y-auto border border-gray-200 rounded-lg p-2 grid grid-cols-2 gap-x-3 gap-y-1">
              {sorted.map(a => (
                <label key={a.id} className="flex items-center gap-2 text-xs text-gray-700 cursor-pointer py-0.5">
                  <input type="checkbox" checked={selected.has(a.id)} onChange={() => toggle(a.id)} />
                  <span className="truncate">{a.name}</span>
                </label>
              ))}
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide block mb-1">Title *</label>
            <input
              type="text" value={title} maxLength={120}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Session moved to 5pm Thursday"
              className="w-full text-sm border border-gray-200 rounded px-3 py-2 bg-white"
            />
          </div>
          <div>
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide block mb-1">Message</label>
            <textarea
              rows={4} value={body} maxLength={2000}
              onChange={(e) => setBody(e.target.value)}
              placeholder="Optional details…"
              className="w-full text-sm border border-gray-200 rounded px-3 py-2 resize-none bg-white"
            />
          </div>

          {result && (
            <p
              className="text-xs rounded px-3 py-2"
              style={result.kind === 'ok'
                ? { backgroundColor: 'rgba(34,197,94,0.1)', color: '#15803d' }
                : { backgroundColor: 'rgba(239,68,68,0.1)', color: '#b91c1c' }}
            >
              {result.text}
            </p>
          )}

          <button
            onClick={send} disabled={!canSend}
            className="w-full py-2.5 text-sm font-semibold text-white rounded-lg disabled:opacity-40 inline-flex items-center justify-center gap-2"
            style={{ backgroundColor: GOLD }}
          >
            {sending ? <><Loader2 size={14} className="animate-spin" /> Sending…</> : 'Send message'}
          </button>

          {history && history.length > 0 && (
            <div className="pt-3 border-t border-gray-100">
              <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-2">Recently sent</p>
              <ul className="space-y-1.5">
                {history.map(h => (
                  <li key={h.batch_id} className="flex items-center gap-2 text-xs">
                    <span className="flex-1 truncate text-gray-700 font-medium">{h.title}</span>
                    <span className="text-gray-400 shrink-0">
                      {new Date(h.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
                    </span>
                    <span
                      className="shrink-0 inline-flex items-center gap-1 font-semibold"
                      style={{ color: h.read === h.total ? '#16a34a' : '#6b7280' }}
                      title="Opened by"
                    >
                      <CheckCheck size={12} /> {h.read}/{h.total}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
