import { useCallback, useEffect, useState } from 'react';
import { X, Copy, Check, Link2, Loader2 } from 'lucide-react';
import { supabase } from '../../lib/supabase';

const GOLD = '#A58D69';

async function call(payload) {
  const { data: { session } } = await supabase.auth.getSession();
  const res = await fetch('/api/athlete-auth/accounts', {
    method: 'POST',
    headers: { 'content-type': 'application/json', ...(session ? { Authorization: `Bearer ${session.access_token}` } : {}) },
    body: JSON.stringify(payload),
  });
  try { return await res.json(); } catch { return { ok: false, error: `Server error (${res.status}).` }; }
}

const fmt = (iso) => (iso ? new Date(iso).toLocaleString('en-GB', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }) : 'Never');

/**
 * ParentLinksModal — create and revoke the private read-only links parents use
 * to see their child's chats (no account or profile). A link is shown ONCE, when
 * created; after that only its label and when it was last opened are known.
 */
export default function ParentLinksModal({ athlete, onClose }) {
  const [links, setLinks] = useState(null);
  const [label, setLabel] = useState('');
  const [busy, setBusy] = useState(false);
  const [created, setCreated] = useState(null);   // { url, label }
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState(null);

  const load = useCallback(async () => {
    const r = await call({ action: 'family-list', athlete_id: athlete.id });
    if (!r.ok) { setError(r.error); return; }
    setLinks(r.links);
  }, [athlete.id]);
  useEffect(() => { load(); }, [load]);

  const create = async () => {
    setBusy(true); setError(null);
    const r = await call({ action: 'family-create', athlete_id: athlete.id, label });
    setBusy(false);
    if (!r.ok) { setError(r.error); return; }
    setCreated({ url: `${window.location.origin}/family/${r.token}`, label: label.trim() });
    setLabel('');
    load();
  };

  const revoke = async (id) => {
    const r = await call({ action: 'family-revoke', link_id: id });
    if (!r.ok) { setError(r.error); return; }
    load();
  };

  const message = created
    ? `Hi${created.label ? ` ${created.label}` : ''}, here's your private link to see ${athlete.name}'s ProPath chats (read-only, no login needed):\n${created.url}\nPlease keep it private — anyone with this link can read the chats.`
    : '';

  const copy = async () => {
    try { await navigator.clipboard.writeText(message); } catch { /* text is on screen */ }
    setCopied(true); setTimeout(() => setCopied(false), 1800);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ backgroundColor: 'rgba(0,0,0,0.45)' }}>
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md max-h-[90vh] flex flex-col">
        <div className="flex items-start justify-between px-5 pt-5 pb-3">
          <div>
            <h2 className="text-lg font-bold text-gray-900">Parent links · {athlete.name}</h2>
            <p className="text-xs text-gray-500 mt-0.5">
              A private, read-only page of {athlete.name.split(' ')[0]}&rsquo;s chats. No account — parents just open the link.
            </p>
          </div>
          <button onClick={onClose} aria-label="Close" className="p-1.5 rounded hover:bg-gray-100"><X size={16} /></button>
        </div>

        <div className="px-5 pb-5 overflow-y-auto space-y-4">
          {created && (
            <div className="rounded-xl border border-green-200 bg-green-50 p-3">
              <p className="text-sm font-semibold text-gray-900 mb-1">Link created — copy it now</p>
              <p className="text-[11px] text-gray-500 mb-2">It&rsquo;s only shown this once. Send it to the parent privately.</p>
              <p className="text-xs font-mono break-all bg-white rounded-lg border border-gray-100 px-2.5 py-2 mb-2">{created.url}</p>
              <button onClick={copy} className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-md text-white" style={{ backgroundColor: GOLD }}>
                {copied ? <Check size={12} /> : <Copy size={12} />} Copy message for parent
              </button>
            </div>
          )}

          <div className="flex gap-2">
            <input
              value={label} onChange={(e) => setLabel(e.target.value)} maxLength={40} placeholder="Who is it for? e.g. Mum"
              className="flex-1 text-sm rounded-lg border border-gray-200 px-3 py-2 focus:outline-none focus:border-[#A58D69]"
            />
            <button
              onClick={create} disabled={busy}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-sm font-semibold text-white disabled:opacity-50"
              style={{ backgroundColor: GOLD }}
            >
              {busy ? <Loader2 size={14} className="animate-spin" /> : <Link2 size={14} />} Create link
            </button>
          </div>

          {error && <p className="text-xs text-red-600" role="alert">{error}</p>}

          <div>
            <p className="text-xs font-semibold text-gray-500 mb-1.5">Existing links</p>
            {!links ? (
              <div className="flex justify-center py-4"><Loader2 size={16} className="animate-spin text-gray-400" /></div>
            ) : links.length === 0 ? (
              <p className="text-xs text-gray-400">None yet.</p>
            ) : (
              <div className="space-y-1.5">
                {links.map(l => (
                  <div key={l.id} className="flex items-center justify-between gap-2 rounded-lg border border-gray-100 px-3 py-2">
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {l.label || 'Parent link'}{l.revoked_at && <span className="ml-2 text-[10px] font-semibold text-red-600">REVOKED</span>}
                      </p>
                      <p className="text-[11px] text-gray-400">
                        Created {fmt(l.created_at)} · last opened {fmt(l.last_viewed_at)} · opened {l.view_count}×
                      </p>
                    </div>
                    {!l.revoked_at && (
                      <button onClick={() => revoke(l.id)} className="shrink-0 text-xs text-gray-500 hover:text-red-600 px-2 py-1 rounded hover:bg-gray-50">
                        Revoke
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
