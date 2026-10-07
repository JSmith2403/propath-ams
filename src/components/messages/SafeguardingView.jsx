import { useCallback, useEffect, useMemo, useState } from 'react';
import { ShieldCheck, Download, Search, Loader2 } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import SafeguardingChats from './SafeguardingChats';

const GOLD = '#A58D69';
const PAGE = 200;
const EXPORT_CHUNK = 1000;
const EXPORT_MAX = 20000;
const COLS = 'id, athlete_id, title, body, sent_by, created_at, read_at, sender_type';

const fmt = (iso) => new Date(iso).toLocaleString('en-GB', {
  day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit',
});

function csvCell(v) {
  const s = String(v ?? '');
  // Neutralise spreadsheet formula injection as well as quoting.
  const safe = /^[=+\-@\t\r]/.test(s) ? `'${s}` : s;
  return `"${safe.replace(/"/g, '""')}"`;
}

/**
 * Safeguarding log — admin-only, read-only view of every message sent
 * between coaches and athletes. The underlying table can't be edited or
 * deleted (database trigger), so this is a reliable record for any review.
 */
function AthleteThreadsLog({ athletes = [] }) {
  const [athleteId, setAthleteId] = useState('');
  const [direction, setDirection] = useState('');
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [search, setSearch] = useState('');
  const [rows, setRows] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);
  const [error, setError] = useState(null);

  const nameById = useMemo(() => new Map(athletes.map(a => [a.id, a.name])), [athletes]);
  const sortedAthletes = useMemo(
    () => [...athletes].sort((a, b) => (a.name || '').localeCompare(b.name || '')),
    [athletes]
  );

  const buildQuery = useCallback((select, opts) => {
    let q = supabase.from('athlete_messages').select(select, opts);
    if (athleteId) q = q.eq('athlete_id', athleteId);
    if (direction) q = q.eq('sender_type', direction);
    if (from) q = q.gte('created_at', new Date(`${from}T00:00:00`).toISOString());
    if (to) q = q.lte('created_at', new Date(`${to}T23:59:59.999`).toISOString());
    const term = search.trim().replace(/[%,()]/g, ' ');
    if (term) q = q.or(`body.ilike.%${term}%,title.ilike.%${term}%`);
    return q;
  }, [athleteId, direction, from, to, search]);

  const load = useCallback(async (offset = 0) => {
    setLoading(true);
    const { data, count, error: err } = await buildQuery(COLS, { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(offset, offset + PAGE - 1);
    if (err) { setError(err.message); setLoading(false); return; }
    setError(null);
    setTotal(count || 0);
    setRows(prev => (offset === 0 ? (data || []) : [...prev, ...(data || [])]));
    setLoading(false);
  }, [buildQuery]);

  // Debounce so typing in search doesn't fire a query per keystroke.
  useEffect(() => {
    const t = setTimeout(() => load(0), 250);
    return () => clearTimeout(t);
  }, [load]);

  const exportCsv = async () => {
    setExporting(true);
    try {
      const all = [];
      for (let offset = 0; offset < EXPORT_MAX; offset += EXPORT_CHUNK) {
        const { data, error: err } = await buildQuery(COLS)
          .order('created_at', { ascending: true })
          .range(offset, offset + EXPORT_CHUNK - 1);
        if (err) throw err;
        all.push(...(data || []));
        if (!data || data.length < EXPORT_CHUNK) break;
      }
      const header = ['Date/time', 'Athlete', 'Direction', 'Sender', 'Title', 'Message', 'Read at'];
      const lines = all.map(m => [
        new Date(m.created_at).toISOString(),
        nameById.get(m.athlete_id) || m.athlete_id,
        m.sender_type === 'athlete' ? 'Athlete to coaches' : 'Coach to athlete',
        m.sent_by || '',
        m.title || '',
        m.body || '',
        m.read_at ? new Date(m.read_at).toISOString() : '',
      ].map(csvCell).join(','));
      const blob = new Blob([[header.map(csvCell).join(','), ...lines].join('\r\n')], { type: 'text/csv;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `propath-messages-${new Date().toISOString().slice(0, 10)}.csv`;
      a.click();
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
              <ShieldCheck size={20} style={{ color: GOLD }} /> Safeguarding log
            </h1>
            <p className="text-xs text-gray-500 mt-1 max-w-xl">
              Every message between coaches and athletes, newest first. Messages can't be edited or
              deleted by anyone — not coaches, not admins — so this is a reliable record. Athletes are
              told in the app that their messages are saved and visible to the coaching and
              safeguarding team.
            </p>
          </div>
          <button
            onClick={exportCsv}
            disabled={exporting || total === 0}
            className="shrink-0 flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold text-white disabled:opacity-50"
            style={{ backgroundColor: GOLD }}
          >
            {exporting ? <Loader2 size={14} className="animate-spin" /> : <Download size={14} />}
            Export CSV
          </button>
        </div>

        <div className="flex flex-wrap gap-2 mb-4">
          <select value={athleteId} onChange={(e) => setAthleteId(e.target.value)} className={inputCls} aria-label="Athlete">
            <option value="">All athletes</option>
            {sortedAthletes.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
          </select>
          <select value={direction} onChange={(e) => setDirection(e.target.value)} className={inputCls} aria-label="Direction">
            <option value="">Coach &amp; athlete</option>
            <option value="coach">Coach → athlete</option>
            <option value="athlete">Athlete → coaches</option>
          </select>
          <input type="date" value={from} onChange={(e) => setFrom(e.target.value)} className={inputCls} aria-label="From date" />
          <input type="date" value={to} onChange={(e) => setTo(e.target.value)} className={inputCls} aria-label="To date" />
          <div className="relative flex-1 min-w-[180px]">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search message text"
              className={`${inputCls} w-full pl-8`}
            />
          </div>
        </div>

        {error && (
          <div className="mb-3 px-4 py-3 rounded-xl border border-red-100 bg-red-50 text-sm text-red-600">
            {error}
          </div>
        )}

        <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
          <div className="hidden md:grid grid-cols-[150px_150px_150px_1fr_90px] gap-3 px-4 py-2.5 text-[11px] font-semibold uppercase tracking-wide text-gray-400 border-b border-gray-100">
            <span>When</span><span>Athlete</span><span>From</span><span>Message</span><span>Read</span>
          </div>

          {rows.map(m => (
            <div key={m.id} className="grid md:grid-cols-[150px_150px_150px_1fr_90px] gap-x-3 gap-y-0.5 px-4 py-3 border-b border-gray-50 last:border-0 text-sm">
              <span className="text-xs text-gray-500">{fmt(m.created_at)}</span>
              <span className="font-medium text-gray-900 truncate">{nameById.get(m.athlete_id) || m.athlete_id}</span>
              <span className="text-xs">
                <span
                  className="inline-block px-1.5 py-0.5 rounded font-semibold mr-1.5"
                  style={m.sender_type === 'athlete'
                    ? { backgroundColor: '#eef2ff', color: '#4338ca' }
                    : { backgroundColor: 'rgba(165,141,105,0.18)', color: '#7a6748' }}
                >
                  {m.sender_type === 'athlete' ? 'Athlete' : 'Coach'}
                </span>
                <span className="text-gray-500">{m.sent_by || ''}</span>
              </span>
              <span className="text-gray-800 whitespace-pre-wrap break-words">
                {m.title && <strong className="block text-xs">{m.title}</strong>}
                {m.body}
              </span>
              <span className="text-xs text-gray-400">{m.read_at ? fmt(m.read_at) : 'Unread'}</span>
            </div>
          ))}

          {!loading && rows.length === 0 && (
            <p className="px-4 py-10 text-center text-sm text-gray-400">No messages match these filters.</p>
          )}
          {loading && (
            <div className="flex justify-center py-8"><Loader2 size={18} className="animate-spin text-gray-400" /></div>
          )}
        </div>

        <div className="flex items-center justify-between mt-3">
          <p className="text-xs text-gray-400">Showing {rows.length} of {total} message{total === 1 ? '' : 's'}</p>
          {rows.length < total && !loading && (
            <button onClick={() => load(rows.length)} className="text-xs font-semibold px-3 py-1.5 rounded-md border border-gray-200 hover:bg-white">
              Load more
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

/**
 * Safeguarding — two read-only logs behind one tab bar: each athlete's shared
 * coaching-team thread, and every group / private chat.
 */
export default function SafeguardingView({ athletes = [] }) {
  const [tab, setTab] = useState('threads');
  const tabs = [['threads', 'Athlete threads'], ['chats', 'Group & private chats']];
  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <div className="flex gap-1 px-6 pt-3 border-b border-gray-200 bg-white shrink-0">
        {tabs.map(([key, label]) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className="text-sm font-semibold px-4 py-2 -mb-px border-b-2 transition-colors"
            style={tab === key ? { borderColor: GOLD, color: '#7a6748' } : { borderColor: 'transparent', color: '#6b7280' }}
          >
            {label}
          </button>
        ))}
      </div>
      {tab === 'threads' ? <AthleteThreadsLog athletes={athletes} /> : <SafeguardingChats athletes={athletes} />}
    </div>
  );
}
