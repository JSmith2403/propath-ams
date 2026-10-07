import { useEffect, useMemo, useState } from 'react';
import { X, Search, Loader2, Users, UserRound } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { COHORT_OPTIONS } from '../../utils/timetable';

const GOLD = '#A58D69';

async function api(action, payload) {
  const { data: { session } } = await supabase.auth.getSession();
  const res = await fetch(`/api/push/${action}`, {
    method: 'POST',
    headers: { 'content-type': 'application/json', ...(session ? { Authorization: `Bearer ${session.access_token}` } : {}) },
    body: JSON.stringify(payload),
  });
  try { return await res.json(); } catch { return { ok: false, error: `Server error (${res.status}).` }; }
}

/**
 * ChatSetupModal — start a group chat (any mix of coaches and athletes, or a
 * coaches-only chat), start a private chat between you and one athlete, or
 * manage an existing group's members. Direct chats are always visible to
 * parents (via their link) and to the safeguarding log.
 */
export default function ChatSetupModal({ mode = 'create', athletes = [], room = null, myUserId, onClose, onDone }) {
  const managing = mode === 'manage';
  const [kind, setKind] = useState('group');
  const [name, setName] = useState(room?.name || '');
  const [athletesCanPost, setAthletesCanPost] = useState(room ? room.athletesCanPost !== false : true);
  const [staff, setStaff] = useState([]);
  const [pickAthletes, setPickAthletes] = useState(new Set());
  const [pickStaff, setPickStaff] = useState(new Set());
  const [removeAthletes, setRemoveAthletes] = useState(new Set());
  const [removeStaff, setRemoveStaff] = useState(new Set());
  const [query, setQuery] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    api('chat-staff', {}).then(r => { if (r.ok) setStaff(r.staff); });
  }, []);

  const memberAthleteIds = useMemo(() => new Set((room?.members || []).filter(m => m.member_type === 'athlete').map(m => m.athlete_id)), [room]);
  const memberStaffIds = useMemo(() => new Set((room?.members || []).filter(m => m.member_type === 'staff').map(m => m.user_id)), [room]);

  const sortedAthletes = useMemo(() => [...athletes].sort((a, b) => (a.name || '').localeCompare(b.name || '')), [athletes]);
  const q = query.trim().toLowerCase();
  const visibleAthletes = sortedAthletes.filter(a => (!managing || !memberAthleteIds.has(a.id)) && (!q || (a.name || '').toLowerCase().includes(q)));
  const visibleStaff = staff.filter(s => s.user_id !== myUserId && (!managing || !memberStaffIds.has(s.user_id)));

  const toggle = (set, setter, id, single = false) => {
    const next = single ? new Set() : new Set(set);
    if (set.has(id)) next.delete(id); else next.add(id);
    setter(next);
  };
  const addCohort = (c) => setPickAthletes(prev => new Set([...prev, ...sortedAthletes.filter(a => a.cohort === c).map(a => a.id)]));

  const direct = !managing && kind === 'direct';
  const canSubmit = managing
    ? true
    : direct ? pickAthletes.size === 1
      : name.trim() && (pickAthletes.size + pickStaff.size) >= 1;

  const submit = async () => {
    setBusy(true); setError(null);
    const r = managing
      ? await api('chat-members', {
        room_id: room.id, name: name.trim() || undefined, athletes_can_post: athletesCanPost,
        add_athlete_ids: [...pickAthletes], add_staff_ids: [...pickStaff],
        remove_athlete_ids: [...removeAthletes], remove_staff_ids: [...removeStaff],
      })
      : await api('chat-create', {
        kind, name: name.trim(), athletes_can_post: athletesCanPost,
        athlete_ids: [...pickAthletes], staff_user_ids: [...pickStaff],
      });
    setBusy(false);
    if (!r.ok) { setError(r.error || 'Something went wrong.'); return; }
    onDone?.(managing ? room.id : r.room_id);
  };

  const row = 'flex items-center gap-2.5 px-2 py-1.5 rounded-lg hover:bg-gray-50 cursor-pointer text-sm';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ backgroundColor: 'rgba(0,0,0,0.45)' }}>
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] flex flex-col">
        <div className="flex items-start justify-between px-5 pt-5 pb-3">
          <div>
            <h2 className="text-lg font-bold text-gray-900">{managing ? 'Manage chat' : 'New chat'}</h2>
            <p className="text-xs text-gray-500 mt-0.5">
              Everything said here is saved permanently for safeguarding and is visible to parents through their link.
            </p>
          </div>
          <button onClick={onClose} aria-label="Close" className="p-1.5 rounded hover:bg-gray-100"><X size={16} /></button>
        </div>

        <div className="px-5 pb-4 overflow-y-auto space-y-4">
          {!managing && (
            <div className="grid grid-cols-2 gap-2">
              {[['group', Users, 'Group chat', 'Coaches and athletes together'], ['direct', UserRound, 'Private chat', 'You and one athlete']].map(([k, Icon, title, sub]) => (
                <button
                  key={k} onClick={() => { setKind(k); setPickAthletes(new Set()); setPickStaff(new Set()); }}
                  className="text-left rounded-xl border p-3 transition-colors"
                  style={kind === k ? { borderColor: GOLD, backgroundColor: 'rgba(165,141,105,0.10)' } : { borderColor: '#e5e7eb' }}
                >
                  <Icon size={16} style={{ color: GOLD }} />
                  <p className="text-sm font-semibold text-gray-900 mt-1">{title}</p>
                  <p className="text-[11px] text-gray-500">{sub}</p>
                </button>
              ))}
            </div>
          )}

          {(managing || kind === 'group') && (
            <div className="space-y-2">
              <input
                value={name} onChange={(e) => setName(e.target.value)} maxLength={80} placeholder="Group name, e.g. Elite Girls"
                className="w-full text-sm rounded-lg border border-gray-200 px-3 py-2 focus:outline-none focus:border-[#A58D69]"
              />
              <label className="flex items-center gap-2 text-xs text-gray-600">
                <input type="checkbox" checked={athletesCanPost} onChange={(e) => setAthletesCanPost(e.target.checked)} />
                Athletes can reply <span className="text-gray-400">(untick for announcements only)</span>
              </label>
            </div>
          )}

          {managing && (
            <div>
              <p className="text-xs font-semibold text-gray-500 mb-1">In this chat</p>
              <div className="flex flex-wrap gap-1.5">
                {(room.members || []).map(m => {
                  const id = m.member_type === 'staff' ? m.user_id : m.athlete_id;
                  const removed = (m.member_type === 'staff' ? removeStaff : removeAthletes).has(id);
                  const isMe = m.user_id === myUserId;
                  return (
                    <span
                      key={`${m.member_type}-${id}`}
                      className="inline-flex items-center gap-1 text-xs px-2 py-1 rounded-full border"
                      style={removed ? { textDecoration: 'line-through', opacity: 0.5, borderColor: '#fca5a5' } : { borderColor: '#e5e7eb' }}
                    >
                      {m.display_name}{m.member_type === 'staff' ? ' · Coach' : ''}
                      {!isMe && (
                        <button
                          onClick={() => (m.member_type === 'staff'
                            ? toggle(removeStaff, setRemoveStaff, id) : toggle(removeAthletes, setRemoveAthletes, id))}
                          className="text-gray-400 hover:text-red-600" aria-label={removed ? 'Undo remove' : 'Remove'}
                        >
                          <X size={11} />
                        </button>
                      )}
                    </span>
                  );
                })}
              </div>
            </div>
          )}

          <div>
            <p className="text-xs font-semibold text-gray-500 mb-1.5">
              {direct ? 'Which athlete?' : managing ? 'Add athletes' : 'Athletes'}
            </p>
            <div className="relative mb-2">
              <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search athletes"
                className="w-full pl-8 pr-3 py-1.5 text-sm rounded-lg border border-gray-200 focus:outline-none focus:border-[#A58D69]"
              />
            </div>
            {!direct && (
              <div className="flex flex-wrap gap-1.5 mb-2">
                {COHORT_OPTIONS.map(c => (
                  <button key={c} onClick={() => addCohort(c)} className="text-[11px] font-semibold px-2 py-1 rounded-full border border-gray-200 text-gray-600 hover:bg-gray-50">
                    + All {c}
                  </button>
                ))}
                {pickAthletes.size > 0 && (
                  <button onClick={() => setPickAthletes(new Set())} className="text-[11px] text-gray-400 px-1.5">Clear</button>
                )}
              </div>
            )}
            <div className="max-h-44 overflow-y-auto border border-gray-100 rounded-lg p-1">
              {visibleAthletes.map(a => (
                <label key={a.id} className={row}>
                  <input
                    type={direct ? 'radio' : 'checkbox'} name="athlete"
                    checked={pickAthletes.has(a.id)}
                    onChange={() => toggle(pickAthletes, setPickAthletes, a.id, direct)}
                  />
                  <span className="flex-1 truncate">{a.name}</span>
                  <span className="text-[11px] text-gray-400">{a.cohort}</span>
                </label>
              ))}
              {!visibleAthletes.length && <p className="text-xs text-gray-400 px-2 py-3 text-center">No athletes to show.</p>}
            </div>
          </div>

          {!direct && (
            <div>
              <p className="text-xs font-semibold text-gray-500 mb-1.5">{managing ? 'Add coaches' : 'Coaches (you\'re included automatically)'}</p>
              <div className="border border-gray-100 rounded-lg p-1">
                {visibleStaff.map(s => (
                  <label key={s.user_id} className={row}>
                    <input type="checkbox" checked={pickStaff.has(s.user_id)} onChange={() => toggle(pickStaff, setPickStaff, s.user_id)} />
                    <span className="flex-1 truncate">{s.name}</span>
                  </label>
                ))}
                {!visibleStaff.length && <p className="text-xs text-gray-400 px-2 py-3 text-center">No other coaches to add.</p>}
              </div>
            </div>
          )}

          {direct && (
            <p className="text-[11px] text-gray-500 bg-gray-50 rounded-lg px-3 py-2">
              Private chats are one coach and one athlete. They&rsquo;re always visible to the athlete&rsquo;s parents
              (through their link) and to the Safeguarding Log, and can&rsquo;t be edited or deleted.
            </p>
          )}
          {error && <p className="text-xs text-red-600" role="alert">{error}</p>}
        </div>

        <div className="px-5 py-3 border-t border-gray-100 flex justify-end gap-2">
          <button onClick={onClose} className="text-sm text-gray-500 px-3 py-2">Cancel</button>
          <button
            onClick={submit} disabled={!canSubmit || busy}
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold text-white disabled:opacity-50"
            style={{ backgroundColor: GOLD }}
          >
            {busy && <Loader2 size={14} className="animate-spin" />}
            {managing ? 'Save changes' : direct ? 'Start private chat' : 'Create group'}
          </button>
        </div>
      </div>
    </div>
  );
}
