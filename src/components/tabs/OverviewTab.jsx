import { useState, useRef } from 'react';
import { Camera, FileText, ClipboardList, ChevronRight } from 'lucide-react';
import InitialsAvatar from '../InitialsAvatar';
import QuarterlyReviews from '../QuarterlyReviews';
import PhotoCropModal from '../PhotoCropModal';
import { SPORTS, COHORTS, GENDERS, MATURATION_STAGES, RAG_DOMAINS, RAG_CONFIG, COHORT_CONFIG } from '../../data/athletes';

function calculateAge(dob) {
  if (!dob) return null;
  const today = new Date();
  const birth = new Date(dob);
  if (isNaN(birth.getTime())) return null;
  let age = today.getFullYear() - birth.getFullYear();
  const m = today.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
  return age;
}

function within4Months(timestamp) {
  const cutoff = new Date();
  cutoff.setMonth(cutoff.getMonth() - 4);
  return new Date(timestamp) >= cutoff;
}

function formatShort(iso) {
  const d = new Date(iso);
  return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
}


function InlineSelect({ value, onChange, onBlur, options, className = '', style }) {
  return (
    <select value={value} onChange={e => onChange(e.target.value)} onBlur={onBlur} style={style}
      className={`bg-transparent border-b border-transparent hover:border-gray-200 focus:border-gray-300 focus:outline-none transition-colors cursor-pointer ${className}`}>
      {options.map(o => <option key={o}>{o}</option>)}
    </select>
  );
}

function Placeholder({ icon: Icon, title, phase }) {
  return (
    <div className="bg-white rounded-lg border border-gray-100 p-6">
      <div className="flex items-center gap-3 mb-3">
        <div className="p-2 rounded-lg bg-gray-50"><Icon size={18} className="text-gray-300" /></div>
        <div>
          <h3 className="font-semibold text-gray-400 text-sm">{title}</h3>
          <span className="text-xs text-gray-300 font-medium uppercase tracking-wide">Coming in {phase}</span>
        </div>
      </div>
      <div className="h-12 rounded-lg border-2 border-dashed border-gray-100 flex items-center justify-center">
        <p className="text-xs text-gray-300">Data will appear here in {phase}</p>
      </div>
    </div>
  );
}

// ─── Read-only pillar summary card ───────────────────────────────────────────
function PillarCard({ domainKey, label, status, logEntries, onNavigateToPillar }) {
  const config = RAG_CONFIG[status] || RAG_CONFIG.grey;
  const recentEntries = logEntries.filter(e => within4Months(e.timestamp));

  return (
    <div className="bg-white rounded-lg border border-gray-100 p-5 flex flex-col gap-3"
      style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
      {/* Header row */}
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-gray-900 text-sm uppercase tracking-wide">{label}</h3>
        <span className="text-xs font-bold px-2.5 py-1 rounded"
          style={{ backgroundColor: config.bgColor, color: config.textColor }}>
          {config.label}
        </span>
      </div>

      {/* Descriptor */}
      <p className="text-xs text-gray-500 leading-relaxed -mt-1">{config.meaning}</p>

      {/* 4-month entry list */}
      <div className="border-t border-gray-50 pt-3">
        <div className="flex items-center justify-between mb-2">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Last 4 months</p>
          <button
            onClick={() => onNavigateToPillar(domainKey, null)}
            className="text-xs font-medium flex items-center gap-0.5 hover:underline"
            style={{ color: '#A58D69' }}
          >
            View all <ChevronRight size={12} />
          </button>
        </div>

        {recentEntries.length === 0 ? (
          <p className="text-xs text-gray-300 py-2">No entries in the last 4 months.</p>
        ) : (
          <div className="space-y-0.5">
            {recentEntries.map(entry => (
              <button
                key={entry.id}
                onClick={() => onNavigateToPillar(domainKey, entry.id)}
                className="w-full text-left px-2 py-1.5 rounded hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center gap-1.5">
                  <div className="w-1.5 h-1.5 rounded-full shrink-0"
                    style={{ backgroundColor: (RAG_CONFIG[entry.status] || RAG_CONFIG.grey).color }} />
                  <span className="text-xs text-gray-600">
                    {entry.entryType || 'General note'} · {formatShort(entry.timestamp)}
                  </span>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Check-in section ────────────────────────────────────────
const CHECK_IN_TYPES = ['Assessment', 'Check-in', 'Observation'];

const TYPE_COLORS = {
  Assessment:   { bg: 'rgba(67,126,141,0.12)', text: '#085777' },
  'Check-in':   { bg: '#eff6ff', text: '#1d4ed8' },
  Observation:  { bg: '#faf5ff', text: '#7e22ce' },
  // legacy
  'Check in':   { bg: '#eff6ff', text: '#1d4ed8' },
  'General note': { bg: '#f0fdf4', text: '#15803d' },
  'Welfare note': { bg: '#fff7ed', text: '#c2410c' },
};

function CheckInSection({ checkIns = [], onAddCheckIn }) {
  const today = new Date().toISOString().slice(0, 10);
  const [date,     setDate]     = useState(today);
  const [author,   setAuthor]   = useState('');
  const [noteType, setNoteType] = useState('Check-in');
  const [note,     setNote]     = useState('');

  const handleSave = () => {
    if (!note.trim()) return;
    onAddCheckIn({ date, author: author.trim(), noteType, note: note.trim() });
    setNote('');
    setDate(new Date().toISOString().slice(0, 10));
  };

  const sorted = [...checkIns].sort((a, b) => b.date.localeCompare(a.date));

  const inp = 'w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-1 transition-shadow bg-white';

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wide">Check-in Log</h2>
        <p className="text-xs text-gray-400">Shared log — visible to all practitioners</p>
      </div>

      {/* Add note form */}
      <div className="bg-white rounded-lg border border-gray-100 p-4 mb-4"
        style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
        <div className="grid grid-cols-3 gap-3 mb-3">
          <div>
            <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">Date</label>
            <input type="date" value={date} onChange={e => setDate(e.target.value)}
              className={inp} style={{ '--tw-ring-color': '#A58D69' }} />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">Author</label>
            <input type="text" value={author} onChange={e => setAuthor(e.target.value)}
              placeholder="Your name" className={inp} style={{ '--tw-ring-color': '#A58D69' }} />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">Note Type</label>
            <select value={noteType} onChange={e => setNoteType(e.target.value)}
              className={inp} style={{ '--tw-ring-color': '#A58D69' }}>
              {CHECK_IN_TYPES.map(t => <option key={t}>{t}</option>)}
            </select>
          </div>
        </div>
        <div className="mb-3">
          <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">Note</label>
          <textarea value={note} onChange={e => setNote(e.target.value)}
            rows={3} placeholder="Add a check-in note..."
            className={`${inp} resize-none`} style={{ '--tw-ring-color': '#A58D69' }} />
        </div>
        <div className="flex justify-end">
          <button onClick={handleSave} disabled={!note.trim()}
            className="px-5 py-2 text-sm font-semibold text-white rounded-lg transition-opacity disabled:opacity-40"
            style={{ backgroundColor: '#A58D69' }}>
            Save Note
          </button>
        </div>
      </div>

      {/* Log */}
      {sorted.length === 0 ? (
        <p className="text-xs text-gray-300 py-4 text-center">No check-in notes yet.</p>
      ) : (
        <div className="space-y-2">
          {sorted.map(entry => {
            const tc = TYPE_COLORS[entry.noteType] || TYPE_COLORS['General note'];
            return (
              <div key={entry.id} className="bg-white rounded-lg border border-gray-100 px-4 py-3"
                style={{ boxShadow: '0 1px 2px rgba(0,0,0,0.04)' }}>
                <div className="flex items-center gap-2 mb-1.5">
                  <span className="text-xs font-semibold text-gray-500">{entry.date}</span>
                  {entry.author && (
                    <>
                      <span className="text-gray-200 text-xs">·</span>
                      <span className="text-xs font-medium text-gray-600">{entry.author}</span>
                    </>
                  )}
                  <span className="ml-auto text-xs font-semibold px-2 py-0.5 rounded"
                    style={{ backgroundColor: tc.bg, color: tc.text }}>
                    {entry.noteType}
                  </span>
                </div>
                <p className="text-sm text-gray-700 leading-relaxed">{entry.note}</p>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ─── Main export ─────────────────────────────────────────────────────────────
export default function OverviewTab({
  athlete,
  onUpdate,
  onUpdatePhoto,
  localAthlete,
  setLocalAthlete,
  onAddRagEntry,      // (domain, entryData) — for QuarterlyReviews auto-entries
  onSaveReview,       // (review) — for QuarterlyReviews completion
  onNavigateToPillar, // (domain, entryId | null) — navigate to pillar section
  onAddCheckIn,       // (entry) — add a check-in note
}) {
  const fileRef = useRef();
  const [cropSrc, setCropSrc] = useState(null);

  const set = (field, value) => setLocalAthlete(a => ({ ...a, [field]: value }));
  const save = () => onUpdate(localAthlete.id, localAthlete);

  const handleFileChange = e => {
    const file = e.target.files[0];
    // Reset input so re-selecting same file fires change again
    e.target.value = '';
    if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => setCropSrc(ev.target.result);
    reader.readAsDataURL(file);
  };

  const handleCropConfirm = (dataUrl) => {
    setCropSrc(null);
    setLocalAthlete(a => ({ ...a, photo: dataUrl }));
    onUpdatePhoto(localAthlete.id, dataUrl);
  };

  const cohortStyle = COHORT_CONFIG[localAthlete.cohort] || COHORT_CONFIG['Elite'];
  const age = calculateAge(localAthlete.dob);

  return (
    <div className="space-y-6">
      {cropSrc && (
        <PhotoCropModal
          src={cropSrc}
          onConfirm={handleCropConfirm}
          onCancel={() => setCropSrc(null)}
        />
      )}
      {/* ── Header card ─────────────────────────────────────── */}
      <div className="bg-white rounded-xl overflow-hidden" style={{ boxShadow: '0 1px 4px rgba(0,0,0,0.08)' }}>
        <div className="h-1.5" style={{ backgroundColor: cohortStyle.bg }} />
        <div className="p-6">
          <div className="flex items-start gap-6">
            {/* Photo */}
            <div className="relative shrink-0">
              <div className="w-28 h-28 rounded-full overflow-hidden flex items-center justify-center cursor-pointer"
                style={{ backgroundColor: '#111827' }} onClick={() => fileRef.current.click()}>
                {localAthlete.photo
                  ? <img src={localAthlete.photo} alt={localAthlete.name} className="w-full h-full object-cover" />
                  : <InitialsAvatar name={localAthlete.name || 'A'} size="xl" />}
              </div>
              <button onClick={() => fileRef.current.click()}
                className="absolute bottom-0 right-0 p-1.5 rounded-full border-2 border-white text-white"
                style={{ backgroundColor: '#A58D69' }} title="Upload photo">
                <Camera size={12} />
              </button>
              <input ref={fileRef} type="file" accept="image/jpeg,image/png" className="hidden" onChange={handleFileChange} />
            </div>

            {/* Core info */}
            <div className="flex-1 min-w-0">
              <input type="text" value={localAthlete.name}
                onChange={e => set('name', e.target.value)} onBlur={save}
                className="text-2xl font-bold text-gray-900 w-full bg-transparent border-b border-transparent hover:border-gray-200 focus:border-gray-300 focus:outline-none transition-colors mb-1" />
              <div className="flex items-center gap-3 flex-wrap mt-2">
                <span className="inline-block text-xs font-bold px-2.5 py-1 rounded uppercase tracking-wide"
                  style={{ backgroundColor: cohortStyle.bg, color: cohortStyle.text }}>
                  <InlineSelect value={localAthlete.cohort || 'Elite'} onChange={v => set('cohort', v)} onBlur={save}
                    options={COHORTS} className="text-xs font-bold uppercase tracking-wide bg-transparent focus:outline-none"
                    style={{ color: cohortStyle.text }} />
                </span>
                <InlineSelect value={localAthlete.sport} onChange={v => set('sport', v)} onBlur={save}
                  options={SPORTS} className="text-sm font-medium" style={{ color: '#437E8D' }} />
                <InlineSelect value={localAthlete.gender || 'Male'} onChange={v => set('gender', v)} onBlur={save}
                  options={GENDERS} className="text-sm font-medium text-gray-500" />
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-5 pt-5 border-t border-gray-100">
                <div>
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">Date of Birth</p>
                  <input type="date" value={localAthlete.dob} onChange={e => set('dob', e.target.value)} onBlur={save}
                    className="text-sm font-medium text-gray-700 bg-transparent border-b border-transparent hover:border-gray-200 focus:border-gray-300 focus:outline-none transition-colors" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">Age</p>
                  <p className="text-sm font-medium text-gray-700">{age != null ? `${age} years` : '—'}</p>
                </div>
                <div>
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">Maturation Stage</p>
                  <InlineSelect value={localAthlete.maturationStage} onChange={v => set('maturationStage', v)} onBlur={save}
                    options={MATURATION_STAGES} className="text-sm font-medium text-gray-700" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">PHV %</p>
                  <div className="flex items-center gap-1">
                    <input type="number" min="0" max="100" value={localAthlete.phvPercent}
                      onChange={e => set('phvPercent', Number(e.target.value))} onBlur={save}
                      className="text-sm font-medium text-gray-700 w-12 bg-transparent border-b border-transparent hover:border-gray-200 focus:border-gray-300 focus:outline-none transition-colors" />
                    <span className="text-sm text-gray-400">%</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="mt-5 pt-5 border-t border-gray-100">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">Biography</p>
            <textarea value={localAthlete.biography || ''} onChange={e => set('biography', e.target.value)} onBlur={save}
              rows={3} placeholder="Add athlete biography..."
              className="w-full text-sm text-gray-600 leading-relaxed bg-transparent border border-transparent hover:border-gray-200 focus:border-gray-300 rounded px-2 py-1 focus:outline-none transition-colors resize-none placeholder-gray-300" />
          </div>
        </div>
      </div>

      {/* ── Info row ─────────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { label: 'Assigned Coach', field: 'coach', placeholder: 'Coach name' },
          { label: 'School / Club', field: 'affiliation', placeholder: 'Affiliation' },
        ].map(({ label, field, placeholder }) => (
          <div key={field} className="bg-white rounded-lg border border-gray-100 p-4">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">{label}</p>
            <input type="text" value={localAthlete[field] || ''} onChange={e => set(field, e.target.value)} onBlur={save}
              placeholder={placeholder}
              className="text-sm font-medium text-gray-800 w-full bg-transparent border-b border-transparent hover:border-gray-200 focus:border-gray-300 focus:outline-none transition-colors" />
          </div>
        ))}
        <div className="bg-white rounded-lg border border-gray-100 p-4">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">Emergency Contact</p>
          <input type="text" value={localAthlete.emergencyName || ''} onChange={e => set('emergencyName', e.target.value)} onBlur={save}
            placeholder="Contact name"
            className="text-sm font-medium text-gray-800 w-full bg-transparent border-b border-transparent hover:border-gray-200 focus:border-gray-300 focus:outline-none transition-colors mb-1" />
          <input type="tel" value={localAthlete.emergencyPhone || ''} onChange={e => set('emergencyPhone', e.target.value)} onBlur={save}
            placeholder="+971 50 000 0000"
            className="text-sm text-gray-500 w-full bg-transparent border-b border-transparent hover:border-gray-200 focus:border-gray-300 focus:outline-none transition-colors" />
        </div>
      </div>

      {/* ── RAG Pillar Summary (read-only) ───────────────────── */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wide">RAG Ratings</h2>
          <p className="text-xs text-gray-400">Click any entry to navigate to the pillar section</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {RAG_DOMAINS.map(({ key, label }) => (
            <PillarCard
              key={key}
              domainKey={key}
              label={label}
              status={localAthlete.rag?.[key] || 'grey'}
              logEntries={localAthlete.ragLog?.[key] || []}
              onNavigateToPillar={onNavigateToPillar}
            />
          ))}
        </div>
      </div>

      {/* ── Check-in Log ─────────────────────────────────────── */}
      <CheckInSection
        checkIns={localAthlete.checkIns || []}
        onAddCheckIn={onAddCheckIn}
      />

      {/* ── Quarterly reviews ────────────────────────────────── */}
      <QuarterlyReviews
        reviews={localAthlete.quarterlyReviews || []}
        onSaveReview={onSaveReview}
        onAddRagEntry={onAddRagEntry}
      />

      {/* ── Placeholders ─────────────────────────────────────── */}
      <div className="space-y-4">
        <Placeholder icon={FileText} title="Individual Development Plan (IDP)" phase="Phase 2" />
        <Placeholder icon={ClipboardList} title="Session Log" phase="Phase 3" />
      </div>
    </div>
  );
}
