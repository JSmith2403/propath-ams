import { useCallback, useEffect, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Loader2, ShieldCheck } from 'lucide-react';
import logo from '../../assets/Propath_Primary Logo_Black.png';
import ChatBubbles from '../messages/ChatBubbles';

const GOLD = '#A58D69';

/**
 * FamilyView — the read-only page behind a parent link (/family/<secret>).
 * No account, no replying: it shows every conversation the child is part of,
 * exactly as the child sees it. Refreshes every minute while open.
 */
export default function FamilyView() {
  const { token } = useParams();
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const dataRef = useRef(null);

  // The link is private — keep it out of search engines and page previews.
  useEffect(() => {
    const meta = document.createElement('meta');
    meta.name = 'robots'; meta.content = 'noindex, nofollow';
    document.head.appendChild(meta);
    const prevTitle = document.title;
    document.title = 'ProPath · Family view';
    return () => { document.head.removeChild(meta); document.title = prevTitle; };
  }, []);

  const load = useCallback(async () => {
    try {
      const res = await fetch('/api/athlete-auth/family-view', {
        method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ token }),
      });
      const json = await res.json();
      if (!json.ok) {
        // Revoked / invalid link: show nothing of the chats, only the message.
        dataRef.current = null; setData(null);
        setError(json.error || 'This link isn\'t valid.');
        return;
      }
      dataRef.current = json; setError(null); setData(json);
    } catch (_) {
      // A dropped connection while already viewing keeps what's on screen.
      if (!dataRef.current) setError('Couldn\'t load right now — please check your connection and try again.');
    }
  }, [token]);

  useEffect(() => {
    load();
    const t = setInterval(() => { if (document.visibilityState === 'visible') load(); }, 60_000);
    return () => clearInterval(t);
  }, [load]);

  const first = data?.athlete?.name?.split(' ')[0] || 'your child';

  const teamBubbles = (data?.team || []).map(m => ({
    id: m.id, mine: m.sender_type === 'athlete', role: m.sender_type === 'athlete' ? 'athlete' : 'staff',
    name: m.sender_type === 'athlete' ? data.athlete.name : (m.sent_by || 'Coach'),
    title: m.title, body: m.body, at: m.created_at,
  }));

  return (
    <div className="min-h-screen bg-ink-50" style={{ backgroundColor: '#f4f5f7' }}>
      <div className="mx-auto max-w-xl px-4 py-8">
        <img src={logo} alt="ProPath" style={{ width: 110 }} className="mx-auto mb-5" />

        {!data && !error && <div className="flex justify-center py-16"><Loader2 className="animate-spin text-gray-400" /></div>}

        {error && (
          <div className="rounded-xl bg-white border border-gray-100 p-6 text-center">
            <p className="text-sm text-gray-700">{error}</p>
          </div>
        )}

        {data && (
          <>
            <div className="rounded-xl bg-white border border-gray-100 p-4 mb-4">
              <h1 className="text-lg font-bold text-gray-900">{first}&rsquo;s messages</h1>
              <p className="text-xs text-gray-500 mt-1 leading-relaxed">
                This is a read-only view of the conversations {first} has with ProPath coaches. You can&rsquo;t reply here —
                if you have a question, please contact the academy directly. Please keep this link private.
              </p>
              <p className="flex items-center gap-1.5 text-[11px] text-gray-400 mt-2">
                <ShieldCheck size={12} style={{ color: GOLD }} /> Messages are saved by the academy for safeguarding and can&rsquo;t be edited or deleted.
              </p>
            </div>

            <section className="rounded-xl bg-white border border-gray-100 mb-4 overflow-hidden">
              <header className="px-4 py-3 border-b border-gray-100">
                <h2 className="text-sm font-bold text-gray-900">Coaching team</h2>
                <p className="text-[11px] text-gray-400">{first}&rsquo;s shared conversation with all coaches</p>
              </header>
              <div className="px-4 py-3 max-h-[420px] overflow-y-auto">
                <ChatBubbles messages={teamBubbles} emptyText="No messages yet." />
              </div>
            </section>

            {data.chats.map(chat => (
              <section key={chat.id} className="rounded-xl bg-white border border-gray-100 mb-4 overflow-hidden">
                <header className="px-4 py-3 border-b border-gray-100">
                  <h2 className="text-sm font-bold text-gray-900">{chat.name}</h2>
                  <p className="text-[11px] text-gray-400">
                    {chat.kind === 'direct' ? 'Private chat' : `Group chat · ${chat.members.join(', ')}`}
                  </p>
                </header>
                <div className="px-4 py-3 max-h-[420px] overflow-y-auto">
                  <ChatBubbles
                    emptyText="No messages yet."
                    messages={chat.messages.map(m => ({
                      id: m.id, mine: m.sender_type === 'athlete' && m.sender_name === data.athlete.name,
                      role: m.sender_type === 'athlete' ? 'athlete' : 'staff', name: m.sender_name, body: m.body, at: m.created_at,
                    }))}
                  />
                </div>
              </section>
            ))}
          </>
        )}
      </div>
    </div>
  );
}
