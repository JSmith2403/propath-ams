-- Brief 5c exercise library import — chunk 4/5
-- Source: exercise-library-import-2026-04-30.sql
-- Inserts 553-736 of 918.
-- Idempotent: every row uses ON CONFLICT (name) DO UPDATE.

BEGIN;

INSERT INTO exercise_library (name, category, movement_patterns, bilateral_unilateral, posterior_anterior, complexity, equipment, primary_muscle, supporting_muscles, muscle_bias, joint_count_level, dynamic_isometric, movement_plane, primary_joints, is_active)
  VALUES ('Lateral Raise (Dual DB; Seated)', 'strength', '{"vertical_push"}'::text[], 'bilateral', 'anterior', 1, '{"dumbbell"}'::text[], 'Lateral deltoid', '{"Supraspinatus"}'::text[], 'mid', 'local', NULL, 'vertical', '{"Shoulder"}'::text[], true)
  ON CONFLICT (name) DO UPDATE SET
    category = EXCLUDED.category,
    movement_patterns = EXCLUDED.movement_patterns,
    bilateral_unilateral = EXCLUDED.bilateral_unilateral,
    posterior_anterior = EXCLUDED.posterior_anterior,
    complexity = EXCLUDED.complexity,
    equipment = EXCLUDED.equipment,
    primary_muscle = EXCLUDED.primary_muscle,
    supporting_muscles = EXCLUDED.supporting_muscles,
    muscle_bias = EXCLUDED.muscle_bias,
    joint_count_level = EXCLUDED.joint_count_level,
    dynamic_isometric = EXCLUDED.dynamic_isometric,
    movement_plane = EXCLUDED.movement_plane,
    primary_joints = EXCLUDED.primary_joints,
    is_active = true,
    updated_at = now();

INSERT INTO exercise_library (name, category, movement_patterns, bilateral_unilateral, posterior_anterior, complexity, equipment, primary_muscle, supporting_muscles, muscle_bias, joint_count_level, dynamic_isometric, movement_plane, primary_joints, is_active)
  VALUES ('Side-Lying Lateral Raise (Single-Arm DB)', 'strength', '{"vertical_push"}'::text[], 'unilateral', 'anterior', 1, '{"dumbbell"}'::text[], 'Lateral deltoid', '{"Supraspinatus"}'::text[], 'lengthened', 'local', NULL, 'vertical', '{"Shoulder"}'::text[], true)
  ON CONFLICT (name) DO UPDATE SET
    category = EXCLUDED.category,
    movement_patterns = EXCLUDED.movement_patterns,
    bilateral_unilateral = EXCLUDED.bilateral_unilateral,
    posterior_anterior = EXCLUDED.posterior_anterior,
    complexity = EXCLUDED.complexity,
    equipment = EXCLUDED.equipment,
    primary_muscle = EXCLUDED.primary_muscle,
    supporting_muscles = EXCLUDED.supporting_muscles,
    muscle_bias = EXCLUDED.muscle_bias,
    joint_count_level = EXCLUDED.joint_count_level,
    dynamic_isometric = EXCLUDED.dynamic_isometric,
    movement_plane = EXCLUDED.movement_plane,
    primary_joints = EXCLUDED.primary_joints,
    is_active = true,
    updated_at = now();

INSERT INTO exercise_library (name, category, movement_patterns, bilateral_unilateral, posterior_anterior, complexity, equipment, primary_muscle, supporting_muscles, muscle_bias, joint_count_level, dynamic_isometric, movement_plane, primary_joints, is_active)
  VALUES ('Incline Bench Lateral Raise (Single-Arm DB)', 'strength', '{"vertical_push"}'::text[], 'unilateral', 'anterior', 2, '{"bench","dumbbell"}'::text[], 'Lateral deltoid', '{"Supraspinatus"}'::text[], 'lengthened', 'local', NULL, 'vertical', '{"Shoulder"}'::text[], true)
  ON CONFLICT (name) DO UPDATE SET
    category = EXCLUDED.category,
    movement_patterns = EXCLUDED.movement_patterns,
    bilateral_unilateral = EXCLUDED.bilateral_unilateral,
    posterior_anterior = EXCLUDED.posterior_anterior,
    complexity = EXCLUDED.complexity,
    equipment = EXCLUDED.equipment,
    primary_muscle = EXCLUDED.primary_muscle,
    supporting_muscles = EXCLUDED.supporting_muscles,
    muscle_bias = EXCLUDED.muscle_bias,
    joint_count_level = EXCLUDED.joint_count_level,
    dynamic_isometric = EXCLUDED.dynamic_isometric,
    movement_plane = EXCLUDED.movement_plane,
    primary_joints = EXCLUDED.primary_joints,
    is_active = true,
    updated_at = now();

INSERT INTO exercise_library (name, category, movement_patterns, bilateral_unilateral, posterior_anterior, complexity, equipment, primary_muscle, supporting_muscles, muscle_bias, joint_count_level, dynamic_isometric, movement_plane, primary_joints, is_active)
  VALUES ('Cable Lateral Raise (Single-Arm)', 'strength', '{"vertical_push"}'::text[], 'unilateral', 'anterior', 1, '{"cable"}'::text[], 'Lateral deltoid', '{"Supraspinatus"}'::text[], 'lengthened', 'local', NULL, 'vertical', '{"Shoulder"}'::text[], true)
  ON CONFLICT (name) DO UPDATE SET
    category = EXCLUDED.category,
    movement_patterns = EXCLUDED.movement_patterns,
    bilateral_unilateral = EXCLUDED.bilateral_unilateral,
    posterior_anterior = EXCLUDED.posterior_anterior,
    complexity = EXCLUDED.complexity,
    equipment = EXCLUDED.equipment,
    primary_muscle = EXCLUDED.primary_muscle,
    supporting_muscles = EXCLUDED.supporting_muscles,
    muscle_bias = EXCLUDED.muscle_bias,
    joint_count_level = EXCLUDED.joint_count_level,
    dynamic_isometric = EXCLUDED.dynamic_isometric,
    movement_plane = EXCLUDED.movement_plane,
    primary_joints = EXCLUDED.primary_joints,
    is_active = true,
    updated_at = now();

INSERT INTO exercise_library (name, category, movement_patterns, bilateral_unilateral, posterior_anterior, complexity, equipment, primary_muscle, supporting_muscles, muscle_bias, joint_count_level, dynamic_isometric, movement_plane, primary_joints, is_active)
  VALUES ('Cable Lateral Raise (Dual Cable; Facing In)', 'strength', '{"vertical_push"}'::text[], 'bilateral', 'anterior', 2, '{"cable"}'::text[], 'Lateral deltoid', '{"Supraspinatus"}'::text[], 'mid', 'local', NULL, 'vertical', '{"Shoulder"}'::text[], true)
  ON CONFLICT (name) DO UPDATE SET
    category = EXCLUDED.category,
    movement_patterns = EXCLUDED.movement_patterns,
    bilateral_unilateral = EXCLUDED.bilateral_unilateral,
    posterior_anterior = EXCLUDED.posterior_anterior,
    complexity = EXCLUDED.complexity,
    equipment = EXCLUDED.equipment,
    primary_muscle = EXCLUDED.primary_muscle,
    supporting_muscles = EXCLUDED.supporting_muscles,
    muscle_bias = EXCLUDED.muscle_bias,
    joint_count_level = EXCLUDED.joint_count_level,
    dynamic_isometric = EXCLUDED.dynamic_isometric,
    movement_plane = EXCLUDED.movement_plane,
    primary_joints = EXCLUDED.primary_joints,
    is_active = true,
    updated_at = now();

INSERT INTO exercise_library (name, category, movement_patterns, bilateral_unilateral, posterior_anterior, complexity, equipment, primary_muscle, supporting_muscles, muscle_bias, joint_count_level, dynamic_isometric, movement_plane, primary_joints, is_active)
  VALUES ('Cable Lateral Raise (Dual Cable; Facing Out)', 'strength', '{"vertical_push"}'::text[], 'bilateral', 'anterior', 2, '{"cable"}'::text[], 'Lateral deltoid', '{"Supraspinatus"}'::text[], 'mid', 'local', NULL, 'vertical', '{"Shoulder"}'::text[], true)
  ON CONFLICT (name) DO UPDATE SET
    category = EXCLUDED.category,
    movement_patterns = EXCLUDED.movement_patterns,
    bilateral_unilateral = EXCLUDED.bilateral_unilateral,
    posterior_anterior = EXCLUDED.posterior_anterior,
    complexity = EXCLUDED.complexity,
    equipment = EXCLUDED.equipment,
    primary_muscle = EXCLUDED.primary_muscle,
    supporting_muscles = EXCLUDED.supporting_muscles,
    muscle_bias = EXCLUDED.muscle_bias,
    joint_count_level = EXCLUDED.joint_count_level,
    dynamic_isometric = EXCLUDED.dynamic_isometric,
    movement_plane = EXCLUDED.movement_plane,
    primary_joints = EXCLUDED.primary_joints,
    is_active = true,
    updated_at = now();

INSERT INTO exercise_library (name, category, movement_patterns, bilateral_unilateral, posterior_anterior, complexity, equipment, primary_muscle, supporting_muscles, muscle_bias, joint_count_level, dynamic_isometric, movement_plane, primary_joints, is_active)
  VALUES ('DB Front Raise', 'strength', '{"vertical_push"}'::text[], 'bilateral', 'anterior', 1, '{"dumbbell"}'::text[], 'Anterior deltoid', '{"Upper chest","Serratus anterior"}'::text[], 'mid', 'local', NULL, 'vertical', '{"Shoulder"}'::text[], true)
  ON CONFLICT (name) DO UPDATE SET
    category = EXCLUDED.category,
    movement_patterns = EXCLUDED.movement_patterns,
    bilateral_unilateral = EXCLUDED.bilateral_unilateral,
    posterior_anterior = EXCLUDED.posterior_anterior,
    complexity = EXCLUDED.complexity,
    equipment = EXCLUDED.equipment,
    primary_muscle = EXCLUDED.primary_muscle,
    supporting_muscles = EXCLUDED.supporting_muscles,
    muscle_bias = EXCLUDED.muscle_bias,
    joint_count_level = EXCLUDED.joint_count_level,
    dynamic_isometric = EXCLUDED.dynamic_isometric,
    movement_plane = EXCLUDED.movement_plane,
    primary_joints = EXCLUDED.primary_joints,
    is_active = true,
    updated_at = now();

INSERT INTO exercise_library (name, category, movement_patterns, bilateral_unilateral, posterior_anterior, complexity, equipment, primary_muscle, supporting_muscles, muscle_bias, joint_count_level, dynamic_isometric, movement_plane, primary_joints, is_active)
  VALUES ('Rear-Delt Fly (Dual Cable; Cross-Body; Facing In)', 'strength', '{"horizontal_pull"}'::text[], 'bilateral', 'posterior', 2, '{"cable"}'::text[], 'Posterior deltoid', '{"Rhomboid","Mid trapezius"}'::text[], 'lengthened', 'local', NULL, 'horizontal', '{"Shoulder"}'::text[], true)
  ON CONFLICT (name) DO UPDATE SET
    category = EXCLUDED.category,
    movement_patterns = EXCLUDED.movement_patterns,
    bilateral_unilateral = EXCLUDED.bilateral_unilateral,
    posterior_anterior = EXCLUDED.posterior_anterior,
    complexity = EXCLUDED.complexity,
    equipment = EXCLUDED.equipment,
    primary_muscle = EXCLUDED.primary_muscle,
    supporting_muscles = EXCLUDED.supporting_muscles,
    muscle_bias = EXCLUDED.muscle_bias,
    joint_count_level = EXCLUDED.joint_count_level,
    dynamic_isometric = EXCLUDED.dynamic_isometric,
    movement_plane = EXCLUDED.movement_plane,
    primary_joints = EXCLUDED.primary_joints,
    is_active = true,
    updated_at = now();

INSERT INTO exercise_library (name, category, movement_patterns, bilateral_unilateral, posterior_anterior, complexity, equipment, primary_muscle, supporting_muscles, muscle_bias, joint_count_level, dynamic_isometric, movement_plane, primary_joints, is_active)
  VALUES ('Y-Raise (Dual Cable; Low-to-High; Facing In)', 'strength', '{"vertical_pull"}'::text[], 'bilateral', 'posterior', 2, '{"cable"}'::text[], 'Lower trapezius', '{"Serratus anterior","Posterior deltoid"}'::text[], 'lengthened', 'regional', NULL, 'vertical', '{"Shoulder"}'::text[], true)
  ON CONFLICT (name) DO UPDATE SET
    category = EXCLUDED.category,
    movement_patterns = EXCLUDED.movement_patterns,
    bilateral_unilateral = EXCLUDED.bilateral_unilateral,
    posterior_anterior = EXCLUDED.posterior_anterior,
    complexity = EXCLUDED.complexity,
    equipment = EXCLUDED.equipment,
    primary_muscle = EXCLUDED.primary_muscle,
    supporting_muscles = EXCLUDED.supporting_muscles,
    muscle_bias = EXCLUDED.muscle_bias,
    joint_count_level = EXCLUDED.joint_count_level,
    dynamic_isometric = EXCLUDED.dynamic_isometric,
    movement_plane = EXCLUDED.movement_plane,
    primary_joints = EXCLUDED.primary_joints,
    is_active = true,
    updated_at = now();

INSERT INTO exercise_library (name, category, movement_patterns, bilateral_unilateral, posterior_anterior, complexity, equipment, primary_muscle, supporting_muscles, muscle_bias, joint_count_level, dynamic_isometric, movement_plane, primary_joints, is_active)
  VALUES ('W-Raise (Dual Cable; Low-to-High; Facing In)', 'strength', '{"vertical_pull"}'::text[], 'bilateral', 'posterior', 2, '{"cable"}'::text[], 'Mid trapezius, Lower trapezius', '{"Rhomboid","Posterior deltoid"}'::text[], 'lengthened', 'regional', NULL, 'vertical', '{"Shoulder"}'::text[], true)
  ON CONFLICT (name) DO UPDATE SET
    category = EXCLUDED.category,
    movement_patterns = EXCLUDED.movement_patterns,
    bilateral_unilateral = EXCLUDED.bilateral_unilateral,
    posterior_anterior = EXCLUDED.posterior_anterior,
    complexity = EXCLUDED.complexity,
    equipment = EXCLUDED.equipment,
    primary_muscle = EXCLUDED.primary_muscle,
    supporting_muscles = EXCLUDED.supporting_muscles,
    muscle_bias = EXCLUDED.muscle_bias,
    joint_count_level = EXCLUDED.joint_count_level,
    dynamic_isometric = EXCLUDED.dynamic_isometric,
    movement_plane = EXCLUDED.movement_plane,
    primary_joints = EXCLUDED.primary_joints,
    is_active = true,
    updated_at = now();

INSERT INTO exercise_library (name, category, movement_patterns, bilateral_unilateral, posterior_anterior, complexity, equipment, primary_muscle, supporting_muscles, muscle_bias, joint_count_level, dynamic_isometric, movement_plane, primary_joints, is_active)
  VALUES ('Reverse Pec Deck (Rear Delt)', 'strength', '{"horizontal_pull"}'::text[], 'bilateral', 'posterior', 1, '{"fixed_machine"}'::text[], 'Posterior deltoid', '{"Rhomboid","Mid trapezius"}'::text[], 'mid', 'local', NULL, 'horizontal', '{"Shoulder"}'::text[], true)
  ON CONFLICT (name) DO UPDATE SET
    category = EXCLUDED.category,
    movement_patterns = EXCLUDED.movement_patterns,
    bilateral_unilateral = EXCLUDED.bilateral_unilateral,
    posterior_anterior = EXCLUDED.posterior_anterior,
    complexity = EXCLUDED.complexity,
    equipment = EXCLUDED.equipment,
    primary_muscle = EXCLUDED.primary_muscle,
    supporting_muscles = EXCLUDED.supporting_muscles,
    muscle_bias = EXCLUDED.muscle_bias,
    joint_count_level = EXCLUDED.joint_count_level,
    dynamic_isometric = EXCLUDED.dynamic_isometric,
    movement_plane = EXCLUDED.movement_plane,
    primary_joints = EXCLUDED.primary_joints,
    is_active = true,
    updated_at = now();

INSERT INTO exercise_library (name, category, movement_patterns, bilateral_unilateral, posterior_anterior, complexity, equipment, primary_muscle, supporting_muscles, muscle_bias, joint_count_level, dynamic_isometric, movement_plane, primary_joints, is_active)
  VALUES ('Face Pull (Cable; Rope Attachment)', 'strength', '{"horizontal_pull"}'::text[], 'bilateral', 'posterior', 1, '{"cable"}'::text[], 'Posterior deltoid', '{"Rhomboid","Mid trapezius","Lower trapezius","Rotator cuff"}'::text[], 'mid', 'regional', NULL, 'horizontal', '{"Shoulder"}'::text[], true)
  ON CONFLICT (name) DO UPDATE SET
    category = EXCLUDED.category,
    movement_patterns = EXCLUDED.movement_patterns,
    bilateral_unilateral = EXCLUDED.bilateral_unilateral,
    posterior_anterior = EXCLUDED.posterior_anterior,
    complexity = EXCLUDED.complexity,
    equipment = EXCLUDED.equipment,
    primary_muscle = EXCLUDED.primary_muscle,
    supporting_muscles = EXCLUDED.supporting_muscles,
    muscle_bias = EXCLUDED.muscle_bias,
    joint_count_level = EXCLUDED.joint_count_level,
    dynamic_isometric = EXCLUDED.dynamic_isometric,
    movement_plane = EXCLUDED.movement_plane,
    primary_joints = EXCLUDED.primary_joints,
    is_active = true,
    updated_at = now();

INSERT INTO exercise_library (name, category, movement_patterns, bilateral_unilateral, posterior_anterior, complexity, equipment, primary_muscle, supporting_muscles, muscle_bias, joint_count_level, dynamic_isometric, movement_plane, primary_joints, is_active)
  VALUES ('DB Shrug', 'strength', '{"vertical_pull"}'::text[], 'bilateral', 'posterior', 1, '{"dumbbell"}'::text[], 'Upper trapezius', '{"Levator scapulae"}'::text[], 'shortened', 'local', NULL, 'vertical', '{"Scapulothoracic"}'::text[], true)
  ON CONFLICT (name) DO UPDATE SET
    category = EXCLUDED.category,
    movement_patterns = EXCLUDED.movement_patterns,
    bilateral_unilateral = EXCLUDED.bilateral_unilateral,
    posterior_anterior = EXCLUDED.posterior_anterior,
    complexity = EXCLUDED.complexity,
    equipment = EXCLUDED.equipment,
    primary_muscle = EXCLUDED.primary_muscle,
    supporting_muscles = EXCLUDED.supporting_muscles,
    muscle_bias = EXCLUDED.muscle_bias,
    joint_count_level = EXCLUDED.joint_count_level,
    dynamic_isometric = EXCLUDED.dynamic_isometric,
    movement_plane = EXCLUDED.movement_plane,
    primary_joints = EXCLUDED.primary_joints,
    is_active = true,
    updated_at = now();

INSERT INTO exercise_library (name, category, movement_patterns, bilateral_unilateral, posterior_anterior, complexity, equipment, primary_muscle, supporting_muscles, muscle_bias, joint_count_level, dynamic_isometric, movement_plane, primary_joints, is_active)
  VALUES ('Incline Bench Prone Y-Raise (Trap 3)', 'strength', '{"vertical_pull"}'::text[], 'bilateral', 'posterior', 2, '{"bench","dumbbell"}'::text[], 'Lower trapezius', '{"Rotator cuff","Posterior deltoid"}'::text[], 'lengthened', 'regional', NULL, 'vertical', '{"Shoulder"}'::text[], true)
  ON CONFLICT (name) DO UPDATE SET
    category = EXCLUDED.category,
    movement_patterns = EXCLUDED.movement_patterns,
    bilateral_unilateral = EXCLUDED.bilateral_unilateral,
    posterior_anterior = EXCLUDED.posterior_anterior,
    complexity = EXCLUDED.complexity,
    equipment = EXCLUDED.equipment,
    primary_muscle = EXCLUDED.primary_muscle,
    supporting_muscles = EXCLUDED.supporting_muscles,
    muscle_bias = EXCLUDED.muscle_bias,
    joint_count_level = EXCLUDED.joint_count_level,
    dynamic_isometric = EXCLUDED.dynamic_isometric,
    movement_plane = EXCLUDED.movement_plane,
    primary_joints = EXCLUDED.primary_joints,
    is_active = true,
    updated_at = now();

INSERT INTO exercise_library (name, category, movement_patterns, bilateral_unilateral, posterior_anterior, complexity, equipment, primary_muscle, supporting_muscles, muscle_bias, joint_count_level, dynamic_isometric, movement_plane, primary_joints, is_active)
  VALUES ('Prone Y-Raise (Trap 3; Flat Bench)', 'strength', '{"vertical_pull"}'::text[], 'bilateral', 'posterior', 2, '{"bench","dumbbell"}'::text[], 'Lower trapezius', '{"Rotator cuff","Posterior deltoid"}'::text[], 'lengthened', 'regional', NULL, 'vertical', '{"Shoulder"}'::text[], true)
  ON CONFLICT (name) DO UPDATE SET
    category = EXCLUDED.category,
    movement_patterns = EXCLUDED.movement_patterns,
    bilateral_unilateral = EXCLUDED.bilateral_unilateral,
    posterior_anterior = EXCLUDED.posterior_anterior,
    complexity = EXCLUDED.complexity,
    equipment = EXCLUDED.equipment,
    primary_muscle = EXCLUDED.primary_muscle,
    supporting_muscles = EXCLUDED.supporting_muscles,
    muscle_bias = EXCLUDED.muscle_bias,
    joint_count_level = EXCLUDED.joint_count_level,
    dynamic_isometric = EXCLUDED.dynamic_isometric,
    movement_plane = EXCLUDED.movement_plane,
    primary_joints = EXCLUDED.primary_joints,
    is_active = true,
    updated_at = now();

INSERT INTO exercise_library (name, category, movement_patterns, bilateral_unilateral, posterior_anterior, complexity, equipment, primary_muscle, supporting_muscles, muscle_bias, joint_count_level, dynamic_isometric, movement_plane, primary_joints, is_active)
  VALUES ('Prone T-Raise (Mid Trap / Rhomboids)', 'strength', '{"horizontal_pull"}'::text[], 'bilateral', 'posterior', 2, '{"bench","dumbbell"}'::text[], 'Mid trapezius, Rhomboid', '{"Posterior deltoid","Rotator cuff"}'::text[], 'lengthened', 'regional', NULL, 'horizontal', '{"Shoulder"}'::text[], true)
  ON CONFLICT (name) DO UPDATE SET
    category = EXCLUDED.category,
    movement_patterns = EXCLUDED.movement_patterns,
    bilateral_unilateral = EXCLUDED.bilateral_unilateral,
    posterior_anterior = EXCLUDED.posterior_anterior,
    complexity = EXCLUDED.complexity,
    equipment = EXCLUDED.equipment,
    primary_muscle = EXCLUDED.primary_muscle,
    supporting_muscles = EXCLUDED.supporting_muscles,
    muscle_bias = EXCLUDED.muscle_bias,
    joint_count_level = EXCLUDED.joint_count_level,
    dynamic_isometric = EXCLUDED.dynamic_isometric,
    movement_plane = EXCLUDED.movement_plane,
    primary_joints = EXCLUDED.primary_joints,
    is_active = true,
    updated_at = now();

INSERT INTO exercise_library (name, category, movement_patterns, bilateral_unilateral, posterior_anterior, complexity, equipment, primary_muscle, supporting_muscles, muscle_bias, joint_count_level, dynamic_isometric, movement_plane, primary_joints, is_active)
  VALUES ('Bent-Over Rear-Delt Fly (Single-Arm Cable)', 'strength', '{"horizontal_pull"}'::text[], 'unilateral', 'posterior', 2, '{"cable"}'::text[], 'Posterior deltoid', '{"Rhomboid","Mid trapezius"}'::text[], 'lengthened', 'local', NULL, 'horizontal', '{"Shoulder"}'::text[], true)
  ON CONFLICT (name) DO UPDATE SET
    category = EXCLUDED.category,
    movement_patterns = EXCLUDED.movement_patterns,
    bilateral_unilateral = EXCLUDED.bilateral_unilateral,
    posterior_anterior = EXCLUDED.posterior_anterior,
    complexity = EXCLUDED.complexity,
    equipment = EXCLUDED.equipment,
    primary_muscle = EXCLUDED.primary_muscle,
    supporting_muscles = EXCLUDED.supporting_muscles,
    muscle_bias = EXCLUDED.muscle_bias,
    joint_count_level = EXCLUDED.joint_count_level,
    dynamic_isometric = EXCLUDED.dynamic_isometric,
    movement_plane = EXCLUDED.movement_plane,
    primary_joints = EXCLUDED.primary_joints,
    is_active = true,
    updated_at = now();

INSERT INTO exercise_library (name, category, movement_patterns, bilateral_unilateral, posterior_anterior, complexity, equipment, primary_muscle, supporting_muscles, muscle_bias, joint_count_level, dynamic_isometric, movement_plane, primary_joints, is_active)
  VALUES ('Powell Raise (Side-Lying; Single-Arm DB)', 'strength', '{"horizontal_pull"}'::text[], 'unilateral', 'posterior', 2, '{"dumbbell"}'::text[], 'Posterior deltoid', '{"Infraspinatus","Teres minor","Rhomboid"}'::text[], 'lengthened', 'local', NULL, 'horizontal', '{"Shoulder"}'::text[], true)
  ON CONFLICT (name) DO UPDATE SET
    category = EXCLUDED.category,
    movement_patterns = EXCLUDED.movement_patterns,
    bilateral_unilateral = EXCLUDED.bilateral_unilateral,
    posterior_anterior = EXCLUDED.posterior_anterior,
    complexity = EXCLUDED.complexity,
    equipment = EXCLUDED.equipment,
    primary_muscle = EXCLUDED.primary_muscle,
    supporting_muscles = EXCLUDED.supporting_muscles,
    muscle_bias = EXCLUDED.muscle_bias,
    joint_count_level = EXCLUDED.joint_count_level,
    dynamic_isometric = EXCLUDED.dynamic_isometric,
    movement_plane = EXCLUDED.movement_plane,
    primary_joints = EXCLUDED.primary_joints,
    is_active = true,
    updated_at = now();

INSERT INTO exercise_library (name, category, movement_patterns, bilateral_unilateral, posterior_anterior, complexity, equipment, primary_muscle, supporting_muscles, muscle_bias, joint_count_level, dynamic_isometric, movement_plane, primary_joints, is_active)
  VALUES ('Powell Raise (Incline Side-Lying; Single-Arm DB)', 'strength', '{"horizontal_pull"}'::text[], 'unilateral', 'posterior', 2, '{"bench","dumbbell"}'::text[], 'Posterior deltoid', '{"Infraspinatus","Teres minor","Rhomboid"}'::text[], 'lengthened', 'local', NULL, 'horizontal', '{"Shoulder"}'::text[], true)
  ON CONFLICT (name) DO UPDATE SET
    category = EXCLUDED.category,
    movement_patterns = EXCLUDED.movement_patterns,
    bilateral_unilateral = EXCLUDED.bilateral_unilateral,
    posterior_anterior = EXCLUDED.posterior_anterior,
    complexity = EXCLUDED.complexity,
    equipment = EXCLUDED.equipment,
    primary_muscle = EXCLUDED.primary_muscle,
    supporting_muscles = EXCLUDED.supporting_muscles,
    muscle_bias = EXCLUDED.muscle_bias,
    joint_count_level = EXCLUDED.joint_count_level,
    dynamic_isometric = EXCLUDED.dynamic_isometric,
    movement_plane = EXCLUDED.movement_plane,
    primary_joints = EXCLUDED.primary_joints,
    is_active = true,
    updated_at = now();

INSERT INTO exercise_library (name, category, movement_patterns, bilateral_unilateral, posterior_anterior, complexity, equipment, primary_muscle, supporting_muscles, muscle_bias, joint_count_level, dynamic_isometric, movement_plane, primary_joints, is_active)
  VALUES ('External Rotation (Band; Elbow at Side)', 'strength', '{"horizontal_pull"}'::text[], 'unilateral', 'posterior', 1, '{"band"}'::text[], 'Infraspinatus, Teres minor', '{"Posterior deltoid"}'::text[], 'mid', 'local', NULL, 'horizontal', '{"Shoulder"}'::text[], true)
  ON CONFLICT (name) DO UPDATE SET
    category = EXCLUDED.category,
    movement_patterns = EXCLUDED.movement_patterns,
    bilateral_unilateral = EXCLUDED.bilateral_unilateral,
    posterior_anterior = EXCLUDED.posterior_anterior,
    complexity = EXCLUDED.complexity,
    equipment = EXCLUDED.equipment,
    primary_muscle = EXCLUDED.primary_muscle,
    supporting_muscles = EXCLUDED.supporting_muscles,
    muscle_bias = EXCLUDED.muscle_bias,
    joint_count_level = EXCLUDED.joint_count_level,
    dynamic_isometric = EXCLUDED.dynamic_isometric,
    movement_plane = EXCLUDED.movement_plane,
    primary_joints = EXCLUDED.primary_joints,
    is_active = true,
    updated_at = now();

INSERT INTO exercise_library (name, category, movement_patterns, bilateral_unilateral, posterior_anterior, complexity, equipment, primary_muscle, supporting_muscles, muscle_bias, joint_count_level, dynamic_isometric, movement_plane, primary_joints, is_active)
  VALUES ('External Rotation (Band; 90/90)', 'strength', '{"horizontal_pull"}'::text[], 'unilateral', 'posterior', 2, '{"band"}'::text[], 'Infraspinatus, Teres minor', '{"Posterior deltoid","Lower trapezius"}'::text[], 'mid', 'local', NULL, 'horizontal', '{"Shoulder"}'::text[], true)
  ON CONFLICT (name) DO UPDATE SET
    category = EXCLUDED.category,
    movement_patterns = EXCLUDED.movement_patterns,
    bilateral_unilateral = EXCLUDED.bilateral_unilateral,
    posterior_anterior = EXCLUDED.posterior_anterior,
    complexity = EXCLUDED.complexity,
    equipment = EXCLUDED.equipment,
    primary_muscle = EXCLUDED.primary_muscle,
    supporting_muscles = EXCLUDED.supporting_muscles,
    muscle_bias = EXCLUDED.muscle_bias,
    joint_count_level = EXCLUDED.joint_count_level,
    dynamic_isometric = EXCLUDED.dynamic_isometric,
    movement_plane = EXCLUDED.movement_plane,
    primary_joints = EXCLUDED.primary_joints,
    is_active = true,
    updated_at = now();

INSERT INTO exercise_library (name, category, movement_patterns, bilateral_unilateral, posterior_anterior, complexity, equipment, primary_muscle, supporting_muscles, muscle_bias, joint_count_level, dynamic_isometric, movement_plane, primary_joints, is_active)
  VALUES ('Internal Rotation (Band; Elbow at Side)', 'strength', '{"horizontal_push"}'::text[], 'unilateral', 'anterior', 1, '{"band"}'::text[], 'Subscapularis', '{"Pectoralis major","Latissimus dorsi"}'::text[], 'mid', 'local', NULL, 'horizontal', '{"Shoulder"}'::text[], true)
  ON CONFLICT (name) DO UPDATE SET
    category = EXCLUDED.category,
    movement_patterns = EXCLUDED.movement_patterns,
    bilateral_unilateral = EXCLUDED.bilateral_unilateral,
    posterior_anterior = EXCLUDED.posterior_anterior,
    complexity = EXCLUDED.complexity,
    equipment = EXCLUDED.equipment,
    primary_muscle = EXCLUDED.primary_muscle,
    supporting_muscles = EXCLUDED.supporting_muscles,
    muscle_bias = EXCLUDED.muscle_bias,
    joint_count_level = EXCLUDED.joint_count_level,
    dynamic_isometric = EXCLUDED.dynamic_isometric,
    movement_plane = EXCLUDED.movement_plane,
    primary_joints = EXCLUDED.primary_joints,
    is_active = true,
    updated_at = now();

INSERT INTO exercise_library (name, category, movement_patterns, bilateral_unilateral, posterior_anterior, complexity, equipment, primary_muscle, supporting_muscles, muscle_bias, joint_count_level, dynamic_isometric, movement_plane, primary_joints, is_active)
  VALUES ('External Rotation (Cable; Elbow at Side)', 'strength', '{"horizontal_pull"}'::text[], 'unilateral', 'posterior', 1, '{"cable"}'::text[], 'Infraspinatus, Teres minor', '{"Posterior deltoid"}'::text[], 'mid', 'local', NULL, 'horizontal', '{"Shoulder"}'::text[], true)
  ON CONFLICT (name) DO UPDATE SET
    category = EXCLUDED.category,
    movement_patterns = EXCLUDED.movement_patterns,
    bilateral_unilateral = EXCLUDED.bilateral_unilateral,
    posterior_anterior = EXCLUDED.posterior_anterior,
    complexity = EXCLUDED.complexity,
    equipment = EXCLUDED.equipment,
    primary_muscle = EXCLUDED.primary_muscle,
    supporting_muscles = EXCLUDED.supporting_muscles,
    muscle_bias = EXCLUDED.muscle_bias,
    joint_count_level = EXCLUDED.joint_count_level,
    dynamic_isometric = EXCLUDED.dynamic_isometric,
    movement_plane = EXCLUDED.movement_plane,
    primary_joints = EXCLUDED.primary_joints,
    is_active = true,
    updated_at = now();

INSERT INTO exercise_library (name, category, movement_patterns, bilateral_unilateral, posterior_anterior, complexity, equipment, primary_muscle, supporting_muscles, muscle_bias, joint_count_level, dynamic_isometric, movement_plane, primary_joints, is_active)
  VALUES ('External Rotation (Cable; 90/90)', 'strength', '{"horizontal_pull"}'::text[], 'unilateral', 'posterior', 2, '{"cable"}'::text[], 'Infraspinatus, Teres minor', '{"Posterior deltoid","Lower trapezius"}'::text[], 'mid', 'local', NULL, 'horizontal', '{"Shoulder"}'::text[], true)
  ON CONFLICT (name) DO UPDATE SET
    category = EXCLUDED.category,
    movement_patterns = EXCLUDED.movement_patterns,
    bilateral_unilateral = EXCLUDED.bilateral_unilateral,
    posterior_anterior = EXCLUDED.posterior_anterior,
    complexity = EXCLUDED.complexity,
    equipment = EXCLUDED.equipment,
    primary_muscle = EXCLUDED.primary_muscle,
    supporting_muscles = EXCLUDED.supporting_muscles,
    muscle_bias = EXCLUDED.muscle_bias,
    joint_count_level = EXCLUDED.joint_count_level,
    dynamic_isometric = EXCLUDED.dynamic_isometric,
    movement_plane = EXCLUDED.movement_plane,
    primary_joints = EXCLUDED.primary_joints,
    is_active = true,
    updated_at = now();

INSERT INTO exercise_library (name, category, movement_patterns, bilateral_unilateral, posterior_anterior, complexity, equipment, primary_muscle, supporting_muscles, muscle_bias, joint_count_level, dynamic_isometric, movement_plane, primary_joints, is_active)
  VALUES ('Internal Rotation (Cable; Elbow at Side)', 'strength', '{"horizontal_push"}'::text[], 'unilateral', 'anterior', 1, '{"cable"}'::text[], 'Subscapularis', '{"Pectoralis major","Latissimus dorsi"}'::text[], 'mid', 'local', NULL, 'horizontal', '{"Shoulder"}'::text[], true)
  ON CONFLICT (name) DO UPDATE SET
    category = EXCLUDED.category,
    movement_patterns = EXCLUDED.movement_patterns,
    bilateral_unilateral = EXCLUDED.bilateral_unilateral,
    posterior_anterior = EXCLUDED.posterior_anterior,
    complexity = EXCLUDED.complexity,
    equipment = EXCLUDED.equipment,
    primary_muscle = EXCLUDED.primary_muscle,
    supporting_muscles = EXCLUDED.supporting_muscles,
    muscle_bias = EXCLUDED.muscle_bias,
    joint_count_level = EXCLUDED.joint_count_level,
    dynamic_isometric = EXCLUDED.dynamic_isometric,
    movement_plane = EXCLUDED.movement_plane,
    primary_joints = EXCLUDED.primary_joints,
    is_active = true,
    updated_at = now();

INSERT INTO exercise_library (name, category, movement_patterns, bilateral_unilateral, posterior_anterior, complexity, equipment, primary_muscle, supporting_muscles, muscle_bias, joint_count_level, dynamic_isometric, movement_plane, primary_joints, is_active)
  VALUES ('Side-Lying External Rotation (DB)', 'strength', '{"horizontal_pull"}'::text[], 'unilateral', 'posterior', 1, '{"dumbbell"}'::text[], 'Infraspinatus, Teres minor', '{"Posterior deltoid"}'::text[], 'mid', 'local', NULL, 'horizontal', '{"Shoulder"}'::text[], true)
  ON CONFLICT (name) DO UPDATE SET
    category = EXCLUDED.category,
    movement_patterns = EXCLUDED.movement_patterns,
    bilateral_unilateral = EXCLUDED.bilateral_unilateral,
    posterior_anterior = EXCLUDED.posterior_anterior,
    complexity = EXCLUDED.complexity,
    equipment = EXCLUDED.equipment,
    primary_muscle = EXCLUDED.primary_muscle,
    supporting_muscles = EXCLUDED.supporting_muscles,
    muscle_bias = EXCLUDED.muscle_bias,
    joint_count_level = EXCLUDED.joint_count_level,
    dynamic_isometric = EXCLUDED.dynamic_isometric,
    movement_plane = EXCLUDED.movement_plane,
    primary_joints = EXCLUDED.primary_joints,
    is_active = true,
    updated_at = now();

INSERT INTO exercise_library (name, category, movement_patterns, bilateral_unilateral, posterior_anterior, complexity, equipment, primary_muscle, supporting_muscles, muscle_bias, joint_count_level, dynamic_isometric, movement_plane, primary_joints, is_active)
  VALUES ('Standing External Rotation (Band)', 'strength', '{"horizontal_pull"}'::text[], 'unilateral', 'posterior', 1, '{"band"}'::text[], 'Infraspinatus, Teres minor', '{"Posterior deltoid"}'::text[], 'mid', 'local', NULL, 'horizontal', '{"Shoulder"}'::text[], true)
  ON CONFLICT (name) DO UPDATE SET
    category = EXCLUDED.category,
    movement_patterns = EXCLUDED.movement_patterns,
    bilateral_unilateral = EXCLUDED.bilateral_unilateral,
    posterior_anterior = EXCLUDED.posterior_anterior,
    complexity = EXCLUDED.complexity,
    equipment = EXCLUDED.equipment,
    primary_muscle = EXCLUDED.primary_muscle,
    supporting_muscles = EXCLUDED.supporting_muscles,
    muscle_bias = EXCLUDED.muscle_bias,
    joint_count_level = EXCLUDED.joint_count_level,
    dynamic_isometric = EXCLUDED.dynamic_isometric,
    movement_plane = EXCLUDED.movement_plane,
    primary_joints = EXCLUDED.primary_joints,
    is_active = true,
    updated_at = now();

INSERT INTO exercise_library (name, category, movement_patterns, bilateral_unilateral, posterior_anterior, complexity, equipment, primary_muscle, supporting_muscles, muscle_bias, joint_count_level, dynamic_isometric, movement_plane, primary_joints, is_active)
  VALUES ('Cuban Rotation (Dual DB)', 'strength', '{"vertical_pull"}'::text[], 'bilateral', 'posterior', 2, '{"dumbbell"}'::text[], 'Rotator cuff (external rotation)', '{"Posterior deltoid","Mid trapezius"}'::text[], 'mid', 'regional', NULL, 'vertical', '{"Shoulder"}'::text[], true)
  ON CONFLICT (name) DO UPDATE SET
    category = EXCLUDED.category,
    movement_patterns = EXCLUDED.movement_patterns,
    bilateral_unilateral = EXCLUDED.bilateral_unilateral,
    posterior_anterior = EXCLUDED.posterior_anterior,
    complexity = EXCLUDED.complexity,
    equipment = EXCLUDED.equipment,
    primary_muscle = EXCLUDED.primary_muscle,
    supporting_muscles = EXCLUDED.supporting_muscles,
    muscle_bias = EXCLUDED.muscle_bias,
    joint_count_level = EXCLUDED.joint_count_level,
    dynamic_isometric = EXCLUDED.dynamic_isometric,
    movement_plane = EXCLUDED.movement_plane,
    primary_joints = EXCLUDED.primary_joints,
    is_active = true,
    updated_at = now();

INSERT INTO exercise_library (name, category, movement_patterns, bilateral_unilateral, posterior_anterior, complexity, equipment, primary_muscle, supporting_muscles, muscle_bias, joint_count_level, dynamic_isometric, movement_plane, primary_joints, is_active)
  VALUES ('Scaption Raise (Thumbs Up)', 'strength', '{"vertical_push"}'::text[], 'bilateral', 'anterior', 1, '{"dumbbell"}'::text[], 'Supraspinatus, Anterior deltoid', '{"Lower trapezius","Serratus anterior"}'::text[], 'mid', 'local', NULL, 'vertical', '{"Shoulder"}'::text[], true)
  ON CONFLICT (name) DO UPDATE SET
    category = EXCLUDED.category,
    movement_patterns = EXCLUDED.movement_patterns,
    bilateral_unilateral = EXCLUDED.bilateral_unilateral,
    posterior_anterior = EXCLUDED.posterior_anterior,
    complexity = EXCLUDED.complexity,
    equipment = EXCLUDED.equipment,
    primary_muscle = EXCLUDED.primary_muscle,
    supporting_muscles = EXCLUDED.supporting_muscles,
    muscle_bias = EXCLUDED.muscle_bias,
    joint_count_level = EXCLUDED.joint_count_level,
    dynamic_isometric = EXCLUDED.dynamic_isometric,
    movement_plane = EXCLUDED.movement_plane,
    primary_joints = EXCLUDED.primary_joints,
    is_active = true,
    updated_at = now();

INSERT INTO exercise_library (name, category, movement_patterns, bilateral_unilateral, posterior_anterior, complexity, equipment, primary_muscle, supporting_muscles, muscle_bias, joint_count_level, dynamic_isometric, movement_plane, primary_joints, is_active)
  VALUES ('External Rotation (Single-Arm DB; Elbow on Knee)', 'strength', '{"horizontal_pull"}'::text[], 'unilateral', 'posterior', 1, '{"dumbbell"}'::text[], 'Infraspinatus, Teres minor', '{"Posterior deltoid"}'::text[], 'mid', 'local', NULL, 'horizontal', '{"Shoulder"}'::text[], true)
  ON CONFLICT (name) DO UPDATE SET
    category = EXCLUDED.category,
    movement_patterns = EXCLUDED.movement_patterns,
    bilateral_unilateral = EXCLUDED.bilateral_unilateral,
    posterior_anterior = EXCLUDED.posterior_anterior,
    complexity = EXCLUDED.complexity,
    equipment = EXCLUDED.equipment,
    primary_muscle = EXCLUDED.primary_muscle,
    supporting_muscles = EXCLUDED.supporting_muscles,
    muscle_bias = EXCLUDED.muscle_bias,
    joint_count_level = EXCLUDED.joint_count_level,
    dynamic_isometric = EXCLUDED.dynamic_isometric,
    movement_plane = EXCLUDED.movement_plane,
    primary_joints = EXCLUDED.primary_joints,
    is_active = true,
    updated_at = now();

INSERT INTO exercise_library (name, category, movement_patterns, bilateral_unilateral, posterior_anterior, complexity, equipment, primary_muscle, supporting_muscles, muscle_bias, joint_count_level, dynamic_isometric, movement_plane, primary_joints, is_active)
  VALUES ('DB Curl (Dual; Neutral Grip)', 'strength', '{"vertical_pull"}'::text[], 'bilateral', 'anterior', 1, '{"dumbbell"}'::text[], 'Brachialis', '{"Biceps brachii","Brachioradialis"}'::text[], 'mid', 'local', NULL, 'vertical', '{"Elbow"}'::text[], true)
  ON CONFLICT (name) DO UPDATE SET
    category = EXCLUDED.category,
    movement_patterns = EXCLUDED.movement_patterns,
    bilateral_unilateral = EXCLUDED.bilateral_unilateral,
    posterior_anterior = EXCLUDED.posterior_anterior,
    complexity = EXCLUDED.complexity,
    equipment = EXCLUDED.equipment,
    primary_muscle = EXCLUDED.primary_muscle,
    supporting_muscles = EXCLUDED.supporting_muscles,
    muscle_bias = EXCLUDED.muscle_bias,
    joint_count_level = EXCLUDED.joint_count_level,
    dynamic_isometric = EXCLUDED.dynamic_isometric,
    movement_plane = EXCLUDED.movement_plane,
    primary_joints = EXCLUDED.primary_joints,
    is_active = true,
    updated_at = now();

INSERT INTO exercise_library (name, category, movement_patterns, bilateral_unilateral, posterior_anterior, complexity, equipment, primary_muscle, supporting_muscles, muscle_bias, joint_count_level, dynamic_isometric, movement_plane, primary_joints, is_active)
  VALUES ('DB Curl (Dual; Neutral-to-Supinated)', 'strength', '{"vertical_pull"}'::text[], 'bilateral', 'anterior', 1, '{"dumbbell"}'::text[], 'Biceps brachii', '{"Brachialis","Brachioradialis"}'::text[], 'mid', 'local', NULL, 'vertical', '{"Elbow"}'::text[], true)
  ON CONFLICT (name) DO UPDATE SET
    category = EXCLUDED.category,
    movement_patterns = EXCLUDED.movement_patterns,
    bilateral_unilateral = EXCLUDED.bilateral_unilateral,
    posterior_anterior = EXCLUDED.posterior_anterior,
    complexity = EXCLUDED.complexity,
    equipment = EXCLUDED.equipment,
    primary_muscle = EXCLUDED.primary_muscle,
    supporting_muscles = EXCLUDED.supporting_muscles,
    muscle_bias = EXCLUDED.muscle_bias,
    joint_count_level = EXCLUDED.joint_count_level,
    dynamic_isometric = EXCLUDED.dynamic_isometric,
    movement_plane = EXCLUDED.movement_plane,
    primary_joints = EXCLUDED.primary_joints,
    is_active = true,
    updated_at = now();

INSERT INTO exercise_library (name, category, movement_patterns, bilateral_unilateral, posterior_anterior, complexity, equipment, primary_muscle, supporting_muscles, muscle_bias, joint_count_level, dynamic_isometric, movement_plane, primary_joints, is_active)
  VALUES ('Zottman Curl (Dual DB)', 'strength', '{"vertical_pull"}'::text[], 'bilateral', 'anterior', 2, '{"dumbbell"}'::text[], 'Biceps brachii', '{"Brachialis","Forearm musculature"}'::text[], 'mid', 'local', NULL, 'vertical', '{"Elbow"}'::text[], true)
  ON CONFLICT (name) DO UPDATE SET
    category = EXCLUDED.category,
    movement_patterns = EXCLUDED.movement_patterns,
    bilateral_unilateral = EXCLUDED.bilateral_unilateral,
    posterior_anterior = EXCLUDED.posterior_anterior,
    complexity = EXCLUDED.complexity,
    equipment = EXCLUDED.equipment,
    primary_muscle = EXCLUDED.primary_muscle,
    supporting_muscles = EXCLUDED.supporting_muscles,
    muscle_bias = EXCLUDED.muscle_bias,
    joint_count_level = EXCLUDED.joint_count_level,
    dynamic_isometric = EXCLUDED.dynamic_isometric,
    movement_plane = EXCLUDED.movement_plane,
    primary_joints = EXCLUDED.primary_joints,
    is_active = true,
    updated_at = now();

INSERT INTO exercise_library (name, category, movement_patterns, bilateral_unilateral, posterior_anterior, complexity, equipment, primary_muscle, supporting_muscles, muscle_bias, joint_count_level, dynamic_isometric, movement_plane, primary_joints, is_active)
  VALUES ('Reverse Curl (Dual DB; Semi-Pronated)', 'strength', '{"vertical_pull"}'::text[], 'bilateral', 'anterior', 1, '{"dumbbell"}'::text[], 'Brachioradialis', '{"Brachialis"}'::text[], 'mid', 'local', NULL, 'vertical', '{"Elbow"}'::text[], true)
  ON CONFLICT (name) DO UPDATE SET
    category = EXCLUDED.category,
    movement_patterns = EXCLUDED.movement_patterns,
    bilateral_unilateral = EXCLUDED.bilateral_unilateral,
    posterior_anterior = EXCLUDED.posterior_anterior,
    complexity = EXCLUDED.complexity,
    equipment = EXCLUDED.equipment,
    primary_muscle = EXCLUDED.primary_muscle,
    supporting_muscles = EXCLUDED.supporting_muscles,
    muscle_bias = EXCLUDED.muscle_bias,
    joint_count_level = EXCLUDED.joint_count_level,
    dynamic_isometric = EXCLUDED.dynamic_isometric,
    movement_plane = EXCLUDED.movement_plane,
    primary_joints = EXCLUDED.primary_joints,
    is_active = true,
    updated_at = now();

INSERT INTO exercise_library (name, category, movement_patterns, bilateral_unilateral, posterior_anterior, complexity, equipment, primary_muscle, supporting_muscles, muscle_bias, joint_count_level, dynamic_isometric, movement_plane, primary_joints, is_active)
  VALUES ('Incline Bench DB Curl (Dual; Neutral Grip)', 'strength', '{"vertical_pull"}'::text[], 'bilateral', 'anterior', 2, '{"bench","dumbbell"}'::text[], 'Biceps brachii', '{"Brachialis"}'::text[], 'lengthened', 'local', NULL, 'vertical', '{"Elbow"}'::text[], true)
  ON CONFLICT (name) DO UPDATE SET
    category = EXCLUDED.category,
    movement_patterns = EXCLUDED.movement_patterns,
    bilateral_unilateral = EXCLUDED.bilateral_unilateral,
    posterior_anterior = EXCLUDED.posterior_anterior,
    complexity = EXCLUDED.complexity,
    equipment = EXCLUDED.equipment,
    primary_muscle = EXCLUDED.primary_muscle,
    supporting_muscles = EXCLUDED.supporting_muscles,
    muscle_bias = EXCLUDED.muscle_bias,
    joint_count_level = EXCLUDED.joint_count_level,
    dynamic_isometric = EXCLUDED.dynamic_isometric,
    movement_plane = EXCLUDED.movement_plane,
    primary_joints = EXCLUDED.primary_joints,
    is_active = true,
    updated_at = now();

INSERT INTO exercise_library (name, category, movement_patterns, bilateral_unilateral, posterior_anterior, complexity, equipment, primary_muscle, supporting_muscles, muscle_bias, joint_count_level, dynamic_isometric, movement_plane, primary_joints, is_active)
  VALUES ('Incline Bench DB Curl (Dual; Neutral-to-Supinated)', 'strength', '{"vertical_pull"}'::text[], 'bilateral', 'anterior', 2, '{"bench","dumbbell"}'::text[], 'Biceps brachii', '{"Brachialis"}'::text[], 'lengthened', 'local', NULL, 'vertical', '{"Elbow"}'::text[], true)
  ON CONFLICT (name) DO UPDATE SET
    category = EXCLUDED.category,
    movement_patterns = EXCLUDED.movement_patterns,
    bilateral_unilateral = EXCLUDED.bilateral_unilateral,
    posterior_anterior = EXCLUDED.posterior_anterior,
    complexity = EXCLUDED.complexity,
    equipment = EXCLUDED.equipment,
    primary_muscle = EXCLUDED.primary_muscle,
    supporting_muscles = EXCLUDED.supporting_muscles,
    muscle_bias = EXCLUDED.muscle_bias,
    joint_count_level = EXCLUDED.joint_count_level,
    dynamic_isometric = EXCLUDED.dynamic_isometric,
    movement_plane = EXCLUDED.movement_plane,
    primary_joints = EXCLUDED.primary_joints,
    is_active = true,
    updated_at = now();

INSERT INTO exercise_library (name, category, movement_patterns, bilateral_unilateral, posterior_anterior, complexity, equipment, primary_muscle, supporting_muscles, muscle_bias, joint_count_level, dynamic_isometric, movement_plane, primary_joints, is_active)
  VALUES ('Incline Bench Zottman Curl (Dual DB)', 'strength', '{"vertical_pull"}'::text[], 'bilateral', 'anterior', 2, '{"bench","dumbbell"}'::text[], 'Biceps brachii', '{"Forearm musculature"}'::text[], 'lengthened', 'local', NULL, 'vertical', '{"Elbow"}'::text[], true)
  ON CONFLICT (name) DO UPDATE SET
    category = EXCLUDED.category,
    movement_patterns = EXCLUDED.movement_patterns,
    bilateral_unilateral = EXCLUDED.bilateral_unilateral,
    posterior_anterior = EXCLUDED.posterior_anterior,
    complexity = EXCLUDED.complexity,
    equipment = EXCLUDED.equipment,
    primary_muscle = EXCLUDED.primary_muscle,
    supporting_muscles = EXCLUDED.supporting_muscles,
    muscle_bias = EXCLUDED.muscle_bias,
    joint_count_level = EXCLUDED.joint_count_level,
    dynamic_isometric = EXCLUDED.dynamic_isometric,
    movement_plane = EXCLUDED.movement_plane,
    primary_joints = EXCLUDED.primary_joints,
    is_active = true,
    updated_at = now();

INSERT INTO exercise_library (name, category, movement_patterns, bilateral_unilateral, posterior_anterior, complexity, equipment, primary_muscle, supporting_muscles, muscle_bias, joint_count_level, dynamic_isometric, movement_plane, primary_joints, is_active)
  VALUES ('Incline Bench Reverse Curl (Dual DB; Semi‑Pronated)', 'strength', '{"vertical_pull"}'::text[], 'bilateral', 'anterior', 2, '{"bench","dumbbell"}'::text[], 'Brachioradialis', '{"Brachialis"}'::text[], 'mid', 'local', NULL, 'vertical', '{"Elbow"}'::text[], true)
  ON CONFLICT (name) DO UPDATE SET
    category = EXCLUDED.category,
    movement_patterns = EXCLUDED.movement_patterns,
    bilateral_unilateral = EXCLUDED.bilateral_unilateral,
    posterior_anterior = EXCLUDED.posterior_anterior,
    complexity = EXCLUDED.complexity,
    equipment = EXCLUDED.equipment,
    primary_muscle = EXCLUDED.primary_muscle,
    supporting_muscles = EXCLUDED.supporting_muscles,
    muscle_bias = EXCLUDED.muscle_bias,
    joint_count_level = EXCLUDED.joint_count_level,
    dynamic_isometric = EXCLUDED.dynamic_isometric,
    movement_plane = EXCLUDED.movement_plane,
    primary_joints = EXCLUDED.primary_joints,
    is_active = true,
    updated_at = now();

INSERT INTO exercise_library (name, category, movement_patterns, bilateral_unilateral, posterior_anterior, complexity, equipment, primary_muscle, supporting_muscles, muscle_bias, joint_count_level, dynamic_isometric, movement_plane, primary_joints, is_active)
  VALUES ('DB Curl (Alternating; Neutral Grip)', 'strength', '{"vertical_pull"}'::text[], 'unilateral', 'anterior', 1, '{"dumbbell"}'::text[], 'Brachialis', '{"Biceps brachii","Brachioradialis"}'::text[], 'mid', 'local', NULL, 'vertical', '{"Elbow"}'::text[], true)
  ON CONFLICT (name) DO UPDATE SET
    category = EXCLUDED.category,
    movement_patterns = EXCLUDED.movement_patterns,
    bilateral_unilateral = EXCLUDED.bilateral_unilateral,
    posterior_anterior = EXCLUDED.posterior_anterior,
    complexity = EXCLUDED.complexity,
    equipment = EXCLUDED.equipment,
    primary_muscle = EXCLUDED.primary_muscle,
    supporting_muscles = EXCLUDED.supporting_muscles,
    muscle_bias = EXCLUDED.muscle_bias,
    joint_count_level = EXCLUDED.joint_count_level,
    dynamic_isometric = EXCLUDED.dynamic_isometric,
    movement_plane = EXCLUDED.movement_plane,
    primary_joints = EXCLUDED.primary_joints,
    is_active = true,
    updated_at = now();

INSERT INTO exercise_library (name, category, movement_patterns, bilateral_unilateral, posterior_anterior, complexity, equipment, primary_muscle, supporting_muscles, muscle_bias, joint_count_level, dynamic_isometric, movement_plane, primary_joints, is_active)
  VALUES ('DB Curl (Alternating; Neutral-to-Supinated)', 'strength', '{"vertical_pull"}'::text[], 'unilateral', 'anterior', 1, '{"dumbbell"}'::text[], 'Biceps brachii', '{"Brachialis"}'::text[], 'mid', 'local', NULL, 'vertical', '{"Elbow"}'::text[], true)
  ON CONFLICT (name) DO UPDATE SET
    category = EXCLUDED.category,
    movement_patterns = EXCLUDED.movement_patterns,
    bilateral_unilateral = EXCLUDED.bilateral_unilateral,
    posterior_anterior = EXCLUDED.posterior_anterior,
    complexity = EXCLUDED.complexity,
    equipment = EXCLUDED.equipment,
    primary_muscle = EXCLUDED.primary_muscle,
    supporting_muscles = EXCLUDED.supporting_muscles,
    muscle_bias = EXCLUDED.muscle_bias,
    joint_count_level = EXCLUDED.joint_count_level,
    dynamic_isometric = EXCLUDED.dynamic_isometric,
    movement_plane = EXCLUDED.movement_plane,
    primary_joints = EXCLUDED.primary_joints,
    is_active = true,
    updated_at = now();

INSERT INTO exercise_library (name, category, movement_patterns, bilateral_unilateral, posterior_anterior, complexity, equipment, primary_muscle, supporting_muscles, muscle_bias, joint_count_level, dynamic_isometric, movement_plane, primary_joints, is_active)
  VALUES ('Zottman Curl (Alternating DB)', 'strength', '{"vertical_pull"}'::text[], 'unilateral', 'anterior', 2, '{"dumbbell"}'::text[], 'Biceps brachii', '{"Forearm musculature"}'::text[], 'mid', 'local', NULL, 'vertical', '{"Elbow"}'::text[], true)
  ON CONFLICT (name) DO UPDATE SET
    category = EXCLUDED.category,
    movement_patterns = EXCLUDED.movement_patterns,
    bilateral_unilateral = EXCLUDED.bilateral_unilateral,
    posterior_anterior = EXCLUDED.posterior_anterior,
    complexity = EXCLUDED.complexity,
    equipment = EXCLUDED.equipment,
    primary_muscle = EXCLUDED.primary_muscle,
    supporting_muscles = EXCLUDED.supporting_muscles,
    muscle_bias = EXCLUDED.muscle_bias,
    joint_count_level = EXCLUDED.joint_count_level,
    dynamic_isometric = EXCLUDED.dynamic_isometric,
    movement_plane = EXCLUDED.movement_plane,
    primary_joints = EXCLUDED.primary_joints,
    is_active = true,
    updated_at = now();

INSERT INTO exercise_library (name, category, movement_patterns, bilateral_unilateral, posterior_anterior, complexity, equipment, primary_muscle, supporting_muscles, muscle_bias, joint_count_level, dynamic_isometric, movement_plane, primary_joints, is_active)
  VALUES ('Reverse Curl (Alternating DB; Semi‑Pronated)', 'strength', '{"vertical_pull"}'::text[], 'unilateral', 'anterior', 1, '{"dumbbell"}'::text[], 'Brachioradialis', '{"Brachialis"}'::text[], 'mid', 'local', NULL, 'vertical', '{"Elbow"}'::text[], true)
  ON CONFLICT (name) DO UPDATE SET
    category = EXCLUDED.category,
    movement_patterns = EXCLUDED.movement_patterns,
    bilateral_unilateral = EXCLUDED.bilateral_unilateral,
    posterior_anterior = EXCLUDED.posterior_anterior,
    complexity = EXCLUDED.complexity,
    equipment = EXCLUDED.equipment,
    primary_muscle = EXCLUDED.primary_muscle,
    supporting_muscles = EXCLUDED.supporting_muscles,
    muscle_bias = EXCLUDED.muscle_bias,
    joint_count_level = EXCLUDED.joint_count_level,
    dynamic_isometric = EXCLUDED.dynamic_isometric,
    movement_plane = EXCLUDED.movement_plane,
    primary_joints = EXCLUDED.primary_joints,
    is_active = true,
    updated_at = now();

INSERT INTO exercise_library (name, category, movement_patterns, bilateral_unilateral, posterior_anterior, complexity, equipment, primary_muscle, supporting_muscles, muscle_bias, joint_count_level, dynamic_isometric, movement_plane, primary_joints, is_active)
  VALUES ('Incline Bench DB Curl (Alternating; Neutral Grip)', 'strength', '{"vertical_pull"}'::text[], 'unilateral', 'anterior', 2, '{"bench","dumbbell"}'::text[], 'Biceps brachii', '{"Brachialis"}'::text[], 'lengthened', 'local', NULL, 'vertical', '{"Elbow"}'::text[], true)
  ON CONFLICT (name) DO UPDATE SET
    category = EXCLUDED.category,
    movement_patterns = EXCLUDED.movement_patterns,
    bilateral_unilateral = EXCLUDED.bilateral_unilateral,
    posterior_anterior = EXCLUDED.posterior_anterior,
    complexity = EXCLUDED.complexity,
    equipment = EXCLUDED.equipment,
    primary_muscle = EXCLUDED.primary_muscle,
    supporting_muscles = EXCLUDED.supporting_muscles,
    muscle_bias = EXCLUDED.muscle_bias,
    joint_count_level = EXCLUDED.joint_count_level,
    dynamic_isometric = EXCLUDED.dynamic_isometric,
    movement_plane = EXCLUDED.movement_plane,
    primary_joints = EXCLUDED.primary_joints,
    is_active = true,
    updated_at = now();

INSERT INTO exercise_library (name, category, movement_patterns, bilateral_unilateral, posterior_anterior, complexity, equipment, primary_muscle, supporting_muscles, muscle_bias, joint_count_level, dynamic_isometric, movement_plane, primary_joints, is_active)
  VALUES ('Incline Bench DB Curl (Alternating; Neutral-to-Supinated)', 'strength', '{"vertical_pull"}'::text[], 'unilateral', 'anterior', 2, '{"bench","dumbbell"}'::text[], 'Biceps brachii', '{"Brachialis"}'::text[], 'lengthened', 'local', NULL, 'vertical', '{"Elbow"}'::text[], true)
  ON CONFLICT (name) DO UPDATE SET
    category = EXCLUDED.category,
    movement_patterns = EXCLUDED.movement_patterns,
    bilateral_unilateral = EXCLUDED.bilateral_unilateral,
    posterior_anterior = EXCLUDED.posterior_anterior,
    complexity = EXCLUDED.complexity,
    equipment = EXCLUDED.equipment,
    primary_muscle = EXCLUDED.primary_muscle,
    supporting_muscles = EXCLUDED.supporting_muscles,
    muscle_bias = EXCLUDED.muscle_bias,
    joint_count_level = EXCLUDED.joint_count_level,
    dynamic_isometric = EXCLUDED.dynamic_isometric,
    movement_plane = EXCLUDED.movement_plane,
    primary_joints = EXCLUDED.primary_joints,
    is_active = true,
    updated_at = now();

INSERT INTO exercise_library (name, category, movement_patterns, bilateral_unilateral, posterior_anterior, complexity, equipment, primary_muscle, supporting_muscles, muscle_bias, joint_count_level, dynamic_isometric, movement_plane, primary_joints, is_active)
  VALUES ('Incline Bench Zottman Curl (Alternating DB)', 'strength', '{"vertical_pull"}'::text[], 'unilateral', 'anterior', 2, '{"bench","dumbbell"}'::text[], 'Biceps brachii', '{"Forearm musculature"}'::text[], 'lengthened', 'local', NULL, 'vertical', '{"Elbow"}'::text[], true)
  ON CONFLICT (name) DO UPDATE SET
    category = EXCLUDED.category,
    movement_patterns = EXCLUDED.movement_patterns,
    bilateral_unilateral = EXCLUDED.bilateral_unilateral,
    posterior_anterior = EXCLUDED.posterior_anterior,
    complexity = EXCLUDED.complexity,
    equipment = EXCLUDED.equipment,
    primary_muscle = EXCLUDED.primary_muscle,
    supporting_muscles = EXCLUDED.supporting_muscles,
    muscle_bias = EXCLUDED.muscle_bias,
    joint_count_level = EXCLUDED.joint_count_level,
    dynamic_isometric = EXCLUDED.dynamic_isometric,
    movement_plane = EXCLUDED.movement_plane,
    primary_joints = EXCLUDED.primary_joints,
    is_active = true,
    updated_at = now();

INSERT INTO exercise_library (name, category, movement_patterns, bilateral_unilateral, posterior_anterior, complexity, equipment, primary_muscle, supporting_muscles, muscle_bias, joint_count_level, dynamic_isometric, movement_plane, primary_joints, is_active)
  VALUES ('Incline Bench Reverse Curl (Alternating DB; Semi‑Pronated)', 'strength', '{"vertical_pull"}'::text[], 'unilateral', 'anterior', 2, '{"bench","dumbbell"}'::text[], 'Brachioradialis', '{"Brachialis"}'::text[], 'mid', 'local', NULL, 'vertical', '{"Elbow"}'::text[], true)
  ON CONFLICT (name) DO UPDATE SET
    category = EXCLUDED.category,
    movement_patterns = EXCLUDED.movement_patterns,
    bilateral_unilateral = EXCLUDED.bilateral_unilateral,
    posterior_anterior = EXCLUDED.posterior_anterior,
    complexity = EXCLUDED.complexity,
    equipment = EXCLUDED.equipment,
    primary_muscle = EXCLUDED.primary_muscle,
    supporting_muscles = EXCLUDED.supporting_muscles,
    muscle_bias = EXCLUDED.muscle_bias,
    joint_count_level = EXCLUDED.joint_count_level,
    dynamic_isometric = EXCLUDED.dynamic_isometric,
    movement_plane = EXCLUDED.movement_plane,
    primary_joints = EXCLUDED.primary_joints,
    is_active = true,
    updated_at = now();

INSERT INTO exercise_library (name, category, movement_patterns, bilateral_unilateral, posterior_anterior, complexity, equipment, primary_muscle, supporting_muscles, muscle_bias, joint_count_level, dynamic_isometric, movement_plane, primary_joints, is_active)
  VALUES ('Cable Curl (Straight Bar)', 'strength', '{"vertical_pull"}'::text[], 'bilateral', 'anterior', 1, '{"cable"}'::text[], 'Biceps brachii', '{"Brachialis"}'::text[], 'mid', 'local', NULL, 'vertical', '{"Elbow"}'::text[], true)
  ON CONFLICT (name) DO UPDATE SET
    category = EXCLUDED.category,
    movement_patterns = EXCLUDED.movement_patterns,
    bilateral_unilateral = EXCLUDED.bilateral_unilateral,
    posterior_anterior = EXCLUDED.posterior_anterior,
    complexity = EXCLUDED.complexity,
    equipment = EXCLUDED.equipment,
    primary_muscle = EXCLUDED.primary_muscle,
    supporting_muscles = EXCLUDED.supporting_muscles,
    muscle_bias = EXCLUDED.muscle_bias,
    joint_count_level = EXCLUDED.joint_count_level,
    dynamic_isometric = EXCLUDED.dynamic_isometric,
    movement_plane = EXCLUDED.movement_plane,
    primary_joints = EXCLUDED.primary_joints,
    is_active = true,
    updated_at = now();

INSERT INTO exercise_library (name, category, movement_patterns, bilateral_unilateral, posterior_anterior, complexity, equipment, primary_muscle, supporting_muscles, muscle_bias, joint_count_level, dynamic_isometric, movement_plane, primary_joints, is_active)
  VALUES ('Cable Hammer Curl (Rope Attachment)', 'strength', '{"vertical_pull"}'::text[], 'bilateral', 'anterior', 1, '{"cable"}'::text[], 'Brachialis', '{"Brachioradialis","Biceps brachii"}'::text[], 'mid', 'local', NULL, 'vertical', '{"Elbow"}'::text[], true)
  ON CONFLICT (name) DO UPDATE SET
    category = EXCLUDED.category,
    movement_patterns = EXCLUDED.movement_patterns,
    bilateral_unilateral = EXCLUDED.bilateral_unilateral,
    posterior_anterior = EXCLUDED.posterior_anterior,
    complexity = EXCLUDED.complexity,
    equipment = EXCLUDED.equipment,
    primary_muscle = EXCLUDED.primary_muscle,
    supporting_muscles = EXCLUDED.supporting_muscles,
    muscle_bias = EXCLUDED.muscle_bias,
    joint_count_level = EXCLUDED.joint_count_level,
    dynamic_isometric = EXCLUDED.dynamic_isometric,
    movement_plane = EXCLUDED.movement_plane,
    primary_joints = EXCLUDED.primary_joints,
    is_active = true,
    updated_at = now();

INSERT INTO exercise_library (name, category, movement_patterns, bilateral_unilateral, posterior_anterior, complexity, equipment, primary_muscle, supporting_muscles, muscle_bias, joint_count_level, dynamic_isometric, movement_plane, primary_joints, is_active)
  VALUES ('Cable Curl (Dual Cable; Supinated; Facing Out)', 'strength', '{"vertical_pull"}'::text[], 'bilateral', 'anterior', 2, '{"cable"}'::text[], 'Biceps brachii', '{"Brachialis"}'::text[], 'lengthened', 'local', NULL, 'vertical', '{"Elbow"}'::text[], true)
  ON CONFLICT (name) DO UPDATE SET
    category = EXCLUDED.category,
    movement_patterns = EXCLUDED.movement_patterns,
    bilateral_unilateral = EXCLUDED.bilateral_unilateral,
    posterior_anterior = EXCLUDED.posterior_anterior,
    complexity = EXCLUDED.complexity,
    equipment = EXCLUDED.equipment,
    primary_muscle = EXCLUDED.primary_muscle,
    supporting_muscles = EXCLUDED.supporting_muscles,
    muscle_bias = EXCLUDED.muscle_bias,
    joint_count_level = EXCLUDED.joint_count_level,
    dynamic_isometric = EXCLUDED.dynamic_isometric,
    movement_plane = EXCLUDED.movement_plane,
    primary_joints = EXCLUDED.primary_joints,
    is_active = true,
    updated_at = now();

INSERT INTO exercise_library (name, category, movement_patterns, bilateral_unilateral, posterior_anterior, complexity, equipment, primary_muscle, supporting_muscles, muscle_bias, joint_count_level, dynamic_isometric, movement_plane, primary_joints, is_active)
  VALUES ('Barbell Curl', 'strength', '{"vertical_pull"}'::text[], 'bilateral', 'anterior', 2, '{"barbell"}'::text[], 'Biceps brachii', '{"Brachialis"}'::text[], 'mid', 'local', NULL, 'vertical', '{"Elbow"}'::text[], true)
  ON CONFLICT (name) DO UPDATE SET
    category = EXCLUDED.category,
    movement_patterns = EXCLUDED.movement_patterns,
    bilateral_unilateral = EXCLUDED.bilateral_unilateral,
    posterior_anterior = EXCLUDED.posterior_anterior,
    complexity = EXCLUDED.complexity,
    equipment = EXCLUDED.equipment,
    primary_muscle = EXCLUDED.primary_muscle,
    supporting_muscles = EXCLUDED.supporting_muscles,
    muscle_bias = EXCLUDED.muscle_bias,
    joint_count_level = EXCLUDED.joint_count_level,
    dynamic_isometric = EXCLUDED.dynamic_isometric,
    movement_plane = EXCLUDED.movement_plane,
    primary_joints = EXCLUDED.primary_joints,
    is_active = true,
    updated_at = now();

INSERT INTO exercise_library (name, category, movement_patterns, bilateral_unilateral, posterior_anterior, complexity, equipment, primary_muscle, supporting_muscles, muscle_bias, joint_count_level, dynamic_isometric, movement_plane, primary_joints, is_active)
  VALUES ('EZ-Bar Curl', 'strength', '{"vertical_pull"}'::text[], 'bilateral', 'anterior', 2, '{}'::text[], 'Biceps brachii', '{"Brachialis"}'::text[], 'mid', 'local', NULL, 'vertical', '{"Elbow"}'::text[], true)
  ON CONFLICT (name) DO UPDATE SET
    category = EXCLUDED.category,
    movement_patterns = EXCLUDED.movement_patterns,
    bilateral_unilateral = EXCLUDED.bilateral_unilateral,
    posterior_anterior = EXCLUDED.posterior_anterior,
    complexity = EXCLUDED.complexity,
    equipment = EXCLUDED.equipment,
    primary_muscle = EXCLUDED.primary_muscle,
    supporting_muscles = EXCLUDED.supporting_muscles,
    muscle_bias = EXCLUDED.muscle_bias,
    joint_count_level = EXCLUDED.joint_count_level,
    dynamic_isometric = EXCLUDED.dynamic_isometric,
    movement_plane = EXCLUDED.movement_plane,
    primary_joints = EXCLUDED.primary_joints,
    is_active = true,
    updated_at = now();

INSERT INTO exercise_library (name, category, movement_patterns, bilateral_unilateral, posterior_anterior, complexity, equipment, primary_muscle, supporting_muscles, muscle_bias, joint_count_level, dynamic_isometric, movement_plane, primary_joints, is_active)
  VALUES ('Preacher Curl (Machine or EZ-Bar)', 'strength', '{"vertical_pull"}'::text[], 'bilateral', 'anterior', 1, '{"fixed_machine"}'::text[], 'Biceps brachii', '{"Brachialis"}'::text[], 'shortened', 'local', NULL, 'vertical', '{"Elbow"}'::text[], true)
  ON CONFLICT (name) DO UPDATE SET
    category = EXCLUDED.category,
    movement_patterns = EXCLUDED.movement_patterns,
    bilateral_unilateral = EXCLUDED.bilateral_unilateral,
    posterior_anterior = EXCLUDED.posterior_anterior,
    complexity = EXCLUDED.complexity,
    equipment = EXCLUDED.equipment,
    primary_muscle = EXCLUDED.primary_muscle,
    supporting_muscles = EXCLUDED.supporting_muscles,
    muscle_bias = EXCLUDED.muscle_bias,
    joint_count_level = EXCLUDED.joint_count_level,
    dynamic_isometric = EXCLUDED.dynamic_isometric,
    movement_plane = EXCLUDED.movement_plane,
    primary_joints = EXCLUDED.primary_joints,
    is_active = true,
    updated_at = now();

INSERT INTO exercise_library (name, category, movement_patterns, bilateral_unilateral, posterior_anterior, complexity, equipment, primary_muscle, supporting_muscles, muscle_bias, joint_count_level, dynamic_isometric, movement_plane, primary_joints, is_active)
  VALUES ('DB Concentration Curl (Seated)', 'strength', '{"vertical_pull"}'::text[], 'unilateral', 'anterior', 1, '{"dumbbell"}'::text[], 'Biceps brachii', '{"Brachialis"}'::text[], 'shortened', 'local', NULL, 'vertical', '{"Elbow"}'::text[], true)
  ON CONFLICT (name) DO UPDATE SET
    category = EXCLUDED.category,
    movement_patterns = EXCLUDED.movement_patterns,
    bilateral_unilateral = EXCLUDED.bilateral_unilateral,
    posterior_anterior = EXCLUDED.posterior_anterior,
    complexity = EXCLUDED.complexity,
    equipment = EXCLUDED.equipment,
    primary_muscle = EXCLUDED.primary_muscle,
    supporting_muscles = EXCLUDED.supporting_muscles,
    muscle_bias = EXCLUDED.muscle_bias,
    joint_count_level = EXCLUDED.joint_count_level,
    dynamic_isometric = EXCLUDED.dynamic_isometric,
    movement_plane = EXCLUDED.movement_plane,
    primary_joints = EXCLUDED.primary_joints,
    is_active = true,
    updated_at = now();

INSERT INTO exercise_library (name, category, movement_patterns, bilateral_unilateral, posterior_anterior, complexity, equipment, primary_muscle, supporting_muscles, muscle_bias, joint_count_level, dynamic_isometric, movement_plane, primary_joints, is_active)
  VALUES ('Suspension Trainer Curl (Supinated)', 'strength', '{"vertical_pull"}'::text[], 'bilateral', 'anterior', 2, '{"suspension_trainer"}'::text[], 'Biceps brachii', '{"Brachialis","Core stabilizer"}'::text[], 'mid', 'local', NULL, 'vertical', '{"Elbow"}'::text[], true)
  ON CONFLICT (name) DO UPDATE SET
    category = EXCLUDED.category,
    movement_patterns = EXCLUDED.movement_patterns,
    bilateral_unilateral = EXCLUDED.bilateral_unilateral,
    posterior_anterior = EXCLUDED.posterior_anterior,
    complexity = EXCLUDED.complexity,
    equipment = EXCLUDED.equipment,
    primary_muscle = EXCLUDED.primary_muscle,
    supporting_muscles = EXCLUDED.supporting_muscles,
    muscle_bias = EXCLUDED.muscle_bias,
    joint_count_level = EXCLUDED.joint_count_level,
    dynamic_isometric = EXCLUDED.dynamic_isometric,
    movement_plane = EXCLUDED.movement_plane,
    primary_joints = EXCLUDED.primary_joints,
    is_active = true,
    updated_at = now();

INSERT INTO exercise_library (name, category, movement_patterns, bilateral_unilateral, posterior_anterior, complexity, equipment, primary_muscle, supporting_muscles, muscle_bias, joint_count_level, dynamic_isometric, movement_plane, primary_joints, is_active)
  VALUES ('Incline Bench DB Triceps Extension (Dual)', 'strength', '{"vertical_push"}'::text[], 'bilateral', 'anterior', 2, '{"bench","dumbbell"}'::text[], 'Triceps brachii (long head)', '{"Anconeus"}'::text[], 'lengthened', 'local', NULL, 'vertical', '{"Elbow"}'::text[], true)
  ON CONFLICT (name) DO UPDATE SET
    category = EXCLUDED.category,
    movement_patterns = EXCLUDED.movement_patterns,
    bilateral_unilateral = EXCLUDED.bilateral_unilateral,
    posterior_anterior = EXCLUDED.posterior_anterior,
    complexity = EXCLUDED.complexity,
    equipment = EXCLUDED.equipment,
    primary_muscle = EXCLUDED.primary_muscle,
    supporting_muscles = EXCLUDED.supporting_muscles,
    muscle_bias = EXCLUDED.muscle_bias,
    joint_count_level = EXCLUDED.joint_count_level,
    dynamic_isometric = EXCLUDED.dynamic_isometric,
    movement_plane = EXCLUDED.movement_plane,
    primary_joints = EXCLUDED.primary_joints,
    is_active = true,
    updated_at = now();

INSERT INTO exercise_library (name, category, movement_patterns, bilateral_unilateral, posterior_anterior, complexity, equipment, primary_muscle, supporting_muscles, muscle_bias, joint_count_level, dynamic_isometric, movement_plane, primary_joints, is_active)
  VALUES ('Seated DB French Press', 'strength', '{"vertical_push"}'::text[], 'bilateral', 'anterior', 2, '{"dumbbell"}'::text[], 'Triceps brachii (long head)', '{"Anconeus"}'::text[], 'lengthened', 'local', NULL, 'vertical', '{"Elbow"}'::text[], true)
  ON CONFLICT (name) DO UPDATE SET
    category = EXCLUDED.category,
    movement_patterns = EXCLUDED.movement_patterns,
    bilateral_unilateral = EXCLUDED.bilateral_unilateral,
    posterior_anterior = EXCLUDED.posterior_anterior,
    complexity = EXCLUDED.complexity,
    equipment = EXCLUDED.equipment,
    primary_muscle = EXCLUDED.primary_muscle,
    supporting_muscles = EXCLUDED.supporting_muscles,
    muscle_bias = EXCLUDED.muscle_bias,
    joint_count_level = EXCLUDED.joint_count_level,
    dynamic_isometric = EXCLUDED.dynamic_isometric,
    movement_plane = EXCLUDED.movement_plane,
    primary_joints = EXCLUDED.primary_joints,
    is_active = true,
    updated_at = now();

INSERT INTO exercise_library (name, category, movement_patterns, bilateral_unilateral, posterior_anterior, complexity, equipment, primary_muscle, supporting_muscles, muscle_bias, joint_count_level, dynamic_isometric, movement_plane, primary_joints, is_active)
  VALUES ('Cable Triceps Extension (Dual Cable Crossover)', 'strength', '{"horizontal_push"}'::text[], 'bilateral', 'anterior', 2, '{"cable"}'::text[], 'Triceps brachii', '{"Anconeus"}'::text[], 'mid', 'local', NULL, 'horizontal', '{"Elbow"}'::text[], true)
  ON CONFLICT (name) DO UPDATE SET
    category = EXCLUDED.category,
    movement_patterns = EXCLUDED.movement_patterns,
    bilateral_unilateral = EXCLUDED.bilateral_unilateral,
    posterior_anterior = EXCLUDED.posterior_anterior,
    complexity = EXCLUDED.complexity,
    equipment = EXCLUDED.equipment,
    primary_muscle = EXCLUDED.primary_muscle,
    supporting_muscles = EXCLUDED.supporting_muscles,
    muscle_bias = EXCLUDED.muscle_bias,
    joint_count_level = EXCLUDED.joint_count_level,
    dynamic_isometric = EXCLUDED.dynamic_isometric,
    movement_plane = EXCLUDED.movement_plane,
    primary_joints = EXCLUDED.primary_joints,
    is_active = true,
    updated_at = now();

INSERT INTO exercise_library (name, category, movement_patterns, bilateral_unilateral, posterior_anterior, complexity, equipment, primary_muscle, supporting_muscles, muscle_bias, joint_count_level, dynamic_isometric, movement_plane, primary_joints, is_active)
  VALUES ('Triceps Pressdown (Cable; Rope Attachment)', 'strength', '{"vertical_push"}'::text[], 'bilateral', 'anterior', 1, '{"cable"}'::text[], 'Triceps brachii', '{"Anconeus"}'::text[], 'shortened', 'local', NULL, 'vertical', '{"Elbow"}'::text[], true)
  ON CONFLICT (name) DO UPDATE SET
    category = EXCLUDED.category,
    movement_patterns = EXCLUDED.movement_patterns,
    bilateral_unilateral = EXCLUDED.bilateral_unilateral,
    posterior_anterior = EXCLUDED.posterior_anterior,
    complexity = EXCLUDED.complexity,
    equipment = EXCLUDED.equipment,
    primary_muscle = EXCLUDED.primary_muscle,
    supporting_muscles = EXCLUDED.supporting_muscles,
    muscle_bias = EXCLUDED.muscle_bias,
    joint_count_level = EXCLUDED.joint_count_level,
    dynamic_isometric = EXCLUDED.dynamic_isometric,
    movement_plane = EXCLUDED.movement_plane,
    primary_joints = EXCLUDED.primary_joints,
    is_active = true,
    updated_at = now();

INSERT INTO exercise_library (name, category, movement_patterns, bilateral_unilateral, posterior_anterior, complexity, equipment, primary_muscle, supporting_muscles, muscle_bias, joint_count_level, dynamic_isometric, movement_plane, primary_joints, is_active)
  VALUES ('Triceps Pressdown (Cable; Straight Bar)', 'strength', '{"vertical_push"}'::text[], 'bilateral', 'anterior', 1, '{"cable"}'::text[], 'Triceps brachii', '{"Anconeus"}'::text[], 'shortened', 'local', NULL, 'vertical', '{"Elbow"}'::text[], true)
  ON CONFLICT (name) DO UPDATE SET
    category = EXCLUDED.category,
    movement_patterns = EXCLUDED.movement_patterns,
    bilateral_unilateral = EXCLUDED.bilateral_unilateral,
    posterior_anterior = EXCLUDED.posterior_anterior,
    complexity = EXCLUDED.complexity,
    equipment = EXCLUDED.equipment,
    primary_muscle = EXCLUDED.primary_muscle,
    supporting_muscles = EXCLUDED.supporting_muscles,
    muscle_bias = EXCLUDED.muscle_bias,
    joint_count_level = EXCLUDED.joint_count_level,
    dynamic_isometric = EXCLUDED.dynamic_isometric,
    movement_plane = EXCLUDED.movement_plane,
    primary_joints = EXCLUDED.primary_joints,
    is_active = true,
    updated_at = now();

INSERT INTO exercise_library (name, category, movement_patterns, bilateral_unilateral, posterior_anterior, complexity, equipment, primary_muscle, supporting_muscles, muscle_bias, joint_count_level, dynamic_isometric, movement_plane, primary_joints, is_active)
  VALUES ('Overhead Triceps Extension (Cable; Rope Attachment)', 'strength', '{"vertical_push"}'::text[], 'bilateral', 'anterior', 2, '{"cable"}'::text[], 'Triceps brachii (long head)', '{"Anconeus"}'::text[], 'lengthened', 'local', NULL, 'vertical', '{"Elbow"}'::text[], true)
  ON CONFLICT (name) DO UPDATE SET
    category = EXCLUDED.category,
    movement_patterns = EXCLUDED.movement_patterns,
    bilateral_unilateral = EXCLUDED.bilateral_unilateral,
    posterior_anterior = EXCLUDED.posterior_anterior,
    complexity = EXCLUDED.complexity,
    equipment = EXCLUDED.equipment,
    primary_muscle = EXCLUDED.primary_muscle,
    supporting_muscles = EXCLUDED.supporting_muscles,
    muscle_bias = EXCLUDED.muscle_bias,
    joint_count_level = EXCLUDED.joint_count_level,
    dynamic_isometric = EXCLUDED.dynamic_isometric,
    movement_plane = EXCLUDED.movement_plane,
    primary_joints = EXCLUDED.primary_joints,
    is_active = true,
    updated_at = now();

INSERT INTO exercise_library (name, category, movement_patterns, bilateral_unilateral, posterior_anterior, complexity, equipment, primary_muscle, supporting_muscles, muscle_bias, joint_count_level, dynamic_isometric, movement_plane, primary_joints, is_active)
  VALUES ('Overhead Triceps Extension (Single-Arm Cable)', 'strength', '{"vertical_push"}'::text[], 'unilateral', 'anterior', 2, '{"cable"}'::text[], 'Triceps brachii (long head)', '{"Anconeus"}'::text[], 'lengthened', 'local', NULL, 'vertical', '{"Elbow"}'::text[], true)
  ON CONFLICT (name) DO UPDATE SET
    category = EXCLUDED.category,
    movement_patterns = EXCLUDED.movement_patterns,
    bilateral_unilateral = EXCLUDED.bilateral_unilateral,
    posterior_anterior = EXCLUDED.posterior_anterior,
    complexity = EXCLUDED.complexity,
    equipment = EXCLUDED.equipment,
    primary_muscle = EXCLUDED.primary_muscle,
    supporting_muscles = EXCLUDED.supporting_muscles,
    muscle_bias = EXCLUDED.muscle_bias,
    joint_count_level = EXCLUDED.joint_count_level,
    dynamic_isometric = EXCLUDED.dynamic_isometric,
    movement_plane = EXCLUDED.movement_plane,
    primary_joints = EXCLUDED.primary_joints,
    is_active = true,
    updated_at = now();

INSERT INTO exercise_library (name, category, movement_patterns, bilateral_unilateral, posterior_anterior, complexity, equipment, primary_muscle, supporting_muscles, muscle_bias, joint_count_level, dynamic_isometric, movement_plane, primary_joints, is_active)
  VALUES ('Seated DB Overhead Triceps Extension', 'strength', '{"vertical_push"}'::text[], 'bilateral', 'anterior', 2, '{"dumbbell"}'::text[], 'Triceps brachii (long head)', '{"Anconeus"}'::text[], 'lengthened', 'local', NULL, 'vertical', '{"Elbow"}'::text[], true)
  ON CONFLICT (name) DO UPDATE SET
    category = EXCLUDED.category,
    movement_patterns = EXCLUDED.movement_patterns,
    bilateral_unilateral = EXCLUDED.bilateral_unilateral,
    posterior_anterior = EXCLUDED.posterior_anterior,
    complexity = EXCLUDED.complexity,
    equipment = EXCLUDED.equipment,
    primary_muscle = EXCLUDED.primary_muscle,
    supporting_muscles = EXCLUDED.supporting_muscles,
    muscle_bias = EXCLUDED.muscle_bias,
    joint_count_level = EXCLUDED.joint_count_level,
    dynamic_isometric = EXCLUDED.dynamic_isometric,
    movement_plane = EXCLUDED.movement_plane,
    primary_joints = EXCLUDED.primary_joints,
    is_active = true,
    updated_at = now();

INSERT INTO exercise_library (name, category, movement_patterns, bilateral_unilateral, posterior_anterior, complexity, equipment, primary_muscle, supporting_muscles, muscle_bias, joint_count_level, dynamic_isometric, movement_plane, primary_joints, is_active)
  VALUES ('DB Skull Crusher (Lying Triceps Extension)', 'strength', '{"horizontal_push"}'::text[], 'bilateral', 'anterior', 2, '{"bench","dumbbell"}'::text[], 'Triceps brachii', '{"Anconeus"}'::text[], 'lengthened', 'local', NULL, 'horizontal', '{"Elbow"}'::text[], true)
  ON CONFLICT (name) DO UPDATE SET
    category = EXCLUDED.category,
    movement_patterns = EXCLUDED.movement_patterns,
    bilateral_unilateral = EXCLUDED.bilateral_unilateral,
    posterior_anterior = EXCLUDED.posterior_anterior,
    complexity = EXCLUDED.complexity,
    equipment = EXCLUDED.equipment,
    primary_muscle = EXCLUDED.primary_muscle,
    supporting_muscles = EXCLUDED.supporting_muscles,
    muscle_bias = EXCLUDED.muscle_bias,
    joint_count_level = EXCLUDED.joint_count_level,
    dynamic_isometric = EXCLUDED.dynamic_isometric,
    movement_plane = EXCLUDED.movement_plane,
    primary_joints = EXCLUDED.primary_joints,
    is_active = true,
    updated_at = now();

INSERT INTO exercise_library (name, category, movement_patterns, bilateral_unilateral, posterior_anterior, complexity, equipment, primary_muscle, supporting_muscles, muscle_bias, joint_count_level, dynamic_isometric, movement_plane, primary_joints, is_active)
  VALUES ('EZ-Bar Skull Crusher', 'strength', '{"horizontal_push"}'::text[], 'bilateral', 'anterior', 2, '{"bench"}'::text[], 'Triceps brachii', '{"Anconeus"}'::text[], 'lengthened', 'local', NULL, 'horizontal', '{"Elbow"}'::text[], true)
  ON CONFLICT (name) DO UPDATE SET
    category = EXCLUDED.category,
    movement_patterns = EXCLUDED.movement_patterns,
    bilateral_unilateral = EXCLUDED.bilateral_unilateral,
    posterior_anterior = EXCLUDED.posterior_anterior,
    complexity = EXCLUDED.complexity,
    equipment = EXCLUDED.equipment,
    primary_muscle = EXCLUDED.primary_muscle,
    supporting_muscles = EXCLUDED.supporting_muscles,
    muscle_bias = EXCLUDED.muscle_bias,
    joint_count_level = EXCLUDED.joint_count_level,
    dynamic_isometric = EXCLUDED.dynamic_isometric,
    movement_plane = EXCLUDED.movement_plane,
    primary_joints = EXCLUDED.primary_joints,
    is_active = true,
    updated_at = now();

INSERT INTO exercise_library (name, category, movement_patterns, bilateral_unilateral, posterior_anterior, complexity, equipment, primary_muscle, supporting_muscles, muscle_bias, joint_count_level, dynamic_isometric, movement_plane, primary_joints, is_active)
  VALUES ('Suspension Trainer Triceps Extension (Standing)', 'strength', '{"horizontal_push"}'::text[], 'bilateral', 'anterior', 2, '{"suspension_trainer"}'::text[], 'Triceps brachii', '{"Anterior deltoid","Core stabilizer"}'::text[], 'mid', 'regional', NULL, 'horizontal', '{"Elbow"}'::text[], true)
  ON CONFLICT (name) DO UPDATE SET
    category = EXCLUDED.category,
    movement_patterns = EXCLUDED.movement_patterns,
    bilateral_unilateral = EXCLUDED.bilateral_unilateral,
    posterior_anterior = EXCLUDED.posterior_anterior,
    complexity = EXCLUDED.complexity,
    equipment = EXCLUDED.equipment,
    primary_muscle = EXCLUDED.primary_muscle,
    supporting_muscles = EXCLUDED.supporting_muscles,
    muscle_bias = EXCLUDED.muscle_bias,
    joint_count_level = EXCLUDED.joint_count_level,
    dynamic_isometric = EXCLUDED.dynamic_isometric,
    movement_plane = EXCLUDED.movement_plane,
    primary_joints = EXCLUDED.primary_joints,
    is_active = true,
    updated_at = now();

INSERT INTO exercise_library (name, category, movement_patterns, bilateral_unilateral, posterior_anterior, complexity, equipment, primary_muscle, supporting_muscles, muscle_bias, joint_count_level, dynamic_isometric, movement_plane, primary_joints, is_active)
  VALUES ('Incline Close-Grip Push-Up', 'strength', '{"horizontal_push"}'::text[], 'bilateral', 'anterior', 1, '{"bench","bodyweight"}'::text[], 'Triceps brachii', '{"Pectoralis major","Anterior deltoid"}'::text[], 'mid', 'local', NULL, 'horizontal', '{"Shoulder","Elbow"}'::text[], true)
  ON CONFLICT (name) DO UPDATE SET
    category = EXCLUDED.category,
    movement_patterns = EXCLUDED.movement_patterns,
    bilateral_unilateral = EXCLUDED.bilateral_unilateral,
    posterior_anterior = EXCLUDED.posterior_anterior,
    complexity = EXCLUDED.complexity,
    equipment = EXCLUDED.equipment,
    primary_muscle = EXCLUDED.primary_muscle,
    supporting_muscles = EXCLUDED.supporting_muscles,
    muscle_bias = EXCLUDED.muscle_bias,
    joint_count_level = EXCLUDED.joint_count_level,
    dynamic_isometric = EXCLUDED.dynamic_isometric,
    movement_plane = EXCLUDED.movement_plane,
    primary_joints = EXCLUDED.primary_joints,
    is_active = true,
    updated_at = now();

INSERT INTO exercise_library (name, category, movement_patterns, bilateral_unilateral, posterior_anterior, complexity, equipment, primary_muscle, supporting_muscles, muscle_bias, joint_count_level, dynamic_isometric, movement_plane, primary_joints, is_active)
  VALUES ('DB Wrist Curl (Seated)', 'strength', '{"vertical_pull"}'::text[], 'bilateral', 'anterior', 1, '{"dumbbell"}'::text[], 'Wrist flexor', '{"Forearm pronator"}'::text[], 'shortened', 'local', NULL, 'vertical', '{"Wrist"}'::text[], true)
  ON CONFLICT (name) DO UPDATE SET
    category = EXCLUDED.category,
    movement_patterns = EXCLUDED.movement_patterns,
    bilateral_unilateral = EXCLUDED.bilateral_unilateral,
    posterior_anterior = EXCLUDED.posterior_anterior,
    complexity = EXCLUDED.complexity,
    equipment = EXCLUDED.equipment,
    primary_muscle = EXCLUDED.primary_muscle,
    supporting_muscles = EXCLUDED.supporting_muscles,
    muscle_bias = EXCLUDED.muscle_bias,
    joint_count_level = EXCLUDED.joint_count_level,
    dynamic_isometric = EXCLUDED.dynamic_isometric,
    movement_plane = EXCLUDED.movement_plane,
    primary_joints = EXCLUDED.primary_joints,
    is_active = true,
    updated_at = now();

INSERT INTO exercise_library (name, category, movement_patterns, bilateral_unilateral, posterior_anterior, complexity, equipment, primary_muscle, supporting_muscles, muscle_bias, joint_count_level, dynamic_isometric, movement_plane, primary_joints, is_active)
  VALUES ('DB Reverse Wrist Curl (Seated)', 'strength', '{"vertical_pull"}'::text[], 'bilateral', 'posterior', 1, '{"dumbbell"}'::text[], 'Wrist extensor', '{"Brachioradialis"}'::text[], 'shortened', 'local', NULL, 'vertical', '{"Wrist"}'::text[], true)
  ON CONFLICT (name) DO UPDATE SET
    category = EXCLUDED.category,
    movement_patterns = EXCLUDED.movement_patterns,
    bilateral_unilateral = EXCLUDED.bilateral_unilateral,
    posterior_anterior = EXCLUDED.posterior_anterior,
    complexity = EXCLUDED.complexity,
    equipment = EXCLUDED.equipment,
    primary_muscle = EXCLUDED.primary_muscle,
    supporting_muscles = EXCLUDED.supporting_muscles,
    muscle_bias = EXCLUDED.muscle_bias,
    joint_count_level = EXCLUDED.joint_count_level,
    dynamic_isometric = EXCLUDED.dynamic_isometric,
    movement_plane = EXCLUDED.movement_plane,
    primary_joints = EXCLUDED.primary_joints,
    is_active = true,
    updated_at = now();

INSERT INTO exercise_library (name, category, movement_patterns, bilateral_unilateral, posterior_anterior, complexity, equipment, primary_muscle, supporting_muscles, muscle_bias, joint_count_level, dynamic_isometric, movement_plane, primary_joints, is_active)
  VALUES ('Cable Wrist Curl', 'strength', '{"vertical_pull"}'::text[], 'bilateral', 'anterior', 1, '{"cable"}'::text[], 'Wrist flexor', '{"Forearm pronator"}'::text[], 'shortened', 'local', NULL, 'vertical', '{"Wrist"}'::text[], true)
  ON CONFLICT (name) DO UPDATE SET
    category = EXCLUDED.category,
    movement_patterns = EXCLUDED.movement_patterns,
    bilateral_unilateral = EXCLUDED.bilateral_unilateral,
    posterior_anterior = EXCLUDED.posterior_anterior,
    complexity = EXCLUDED.complexity,
    equipment = EXCLUDED.equipment,
    primary_muscle = EXCLUDED.primary_muscle,
    supporting_muscles = EXCLUDED.supporting_muscles,
    muscle_bias = EXCLUDED.muscle_bias,
    joint_count_level = EXCLUDED.joint_count_level,
    dynamic_isometric = EXCLUDED.dynamic_isometric,
    movement_plane = EXCLUDED.movement_plane,
    primary_joints = EXCLUDED.primary_joints,
    is_active = true,
    updated_at = now();

INSERT INTO exercise_library (name, category, movement_patterns, bilateral_unilateral, posterior_anterior, complexity, equipment, primary_muscle, supporting_muscles, muscle_bias, joint_count_level, dynamic_isometric, movement_plane, primary_joints, is_active)
  VALUES ('Cable Reverse Wrist Curl', 'strength', '{"vertical_pull"}'::text[], 'bilateral', 'posterior', 1, '{"cable"}'::text[], 'Wrist extensor', '{"Brachioradialis"}'::text[], 'shortened', 'local', NULL, 'vertical', '{"Wrist"}'::text[], true)
  ON CONFLICT (name) DO UPDATE SET
    category = EXCLUDED.category,
    movement_patterns = EXCLUDED.movement_patterns,
    bilateral_unilateral = EXCLUDED.bilateral_unilateral,
    posterior_anterior = EXCLUDED.posterior_anterior,
    complexity = EXCLUDED.complexity,
    equipment = EXCLUDED.equipment,
    primary_muscle = EXCLUDED.primary_muscle,
    supporting_muscles = EXCLUDED.supporting_muscles,
    muscle_bias = EXCLUDED.muscle_bias,
    joint_count_level = EXCLUDED.joint_count_level,
    dynamic_isometric = EXCLUDED.dynamic_isometric,
    movement_plane = EXCLUDED.movement_plane,
    primary_joints = EXCLUDED.primary_joints,
    is_active = true,
    updated_at = now();

INSERT INTO exercise_library (name, category, movement_patterns, bilateral_unilateral, posterior_anterior, complexity, equipment, primary_muscle, supporting_muscles, muscle_bias, joint_count_level, dynamic_isometric, movement_plane, primary_joints, is_active)
  VALUES ('Forearm Pronation/Supination (DB or Hammer Handle)', 'strength', '{"horizontal_pull"}'::text[], 'unilateral', 'anterior', 1, '{"dumbbell"}'::text[], 'Biceps brachii (supination), Pronator teres (pronation)', '{"Brachioradialis"}'::text[], 'mid', 'local', NULL, 'horizontal', '{"Forearm (radioulnar)"}'::text[], true)
  ON CONFLICT (name) DO UPDATE SET
    category = EXCLUDED.category,
    movement_patterns = EXCLUDED.movement_patterns,
    bilateral_unilateral = EXCLUDED.bilateral_unilateral,
    posterior_anterior = EXCLUDED.posterior_anterior,
    complexity = EXCLUDED.complexity,
    equipment = EXCLUDED.equipment,
    primary_muscle = EXCLUDED.primary_muscle,
    supporting_muscles = EXCLUDED.supporting_muscles,
    muscle_bias = EXCLUDED.muscle_bias,
    joint_count_level = EXCLUDED.joint_count_level,
    dynamic_isometric = EXCLUDED.dynamic_isometric,
    movement_plane = EXCLUDED.movement_plane,
    primary_joints = EXCLUDED.primary_joints,
    is_active = true,
    updated_at = now();

INSERT INTO exercise_library (name, category, movement_patterns, bilateral_unilateral, posterior_anterior, complexity, equipment, primary_muscle, supporting_muscles, muscle_bias, joint_count_level, dynamic_isometric, movement_plane, primary_joints, is_active)
  VALUES ('Radial Deviation (DB)', 'strength', '{"vertical_pull"}'::text[], 'unilateral', 'posterior', 1, '{"dumbbell"}'::text[], 'Brachioradialis', '{"Extensor carpi radialis"}'::text[], 'lengthened', 'regional', NULL, 'vertical', '{"Wrist"}'::text[], true)
  ON CONFLICT (name) DO UPDATE SET
    category = EXCLUDED.category,
    movement_patterns = EXCLUDED.movement_patterns,
    bilateral_unilateral = EXCLUDED.bilateral_unilateral,
    posterior_anterior = EXCLUDED.posterior_anterior,
    complexity = EXCLUDED.complexity,
    equipment = EXCLUDED.equipment,
    primary_muscle = EXCLUDED.primary_muscle,
    supporting_muscles = EXCLUDED.supporting_muscles,
    muscle_bias = EXCLUDED.muscle_bias,
    joint_count_level = EXCLUDED.joint_count_level,
    dynamic_isometric = EXCLUDED.dynamic_isometric,
    movement_plane = EXCLUDED.movement_plane,
    primary_joints = EXCLUDED.primary_joints,
    is_active = true,
    updated_at = now();

INSERT INTO exercise_library (name, category, movement_patterns, bilateral_unilateral, posterior_anterior, complexity, equipment, primary_muscle, supporting_muscles, muscle_bias, joint_count_level, dynamic_isometric, movement_plane, primary_joints, is_active)
  VALUES ('Farmer Carry (DB)', 'strength', '{"vertical_pull"}'::text[], 'bilateral', 'posterior', 2, '{"dumbbell"}'::text[], 'Grip (forearm flexor)', '{"Upper trapezius","Core"}'::text[], 'mid', 'regional', NULL, 'vertical', '{"Grip/Wrist"}'::text[], true)
  ON CONFLICT (name) DO UPDATE SET
    category = EXCLUDED.category,
    movement_patterns = EXCLUDED.movement_patterns,
    bilateral_unilateral = EXCLUDED.bilateral_unilateral,
    posterior_anterior = EXCLUDED.posterior_anterior,
    complexity = EXCLUDED.complexity,
    equipment = EXCLUDED.equipment,
    primary_muscle = EXCLUDED.primary_muscle,
    supporting_muscles = EXCLUDED.supporting_muscles,
    muscle_bias = EXCLUDED.muscle_bias,
    joint_count_level = EXCLUDED.joint_count_level,
    dynamic_isometric = EXCLUDED.dynamic_isometric,
    movement_plane = EXCLUDED.movement_plane,
    primary_joints = EXCLUDED.primary_joints,
    is_active = true,
    updated_at = now();

INSERT INTO exercise_library (name, category, movement_patterns, bilateral_unilateral, posterior_anterior, complexity, equipment, primary_muscle, supporting_muscles, muscle_bias, joint_count_level, dynamic_isometric, movement_plane, primary_joints, is_active)
  VALUES ('Dead Hang', 'strength', '{"vertical_pull"}'::text[], 'bilateral', 'posterior', 2, '{"pull_up_bar"}'::text[], 'Grip (forearm flexor)', '{"Latissimus dorsi","Lower trapezius","Rotator cuff"}'::text[], 'lengthened', 'regional', NULL, 'vertical', '{"Shoulder","Grip"}'::text[], true)
  ON CONFLICT (name) DO UPDATE SET
    category = EXCLUDED.category,
    movement_patterns = EXCLUDED.movement_patterns,
    bilateral_unilateral = EXCLUDED.bilateral_unilateral,
    posterior_anterior = EXCLUDED.posterior_anterior,
    complexity = EXCLUDED.complexity,
    equipment = EXCLUDED.equipment,
    primary_muscle = EXCLUDED.primary_muscle,
    supporting_muscles = EXCLUDED.supporting_muscles,
    muscle_bias = EXCLUDED.muscle_bias,
    joint_count_level = EXCLUDED.joint_count_level,
    dynamic_isometric = EXCLUDED.dynamic_isometric,
    movement_plane = EXCLUDED.movement_plane,
    primary_joints = EXCLUDED.primary_joints,
    is_active = true,
    updated_at = now();

INSERT INTO exercise_library (name, category, movement_patterns, bilateral_unilateral, posterior_anterior, complexity, equipment, primary_muscle, supporting_muscles, muscle_bias, joint_count_level, dynamic_isometric, movement_plane, primary_joints, is_active)
  VALUES ('Superman Hold', 'accessory', '{"spinal_extension"}'::text[], 'bilateral', 'posterior', 1, '{"bodyweight"}'::text[], 'Erector spinae', '{"Glute max","posterior deltoid","mid/lower trapezius"}'::text[], 'shortened', 'regional', 'isometric', NULL, '{}'::text[], true)
  ON CONFLICT (name) DO UPDATE SET
    category = EXCLUDED.category,
    movement_patterns = EXCLUDED.movement_patterns,
    bilateral_unilateral = EXCLUDED.bilateral_unilateral,
    posterior_anterior = EXCLUDED.posterior_anterior,
    complexity = EXCLUDED.complexity,
    equipment = EXCLUDED.equipment,
    primary_muscle = EXCLUDED.primary_muscle,
    supporting_muscles = EXCLUDED.supporting_muscles,
    muscle_bias = EXCLUDED.muscle_bias,
    joint_count_level = EXCLUDED.joint_count_level,
    dynamic_isometric = EXCLUDED.dynamic_isometric,
    movement_plane = EXCLUDED.movement_plane,
    primary_joints = EXCLUDED.primary_joints,
    is_active = true,
    updated_at = now();

INSERT INTO exercise_library (name, category, movement_patterns, bilateral_unilateral, posterior_anterior, complexity, equipment, primary_muscle, supporting_muscles, muscle_bias, joint_count_level, dynamic_isometric, movement_plane, primary_joints, is_active)
  VALUES ('Superman', 'accessory', '{"spinal_extension"}'::text[], 'bilateral', 'posterior', 1, '{"bodyweight"}'::text[], 'Erector spinae', '{"Glute max","posterior deltoid","mid/lower trapezius"}'::text[], 'mid', 'regional', 'dynamic', NULL, '{}'::text[], true)
  ON CONFLICT (name) DO UPDATE SET
    category = EXCLUDED.category,
    movement_patterns = EXCLUDED.movement_patterns,
    bilateral_unilateral = EXCLUDED.bilateral_unilateral,
    posterior_anterior = EXCLUDED.posterior_anterior,
    complexity = EXCLUDED.complexity,
    equipment = EXCLUDED.equipment,
    primary_muscle = EXCLUDED.primary_muscle,
    supporting_muscles = EXCLUDED.supporting_muscles,
    muscle_bias = EXCLUDED.muscle_bias,
    joint_count_level = EXCLUDED.joint_count_level,
    dynamic_isometric = EXCLUDED.dynamic_isometric,
    movement_plane = EXCLUDED.movement_plane,
    primary_joints = EXCLUDED.primary_joints,
    is_active = true,
    updated_at = now();

INSERT INTO exercise_library (name, category, movement_patterns, bilateral_unilateral, posterior_anterior, complexity, equipment, primary_muscle, supporting_muscles, muscle_bias, joint_count_level, dynamic_isometric, movement_plane, primary_joints, is_active)
  VALUES ('Sorenson Hold (bench)', 'accessory', '{"spinal_extension"}'::text[], 'bilateral', 'posterior', 2, '{"bench"}'::text[], 'Erector spinae', '{"Glute max","hamstrings"}'::text[], 'mid', 'regional', 'isometric', NULL, '{}'::text[], true)
  ON CONFLICT (name) DO UPDATE SET
    category = EXCLUDED.category,
    movement_patterns = EXCLUDED.movement_patterns,
    bilateral_unilateral = EXCLUDED.bilateral_unilateral,
    posterior_anterior = EXCLUDED.posterior_anterior,
    complexity = EXCLUDED.complexity,
    equipment = EXCLUDED.equipment,
    primary_muscle = EXCLUDED.primary_muscle,
    supporting_muscles = EXCLUDED.supporting_muscles,
    muscle_bias = EXCLUDED.muscle_bias,
    joint_count_level = EXCLUDED.joint_count_level,
    dynamic_isometric = EXCLUDED.dynamic_isometric,
    movement_plane = EXCLUDED.movement_plane,
    primary_joints = EXCLUDED.primary_joints,
    is_active = true,
    updated_at = now();

INSERT INTO exercise_library (name, category, movement_patterns, bilateral_unilateral, posterior_anterior, complexity, equipment, primary_muscle, supporting_muscles, muscle_bias, joint_count_level, dynamic_isometric, movement_plane, primary_joints, is_active)
  VALUES ('Prone Cobra Hold (hands by sides)', 'accessory', '{"spinal_extension"}'::text[], 'bilateral', 'posterior', 1, '{"bodyweight"}'::text[], 'Mid/lower trapezius, rhomboids', '{"Erector spinae","posterior deltoid"}'::text[], 'mid', 'regional', 'isometric', NULL, '{}'::text[], true)
  ON CONFLICT (name) DO UPDATE SET
    category = EXCLUDED.category,
    movement_patterns = EXCLUDED.movement_patterns,
    bilateral_unilateral = EXCLUDED.bilateral_unilateral,
    posterior_anterior = EXCLUDED.posterior_anterior,
    complexity = EXCLUDED.complexity,
    equipment = EXCLUDED.equipment,
    primary_muscle = EXCLUDED.primary_muscle,
    supporting_muscles = EXCLUDED.supporting_muscles,
    muscle_bias = EXCLUDED.muscle_bias,
    joint_count_level = EXCLUDED.joint_count_level,
    dynamic_isometric = EXCLUDED.dynamic_isometric,
    movement_plane = EXCLUDED.movement_plane,
    primary_joints = EXCLUDED.primary_joints,
    is_active = true,
    updated_at = now();

INSERT INTO exercise_library (name, category, movement_patterns, bilateral_unilateral, posterior_anterior, complexity, equipment, primary_muscle, supporting_muscles, muscle_bias, joint_count_level, dynamic_isometric, movement_plane, primary_joints, is_active)
  VALUES ('Prone Cobra Reps (hands by sides)', 'accessory', '{"spinal_extension"}'::text[], 'bilateral', 'posterior', 1, '{"bodyweight"}'::text[], 'Mid/lower trapezius, rhomboids', '{"Erector spinae","posterior deltoid"}'::text[], 'mid', 'regional', 'dynamic', NULL, '{}'::text[], true)
  ON CONFLICT (name) DO UPDATE SET
    category = EXCLUDED.category,
    movement_patterns = EXCLUDED.movement_patterns,
    bilateral_unilateral = EXCLUDED.bilateral_unilateral,
    posterior_anterior = EXCLUDED.posterior_anterior,
    complexity = EXCLUDED.complexity,
    equipment = EXCLUDED.equipment,
    primary_muscle = EXCLUDED.primary_muscle,
    supporting_muscles = EXCLUDED.supporting_muscles,
    muscle_bias = EXCLUDED.muscle_bias,
    joint_count_level = EXCLUDED.joint_count_level,
    dynamic_isometric = EXCLUDED.dynamic_isometric,
    movement_plane = EXCLUDED.movement_plane,
    primary_joints = EXCLUDED.primary_joints,
    is_active = true,
    updated_at = now();

INSERT INTO exercise_library (name, category, movement_patterns, bilateral_unilateral, posterior_anterior, complexity, equipment, primary_muscle, supporting_muscles, muscle_bias, joint_count_level, dynamic_isometric, movement_plane, primary_joints, is_active)
  VALUES ('Glute Bridge Hold', 'accessory', '{"hip_extension"}'::text[], 'bilateral', 'posterior', 1, '{"bodyweight"}'::text[], 'Glute max', '{"Hamstrings","erector spinae"}'::text[], 'shortened', 'regional', 'isometric', NULL, '{}'::text[], true)
  ON CONFLICT (name) DO UPDATE SET
    category = EXCLUDED.category,
    movement_patterns = EXCLUDED.movement_patterns,
    bilateral_unilateral = EXCLUDED.bilateral_unilateral,
    posterior_anterior = EXCLUDED.posterior_anterior,
    complexity = EXCLUDED.complexity,
    equipment = EXCLUDED.equipment,
    primary_muscle = EXCLUDED.primary_muscle,
    supporting_muscles = EXCLUDED.supporting_muscles,
    muscle_bias = EXCLUDED.muscle_bias,
    joint_count_level = EXCLUDED.joint_count_level,
    dynamic_isometric = EXCLUDED.dynamic_isometric,
    movement_plane = EXCLUDED.movement_plane,
    primary_joints = EXCLUDED.primary_joints,
    is_active = true,
    updated_at = now();

INSERT INTO exercise_library (name, category, movement_patterns, bilateral_unilateral, posterior_anterior, complexity, equipment, primary_muscle, supporting_muscles, muscle_bias, joint_count_level, dynamic_isometric, movement_plane, primary_joints, is_active)
  VALUES ('Glute Bridge Reps', 'accessory', '{"hip_extension"}'::text[], 'bilateral', 'posterior', 1, '{"bodyweight"}'::text[], 'Glute max', '{"Hamstrings","erector spinae"}'::text[], 'mid', 'regional', 'dynamic', NULL, '{}'::text[], true)
  ON CONFLICT (name) DO UPDATE SET
    category = EXCLUDED.category,
    movement_patterns = EXCLUDED.movement_patterns,
    bilateral_unilateral = EXCLUDED.bilateral_unilateral,
    posterior_anterior = EXCLUDED.posterior_anterior,
    complexity = EXCLUDED.complexity,
    equipment = EXCLUDED.equipment,
    primary_muscle = EXCLUDED.primary_muscle,
    supporting_muscles = EXCLUDED.supporting_muscles,
    muscle_bias = EXCLUDED.muscle_bias,
    joint_count_level = EXCLUDED.joint_count_level,
    dynamic_isometric = EXCLUDED.dynamic_isometric,
    movement_plane = EXCLUDED.movement_plane,
    primary_joints = EXCLUDED.primary_joints,
    is_active = true,
    updated_at = now();

INSERT INTO exercise_library (name, category, movement_patterns, bilateral_unilateral, posterior_anterior, complexity, equipment, primary_muscle, supporting_muscles, muscle_bias, joint_count_level, dynamic_isometric, movement_plane, primary_joints, is_active)
  VALUES ('Sandbag Hold', 'accessory', '{"spinal_extension"}'::text[], 'bilateral', 'posterior', 2, '{"sandbag_dball"}'::text[], 'Spinal erectors', '{"Glute max","lats","traps"}'::text[], 'mid', 'regional', 'isometric', NULL, '{}'::text[], true)
  ON CONFLICT (name) DO UPDATE SET
    category = EXCLUDED.category,
    movement_patterns = EXCLUDED.movement_patterns,
    bilateral_unilateral = EXCLUDED.bilateral_unilateral,
    posterior_anterior = EXCLUDED.posterior_anterior,
    complexity = EXCLUDED.complexity,
    equipment = EXCLUDED.equipment,
    primary_muscle = EXCLUDED.primary_muscle,
    supporting_muscles = EXCLUDED.supporting_muscles,
    muscle_bias = EXCLUDED.muscle_bias,
    joint_count_level = EXCLUDED.joint_count_level,
    dynamic_isometric = EXCLUDED.dynamic_isometric,
    movement_plane = EXCLUDED.movement_plane,
    primary_joints = EXCLUDED.primary_joints,
    is_active = true,
    updated_at = now();

INSERT INTO exercise_library (name, category, movement_patterns, bilateral_unilateral, posterior_anterior, complexity, equipment, primary_muscle, supporting_muscles, muscle_bias, joint_count_level, dynamic_isometric, movement_plane, primary_joints, is_active)
  VALUES ('Sandbag Carry', 'accessory', '{"spinal_extension"}'::text[], 'bilateral', 'posterior', 2, '{"sandbag_dball"}'::text[], 'Spinal erectors', '{"Glute max","lats","traps"}'::text[], 'mid', 'regional', 'dynamic', NULL, '{}'::text[], true)
  ON CONFLICT (name) DO UPDATE SET
    category = EXCLUDED.category,
    movement_patterns = EXCLUDED.movement_patterns,
    bilateral_unilateral = EXCLUDED.bilateral_unilateral,
    posterior_anterior = EXCLUDED.posterior_anterior,
    complexity = EXCLUDED.complexity,
    equipment = EXCLUDED.equipment,
    primary_muscle = EXCLUDED.primary_muscle,
    supporting_muscles = EXCLUDED.supporting_muscles,
    muscle_bias = EXCLUDED.muscle_bias,
    joint_count_level = EXCLUDED.joint_count_level,
    dynamic_isometric = EXCLUDED.dynamic_isometric,
    movement_plane = EXCLUDED.movement_plane,
    primary_joints = EXCLUDED.primary_joints,
    is_active = true,
    updated_at = now();

INSERT INTO exercise_library (name, category, movement_patterns, bilateral_unilateral, posterior_anterior, complexity, equipment, primary_muscle, supporting_muscles, muscle_bias, joint_count_level, dynamic_isometric, movement_plane, primary_joints, is_active)
  VALUES ('D-ball Hold', 'accessory', '{"spinal_extension"}'::text[], 'bilateral', 'posterior', 2, '{"sandbag_dball"}'::text[], 'Spinal erectors', '{"Glute max","lats","traps"}'::text[], 'mid', 'regional', 'isometric', NULL, '{}'::text[], true)
  ON CONFLICT (name) DO UPDATE SET
    category = EXCLUDED.category,
    movement_patterns = EXCLUDED.movement_patterns,
    bilateral_unilateral = EXCLUDED.bilateral_unilateral,
    posterior_anterior = EXCLUDED.posterior_anterior,
    complexity = EXCLUDED.complexity,
    equipment = EXCLUDED.equipment,
    primary_muscle = EXCLUDED.primary_muscle,
    supporting_muscles = EXCLUDED.supporting_muscles,
    muscle_bias = EXCLUDED.muscle_bias,
    joint_count_level = EXCLUDED.joint_count_level,
    dynamic_isometric = EXCLUDED.dynamic_isometric,
    movement_plane = EXCLUDED.movement_plane,
    primary_joints = EXCLUDED.primary_joints,
    is_active = true,
    updated_at = now();

INSERT INTO exercise_library (name, category, movement_patterns, bilateral_unilateral, posterior_anterior, complexity, equipment, primary_muscle, supporting_muscles, muscle_bias, joint_count_level, dynamic_isometric, movement_plane, primary_joints, is_active)
  VALUES ('D-ball Carry', 'accessory', '{"spinal_extension"}'::text[], 'bilateral', 'posterior', 2, '{"sandbag_dball"}'::text[], 'Spinal erectors', '{"Glute max","lats","traps"}'::text[], 'mid', 'regional', 'dynamic', NULL, '{}'::text[], true)
  ON CONFLICT (name) DO UPDATE SET
    category = EXCLUDED.category,
    movement_patterns = EXCLUDED.movement_patterns,
    bilateral_unilateral = EXCLUDED.bilateral_unilateral,
    posterior_anterior = EXCLUDED.posterior_anterior,
    complexity = EXCLUDED.complexity,
    equipment = EXCLUDED.equipment,
    primary_muscle = EXCLUDED.primary_muscle,
    supporting_muscles = EXCLUDED.supporting_muscles,
    muscle_bias = EXCLUDED.muscle_bias,
    joint_count_level = EXCLUDED.joint_count_level,
    dynamic_isometric = EXCLUDED.dynamic_isometric,
    movement_plane = EXCLUDED.movement_plane,
    primary_joints = EXCLUDED.primary_joints,
    is_active = true,
    updated_at = now();

INSERT INTO exercise_library (name, category, movement_patterns, bilateral_unilateral, posterior_anterior, complexity, equipment, primary_muscle, supporting_muscles, muscle_bias, joint_count_level, dynamic_isometric, movement_plane, primary_joints, is_active)
  VALUES ('Single Leg Glute Bridge (floor) (isometric)', 'accessory', '{"hip_extension"}'::text[], 'unilateral', 'posterior', 2, '{"bodyweight"}'::text[], 'Glute max', '{"Hamstrings","adductors","erector spinae"}'::text[], 'shortened', 'regional', 'isometric', NULL, '{}'::text[], true)
  ON CONFLICT (name) DO UPDATE SET
    category = EXCLUDED.category,
    movement_patterns = EXCLUDED.movement_patterns,
    bilateral_unilateral = EXCLUDED.bilateral_unilateral,
    posterior_anterior = EXCLUDED.posterior_anterior,
    complexity = EXCLUDED.complexity,
    equipment = EXCLUDED.equipment,
    primary_muscle = EXCLUDED.primary_muscle,
    supporting_muscles = EXCLUDED.supporting_muscles,
    muscle_bias = EXCLUDED.muscle_bias,
    joint_count_level = EXCLUDED.joint_count_level,
    dynamic_isometric = EXCLUDED.dynamic_isometric,
    movement_plane = EXCLUDED.movement_plane,
    primary_joints = EXCLUDED.primary_joints,
    is_active = true,
    updated_at = now();

INSERT INTO exercise_library (name, category, movement_patterns, bilateral_unilateral, posterior_anterior, complexity, equipment, primary_muscle, supporting_muscles, muscle_bias, joint_count_level, dynamic_isometric, movement_plane, primary_joints, is_active)
  VALUES ('Single Leg Glute Bridge (floor) (dynamic)', 'accessory', '{"hip_extension"}'::text[], 'unilateral', 'posterior', 2, '{"bodyweight"}'::text[], 'Glute max', '{"Hamstrings","adductors","erector spinae"}'::text[], 'mid', 'regional', 'dynamic', NULL, '{}'::text[], true)
  ON CONFLICT (name) DO UPDATE SET
    category = EXCLUDED.category,
    movement_patterns = EXCLUDED.movement_patterns,
    bilateral_unilateral = EXCLUDED.bilateral_unilateral,
    posterior_anterior = EXCLUDED.posterior_anterior,
    complexity = EXCLUDED.complexity,
    equipment = EXCLUDED.equipment,
    primary_muscle = EXCLUDED.primary_muscle,
    supporting_muscles = EXCLUDED.supporting_muscles,
    muscle_bias = EXCLUDED.muscle_bias,
    joint_count_level = EXCLUDED.joint_count_level,
    dynamic_isometric = EXCLUDED.dynamic_isometric,
    movement_plane = EXCLUDED.movement_plane,
    primary_joints = EXCLUDED.primary_joints,
    is_active = true,
    updated_at = now();

INSERT INTO exercise_library (name, category, movement_patterns, bilateral_unilateral, posterior_anterior, complexity, equipment, primary_muscle, supporting_muscles, muscle_bias, joint_count_level, dynamic_isometric, movement_plane, primary_joints, is_active)
  VALUES ('Single Leg KAS Bridge (bench) (isometric)', 'accessory', '{"hip_extension"}'::text[], 'unilateral', 'posterior', 2, '{"bench"}'::text[], 'Glute max', '{"Hamstrings","adductors","erector spinae"}'::text[], 'shortened', 'regional', 'isometric', NULL, '{}'::text[], true)
  ON CONFLICT (name) DO UPDATE SET
    category = EXCLUDED.category,
    movement_patterns = EXCLUDED.movement_patterns,
    bilateral_unilateral = EXCLUDED.bilateral_unilateral,
    posterior_anterior = EXCLUDED.posterior_anterior,
    complexity = EXCLUDED.complexity,
    equipment = EXCLUDED.equipment,
    primary_muscle = EXCLUDED.primary_muscle,
    supporting_muscles = EXCLUDED.supporting_muscles,
    muscle_bias = EXCLUDED.muscle_bias,
    joint_count_level = EXCLUDED.joint_count_level,
    dynamic_isometric = EXCLUDED.dynamic_isometric,
    movement_plane = EXCLUDED.movement_plane,
    primary_joints = EXCLUDED.primary_joints,
    is_active = true,
    updated_at = now();

INSERT INTO exercise_library (name, category, movement_patterns, bilateral_unilateral, posterior_anterior, complexity, equipment, primary_muscle, supporting_muscles, muscle_bias, joint_count_level, dynamic_isometric, movement_plane, primary_joints, is_active)
  VALUES ('Single Leg KAS Bridge (bench) (dynamic)', 'accessory', '{"hip_extension"}'::text[], 'unilateral', 'posterior', 2, '{"bench"}'::text[], 'Glute max', '{"Hamstrings","adductors","erector spinae"}'::text[], 'mid', 'regional', 'dynamic', NULL, '{}'::text[], true)
  ON CONFLICT (name) DO UPDATE SET
    category = EXCLUDED.category,
    movement_patterns = EXCLUDED.movement_patterns,
    bilateral_unilateral = EXCLUDED.bilateral_unilateral,
    posterior_anterior = EXCLUDED.posterior_anterior,
    complexity = EXCLUDED.complexity,
    equipment = EXCLUDED.equipment,
    primary_muscle = EXCLUDED.primary_muscle,
    supporting_muscles = EXCLUDED.supporting_muscles,
    muscle_bias = EXCLUDED.muscle_bias,
    joint_count_level = EXCLUDED.joint_count_level,
    dynamic_isometric = EXCLUDED.dynamic_isometric,
    movement_plane = EXCLUDED.movement_plane,
    primary_joints = EXCLUDED.primary_joints,
    is_active = true,
    updated_at = now();

INSERT INTO exercise_library (name, category, movement_patterns, bilateral_unilateral, posterior_anterior, complexity, equipment, primary_muscle, supporting_muscles, muscle_bias, joint_count_level, dynamic_isometric, movement_plane, primary_joints, is_active)
  VALUES ('Tall Plank (on hands)', 'accessory', '{"spinal_extension"}'::text[], 'bilateral', 'anterior', 1, '{"bodyweight"}'::text[], 'Rectus abdominis', '{"Obliques","serratus anterior"}'::text[], 'mid', 'regional', 'isometric', NULL, '{}'::text[], true)
  ON CONFLICT (name) DO UPDATE SET
    category = EXCLUDED.category,
    movement_patterns = EXCLUDED.movement_patterns,
    bilateral_unilateral = EXCLUDED.bilateral_unilateral,
    posterior_anterior = EXCLUDED.posterior_anterior,
    complexity = EXCLUDED.complexity,
    equipment = EXCLUDED.equipment,
    primary_muscle = EXCLUDED.primary_muscle,
    supporting_muscles = EXCLUDED.supporting_muscles,
    muscle_bias = EXCLUDED.muscle_bias,
    joint_count_level = EXCLUDED.joint_count_level,
    dynamic_isometric = EXCLUDED.dynamic_isometric,
    movement_plane = EXCLUDED.movement_plane,
    primary_joints = EXCLUDED.primary_joints,
    is_active = true,
    updated_at = now();

INSERT INTO exercise_library (name, category, movement_patterns, bilateral_unilateral, posterior_anterior, complexity, equipment, primary_muscle, supporting_muscles, muscle_bias, joint_count_level, dynamic_isometric, movement_plane, primary_joints, is_active)
  VALUES ('Suspension Trainer Elbow Plank (feet suspended)', 'accessory', '{"spinal_extension"}'::text[], 'bilateral', 'anterior', 2, '{"suspension_trainer"}'::text[], 'Rectus abdominis', '{"Obliques","serratus anterior","lats"}'::text[], 'mid', 'regional', 'isometric', NULL, '{}'::text[], true)
  ON CONFLICT (name) DO UPDATE SET
    category = EXCLUDED.category,
    movement_patterns = EXCLUDED.movement_patterns,
    bilateral_unilateral = EXCLUDED.bilateral_unilateral,
    posterior_anterior = EXCLUDED.posterior_anterior,
    complexity = EXCLUDED.complexity,
    equipment = EXCLUDED.equipment,
    primary_muscle = EXCLUDED.primary_muscle,
    supporting_muscles = EXCLUDED.supporting_muscles,
    muscle_bias = EXCLUDED.muscle_bias,
    joint_count_level = EXCLUDED.joint_count_level,
    dynamic_isometric = EXCLUDED.dynamic_isometric,
    movement_plane = EXCLUDED.movement_plane,
    primary_joints = EXCLUDED.primary_joints,
    is_active = true,
    updated_at = now();

INSERT INTO exercise_library (name, category, movement_patterns, bilateral_unilateral, posterior_anterior, complexity, equipment, primary_muscle, supporting_muscles, muscle_bias, joint_count_level, dynamic_isometric, movement_plane, primary_joints, is_active)
  VALUES ('Suspension Trainer Tall Plank (feet suspended)', 'accessory', '{"spinal_extension"}'::text[], 'bilateral', 'anterior', 2, '{"suspension_trainer"}'::text[], 'Rectus abdominis', '{"Obliques","serratus anterior","lats"}'::text[], 'mid', 'regional', 'isometric', NULL, '{}'::text[], true)
  ON CONFLICT (name) DO UPDATE SET
    category = EXCLUDED.category,
    movement_patterns = EXCLUDED.movement_patterns,
    bilateral_unilateral = EXCLUDED.bilateral_unilateral,
    posterior_anterior = EXCLUDED.posterior_anterior,
    complexity = EXCLUDED.complexity,
    equipment = EXCLUDED.equipment,
    primary_muscle = EXCLUDED.primary_muscle,
    supporting_muscles = EXCLUDED.supporting_muscles,
    muscle_bias = EXCLUDED.muscle_bias,
    joint_count_level = EXCLUDED.joint_count_level,
    dynamic_isometric = EXCLUDED.dynamic_isometric,
    movement_plane = EXCLUDED.movement_plane,
    primary_joints = EXCLUDED.primary_joints,
    is_active = true,
    updated_at = now();

INSERT INTO exercise_library (name, category, movement_patterns, bilateral_unilateral, posterior_anterior, complexity, equipment, primary_muscle, supporting_muscles, muscle_bias, joint_count_level, dynamic_isometric, movement_plane, primary_joints, is_active)
  VALUES ('Elbow Plank', 'accessory', '{"spinal_extension"}'::text[], 'bilateral', 'anterior', 1, '{"bodyweight"}'::text[], 'Rectus abdominis', '{"Obliques","serratus anterior"}'::text[], 'mid', 'regional', 'isometric', NULL, '{}'::text[], true)
  ON CONFLICT (name) DO UPDATE SET
    category = EXCLUDED.category,
    movement_patterns = EXCLUDED.movement_patterns,
    bilateral_unilateral = EXCLUDED.bilateral_unilateral,
    posterior_anterior = EXCLUDED.posterior_anterior,
    complexity = EXCLUDED.complexity,
    equipment = EXCLUDED.equipment,
    primary_muscle = EXCLUDED.primary_muscle,
    supporting_muscles = EXCLUDED.supporting_muscles,
    muscle_bias = EXCLUDED.muscle_bias,
    joint_count_level = EXCLUDED.joint_count_level,
    dynamic_isometric = EXCLUDED.dynamic_isometric,
    movement_plane = EXCLUDED.movement_plane,
    primary_joints = EXCLUDED.primary_joints,
    is_active = true,
    updated_at = now();

INSERT INTO exercise_library (name, category, movement_patterns, bilateral_unilateral, posterior_anterior, complexity, equipment, primary_muscle, supporting_muscles, muscle_bias, joint_count_level, dynamic_isometric, movement_plane, primary_joints, is_active)
  VALUES ('Plank Shoulder Tap', 'accessory', '{"spinal_extension"}'::text[], 'bilateral', 'anterior', 2, '{"bodyweight"}'::text[], 'Rectus abdominis', '{"Obliques","serratus anterior"}'::text[], 'mid', 'regional', 'dynamic', NULL, '{}'::text[], true)
  ON CONFLICT (name) DO UPDATE SET
    category = EXCLUDED.category,
    movement_patterns = EXCLUDED.movement_patterns,
    bilateral_unilateral = EXCLUDED.bilateral_unilateral,
    posterior_anterior = EXCLUDED.posterior_anterior,
    complexity = EXCLUDED.complexity,
    equipment = EXCLUDED.equipment,
    primary_muscle = EXCLUDED.primary_muscle,
    supporting_muscles = EXCLUDED.supporting_muscles,
    muscle_bias = EXCLUDED.muscle_bias,
    joint_count_level = EXCLUDED.joint_count_level,
    dynamic_isometric = EXCLUDED.dynamic_isometric,
    movement_plane = EXCLUDED.movement_plane,
    primary_joints = EXCLUDED.primary_joints,
    is_active = true,
    updated_at = now();

INSERT INTO exercise_library (name, category, movement_patterns, bilateral_unilateral, posterior_anterior, complexity, equipment, primary_muscle, supporting_muscles, muscle_bias, joint_count_level, dynamic_isometric, movement_plane, primary_joints, is_active)
  VALUES ('Dead Bug with Banded Pulldown', 'accessory', '{"spinal_extension"}'::text[], 'bilateral', 'anterior', 2, '{"band"}'::text[], 'Rectus abdominis', '{"Lats","serratus anterior","obliques"}'::text[], 'mid', 'regional', 'dynamic', NULL, '{}'::text[], true)
  ON CONFLICT (name) DO UPDATE SET
    category = EXCLUDED.category,
    movement_patterns = EXCLUDED.movement_patterns,
    bilateral_unilateral = EXCLUDED.bilateral_unilateral,
    posterior_anterior = EXCLUDED.posterior_anterior,
    complexity = EXCLUDED.complexity,
    equipment = EXCLUDED.equipment,
    primary_muscle = EXCLUDED.primary_muscle,
    supporting_muscles = EXCLUDED.supporting_muscles,
    muscle_bias = EXCLUDED.muscle_bias,
    joint_count_level = EXCLUDED.joint_count_level,
    dynamic_isometric = EXCLUDED.dynamic_isometric,
    movement_plane = EXCLUDED.movement_plane,
    primary_joints = EXCLUDED.primary_joints,
    is_active = true,
    updated_at = now();

INSERT INTO exercise_library (name, category, movement_patterns, bilateral_unilateral, posterior_anterior, complexity, equipment, primary_muscle, supporting_muscles, muscle_bias, joint_count_level, dynamic_isometric, movement_plane, primary_joints, is_active)
  VALUES ('Alternating Leg Dead Bug (straight legs)', 'accessory', '{"spinal_extension"}'::text[], 'bilateral', 'anterior', 2, '{"bodyweight"}'::text[], 'Rectus abdominis', '{"Obliques","hip flexors"}'::text[], 'mid', 'regional', 'dynamic', NULL, '{}'::text[], true)
  ON CONFLICT (name) DO UPDATE SET
    category = EXCLUDED.category,
    movement_patterns = EXCLUDED.movement_patterns,
    bilateral_unilateral = EXCLUDED.bilateral_unilateral,
    posterior_anterior = EXCLUDED.posterior_anterior,
    complexity = EXCLUDED.complexity,
    equipment = EXCLUDED.equipment,
    primary_muscle = EXCLUDED.primary_muscle,
    supporting_muscles = EXCLUDED.supporting_muscles,
    muscle_bias = EXCLUDED.muscle_bias,
    joint_count_level = EXCLUDED.joint_count_level,
    dynamic_isometric = EXCLUDED.dynamic_isometric,
    movement_plane = EXCLUDED.movement_plane,
    primary_joints = EXCLUDED.primary_joints,
    is_active = true,
    updated_at = now();

INSERT INTO exercise_library (name, category, movement_patterns, bilateral_unilateral, posterior_anterior, complexity, equipment, primary_muscle, supporting_muscles, muscle_bias, joint_count_level, dynamic_isometric, movement_plane, primary_joints, is_active)
  VALUES ('Same-side Dead Bug (straight legs)', 'accessory', '{"spinal_extension"}'::text[], 'bilateral', 'anterior', 2, '{"bodyweight"}'::text[], 'Rectus abdominis', '{"Obliques","hip flexors"}'::text[], 'mid', 'regional', 'dynamic', NULL, '{}'::text[], true)
  ON CONFLICT (name) DO UPDATE SET
    category = EXCLUDED.category,
    movement_patterns = EXCLUDED.movement_patterns,
    bilateral_unilateral = EXCLUDED.bilateral_unilateral,
    posterior_anterior = EXCLUDED.posterior_anterior,
    complexity = EXCLUDED.complexity,
    equipment = EXCLUDED.equipment,
    primary_muscle = EXCLUDED.primary_muscle,
    supporting_muscles = EXCLUDED.supporting_muscles,
    muscle_bias = EXCLUDED.muscle_bias,
    joint_count_level = EXCLUDED.joint_count_level,
    dynamic_isometric = EXCLUDED.dynamic_isometric,
    movement_plane = EXCLUDED.movement_plane,
    primary_joints = EXCLUDED.primary_joints,
    is_active = true,
    updated_at = now();

INSERT INTO exercise_library (name, category, movement_patterns, bilateral_unilateral, posterior_anterior, complexity, equipment, primary_muscle, supporting_muscles, muscle_bias, joint_count_level, dynamic_isometric, movement_plane, primary_joints, is_active)
  VALUES ('Opposite-side Dead Bug (straight legs)', 'accessory', '{"spinal_extension"}'::text[], 'bilateral', 'anterior', 2, '{"bodyweight"}'::text[], 'Rectus abdominis', '{"Obliques","hip flexors"}'::text[], 'mid', 'regional', 'dynamic', NULL, '{}'::text[], true)
  ON CONFLICT (name) DO UPDATE SET
    category = EXCLUDED.category,
    movement_patterns = EXCLUDED.movement_patterns,
    bilateral_unilateral = EXCLUDED.bilateral_unilateral,
    posterior_anterior = EXCLUDED.posterior_anterior,
    complexity = EXCLUDED.complexity,
    equipment = EXCLUDED.equipment,
    primary_muscle = EXCLUDED.primary_muscle,
    supporting_muscles = EXCLUDED.supporting_muscles,
    muscle_bias = EXCLUDED.muscle_bias,
    joint_count_level = EXCLUDED.joint_count_level,
    dynamic_isometric = EXCLUDED.dynamic_isometric,
    movement_plane = EXCLUDED.movement_plane,
    primary_joints = EXCLUDED.primary_joints,
    is_active = true,
    updated_at = now();

INSERT INTO exercise_library (name, category, movement_patterns, bilateral_unilateral, posterior_anterior, complexity, equipment, primary_muscle, supporting_muscles, muscle_bias, joint_count_level, dynamic_isometric, movement_plane, primary_joints, is_active)
  VALUES ('Alternating Leg Dead Bug (bent legs)', 'accessory', '{"spinal_extension"}'::text[], 'bilateral', 'anterior', 1, '{"bodyweight"}'::text[], 'Rectus abdominis', '{"Obliques","hip flexors"}'::text[], 'mid', 'regional', 'dynamic', NULL, '{}'::text[], true)
  ON CONFLICT (name) DO UPDATE SET
    category = EXCLUDED.category,
    movement_patterns = EXCLUDED.movement_patterns,
    bilateral_unilateral = EXCLUDED.bilateral_unilateral,
    posterior_anterior = EXCLUDED.posterior_anterior,
    complexity = EXCLUDED.complexity,
    equipment = EXCLUDED.equipment,
    primary_muscle = EXCLUDED.primary_muscle,
    supporting_muscles = EXCLUDED.supporting_muscles,
    muscle_bias = EXCLUDED.muscle_bias,
    joint_count_level = EXCLUDED.joint_count_level,
    dynamic_isometric = EXCLUDED.dynamic_isometric,
    movement_plane = EXCLUDED.movement_plane,
    primary_joints = EXCLUDED.primary_joints,
    is_active = true,
    updated_at = now();

INSERT INTO exercise_library (name, category, movement_patterns, bilateral_unilateral, posterior_anterior, complexity, equipment, primary_muscle, supporting_muscles, muscle_bias, joint_count_level, dynamic_isometric, movement_plane, primary_joints, is_active)
  VALUES ('Same-side Dead Bug (bent legs)', 'accessory', '{"spinal_extension"}'::text[], 'bilateral', 'anterior', 1, '{"bodyweight"}'::text[], 'Rectus abdominis', '{"Obliques","hip flexors"}'::text[], 'mid', 'regional', 'dynamic', NULL, '{}'::text[], true)
  ON CONFLICT (name) DO UPDATE SET
    category = EXCLUDED.category,
    movement_patterns = EXCLUDED.movement_patterns,
    bilateral_unilateral = EXCLUDED.bilateral_unilateral,
    posterior_anterior = EXCLUDED.posterior_anterior,
    complexity = EXCLUDED.complexity,
    equipment = EXCLUDED.equipment,
    primary_muscle = EXCLUDED.primary_muscle,
    supporting_muscles = EXCLUDED.supporting_muscles,
    muscle_bias = EXCLUDED.muscle_bias,
    joint_count_level = EXCLUDED.joint_count_level,
    dynamic_isometric = EXCLUDED.dynamic_isometric,
    movement_plane = EXCLUDED.movement_plane,
    primary_joints = EXCLUDED.primary_joints,
    is_active = true,
    updated_at = now();

INSERT INTO exercise_library (name, category, movement_patterns, bilateral_unilateral, posterior_anterior, complexity, equipment, primary_muscle, supporting_muscles, muscle_bias, joint_count_level, dynamic_isometric, movement_plane, primary_joints, is_active)
  VALUES ('Opposite-side Dead Bug (bent legs)', 'accessory', '{"spinal_extension"}'::text[], 'bilateral', 'anterior', 1, '{"bodyweight"}'::text[], 'Rectus abdominis', '{"Obliques","hip flexors"}'::text[], 'mid', 'regional', 'dynamic', NULL, '{}'::text[], true)
  ON CONFLICT (name) DO UPDATE SET
    category = EXCLUDED.category,
    movement_patterns = EXCLUDED.movement_patterns,
    bilateral_unilateral = EXCLUDED.bilateral_unilateral,
    posterior_anterior = EXCLUDED.posterior_anterior,
    complexity = EXCLUDED.complexity,
    equipment = EXCLUDED.equipment,
    primary_muscle = EXCLUDED.primary_muscle,
    supporting_muscles = EXCLUDED.supporting_muscles,
    muscle_bias = EXCLUDED.muscle_bias,
    joint_count_level = EXCLUDED.joint_count_level,
    dynamic_isometric = EXCLUDED.dynamic_isometric,
    movement_plane = EXCLUDED.movement_plane,
    primary_joints = EXCLUDED.primary_joints,
    is_active = true,
    updated_at = now();

INSERT INTO exercise_library (name, category, movement_patterns, bilateral_unilateral, posterior_anterior, complexity, equipment, primary_muscle, supporting_muscles, muscle_bias, joint_count_level, dynamic_isometric, movement_plane, primary_joints, is_active)
  VALUES ('Wall Pressing Alternating Dead Bug (straight leg)', 'accessory', '{"spinal_extension"}'::text[], 'bilateral', 'anterior', 2, '{"bodyweight"}'::text[], 'Rectus abdominis', '{"Obliques","serratus anterior"}'::text[], 'mid', 'regional', 'dynamic', NULL, '{}'::text[], true)
  ON CONFLICT (name) DO UPDATE SET
    category = EXCLUDED.category,
    movement_patterns = EXCLUDED.movement_patterns,
    bilateral_unilateral = EXCLUDED.bilateral_unilateral,
    posterior_anterior = EXCLUDED.posterior_anterior,
    complexity = EXCLUDED.complexity,
    equipment = EXCLUDED.equipment,
    primary_muscle = EXCLUDED.primary_muscle,
    supporting_muscles = EXCLUDED.supporting_muscles,
    muscle_bias = EXCLUDED.muscle_bias,
    joint_count_level = EXCLUDED.joint_count_level,
    dynamic_isometric = EXCLUDED.dynamic_isometric,
    movement_plane = EXCLUDED.movement_plane,
    primary_joints = EXCLUDED.primary_joints,
    is_active = true,
    updated_at = now();

INSERT INTO exercise_library (name, category, movement_patterns, bilateral_unilateral, posterior_anterior, complexity, equipment, primary_muscle, supporting_muscles, muscle_bias, joint_count_level, dynamic_isometric, movement_plane, primary_joints, is_active)
  VALUES ('Wall Pressing Alternating Dead Bug (bent leg)', 'accessory', '{"spinal_extension"}'::text[], 'bilateral', 'anterior', 2, '{"bodyweight"}'::text[], 'Rectus abdominis', '{"Obliques","serratus anterior"}'::text[], 'mid', 'regional', 'dynamic', NULL, '{}'::text[], true)
  ON CONFLICT (name) DO UPDATE SET
    category = EXCLUDED.category,
    movement_patterns = EXCLUDED.movement_patterns,
    bilateral_unilateral = EXCLUDED.bilateral_unilateral,
    posterior_anterior = EXCLUDED.posterior_anterior,
    complexity = EXCLUDED.complexity,
    equipment = EXCLUDED.equipment,
    primary_muscle = EXCLUDED.primary_muscle,
    supporting_muscles = EXCLUDED.supporting_muscles,
    muscle_bias = EXCLUDED.muscle_bias,
    joint_count_level = EXCLUDED.joint_count_level,
    dynamic_isometric = EXCLUDED.dynamic_isometric,
    movement_plane = EXCLUDED.movement_plane,
    primary_joints = EXCLUDED.primary_joints,
    is_active = true,
    updated_at = now();

INSERT INTO exercise_library (name, category, movement_patterns, bilateral_unilateral, posterior_anterior, complexity, equipment, primary_muscle, supporting_muscles, muscle_bias, joint_count_level, dynamic_isometric, movement_plane, primary_joints, is_active)
  VALUES ('Wall Pressing Dual Leg Dead Bug', 'accessory', '{"spinal_extension"}'::text[], 'bilateral', 'anterior', 2, '{"bodyweight"}'::text[], 'Rectus abdominis', '{"Obliques","serratus anterior"}'::text[], 'mid', 'regional', 'dynamic', NULL, '{}'::text[], true)
  ON CONFLICT (name) DO UPDATE SET
    category = EXCLUDED.category,
    movement_patterns = EXCLUDED.movement_patterns,
    bilateral_unilateral = EXCLUDED.bilateral_unilateral,
    posterior_anterior = EXCLUDED.posterior_anterior,
    complexity = EXCLUDED.complexity,
    equipment = EXCLUDED.equipment,
    primary_muscle = EXCLUDED.primary_muscle,
    supporting_muscles = EXCLUDED.supporting_muscles,
    muscle_bias = EXCLUDED.muscle_bias,
    joint_count_level = EXCLUDED.joint_count_level,
    dynamic_isometric = EXCLUDED.dynamic_isometric,
    movement_plane = EXCLUDED.movement_plane,
    primary_joints = EXCLUDED.primary_joints,
    is_active = true,
    updated_at = now();

INSERT INTO exercise_library (name, category, movement_patterns, bilateral_unilateral, posterior_anterior, complexity, equipment, primary_muscle, supporting_muscles, muscle_bias, joint_count_level, dynamic_isometric, movement_plane, primary_joints, is_active)
  VALUES ('KB Alternating Dead Bug (straight leg)', 'accessory', '{"spinal_extension"}'::text[], 'bilateral', 'anterior', 2, '{"kettlebell"}'::text[], 'Rectus abdominis', '{"Lats","obliques"}'::text[], 'mid', 'regional', 'dynamic', NULL, '{}'::text[], true)
  ON CONFLICT (name) DO UPDATE SET
    category = EXCLUDED.category,
    movement_patterns = EXCLUDED.movement_patterns,
    bilateral_unilateral = EXCLUDED.bilateral_unilateral,
    posterior_anterior = EXCLUDED.posterior_anterior,
    complexity = EXCLUDED.complexity,
    equipment = EXCLUDED.equipment,
    primary_muscle = EXCLUDED.primary_muscle,
    supporting_muscles = EXCLUDED.supporting_muscles,
    muscle_bias = EXCLUDED.muscle_bias,
    joint_count_level = EXCLUDED.joint_count_level,
    dynamic_isometric = EXCLUDED.dynamic_isometric,
    movement_plane = EXCLUDED.movement_plane,
    primary_joints = EXCLUDED.primary_joints,
    is_active = true,
    updated_at = now();

INSERT INTO exercise_library (name, category, movement_patterns, bilateral_unilateral, posterior_anterior, complexity, equipment, primary_muscle, supporting_muscles, muscle_bias, joint_count_level, dynamic_isometric, movement_plane, primary_joints, is_active)
  VALUES ('KB Alternating Dead Bug (bent leg)', 'accessory', '{"spinal_extension"}'::text[], 'bilateral', 'anterior', 2, '{"kettlebell"}'::text[], 'Rectus abdominis', '{"Lats","obliques"}'::text[], 'mid', 'regional', 'dynamic', NULL, '{}'::text[], true)
  ON CONFLICT (name) DO UPDATE SET
    category = EXCLUDED.category,
    movement_patterns = EXCLUDED.movement_patterns,
    bilateral_unilateral = EXCLUDED.bilateral_unilateral,
    posterior_anterior = EXCLUDED.posterior_anterior,
    complexity = EXCLUDED.complexity,
    equipment = EXCLUDED.equipment,
    primary_muscle = EXCLUDED.primary_muscle,
    supporting_muscles = EXCLUDED.supporting_muscles,
    muscle_bias = EXCLUDED.muscle_bias,
    joint_count_level = EXCLUDED.joint_count_level,
    dynamic_isometric = EXCLUDED.dynamic_isometric,
    movement_plane = EXCLUDED.movement_plane,
    primary_joints = EXCLUDED.primary_joints,
    is_active = true,
    updated_at = now();

INSERT INTO exercise_library (name, category, movement_patterns, bilateral_unilateral, posterior_anterior, complexity, equipment, primary_muscle, supporting_muscles, muscle_bias, joint_count_level, dynamic_isometric, movement_plane, primary_joints, is_active)
  VALUES ('KB Dual Straight Leg Dead Bug', 'accessory', '{"spinal_extension"}'::text[], 'bilateral', 'anterior', 2, '{"kettlebell"}'::text[], 'Rectus abdominis', '{"Lats","obliques"}'::text[], 'mid', 'regional', 'dynamic', NULL, '{}'::text[], true)
  ON CONFLICT (name) DO UPDATE SET
    category = EXCLUDED.category,
    movement_patterns = EXCLUDED.movement_patterns,
    bilateral_unilateral = EXCLUDED.bilateral_unilateral,
    posterior_anterior = EXCLUDED.posterior_anterior,
    complexity = EXCLUDED.complexity,
    equipment = EXCLUDED.equipment,
    primary_muscle = EXCLUDED.primary_muscle,
    supporting_muscles = EXCLUDED.supporting_muscles,
    muscle_bias = EXCLUDED.muscle_bias,
    joint_count_level = EXCLUDED.joint_count_level,
    dynamic_isometric = EXCLUDED.dynamic_isometric,
    movement_plane = EXCLUDED.movement_plane,
    primary_joints = EXCLUDED.primary_joints,
    is_active = true,
    updated_at = now();

INSERT INTO exercise_library (name, category, movement_patterns, bilateral_unilateral, posterior_anterior, complexity, equipment, primary_muscle, supporting_muscles, muscle_bias, joint_count_level, dynamic_isometric, movement_plane, primary_joints, is_active)
  VALUES ('KB Dual Bent Leg Dead Bug', 'accessory', '{"spinal_extension"}'::text[], 'bilateral', 'anterior', 2, '{"kettlebell"}'::text[], 'Rectus abdominis', '{"Lats","obliques"}'::text[], 'mid', 'regional', 'dynamic', NULL, '{}'::text[], true)
  ON CONFLICT (name) DO UPDATE SET
    category = EXCLUDED.category,
    movement_patterns = EXCLUDED.movement_patterns,
    bilateral_unilateral = EXCLUDED.bilateral_unilateral,
    posterior_anterior = EXCLUDED.posterior_anterior,
    complexity = EXCLUDED.complexity,
    equipment = EXCLUDED.equipment,
    primary_muscle = EXCLUDED.primary_muscle,
    supporting_muscles = EXCLUDED.supporting_muscles,
    muscle_bias = EXCLUDED.muscle_bias,
    joint_count_level = EXCLUDED.joint_count_level,
    dynamic_isometric = EXCLUDED.dynamic_isometric,
    movement_plane = EXCLUDED.movement_plane,
    primary_joints = EXCLUDED.primary_joints,
    is_active = true,
    updated_at = now();

INSERT INTO exercise_library (name, category, movement_patterns, bilateral_unilateral, posterior_anterior, complexity, equipment, primary_muscle, supporting_muscles, muscle_bias, joint_count_level, dynamic_isometric, movement_plane, primary_joints, is_active)
  VALUES ('Hollow Hold (straight levers)', 'accessory', '{"core_anti_extension"}'::text[], 'bilateral', 'anterior', 2, '{"bodyweight"}'::text[], 'Rectus abdominis', '{"Obliques","hip flexors"}'::text[], 'mid', 'regional', 'isometric', NULL, '{}'::text[], true)
  ON CONFLICT (name) DO UPDATE SET
    category = EXCLUDED.category,
    movement_patterns = EXCLUDED.movement_patterns,
    bilateral_unilateral = EXCLUDED.bilateral_unilateral,
    posterior_anterior = EXCLUDED.posterior_anterior,
    complexity = EXCLUDED.complexity,
    equipment = EXCLUDED.equipment,
    primary_muscle = EXCLUDED.primary_muscle,
    supporting_muscles = EXCLUDED.supporting_muscles,
    muscle_bias = EXCLUDED.muscle_bias,
    joint_count_level = EXCLUDED.joint_count_level,
    dynamic_isometric = EXCLUDED.dynamic_isometric,
    movement_plane = EXCLUDED.movement_plane,
    primary_joints = EXCLUDED.primary_joints,
    is_active = true,
    updated_at = now();

INSERT INTO exercise_library (name, category, movement_patterns, bilateral_unilateral, posterior_anterior, complexity, equipment, primary_muscle, supporting_muscles, muscle_bias, joint_count_level, dynamic_isometric, movement_plane, primary_joints, is_active)
  VALUES ('Hollow Hold (bent knee, arms by sides)', 'accessory', '{"core_anti_extension"}'::text[], 'bilateral', 'anterior', 1, '{"bodyweight"}'::text[], 'Rectus abdominis', '{"Obliques","hip flexors"}'::text[], 'mid', 'regional', 'isometric', NULL, '{}'::text[], true)
  ON CONFLICT (name) DO UPDATE SET
    category = EXCLUDED.category,
    movement_patterns = EXCLUDED.movement_patterns,
    bilateral_unilateral = EXCLUDED.bilateral_unilateral,
    posterior_anterior = EXCLUDED.posterior_anterior,
    complexity = EXCLUDED.complexity,
    equipment = EXCLUDED.equipment,
    primary_muscle = EXCLUDED.primary_muscle,
    supporting_muscles = EXCLUDED.supporting_muscles,
    muscle_bias = EXCLUDED.muscle_bias,
    joint_count_level = EXCLUDED.joint_count_level,
    dynamic_isometric = EXCLUDED.dynamic_isometric,
    movement_plane = EXCLUDED.movement_plane,
    primary_joints = EXCLUDED.primary_joints,
    is_active = true,
    updated_at = now();

INSERT INTO exercise_library (name, category, movement_patterns, bilateral_unilateral, posterior_anterior, complexity, equipment, primary_muscle, supporting_muscles, muscle_bias, joint_count_level, dynamic_isometric, movement_plane, primary_joints, is_active)
  VALUES ('Hollow Rock (bent knee)', 'accessory', '{"core_anti_extension"}'::text[], 'bilateral', 'anterior', 2, '{"bodyweight"}'::text[], 'Rectus abdominis', '{"Obliques","hip flexors"}'::text[], 'mid', 'regional', 'dynamic', NULL, '{}'::text[], true)
  ON CONFLICT (name) DO UPDATE SET
    category = EXCLUDED.category,
    movement_patterns = EXCLUDED.movement_patterns,
    bilateral_unilateral = EXCLUDED.bilateral_unilateral,
    posterior_anterior = EXCLUDED.posterior_anterior,
    complexity = EXCLUDED.complexity,
    equipment = EXCLUDED.equipment,
    primary_muscle = EXCLUDED.primary_muscle,
    supporting_muscles = EXCLUDED.supporting_muscles,
    muscle_bias = EXCLUDED.muscle_bias,
    joint_count_level = EXCLUDED.joint_count_level,
    dynamic_isometric = EXCLUDED.dynamic_isometric,
    movement_plane = EXCLUDED.movement_plane,
    primary_joints = EXCLUDED.primary_joints,
    is_active = true,
    updated_at = now();

INSERT INTO exercise_library (name, category, movement_patterns, bilateral_unilateral, posterior_anterior, complexity, equipment, primary_muscle, supporting_muscles, muscle_bias, joint_count_level, dynamic_isometric, movement_plane, primary_joints, is_active)
  VALUES ('Hollow Rock (straight leg)', 'accessory', '{"core_anti_extension"}'::text[], 'bilateral', 'anterior', 2, '{"bodyweight"}'::text[], 'Rectus abdominis', '{"Obliques","hip flexors"}'::text[], 'mid', 'regional', 'dynamic', NULL, '{}'::text[], true)
  ON CONFLICT (name) DO UPDATE SET
    category = EXCLUDED.category,
    movement_patterns = EXCLUDED.movement_patterns,
    bilateral_unilateral = EXCLUDED.bilateral_unilateral,
    posterior_anterior = EXCLUDED.posterior_anterior,
    complexity = EXCLUDED.complexity,
    equipment = EXCLUDED.equipment,
    primary_muscle = EXCLUDED.primary_muscle,
    supporting_muscles = EXCLUDED.supporting_muscles,
    muscle_bias = EXCLUDED.muscle_bias,
    joint_count_level = EXCLUDED.joint_count_level,
    dynamic_isometric = EXCLUDED.dynamic_isometric,
    movement_plane = EXCLUDED.movement_plane,
    primary_joints = EXCLUDED.primary_joints,
    is_active = true,
    updated_at = now();

INSERT INTO exercise_library (name, category, movement_patterns, bilateral_unilateral, posterior_anterior, complexity, equipment, primary_muscle, supporting_muscles, muscle_bias, joint_count_level, dynamic_isometric, movement_plane, primary_joints, is_active)
  VALUES ('Feet Anchored Sit-up', 'accessory', '{"core_flexion"}'::text[], 'bilateral', 'anterior', 2, '{"bodyweight"}'::text[], 'Rectus abdominis', '{"Hip flexors"}'::text[], 'mid', 'regional', 'dynamic', NULL, '{}'::text[], true)
  ON CONFLICT (name) DO UPDATE SET
    category = EXCLUDED.category,
    movement_patterns = EXCLUDED.movement_patterns,
    bilateral_unilateral = EXCLUDED.bilateral_unilateral,
    posterior_anterior = EXCLUDED.posterior_anterior,
    complexity = EXCLUDED.complexity,
    equipment = EXCLUDED.equipment,
    primary_muscle = EXCLUDED.primary_muscle,
    supporting_muscles = EXCLUDED.supporting_muscles,
    muscle_bias = EXCLUDED.muscle_bias,
    joint_count_level = EXCLUDED.joint_count_level,
    dynamic_isometric = EXCLUDED.dynamic_isometric,
    movement_plane = EXCLUDED.movement_plane,
    primary_joints = EXCLUDED.primary_joints,
    is_active = true,
    updated_at = now();

INSERT INTO exercise_library (name, category, movement_patterns, bilateral_unilateral, posterior_anterior, complexity, equipment, primary_muscle, supporting_muscles, muscle_bias, joint_count_level, dynamic_isometric, movement_plane, primary_joints, is_active)
  VALUES ('Feet Anchored Weighted Sit-up', 'accessory', '{"core_flexion"}'::text[], 'bilateral', 'anterior', 2, '{"dumbbell"}'::text[], 'Rectus abdominis', '{"Hip flexors"}'::text[], 'mid', 'regional', 'dynamic', NULL, '{}'::text[], true)
  ON CONFLICT (name) DO UPDATE SET
    category = EXCLUDED.category,
    movement_patterns = EXCLUDED.movement_patterns,
    bilateral_unilateral = EXCLUDED.bilateral_unilateral,
    posterior_anterior = EXCLUDED.posterior_anterior,
    complexity = EXCLUDED.complexity,
    equipment = EXCLUDED.equipment,
    primary_muscle = EXCLUDED.primary_muscle,
    supporting_muscles = EXCLUDED.supporting_muscles,
    muscle_bias = EXCLUDED.muscle_bias,
    joint_count_level = EXCLUDED.joint_count_level,
    dynamic_isometric = EXCLUDED.dynamic_isometric,
    movement_plane = EXCLUDED.movement_plane,
    primary_joints = EXCLUDED.primary_joints,
    is_active = true,
    updated_at = now();

INSERT INTO exercise_library (name, category, movement_patterns, bilateral_unilateral, posterior_anterior, complexity, equipment, primary_muscle, supporting_muscles, muscle_bias, joint_count_level, dynamic_isometric, movement_plane, primary_joints, is_active)
  VALUES ('Feet Anchored Sit-up with Rotation', 'accessory', '{"core_rotation"}'::text[], 'bilateral', NULL, 2, '{"bodyweight"}'::text[], 'Obliques', '{"Rectus abdominis","hip flexors"}'::text[], 'mid', 'regional', 'dynamic', NULL, '{}'::text[], true)
  ON CONFLICT (name) DO UPDATE SET
    category = EXCLUDED.category,
    movement_patterns = EXCLUDED.movement_patterns,
    bilateral_unilateral = EXCLUDED.bilateral_unilateral,
    posterior_anterior = EXCLUDED.posterior_anterior,
    complexity = EXCLUDED.complexity,
    equipment = EXCLUDED.equipment,
    primary_muscle = EXCLUDED.primary_muscle,
    supporting_muscles = EXCLUDED.supporting_muscles,
    muscle_bias = EXCLUDED.muscle_bias,
    joint_count_level = EXCLUDED.joint_count_level,
    dynamic_isometric = EXCLUDED.dynamic_isometric,
    movement_plane = EXCLUDED.movement_plane,
    primary_joints = EXCLUDED.primary_joints,
    is_active = true,
    updated_at = now();

INSERT INTO exercise_library (name, category, movement_patterns, bilateral_unilateral, posterior_anterior, complexity, equipment, primary_muscle, supporting_muscles, muscle_bias, joint_count_level, dynamic_isometric, movement_plane, primary_joints, is_active)
  VALUES ('Feet Anchored Weighted Sit-up with Rotation', 'accessory', '{"core_rotation"}'::text[], 'bilateral', NULL, 2, '{"dumbbell"}'::text[], 'Obliques', '{"Rectus abdominis","hip flexors"}'::text[], 'mid', 'regional', 'dynamic', NULL, '{}'::text[], true)
  ON CONFLICT (name) DO UPDATE SET
    category = EXCLUDED.category,
    movement_patterns = EXCLUDED.movement_patterns,
    bilateral_unilateral = EXCLUDED.bilateral_unilateral,
    posterior_anterior = EXCLUDED.posterior_anterior,
    complexity = EXCLUDED.complexity,
    equipment = EXCLUDED.equipment,
    primary_muscle = EXCLUDED.primary_muscle,
    supporting_muscles = EXCLUDED.supporting_muscles,
    muscle_bias = EXCLUDED.muscle_bias,
    joint_count_level = EXCLUDED.joint_count_level,
    dynamic_isometric = EXCLUDED.dynamic_isometric,
    movement_plane = EXCLUDED.movement_plane,
    primary_joints = EXCLUDED.primary_joints,
    is_active = true,
    updated_at = now();

INSERT INTO exercise_library (name, category, movement_patterns, bilateral_unilateral, posterior_anterior, complexity, equipment, primary_muscle, supporting_muscles, muscle_bias, joint_count_level, dynamic_isometric, movement_plane, primary_joints, is_active)
  VALUES ('Abmat Sit-up', 'accessory', '{"core_flexion"}'::text[], 'bilateral', 'anterior', 1, '{}'::text[], 'Rectus abdominis', '{"Hip flexors"}'::text[], 'mid', 'regional', 'dynamic', NULL, '{}'::text[], true)
  ON CONFLICT (name) DO UPDATE SET
    category = EXCLUDED.category,
    movement_patterns = EXCLUDED.movement_patterns,
    bilateral_unilateral = EXCLUDED.bilateral_unilateral,
    posterior_anterior = EXCLUDED.posterior_anterior,
    complexity = EXCLUDED.complexity,
    equipment = EXCLUDED.equipment,
    primary_muscle = EXCLUDED.primary_muscle,
    supporting_muscles = EXCLUDED.supporting_muscles,
    muscle_bias = EXCLUDED.muscle_bias,
    joint_count_level = EXCLUDED.joint_count_level,
    dynamic_isometric = EXCLUDED.dynamic_isometric,
    movement_plane = EXCLUDED.movement_plane,
    primary_joints = EXCLUDED.primary_joints,
    is_active = true,
    updated_at = now();

INSERT INTO exercise_library (name, category, movement_patterns, bilateral_unilateral, posterior_anterior, complexity, equipment, primary_muscle, supporting_muscles, muscle_bias, joint_count_level, dynamic_isometric, movement_plane, primary_joints, is_active)
  VALUES ('Weighted Abmat Sit-up', 'accessory', '{"core_flexion"}'::text[], 'bilateral', 'anterior', 2, '{"dumbbell"}'::text[], 'Rectus abdominis', '{"Hip flexors"}'::text[], 'mid', 'regional', 'dynamic', NULL, '{}'::text[], true)
  ON CONFLICT (name) DO UPDATE SET
    category = EXCLUDED.category,
    movement_patterns = EXCLUDED.movement_patterns,
    bilateral_unilateral = EXCLUDED.bilateral_unilateral,
    posterior_anterior = EXCLUDED.posterior_anterior,
    complexity = EXCLUDED.complexity,
    equipment = EXCLUDED.equipment,
    primary_muscle = EXCLUDED.primary_muscle,
    supporting_muscles = EXCLUDED.supporting_muscles,
    muscle_bias = EXCLUDED.muscle_bias,
    joint_count_level = EXCLUDED.joint_count_level,
    dynamic_isometric = EXCLUDED.dynamic_isometric,
    movement_plane = EXCLUDED.movement_plane,
    primary_joints = EXCLUDED.primary_joints,
    is_active = true,
    updated_at = now();

INSERT INTO exercise_library (name, category, movement_patterns, bilateral_unilateral, posterior_anterior, complexity, equipment, primary_muscle, supporting_muscles, muscle_bias, joint_count_level, dynamic_isometric, movement_plane, primary_joints, is_active)
  VALUES ('Bent Knee Alternating V-up', 'accessory', '{"core_flexion"}'::text[], 'bilateral', 'anterior', 2, '{"bodyweight"}'::text[], 'Rectus abdominis', '{"Hip flexors"}'::text[], 'mid', 'regional', 'dynamic', NULL, '{}'::text[], true)
  ON CONFLICT (name) DO UPDATE SET
    category = EXCLUDED.category,
    movement_patterns = EXCLUDED.movement_patterns,
    bilateral_unilateral = EXCLUDED.bilateral_unilateral,
    posterior_anterior = EXCLUDED.posterior_anterior,
    complexity = EXCLUDED.complexity,
    equipment = EXCLUDED.equipment,
    primary_muscle = EXCLUDED.primary_muscle,
    supporting_muscles = EXCLUDED.supporting_muscles,
    muscle_bias = EXCLUDED.muscle_bias,
    joint_count_level = EXCLUDED.joint_count_level,
    dynamic_isometric = EXCLUDED.dynamic_isometric,
    movement_plane = EXCLUDED.movement_plane,
    primary_joints = EXCLUDED.primary_joints,
    is_active = true,
    updated_at = now();

INSERT INTO exercise_library (name, category, movement_patterns, bilateral_unilateral, posterior_anterior, complexity, equipment, primary_muscle, supporting_muscles, muscle_bias, joint_count_level, dynamic_isometric, movement_plane, primary_joints, is_active)
  VALUES ('Bent Knee V-up', 'accessory', '{"core_flexion"}'::text[], 'bilateral', 'anterior', 2, '{"bodyweight"}'::text[], 'Rectus abdominis', '{"Hip flexors"}'::text[], 'mid', 'regional', 'dynamic', NULL, '{}'::text[], true)
  ON CONFLICT (name) DO UPDATE SET
    category = EXCLUDED.category,
    movement_patterns = EXCLUDED.movement_patterns,
    bilateral_unilateral = EXCLUDED.bilateral_unilateral,
    posterior_anterior = EXCLUDED.posterior_anterior,
    complexity = EXCLUDED.complexity,
    equipment = EXCLUDED.equipment,
    primary_muscle = EXCLUDED.primary_muscle,
    supporting_muscles = EXCLUDED.supporting_muscles,
    muscle_bias = EXCLUDED.muscle_bias,
    joint_count_level = EXCLUDED.joint_count_level,
    dynamic_isometric = EXCLUDED.dynamic_isometric,
    movement_plane = EXCLUDED.movement_plane,
    primary_joints = EXCLUDED.primary_joints,
    is_active = true,
    updated_at = now();

INSERT INTO exercise_library (name, category, movement_patterns, bilateral_unilateral, posterior_anterior, complexity, equipment, primary_muscle, supporting_muscles, muscle_bias, joint_count_level, dynamic_isometric, movement_plane, primary_joints, is_active)
  VALUES ('Straight Leg Alternating V-up', 'accessory', '{"core_flexion"}'::text[], 'bilateral', 'anterior', 2, '{"bodyweight"}'::text[], 'Rectus abdominis', '{"Hip flexors"}'::text[], 'mid', 'regional', 'dynamic', NULL, '{}'::text[], true)
  ON CONFLICT (name) DO UPDATE SET
    category = EXCLUDED.category,
    movement_patterns = EXCLUDED.movement_patterns,
    bilateral_unilateral = EXCLUDED.bilateral_unilateral,
    posterior_anterior = EXCLUDED.posterior_anterior,
    complexity = EXCLUDED.complexity,
    equipment = EXCLUDED.equipment,
    primary_muscle = EXCLUDED.primary_muscle,
    supporting_muscles = EXCLUDED.supporting_muscles,
    muscle_bias = EXCLUDED.muscle_bias,
    joint_count_level = EXCLUDED.joint_count_level,
    dynamic_isometric = EXCLUDED.dynamic_isometric,
    movement_plane = EXCLUDED.movement_plane,
    primary_joints = EXCLUDED.primary_joints,
    is_active = true,
    updated_at = now();

INSERT INTO exercise_library (name, category, movement_patterns, bilateral_unilateral, posterior_anterior, complexity, equipment, primary_muscle, supporting_muscles, muscle_bias, joint_count_level, dynamic_isometric, movement_plane, primary_joints, is_active)
  VALUES ('Straight Leg V-up', 'accessory', '{"core_flexion"}'::text[], 'bilateral', 'anterior', 2, '{"bodyweight"}'::text[], 'Rectus abdominis', '{"Hip flexors"}'::text[], 'mid', 'regional', 'dynamic', NULL, '{}'::text[], true)
  ON CONFLICT (name) DO UPDATE SET
    category = EXCLUDED.category,
    movement_patterns = EXCLUDED.movement_patterns,
    bilateral_unilateral = EXCLUDED.bilateral_unilateral,
    posterior_anterior = EXCLUDED.posterior_anterior,
    complexity = EXCLUDED.complexity,
    equipment = EXCLUDED.equipment,
    primary_muscle = EXCLUDED.primary_muscle,
    supporting_muscles = EXCLUDED.supporting_muscles,
    muscle_bias = EXCLUDED.muscle_bias,
    joint_count_level = EXCLUDED.joint_count_level,
    dynamic_isometric = EXCLUDED.dynamic_isometric,
    movement_plane = EXCLUDED.movement_plane,
    primary_joints = EXCLUDED.primary_joints,
    is_active = true,
    updated_at = now();

INSERT INTO exercise_library (name, category, movement_patterns, bilateral_unilateral, posterior_anterior, complexity, equipment, primary_muscle, supporting_muscles, muscle_bias, joint_count_level, dynamic_isometric, movement_plane, primary_joints, is_active)
  VALUES ('Cable Crunch', 'accessory', '{"core_flexion"}'::text[], 'bilateral', 'anterior', 2, '{"cable"}'::text[], 'Rectus abdominis', '{"Obliques"}'::text[], 'mid', 'regional', 'dynamic', NULL, '{}'::text[], true)
  ON CONFLICT (name) DO UPDATE SET
    category = EXCLUDED.category,
    movement_patterns = EXCLUDED.movement_patterns,
    bilateral_unilateral = EXCLUDED.bilateral_unilateral,
    posterior_anterior = EXCLUDED.posterior_anterior,
    complexity = EXCLUDED.complexity,
    equipment = EXCLUDED.equipment,
    primary_muscle = EXCLUDED.primary_muscle,
    supporting_muscles = EXCLUDED.supporting_muscles,
    muscle_bias = EXCLUDED.muscle_bias,
    joint_count_level = EXCLUDED.joint_count_level,
    dynamic_isometric = EXCLUDED.dynamic_isometric,
    movement_plane = EXCLUDED.movement_plane,
    primary_joints = EXCLUDED.primary_joints,
    is_active = true,
    updated_at = now();

INSERT INTO exercise_library (name, category, movement_patterns, bilateral_unilateral, posterior_anterior, complexity, equipment, primary_muscle, supporting_muscles, muscle_bias, joint_count_level, dynamic_isometric, movement_plane, primary_joints, is_active)
  VALUES ('Side Plank', 'accessory', '{"core_anti_lateral_flexion"}'::text[], 'bilateral', NULL, 1, '{"bodyweight"}'::text[], 'Obliques', '{"Glute med/min","QL"}'::text[], 'mid', 'regional', 'isometric', NULL, '{}'::text[], true)
  ON CONFLICT (name) DO UPDATE SET
    category = EXCLUDED.category,
    movement_patterns = EXCLUDED.movement_patterns,
    bilateral_unilateral = EXCLUDED.bilateral_unilateral,
    posterior_anterior = EXCLUDED.posterior_anterior,
    complexity = EXCLUDED.complexity,
    equipment = EXCLUDED.equipment,
    primary_muscle = EXCLUDED.primary_muscle,
    supporting_muscles = EXCLUDED.supporting_muscles,
    muscle_bias = EXCLUDED.muscle_bias,
    joint_count_level = EXCLUDED.joint_count_level,
    dynamic_isometric = EXCLUDED.dynamic_isometric,
    movement_plane = EXCLUDED.movement_plane,
    primary_joints = EXCLUDED.primary_joints,
    is_active = true,
    updated_at = now();

INSERT INTO exercise_library (name, category, movement_patterns, bilateral_unilateral, posterior_anterior, complexity, equipment, primary_muscle, supporting_muscles, muscle_bias, joint_count_level, dynamic_isometric, movement_plane, primary_joints, is_active)
  VALUES ('Side Plank Hip Touch', 'accessory', '{"core_anti_lateral_flexion"}'::text[], 'bilateral', NULL, 2, '{"bodyweight"}'::text[], 'Obliques', '{"Glute med/min","QL"}'::text[], 'mid', 'regional', 'dynamic', NULL, '{}'::text[], true)
  ON CONFLICT (name) DO UPDATE SET
    category = EXCLUDED.category,
    movement_patterns = EXCLUDED.movement_patterns,
    bilateral_unilateral = EXCLUDED.bilateral_unilateral,
    posterior_anterior = EXCLUDED.posterior_anterior,
    complexity = EXCLUDED.complexity,
    equipment = EXCLUDED.equipment,
    primary_muscle = EXCLUDED.primary_muscle,
    supporting_muscles = EXCLUDED.supporting_muscles,
    muscle_bias = EXCLUDED.muscle_bias,
    joint_count_level = EXCLUDED.joint_count_level,
    dynamic_isometric = EXCLUDED.dynamic_isometric,
    movement_plane = EXCLUDED.movement_plane,
    primary_joints = EXCLUDED.primary_joints,
    is_active = true,
    updated_at = now();

INSERT INTO exercise_library (name, category, movement_patterns, bilateral_unilateral, posterior_anterior, complexity, equipment, primary_muscle, supporting_muscles, muscle_bias, joint_count_level, dynamic_isometric, movement_plane, primary_joints, is_active)
  VALUES ('Side Plank Hip Touch (feet elevated)', 'accessory', '{"core_anti_lateral_flexion"}'::text[], 'bilateral', NULL, 2, '{"bench"}'::text[], 'Obliques', '{"Glute med/min","QL"}'::text[], 'mid', 'regional', 'dynamic', NULL, '{}'::text[], true)
  ON CONFLICT (name) DO UPDATE SET
    category = EXCLUDED.category,
    movement_patterns = EXCLUDED.movement_patterns,
    bilateral_unilateral = EXCLUDED.bilateral_unilateral,
    posterior_anterior = EXCLUDED.posterior_anterior,
    complexity = EXCLUDED.complexity,
    equipment = EXCLUDED.equipment,
    primary_muscle = EXCLUDED.primary_muscle,
    supporting_muscles = EXCLUDED.supporting_muscles,
    muscle_bias = EXCLUDED.muscle_bias,
    joint_count_level = EXCLUDED.joint_count_level,
    dynamic_isometric = EXCLUDED.dynamic_isometric,
    movement_plane = EXCLUDED.movement_plane,
    primary_joints = EXCLUDED.primary_joints,
    is_active = true,
    updated_at = now();

INSERT INTO exercise_library (name, category, movement_patterns, bilateral_unilateral, posterior_anterior, complexity, equipment, primary_muscle, supporting_muscles, muscle_bias, joint_count_level, dynamic_isometric, movement_plane, primary_joints, is_active)
  VALUES ('Side Plank (feet elevated)', 'accessory', '{"core_anti_lateral_flexion"}'::text[], 'bilateral', NULL, 2, '{"bench"}'::text[], 'Obliques', '{"Glute med/min","QL"}'::text[], 'mid', 'regional', 'isometric', NULL, '{}'::text[], true)
  ON CONFLICT (name) DO UPDATE SET
    category = EXCLUDED.category,
    movement_patterns = EXCLUDED.movement_patterns,
    bilateral_unilateral = EXCLUDED.bilateral_unilateral,
    posterior_anterior = EXCLUDED.posterior_anterior,
    complexity = EXCLUDED.complexity,
    equipment = EXCLUDED.equipment,
    primary_muscle = EXCLUDED.primary_muscle,
    supporting_muscles = EXCLUDED.supporting_muscles,
    muscle_bias = EXCLUDED.muscle_bias,
    joint_count_level = EXCLUDED.joint_count_level,
    dynamic_isometric = EXCLUDED.dynamic_isometric,
    movement_plane = EXCLUDED.movement_plane,
    primary_joints = EXCLUDED.primary_joints,
    is_active = true,
    updated_at = now();

INSERT INTO exercise_library (name, category, movement_patterns, bilateral_unilateral, posterior_anterior, complexity, equipment, primary_muscle, supporting_muscles, muscle_bias, joint_count_level, dynamic_isometric, movement_plane, primary_joints, is_active)
  VALUES ('Side Plank (elbow elevated)', 'accessory', '{"core_anti_lateral_flexion"}'::text[], 'bilateral', NULL, 1, '{"bench"}'::text[], 'Obliques', '{"Glute med/min","QL"}'::text[], 'mid', 'regional', 'isometric', NULL, '{}'::text[], true)
  ON CONFLICT (name) DO UPDATE SET
    category = EXCLUDED.category,
    movement_patterns = EXCLUDED.movement_patterns,
    bilateral_unilateral = EXCLUDED.bilateral_unilateral,
    posterior_anterior = EXCLUDED.posterior_anterior,
    complexity = EXCLUDED.complexity,
    equipment = EXCLUDED.equipment,
    primary_muscle = EXCLUDED.primary_muscle,
    supporting_muscles = EXCLUDED.supporting_muscles,
    muscle_bias = EXCLUDED.muscle_bias,
    joint_count_level = EXCLUDED.joint_count_level,
    dynamic_isometric = EXCLUDED.dynamic_isometric,
    movement_plane = EXCLUDED.movement_plane,
    primary_joints = EXCLUDED.primary_joints,
    is_active = true,
    updated_at = now();

INSERT INTO exercise_library (name, category, movement_patterns, bilateral_unilateral, posterior_anterior, complexity, equipment, primary_muscle, supporting_muscles, muscle_bias, joint_count_level, dynamic_isometric, movement_plane, primary_joints, is_active)
  VALUES ('Side Star Plank (elbow) (isometric)', 'accessory', '{"core_anti_lateral_flexion"}'::text[], 'unilateral', NULL, 2, '{"bodyweight"}'::text[], 'Obliques', '{"Glute med/min","QL"}'::text[], 'mid', 'regional', 'isometric', NULL, '{}'::text[], true)
  ON CONFLICT (name) DO UPDATE SET
    category = EXCLUDED.category,
    movement_patterns = EXCLUDED.movement_patterns,
    bilateral_unilateral = EXCLUDED.bilateral_unilateral,
    posterior_anterior = EXCLUDED.posterior_anterior,
    complexity = EXCLUDED.complexity,
    equipment = EXCLUDED.equipment,
    primary_muscle = EXCLUDED.primary_muscle,
    supporting_muscles = EXCLUDED.supporting_muscles,
    muscle_bias = EXCLUDED.muscle_bias,
    joint_count_level = EXCLUDED.joint_count_level,
    dynamic_isometric = EXCLUDED.dynamic_isometric,
    movement_plane = EXCLUDED.movement_plane,
    primary_joints = EXCLUDED.primary_joints,
    is_active = true,
    updated_at = now();

INSERT INTO exercise_library (name, category, movement_patterns, bilateral_unilateral, posterior_anterior, complexity, equipment, primary_muscle, supporting_muscles, muscle_bias, joint_count_level, dynamic_isometric, movement_plane, primary_joints, is_active)
  VALUES ('Side Star Plank (elbow) (dynamic)', 'accessory', '{"core_anti_lateral_flexion"}'::text[], 'unilateral', NULL, 2, '{"bodyweight"}'::text[], 'Obliques', '{"Glute med/min","QL"}'::text[], 'mid', 'regional', 'dynamic', NULL, '{}'::text[], true)
  ON CONFLICT (name) DO UPDATE SET
    category = EXCLUDED.category,
    movement_patterns = EXCLUDED.movement_patterns,
    bilateral_unilateral = EXCLUDED.bilateral_unilateral,
    posterior_anterior = EXCLUDED.posterior_anterior,
    complexity = EXCLUDED.complexity,
    equipment = EXCLUDED.equipment,
    primary_muscle = EXCLUDED.primary_muscle,
    supporting_muscles = EXCLUDED.supporting_muscles,
    muscle_bias = EXCLUDED.muscle_bias,
    joint_count_level = EXCLUDED.joint_count_level,
    dynamic_isometric = EXCLUDED.dynamic_isometric,
    movement_plane = EXCLUDED.movement_plane,
    primary_joints = EXCLUDED.primary_joints,
    is_active = true,
    updated_at = now();

INSERT INTO exercise_library (name, category, movement_patterns, bilateral_unilateral, posterior_anterior, complexity, equipment, primary_muscle, supporting_muscles, muscle_bias, joint_count_level, dynamic_isometric, movement_plane, primary_joints, is_active)
  VALUES ('Side Star Plank (on hand) (isometric)', 'accessory', '{"core_anti_lateral_flexion"}'::text[], 'unilateral', NULL, 2, '{"bodyweight"}'::text[], 'Obliques', '{"Glute med/min","QL"}'::text[], 'mid', 'regional', 'isometric', NULL, '{}'::text[], true)
  ON CONFLICT (name) DO UPDATE SET
    category = EXCLUDED.category,
    movement_patterns = EXCLUDED.movement_patterns,
    bilateral_unilateral = EXCLUDED.bilateral_unilateral,
    posterior_anterior = EXCLUDED.posterior_anterior,
    complexity = EXCLUDED.complexity,
    equipment = EXCLUDED.equipment,
    primary_muscle = EXCLUDED.primary_muscle,
    supporting_muscles = EXCLUDED.supporting_muscles,
    muscle_bias = EXCLUDED.muscle_bias,
    joint_count_level = EXCLUDED.joint_count_level,
    dynamic_isometric = EXCLUDED.dynamic_isometric,
    movement_plane = EXCLUDED.movement_plane,
    primary_joints = EXCLUDED.primary_joints,
    is_active = true,
    updated_at = now();

INSERT INTO exercise_library (name, category, movement_patterns, bilateral_unilateral, posterior_anterior, complexity, equipment, primary_muscle, supporting_muscles, muscle_bias, joint_count_level, dynamic_isometric, movement_plane, primary_joints, is_active)
  VALUES ('Side Star Plank (on hand) (dynamic)', 'accessory', '{"core_anti_lateral_flexion"}'::text[], 'unilateral', NULL, 2, '{"bodyweight"}'::text[], 'Obliques', '{"Glute med/min","QL"}'::text[], 'mid', 'regional', 'dynamic', NULL, '{}'::text[], true)
  ON CONFLICT (name) DO UPDATE SET
    category = EXCLUDED.category,
    movement_patterns = EXCLUDED.movement_patterns,
    bilateral_unilateral = EXCLUDED.bilateral_unilateral,
    posterior_anterior = EXCLUDED.posterior_anterior,
    complexity = EXCLUDED.complexity,
    equipment = EXCLUDED.equipment,
    primary_muscle = EXCLUDED.primary_muscle,
    supporting_muscles = EXCLUDED.supporting_muscles,
    muscle_bias = EXCLUDED.muscle_bias,
    joint_count_level = EXCLUDED.joint_count_level,
    dynamic_isometric = EXCLUDED.dynamic_isometric,
    movement_plane = EXCLUDED.movement_plane,
    primary_joints = EXCLUDED.primary_joints,
    is_active = true,
    updated_at = now();

INSERT INTO exercise_library (name, category, movement_patterns, bilateral_unilateral, posterior_anterior, complexity, equipment, primary_muscle, supporting_muscles, muscle_bias, joint_count_level, dynamic_isometric, movement_plane, primary_joints, is_active)
  VALUES ('Copenhagen Plank (weighted)', 'accessory', '{"core_anti_lateral_flexion"}'::text[], 'unilateral', NULL, 2, '{"bodyweight","dumbbell"}'::text[], 'Obliques', '{"Adductors","glute med/min"}'::text[], 'mid', 'regional', 'isometric', NULL, '{}'::text[], true)
  ON CONFLICT (name) DO UPDATE SET
    category = EXCLUDED.category,
    movement_patterns = EXCLUDED.movement_patterns,
    bilateral_unilateral = EXCLUDED.bilateral_unilateral,
    posterior_anterior = EXCLUDED.posterior_anterior,
    complexity = EXCLUDED.complexity,
    equipment = EXCLUDED.equipment,
    primary_muscle = EXCLUDED.primary_muscle,
    supporting_muscles = EXCLUDED.supporting_muscles,
    muscle_bias = EXCLUDED.muscle_bias,
    joint_count_level = EXCLUDED.joint_count_level,
    dynamic_isometric = EXCLUDED.dynamic_isometric,
    movement_plane = EXCLUDED.movement_plane,
    primary_joints = EXCLUDED.primary_joints,
    is_active = true,
    updated_at = now();

INSERT INTO exercise_library (name, category, movement_patterns, bilateral_unilateral, posterior_anterior, complexity, equipment, primary_muscle, supporting_muscles, muscle_bias, joint_count_level, dynamic_isometric, movement_plane, primary_joints, is_active)
  VALUES ('DB/KB Side Bend', 'accessory', '{"core_lateral_flexion"}'::text[], 'unilateral', NULL, 2, '{"dumbbell"}'::text[], 'Obliques', '{"QL","glute med/min"}'::text[], 'lengthened', 'regional', 'dynamic', NULL, '{}'::text[], true)
  ON CONFLICT (name) DO UPDATE SET
    category = EXCLUDED.category,
    movement_patterns = EXCLUDED.movement_patterns,
    bilateral_unilateral = EXCLUDED.bilateral_unilateral,
    posterior_anterior = EXCLUDED.posterior_anterior,
    complexity = EXCLUDED.complexity,
    equipment = EXCLUDED.equipment,
    primary_muscle = EXCLUDED.primary_muscle,
    supporting_muscles = EXCLUDED.supporting_muscles,
    muscle_bias = EXCLUDED.muscle_bias,
    joint_count_level = EXCLUDED.joint_count_level,
    dynamic_isometric = EXCLUDED.dynamic_isometric,
    movement_plane = EXCLUDED.movement_plane,
    primary_joints = EXCLUDED.primary_joints,
    is_active = true,
    updated_at = now();

INSERT INTO exercise_library (name, category, movement_patterns, bilateral_unilateral, posterior_anterior, complexity, equipment, primary_muscle, supporting_muscles, muscle_bias, joint_count_level, dynamic_isometric, movement_plane, primary_joints, is_active)
  VALUES ('DB/KB Suitcase Hold', 'accessory', '{"core_anti_lateral_flexion"}'::text[], 'unilateral', NULL, 1, '{"dumbbell"}'::text[], 'Obliques', '{"QL","grip/forearm"}'::text[], 'mid', 'regional', 'isometric', NULL, '{}'::text[], true)
  ON CONFLICT (name) DO UPDATE SET
    category = EXCLUDED.category,
    movement_patterns = EXCLUDED.movement_patterns,
    bilateral_unilateral = EXCLUDED.bilateral_unilateral,
    posterior_anterior = EXCLUDED.posterior_anterior,
    complexity = EXCLUDED.complexity,
    equipment = EXCLUDED.equipment,
    primary_muscle = EXCLUDED.primary_muscle,
    supporting_muscles = EXCLUDED.supporting_muscles,
    muscle_bias = EXCLUDED.muscle_bias,
    joint_count_level = EXCLUDED.joint_count_level,
    dynamic_isometric = EXCLUDED.dynamic_isometric,
    movement_plane = EXCLUDED.movement_plane,
    primary_joints = EXCLUDED.primary_joints,
    is_active = true,
    updated_at = now();

INSERT INTO exercise_library (name, category, movement_patterns, bilateral_unilateral, posterior_anterior, complexity, equipment, primary_muscle, supporting_muscles, muscle_bias, joint_count_level, dynamic_isometric, movement_plane, primary_joints, is_active)
  VALUES ('DB/KB Suitcase Carry', 'accessory', '{"carry"}'::text[], 'unilateral', NULL, 2, '{"dumbbell"}'::text[], 'Obliques', '{"QL","grip/forearm"}'::text[], 'mid', 'regional', 'dynamic', NULL, '{}'::text[], true)
  ON CONFLICT (name) DO UPDATE SET
    category = EXCLUDED.category,
    movement_patterns = EXCLUDED.movement_patterns,
    bilateral_unilateral = EXCLUDED.bilateral_unilateral,
    posterior_anterior = EXCLUDED.posterior_anterior,
    complexity = EXCLUDED.complexity,
    equipment = EXCLUDED.equipment,
    primary_muscle = EXCLUDED.primary_muscle,
    supporting_muscles = EXCLUDED.supporting_muscles,
    muscle_bias = EXCLUDED.muscle_bias,
    joint_count_level = EXCLUDED.joint_count_level,
    dynamic_isometric = EXCLUDED.dynamic_isometric,
    movement_plane = EXCLUDED.movement_plane,
    primary_joints = EXCLUDED.primary_joints,
    is_active = true,
    updated_at = now();

INSERT INTO exercise_library (name, category, movement_patterns, bilateral_unilateral, posterior_anterior, complexity, equipment, primary_muscle, supporting_muscles, muscle_bias, joint_count_level, dynamic_isometric, movement_plane, primary_joints, is_active)
  VALUES ('Neutral Stance Cable Pallof Press (reps)', 'accessory', '{"core_rotation"}'::text[], 'bilateral', NULL, 1, '{"cable"}'::text[], 'Obliques', '{"Glute med/min","rectus abdominis"}'::text[], 'mid', 'regional', 'dynamic', NULL, '{}'::text[], true)
  ON CONFLICT (name) DO UPDATE SET
    category = EXCLUDED.category,
    movement_patterns = EXCLUDED.movement_patterns,
    bilateral_unilateral = EXCLUDED.bilateral_unilateral,
    posterior_anterior = EXCLUDED.posterior_anterior,
    complexity = EXCLUDED.complexity,
    equipment = EXCLUDED.equipment,
    primary_muscle = EXCLUDED.primary_muscle,
    supporting_muscles = EXCLUDED.supporting_muscles,
    muscle_bias = EXCLUDED.muscle_bias,
    joint_count_level = EXCLUDED.joint_count_level,
    dynamic_isometric = EXCLUDED.dynamic_isometric,
    movement_plane = EXCLUDED.movement_plane,
    primary_joints = EXCLUDED.primary_joints,
    is_active = true,
    updated_at = now();

INSERT INTO exercise_library (name, category, movement_patterns, bilateral_unilateral, posterior_anterior, complexity, equipment, primary_muscle, supporting_muscles, muscle_bias, joint_count_level, dynamic_isometric, movement_plane, primary_joints, is_active)
  VALUES ('Neutral Stance Banded Pallof Press (reps)', 'accessory', '{"core_rotation"}'::text[], 'bilateral', NULL, 1, '{"band"}'::text[], 'Obliques', '{"Glute med/min","rectus abdominis"}'::text[], 'mid', 'regional', 'dynamic', NULL, '{}'::text[], true)
  ON CONFLICT (name) DO UPDATE SET
    category = EXCLUDED.category,
    movement_patterns = EXCLUDED.movement_patterns,
    bilateral_unilateral = EXCLUDED.bilateral_unilateral,
    posterior_anterior = EXCLUDED.posterior_anterior,
    complexity = EXCLUDED.complexity,
    equipment = EXCLUDED.equipment,
    primary_muscle = EXCLUDED.primary_muscle,
    supporting_muscles = EXCLUDED.supporting_muscles,
    muscle_bias = EXCLUDED.muscle_bias,
    joint_count_level = EXCLUDED.joint_count_level,
    dynamic_isometric = EXCLUDED.dynamic_isometric,
    movement_plane = EXCLUDED.movement_plane,
    primary_joints = EXCLUDED.primary_joints,
    is_active = true,
    updated_at = now();

INSERT INTO exercise_library (name, category, movement_patterns, bilateral_unilateral, posterior_anterior, complexity, equipment, primary_muscle, supporting_muscles, muscle_bias, joint_count_level, dynamic_isometric, movement_plane, primary_joints, is_active)
  VALUES ('Neutral Stance Cable Pallof Hold', 'accessory', '{"core_rotation"}'::text[], 'bilateral', NULL, 1, '{"cable"}'::text[], 'Obliques', '{"Glute med/min","rectus abdominis"}'::text[], 'mid', 'regional', 'isometric', NULL, '{}'::text[], true)
  ON CONFLICT (name) DO UPDATE SET
    category = EXCLUDED.category,
    movement_patterns = EXCLUDED.movement_patterns,
    bilateral_unilateral = EXCLUDED.bilateral_unilateral,
    posterior_anterior = EXCLUDED.posterior_anterior,
    complexity = EXCLUDED.complexity,
    equipment = EXCLUDED.equipment,
    primary_muscle = EXCLUDED.primary_muscle,
    supporting_muscles = EXCLUDED.supporting_muscles,
    muscle_bias = EXCLUDED.muscle_bias,
    joint_count_level = EXCLUDED.joint_count_level,
    dynamic_isometric = EXCLUDED.dynamic_isometric,
    movement_plane = EXCLUDED.movement_plane,
    primary_joints = EXCLUDED.primary_joints,
    is_active = true,
    updated_at = now();

INSERT INTO exercise_library (name, category, movement_patterns, bilateral_unilateral, posterior_anterior, complexity, equipment, primary_muscle, supporting_muscles, muscle_bias, joint_count_level, dynamic_isometric, movement_plane, primary_joints, is_active)
  VALUES ('Neutral Stance Banded Pallof Hold', 'accessory', '{"core_rotation"}'::text[], 'bilateral', NULL, 1, '{"band"}'::text[], 'Obliques', '{"Glute med/min","rectus abdominis"}'::text[], 'mid', 'regional', 'isometric', NULL, '{}'::text[], true)
  ON CONFLICT (name) DO UPDATE SET
    category = EXCLUDED.category,
    movement_patterns = EXCLUDED.movement_patterns,
    bilateral_unilateral = EXCLUDED.bilateral_unilateral,
    posterior_anterior = EXCLUDED.posterior_anterior,
    complexity = EXCLUDED.complexity,
    equipment = EXCLUDED.equipment,
    primary_muscle = EXCLUDED.primary_muscle,
    supporting_muscles = EXCLUDED.supporting_muscles,
    muscle_bias = EXCLUDED.muscle_bias,
    joint_count_level = EXCLUDED.joint_count_level,
    dynamic_isometric = EXCLUDED.dynamic_isometric,
    movement_plane = EXCLUDED.movement_plane,
    primary_joints = EXCLUDED.primary_joints,
    is_active = true,
    updated_at = now();

INSERT INTO exercise_library (name, category, movement_patterns, bilateral_unilateral, posterior_anterior, complexity, equipment, primary_muscle, supporting_muscles, muscle_bias, joint_count_level, dynamic_isometric, movement_plane, primary_joints, is_active)
  VALUES ('Tall Kneeling Cable Pallof Press (reps)', 'accessory', '{"core_rotation"}'::text[], 'bilateral', NULL, 1, '{"cable"}'::text[], 'Obliques', '{"Glute med/min","rectus abdominis"}'::text[], 'mid', 'regional', 'dynamic', NULL, '{}'::text[], true)
  ON CONFLICT (name) DO UPDATE SET
    category = EXCLUDED.category,
    movement_patterns = EXCLUDED.movement_patterns,
    bilateral_unilateral = EXCLUDED.bilateral_unilateral,
    posterior_anterior = EXCLUDED.posterior_anterior,
    complexity = EXCLUDED.complexity,
    equipment = EXCLUDED.equipment,
    primary_muscle = EXCLUDED.primary_muscle,
    supporting_muscles = EXCLUDED.supporting_muscles,
    muscle_bias = EXCLUDED.muscle_bias,
    joint_count_level = EXCLUDED.joint_count_level,
    dynamic_isometric = EXCLUDED.dynamic_isometric,
    movement_plane = EXCLUDED.movement_plane,
    primary_joints = EXCLUDED.primary_joints,
    is_active = true,
    updated_at = now();

INSERT INTO exercise_library (name, category, movement_patterns, bilateral_unilateral, posterior_anterior, complexity, equipment, primary_muscle, supporting_muscles, muscle_bias, joint_count_level, dynamic_isometric, movement_plane, primary_joints, is_active)
  VALUES ('Tall Kneeling Banded Pallof Press (reps)', 'accessory', '{"core_rotation"}'::text[], 'bilateral', NULL, 1, '{"band"}'::text[], 'Obliques', '{"Glute med/min","rectus abdominis"}'::text[], 'mid', 'regional', 'dynamic', NULL, '{}'::text[], true)
  ON CONFLICT (name) DO UPDATE SET
    category = EXCLUDED.category,
    movement_patterns = EXCLUDED.movement_patterns,
    bilateral_unilateral = EXCLUDED.bilateral_unilateral,
    posterior_anterior = EXCLUDED.posterior_anterior,
    complexity = EXCLUDED.complexity,
    equipment = EXCLUDED.equipment,
    primary_muscle = EXCLUDED.primary_muscle,
    supporting_muscles = EXCLUDED.supporting_muscles,
    muscle_bias = EXCLUDED.muscle_bias,
    joint_count_level = EXCLUDED.joint_count_level,
    dynamic_isometric = EXCLUDED.dynamic_isometric,
    movement_plane = EXCLUDED.movement_plane,
    primary_joints = EXCLUDED.primary_joints,
    is_active = true,
    updated_at = now();

INSERT INTO exercise_library (name, category, movement_patterns, bilateral_unilateral, posterior_anterior, complexity, equipment, primary_muscle, supporting_muscles, muscle_bias, joint_count_level, dynamic_isometric, movement_plane, primary_joints, is_active)
  VALUES ('Tall Kneeling Cable Pallof Hold', 'accessory', '{"core_rotation"}'::text[], 'bilateral', NULL, 1, '{"cable"}'::text[], 'Obliques', '{"Glute med/min","rectus abdominis"}'::text[], 'mid', 'regional', 'isometric', NULL, '{}'::text[], true)
  ON CONFLICT (name) DO UPDATE SET
    category = EXCLUDED.category,
    movement_patterns = EXCLUDED.movement_patterns,
    bilateral_unilateral = EXCLUDED.bilateral_unilateral,
    posterior_anterior = EXCLUDED.posterior_anterior,
    complexity = EXCLUDED.complexity,
    equipment = EXCLUDED.equipment,
    primary_muscle = EXCLUDED.primary_muscle,
    supporting_muscles = EXCLUDED.supporting_muscles,
    muscle_bias = EXCLUDED.muscle_bias,
    joint_count_level = EXCLUDED.joint_count_level,
    dynamic_isometric = EXCLUDED.dynamic_isometric,
    movement_plane = EXCLUDED.movement_plane,
    primary_joints = EXCLUDED.primary_joints,
    is_active = true,
    updated_at = now();

INSERT INTO exercise_library (name, category, movement_patterns, bilateral_unilateral, posterior_anterior, complexity, equipment, primary_muscle, supporting_muscles, muscle_bias, joint_count_level, dynamic_isometric, movement_plane, primary_joints, is_active)
  VALUES ('Tall Kneeling Banded Pallof Hold', 'accessory', '{"core_rotation"}'::text[], 'bilateral', NULL, 1, '{"band"}'::text[], 'Obliques', '{"Glute med/min","rectus abdominis"}'::text[], 'mid', 'regional', 'isometric', NULL, '{}'::text[], true)
  ON CONFLICT (name) DO UPDATE SET
    category = EXCLUDED.category,
    movement_patterns = EXCLUDED.movement_patterns,
    bilateral_unilateral = EXCLUDED.bilateral_unilateral,
    posterior_anterior = EXCLUDED.posterior_anterior,
    complexity = EXCLUDED.complexity,
    equipment = EXCLUDED.equipment,
    primary_muscle = EXCLUDED.primary_muscle,
    supporting_muscles = EXCLUDED.supporting_muscles,
    muscle_bias = EXCLUDED.muscle_bias,
    joint_count_level = EXCLUDED.joint_count_level,
    dynamic_isometric = EXCLUDED.dynamic_isometric,
    movement_plane = EXCLUDED.movement_plane,
    primary_joints = EXCLUDED.primary_joints,
    is_active = true,
    updated_at = now();

INSERT INTO exercise_library (name, category, movement_patterns, bilateral_unilateral, posterior_anterior, complexity, equipment, primary_muscle, supporting_muscles, muscle_bias, joint_count_level, dynamic_isometric, movement_plane, primary_joints, is_active)
  VALUES ('Half Kneeling Cable Pallof Press (reps)', 'accessory', '{"core_rotation"}'::text[], 'bilateral', NULL, 2, '{"cable"}'::text[], 'Obliques', '{"Glute med/min","rectus abdominis"}'::text[], 'mid', 'regional', 'dynamic', NULL, '{}'::text[], true)
  ON CONFLICT (name) DO UPDATE SET
    category = EXCLUDED.category,
    movement_patterns = EXCLUDED.movement_patterns,
    bilateral_unilateral = EXCLUDED.bilateral_unilateral,
    posterior_anterior = EXCLUDED.posterior_anterior,
    complexity = EXCLUDED.complexity,
    equipment = EXCLUDED.equipment,
    primary_muscle = EXCLUDED.primary_muscle,
    supporting_muscles = EXCLUDED.supporting_muscles,
    muscle_bias = EXCLUDED.muscle_bias,
    joint_count_level = EXCLUDED.joint_count_level,
    dynamic_isometric = EXCLUDED.dynamic_isometric,
    movement_plane = EXCLUDED.movement_plane,
    primary_joints = EXCLUDED.primary_joints,
    is_active = true,
    updated_at = now();

INSERT INTO exercise_library (name, category, movement_patterns, bilateral_unilateral, posterior_anterior, complexity, equipment, primary_muscle, supporting_muscles, muscle_bias, joint_count_level, dynamic_isometric, movement_plane, primary_joints, is_active)
  VALUES ('Half Kneeling Banded Pallof Press (reps)', 'accessory', '{"core_rotation"}'::text[], 'bilateral', NULL, 2, '{"band"}'::text[], 'Obliques', '{"Glute med/min","rectus abdominis"}'::text[], 'mid', 'regional', 'dynamic', NULL, '{}'::text[], true)
  ON CONFLICT (name) DO UPDATE SET
    category = EXCLUDED.category,
    movement_patterns = EXCLUDED.movement_patterns,
    bilateral_unilateral = EXCLUDED.bilateral_unilateral,
    posterior_anterior = EXCLUDED.posterior_anterior,
    complexity = EXCLUDED.complexity,
    equipment = EXCLUDED.equipment,
    primary_muscle = EXCLUDED.primary_muscle,
    supporting_muscles = EXCLUDED.supporting_muscles,
    muscle_bias = EXCLUDED.muscle_bias,
    joint_count_level = EXCLUDED.joint_count_level,
    dynamic_isometric = EXCLUDED.dynamic_isometric,
    movement_plane = EXCLUDED.movement_plane,
    primary_joints = EXCLUDED.primary_joints,
    is_active = true,
    updated_at = now();

INSERT INTO exercise_library (name, category, movement_patterns, bilateral_unilateral, posterior_anterior, complexity, equipment, primary_muscle, supporting_muscles, muscle_bias, joint_count_level, dynamic_isometric, movement_plane, primary_joints, is_active)
  VALUES ('Half Kneeling Cable Pallof Hold', 'accessory', '{"core_rotation"}'::text[], 'bilateral', NULL, 2, '{"cable"}'::text[], 'Obliques', '{"Glute med/min","rectus abdominis"}'::text[], 'mid', 'regional', 'isometric', NULL, '{}'::text[], true)
  ON CONFLICT (name) DO UPDATE SET
    category = EXCLUDED.category,
    movement_patterns = EXCLUDED.movement_patterns,
    bilateral_unilateral = EXCLUDED.bilateral_unilateral,
    posterior_anterior = EXCLUDED.posterior_anterior,
    complexity = EXCLUDED.complexity,
    equipment = EXCLUDED.equipment,
    primary_muscle = EXCLUDED.primary_muscle,
    supporting_muscles = EXCLUDED.supporting_muscles,
    muscle_bias = EXCLUDED.muscle_bias,
    joint_count_level = EXCLUDED.joint_count_level,
    dynamic_isometric = EXCLUDED.dynamic_isometric,
    movement_plane = EXCLUDED.movement_plane,
    primary_joints = EXCLUDED.primary_joints,
    is_active = true,
    updated_at = now();

INSERT INTO exercise_library (name, category, movement_patterns, bilateral_unilateral, posterior_anterior, complexity, equipment, primary_muscle, supporting_muscles, muscle_bias, joint_count_level, dynamic_isometric, movement_plane, primary_joints, is_active)
  VALUES ('Half Kneeling Banded Pallof Hold', 'accessory', '{"core_rotation"}'::text[], 'bilateral', NULL, 2, '{"band"}'::text[], 'Obliques', '{"Glute med/min","rectus abdominis"}'::text[], 'mid', 'regional', 'isometric', NULL, '{}'::text[], true)
  ON CONFLICT (name) DO UPDATE SET
    category = EXCLUDED.category,
    movement_patterns = EXCLUDED.movement_patterns,
    bilateral_unilateral = EXCLUDED.bilateral_unilateral,
    posterior_anterior = EXCLUDED.posterior_anterior,
    complexity = EXCLUDED.complexity,
    equipment = EXCLUDED.equipment,
    primary_muscle = EXCLUDED.primary_muscle,
    supporting_muscles = EXCLUDED.supporting_muscles,
    muscle_bias = EXCLUDED.muscle_bias,
    joint_count_level = EXCLUDED.joint_count_level,
    dynamic_isometric = EXCLUDED.dynamic_isometric,
    movement_plane = EXCLUDED.movement_plane,
    primary_joints = EXCLUDED.primary_joints,
    is_active = true,
    updated_at = now();

INSERT INTO exercise_library (name, category, movement_patterns, bilateral_unilateral, posterior_anterior, complexity, equipment, primary_muscle, supporting_muscles, muscle_bias, joint_count_level, dynamic_isometric, movement_plane, primary_joints, is_active)
  VALUES ('Split Stance Cable Pallof Press (reps)', 'accessory', '{"core_rotation"}'::text[], 'bilateral', NULL, 2, '{"cable"}'::text[], 'Obliques', '{"Glute med/min","rectus abdominis"}'::text[], 'mid', 'regional', 'dynamic', NULL, '{}'::text[], true)
  ON CONFLICT (name) DO UPDATE SET
    category = EXCLUDED.category,
    movement_patterns = EXCLUDED.movement_patterns,
    bilateral_unilateral = EXCLUDED.bilateral_unilateral,
    posterior_anterior = EXCLUDED.posterior_anterior,
    complexity = EXCLUDED.complexity,
    equipment = EXCLUDED.equipment,
    primary_muscle = EXCLUDED.primary_muscle,
    supporting_muscles = EXCLUDED.supporting_muscles,
    muscle_bias = EXCLUDED.muscle_bias,
    joint_count_level = EXCLUDED.joint_count_level,
    dynamic_isometric = EXCLUDED.dynamic_isometric,
    movement_plane = EXCLUDED.movement_plane,
    primary_joints = EXCLUDED.primary_joints,
    is_active = true,
    updated_at = now();

INSERT INTO exercise_library (name, category, movement_patterns, bilateral_unilateral, posterior_anterior, complexity, equipment, primary_muscle, supporting_muscles, muscle_bias, joint_count_level, dynamic_isometric, movement_plane, primary_joints, is_active)
  VALUES ('Split Stance Banded Pallof Press (reps)', 'accessory', '{"core_rotation"}'::text[], 'bilateral', NULL, 2, '{"band"}'::text[], 'Obliques', '{"Glute med/min","rectus abdominis"}'::text[], 'mid', 'regional', 'dynamic', NULL, '{}'::text[], true)
  ON CONFLICT (name) DO UPDATE SET
    category = EXCLUDED.category,
    movement_patterns = EXCLUDED.movement_patterns,
    bilateral_unilateral = EXCLUDED.bilateral_unilateral,
    posterior_anterior = EXCLUDED.posterior_anterior,
    complexity = EXCLUDED.complexity,
    equipment = EXCLUDED.equipment,
    primary_muscle = EXCLUDED.primary_muscle,
    supporting_muscles = EXCLUDED.supporting_muscles,
    muscle_bias = EXCLUDED.muscle_bias,
    joint_count_level = EXCLUDED.joint_count_level,
    dynamic_isometric = EXCLUDED.dynamic_isometric,
    movement_plane = EXCLUDED.movement_plane,
    primary_joints = EXCLUDED.primary_joints,
    is_active = true,
    updated_at = now();

INSERT INTO exercise_library (name, category, movement_patterns, bilateral_unilateral, posterior_anterior, complexity, equipment, primary_muscle, supporting_muscles, muscle_bias, joint_count_level, dynamic_isometric, movement_plane, primary_joints, is_active)
  VALUES ('Split Stance Cable Pallof Hold', 'accessory', '{"core_rotation"}'::text[], 'bilateral', NULL, 2, '{"cable"}'::text[], 'Obliques', '{"Glute med/min","rectus abdominis"}'::text[], 'mid', 'regional', 'isometric', NULL, '{}'::text[], true)
  ON CONFLICT (name) DO UPDATE SET
    category = EXCLUDED.category,
    movement_patterns = EXCLUDED.movement_patterns,
    bilateral_unilateral = EXCLUDED.bilateral_unilateral,
    posterior_anterior = EXCLUDED.posterior_anterior,
    complexity = EXCLUDED.complexity,
    equipment = EXCLUDED.equipment,
    primary_muscle = EXCLUDED.primary_muscle,
    supporting_muscles = EXCLUDED.supporting_muscles,
    muscle_bias = EXCLUDED.muscle_bias,
    joint_count_level = EXCLUDED.joint_count_level,
    dynamic_isometric = EXCLUDED.dynamic_isometric,
    movement_plane = EXCLUDED.movement_plane,
    primary_joints = EXCLUDED.primary_joints,
    is_active = true,
    updated_at = now();

INSERT INTO exercise_library (name, category, movement_patterns, bilateral_unilateral, posterior_anterior, complexity, equipment, primary_muscle, supporting_muscles, muscle_bias, joint_count_level, dynamic_isometric, movement_plane, primary_joints, is_active)
  VALUES ('Split Stance Banded Pallof Hold', 'accessory', '{"core_rotation"}'::text[], 'bilateral', NULL, 2, '{"band"}'::text[], 'Obliques', '{"Glute med/min","rectus abdominis"}'::text[], 'mid', 'regional', 'isometric', NULL, '{}'::text[], true)
  ON CONFLICT (name) DO UPDATE SET
    category = EXCLUDED.category,
    movement_patterns = EXCLUDED.movement_patterns,
    bilateral_unilateral = EXCLUDED.bilateral_unilateral,
    posterior_anterior = EXCLUDED.posterior_anterior,
    complexity = EXCLUDED.complexity,
    equipment = EXCLUDED.equipment,
    primary_muscle = EXCLUDED.primary_muscle,
    supporting_muscles = EXCLUDED.supporting_muscles,
    muscle_bias = EXCLUDED.muscle_bias,
    joint_count_level = EXCLUDED.joint_count_level,
    dynamic_isometric = EXCLUDED.dynamic_isometric,
    movement_plane = EXCLUDED.movement_plane,
    primary_joints = EXCLUDED.primary_joints,
    is_active = true,
    updated_at = now();

INSERT INTO exercise_library (name, category, movement_patterns, bilateral_unilateral, posterior_anterior, complexity, equipment, primary_muscle, supporting_muscles, muscle_bias, joint_count_level, dynamic_isometric, movement_plane, primary_joints, is_active)
  VALUES ('Bird Dog (opposite arm/leg)', 'accessory', '{"spinal_extension"}'::text[], 'bilateral', 'posterior', 2, '{"bodyweight"}'::text[], 'Erector spinae', '{"Glute max","posterior deltoid"}'::text[], 'mid', 'regional', 'dynamic', NULL, '{}'::text[], true)
  ON CONFLICT (name) DO UPDATE SET
    category = EXCLUDED.category,
    movement_patterns = EXCLUDED.movement_patterns,
    bilateral_unilateral = EXCLUDED.bilateral_unilateral,
    posterior_anterior = EXCLUDED.posterior_anterior,
    complexity = EXCLUDED.complexity,
    equipment = EXCLUDED.equipment,
    primary_muscle = EXCLUDED.primary_muscle,
    supporting_muscles = EXCLUDED.supporting_muscles,
    muscle_bias = EXCLUDED.muscle_bias,
    joint_count_level = EXCLUDED.joint_count_level,
    dynamic_isometric = EXCLUDED.dynamic_isometric,
    movement_plane = EXCLUDED.movement_plane,
    primary_joints = EXCLUDED.primary_joints,
    is_active = true,
    updated_at = now();

INSERT INTO exercise_library (name, category, movement_patterns, bilateral_unilateral, posterior_anterior, complexity, equipment, primary_muscle, supporting_muscles, muscle_bias, joint_count_level, dynamic_isometric, movement_plane, primary_joints, is_active)
  VALUES ('Bird Dog (alternating arm only)', 'accessory', '{"spinal_extension"}'::text[], 'bilateral', 'posterior', 1, '{"bodyweight"}'::text[], 'Erector spinae', '{"Posterior deltoid","mid-back"}'::text[], 'mid', 'regional', 'dynamic', NULL, '{}'::text[], true)
  ON CONFLICT (name) DO UPDATE SET
    category = EXCLUDED.category,
    movement_patterns = EXCLUDED.movement_patterns,
    bilateral_unilateral = EXCLUDED.bilateral_unilateral,
    posterior_anterior = EXCLUDED.posterior_anterior,
    complexity = EXCLUDED.complexity,
    equipment = EXCLUDED.equipment,
    primary_muscle = EXCLUDED.primary_muscle,
    supporting_muscles = EXCLUDED.supporting_muscles,
    muscle_bias = EXCLUDED.muscle_bias,
    joint_count_level = EXCLUDED.joint_count_level,
    dynamic_isometric = EXCLUDED.dynamic_isometric,
    movement_plane = EXCLUDED.movement_plane,
    primary_joints = EXCLUDED.primary_joints,
    is_active = true,
    updated_at = now();

INSERT INTO exercise_library (name, category, movement_patterns, bilateral_unilateral, posterior_anterior, complexity, equipment, primary_muscle, supporting_muscles, muscle_bias, joint_count_level, dynamic_isometric, movement_plane, primary_joints, is_active)
  VALUES ('Bird Dog (alternating legs only)', 'accessory', '{"spinal_extension"}'::text[], 'bilateral', 'posterior', 1, '{"bodyweight"}'::text[], 'Glute max', '{"Erector spinae"}'::text[], 'mid', 'regional', 'dynamic', NULL, '{}'::text[], true)
  ON CONFLICT (name) DO UPDATE SET
    category = EXCLUDED.category,
    movement_patterns = EXCLUDED.movement_patterns,
    bilateral_unilateral = EXCLUDED.bilateral_unilateral,
    posterior_anterior = EXCLUDED.posterior_anterior,
    complexity = EXCLUDED.complexity,
    equipment = EXCLUDED.equipment,
    primary_muscle = EXCLUDED.primary_muscle,
    supporting_muscles = EXCLUDED.supporting_muscles,
    muscle_bias = EXCLUDED.muscle_bias,
    joint_count_level = EXCLUDED.joint_count_level,
    dynamic_isometric = EXCLUDED.dynamic_isometric,
    movement_plane = EXCLUDED.movement_plane,
    primary_joints = EXCLUDED.primary_joints,
    is_active = true,
    updated_at = now();

INSERT INTO exercise_library (name, category, movement_patterns, bilateral_unilateral, posterior_anterior, complexity, equipment, primary_muscle, supporting_muscles, muscle_bias, joint_count_level, dynamic_isometric, movement_plane, primary_joints, is_active)
  VALUES ('Cable Woodchop (high-to-low)', 'accessory', '{"core_rotation"}'::text[], 'bilateral', NULL, 2, '{"cable"}'::text[], 'Obliques', '{"Glute med/min","rectus abdominis"}'::text[], 'mid', 'regional', 'dynamic', NULL, '{}'::text[], true)
  ON CONFLICT (name) DO UPDATE SET
    category = EXCLUDED.category,
    movement_patterns = EXCLUDED.movement_patterns,
    bilateral_unilateral = EXCLUDED.bilateral_unilateral,
    posterior_anterior = EXCLUDED.posterior_anterior,
    complexity = EXCLUDED.complexity,
    equipment = EXCLUDED.equipment,
    primary_muscle = EXCLUDED.primary_muscle,
    supporting_muscles = EXCLUDED.supporting_muscles,
    muscle_bias = EXCLUDED.muscle_bias,
    joint_count_level = EXCLUDED.joint_count_level,
    dynamic_isometric = EXCLUDED.dynamic_isometric,
    movement_plane = EXCLUDED.movement_plane,
    primary_joints = EXCLUDED.primary_joints,
    is_active = true,
    updated_at = now();

INSERT INTO exercise_library (name, category, movement_patterns, bilateral_unilateral, posterior_anterior, complexity, equipment, primary_muscle, supporting_muscles, muscle_bias, joint_count_level, dynamic_isometric, movement_plane, primary_joints, is_active)
  VALUES ('Cable Woodchop (low-to-high)', 'accessory', '{"core_rotation"}'::text[], 'bilateral', NULL, 2, '{"cable"}'::text[], 'Obliques', '{"Glute med/min","rectus abdominis"}'::text[], 'mid', 'regional', 'dynamic', NULL, '{}'::text[], true)
  ON CONFLICT (name) DO UPDATE SET
    category = EXCLUDED.category,
    movement_patterns = EXCLUDED.movement_patterns,
    bilateral_unilateral = EXCLUDED.bilateral_unilateral,
    posterior_anterior = EXCLUDED.posterior_anterior,
    complexity = EXCLUDED.complexity,
    equipment = EXCLUDED.equipment,
    primary_muscle = EXCLUDED.primary_muscle,
    supporting_muscles = EXCLUDED.supporting_muscles,
    muscle_bias = EXCLUDED.muscle_bias,
    joint_count_level = EXCLUDED.joint_count_level,
    dynamic_isometric = EXCLUDED.dynamic_isometric,
    movement_plane = EXCLUDED.movement_plane,
    primary_joints = EXCLUDED.primary_joints,
    is_active = true,
    updated_at = now();

INSERT INTO exercise_library (name, category, movement_patterns, bilateral_unilateral, posterior_anterior, complexity, equipment, primary_muscle, supporting_muscles, muscle_bias, joint_count_level, dynamic_isometric, movement_plane, primary_joints, is_active)
  VALUES ('Prone KB Pull-through', 'accessory', '{"core_rotation"}'::text[], 'bilateral', NULL, 2, '{"kettlebell"}'::text[], 'Obliques', '{"Erector spinae","lats"}'::text[], 'mid', 'regional', 'dynamic', NULL, '{}'::text[], true)
  ON CONFLICT (name) DO UPDATE SET
    category = EXCLUDED.category,
    movement_patterns = EXCLUDED.movement_patterns,
    bilateral_unilateral = EXCLUDED.bilateral_unilateral,
    posterior_anterior = EXCLUDED.posterior_anterior,
    complexity = EXCLUDED.complexity,
    equipment = EXCLUDED.equipment,
    primary_muscle = EXCLUDED.primary_muscle,
    supporting_muscles = EXCLUDED.supporting_muscles,
    muscle_bias = EXCLUDED.muscle_bias,
    joint_count_level = EXCLUDED.joint_count_level,
    dynamic_isometric = EXCLUDED.dynamic_isometric,
    movement_plane = EXCLUDED.movement_plane,
    primary_joints = EXCLUDED.primary_joints,
    is_active = true,
    updated_at = now();

INSERT INTO exercise_library (name, category, movement_patterns, bilateral_unilateral, posterior_anterior, complexity, equipment, primary_muscle, supporting_muscles, muscle_bias, joint_count_level, dynamic_isometric, movement_plane, primary_joints, is_active)
  VALUES ('Feet Anchored Russian Twist', 'accessory', '{"core_rotation"}'::text[], 'bilateral', NULL, 2, '{"bodyweight"}'::text[], 'Obliques', '{"Hip flexors"}'::text[], 'mid', 'regional', 'dynamic', NULL, '{}'::text[], true)
  ON CONFLICT (name) DO UPDATE SET
    category = EXCLUDED.category,
    movement_patterns = EXCLUDED.movement_patterns,
    bilateral_unilateral = EXCLUDED.bilateral_unilateral,
    posterior_anterior = EXCLUDED.posterior_anterior,
    complexity = EXCLUDED.complexity,
    equipment = EXCLUDED.equipment,
    primary_muscle = EXCLUDED.primary_muscle,
    supporting_muscles = EXCLUDED.supporting_muscles,
    muscle_bias = EXCLUDED.muscle_bias,
    joint_count_level = EXCLUDED.joint_count_level,
    dynamic_isometric = EXCLUDED.dynamic_isometric,
    movement_plane = EXCLUDED.movement_plane,
    primary_joints = EXCLUDED.primary_joints,
    is_active = true,
    updated_at = now();

INSERT INTO exercise_library (name, category, movement_patterns, bilateral_unilateral, posterior_anterior, complexity, equipment, primary_muscle, supporting_muscles, muscle_bias, joint_count_level, dynamic_isometric, movement_plane, primary_joints, is_active)
  VALUES ('Feet Anchored Weighted Russian Twist', 'accessory', '{"core_rotation"}'::text[], 'bilateral', NULL, 2, '{"dumbbell"}'::text[], 'Obliques', '{"Hip flexors"}'::text[], 'mid', 'regional', 'dynamic', NULL, '{}'::text[], true)
  ON CONFLICT (name) DO UPDATE SET
    category = EXCLUDED.category,
    movement_patterns = EXCLUDED.movement_patterns,
    bilateral_unilateral = EXCLUDED.bilateral_unilateral,
    posterior_anterior = EXCLUDED.posterior_anterior,
    complexity = EXCLUDED.complexity,
    equipment = EXCLUDED.equipment,
    primary_muscle = EXCLUDED.primary_muscle,
    supporting_muscles = EXCLUDED.supporting_muscles,
    muscle_bias = EXCLUDED.muscle_bias,
    joint_count_level = EXCLUDED.joint_count_level,
    dynamic_isometric = EXCLUDED.dynamic_isometric,
    movement_plane = EXCLUDED.movement_plane,
    primary_joints = EXCLUDED.primary_joints,
    is_active = true,
    updated_at = now();

INSERT INTO exercise_library (name, category, movement_patterns, bilateral_unilateral, posterior_anterior, complexity, equipment, primary_muscle, supporting_muscles, muscle_bias, joint_count_level, dynamic_isometric, movement_plane, primary_joints, is_active)
  VALUES ('Weighted Russian Twist (not anchored)', 'accessory', '{"core_rotation"}'::text[], 'bilateral', NULL, 2, '{"dumbbell"}'::text[], 'Obliques', '{"Hip flexors"}'::text[], 'mid', 'regional', 'dynamic', NULL, '{}'::text[], true)
  ON CONFLICT (name) DO UPDATE SET
    category = EXCLUDED.category,
    movement_patterns = EXCLUDED.movement_patterns,
    bilateral_unilateral = EXCLUDED.bilateral_unilateral,
    posterior_anterior = EXCLUDED.posterior_anterior,
    complexity = EXCLUDED.complexity,
    equipment = EXCLUDED.equipment,
    primary_muscle = EXCLUDED.primary_muscle,
    supporting_muscles = EXCLUDED.supporting_muscles,
    muscle_bias = EXCLUDED.muscle_bias,
    joint_count_level = EXCLUDED.joint_count_level,
    dynamic_isometric = EXCLUDED.dynamic_isometric,
    movement_plane = EXCLUDED.movement_plane,
    primary_joints = EXCLUDED.primary_joints,
    is_active = true,
    updated_at = now();

INSERT INTO exercise_library (name, category, movement_patterns, bilateral_unilateral, posterior_anterior, complexity, equipment, primary_muscle, supporting_muscles, muscle_bias, joint_count_level, dynamic_isometric, movement_plane, primary_joints, is_active)
  VALUES ('Russian Twist (not anchored)', 'accessory', '{"core_rotation"}'::text[], 'bilateral', NULL, 1, '{"bodyweight"}'::text[], 'Obliques', '{"Hip flexors"}'::text[], 'mid', 'regional', 'dynamic', NULL, '{}'::text[], true)
  ON CONFLICT (name) DO UPDATE SET
    category = EXCLUDED.category,
    movement_patterns = EXCLUDED.movement_patterns,
    bilateral_unilateral = EXCLUDED.bilateral_unilateral,
    posterior_anterior = EXCLUDED.posterior_anterior,
    complexity = EXCLUDED.complexity,
    equipment = EXCLUDED.equipment,
    primary_muscle = EXCLUDED.primary_muscle,
    supporting_muscles = EXCLUDED.supporting_muscles,
    muscle_bias = EXCLUDED.muscle_bias,
    joint_count_level = EXCLUDED.joint_count_level,
    dynamic_isometric = EXCLUDED.dynamic_isometric,
    movement_plane = EXCLUDED.movement_plane,
    primary_joints = EXCLUDED.primary_joints,
    is_active = true,
    updated_at = now();

INSERT INTO exercise_library (name, category, movement_patterns, bilateral_unilateral, posterior_anterior, complexity, equipment, primary_muscle, supporting_muscles, muscle_bias, joint_count_level, dynamic_isometric, movement_plane, primary_joints, is_active)
  VALUES ('Anchored Leg Lift (bent knee)', 'accessory', '{"core_flexion"}'::text[], 'bilateral', 'anterior', 2, '{"bodyweight"}'::text[], 'Hip flexors', '{"Rectus abdominis"}'::text[], 'mid', 'regional', 'dynamic', NULL, '{}'::text[], true)
  ON CONFLICT (name) DO UPDATE SET
    category = EXCLUDED.category,
    movement_patterns = EXCLUDED.movement_patterns,
    bilateral_unilateral = EXCLUDED.bilateral_unilateral,
    posterior_anterior = EXCLUDED.posterior_anterior,
    complexity = EXCLUDED.complexity,
    equipment = EXCLUDED.equipment,
    primary_muscle = EXCLUDED.primary_muscle,
    supporting_muscles = EXCLUDED.supporting_muscles,
    muscle_bias = EXCLUDED.muscle_bias,
    joint_count_level = EXCLUDED.joint_count_level,
    dynamic_isometric = EXCLUDED.dynamic_isometric,
    movement_plane = EXCLUDED.movement_plane,
    primary_joints = EXCLUDED.primary_joints,
    is_active = true,
    updated_at = now();

INSERT INTO exercise_library (name, category, movement_patterns, bilateral_unilateral, posterior_anterior, complexity, equipment, primary_muscle, supporting_muscles, muscle_bias, joint_count_level, dynamic_isometric, movement_plane, primary_joints, is_active)
  VALUES ('Anchored Leg Lift (straight leg)', 'accessory', '{"core_flexion"}'::text[], 'bilateral', 'anterior', 2, '{"bodyweight"}'::text[], 'Hip flexors', '{"Rectus abdominis"}'::text[], 'mid', 'regional', 'dynamic', NULL, '{}'::text[], true)
  ON CONFLICT (name) DO UPDATE SET
    category = EXCLUDED.category,
    movement_patterns = EXCLUDED.movement_patterns,
    bilateral_unilateral = EXCLUDED.bilateral_unilateral,
    posterior_anterior = EXCLUDED.posterior_anterior,
    complexity = EXCLUDED.complexity,
    equipment = EXCLUDED.equipment,
    primary_muscle = EXCLUDED.primary_muscle,
    supporting_muscles = EXCLUDED.supporting_muscles,
    muscle_bias = EXCLUDED.muscle_bias,
    joint_count_level = EXCLUDED.joint_count_level,
    dynamic_isometric = EXCLUDED.dynamic_isometric,
    movement_plane = EXCLUDED.movement_plane,
    primary_joints = EXCLUDED.primary_joints,
    is_active = true,
    updated_at = now();

INSERT INTO exercise_library (name, category, movement_patterns, bilateral_unilateral, posterior_anterior, complexity, equipment, primary_muscle, supporting_muscles, muscle_bias, joint_count_level, dynamic_isometric, movement_plane, primary_joints, is_active)
  VALUES ('Incline Bench Leg Lift (bent knee)', 'accessory', '{"core_flexion"}'::text[], 'bilateral', 'anterior', 2, '{"bench"}'::text[], 'Hip flexors', '{"Rectus abdominis"}'::text[], 'mid', 'regional', 'dynamic', NULL, '{}'::text[], true)
  ON CONFLICT (name) DO UPDATE SET
    category = EXCLUDED.category,
    movement_patterns = EXCLUDED.movement_patterns,
    bilateral_unilateral = EXCLUDED.bilateral_unilateral,
    posterior_anterior = EXCLUDED.posterior_anterior,
    complexity = EXCLUDED.complexity,
    equipment = EXCLUDED.equipment,
    primary_muscle = EXCLUDED.primary_muscle,
    supporting_muscles = EXCLUDED.supporting_muscles,
    muscle_bias = EXCLUDED.muscle_bias,
    joint_count_level = EXCLUDED.joint_count_level,
    dynamic_isometric = EXCLUDED.dynamic_isometric,
    movement_plane = EXCLUDED.movement_plane,
    primary_joints = EXCLUDED.primary_joints,
    is_active = true,
    updated_at = now();

INSERT INTO exercise_library (name, category, movement_patterns, bilateral_unilateral, posterior_anterior, complexity, equipment, primary_muscle, supporting_muscles, muscle_bias, joint_count_level, dynamic_isometric, movement_plane, primary_joints, is_active)
  VALUES ('Incline Bench Leg Lift (straight leg)', 'accessory', '{"core_flexion"}'::text[], 'bilateral', 'anterior', 2, '{"bench"}'::text[], 'Hip flexors', '{"Rectus abdominis"}'::text[], 'mid', 'regional', 'dynamic', NULL, '{}'::text[], true)
  ON CONFLICT (name) DO UPDATE SET
    category = EXCLUDED.category,
    movement_patterns = EXCLUDED.movement_patterns,
    bilateral_unilateral = EXCLUDED.bilateral_unilateral,
    posterior_anterior = EXCLUDED.posterior_anterior,
    complexity = EXCLUDED.complexity,
    equipment = EXCLUDED.equipment,
    primary_muscle = EXCLUDED.primary_muscle,
    supporting_muscles = EXCLUDED.supporting_muscles,
    muscle_bias = EXCLUDED.muscle_bias,
    joint_count_level = EXCLUDED.joint_count_level,
    dynamic_isometric = EXCLUDED.dynamic_isometric,
    movement_plane = EXCLUDED.movement_plane,
    primary_joints = EXCLUDED.primary_joints,
    is_active = true,
    updated_at = now();

INSERT INTO exercise_library (name, category, movement_patterns, bilateral_unilateral, posterior_anterior, complexity, equipment, primary_muscle, supporting_muscles, muscle_bias, joint_count_level, dynamic_isometric, movement_plane, primary_joints, is_active)
  VALUES ('Hanging Bent Knee Leg Raise', 'accessory', '{"core_flexion"}'::text[], 'bilateral', 'anterior', 2, '{"pull_up_bar"}'::text[], 'Hip flexors', '{"Rectus abdominis"}'::text[], 'mid', 'regional', 'dynamic', NULL, '{}'::text[], true)
  ON CONFLICT (name) DO UPDATE SET
    category = EXCLUDED.category,
    movement_patterns = EXCLUDED.movement_patterns,
    bilateral_unilateral = EXCLUDED.bilateral_unilateral,
    posterior_anterior = EXCLUDED.posterior_anterior,
    complexity = EXCLUDED.complexity,
    equipment = EXCLUDED.equipment,
    primary_muscle = EXCLUDED.primary_muscle,
    supporting_muscles = EXCLUDED.supporting_muscles,
    muscle_bias = EXCLUDED.muscle_bias,
    joint_count_level = EXCLUDED.joint_count_level,
    dynamic_isometric = EXCLUDED.dynamic_isometric,
    movement_plane = EXCLUDED.movement_plane,
    primary_joints = EXCLUDED.primary_joints,
    is_active = true,
    updated_at = now();

INSERT INTO exercise_library (name, category, movement_patterns, bilateral_unilateral, posterior_anterior, complexity, equipment, primary_muscle, supporting_muscles, muscle_bias, joint_count_level, dynamic_isometric, movement_plane, primary_joints, is_active)
  VALUES ('Hanging Straight Leg Leg Raise', 'accessory', '{"core_flexion"}'::text[], 'bilateral', 'anterior', 2, '{"pull_up_bar"}'::text[], 'Hip flexors', '{"Rectus abdominis"}'::text[], 'mid', 'regional', 'dynamic', NULL, '{}'::text[], true)
  ON CONFLICT (name) DO UPDATE SET
    category = EXCLUDED.category,
    movement_patterns = EXCLUDED.movement_patterns,
    bilateral_unilateral = EXCLUDED.bilateral_unilateral,
    posterior_anterior = EXCLUDED.posterior_anterior,
    complexity = EXCLUDED.complexity,
    equipment = EXCLUDED.equipment,
    primary_muscle = EXCLUDED.primary_muscle,
    supporting_muscles = EXCLUDED.supporting_muscles,
    muscle_bias = EXCLUDED.muscle_bias,
    joint_count_level = EXCLUDED.joint_count_level,
    dynamic_isometric = EXCLUDED.dynamic_isometric,
    movement_plane = EXCLUDED.movement_plane,
    primary_joints = EXCLUDED.primary_joints,
    is_active = true,
    updated_at = now();

INSERT INTO exercise_library (name, category, movement_patterns, bilateral_unilateral, posterior_anterior, complexity, equipment, primary_muscle, supporting_muscles, muscle_bias, joint_count_level, dynamic_isometric, movement_plane, primary_joints, is_active)
  VALUES ('Hanging Bent Knee Leg Raise (iso hold)', 'accessory', '{"core_flexion"}'::text[], 'bilateral', 'anterior', 2, '{"pull_up_bar"}'::text[], 'Hip flexors', '{"Rectus abdominis"}'::text[], 'mid', 'regional', 'isometric', NULL, '{}'::text[], true)
  ON CONFLICT (name) DO UPDATE SET
    category = EXCLUDED.category,
    movement_patterns = EXCLUDED.movement_patterns,
    bilateral_unilateral = EXCLUDED.bilateral_unilateral,
    posterior_anterior = EXCLUDED.posterior_anterior,
    complexity = EXCLUDED.complexity,
    equipment = EXCLUDED.equipment,
    primary_muscle = EXCLUDED.primary_muscle,
    supporting_muscles = EXCLUDED.supporting_muscles,
    muscle_bias = EXCLUDED.muscle_bias,
    joint_count_level = EXCLUDED.joint_count_level,
    dynamic_isometric = EXCLUDED.dynamic_isometric,
    movement_plane = EXCLUDED.movement_plane,
    primary_joints = EXCLUDED.primary_joints,
    is_active = true,
    updated_at = now();

INSERT INTO exercise_library (name, category, movement_patterns, bilateral_unilateral, posterior_anterior, complexity, equipment, primary_muscle, supporting_muscles, muscle_bias, joint_count_level, dynamic_isometric, movement_plane, primary_joints, is_active)
  VALUES ('Hanging Straight Leg Leg Raise (iso hold)', 'accessory', '{"core_flexion"}'::text[], 'bilateral', 'anterior', 3, '{"pull_up_bar"}'::text[], 'Hip flexors', '{"Rectus abdominis"}'::text[], 'mid', 'regional', 'isometric', NULL, '{}'::text[], true)
  ON CONFLICT (name) DO UPDATE SET
    category = EXCLUDED.category,
    movement_patterns = EXCLUDED.movement_patterns,
    bilateral_unilateral = EXCLUDED.bilateral_unilateral,
    posterior_anterior = EXCLUDED.posterior_anterior,
    complexity = EXCLUDED.complexity,
    equipment = EXCLUDED.equipment,
    primary_muscle = EXCLUDED.primary_muscle,
    supporting_muscles = EXCLUDED.supporting_muscles,
    muscle_bias = EXCLUDED.muscle_bias,
    joint_count_level = EXCLUDED.joint_count_level,
    dynamic_isometric = EXCLUDED.dynamic_isometric,
    movement_plane = EXCLUDED.movement_plane,
    primary_joints = EXCLUDED.primary_joints,
    is_active = true,
    updated_at = now();

INSERT INTO exercise_library (name, category, movement_patterns, bilateral_unilateral, posterior_anterior, complexity, equipment, primary_muscle, supporting_muscles, muscle_bias, joint_count_level, dynamic_isometric, movement_plane, primary_joints, is_active)
  VALUES ('Parallettes Bent Knee L-sit', 'accessory', '{"core_anti_extension"}'::text[], 'bilateral', 'anterior', 2, '{}'::text[], 'Hip flexors', '{"Rectus abdominis"}'::text[], 'shortened', 'regional', 'isometric', NULL, '{}'::text[], true)
  ON CONFLICT (name) DO UPDATE SET
    category = EXCLUDED.category,
    movement_patterns = EXCLUDED.movement_patterns,
    bilateral_unilateral = EXCLUDED.bilateral_unilateral,
    posterior_anterior = EXCLUDED.posterior_anterior,
    complexity = EXCLUDED.complexity,
    equipment = EXCLUDED.equipment,
    primary_muscle = EXCLUDED.primary_muscle,
    supporting_muscles = EXCLUDED.supporting_muscles,
    muscle_bias = EXCLUDED.muscle_bias,
    joint_count_level = EXCLUDED.joint_count_level,
    dynamic_isometric = EXCLUDED.dynamic_isometric,
    movement_plane = EXCLUDED.movement_plane,
    primary_joints = EXCLUDED.primary_joints,
    is_active = true,
    updated_at = now();

INSERT INTO exercise_library (name, category, movement_patterns, bilateral_unilateral, posterior_anterior, complexity, equipment, primary_muscle, supporting_muscles, muscle_bias, joint_count_level, dynamic_isometric, movement_plane, primary_joints, is_active)
  VALUES ('Parallettes Straight Leg L-sit', 'accessory', '{"core_anti_extension"}'::text[], 'bilateral', 'anterior', 3, '{}'::text[], 'Hip flexors', '{"Rectus abdominis"}'::text[], 'shortened', 'regional', 'isometric', NULL, '{}'::text[], true)
  ON CONFLICT (name) DO UPDATE SET
    category = EXCLUDED.category,
    movement_patterns = EXCLUDED.movement_patterns,
    bilateral_unilateral = EXCLUDED.bilateral_unilateral,
    posterior_anterior = EXCLUDED.posterior_anterior,
    complexity = EXCLUDED.complexity,
    equipment = EXCLUDED.equipment,
    primary_muscle = EXCLUDED.primary_muscle,
    supporting_muscles = EXCLUDED.supporting_muscles,
    muscle_bias = EXCLUDED.muscle_bias,
    joint_count_level = EXCLUDED.joint_count_level,
    dynamic_isometric = EXCLUDED.dynamic_isometric,
    movement_plane = EXCLUDED.movement_plane,
    primary_joints = EXCLUDED.primary_joints,
    is_active = true,
    updated_at = now();

INSERT INTO exercise_library (name, category, movement_patterns, bilateral_unilateral, posterior_anterior, complexity, equipment, primary_muscle, supporting_muscles, muscle_bias, joint_count_level, dynamic_isometric, movement_plane, primary_joints, is_active)
  VALUES ('Prone Banded Single Leg Knee Pull-in', 'accessory', '{"core_flexion"}'::text[], 'unilateral', 'anterior', 2, '{"band"}'::text[], 'Hip flexors', '{"Rectus abdominis"}'::text[], 'mid', 'regional', 'dynamic', NULL, '{}'::text[], true)
  ON CONFLICT (name) DO UPDATE SET
    category = EXCLUDED.category,
    movement_patterns = EXCLUDED.movement_patterns,
    bilateral_unilateral = EXCLUDED.bilateral_unilateral,
    posterior_anterior = EXCLUDED.posterior_anterior,
    complexity = EXCLUDED.complexity,
    equipment = EXCLUDED.equipment,
    primary_muscle = EXCLUDED.primary_muscle,
    supporting_muscles = EXCLUDED.supporting_muscles,
    muscle_bias = EXCLUDED.muscle_bias,
    joint_count_level = EXCLUDED.joint_count_level,
    dynamic_isometric = EXCLUDED.dynamic_isometric,
    movement_plane = EXCLUDED.movement_plane,
    primary_joints = EXCLUDED.primary_joints,
    is_active = true,
    updated_at = now();

INSERT INTO exercise_library (name, category, movement_patterns, bilateral_unilateral, posterior_anterior, complexity, equipment, primary_muscle, supporting_muscles, muscle_bias, joint_count_level, dynamic_isometric, movement_plane, primary_joints, is_active)
  VALUES ('Prone Cable Single Leg Knee Pull-in', 'accessory', '{"core_flexion"}'::text[], 'unilateral', 'anterior', 2, '{"cable"}'::text[], 'Hip flexors', '{"Rectus abdominis"}'::text[], 'mid', 'regional', 'dynamic', NULL, '{}'::text[], true)
  ON CONFLICT (name) DO UPDATE SET
    category = EXCLUDED.category,
    movement_patterns = EXCLUDED.movement_patterns,
    bilateral_unilateral = EXCLUDED.bilateral_unilateral,
    posterior_anterior = EXCLUDED.posterior_anterior,
    complexity = EXCLUDED.complexity,
    equipment = EXCLUDED.equipment,
    primary_muscle = EXCLUDED.primary_muscle,
    supporting_muscles = EXCLUDED.supporting_muscles,
    muscle_bias = EXCLUDED.muscle_bias,
    joint_count_level = EXCLUDED.joint_count_level,
    dynamic_isometric = EXCLUDED.dynamic_isometric,
    movement_plane = EXCLUDED.movement_plane,
    primary_joints = EXCLUDED.primary_joints,
    is_active = true,
    updated_at = now();

INSERT INTO exercise_library (name, category, movement_patterns, bilateral_unilateral, posterior_anterior, complexity, equipment, primary_muscle, supporting_muscles, muscle_bias, joint_count_level, dynamic_isometric, movement_plane, primary_joints, is_active)
  VALUES ('Supine Banded Single Leg Knee Pull-in', 'accessory', '{"core_flexion"}'::text[], 'unilateral', 'anterior', 1, '{"band"}'::text[], 'Hip flexors', '{"Rectus abdominis"}'::text[], 'mid', 'regional', 'dynamic', NULL, '{}'::text[], true)
  ON CONFLICT (name) DO UPDATE SET
    category = EXCLUDED.category,
    movement_patterns = EXCLUDED.movement_patterns,
    bilateral_unilateral = EXCLUDED.bilateral_unilateral,
    posterior_anterior = EXCLUDED.posterior_anterior,
    complexity = EXCLUDED.complexity,
    equipment = EXCLUDED.equipment,
    primary_muscle = EXCLUDED.primary_muscle,
    supporting_muscles = EXCLUDED.supporting_muscles,
    muscle_bias = EXCLUDED.muscle_bias,
    joint_count_level = EXCLUDED.joint_count_level,
    dynamic_isometric = EXCLUDED.dynamic_isometric,
    movement_plane = EXCLUDED.movement_plane,
    primary_joints = EXCLUDED.primary_joints,
    is_active = true,
    updated_at = now();

INSERT INTO exercise_library (name, category, movement_patterns, bilateral_unilateral, posterior_anterior, complexity, equipment, primary_muscle, supporting_muscles, muscle_bias, joint_count_level, dynamic_isometric, movement_plane, primary_joints, is_active)
  VALUES ('Supine Cable Single Leg Knee Pull-in', 'accessory', '{"core_flexion"}'::text[], 'unilateral', 'anterior', 1, '{"cable"}'::text[], 'Hip flexors', '{"Rectus abdominis"}'::text[], 'mid', 'regional', 'dynamic', NULL, '{}'::text[], true)
  ON CONFLICT (name) DO UPDATE SET
    category = EXCLUDED.category,
    movement_patterns = EXCLUDED.movement_patterns,
    bilateral_unilateral = EXCLUDED.bilateral_unilateral,
    posterior_anterior = EXCLUDED.posterior_anterior,
    complexity = EXCLUDED.complexity,
    equipment = EXCLUDED.equipment,
    primary_muscle = EXCLUDED.primary_muscle,
    supporting_muscles = EXCLUDED.supporting_muscles,
    muscle_bias = EXCLUDED.muscle_bias,
    joint_count_level = EXCLUDED.joint_count_level,
    dynamic_isometric = EXCLUDED.dynamic_isometric,
    movement_plane = EXCLUDED.movement_plane,
    primary_joints = EXCLUDED.primary_joints,
    is_active = true,
    updated_at = now();

INSERT INTO exercise_library (name, category, movement_patterns, bilateral_unilateral, posterior_anterior, complexity, equipment, primary_muscle, supporting_muscles, muscle_bias, joint_count_level, dynamic_isometric, movement_plane, primary_joints, is_active)
  VALUES ('1/4 turkish get up (to tall situp)', 'accessory', '{"core_rotation"}'::text[], 'unilateral', NULL, 1, '{"kettlebell"}'::text[], 'Rectus abdominis, obliques', '{"Anterior deltoid","triceps"}'::text[], 'shortened', 'local', 'dynamic', NULL, '{}'::text[], true)
  ON CONFLICT (name) DO UPDATE SET
    category = EXCLUDED.category,
    movement_patterns = EXCLUDED.movement_patterns,
    bilateral_unilateral = EXCLUDED.bilateral_unilateral,
    posterior_anterior = EXCLUDED.posterior_anterior,
    complexity = EXCLUDED.complexity,
    equipment = EXCLUDED.equipment,
    primary_muscle = EXCLUDED.primary_muscle,
    supporting_muscles = EXCLUDED.supporting_muscles,
    muscle_bias = EXCLUDED.muscle_bias,
    joint_count_level = EXCLUDED.joint_count_level,
    dynamic_isometric = EXCLUDED.dynamic_isometric,
    movement_plane = EXCLUDED.movement_plane,
    primary_joints = EXCLUDED.primary_joints,
    is_active = true,
    updated_at = now();

INSERT INTO exercise_library (name, category, movement_patterns, bilateral_unilateral, posterior_anterior, complexity, equipment, primary_muscle, supporting_muscles, muscle_bias, joint_count_level, dynamic_isometric, movement_plane, primary_joints, is_active)
  VALUES ('1/2 turkish get up (to 1/2 kneeling)', 'accessory', '{"core_rotation"}'::text[], 'unilateral', NULL, 2, '{"kettlebell"}'::text[], 'Rectus abdominis, obliques', '{"Anterior deltoid","triceps"}'::text[], 'shortened', 'regional', 'dynamic', NULL, '{}'::text[], true)
  ON CONFLICT (name) DO UPDATE SET
    category = EXCLUDED.category,
    movement_patterns = EXCLUDED.movement_patterns,
    bilateral_unilateral = EXCLUDED.bilateral_unilateral,
    posterior_anterior = EXCLUDED.posterior_anterior,
    complexity = EXCLUDED.complexity,
    equipment = EXCLUDED.equipment,
    primary_muscle = EXCLUDED.primary_muscle,
    supporting_muscles = EXCLUDED.supporting_muscles,
    muscle_bias = EXCLUDED.muscle_bias,
    joint_count_level = EXCLUDED.joint_count_level,
    dynamic_isometric = EXCLUDED.dynamic_isometric,
    movement_plane = EXCLUDED.movement_plane,
    primary_joints = EXCLUDED.primary_joints,
    is_active = true,
    updated_at = now();

INSERT INTO exercise_library (name, category, movement_patterns, bilateral_unilateral, posterior_anterior, complexity, equipment, primary_muscle, supporting_muscles, muscle_bias, joint_count_level, dynamic_isometric, movement_plane, primary_joints, is_active)
  VALUES ('turkish get up', 'accessory', '{"core_rotation"}'::text[], 'unilateral', NULL, 3, '{"kettlebell"}'::text[], 'Rectus abdominis, obliques', '{"Anterior deltoid","triceps"}'::text[], 'shortened', 'global', 'dynamic', NULL, '{}'::text[], true)
  ON CONFLICT (name) DO UPDATE SET
    category = EXCLUDED.category,
    movement_patterns = EXCLUDED.movement_patterns,
    bilateral_unilateral = EXCLUDED.bilateral_unilateral,
    posterior_anterior = EXCLUDED.posterior_anterior,
    complexity = EXCLUDED.complexity,
    equipment = EXCLUDED.equipment,
    primary_muscle = EXCLUDED.primary_muscle,
    supporting_muscles = EXCLUDED.supporting_muscles,
    muscle_bias = EXCLUDED.muscle_bias,
    joint_count_level = EXCLUDED.joint_count_level,
    dynamic_isometric = EXCLUDED.dynamic_isometric,
    movement_plane = EXCLUDED.movement_plane,
    primary_joints = EXCLUDED.primary_joints,
    is_active = true,
    updated_at = now();

INSERT INTO exercise_library (name, category, movement_patterns, bilateral_unilateral, posterior_anterior, complexity, equipment, primary_muscle, supporting_muscles, muscle_bias, joint_count_level, dynamic_isometric, movement_plane, primary_joints, is_active)
  VALUES ('Row erg', 'capacity', '{"cyclical"}'::text[], 'bilateral', 'posterior', 1, '{"rower_erg"}'::text[], 'Lats', '{"Glutes","hamstrings","spinal erectors","biceps","forearms"}'::text[], NULL, 'global', 'dynamic', NULL, '{}'::text[], true)
  ON CONFLICT (name) DO UPDATE SET
    category = EXCLUDED.category,
    movement_patterns = EXCLUDED.movement_patterns,
    bilateral_unilateral = EXCLUDED.bilateral_unilateral,
    posterior_anterior = EXCLUDED.posterior_anterior,
    complexity = EXCLUDED.complexity,
    equipment = EXCLUDED.equipment,
    primary_muscle = EXCLUDED.primary_muscle,
    supporting_muscles = EXCLUDED.supporting_muscles,
    muscle_bias = EXCLUDED.muscle_bias,
    joint_count_level = EXCLUDED.joint_count_level,
    dynamic_isometric = EXCLUDED.dynamic_isometric,
    movement_plane = EXCLUDED.movement_plane,
    primary_joints = EXCLUDED.primary_joints,
    is_active = true,
    updated_at = now();

INSERT INTO exercise_library (name, category, movement_patterns, bilateral_unilateral, posterior_anterior, complexity, equipment, primary_muscle, supporting_muscles, muscle_bias, joint_count_level, dynamic_isometric, movement_plane, primary_joints, is_active)
  VALUES ('Ski erg', 'capacity', '{"cyclical"}'::text[], 'bilateral', 'anterior', 1, '{"ski_erg"}'::text[], 'Lats', '{"Abs","triceps","shoulders","hip flexors"}'::text[], NULL, 'global', 'dynamic', NULL, '{}'::text[], true)
  ON CONFLICT (name) DO UPDATE SET
    category = EXCLUDED.category,
    movement_patterns = EXCLUDED.movement_patterns,
    bilateral_unilateral = EXCLUDED.bilateral_unilateral,
    posterior_anterior = EXCLUDED.posterior_anterior,
    complexity = EXCLUDED.complexity,
    equipment = EXCLUDED.equipment,
    primary_muscle = EXCLUDED.primary_muscle,
    supporting_muscles = EXCLUDED.supporting_muscles,
    muscle_bias = EXCLUDED.muscle_bias,
    joint_count_level = EXCLUDED.joint_count_level,
    dynamic_isometric = EXCLUDED.dynamic_isometric,
    movement_plane = EXCLUDED.movement_plane,
    primary_joints = EXCLUDED.primary_joints,
    is_active = true,
    updated_at = now();

INSERT INTO exercise_library (name, category, movement_patterns, bilateral_unilateral, posterior_anterior, complexity, equipment, primary_muscle, supporting_muscles, muscle_bias, joint_count_level, dynamic_isometric, movement_plane, primary_joints, is_active)
  VALUES ('Assault Bike', 'capacity', '{"cyclical"}'::text[], 'bilateral', 'anterior', 1, '{"assault_bike"}'::text[], 'Quads', '{"Glutes","hamstrings","calves","shoulders","triceps"}'::text[], NULL, 'global', 'dynamic', NULL, '{}'::text[], true)
  ON CONFLICT (name) DO UPDATE SET
    category = EXCLUDED.category,
    movement_patterns = EXCLUDED.movement_patterns,
    bilateral_unilateral = EXCLUDED.bilateral_unilateral,
    posterior_anterior = EXCLUDED.posterior_anterior,
    complexity = EXCLUDED.complexity,
    equipment = EXCLUDED.equipment,
    primary_muscle = EXCLUDED.primary_muscle,
    supporting_muscles = EXCLUDED.supporting_muscles,
    muscle_bias = EXCLUDED.muscle_bias,
    joint_count_level = EXCLUDED.joint_count_level,
    dynamic_isometric = EXCLUDED.dynamic_isometric,
    movement_plane = EXCLUDED.movement_plane,
    primary_joints = EXCLUDED.primary_joints,
    is_active = true,
    updated_at = now();

INSERT INTO exercise_library (name, category, movement_patterns, bilateral_unilateral, posterior_anterior, complexity, equipment, primary_muscle, supporting_muscles, muscle_bias, joint_count_level, dynamic_isometric, movement_plane, primary_joints, is_active)
  VALUES ('Bike Erg', 'capacity', '{"cyclical"}'::text[], 'bilateral', 'anterior', 1, '{"bike_erg"}'::text[], 'Quads', '{"Glutes","hamstrings","calves"}'::text[], NULL, 'global', 'dynamic', NULL, '{}'::text[], true)
  ON CONFLICT (name) DO UPDATE SET
    category = EXCLUDED.category,
    movement_patterns = EXCLUDED.movement_patterns,
    bilateral_unilateral = EXCLUDED.bilateral_unilateral,
    posterior_anterior = EXCLUDED.posterior_anterior,
    complexity = EXCLUDED.complexity,
    equipment = EXCLUDED.equipment,
    primary_muscle = EXCLUDED.primary_muscle,
    supporting_muscles = EXCLUDED.supporting_muscles,
    muscle_bias = EXCLUDED.muscle_bias,
    joint_count_level = EXCLUDED.joint_count_level,
    dynamic_isometric = EXCLUDED.dynamic_isometric,
    movement_plane = EXCLUDED.movement_plane,
    primary_joints = EXCLUDED.primary_joints,
    is_active = true,
    updated_at = now();

INSERT INTO exercise_library (name, category, movement_patterns, bilateral_unilateral, posterior_anterior, complexity, equipment, primary_muscle, supporting_muscles, muscle_bias, joint_count_level, dynamic_isometric, movement_plane, primary_joints, is_active)
  VALUES ('Run', 'capacity', '{"cyclical"}'::text[], 'bilateral', 'anterior', 1, '{"bodyweight"}'::text[], 'Quads', '{"Glutes","hamstrings","calves","hip flexors","core"}'::text[], NULL, 'global', 'dynamic', NULL, '{}'::text[], true)
  ON CONFLICT (name) DO UPDATE SET
    category = EXCLUDED.category,
    movement_patterns = EXCLUDED.movement_patterns,
    bilateral_unilateral = EXCLUDED.bilateral_unilateral,
    posterior_anterior = EXCLUDED.posterior_anterior,
    complexity = EXCLUDED.complexity,
    equipment = EXCLUDED.equipment,
    primary_muscle = EXCLUDED.primary_muscle,
    supporting_muscles = EXCLUDED.supporting_muscles,
    muscle_bias = EXCLUDED.muscle_bias,
    joint_count_level = EXCLUDED.joint_count_level,
    dynamic_isometric = EXCLUDED.dynamic_isometric,
    movement_plane = EXCLUDED.movement_plane,
    primary_joints = EXCLUDED.primary_joints,
    is_active = true,
    updated_at = now();

COMMIT;
