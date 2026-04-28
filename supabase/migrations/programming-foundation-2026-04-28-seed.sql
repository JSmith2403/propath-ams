-- ============================================================================
-- Programming Foundation — Master exercise library seed
-- Date: 2026-04-28
-- Idempotent: ON CONFLICT (name) DO NOTHING.
-- ============================================================================

INSERT INTO exercise_library
  (name, category, movement_patterns, bilateral_unilateral, default_prescription_type, notes)
VALUES
  -- ─── Warm-up / mobility (15) ────────────────────────────────────────────
  ('Cat Camel',                          'warm_up',  ARRAY[]::text[],                                              'bilateral',   'reps_only', 'Slow controlled spinal flexion and extension.'),
  ('Thoracic Windmill',                  'mobility', ARRAY['rotational','core_rotation'],                          'alternating', 'reps_only', 'Side-lying, top knee pinned, rotate top arm through the floor.'),
  ('Plate Hops',                         'warm_up',  ARRAY[]::text[],                                              'bilateral',   'reps_only', 'Quick contact, stay tall, soft knees.'),
  ('Head Shoulder Knee Cone',            'warm_up',  ARRAY[]::text[],                                              'bilateral',   'reps_only', 'Reactive cone touch drill.'),
  ('Lateral Cones with Ball Catch',      'warm_up',  ARRAY[]::text[],                                              'alternating', 'reps_only', 'Coordination and reactive footwork primer.'),
  ('Lateral Push',                       'warm_up',  ARRAY[]::text[],                                              'alternating', 'reps_only', 'Drive off outside leg, low athletic stance.'),
  ('Line Hops',                          'warm_up',  ARRAY[]::text[],                                              'bilateral',   'time',      'Stiff ankles, fast contacts.'),
  ('Plank to Toe Tap',                   'mobility', ARRAY['core_anti_extension','core_anti_rotation'],            'alternating', 'reps_only', 'Maintain hip and trunk stability throughout.'),
  ('Worlds Greatest Stretch',            'mobility', ARRAY['lunge','rotational'],                                  'alternating', 'reps_only', 'Lunge, hand to floor, rotate up to ceiling.'),
  ('Hip 90 90',                          'mobility', ARRAY['rotational'],                                          'alternating', 'reps_only', 'Internal and external hip rotation drill.'),
  ('Glute Bridge',                       'warm_up',  ARRAY['hinge'],                                               'bilateral',   'reps_only', 'Squeeze glutes at top, ribs down.'),
  ('Bird Dog',                           'warm_up',  ARRAY['core_anti_extension'],                                 'alternating', 'reps_only', 'Maintain neutral spine, control the reach.'),
  ('Dead Bug',                           'warm_up',  ARRAY['core_anti_extension'],                                 'alternating', 'reps_only', 'Low back flat to floor throughout.'),
  ('Banded Walk',                        'warm_up',  ARRAY['lunge'],                                               'alternating', 'reps_only', 'Tension on band the whole set, knees over toes.'),
  ('A Skip',                             'warm_up',  ARRAY[]::text[],                                              'alternating', 'reps_only', 'Tall posture, drive knee, dorsiflexed ankle.'),

  -- ─── Squat patterns (8) ─────────────────────────────────────────────────
  ('Back Squat',                         'strength', ARRAY['squat'],                                               'bilateral',   'kg',           'Brace, sit between hips, drive through midfoot.'),
  ('Front Squat',                        'strength', ARRAY['squat'],                                               'bilateral',   'kg',           'Elbows up, upright torso.'),
  ('Goblet Squat',                       'strength', ARRAY['squat'],                                               'bilateral',   'kg',           'Elbows inside knees at the bottom.'),
  ('Split Squat',                        'strength', ARRAY['squat','lunge'],                                       'unilateral',  'kg',           'Vertical shin on front leg, knee tracks over toe.'),
  ('Bulgarian Split Squat',              'strength', ARRAY['squat','lunge'],                                       'unilateral',  'kg',           'Rear foot elevated, hips square.'),
  ('Box Squat',                          'strength', ARRAY['squat'],                                               'bilateral',   'kg',           'Sit back to the box, pause, drive up.'),
  ('Overhead Squat',                     'strength', ARRAY['squat','vertical_push'],                               'bilateral',   'kg',           'Active shoulders, bar stacked over midfoot.'),
  ('Single Leg Squat',                   'strength', ARRAY['squat'],                                               'unilateral',  'rir',          'Counterbalance with arms, control the descent.'),

  -- ─── Hinge patterns (8) ─────────────────────────────────────────────────
  ('Romanian Deadlift',                  'strength', ARRAY['hinge'],                                               'bilateral',   'kg',           'Hinge at hips, soft knees, bar close to body.'),
  ('Trap Bar Deadlift',                  'strength', ARRAY['hinge','squat'],                                       'bilateral',   'kg',           'Chest proud, drive the floor away.'),
  ('Conventional Deadlift',              'strength', ARRAY['hinge'],                                               'bilateral',   'kg',           'Bar over midfoot, lats engaged, push the floor.'),
  ('Single Leg RDL',                     'strength', ARRAY['hinge'],                                               'unilateral',  'kg',           'Hips square, slow eccentric.'),
  ('Hip Thrust',                         'strength', ARRAY['hinge'],                                               'bilateral',   'kg',           'Pelvis tucked at top, ribs down.'),
  ('Loaded Glute Bridge',                'strength', ARRAY['hinge'],                                               'bilateral',   'kg',           'Pause and squeeze at the top.'),
  ('Good Morning',                       'strength', ARRAY['hinge'],                                               'bilateral',   'kg',           'Soft knees, hinge until tension in hamstrings.'),
  ('Kettlebell Swing',                   'power',    ARRAY['hinge'],                                               'bilateral',   'kg',           'Hike pass, snap hips, bell floats to chest height.'),

  -- ─── Vertical / horizontal push (8) ─────────────────────────────────────
  ('Bench Press',                        'strength', ARRAY['horizontal_push'],                                     'bilateral',   'kg',           'Shoulder blades retracted, feet planted.'),
  ('Incline Bench Press',                'strength', ARRAY['horizontal_push','vertical_push'],                     'bilateral',   'kg',           'Roughly 30 degree bench angle.'),
  ('DB Bench Press',                     'strength', ARRAY['horizontal_push'],                                     'bilateral',   'kg',           'Wrists stacked, control the bottom.'),
  ('Overhead Press',                     'strength', ARRAY['vertical_push'],                                       'bilateral',   'kg',           'Glutes squeezed, ribs down, bar over crown.'),
  ('Half Kneeling Shoulder Press',       'accessory',ARRAY['vertical_push'],                                       'unilateral',  'kg',           'Same-side knee down, opposite-side press.'),
  ('Push Up',                            'strength', ARRAY['horizontal_push'],                                     'bilateral',   'reps_only',    'Plank position, full range, elbows ~45 degrees.'),
  ('Incline Push Up',                    'strength', ARRAY['horizontal_push'],                                     'bilateral',   'reps_only',    'Hands elevated to a bench or bar.'),
  ('Landmine Press',                     'strength', ARRAY['vertical_push','horizontal_push'],                     'unilateral',  'kg',           'Stagger stance, press up and slightly forward.'),

  -- ─── Vertical / horizontal pull (8) ─────────────────────────────────────
  ('Pull Up',                            'strength', ARRAY['vertical_pull'],                                       'bilateral',   'rir',          'Chin clears the bar, full extension at bottom.'),
  ('Banded Chin Up',                     'accessory',ARRAY['vertical_pull'],                                       'bilateral',   'reps_only',    'Band assistance, control the descent.'),
  ('Chin Up',                            'strength', ARRAY['vertical_pull'],                                       'bilateral',   'rir',          'Supinated grip, elbows drive down.'),
  ('Lat Pulldown',                       'strength', ARRAY['vertical_pull'],                                       'bilateral',   'kg',           'Pull bar to upper chest, elbows drive to hips.'),
  ('Bent Over Row',                      'strength', ARRAY['horizontal_pull'],                                     'bilateral',   'kg',           'Hinge to ~45 degrees, bar to lower chest.'),
  ('Supine Row',                         'accessory',ARRAY['horizontal_pull'],                                     'bilateral',   'reps_only',    'Body in a straight line, chest to bar.'),
  ('One Arm DB Row',                     'strength', ARRAY['horizontal_pull'],                                     'unilateral',  'kg',           'Drive elbow to hip, square hips.'),
  ('Seal Row',                           'strength', ARRAY['horizontal_pull'],                                     'bilateral',   'kg',           'Chest supported, strict pull, no body english.'),

  -- ─── Lunge / single leg (6) ─────────────────────────────────────────────
  ('Forward Lunge',                      'strength', ARRAY['lunge','squat'],                                       'alternating', 'kg',           'Step out, knee tracks over toe, drive back.'),
  ('Reverse Lunge',                      'strength', ARRAY['lunge','squat'],                                       'alternating', 'kg',           'Step back, vertical front shin, drive up.'),
  ('Lateral Lunge Goblet',               'strength', ARRAY['lunge','squat'],                                       'alternating', 'kg',           'Sit hips back into the working leg.'),
  ('Single Leg Step Up',                 'strength', ARRAY['lunge','squat'],                                       'unilateral',  'kg',           'Drive through the heel of the working leg.'),
  ('Walking Lunge',                      'strength', ARRAY['lunge','squat'],                                       'alternating', 'kg',           'Continuous forward steps, control the descent.'),
  ('Curtsy Lunge',                       'strength', ARRAY['lunge'],                                               'alternating', 'kg',           'Step diagonally behind, glute medius emphasis.'),

  -- ─── Core / accessory (8 — all moved to accessory) ──────────────────────
  ('Side Plank',                         'accessory',ARRAY['core_anti_lateral_flexion'],                           'unilateral',  'time',         'Hips stacked, body in a straight line.'),
  ('Plank with Shoulder Tap',            'accessory',ARRAY['core_anti_rotation','horizontal_push'],                'alternating', 'reps_only',    'Resist hip rotation, slow controlled taps.'),
  ('Pallof Press',                       'accessory',ARRAY['core_anti_rotation'],                                  'unilateral',  'kg',           'Resist rotation, press straight out from chest.'),
  ('Bear Crawl Plank Weight Pass',       'accessory',ARRAY['core_anti_rotation','carry'],                          'alternating', 'reps_only',    'Pass plate or kettlebell under torso, hips quiet.'),
  ('Side Plank with Banded Row',         'accessory',ARRAY['core_anti_lateral_flexion','horizontal_pull'],         'unilateral',  'reps_only',    'Maintain side plank while rowing band to ribs.'),
  ('Loaded Dead Bug',                    'accessory',ARRAY['core_anti_extension'],                                 'alternating', 'reps_only',    'Hold plate or DB overhead, low back pinned.'),
  ('Hollow Hold',                        'accessory',ARRAY['core_anti_extension'],                                 'bilateral',   'time',         'Low back pressed to floor, ribs down.'),
  ('L Sit',                              'accessory',ARRAY['core_anti_extension'],                                 'bilateral',   'time',         'Legs straight and parallel to floor.'),

  -- ─── Ballistic / Olympic (6) ────────────────────────────────────────────
  ('Hang Clean',                         'ballistic',ARRAY['hinge','vertical_pull'],                               'bilateral',   'velocity_zone','Aggressive triple extension, fast turnover.'),
  ('Power Clean',                        'ballistic',ARRAY['hinge','vertical_pull'],                               'bilateral',   'velocity_zone','Bar path close to body, drop under at the top.'),
  ('Hang Snatch',                        'ballistic',ARRAY['hinge','vertical_pull'],                               'bilateral',   'velocity_zone','Wide grip, full extension, punch up to overhead.'),
  ('Push Press',                         'power',    ARRAY['vertical_push'],                                       'bilateral',   'velocity_zone','Quarter dip, drive, lock out overhead.'),
  ('Med Ball Rotational Throw',          'power',    ARRAY['core_rotation'],                                       'alternating', 'reps_only',    'Hips lead, transfer through the ball.'),
  ('Med Ball Slam',                      'power',    ARRAY['core_flexion'],                                        'bilateral',   'reps_only',    'Reach tall, slam ball aggressively into floor.'),

  -- ─── Jumps & plyos (6) ──────────────────────────────────────────────────
  ('Box Jump',                           'jumps_plyos', ARRAY['squat','hinge'],                                    'bilateral',   'reps_only',    'Soft landing, step down between reps.'),
  ('Broad Jump',                         'jumps_plyos', ARRAY['hinge','squat'],                                    'bilateral',   'reps_only',    'Maximal horizontal effort, stick the landing.'),
  ('Depth Jump',                         'jumps_plyos', ARRAY['squat','hinge'],                                    'bilateral',   'reps_only',    'Step off, minimal ground contact, jump for height.'),
  ('Pogo Hops',                          'jumps_plyos', ARRAY[]::text[],                                           'bilateral',   'reps_only',    'Stiff ankles, ground contact under 0.2 seconds.'),
  ('Single Leg Bound',                   'jumps_plyos', ARRAY['hinge'],                                            'unilateral',  'reps_only',    'Drive off one leg, land on the other, control the catch.'),
  ('Tuck Jump',                          'jumps_plyos', ARRAY['squat','hinge'],                                    'bilateral',   'reps_only',    'Knees to chest, soft landing, repeat.'),

  -- ─── Speed / capacity (5 + 2 carries = 7) ──────────────────────────────
  ('20m Sprint',                         'speed',    ARRAY[]::text[],                                              'bilateral',   'time',         'Maximal effort, full recovery between reps.'),
  ('Sled Push',                          'capacity', ARRAY['squat','horizontal_push'],                             'bilateral',   'kg',           'Low body angle, drive arms and legs together.'),
  ('Sled Pull',                          'capacity', ARRAY['hinge','horizontal_pull'],                             'bilateral',   'kg',           'Backwards march, low hips, drive heels down.'),
  ('Bike Sprint',                        'capacity', ARRAY[]::text[],                                              'bilateral',   'time',         'Maximal effort intervals, full recovery.'),
  ('Repeat Sprints',                     'capacity', ARRAY[]::text[],                                              'bilateral',   'time',         'Fixed work-rest, target consistent split times.'),
  ('Farmers Carry',                      'capacity', ARRAY['carry','core_anti_extension'],                         'bilateral',   'kg',           'Tall posture, brace trunk, smooth gait.'),
  ('Suitcase Carry',                     'capacity', ARRAY['carry','core_anti_lateral_flexion'],                   'unilateral',  'kg',           'Resist lateral lean, hips and shoulders square.'),

  -- ─── Posterior chain accessory (4 + Calf Raise + Copenhagen Plank) ─────
  ('SL Glute Bridge',                    'accessory',ARRAY['hinge'],                                               'unilateral',  'reps_only',    'Drive through heel, level pelvis at top.'),
  ('Hamstring Curl',                     'accessory',ARRAY['hinge'],                                               'bilateral',   'kg',           'Slow eccentric, full range.'),
  ('Nordic Curl',                        'accessory',ARRAY['hinge'],                                               'bilateral',   'reps_only',    'Maximally control the descent, drive back up.'),
  ('Reverse Hyper',                      'accessory',ARRAY['hinge'],                                               'bilateral',   'kg',           'Squeeze glutes at top, control the descent.'),
  ('Calf Raise',                         'accessory',ARRAY[]::text[],                                              'bilateral',   'reps_only',    'Full range, pause at the top, control the descent.'),
  ('Copenhagen Plank',                   'accessory',ARRAY['core_anti_lateral_flexion'],                           'unilateral',  'time',         'Top leg supported, bottom leg lifted, hips stacked.'),

  -- ─── Crossover / cable (4) ──────────────────────────────────────────────
  ('Split Stance Low to High Cable Crossover', 'accessory', ARRAY['rotational','core_rotation'],                   'alternating', 'kg',           'Drive from the back hip, finish across the body.'),
  ('Cable Row',                          'strength', ARRAY['horizontal_pull'],                                     'bilateral',   'kg',           'Tall posture, elbows drive to hips.'),
  ('Cable Press',                        'strength', ARRAY['horizontal_push'],                                     'bilateral',   'kg',           'Stagger stance, press through with control.'),
  ('Face Pull',                          'accessory',ARRAY['horizontal_pull'],                                     'bilateral',   'kg',           'Pull rope to forehead, external rotation at the end.')

ON CONFLICT (name) DO NOTHING;

-- End of seed.
