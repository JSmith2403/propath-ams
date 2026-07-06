import { useEffect, useState } from 'react';

/**
 * Listens for the global `propath:save-error` event (dispatched by
 * persistence helpers when a Supabase write fails) and shows a
 * dismissible toast, so failed saves are never silent.
 */
export default function SaveErrorToast() {
  const [error, setError] = useState(null); // { athleteName, message }

  useEffect(() => {
    const onError = (e) => setError(e.detail || {});
    window.addEventListener('propath:save-error', onError);
    return () => window.removeEventListener('propath:save-error', onError);
  }, []);

  useEffect(() => {
    if (!error) return;
    const t = setTimeout(() => setError(null), 8000);
    return () => clearTimeout(t);
  }, [error]);

  if (!error) return null;

  return (
    <div
      role="alert"
      className="fixed bottom-20 md:bottom-6 left-1/2 -translate-x-1/2 z-[10000]
                 max-w-sm w-[calc(100%-2rem)] rounded-lg shadow-lg px-4 py-3
                 flex items-start gap-3"
      style={{ backgroundColor: '#7f1d1d', color: '#fff' }}
    >
      <div className="flex-1 text-sm">
        <p className="font-semibold">Save failed</p>
        <p className="opacity-90">
          {error.athleteName ? `Changes to ${error.athleteName} were not saved. ` : ''}
          Check your connection and try again.
        </p>
      </div>
      <button
        onClick={() => setError(null)}
        aria-label="Dismiss"
        className="text-white/70 hover:text-white text-lg leading-none"
      >
        ×
      </button>
    </div>
  );
}
