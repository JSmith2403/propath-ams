import { useState, useRef } from 'react';
import { X, Upload } from 'lucide-react';
import { SPORTS, COHORTS, GENDERS, MATURATION_STAGES } from '../data/athletes';
import InitialsAvatar from './InitialsAvatar';

function resizeImageToDataURL(file, maxSize = 400) {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const size = Math.min(img.width, img.height);
        const sx = (img.width - size) / 2;
        const sy = (img.height - size) / 2;
        const outputSize = Math.min(size, maxSize);
        canvas.width = outputSize;
        canvas.height = outputSize;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, sx, sy, size, size, 0, 0, outputSize, outputSize);
        resolve(canvas.toDataURL('image/jpeg', 0.85));
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  });
}

export default function AddAthleteModal({ onClose, onAdd }) {
  const [form, setForm] = useState({
    name: '',
    dob: '',
    sport: 'Football',
    cohort: 'Elite',
    gender: 'Male',
    maturationStage: 'Pre-PHV',
    phvPercent: '',
    biography: '',
    coach: '',
    affiliation: '',
    emergencyName: '',
    emergencyPhone: '',
    photo: null,
  });
  const [errors, setErrors] = useState({});
  const [photoPreview, setPhotoPreview] = useState(null);
  const fileRef = useRef();

  const set = (field, value) => {
    setForm((f) => ({ ...f, [field]: value }));
    if (errors[field]) setErrors((e) => ({ ...e, [field]: null }));
  };

  const handleFile = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const dataUrl = await resizeImageToDataURL(file);
    setPhotoPreview(dataUrl);
    setForm((f) => ({ ...f, photo: dataUrl }));
  };

  const validate = () => {
    const errs = {};
    if (!form.name.trim()) errs.name = 'Name is required';
    return errs;
  };

  const handleSubmit = () => {
    const errs = validate();
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }
    onAdd({
      ...form,
      phvPercent: form.phvPercent === '' ? 0 : Number(form.phvPercent),
    });
    onClose();
  };

  const inputClass = 'w-full px-3 py-2 text-sm border border-gray-200 rounded focus:outline-none focus:ring-2 transition-shadow';
  const focusStyle = { '--tw-ring-color': '#A58D69' };
  const labelClass = 'block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 sticky top-0 bg-white z-10">
          <h2 className="text-lg font-bold text-gray-900">Add New Athlete</h2>
          <button onClick={onClose} className="p-1.5 rounded hover:bg-gray-100 text-gray-500 transition-colors">
            <X size={18} />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Photo */}
          <div className="flex items-center gap-5">
            <div
              className="w-20 h-20 rounded-full overflow-hidden flex items-center justify-center shrink-0 cursor-pointer"
              style={{ backgroundColor: '#111827' }}
              onClick={() => fileRef.current.click()}
            >
              {photoPreview ? (
                <img src={photoPreview} alt="Preview" className="w-full h-full object-cover" />
              ) : form.name ? (
                <InitialsAvatar name={form.name} size="lg" />
              ) : (
                <div className="flex flex-col items-center text-white/40">
                  <Upload size={20} />
                </div>
              )}
            </div>
            <div>
              <button
                onClick={() => fileRef.current.click()}
                className="text-sm font-medium px-4 py-2 rounded border border-gray-200 hover:bg-gray-50 transition-colors"
                style={{ color: '#437E8D' }}
              >
                Upload Photo
              </button>
              <p className="text-xs text-gray-400 mt-1">JPG or PNG, will be cropped to square</p>
              <input ref={fileRef} type="file" accept="image/jpeg,image/png" className="hidden" onChange={handleFile} />
            </div>
          </div>

          {/* Name + DOB */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Full Name *</label>
              <input
                type="text"
                className={inputClass}
                style={focusStyle}
                value={form.name}
                onChange={(e) => set('name', e.target.value)}
                placeholder="e.g. Ahmed Al-Farsi"
              />
              {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
            </div>
            <div>
              <label className={labelClass}>Date of Birth</label>
              <input
                type="date"
                className={inputClass}
                style={focusStyle}
                value={form.dob}
                onChange={(e) => set('dob', e.target.value)}
              />
              {errors.dob && <p className="text-red-500 text-xs mt-1">{errors.dob}</p>}
            </div>
          </div>

          {/* Sport + Cohort + Gender */}
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className={labelClass}>Sport</label>
              <select className={inputClass} value={form.sport} onChange={(e) => set('sport', e.target.value)}>
                {SPORTS.map((s) => <option key={s}>{s}</option>)}
              </select>
            </div>
            <div>
              <label className={labelClass}>Cohort</label>
              <select className={inputClass} value={form.cohort} onChange={(e) => set('cohort', e.target.value)}>
                {COHORTS.map((c) => <option key={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className={labelClass}>Gender</label>
              <select className={inputClass} value={form.gender} onChange={(e) => set('gender', e.target.value)}>
                {GENDERS.map((g) => <option key={g}>{g}</option>)}
              </select>
            </div>
          </div>

          {/* Maturation Stage + PHV % */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Maturation Stage</label>
              <select className={inputClass} value={form.maturationStage} onChange={(e) => set('maturationStage', e.target.value)}>
                {MATURATION_STAGES.map((s) => <option key={s}>{s}</option>)}
              </select>
            </div>
            <div>
              <label className={labelClass}>PHV %</label>
              <input
                type="number"
                min="0"
                max="100"
                className={inputClass}
                value={form.phvPercent}
                onChange={(e) => set('phvPercent', e.target.value)}
                placeholder="0–100"
              />
            </div>
          </div>

          {/* Biography */}
          <div>
            <label className={labelClass}>Biography</label>
            <textarea
              className={`${inputClass} resize-none`}
              rows={3}
              value={form.biography}
              onChange={(e) => set('biography', e.target.value)}
              placeholder="Brief athlete profile..."
            />
          </div>

          {/* Coach + Affiliation */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Assigned Coach</label>
              <input
                type="text"
                className={inputClass}
                value={form.coach}
                onChange={(e) => set('coach', e.target.value)}
                placeholder="e.g. James Whitfield"
              />
            </div>
            <div>
              <label className={labelClass}>School / Club</label>
              <input
                type="text"
                className={inputClass}
                value={form.affiliation}
                onChange={(e) => set('affiliation', e.target.value)}
                placeholder="e.g. Al Wahda FC Academy"
              />
            </div>
          </div>

          {/* Emergency contact */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Emergency Contact Name</label>
              <input
                type="text"
                className={inputClass}
                value={form.emergencyName}
                onChange={(e) => set('emergencyName', e.target.value)}
                placeholder="Full name"
              />
            </div>
            <div>
              <label className={labelClass}>Emergency Contact Number</label>
              <input
                type="tel"
                className={inputClass}
                value={form.emergencyPhone}
                onChange={(e) => set('emergencyPhone', e.target.value)}
                placeholder="+971 50 000 0000"
              />
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-100 sticky bottom-0 bg-white">
          <button onClick={onClose} className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors">
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            className="px-5 py-2 text-sm font-semibold text-white rounded transition-opacity hover:opacity-90"
            style={{ backgroundColor: '#A58D69' }}
          >
            Add Athlete
          </button>
        </div>
      </div>
    </div>
  );
}
