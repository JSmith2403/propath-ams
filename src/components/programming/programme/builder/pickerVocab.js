// Controlled vocabularies for the exercise picker. Display labels are
// human-friendly; values mirror the database column conventions
// (snake_case). Brief 5c documented the same set in the migration
// footer — keep these two lists in sync if either changes.

export const MOVEMENT_PATTERNS = [
  // Lower body
  ['squat',                      'Squat'],
  ['hinge',                      'Hinge'],
  ['lunge',                      'Lunge'],
  ['hip_extension',              'Hip extension'],
  ['step_up',                    'Step up'],
  ['ankle_extension',            'Ankle extension'],
  // Upper push/pull
  ['vertical_push',              'Vertical push'],
  ['vertical_pull',              'Vertical pull'],
  ['horizontal_push',            'Horizontal push'],
  ['horizontal_pull',            'Horizontal pull'],
  // Loaded carries / power / locomotion
  ['carry',                      'Carry'],
  ['rotational',                 'Rotational'],
  ['cyclical',                   'Cyclical'],
  ['jumps_plyos',                'Jumps & plyos'],
  ['spinal_extension',           'Spinal extension'],
  // Core
  ['core_anti_extension',        'Core: anti-extension'],
  ['core_anti_rotation',         'Core: anti-rotation'],
  ['core_anti_lateral_flexion',  'Core: anti-lateral flexion'],
  ['core_rotation',              'Core: rotation'],
  ['core_lateral_flexion',       'Core: lateral flexion'],
  ['core_flexion',               'Core: flexion'],
];

export const EQUIPMENT = [
  ['barbell',             'Barbell'],
  ['dumbbell',            'Dumbbell'],
  ['kettlebell',          'Kettlebell'],
  ['cable',               'Cable'],
  ['fixed_machine',       'Fixed machine'],
  ['bench',               'Bench'],
  ['pull_up_bar',         'Pull-up bar'],
  ['bodyweight',          'Bodyweight'],
  ['band',                'Band'],
  ['plyo_box',            'Plyo box'],
  ['suspension_trainer',  'Suspension trainer'],
  ['landmine',            'Landmine'],
  ['sandbag_dball',       'Sandbag / D-ball'],
  ['medball',             'Med ball'],
  ['trap_bar',            'Trap bar'],
  ['dip_bar',             'Dip bar'],
  ['rower_erg',           'Rower'],
  ['assault_bike',        'Assault bike'],
  ['bike_erg',            'Bike erg'],
  ['treadmill',           'Treadmill'],
  ['ski_erg',             'Ski erg'],
  ['jump_rope',           'Jump rope'],
  ['pvc',                 'PVC'],
];

export const COMPLEXITY = [
  [1, 'Complexity 1 (basic)'],
  [2, 'Complexity 2 (intermediate)'],
  [3, 'Complexity 3 (advanced)'],
];

export const BILATERAL = [
  ['bilateral',   'Bilateral'],
  ['unilateral',  'Unilateral'],
  ['alternating', 'Alternating'],
];

export const POSTERIOR_ANTERIOR = [
  ['posterior', 'Posterior'],
  ['anterior',  'Anterior'],
  ['mixed',     'Mixed'],
];

export const CATEGORIES = [
  ['warm_up',     'Warm-up'],
  ['strength',    'Strength'],
  ['power',       'Power'],
  ['ballistic',   'Ballistic'],
  ['jumps_plyos', 'Jumps & plyos'],
  ['capacity',    'Capacity'],
  ['speed',       'Speed'],
  ['mobility',    'Mobility'],
  ['accessory',   'Accessory'],
];
