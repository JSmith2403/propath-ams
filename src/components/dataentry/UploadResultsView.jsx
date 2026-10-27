import { useMemo, useRef, useState } from 'react';
import { ClipboardPaste, Image as ImageIcon, FileText, CheckCircle2, AlertTriangle, Loader2, Info } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { METRIC_CATEGORIES, METRIC_MAP } from '../../data/sessionMetrics';
import { protocolOf } from '../../data/testCatalog';
import { parseResultsText, buildPlan, resolveImport } from '../../utils/resultsImport';

const GOLD = '#A58D69';
const todayISO = () => new Date().toLocaleDateString('en-CA');
const labelOf = (key, custom) => METRIC_MAP[key]?.label || custom[key]?.label || key;
const unitOf = (key, custom) => METRIC_MAP[key]?.unit || custom[key]?.unit || '';

function Tag({ tone, children }) {
  const t = { ok: ['#15803d', '#dcfce7'], warn: ['#b45309', '#fef3c7'], bad: ['#b91c1c', '#fee2e2'], mute: ['#6b7280', '#f3f4f6'] }[tone];
  return <span className="inline-block text-[11px] font-semibold px-2 py-0.5 rounded-full whitespace-nowrap" style={{ color: t[0], backgroundColor: t[1] }}>{children}</span>;
}

/** Every test, grouped, for "which test is this?" */
function TestSelect({ value, onChange, custom, placeholder = 'Choose the test…' }) {
  return (
    <select value={value || ''} onChange={(e) => onChange(e.target.value || null)} className="text-sm border border-gray-200 rounded-lg px-2 py-1.5 bg-white max-w-full">
      <option value="">{placeholder}</option>
      {METRIC_CATEGORIES.map(c => (
        <optgroup key={c.key} label={c.label}>{c.metrics.map(m => <option key={m.key} value={m.key}>{m.label}</option>)}</optgroup>
      ))}
      {Object.keys(custom).length > 0 && <optgroup label="Custom">{Object.entries(custom).map(([k, m]) => <option key={k} value={k}>{m.label || k}</option>)}</optgroup>}
    </select>
  );
}

/** One column of the sheet → which test it is. Asks whenever it isn't certain. */
function ColumnCard({ col, custom, onChoose }) {
  const { match, status, key } = col;
  const border = status === 'needs' ? '#fca5a5' : '#e5e7eb';
  return (
    <div className="rounded-lg border bg-white p-3" style={{ borderColor: border }}>
      <div className="flex items-center justify-between gap-2 mb-1">
        <p className="text-sm font-semibold text-gray-900 truncate">“{col.label}”</p>
        {status === 'skipped' ? <Tag tone="mute">Skipped</Tag>
          : status === 'needs' ? <Tag tone="bad">{col.reason === 'ambiguous' ? 'Which one?' : col.reason === 'check' ? 'Check' : 'Unknown test'}</Tag>
          : <Tag tone="ok">{match.confidence === 'exact' || col.key !== match.key ? 'Matched' : 'Confirmed'}</Tag>}
      </div>

      {status === 'needs' && col.reason === 'ambiguous' && (
        <div className="space-y-1.5">
          <p className="text-xs text-gray-600">This could be more than one test — the method is different for each. Which was it?</p>
          {match.candidates.map(k => (
            <label key={k} className="flex items-start gap-2 text-xs rounded-md border border-gray-100 p-2 cursor-pointer hover:bg-gray-50">
              <input type="radio" name={`col-${col.index}`} className="mt-0.5" onChange={() => onChoose({ key: k })} />
              <span><strong className="text-gray-800">{labelOf(k, custom)}</strong>{protocolOf(k) ? <span className="block text-gray-500">{protocolOf(k)}</span> : null}</span>
            </label>
          ))}
          <button onClick={() => onChoose({ skip: true })} className="text-xs text-gray-400 underline">Skip this column</button>
        </div>
      )}

      {status === 'needs' && col.reason === 'check' && (
        <div className="text-xs space-y-1.5">
          <p className="text-gray-600">Looks like <strong className="text-gray-800">{labelOf(match.key, custom)}</strong>. {protocolOf(match.key) && <span className="text-gray-500">{protocolOf(match.key)}</span>}</p>
          <div className="flex items-center gap-2">
            <button onClick={() => onChoose({ confirmed: true })} className="px-2.5 py-1 rounded-md text-white font-semibold" style={{ backgroundColor: GOLD }}>Yes, that’s it</button>
            <TestSelect value="" onChange={(k) => k && onChoose({ key: k })} custom={custom} placeholder="No — it’s…" />
            <button onClick={() => onChoose({ skip: true })} className="text-gray-400 underline">Skip</button>
          </div>
        </div>
      )}

      {status === 'needs' && col.reason === 'unknown' && (
        <div className="text-xs space-y-1.5">
          <p className="text-gray-600">I don’t recognise this test. Pick the one it is, or skip it.</p>
          <div className="flex items-center gap-2">
            <TestSelect value="" onChange={(k) => k && onChoose({ key: k })} custom={custom} />
            <button onClick={() => onChoose({ skip: true })} className="text-gray-400 underline">Skip this column</button>
          </div>
        </div>
      )}

      {status === 'ok' && (
        <div className="text-xs">
          <p className="text-gray-800 font-semibold">{labelOf(key, custom)} <span className="font-normal text-gray-400">{unitOf(key, custom) && `(${unitOf(key, custom)})`}</span></p>
          {protocolOf(key) && <p className="text-gray-500 mt-0.5">{protocolOf(key)}</p>}
          <div className="mt-1 flex items-center gap-2">
            <TestSelect value="" onChange={(k) => k && onChoose({ key: k })} custom={custom} placeholder="Change test…" />
            <button onClick={() => onChoose({ skip: true })} className="text-gray-400 underline">Skip</button>
          </div>
        </div>
      )}
      {status === 'skipped' && <button onClick={() => onChoose({ skip: false, key: undefined })} className="text-xs text-gray-500 underline">Undo skip</button>}
    </div>
  );
}

/** One row of the sheet → which athlete. */
function PersonRow({ person, athletes, byId, onChoose }) {
  const { match, status, id } = person;
  return (
    <div className="rounded-lg border bg-white p-2.5 text-xs" style={{ borderColor: status === 'needs' ? '#fca5a5' : '#e5e7eb' }}>
      <div className="flex items-center justify-between gap-2">
        <span className="font-semibold text-gray-900 truncate">“{person.label}”{status === 'ok' && <span className="font-normal text-gray-500"> → {byId.get(id)?.name}</span>}</span>
        {status === 'skipped' ? <Tag tone="mute">Skipped</Tag> : status === 'needs' ? <Tag tone="bad">{person.reason === 'ambiguous' ? 'Which athlete?' : person.reason === 'check' ? 'Check' : 'Not found'}</Tag> : <Tag tone="ok">Matched</Tag>}
      </div>
      {status === 'needs' && person.reason === 'ambiguous' && (
        <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
          <span className="text-gray-600">Is this</span>
          {match.candidates.map(c => <button key={c} onClick={() => onChoose({ id: c })} className="px-2 py-0.5 rounded-md border border-gray-200 font-semibold text-gray-700 hover:bg-gray-50">{byId.get(c)?.name}</button>)}
          <button onClick={() => onChoose({ skip: true })} className="text-gray-400 underline">Skip</button>
        </div>
      )}
      {status === 'needs' && person.reason === 'check' && (
        <div className="mt-1.5 flex flex-wrap items-center gap-2">
          <span className="text-gray-600">Is this <strong>{byId.get(match.id)?.name}</strong>?</span>
          <button onClick={() => onChoose({ confirmed: true })} className="px-2.5 py-0.5 rounded-md text-white font-semibold" style={{ backgroundColor: GOLD }}>Yes</button>
          <select value="" onChange={(e) => e.target.value && onChoose({ id: e.target.value })} className="border border-gray-200 rounded-md px-1.5 py-0.5 bg-white"><option value="">No — it’s…</option>{athletes.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}</select>
          <button onClick={() => onChoose({ skip: true })} className="text-gray-400 underline">Skip</button>
        </div>
      )}
      {status === 'needs' && person.reason === 'unknown' && (
        <div className="mt-1.5 flex flex-wrap items-center gap-2">
          <span className="text-gray-600">No athlete with that name.</span>
          <select value="" onChange={(e) => e.target.value && onChoose({ id: e.target.value })} className="border border-gray-200 rounded-md px-1.5 py-0.5 bg-white"><option value="">Choose the athlete…</option>{athletes.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}</select>
          <button onClick={() => onChoose({ skip: true })} className="text-gray-400 underline">Skip</button>
        </div>
      )}
      {status === 'skipped' && <button onClick={() => onChoose({ skip: false })} className="mt-1 text-gray-500 underline">Undo skip</button>}
    </div>
  );
}

const CELL_MESSAGE = {
  unreadable: 'Can’t read this value',
  'needs-left-right': 'Needs left / right (e.g. 18/20)',
  'single-value': 'This test has one value, not left / right',
  duplicate: 'Already has a result on this date',
};

/**
 * Upload results — paste text, a CSV/TXT file, or a photo of a sheet. Everything the app isn't sure about is
 * put to you first (which test? which athlete? is this value right? duplicate?), and the Upload button stays
 * off until all of it is settled. Results are saved the same way as every other entry (see addPerformanceEntry).
 */
export default function UploadResultsView({ athletes = [], customMetrics = {}, onAddEntry }) {
  const [step, setStep] = useState('input');           // input | review | done
  const [text, setText] = useState('');
  const [date, setDate] = useState(todayISO());
  const [plan, setPlan] = useState(null);
  const [choices, setChoices] = useState({ columns: {}, people: {}, cells: {} });
  const [existing, setExisting] = useState(new Set());
  const [busy, setBusy] = useState(null);              // 'ocr' | 'review' | null
  const [error, setError] = useState(null);
  const [savedCount, setSavedCount] = useState(0);
  const fileRef = useRef(null);
  const imgRef = useRef(null);

  const byId = useMemo(() => new Map(athletes.map(a => [a.id, a])), [athletes]);
  const resolved = useMemo(() => (plan ? resolveImport(plan, choices, { defaultDate: date, existing, customMetrics }) : null), [plan, choices, date, existing, customMetrics]);

  const choose = (kind, k, patch) => setChoices(c => ({ ...c, [kind]: { ...c[kind], [k]: { ...(c[kind][k] || {}), ...patch } } }));

  const readFile = async (file) => {
    if (!file) return;
    setError(null);
    if (file.type.startsWith('image/')) {
      if (file.size > 5 * 1024 * 1024) { setError('That image is over 5MB — try a smaller photo or a screenshot.'); return; }
      setBusy('ocr');
      try {
        const b64 = await new Promise((res, rej) => { const r = new FileReader(); r.onload = () => res(String(r.result).split(',')[1]); r.onerror = rej; r.readAsDataURL(file); });
        const { data: { session } } = await supabase.auth.getSession();
        const resp = await fetch('/api/programme/parse', {
          method: 'POST',
          headers: { 'content-type': 'application/json', Authorization: `Bearer ${session?.access_token || ''}` },
          body: JSON.stringify({ mode: 'ocr', kind: 'results', image_base64: b64, media_type: file.type }),
        });
        const json = await resp.json().catch(() => ({}));
        if (!resp.ok || !json.ok) throw new Error(json.error || 'Couldn’t read that image.');
        setText(json.text);
      } catch (e) { setError(e.message || 'Couldn’t read that image.'); }
      setBusy(null);
    } else {
      setText(await file.text());
    }
  };

  const review = async () => {
    setError(null);
    const parsed = parseResultsText(text);
    if (!parsed.rows.length || parsed.headers.length < 2) { setError('I need a header row with the test names, then one row per athlete — athlete name first.'); return; }
    setBusy('review');
    const p = buildPlan(parsed, athletes, customMetrics);
    // Results these athletes already have on these dates, so duplicates get flagged before anything is saved.
    const ids = [...new Set(p.people.flatMap(x => x.match.candidates.length ? x.match.candidates : (x.match.id ? [x.match.id] : [])))];
    const dates = [...new Set([date, ...(p.dateCol >= 0 ? parsed.rows.map(r => r.cells[p.dateCol]).filter(Boolean) : [])])];
    let ex = new Set();
    if (ids.length) {
      const { data } = await supabase.from('performance_test_results').select('athlete_id, metric_key, date').in('athlete_id', ids).in('date', dates);
      ex = new Set((data || []).map(r => `${r.athlete_id}|${r.metric_key}|${String(r.date).slice(0, 10)}`));
    }
    setExisting(ex); setPlan(p); setChoices({ columns: {}, people: {}, cells: {} }); setStep('review'); setBusy(null);
  };

  const upload = () => {
    if (!resolved?.canUpload) return;
    resolved.toSave.forEach(r => onAddEntry(r.athleteId, r.metricKey, r.entry));
    setSavedCount(resolved.toSave.length);
    setStep('done');
  };

  const reset = () => { setStep('input'); setText(''); setPlan(null); setError(null); };

  // ── step 1 ──
  if (step === 'input') {
    return (
      <div className="max-w-3xl mx-auto p-6 space-y-4">
        <div>
          <h2 className="text-lg font-bold text-gray-900">Upload results</h2>
          <p className="text-sm text-gray-500">Paste a table, add a CSV, or photograph a sheet. First column is the athlete, first row is the test names. You’ll confirm anything uncertain before a single result is saved.</p>
        </div>
        <div className="grid sm:grid-cols-3 gap-3">
          <button onClick={() => document.getElementById('ur-text')?.focus()} className="rounded-xl border border-gray-200 p-4 text-left hover:bg-gray-50"><ClipboardPaste size={20} style={{ color: GOLD }} /><p className="text-sm font-semibold mt-2">Paste raw text</p><p className="text-xs text-gray-500">From Excel, Sheets or a message</p></button>
          <button onClick={() => fileRef.current?.click()} className="rounded-xl border border-gray-200 p-4 text-left hover:bg-gray-50"><FileText size={20} style={{ color: GOLD }} /><p className="text-sm font-semibold mt-2">Choose a CSV / TXT</p><p className="text-xs text-gray-500">Export from a timing or strength system</p></button>
          <button onClick={() => imgRef.current?.click()} disabled={busy === 'ocr'} className="rounded-xl border border-gray-200 p-4 text-left hover:bg-gray-50 disabled:opacity-60"><ImageIcon size={20} style={{ color: GOLD }} /><p className="text-sm font-semibold mt-2">{busy === 'ocr' ? 'Reading the photo…' : 'Photo or screenshot'}</p><p className="text-xs text-gray-500">AI reads it; you check the text</p></button>
        </div>
        <input ref={fileRef} type="file" accept=".csv,.tsv,.txt,text/*" className="hidden" onChange={(e) => { readFile(e.target.files?.[0]); e.target.value = ''; }} />
        <input ref={imgRef} type="file" accept="image/png,image/jpeg,image/webp" className="hidden" onChange={(e) => { readFile(e.target.files?.[0]); e.target.value = ''; }} />
        <textarea id="ur-text" value={text} onChange={(e) => setText(e.target.value)} rows={10} spellCheck={false}
          placeholder={'Athlete\tCMJ (cm)\tWide grip pull-up\tHamstring 90°\nKaiden Higgins\t42.3\t8\t18/20\nMaggie Urda\t38.7\t6\t19/21'}
          className="w-full text-sm font-mono border border-gray-200 rounded-xl p-3 focus:outline-none focus:border-[#A58D69]" />
        <div className="flex items-end gap-3 flex-wrap">
          <div>
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide block mb-1" htmlFor="ur-date">Date measured</label>
            <input id="ur-date" type="date" value={date} max={todayISO()} onChange={(e) => setDate(e.target.value)} className="text-sm border border-gray-200 rounded-lg px-3 py-2" />
            <p className="text-[11px] text-gray-400 mt-1">A “Date” column in the sheet overrides this per row.</p>
          </div>
          <button onClick={review} disabled={!text.trim() || busy === 'review'} className="px-5 py-2.5 rounded-lg text-sm font-bold text-white disabled:opacity-50 inline-flex items-center gap-2" style={{ backgroundColor: GOLD }}>
            {busy === 'review' && <Loader2 size={14} className="animate-spin" />} Review before uploading
          </button>
        </div>
        {error && <p className="text-sm text-red-600" role="alert">{error}</p>}
      </div>
    );
  }

  // ── step 3 ──
  if (step === 'done') {
    return (
      <div className="max-w-xl mx-auto p-10 text-center">
        <CheckCircle2 size={36} className="mx-auto mb-3" style={{ color: '#16a34a' }} />
        <h2 className="text-lg font-bold text-gray-900">{savedCount} result{savedCount === 1 ? '' : 's'} uploaded</h2>
        <p className="text-sm text-gray-500 mt-1">They’re on each athlete’s testing record, and the core tests show on their Progress tab.</p>
        <button onClick={reset} className="mt-5 px-5 py-2.5 rounded-lg text-sm font-bold text-white" style={{ backgroundColor: GOLD }}>Upload more</button>
      </div>
    );
  }

  // ── step 2: review & confirm ──
  const open = resolved.problems.length;
  const cellAt = (row, col) => resolved.cells.find(c => c.row === row && c.col === col);
  return (
    <div className="max-w-5xl mx-auto p-6 space-y-5">
      <div className="flex items-start justify-between gap-3 flex-wrap">
        <div>
          <h2 className="text-lg font-bold text-gray-900">Check and confirm</h2>
          <p className="text-sm text-gray-500">Each item below is either matched for you or needs your answer. Nothing is saved until the list is clear.</p>
        </div>
        <button onClick={() => setStep('input')} className="text-sm text-gray-500 underline">← Edit the text</button>
      </div>

      <div className="flex items-center gap-2 rounded-lg px-4 py-3 text-sm" style={open ? { backgroundColor: '#fef3c7', color: '#92400e' } : { backgroundColor: '#dcfce7', color: '#166534' }} role="status">
        {open ? <AlertTriangle size={16} /> : <CheckCircle2 size={16} />}
        {open ? `${open} thing${open === 1 ? '' : 's'} to confirm before you can upload.` : `All clear — ${resolved.toSave.length} result${resolved.toSave.length === 1 ? '' : 's'} ready to upload.`}
      </div>

      <section>
        <h3 className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-2">1 · Which test is each column?</h3>
        <div className="grid sm:grid-cols-2 gap-3 items-start">
          {resolved.columns.map(c => <ColumnCard key={c.index} col={c} custom={customMetrics} onChoose={(p) => choose('columns', c.index, { confirmed: undefined, ...p })} />)}
        </div>
      </section>

      <section>
        <h3 className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-2">2 · Which athlete is each row?</h3>
        <div className="grid sm:grid-cols-2 gap-2">
          {resolved.people.map(p => <PersonRow key={p.row} person={p} athletes={athletes} byId={byId} onChoose={(patch) => choose('people', p.row, patch)} />)}
        </div>
      </section>

      <section>
        <h3 className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-2">3 · Results to upload</h3>
        <div className="overflow-x-auto rounded-xl border border-gray-100 bg-white">
          <table className="w-full text-sm">
            <thead><tr className="bg-gray-50 text-xs uppercase text-gray-500">
              <th className="px-3 py-2 text-left">Athlete</th>
              {resolved.columns.map(c => <th key={c.index} className="px-3 py-2 text-left whitespace-nowrap">{c.key ? labelOf(c.key, customMetrics) : c.label}</th>)}
            </tr></thead>
            <tbody>
              {resolved.people.map(p => (
                <tr key={p.row} className="border-t border-gray-100">
                  <td className="px-3 py-2 font-medium text-gray-800 whitespace-nowrap">{p.id ? byId.get(p.id)?.name : p.label}</td>
                  {resolved.columns.map(c => {
                    const cell = cellAt(p.row, c.index);
                    const k = `${p.row}:${c.index}`;
                    if (cell.status === 'skipped') return <td key={c.index} className="px-3 py-2 text-gray-300 line-through">{cell.raw || '—'}</td>;
                    if (cell.status === 'waiting') return <td key={c.index} className="px-3 py-2 text-gray-400">{cell.raw}</td>;
                    if (cell.status === 'needs') {
                      return (
                        <td key={c.index} className="px-3 py-2 align-top" style={{ backgroundColor: cell.reason === 'duplicate' ? '#fffbeb' : '#fef2f2' }}>
                          <p className="text-[11px] font-semibold" style={{ color: cell.reason === 'duplicate' ? '#b45309' : '#b91c1c' }}>{CELL_MESSAGE[cell.reason]}</p>
                          {cell.reason === 'duplicate' ? (
                            <div className="flex items-center gap-1.5 mt-1">
                              <span className="text-xs text-gray-700">{cell.raw}</span>
                              <button onClick={() => choose('cells', k, { dup: 'skip' })} className="text-[11px] px-1.5 py-0.5 rounded border border-gray-200 bg-white">Skip</button>
                              <button onClick={() => choose('cells', k, { dup: 'add' })} className="text-[11px] px-1.5 py-0.5 rounded border border-gray-200 bg-white">Add anyway</button>
                            </div>
                          ) : (
                            <div className="flex items-center gap-1.5 mt-1">
                              <input defaultValue={cell.raw} onBlur={(e) => choose('cells', k, { raw: e.target.value })} className="w-20 text-xs border border-gray-200 rounded px-1.5 py-0.5 bg-white" aria-label="Fix this value" />
                              <button onClick={() => choose('cells', k, { skip: true })} className="text-[11px] text-gray-500 underline">Skip</button>
                            </div>
                          )}
                        </td>
                      );
                    }
                    return <td key={c.index} className="px-3 py-2 text-gray-800">{cell.raw}</td>;
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="flex items-center gap-1.5 text-[11px] text-gray-400 mt-2"><Info size={12} /> Left/right tests need both values, e.g. 18/20. Blank cells are ignored.</p>
      </section>

      <div className="flex items-center gap-3 sticky bottom-0 bg-white/90 backdrop-blur py-3 border-t border-gray-100">
        <button onClick={upload} disabled={!resolved.canUpload} className="px-6 py-2.5 rounded-lg text-sm font-bold text-white disabled:opacity-40 disabled:cursor-not-allowed" style={{ backgroundColor: GOLD }}>
          Upload {resolved.toSave.length} result{resolved.toSave.length === 1 ? '' : 's'}
        </button>
        {!resolved.canUpload && <span className="text-xs text-gray-500">{open ? 'Settle the highlighted items first.' : 'Nothing to upload yet.'}</span>}
      </div>
    </div>
  );
}
