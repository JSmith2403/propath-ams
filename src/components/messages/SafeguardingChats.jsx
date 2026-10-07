import { useCallback, useEffect, useMemo, useState } from 'react';
import { ShieldCheck, Download, Search, Loader2 } from 'lucide-react';
import { supabase } from '../../lib/supabase';

const GOLD = '#A58D69';
const PAGE = 200;
const EXPORT_CHUNK = 1000;
const EXPORT_MAX = 20000;
const COLS = 'id, room_id, sender_type, sender_name, body, created_at';

const fmt = (iso) => new Date(iso).toLocaleString('en-GB', {
  day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit',
});
function csvCell(v) {
  const s = String(v ?? '');
  const safe = /^[=+\-@\t\r]/.test(s) ? `'${s}` : s;     // neutralise spreadsheet formulas
  return `"${safe.replace(/"/g, '""')}"`;
}

/**
 * Safeguarding log — group & private chats (admin only). Every message in every
 * chat, who was in it, filterable and exportable. Chat messages can't be edited
 * or deleted, so this is a reliable record. The "Athlete threads" tab covers
 * the shared coach-team conversations.
 */
export default function SafeguardingChats({ athletes = [] }) {
  const [rooms, setRooms] = useState([]);
  const [members, setMembers] = useState([]);
  const [roomId, setRoomId] = useState('');
  const [athleteId, setAthleteId] = useState('');
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [search, setSearch] = useState('');
  const [rows, setRows] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    (async () => {
      const [{ data: r, error: rErr }, { data: m }] = await Promise.all([
        supabase.from('chat_rooms').select('id, kind, name, created_at').order('created_at', { ascending: false }),
        supabase.from('chat_members').select('room_id, member_type, athlete_id, display_name, removed_at'),
      ]);
      if (rErr) { setError(`${rErr.message} — has sql/group_chats_parent_links_2026-10-09.sql been run?`); setLoading(false); return; }
      setRooms(r || []); setMembers(m || []);
    })();
  }, []);

  const roomLabel = useCallback((r) => {
    if (!r) return 'Unknown chat';
    if (r.kind === 'group') return r.name || 'Group chat';
    const mem = members.filter(x => x.room_id === r.id);
    const coach = mem.find(x => x.member_type === 'staff')?.display_name || 'coach';
    const kid = mem.find(x => x.member_type === 'athlete')?.display_name || 'athlete';
    return `Private: ${coach} ↔ ${kid}`;
  }, [members]);
  const roomById = useMemo(() => new Map(rooms.map(r => [r.id, r])), [rooms]);
  const sortedAthletes = useMemo(() => [...athletes].sort((a, b) => (a.name || '').localeCompare(b.name || '')), [athletes]);

  // An athlete filter = every chat that athlete has ever been in.
  const athleteRoomIds = useMemo(
    () => (athleteId ? [...new Set(members.filter(m => m.athlete_id === athleteId).map(m => m.room_id))] : null),
    [athleteId, members]
  );

  const buildQuery = useCallback((select, opts) => {
    let q = supabase.from('chat_messages').select(select, opts);
    if (roomId) q = q.eq('room_id', roomId);
    else if (athleteRoomIds) q = q.in('room_id', athleteRoomIds.length ? athleteRoomIds : ['00000000-0000-0000-0000-000000000000']);
    if (from) q = q.gte('created_at', new Date(`${from}T00:00:00`).toISOString());
    if (to) q = q.lte('created_at', new Date(`${to}T23:59:59.999`).toISOString());
    const term = search.trim().replace(/[%,()]/g, ' ');
    if (term) q = q.ilike('body', `%${term}%`);
    return q;
  }, [roomId, athleteRoomIds, from, to, search]);

  const load = useCallback(async (offset = 0) => {
    setLoading(true);
    const { data, count, error: err } = await buildQuery(COLS, { count: 'exact' })
      .order('created_at', { ascending: false }).range(offset, offset + PAGE - 1);
    if (err) { setError(err.message); setLoading(false); return; }
    setError(null);
    setTotal(count || 0);
    setRows(prev => (offset === 0 ? (data || []) : [...prev, ...(data || [])]));
    setLoading(false);
  }, [buildQuery]);

  useEffect(() => {
    const t = setTimeout(() => load(0), 250);
    return () => clearTimeout(t);
  }, [load]);

  const exportCsv = async () => {
    setExporting(true);
    try {
      const all = [];
      for (let offset = 0; offset < EXPORT_MAX; offset += EXPORT_CHUNK) {
        const { data, error: err } = await buildQuery(COLS).order('created_at', { ascending: true }).range(offset, offset + EXPORT_CHUNK - 1);
        if (err) throw err;
        all.push(...(data || []));
        if (!data || data.length < EXPORT_CHUNK) break;
      }
      const header = ['Date/time', 'Chat', 'Sender', 'Role', 'Message'];
      const lines = all.map(m => [
        new Date(m.created_at).toISOString(), roomLabel(roomById.get(m.room_id)), m.sender_name || '',
        m.sender_type === 'athlete' ? 'Athlete' : 'Coach', m.body || '',
      ].map(csvCell).join(','));
      const blob = new Blob([[header.map(csvCell).join(','), ...lines].join('\r\n')], { type: 'text/csv;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url; a.download = `propath-chats-${new Date().toISOString().slice(0, 10)}.csv`; a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      setError(`Export failed: ${err.message}`);
    }
    setExporting(false);
  };

  const inputCls = 'text-sm rounded-lg border border-gray-200 bg-white px-3 py-2 focus:outline-none focus:border-[#A58D69]';

  return (
    <div className="flex-1 overflow-y-auto" style={{ backgroundColor: '#f4f5f7' }}>
      <div className="max-w-5xl mx-auto px-6 py-8">
        <div className="flex items-start justify-between gap-4 mb-5">
          <div>
            <h1 className="text-xl font-bold text-gray-900 flex items-center gap-2">
              <ShieldCheck size={20} style={{ color: GOLD }} /> Group &amp; private chats
            </h1>
            <p className="text-xs text-gray-500 mt-1 max-w-xl">
              Every message in every group and one-to-one chat, newest first. Messages can&rsquo;t be edited or deleted by
              anyone, so this is a reliable record. Parents see the same messages through their read-only links.
            </p>
          </div>
          <button
            onClick={exportCsv} disabled={exporting || total === 0}
            className="shrink-0 flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold text-white disabled:opacity-50"
            style={{ backgroundColor: GOLD }}
          >
            {exporting ? <Loader2 size={14} className="animate-spin" /> : <Download size={14} />} Export CSV
          </button>
        </div>

        <div className="flex flex-wrap gap-2 mb-4">
          <select value={roomId} onChange={(e) => { setRoomId(e.target.value); setAthleteId(''); }} className={inputCls} aria-label="Chat">
            <option value="">All chats</option>
            {rooms.map(r => <option key={r.id} value={r.id}>{roomLabel(r)}</option>)}
          </select>
          <select value={athleteId} onChange={(e) => { setAthleteId(e.target.value); setRoomId(''); }} className={inputCls} aria-label="Athlete">
            <option value="">Any athlete</option>
            {sortedAthletes.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
          </select>
          <input type="date" value={from} onChange={(e) => setFrom(e.target.value)} className={inputCls} aria-label="From date" />
          <input type="date" value={to} onChange={(e) => setTo(e.target.value)} className={inputCls} aria-label="To date" />
          <div className="relative flex-1 min-w-[180px]">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search message text" className={`${inputCls} w-full pl-8`} />
          </div>
        </div>

        {error && <div className="mb-3 px-4 py-3 rounded-xl border border-red-100 bg-red-50 text-sm text-red-600">{error}</div>}

        <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
          <div className="hidden md:grid grid-cols-[150px_200px_170px_1fr] gap-3 px-4 py-2.5 text-[11px] font-semibold uppercase tracking-wide text-gray-400 border-b border-gray-100">
            <span>When</span><span>Chat</span><span>From</span><span>Message</span>
          </div>
          {rows.map(m => (
            <div key={m.id} className="grid md:grid-cols-[150px_200px_170px_1fr] gap-x-3 gap-y-0.5 px-4 py-3 border-b border-gray-50 last:border-0 text-sm">
              <span className="text-xs text-gray-500">{fmt(m.created_at)}</span>
              <span className="font-medium text-gray-900 truncate">{roomLabel(roomById.get(m.room_id))}</span>
              <span className="text-xs">
                <span
                  className="inline-block px-1.5 py-0.5 rounded font-semibold mr-1.5"
                  style={m.sender_type === 'athlete' ? { backgroundColor: '#eef2ff', color: '#4338ca' } : { backgroundColor: 'rgba(165,141,105,0.18)', color: '#7a6748' }}
                >
                  {m.sender_type === 'athlete' ? 'Athlete' : 'Coach'}
                </span>
                <span className="text-gray-500">{m.sender_name}</span>
              </span>
              <span className="text-gray-800 whitespace-pre-wrap break-words">{m.body}</span>
            </div>
          ))}
          {!loading && rows.length === 0 && <p className="px-4 py-10 text-center text-sm text-gray-400">No messages match these filters.</p>}
          {loading && <div className="flex justify-center py-8"><Loader2 size={18} className="animate-spin text-gray-400" /></div>}
        </div>

        <div className="flex items-center justify-between mt-3">
          <p className="text-xs text-gray-400">Showing {rows.length} of {total} message{total === 1 ? '' : 's'}</p>
          {rows.length < total && !loading && (
            <button onClick={() => load(rows.length)} className="text-xs font-semibold px-3 py-1.5 rounded-md border border-gray-200 hover:bg-white">Load more</button>
          )}
        </div>
      </div>
    </div>
  );
}
