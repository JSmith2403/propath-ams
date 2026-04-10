import { useState } from 'react';
import { UserPlus, Trash2, ChevronDown, ChevronUp, ToggleLeft, ToggleRight, X } from 'lucide-react';
import { useUserManagement } from '../hooks/useUserManagement';

const ROLE_LABELS = { admin: 'Admin', co_admin: 'Co-Admin', external: 'External' };

const ROLE_COLORS = {
  admin:    { bg: 'rgba(67,126,141,0.12)',   text: '#085777' },
  co_admin: { bg: 'rgba(165,141,105,0.12)',  text: '#7a6540' },
  external: { bg: '#f3f4f6',                 text: '#6b7280' },
};

function RoleBadge({ role }) {
  const c = ROLE_COLORS[role] || ROLE_COLORS.external;
  return (
    <span
      className="text-xs font-semibold px-2 py-0.5 rounded"
      style={{ backgroundColor: c.bg, color: c.text }}
    >
      {ROLE_LABELS[role] || role}
    </span>
  );
}

// ── Invite Modal ──────────────────────────────────────────────────────────────
function InviteModal({ onClose, onInvite }) {
  const [name,     setName]     = useState('');
  const [email,    setEmail]    = useState('');
  const [role,     setRole]     = useState('external');
  const [busy,     setBusy]     = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const canSubmit = name.trim() && email.trim() && role && !busy;

  const handleSubmit = async () => {
    if (!canSubmit) return;
    setBusy(true);
    setErrorMsg('');
    try {
      await onInvite({ name, email, role });
      onClose();
    } catch (err) {
      setErrorMsg(err.message || 'Invite failed. Please try again.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ backgroundColor: 'rgba(0,0,0,0.45)' }}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 p-6">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-base font-bold text-gray-900">Invite New User</h2>
          <button onClick={onClose} className="p-1 rounded text-gray-400 hover:text-gray-600 transition-colors">
            <X size={18} />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Full Name</label>
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="e.g. Sarah Thompson"
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-800 placeholder-gray-300 focus:outline-none focus:border-[#437E8D] transition-colors"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Email Address</label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="sarah@example.com"
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-800 placeholder-gray-300 focus:outline-none focus:border-[#437E8D] transition-colors"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Role</label>
            <select
              value={role}
              onChange={e => setRole(e.target.value)}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-800 focus:outline-none focus:border-[#437E8D] transition-colors bg-white"
            >
              <option value="co_admin">Co-Admin</option>
              <option value="external">External Provider</option>
              <option value="admin">Admin</option>
            </select>
          </div>

          {errorMsg && (
            <p className="text-xs text-red-500 bg-red-50 border border-red-100 rounded-lg px-3 py-2">{errorMsg}</p>
          )}
        </div>

        <div className="flex items-center gap-3 mt-6">
          <button
            onClick={handleSubmit}
            disabled={!canSubmit}
            className="px-4 py-2 rounded-lg text-sm font-semibold text-white disabled:opacity-40 disabled:cursor-not-allowed transition-opacity"
            style={{ backgroundColor: '#A58D69' }}
          >
            {busy ? 'Sending…' : 'Send Invite'}
          </button>
          <button onClick={onClose} className="px-4 py-2 rounded-lg text-sm font-medium text-gray-500 hover:text-gray-700 transition-colors">
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Allocation Manager (expanded inline) ──────────────────────────────────────
function AllocationManager({ user, athletes, onAdd, onRemove }) {
  const [busy, setBusy] = useState(null); // athleteId being toggled

  const allocated   = athletes.filter(a => user.allocations.includes(a.id));
  const unallocated = athletes.filter(a => !user.allocations.includes(a.id));

  const toggle = async (athleteId, isCurrentlyAllocated) => {
    setBusy(athleteId);
    try {
      if (isCurrentlyAllocated) await onRemove(user.id, athleteId);
      else                       await onAdd(user.id, athleteId);
    } finally {
      setBusy(null);
    }
  };

  const allSorted = [
    ...allocated.map(a => ({ ...a, allocated: true })),
    ...unallocated.map(a => ({ ...a, allocated: false })),
  ].sort((a, b) => a.name.localeCompare(b.name));

  return (
    <div className="mt-3 border-t border-gray-100 pt-3">
      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
        Athlete Allocations
        <span className="font-normal normal-case ml-1 text-gray-400">({allocated.length} assigned)</span>
      </p>
      {athletes.length === 0 ? (
        <p className="text-xs text-gray-400 italic">No athletes in the system yet.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-1 max-h-60 overflow-y-auto pr-1">
          {allSorted.map(athlete => {
            const isBusy = busy === athlete.id;
            return (
              <label
                key={athlete.id}
                className={`flex items-center gap-2.5 px-3 py-2 rounded-lg cursor-pointer transition-colors select-none ${
                  athlete.allocated ? 'bg-[rgba(165,141,105,0.08)]' : 'hover:bg-gray-50'
                }`}
              >
                <input
                  type="checkbox"
                  checked={athlete.allocated}
                  disabled={isBusy}
                  onChange={() => toggle(athlete.id, athlete.allocated)}
                  className="rounded border-gray-300 disabled:opacity-50"
                  style={{ accentColor: '#A58D69' }}
                />
                <span className="text-sm text-gray-700 flex-1 truncate">{athlete.name}</span>
                {isBusy && <span className="text-xs text-gray-400">…</span>}
              </label>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ── User Row ──────────────────────────────────────────────────────────────────
function UserRow({ user, athletes, onSetActive, onAddAllocation, onRemoveAllocation }) {
  const [expanded,   setExpanded]   = useState(false);
  const [togglingActive, setTogglingActive] = useState(false);

  const handleToggleActive = async () => {
    setTogglingActive(true);
    try { await onSetActive(user.id, !user.isActive); }
    finally { setTogglingActive(false); }
  };

  const isExternal = user.role === 'external';

  return (
    <div className={`bg-white rounded-xl border transition-colors ${expanded ? 'border-gray-200' : 'border-gray-100'}`}
      style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
      <div className="flex items-center gap-4 px-5 py-4">
        {/* Avatar */}
        <div
          className="w-9 h-9 rounded-full flex items-center justify-center shrink-0 text-sm font-bold"
          style={{ backgroundColor: 'rgba(165,141,105,0.12)', color: '#A58D69' }}
        >
          {user.name ? user.name.charAt(0).toUpperCase() : '?'}
        </div>

        {/* Name + email */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm font-semibold text-gray-800">{user.name || '—'}</span>
            <RoleBadge role={user.role} />
            {!user.isActive && (
              <span className="text-xs font-medium px-2 py-0.5 rounded bg-gray-100 text-gray-400">Inactive</span>
            )}
          </div>
          <p className="text-xs text-gray-400 truncate mt-0.5">{user.email}</p>
        </div>

        {/* Allocation count (external only) */}
        {isExternal && (
          <span className="text-xs text-gray-400 shrink-0 hidden sm:block">
            {user.allocations.length} athlete{user.allocations.length !== 1 ? 's' : ''}
          </span>
        )}

        {/* Controls */}
        <div className="flex items-center gap-2 shrink-0">
          {/* Active toggle */}
          <button
            onClick={handleToggleActive}
            disabled={togglingActive}
            title={user.isActive ? 'Deactivate user' : 'Reactivate user'}
            className="p-1 rounded transition-colors disabled:opacity-40"
          >
            {user.isActive
              ? <ToggleRight size={20} style={{ color: '#A58D69' }} />
              : <ToggleLeft  size={20} className="text-gray-300" />}
          </button>

          {/* Expand allocations (external only) */}
          {isExternal && (
            <button
              onClick={() => setExpanded(e => !e)}
              title="Manage allocations"
              className="p-1 rounded text-gray-400 hover:text-gray-600 transition-colors"
            >
              {expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            </button>
          )}
        </div>
      </div>

      {isExternal && expanded && (
        <div className="px-5 pb-4">
          <AllocationManager
            user={user}
            athletes={athletes}
            onAdd={onAddAllocation}
            onRemove={onRemoveAllocation}
          />
        </div>
      )}
    </div>
  );
}

// ── Main export ───────────────────────────────────────────────────────────────
export default function UserManagementView({ athletes = [] }) {
  const {
    users, loading, error,
    inviteUser, setUserActive, addAllocation, removeAllocation,
  } = useUserManagement();

  const [showInvite, setShowInvite] = useState(false);
  const [inviteError, setInviteError] = useState('');

  const handleInvite = async (data) => {
    setInviteError('');
    await inviteUser(data);
  };

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="max-w-3xl mx-auto px-6 py-8">

        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-xl font-bold text-gray-900">User Management</h1>
            <p className="text-xs text-gray-400 mt-0.5">Manage staff access and athlete allocations</p>
          </div>
          <button
            onClick={() => setShowInvite(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold text-white transition-opacity hover:opacity-90"
            style={{ backgroundColor: '#A58D69' }}
          >
            <UserPlus size={15} />
            Invite User
          </button>
        </div>

        {/* Error state */}
        {error && (
          <div className="mb-4 px-4 py-3 rounded-xl border border-red-100 bg-red-50 text-sm text-red-600">
            Failed to load users: {error}
          </div>
        )}

        {/* Loading state */}
        {loading && (
          <div className="flex justify-center py-16">
            <div
              className="w-8 h-8 rounded-full border-4 animate-spin"
              style={{ borderColor: 'rgba(165,141,105,0.25)', borderTopColor: '#A58D69' }}
            />
          </div>
        )}

        {/* User list */}
        {!loading && !error && (
          <>
            {users.length === 0 ? (
              <div className="bg-white rounded-xl border border-gray-100 px-6 py-12 text-center">
                <p className="text-sm text-gray-400 italic">No users found. Invite someone to get started.</p>
              </div>
            ) : (
              <div className="space-y-2">
                {users.map(user => (
                  <UserRow
                    key={user.id}
                    user={user}
                    athletes={athletes}
                    onSetActive={setUserActive}
                    onAddAllocation={addAllocation}
                    onRemoveAllocation={removeAllocation}
                  />
                ))}
              </div>
            )}

            <p className="text-xs text-gray-400 mt-4 text-center">
              {users.length} user{users.length !== 1 ? 's' : ''} total
            </p>
          </>
        )}
      </div>

      {showInvite && (
        <InviteModal
          onClose={() => setShowInvite(false)}
          onInvite={handleInvite}
        />
      )}
    </div>
  );
}
