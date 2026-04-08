import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

const SETTINGS_KEY = 'providers';

function uid() { return `prov_${Date.now()}_${Math.random().toString(36).slice(2, 5)}`; }

const SEED_PROVIDERS = [
  { id: 'prov_seed_1', name: 'Nelly Okonkwo',   pillars: ['nutrition'], sessionRate: 120, accessLevel: 'internal' },
  { id: 'prov_seed_2', name: 'Dr. Sarah Kamal', pillars: ['psych'],     sessionRate: 150, accessLevel: 'internal' },
  { id: 'prov_seed_3', name: 'Marcus Osei',      pillars: ['psych'],     sessionRate: 180, accessLevel: 'external' },
  { id: 'prov_seed_4', name: 'Dr. Ali Hassan',   pillars: ['physio'],    sessionRate: 100, accessLevel: 'internal' },
];

async function persistProviders(list) {
  const { error } = await supabase
    .from('app_settings')
    .upsert({ key: SETTINGS_KEY, value: list, updated_at: new Date().toISOString() });
  if (error) console.error('[ProPath] Failed to save providers', error);
}

// Provider shape:
// { id, name, pillars: string[], sessionRate: number|null, accessLevel: 'internal'|'external' }

export function useProviders() {
  const [providers, setProviders] = useState([]);

  useEffect(() => {
    let isMounted = true;

    supabase.from('app_settings').select('value').eq('key', SETTINGS_KEY).single()
      .then(async ({ data, error }) => {
        if (!isMounted) return;
        if (error && error.code !== 'PGRST116') {
          console.error('[ProPath] Failed to load providers', error);
          setProviders(SEED_PROVIDERS);
          return;
        }
        if (data?.value && Array.isArray(data.value) && data.value.length > 0) {
          setProviders(data.value);
        } else {
          // Seed on first run
          setProviders(SEED_PROVIDERS);
          await persistProviders(SEED_PROVIDERS);
        }
      });

    const channel = supabase
      .channel('providers-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'app_settings', filter: `key=eq.${SETTINGS_KEY}` },
        payload => {
          if (!isMounted) return;
          if (payload.new?.value) setProviders(payload.new.value);
        }
      )
      .subscribe();

    return () => {
      isMounted = false;
      supabase.removeChannel(channel);
    };
  }, []);

  const persist = (list) => {
    setProviders(list);
    persistProviders(list);
  };

  const addProvider    = (p) => persist([...providers, { ...p, id: uid() }]);
  const updateProvider = (p) => persist(providers.map(x => x.id === p.id ? p : x));
  const deleteProvider = (id) => persist(providers.filter(x => x.id !== id));

  return { providers, addProvider, updateProvider, deleteProvider };
}
