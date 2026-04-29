-- Brief 5c exercise library import — chunk 5/5
-- Source: exercise-library-import-2026-04-30.sql
-- Inserts 737-918 of 918.
-- Idempotent: every row uses ON CONFLICT (name) DO UPDATE.

BEGIN;

INSERT INTO exercise_library (name, category, movement_patterns, bilateral_unilateral, posterior_anterior, complexity, equipment, primary_muscle, supporting_muscles, muscle_bias, joint_count_level, dynamic_isometric, movement_plane, primary_joints, is_active)
  VALUES ('Treadmill', 'capacity', '{"cyclical"}'::text[], 'bilateral', 'anterior', 1, '{"treadmill"}'::text[], 'Quads', '{"Glutes","hamstrings","calves","hip flexors","core"}'::text[], NULL, 'global', 'dynamic', NULL, '{}'::text[], true)
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
  VALUES ('Single arm DB hang muscle snatch', 'capacity', '{"hinge"}'::text[], 'unilateral', 'posterior', 3, '{"dumbbell"}'::text[], 'Glutes', '{"Hamstrings","spinal erectors","traps","delts","core","grip"}'::text[], 'lengthened', 'global', 'dynamic', NULL, '{}'::text[], true)
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
  VALUES ('Single arm DB snatch', 'capacity', '{"hinge"}'::text[], 'unilateral', 'posterior', 3, '{"dumbbell"}'::text[], 'Glutes', '{"Hamstrings","spinal erectors","traps","delts","core","grip"}'::text[], 'lengthened', 'global', 'dynamic', NULL, '{}'::text[], true)
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
  VALUES ('Single arm DB hang muscle clean', 'capacity', '{"hinge"}'::text[], 'unilateral', 'posterior', 3, '{"dumbbell"}'::text[], 'Glutes', '{"Hamstrings","spinal erectors","traps","biceps","core","grip"}'::text[], 'lengthened', 'global', 'dynamic', NULL, '{}'::text[], true)
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
  VALUES ('Single arm DB muscle clean', 'capacity', '{"hinge"}'::text[], 'unilateral', 'posterior', 3, '{"dumbbell"}'::text[], 'Glutes', '{"Hamstrings","spinal erectors","traps","biceps","core","grip"}'::text[], 'lengthened', 'global', 'dynamic', NULL, '{}'::text[], true)
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
  VALUES ('Single arm DB hang power clean', 'capacity', '{"hinge"}'::text[], 'unilateral', 'posterior', 3, '{"dumbbell"}'::text[], 'Glutes', '{"Hamstrings","spinal erectors","traps","biceps","core","grip"}'::text[], 'lengthened', 'global', 'dynamic', NULL, '{}'::text[], true)
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
  VALUES ('Single arm DB power clean', 'capacity', '{"hinge"}'::text[], 'unilateral', 'posterior', 3, '{"dumbbell"}'::text[], 'Glutes', '{"Hamstrings","spinal erectors","traps","biceps","core","grip"}'::text[], 'lengthened', 'global', 'dynamic', NULL, '{}'::text[], true)
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
  VALUES ('Dual DB hang muscle snatch', 'capacity', '{"hinge"}'::text[], 'bilateral', 'posterior', 3, '{"dumbbell"}'::text[], 'Glutes', '{"Hamstrings","spinal erectors","traps","delts","core","grip"}'::text[], 'lengthened', 'global', 'dynamic', NULL, '{}'::text[], true)
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
  VALUES ('Dual DB snatch', 'capacity', '{"hinge"}'::text[], 'bilateral', 'posterior', 3, '{"dumbbell"}'::text[], 'Glutes', '{"Hamstrings","spinal erectors","traps","delts","core","grip"}'::text[], 'lengthened', 'global', 'dynamic', NULL, '{}'::text[], true)
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
  VALUES ('Dual DB hang muscle clean', 'capacity', '{"hinge"}'::text[], 'bilateral', 'posterior', 3, '{"dumbbell"}'::text[], 'Glutes', '{"Hamstrings","spinal erectors","traps","biceps","core","grip"}'::text[], 'lengthened', 'global', 'dynamic', NULL, '{}'::text[], true)
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
  VALUES ('Dual DB muscle clean', 'capacity', '{"hinge"}'::text[], 'bilateral', 'posterior', 3, '{"dumbbell"}'::text[], 'Glutes', '{"Hamstrings","spinal erectors","traps","biceps","core","grip"}'::text[], 'lengthened', 'global', 'dynamic', NULL, '{}'::text[], true)
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
  VALUES ('Dual DB hang power clean', 'capacity', '{"hinge"}'::text[], 'bilateral', 'posterior', 3, '{"dumbbell"}'::text[], 'Glutes', '{"Hamstrings","spinal erectors","traps","biceps","core","grip"}'::text[], 'lengthened', 'global', 'dynamic', NULL, '{}'::text[], true)
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
  VALUES ('Dual DB power clean', 'capacity', '{"hinge"}'::text[], 'bilateral', 'posterior', 3, '{"dumbbell"}'::text[], 'Glutes', '{"Hamstrings","spinal erectors","traps","biceps","core","grip"}'::text[], 'lengthened', 'global', 'dynamic', NULL, '{}'::text[], true)
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
  VALUES ('Single arm alternating DB hang muscle snatch', 'capacity', '{"hinge"}'::text[], 'unilateral', 'posterior', 3, '{"dumbbell"}'::text[], 'Glutes', '{"Hamstrings","spinal erectors","traps","delts","core","grip"}'::text[], 'lengthened', 'global', 'dynamic', NULL, '{}'::text[], true)
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
  VALUES ('Single arm alternating DB snatch', 'capacity', '{"hinge"}'::text[], 'unilateral', 'posterior', 3, '{"dumbbell"}'::text[], 'Glutes', '{"Hamstrings","spinal erectors","traps","delts","core","grip"}'::text[], 'lengthened', 'global', 'dynamic', NULL, '{}'::text[], true)
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
  VALUES ('Single arm alternating DB hang muscle clean', 'capacity', '{"hinge"}'::text[], 'unilateral', 'posterior', 3, '{"dumbbell"}'::text[], 'Glutes', '{"Hamstrings","spinal erectors","traps","biceps","core","grip"}'::text[], 'lengthened', 'global', 'dynamic', NULL, '{}'::text[], true)
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
  VALUES ('Single arm alternating DB muscle clean', 'capacity', '{"hinge"}'::text[], 'unilateral', 'posterior', 3, '{"dumbbell"}'::text[], 'Glutes', '{"Hamstrings","spinal erectors","traps","biceps","core","grip"}'::text[], 'lengthened', 'global', 'dynamic', NULL, '{}'::text[], true)
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
  VALUES ('Single arm alternating DB hang power clean', 'capacity', '{"hinge"}'::text[], 'unilateral', 'posterior', 3, '{"dumbbell"}'::text[], 'Glutes', '{"Hamstrings","spinal erectors","traps","biceps","core","grip"}'::text[], 'lengthened', 'global', 'dynamic', NULL, '{}'::text[], true)
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
  VALUES ('Single arm alternating DB power clean', 'capacity', '{"hinge"}'::text[], 'unilateral', 'posterior', 3, '{"dumbbell"}'::text[], 'Glutes', '{"Hamstrings","spinal erectors","traps","biceps","core","grip"}'::text[], 'lengthened', 'global', 'dynamic', NULL, '{}'::text[], true)
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
  VALUES ('Dual KB russian kettlebell swing', 'capacity', '{"hinge"}'::text[], 'bilateral', 'posterior', 2, '{"kettlebell"}'::text[], 'Glutes', '{"Hamstrings","spinal erectors","lats","grip"}'::text[], 'lengthened', 'global', 'dynamic', NULL, '{}'::text[], true)
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
  VALUES ('D-ball/sandbag hold', 'capacity', '{"spinal_extension"}'::text[], 'bilateral', 'anterior', 2, '{"sandbag_dball"}'::text[], 'Abs', '{"Glutes","spinal erectors","upper back","grip"}'::text[], 'mid', 'global', 'isometric', NULL, '{}'::text[], true)
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
  VALUES ('D-ball/sandbag carry', 'capacity', '{"spinal_extension"}'::text[], 'bilateral', 'anterior', 2, '{"sandbag_dball"}'::text[], 'Abs', '{"Glutes","spinal erectors","upper back","grip"}'::text[], 'mid', 'global', 'dynamic', NULL, '{}'::text[], true)
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
  VALUES ('Single arm DB devil press', 'capacity', '{"hinge"}'::text[], 'unilateral', 'posterior', 3, '{"dumbbell"}'::text[], 'Glutes', '{"Chest","triceps","delts","abs","spinal erectors"}'::text[], 'lengthened', 'global', 'dynamic', NULL, '{}'::text[], true)
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
  VALUES ('Dual arm DB devil press', 'capacity', '{"hinge"}'::text[], 'bilateral', 'posterior', 3, '{"dumbbell"}'::text[], 'Glutes', '{"Chest","triceps","delts","abs","spinal erectors"}'::text[], 'lengthened', 'global', 'dynamic', NULL, '{}'::text[], true)
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
  VALUES ('Single arm DB thruster', 'capacity', '{"squat"}'::text[], 'unilateral', 'anterior', 2, '{"dumbbell"}'::text[], 'Quads', '{"Glutes","delts","triceps","core"}'::text[], 'lengthened', 'global', 'dynamic', NULL, '{}'::text[], true)
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
  VALUES ('D-ball slam', 'capacity', '{"hinge"}'::text[], 'bilateral', 'anterior', 2, '{"sandbag_dball"}'::text[], 'Abs', '{"Lats","delts","triceps","hip extensors"}'::text[], 'mid', 'global', 'dynamic', NULL, '{}'::text[], true)
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
  VALUES ('Plate push press', 'capacity', '{"hip_extension"}'::text[], 'bilateral', 'anterior', 2, '{}'::text[], 'Delts', '{"Triceps","upper chest","traps","core"}'::text[], 'mid', 'global', 'dynamic', NULL, '{}'::text[], true)
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
  VALUES ('Plate ground to overhead', 'capacity', '{"hinge"}'::text[], 'bilateral', 'posterior', 3, '{}'::text[], 'Glutes', '{"Quads","spinal erectors","delts","triceps","core"}'::text[], 'lengthened', 'global', 'dynamic', NULL, '{}'::text[], true)
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
  VALUES ('Plate Thruster', 'capacity', '{"squat"}'::text[], 'bilateral', 'anterior', 2, '{}'::text[], 'Quads', '{"Glutes","delts","triceps","core"}'::text[], 'lengthened', 'global', 'dynamic', NULL, '{}'::text[], true)
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
  VALUES ('DB goblet alternating forward lunge', 'capacity', '{"lunge"}'::text[], 'unilateral', 'anterior', 2, '{"dumbbell"}'::text[], 'Quads', '{"Glutes","calves","core"}'::text[], 'lengthened', 'global', 'dynamic', NULL, '{}'::text[], true)
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
  VALUES ('DB goblet alternating reverse lunge', 'capacity', '{"lunge"}'::text[], 'unilateral', 'anterior', 2, '{"dumbbell"}'::text[], 'Quads', '{"Glutes","hamstrings","calves","core"}'::text[], 'lengthened', 'global', 'dynamic', NULL, '{}'::text[], true)
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
  VALUES ('DB goblet alternating walking lunge', 'capacity', '{"lunge"}'::text[], 'unilateral', 'anterior', 2, '{"dumbbell"}'::text[], 'Quads', '{"Glutes","calves","core"}'::text[], 'lengthened', 'global', 'dynamic', NULL, '{}'::text[], true)
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
  VALUES ('Dual DB suitcase alternating forward lunge', 'capacity', '{"lunge"}'::text[], 'unilateral', 'anterior', 2, '{"dumbbell"}'::text[], 'Quads', '{"Glutes","adductors","core","grip"}'::text[], 'lengthened', 'global', 'dynamic', NULL, '{}'::text[], true)
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
  VALUES ('Single arm suitcase DB alternating forward lunge', 'capacity', '{"lunge"}'::text[], 'unilateral', 'anterior', 2, '{"dumbbell"}'::text[], 'Quads', '{"Glutes","adductors","obliques","grip"}'::text[], 'lengthened', 'global', 'dynamic', NULL, '{}'::text[], true)
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
  VALUES ('Dual DB front rack alternating forward lunge', 'capacity', '{"lunge"}'::text[], 'unilateral', 'anterior', 2, '{"dumbbell"}'::text[], 'Quads', '{"Glutes","upper back","core"}'::text[], 'lengthened', 'global', 'dynamic', NULL, '{}'::text[], true)
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
  VALUES ('Single arm front rack DB alternating forward lunge', 'capacity', '{"lunge"}'::text[], 'unilateral', 'anterior', 2, '{"dumbbell"}'::text[], 'Quads', '{"Glutes","upper back","obliques"}'::text[], 'lengthened', 'global', 'dynamic', NULL, '{}'::text[], true)
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
  VALUES ('Dual DB suitcase alternating reverse lunge', 'capacity', '{"lunge"}'::text[], 'unilateral', 'anterior', 2, '{"dumbbell"}'::text[], 'Quads', '{"Glutes","hamstrings","adductors","core","grip"}'::text[], 'lengthened', 'global', 'dynamic', NULL, '{}'::text[], true)
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
  VALUES ('Single arm suitcase DB alternating reverse lunge', 'capacity', '{"lunge"}'::text[], 'unilateral', 'anterior', 2, '{"dumbbell"}'::text[], 'Quads', '{"Glutes","hamstrings","obliques","grip"}'::text[], 'lengthened', 'global', 'dynamic', NULL, '{}'::text[], true)
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
  VALUES ('Dual DB front rack alternating reverse lunge', 'capacity', '{"lunge"}'::text[], 'unilateral', 'anterior', 2, '{"dumbbell"}'::text[], 'Quads', '{"Glutes","hamstrings","upper back","core"}'::text[], 'lengthened', 'global', 'dynamic', NULL, '{}'::text[], true)
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
  VALUES ('Single arm front rack DB alternating reverse lunge', 'capacity', '{"lunge"}'::text[], 'unilateral', 'anterior', 2, '{"dumbbell"}'::text[], 'Quads', '{"Glutes","hamstrings","upper back","obliques"}'::text[], 'lengthened', 'global', 'dynamic', NULL, '{}'::text[], true)
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
  VALUES ('Dual DB suitcase alternating walking lunge', 'capacity', '{"lunge"}'::text[], 'unilateral', 'anterior', 2, '{"dumbbell"}'::text[], 'Quads', '{"Glutes","adductors","core","grip"}'::text[], 'lengthened', 'global', 'dynamic', NULL, '{}'::text[], true)
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
  VALUES ('Single arm suitcase DB alternating walking lunge', 'capacity', '{"lunge"}'::text[], 'unilateral', 'anterior', 2, '{"dumbbell"}'::text[], 'Quads', '{"Glutes","adductors","obliques","grip"}'::text[], 'lengthened', 'global', 'dynamic', NULL, '{}'::text[], true)
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
  VALUES ('Dual DB front rack alternating walking lunge', 'capacity', '{"lunge"}'::text[], 'unilateral', 'anterior', 2, '{"dumbbell"}'::text[], 'Quads', '{"Glutes","upper back","core"}'::text[], 'lengthened', 'global', 'dynamic', NULL, '{}'::text[], true)
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
  VALUES ('Single arm front rack DB alternating walking lunge', 'capacity', '{"lunge"}'::text[], 'unilateral', 'anterior', 2, '{"dumbbell"}'::text[], 'Quads', '{"Glutes","upper back","obliques"}'::text[], 'lengthened', 'global', 'dynamic', NULL, '{}'::text[], true)
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
  VALUES ('Goblet squat', 'capacity', '{"squat"}'::text[], 'bilateral', 'anterior', 1, '{"dumbbell"}'::text[], 'Quads', '{"Glutes","adductors","core"}'::text[], 'lengthened', 'global', 'dynamic', NULL, '{}'::text[], true)
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
  VALUES ('Air squat', 'capacity', '{"squat"}'::text[], 'bilateral', 'anterior', 1, '{"bodyweight"}'::text[], 'Quads', '{"Glutes","adductors","core"}'::text[], 'lengthened', 'global', 'dynamic', NULL, '{}'::text[], true)
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
  VALUES ('Alternating forward lunge', 'capacity', '{"lunge"}'::text[], 'unilateral', 'anterior', 1, '{"bodyweight"}'::text[], 'Quads', '{"Glutes","calves","core"}'::text[], 'lengthened', 'global', 'dynamic', NULL, '{}'::text[], true)
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
  VALUES ('alternating reverse lunge', 'capacity', '{"lunge"}'::text[], 'unilateral', 'anterior', 1, '{"bodyweight"}'::text[], 'Quads', '{"Glutes","hamstrings","calves","core"}'::text[], 'lengthened', 'global', 'dynamic', NULL, '{}'::text[], true)
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
  VALUES ('Burpee', 'capacity', '{"jumps_plyos"}'::text[], 'bilateral', 'anterior', 2, '{"bodyweight"}'::text[], 'Quads', '{"Chest","triceps","delts","core","hip flexors"}'::text[], 'mid', 'global', 'dynamic', NULL, '{}'::text[], true)
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
  VALUES ('Strict pushup burpee', 'capacity', '{"jumps_plyos"}'::text[], 'bilateral', 'anterior', 2, '{"bodyweight"}'::text[], 'Chest', '{"Quads","triceps","delts","core"}'::text[], 'mid', 'global', 'dynamic', NULL, '{}'::text[], true)
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
  VALUES ('No pushup burpee', 'capacity', '{"jumps_plyos"}'::text[], 'bilateral', 'anterior', 2, '{"bodyweight"}'::text[], 'Quads', '{"Glutes","calves","core"}'::text[], 'mid', 'global', 'dynamic', NULL, '{}'::text[], true)
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
  VALUES ('Box jump', 'capacity', '{"jumps_plyos"}'::text[], 'bilateral', 'anterior', 2, '{"plyo_box"}'::text[], 'Quads', '{"Glutes","calves","core"}'::text[], 'lengthened', 'global', 'dynamic', NULL, '{}'::text[], true)
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
  VALUES ('Box alternating stepup', 'capacity', '{"step_up"}'::text[], 'unilateral', 'anterior', 1, '{"plyo_box"}'::text[], 'Quads', '{"Glutes","calves","core"}'::text[], 'lengthened', 'global', 'dynamic', NULL, '{}'::text[], true)
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
  VALUES ('box alternating step over', 'capacity', '{"step_up"}'::text[], 'unilateral', 'anterior', 2, '{"plyo_box"}'::text[], 'Quads', '{"Glutes","calves","hip flexors","core"}'::text[], 'lengthened', 'global', 'dynamic', NULL, '{}'::text[], true)
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
  VALUES ('Burpee box jump', 'capacity', '{"jumps_plyos"}'::text[], 'bilateral', 'anterior', 3, '{"plyo_box"}'::text[], 'Quads', '{"Chest","triceps","delts","calves","core"}'::text[], 'mid', 'global', 'dynamic', NULL, '{}'::text[], true)
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
  VALUES ('Burpee box jump over', 'capacity', '{"jumps_plyos"}'::text[], 'bilateral', 'anterior', 3, '{"plyo_box"}'::text[], 'Quads', '{"Chest","triceps","delts","calves","core"}'::text[], 'mid', 'global', 'dynamic', NULL, '{}'::text[], true)
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
  VALUES ('Burpee box step up', 'capacity', '{"step_up"}'::text[], 'bilateral', 'anterior', 2, '{"plyo_box"}'::text[], 'Quads', '{"Chest","triceps","delts","glutes","core"}'::text[], 'mid', 'global', 'dynamic', NULL, '{}'::text[], true)
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
  VALUES ('burpee box stepover', 'capacity', '{"step_up"}'::text[], 'bilateral', 'anterior', 2, '{"plyo_box"}'::text[], 'Quads', '{"Chest","triceps","delts","glutes","core"}'::text[], 'mid', 'global', 'dynamic', NULL, '{}'::text[], true)
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
  VALUES ('Ab mat situp', 'capacity', '{"core_flexion"}'::text[], 'bilateral', 'anterior', 1, '{"bodyweight"}'::text[], 'Abs', '{"Hip flexors"}'::text[], 'shortened', 'regional', 'dynamic', NULL, '{}'::text[], true)
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
  VALUES ('Feet anchored situp', 'capacity', '{"core_flexion"}'::text[], 'bilateral', 'anterior', 1, '{"bodyweight"}'::text[], 'Abs', '{"Hip flexors"}'::text[], 'shortened', 'regional', 'dynamic', NULL, '{}'::text[], true)
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
  VALUES ('Alternating V-up (straight leg)', 'capacity', '{"core_flexion"}'::text[], 'unilateral', 'anterior', 2, '{"bodyweight"}'::text[], 'Abs', '{"Hip flexors"}'::text[], 'mid', 'regional', 'dynamic', NULL, '{}'::text[], true)
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
  VALUES ('Alternating V-up (bent leg)', 'capacity', '{"core_flexion"}'::text[], 'unilateral', 'anterior', 2, '{"bodyweight"}'::text[], 'Abs', '{"Hip flexors"}'::text[], 'mid', 'regional', 'dynamic', NULL, '{}'::text[], true)
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
  VALUES ('V-up (straight leg)', 'capacity', '{"core_flexion"}'::text[], 'bilateral', 'anterior', 2, '{"bodyweight"}'::text[], 'Abs', '{"Hip flexors"}'::text[], 'mid', 'regional', 'dynamic', NULL, '{}'::text[], true)
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
  VALUES ('V-up (bent leg)', 'capacity', '{"core_flexion"}'::text[], 'bilateral', 'anterior', 2, '{"bodyweight"}'::text[], 'Abs', '{"Hip flexors"}'::text[], 'mid', 'regional', 'dynamic', NULL, '{}'::text[], true)
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
  VALUES ('Russian Twist (bodyweight)', 'capacity', '{"core_rotation"}'::text[], 'bilateral', 'anterior', 1, '{"bodyweight"}'::text[], 'Obliques', '{"Abs","hip flexors"}'::text[], 'mid', 'regional', 'dynamic', NULL, '{}'::text[], true)
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
  VALUES ('Russian twist (weighted)', 'capacity', '{"core_rotation"}'::text[], 'bilateral', 'anterior', 1, '{}'::text[], 'Obliques', '{"Abs","hip flexors"}'::text[], 'mid', 'regional', 'dynamic', NULL, '{}'::text[], true)
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
  VALUES ('Pec doorway stretch', 'mobility', '{}'::text[], 'bilateral', 'anterior', 1, '{"bodyweight"}'::text[], 'Pecs (pec major)', '{"Anterior delts","biceps (long head)"}'::text[], 'lengthened', 'regional', 'stretch', NULL, '{}'::text[], true)
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
  VALUES ('Passive bar hang', 'mobility', '{}'::text[], 'bilateral', 'anterior', 2, '{"pull_up_bar"}'::text[], 'Lats', '{"Forearms/grip","pec minor","thoracic extensors"}'::text[], 'lengthened', 'global', 'stretch', NULL, '{}'::text[], true)
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
  VALUES ('Bench Puppy Pose (wall/bench puppy pose)', 'mobility', '{}'::text[], 'bilateral', 'anterior', 1, '{"bodyweight"}'::text[], 'Lats', '{"Triceps (long head)","thoracic extensors"}'::text[], 'lengthened', 'regional', 'stretch', NULL, '{}'::text[], true)
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
  VALUES ('Banded distraction lat stretch', 'mobility', '{}'::text[], 'bilateral', 'anterior', 2, '{"band"}'::text[], 'Lats', '{"Teres major","triceps (long head)"}'::text[], 'lengthened', 'regional', 'stretch', NULL, '{}'::text[], true)
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
  VALUES ('Standing PVC passthrough', 'mobility', '{}'::text[], 'bilateral', 'anterior', 2, '{"pvc"}'::text[], 'Shoulder flexors (delts)', '{"Rotator cuff","serratus anterior","thoracic extensors"}'::text[], 'mid', 'regional', 'dynamic', NULL, '{}'::text[], true)
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
  VALUES ('Prone PVC passthrough', 'mobility', '{}'::text[], 'bilateral', 'anterior', 2, '{"pvc"}'::text[], 'Shoulder flexors (delts)', '{"Rotator cuff","serratus anterior","thoracic extensors"}'::text[], 'mid', 'regional', 'dynamic', NULL, '{}'::text[], true)
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
  VALUES ('Standing banded passthrough', 'mobility', '{}'::text[], 'bilateral', 'anterior', 2, '{"band"}'::text[], 'Shoulder flexors (delts)', '{"Rotator cuff","serratus anterior"}'::text[], 'mid', 'regional', 'dynamic', NULL, '{}'::text[], true)
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
  VALUES ('Prone banded passthrough', 'mobility', '{}'::text[], 'bilateral', 'anterior', 2, '{"band"}'::text[], 'Shoulder flexors (delts)', '{"Rotator cuff","serratus anterior"}'::text[], 'mid', 'regional', 'dynamic', NULL, '{}'::text[], true)
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
  VALUES ('Tall plank to downward dog', 'mobility', '{"core_anti_extension"}'::text[], 'bilateral', 'anterior', 2, '{"bodyweight"}'::text[], 'Lats', '{"Shoulders","serratus anterior","calves","hamstrings"}'::text[], 'mid', 'global', 'dynamic', NULL, '{}'::text[], true)
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
  VALUES ('Yoga pushup (cobra to downward dog)', 'mobility', '{"spinal_extension"}'::text[], 'bilateral', 'anterior', 2, '{"bodyweight"}'::text[], 'Spinal extensors', '{"Shoulders","triceps","glutes"}'::text[], 'mid', 'global', 'dynamic', NULL, '{}'::text[], true)
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
  VALUES ('Scapula pullups', 'mobility', '{}'::text[], 'bilateral', 'posterior', 2, '{"pull_up_bar"}'::text[], 'Lower traps', '{"Lats","rhomboids","serratus anterior","grip"}'::text[], 'mid', 'regional', 'dynamic', NULL, '{}'::text[], true)
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
  VALUES ('Scapula pullup circles', 'mobility', '{}'::text[], 'bilateral', 'posterior', 3, '{"pull_up_bar"}'::text[], 'Lower traps', '{"Lats","rhomboids","serratus anterior","grip"}'::text[], 'mid', 'regional', 'dynamic', NULL, '{}'::text[], true)
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
  VALUES ('Seated forward fold', 'mobility', '{}'::text[], 'bilateral', 'posterior', 1, '{"bodyweight"}'::text[], 'Hamstrings', '{"Glutes","calves","spinal erectors"}'::text[], 'lengthened', 'regional', 'stretch', NULL, '{}'::text[], true)
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
  VALUES ('Seated hurdler stretch', 'mobility', '{"hinge"}'::text[], 'unilateral', 'posterior', 2, '{"bodyweight"}'::text[], 'Hamstrings', '{"Adductors","glutes","calves"}'::text[], 'lengthened', 'regional', 'stretch', NULL, '{}'::text[], true)
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
  VALUES ('Seated pancake stretch', 'mobility', '{}'::text[], 'bilateral', 'posterior', 2, '{"bodyweight"}'::text[], 'Adductors', '{"Hamstrings","glutes"}'::text[], 'lengthened', 'regional', 'stretch', NULL, '{}'::text[], true)
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
  VALUES ('Knees-to-Chest Hold (supine)', 'mobility', '{}'::text[], 'bilateral', 'anterior', 1, '{"bodyweight"}'::text[], 'Glutes (posterior hip)', '{"Low back"}'::text[], 'mid', 'regional', 'stretch', NULL, '{}'::text[], true)
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
  VALUES ('Jefferson curl', 'mobility', '{}'::text[], 'bilateral', 'posterior', 3, '{}'::text[], 'Hamstrings', '{"Spinal erectors","glutes","calves"}'::text[], 'lengthened', 'global', 'dynamic', NULL, '{}'::text[], true)
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
  VALUES ('Seated toe reach PNF (5s isometric + 20s stretch)', 'mobility', '{}'::text[], 'bilateral', 'posterior', 2, '{"bodyweight"}'::text[], 'Hamstrings', '{"Glutes","calves"}'::text[], 'lengthened', 'regional', 'dynamic', NULL, '{}'::text[], true)
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
  VALUES ('Seated hurdler PNF (5s isometric + 20s stretch)', 'mobility', '{"hinge"}'::text[], 'unilateral', 'posterior', 2, '{"bodyweight"}'::text[], 'Hamstrings', '{"Adductors","glutes"}'::text[], 'lengthened', 'regional', 'dynamic', NULL, '{}'::text[], true)
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
  VALUES ('Assisted Deep Squat Hold (elbows inside knees)', 'mobility', '{"squat"}'::text[], 'bilateral', 'anterior', 2, '{"bodyweight"}'::text[], 'Adductors', '{"Quads","glutes","calves"}'::text[], 'mid', 'global', 'stretch', NULL, '{}'::text[], true)
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
  VALUES ('Inchworm', 'mobility', '{}'::text[], 'bilateral', 'posterior', 2, '{"bodyweight"}'::text[], 'Hamstrings', '{"Shoulders","core","calves"}'::text[], 'lengthened', 'global', 'dynamic', NULL, '{}'::text[], true)
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
  VALUES ('DB Romanian deadlift', 'mobility', '{"hinge"}'::text[], 'bilateral', 'posterior', 2, '{"dumbbell"}'::text[], 'Hamstrings', '{"Glutes","spinal erectors","lats"}'::text[], 'lengthened', 'global', 'dynamic', NULL, '{}'::text[], true)
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
  VALUES ('Band assisted seated forward fold', 'mobility', '{}'::text[], 'bilateral', 'posterior', 2, '{"band"}'::text[], 'Hamstrings', '{"Glutes","calves"}'::text[], 'lengthened', 'regional', 'dynamic', NULL, '{}'::text[], true)
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
  VALUES ('Anchored standing forward leg swings', 'mobility', '{}'::text[], 'unilateral', 'anterior', 2, '{"bodyweight"}'::text[], 'Hip flexors', '{"Abs","quads"}'::text[], 'mid', 'regional', 'dynamic', NULL, '{}'::text[], true)
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
  VALUES ('Bar hang in arch', 'mobility', '{"spinal_extension"}'::text[], 'bilateral', 'posterior', 2, '{"pull_up_bar"}'::text[], 'Spinal extensors', '{"Lats","glutes","grip"}'::text[], 'lengthened', 'global', 'stretch', NULL, '{}'::text[], true)
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
  VALUES ('Cobra Pose', 'mobility', '{"spinal_extension"}'::text[], 'bilateral', 'posterior', 1, '{"bodyweight"}'::text[], 'Spinal extensors', '{"Glutes","lats"}'::text[], 'mid', 'regional', 'stretch', NULL, '{}'::text[], true)
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
  VALUES ('Prone archup', 'mobility', '{"spinal_extension"}'::text[], 'bilateral', 'posterior', 2, '{"bodyweight"}'::text[], 'Spinal extensors', '{"Glutes","upper back"}'::text[], 'mid', 'regional', 'dynamic', NULL, '{}'::text[], true)
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
  VALUES ('Prone cobra', 'mobility', '{"spinal_extension"}'::text[], 'bilateral', 'posterior', 2, '{"bodyweight"}'::text[], 'Upper back extensors', '{"Spinal erectors","glutes","rear delts"}'::text[], 'mid', 'regional', 'dynamic', NULL, '{}'::text[], true)
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
  VALUES ('Cat/Cow', 'mobility', '{"spinal_extension"}'::text[], 'bilateral', 'posterior', 1, '{"bodyweight"}'::text[], 'Spinal extensors', '{"Abs","hip flexors"}'::text[], 'mid', 'regional', 'dynamic', NULL, '{}'::text[], true)
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
  VALUES ('Foot anchored supine rotation and hold', 'mobility', '{"core_rotation"}'::text[], 'bilateral', 'posterior', 2, '{"bodyweight"}'::text[], 'Obliques', '{"Glutes","spinal rotators"}'::text[], 'mid', 'regional', 'stretch', NULL, '{}'::text[], true)
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
  VALUES ('Prone scorpion (pec and thoracic rotation)', 'mobility', '{"core_rotation"}'::text[], 'bilateral', 'posterior', 2, '{"bodyweight"}'::text[], 'Spinal rotators', '{"Glutes","hip flexors","pecs"}'::text[], 'mid', 'global', 'stretch', NULL, '{}'::text[], true)
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
  VALUES ('Prone scorpions', 'mobility', '{"core_rotation"}'::text[], 'bilateral', 'posterior', 2, '{"bodyweight"}'::text[], 'Spinal rotators', '{"Glutes","hip flexors"}'::text[], 'mid', 'global', 'dynamic', NULL, '{}'::text[], true)
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
  VALUES ('Dynamic scorpion', 'mobility', '{"core_rotation"}'::text[], 'bilateral', 'posterior', 2, '{"bodyweight"}'::text[], 'Spinal rotators', '{"Glutes","hip flexors"}'::text[], 'mid', 'global', 'dynamic', NULL, '{}'::text[], true)
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
  VALUES ('Windmill', 'mobility', '{"core_rotation"}'::text[], 'unilateral', 'posterior', 3, '{"bodyweight"}'::text[], 'Obliques', '{"Shoulders","hamstrings","adductors"}'::text[], 'mid', 'global', 'dynamic', NULL, '{}'::text[], true)
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
  VALUES ('Quadruped thoracic rotation', 'mobility', '{"core_rotation"}'::text[], 'unilateral', 'posterior', 1, '{"bodyweight"}'::text[], 'Thoracic rotators', '{"Scapular stabilizers"}'::text[], 'mid', 'regional', 'dynamic', NULL, '{}'::text[], true)
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
  VALUES ('Quadruped thoracic rotation and reach', 'mobility', '{"core_rotation"}'::text[], 'unilateral', 'posterior', 2, '{"bodyweight"}'::text[], 'Thoracic rotators', '{"Scapular stabilizers","lats"}'::text[], 'mid', 'regional', 'dynamic', NULL, '{}'::text[], true)
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
  VALUES ('Couch Stretch', 'mobility', '{"hip_extension"}'::text[], 'unilateral', 'anterior', 2, '{"bodyweight"}'::text[], 'Quads (rectus femoris)', '{"Hip flexors","glutes"}'::text[], 'lengthened', 'regional', 'stretch', NULL, '{}'::text[], true)
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
  VALUES ('Half-Kneeling Hip Flexor Stretch (glute squeeze)', 'mobility', '{"hip_extension"}'::text[], 'unilateral', 'anterior', 1, '{"bodyweight"}'::text[], 'Hip flexors (iliopsoas)', '{"Quads","glutes"}'::text[], 'lengthened', 'regional', 'stretch', NULL, '{}'::text[], true)
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
  VALUES ('ATG split squat iso hold', 'mobility', '{"lunge"}'::text[], 'unilateral', 'anterior', 2, '{"bodyweight"}'::text[], 'Quads', '{"Glutes","calves","adductors"}'::text[], 'lengthened', 'global', 'isometric', NULL, '{}'::text[], true)
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
  VALUES ('ATG split squat', 'mobility', '{"lunge"}'::text[], 'unilateral', 'anterior', 2, '{"bodyweight"}'::text[], 'Quads', '{"Glutes","calves","adductors"}'::text[], 'lengthened', 'global', 'dynamic', NULL, '{}'::text[], true)
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
  VALUES ('Prone single leg hip extension', 'mobility', '{"hip_extension"}'::text[], 'unilateral', 'posterior', 1, '{"bodyweight"}'::text[], 'Glutes', '{"Hamstrings","spinal erectors"}'::text[], 'shortened', 'regional', 'dynamic', NULL, '{}'::text[], true)
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
  VALUES ('Glute bridge march', 'mobility', '{"hip_extension"}'::text[], 'unilateral', 'posterior', 2, '{"bodyweight"}'::text[], 'Glutes', '{"Hamstrings","abs"}'::text[], 'mid', 'global', 'dynamic', NULL, '{}'::text[], true)
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
  VALUES ('Frog Stretch', 'mobility', '{}'::text[], 'bilateral', 'anterior', 1, '{"bodyweight"}'::text[], 'Adductors', '{"Glutes","hip flexors"}'::text[], 'lengthened', 'regional', 'stretch', NULL, '{}'::text[], true)
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
  VALUES ('Butterfly Stretch', 'mobility', '{}'::text[], 'bilateral', 'anterior', 1, '{"bodyweight"}'::text[], 'Adductors', '{"Hip flexors"}'::text[], 'lengthened', 'regional', 'stretch', NULL, '{}'::text[], true)
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
  VALUES ('Side Lunge (Cossack) Hold', 'mobility', '{"lunge"}'::text[], 'unilateral', 'anterior', 2, '{"bodyweight"}'::text[], 'Adductors', '{"Glutes","quads","calves"}'::text[], 'lengthened', 'global', 'stretch', NULL, '{}'::text[], true)
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
  VALUES ('1/2 kneeling leg lateral frog stretch', 'mobility', '{}'::text[], 'unilateral', 'anterior', 2, '{"bodyweight"}'::text[], 'Adductors', '{"Glutes","hip flexors"}'::text[], 'lengthened', 'regional', 'stretch', NULL, '{}'::text[], true)
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
  VALUES ('Cossack squat', 'mobility', '{"lunge"}'::text[], 'unilateral', 'anterior', 2, '{"bodyweight"}'::text[], 'Adductors', '{"Glutes","quads","calves"}'::text[], 'lengthened', 'global', 'dynamic', NULL, '{}'::text[], true)
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
  VALUES ('Kneeling frog squats', 'mobility', '{"squat"}'::text[], 'bilateral', 'anterior', 2, '{"bodyweight"}'::text[], 'Adductors', '{"Glutes","quads"}'::text[], 'mid', 'global', 'dynamic', NULL, '{}'::text[], true)
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
  VALUES ('Horse stance squats', 'mobility', '{"squat"}'::text[], 'bilateral', 'anterior', 2, '{"bodyweight"}'::text[], 'Adductors', '{"Quads","glutes"}'::text[], 'mid', 'global', 'dynamic', NULL, '{}'::text[], true)
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
  VALUES ('Bottom of squat iso hold (knee out focus)', 'mobility', '{"squat"}'::text[], 'bilateral', 'anterior', 2, '{"bodyweight"}'::text[], 'Adductors', '{"Glutes","quads","calves"}'::text[], 'mid', 'global', 'isometric', NULL, '{}'::text[], true)
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
  VALUES ('Couch Stretch (heel as close to butt)', 'mobility', '{"hip_extension"}'::text[], 'unilateral', 'anterior', 2, '{"bodyweight"}'::text[], 'Quads (rectus femoris)', '{"Hip flexors","glutes"}'::text[], 'lengthened', 'regional', 'stretch', NULL, '{}'::text[], true)
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
  VALUES ('Side-Lying Quad Stretch', 'mobility', '{"hip_extension"}'::text[], 'unilateral', 'anterior', 1, '{"bodyweight"}'::text[], 'Quads (rectus femoris)', '{"Hip flexors"}'::text[], 'lengthened', 'regional', 'stretch', NULL, '{}'::text[], true)
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
  VALUES ('Single leg Kneeling Quad Stretch (lie back, or arms supported on bench)', 'mobility', '{"hip_extension"}'::text[], 'unilateral', 'anterior', 2, '{"bodyweight"}'::text[], 'Quads', '{"Hip flexors","glutes"}'::text[], 'lengthened', 'regional', 'stretch', NULL, '{}'::text[], true)
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
  VALUES ('Dual leg kneeling quad stretch (lie back, or arms supported on bench)', 'mobility', '{"hip_extension"}'::text[], 'bilateral', 'anterior', 2, '{"bodyweight"}'::text[], 'Quads', '{"Hip flexors"}'::text[], 'lengthened', 'regional', 'stretch', NULL, '{}'::text[], true)
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
  VALUES ('Natural knee extensions', 'mobility', '{"squat"}'::text[], 'bilateral', 'anterior', 3, '{"bodyweight"}'::text[], 'Quads', '{"Hamstrings","glutes","calves"}'::text[], 'lengthened', 'global', 'dynamic', NULL, '{}'::text[], true)
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
  VALUES ('Cyclist squats', 'mobility', '{"squat"}'::text[], 'bilateral', 'anterior', 2, '{"bodyweight"}'::text[], 'Quads', '{"Calves","glutes"}'::text[], 'lengthened', 'global', 'dynamic', NULL, '{}'::text[], true)
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
  VALUES ('Heel elevated Bottom of squat iso hold (knee over toe focus)', 'mobility', '{"squat"}'::text[], 'bilateral', 'anterior', 2, '{}'::text[], 'Quads', '{"Calves","glutes"}'::text[], 'mid', 'global', 'isometric', NULL, '{}'::text[], true)
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
  VALUES ('1/2 kneeling knee over toe stretch', 'mobility', '{}'::text[], 'unilateral', 'posterior', 1, '{"bodyweight"}'::text[], 'Soleus', '{"Gastrocnemius","tibialis anterior"}'::text[], 'lengthened', 'regional', 'stretch', NULL, '{}'::text[], true)
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
  VALUES ('Weight plate calf stretch (straight leg)', 'mobility', '{}'::text[], 'unilateral', 'posterior', 1, '{}'::text[], 'Gastrocnemius', '{"Soleus"}'::text[], 'lengthened', 'regional', 'stretch', NULL, '{}'::text[], true)
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
  VALUES ('Weight plate calf stretch (bent leg)', 'mobility', '{}'::text[], 'unilateral', 'posterior', 1, '{}'::text[], 'Soleus', '{"Gastrocnemius"}'::text[], 'lengthened', 'regional', 'stretch', NULL, '{}'::text[], true)
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
  VALUES ('Down dog calf stretch', 'mobility', '{}'::text[], 'bilateral', 'posterior', 1, '{"bodyweight"}'::text[], 'Soleus', '{"Gastrocnemius","hamstrings"}'::text[], 'mid', 'global', 'stretch', NULL, '{}'::text[], true)
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
  VALUES ('Weight plate calf raise (straight leg) single leg', 'mobility', '{"ankle_extension"}'::text[], 'unilateral', 'posterior', 2, '{}'::text[], 'Gastrocnemius', '{"Soleus","peroneals"}'::text[], 'shortened', 'regional', 'dynamic', NULL, '{}'::text[], true)
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
  VALUES ('Weight plate calf raise (bent leg) single leg', 'mobility', '{"ankle_extension"}'::text[], 'unilateral', 'posterior', 2, '{}'::text[], 'Soleus', '{"Gastrocnemius"}'::text[], 'shortened', 'regional', 'dynamic', NULL, '{}'::text[], true)
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
  VALUES ('Weight plate calf raise (straight leg) dual leg', 'mobility', '{"ankle_extension"}'::text[], 'bilateral', 'posterior', 1, '{}'::text[], 'Gastrocnemius', '{"Soleus"}'::text[], 'shortened', 'regional', 'dynamic', NULL, '{}'::text[], true)
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
  VALUES ('Weight plate calf raise (bent leg) dual leg', 'mobility', '{"ankle_extension"}'::text[], 'bilateral', 'posterior', 1, '{}'::text[], 'Soleus', '{"Gastrocnemius"}'::text[], 'shortened', 'regional', 'dynamic', NULL, '{}'::text[], true)
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
  VALUES ('Alternating down dog calf pumps', 'mobility', '{}'::text[], 'bilateral', 'posterior', 1, '{"bodyweight"}'::text[], 'Soleus', '{"Gastrocnemius","hamstrings"}'::text[], 'mid', 'global', 'dynamic', NULL, '{}'::text[], true)
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
  VALUES ('Bottom of squat iso hold (knee over toe focus)', 'mobility', '{"squat"}'::text[], 'bilateral', 'anterior', 2, '{}'::text[], 'Quads', '{"Calves","glutes"}'::text[], 'mid', 'global', 'isometric', NULL, '{}'::text[], true)
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
  VALUES ('Kneeling push-up + scapula protraction (push-up plus)', 'warm_up', '{"horizontal_push"}'::text[], 'bilateral', 'anterior', 2, '{"bodyweight"}'::text[], 'Pecs', '{"Serratus anterior","triceps","anterior delts"}'::text[], 'mid', 'global', 'dynamic', 'horizontal', '{}'::text[], true)
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
  VALUES ('Incline push-up (hands elevated)', 'warm_up', '{"horizontal_push"}'::text[], 'bilateral', 'anterior', 1, '{"bodyweight"}'::text[], 'Pecs', '{"Triceps","anterior delts","serratus anterior"}'::text[], 'mid', 'global', 'dynamic', 'horizontal', '{}'::text[], true)
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
  VALUES ('Banded push-up (band around upper back)', 'warm_up', '{"horizontal_push"}'::text[], 'bilateral', 'anterior', 2, '{"band"}'::text[], 'Pecs', '{"Triceps","anterior delts","serratus anterior"}'::text[], 'mid', 'global', 'dynamic', 'horizontal', '{}'::text[], true)
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
  VALUES ('Staggered-stance single-arm DB floor press (1 arm)', 'warm_up', '{"horizontal_push"}'::text[], 'unilateral', 'anterior', 3, '{"dumbbell","kettlebell"}'::text[], 'Pecs', '{"Triceps","anterior delts","obliques (anti-rotation)"}'::text[], 'mid', 'global', 'dynamic', 'horizontal', '{}'::text[], true)
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
  VALUES ('Single-arm DB bench/floor press with iso hold (2–3s at midrange)', 'warm_up', '{"horizontal_push"}'::text[], 'unilateral', 'anterior', 2, '{"dumbbell","kettlebell"}'::text[], 'Pecs', '{"Triceps","anterior delts","serratus anterior"}'::text[], 'mid', 'global', 'isometric', 'horizontal', '{}'::text[], true)
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
  VALUES ('Archer push-up (assisted as needed; shift side-to-side)', 'warm_up', '{"horizontal_push"}'::text[], 'unilateral', 'anterior', 3, '{"bodyweight"}'::text[], 'Pecs', '{"Triceps","anterior delts","serratus anterior"}'::text[], 'mid', 'global', 'dynamic', 'horizontal', '{}'::text[], true)
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
  VALUES ('Bent-over banded pull-aparts', 'warm_up', '{"horizontal_pull"}'::text[], 'bilateral', 'posterior', 1, '{"band"}'::text[], 'Rear delts', '{"Mid traps","rhomboids","rotator cuff"}'::text[], 'mid', 'regional', 'dynamic', 'horizontal', '{}'::text[], true)
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
  VALUES ('Bent-over banded pull-aparts (supinated)', 'warm_up', '{"horizontal_pull"}'::text[], 'bilateral', 'posterior', 1, '{"band"}'::text[], 'Rear delts', '{"Mid traps","rhomboids","rotator cuff"}'::text[], 'mid', 'regional', 'dynamic', 'horizontal', '{}'::text[], true)
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
  VALUES ('Standing banded pull-aparts (pronated)', 'warm_up', '{"horizontal_pull"}'::text[], 'bilateral', 'posterior', 1, '{"band"}'::text[], 'Rear delts', '{"Mid traps","rhomboids","rotator cuff"}'::text[], 'mid', 'regional', 'dynamic', 'horizontal', '{}'::text[], true)
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
  VALUES ('Standing banded pull-aparts (supinated)', 'warm_up', '{"horizontal_pull"}'::text[], 'bilateral', 'posterior', 1, '{"band"}'::text[], 'Rear delts', '{"Mid traps","rhomboids","rotator cuff"}'::text[], 'mid', 'regional', 'dynamic', 'horizontal', '{}'::text[], true)
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
  VALUES ('Banded row (standing or hinge position)', 'warm_up', '{"horizontal_pull"}'::text[], 'bilateral', 'posterior', 1, '{"band"}'::text[], 'Lats', '{"Rhomboids","biceps","mid/lower traps"}'::text[], 'mid', 'global', 'dynamic', 'horizontal', '{}'::text[], true)
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
  VALUES ('Prone banded row (band anchored low; chest down)', 'warm_up', '{"horizontal_pull"}'::text[], 'bilateral', 'posterior', 2, '{"band"}'::text[], 'Mid back (rhomboids/traps)', '{"Rear delts","lats","rotator cuff"}'::text[], 'mid', 'regional', 'dynamic', 'horizontal', '{}'::text[], true)
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
  VALUES ('Single-arm DB row (split stance)', 'warm_up', '{"horizontal_pull"}'::text[], 'unilateral', 'posterior', 2, '{"dumbbell","kettlebell"}'::text[], 'Lats', '{"Rhomboids","biceps","obliques (anti-rotation)"}'::text[], 'mid', 'global', 'dynamic', 'horizontal', '{}'::text[], true)
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
  VALUES ('Single-arm DB row (single-leg stance)', 'warm_up', '{"horizontal_pull"}'::text[], 'unilateral', 'posterior', 3, '{"dumbbell","kettlebell"}'::text[], 'Lats', '{"Glute med (balance)","rhomboids","biceps","obliques"}'::text[], 'mid', 'global', 'dynamic', 'horizontal', '{}'::text[], true)
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
  VALUES ('Band single-arm row (half-kneeling)', 'warm_up', '{"horizontal_pull"}'::text[], 'unilateral', 'posterior', 2, '{"band"}'::text[], 'Lats', '{"Scapular retractors","obliques","glutes"}'::text[], 'mid', 'global', 'dynamic', 'horizontal', '{}'::text[], true)
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
  VALUES ('DB/KB Romanian deadlift (tempo 3110)', 'warm_up', '{"hinge"}'::text[], 'bilateral', 'posterior', 2, '{"dumbbell","kettlebell"}'::text[], 'Hamstrings', '{"Glutes","spinal erectors","lats"}'::text[], 'lengthened', 'global', 'dynamic', NULL, '{}'::text[], true)
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
  VALUES ('DB crush-grip Romanian deadlift (tempo 3110)', 'warm_up', '{"hinge"}'::text[], 'bilateral', 'posterior', 2, '{"dumbbell","kettlebell"}'::text[], 'Hamstrings', '{"Glutes","lats","spinal erectors"}'::text[], 'lengthened', 'global', 'dynamic', NULL, '{}'::text[], true)
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
  VALUES ('Hamstring bridge (bilateral)', 'warm_up', '{"hip_extension"}'::text[], 'bilateral', 'posterior', 1, '{"bodyweight"}'::text[], 'Glutes', '{"Hamstrings","abs (anti-extension)"}'::text[], 'shortened', 'global', 'dynamic', NULL, '{}'::text[], true)
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
  VALUES ('Supported single-leg RDL (tempo 3010)', 'warm_up', '{"hinge"}'::text[], 'unilateral', 'posterior', 2, '{"dumbbell","kettlebell"}'::text[], 'Glutes', '{"Hamstrings","adductors","spinal erectors"}'::text[], 'mid', 'global', 'dynamic', NULL, '{}'::text[], true)
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
  VALUES ('Single-leg RDL (unassisted)', 'warm_up', '{"hinge"}'::text[], 'unilateral', 'posterior', 3, '{"dumbbell","kettlebell"}'::text[], 'Glutes', '{"Hamstrings","foot/ankle stabilizers","obliques"}'::text[], 'mid', 'global', 'dynamic', NULL, '{}'::text[], true)
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
  VALUES ('Single-leg forward reach (bodyweight)', 'warm_up', '{}'::text[], 'unilateral', 'posterior', 2, '{"bodyweight"}'::text[], 'Glutes', '{"Hamstrings","foot intrinsics","glute med"}'::text[], 'mid', 'global', 'dynamic', NULL, '{}'::text[], true)
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
  VALUES ('Mini-band air squats (tempo 3111)', 'warm_up', '{"squat"}'::text[], 'bilateral', 'anterior', 2, '{"band"}'::text[], 'Quads', '{"Glutes","adductors","calves"}'::text[], 'mid', 'global', 'dynamic', NULL, '{}'::text[], true)
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
  VALUES ('Goblet squat + mini-band abduction (band above knees)', 'warm_up', '{"squat"}'::text[], 'bilateral', 'anterior', 2, '{"dumbbell","kettlebell"}'::text[], 'Quads', '{"Glute med","glute max","adductors"}'::text[], 'mid', 'global', 'dynamic', NULL, '{}'::text[], true)
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
  VALUES ('Goblet mini-band isometric squat hold (mid-range)', 'warm_up', '{"squat"}'::text[], 'bilateral', 'anterior', 2, '{"dumbbell","kettlebell"}'::text[], 'Quads', '{"Glute med","glutes","calves"}'::text[], 'mid', 'global', 'isometric', NULL, '{}'::text[], true)
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
  VALUES ('Split squat isometric hold (assisted if needed)', 'warm_up', '{"lunge"}'::text[], 'unilateral', 'anterior', 2, '{"bodyweight"}'::text[], 'Quads', '{"Glutes","adductors","calves"}'::text[], 'mid', 'global', 'isometric', NULL, '{}'::text[], true)
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
  VALUES ('Split squat (controlled tempo)', 'warm_up', '{"lunge"}'::text[], 'unilateral', 'anterior', 2, '{"bodyweight"}'::text[], 'Quads', '{"Glutes","adductors","calves"}'::text[], 'mid', 'global', 'dynamic', NULL, '{}'::text[], true)
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
  VALUES ('Reverse lunge to knee drive (balance)', 'warm_up', '{"lunge"}'::text[], 'unilateral', 'anterior', 3, '{"bodyweight"}'::text[], 'Quads', '{"Glutes","hip flexors","calves"}'::text[], 'mid', 'global', 'dynamic', NULL, '{}'::text[], true)
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
  VALUES ('Tall plank (hard-style)', 'warm_up', '{"core_anti_extension"}'::text[], 'bilateral', 'anterior', 1, '{"bodyweight"}'::text[], 'Rectus abdominis', '{"Serratus anterior","glutes","quads"}'::text[], 'mid', 'global', 'isometric', 'other', '{}'::text[], true)
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
  VALUES ('Tall plank alternating shoulder taps', 'warm_up', '{"core_anti_extension"}'::text[], 'unilateral', 'anterior', 2, '{"bodyweight"}'::text[], 'Obliques', '{"Serratus anterior","glutes","pecs"}'::text[], 'mid', 'global', 'dynamic', 'other', '{}'::text[], true)
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
  VALUES ('Forearm plank banded shoulder taps (band around wrists)', 'warm_up', '{"core_anti_extension"}'::text[], 'unilateral', 'anterior', 3, '{"band"}'::text[], 'Obliques', '{"Serratus anterior","glutes","lats"}'::text[], 'mid', 'global', 'dynamic', 'other', '{}'::text[], true)
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
  VALUES ('Glute bridge hold', 'warm_up', '{"hip_extension"}'::text[], 'bilateral', 'posterior', 1, '{"bodyweight"}'::text[], 'Glutes', '{"Hamstrings","abs (anti-extension)"}'::text[], 'shortened', 'global', 'isometric', NULL, '{}'::text[], true)
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
  VALUES ('Hamstring bridge hold (heels closer, more hamstring)', 'warm_up', '{"hip_extension"}'::text[], 'bilateral', 'posterior', 2, '{"bodyweight"}'::text[], 'Hamstrings', '{"Glutes","abs"}'::text[], 'shortened', 'global', 'isometric', NULL, '{}'::text[], true)
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
  VALUES ('Superman hold (arms by sides if needed)', 'warm_up', '{"spinal_extension"}'::text[], 'bilateral', 'posterior', 2, '{"bodyweight"}'::text[], 'Spinal extensors', '{"Glutes","mid-back extensors"}'::text[], 'mid', 'regional', 'isometric', 'other', '{}'::text[], true)
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
  VALUES ('Side plank hip lifts (up/down reps)', 'warm_up', '{"core_anti_lateral_flexion"}'::text[], 'unilateral', 'posterior', 2, '{"bodyweight"}'::text[], 'Obliques', '{"Glute med","QL","shoulder stabilizers"}'::text[], 'mid', 'global', 'dynamic', 'other', '{}'::text[], true)
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
  VALUES ('Standing DB side bend (short range, controlled)', 'warm_up', '{"core_lateral_flexion"}'::text[], 'unilateral', 'posterior', 2, '{"dumbbell","kettlebell"}'::text[], 'Obliques', '{"QL","forearm/grip"}'::text[], 'mid', 'regional', 'dynamic', 'other', '{}'::text[], true)
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
  VALUES ('Half-kneeling DB side bend', 'warm_up', '{"core_lateral_flexion"}'::text[], 'unilateral', 'posterior', 3, '{"dumbbell","kettlebell"}'::text[], 'Obliques', '{"QL","glute med"}'::text[], 'mid', 'regional', 'dynamic', 'other', '{}'::text[], true)
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
  VALUES ('Side plank hold (knees or full)', 'warm_up', '{"core_anti_lateral_flexion"}'::text[], 'unilateral', 'posterior', 2, '{"bodyweight"}'::text[], 'QL', '{"Obliques","glute med","shoulder stabilizers"}'::text[], 'mid', 'global', 'isometric', 'other', '{}'::text[], true)
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
  VALUES ('Suitcase carry march in place', 'warm_up', '{"carry"}'::text[], 'unilateral', 'posterior', 2, '{"dumbbell","kettlebell"}'::text[], 'QL', '{"Obliques","glute med","foot intrinsics"}'::text[], 'mid', 'global', 'dynamic', 'other', '{}'::text[], true)
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
  VALUES ('Half-kneeling suitcase hold (tall posture)', 'warm_up', '{"core_anti_lateral_flexion"}'::text[], 'unilateral', 'posterior', 2, '{"dumbbell","kettlebell"}'::text[], 'QL', '{"Obliques","glute med"}'::text[], 'mid', 'regional', 'isometric', 'other', '{}'::text[], true)
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
  VALUES ('Supine bent-knee windshield wipers (controlled)', 'warm_up', '{"core_anti_extension"}'::text[], 'bilateral', 'anterior', 2, '{"bodyweight"}'::text[], 'Obliques', '{"Hip flexors","glutes"}'::text[], 'mid', 'regional', 'dynamic', 'other', '{}'::text[], true)
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
  VALUES ('Seated Russian twist (feet down, small range)', 'warm_up', '{"core_rotation"}'::text[], 'bilateral', 'anterior', 2, '{"bodyweight"}'::text[], 'Obliques', '{"Hip flexors"}'::text[], 'mid', 'regional', 'dynamic', 'other', '{}'::text[], true)
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
  VALUES ('Standing band woodchop (high-to-low)', 'warm_up', '{"core_rotation"}'::text[], 'unilateral', 'anterior', 2, '{"band"}'::text[], 'Obliques', '{"Lats","glutes"}'::text[], 'mid', 'global', 'dynamic', 'other', '{}'::text[], true)
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
  VALUES ('Bird dog (slow, reach long)', 'warm_up', '{"core_anti_extension"}'::text[], 'unilateral', 'posterior', 1, '{"bodyweight"}'::text[], 'Multifidus', '{"Obliques","glutes","serratus anterior"}'::text[], 'mid', 'global', 'dynamic', 'other', '{}'::text[], true)
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
  VALUES ('Tall plank shoulder taps (slow, minimal hip shift)', 'warm_up', '{"core_anti_extension"}'::text[], 'unilateral', 'anterior', 2, '{"bodyweight"}'::text[], 'Obliques', '{"Serratus anterior","glutes"}'::text[], 'mid', 'global', 'dynamic', 'other', '{}'::text[], true)
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
  VALUES ('Half-kneeling band Pallof press (hold/press)', 'warm_up', '{"core_anti_rotation"}'::text[], 'bilateral', 'anterior', 2, '{"band"}'::text[], 'Obliques', '{"Glute med","deep abs"}'::text[], 'mid', 'global', 'isometric', 'other', '{}'::text[], true)
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
  VALUES ('Dead bug (bent-knee)', 'warm_up', '{"core_anti_extension"}'::text[], 'bilateral', 'anterior', 1, '{"bodyweight"}'::text[], 'Deep abs (TA)', '{"Hip flexors (controlled)","obliques"}'::text[], 'mid', 'global', 'dynamic', 'other', '{}'::text[], true)
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
  VALUES ('Lying dual leg lowers (tempo 3110)', 'warm_up', '{"core_flexion"}'::text[], 'bilateral', 'anterior', 3, '{"bodyweight"}'::text[], 'Rectus abdominis', '{"Hip flexors"}'::text[], 'mid', 'regional', 'dynamic', 'other', '{}'::text[], true)
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
  VALUES ('DB in hands dual leg lowers (reach to ceiling)', 'warm_up', '{"core_flexion"}'::text[], 'bilateral', 'anterior', 2, '{"dumbbell","kettlebell"}'::text[], 'Rectus abdominis', '{"Serratus anterior","lats (brace)","hip flexors"}'::text[], 'mid', 'global', 'dynamic', 'other', '{}'::text[], true)
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
  VALUES ('Bent-over banded pull-aparts (pronated)', 'warm_up', '{}'::text[], 'bilateral', 'posterior', NULL, '{}'::text[], 'mid', '{}'::text[], NULL, NULL, NULL, 'other', '{}'::text[], true)
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
