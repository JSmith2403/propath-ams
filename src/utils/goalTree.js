// Shared constants + tree-building for the quarterly Goals & Development
// framework (development_plans + goals tables). Used by both the coach
// hook (useDevelopmentPlans) and the athlete hook (useAthleteGoals) so
// the tree shape and vocabulary stay identical on both sides — that's
// what makes the athlete/coach goal comparison a direct one.

export const TIER_ORDER = ['long', 'medium', 'short', 'process'];

export const TIER_META = {
  long:    { label: 'Long-term',   short: 'LT' },
  medium:  { label: 'Medium-term', short: 'MT' },
  short:   { label: 'Short-term',  short: 'ST' },
  process: { label: 'Process',     short: 'How' },
};

// Keys match RAG_DOMAINS in data/athletes.js exactly (physical/psych/
// nutrition/lifestyle) so a domain tag can be cross-referenced with the
// pillar's own RAG status without a translation table.
export const DOMAIN_META = {
  physical:  { label: 'Physical',      color: '#437E8D' },
  nutrition: { label: 'Nutritional',   color: '#A58D69' },
  psych:     { label: 'Psychological', color: '#7C5CBF' },
  lifestyle: { label: 'Lifestyle',     color: '#C2703D' },
};

export const GOAL_STATUS_META = {
  not_started: { label: 'Not Started', color: '#9ca3af', bg: 'rgba(156,163,175,0.1)' },
  on_track:    { label: 'On Track',    color: '#22c55e', bg: 'rgba(34,197,94,0.1)' },
  at_risk:     { label: 'At Risk',     color: '#f59e0b', bg: 'rgba(245,158,11,0.1)' },
  achieved:    { label: 'Achieved',    color: '#16a34a', bg: 'rgba(22,163,74,0.12)' },
  missed:      { label: 'Missed',      color: '#ef4444', bg: 'rgba(239,68,68,0.1)' },
};

export const QUARTER_META = {
  1: { label: 'Q1', range: 'Jan – Mar', startMonth: 0, endMonth: 2 },
  2: { label: 'Q2', range: 'Apr – Jun', startMonth: 3, endMonth: 5 },
  3: { label: 'Q3', range: 'Jul – Sep', startMonth: 6, endMonth: 8 },
  4: { label: 'Q4', range: 'Oct – Dec', startMonth: 9, endMonth: 11 },
};

export function quarterBounds(year, quarter) {
  const meta = QUARTER_META[quarter];
  const start = new Date(year, meta.startMonth, 1);
  const end = new Date(year, meta.endMonth + 1, 0); // last day of end month
  return { start: start.toLocaleDateString('en-CA'), end: end.toLocaleDateString('en-CA') };
}

export function currentYearQuarter() {
  const now = new Date();
  return { year: now.getFullYear(), quarter: Math.floor(now.getMonth() / 3) + 1 };
}

// Nests a flat goals[] array (as returned from the goals table) into a
// tree keyed by parent_goal_id. Roots are goals with no parent (tier
// 'long'). Siblings sort by position, then created_at as a tiebreak.
export function buildGoalTree(flatGoals = []) {
  const byId = new Map();
  flatGoals.forEach(g => byId.set(g.id, { ...g, children: [] }));
  const roots = [];
  byId.forEach(node => {
    if (node.parent_goal_id && byId.has(node.parent_goal_id)) {
      byId.get(node.parent_goal_id).children.push(node);
    } else {
      roots.push(node);
    }
  });
  const sortFn = (a, b) => (a.position - b.position) || (new Date(a.created_at) - new Date(b.created_at));
  const sortRec = (nodes) => {
    nodes.sort(sortFn);
    nodes.forEach(n => sortRec(n.children));
  };
  sortRec(roots);
  return roots;
}
