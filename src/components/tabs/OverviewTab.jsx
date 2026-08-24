import { useState, useRef } from 'react';
import { Camera, ClipboardList, Smartphone } from 'lucide-react';
import InitialsAvatar from '../InitialsAvatar';
import PhotoCropModal from '../PhotoCropModal';
import TabBar from '../ui/TabBar';
import OverviewCalendar from './OverviewCalendar';
import { SPORTS, COHORTS, GENDERS, COHORT_CONFIG } from '../../data/athletes';
import { useAthleteApp } from '../../hooks/useAthleteApp';
import { calculateAthleteMaturation } from '../../utils/maturation';

const OVERVIEW_SUBTABS = [
  { id: 'general',  label: 'General'  },
  { id: 'calendar', label: 'Calendar' },
];

// ─── Athlete App activation panel ────────────────────────────────────────────
function AthleteAppPanel({ athleteId }) {
  const { tokenData, loading, submitting, activate, deactivate } = useAthleteApp(athleteId);
  const [copied, setCopied] = useState(false);

  if (loading) return null;

  const isActive = tokenData?.is_active ?? false;
  const shareUrl = tokenData?.token
    ? `${window.location.origin}/athlete/${tokenData.token}`
    : '';

  const handleCopy = async () => {
    await navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleToggle = () => (isActive ? deactivate() : activate());

  return (
    <div className="bg-white rounded-lg border border-gray-100 p-5"
      style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
      <div className="flex items-center gap-3 mb-3">
        <div className="p-2 rounded-lg" style={{ backgroundColor: 'rgba(165,141,105,0.12)' }}>
          <Smartphone size={18} style={{ color: '#A58D69' }} />
        </div>
        <div className="flex-1">
          <h3 className="font-semibold text-gray-900 text-sm">Athlete App</h3>
          <p className="text-xs text-gray-400">
            One permanent link to the athlete-facing app. No login required.
          </p>
        </div>
        <button
          type="button"
          onClick={handleToggle}
          disabled={submitting}
          className="relative inline-flex h-6 w-11 items-center rounded-full transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
          style={{ backgroundColor: isActive ? '#A58D69' : '#d1d5db' }}
          aria-label={isActive ? 'Deactivate' : 'Activate'}
        >
          <span
            className="inline-block h-4 w-4 rounded-full bg-white shadow transition-transform"
            style={{ transform: isActive ? 'translateX(22px)' : 'translateX(4px)' }}
          />
        </button>
      </div>

      {isActive ? (
        <div className="flex items-center gap-2">
          <input
            readOnly value={shareUrl}
            className="flex-1 rounded-lg px-3 py-2 text-xs font-mono bg-gray-50 border border-gray-200 text-gray-600 outline-none"
          />
          <button
            onClick={handleCopy}
            className="rounded-lg px-3 py-2 text-xs font-semibold text-white"
            style={{ backgroundColor: '#A58D69' }}
          >
            {copied ? 'Copied!' : 'Copy'}
          </button>
        </div>
      ) : (
        <p className="text-xs text-gray-400">
          {tokenData
            ? 'App is deactivated. Toggle on to reactivate the link.'
            : 'Toggle on to generate a shareable app link for this athlete.'}
        </p>
      )}
    </div>
  );
}

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

// ─── Main export ─────────────────────────────────────────────────────────────
export default function OverviewTab({
  onUpdate,
  onUpdatePhoto,
  localAthlete,
  setLocalAthlete,
  // Deep-link out of the Calendar sub-tab when a gym session pill is clicked.
  // Routed via AthleteProfile so it can switch to Physical Dev → Programme → Week.
  onNavigateToProgrammeWeek,
  // Role gates editing in the Calendar sub-tab.
  role,
}) {
  const fileRef = useRef();
  const [cropSrc, setCropSrc] = useState(null);
  const [subTab, setSubTab]   = useState('general');

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

  // Derive Maturation Stage and PHV % directly from the athlete's
  // maturation entries so the Overview header always matches what the
  // Maturation tab shows. Read-only here — coaches edit the entries
  // (height/weight/parents) on the Maturation tab and the calc updates
  // here automatically.
  const maturationCalc = calculateAthleteMaturation(localAthlete);
  const derivedStage  = maturationCalc?.stage  || null;
  const derivedPahPct = maturationCalc?.pahPct ?? null;
  const age = calculateAge(localAthlete.dob);

  return (
    <div>
      <TabBar
        tabs={OVERVIEW_SUBTABS}
        active={subTab}
        onChange={setSubTab}
        className="mb-6 no-print"
      />

      {subTab === 'calendar' ? (
        <OverviewCalendar
          athlete={localAthlete}
          role={role}
          onNavigateToProgrammeWeek={onNavigateToProgrammeWeek}
        />
      ) : (
    <div className="space-y-6">
      {cropSrc && (
        <PhotoCropModal
          src={cropSrc}
          onConfirm={handleCropConfirm}
          onCancel={() => setCropSrc(null)}
        />
      )}
      {/* ── Header card — Phase 3 polish ─────────────────────── */}
      <div className="bg-white rounded-xl overflow-hidden border border-ink-100 shadow-card">
        {/* Cohort identity strip — slim band so it reads as a colour
            accent for the cohort, not a competing visual element. The
            photo sits ENTIRELY below it (no crossover). */}
        <div
          className="h-7"
          style={{
            background: `linear-gradient(135deg, ${cohortStyle.bg} 0%, ${cohortStyle.bg}cc 100%)`,
          }}
        />

        <div className="px-6 pb-6 pt-5">
          <div className="flex items-start gap-5 mb-5">
            {/* Photo — bigger (112px), white ring for elevation off the cover */}
            <div className="relative shrink-0">
              <div
                className="w-28 h-28 rounded-full overflow-hidden flex items-center justify-center cursor-pointer ring-4 ring-white"
                style={{ backgroundColor: '#111827', boxShadow: '0 4px 12px rgba(15,15,15,0.12)' }}
                onClick={() => fileRef.current.click()}
              >
                {localAthlete.photo
                  ? <img src={localAthlete.photo} alt={localAthlete.name} className="w-full h-full object-cover" />
                  : <InitialsAvatar name={localAthlete.name || 'A'} size="xl" />}
              </div>
              <button onClick={() => fileRef.current.click()}
                className="absolute bottom-1 right-1 p-1.5 rounded-full ring-2 ring-white text-white shadow-sm hover:scale-110 transition-transform"
                style={{ backgroundColor: '#A58D69' }} title="Upload photo">
                <Camera size={12} />
              </button>
              <input ref={fileRef} type="file" accept="image/jpeg,image/png" className="hidden" onChange={handleFileChange} />
            </div>

            {/* Name + chips */}
            <div className="flex-1 min-w-0 pt-1">
              <input type="text" value={localAthlete.name}
                onChange={e => set('name', e.target.value)} onBlur={save}
                className="text-h1 text-ink-900 w-full bg-transparent border-b border-transparent hover:border-ink-200 focus:border-ink-300 focus:outline-none transition-colors -ml-1 px-1" />
              <div className="flex items-center gap-1.5 flex-wrap mt-2">
                <span className="inline-flex items-center text-micro font-bold px-2.5 py-1 rounded-full uppercase"
                  style={{ backgroundColor: cohortStyle.bg, color: cohortStyle.text }}>
                  <InlineSelect value={localAthlete.cohort || 'Elite'} onChange={v => set('cohort', v)} onBlur={save}
                    options={COHORTS} className="text-micro font-bold uppercase bg-transparent focus:outline-none cursor-pointer"
                    style={{ color: cohortStyle.text }} />
                </span>
                <span className="inline-flex items-center text-meta font-semibold px-2.5 py-1 rounded-full"
                  style={{ backgroundColor: 'rgba(67,126,141,0.10)', color: '#437E8D' }}>
                  <InlineSelect value={localAthlete.sport} onChange={v => set('sport', v)} onBlur={save}
                    options={SPORTS} className="text-meta font-semibold bg-transparent focus:outline-none cursor-pointer"
                    style={{ color: '#437E8D' }} />
                </span>
                <span className="inline-flex items-center text-meta font-medium text-ink-500 px-2.5 py-1 rounded-full bg-ink-100">
                  <InlineSelect value={localAthlete.gender || 'Male'} onChange={v => set('gender', v)} onBlur={save}
                    options={GENDERS} className="text-meta font-medium bg-transparent focus:outline-none cursor-pointer text-ink-500" />
                </span>
              </div>
            </div>

            {/* VALD Profile ID — top-right of header. Admin edits inline,
                co-admins see read-only in lighter grey. */}
            <div className="shrink-0 pt-1 text-right max-w-[280px] min-w-[180px]">
              <p className="text-micro font-bold text-ink-400 uppercase mb-1.5">VALD Profile ID</p>
              {role === 'admin' ? (
                <input
                  type="text"
                  value={localAthlete.vald_profile_id || ''}
                  onChange={e => set('vald_profile_id', e.target.value.trim())}
                  onBlur={save}
                  placeholder="Paste from VALD Hub"
                  spellCheck={false}
                  className="text-meta font-mono font-semibold text-ink-800 w-full text-right bg-transparent border-b border-transparent hover:border-ink-200 focus:border-gold-500 focus:outline-none transition-colors placeholder:text-ink-400 placeholder:font-normal placeholder:font-sans"
                />
              ) : (
                <p
                  className="text-meta font-mono w-full truncate"
                  style={{ color: '#9ca3af' }}
                  title={localAthlete.vald_profile_id || 'Not set'}
                >
                  {localAthlete.vald_profile_id || '—'}
                </p>
              )}
            </div>
          </div>

          {/* Stat strip — DOB / Age / Maturation / PHV in evenly spaced
              cells with subtle dividers. No top border above so it reads
              as a continuation of the avatar+name block, not a section. */}
          <div className="grid grid-cols-2 sm:grid-cols-4 rounded-lg border border-ink-100 overflow-hidden">
            {[
              { label: 'Date of Birth', node: (
                  <input type="date" value={localAthlete.dob} onChange={e => set('dob', e.target.value)} onBlur={save}
                    className="text-body font-semibold text-ink-800 bg-transparent focus:outline-none w-full" />
                ) },
              { label: 'Age', node: (
                  <p className="text-body font-semibold text-ink-800">{age != null ? `${age} years` : '—'}</p>
                ) },
              { label: 'Maturation Stage', node: (
                  <p className="text-body font-semibold text-ink-800" title="Derived from the Maturation tab">
                    {derivedStage || <span className="text-ink-400 font-normal italic">Not set</span>}
                  </p>
                ) },
              { label: '% PAH', node: (
                  <p className="text-body font-semibold text-ink-800" title="Derived from the Maturation tab">
                    {derivedPahPct != null
                      ? <>{derivedPahPct.toFixed(1)} <span className="text-body text-ink-400 font-normal">%</span></>
                      : <span className="text-ink-400 font-normal italic">Not set</span>}
                  </p>
                ) },
            ].map(({ label, node }, i) => (
              <div key={label}
                className={`px-4 py-3 ${i > 0 ? 'border-l border-ink-100' : ''} bg-ink-50/40`}>
                <p className="text-micro font-bold text-ink-400 uppercase mb-1">{label}</p>
                {node}
              </div>
            ))}
          </div>

          {/* Biography */}
          <div className="mt-5">
            <p className="text-micro font-bold text-ink-400 uppercase mb-2">Biography</p>
            <textarea value={localAthlete.biography || ''} onChange={e => set('biography', e.target.value)} onBlur={save}
              rows={3} placeholder="Add a short biography…"
              className="w-full text-body text-ink-700 leading-relaxed bg-ink-50/40 border border-ink-100 hover:border-ink-200 focus:border-gold-500 rounded-md px-3 py-2 focus:outline-none transition-colors resize-none placeholder:text-ink-400" />
          </div>
        </div>
      </div>

      {/* ── Info row ─────────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { label: 'Assigned Coach', field: 'coach', placeholder: 'Coach name' },
          { label: 'School / Club',  field: 'affiliation', placeholder: 'Affiliation' },
        ].map(({ label, field, placeholder }) => (
          <div key={field} className="bg-white rounded-lg border border-ink-100 shadow-card p-4">
            <p className="text-micro font-bold text-ink-400 uppercase mb-1.5">{label}</p>
            <input type="text" value={localAthlete[field] || ''} onChange={e => set(field, e.target.value)} onBlur={save}
              placeholder={placeholder}
              className="text-body font-semibold text-ink-800 w-full bg-transparent border-b border-transparent hover:border-ink-200 focus:border-gold-500 focus:outline-none transition-colors placeholder:text-ink-400 placeholder:font-normal" />
          </div>
        ))}
        <div className="bg-white rounded-lg border border-ink-100 shadow-card p-4">
          <p className="text-micro font-bold text-ink-400 uppercase mb-1.5">Emergency Contact</p>
          <input type="text" value={localAthlete.emergencyName || ''} onChange={e => set('emergencyName', e.target.value)} onBlur={save}
            placeholder="Contact name"
            className="text-body font-semibold text-ink-800 w-full bg-transparent border-b border-transparent hover:border-ink-200 focus:border-gold-500 focus:outline-none transition-colors mb-1 placeholder:text-ink-400 placeholder:font-normal" />
          <input type="tel" value={localAthlete.emergencyPhone || ''} onChange={e => set('emergencyPhone', e.target.value)} onBlur={save}
            placeholder="+971 50 000 0000"
            className="text-meta text-ink-500 w-full bg-transparent border-b border-transparent hover:border-ink-200 focus:border-gold-500 focus:outline-none transition-colors placeholder:text-ink-400" />
        </div>
      </div>



      {/* ── Athlete App activation ────────────────────────────── */}
      <AthleteAppPanel athleteId={localAthlete.id} />

      {/* ── Placeholders ─────────────────────────────────────── */}
      <div className="space-y-4">
        <Placeholder icon={ClipboardList} title="Session Log" phase="Phase 3" />
      </div>
    </div>
      )}
    </div>
  );
}
