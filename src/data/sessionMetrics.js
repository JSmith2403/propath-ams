// ── Manually recorded metric categories ────────────────────────────────────

export const METRIC_CATEGORIES = [
  {
    key: 'biometrics',
    label: 'Biometrics',
    metrics: [
      { key: 'height',              label: 'Athlete Height',        unit: 'cm', bilateral: false, attempts: 1 },
      { key: 'weight',              label: 'Athlete Weight',        unit: 'kg', bilateral: false, attempts: 1 },
      { key: 'bodyFat',             label: 'Body Fat Percentage',   unit: '%',  bilateral: false, attempts: 1 },
      { key: 'leanMass',            label: 'Lean Mass',             unit: 'kg', bilateral: false, attempts: 1 },
      { key: 'segmentalMuscleMass', label: 'Segmental Muscle Mass', unit: 'kg', bilateral: false, attempts: 1 },
    ],
  },
  {
    key: 'pahMaturation',
    label: 'PAH and Maturation',
    metrics: [
      { key: 'motherHeight',     label: "Mother's Height",        unit: 'cm', bilateral: false, attempts: 1 },
      { key: 'fatherHeight',     label: "Father's Height",        unit: 'cm', bilateral: false, attempts: 1 },
      { key: 'pah',              label: 'Predicted Adult Height', unit: 'cm', bilateral: false, attempts: 1 },
      { key: 'pahPercent',       label: 'Percentage of PAH',      unit: '%',  bilateral: false, attempts: 1 },
      { key: 'remainingGrowth',  label: 'Remaining Growth',       unit: 'cm', bilateral: false, attempts: 1 },
      { key: 'maturityCategory', label: 'Maturity Category',      unit: '',   bilateral: false, attempts: 1, text: true },
    ],
  },
  {
    key: 'movementScreens',
    label: 'Movement Screens',
    metrics: [
      { key: 'cervicalRotation',  label: 'Cervical Rotation',           unit: '°',  bilateral: true, attempts: 1 },
      { key: 'shoulderFlexion',   label: 'Shoulder Flexion',            unit: '°',  bilateral: true, attempts: 1 },
      { key: 'shoulderExtension', label: 'Shoulder Extension',          unit: '°',  bilateral: true, attempts: 1 },
      { key: 'shoulderIR',        label: 'Shoulder Internal Rotation',  unit: '°',  bilateral: true, attempts: 1 },
      { key: 'shoulderER',        label: 'Shoulder External Rotation',  unit: '°',  bilateral: true, attempts: 1 },
      { key: 'thoracicRotation',  label: 'Thoracic Rotation',           unit: '°',  bilateral: true, attempts: 1 },
      { key: 'hipFlexion',        label: 'Hip Flexion',                 unit: '°',  bilateral: true, attempts: 1 },
      { key: 'hipExtension',      label: 'Hip Extension',               unit: '°',  bilateral: true, attempts: 1 },
      { key: 'hipIR',             label: 'Hip Internal Rotation',       unit: '°',  bilateral: true, attempts: 1 },
      { key: 'hipER',             label: 'Hip External Rotation',       unit: '°',  bilateral: true, attempts: 1 },
      { key: 'activeSLR',         label: 'Active Straight Leg Raise',   unit: '°',  bilateral: true, attempts: 1 },
      { key: 'passiveSLR',        label: 'Passive Straight Leg Raise',  unit: '°',  bilateral: true, attempts: 1 },
      { key: 'ankleDorsiflexion', label: 'Ankle Dorsiflexion',          unit: '°',  bilateral: true, attempts: 1 },
      { key: 'ankleKneeToWall',   label: 'Ankle Knee to Wall',          unit: 'cm', bilateral: true, attempts: 1 },
      { key: 'singleLegSquat',    label: 'Single Leg Squat',            unit: '/5', bilateral: true, attempts: 1 },
    ],
  },
  {
    key: 'power',
    label: 'Power',
    metrics: [
      { key: 'cmjBilateral',       label: 'CMJ (Bilateral)',       unit: 'cm', bilateral: false, attempts: 3 },
      { key: 'cmjHeight',          label: 'CMJ (Unilateral)',      unit: 'cm', bilateral: true,  attempts: 3 },
      { key: 'cmjPeakForce',       label: 'CMJ Peak Force',        unit: 'N',  bilateral: true,  attempts: 3 },
      { key: 'cmjPeakPower',       label: 'CMJ Peak Power',        unit: 'W',  bilateral: true,  attempts: 3 },
      { key: 'cmjTimeToTakeoff',   label: 'CMJ Time to Takeoff',   unit: 'ms', bilateral: false, attempts: 3 },
      { key: 'cmjFlightTime',      label: 'CMJ Flight Time',       unit: 'ms', bilateral: false, attempts: 3 },
      { key: 'cmjLandingForce',    label: 'CMJ Landing Force',     unit: 'N',  bilateral: true,  attempts: 3 },
      { key: 'squatJumpHeight',    label: 'Squat Jump Height',     unit: 'cm', bilateral: false, attempts: 3 },
      { key: 'squatJumpPeakForce', label: 'Squat Jump Peak Force', unit: 'N',  bilateral: false, attempts: 3 },
      { key: 'squatJumpPeakPower', label: 'Squat Jump Peak Power', unit: 'W',  bilateral: false, attempts: 3 },
    ],
  },
  {
    key: 'reactivity',
    label: 'Reactivity',
    metrics: [
      { key: 'rsi105',                label: '10-5 RSI',                          unit: 'score', bilateral: false, attempts: 1 },
      { key: 'rsi105ContactTime',     label: '10-5 Contact Time',                 unit: 'ms',    bilateral: false, attempts: 1 },
      { key: 'rsi105FlightTime',      label: '10-5 Flight Time',                  unit: 'ms',    bilateral: false, attempts: 1 },
      { key: 'dropJumpRSI',           label: 'Drop Jump RSI',                     unit: 'score', bilateral: false, attempts: 3 },
      { key: 'dropJumpContactTime',   label: 'Drop Jump Contact Time',            unit: 'ms',    bilateral: false, attempts: 3 },
      { key: 'dropJumpHeight',        label: 'Drop Jump Height',                  unit: 'cm',    bilateral: false, attempts: 3 },
      { key: 'slDropJumpRSI',         label: 'Single Leg Drop Jump RSI',          unit: 'score', bilateral: true,  attempts: 3 },
      { key: 'slDropJumpContactTime', label: 'Single Leg Drop Jump Contact Time', unit: 'ms',    bilateral: true,  attempts: 3 },
    ],
  },
  {
    key: 'strength',
    label: 'Strength',
    metrics: [
      { key: 'imtpPeakForce',       label: 'IMTP Peak Force',          unit: 'N',    bilateral: false, attempts: 1 },
      { key: 'imtpPeakForceLR',     label: 'IMTP Peak Force L/R',      unit: 'N',    bilateral: true,  attempts: 1 },
      { key: 'chinUpMaxReps',       label: 'Chin-up Max Reps',         unit: 'reps', bilateral: false, attempts: 1 },
      { key: 'benchPress3RM',       label: '3RM Bench Press',          unit: 'kg',   bilateral: false, attempts: 1 },
      { key: 'hamstring0',          label: 'Hamstring 0°',             unit: 'N/kg', bilateral: true,  attempts: 1 },
      { key: 'hamstring30',         label: 'Hamstring 30°',            unit: 'N/kg', bilateral: true,  attempts: 1 },
      { key: 'hamstring90',         label: 'Hamstring 90°',            unit: 'N/kg', bilateral: true,  attempts: 1 },
      { key: 'hipFlexionSupine90',  label: 'Hip Flexion Supine 90°',   unit: 'N/kg', bilateral: true,  attempts: 1 },
      { key: 'hipExtensionProne90', label: 'Hip Extension Prone 90°',  unit: 'N/kg', bilateral: true,  attempts: 1 },
      { key: 'adduction0',          label: 'Adduction 0°',             unit: 'N/kg', bilateral: true,  attempts: 1 },
      { key: 'adduction90',         label: 'Adduction 90°',            unit: 'N/kg', bilateral: true,  attempts: 1 },
      { key: 'gripStrength',        label: 'Grip Strength',            unit: 'kg',   bilateral: true,  attempts: 1 },
    ],
  },
  {
    key: 'capacity',
    label: 'Capacity',
    metrics: [
      { key: 'slBridgeCapacity', label: 'Single Leg Bridge Capacity', unit: 'reps', bilateral: true,  attempts: 1 },
      { key: 'pushUpMax',        label: 'Push-up Max',                unit: 'reps', bilateral: false, attempts: 1 },
      { key: 'calfRaiseMax',     label: 'Calf Raise Max',             unit: 'reps', bilateral: true,  attempts: 1 },
      { key: 'sidePlank',        label: 'Side Plank',                 unit: 's',    bilateral: true,  attempts: 1 },
      { key: 'sorensenTest',     label: 'Sorensen Test',              unit: 's',    bilateral: false, attempts: 1 },
    ],
  },
  {
    key: 'speedAgility',
    label: 'Speed and Agility',
    metrics: [
      { key: 'sprint10m', label: '10m Sprint', unit: 's', bilateral: false, attempts: 3, higherIsBetter: false },
      { key: 'sprint20m', label: '20m Sprint', unit: 's', bilateral: false, attempts: 3, higherIsBetter: false },
      { key: 'sprint40m', label: '40m Sprint', unit: 's', bilateral: false, attempts: 3, higherIsBetter: false },
      { key: 'mod505',    label: 'Mod 505',    unit: 's', bilateral: true,  attempts: 3, higherIsBetter: false },
    ],
  },
  {
    key: 'aerobic',
    label: 'Aerobic Capacity',
    metrics: [
      { key: 'sixMinRun', label: '6 Minute Run',  unit: 'm',         bilateral: false, attempts: 1 },
      { key: 'run1600m',  label: '1600m Run',     unit: 'min:s',     bilateral: false, attempts: 1, text: true },
      { key: 'yoyoIR',    label: 'Yo-Yo IR1/IR2', unit: 'm',         bilateral: false, attempts: 1 },
      { key: 'bleepTest', label: 'Bleep Test',    unit: 'ml/kg/min', bilateral: false, attempts: 1 },
    ],
  },
  {
    key: 'cognitive',
    label: 'Cognitive',
    metrics: [
      { key: 'reactionTime',    label: 'Reaction Time',    unit: 'ms',    bilateral: false, attempts: 3, higherIsBetter: false },
      { key: 'processingSpeed', label: 'Processing Speed', unit: 'score', bilateral: false, attempts: 1 },
    ],
  },
];

export const ALL_METRICS = METRIC_CATEGORIES.flatMap(c => c.metrics);
export const METRIC_MAP  = Object.fromEntries(ALL_METRICS.map(m => [m.key, m]));

// Sub-column structure for a metric
export function getSubCols(metric) {
  const sides = metric.bilateral ? ['L', 'R'] : [null];
  const cols  = [];
  sides.forEach(side => {
    if (metric.attempts > 1) {
      for (let a = 1; a <= metric.attempts; a++) {
        cols.push({
          subKey: side ? `att${a}${side}` : `att${a}`,
          label:  side ? `${side}${a}` : `Att ${a}`,
          side, attempt: a,
        });
      }
      cols.push({
        subKey:   side ? `best${side}` : 'best',
        label:    side ? `${side} Best` : 'Best',
        side, isBest: true, readOnly: true,
      });
    } else {
      cols.push({ subKey: side || 'value', label: side || '', side });
    }
  });
  return cols;
}

// Auto-compute best from attempt inputs
export function computeBest(cell, metric) {
  if (!cell || metric.attempts <= 1) return cell;
  const lowerIsBetter = metric.higherIsBetter === false;
  const pick = (...vals) => {
    const nums = vals.map(Number).filter(v => !isNaN(v) && v !== '' && v != null);
    if (!nums.length) return undefined;
    return lowerIsBetter ? Math.min(...nums) : Math.max(...nums);
  };
  if (metric.bilateral) {
    return {
      ...cell,
      bestL: pick(cell.att1L, cell.att2L, cell.att3L),
      bestR: pick(cell.att1R, cell.att2R, cell.att3R),
    };
  }
  return { ...cell, best: pick(cell.att1, cell.att2, cell.att3) };
}

// phase2 sync targets — biometrics/pahMaturation → maturation,
// movement screens → mobility, everything else → performance bucket.
export const SYNC_MAP = {
  // Biometrics → maturation entry fields
  height: { type: 'maturation', field: 'standingHeight' },
  weight: { type: 'maturation', field: 'bodyMass'       },
  // PAH and Maturation → maturation entry fields
  motherHeight:    { type: 'maturation', field: 'motherHeight'    },
  fatherHeight:    { type: 'maturation', field: 'fatherHeight'    },
  pah:             { type: 'maturation', field: 'pah'             },
  pahPercent:      { type: 'maturation', field: 'pahPercent'      },
  remainingGrowth: { type: 'maturation', field: 'remainingGrowth' },
  maturityCategory:{ type: 'maturation', field: 'maturityCategory'},
  // Movement Screens → mobility bucket
  cervicalRotation:  { type: 'mobility', key: 'cervicalRotation'  },
  shoulderFlexion:   { type: 'mobility', key: 'shoulderFlexion'   },
  shoulderExtension: { type: 'mobility', key: 'shoulderExtension' },
  shoulderIR:        { type: 'mobility', key: 'shoulderIR'        },
  shoulderER:        { type: 'mobility', key: 'shoulderER'        },
  thoracicRotation:  { type: 'mobility', key: 'thoracicRotation'  },
  hipFlexion:        { type: 'mobility', key: 'hipFlexion'        },
  hipExtension:      { type: 'mobility', key: 'hipExtension'      },
  hipIR:             { type: 'mobility', key: 'hipIR'             },
  hipER:             { type: 'mobility', key: 'hipER'             },
  activeSLR:         { type: 'mobility', key: 'activeSLR'         },
  passiveSLR:        { type: 'mobility', key: 'passiveSLR'        },
  ankleDorsiflexion: { type: 'mobility', key: 'ankleDorsiflexion' },
  ankleKneeToWall:   { type: 'mobility', key: 'ankleKneeToWall'   },
  singleLegSquat:    { type: 'mobility', key: 'singleLegSquat'    },
  // Power / reactivity / strength / capacity / speed / aerobic / cognitive
  // have no SYNC_MAP entry → stored in performance bucket by their key.
};
