import { useCallback, useEffect, useState } from 'react';
import { listBlockTemplates } from '../utils/programmeTemplates';

/**
 * Loads the saved block_templates list (active rows). Re-fetches when
 * `tick` changes — pass a tick from the parent that increments after a
 * save/delete.
 */
export function useBlockTemplates(tick = 0) {
  const [templates, setTemplates] = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [error,     setError]     = useState(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    const res = await listBlockTemplates();
    if (res.ok) { setTemplates(res.templates); setError(null); }
    else        { setTemplates([]); setError(res.error); }
    setLoading(false);
  }, []);

  useEffect(() => { refresh(); }, [refresh, tick]);

  return { templates, loading, error, refresh };
}
