import { useEffect, useRef, useState } from 'react';
import { CheckCircle2, ImagePlus, Loader2, Sparkles, Type, Upload, X } from 'lucide-react';
import { supabase } from '../../../../lib/supabase';
import { useExerciseLibrary } from '../../../../hooks/useExerciseLibrary';
import { findBestExerciseMatch } from '../../../../utils/fuzzyMatchExercise';

const GOLD = '#A58D69';
const TEAL = '#437E8D';

function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = String(reader.result || '');
      resolve(result.slice(result.indexOf(',') + 1));
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

async function authHeaders() {
  const { data: { session } } = await supabase.auth.getSession();
  return {
    'content-type': 'application/json',
    ...(session ? { Authorization: `Bearer ${session.access_token}` } : {}),
  };
}

// Same-letter superset labels (A1+A2, B1+B2...) share a group — but only
// when 2+ exercises in this one import batch actually carry that letter.
// A lone "A1" with no partner isn't a superset.
function resolveSupersetKeys(exerciseItems) {
  const letterCounts = {};
  for (const it of exerciseItems) {
    const letter = (it.superset_label || '').match(/^[A-Za-z]/)?.[0]?.toUpperCase();
    if (letter) letterCounts[letter] = (letterCounts[letter] || 0) + 1;
  }
  return exerciseItems.map(it => {
    const letter = (it.superset_label || '').match(/^[A-Za-z]/)?.[0]?.toUpperCase();
    return { ...it, superset_key: letter && letterCounts[letter] > 1 ? letter : null };
  });
}

/**
 * ImportProgrammePanel — paste or photograph a written programme and have
 * it parsed into sections/exercises, fuzzy-matched against the existing
 * exercise library, and dropped straight into the session that's open in
 * the builder. Mirrors ExercisePicker's slide-in-from-right treatment so
 * the session stays visible (and live-updates) behind it.
 *
 * Two AI calls, both server-side (api/programme/parse-image,
 * api/programme/parse-text) — this component owns the fuzzy-matching and
 * exercise_library creation itself, then hands the caller a plain
 * { sections, stats } result to fold into the draft via onCommit.
 */
export default function ImportProgrammePanel({
  sessionLabel,
  existingSectionNames = [],
  onClose,
  onCommit,
}) {
  const { exercises: library, refresh: refreshLibrary } = useExerciseLibrary();
  const [entered, setEntered] = useState(false);
  useEffect(() => { const t = setTimeout(() => setEntered(true), 10); return () => clearTimeout(t); }, []);

  const [tab, setTab] = useState('image'); // 'image' | 'text'
  const [text, setText] = useState('');
  const [targetSection, setTargetSection] = useState(existingSectionNames[0] || '__new__');
  const [newSectionName, setNewSectionName] = useState('Imported');

  const [imagePreview, setImagePreview] = useState(null);
  const [ocrStatus, setOcrStatus] = useState('idle'); // idle | loading | success | error
  const [ocrError, setOcrError] = useState(null);
  const fileRef = useRef(null);

  const [parsing, setParsing] = useState(false);
  const [parseError, setParseError] = useState(null);
  const [result, setResult] = useState(null); // { addedCount, fuzzyCount }

  const handleFile = async (file) => {
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) { setOcrError('Image is too large (max 5MB).'); setOcrStatus('error'); return; }
    setResult(null);
    setImagePreview(URL.createObjectURL(file));
    setOcrStatus('loading');
    setOcrError(null);
    try {
      const base64 = await fileToBase64(file);
      const headers = await authHeaders();
      const res = await fetch('/api/programme/parse-image', {
        method: 'POST',
        headers,
        body: JSON.stringify({ image_base64: base64, media_type: file.type }),
      });
      const json = await res.json();
      if (!json.ok) throw new Error(json.error || 'Could not read the image.');
      setText(json.text);
      setOcrStatus('success');
    } catch (e) {
      setOcrStatus('error');
      setOcrError(e.message || 'Could not read the image.');
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file) handleFile(file);
  };

  const handleParseAndAdd = async () => {
    const trimmed = text.trim();
    if (!trimmed || parsing) return;
    setParsing(true);
    setParseError(null);
    setResult(null);
    try {
      const headers = await authHeaders();
      const res = await fetch('/api/programme/parse-text', {
        method: 'POST',
        headers,
        body: JSON.stringify({ text: trimmed }),
      });
      const json = await res.json();
      if (!json.ok) throw new Error(json.error || 'Could not parse that text.');

      const items = json.items || [];
      const hasSectionHeaders = items.some(it => it.type === 'section');

      const sections = [];
      let current = null;
      const ensureSection = (name) => {
        let sec = sections.find(s => s.name.toLowerCase() === name.toLowerCase());
        if (!sec) { sec = { name, steps: [] }; sections.push(sec); }
        current = sec;
        return sec;
      };

      if (!hasSectionHeaders) {
        const name = targetSection === '__new__' ? (newSectionName.trim() || 'Imported') : targetSection;
        ensureSection(name);
      }

      const withKeys = resolveSupersetKeys(items.filter(it => it.type === 'exercise'));
      let keyIdx = 0;
      let addedCount = 0;
      let fuzzyCount = 0;

      for (const raw of items) {
        if (raw.type === 'section') { ensureSection(raw.name); continue; }
        if (!current) ensureSection('Imported');

        if (raw.type === 'note') {
          current.steps.push({ kind: 'note', content: raw.name });
          continue;
        }

        const withKey = withKeys[keyIdx++];
        const match = findBestExerciseMatch(raw.name, library);
        let exerciseId, category, bilateralUnilateral;

        if (match) {
          exerciseId = match.exercise.id;
          category = match.exercise.category;
          bilateralUnilateral = match.exercise.bilateral_unilateral;
          if (match.score < 0.999) fuzzyCount++;
        } else {
          const { data: created, error } = await supabase
            .from('exercise_library')
            .insert({
              name: raw.name,
              category: raw.category || 'accessory',
              bilateral_unilateral: raw.bilateral_unilateral || 'bilateral',
            })
            .select('id, category, bilateral_unilateral')
            .single();
          if (error) throw new Error(`Could not create "${raw.name}": ${error.message}`);
          exerciseId = created.id;
          category = created.category;
          bilateralUnilateral = created.bilateral_unilateral;
        }

        current.steps.push({
          kind: 'exercise',
          exercise_id: exerciseId,
          exercise_name: raw.name,
          category,
          bilateral_unilateral: bilateralUnilateral,
          prescription_type: raw.prescription_type || 'reps_only',
          notes: raw.notes || '',
          sets: raw.sets || 1,
          reps: raw.reps || '',
          target_value: raw.target_value || '',
          superset_key: withKey?.superset_key || null,
        });
        addedCount++;
      }

      onCommit({ sections, stats: { addedCount, fuzzyCount } });
      refreshLibrary();
      setResult({ addedCount, fuzzyCount });
      setText('');
      setImagePreview(null);
      setOcrStatus('idle');
    } catch (e) {
      setParseError(e.message || 'Something went wrong.');
    } finally {
      setParsing(false);
    }
  };

  const widthPx = 480;

  return (
    <>
      <div
        onClick={onClose}
        className="fixed inset-0 z-[95] transition-opacity"
        style={{ backgroundColor: 'rgba(0,0,0,0.18)', opacity: entered ? 1 : 0 }}
      />
      <aside
        role="dialog"
        aria-label="Import programme"
        className="fixed top-0 right-0 bottom-0 z-[100] bg-white shadow-2xl flex flex-col"
        style={{
          width: widthPx,
          transform: entered ? 'translateX(0)' : `translateX(${widthPx}px)`,
          transition: 'transform 250ms ease-in-out',
          borderLeft: '1px solid #e5e7eb',
        }}
      >
        {/* Header */}
        <div className="px-5 pt-5 pb-3 border-b border-gray-100 shrink-0">
          <div className="flex items-start justify-between mb-1">
            <h2 className="text-lg font-bold" style={{ color: '#1C1C1C' }}>Build the Programme</h2>
            <button onClick={onClose} className="p-1.5 rounded hover:bg-gray-100 text-gray-400" aria-label="Close">
              <X size={16} />
            </button>
          </div>
          <p className="text-xs" style={{ color: '#6b7280' }}>
            {sessionLabel ? `Adding to ${sessionLabel}. ` : ''}
            Paste or photograph your written programme — we'll extract the exercises,
            match them to your library, and add them for you.
          </p>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-4">
          {/* Tabs */}
          <div className="flex gap-1 mb-4 rounded-lg p-1" style={{ backgroundColor: '#f3f4f6' }}>
            <button
              onClick={() => setTab('image')}
              className="flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-md text-xs font-semibold transition-colors"
              style={{ backgroundColor: tab === 'image' ? '#fff' : 'transparent', color: tab === 'image' ? TEAL : '#6b7280', boxShadow: tab === 'image' ? '0 1px 2px rgba(0,0,0,0.06)' : 'none' }}
            >
              <ImagePlus size={13} /> Import from Image
            </button>
            <button
              onClick={() => setTab('text')}
              className="flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-md text-xs font-semibold transition-colors"
              style={{ backgroundColor: tab === 'text' ? '#fff' : 'transparent', color: tab === 'text' ? TEAL : '#6b7280', boxShadow: tab === 'text' ? '0 1px 2px rgba(0,0,0,0.06)' : 'none' }}
            >
              <Type size={13} /> Type Text
            </button>
          </div>

          {tab === 'image' && (
            <div className="mb-4">
              <div
                onDragOver={(e) => e.preventDefault()}
                onDrop={handleDrop}
                onClick={() => fileRef.current?.click()}
                className="rounded-lg border-2 border-dashed p-6 text-center cursor-pointer transition-colors hover:bg-gray-50"
                style={{ borderColor: '#e5e7eb' }}
              >
                <Upload size={22} className="mx-auto mb-2" style={{ color: '#9ca3af' }} />
                <p className="text-xs font-semibold" style={{ color: '#1C1C1C' }}>
                  Drag and drop an image here, or click to upload
                </p>
                <p className="text-[10px] mt-0.5" style={{ color: '#9ca3af' }}>Supports JPG, PNG (max 5MB)</p>
                <input
                  ref={fileRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  className="hidden"
                  onChange={(e) => handleFile(e.target.files?.[0])}
                />
              </div>

              {imagePreview && (
                <div className="mt-3 rounded-lg overflow-hidden border" style={{ borderColor: '#e5e7eb' }}>
                  <img src={imagePreview} alt="Uploaded programme" className="w-full max-h-40 object-cover" />
                </div>
              )}

              {ocrStatus === 'loading' && (
                <div className="mt-3 flex items-center gap-2 text-xs" style={{ color: '#6b7280' }}>
                  <Loader2 size={13} className="animate-spin" /> Reading the image…
                </div>
              )}
              {ocrStatus === 'error' && (
                <p className="mt-3 text-xs" style={{ color: '#dc2626' }}>{ocrError}</p>
              )}
              {ocrStatus === 'success' && (
                <div className="mt-3 rounded-lg p-3" style={{ backgroundColor: 'rgba(67,126,141,0.06)', border: '1px solid rgba(67,126,141,0.15)' }}>
                  <div className="flex items-center gap-1.5 mb-2">
                    <Sparkles size={12} style={{ color: TEAL }} />
                    <span className="text-[10px] font-bold uppercase tracking-wider" style={{ color: TEAL }}>Extracted text</span>
                  </div>
                  <textarea
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    rows={5}
                    className="w-full text-xs rounded-md p-2 bg-white border focus:outline-none resize-none"
                    style={{ borderColor: '#e5e7eb', color: '#1C1C1C' }}
                  />
                  <div className="flex items-center gap-1.5 mt-2">
                    <CheckCircle2 size={12} style={{ color: '#16a34a' }} />
                    <span className="text-[10px]" style={{ color: '#16a34a' }}>Text extracted — edit anything above before adding</span>
                  </div>
                </div>
              )}
            </div>
          )}

          {tab === 'text' && (
            <div className="mb-4">
              <textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                rows={10}
                placeholder={'Paste your programme here — numbered sections and bullet exercises both work, e.g.\n\n1. General Mobility\n- Hip 90/90 rocks — 6 each side\n\n2. Strength\n- A1: Goblet Split Lunge — 3 x 6 each leg, RPE 7'}
                className="w-full text-xs rounded-lg p-3 border focus:outline-none resize-none"
                style={{ borderColor: '#e5e7eb', color: '#1C1C1C' }}
              />
            </div>
          )}

          {/* Target section — only matters when the text has no section
              headers of its own; ignored otherwise. */}
          {text.trim() && (
            <div className="mb-4">
              <label className="block text-[10px] font-bold uppercase tracking-wider mb-1.5" style={{ color: '#9ca3af' }}>
                If your text has no section headers, add exercises to
              </label>
              <select
                value={targetSection}
                onChange={(e) => setTargetSection(e.target.value)}
                className="w-full text-xs rounded-md border px-2 py-1.5 focus:outline-none"
                style={{ borderColor: '#e5e7eb', color: '#1C1C1C' }}
              >
                {existingSectionNames.map(name => <option key={name} value={name}>{name}</option>)}
                <option value="__new__">+ New section…</option>
              </select>
              {targetSection === '__new__' && (
                <input
                  value={newSectionName}
                  onChange={(e) => setNewSectionName(e.target.value)}
                  placeholder="Section name"
                  className="w-full mt-1.5 text-xs rounded-md border px-2 py-1.5 focus:outline-none"
                  style={{ borderColor: '#e5e7eb', color: '#1C1C1C' }}
                />
              )}
            </div>
          )}

          <button
            onClick={handleParseAndAdd}
            disabled={!text.trim() || parsing}
            className="w-full flex items-center justify-center gap-2 rounded-lg py-2.5 text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-40"
            style={{ backgroundColor: TEAL }}
          >
            {parsing ? <Loader2 size={14} className="animate-spin" /> : <Sparkles size={14} />}
            {parsing ? 'Parsing…' : 'Parse & Add to Programme'}
          </button>
          <p className="text-[10px] mt-2 text-center" style={{ color: '#9ca3af' }}>
            We'll match exercise names to your library (even if slightly different) and add them to the current week.
          </p>

          {parseError && (
            <p className="mt-3 text-xs text-center" style={{ color: '#dc2626' }}>{parseError}</p>
          )}

          {result && (
            <div className="mt-4 rounded-lg p-3 flex items-center justify-between gap-3" style={{ backgroundColor: 'rgba(34,197,94,0.08)', border: '1px solid rgba(34,197,94,0.2)' }}>
              <div className="flex items-center gap-2">
                <CheckCircle2 size={16} style={{ color: '#16a34a' }} />
                <div>
                  <p className="text-xs font-semibold" style={{ color: '#15803d' }}>
                    {result.addedCount} exercise{result.addedCount === 1 ? '' : 's'} added from your text
                  </p>
                  {result.fuzzyCount > 0 && (
                    <p className="text-[10px]" style={{ color: '#15803d' }}>
                      ({result.fuzzyCount} matched via fuzzy search)
                    </p>
                  )}
                </div>
              </div>
              <button onClick={onClose} className="text-xs font-semibold shrink-0" style={{ color: TEAL }}>
                View all →
              </button>
            </div>
          )}

          {/* Fuzzy matching explainer */}
          <div className="mt-5 rounded-lg p-3" style={{ backgroundColor: 'rgba(165,141,105,0.06)', border: '1px solid rgba(165,141,105,0.15)' }}>
            <div className="flex items-center gap-1.5 mb-1.5">
              <Sparkles size={12} style={{ color: GOLD }} />
              <span className="text-[11px] font-bold" style={{ color: '#1C1C1C' }}>Fuzzy matching</span>
            </div>
            <p className="text-[10px] leading-relaxed" style={{ color: '#6b7280' }}>
              We'll match exercise names to your library even if they're slightly different —
              "Cat-Cow Mobilisation", "Cat-Cow Mobility Flow" and "Cat-Cow" all match the same
              library entry instead of creating duplicates.
            </p>
          </div>
        </div>
      </aside>
    </>
  );
}
