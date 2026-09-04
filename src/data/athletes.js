// ─────────────────────────────────────────────────────────────
// Lookup tables
// ─────────────────────────────────────────────────────────────
export const SPORTS = [
  'Football',
  'Basketball',
  'Badminton',
  'Table Tennis',
  'Swimming',
  'Athletics',
  'Motorsport',
  'Sprinting',
  'Golf',
  'Triathlon',
  'Rugby',
];

export const COHORTS = ['Elite', 'Gold', 'Mini'];
export const GENDERS = ['Male', 'Female'];

export const COHORT_CONFIG = {
  'Elite': { bg: '#A58D69', text: '#ffffff' },
  'Gold':  { bg: '#C9982E', text: '#ffffff' },
  'Mini':  { bg: '#437E8D', text: '#ffffff' },
};

export const MATURATION_STAGES = ['Pre-PHV', 'Circa-PHV', 'Post-PHV'];

export const RAG_CONFIG = {
  green: {
    label: 'Green',
    color: '#22c55e',
    textColor: '#3B6D11',
    bgColor: '#EAF3DE',
    meaning: 'Minimal touchpoints needed, maintain oversight',
  },
  amber: {
    label: 'Amber',
    color: '#f59e0b',
    textColor: '#BA7517',
    bgColor: '#FAEEDA',
    meaning: 'Minimal intervention required, keep ticking over',
  },
  red: {
    label: 'Red',
    color: '#ef4444',
    textColor: '#A32D2D',
    bgColor: '#FCEBEB',
    meaning: 'Immediate and intensive intervention required',
  },
  grey: {
    label: 'Grey',
    color: '#9ca3af',
    textColor: '#6b7280',
    bgColor: '#f3f4f6',
    meaning: 'Insufficient data to assess',
  },
};

export const RAG_DOMAINS = [
  { key: 'physical',  label: 'Physical'      },
  { key: 'psych',     label: 'Psychological' },
  { key: 'nutrition', label: 'Nutritional'   },
  { key: 'lifestyle', label: 'Lifestyle'     },
];

// ─────────────────────────────────────────────────────────────
// Athlete factory
// ─────────────────────────────────────────────────────────────
function makeAthlete(id, name, sport, cohort, gender) {
  return {
    id,
    name,
    sport,
    cohort,
    gender,
    dob: '',
    photo: null,
    maturationStage: 'Pre-PHV',
    phvPercent: 0,
    biography: '',
    coach: '',
    affiliation: '',
    emergencyName: '',
    emergencyPhone: '',
    rag:  { physical: 'grey', psych: 'grey', nutrition: 'grey', lifestyle: 'grey' },
    ragLog: { physical: [], psych: [], nutrition: [], lifestyle: [] },
    quarterlyReviews: [],
    checkIns: [],
    phase2: null,
  };
}

// ─────────────────────────────────────────────────────────────
// Dev-only sample roster. These are FICTIONAL names — real athlete
// records live only in the database, never in the repo. Seeding is
// gated behind VITE_SEED_DUMMY=true in useAthletes (dev builds only).
// IDs are kept stable because historical SQL seeds reference them.
// ─────────────────────────────────────────────────────────────
export const DUMMY_ATHLETES = [
  // Elite Female cohort
  makeAthlete('ef1', 'Ava Example',      'Sprinting',    'Elite', 'Female'),
  makeAthlete('ef2', 'Bella Sample',     'Swimming',     'Elite', 'Female'),
  makeAthlete('ef3', 'Cara Demo',        'Swimming',     'Elite', 'Female'),
  makeAthlete('ef4', 'Dana Placeholder', 'Swimming',     'Elite', 'Female'),
  makeAthlete('ef5', 'Erin Test',        'Sprinting',    'Elite', 'Female'),
  makeAthlete('ef6', 'Faye Mock',        'Golf',         'Elite', 'Female'),
  makeAthlete('ef7', 'Gia Fixture',      'Table Tennis', 'Elite', 'Female'),

  // Elite Male cohort
  makeAthlete('em1', 'Harry Example',    'Motorsport',   'Elite', 'Male'),
  makeAthlete('em2', 'Ivan Sample',      'Triathlon',    'Elite', 'Male'),
  makeAthlete('em3', 'Jack Demo',        'Football',     'Elite', 'Male'),
  makeAthlete('em4', 'Kian Test',        'Golf',         'Elite', 'Male'),

  // Mini Athlete Female cohort
  makeAthlete('mf1', 'Lily Fixture',     'Table Tennis', 'Mini',  'Female'),

  // Mini Athlete Male cohort
  makeAthlete('mm1', 'Milo Mock',        'Swimming',     'Mini',  'Male'),
];
