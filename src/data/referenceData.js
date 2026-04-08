// Reference bands and cohort averages for Performance Testing
// All values are per-sport-adjustable in a future admin phase.
// Structure: { low, high, cohortAvg, acuteLimit, unit, label, higherIsBetter }

// Keys match sessionMetrics.js metric keys.
// higherIsBetter defaults to true; set false for time-based metrics.
export const PERFORMANCE_METRICS = {
  cmjHeight: {
    label: 'CMJ Jump Height',
    unit: 'cm',
    low: 28, high: 55, cohortAvg: 40, acuteLimit: 30,
    higherIsBetter: true,
    sports: ['Football', 'Basketball', 'Athletics', 'Swimming'],
  },
  cmjPeakPower: {
    label: 'Peak Power CMJ',
    unit: 'W/kg',
    low: 28, high: 58, cohortAvg: 42, acuteLimit: 30,
    higherIsBetter: true,
    sports: ['Football', 'Basketball', 'Athletics'],
  },
  dsi: {
    label: 'Dynamic Strength Index',
    unit: 'ratio',
    low: 0.55, high: 0.90, cohortAvg: 0.72, acuteLimit: 0.55,
    higherIsBetter: true,
    sports: ['Football', 'Basketball', 'Athletics'],
  },
  rsi105: {
    label: '10-5 Reactive Strength Index',
    unit: 'score',
    low: 1.3, high: 3.0, cohortAvg: 2.0, acuteLimit: 1.3,
    higherIsBetter: true,
    sports: ['Football', 'Basketball', 'Athletics'],
  },
  isometricStrength: {
    label: 'Isometric Strength',
    unit: 'N/kg',
    low: 2.0, high: 5.0, cohortAvg: 3.5, acuteLimit: 2.0,
    higherIsBetter: true,
    sports: ['Football', 'Basketball', 'Athletics', 'Swimming', 'Motorsport'],
  },
  hamstringStrength: {
    label: 'Hamstring Strength',
    unit: 'N/kg',
    low: 1.3, high: 3.0, cohortAvg: 2.1, acuteLimit: 1.3,
    higherIsBetter: true,
    sports: ['Football', 'Athletics', 'Basketball'],
  },
  gripStrength: {
    label: 'Grip Strength',
    unit: 'kg',
    low: 22, high: 52, cohortAvg: 36, acuteLimit: 24,
    higherIsBetter: true,
    bilateral: true,
    sports: ['Motorsport', 'Basketball', 'Badminton', 'Table Tennis'],
  },
  agility505: {
    label: '505 Agility',
    unit: 's',
    low: 2.0, high: 3.2, cohortAvg: 2.5, acuteLimit: 3.0,
    higherIsBetter: false,
    bilateral: true,
    sports: ['Football', 'Basketball', 'Badminton', 'Table Tennis'],
  },
  bleepTest: {
    label: 'Bleep Test',
    unit: 'VO₂max (ml/kg/min)',
    low: 42, high: 68, cohortAvg: 54, acuteLimit: 44,
    higherIsBetter: true,
    sports: ['Football', 'Basketball', 'Athletics', 'Swimming'],
  },
  sprintSplits: {
    label: 'Sprint Splits',
    unit: 's',
    higherIsBetter: false,
    sports: ['Football', 'Athletics', 'Basketball'],
    // Sprint-specific — no single band; handled per split
    splitBands: {
      '5m':  { low: 0.95, high: 1.25, cohortAvg: 1.07 },
      '10m': { low: 1.60, high: 2.00, cohortAvg: 1.76 },
      '20m': { low: 2.70, high: 3.30, cohortAvg: 2.95 },
      '30m': { low: 3.80, high: 4.60, cohortAvg: 4.10 },
    },
  },
  imtpPeakForce: {
    label: 'IMTP Peak Force',
    unit: 'N',
    low: 1800, high: 4000, cohortAvg: 2800, acuteLimit: 1600,
    higherIsBetter: true,
    sports: ['Football', 'Basketball', 'Athletics', 'Swimming', 'Motorsport'],
  },
  // Power — new keys
  cmjPeakForce: {
    label: 'CMJ Peak Force',
    unit: 'N',
    higherIsBetter: true,
  },
  cmjPeakPower: {
    label: 'CMJ Peak Power',
    unit: 'W',
    higherIsBetter: true,
  },
  squatJumpHeight: {
    label: 'Squat Jump Height',
    unit: 'cm',
    low: 24, high: 50, cohortAvg: 36,
    higherIsBetter: true,
  },
  squatJumpPeakForce:  { label: 'Squat Jump Peak Force',  unit: 'N',     higherIsBetter: true  },
  squatJumpPeakPower:  { label: 'Squat Jump Peak Power',  unit: 'W',     higherIsBetter: true  },
  cmjTimeToTakeoff:    { label: 'CMJ Time to Takeoff',    unit: 'ms',    higherIsBetter: false },
  cmjFlightTime:       { label: 'CMJ Flight Time',        unit: 'ms',    higherIsBetter: true  },
  cmjLandingForce:     { label: 'CMJ Landing Force',      unit: 'N',     higherIsBetter: false },
  // Reactivity — new keys
  rsi105ContactTime:    { label: '10-5 Contact Time',                 unit: 'ms',    higherIsBetter: false },
  rsi105FlightTime:     { label: '10-5 Flight Time',                  unit: 'ms',    higherIsBetter: true  },
  dropJumpRSI:          { label: 'Drop Jump RSI',                     unit: 'score', higherIsBetter: true  },
  dropJumpContactTime:  { label: 'Drop Jump Contact Time',            unit: 'ms',    higherIsBetter: false },
  dropJumpHeight:       { label: 'Drop Jump Height',                  unit: 'cm',    higherIsBetter: true  },
  slDropJumpRSI:        { label: 'Single Leg Drop Jump RSI',          unit: 'score', higherIsBetter: true  },
  slDropJumpContactTime:{ label: 'Single Leg Drop Jump Contact Time', unit: 'ms',    higherIsBetter: false },
  // Strength — new keys
  imtpPeakForceLR: { label: 'IMTP Peak Force L/R', unit: 'N',    higherIsBetter: true },
  chinUpMaxReps:   { label: 'Chin-up Max Reps',     unit: 'reps', higherIsBetter: true },
  benchPress3RM:   { label: '3RM Bench Press',      unit: 'kg',   higherIsBetter: true },
  hamstring0:  { label: 'Hamstring 0°',  unit: 'N/kg', low: 1.2, high: 3.0, cohortAvg: 2.0, higherIsBetter: true },
  hamstring30: { label: 'Hamstring 30°', unit: 'N/kg', low: 1.0, high: 2.8, cohortAvg: 1.8, higherIsBetter: true },
  hamstring90: { label: 'Hamstring 90°', unit: 'N/kg', low: 0.8, high: 2.4, cohortAvg: 1.5, higherIsBetter: true },
  hipFlexionSupine90:  { label: 'Hip Flexion Supine 90°',  unit: 'N/kg', higherIsBetter: true },
  hipExtensionProne90: { label: 'Hip Extension Prone 90°', unit: 'N/kg', higherIsBetter: true },
  adduction0:  { label: 'Adduction 0°',  unit: 'N/kg', higherIsBetter: true },
  adduction90: { label: 'Adduction 90°', unit: 'N/kg', higherIsBetter: true },
  // Capacity
  slBridgeCapacity: { label: 'Single Leg Bridge Capacity', unit: 'reps', higherIsBetter: true },
  pushUpMax:        { label: 'Push-up Max',                unit: 'reps', low: 10, high: 40, cohortAvg: 22, higherIsBetter: true },
  calfRaiseMax:     { label: 'Calf Raise Max',             unit: 'reps', higherIsBetter: true },
  sidePlank:        { label: 'Side Plank',                 unit: 's',    low: 30, high: 90, cohortAvg: 55, higherIsBetter: true },
  // Speed — new keys (lower is better)
  sprint10m: { label: '10m Sprint', unit: 's', low: 1.55, high: 2.00, cohortAvg: 1.75, higherIsBetter: false },
  sprint20m: { label: '20m Sprint', unit: 's', low: 2.70, high: 3.40, cohortAvg: 3.00, higherIsBetter: false },
  sprint40m: { label: '40m Sprint', unit: 's', low: 4.90, high: 6.20, cohortAvg: 5.50, higherIsBetter: false },
  mod505:    { label: 'Mod 505',    unit: 's', low: 2.0,  high: 3.2,  cohortAvg: 2.5,  higherIsBetter: false, bilateral: true },
  // Aerobic — new keys
  sixMinRun: { label: '6 Minute Run',  unit: 'm',         low: 1000, high: 1600, cohortAvg: 1300, higherIsBetter: true },
  yoyoIR:    { label: 'Yo-Yo IR1/IR2', unit: 'm',         low: 400,  high: 2000, cohortAvg: 1000, higherIsBetter: true },
  // Cognitive
  reactionTime:    { label: 'Reaction Time',    unit: 'ms',    higherIsBetter: false },
  processingSpeed: { label: 'Processing Speed', unit: 'score', higherIsBetter: true  },
};

// Mobility normal ranges (degrees). Color coding:
// green: within range | amber: within 10% below low | red: below amber threshold
export const MOBILITY_NORMS = {
  cervicalRotation:    { label: 'Cervical Rotation',    low: 70,  high: 90,  unit: '°' },
  shoulderFlexion:     { label: 'Shoulder Flexion',     low: 160, high: 180, unit: '°' },
  shoulderExtension:   { label: 'Shoulder Extension',   low: 45,  high: 65,  unit: '°' },
  shoulderIR:          { label: 'Shoulder IR',           low: 55,  high: 90,  unit: '°' },
  shoulderER:          { label: 'Shoulder ER',           low: 75,  high: 95,  unit: '°' },
  hipFlexion:          { label: 'Hip Flexion',           low: 110, high: 135, unit: '°' },
  hipExtension:        { label: 'Hip Extension',         low: 10,  high: 25,  unit: '°' },
  hipIR:               { label: 'Hip IR',                low: 30,  high: 50,  unit: '°' },
  hipER:               { label: 'Hip ER',                low: 38,  high: 60,  unit: '°' },
  thoracicRotation:    { label: 'Thoracic Rotation',    low: 40,  high: 60,  unit: '°' },
  ankleDorsiflexion:   { label: 'Ankle Dorsiflexion',   low: 12,  high: 25,  unit: '°' },
  ankleKneeToWall:     { label: 'Ankle Knee to Wall',   low: 9,   high: 14,  unit: 'cm'},
  anklePlantarFlexion: { label: 'Ankle Plantar Flex',   low: 35,  high: 55,  unit: '°' },
  activeSLR:           { label: 'Active SLR',           low: 60,  high: 90,  unit: '°' },
  passiveSLR:          { label: 'Passive SLR',          low: 70,  high: 100, unit: '°' },
};

// Returns 'green' | 'amber' | 'red' for a given value and norm
export function getMobilityStatus(value, norm) {
  if (value === null || value === undefined) return 'grey';
  const { low } = norm;
  if (value >= low) return 'green';
  if (value >= low * 0.88) return 'amber';
  return 'red';
}

// Stat chip colours
export const CHIP_COLORS = {
  latest:       { bg: '#dcfce7', text: '#15803d', label: 'Latest'        },
  acuteLimit:   { bg: '#fef3c7', text: '#92400e', label: 'Acute Limit'   },
  seasonBest:   { bg: '#dbeafe', text: '#1e40af', label: 'Season Best'   },
  seasonAverage:{ bg: '#f3e8ff', text: '#6b21a8', label: 'Season Avg'    },
};

// ACSI-28 subscale labels
export const ACSI_SUBSCALES = [
  { key: 'copingAdversity',          label: 'Coping w/ Adversity'   },
  { key: 'peakingPressure',          label: 'Peaking Under Pressure' },
  { key: 'goalSetting',              label: 'Goal Setting'           },
  { key: 'concentration',            label: 'Concentration'          },
  { key: 'freedomFromWorry',         label: 'Freedom from Worry'     },
  { key: 'confidenceAchievement',    label: 'Confidence & Achievement'},
  { key: 'coachability',             label: 'Coachability'           },
];

// Physio metric dropdown options
export const PHYSIO_METRICS = [
  'Biering-Sorensen Trunk Endurance',
  'Single Leg Squat Assessment',
  'FMS Screen',
  'Postural Assessment',
  'Injury History Log',
];
