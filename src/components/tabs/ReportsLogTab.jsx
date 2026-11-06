import { useCallback, useEffect, useRef, useState } from 'react';
import { Download, FileText, Loader2, Trash2, Upload } from 'lucide-react';
import { supabase } from '../../lib/supabase';

const GOLD = '#A58D69';
const BUCKET = 'athlete-reports';
const MAX_BYTES = 25 * 1024 * 1024;

const fmtDate = (d) => (d ? new Date(`${d}T12:00:00`).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : '');
const fmtSize = (n) => (n == null ? '' : n >= 1048576 ? `${(n / 1048576).toFixed(1)} MB` : `${Math.max(1, Math.round(n / 1024))} KB`);

/**
 * Reports log — every report kept against this athlete, newest first. A report is a file with a name you
 * choose ("Pre-season testing"); upload it here, open it from here. Staff only.
 * (The old in-app report builder is archived in src/archive; a report generator will feed this log later.)
 */
export default function ReportsLogTab({ athlete }) {
  const [reports, setReports] = useState(null);
  const [error, setError] = useState(null);
  const [notSetUp, setNotSetUp] = useState(false);
  const [title, setTitle] = useState('');
  const [date, setDate] = useState(() => new Date().toLocaleDateString('en-CA'));
  const [file, setFile] = useState(null);
  const [busy, setBusy] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const fileRef = useRef(null);

  const load = useCallback(async () => {
    const { data, error: err } = await supabase.from('athlete_reports').select('*')
      .eq('athlete_id', athlete.id).order('report_date', { ascending: false }).order('created_at', { ascending: false });
    if (err) {
      if (/athlete_reports|relation|does not exist/i.test(err.message || '')) setNotSetUp(true);
      else setError(err.message);
      setReports([]);
      return;
    }
    setNotSetUp(false); setError(null); setReports(data || []);
  }, [athlete.id]);

  useEffect(() => { setReports(null); load(); }, [load]);

  const upload = async (e) => {
    e.preventDefault();
    if (!file || !title.trim() || busy) return;
    if (file.size > MAX_BYTES) { setError('That file is over 25 MB.'); return; }
    setBusy(true); setError(null);
    const safe = file.name.replace(/[^\w.-]+/g, '_');
    const path = `${athlete.id}/${Date.now()}-${safe}`;
    const up = await supabase.storage.from(BUCKET).upload(path, file, { contentType: file.type || undefined });
    if (up.error) { setBusy(false); setError(`Couldn’t upload: ${up.error.message}`); return; }
    const ins = await supabase.from('athlete_reports').insert({
      athlete_id: athlete.id, title: title.trim(), report_date: date, file_path: path,
      file_name: file.name, mime_type: file.type || null, size_bytes: file.size,
    });
    if (ins.error) {
      await supabase.storage.from(BUCKET).remove([path]);
      setBusy(false); setError(`Couldn’t save the report: ${ins.error.message}`); return;
    }
    setTitle(''); setFile(null); if (fileRef.current) fileRef.current.value = '';
    setBusy(false);
    load();
  };

  const open = async (r) => {
    const { data, error: err } = await supabase.storage.from(BUCKET).createSignedUrl(r.file_path, 120, { download: r.file_name || true });
    if (err || !data?.signedUrl) { setError('Couldn’t open that file.'); return; }
    window.open(data.signedUrl, '_blank', 'noopener');
  };

  const remove = async (r) => {
    setConfirmDelete(null);
    await supabase.storage.from(BUCKET).remove([r.file_path]);
    const { error: err } = await supabase.from('athlete_reports').delete().eq('id', r.id);
    if (err) setError(err.message);
    load();
  };

  return (
    <div className="max-w-3xl">
      <div className="mb-4">
        <h2 className="text-lg font-bold text-gray-900">Reports</h2>
        <p className="text-sm text-gray-500">Every report kept for {athlete.name}. Staff only: athletes and parents don’t see this list.</p>
      </div>

      {notSetUp ? (
        <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          The reports log isn’t switched on yet. It needs <code>sql/athlete_reports_2026-11-06.sql</code> to be run once.
        </div>
      ) : (
        <form onSubmit={upload} className="rounded-xl border border-gray-200 bg-white p-4 mb-5 grid gap-3 sm:grid-cols-[1fr_150px]">
          <label className="block">
            <span className="text-xs font-semibold text-gray-600">Name</span>
            <input value={title} onChange={e => setTitle(e.target.value)} placeholder="e.g. Pre-season testing" maxLength={120}
              className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm" />
          </label>
          <label className="block">
            <span className="text-xs font-semibold text-gray-600">Report date</span>
            <input type="date" value={date} onChange={e => setDate(e.target.value)} className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm" />
          </label>
          <label className="block sm:col-span-2">
            <span className="text-xs font-semibold text-gray-600">File (PDF, Word, Excel, PowerPoint, CSV or image, up to 25 MB)</span>
            <input ref={fileRef} type="file" onChange={e => setFile(e.target.files?.[0] || null)}
              accept=".pdf,.docx,.xlsx,.pptx,.csv,.png,.jpg,.jpeg,.webp" className="mt-1 block w-full text-sm text-gray-700" />
          </label>
          <div className="sm:col-span-2 flex items-center gap-3">
            <button type="submit" disabled={busy || !file || !title.trim()}
              className="inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold text-white disabled:opacity-50" style={{ backgroundColor: GOLD }}>
              {busy ? <Loader2 size={14} className="animate-spin" /> : <Upload size={14} />} Add to log
            </button>
            {error && <span className="text-xs text-red-600">{error}</span>}
          </div>
        </form>
      )}

      {reports === null ? (
        <div className="flex justify-center py-10"><Loader2 size={20} className="animate-spin text-gray-400" /></div>
      ) : reports.length === 0 ? (
        !notSetUp && <p className="text-sm text-gray-400 py-6 text-center">No reports yet.</p>
      ) : (
        <ul className="rounded-xl border border-gray-200 bg-white divide-y divide-gray-100">
          {reports.map(r => (
            <li key={r.id} className="flex items-center gap-3 px-4 py-3">
              <FileText size={18} className="shrink-0 text-gray-400" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-900 truncate">{r.title}</p>
                <p className="text-xs text-gray-500 truncate">{fmtDate(r.report_date)} · {r.file_name}{r.size_bytes ? ` · ${fmtSize(r.size_bytes)}` : ''}</p>
              </div>
              <button onClick={() => open(r)} className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50">
                <Download size={13} /> Open
              </button>
              {confirmDelete === r.id ? (
                <span className="flex items-center gap-1.5">
                  <button onClick={() => remove(r)} className="text-xs font-semibold px-2.5 py-1.5 rounded-lg text-white bg-red-500">Delete</button>
                  <button onClick={() => setConfirmDelete(null)} className="text-xs text-gray-500">Cancel</button>
                </span>
              ) : (
                <button onClick={() => setConfirmDelete(r.id)} aria-label={`Delete ${r.title}`} className="p-1.5 rounded text-gray-400 hover:text-red-600 hover:bg-gray-50"><Trash2 size={14} /></button>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
