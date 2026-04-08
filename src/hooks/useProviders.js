import { useState } from 'react';

const KEY = 'propath_providers';

function uid() { return `prov_${Date.now()}_${Math.random().toString(36).slice(2, 5)}`; }

const SEED_PROVIDERS = [
  { id: 'prov_seed_1', name: 'Nelly Okonkwo',   pillars: ['nutrition'],          sessionRate: 120,  accessLevel: 'internal' },
  { id: 'prov_seed_2', name: 'Dr. Sarah Kamal', pillars: ['psych'],              sessionRate: 150,  accessLevel: 'internal' },
  { id: 'prov_seed_3', name: 'Marcus Osei',      pillars: ['psych'],              sessionRate: 180,  accessLevel: 'external' },
  { id: 'prov_seed_4', name: 'Dr. Ali Hassan',   pillars: ['physio'],             sessionRate: 100,  accessLevel: 'internal' },
];

function load() {
  try {
    const stored = localStorage.getItem(KEY);
    if (stored) return JSON.parse(stored);
    return SEED_PROVIDERS;
  } catch { return SEED_PROVIDERS; }
}

// Provider shape:
// { id, name, pillars: string[], sessionRate: number|null, accessLevel: 'internal'|'external' }

export function useProviders() {
  const [providers, setProviders] = useState(load);

  const persist = (list) => {
    setProviders(list);
    try { localStorage.setItem(KEY, JSON.stringify(list)); } catch {}
  };

  const addProvider    = (p) => persist([...providers, { ...p, id: uid() }]);
  const updateProvider = (p) => persist(providers.map(x => x.id === p.id ? p : x));
  const deleteProvider = (id) => persist(providers.filter(x => x.id !== id));

  return { providers, addProvider, updateProvider, deleteProvider };
}
