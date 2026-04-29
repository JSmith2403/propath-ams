-- Brief 5c exercise library import — chunk 1/5
-- Source: exercise-library-import-2026-04-30.sql
-- Inserts 1-184 of 918.
-- Idempotent: every row uses ON CONFLICT (name) DO UPDATE.

BEGIN;

INSERT INTO exercise_library (name, category, movement_patterns, bilateral_unilateral, posterior_anterior, complexity, equipment, primary_muscle, supporting_muscles, muscle_bias, joint_count_level, dynamic_isometric, movement_plane, primary_joints, is_active)
  VALUES ('DB/KB Goblet Squat', 'strength', '{"squat"}'::text[], 'bilateral', 'anterior', 1, '{"dumbbell","kettlebell"}'::text[], 'Quads', '{"Glutes","Adductors","Erectors","Calves"}'::text[], 'mid', 'regional', NULL, NULL, '{"Ankle","Knee","Hip"}'::text[], true)
  ON CONFLICT (name) DO UPDATE SET
    category = EXCLUDED.category,
    movement_patterns = EXCLUDED.movement_patterns,
    bilateral_unilateral = EXCLUDED.bilateral_unilateral,
    posterior_anterior = EXCLUDED.posterior_anterior,
    complexity = EXCLUDED.complexity,
    equipment = EXCLUDED.equipment,
    primary_muscle = EXCLUDED.primary_muscle,
    supporting_muscles = EXCLUDED.supporting_muscles,
    muscle_bias = EXCLUDED.muscle_bias,
    joint_count_level = EXCLUDED.joint_count_level,
    dynamic_isometric = EXCLUDED.dynamic_isometric,
    movement_plane = EXCLUDED.movement_plane,
    primary_joints = EXCLUDED.primary_joints,
    is_active = true,
    updated_at = now();

INSERT INTO exercise_library (name, category, movement_patterns, bilateral_unilateral, posterior_anterior, complexity, equipment, primary_muscle, supporting_muscles, muscle_bias, joint_count_level, dynamic_isometric, movement_plane, primary_joints, is_active)
  VALUES ('Heel Elevated DB/KB Goblet Squat', 'strength', '{"squat"}'::text[], 'bilateral', 'anterior', 1, '{"dumbbell","kettlebell"}'::text[], 'Quads', '{"Glutes","Adductors","Erectors","Calves"}'::text[], 'lengthened', 'regional', NULL, NULL, '{"Ankle","Knee","Hip"}'::text[], true)
  ON CONFLICT (name) DO UPDATE SET
    category = EXCLUDED.category,
    movement_patterns = EXCLUDED.movement_patterns,
    bilateral_unilateral = EXCLUDED.bilateral_unilateral,
    posterior_anterior = EXCLUDED.posterior_anterior,
    complexity = EXCLUDED.complexity,
    equipment = EXCLUDED.equipment,
    primary_muscle = EXCLUDED.primary_muscle,
    supporting_muscles = EXCLUDED.supporting_muscles,
    muscle_bias = EXCLUDED.muscle_bias,
    joint_count_level = EXCLUDED.joint_count_level,
    dynamic_isometric = EXCLUDED.dynamic_isometric,
    movement_plane = EXCLUDED.movement_plane,
    primary_joints = EXCLUDED.primary_joints,
    is_active = true,
    updated_at = now();

INSERT INTO exercise_library (name, category, movement_patterns, bilateral_unilateral, posterior_anterior, complexity, equipment, primary_muscle, supporting_muscles, muscle_bias, joint_count_level, dynamic_isometric, movement_plane, primary_joints, is_active)
  VALUES ('BB Front Squat', 'strength', '{"squat"}'::text[], 'bilateral', 'anterior', 3, '{"barbell"}'::text[], 'Quads', '{"Glutes","Upper back","Adductors","Calves"}'::text[], 'mid', 'regional', NULL, NULL, '{"Ankle","Knee","Hip"}'::text[], true)
  ON CONFLICT (name) DO UPDATE SET
    category = EXCLUDED.category,
    movement_patterns = EXCLUDED.movement_patterns,
    bilateral_unilateral = EXCLUDED.bilateral_unilateral,
    posterior_anterior = EXCLUDED.posterior_anterior,
    complexity = EXCLUDED.complexity,
    equipment = EXCLUDED.equipment,
    primary_muscle = EXCLUDED.primary_muscle,
    supporting_muscles = EXCLUDED.supporting_muscles,
    muscle_bias = EXCLUDED.muscle_bias,
    joint_count_level = EXCLUDED.joint_count_level,
    dynamic_isometric = EXCLUDED.dynamic_isometric,
    movement_plane = EXCLUDED.movement_plane,
    primary_joints = EXCLUDED.primary_joints,
    is_active = true,
    updated_at = now();

INSERT INTO exercise_library (name, category, movement_patterns, bilateral_unilateral, posterior_anterior, complexity, equipment, primary_muscle, supporting_muscles, muscle_bias, joint_count_level, dynamic_isometric, movement_plane, primary_joints, is_active)
  VALUES ('Heel Elevated BB Front Squat', 'strength', '{"squat"}'::text[], 'bilateral', 'anterior', 3, '{"barbell"}'::text[], 'Quads', '{"Glutes","Upper back","Adductors","Calves"}'::text[], 'lengthened', 'regional', NULL, NULL, '{"Ankle","Knee","Hip"}'::text[], true)
  ON CONFLICT (name) DO UPDATE SET
    category = EXCLUDED.category,
    movement_patterns = EXCLUDED.movement_patterns,
    bilateral_unilateral = EXCLUDED.bilateral_unilateral,
    posterior_anterior = EXCLUDED.posterior_anterior,
    complexity = EXCLUDED.complexity,
    equipment = EXCLUDED.equipment,
    primary_muscle = EXCLUDED.primary_muscle,
    supporting_muscles = EXCLUDED.supporting_muscles,
    muscle_bias = EXCLUDED.muscle_bias,
    joint_count_level = EXCLUDED.joint_count_level,
    dynamic_isometric = EXCLUDED.dynamic_isometric,
    movement_plane = EXCLUDED.movement_plane,
    primary_joints = EXCLUDED.primary_joints,
    is_active = true,
    updated_at = now();

INSERT INTO exercise_library (name, category, movement_patterns, bilateral_unilateral, posterior_anterior, complexity, equipment, primary_muscle, supporting_muscles, muscle_bias, joint_count_level, dynamic_isometric, movement_plane, primary_joints, is_active)
  VALUES ('BB Back Squat', 'strength', '{"squat"}'::text[], 'bilateral', 'mixed', 3, '{"barbell"}'::text[], 'Quads', '{"Glutes","Adductors","Erectors","Calves"}'::text[], 'mid', 'regional', NULL, NULL, '{"Ankle","Knee","Hip"}'::text[], true)
  ON CONFLICT (name) DO UPDATE SET
    category = EXCLUDED.category,
    movement_patterns = EXCLUDED.movement_patterns,
    bilateral_unilateral = EXCLUDED.bilateral_unilateral,
    posterior_anterior = EXCLUDED.posterior_anterior,
    complexity = EXCLUDED.complexity,
    equipment = EXCLUDED.equipment,
    primary_muscle = EXCLUDED.primary_muscle,
    supporting_muscles = EXCLUDED.supporting_muscles,
    muscle_bias = EXCLUDED.muscle_bias,
    joint_count_level = EXCLUDED.joint_count_level,
    dynamic_isometric = EXCLUDED.dynamic_isometric,
    movement_plane = EXCLUDED.movement_plane,
    primary_joints = EXCLUDED.primary_joints,
    is_active = true,
    updated_at = now();

INSERT INTO exercise_library (name, category, movement_patterns, bilateral_unilateral, posterior_anterior, complexity, equipment, primary_muscle, supporting_muscles, muscle_bias, joint_count_level, dynamic_isometric, movement_plane, primary_joints, is_active)
  VALUES ('Heel Elevated BB Back Squat', 'strength', '{"squat"}'::text[], 'bilateral', 'anterior', 3, '{"barbell"}'::text[], 'Quads', '{"Glutes","Adductors","Erectors","Calves"}'::text[], 'lengthened', 'regional', NULL, NULL, '{"Ankle","Knee","Hip"}'::text[], true)
  ON CONFLICT (name) DO UPDATE SET
    category = EXCLUDED.category,
    movement_patterns = EXCLUDED.movement_patterns,
    bilateral_unilateral = EXCLUDED.bilateral_unilateral,
    posterior_anterior = EXCLUDED.posterior_anterior,
    complexity = EXCLUDED.complexity,
    equipment = EXCLUDED.equipment,
    primary_muscle = EXCLUDED.primary_muscle,
    supporting_muscles = EXCLUDED.supporting_muscles,
    muscle_bias = EXCLUDED.muscle_bias,
    joint_count_level = EXCLUDED.joint_count_level,
    dynamic_isometric = EXCLUDED.dynamic_isometric,
    movement_plane = EXCLUDED.movement_plane,
    primary_joints = EXCLUDED.primary_joints,
    is_active = true,
    updated_at = now();

INSERT INTO exercise_library (name, category, movement_patterns, bilateral_unilateral, posterior_anterior, complexity, equipment, primary_muscle, supporting_muscles, muscle_bias, joint_count_level, dynamic_isometric, movement_plane, primary_joints, is_active)
  VALUES ('BB Box Squat', 'strength', '{"squat"}'::text[], 'bilateral', 'mixed', 2, '{"barbell","plyo_box"}'::text[], 'Glutes', '{"Quads","Adductors","Erectors","Calves"}'::text[], 'shortened', 'regional', NULL, NULL, '{"Ankle","Knee","Hip"}'::text[], true)
  ON CONFLICT (name) DO UPDATE SET
    category = EXCLUDED.category,
    movement_patterns = EXCLUDED.movement_patterns,
    bilateral_unilateral = EXCLUDED.bilateral_unilateral,
    posterior_anterior = EXCLUDED.posterior_anterior,
    complexity = EXCLUDED.complexity,
    equipment = EXCLUDED.equipment,
    primary_muscle = EXCLUDED.primary_muscle,
    supporting_muscles = EXCLUDED.supporting_muscles,
    muscle_bias = EXCLUDED.muscle_bias,
    joint_count_level = EXCLUDED.joint_count_level,
    dynamic_isometric = EXCLUDED.dynamic_isometric,
    movement_plane = EXCLUDED.movement_plane,
    primary_joints = EXCLUDED.primary_joints,
    is_active = true,
    updated_at = now();

INSERT INTO exercise_library (name, category, movement_patterns, bilateral_unilateral, posterior_anterior, complexity, equipment, primary_muscle, supporting_muscles, muscle_bias, joint_count_level, dynamic_isometric, movement_plane, primary_joints, is_active)
  VALUES ('Heel Elevated BB Box Squat', 'strength', '{"squat"}'::text[], 'bilateral', 'mixed', 2, '{"barbell"}'::text[], 'Glutes', '{"Quads","Adductors","Erectors","Calves"}'::text[], 'mid', 'regional', NULL, NULL, '{"Ankle","Knee","Hip"}'::text[], true)
  ON CONFLICT (name) DO UPDATE SET
    category = EXCLUDED.category,
    movement_patterns = EXCLUDED.movement_patterns,
    bilateral_unilateral = EXCLUDED.bilateral_unilateral,
    posterior_anterior = EXCLUDED.posterior_anterior,
    complexity = EXCLUDED.complexity,
    equipment = EXCLUDED.equipment,
    primary_muscle = EXCLUDED.primary_muscle,
    supporting_muscles = EXCLUDED.supporting_muscles,
    muscle_bias = EXCLUDED.muscle_bias,
    joint_count_level = EXCLUDED.joint_count_level,
    dynamic_isometric = EXCLUDED.dynamic_isometric,
    movement_plane = EXCLUDED.movement_plane,
    primary_joints = EXCLUDED.primary_joints,
    is_active = true,
    updated_at = now();

INSERT INTO exercise_library (name, category, movement_patterns, bilateral_unilateral, posterior_anterior, complexity, equipment, primary_muscle, supporting_muscles, muscle_bias, joint_count_level, dynamic_isometric, movement_plane, primary_joints, is_active)
  VALUES ('BB Front Rack Cyclist Squat', 'strength', '{"squat"}'::text[], 'bilateral', 'anterior', 3, '{"barbell"}'::text[], 'Quads', '{"Glutes","Adductors","Erectors","Calves"}'::text[], 'lengthened', 'regional', NULL, NULL, '{"Ankle","Knee","Hip"}'::text[], true)
  ON CONFLICT (name) DO UPDATE SET
    category = EXCLUDED.category,
    movement_patterns = EXCLUDED.movement_patterns,
    bilateral_unilateral = EXCLUDED.bilateral_unilateral,
    posterior_anterior = EXCLUDED.posterior_anterior,
    complexity = EXCLUDED.complexity,
    equipment = EXCLUDED.equipment,
    primary_muscle = EXCLUDED.primary_muscle,
    supporting_muscles = EXCLUDED.supporting_muscles,
    muscle_bias = EXCLUDED.muscle_bias,
    joint_count_level = EXCLUDED.joint_count_level,
    dynamic_isometric = EXCLUDED.dynamic_isometric,
    movement_plane = EXCLUDED.movement_plane,
    primary_joints = EXCLUDED.primary_joints,
    is_active = true,
    updated_at = now();

INSERT INTO exercise_library (name, category, movement_patterns, bilateral_unilateral, posterior_anterior, complexity, equipment, primary_muscle, supporting_muscles, muscle_bias, joint_count_level, dynamic_isometric, movement_plane, primary_joints, is_active)
  VALUES ('Heel Elevated BB Front Rack Cyclist Squat', 'strength', '{"squat"}'::text[], 'bilateral', 'anterior', 3, '{"barbell"}'::text[], 'Quads', '{"Glutes","Adductors","Erectors","Calves"}'::text[], 'lengthened', 'regional', NULL, NULL, '{"Ankle","Knee","Hip"}'::text[], true)
  ON CONFLICT (name) DO UPDATE SET
    category = EXCLUDED.category,
    movement_patterns = EXCLUDED.movement_patterns,
    bilateral_unilateral = EXCLUDED.bilateral_unilateral,
    posterior_anterior = EXCLUDED.posterior_anterior,
    complexity = EXCLUDED.complexity,
    equipment = EXCLUDED.equipment,
    primary_muscle = EXCLUDED.primary_muscle,
    supporting_muscles = EXCLUDED.supporting_muscles,
    muscle_bias = EXCLUDED.muscle_bias,
    joint_count_level = EXCLUDED.joint_count_level,
    dynamic_isometric = EXCLUDED.dynamic_isometric,
    movement_plane = EXCLUDED.movement_plane,
    primary_joints = EXCLUDED.primary_joints,
    is_active = true,
    updated_at = now();

INSERT INTO exercise_library (name, category, movement_patterns, bilateral_unilateral, posterior_anterior, complexity, equipment, primary_muscle, supporting_muscles, muscle_bias, joint_count_level, dynamic_isometric, movement_plane, primary_joints, is_active)
  VALUES ('BB Back Rack Cyclist Squat', 'strength', '{"squat"}'::text[], 'bilateral', 'anterior', 3, '{"barbell"}'::text[], 'Quads', '{"Glutes","Adductors","Erectors","Calves"}'::text[], 'lengthened', 'regional', NULL, NULL, '{"Ankle","Knee","Hip"}'::text[], true)
  ON CONFLICT (name) DO UPDATE SET
    category = EXCLUDED.category,
    movement_patterns = EXCLUDED.movement_patterns,
    bilateral_unilateral = EXCLUDED.bilateral_unilateral,
    posterior_anterior = EXCLUDED.posterior_anterior,
    complexity = EXCLUDED.complexity,
    equipment = EXCLUDED.equipment,
    primary_muscle = EXCLUDED.primary_muscle,
    supporting_muscles = EXCLUDED.supporting_muscles,
    muscle_bias = EXCLUDED.muscle_bias,
    joint_count_level = EXCLUDED.joint_count_level,
    dynamic_isometric = EXCLUDED.dynamic_isometric,
    movement_plane = EXCLUDED.movement_plane,
    primary_joints = EXCLUDED.primary_joints,
    is_active = true,
    updated_at = now();

INSERT INTO exercise_library (name, category, movement_patterns, bilateral_unilateral, posterior_anterior, complexity, equipment, primary_muscle, supporting_muscles, muscle_bias, joint_count_level, dynamic_isometric, movement_plane, primary_joints, is_active)
  VALUES ('Heel Elevated BB Back Rack Cyclist Squat', 'strength', '{"squat"}'::text[], 'bilateral', 'anterior', 3, '{"barbell"}'::text[], 'Quads', '{"Glutes","Adductors","Erectors","Calves"}'::text[], 'lengthened', 'regional', NULL, NULL, '{"Ankle","Knee","Hip"}'::text[], true)
  ON CONFLICT (name) DO UPDATE SET
    category = EXCLUDED.category,
    movement_patterns = EXCLUDED.movement_patterns,
    bilateral_unilateral = EXCLUDED.bilateral_unilateral,
    posterior_anterior = EXCLUDED.posterior_anterior,
    complexity = EXCLUDED.complexity,
    equipment = EXCLUDED.equipment,
    primary_muscle = EXCLUDED.primary_muscle,
    supporting_muscles = EXCLUDED.supporting_muscles,
    muscle_bias = EXCLUDED.muscle_bias,
    joint_count_level = EXCLUDED.joint_count_level,
    dynamic_isometric = EXCLUDED.dynamic_isometric,
    movement_plane = EXCLUDED.movement_plane,
    primary_joints = EXCLUDED.primary_joints,
    is_active = true,
    updated_at = now();

INSERT INTO exercise_library (name, category, movement_patterns, bilateral_unilateral, posterior_anterior, complexity, equipment, primary_muscle, supporting_muscles, muscle_bias, joint_count_level, dynamic_isometric, movement_plane, primary_joints, is_active)
  VALUES ('DB Goblet Cyclist Squat', 'strength', '{"squat"}'::text[], 'bilateral', 'anterior', 2, '{"dumbbell"}'::text[], 'Quads', '{"Glutes","Adductors","Erectors","Calves"}'::text[], 'lengthened', 'regional', NULL, NULL, '{"Ankle","Knee","Hip"}'::text[], true)
  ON CONFLICT (name) DO UPDATE SET
    category = EXCLUDED.category,
    movement_patterns = EXCLUDED.movement_patterns,
    bilateral_unilateral = EXCLUDED.bilateral_unilateral,
    posterior_anterior = EXCLUDED.posterior_anterior,
    complexity = EXCLUDED.complexity,
    equipment = EXCLUDED.equipment,
    primary_muscle = EXCLUDED.primary_muscle,
    supporting_muscles = EXCLUDED.supporting_muscles,
    muscle_bias = EXCLUDED.muscle_bias,
    joint_count_level = EXCLUDED.joint_count_level,
    dynamic_isometric = EXCLUDED.dynamic_isometric,
    movement_plane = EXCLUDED.movement_plane,
    primary_joints = EXCLUDED.primary_joints,
    is_active = true,
    updated_at = now();

INSERT INTO exercise_library (name, category, movement_patterns, bilateral_unilateral, posterior_anterior, complexity, equipment, primary_muscle, supporting_muscles, muscle_bias, joint_count_level, dynamic_isometric, movement_plane, primary_joints, is_active)
  VALUES ('Heel Elevated DB Goblet Cyclist Squat', 'strength', '{"squat"}'::text[], 'bilateral', 'anterior', 2, '{"dumbbell"}'::text[], 'Quads', '{"Glutes","Adductors","Erectors","Calves"}'::text[], 'lengthened', 'regional', NULL, NULL, '{"Ankle","Knee","Hip"}'::text[], true)
  ON CONFLICT (name) DO UPDATE SET
    category = EXCLUDED.category,
    movement_patterns = EXCLUDED.movement_patterns,
    bilateral_unilateral = EXCLUDED.bilateral_unilateral,
    posterior_anterior = EXCLUDED.posterior_anterior,
    complexity = EXCLUDED.complexity,
    equipment = EXCLUDED.equipment,
    primary_muscle = EXCLUDED.primary_muscle,
    supporting_muscles = EXCLUDED.supporting_muscles,
    muscle_bias = EXCLUDED.muscle_bias,
    joint_count_level = EXCLUDED.joint_count_level,
    dynamic_isometric = EXCLUDED.dynamic_isometric,
    movement_plane = EXCLUDED.movement_plane,
    primary_joints = EXCLUDED.primary_joints,
    is_active = true,
    updated_at = now();

INSERT INTO exercise_library (name, category, movement_patterns, bilateral_unilateral, posterior_anterior, complexity, equipment, primary_muscle, supporting_muscles, muscle_bias, joint_count_level, dynamic_isometric, movement_plane, primary_joints, is_active)
  VALUES ('Dual KB Front Squat', 'strength', '{"squat"}'::text[], 'bilateral', 'anterior', 2, '{"kettlebell"}'::text[], 'Quads', '{"Glutes","Upper back","Adductors","Calves"}'::text[], 'mid', 'regional', NULL, NULL, '{"Ankle","Knee","Hip"}'::text[], true)
  ON CONFLICT (name) DO UPDATE SET
    category = EXCLUDED.category,
    movement_patterns = EXCLUDED.movement_patterns,
    bilateral_unilateral = EXCLUDED.bilateral_unilateral,
    posterior_anterior = EXCLUDED.posterior_anterior,
    complexity = EXCLUDED.complexity,
    equipment = EXCLUDED.equipment,
    primary_muscle = EXCLUDED.primary_muscle,
    supporting_muscles = EXCLUDED.supporting_muscles,
    muscle_bias = EXCLUDED.muscle_bias,
    joint_count_level = EXCLUDED.joint_count_level,
    dynamic_isometric = EXCLUDED.dynamic_isometric,
    movement_plane = EXCLUDED.movement_plane,
    primary_joints = EXCLUDED.primary_joints,
    is_active = true,
    updated_at = now();

INSERT INTO exercise_library (name, category, movement_patterns, bilateral_unilateral, posterior_anterior, complexity, equipment, primary_muscle, supporting_muscles, muscle_bias, joint_count_level, dynamic_isometric, movement_plane, primary_joints, is_active)
  VALUES ('Heel Elevated Dual KB Front Squat', 'strength', '{"squat"}'::text[], 'bilateral', 'anterior', 2, '{"kettlebell"}'::text[], 'Quads', '{"Glutes","Upper back","Adductors","Calves"}'::text[], 'lengthened', 'regional', NULL, NULL, '{"Ankle","Knee","Hip"}'::text[], true)
  ON CONFLICT (name) DO UPDATE SET
    category = EXCLUDED.category,
    movement_patterns = EXCLUDED.movement_patterns,
    bilateral_unilateral = EXCLUDED.bilateral_unilateral,
    posterior_anterior = EXCLUDED.posterior_anterior,
    complexity = EXCLUDED.complexity,
    equipment = EXCLUDED.equipment,
    primary_muscle = EXCLUDED.primary_muscle,
    supporting_muscles = EXCLUDED.supporting_muscles,
    muscle_bias = EXCLUDED.muscle_bias,
    joint_count_level = EXCLUDED.joint_count_level,
    dynamic_isometric = EXCLUDED.dynamic_isometric,
    movement_plane = EXCLUDED.movement_plane,
    primary_joints = EXCLUDED.primary_joints,
    is_active = true,
    updated_at = now();

INSERT INTO exercise_library (name, category, movement_patterns, bilateral_unilateral, posterior_anterior, complexity, equipment, primary_muscle, supporting_muscles, muscle_bias, joint_count_level, dynamic_isometric, movement_plane, primary_joints, is_active)
  VALUES ('Dual KB Front Rack Cyclist Squat', 'strength', '{"squat"}'::text[], 'bilateral', 'anterior', 3, '{"kettlebell"}'::text[], 'Quads', '{"Glutes","Upper back","Adductors","Calves"}'::text[], 'lengthened', 'regional', NULL, NULL, '{"Ankle","Knee","Hip"}'::text[], true)
  ON CONFLICT (name) DO UPDATE SET
    category = EXCLUDED.category,
    movement_patterns = EXCLUDED.movement_patterns,
    bilateral_unilateral = EXCLUDED.bilateral_unilateral,
    posterior_anterior = EXCLUDED.posterior_anterior,
    complexity = EXCLUDED.complexity,
    equipment = EXCLUDED.equipment,
    primary_muscle = EXCLUDED.primary_muscle,
    supporting_muscles = EXCLUDED.supporting_muscles,
    muscle_bias = EXCLUDED.muscle_bias,
    joint_count_level = EXCLUDED.joint_count_level,
    dynamic_isometric = EXCLUDED.dynamic_isometric,
    movement_plane = EXCLUDED.movement_plane,
    primary_joints = EXCLUDED.primary_joints,
    is_active = true,
    updated_at = now();

INSERT INTO exercise_library (name, category, movement_patterns, bilateral_unilateral, posterior_anterior, complexity, equipment, primary_muscle, supporting_muscles, muscle_bias, joint_count_level, dynamic_isometric, movement_plane, primary_joints, is_active)
  VALUES ('Heel Elevated Dual KB Front Rack Cyclist Squat', 'strength', '{"squat"}'::text[], 'bilateral', 'anterior', 3, '{"kettlebell"}'::text[], 'Quads', '{"Glutes","Upper back","Adductors","Calves"}'::text[], 'lengthened', 'regional', NULL, NULL, '{"Ankle","Knee","Hip"}'::text[], true)
  ON CONFLICT (name) DO UPDATE SET
    category = EXCLUDED.category,
    movement_patterns = EXCLUDED.movement_patterns,
    bilateral_unilateral = EXCLUDED.bilateral_unilateral,
    posterior_anterior = EXCLUDED.posterior_anterior,
    complexity = EXCLUDED.complexity,
    equipment = EXCLUDED.equipment,
    primary_muscle = EXCLUDED.primary_muscle,
    supporting_muscles = EXCLUDED.supporting_muscles,
    muscle_bias = EXCLUDED.muscle_bias,
    joint_count_level = EXCLUDED.joint_count_level,
    dynamic_isometric = EXCLUDED.dynamic_isometric,
    movement_plane = EXCLUDED.movement_plane,
    primary_joints = EXCLUDED.primary_joints,
    is_active = true,
    updated_at = now();

INSERT INTO exercise_library (name, category, movement_patterns, bilateral_unilateral, posterior_anterior, complexity, equipment, primary_muscle, supporting_muscles, muscle_bias, joint_count_level, dynamic_isometric, movement_plane, primary_joints, is_active)
  VALUES ('DB Suitcase Cyclist Squat', 'strength', '{"squat"}'::text[], 'bilateral', 'anterior', 2, '{"dumbbell"}'::text[], 'Quads', '{"Glutes","Adductors","Erectors","Calves"}'::text[], 'lengthened', 'regional', NULL, NULL, '{"Ankle","Knee","Hip"}'::text[], true)
  ON CONFLICT (name) DO UPDATE SET
    category = EXCLUDED.category,
    movement_patterns = EXCLUDED.movement_patterns,
    bilateral_unilateral = EXCLUDED.bilateral_unilateral,
    posterior_anterior = EXCLUDED.posterior_anterior,
    complexity = EXCLUDED.complexity,
    equipment = EXCLUDED.equipment,
    primary_muscle = EXCLUDED.primary_muscle,
    supporting_muscles = EXCLUDED.supporting_muscles,
    muscle_bias = EXCLUDED.muscle_bias,
    joint_count_level = EXCLUDED.joint_count_level,
    dynamic_isometric = EXCLUDED.dynamic_isometric,
    movement_plane = EXCLUDED.movement_plane,
    primary_joints = EXCLUDED.primary_joints,
    is_active = true,
    updated_at = now();

INSERT INTO exercise_library (name, category, movement_patterns, bilateral_unilateral, posterior_anterior, complexity, equipment, primary_muscle, supporting_muscles, muscle_bias, joint_count_level, dynamic_isometric, movement_plane, primary_joints, is_active)
  VALUES ('Heel Elevated DB Suitcase Cyclist Squat', 'strength', '{"squat"}'::text[], 'bilateral', 'anterior', 2, '{"dumbbell"}'::text[], 'Quads', '{"Glutes","Adductors","Erectors","Calves"}'::text[], 'lengthened', 'regional', NULL, NULL, '{"Ankle","Knee","Hip"}'::text[], true)
  ON CONFLICT (name) DO UPDATE SET
    category = EXCLUDED.category,
    movement_patterns = EXCLUDED.movement_patterns,
    bilateral_unilateral = EXCLUDED.bilateral_unilateral,
    posterior_anterior = EXCLUDED.posterior_anterior,
    complexity = EXCLUDED.complexity,
    equipment = EXCLUDED.equipment,
    primary_muscle = EXCLUDED.primary_muscle,
    supporting_muscles = EXCLUDED.supporting_muscles,
    muscle_bias = EXCLUDED.muscle_bias,
    joint_count_level = EXCLUDED.joint_count_level,
    dynamic_isometric = EXCLUDED.dynamic_isometric,
    movement_plane = EXCLUDED.movement_plane,
    primary_joints = EXCLUDED.primary_joints,
    is_active = true,
    updated_at = now();

INSERT INTO exercise_library (name, category, movement_patterns, bilateral_unilateral, posterior_anterior, complexity, equipment, primary_muscle, supporting_muscles, muscle_bias, joint_count_level, dynamic_isometric, movement_plane, primary_joints, is_active)
  VALUES ('Landmine Goblet Squat', 'strength', '{"squat"}'::text[], 'bilateral', 'anterior', 2, '{"landmine"}'::text[], 'Quads', '{"Glutes","Adductors","Erectors","Calves"}'::text[], 'mid', 'regional', NULL, NULL, '{"Ankle","Knee","Hip"}'::text[], true)
  ON CONFLICT (name) DO UPDATE SET
    category = EXCLUDED.category,
    movement_patterns = EXCLUDED.movement_patterns,
    bilateral_unilateral = EXCLUDED.bilateral_unilateral,
    posterior_anterior = EXCLUDED.posterior_anterior,
    complexity = EXCLUDED.complexity,
    equipment = EXCLUDED.equipment,
    primary_muscle = EXCLUDED.primary_muscle,
    supporting_muscles = EXCLUDED.supporting_muscles,
    muscle_bias = EXCLUDED.muscle_bias,
    joint_count_level = EXCLUDED.joint_count_level,
    dynamic_isometric = EXCLUDED.dynamic_isometric,
    movement_plane = EXCLUDED.movement_plane,
    primary_joints = EXCLUDED.primary_joints,
    is_active = true,
    updated_at = now();

INSERT INTO exercise_library (name, category, movement_patterns, bilateral_unilateral, posterior_anterior, complexity, equipment, primary_muscle, supporting_muscles, muscle_bias, joint_count_level, dynamic_isometric, movement_plane, primary_joints, is_active)
  VALUES ('Heel Elevated Landmine Goblet Squat', 'strength', '{"squat"}'::text[], 'bilateral', 'anterior', 2, '{"landmine"}'::text[], 'Quads', '{"Glutes","Adductors","Erectors","Calves"}'::text[], 'lengthened', 'regional', NULL, NULL, '{"Ankle","Knee","Hip"}'::text[], true)
  ON CONFLICT (name) DO UPDATE SET
    category = EXCLUDED.category,
    movement_patterns = EXCLUDED.movement_patterns,
    bilateral_unilateral = EXCLUDED.bilateral_unilateral,
    posterior_anterior = EXCLUDED.posterior_anterior,
    complexity = EXCLUDED.complexity,
    equipment = EXCLUDED.equipment,
    primary_muscle = EXCLUDED.primary_muscle,
    supporting_muscles = EXCLUDED.supporting_muscles,
    muscle_bias = EXCLUDED.muscle_bias,
    joint_count_level = EXCLUDED.joint_count_level,
    dynamic_isometric = EXCLUDED.dynamic_isometric,
    movement_plane = EXCLUDED.movement_plane,
    primary_joints = EXCLUDED.primary_joints,
    is_active = true,
    updated_at = now();

INSERT INTO exercise_library (name, category, movement_patterns, bilateral_unilateral, posterior_anterior, complexity, equipment, primary_muscle, supporting_muscles, muscle_bias, joint_count_level, dynamic_isometric, movement_plane, primary_joints, is_active)
  VALUES ('Smith Press Back Squat', 'strength', '{"squat"}'::text[], 'bilateral', 'mixed', 2, '{}'::text[], 'Quads', '{"Glutes","Adductors","Calves"}'::text[], 'mid', 'regional', NULL, NULL, '{"Ankle","Knee","Hip"}'::text[], true)
  ON CONFLICT (name) DO UPDATE SET
    category = EXCLUDED.category,
    movement_patterns = EXCLUDED.movement_patterns,
    bilateral_unilateral = EXCLUDED.bilateral_unilateral,
    posterior_anterior = EXCLUDED.posterior_anterior,
    complexity = EXCLUDED.complexity,
    equipment = EXCLUDED.equipment,
    primary_muscle = EXCLUDED.primary_muscle,
    supporting_muscles = EXCLUDED.supporting_muscles,
    muscle_bias = EXCLUDED.muscle_bias,
    joint_count_level = EXCLUDED.joint_count_level,
    dynamic_isometric = EXCLUDED.dynamic_isometric,
    movement_plane = EXCLUDED.movement_plane,
    primary_joints = EXCLUDED.primary_joints,
    is_active = true,
    updated_at = now();

INSERT INTO exercise_library (name, category, movement_patterns, bilateral_unilateral, posterior_anterior, complexity, equipment, primary_muscle, supporting_muscles, muscle_bias, joint_count_level, dynamic_isometric, movement_plane, primary_joints, is_active)
  VALUES ('Heel Elevated Smith Press Back Squat', 'strength', '{"squat"}'::text[], 'bilateral', 'anterior', 2, '{}'::text[], 'Quads', '{"Glutes","Adductors","Calves"}'::text[], 'lengthened', 'regional', NULL, NULL, '{"Ankle","Knee","Hip"}'::text[], true)
  ON CONFLICT (name) DO UPDATE SET
    category = EXCLUDED.category,
    movement_patterns = EXCLUDED.movement_patterns,
    bilateral_unilateral = EXCLUDED.bilateral_unilateral,
    posterior_anterior = EXCLUDED.posterior_anterior,
    complexity = EXCLUDED.complexity,
    equipment = EXCLUDED.equipment,
    primary_muscle = EXCLUDED.primary_muscle,
    supporting_muscles = EXCLUDED.supporting_muscles,
    muscle_bias = EXCLUDED.muscle_bias,
    joint_count_level = EXCLUDED.joint_count_level,
    dynamic_isometric = EXCLUDED.dynamic_isometric,
    movement_plane = EXCLUDED.movement_plane,
    primary_joints = EXCLUDED.primary_joints,
    is_active = true,
    updated_at = now();

INSERT INTO exercise_library (name, category, movement_patterns, bilateral_unilateral, posterior_anterior, complexity, equipment, primary_muscle, supporting_muscles, muscle_bias, joint_count_level, dynamic_isometric, movement_plane, primary_joints, is_active)
  VALUES ('Dual DB Front Squat', 'strength', '{"squat"}'::text[], 'bilateral', 'anterior', 2, '{"dumbbell"}'::text[], 'Quads', '{"Glutes","Upper back","Adductors","Calves"}'::text[], 'mid', 'regional', NULL, NULL, '{"Ankle","Knee","Hip"}'::text[], true)
  ON CONFLICT (name) DO UPDATE SET
    category = EXCLUDED.category,
    movement_patterns = EXCLUDED.movement_patterns,
    bilateral_unilateral = EXCLUDED.bilateral_unilateral,
    posterior_anterior = EXCLUDED.posterior_anterior,
    complexity = EXCLUDED.complexity,
    equipment = EXCLUDED.equipment,
    primary_muscle = EXCLUDED.primary_muscle,
    supporting_muscles = EXCLUDED.supporting_muscles,
    muscle_bias = EXCLUDED.muscle_bias,
    joint_count_level = EXCLUDED.joint_count_level,
    dynamic_isometric = EXCLUDED.dynamic_isometric,
    movement_plane = EXCLUDED.movement_plane,
    primary_joints = EXCLUDED.primary_joints,
    is_active = true,
    updated_at = now();

INSERT INTO exercise_library (name, category, movement_patterns, bilateral_unilateral, posterior_anterior, complexity, equipment, primary_muscle, supporting_muscles, muscle_bias, joint_count_level, dynamic_isometric, movement_plane, primary_joints, is_active)
  VALUES ('Heel Elevated Dual DB Front Squat', 'strength', '{"squat"}'::text[], 'bilateral', 'anterior', 2, '{"dumbbell"}'::text[], 'Quads', '{"Glutes","Upper back","Adductors","Calves"}'::text[], 'lengthened', 'regional', NULL, NULL, '{"Ankle","Knee","Hip"}'::text[], true)
  ON CONFLICT (name) DO UPDATE SET
    category = EXCLUDED.category,
    movement_patterns = EXCLUDED.movement_patterns,
    bilateral_unilateral = EXCLUDED.bilateral_unilateral,
    posterior_anterior = EXCLUDED.posterior_anterior,
    complexity = EXCLUDED.complexity,
    equipment = EXCLUDED.equipment,
    primary_muscle = EXCLUDED.primary_muscle,
    supporting_muscles = EXCLUDED.supporting_muscles,
    muscle_bias = EXCLUDED.muscle_bias,
    joint_count_level = EXCLUDED.joint_count_level,
    dynamic_isometric = EXCLUDED.dynamic_isometric,
    movement_plane = EXCLUDED.movement_plane,
    primary_joints = EXCLUDED.primary_joints,
    is_active = true,
    updated_at = now();

INSERT INTO exercise_library (name, category, movement_patterns, bilateral_unilateral, posterior_anterior, complexity, equipment, primary_muscle, supporting_muscles, muscle_bias, joint_count_level, dynamic_isometric, movement_plane, primary_joints, is_active)
  VALUES ('ATG DB Goblet Squat', 'strength', '{"squat"}'::text[], 'bilateral', 'anterior', 2, '{"dumbbell"}'::text[], 'Quads', '{"Glutes","Adductors","Calves"}'::text[], 'lengthened', 'regional', NULL, NULL, '{"Ankle","Knee","Hip"}'::text[], true)
  ON CONFLICT (name) DO UPDATE SET
    category = EXCLUDED.category,
    movement_patterns = EXCLUDED.movement_patterns,
    bilateral_unilateral = EXCLUDED.bilateral_unilateral,
    posterior_anterior = EXCLUDED.posterior_anterior,
    complexity = EXCLUDED.complexity,
    equipment = EXCLUDED.equipment,
    primary_muscle = EXCLUDED.primary_muscle,
    supporting_muscles = EXCLUDED.supporting_muscles,
    muscle_bias = EXCLUDED.muscle_bias,
    joint_count_level = EXCLUDED.joint_count_level,
    dynamic_isometric = EXCLUDED.dynamic_isometric,
    movement_plane = EXCLUDED.movement_plane,
    primary_joints = EXCLUDED.primary_joints,
    is_active = true,
    updated_at = now();

INSERT INTO exercise_library (name, category, movement_patterns, bilateral_unilateral, posterior_anterior, complexity, equipment, primary_muscle, supporting_muscles, muscle_bias, joint_count_level, dynamic_isometric, movement_plane, primary_joints, is_active)
  VALUES ('Heel Elevated ATG DB Goblet Squat', 'strength', '{"squat"}'::text[], 'bilateral', 'anterior', 2, '{"dumbbell"}'::text[], 'Quads', '{"Glutes","Adductors","Calves"}'::text[], 'lengthened', 'regional', NULL, NULL, '{"Ankle","Knee","Hip"}'::text[], true)
  ON CONFLICT (name) DO UPDATE SET
    category = EXCLUDED.category,
    movement_patterns = EXCLUDED.movement_patterns,
    bilateral_unilateral = EXCLUDED.bilateral_unilateral,
    posterior_anterior = EXCLUDED.posterior_anterior,
    complexity = EXCLUDED.complexity,
    equipment = EXCLUDED.equipment,
    primary_muscle = EXCLUDED.primary_muscle,
    supporting_muscles = EXCLUDED.supporting_muscles,
    muscle_bias = EXCLUDED.muscle_bias,
    joint_count_level = EXCLUDED.joint_count_level,
    dynamic_isometric = EXCLUDED.dynamic_isometric,
    movement_plane = EXCLUDED.movement_plane,
    primary_joints = EXCLUDED.primary_joints,
    is_active = true,
    updated_at = now();

INSERT INTO exercise_library (name, category, movement_patterns, bilateral_unilateral, posterior_anterior, complexity, equipment, primary_muscle, supporting_muscles, muscle_bias, joint_count_level, dynamic_isometric, movement_plane, primary_joints, is_active)
  VALUES ('Weighted Goblet Wall Sit', 'strength', '{"squat"}'::text[], 'bilateral', 'anterior', 1, '{"dumbbell"}'::text[], 'Quads', '{"Glutes","Calves"}'::text[], 'shortened', 'local', NULL, NULL, '{"Knee","Hip"}'::text[], true)
  ON CONFLICT (name) DO UPDATE SET
    category = EXCLUDED.category,
    movement_patterns = EXCLUDED.movement_patterns,
    bilateral_unilateral = EXCLUDED.bilateral_unilateral,
    posterior_anterior = EXCLUDED.posterior_anterior,
    complexity = EXCLUDED.complexity,
    equipment = EXCLUDED.equipment,
    primary_muscle = EXCLUDED.primary_muscle,
    supporting_muscles = EXCLUDED.supporting_muscles,
    muscle_bias = EXCLUDED.muscle_bias,
    joint_count_level = EXCLUDED.joint_count_level,
    dynamic_isometric = EXCLUDED.dynamic_isometric,
    movement_plane = EXCLUDED.movement_plane,
    primary_joints = EXCLUDED.primary_joints,
    is_active = true,
    updated_at = now();

INSERT INTO exercise_library (name, category, movement_patterns, bilateral_unilateral, posterior_anterior, complexity, equipment, primary_muscle, supporting_muscles, muscle_bias, joint_count_level, dynamic_isometric, movement_plane, primary_joints, is_active)
  VALUES ('Weighted Dual DB Wall Sit', 'strength', '{"squat"}'::text[], 'bilateral', 'anterior', 1, '{"dumbbell"}'::text[], 'Quads', '{"Glutes","Calves"}'::text[], 'shortened', 'local', NULL, NULL, '{"Knee","Hip"}'::text[], true)
  ON CONFLICT (name) DO UPDATE SET
    category = EXCLUDED.category,
    movement_patterns = EXCLUDED.movement_patterns,
    bilateral_unilateral = EXCLUDED.bilateral_unilateral,
    posterior_anterior = EXCLUDED.posterior_anterior,
    complexity = EXCLUDED.complexity,
    equipment = EXCLUDED.equipment,
    primary_muscle = EXCLUDED.primary_muscle,
    supporting_muscles = EXCLUDED.supporting_muscles,
    muscle_bias = EXCLUDED.muscle_bias,
    joint_count_level = EXCLUDED.joint_count_level,
    dynamic_isometric = EXCLUDED.dynamic_isometric,
    movement_plane = EXCLUDED.movement_plane,
    primary_joints = EXCLUDED.primary_joints,
    is_active = true,
    updated_at = now();

INSERT INTO exercise_library (name, category, movement_patterns, bilateral_unilateral, posterior_anterior, complexity, equipment, primary_muscle, supporting_muscles, muscle_bias, joint_count_level, dynamic_isometric, movement_plane, primary_joints, is_active)
  VALUES ('Single leg wall sit (isometric)', 'strength', '{"squat"}'::text[], 'unilateral', 'anterior', 2, '{"bodyweight"}'::text[], 'Quadriceps', '{"Glute max"}'::text[], 'mid', 'regional', NULL, NULL, '{"Hip","Knee"}'::text[], true)
  ON CONFLICT (name) DO UPDATE SET
    category = EXCLUDED.category,
    movement_patterns = EXCLUDED.movement_patterns,
    bilateral_unilateral = EXCLUDED.bilateral_unilateral,
    posterior_anterior = EXCLUDED.posterior_anterior,
    complexity = EXCLUDED.complexity,
    equipment = EXCLUDED.equipment,
    primary_muscle = EXCLUDED.primary_muscle,
    supporting_muscles = EXCLUDED.supporting_muscles,
    muscle_bias = EXCLUDED.muscle_bias,
    joint_count_level = EXCLUDED.joint_count_level,
    dynamic_isometric = EXCLUDED.dynamic_isometric,
    movement_plane = EXCLUDED.movement_plane,
    primary_joints = EXCLUDED.primary_joints,
    is_active = true,
    updated_at = now();

INSERT INTO exercise_library (name, category, movement_patterns, bilateral_unilateral, posterior_anterior, complexity, equipment, primary_muscle, supporting_muscles, muscle_bias, joint_count_level, dynamic_isometric, movement_plane, primary_joints, is_active)
  VALUES ('Single leg Wall Sit (weighted)', 'strength', '{"squat"}'::text[], 'unilateral', 'anterior', 2, '{"dumbbell"}'::text[], 'Quadriceps', '{"Glute max"}'::text[], 'mid', 'regional', NULL, NULL, '{"Hip","Knee"}'::text[], true)
  ON CONFLICT (name) DO UPDATE SET
    category = EXCLUDED.category,
    movement_patterns = EXCLUDED.movement_patterns,
    bilateral_unilateral = EXCLUDED.bilateral_unilateral,
    posterior_anterior = EXCLUDED.posterior_anterior,
    complexity = EXCLUDED.complexity,
    equipment = EXCLUDED.equipment,
    primary_muscle = EXCLUDED.primary_muscle,
    supporting_muscles = EXCLUDED.supporting_muscles,
    muscle_bias = EXCLUDED.muscle_bias,
    joint_count_level = EXCLUDED.joint_count_level,
    dynamic_isometric = EXCLUDED.dynamic_isometric,
    movement_plane = EXCLUDED.movement_plane,
    primary_joints = EXCLUDED.primary_joints,
    is_active = true,
    updated_at = now();

INSERT INTO exercise_library (name, category, movement_patterns, bilateral_unilateral, posterior_anterior, complexity, equipment, primary_muscle, supporting_muscles, muscle_bias, joint_count_level, dynamic_isometric, movement_plane, primary_joints, is_active)
  VALUES ('Leg Press Narrow Stance', 'strength', '{"squat"}'::text[], 'bilateral', 'anterior', 1, '{"fixed_machine"}'::text[], 'Quads', '{"Glutes","Adductors"}'::text[], 'lengthened', 'regional', NULL, NULL, '{"Ankle","Knee","Hip"}'::text[], true)
  ON CONFLICT (name) DO UPDATE SET
    category = EXCLUDED.category,
    movement_patterns = EXCLUDED.movement_patterns,
    bilateral_unilateral = EXCLUDED.bilateral_unilateral,
    posterior_anterior = EXCLUDED.posterior_anterior,
    complexity = EXCLUDED.complexity,
    equipment = EXCLUDED.equipment,
    primary_muscle = EXCLUDED.primary_muscle,
    supporting_muscles = EXCLUDED.supporting_muscles,
    muscle_bias = EXCLUDED.muscle_bias,
    joint_count_level = EXCLUDED.joint_count_level,
    dynamic_isometric = EXCLUDED.dynamic_isometric,
    movement_plane = EXCLUDED.movement_plane,
    primary_joints = EXCLUDED.primary_joints,
    is_active = true,
    updated_at = now();

INSERT INTO exercise_library (name, category, movement_patterns, bilateral_unilateral, posterior_anterior, complexity, equipment, primary_muscle, supporting_muscles, muscle_bias, joint_count_level, dynamic_isometric, movement_plane, primary_joints, is_active)
  VALUES ('Leg Press Wide Stance', 'strength', '{"squat"}'::text[], 'bilateral', 'mixed', 1, '{"fixed_machine"}'::text[], 'Glutes', '{"Quads","Adductors"}'::text[], 'lengthened', 'regional', NULL, NULL, '{"Ankle","Knee","Hip"}'::text[], true)
  ON CONFLICT (name) DO UPDATE SET
    category = EXCLUDED.category,
    movement_patterns = EXCLUDED.movement_patterns,
    bilateral_unilateral = EXCLUDED.bilateral_unilateral,
    posterior_anterior = EXCLUDED.posterior_anterior,
    complexity = EXCLUDED.complexity,
    equipment = EXCLUDED.equipment,
    primary_muscle = EXCLUDED.primary_muscle,
    supporting_muscles = EXCLUDED.supporting_muscles,
    muscle_bias = EXCLUDED.muscle_bias,
    joint_count_level = EXCLUDED.joint_count_level,
    dynamic_isometric = EXCLUDED.dynamic_isometric,
    movement_plane = EXCLUDED.movement_plane,
    primary_joints = EXCLUDED.primary_joints,
    is_active = true,
    updated_at = now();

INSERT INTO exercise_library (name, category, movement_patterns, bilateral_unilateral, posterior_anterior, complexity, equipment, primary_muscle, supporting_muscles, muscle_bias, joint_count_level, dynamic_isometric, movement_plane, primary_joints, is_active)
  VALUES ('Leg Press High Stance', 'strength', '{"squat"}'::text[], 'bilateral', 'posterior', 1, '{"fixed_machine"}'::text[], 'Glutes', '{"Adductors","Hamstrings","Quads"}'::text[], 'lengthened', 'regional', NULL, NULL, '{"Ankle","Knee","Hip"}'::text[], true)
  ON CONFLICT (name) DO UPDATE SET
    category = EXCLUDED.category,
    movement_patterns = EXCLUDED.movement_patterns,
    bilateral_unilateral = EXCLUDED.bilateral_unilateral,
    posterior_anterior = EXCLUDED.posterior_anterior,
    complexity = EXCLUDED.complexity,
    equipment = EXCLUDED.equipment,
    primary_muscle = EXCLUDED.primary_muscle,
    supporting_muscles = EXCLUDED.supporting_muscles,
    muscle_bias = EXCLUDED.muscle_bias,
    joint_count_level = EXCLUDED.joint_count_level,
    dynamic_isometric = EXCLUDED.dynamic_isometric,
    movement_plane = EXCLUDED.movement_plane,
    primary_joints = EXCLUDED.primary_joints,
    is_active = true,
    updated_at = now();

INSERT INTO exercise_library (name, category, movement_patterns, bilateral_unilateral, posterior_anterior, complexity, equipment, primary_muscle, supporting_muscles, muscle_bias, joint_count_level, dynamic_isometric, movement_plane, primary_joints, is_active)
  VALUES ('Hack Squat Narrow Stance', 'strength', '{"squat"}'::text[], 'bilateral', 'anterior', 1, '{"fixed_machine"}'::text[], 'Quads', '{"Glutes","Adductors"}'::text[], 'lengthened', 'regional', NULL, NULL, '{"Ankle","Knee","Hip"}'::text[], true)
  ON CONFLICT (name) DO UPDATE SET
    category = EXCLUDED.category,
    movement_patterns = EXCLUDED.movement_patterns,
    bilateral_unilateral = EXCLUDED.bilateral_unilateral,
    posterior_anterior = EXCLUDED.posterior_anterior,
    complexity = EXCLUDED.complexity,
    equipment = EXCLUDED.equipment,
    primary_muscle = EXCLUDED.primary_muscle,
    supporting_muscles = EXCLUDED.supporting_muscles,
    muscle_bias = EXCLUDED.muscle_bias,
    joint_count_level = EXCLUDED.joint_count_level,
    dynamic_isometric = EXCLUDED.dynamic_isometric,
    movement_plane = EXCLUDED.movement_plane,
    primary_joints = EXCLUDED.primary_joints,
    is_active = true,
    updated_at = now();

INSERT INTO exercise_library (name, category, movement_patterns, bilateral_unilateral, posterior_anterior, complexity, equipment, primary_muscle, supporting_muscles, muscle_bias, joint_count_level, dynamic_isometric, movement_plane, primary_joints, is_active)
  VALUES ('Hack Squat Wide Stance', 'strength', '{"squat"}'::text[], 'bilateral', 'mixed', 1, '{"fixed_machine"}'::text[], 'Glutes', '{"Quads","Adductors"}'::text[], 'lengthened', 'regional', NULL, NULL, '{"Ankle","Knee","Hip"}'::text[], true)
  ON CONFLICT (name) DO UPDATE SET
    category = EXCLUDED.category,
    movement_patterns = EXCLUDED.movement_patterns,
    bilateral_unilateral = EXCLUDED.bilateral_unilateral,
    posterior_anterior = EXCLUDED.posterior_anterior,
    complexity = EXCLUDED.complexity,
    equipment = EXCLUDED.equipment,
    primary_muscle = EXCLUDED.primary_muscle,
    supporting_muscles = EXCLUDED.supporting_muscles,
    muscle_bias = EXCLUDED.muscle_bias,
    joint_count_level = EXCLUDED.joint_count_level,
    dynamic_isometric = EXCLUDED.dynamic_isometric,
    movement_plane = EXCLUDED.movement_plane,
    primary_joints = EXCLUDED.primary_joints,
    is_active = true,
    updated_at = now();

INSERT INTO exercise_library (name, category, movement_patterns, bilateral_unilateral, posterior_anterior, complexity, equipment, primary_muscle, supporting_muscles, muscle_bias, joint_count_level, dynamic_isometric, movement_plane, primary_joints, is_active)
  VALUES ('Hack Squat High Stance', 'strength', '{"squat"}'::text[], 'bilateral', 'posterior', 1, '{"fixed_machine"}'::text[], 'Glutes', '{"Hamstrings","Adductors","Quads"}'::text[], 'lengthened', 'regional', NULL, NULL, '{"Ankle","Knee","Hip"}'::text[], true)
  ON CONFLICT (name) DO UPDATE SET
    category = EXCLUDED.category,
    movement_patterns = EXCLUDED.movement_patterns,
    bilateral_unilateral = EXCLUDED.bilateral_unilateral,
    posterior_anterior = EXCLUDED.posterior_anterior,
    complexity = EXCLUDED.complexity,
    equipment = EXCLUDED.equipment,
    primary_muscle = EXCLUDED.primary_muscle,
    supporting_muscles = EXCLUDED.supporting_muscles,
    muscle_bias = EXCLUDED.muscle_bias,
    joint_count_level = EXCLUDED.joint_count_level,
    dynamic_isometric = EXCLUDED.dynamic_isometric,
    movement_plane = EXCLUDED.movement_plane,
    primary_joints = EXCLUDED.primary_joints,
    is_active = true,
    updated_at = now();

INSERT INTO exercise_library (name, category, movement_patterns, bilateral_unilateral, posterior_anterior, complexity, equipment, primary_muscle, supporting_muscles, muscle_bias, joint_count_level, dynamic_isometric, movement_plane, primary_joints, is_active)
  VALUES ('Heel Elevated Trap Bar Deadlift', 'strength', '{"hinge"}'::text[], 'bilateral', 'mixed', 2, '{"trap_bar"}'::text[], 'Glutes', '{"Hamstrings","Quads","Lats","Traps"}'::text[], 'mid', 'regional', NULL, NULL, '{"Hip","Knee"}'::text[], true)
  ON CONFLICT (name) DO UPDATE SET
    category = EXCLUDED.category,
    movement_patterns = EXCLUDED.movement_patterns,
    bilateral_unilateral = EXCLUDED.bilateral_unilateral,
    posterior_anterior = EXCLUDED.posterior_anterior,
    complexity = EXCLUDED.complexity,
    equipment = EXCLUDED.equipment,
    primary_muscle = EXCLUDED.primary_muscle,
    supporting_muscles = EXCLUDED.supporting_muscles,
    muscle_bias = EXCLUDED.muscle_bias,
    joint_count_level = EXCLUDED.joint_count_level,
    dynamic_isometric = EXCLUDED.dynamic_isometric,
    movement_plane = EXCLUDED.movement_plane,
    primary_joints = EXCLUDED.primary_joints,
    is_active = true,
    updated_at = now();

INSERT INTO exercise_library (name, category, movement_patterns, bilateral_unilateral, posterior_anterior, complexity, equipment, primary_muscle, supporting_muscles, muscle_bias, joint_count_level, dynamic_isometric, movement_plane, primary_joints, is_active)
  VALUES ('DB Suitcase Bulgarian Split Squat', 'strength', '{"lunge"}'::text[], 'unilateral', 'anterior', 2, '{"dumbbell"}'::text[], 'Quads', '{"Glutes","Adductors","Calves"}'::text[], 'mid', 'regional', NULL, NULL, '{"Ankle","Knee","Hip"}'::text[], true)
  ON CONFLICT (name) DO UPDATE SET
    category = EXCLUDED.category,
    movement_patterns = EXCLUDED.movement_patterns,
    bilateral_unilateral = EXCLUDED.bilateral_unilateral,
    posterior_anterior = EXCLUDED.posterior_anterior,
    complexity = EXCLUDED.complexity,
    equipment = EXCLUDED.equipment,
    primary_muscle = EXCLUDED.primary_muscle,
    supporting_muscles = EXCLUDED.supporting_muscles,
    muscle_bias = EXCLUDED.muscle_bias,
    joint_count_level = EXCLUDED.joint_count_level,
    dynamic_isometric = EXCLUDED.dynamic_isometric,
    movement_plane = EXCLUDED.movement_plane,
    primary_joints = EXCLUDED.primary_joints,
    is_active = true,
    updated_at = now();

INSERT INTO exercise_library (name, category, movement_patterns, bilateral_unilateral, posterior_anterior, complexity, equipment, primary_muscle, supporting_muscles, muscle_bias, joint_count_level, dynamic_isometric, movement_plane, primary_joints, is_active)
  VALUES ('DB Goblet Bulgarian Split Squat', 'strength', '{"lunge"}'::text[], 'unilateral', 'anterior', 2, '{"dumbbell"}'::text[], 'Quads', '{"Glutes","Adductors","Calves"}'::text[], 'mid', 'regional', NULL, NULL, '{"Ankle","Knee","Hip"}'::text[], true)
  ON CONFLICT (name) DO UPDATE SET
    category = EXCLUDED.category,
    movement_patterns = EXCLUDED.movement_patterns,
    bilateral_unilateral = EXCLUDED.bilateral_unilateral,
    posterior_anterior = EXCLUDED.posterior_anterior,
    complexity = EXCLUDED.complexity,
    equipment = EXCLUDED.equipment,
    primary_muscle = EXCLUDED.primary_muscle,
    supporting_muscles = EXCLUDED.supporting_muscles,
    muscle_bias = EXCLUDED.muscle_bias,
    joint_count_level = EXCLUDED.joint_count_level,
    dynamic_isometric = EXCLUDED.dynamic_isometric,
    movement_plane = EXCLUDED.movement_plane,
    primary_joints = EXCLUDED.primary_joints,
    is_active = true,
    updated_at = now();

INSERT INTO exercise_library (name, category, movement_patterns, bilateral_unilateral, posterior_anterior, complexity, equipment, primary_muscle, supporting_muscles, muscle_bias, joint_count_level, dynamic_isometric, movement_plane, primary_joints, is_active)
  VALUES ('DB Suitcase Split Squat', 'strength', '{"lunge"}'::text[], 'unilateral', 'anterior', 2, '{"dumbbell"}'::text[], 'Quads', '{"Glutes","Adductors","Calves"}'::text[], 'mid', 'regional', NULL, NULL, '{"Ankle","Knee","Hip"}'::text[], true)
  ON CONFLICT (name) DO UPDATE SET
    category = EXCLUDED.category,
    movement_patterns = EXCLUDED.movement_patterns,
    bilateral_unilateral = EXCLUDED.bilateral_unilateral,
    posterior_anterior = EXCLUDED.posterior_anterior,
    complexity = EXCLUDED.complexity,
    equipment = EXCLUDED.equipment,
    primary_muscle = EXCLUDED.primary_muscle,
    supporting_muscles = EXCLUDED.supporting_muscles,
    muscle_bias = EXCLUDED.muscle_bias,
    joint_count_level = EXCLUDED.joint_count_level,
    dynamic_isometric = EXCLUDED.dynamic_isometric,
    movement_plane = EXCLUDED.movement_plane,
    primary_joints = EXCLUDED.primary_joints,
    is_active = true,
    updated_at = now();

INSERT INTO exercise_library (name, category, movement_patterns, bilateral_unilateral, posterior_anterior, complexity, equipment, primary_muscle, supporting_muscles, muscle_bias, joint_count_level, dynamic_isometric, movement_plane, primary_joints, is_active)
  VALUES ('DB Goblet Split Squat', 'strength', '{"lunge"}'::text[], 'unilateral', 'anterior', 2, '{"dumbbell"}'::text[], 'Quads', '{"Glutes","Adductors","Calves"}'::text[], 'mid', 'regional', NULL, NULL, '{"Ankle","Knee","Hip"}'::text[], true)
  ON CONFLICT (name) DO UPDATE SET
    category = EXCLUDED.category,
    movement_patterns = EXCLUDED.movement_patterns,
    bilateral_unilateral = EXCLUDED.bilateral_unilateral,
    posterior_anterior = EXCLUDED.posterior_anterior,
    complexity = EXCLUDED.complexity,
    equipment = EXCLUDED.equipment,
    primary_muscle = EXCLUDED.primary_muscle,
    supporting_muscles = EXCLUDED.supporting_muscles,
    muscle_bias = EXCLUDED.muscle_bias,
    joint_count_level = EXCLUDED.joint_count_level,
    dynamic_isometric = EXCLUDED.dynamic_isometric,
    movement_plane = EXCLUDED.movement_plane,
    primary_joints = EXCLUDED.primary_joints,
    is_active = true,
    updated_at = now();

INSERT INTO exercise_library (name, category, movement_patterns, bilateral_unilateral, posterior_anterior, complexity, equipment, primary_muscle, supporting_muscles, muscle_bias, joint_count_level, dynamic_isometric, movement_plane, primary_joints, is_active)
  VALUES ('Dual DB Front Rack Split Squat', 'strength', '{"lunge"}'::text[], 'unilateral', 'anterior', 3, '{"dumbbell"}'::text[], 'Quads', '{"Glutes","Adductors","Calves"}'::text[], 'mid', 'regional', NULL, NULL, '{"Ankle","Knee","Hip"}'::text[], true)
  ON CONFLICT (name) DO UPDATE SET
    category = EXCLUDED.category,
    movement_patterns = EXCLUDED.movement_patterns,
    bilateral_unilateral = EXCLUDED.bilateral_unilateral,
    posterior_anterior = EXCLUDED.posterior_anterior,
    complexity = EXCLUDED.complexity,
    equipment = EXCLUDED.equipment,
    primary_muscle = EXCLUDED.primary_muscle,
    supporting_muscles = EXCLUDED.supporting_muscles,
    muscle_bias = EXCLUDED.muscle_bias,
    joint_count_level = EXCLUDED.joint_count_level,
    dynamic_isometric = EXCLUDED.dynamic_isometric,
    movement_plane = EXCLUDED.movement_plane,
    primary_joints = EXCLUDED.primary_joints,
    is_active = true,
    updated_at = now();

INSERT INTO exercise_library (name, category, movement_patterns, bilateral_unilateral, posterior_anterior, complexity, equipment, primary_muscle, supporting_muscles, muscle_bias, joint_count_level, dynamic_isometric, movement_plane, primary_joints, is_active)
  VALUES ('Cable Split Squat (low anchor)', 'strength', '{"lunge"}'::text[], 'unilateral', 'anterior', 2, '{"cable"}'::text[], 'Quads', '{"Glutes","Adductors","Calves"}'::text[], 'mid', 'regional', NULL, NULL, '{"Ankle","Knee","Hip"}'::text[], true)
  ON CONFLICT (name) DO UPDATE SET
    category = EXCLUDED.category,
    movement_patterns = EXCLUDED.movement_patterns,
    bilateral_unilateral = EXCLUDED.bilateral_unilateral,
    posterior_anterior = EXCLUDED.posterior_anterior,
    complexity = EXCLUDED.complexity,
    equipment = EXCLUDED.equipment,
    primary_muscle = EXCLUDED.primary_muscle,
    supporting_muscles = EXCLUDED.supporting_muscles,
    muscle_bias = EXCLUDED.muscle_bias,
    joint_count_level = EXCLUDED.joint_count_level,
    dynamic_isometric = EXCLUDED.dynamic_isometric,
    movement_plane = EXCLUDED.movement_plane,
    primary_joints = EXCLUDED.primary_joints,
    is_active = true,
    updated_at = now();

INSERT INTO exercise_library (name, category, movement_patterns, bilateral_unilateral, posterior_anterior, complexity, equipment, primary_muscle, supporting_muscles, muscle_bias, joint_count_level, dynamic_isometric, movement_plane, primary_joints, is_active)
  VALUES ('ATG Dual DB Suitcase Split Squat', 'strength', '{"lunge"}'::text[], 'unilateral', 'anterior', 2, '{"dumbbell"}'::text[], 'Quads', '{"Glutes","Adductors","Calves"}'::text[], 'lengthened', 'regional', NULL, NULL, '{"Ankle","Knee","Hip"}'::text[], true)
  ON CONFLICT (name) DO UPDATE SET
    category = EXCLUDED.category,
    movement_patterns = EXCLUDED.movement_patterns,
    bilateral_unilateral = EXCLUDED.bilateral_unilateral,
    posterior_anterior = EXCLUDED.posterior_anterior,
    complexity = EXCLUDED.complexity,
    equipment = EXCLUDED.equipment,
    primary_muscle = EXCLUDED.primary_muscle,
    supporting_muscles = EXCLUDED.supporting_muscles,
    muscle_bias = EXCLUDED.muscle_bias,
    joint_count_level = EXCLUDED.joint_count_level,
    dynamic_isometric = EXCLUDED.dynamic_isometric,
    movement_plane = EXCLUDED.movement_plane,
    primary_joints = EXCLUDED.primary_joints,
    is_active = true,
    updated_at = now();

INSERT INTO exercise_library (name, category, movement_patterns, bilateral_unilateral, posterior_anterior, complexity, equipment, primary_muscle, supporting_muscles, muscle_bias, joint_count_level, dynamic_isometric, movement_plane, primary_joints, is_active)
  VALUES ('ATG Front Rack Split Squat', 'strength', '{"lunge"}'::text[], 'unilateral', 'anterior', 3, '{"barbell"}'::text[], 'Quads', '{"Glutes","Adductors","Calves"}'::text[], 'lengthened', 'regional', NULL, NULL, '{"Ankle","Knee","Hip"}'::text[], true)
  ON CONFLICT (name) DO UPDATE SET
    category = EXCLUDED.category,
    movement_patterns = EXCLUDED.movement_patterns,
    bilateral_unilateral = EXCLUDED.bilateral_unilateral,
    posterior_anterior = EXCLUDED.posterior_anterior,
    complexity = EXCLUDED.complexity,
    equipment = EXCLUDED.equipment,
    primary_muscle = EXCLUDED.primary_muscle,
    supporting_muscles = EXCLUDED.supporting_muscles,
    muscle_bias = EXCLUDED.muscle_bias,
    joint_count_level = EXCLUDED.joint_count_level,
    dynamic_isometric = EXCLUDED.dynamic_isometric,
    movement_plane = EXCLUDED.movement_plane,
    primary_joints = EXCLUDED.primary_joints,
    is_active = true,
    updated_at = now();

INSERT INTO exercise_library (name, category, movement_patterns, bilateral_unilateral, posterior_anterior, complexity, equipment, primary_muscle, supporting_muscles, muscle_bias, joint_count_level, dynamic_isometric, movement_plane, primary_joints, is_active)
  VALUES ('ATG Back Rack Split Squat', 'strength', '{"lunge"}'::text[], 'unilateral', 'mixed', 3, '{"barbell"}'::text[], 'Quads', '{"Glutes","Adductors","Calves"}'::text[], 'lengthened', 'regional', NULL, NULL, '{"Ankle","Knee","Hip"}'::text[], true)
  ON CONFLICT (name) DO UPDATE SET
    category = EXCLUDED.category,
    movement_patterns = EXCLUDED.movement_patterns,
    bilateral_unilateral = EXCLUDED.bilateral_unilateral,
    posterior_anterior = EXCLUDED.posterior_anterior,
    complexity = EXCLUDED.complexity,
    equipment = EXCLUDED.equipment,
    primary_muscle = EXCLUDED.primary_muscle,
    supporting_muscles = EXCLUDED.supporting_muscles,
    muscle_bias = EXCLUDED.muscle_bias,
    joint_count_level = EXCLUDED.joint_count_level,
    dynamic_isometric = EXCLUDED.dynamic_isometric,
    movement_plane = EXCLUDED.movement_plane,
    primary_joints = EXCLUDED.primary_joints,
    is_active = true,
    updated_at = now();

INSERT INTO exercise_library (name, category, movement_patterns, bilateral_unilateral, posterior_anterior, complexity, equipment, primary_muscle, supporting_muscles, muscle_bias, joint_count_level, dynamic_isometric, movement_plane, primary_joints, is_active)
  VALUES ('Barbell Front Rack Deficit Split Squat', 'strength', '{"lunge"}'::text[], 'unilateral', 'anterior', 3, '{"barbell"}'::text[], 'Quads', '{"Glutes","Adductors","Calves"}'::text[], 'lengthened', 'regional', NULL, NULL, '{"Ankle","Knee","Hip"}'::text[], true)
  ON CONFLICT (name) DO UPDATE SET
    category = EXCLUDED.category,
    movement_patterns = EXCLUDED.movement_patterns,
    bilateral_unilateral = EXCLUDED.bilateral_unilateral,
    posterior_anterior = EXCLUDED.posterior_anterior,
    complexity = EXCLUDED.complexity,
    equipment = EXCLUDED.equipment,
    primary_muscle = EXCLUDED.primary_muscle,
    supporting_muscles = EXCLUDED.supporting_muscles,
    muscle_bias = EXCLUDED.muscle_bias,
    joint_count_level = EXCLUDED.joint_count_level,
    dynamic_isometric = EXCLUDED.dynamic_isometric,
    movement_plane = EXCLUDED.movement_plane,
    primary_joints = EXCLUDED.primary_joints,
    is_active = true,
    updated_at = now();

INSERT INTO exercise_library (name, category, movement_patterns, bilateral_unilateral, posterior_anterior, complexity, equipment, primary_muscle, supporting_muscles, muscle_bias, joint_count_level, dynamic_isometric, movement_plane, primary_joints, is_active)
  VALUES ('Barbell Front Rack Forward Lunge', 'strength', '{"lunge"}'::text[], 'unilateral', 'anterior', 3, '{"barbell"}'::text[], 'Quads', '{"Glutes","Adductors","Calves"}'::text[], 'lengthened', 'regional', NULL, NULL, '{"Ankle","Knee","Hip"}'::text[], true)
  ON CONFLICT (name) DO UPDATE SET
    category = EXCLUDED.category,
    movement_patterns = EXCLUDED.movement_patterns,
    bilateral_unilateral = EXCLUDED.bilateral_unilateral,
    posterior_anterior = EXCLUDED.posterior_anterior,
    complexity = EXCLUDED.complexity,
    equipment = EXCLUDED.equipment,
    primary_muscle = EXCLUDED.primary_muscle,
    supporting_muscles = EXCLUDED.supporting_muscles,
    muscle_bias = EXCLUDED.muscle_bias,
    joint_count_level = EXCLUDED.joint_count_level,
    dynamic_isometric = EXCLUDED.dynamic_isometric,
    movement_plane = EXCLUDED.movement_plane,
    primary_joints = EXCLUDED.primary_joints,
    is_active = true,
    updated_at = now();

INSERT INTO exercise_library (name, category, movement_patterns, bilateral_unilateral, posterior_anterior, complexity, equipment, primary_muscle, supporting_muscles, muscle_bias, joint_count_level, dynamic_isometric, movement_plane, primary_joints, is_active)
  VALUES ('Barbell Front Rack Alternating Forward Lunge', 'strength', '{"lunge"}'::text[], 'unilateral', 'anterior', 3, '{"barbell"}'::text[], 'Quads', '{"Glutes","Adductors","Calves"}'::text[], 'lengthened', 'global', NULL, NULL, '{"Ankle","Knee","Hip"}'::text[], true)
  ON CONFLICT (name) DO UPDATE SET
    category = EXCLUDED.category,
    movement_patterns = EXCLUDED.movement_patterns,
    bilateral_unilateral = EXCLUDED.bilateral_unilateral,
    posterior_anterior = EXCLUDED.posterior_anterior,
    complexity = EXCLUDED.complexity,
    equipment = EXCLUDED.equipment,
    primary_muscle = EXCLUDED.primary_muscle,
    supporting_muscles = EXCLUDED.supporting_muscles,
    muscle_bias = EXCLUDED.muscle_bias,
    joint_count_level = EXCLUDED.joint_count_level,
    dynamic_isometric = EXCLUDED.dynamic_isometric,
    movement_plane = EXCLUDED.movement_plane,
    primary_joints = EXCLUDED.primary_joints,
    is_active = true,
    updated_at = now();

INSERT INTO exercise_library (name, category, movement_patterns, bilateral_unilateral, posterior_anterior, complexity, equipment, primary_muscle, supporting_muscles, muscle_bias, joint_count_level, dynamic_isometric, movement_plane, primary_joints, is_active)
  VALUES ('Barbell Front Rack Reverse Lunge', 'strength', '{"lunge"}'::text[], 'unilateral', 'mixed', 3, '{"barbell"}'::text[], 'Glutes', '{"Quads","Adductors","Calves"}'::text[], 'lengthened', 'regional', NULL, NULL, '{"Ankle","Knee","Hip"}'::text[], true)
  ON CONFLICT (name) DO UPDATE SET
    category = EXCLUDED.category,
    movement_patterns = EXCLUDED.movement_patterns,
    bilateral_unilateral = EXCLUDED.bilateral_unilateral,
    posterior_anterior = EXCLUDED.posterior_anterior,
    complexity = EXCLUDED.complexity,
    equipment = EXCLUDED.equipment,
    primary_muscle = EXCLUDED.primary_muscle,
    supporting_muscles = EXCLUDED.supporting_muscles,
    muscle_bias = EXCLUDED.muscle_bias,
    joint_count_level = EXCLUDED.joint_count_level,
    dynamic_isometric = EXCLUDED.dynamic_isometric,
    movement_plane = EXCLUDED.movement_plane,
    primary_joints = EXCLUDED.primary_joints,
    is_active = true,
    updated_at = now();

INSERT INTO exercise_library (name, category, movement_patterns, bilateral_unilateral, posterior_anterior, complexity, equipment, primary_muscle, supporting_muscles, muscle_bias, joint_count_level, dynamic_isometric, movement_plane, primary_joints, is_active)
  VALUES ('Barbell Front Rack Alternating Reverse Lunge', 'strength', '{"lunge"}'::text[], 'unilateral', 'mixed', 3, '{"barbell"}'::text[], 'Glutes', '{"Quads","Adductors","Calves"}'::text[], 'lengthened', 'global', NULL, NULL, '{"Ankle","Knee","Hip"}'::text[], true)
  ON CONFLICT (name) DO UPDATE SET
    category = EXCLUDED.category,
    movement_patterns = EXCLUDED.movement_patterns,
    bilateral_unilateral = EXCLUDED.bilateral_unilateral,
    posterior_anterior = EXCLUDED.posterior_anterior,
    complexity = EXCLUDED.complexity,
    equipment = EXCLUDED.equipment,
    primary_muscle = EXCLUDED.primary_muscle,
    supporting_muscles = EXCLUDED.supporting_muscles,
    muscle_bias = EXCLUDED.muscle_bias,
    joint_count_level = EXCLUDED.joint_count_level,
    dynamic_isometric = EXCLUDED.dynamic_isometric,
    movement_plane = EXCLUDED.movement_plane,
    primary_joints = EXCLUDED.primary_joints,
    is_active = true,
    updated_at = now();

INSERT INTO exercise_library (name, category, movement_patterns, bilateral_unilateral, posterior_anterior, complexity, equipment, primary_muscle, supporting_muscles, muscle_bias, joint_count_level, dynamic_isometric, movement_plane, primary_joints, is_active)
  VALUES ('Barbell Front Rack Forward Drop Lunge', 'strength', '{"lunge"}'::text[], 'unilateral', 'anterior', 3, '{"barbell"}'::text[], 'Quads', '{"Glutes","Adductors","Calves"}'::text[], 'lengthened', 'global', NULL, NULL, '{"Ankle","Knee","Hip"}'::text[], true)
  ON CONFLICT (name) DO UPDATE SET
    category = EXCLUDED.category,
    movement_patterns = EXCLUDED.movement_patterns,
    bilateral_unilateral = EXCLUDED.bilateral_unilateral,
    posterior_anterior = EXCLUDED.posterior_anterior,
    complexity = EXCLUDED.complexity,
    equipment = EXCLUDED.equipment,
    primary_muscle = EXCLUDED.primary_muscle,
    supporting_muscles = EXCLUDED.supporting_muscles,
    muscle_bias = EXCLUDED.muscle_bias,
    joint_count_level = EXCLUDED.joint_count_level,
    dynamic_isometric = EXCLUDED.dynamic_isometric,
    movement_plane = EXCLUDED.movement_plane,
    primary_joints = EXCLUDED.primary_joints,
    is_active = true,
    updated_at = now();

INSERT INTO exercise_library (name, category, movement_patterns, bilateral_unilateral, posterior_anterior, complexity, equipment, primary_muscle, supporting_muscles, muscle_bias, joint_count_level, dynamic_isometric, movement_plane, primary_joints, is_active)
  VALUES ('Barbell Front Rack Forward Alternating Drop Lunge', 'strength', '{"lunge"}'::text[], 'unilateral', 'anterior', 3, '{"barbell"}'::text[], 'Quads', '{"Glutes","Adductors","Calves"}'::text[], 'lengthened', 'global', NULL, NULL, '{"Ankle","Knee","Hip"}'::text[], true)
  ON CONFLICT (name) DO UPDATE SET
    category = EXCLUDED.category,
    movement_patterns = EXCLUDED.movement_patterns,
    bilateral_unilateral = EXCLUDED.bilateral_unilateral,
    posterior_anterior = EXCLUDED.posterior_anterior,
    complexity = EXCLUDED.complexity,
    equipment = EXCLUDED.equipment,
    primary_muscle = EXCLUDED.primary_muscle,
    supporting_muscles = EXCLUDED.supporting_muscles,
    muscle_bias = EXCLUDED.muscle_bias,
    joint_count_level = EXCLUDED.joint_count_level,
    dynamic_isometric = EXCLUDED.dynamic_isometric,
    movement_plane = EXCLUDED.movement_plane,
    primary_joints = EXCLUDED.primary_joints,
    is_active = true,
    updated_at = now();

INSERT INTO exercise_library (name, category, movement_patterns, bilateral_unilateral, posterior_anterior, complexity, equipment, primary_muscle, supporting_muscles, muscle_bias, joint_count_level, dynamic_isometric, movement_plane, primary_joints, is_active)
  VALUES ('Barbell Front Rack Reverse Drop Lunge', 'strength', '{"lunge"}'::text[], 'unilateral', 'mixed', 3, '{"barbell"}'::text[], 'Glutes', '{"Quads","Adductors","Calves"}'::text[], 'lengthened', 'global', NULL, NULL, '{"Ankle","Knee","Hip"}'::text[], true)
  ON CONFLICT (name) DO UPDATE SET
    category = EXCLUDED.category,
    movement_patterns = EXCLUDED.movement_patterns,
    bilateral_unilateral = EXCLUDED.bilateral_unilateral,
    posterior_anterior = EXCLUDED.posterior_anterior,
    complexity = EXCLUDED.complexity,
    equipment = EXCLUDED.equipment,
    primary_muscle = EXCLUDED.primary_muscle,
    supporting_muscles = EXCLUDED.supporting_muscles,
    muscle_bias = EXCLUDED.muscle_bias,
    joint_count_level = EXCLUDED.joint_count_level,
    dynamic_isometric = EXCLUDED.dynamic_isometric,
    movement_plane = EXCLUDED.movement_plane,
    primary_joints = EXCLUDED.primary_joints,
    is_active = true,
    updated_at = now();

INSERT INTO exercise_library (name, category, movement_patterns, bilateral_unilateral, posterior_anterior, complexity, equipment, primary_muscle, supporting_muscles, muscle_bias, joint_count_level, dynamic_isometric, movement_plane, primary_joints, is_active)
  VALUES ('Barbell Front Rack Alternating Reverse Drop Lunge', 'strength', '{"lunge"}'::text[], 'unilateral', 'mixed', 3, '{"barbell"}'::text[], 'Glutes', '{"Quads","Adductors","Calves"}'::text[], 'lengthened', 'global', NULL, NULL, '{"Ankle","Knee","Hip"}'::text[], true)
  ON CONFLICT (name) DO UPDATE SET
    category = EXCLUDED.category,
    movement_patterns = EXCLUDED.movement_patterns,
    bilateral_unilateral = EXCLUDED.bilateral_unilateral,
    posterior_anterior = EXCLUDED.posterior_anterior,
    complexity = EXCLUDED.complexity,
    equipment = EXCLUDED.equipment,
    primary_muscle = EXCLUDED.primary_muscle,
    supporting_muscles = EXCLUDED.supporting_muscles,
    muscle_bias = EXCLUDED.muscle_bias,
    joint_count_level = EXCLUDED.joint_count_level,
    dynamic_isometric = EXCLUDED.dynamic_isometric,
    movement_plane = EXCLUDED.movement_plane,
    primary_joints = EXCLUDED.primary_joints,
    is_active = true,
    updated_at = now();

INSERT INTO exercise_library (name, category, movement_patterns, bilateral_unilateral, posterior_anterior, complexity, equipment, primary_muscle, supporting_muscles, muscle_bias, joint_count_level, dynamic_isometric, movement_plane, primary_joints, is_active)
  VALUES ('Barbell Back Rack Forward Lunge', 'strength', '{"lunge"}'::text[], 'unilateral', 'mixed', 3, '{"barbell"}'::text[], 'Quads', '{"Glutes","Adductors","Calves"}'::text[], 'lengthened', 'regional', NULL, NULL, '{"Ankle","Knee","Hip"}'::text[], true)
  ON CONFLICT (name) DO UPDATE SET
    category = EXCLUDED.category,
    movement_patterns = EXCLUDED.movement_patterns,
    bilateral_unilateral = EXCLUDED.bilateral_unilateral,
    posterior_anterior = EXCLUDED.posterior_anterior,
    complexity = EXCLUDED.complexity,
    equipment = EXCLUDED.equipment,
    primary_muscle = EXCLUDED.primary_muscle,
    supporting_muscles = EXCLUDED.supporting_muscles,
    muscle_bias = EXCLUDED.muscle_bias,
    joint_count_level = EXCLUDED.joint_count_level,
    dynamic_isometric = EXCLUDED.dynamic_isometric,
    movement_plane = EXCLUDED.movement_plane,
    primary_joints = EXCLUDED.primary_joints,
    is_active = true,
    updated_at = now();

INSERT INTO exercise_library (name, category, movement_patterns, bilateral_unilateral, posterior_anterior, complexity, equipment, primary_muscle, supporting_muscles, muscle_bias, joint_count_level, dynamic_isometric, movement_plane, primary_joints, is_active)
  VALUES ('Barbell Back Rack Alternating Forward Lunge', 'strength', '{"lunge"}'::text[], 'unilateral', 'mixed', 3, '{"barbell"}'::text[], 'Quads', '{"Glutes","Adductors","Calves"}'::text[], 'lengthened', 'global', NULL, NULL, '{"Ankle","Knee","Hip"}'::text[], true)
  ON CONFLICT (name) DO UPDATE SET
    category = EXCLUDED.category,
    movement_patterns = EXCLUDED.movement_patterns,
    bilateral_unilateral = EXCLUDED.bilateral_unilateral,
    posterior_anterior = EXCLUDED.posterior_anterior,
    complexity = EXCLUDED.complexity,
    equipment = EXCLUDED.equipment,
    primary_muscle = EXCLUDED.primary_muscle,
    supporting_muscles = EXCLUDED.supporting_muscles,
    muscle_bias = EXCLUDED.muscle_bias,
    joint_count_level = EXCLUDED.joint_count_level,
    dynamic_isometric = EXCLUDED.dynamic_isometric,
    movement_plane = EXCLUDED.movement_plane,
    primary_joints = EXCLUDED.primary_joints,
    is_active = true,
    updated_at = now();

INSERT INTO exercise_library (name, category, movement_patterns, bilateral_unilateral, posterior_anterior, complexity, equipment, primary_muscle, supporting_muscles, muscle_bias, joint_count_level, dynamic_isometric, movement_plane, primary_joints, is_active)
  VALUES ('Barbell Back Rack Reverse Lunge', 'strength', '{"lunge"}'::text[], 'unilateral', 'posterior', 3, '{"barbell"}'::text[], 'Glutes', '{"Quads","Adductors","Calves"}'::text[], 'lengthened', 'regional', NULL, NULL, '{"Ankle","Knee","Hip"}'::text[], true)
  ON CONFLICT (name) DO UPDATE SET
    category = EXCLUDED.category,
    movement_patterns = EXCLUDED.movement_patterns,
    bilateral_unilateral = EXCLUDED.bilateral_unilateral,
    posterior_anterior = EXCLUDED.posterior_anterior,
    complexity = EXCLUDED.complexity,
    equipment = EXCLUDED.equipment,
    primary_muscle = EXCLUDED.primary_muscle,
    supporting_muscles = EXCLUDED.supporting_muscles,
    muscle_bias = EXCLUDED.muscle_bias,
    joint_count_level = EXCLUDED.joint_count_level,
    dynamic_isometric = EXCLUDED.dynamic_isometric,
    movement_plane = EXCLUDED.movement_plane,
    primary_joints = EXCLUDED.primary_joints,
    is_active = true,
    updated_at = now();

INSERT INTO exercise_library (name, category, movement_patterns, bilateral_unilateral, posterior_anterior, complexity, equipment, primary_muscle, supporting_muscles, muscle_bias, joint_count_level, dynamic_isometric, movement_plane, primary_joints, is_active)
  VALUES ('Barbell Back Rack Alternating Reverse Lunge', 'strength', '{"lunge"}'::text[], 'unilateral', 'posterior', 3, '{"barbell"}'::text[], 'Glutes', '{"Quads","Adductors","Calves"}'::text[], 'lengthened', 'global', NULL, NULL, '{"Ankle","Knee","Hip"}'::text[], true)
  ON CONFLICT (name) DO UPDATE SET
    category = EXCLUDED.category,
    movement_patterns = EXCLUDED.movement_patterns,
    bilateral_unilateral = EXCLUDED.bilateral_unilateral,
    posterior_anterior = EXCLUDED.posterior_anterior,
    complexity = EXCLUDED.complexity,
    equipment = EXCLUDED.equipment,
    primary_muscle = EXCLUDED.primary_muscle,
    supporting_muscles = EXCLUDED.supporting_muscles,
    muscle_bias = EXCLUDED.muscle_bias,
    joint_count_level = EXCLUDED.joint_count_level,
    dynamic_isometric = EXCLUDED.dynamic_isometric,
    movement_plane = EXCLUDED.movement_plane,
    primary_joints = EXCLUDED.primary_joints,
    is_active = true,
    updated_at = now();

INSERT INTO exercise_library (name, category, movement_patterns, bilateral_unilateral, posterior_anterior, complexity, equipment, primary_muscle, supporting_muscles, muscle_bias, joint_count_level, dynamic_isometric, movement_plane, primary_joints, is_active)
  VALUES ('Barbell Back Rack Forward Drop Lunge', 'strength', '{"lunge"}'::text[], 'unilateral', 'mixed', 3, '{"barbell"}'::text[], 'Quads', '{"Glutes","Adductors","Calves"}'::text[], 'lengthened', 'global', NULL, NULL, '{"Ankle","Knee","Hip"}'::text[], true)
  ON CONFLICT (name) DO UPDATE SET
    category = EXCLUDED.category,
    movement_patterns = EXCLUDED.movement_patterns,
    bilateral_unilateral = EXCLUDED.bilateral_unilateral,
    posterior_anterior = EXCLUDED.posterior_anterior,
    complexity = EXCLUDED.complexity,
    equipment = EXCLUDED.equipment,
    primary_muscle = EXCLUDED.primary_muscle,
    supporting_muscles = EXCLUDED.supporting_muscles,
    muscle_bias = EXCLUDED.muscle_bias,
    joint_count_level = EXCLUDED.joint_count_level,
    dynamic_isometric = EXCLUDED.dynamic_isometric,
    movement_plane = EXCLUDED.movement_plane,
    primary_joints = EXCLUDED.primary_joints,
    is_active = true,
    updated_at = now();

INSERT INTO exercise_library (name, category, movement_patterns, bilateral_unilateral, posterior_anterior, complexity, equipment, primary_muscle, supporting_muscles, muscle_bias, joint_count_level, dynamic_isometric, movement_plane, primary_joints, is_active)
  VALUES ('Barbell Back Rack Forward Alternating Drop Lunge', 'strength', '{"lunge"}'::text[], 'unilateral', 'mixed', 3, '{"barbell"}'::text[], 'Quads', '{"Glutes","Adductors","Calves"}'::text[], 'lengthened', 'global', NULL, NULL, '{"Ankle","Knee","Hip"}'::text[], true)
  ON CONFLICT (name) DO UPDATE SET
    category = EXCLUDED.category,
    movement_patterns = EXCLUDED.movement_patterns,
    bilateral_unilateral = EXCLUDED.bilateral_unilateral,
    posterior_anterior = EXCLUDED.posterior_anterior,
    complexity = EXCLUDED.complexity,
    equipment = EXCLUDED.equipment,
    primary_muscle = EXCLUDED.primary_muscle,
    supporting_muscles = EXCLUDED.supporting_muscles,
    muscle_bias = EXCLUDED.muscle_bias,
    joint_count_level = EXCLUDED.joint_count_level,
    dynamic_isometric = EXCLUDED.dynamic_isometric,
    movement_plane = EXCLUDED.movement_plane,
    primary_joints = EXCLUDED.primary_joints,
    is_active = true,
    updated_at = now();

INSERT INTO exercise_library (name, category, movement_patterns, bilateral_unilateral, posterior_anterior, complexity, equipment, primary_muscle, supporting_muscles, muscle_bias, joint_count_level, dynamic_isometric, movement_plane, primary_joints, is_active)
  VALUES ('Barbell Back Rack Reverse Drop Lunge', 'strength', '{"lunge"}'::text[], 'unilateral', 'posterior', 3, '{"barbell"}'::text[], 'Glutes', '{"Quads","Adductors","Calves"}'::text[], 'lengthened', 'global', NULL, NULL, '{"Ankle","Knee","Hip"}'::text[], true)
  ON CONFLICT (name) DO UPDATE SET
    category = EXCLUDED.category,
    movement_patterns = EXCLUDED.movement_patterns,
    bilateral_unilateral = EXCLUDED.bilateral_unilateral,
    posterior_anterior = EXCLUDED.posterior_anterior,
    complexity = EXCLUDED.complexity,
    equipment = EXCLUDED.equipment,
    primary_muscle = EXCLUDED.primary_muscle,
    supporting_muscles = EXCLUDED.supporting_muscles,
    muscle_bias = EXCLUDED.muscle_bias,
    joint_count_level = EXCLUDED.joint_count_level,
    dynamic_isometric = EXCLUDED.dynamic_isometric,
    movement_plane = EXCLUDED.movement_plane,
    primary_joints = EXCLUDED.primary_joints,
    is_active = true,
    updated_at = now();

INSERT INTO exercise_library (name, category, movement_patterns, bilateral_unilateral, posterior_anterior, complexity, equipment, primary_muscle, supporting_muscles, muscle_bias, joint_count_level, dynamic_isometric, movement_plane, primary_joints, is_active)
  VALUES ('Barbell Back Rack Alternating Reverse Drop Lunge', 'strength', '{"lunge"}'::text[], 'unilateral', 'posterior', 3, '{"barbell"}'::text[], 'Glutes', '{"Quads","Adductors","Calves"}'::text[], 'lengthened', 'global', NULL, NULL, '{"Ankle","Knee","Hip"}'::text[], true)
  ON CONFLICT (name) DO UPDATE SET
    category = EXCLUDED.category,
    movement_patterns = EXCLUDED.movement_patterns,
    bilateral_unilateral = EXCLUDED.bilateral_unilateral,
    posterior_anterior = EXCLUDED.posterior_anterior,
    complexity = EXCLUDED.complexity,
    equipment = EXCLUDED.equipment,
    primary_muscle = EXCLUDED.primary_muscle,
    supporting_muscles = EXCLUDED.supporting_muscles,
    muscle_bias = EXCLUDED.muscle_bias,
    joint_count_level = EXCLUDED.joint_count_level,
    dynamic_isometric = EXCLUDED.dynamic_isometric,
    movement_plane = EXCLUDED.movement_plane,
    primary_joints = EXCLUDED.primary_joints,
    is_active = true,
    updated_at = now();

INSERT INTO exercise_library (name, category, movement_patterns, bilateral_unilateral, posterior_anterior, complexity, equipment, primary_muscle, supporting_muscles, muscle_bias, joint_count_level, dynamic_isometric, movement_plane, primary_joints, is_active)
  VALUES ('Dual DB Suitcase Forward Lunge', 'strength', '{"lunge"}'::text[], 'unilateral', 'anterior', 2, '{"dumbbell"}'::text[], 'Quads', '{"Glutes","Adductors","Calves"}'::text[], 'lengthened', 'regional', NULL, NULL, '{"Ankle","Knee","Hip"}'::text[], true)
  ON CONFLICT (name) DO UPDATE SET
    category = EXCLUDED.category,
    movement_patterns = EXCLUDED.movement_patterns,
    bilateral_unilateral = EXCLUDED.bilateral_unilateral,
    posterior_anterior = EXCLUDED.posterior_anterior,
    complexity = EXCLUDED.complexity,
    equipment = EXCLUDED.equipment,
    primary_muscle = EXCLUDED.primary_muscle,
    supporting_muscles = EXCLUDED.supporting_muscles,
    muscle_bias = EXCLUDED.muscle_bias,
    joint_count_level = EXCLUDED.joint_count_level,
    dynamic_isometric = EXCLUDED.dynamic_isometric,
    movement_plane = EXCLUDED.movement_plane,
    primary_joints = EXCLUDED.primary_joints,
    is_active = true,
    updated_at = now();

INSERT INTO exercise_library (name, category, movement_patterns, bilateral_unilateral, posterior_anterior, complexity, equipment, primary_muscle, supporting_muscles, muscle_bias, joint_count_level, dynamic_isometric, movement_plane, primary_joints, is_active)
  VALUES ('Dual DB Suitcase Alternating Forward Lunge', 'strength', '{"lunge"}'::text[], 'unilateral', 'anterior', 2, '{"dumbbell"}'::text[], 'Quads', '{"Glutes","Adductors","Calves"}'::text[], 'lengthened', 'global', NULL, NULL, '{"Ankle","Knee","Hip"}'::text[], true)
  ON CONFLICT (name) DO UPDATE SET
    category = EXCLUDED.category,
    movement_patterns = EXCLUDED.movement_patterns,
    bilateral_unilateral = EXCLUDED.bilateral_unilateral,
    posterior_anterior = EXCLUDED.posterior_anterior,
    complexity = EXCLUDED.complexity,
    equipment = EXCLUDED.equipment,
    primary_muscle = EXCLUDED.primary_muscle,
    supporting_muscles = EXCLUDED.supporting_muscles,
    muscle_bias = EXCLUDED.muscle_bias,
    joint_count_level = EXCLUDED.joint_count_level,
    dynamic_isometric = EXCLUDED.dynamic_isometric,
    movement_plane = EXCLUDED.movement_plane,
    primary_joints = EXCLUDED.primary_joints,
    is_active = true,
    updated_at = now();

INSERT INTO exercise_library (name, category, movement_patterns, bilateral_unilateral, posterior_anterior, complexity, equipment, primary_muscle, supporting_muscles, muscle_bias, joint_count_level, dynamic_isometric, movement_plane, primary_joints, is_active)
  VALUES ('Dual DB Suitcase Reverse Lunge', 'strength', '{"lunge"}'::text[], 'unilateral', 'mixed', 2, '{"dumbbell"}'::text[], 'Glutes', '{"Quads","Adductors","Calves"}'::text[], 'lengthened', 'regional', NULL, NULL, '{"Ankle","Knee","Hip"}'::text[], true)
  ON CONFLICT (name) DO UPDATE SET
    category = EXCLUDED.category,
    movement_patterns = EXCLUDED.movement_patterns,
    bilateral_unilateral = EXCLUDED.bilateral_unilateral,
    posterior_anterior = EXCLUDED.posterior_anterior,
    complexity = EXCLUDED.complexity,
    equipment = EXCLUDED.equipment,
    primary_muscle = EXCLUDED.primary_muscle,
    supporting_muscles = EXCLUDED.supporting_muscles,
    muscle_bias = EXCLUDED.muscle_bias,
    joint_count_level = EXCLUDED.joint_count_level,
    dynamic_isometric = EXCLUDED.dynamic_isometric,
    movement_plane = EXCLUDED.movement_plane,
    primary_joints = EXCLUDED.primary_joints,
    is_active = true,
    updated_at = now();

INSERT INTO exercise_library (name, category, movement_patterns, bilateral_unilateral, posterior_anterior, complexity, equipment, primary_muscle, supporting_muscles, muscle_bias, joint_count_level, dynamic_isometric, movement_plane, primary_joints, is_active)
  VALUES ('Dual DB Suitcase Alternating Reverse Lunge', 'strength', '{"lunge"}'::text[], 'unilateral', 'mixed', 2, '{"dumbbell"}'::text[], 'Glutes', '{"Quads","Adductors","Calves"}'::text[], 'lengthened', 'global', NULL, NULL, '{"Ankle","Knee","Hip"}'::text[], true)
  ON CONFLICT (name) DO UPDATE SET
    category = EXCLUDED.category,
    movement_patterns = EXCLUDED.movement_patterns,
    bilateral_unilateral = EXCLUDED.bilateral_unilateral,
    posterior_anterior = EXCLUDED.posterior_anterior,
    complexity = EXCLUDED.complexity,
    equipment = EXCLUDED.equipment,
    primary_muscle = EXCLUDED.primary_muscle,
    supporting_muscles = EXCLUDED.supporting_muscles,
    muscle_bias = EXCLUDED.muscle_bias,
    joint_count_level = EXCLUDED.joint_count_level,
    dynamic_isometric = EXCLUDED.dynamic_isometric,
    movement_plane = EXCLUDED.movement_plane,
    primary_joints = EXCLUDED.primary_joints,
    is_active = true,
    updated_at = now();

INSERT INTO exercise_library (name, category, movement_patterns, bilateral_unilateral, posterior_anterior, complexity, equipment, primary_muscle, supporting_muscles, muscle_bias, joint_count_level, dynamic_isometric, movement_plane, primary_joints, is_active)
  VALUES ('Dual DB Suitcase Forward Drop Lunge', 'strength', '{"lunge"}'::text[], 'unilateral', 'anterior', 2, '{"dumbbell"}'::text[], 'Quads', '{"Glutes","Adductors","Calves"}'::text[], 'lengthened', 'global', NULL, NULL, '{"Ankle","Knee","Hip"}'::text[], true)
  ON CONFLICT (name) DO UPDATE SET
    category = EXCLUDED.category,
    movement_patterns = EXCLUDED.movement_patterns,
    bilateral_unilateral = EXCLUDED.bilateral_unilateral,
    posterior_anterior = EXCLUDED.posterior_anterior,
    complexity = EXCLUDED.complexity,
    equipment = EXCLUDED.equipment,
    primary_muscle = EXCLUDED.primary_muscle,
    supporting_muscles = EXCLUDED.supporting_muscles,
    muscle_bias = EXCLUDED.muscle_bias,
    joint_count_level = EXCLUDED.joint_count_level,
    dynamic_isometric = EXCLUDED.dynamic_isometric,
    movement_plane = EXCLUDED.movement_plane,
    primary_joints = EXCLUDED.primary_joints,
    is_active = true,
    updated_at = now();

INSERT INTO exercise_library (name, category, movement_patterns, bilateral_unilateral, posterior_anterior, complexity, equipment, primary_muscle, supporting_muscles, muscle_bias, joint_count_level, dynamic_isometric, movement_plane, primary_joints, is_active)
  VALUES ('Dual DB Suitcase Forward Alternating Drop Lunge', 'strength', '{"lunge"}'::text[], 'unilateral', 'anterior', 2, '{"dumbbell"}'::text[], 'Quads', '{"Glutes","Adductors","Calves"}'::text[], 'lengthened', 'global', NULL, NULL, '{"Ankle","Knee","Hip"}'::text[], true)
  ON CONFLICT (name) DO UPDATE SET
    category = EXCLUDED.category,
    movement_patterns = EXCLUDED.movement_patterns,
    bilateral_unilateral = EXCLUDED.bilateral_unilateral,
    posterior_anterior = EXCLUDED.posterior_anterior,
    complexity = EXCLUDED.complexity,
    equipment = EXCLUDED.equipment,
    primary_muscle = EXCLUDED.primary_muscle,
    supporting_muscles = EXCLUDED.supporting_muscles,
    muscle_bias = EXCLUDED.muscle_bias,
    joint_count_level = EXCLUDED.joint_count_level,
    dynamic_isometric = EXCLUDED.dynamic_isometric,
    movement_plane = EXCLUDED.movement_plane,
    primary_joints = EXCLUDED.primary_joints,
    is_active = true,
    updated_at = now();

INSERT INTO exercise_library (name, category, movement_patterns, bilateral_unilateral, posterior_anterior, complexity, equipment, primary_muscle, supporting_muscles, muscle_bias, joint_count_level, dynamic_isometric, movement_plane, primary_joints, is_active)
  VALUES ('Dual DB Suitcase Reverse Drop Lunge', 'strength', '{"lunge"}'::text[], 'unilateral', 'mixed', 2, '{"dumbbell"}'::text[], 'Glutes', '{"Quads","Adductors","Calves"}'::text[], 'lengthened', 'global', NULL, NULL, '{"Ankle","Knee","Hip"}'::text[], true)
  ON CONFLICT (name) DO UPDATE SET
    category = EXCLUDED.category,
    movement_patterns = EXCLUDED.movement_patterns,
    bilateral_unilateral = EXCLUDED.bilateral_unilateral,
    posterior_anterior = EXCLUDED.posterior_anterior,
    complexity = EXCLUDED.complexity,
    equipment = EXCLUDED.equipment,
    primary_muscle = EXCLUDED.primary_muscle,
    supporting_muscles = EXCLUDED.supporting_muscles,
    muscle_bias = EXCLUDED.muscle_bias,
    joint_count_level = EXCLUDED.joint_count_level,
    dynamic_isometric = EXCLUDED.dynamic_isometric,
    movement_plane = EXCLUDED.movement_plane,
    primary_joints = EXCLUDED.primary_joints,
    is_active = true,
    updated_at = now();

INSERT INTO exercise_library (name, category, movement_patterns, bilateral_unilateral, posterior_anterior, complexity, equipment, primary_muscle, supporting_muscles, muscle_bias, joint_count_level, dynamic_isometric, movement_plane, primary_joints, is_active)
  VALUES ('Dual DB Suitcase Alternating Reverse Drop Lunge', 'strength', '{"lunge"}'::text[], 'unilateral', 'mixed', 2, '{"dumbbell"}'::text[], 'Glutes', '{"Quads","Adductors","Calves"}'::text[], 'lengthened', 'global', NULL, NULL, '{"Ankle","Knee","Hip"}'::text[], true)
  ON CONFLICT (name) DO UPDATE SET
    category = EXCLUDED.category,
    movement_patterns = EXCLUDED.movement_patterns,
    bilateral_unilateral = EXCLUDED.bilateral_unilateral,
    posterior_anterior = EXCLUDED.posterior_anterior,
    complexity = EXCLUDED.complexity,
    equipment = EXCLUDED.equipment,
    primary_muscle = EXCLUDED.primary_muscle,
    supporting_muscles = EXCLUDED.supporting_muscles,
    muscle_bias = EXCLUDED.muscle_bias,
    joint_count_level = EXCLUDED.joint_count_level,
    dynamic_isometric = EXCLUDED.dynamic_isometric,
    movement_plane = EXCLUDED.movement_plane,
    primary_joints = EXCLUDED.primary_joints,
    is_active = true,
    updated_at = now();

INSERT INTO exercise_library (name, category, movement_patterns, bilateral_unilateral, posterior_anterior, complexity, equipment, primary_muscle, supporting_muscles, muscle_bias, joint_count_level, dynamic_isometric, movement_plane, primary_joints, is_active)
  VALUES ('DB/KB Goblet Forward Lunge', 'strength', '{"lunge"}'::text[], 'unilateral', 'anterior', 1, '{"dumbbell","kettlebell"}'::text[], 'Quads', '{"Glutes","Adductors","Calves"}'::text[], 'lengthened', 'regional', NULL, NULL, '{"Ankle","Knee","Hip"}'::text[], true)
  ON CONFLICT (name) DO UPDATE SET
    category = EXCLUDED.category,
    movement_patterns = EXCLUDED.movement_patterns,
    bilateral_unilateral = EXCLUDED.bilateral_unilateral,
    posterior_anterior = EXCLUDED.posterior_anterior,
    complexity = EXCLUDED.complexity,
    equipment = EXCLUDED.equipment,
    primary_muscle = EXCLUDED.primary_muscle,
    supporting_muscles = EXCLUDED.supporting_muscles,
    muscle_bias = EXCLUDED.muscle_bias,
    joint_count_level = EXCLUDED.joint_count_level,
    dynamic_isometric = EXCLUDED.dynamic_isometric,
    movement_plane = EXCLUDED.movement_plane,
    primary_joints = EXCLUDED.primary_joints,
    is_active = true,
    updated_at = now();

INSERT INTO exercise_library (name, category, movement_patterns, bilateral_unilateral, posterior_anterior, complexity, equipment, primary_muscle, supporting_muscles, muscle_bias, joint_count_level, dynamic_isometric, movement_plane, primary_joints, is_active)
  VALUES ('DB/KB Goblet Alternating Forward Lunge', 'strength', '{"lunge"}'::text[], 'unilateral', 'anterior', 1, '{"dumbbell","kettlebell"}'::text[], 'Quads', '{"Glutes","Adductors","Calves"}'::text[], 'lengthened', 'global', NULL, NULL, '{"Ankle","Knee","Hip"}'::text[], true)
  ON CONFLICT (name) DO UPDATE SET
    category = EXCLUDED.category,
    movement_patterns = EXCLUDED.movement_patterns,
    bilateral_unilateral = EXCLUDED.bilateral_unilateral,
    posterior_anterior = EXCLUDED.posterior_anterior,
    complexity = EXCLUDED.complexity,
    equipment = EXCLUDED.equipment,
    primary_muscle = EXCLUDED.primary_muscle,
    supporting_muscles = EXCLUDED.supporting_muscles,
    muscle_bias = EXCLUDED.muscle_bias,
    joint_count_level = EXCLUDED.joint_count_level,
    dynamic_isometric = EXCLUDED.dynamic_isometric,
    movement_plane = EXCLUDED.movement_plane,
    primary_joints = EXCLUDED.primary_joints,
    is_active = true,
    updated_at = now();

INSERT INTO exercise_library (name, category, movement_patterns, bilateral_unilateral, posterior_anterior, complexity, equipment, primary_muscle, supporting_muscles, muscle_bias, joint_count_level, dynamic_isometric, movement_plane, primary_joints, is_active)
  VALUES ('DB/KB Goblet Reverse Lunge', 'strength', '{"lunge"}'::text[], 'unilateral', 'mixed', 1, '{"dumbbell","kettlebell"}'::text[], 'Glutes', '{"Quads","Adductors","Calves"}'::text[], 'lengthened', 'regional', NULL, NULL, '{"Ankle","Knee","Hip"}'::text[], true)
  ON CONFLICT (name) DO UPDATE SET
    category = EXCLUDED.category,
    movement_patterns = EXCLUDED.movement_patterns,
    bilateral_unilateral = EXCLUDED.bilateral_unilateral,
    posterior_anterior = EXCLUDED.posterior_anterior,
    complexity = EXCLUDED.complexity,
    equipment = EXCLUDED.equipment,
    primary_muscle = EXCLUDED.primary_muscle,
    supporting_muscles = EXCLUDED.supporting_muscles,
    muscle_bias = EXCLUDED.muscle_bias,
    joint_count_level = EXCLUDED.joint_count_level,
    dynamic_isometric = EXCLUDED.dynamic_isometric,
    movement_plane = EXCLUDED.movement_plane,
    primary_joints = EXCLUDED.primary_joints,
    is_active = true,
    updated_at = now();

INSERT INTO exercise_library (name, category, movement_patterns, bilateral_unilateral, posterior_anterior, complexity, equipment, primary_muscle, supporting_muscles, muscle_bias, joint_count_level, dynamic_isometric, movement_plane, primary_joints, is_active)
  VALUES ('DB/KB Goblet Alternating Reverse Lunge', 'strength', '{"lunge"}'::text[], 'unilateral', 'mixed', 1, '{"dumbbell","kettlebell"}'::text[], 'Glutes', '{"Quads","Adductors","Calves"}'::text[], 'lengthened', 'global', NULL, NULL, '{"Ankle","Knee","Hip"}'::text[], true)
  ON CONFLICT (name) DO UPDATE SET
    category = EXCLUDED.category,
    movement_patterns = EXCLUDED.movement_patterns,
    bilateral_unilateral = EXCLUDED.bilateral_unilateral,
    posterior_anterior = EXCLUDED.posterior_anterior,
    complexity = EXCLUDED.complexity,
    equipment = EXCLUDED.equipment,
    primary_muscle = EXCLUDED.primary_muscle,
    supporting_muscles = EXCLUDED.supporting_muscles,
    muscle_bias = EXCLUDED.muscle_bias,
    joint_count_level = EXCLUDED.joint_count_level,
    dynamic_isometric = EXCLUDED.dynamic_isometric,
    movement_plane = EXCLUDED.movement_plane,
    primary_joints = EXCLUDED.primary_joints,
    is_active = true,
    updated_at = now();

INSERT INTO exercise_library (name, category, movement_patterns, bilateral_unilateral, posterior_anterior, complexity, equipment, primary_muscle, supporting_muscles, muscle_bias, joint_count_level, dynamic_isometric, movement_plane, primary_joints, is_active)
  VALUES ('DB/KB Goblet Forward Drop Lunge', 'strength', '{"lunge"}'::text[], 'unilateral', 'anterior', 2, '{"dumbbell","kettlebell"}'::text[], 'Quads', '{"Glutes","Adductors","Calves"}'::text[], 'lengthened', 'global', NULL, NULL, '{"Ankle","Knee","Hip"}'::text[], true)
  ON CONFLICT (name) DO UPDATE SET
    category = EXCLUDED.category,
    movement_patterns = EXCLUDED.movement_patterns,
    bilateral_unilateral = EXCLUDED.bilateral_unilateral,
    posterior_anterior = EXCLUDED.posterior_anterior,
    complexity = EXCLUDED.complexity,
    equipment = EXCLUDED.equipment,
    primary_muscle = EXCLUDED.primary_muscle,
    supporting_muscles = EXCLUDED.supporting_muscles,
    muscle_bias = EXCLUDED.muscle_bias,
    joint_count_level = EXCLUDED.joint_count_level,
    dynamic_isometric = EXCLUDED.dynamic_isometric,
    movement_plane = EXCLUDED.movement_plane,
    primary_joints = EXCLUDED.primary_joints,
    is_active = true,
    updated_at = now();

INSERT INTO exercise_library (name, category, movement_patterns, bilateral_unilateral, posterior_anterior, complexity, equipment, primary_muscle, supporting_muscles, muscle_bias, joint_count_level, dynamic_isometric, movement_plane, primary_joints, is_active)
  VALUES ('DB/KB Goblet Forward Alternating Drop Lunge', 'strength', '{"lunge"}'::text[], 'unilateral', 'anterior', 2, '{"dumbbell","kettlebell"}'::text[], 'Quads', '{"Glutes","Adductors","Calves"}'::text[], 'lengthened', 'global', NULL, NULL, '{"Ankle","Knee","Hip"}'::text[], true)
  ON CONFLICT (name) DO UPDATE SET
    category = EXCLUDED.category,
    movement_patterns = EXCLUDED.movement_patterns,
    bilateral_unilateral = EXCLUDED.bilateral_unilateral,
    posterior_anterior = EXCLUDED.posterior_anterior,
    complexity = EXCLUDED.complexity,
    equipment = EXCLUDED.equipment,
    primary_muscle = EXCLUDED.primary_muscle,
    supporting_muscles = EXCLUDED.supporting_muscles,
    muscle_bias = EXCLUDED.muscle_bias,
    joint_count_level = EXCLUDED.joint_count_level,
    dynamic_isometric = EXCLUDED.dynamic_isometric,
    movement_plane = EXCLUDED.movement_plane,
    primary_joints = EXCLUDED.primary_joints,
    is_active = true,
    updated_at = now();

INSERT INTO exercise_library (name, category, movement_patterns, bilateral_unilateral, posterior_anterior, complexity, equipment, primary_muscle, supporting_muscles, muscle_bias, joint_count_level, dynamic_isometric, movement_plane, primary_joints, is_active)
  VALUES ('DB/KB Goblet Reverse Drop Lunge', 'strength', '{"lunge"}'::text[], 'unilateral', 'mixed', 2, '{"dumbbell","kettlebell"}'::text[], 'Glutes', '{"Quads","Adductors","Calves"}'::text[], 'lengthened', 'global', NULL, NULL, '{"Ankle","Knee","Hip"}'::text[], true)
  ON CONFLICT (name) DO UPDATE SET
    category = EXCLUDED.category,
    movement_patterns = EXCLUDED.movement_patterns,
    bilateral_unilateral = EXCLUDED.bilateral_unilateral,
    posterior_anterior = EXCLUDED.posterior_anterior,
    complexity = EXCLUDED.complexity,
    equipment = EXCLUDED.equipment,
    primary_muscle = EXCLUDED.primary_muscle,
    supporting_muscles = EXCLUDED.supporting_muscles,
    muscle_bias = EXCLUDED.muscle_bias,
    joint_count_level = EXCLUDED.joint_count_level,
    dynamic_isometric = EXCLUDED.dynamic_isometric,
    movement_plane = EXCLUDED.movement_plane,
    primary_joints = EXCLUDED.primary_joints,
    is_active = true,
    updated_at = now();

INSERT INTO exercise_library (name, category, movement_patterns, bilateral_unilateral, posterior_anterior, complexity, equipment, primary_muscle, supporting_muscles, muscle_bias, joint_count_level, dynamic_isometric, movement_plane, primary_joints, is_active)
  VALUES ('DB/KB Goblet Alternating Reverse Drop Lunge', 'strength', '{"lunge"}'::text[], 'unilateral', 'mixed', 2, '{"dumbbell","kettlebell"}'::text[], 'Glutes', '{"Quads","Adductors","Calves"}'::text[], 'lengthened', 'global', NULL, NULL, '{"Ankle","Knee","Hip"}'::text[], true)
  ON CONFLICT (name) DO UPDATE SET
    category = EXCLUDED.category,
    movement_patterns = EXCLUDED.movement_patterns,
    bilateral_unilateral = EXCLUDED.bilateral_unilateral,
    posterior_anterior = EXCLUDED.posterior_anterior,
    complexity = EXCLUDED.complexity,
    equipment = EXCLUDED.equipment,
    primary_muscle = EXCLUDED.primary_muscle,
    supporting_muscles = EXCLUDED.supporting_muscles,
    muscle_bias = EXCLUDED.muscle_bias,
    joint_count_level = EXCLUDED.joint_count_level,
    dynamic_isometric = EXCLUDED.dynamic_isometric,
    movement_plane = EXCLUDED.movement_plane,
    primary_joints = EXCLUDED.primary_joints,
    is_active = true,
    updated_at = now();

INSERT INTO exercise_library (name, category, movement_patterns, bilateral_unilateral, posterior_anterior, complexity, equipment, primary_muscle, supporting_muscles, muscle_bias, joint_count_level, dynamic_isometric, movement_plane, primary_joints, is_active)
  VALUES ('Dual DB Front Rack Forward Lunge', 'strength', '{"lunge"}'::text[], 'unilateral', 'anterior', 3, '{"dumbbell"}'::text[], 'Quads', '{"Glutes","Adductors","Calves"}'::text[], 'lengthened', 'regional', NULL, NULL, '{"Ankle","Knee","Hip"}'::text[], true)
  ON CONFLICT (name) DO UPDATE SET
    category = EXCLUDED.category,
    movement_patterns = EXCLUDED.movement_patterns,
    bilateral_unilateral = EXCLUDED.bilateral_unilateral,
    posterior_anterior = EXCLUDED.posterior_anterior,
    complexity = EXCLUDED.complexity,
    equipment = EXCLUDED.equipment,
    primary_muscle = EXCLUDED.primary_muscle,
    supporting_muscles = EXCLUDED.supporting_muscles,
    muscle_bias = EXCLUDED.muscle_bias,
    joint_count_level = EXCLUDED.joint_count_level,
    dynamic_isometric = EXCLUDED.dynamic_isometric,
    movement_plane = EXCLUDED.movement_plane,
    primary_joints = EXCLUDED.primary_joints,
    is_active = true,
    updated_at = now();

INSERT INTO exercise_library (name, category, movement_patterns, bilateral_unilateral, posterior_anterior, complexity, equipment, primary_muscle, supporting_muscles, muscle_bias, joint_count_level, dynamic_isometric, movement_plane, primary_joints, is_active)
  VALUES ('Dual DB Front Rack Alternating Forward Lunge', 'strength', '{"lunge"}'::text[], 'unilateral', 'anterior', 3, '{"dumbbell"}'::text[], 'Quads', '{"Glutes","Adductors","Calves"}'::text[], 'lengthened', 'global', NULL, NULL, '{"Ankle","Knee","Hip"}'::text[], true)
  ON CONFLICT (name) DO UPDATE SET
    category = EXCLUDED.category,
    movement_patterns = EXCLUDED.movement_patterns,
    bilateral_unilateral = EXCLUDED.bilateral_unilateral,
    posterior_anterior = EXCLUDED.posterior_anterior,
    complexity = EXCLUDED.complexity,
    equipment = EXCLUDED.equipment,
    primary_muscle = EXCLUDED.primary_muscle,
    supporting_muscles = EXCLUDED.supporting_muscles,
    muscle_bias = EXCLUDED.muscle_bias,
    joint_count_level = EXCLUDED.joint_count_level,
    dynamic_isometric = EXCLUDED.dynamic_isometric,
    movement_plane = EXCLUDED.movement_plane,
    primary_joints = EXCLUDED.primary_joints,
    is_active = true,
    updated_at = now();

INSERT INTO exercise_library (name, category, movement_patterns, bilateral_unilateral, posterior_anterior, complexity, equipment, primary_muscle, supporting_muscles, muscle_bias, joint_count_level, dynamic_isometric, movement_plane, primary_joints, is_active)
  VALUES ('Dual DB Front Rack Reverse Lunge', 'strength', '{"lunge"}'::text[], 'unilateral', 'mixed', 3, '{"dumbbell"}'::text[], 'Glutes', '{"Quads","Adductors","Calves"}'::text[], 'lengthened', 'regional', NULL, NULL, '{"Ankle","Knee","Hip"}'::text[], true)
  ON CONFLICT (name) DO UPDATE SET
    category = EXCLUDED.category,
    movement_patterns = EXCLUDED.movement_patterns,
    bilateral_unilateral = EXCLUDED.bilateral_unilateral,
    posterior_anterior = EXCLUDED.posterior_anterior,
    complexity = EXCLUDED.complexity,
    equipment = EXCLUDED.equipment,
    primary_muscle = EXCLUDED.primary_muscle,
    supporting_muscles = EXCLUDED.supporting_muscles,
    muscle_bias = EXCLUDED.muscle_bias,
    joint_count_level = EXCLUDED.joint_count_level,
    dynamic_isometric = EXCLUDED.dynamic_isometric,
    movement_plane = EXCLUDED.movement_plane,
    primary_joints = EXCLUDED.primary_joints,
    is_active = true,
    updated_at = now();

INSERT INTO exercise_library (name, category, movement_patterns, bilateral_unilateral, posterior_anterior, complexity, equipment, primary_muscle, supporting_muscles, muscle_bias, joint_count_level, dynamic_isometric, movement_plane, primary_joints, is_active)
  VALUES ('Dual DB Front Rack Alternating Reverse Lunge', 'strength', '{"lunge"}'::text[], 'unilateral', 'mixed', 3, '{"dumbbell"}'::text[], 'Glutes', '{"Quads","Adductors","Calves"}'::text[], 'lengthened', 'global', NULL, NULL, '{"Ankle","Knee","Hip"}'::text[], true)
  ON CONFLICT (name) DO UPDATE SET
    category = EXCLUDED.category,
    movement_patterns = EXCLUDED.movement_patterns,
    bilateral_unilateral = EXCLUDED.bilateral_unilateral,
    posterior_anterior = EXCLUDED.posterior_anterior,
    complexity = EXCLUDED.complexity,
    equipment = EXCLUDED.equipment,
    primary_muscle = EXCLUDED.primary_muscle,
    supporting_muscles = EXCLUDED.supporting_muscles,
    muscle_bias = EXCLUDED.muscle_bias,
    joint_count_level = EXCLUDED.joint_count_level,
    dynamic_isometric = EXCLUDED.dynamic_isometric,
    movement_plane = EXCLUDED.movement_plane,
    primary_joints = EXCLUDED.primary_joints,
    is_active = true,
    updated_at = now();

INSERT INTO exercise_library (name, category, movement_patterns, bilateral_unilateral, posterior_anterior, complexity, equipment, primary_muscle, supporting_muscles, muscle_bias, joint_count_level, dynamic_isometric, movement_plane, primary_joints, is_active)
  VALUES ('Dual DB Front Rack Forward Drop Lunge', 'strength', '{"lunge"}'::text[], 'unilateral', 'anterior', 3, '{"dumbbell"}'::text[], 'Quads', '{"Glutes","Adductors","Calves"}'::text[], 'lengthened', 'global', NULL, NULL, '{"Ankle","Knee","Hip"}'::text[], true)
  ON CONFLICT (name) DO UPDATE SET
    category = EXCLUDED.category,
    movement_patterns = EXCLUDED.movement_patterns,
    bilateral_unilateral = EXCLUDED.bilateral_unilateral,
    posterior_anterior = EXCLUDED.posterior_anterior,
    complexity = EXCLUDED.complexity,
    equipment = EXCLUDED.equipment,
    primary_muscle = EXCLUDED.primary_muscle,
    supporting_muscles = EXCLUDED.supporting_muscles,
    muscle_bias = EXCLUDED.muscle_bias,
    joint_count_level = EXCLUDED.joint_count_level,
    dynamic_isometric = EXCLUDED.dynamic_isometric,
    movement_plane = EXCLUDED.movement_plane,
    primary_joints = EXCLUDED.primary_joints,
    is_active = true,
    updated_at = now();

INSERT INTO exercise_library (name, category, movement_patterns, bilateral_unilateral, posterior_anterior, complexity, equipment, primary_muscle, supporting_muscles, muscle_bias, joint_count_level, dynamic_isometric, movement_plane, primary_joints, is_active)
  VALUES ('Dual DB Front Rack Forward Alternating Drop Lunge', 'strength', '{"lunge"}'::text[], 'unilateral', 'anterior', 3, '{"dumbbell"}'::text[], 'Quads', '{"Glutes","Adductors","Calves"}'::text[], 'lengthened', 'global', NULL, NULL, '{"Ankle","Knee","Hip"}'::text[], true)
  ON CONFLICT (name) DO UPDATE SET
    category = EXCLUDED.category,
    movement_patterns = EXCLUDED.movement_patterns,
    bilateral_unilateral = EXCLUDED.bilateral_unilateral,
    posterior_anterior = EXCLUDED.posterior_anterior,
    complexity = EXCLUDED.complexity,
    equipment = EXCLUDED.equipment,
    primary_muscle = EXCLUDED.primary_muscle,
    supporting_muscles = EXCLUDED.supporting_muscles,
    muscle_bias = EXCLUDED.muscle_bias,
    joint_count_level = EXCLUDED.joint_count_level,
    dynamic_isometric = EXCLUDED.dynamic_isometric,
    movement_plane = EXCLUDED.movement_plane,
    primary_joints = EXCLUDED.primary_joints,
    is_active = true,
    updated_at = now();

INSERT INTO exercise_library (name, category, movement_patterns, bilateral_unilateral, posterior_anterior, complexity, equipment, primary_muscle, supporting_muscles, muscle_bias, joint_count_level, dynamic_isometric, movement_plane, primary_joints, is_active)
  VALUES ('Dual DB Front Rack Reverse Drop Lunge', 'strength', '{"lunge"}'::text[], 'unilateral', 'mixed', 3, '{"dumbbell"}'::text[], 'Glutes', '{"Quads","Adductors","Calves"}'::text[], 'lengthened', 'global', NULL, NULL, '{"Ankle","Knee","Hip"}'::text[], true)
  ON CONFLICT (name) DO UPDATE SET
    category = EXCLUDED.category,
    movement_patterns = EXCLUDED.movement_patterns,
    bilateral_unilateral = EXCLUDED.bilateral_unilateral,
    posterior_anterior = EXCLUDED.posterior_anterior,
    complexity = EXCLUDED.complexity,
    equipment = EXCLUDED.equipment,
    primary_muscle = EXCLUDED.primary_muscle,
    supporting_muscles = EXCLUDED.supporting_muscles,
    muscle_bias = EXCLUDED.muscle_bias,
    joint_count_level = EXCLUDED.joint_count_level,
    dynamic_isometric = EXCLUDED.dynamic_isometric,
    movement_plane = EXCLUDED.movement_plane,
    primary_joints = EXCLUDED.primary_joints,
    is_active = true,
    updated_at = now();

INSERT INTO exercise_library (name, category, movement_patterns, bilateral_unilateral, posterior_anterior, complexity, equipment, primary_muscle, supporting_muscles, muscle_bias, joint_count_level, dynamic_isometric, movement_plane, primary_joints, is_active)
  VALUES ('Dual DB Front Rack Alternating Reverse Drop Lunge', 'strength', '{"lunge"}'::text[], 'unilateral', 'mixed', 3, '{"dumbbell"}'::text[], 'Glutes', '{"Quads","Adductors","Calves"}'::text[], 'lengthened', 'global', NULL, NULL, '{"Ankle","Knee","Hip"}'::text[], true)
  ON CONFLICT (name) DO UPDATE SET
    category = EXCLUDED.category,
    movement_patterns = EXCLUDED.movement_patterns,
    bilateral_unilateral = EXCLUDED.bilateral_unilateral,
    posterior_anterior = EXCLUDED.posterior_anterior,
    complexity = EXCLUDED.complexity,
    equipment = EXCLUDED.equipment,
    primary_muscle = EXCLUDED.primary_muscle,
    supporting_muscles = EXCLUDED.supporting_muscles,
    muscle_bias = EXCLUDED.muscle_bias,
    joint_count_level = EXCLUDED.joint_count_level,
    dynamic_isometric = EXCLUDED.dynamic_isometric,
    movement_plane = EXCLUDED.movement_plane,
    primary_joints = EXCLUDED.primary_joints,
    is_active = true,
    updated_at = now();

INSERT INTO exercise_library (name, category, movement_patterns, bilateral_unilateral, posterior_anterior, complexity, equipment, primary_muscle, supporting_muscles, muscle_bias, joint_count_level, dynamic_isometric, movement_plane, primary_joints, is_active)
  VALUES ('DB/KB Goblet Lateral Lunge', 'strength', '{"lunge"}'::text[], 'unilateral', 'mixed', 2, '{"dumbbell","kettlebell"}'::text[], 'Adductors', '{"Glutes","Quads","Calves"}'::text[], 'lengthened', 'regional', NULL, NULL, '{"Ankle","Knee","Hip"}'::text[], true)
  ON CONFLICT (name) DO UPDATE SET
    category = EXCLUDED.category,
    movement_patterns = EXCLUDED.movement_patterns,
    bilateral_unilateral = EXCLUDED.bilateral_unilateral,
    posterior_anterior = EXCLUDED.posterior_anterior,
    complexity = EXCLUDED.complexity,
    equipment = EXCLUDED.equipment,
    primary_muscle = EXCLUDED.primary_muscle,
    supporting_muscles = EXCLUDED.supporting_muscles,
    muscle_bias = EXCLUDED.muscle_bias,
    joint_count_level = EXCLUDED.joint_count_level,
    dynamic_isometric = EXCLUDED.dynamic_isometric,
    movement_plane = EXCLUDED.movement_plane,
    primary_joints = EXCLUDED.primary_joints,
    is_active = true,
    updated_at = now();

INSERT INTO exercise_library (name, category, movement_patterns, bilateral_unilateral, posterior_anterior, complexity, equipment, primary_muscle, supporting_muscles, muscle_bias, joint_count_level, dynamic_isometric, movement_plane, primary_joints, is_active)
  VALUES ('Dual DB Suitcase Lateral Lunge', 'strength', '{"lunge"}'::text[], 'unilateral', 'mixed', 2, '{"dumbbell"}'::text[], 'Adductors', '{"Glutes","Quads","Calves"}'::text[], 'lengthened', 'regional', NULL, NULL, '{"Ankle","Knee","Hip"}'::text[], true)
  ON CONFLICT (name) DO UPDATE SET
    category = EXCLUDED.category,
    movement_patterns = EXCLUDED.movement_patterns,
    bilateral_unilateral = EXCLUDED.bilateral_unilateral,
    posterior_anterior = EXCLUDED.posterior_anterior,
    complexity = EXCLUDED.complexity,
    equipment = EXCLUDED.equipment,
    primary_muscle = EXCLUDED.primary_muscle,
    supporting_muscles = EXCLUDED.supporting_muscles,
    muscle_bias = EXCLUDED.muscle_bias,
    joint_count_level = EXCLUDED.joint_count_level,
    dynamic_isometric = EXCLUDED.dynamic_isometric,
    movement_plane = EXCLUDED.movement_plane,
    primary_joints = EXCLUDED.primary_joints,
    is_active = true,
    updated_at = now();

INSERT INTO exercise_library (name, category, movement_patterns, bilateral_unilateral, posterior_anterior, complexity, equipment, primary_muscle, supporting_muscles, muscle_bias, joint_count_level, dynamic_isometric, movement_plane, primary_joints, is_active)
  VALUES ('Dual DB Front Rack Lateral Lunge', 'strength', '{"lunge"}'::text[], 'unilateral', 'mixed', 3, '{"dumbbell"}'::text[], 'Adductors', '{"Glutes","Quads","Calves"}'::text[], 'lengthened', 'regional', NULL, NULL, '{"Ankle","Knee","Hip"}'::text[], true)
  ON CONFLICT (name) DO UPDATE SET
    category = EXCLUDED.category,
    movement_patterns = EXCLUDED.movement_patterns,
    bilateral_unilateral = EXCLUDED.bilateral_unilateral,
    posterior_anterior = EXCLUDED.posterior_anterior,
    complexity = EXCLUDED.complexity,
    equipment = EXCLUDED.equipment,
    primary_muscle = EXCLUDED.primary_muscle,
    supporting_muscles = EXCLUDED.supporting_muscles,
    muscle_bias = EXCLUDED.muscle_bias,
    joint_count_level = EXCLUDED.joint_count_level,
    dynamic_isometric = EXCLUDED.dynamic_isometric,
    movement_plane = EXCLUDED.movement_plane,
    primary_joints = EXCLUDED.primary_joints,
    is_active = true,
    updated_at = now();

INSERT INTO exercise_library (name, category, movement_patterns, bilateral_unilateral, posterior_anterior, complexity, equipment, primary_muscle, supporting_muscles, muscle_bias, joint_count_level, dynamic_isometric, movement_plane, primary_joints, is_active)
  VALUES ('Barbell Front Rack Lateral Lunge', 'strength', '{"lunge"}'::text[], 'unilateral', 'mixed', 3, '{"barbell"}'::text[], 'Adductors', '{"Glutes","Quads","Calves"}'::text[], 'lengthened', 'regional', NULL, NULL, '{"Ankle","Knee","Hip"}'::text[], true)
  ON CONFLICT (name) DO UPDATE SET
    category = EXCLUDED.category,
    movement_patterns = EXCLUDED.movement_patterns,
    bilateral_unilateral = EXCLUDED.bilateral_unilateral,
    posterior_anterior = EXCLUDED.posterior_anterior,
    complexity = EXCLUDED.complexity,
    equipment = EXCLUDED.equipment,
    primary_muscle = EXCLUDED.primary_muscle,
    supporting_muscles = EXCLUDED.supporting_muscles,
    muscle_bias = EXCLUDED.muscle_bias,
    joint_count_level = EXCLUDED.joint_count_level,
    dynamic_isometric = EXCLUDED.dynamic_isometric,
    movement_plane = EXCLUDED.movement_plane,
    primary_joints = EXCLUDED.primary_joints,
    is_active = true,
    updated_at = now();

INSERT INTO exercise_library (name, category, movement_patterns, bilateral_unilateral, posterior_anterior, complexity, equipment, primary_muscle, supporting_muscles, muscle_bias, joint_count_level, dynamic_isometric, movement_plane, primary_joints, is_active)
  VALUES ('Barbell Back Rack Lateral Lunge', 'strength', '{"lunge"}'::text[], 'unilateral', 'mixed', 3, '{"barbell"}'::text[], 'Adductors', '{"Glutes","Quads","Calves"}'::text[], 'lengthened', 'regional', NULL, NULL, '{"Ankle","Knee","Hip"}'::text[], true)
  ON CONFLICT (name) DO UPDATE SET
    category = EXCLUDED.category,
    movement_patterns = EXCLUDED.movement_patterns,
    bilateral_unilateral = EXCLUDED.bilateral_unilateral,
    posterior_anterior = EXCLUDED.posterior_anterior,
    complexity = EXCLUDED.complexity,
    equipment = EXCLUDED.equipment,
    primary_muscle = EXCLUDED.primary_muscle,
    supporting_muscles = EXCLUDED.supporting_muscles,
    muscle_bias = EXCLUDED.muscle_bias,
    joint_count_level = EXCLUDED.joint_count_level,
    dynamic_isometric = EXCLUDED.dynamic_isometric,
    movement_plane = EXCLUDED.movement_plane,
    primary_joints = EXCLUDED.primary_joints,
    is_active = true,
    updated_at = now();

INSERT INTO exercise_library (name, category, movement_patterns, bilateral_unilateral, posterior_anterior, complexity, equipment, primary_muscle, supporting_muscles, muscle_bias, joint_count_level, dynamic_isometric, movement_plane, primary_joints, is_active)
  VALUES ('Cossack Squat', 'strength', '{"lunge"}'::text[], 'bilateral', 'mixed', 3, '{"bodyweight"}'::text[], 'Adductors', '{"Glutes","Quads","Calves"}'::text[], 'lengthened', 'regional', NULL, NULL, '{"Ankle","Knee","Hip"}'::text[], true)
  ON CONFLICT (name) DO UPDATE SET
    category = EXCLUDED.category,
    movement_patterns = EXCLUDED.movement_patterns,
    bilateral_unilateral = EXCLUDED.bilateral_unilateral,
    posterior_anterior = EXCLUDED.posterior_anterior,
    complexity = EXCLUDED.complexity,
    equipment = EXCLUDED.equipment,
    primary_muscle = EXCLUDED.primary_muscle,
    supporting_muscles = EXCLUDED.supporting_muscles,
    muscle_bias = EXCLUDED.muscle_bias,
    joint_count_level = EXCLUDED.joint_count_level,
    dynamic_isometric = EXCLUDED.dynamic_isometric,
    movement_plane = EXCLUDED.movement_plane,
    primary_joints = EXCLUDED.primary_joints,
    is_active = true,
    updated_at = now();

INSERT INTO exercise_library (name, category, movement_patterns, bilateral_unilateral, posterior_anterior, complexity, equipment, primary_muscle, supporting_muscles, muscle_bias, joint_count_level, dynamic_isometric, movement_plane, primary_joints, is_active)
  VALUES ('DB/KB Goblet Cossack Squat', 'strength', '{"lunge"}'::text[], 'bilateral', 'mixed', 3, '{"dumbbell","kettlebell"}'::text[], 'Adductors', '{"Glutes","Quads","Calves"}'::text[], 'lengthened', 'regional', NULL, NULL, '{"Ankle","Knee","Hip"}'::text[], true)
  ON CONFLICT (name) DO UPDATE SET
    category = EXCLUDED.category,
    movement_patterns = EXCLUDED.movement_patterns,
    bilateral_unilateral = EXCLUDED.bilateral_unilateral,
    posterior_anterior = EXCLUDED.posterior_anterior,
    complexity = EXCLUDED.complexity,
    equipment = EXCLUDED.equipment,
    primary_muscle = EXCLUDED.primary_muscle,
    supporting_muscles = EXCLUDED.supporting_muscles,
    muscle_bias = EXCLUDED.muscle_bias,
    joint_count_level = EXCLUDED.joint_count_level,
    dynamic_isometric = EXCLUDED.dynamic_isometric,
    movement_plane = EXCLUDED.movement_plane,
    primary_joints = EXCLUDED.primary_joints,
    is_active = true,
    updated_at = now();

INSERT INTO exercise_library (name, category, movement_patterns, bilateral_unilateral, posterior_anterior, complexity, equipment, primary_muscle, supporting_muscles, muscle_bias, joint_count_level, dynamic_isometric, movement_plane, primary_joints, is_active)
  VALUES ('Dual DB Suitcase Cossack Squat', 'strength', '{"lunge"}'::text[], 'bilateral', 'mixed', 3, '{"dumbbell"}'::text[], 'Adductors', '{"Glutes","Quads","Calves"}'::text[], 'lengthened', 'regional', NULL, NULL, '{"Ankle","Knee","Hip"}'::text[], true)
  ON CONFLICT (name) DO UPDATE SET
    category = EXCLUDED.category,
    movement_patterns = EXCLUDED.movement_patterns,
    bilateral_unilateral = EXCLUDED.bilateral_unilateral,
    posterior_anterior = EXCLUDED.posterior_anterior,
    complexity = EXCLUDED.complexity,
    equipment = EXCLUDED.equipment,
    primary_muscle = EXCLUDED.primary_muscle,
    supporting_muscles = EXCLUDED.supporting_muscles,
    muscle_bias = EXCLUDED.muscle_bias,
    joint_count_level = EXCLUDED.joint_count_level,
    dynamic_isometric = EXCLUDED.dynamic_isometric,
    movement_plane = EXCLUDED.movement_plane,
    primary_joints = EXCLUDED.primary_joints,
    is_active = true,
    updated_at = now();

INSERT INTO exercise_library (name, category, movement_patterns, bilateral_unilateral, posterior_anterior, complexity, equipment, primary_muscle, supporting_muscles, muscle_bias, joint_count_level, dynamic_isometric, movement_plane, primary_joints, is_active)
  VALUES ('DB/KB Goblet Forward Box Step-up (no momentum)', 'strength', '{"step_up"}'::text[], 'unilateral', 'anterior', 2, '{"dumbbell","plyo_box"}'::text[], 'Quads', '{"Glutes","Calves"}'::text[], 'mid', 'regional', NULL, NULL, '{"Ankle","Knee","Hip"}'::text[], true)
  ON CONFLICT (name) DO UPDATE SET
    category = EXCLUDED.category,
    movement_patterns = EXCLUDED.movement_patterns,
    bilateral_unilateral = EXCLUDED.bilateral_unilateral,
    posterior_anterior = EXCLUDED.posterior_anterior,
    complexity = EXCLUDED.complexity,
    equipment = EXCLUDED.equipment,
    primary_muscle = EXCLUDED.primary_muscle,
    supporting_muscles = EXCLUDED.supporting_muscles,
    muscle_bias = EXCLUDED.muscle_bias,
    joint_count_level = EXCLUDED.joint_count_level,
    dynamic_isometric = EXCLUDED.dynamic_isometric,
    movement_plane = EXCLUDED.movement_plane,
    primary_joints = EXCLUDED.primary_joints,
    is_active = true,
    updated_at = now();

INSERT INTO exercise_library (name, category, movement_patterns, bilateral_unilateral, posterior_anterior, complexity, equipment, primary_muscle, supporting_muscles, muscle_bias, joint_count_level, dynamic_isometric, movement_plane, primary_joints, is_active)
  VALUES ('DB/KB Goblet Alt Forward Box Step-up (no momentum)', 'strength', '{"step_up"}'::text[], 'unilateral', 'anterior', 2, '{"dumbbell","plyo_box"}'::text[], 'Quads', '{"Glutes","Calves"}'::text[], 'mid', 'global', NULL, NULL, '{"Ankle","Knee","Hip"}'::text[], true)
  ON CONFLICT (name) DO UPDATE SET
    category = EXCLUDED.category,
    movement_patterns = EXCLUDED.movement_patterns,
    bilateral_unilateral = EXCLUDED.bilateral_unilateral,
    posterior_anterior = EXCLUDED.posterior_anterior,
    complexity = EXCLUDED.complexity,
    equipment = EXCLUDED.equipment,
    primary_muscle = EXCLUDED.primary_muscle,
    supporting_muscles = EXCLUDED.supporting_muscles,
    muscle_bias = EXCLUDED.muscle_bias,
    joint_count_level = EXCLUDED.joint_count_level,
    dynamic_isometric = EXCLUDED.dynamic_isometric,
    movement_plane = EXCLUDED.movement_plane,
    primary_joints = EXCLUDED.primary_joints,
    is_active = true,
    updated_at = now();

INSERT INTO exercise_library (name, category, movement_patterns, bilateral_unilateral, posterior_anterior, complexity, equipment, primary_muscle, supporting_muscles, muscle_bias, joint_count_level, dynamic_isometric, movement_plane, primary_joints, is_active)
  VALUES ('DB/KB Goblet Forward Box Step-up (with momentum)', 'strength', '{"step_up"}'::text[], 'unilateral', 'anterior', 2, '{"dumbbell","plyo_box"}'::text[], 'Quads', '{"Glutes","Calves"}'::text[], 'mid', 'global', NULL, NULL, '{"Ankle","Knee","Hip"}'::text[], true)
  ON CONFLICT (name) DO UPDATE SET
    category = EXCLUDED.category,
    movement_patterns = EXCLUDED.movement_patterns,
    bilateral_unilateral = EXCLUDED.bilateral_unilateral,
    posterior_anterior = EXCLUDED.posterior_anterior,
    complexity = EXCLUDED.complexity,
    equipment = EXCLUDED.equipment,
    primary_muscle = EXCLUDED.primary_muscle,
    supporting_muscles = EXCLUDED.supporting_muscles,
    muscle_bias = EXCLUDED.muscle_bias,
    joint_count_level = EXCLUDED.joint_count_level,
    dynamic_isometric = EXCLUDED.dynamic_isometric,
    movement_plane = EXCLUDED.movement_plane,
    primary_joints = EXCLUDED.primary_joints,
    is_active = true,
    updated_at = now();

INSERT INTO exercise_library (name, category, movement_patterns, bilateral_unilateral, posterior_anterior, complexity, equipment, primary_muscle, supporting_muscles, muscle_bias, joint_count_level, dynamic_isometric, movement_plane, primary_joints, is_active)
  VALUES ('DB/KB Goblet Alt Forward Box Step-up (with momentum)', 'strength', '{"step_up"}'::text[], 'unilateral', 'anterior', 2, '{"dumbbell","plyo_box"}'::text[], 'Quads', '{"Glutes","Calves"}'::text[], 'mid', 'global', NULL, NULL, '{"Ankle","Knee","Hip"}'::text[], true)
  ON CONFLICT (name) DO UPDATE SET
    category = EXCLUDED.category,
    movement_patterns = EXCLUDED.movement_patterns,
    bilateral_unilateral = EXCLUDED.bilateral_unilateral,
    posterior_anterior = EXCLUDED.posterior_anterior,
    complexity = EXCLUDED.complexity,
    equipment = EXCLUDED.equipment,
    primary_muscle = EXCLUDED.primary_muscle,
    supporting_muscles = EXCLUDED.supporting_muscles,
    muscle_bias = EXCLUDED.muscle_bias,
    joint_count_level = EXCLUDED.joint_count_level,
    dynamic_isometric = EXCLUDED.dynamic_isometric,
    movement_plane = EXCLUDED.movement_plane,
    primary_joints = EXCLUDED.primary_joints,
    is_active = true,
    updated_at = now();

INSERT INTO exercise_library (name, category, movement_patterns, bilateral_unilateral, posterior_anterior, complexity, equipment, primary_muscle, supporting_muscles, muscle_bias, joint_count_level, dynamic_isometric, movement_plane, primary_joints, is_active)
  VALUES ('DB/KB Goblet Reverse Lunge to Forward Box Step-up', 'strength', '{"step_up"}'::text[], 'unilateral', 'anterior', 2, '{"dumbbell","plyo_box"}'::text[], 'Quads', '{"Glutes","Calves"}'::text[], 'mid', 'global', NULL, NULL, '{"Ankle","Knee","Hip"}'::text[], true)
  ON CONFLICT (name) DO UPDATE SET
    category = EXCLUDED.category,
    movement_patterns = EXCLUDED.movement_patterns,
    bilateral_unilateral = EXCLUDED.bilateral_unilateral,
    posterior_anterior = EXCLUDED.posterior_anterior,
    complexity = EXCLUDED.complexity,
    equipment = EXCLUDED.equipment,
    primary_muscle = EXCLUDED.primary_muscle,
    supporting_muscles = EXCLUDED.supporting_muscles,
    muscle_bias = EXCLUDED.muscle_bias,
    joint_count_level = EXCLUDED.joint_count_level,
    dynamic_isometric = EXCLUDED.dynamic_isometric,
    movement_plane = EXCLUDED.movement_plane,
    primary_joints = EXCLUDED.primary_joints,
    is_active = true,
    updated_at = now();

INSERT INTO exercise_library (name, category, movement_patterns, bilateral_unilateral, posterior_anterior, complexity, equipment, primary_muscle, supporting_muscles, muscle_bias, joint_count_level, dynamic_isometric, movement_plane, primary_joints, is_active)
  VALUES ('DB/KB Goblet Box Step-down', 'strength', '{"step_up"}'::text[], 'unilateral', 'mixed', 2, '{"dumbbell","plyo_box"}'::text[], 'Quads', '{"Glutes","Calves"}'::text[], 'lengthened', 'regional', NULL, NULL, '{"Ankle","Knee","Hip"}'::text[], true)
  ON CONFLICT (name) DO UPDATE SET
    category = EXCLUDED.category,
    movement_patterns = EXCLUDED.movement_patterns,
    bilateral_unilateral = EXCLUDED.bilateral_unilateral,
    posterior_anterior = EXCLUDED.posterior_anterior,
    complexity = EXCLUDED.complexity,
    equipment = EXCLUDED.equipment,
    primary_muscle = EXCLUDED.primary_muscle,
    supporting_muscles = EXCLUDED.supporting_muscles,
    muscle_bias = EXCLUDED.muscle_bias,
    joint_count_level = EXCLUDED.joint_count_level,
    dynamic_isometric = EXCLUDED.dynamic_isometric,
    movement_plane = EXCLUDED.movement_plane,
    primary_joints = EXCLUDED.primary_joints,
    is_active = true,
    updated_at = now();

INSERT INTO exercise_library (name, category, movement_patterns, bilateral_unilateral, posterior_anterior, complexity, equipment, primary_muscle, supporting_muscles, muscle_bias, joint_count_level, dynamic_isometric, movement_plane, primary_joints, is_active)
  VALUES ('DB/KB Goblet Crossover Step-up', 'strength', '{"step_up"}'::text[], 'unilateral', 'mixed', 2, '{"dumbbell","plyo_box"}'::text[], 'Glutes', '{"Quads","Adductors","Calves"}'::text[], 'mid', 'regional', NULL, NULL, '{"Ankle","Knee","Hip"}'::text[], true)
  ON CONFLICT (name) DO UPDATE SET
    category = EXCLUDED.category,
    movement_patterns = EXCLUDED.movement_patterns,
    bilateral_unilateral = EXCLUDED.bilateral_unilateral,
    posterior_anterior = EXCLUDED.posterior_anterior,
    complexity = EXCLUDED.complexity,
    equipment = EXCLUDED.equipment,
    primary_muscle = EXCLUDED.primary_muscle,
    supporting_muscles = EXCLUDED.supporting_muscles,
    muscle_bias = EXCLUDED.muscle_bias,
    joint_count_level = EXCLUDED.joint_count_level,
    dynamic_isometric = EXCLUDED.dynamic_isometric,
    movement_plane = EXCLUDED.movement_plane,
    primary_joints = EXCLUDED.primary_joints,
    is_active = true,
    updated_at = now();

INSERT INTO exercise_library (name, category, movement_patterns, bilateral_unilateral, posterior_anterior, complexity, equipment, primary_muscle, supporting_muscles, muscle_bias, joint_count_level, dynamic_isometric, movement_plane, primary_joints, is_active)
  VALUES ('DB/KB Goblet Side Step-up', 'strength', '{"step_up"}'::text[], 'unilateral', 'mixed', 2, '{"dumbbell","plyo_box"}'::text[], 'Glutes', '{"Quads","Adductors","Calves"}'::text[], 'mid', 'regional', NULL, NULL, '{"Ankle","Knee","Hip"}'::text[], true)
  ON CONFLICT (name) DO UPDATE SET
    category = EXCLUDED.category,
    movement_patterns = EXCLUDED.movement_patterns,
    bilateral_unilateral = EXCLUDED.bilateral_unilateral,
    posterior_anterior = EXCLUDED.posterior_anterior,
    complexity = EXCLUDED.complexity,
    equipment = EXCLUDED.equipment,
    primary_muscle = EXCLUDED.primary_muscle,
    supporting_muscles = EXCLUDED.supporting_muscles,
    muscle_bias = EXCLUDED.muscle_bias,
    joint_count_level = EXCLUDED.joint_count_level,
    dynamic_isometric = EXCLUDED.dynamic_isometric,
    movement_plane = EXCLUDED.movement_plane,
    primary_joints = EXCLUDED.primary_joints,
    is_active = true,
    updated_at = now();

INSERT INTO exercise_library (name, category, movement_patterns, bilateral_unilateral, posterior_anterior, complexity, equipment, primary_muscle, supporting_muscles, muscle_bias, joint_count_level, dynamic_isometric, movement_plane, primary_joints, is_active)
  VALUES ('Dual DB Suitcase Forward Box Step-up (no momentum)', 'strength', '{"step_up"}'::text[], 'unilateral', 'anterior', 2, '{"dumbbell","plyo_box"}'::text[], 'Quads', '{"Glutes","Calves"}'::text[], 'mid', 'regional', NULL, NULL, '{"Ankle","Knee","Hip"}'::text[], true)
  ON CONFLICT (name) DO UPDATE SET
    category = EXCLUDED.category,
    movement_patterns = EXCLUDED.movement_patterns,
    bilateral_unilateral = EXCLUDED.bilateral_unilateral,
    posterior_anterior = EXCLUDED.posterior_anterior,
    complexity = EXCLUDED.complexity,
    equipment = EXCLUDED.equipment,
    primary_muscle = EXCLUDED.primary_muscle,
    supporting_muscles = EXCLUDED.supporting_muscles,
    muscle_bias = EXCLUDED.muscle_bias,
    joint_count_level = EXCLUDED.joint_count_level,
    dynamic_isometric = EXCLUDED.dynamic_isometric,
    movement_plane = EXCLUDED.movement_plane,
    primary_joints = EXCLUDED.primary_joints,
    is_active = true,
    updated_at = now();

INSERT INTO exercise_library (name, category, movement_patterns, bilateral_unilateral, posterior_anterior, complexity, equipment, primary_muscle, supporting_muscles, muscle_bias, joint_count_level, dynamic_isometric, movement_plane, primary_joints, is_active)
  VALUES ('Dual DB Suitcase Alt Forward Box Step-up (no momentum)', 'strength', '{"step_up"}'::text[], 'unilateral', 'anterior', 2, '{"dumbbell","plyo_box"}'::text[], 'Quads', '{"Glutes","Calves"}'::text[], 'mid', 'global', NULL, NULL, '{"Ankle","Knee","Hip"}'::text[], true)
  ON CONFLICT (name) DO UPDATE SET
    category = EXCLUDED.category,
    movement_patterns = EXCLUDED.movement_patterns,
    bilateral_unilateral = EXCLUDED.bilateral_unilateral,
    posterior_anterior = EXCLUDED.posterior_anterior,
    complexity = EXCLUDED.complexity,
    equipment = EXCLUDED.equipment,
    primary_muscle = EXCLUDED.primary_muscle,
    supporting_muscles = EXCLUDED.supporting_muscles,
    muscle_bias = EXCLUDED.muscle_bias,
    joint_count_level = EXCLUDED.joint_count_level,
    dynamic_isometric = EXCLUDED.dynamic_isometric,
    movement_plane = EXCLUDED.movement_plane,
    primary_joints = EXCLUDED.primary_joints,
    is_active = true,
    updated_at = now();

INSERT INTO exercise_library (name, category, movement_patterns, bilateral_unilateral, posterior_anterior, complexity, equipment, primary_muscle, supporting_muscles, muscle_bias, joint_count_level, dynamic_isometric, movement_plane, primary_joints, is_active)
  VALUES ('Dual DB Suitcase Forward Box Step-up (with momentum)', 'strength', '{"step_up"}'::text[], 'unilateral', 'anterior', 2, '{"dumbbell","plyo_box"}'::text[], 'Quads', '{"Glutes","Calves"}'::text[], 'mid', 'global', NULL, NULL, '{"Ankle","Knee","Hip"}'::text[], true)
  ON CONFLICT (name) DO UPDATE SET
    category = EXCLUDED.category,
    movement_patterns = EXCLUDED.movement_patterns,
    bilateral_unilateral = EXCLUDED.bilateral_unilateral,
    posterior_anterior = EXCLUDED.posterior_anterior,
    complexity = EXCLUDED.complexity,
    equipment = EXCLUDED.equipment,
    primary_muscle = EXCLUDED.primary_muscle,
    supporting_muscles = EXCLUDED.supporting_muscles,
    muscle_bias = EXCLUDED.muscle_bias,
    joint_count_level = EXCLUDED.joint_count_level,
    dynamic_isometric = EXCLUDED.dynamic_isometric,
    movement_plane = EXCLUDED.movement_plane,
    primary_joints = EXCLUDED.primary_joints,
    is_active = true,
    updated_at = now();

INSERT INTO exercise_library (name, category, movement_patterns, bilateral_unilateral, posterior_anterior, complexity, equipment, primary_muscle, supporting_muscles, muscle_bias, joint_count_level, dynamic_isometric, movement_plane, primary_joints, is_active)
  VALUES ('Dual DB Suitcase Alt Forward Box Step-up (with momentum)', 'strength', '{"step_up"}'::text[], 'unilateral', 'anterior', 2, '{"dumbbell","plyo_box"}'::text[], 'Quads', '{"Glutes","Calves"}'::text[], 'mid', 'global', NULL, NULL, '{"Ankle","Knee","Hip"}'::text[], true)
  ON CONFLICT (name) DO UPDATE SET
    category = EXCLUDED.category,
    movement_patterns = EXCLUDED.movement_patterns,
    bilateral_unilateral = EXCLUDED.bilateral_unilateral,
    posterior_anterior = EXCLUDED.posterior_anterior,
    complexity = EXCLUDED.complexity,
    equipment = EXCLUDED.equipment,
    primary_muscle = EXCLUDED.primary_muscle,
    supporting_muscles = EXCLUDED.supporting_muscles,
    muscle_bias = EXCLUDED.muscle_bias,
    joint_count_level = EXCLUDED.joint_count_level,
    dynamic_isometric = EXCLUDED.dynamic_isometric,
    movement_plane = EXCLUDED.movement_plane,
    primary_joints = EXCLUDED.primary_joints,
    is_active = true,
    updated_at = now();

INSERT INTO exercise_library (name, category, movement_patterns, bilateral_unilateral, posterior_anterior, complexity, equipment, primary_muscle, supporting_muscles, muscle_bias, joint_count_level, dynamic_isometric, movement_plane, primary_joints, is_active)
  VALUES ('Dual DB Suitcase Reverse Lunge to Forward Box Step-up', 'strength', '{"step_up"}'::text[], 'unilateral', 'anterior', 2, '{"dumbbell","plyo_box"}'::text[], 'Quads', '{"Glutes","Calves"}'::text[], 'mid', 'global', NULL, NULL, '{"Ankle","Knee","Hip"}'::text[], true)
  ON CONFLICT (name) DO UPDATE SET
    category = EXCLUDED.category,
    movement_patterns = EXCLUDED.movement_patterns,
    bilateral_unilateral = EXCLUDED.bilateral_unilateral,
    posterior_anterior = EXCLUDED.posterior_anterior,
    complexity = EXCLUDED.complexity,
    equipment = EXCLUDED.equipment,
    primary_muscle = EXCLUDED.primary_muscle,
    supporting_muscles = EXCLUDED.supporting_muscles,
    muscle_bias = EXCLUDED.muscle_bias,
    joint_count_level = EXCLUDED.joint_count_level,
    dynamic_isometric = EXCLUDED.dynamic_isometric,
    movement_plane = EXCLUDED.movement_plane,
    primary_joints = EXCLUDED.primary_joints,
    is_active = true,
    updated_at = now();

INSERT INTO exercise_library (name, category, movement_patterns, bilateral_unilateral, posterior_anterior, complexity, equipment, primary_muscle, supporting_muscles, muscle_bias, joint_count_level, dynamic_isometric, movement_plane, primary_joints, is_active)
  VALUES ('Dual DB Suitcase Box Step-down', 'strength', '{"step_up"}'::text[], 'unilateral', 'mixed', 2, '{"dumbbell","plyo_box"}'::text[], 'Quads', '{"Glutes","Calves"}'::text[], 'lengthened', 'regional', NULL, NULL, '{"Ankle","Knee","Hip"}'::text[], true)
  ON CONFLICT (name) DO UPDATE SET
    category = EXCLUDED.category,
    movement_patterns = EXCLUDED.movement_patterns,
    bilateral_unilateral = EXCLUDED.bilateral_unilateral,
    posterior_anterior = EXCLUDED.posterior_anterior,
    complexity = EXCLUDED.complexity,
    equipment = EXCLUDED.equipment,
    primary_muscle = EXCLUDED.primary_muscle,
    supporting_muscles = EXCLUDED.supporting_muscles,
    muscle_bias = EXCLUDED.muscle_bias,
    joint_count_level = EXCLUDED.joint_count_level,
    dynamic_isometric = EXCLUDED.dynamic_isometric,
    movement_plane = EXCLUDED.movement_plane,
    primary_joints = EXCLUDED.primary_joints,
    is_active = true,
    updated_at = now();

INSERT INTO exercise_library (name, category, movement_patterns, bilateral_unilateral, posterior_anterior, complexity, equipment, primary_muscle, supporting_muscles, muscle_bias, joint_count_level, dynamic_isometric, movement_plane, primary_joints, is_active)
  VALUES ('Dual DB Suitcase Crossover Step-up', 'strength', '{"step_up"}'::text[], 'unilateral', 'mixed', 2, '{"dumbbell","plyo_box"}'::text[], 'Glutes', '{"Quads","Adductors","Calves"}'::text[], 'mid', 'regional', NULL, NULL, '{"Ankle","Knee","Hip"}'::text[], true)
  ON CONFLICT (name) DO UPDATE SET
    category = EXCLUDED.category,
    movement_patterns = EXCLUDED.movement_patterns,
    bilateral_unilateral = EXCLUDED.bilateral_unilateral,
    posterior_anterior = EXCLUDED.posterior_anterior,
    complexity = EXCLUDED.complexity,
    equipment = EXCLUDED.equipment,
    primary_muscle = EXCLUDED.primary_muscle,
    supporting_muscles = EXCLUDED.supporting_muscles,
    muscle_bias = EXCLUDED.muscle_bias,
    joint_count_level = EXCLUDED.joint_count_level,
    dynamic_isometric = EXCLUDED.dynamic_isometric,
    movement_plane = EXCLUDED.movement_plane,
    primary_joints = EXCLUDED.primary_joints,
    is_active = true,
    updated_at = now();

INSERT INTO exercise_library (name, category, movement_patterns, bilateral_unilateral, posterior_anterior, complexity, equipment, primary_muscle, supporting_muscles, muscle_bias, joint_count_level, dynamic_isometric, movement_plane, primary_joints, is_active)
  VALUES ('Dual DB Suitcase Side Step-up', 'strength', '{"step_up"}'::text[], 'unilateral', 'mixed', 2, '{"dumbbell","plyo_box"}'::text[], 'Glutes', '{"Quads","Adductors","Calves"}'::text[], 'mid', 'regional', NULL, NULL, '{"Ankle","Knee","Hip"}'::text[], true)
  ON CONFLICT (name) DO UPDATE SET
    category = EXCLUDED.category,
    movement_patterns = EXCLUDED.movement_patterns,
    bilateral_unilateral = EXCLUDED.bilateral_unilateral,
    posterior_anterior = EXCLUDED.posterior_anterior,
    complexity = EXCLUDED.complexity,
    equipment = EXCLUDED.equipment,
    primary_muscle = EXCLUDED.primary_muscle,
    supporting_muscles = EXCLUDED.supporting_muscles,
    muscle_bias = EXCLUDED.muscle_bias,
    joint_count_level = EXCLUDED.joint_count_level,
    dynamic_isometric = EXCLUDED.dynamic_isometric,
    movement_plane = EXCLUDED.movement_plane,
    primary_joints = EXCLUDED.primary_joints,
    is_active = true,
    updated_at = now();

INSERT INTO exercise_library (name, category, movement_patterns, bilateral_unilateral, posterior_anterior, complexity, equipment, primary_muscle, supporting_muscles, muscle_bias, joint_count_level, dynamic_isometric, movement_plane, primary_joints, is_active)
  VALUES ('Dual DB Front Rack Forward Box Step-up (no momentum)', 'strength', '{"step_up"}'::text[], 'unilateral', 'anterior', 3, '{"dumbbell","plyo_box"}'::text[], 'Quads', '{"Glutes","Calves"}'::text[], 'mid', 'regional', NULL, NULL, '{"Ankle","Knee","Hip"}'::text[], true)
  ON CONFLICT (name) DO UPDATE SET
    category = EXCLUDED.category,
    movement_patterns = EXCLUDED.movement_patterns,
    bilateral_unilateral = EXCLUDED.bilateral_unilateral,
    posterior_anterior = EXCLUDED.posterior_anterior,
    complexity = EXCLUDED.complexity,
    equipment = EXCLUDED.equipment,
    primary_muscle = EXCLUDED.primary_muscle,
    supporting_muscles = EXCLUDED.supporting_muscles,
    muscle_bias = EXCLUDED.muscle_bias,
    joint_count_level = EXCLUDED.joint_count_level,
    dynamic_isometric = EXCLUDED.dynamic_isometric,
    movement_plane = EXCLUDED.movement_plane,
    primary_joints = EXCLUDED.primary_joints,
    is_active = true,
    updated_at = now();

INSERT INTO exercise_library (name, category, movement_patterns, bilateral_unilateral, posterior_anterior, complexity, equipment, primary_muscle, supporting_muscles, muscle_bias, joint_count_level, dynamic_isometric, movement_plane, primary_joints, is_active)
  VALUES ('Dual DB Front Rack Alt Forward Box Step-up (no momentum)', 'strength', '{"step_up"}'::text[], 'unilateral', 'anterior', 3, '{"dumbbell","plyo_box"}'::text[], 'Quads', '{"Glutes","Calves"}'::text[], 'mid', 'global', NULL, NULL, '{"Ankle","Knee","Hip"}'::text[], true)
  ON CONFLICT (name) DO UPDATE SET
    category = EXCLUDED.category,
    movement_patterns = EXCLUDED.movement_patterns,
    bilateral_unilateral = EXCLUDED.bilateral_unilateral,
    posterior_anterior = EXCLUDED.posterior_anterior,
    complexity = EXCLUDED.complexity,
    equipment = EXCLUDED.equipment,
    primary_muscle = EXCLUDED.primary_muscle,
    supporting_muscles = EXCLUDED.supporting_muscles,
    muscle_bias = EXCLUDED.muscle_bias,
    joint_count_level = EXCLUDED.joint_count_level,
    dynamic_isometric = EXCLUDED.dynamic_isometric,
    movement_plane = EXCLUDED.movement_plane,
    primary_joints = EXCLUDED.primary_joints,
    is_active = true,
    updated_at = now();

INSERT INTO exercise_library (name, category, movement_patterns, bilateral_unilateral, posterior_anterior, complexity, equipment, primary_muscle, supporting_muscles, muscle_bias, joint_count_level, dynamic_isometric, movement_plane, primary_joints, is_active)
  VALUES ('Dual DB Front Rack Forward Box Step-up (with momentum)', 'strength', '{"step_up"}'::text[], 'unilateral', 'anterior', 3, '{"dumbbell","plyo_box"}'::text[], 'Quads', '{"Glutes","Calves"}'::text[], 'mid', 'global', NULL, NULL, '{"Ankle","Knee","Hip"}'::text[], true)
  ON CONFLICT (name) DO UPDATE SET
    category = EXCLUDED.category,
    movement_patterns = EXCLUDED.movement_patterns,
    bilateral_unilateral = EXCLUDED.bilateral_unilateral,
    posterior_anterior = EXCLUDED.posterior_anterior,
    complexity = EXCLUDED.complexity,
    equipment = EXCLUDED.equipment,
    primary_muscle = EXCLUDED.primary_muscle,
    supporting_muscles = EXCLUDED.supporting_muscles,
    muscle_bias = EXCLUDED.muscle_bias,
    joint_count_level = EXCLUDED.joint_count_level,
    dynamic_isometric = EXCLUDED.dynamic_isometric,
    movement_plane = EXCLUDED.movement_plane,
    primary_joints = EXCLUDED.primary_joints,
    is_active = true,
    updated_at = now();

INSERT INTO exercise_library (name, category, movement_patterns, bilateral_unilateral, posterior_anterior, complexity, equipment, primary_muscle, supporting_muscles, muscle_bias, joint_count_level, dynamic_isometric, movement_plane, primary_joints, is_active)
  VALUES ('Dual DB Front Rack Alt Forward Box Step-up (with momentum)', 'strength', '{"step_up"}'::text[], 'unilateral', 'anterior', 3, '{"dumbbell","plyo_box"}'::text[], 'Quads', '{"Glutes","Calves"}'::text[], 'mid', 'global', NULL, NULL, '{"Ankle","Knee","Hip"}'::text[], true)
  ON CONFLICT (name) DO UPDATE SET
    category = EXCLUDED.category,
    movement_patterns = EXCLUDED.movement_patterns,
    bilateral_unilateral = EXCLUDED.bilateral_unilateral,
    posterior_anterior = EXCLUDED.posterior_anterior,
    complexity = EXCLUDED.complexity,
    equipment = EXCLUDED.equipment,
    primary_muscle = EXCLUDED.primary_muscle,
    supporting_muscles = EXCLUDED.supporting_muscles,
    muscle_bias = EXCLUDED.muscle_bias,
    joint_count_level = EXCLUDED.joint_count_level,
    dynamic_isometric = EXCLUDED.dynamic_isometric,
    movement_plane = EXCLUDED.movement_plane,
    primary_joints = EXCLUDED.primary_joints,
    is_active = true,
    updated_at = now();

INSERT INTO exercise_library (name, category, movement_patterns, bilateral_unilateral, posterior_anterior, complexity, equipment, primary_muscle, supporting_muscles, muscle_bias, joint_count_level, dynamic_isometric, movement_plane, primary_joints, is_active)
  VALUES ('Dual DB Front Rack Reverse Lunge to Forward Box Step-up', 'strength', '{"step_up"}'::text[], 'unilateral', 'anterior', 3, '{"dumbbell","plyo_box"}'::text[], 'Quads', '{"Glutes","Calves"}'::text[], 'mid', 'global', NULL, NULL, '{"Ankle","Knee","Hip"}'::text[], true)
  ON CONFLICT (name) DO UPDATE SET
    category = EXCLUDED.category,
    movement_patterns = EXCLUDED.movement_patterns,
    bilateral_unilateral = EXCLUDED.bilateral_unilateral,
    posterior_anterior = EXCLUDED.posterior_anterior,
    complexity = EXCLUDED.complexity,
    equipment = EXCLUDED.equipment,
    primary_muscle = EXCLUDED.primary_muscle,
    supporting_muscles = EXCLUDED.supporting_muscles,
    muscle_bias = EXCLUDED.muscle_bias,
    joint_count_level = EXCLUDED.joint_count_level,
    dynamic_isometric = EXCLUDED.dynamic_isometric,
    movement_plane = EXCLUDED.movement_plane,
    primary_joints = EXCLUDED.primary_joints,
    is_active = true,
    updated_at = now();

INSERT INTO exercise_library (name, category, movement_patterns, bilateral_unilateral, posterior_anterior, complexity, equipment, primary_muscle, supporting_muscles, muscle_bias, joint_count_level, dynamic_isometric, movement_plane, primary_joints, is_active)
  VALUES ('Dual DB Front Rack Box Step-down', 'strength', '{"step_up"}'::text[], 'unilateral', 'mixed', 3, '{"dumbbell","plyo_box"}'::text[], 'Quads', '{"Glutes","Calves"}'::text[], 'lengthened', 'regional', NULL, NULL, '{"Ankle","Knee","Hip"}'::text[], true)
  ON CONFLICT (name) DO UPDATE SET
    category = EXCLUDED.category,
    movement_patterns = EXCLUDED.movement_patterns,
    bilateral_unilateral = EXCLUDED.bilateral_unilateral,
    posterior_anterior = EXCLUDED.posterior_anterior,
    complexity = EXCLUDED.complexity,
    equipment = EXCLUDED.equipment,
    primary_muscle = EXCLUDED.primary_muscle,
    supporting_muscles = EXCLUDED.supporting_muscles,
    muscle_bias = EXCLUDED.muscle_bias,
    joint_count_level = EXCLUDED.joint_count_level,
    dynamic_isometric = EXCLUDED.dynamic_isometric,
    movement_plane = EXCLUDED.movement_plane,
    primary_joints = EXCLUDED.primary_joints,
    is_active = true,
    updated_at = now();

INSERT INTO exercise_library (name, category, movement_patterns, bilateral_unilateral, posterior_anterior, complexity, equipment, primary_muscle, supporting_muscles, muscle_bias, joint_count_level, dynamic_isometric, movement_plane, primary_joints, is_active)
  VALUES ('Dual DB Front Rack Crossover Step-up', 'strength', '{"step_up"}'::text[], 'unilateral', 'mixed', 3, '{"dumbbell","plyo_box"}'::text[], 'Glutes', '{"Quads","Adductors","Calves"}'::text[], 'mid', 'regional', NULL, NULL, '{"Ankle","Knee","Hip"}'::text[], true)
  ON CONFLICT (name) DO UPDATE SET
    category = EXCLUDED.category,
    movement_patterns = EXCLUDED.movement_patterns,
    bilateral_unilateral = EXCLUDED.bilateral_unilateral,
    posterior_anterior = EXCLUDED.posterior_anterior,
    complexity = EXCLUDED.complexity,
    equipment = EXCLUDED.equipment,
    primary_muscle = EXCLUDED.primary_muscle,
    supporting_muscles = EXCLUDED.supporting_muscles,
    muscle_bias = EXCLUDED.muscle_bias,
    joint_count_level = EXCLUDED.joint_count_level,
    dynamic_isometric = EXCLUDED.dynamic_isometric,
    movement_plane = EXCLUDED.movement_plane,
    primary_joints = EXCLUDED.primary_joints,
    is_active = true,
    updated_at = now();

INSERT INTO exercise_library (name, category, movement_patterns, bilateral_unilateral, posterior_anterior, complexity, equipment, primary_muscle, supporting_muscles, muscle_bias, joint_count_level, dynamic_isometric, movement_plane, primary_joints, is_active)
  VALUES ('Dual DB Front Rack Side Step-up', 'strength', '{"step_up"}'::text[], 'unilateral', 'mixed', 3, '{"dumbbell","plyo_box"}'::text[], 'Glutes', '{"Quads","Adductors","Calves"}'::text[], 'mid', 'regional', NULL, NULL, '{"Ankle","Knee","Hip"}'::text[], true)
  ON CONFLICT (name) DO UPDATE SET
    category = EXCLUDED.category,
    movement_patterns = EXCLUDED.movement_patterns,
    bilateral_unilateral = EXCLUDED.bilateral_unilateral,
    posterior_anterior = EXCLUDED.posterior_anterior,
    complexity = EXCLUDED.complexity,
    equipment = EXCLUDED.equipment,
    primary_muscle = EXCLUDED.primary_muscle,
    supporting_muscles = EXCLUDED.supporting_muscles,
    muscle_bias = EXCLUDED.muscle_bias,
    joint_count_level = EXCLUDED.joint_count_level,
    dynamic_isometric = EXCLUDED.dynamic_isometric,
    movement_plane = EXCLUDED.movement_plane,
    primary_joints = EXCLUDED.primary_joints,
    is_active = true,
    updated_at = now();

INSERT INTO exercise_library (name, category, movement_patterns, bilateral_unilateral, posterior_anterior, complexity, equipment, primary_muscle, supporting_muscles, muscle_bias, joint_count_level, dynamic_isometric, movement_plane, primary_joints, is_active)
  VALUES ('Barbell Back Rack Forward Box Step-up (no momentum)', 'strength', '{"step_up"}'::text[], 'unilateral', 'anterior', 3, '{"barbell","plyo_box"}'::text[], 'Quads', '{"Glutes","Calves"}'::text[], 'mid', 'regional', NULL, NULL, '{"Ankle","Knee","Hip"}'::text[], true)
  ON CONFLICT (name) DO UPDATE SET
    category = EXCLUDED.category,
    movement_patterns = EXCLUDED.movement_patterns,
    bilateral_unilateral = EXCLUDED.bilateral_unilateral,
    posterior_anterior = EXCLUDED.posterior_anterior,
    complexity = EXCLUDED.complexity,
    equipment = EXCLUDED.equipment,
    primary_muscle = EXCLUDED.primary_muscle,
    supporting_muscles = EXCLUDED.supporting_muscles,
    muscle_bias = EXCLUDED.muscle_bias,
    joint_count_level = EXCLUDED.joint_count_level,
    dynamic_isometric = EXCLUDED.dynamic_isometric,
    movement_plane = EXCLUDED.movement_plane,
    primary_joints = EXCLUDED.primary_joints,
    is_active = true,
    updated_at = now();

INSERT INTO exercise_library (name, category, movement_patterns, bilateral_unilateral, posterior_anterior, complexity, equipment, primary_muscle, supporting_muscles, muscle_bias, joint_count_level, dynamic_isometric, movement_plane, primary_joints, is_active)
  VALUES ('Barbell Back Rack Alt Forward Box Step-up (no momentum)', 'strength', '{"step_up"}'::text[], 'unilateral', 'anterior', 3, '{"barbell","plyo_box"}'::text[], 'Quads', '{"Glutes","Calves"}'::text[], 'mid', 'global', NULL, NULL, '{"Ankle","Knee","Hip"}'::text[], true)
  ON CONFLICT (name) DO UPDATE SET
    category = EXCLUDED.category,
    movement_patterns = EXCLUDED.movement_patterns,
    bilateral_unilateral = EXCLUDED.bilateral_unilateral,
    posterior_anterior = EXCLUDED.posterior_anterior,
    complexity = EXCLUDED.complexity,
    equipment = EXCLUDED.equipment,
    primary_muscle = EXCLUDED.primary_muscle,
    supporting_muscles = EXCLUDED.supporting_muscles,
    muscle_bias = EXCLUDED.muscle_bias,
    joint_count_level = EXCLUDED.joint_count_level,
    dynamic_isometric = EXCLUDED.dynamic_isometric,
    movement_plane = EXCLUDED.movement_plane,
    primary_joints = EXCLUDED.primary_joints,
    is_active = true,
    updated_at = now();

INSERT INTO exercise_library (name, category, movement_patterns, bilateral_unilateral, posterior_anterior, complexity, equipment, primary_muscle, supporting_muscles, muscle_bias, joint_count_level, dynamic_isometric, movement_plane, primary_joints, is_active)
  VALUES ('Barbell Back Rack Forward Box Step-up (with momentum)', 'strength', '{"step_up"}'::text[], 'unilateral', 'anterior', 3, '{"barbell","plyo_box"}'::text[], 'Quads', '{"Glutes","Calves"}'::text[], 'mid', 'global', NULL, NULL, '{"Ankle","Knee","Hip"}'::text[], true)
  ON CONFLICT (name) DO UPDATE SET
    category = EXCLUDED.category,
    movement_patterns = EXCLUDED.movement_patterns,
    bilateral_unilateral = EXCLUDED.bilateral_unilateral,
    posterior_anterior = EXCLUDED.posterior_anterior,
    complexity = EXCLUDED.complexity,
    equipment = EXCLUDED.equipment,
    primary_muscle = EXCLUDED.primary_muscle,
    supporting_muscles = EXCLUDED.supporting_muscles,
    muscle_bias = EXCLUDED.muscle_bias,
    joint_count_level = EXCLUDED.joint_count_level,
    dynamic_isometric = EXCLUDED.dynamic_isometric,
    movement_plane = EXCLUDED.movement_plane,
    primary_joints = EXCLUDED.primary_joints,
    is_active = true,
    updated_at = now();

INSERT INTO exercise_library (name, category, movement_patterns, bilateral_unilateral, posterior_anterior, complexity, equipment, primary_muscle, supporting_muscles, muscle_bias, joint_count_level, dynamic_isometric, movement_plane, primary_joints, is_active)
  VALUES ('Barbell Back Rack Alt Forward Box Step-up (with momentum)', 'strength', '{"step_up"}'::text[], 'unilateral', 'anterior', 3, '{"barbell","plyo_box"}'::text[], 'Quads', '{"Glutes","Calves"}'::text[], 'mid', 'global', NULL, NULL, '{"Ankle","Knee","Hip"}'::text[], true)
  ON CONFLICT (name) DO UPDATE SET
    category = EXCLUDED.category,
    movement_patterns = EXCLUDED.movement_patterns,
    bilateral_unilateral = EXCLUDED.bilateral_unilateral,
    posterior_anterior = EXCLUDED.posterior_anterior,
    complexity = EXCLUDED.complexity,
    equipment = EXCLUDED.equipment,
    primary_muscle = EXCLUDED.primary_muscle,
    supporting_muscles = EXCLUDED.supporting_muscles,
    muscle_bias = EXCLUDED.muscle_bias,
    joint_count_level = EXCLUDED.joint_count_level,
    dynamic_isometric = EXCLUDED.dynamic_isometric,
    movement_plane = EXCLUDED.movement_plane,
    primary_joints = EXCLUDED.primary_joints,
    is_active = true,
    updated_at = now();

INSERT INTO exercise_library (name, category, movement_patterns, bilateral_unilateral, posterior_anterior, complexity, equipment, primary_muscle, supporting_muscles, muscle_bias, joint_count_level, dynamic_isometric, movement_plane, primary_joints, is_active)
  VALUES ('Barbell Back Rack Reverse Lunge to Forward Box Step-up', 'strength', '{"step_up"}'::text[], 'unilateral', 'anterior', 3, '{"barbell","plyo_box"}'::text[], 'Quads', '{"Glutes","Calves"}'::text[], 'mid', 'global', NULL, NULL, '{"Ankle","Knee","Hip"}'::text[], true)
  ON CONFLICT (name) DO UPDATE SET
    category = EXCLUDED.category,
    movement_patterns = EXCLUDED.movement_patterns,
    bilateral_unilateral = EXCLUDED.bilateral_unilateral,
    posterior_anterior = EXCLUDED.posterior_anterior,
    complexity = EXCLUDED.complexity,
    equipment = EXCLUDED.equipment,
    primary_muscle = EXCLUDED.primary_muscle,
    supporting_muscles = EXCLUDED.supporting_muscles,
    muscle_bias = EXCLUDED.muscle_bias,
    joint_count_level = EXCLUDED.joint_count_level,
    dynamic_isometric = EXCLUDED.dynamic_isometric,
    movement_plane = EXCLUDED.movement_plane,
    primary_joints = EXCLUDED.primary_joints,
    is_active = true,
    updated_at = now();

INSERT INTO exercise_library (name, category, movement_patterns, bilateral_unilateral, posterior_anterior, complexity, equipment, primary_muscle, supporting_muscles, muscle_bias, joint_count_level, dynamic_isometric, movement_plane, primary_joints, is_active)
  VALUES ('Barbell Back Rack Box Step-down', 'strength', '{"step_up"}'::text[], 'unilateral', 'mixed', 3, '{"barbell","plyo_box"}'::text[], 'Quads', '{"Glutes","Calves"}'::text[], 'lengthened', 'regional', NULL, NULL, '{"Ankle","Knee","Hip"}'::text[], true)
  ON CONFLICT (name) DO UPDATE SET
    category = EXCLUDED.category,
    movement_patterns = EXCLUDED.movement_patterns,
    bilateral_unilateral = EXCLUDED.bilateral_unilateral,
    posterior_anterior = EXCLUDED.posterior_anterior,
    complexity = EXCLUDED.complexity,
    equipment = EXCLUDED.equipment,
    primary_muscle = EXCLUDED.primary_muscle,
    supporting_muscles = EXCLUDED.supporting_muscles,
    muscle_bias = EXCLUDED.muscle_bias,
    joint_count_level = EXCLUDED.joint_count_level,
    dynamic_isometric = EXCLUDED.dynamic_isometric,
    movement_plane = EXCLUDED.movement_plane,
    primary_joints = EXCLUDED.primary_joints,
    is_active = true,
    updated_at = now();

INSERT INTO exercise_library (name, category, movement_patterns, bilateral_unilateral, posterior_anterior, complexity, equipment, primary_muscle, supporting_muscles, muscle_bias, joint_count_level, dynamic_isometric, movement_plane, primary_joints, is_active)
  VALUES ('Barbell Back Rack Crossover Step-up', 'strength', '{"step_up"}'::text[], 'unilateral', 'mixed', 3, '{"barbell","plyo_box"}'::text[], 'Glutes', '{"Quads","Adductors","Calves"}'::text[], 'mid', 'regional', NULL, NULL, '{"Ankle","Knee","Hip"}'::text[], true)
  ON CONFLICT (name) DO UPDATE SET
    category = EXCLUDED.category,
    movement_patterns = EXCLUDED.movement_patterns,
    bilateral_unilateral = EXCLUDED.bilateral_unilateral,
    posterior_anterior = EXCLUDED.posterior_anterior,
    complexity = EXCLUDED.complexity,
    equipment = EXCLUDED.equipment,
    primary_muscle = EXCLUDED.primary_muscle,
    supporting_muscles = EXCLUDED.supporting_muscles,
    muscle_bias = EXCLUDED.muscle_bias,
    joint_count_level = EXCLUDED.joint_count_level,
    dynamic_isometric = EXCLUDED.dynamic_isometric,
    movement_plane = EXCLUDED.movement_plane,
    primary_joints = EXCLUDED.primary_joints,
    is_active = true,
    updated_at = now();

INSERT INTO exercise_library (name, category, movement_patterns, bilateral_unilateral, posterior_anterior, complexity, equipment, primary_muscle, supporting_muscles, muscle_bias, joint_count_level, dynamic_isometric, movement_plane, primary_joints, is_active)
  VALUES ('Barbell Back Rack Side Step-up', 'strength', '{"step_up"}'::text[], 'unilateral', 'mixed', 3, '{"barbell","plyo_box"}'::text[], 'Glutes', '{"Quads","Adductors","Calves"}'::text[], 'mid', 'regional', NULL, NULL, '{"Ankle","Knee","Hip"}'::text[], true)
  ON CONFLICT (name) DO UPDATE SET
    category = EXCLUDED.category,
    movement_patterns = EXCLUDED.movement_patterns,
    bilateral_unilateral = EXCLUDED.bilateral_unilateral,
    posterior_anterior = EXCLUDED.posterior_anterior,
    complexity = EXCLUDED.complexity,
    equipment = EXCLUDED.equipment,
    primary_muscle = EXCLUDED.primary_muscle,
    supporting_muscles = EXCLUDED.supporting_muscles,
    muscle_bias = EXCLUDED.muscle_bias,
    joint_count_level = EXCLUDED.joint_count_level,
    dynamic_isometric = EXCLUDED.dynamic_isometric,
    movement_plane = EXCLUDED.movement_plane,
    primary_joints = EXCLUDED.primary_joints,
    is_active = true,
    updated_at = now();

INSERT INTO exercise_library (name, category, movement_patterns, bilateral_unilateral, posterior_anterior, complexity, equipment, primary_muscle, supporting_muscles, muscle_bias, joint_count_level, dynamic_isometric, movement_plane, primary_joints, is_active)
  VALUES ('Barbell Front Rack Forward Box Step-up (no momentum)', 'strength', '{"step_up"}'::text[], 'unilateral', 'anterior', 3, '{"barbell","plyo_box"}'::text[], 'Quads', '{"Glutes","Calves"}'::text[], 'mid', 'regional', NULL, NULL, '{"Ankle","Knee","Hip"}'::text[], true)
  ON CONFLICT (name) DO UPDATE SET
    category = EXCLUDED.category,
    movement_patterns = EXCLUDED.movement_patterns,
    bilateral_unilateral = EXCLUDED.bilateral_unilateral,
    posterior_anterior = EXCLUDED.posterior_anterior,
    complexity = EXCLUDED.complexity,
    equipment = EXCLUDED.equipment,
    primary_muscle = EXCLUDED.primary_muscle,
    supporting_muscles = EXCLUDED.supporting_muscles,
    muscle_bias = EXCLUDED.muscle_bias,
    joint_count_level = EXCLUDED.joint_count_level,
    dynamic_isometric = EXCLUDED.dynamic_isometric,
    movement_plane = EXCLUDED.movement_plane,
    primary_joints = EXCLUDED.primary_joints,
    is_active = true,
    updated_at = now();

INSERT INTO exercise_library (name, category, movement_patterns, bilateral_unilateral, posterior_anterior, complexity, equipment, primary_muscle, supporting_muscles, muscle_bias, joint_count_level, dynamic_isometric, movement_plane, primary_joints, is_active)
  VALUES ('Barbell Front Rack Alt Forward Box Step-up (no momentum)', 'strength', '{"step_up"}'::text[], 'unilateral', 'anterior', 3, '{"barbell","plyo_box"}'::text[], 'Quads', '{"Glutes","Calves"}'::text[], 'mid', 'global', NULL, NULL, '{"Ankle","Knee","Hip"}'::text[], true)
  ON CONFLICT (name) DO UPDATE SET
    category = EXCLUDED.category,
    movement_patterns = EXCLUDED.movement_patterns,
    bilateral_unilateral = EXCLUDED.bilateral_unilateral,
    posterior_anterior = EXCLUDED.posterior_anterior,
    complexity = EXCLUDED.complexity,
    equipment = EXCLUDED.equipment,
    primary_muscle = EXCLUDED.primary_muscle,
    supporting_muscles = EXCLUDED.supporting_muscles,
    muscle_bias = EXCLUDED.muscle_bias,
    joint_count_level = EXCLUDED.joint_count_level,
    dynamic_isometric = EXCLUDED.dynamic_isometric,
    movement_plane = EXCLUDED.movement_plane,
    primary_joints = EXCLUDED.primary_joints,
    is_active = true,
    updated_at = now();

INSERT INTO exercise_library (name, category, movement_patterns, bilateral_unilateral, posterior_anterior, complexity, equipment, primary_muscle, supporting_muscles, muscle_bias, joint_count_level, dynamic_isometric, movement_plane, primary_joints, is_active)
  VALUES ('Barbell Front Rack Forward Box Step-up (with momentum)', 'strength', '{"step_up"}'::text[], 'unilateral', 'anterior', 3, '{"barbell","plyo_box"}'::text[], 'Quads', '{"Glutes","Calves"}'::text[], 'mid', 'global', NULL, NULL, '{"Ankle","Knee","Hip"}'::text[], true)
  ON CONFLICT (name) DO UPDATE SET
    category = EXCLUDED.category,
    movement_patterns = EXCLUDED.movement_patterns,
    bilateral_unilateral = EXCLUDED.bilateral_unilateral,
    posterior_anterior = EXCLUDED.posterior_anterior,
    complexity = EXCLUDED.complexity,
    equipment = EXCLUDED.equipment,
    primary_muscle = EXCLUDED.primary_muscle,
    supporting_muscles = EXCLUDED.supporting_muscles,
    muscle_bias = EXCLUDED.muscle_bias,
    joint_count_level = EXCLUDED.joint_count_level,
    dynamic_isometric = EXCLUDED.dynamic_isometric,
    movement_plane = EXCLUDED.movement_plane,
    primary_joints = EXCLUDED.primary_joints,
    is_active = true,
    updated_at = now();

INSERT INTO exercise_library (name, category, movement_patterns, bilateral_unilateral, posterior_anterior, complexity, equipment, primary_muscle, supporting_muscles, muscle_bias, joint_count_level, dynamic_isometric, movement_plane, primary_joints, is_active)
  VALUES ('Barbell Front Rack Alt Forward Box Step-up (with momentum)', 'strength', '{"step_up"}'::text[], 'unilateral', 'anterior', 3, '{"barbell","plyo_box"}'::text[], 'Quads', '{"Glutes","Calves"}'::text[], 'mid', 'global', NULL, NULL, '{"Ankle","Knee","Hip"}'::text[], true)
  ON CONFLICT (name) DO UPDATE SET
    category = EXCLUDED.category,
    movement_patterns = EXCLUDED.movement_patterns,
    bilateral_unilateral = EXCLUDED.bilateral_unilateral,
    posterior_anterior = EXCLUDED.posterior_anterior,
    complexity = EXCLUDED.complexity,
    equipment = EXCLUDED.equipment,
    primary_muscle = EXCLUDED.primary_muscle,
    supporting_muscles = EXCLUDED.supporting_muscles,
    muscle_bias = EXCLUDED.muscle_bias,
    joint_count_level = EXCLUDED.joint_count_level,
    dynamic_isometric = EXCLUDED.dynamic_isometric,
    movement_plane = EXCLUDED.movement_plane,
    primary_joints = EXCLUDED.primary_joints,
    is_active = true,
    updated_at = now();

INSERT INTO exercise_library (name, category, movement_patterns, bilateral_unilateral, posterior_anterior, complexity, equipment, primary_muscle, supporting_muscles, muscle_bias, joint_count_level, dynamic_isometric, movement_plane, primary_joints, is_active)
  VALUES ('Barbell Front Rack Reverse Lunge to Forward Box Step-up', 'strength', '{"step_up"}'::text[], 'unilateral', 'anterior', 3, '{"barbell","plyo_box"}'::text[], 'Quads', '{"Glutes","Calves"}'::text[], 'mid', 'global', NULL, NULL, '{"Ankle","Knee","Hip"}'::text[], true)
  ON CONFLICT (name) DO UPDATE SET
    category = EXCLUDED.category,
    movement_patterns = EXCLUDED.movement_patterns,
    bilateral_unilateral = EXCLUDED.bilateral_unilateral,
    posterior_anterior = EXCLUDED.posterior_anterior,
    complexity = EXCLUDED.complexity,
    equipment = EXCLUDED.equipment,
    primary_muscle = EXCLUDED.primary_muscle,
    supporting_muscles = EXCLUDED.supporting_muscles,
    muscle_bias = EXCLUDED.muscle_bias,
    joint_count_level = EXCLUDED.joint_count_level,
    dynamic_isometric = EXCLUDED.dynamic_isometric,
    movement_plane = EXCLUDED.movement_plane,
    primary_joints = EXCLUDED.primary_joints,
    is_active = true,
    updated_at = now();

INSERT INTO exercise_library (name, category, movement_patterns, bilateral_unilateral, posterior_anterior, complexity, equipment, primary_muscle, supporting_muscles, muscle_bias, joint_count_level, dynamic_isometric, movement_plane, primary_joints, is_active)
  VALUES ('Barbell Front Rack Box Step-down', 'strength', '{"step_up"}'::text[], 'unilateral', 'mixed', 3, '{"barbell","plyo_box"}'::text[], 'Quads', '{"Glutes","Calves"}'::text[], 'lengthened', 'regional', NULL, NULL, '{"Ankle","Knee","Hip"}'::text[], true)
  ON CONFLICT (name) DO UPDATE SET
    category = EXCLUDED.category,
    movement_patterns = EXCLUDED.movement_patterns,
    bilateral_unilateral = EXCLUDED.bilateral_unilateral,
    posterior_anterior = EXCLUDED.posterior_anterior,
    complexity = EXCLUDED.complexity,
    equipment = EXCLUDED.equipment,
    primary_muscle = EXCLUDED.primary_muscle,
    supporting_muscles = EXCLUDED.supporting_muscles,
    muscle_bias = EXCLUDED.muscle_bias,
    joint_count_level = EXCLUDED.joint_count_level,
    dynamic_isometric = EXCLUDED.dynamic_isometric,
    movement_plane = EXCLUDED.movement_plane,
    primary_joints = EXCLUDED.primary_joints,
    is_active = true,
    updated_at = now();

INSERT INTO exercise_library (name, category, movement_patterns, bilateral_unilateral, posterior_anterior, complexity, equipment, primary_muscle, supporting_muscles, muscle_bias, joint_count_level, dynamic_isometric, movement_plane, primary_joints, is_active)
  VALUES ('Barbell Front Rack Crossover Step-up', 'strength', '{"step_up"}'::text[], 'unilateral', 'mixed', 3, '{"barbell","plyo_box"}'::text[], 'Glutes', '{"Quads","Adductors","Calves"}'::text[], 'mid', 'regional', NULL, NULL, '{"Ankle","Knee","Hip"}'::text[], true)
  ON CONFLICT (name) DO UPDATE SET
    category = EXCLUDED.category,
    movement_patterns = EXCLUDED.movement_patterns,
    bilateral_unilateral = EXCLUDED.bilateral_unilateral,
    posterior_anterior = EXCLUDED.posterior_anterior,
    complexity = EXCLUDED.complexity,
    equipment = EXCLUDED.equipment,
    primary_muscle = EXCLUDED.primary_muscle,
    supporting_muscles = EXCLUDED.supporting_muscles,
    muscle_bias = EXCLUDED.muscle_bias,
    joint_count_level = EXCLUDED.joint_count_level,
    dynamic_isometric = EXCLUDED.dynamic_isometric,
    movement_plane = EXCLUDED.movement_plane,
    primary_joints = EXCLUDED.primary_joints,
    is_active = true,
    updated_at = now();

INSERT INTO exercise_library (name, category, movement_patterns, bilateral_unilateral, posterior_anterior, complexity, equipment, primary_muscle, supporting_muscles, muscle_bias, joint_count_level, dynamic_isometric, movement_plane, primary_joints, is_active)
  VALUES ('Barbell Front Rack Side Step-up', 'strength', '{"step_up"}'::text[], 'unilateral', 'mixed', 3, '{"barbell","plyo_box"}'::text[], 'Glutes', '{"Quads","Adductors","Calves"}'::text[], 'mid', 'regional', NULL, NULL, '{"Ankle","Knee","Hip"}'::text[], true)
  ON CONFLICT (name) DO UPDATE SET
    category = EXCLUDED.category,
    movement_patterns = EXCLUDED.movement_patterns,
    bilateral_unilateral = EXCLUDED.bilateral_unilateral,
    posterior_anterior = EXCLUDED.posterior_anterior,
    complexity = EXCLUDED.complexity,
    equipment = EXCLUDED.equipment,
    primary_muscle = EXCLUDED.primary_muscle,
    supporting_muscles = EXCLUDED.supporting_muscles,
    muscle_bias = EXCLUDED.muscle_bias,
    joint_count_level = EXCLUDED.joint_count_level,
    dynamic_isometric = EXCLUDED.dynamic_isometric,
    movement_plane = EXCLUDED.movement_plane,
    primary_joints = EXCLUDED.primary_joints,
    is_active = true,
    updated_at = now();

INSERT INTO exercise_library (name, category, movement_patterns, bilateral_unilateral, posterior_anterior, complexity, equipment, primary_muscle, supporting_muscles, muscle_bias, joint_count_level, dynamic_isometric, movement_plane, primary_joints, is_active)
  VALUES ('Split Stance Dual DB Single Leg Romanian Deadlift', 'strength', '{"hinge"}'::text[], 'unilateral', 'posterior', 2, '{"dumbbell"}'::text[], 'Hamstrings', '{"Glutes","Adductors","Lats"}'::text[], 'lengthened', 'regional', NULL, NULL, '{"Hip","Knee"}'::text[], true)
  ON CONFLICT (name) DO UPDATE SET
    category = EXCLUDED.category,
    movement_patterns = EXCLUDED.movement_patterns,
    bilateral_unilateral = EXCLUDED.bilateral_unilateral,
    posterior_anterior = EXCLUDED.posterior_anterior,
    complexity = EXCLUDED.complexity,
    equipment = EXCLUDED.equipment,
    primary_muscle = EXCLUDED.primary_muscle,
    supporting_muscles = EXCLUDED.supporting_muscles,
    muscle_bias = EXCLUDED.muscle_bias,
    joint_count_level = EXCLUDED.joint_count_level,
    dynamic_isometric = EXCLUDED.dynamic_isometric,
    movement_plane = EXCLUDED.movement_plane,
    primary_joints = EXCLUDED.primary_joints,
    is_active = true,
    updated_at = now();

INSERT INTO exercise_library (name, category, movement_patterns, bilateral_unilateral, posterior_anterior, complexity, equipment, primary_muscle, supporting_muscles, muscle_bias, joint_count_level, dynamic_isometric, movement_plane, primary_joints, is_active)
  VALUES ('Split Stance Barbell Single Leg Romanian Deadlift', 'strength', '{"hinge"}'::text[], 'unilateral', 'posterior', 3, '{"barbell"}'::text[], 'Hamstrings', '{"Glutes","Adductors","Lats"}'::text[], 'lengthened', 'regional', NULL, NULL, '{"Hip","Knee"}'::text[], true)
  ON CONFLICT (name) DO UPDATE SET
    category = EXCLUDED.category,
    movement_patterns = EXCLUDED.movement_patterns,
    bilateral_unilateral = EXCLUDED.bilateral_unilateral,
    posterior_anterior = EXCLUDED.posterior_anterior,
    complexity = EXCLUDED.complexity,
    equipment = EXCLUDED.equipment,
    primary_muscle = EXCLUDED.primary_muscle,
    supporting_muscles = EXCLUDED.supporting_muscles,
    muscle_bias = EXCLUDED.muscle_bias,
    joint_count_level = EXCLUDED.joint_count_level,
    dynamic_isometric = EXCLUDED.dynamic_isometric,
    movement_plane = EXCLUDED.movement_plane,
    primary_joints = EXCLUDED.primary_joints,
    is_active = true,
    updated_at = now();

INSERT INTO exercise_library (name, category, movement_patterns, bilateral_unilateral, posterior_anterior, complexity, equipment, primary_muscle, supporting_muscles, muscle_bias, joint_count_level, dynamic_isometric, movement_plane, primary_joints, is_active)
  VALUES ('Split Stance Landmine Single Leg Romanian Deadlift', 'strength', '{"hinge"}'::text[], 'unilateral', 'posterior', 2, '{"landmine"}'::text[], 'Hamstrings', '{"Glutes","Adductors","Lats"}'::text[], 'lengthened', 'regional', NULL, NULL, '{"Hip","Knee"}'::text[], true)
  ON CONFLICT (name) DO UPDATE SET
    category = EXCLUDED.category,
    movement_patterns = EXCLUDED.movement_patterns,
    bilateral_unilateral = EXCLUDED.bilateral_unilateral,
    posterior_anterior = EXCLUDED.posterior_anterior,
    complexity = EXCLUDED.complexity,
    equipment = EXCLUDED.equipment,
    primary_muscle = EXCLUDED.primary_muscle,
    supporting_muscles = EXCLUDED.supporting_muscles,
    muscle_bias = EXCLUDED.muscle_bias,
    joint_count_level = EXCLUDED.joint_count_level,
    dynamic_isometric = EXCLUDED.dynamic_isometric,
    movement_plane = EXCLUDED.movement_plane,
    primary_joints = EXCLUDED.primary_joints,
    is_active = true,
    updated_at = now();

INSERT INTO exercise_library (name, category, movement_patterns, bilateral_unilateral, posterior_anterior, complexity, equipment, primary_muscle, supporting_muscles, muscle_bias, joint_count_level, dynamic_isometric, movement_plane, primary_joints, is_active)
  VALUES ('Split Stance Single DB Single Leg Romanian Deadlift', 'strength', '{"hinge"}'::text[], 'unilateral', 'posterior', 2, '{"dumbbell"}'::text[], 'Hamstrings', '{"Glutes","Adductors","Lats"}'::text[], 'lengthened', 'regional', NULL, NULL, '{"Hip","Knee"}'::text[], true)
  ON CONFLICT (name) DO UPDATE SET
    category = EXCLUDED.category,
    movement_patterns = EXCLUDED.movement_patterns,
    bilateral_unilateral = EXCLUDED.bilateral_unilateral,
    posterior_anterior = EXCLUDED.posterior_anterior,
    complexity = EXCLUDED.complexity,
    equipment = EXCLUDED.equipment,
    primary_muscle = EXCLUDED.primary_muscle,
    supporting_muscles = EXCLUDED.supporting_muscles,
    muscle_bias = EXCLUDED.muscle_bias,
    joint_count_level = EXCLUDED.joint_count_level,
    dynamic_isometric = EXCLUDED.dynamic_isometric,
    movement_plane = EXCLUDED.movement_plane,
    primary_joints = EXCLUDED.primary_joints,
    is_active = true,
    updated_at = now();

INSERT INTO exercise_library (name, category, movement_patterns, bilateral_unilateral, posterior_anterior, complexity, equipment, primary_muscle, supporting_muscles, muscle_bias, joint_count_level, dynamic_isometric, movement_plane, primary_joints, is_active)
  VALUES ('Nordic Hamstring Curl', 'strength', '{"hinge"}'::text[], 'bilateral', 'posterior', 3, '{"bodyweight"}'::text[], 'Hamstrings', '{"Glutes","Calves"}'::text[], 'lengthened', 'regional', NULL, NULL, '{"Knee"}'::text[], true)
  ON CONFLICT (name) DO UPDATE SET
    category = EXCLUDED.category,
    movement_patterns = EXCLUDED.movement_patterns,
    bilateral_unilateral = EXCLUDED.bilateral_unilateral,
    posterior_anterior = EXCLUDED.posterior_anterior,
    complexity = EXCLUDED.complexity,
    equipment = EXCLUDED.equipment,
    primary_muscle = EXCLUDED.primary_muscle,
    supporting_muscles = EXCLUDED.supporting_muscles,
    muscle_bias = EXCLUDED.muscle_bias,
    joint_count_level = EXCLUDED.joint_count_level,
    dynamic_isometric = EXCLUDED.dynamic_isometric,
    movement_plane = EXCLUDED.movement_plane,
    primary_joints = EXCLUDED.primary_joints,
    is_active = true,
    updated_at = now();

INSERT INTO exercise_library (name, category, movement_patterns, bilateral_unilateral, posterior_anterior, complexity, equipment, primary_muscle, supporting_muscles, muscle_bias, joint_count_level, dynamic_isometric, movement_plane, primary_joints, is_active)
  VALUES ('Glute Ham Raise', 'strength', '{"hinge"}'::text[], 'bilateral', 'posterior', 3, '{}'::text[], 'Hamstrings', '{"Glutes","Calves"}'::text[], 'mid', 'regional', NULL, NULL, '{"Knee","Hip"}'::text[], true)
  ON CONFLICT (name) DO UPDATE SET
    category = EXCLUDED.category,
    movement_patterns = EXCLUDED.movement_patterns,
    bilateral_unilateral = EXCLUDED.bilateral_unilateral,
    posterior_anterior = EXCLUDED.posterior_anterior,
    complexity = EXCLUDED.complexity,
    equipment = EXCLUDED.equipment,
    primary_muscle = EXCLUDED.primary_muscle,
    supporting_muscles = EXCLUDED.supporting_muscles,
    muscle_bias = EXCLUDED.muscle_bias,
    joint_count_level = EXCLUDED.joint_count_level,
    dynamic_isometric = EXCLUDED.dynamic_isometric,
    movement_plane = EXCLUDED.movement_plane,
    primary_joints = EXCLUDED.primary_joints,
    is_active = true,
    updated_at = now();

INSERT INTO exercise_library (name, category, movement_patterns, bilateral_unilateral, posterior_anterior, complexity, equipment, primary_muscle, supporting_muscles, muscle_bias, joint_count_level, dynamic_isometric, movement_plane, primary_joints, is_active)
  VALUES ('Dual DB Romanian Deadlift', 'strength', '{"hinge"}'::text[], 'bilateral', 'posterior', 2, '{"dumbbell"}'::text[], 'Hamstrings', '{"Glutes","Adductors","Lats"}'::text[], 'lengthened', 'regional', NULL, NULL, '{"Hip","Knee"}'::text[], true)
  ON CONFLICT (name) DO UPDATE SET
    category = EXCLUDED.category,
    movement_patterns = EXCLUDED.movement_patterns,
    bilateral_unilateral = EXCLUDED.bilateral_unilateral,
    posterior_anterior = EXCLUDED.posterior_anterior,
    complexity = EXCLUDED.complexity,
    equipment = EXCLUDED.equipment,
    primary_muscle = EXCLUDED.primary_muscle,
    supporting_muscles = EXCLUDED.supporting_muscles,
    muscle_bias = EXCLUDED.muscle_bias,
    joint_count_level = EXCLUDED.joint_count_level,
    dynamic_isometric = EXCLUDED.dynamic_isometric,
    movement_plane = EXCLUDED.movement_plane,
    primary_joints = EXCLUDED.primary_joints,
    is_active = true,
    updated_at = now();

INSERT INTO exercise_library (name, category, movement_patterns, bilateral_unilateral, posterior_anterior, complexity, equipment, primary_muscle, supporting_muscles, muscle_bias, joint_count_level, dynamic_isometric, movement_plane, primary_joints, is_active)
  VALUES ('Dual DB Stiff Leg Deadlift', 'strength', '{"hinge"}'::text[], 'bilateral', 'posterior', 2, '{"dumbbell"}'::text[], 'Hamstrings', '{"Glutes","Adductors","Erectors"}'::text[], 'lengthened', 'regional', NULL, NULL, '{"Hip"}'::text[], true)
  ON CONFLICT (name) DO UPDATE SET
    category = EXCLUDED.category,
    movement_patterns = EXCLUDED.movement_patterns,
    bilateral_unilateral = EXCLUDED.bilateral_unilateral,
    posterior_anterior = EXCLUDED.posterior_anterior,
    complexity = EXCLUDED.complexity,
    equipment = EXCLUDED.equipment,
    primary_muscle = EXCLUDED.primary_muscle,
    supporting_muscles = EXCLUDED.supporting_muscles,
    muscle_bias = EXCLUDED.muscle_bias,
    joint_count_level = EXCLUDED.joint_count_level,
    dynamic_isometric = EXCLUDED.dynamic_isometric,
    movement_plane = EXCLUDED.movement_plane,
    primary_joints = EXCLUDED.primary_joints,
    is_active = true,
    updated_at = now();

INSERT INTO exercise_library (name, category, movement_patterns, bilateral_unilateral, posterior_anterior, complexity, equipment, primary_muscle, supporting_muscles, muscle_bias, joint_count_level, dynamic_isometric, movement_plane, primary_joints, is_active)
  VALUES ('Barbell Romanian Deadlift', 'strength', '{"hinge"}'::text[], 'bilateral', 'posterior', 2, '{"barbell"}'::text[], 'Hamstrings', '{"Glutes","Adductors","Lats"}'::text[], 'lengthened', 'regional', NULL, NULL, '{"Hip","Knee"}'::text[], true)
  ON CONFLICT (name) DO UPDATE SET
    category = EXCLUDED.category,
    movement_patterns = EXCLUDED.movement_patterns,
    bilateral_unilateral = EXCLUDED.bilateral_unilateral,
    posterior_anterior = EXCLUDED.posterior_anterior,
    complexity = EXCLUDED.complexity,
    equipment = EXCLUDED.equipment,
    primary_muscle = EXCLUDED.primary_muscle,
    supporting_muscles = EXCLUDED.supporting_muscles,
    muscle_bias = EXCLUDED.muscle_bias,
    joint_count_level = EXCLUDED.joint_count_level,
    dynamic_isometric = EXCLUDED.dynamic_isometric,
    movement_plane = EXCLUDED.movement_plane,
    primary_joints = EXCLUDED.primary_joints,
    is_active = true,
    updated_at = now();

INSERT INTO exercise_library (name, category, movement_patterns, bilateral_unilateral, posterior_anterior, complexity, equipment, primary_muscle, supporting_muscles, muscle_bias, joint_count_level, dynamic_isometric, movement_plane, primary_joints, is_active)
  VALUES ('Barbell Stiff Leg Deadlift', 'strength', '{"hinge"}'::text[], 'bilateral', 'posterior', 2, '{"barbell"}'::text[], 'Hamstrings', '{"Glutes","Adductors","Erectors"}'::text[], 'lengthened', 'regional', NULL, NULL, '{"Hip"}'::text[], true)
  ON CONFLICT (name) DO UPDATE SET
    category = EXCLUDED.category,
    movement_patterns = EXCLUDED.movement_patterns,
    bilateral_unilateral = EXCLUDED.bilateral_unilateral,
    posterior_anterior = EXCLUDED.posterior_anterior,
    complexity = EXCLUDED.complexity,
    equipment = EXCLUDED.equipment,
    primary_muscle = EXCLUDED.primary_muscle,
    supporting_muscles = EXCLUDED.supporting_muscles,
    muscle_bias = EXCLUDED.muscle_bias,
    joint_count_level = EXCLUDED.joint_count_level,
    dynamic_isometric = EXCLUDED.dynamic_isometric,
    movement_plane = EXCLUDED.movement_plane,
    primary_joints = EXCLUDED.primary_joints,
    is_active = true,
    updated_at = now();

INSERT INTO exercise_library (name, category, movement_patterns, bilateral_unilateral, posterior_anterior, complexity, equipment, primary_muscle, supporting_muscles, muscle_bias, joint_count_level, dynamic_isometric, movement_plane, primary_joints, is_active)
  VALUES ('Trap Bar Romanian Deadlift', 'strength', '{"hinge"}'::text[], 'bilateral', 'posterior', 2, '{"trap_bar"}'::text[], 'Hamstrings', '{"Glutes","Adductors","Lats"}'::text[], 'lengthened', 'regional', NULL, NULL, '{"Hip","Knee"}'::text[], true)
  ON CONFLICT (name) DO UPDATE SET
    category = EXCLUDED.category,
    movement_patterns = EXCLUDED.movement_patterns,
    bilateral_unilateral = EXCLUDED.bilateral_unilateral,
    posterior_anterior = EXCLUDED.posterior_anterior,
    complexity = EXCLUDED.complexity,
    equipment = EXCLUDED.equipment,
    primary_muscle = EXCLUDED.primary_muscle,
    supporting_muscles = EXCLUDED.supporting_muscles,
    muscle_bias = EXCLUDED.muscle_bias,
    joint_count_level = EXCLUDED.joint_count_level,
    dynamic_isometric = EXCLUDED.dynamic_isometric,
    movement_plane = EXCLUDED.movement_plane,
    primary_joints = EXCLUDED.primary_joints,
    is_active = true,
    updated_at = now();

INSERT INTO exercise_library (name, category, movement_patterns, bilateral_unilateral, posterior_anterior, complexity, equipment, primary_muscle, supporting_muscles, muscle_bias, joint_count_level, dynamic_isometric, movement_plane, primary_joints, is_active)
  VALUES ('Trap Bar Stiff Leg Deadlift', 'strength', '{"hinge"}'::text[], 'bilateral', 'posterior', 2, '{"trap_bar"}'::text[], 'Hamstrings', '{"Glutes","Adductors","Erectors"}'::text[], 'lengthened', 'regional', NULL, NULL, '{"Hip"}'::text[], true)
  ON CONFLICT (name) DO UPDATE SET
    category = EXCLUDED.category,
    movement_patterns = EXCLUDED.movement_patterns,
    bilateral_unilateral = EXCLUDED.bilateral_unilateral,
    posterior_anterior = EXCLUDED.posterior_anterior,
    complexity = EXCLUDED.complexity,
    equipment = EXCLUDED.equipment,
    primary_muscle = EXCLUDED.primary_muscle,
    supporting_muscles = EXCLUDED.supporting_muscles,
    muscle_bias = EXCLUDED.muscle_bias,
    joint_count_level = EXCLUDED.joint_count_level,
    dynamic_isometric = EXCLUDED.dynamic_isometric,
    movement_plane = EXCLUDED.movement_plane,
    primary_joints = EXCLUDED.primary_joints,
    is_active = true,
    updated_at = now();

INSERT INTO exercise_library (name, category, movement_patterns, bilateral_unilateral, posterior_anterior, complexity, equipment, primary_muscle, supporting_muscles, muscle_bias, joint_count_level, dynamic_isometric, movement_plane, primary_joints, is_active)
  VALUES ('Trap Bar Deadlift (low handle)', 'strength', '{"hinge"}'::text[], 'bilateral', 'mixed', 2, '{"trap_bar"}'::text[], 'Glutes', '{"Quads","Hamstrings","Lats","Traps"}'::text[], 'mid', 'regional', NULL, NULL, '{"Hip","Knee"}'::text[], true)
  ON CONFLICT (name) DO UPDATE SET
    category = EXCLUDED.category,
    movement_patterns = EXCLUDED.movement_patterns,
    bilateral_unilateral = EXCLUDED.bilateral_unilateral,
    posterior_anterior = EXCLUDED.posterior_anterior,
    complexity = EXCLUDED.complexity,
    equipment = EXCLUDED.equipment,
    primary_muscle = EXCLUDED.primary_muscle,
    supporting_muscles = EXCLUDED.supporting_muscles,
    muscle_bias = EXCLUDED.muscle_bias,
    joint_count_level = EXCLUDED.joint_count_level,
    dynamic_isometric = EXCLUDED.dynamic_isometric,
    movement_plane = EXCLUDED.movement_plane,
    primary_joints = EXCLUDED.primary_joints,
    is_active = true,
    updated_at = now();

INSERT INTO exercise_library (name, category, movement_patterns, bilateral_unilateral, posterior_anterior, complexity, equipment, primary_muscle, supporting_muscles, muscle_bias, joint_count_level, dynamic_isometric, movement_plane, primary_joints, is_active)
  VALUES ('Trap Bar Deadlift (high handle)', 'strength', '{"hinge"}'::text[], 'bilateral', 'mixed', 1, '{"trap_bar"}'::text[], 'Glutes', '{"Quads","Hamstrings","Lats","Traps"}'::text[], 'mid', 'regional', NULL, NULL, '{"Hip","Knee"}'::text[], true)
  ON CONFLICT (name) DO UPDATE SET
    category = EXCLUDED.category,
    movement_patterns = EXCLUDED.movement_patterns,
    bilateral_unilateral = EXCLUDED.bilateral_unilateral,
    posterior_anterior = EXCLUDED.posterior_anterior,
    complexity = EXCLUDED.complexity,
    equipment = EXCLUDED.equipment,
    primary_muscle = EXCLUDED.primary_muscle,
    supporting_muscles = EXCLUDED.supporting_muscles,
    muscle_bias = EXCLUDED.muscle_bias,
    joint_count_level = EXCLUDED.joint_count_level,
    dynamic_isometric = EXCLUDED.dynamic_isometric,
    movement_plane = EXCLUDED.movement_plane,
    primary_joints = EXCLUDED.primary_joints,
    is_active = true,
    updated_at = now();

INSERT INTO exercise_library (name, category, movement_patterns, bilateral_unilateral, posterior_anterior, complexity, equipment, primary_muscle, supporting_muscles, muscle_bias, joint_count_level, dynamic_isometric, movement_plane, primary_joints, is_active)
  VALUES ('Barbell Deadlift', 'strength', '{"hinge"}'::text[], 'bilateral', 'mixed', 3, '{"barbell"}'::text[], 'Glutes', '{"Hamstrings","Quads","Lats","Traps"}'::text[], 'mid', 'regional', NULL, NULL, '{"Hip","Knee"}'::text[], true)
  ON CONFLICT (name) DO UPDATE SET
    category = EXCLUDED.category,
    movement_patterns = EXCLUDED.movement_patterns,
    bilateral_unilateral = EXCLUDED.bilateral_unilateral,
    posterior_anterior = EXCLUDED.posterior_anterior,
    complexity = EXCLUDED.complexity,
    equipment = EXCLUDED.equipment,
    primary_muscle = EXCLUDED.primary_muscle,
    supporting_muscles = EXCLUDED.supporting_muscles,
    muscle_bias = EXCLUDED.muscle_bias,
    joint_count_level = EXCLUDED.joint_count_level,
    dynamic_isometric = EXCLUDED.dynamic_isometric,
    movement_plane = EXCLUDED.movement_plane,
    primary_joints = EXCLUDED.primary_joints,
    is_active = true,
    updated_at = now();

INSERT INTO exercise_library (name, category, movement_patterns, bilateral_unilateral, posterior_anterior, complexity, equipment, primary_muscle, supporting_muscles, muscle_bias, joint_count_level, dynamic_isometric, movement_plane, primary_joints, is_active)
  VALUES ('Dual KB Deadlift', 'strength', '{"hinge"}'::text[], 'bilateral', 'mixed', 2, '{"kettlebell"}'::text[], 'Glutes', '{"Hamstrings","Quads","Lats","Traps"}'::text[], 'mid', 'regional', NULL, NULL, '{"Hip","Knee"}'::text[], true)
  ON CONFLICT (name) DO UPDATE SET
    category = EXCLUDED.category,
    movement_patterns = EXCLUDED.movement_patterns,
    bilateral_unilateral = EXCLUDED.bilateral_unilateral,
    posterior_anterior = EXCLUDED.posterior_anterior,
    complexity = EXCLUDED.complexity,
    equipment = EXCLUDED.equipment,
    primary_muscle = EXCLUDED.primary_muscle,
    supporting_muscles = EXCLUDED.supporting_muscles,
    muscle_bias = EXCLUDED.muscle_bias,
    joint_count_level = EXCLUDED.joint_count_level,
    dynamic_isometric = EXCLUDED.dynamic_isometric,
    movement_plane = EXCLUDED.movement_plane,
    primary_joints = EXCLUDED.primary_joints,
    is_active = true,
    updated_at = now();

INSERT INTO exercise_library (name, category, movement_patterns, bilateral_unilateral, posterior_anterior, complexity, equipment, primary_muscle, supporting_muscles, muscle_bias, joint_count_level, dynamic_isometric, movement_plane, primary_joints, is_active)
  VALUES ('Barbell Sumo Deadlift', 'strength', '{"hinge"}'::text[], 'bilateral', 'mixed', 3, '{"barbell"}'::text[], 'Glutes', '{"Adductors","Quads","Hamstrings","Lats"}'::text[], 'mid', 'regional', NULL, NULL, '{"Hip","Knee"}'::text[], true)
  ON CONFLICT (name) DO UPDATE SET
    category = EXCLUDED.category,
    movement_patterns = EXCLUDED.movement_patterns,
    bilateral_unilateral = EXCLUDED.bilateral_unilateral,
    posterior_anterior = EXCLUDED.posterior_anterior,
    complexity = EXCLUDED.complexity,
    equipment = EXCLUDED.equipment,
    primary_muscle = EXCLUDED.primary_muscle,
    supporting_muscles = EXCLUDED.supporting_muscles,
    muscle_bias = EXCLUDED.muscle_bias,
    joint_count_level = EXCLUDED.joint_count_level,
    dynamic_isometric = EXCLUDED.dynamic_isometric,
    movement_plane = EXCLUDED.movement_plane,
    primary_joints = EXCLUDED.primary_joints,
    is_active = true,
    updated_at = now();

INSERT INTO exercise_library (name, category, movement_patterns, bilateral_unilateral, posterior_anterior, complexity, equipment, primary_muscle, supporting_muscles, muscle_bias, joint_count_level, dynamic_isometric, movement_plane, primary_joints, is_active)
  VALUES ('Dual KB Sumo Deadlift', 'strength', '{"hinge"}'::text[], 'bilateral', 'mixed', 2, '{"kettlebell"}'::text[], 'Glutes', '{"Adductors","Quads","Hamstrings","Lats"}'::text[], 'mid', 'regional', NULL, NULL, '{"Hip","Knee"}'::text[], true)
  ON CONFLICT (name) DO UPDATE SET
    category = EXCLUDED.category,
    movement_patterns = EXCLUDED.movement_patterns,
    bilateral_unilateral = EXCLUDED.bilateral_unilateral,
    posterior_anterior = EXCLUDED.posterior_anterior,
    complexity = EXCLUDED.complexity,
    equipment = EXCLUDED.equipment,
    primary_muscle = EXCLUDED.primary_muscle,
    supporting_muscles = EXCLUDED.supporting_muscles,
    muscle_bias = EXCLUDED.muscle_bias,
    joint_count_level = EXCLUDED.joint_count_level,
    dynamic_isometric = EXCLUDED.dynamic_isometric,
    movement_plane = EXCLUDED.movement_plane,
    primary_joints = EXCLUDED.primary_joints,
    is_active = true,
    updated_at = now();

INSERT INTO exercise_library (name, category, movement_patterns, bilateral_unilateral, posterior_anterior, complexity, equipment, primary_muscle, supporting_muscles, muscle_bias, joint_count_level, dynamic_isometric, movement_plane, primary_joints, is_active)
  VALUES ('Single KB Sumo Deadlift', 'strength', '{"hinge"}'::text[], 'bilateral', 'mixed', 2, '{"kettlebell"}'::text[], 'Glutes', '{"Adductors","Quads","Hamstrings","Lats"}'::text[], 'mid', 'regional', NULL, NULL, '{"Hip","Knee"}'::text[], true)
  ON CONFLICT (name) DO UPDATE SET
    category = EXCLUDED.category,
    movement_patterns = EXCLUDED.movement_patterns,
    bilateral_unilateral = EXCLUDED.bilateral_unilateral,
    posterior_anterior = EXCLUDED.posterior_anterior,
    complexity = EXCLUDED.complexity,
    equipment = EXCLUDED.equipment,
    primary_muscle = EXCLUDED.primary_muscle,
    supporting_muscles = EXCLUDED.supporting_muscles,
    muscle_bias = EXCLUDED.muscle_bias,
    joint_count_level = EXCLUDED.joint_count_level,
    dynamic_isometric = EXCLUDED.dynamic_isometric,
    movement_plane = EXCLUDED.movement_plane,
    primary_joints = EXCLUDED.primary_joints,
    is_active = true,
    updated_at = now();

INSERT INTO exercise_library (name, category, movement_patterns, bilateral_unilateral, posterior_anterior, complexity, equipment, primary_muscle, supporting_muscles, muscle_bias, joint_count_level, dynamic_isometric, movement_plane, primary_joints, is_active)
  VALUES ('Barbell Good Morning', 'strength', '{"hinge"}'::text[], 'bilateral', 'posterior', 3, '{"barbell"}'::text[], 'Hamstrings', '{"Glutes","Erectors","Adductors"}'::text[], 'lengthened', 'regional', NULL, NULL, '{"Hip"}'::text[], true)
  ON CONFLICT (name) DO UPDATE SET
    category = EXCLUDED.category,
    movement_patterns = EXCLUDED.movement_patterns,
    bilateral_unilateral = EXCLUDED.bilateral_unilateral,
    posterior_anterior = EXCLUDED.posterior_anterior,
    complexity = EXCLUDED.complexity,
    equipment = EXCLUDED.equipment,
    primary_muscle = EXCLUDED.primary_muscle,
    supporting_muscles = EXCLUDED.supporting_muscles,
    muscle_bias = EXCLUDED.muscle_bias,
    joint_count_level = EXCLUDED.joint_count_level,
    dynamic_isometric = EXCLUDED.dynamic_isometric,
    movement_plane = EXCLUDED.movement_plane,
    primary_joints = EXCLUDED.primary_joints,
    is_active = true,
    updated_at = now();

INSERT INTO exercise_library (name, category, movement_patterns, bilateral_unilateral, posterior_anterior, complexity, equipment, primary_muscle, supporting_muscles, muscle_bias, joint_count_level, dynamic_isometric, movement_plane, primary_joints, is_active)
  VALUES ('Barbell Seated Good Morning (wide stance)', 'strength', '{"hinge"}'::text[], 'bilateral', 'posterior', 3, '{"barbell"}'::text[], 'Hamstrings', '{"Glutes","Erectors","Adductors"}'::text[], 'lengthened', 'regional', NULL, NULL, '{"Hip"}'::text[], true)
  ON CONFLICT (name) DO UPDATE SET
    category = EXCLUDED.category,
    movement_patterns = EXCLUDED.movement_patterns,
    bilateral_unilateral = EXCLUDED.bilateral_unilateral,
    posterior_anterior = EXCLUDED.posterior_anterior,
    complexity = EXCLUDED.complexity,
    equipment = EXCLUDED.equipment,
    primary_muscle = EXCLUDED.primary_muscle,
    supporting_muscles = EXCLUDED.supporting_muscles,
    muscle_bias = EXCLUDED.muscle_bias,
    joint_count_level = EXCLUDED.joint_count_level,
    dynamic_isometric = EXCLUDED.dynamic_isometric,
    movement_plane = EXCLUDED.movement_plane,
    primary_joints = EXCLUDED.primary_joints,
    is_active = true,
    updated_at = now();

INSERT INTO exercise_library (name, category, movement_patterns, bilateral_unilateral, posterior_anterior, complexity, equipment, primary_muscle, supporting_muscles, muscle_bias, joint_count_level, dynamic_isometric, movement_plane, primary_joints, is_active)
  VALUES ('Smith Press Romanian Deadlift', 'strength', '{"hinge"}'::text[], 'bilateral', 'posterior', 1, '{}'::text[], 'Hamstrings', '{"Glutes","Adductors"}'::text[], 'lengthened', 'regional', NULL, NULL, '{"Hip","Knee"}'::text[], true)
  ON CONFLICT (name) DO UPDATE SET
    category = EXCLUDED.category,
    movement_patterns = EXCLUDED.movement_patterns,
    bilateral_unilateral = EXCLUDED.bilateral_unilateral,
    posterior_anterior = EXCLUDED.posterior_anterior,
    complexity = EXCLUDED.complexity,
    equipment = EXCLUDED.equipment,
    primary_muscle = EXCLUDED.primary_muscle,
    supporting_muscles = EXCLUDED.supporting_muscles,
    muscle_bias = EXCLUDED.muscle_bias,
    joint_count_level = EXCLUDED.joint_count_level,
    dynamic_isometric = EXCLUDED.dynamic_isometric,
    movement_plane = EXCLUDED.movement_plane,
    primary_joints = EXCLUDED.primary_joints,
    is_active = true,
    updated_at = now();

INSERT INTO exercise_library (name, category, movement_patterns, bilateral_unilateral, posterior_anterior, complexity, equipment, primary_muscle, supporting_muscles, muscle_bias, joint_count_level, dynamic_isometric, movement_plane, primary_joints, is_active)
  VALUES ('Smith Press Single Leg Romanian Deadlift', 'strength', '{"hinge"}'::text[], 'unilateral', 'posterior', 2, '{}'::text[], 'Hamstrings', '{"Glutes","Adductors"}'::text[], 'lengthened', 'regional', NULL, NULL, '{"Hip","Knee"}'::text[], true)
  ON CONFLICT (name) DO UPDATE SET
    category = EXCLUDED.category,
    movement_patterns = EXCLUDED.movement_patterns,
    bilateral_unilateral = EXCLUDED.bilateral_unilateral,
    posterior_anterior = EXCLUDED.posterior_anterior,
    complexity = EXCLUDED.complexity,
    equipment = EXCLUDED.equipment,
    primary_muscle = EXCLUDED.primary_muscle,
    supporting_muscles = EXCLUDED.supporting_muscles,
    muscle_bias = EXCLUDED.muscle_bias,
    joint_count_level = EXCLUDED.joint_count_level,
    dynamic_isometric = EXCLUDED.dynamic_isometric,
    movement_plane = EXCLUDED.movement_plane,
    primary_joints = EXCLUDED.primary_joints,
    is_active = true,
    updated_at = now();

INSERT INTO exercise_library (name, category, movement_patterns, bilateral_unilateral, posterior_anterior, complexity, equipment, primary_muscle, supporting_muscles, muscle_bias, joint_count_level, dynamic_isometric, movement_plane, primary_joints, is_active)
  VALUES ('45 Degree Hip Extension', 'strength', '{"hinge"}'::text[], 'bilateral', 'posterior', 2, '{}'::text[], 'Glutes', '{"Hamstrings"}'::text[], 'mid', 'regional', NULL, NULL, '{"Hip"}'::text[], true)
  ON CONFLICT (name) DO UPDATE SET
    category = EXCLUDED.category,
    movement_patterns = EXCLUDED.movement_patterns,
    bilateral_unilateral = EXCLUDED.bilateral_unilateral,
    posterior_anterior = EXCLUDED.posterior_anterior,
    complexity = EXCLUDED.complexity,
    equipment = EXCLUDED.equipment,
    primary_muscle = EXCLUDED.primary_muscle,
    supporting_muscles = EXCLUDED.supporting_muscles,
    muscle_bias = EXCLUDED.muscle_bias,
    joint_count_level = EXCLUDED.joint_count_level,
    dynamic_isometric = EXCLUDED.dynamic_isometric,
    movement_plane = EXCLUDED.movement_plane,
    primary_joints = EXCLUDED.primary_joints,
    is_active = true,
    updated_at = now();

INSERT INTO exercise_library (name, category, movement_patterns, bilateral_unilateral, posterior_anterior, complexity, equipment, primary_muscle, supporting_muscles, muscle_bias, joint_count_level, dynamic_isometric, movement_plane, primary_joints, is_active)
  VALUES ('GHD Hip Extension', 'strength', '{"hinge"}'::text[], 'bilateral', 'posterior', 2, '{"fixed_machine"}'::text[], 'Glutes', '{"Hamstrings"}'::text[], 'shortened', 'regional', NULL, NULL, '{"Hip"}'::text[], true)
  ON CONFLICT (name) DO UPDATE SET
    category = EXCLUDED.category,
    movement_patterns = EXCLUDED.movement_patterns,
    bilateral_unilateral = EXCLUDED.bilateral_unilateral,
    posterior_anterior = EXCLUDED.posterior_anterior,
    complexity = EXCLUDED.complexity,
    equipment = EXCLUDED.equipment,
    primary_muscle = EXCLUDED.primary_muscle,
    supporting_muscles = EXCLUDED.supporting_muscles,
    muscle_bias = EXCLUDED.muscle_bias,
    joint_count_level = EXCLUDED.joint_count_level,
    dynamic_isometric = EXCLUDED.dynamic_isometric,
    movement_plane = EXCLUDED.movement_plane,
    primary_joints = EXCLUDED.primary_joints,
    is_active = true,
    updated_at = now();

INSERT INTO exercise_library (name, category, movement_patterns, bilateral_unilateral, posterior_anterior, complexity, equipment, primary_muscle, supporting_muscles, muscle_bias, joint_count_level, dynamic_isometric, movement_plane, primary_joints, is_active)
  VALUES ('Slide Hamstring Curl', 'strength', '{"hinge"}'::text[], 'bilateral', 'posterior', 2, '{"bodyweight"}'::text[], 'Hamstrings', '{"Glutes","Calves"}'::text[], 'shortened', 'regional', NULL, NULL, '{"Knee"}'::text[], true)
  ON CONFLICT (name) DO UPDATE SET
    category = EXCLUDED.category,
    movement_patterns = EXCLUDED.movement_patterns,
    bilateral_unilateral = EXCLUDED.bilateral_unilateral,
    posterior_anterior = EXCLUDED.posterior_anterior,
    complexity = EXCLUDED.complexity,
    equipment = EXCLUDED.equipment,
    primary_muscle = EXCLUDED.primary_muscle,
    supporting_muscles = EXCLUDED.supporting_muscles,
    muscle_bias = EXCLUDED.muscle_bias,
    joint_count_level = EXCLUDED.joint_count_level,
    dynamic_isometric = EXCLUDED.dynamic_isometric,
    movement_plane = EXCLUDED.movement_plane,
    primary_joints = EXCLUDED.primary_joints,
    is_active = true,
    updated_at = now();

INSERT INTO exercise_library (name, category, movement_patterns, bilateral_unilateral, posterior_anterior, complexity, equipment, primary_muscle, supporting_muscles, muscle_bias, joint_count_level, dynamic_isometric, movement_plane, primary_joints, is_active)
  VALUES ('Suspension Trainer/Rings Hamstring Curl', 'strength', '{"hinge"}'::text[], 'bilateral', 'posterior', 2, '{"suspension_trainer"}'::text[], 'Hamstrings', '{"Glutes","Calves"}'::text[], 'shortened', 'regional', NULL, NULL, '{"Knee"}'::text[], true)
  ON CONFLICT (name) DO UPDATE SET
    category = EXCLUDED.category,
    movement_patterns = EXCLUDED.movement_patterns,
    bilateral_unilateral = EXCLUDED.bilateral_unilateral,
    posterior_anterior = EXCLUDED.posterior_anterior,
    complexity = EXCLUDED.complexity,
    equipment = EXCLUDED.equipment,
    primary_muscle = EXCLUDED.primary_muscle,
    supporting_muscles = EXCLUDED.supporting_muscles,
    muscle_bias = EXCLUDED.muscle_bias,
    joint_count_level = EXCLUDED.joint_count_level,
    dynamic_isometric = EXCLUDED.dynamic_isometric,
    movement_plane = EXCLUDED.movement_plane,
    primary_joints = EXCLUDED.primary_joints,
    is_active = true,
    updated_at = now();

INSERT INTO exercise_library (name, category, movement_patterns, bilateral_unilateral, posterior_anterior, complexity, equipment, primary_muscle, supporting_muscles, muscle_bias, joint_count_level, dynamic_isometric, movement_plane, primary_joints, is_active)
  VALUES ('Swiss Ball Hamstring Curl', 'strength', '{"hinge"}'::text[], 'bilateral', 'posterior', 2, '{"bodyweight"}'::text[], 'Hamstrings', '{"Calves","Glute max","Glutes"}'::text[], 'shortened', 'regional', NULL, NULL, '{"Hip","Knee"}'::text[], true)
  ON CONFLICT (name) DO UPDATE SET
    category = EXCLUDED.category,
    movement_patterns = EXCLUDED.movement_patterns,
    bilateral_unilateral = EXCLUDED.bilateral_unilateral,
    posterior_anterior = EXCLUDED.posterior_anterior,
    complexity = EXCLUDED.complexity,
    equipment = EXCLUDED.equipment,
    primary_muscle = EXCLUDED.primary_muscle,
    supporting_muscles = EXCLUDED.supporting_muscles,
    muscle_bias = EXCLUDED.muscle_bias,
    joint_count_level = EXCLUDED.joint_count_level,
    dynamic_isometric = EXCLUDED.dynamic_isometric,
    movement_plane = EXCLUDED.movement_plane,
    primary_joints = EXCLUDED.primary_joints,
    is_active = true,
    updated_at = now();

INSERT INTO exercise_library (name, category, movement_patterns, bilateral_unilateral, posterior_anterior, complexity, equipment, primary_muscle, supporting_muscles, muscle_bias, joint_count_level, dynamic_isometric, movement_plane, primary_joints, is_active)
  VALUES ('Barbell Glute Bridge (floor)', 'strength', '{"hip_extension"}'::text[], 'bilateral', 'posterior', 2, '{"barbell"}'::text[], 'Glutes', '{"Hamstrings"}'::text[], 'shortened', 'regional', NULL, NULL, '{"Hip"}'::text[], true)
  ON CONFLICT (name) DO UPDATE SET
    category = EXCLUDED.category,
    movement_patterns = EXCLUDED.movement_patterns,
    bilateral_unilateral = EXCLUDED.bilateral_unilateral,
    posterior_anterior = EXCLUDED.posterior_anterior,
    complexity = EXCLUDED.complexity,
    equipment = EXCLUDED.equipment,
    primary_muscle = EXCLUDED.primary_muscle,
    supporting_muscles = EXCLUDED.supporting_muscles,
    muscle_bias = EXCLUDED.muscle_bias,
    joint_count_level = EXCLUDED.joint_count_level,
    dynamic_isometric = EXCLUDED.dynamic_isometric,
    movement_plane = EXCLUDED.movement_plane,
    primary_joints = EXCLUDED.primary_joints,
    is_active = true,
    updated_at = now();

INSERT INTO exercise_library (name, category, movement_patterns, bilateral_unilateral, posterior_anterior, complexity, equipment, primary_muscle, supporting_muscles, muscle_bias, joint_count_level, dynamic_isometric, movement_plane, primary_joints, is_active)
  VALUES ('Barbell Glute Bridge (on bench)', 'strength', '{"hip_extension"}'::text[], 'bilateral', 'posterior', 2, '{"barbell"}'::text[], 'Glutes', '{"Hamstrings"}'::text[], 'shortened', 'regional', NULL, NULL, '{"Hip"}'::text[], true)
  ON CONFLICT (name) DO UPDATE SET
    category = EXCLUDED.category,
    movement_patterns = EXCLUDED.movement_patterns,
    bilateral_unilateral = EXCLUDED.bilateral_unilateral,
    posterior_anterior = EXCLUDED.posterior_anterior,
    complexity = EXCLUDED.complexity,
    equipment = EXCLUDED.equipment,
    primary_muscle = EXCLUDED.primary_muscle,
    supporting_muscles = EXCLUDED.supporting_muscles,
    muscle_bias = EXCLUDED.muscle_bias,
    joint_count_level = EXCLUDED.joint_count_level,
    dynamic_isometric = EXCLUDED.dynamic_isometric,
    movement_plane = EXCLUDED.movement_plane,
    primary_joints = EXCLUDED.primary_joints,
    is_active = true,
    updated_at = now();

INSERT INTO exercise_library (name, category, movement_patterns, bilateral_unilateral, posterior_anterior, complexity, equipment, primary_muscle, supporting_muscles, muscle_bias, joint_count_level, dynamic_isometric, movement_plane, primary_joints, is_active)
  VALUES ('Barbell Kas Bridge', 'strength', '{"hip_extension"}'::text[], 'bilateral', 'posterior', 2, '{"barbell"}'::text[], 'Glutes', '{"Hamstrings"}'::text[], 'shortened', 'regional', NULL, NULL, '{"Hip"}'::text[], true)
  ON CONFLICT (name) DO UPDATE SET
    category = EXCLUDED.category,
    movement_patterns = EXCLUDED.movement_patterns,
    bilateral_unilateral = EXCLUDED.bilateral_unilateral,
    posterior_anterior = EXCLUDED.posterior_anterior,
    complexity = EXCLUDED.complexity,
    equipment = EXCLUDED.equipment,
    primary_muscle = EXCLUDED.primary_muscle,
    supporting_muscles = EXCLUDED.supporting_muscles,
    muscle_bias = EXCLUDED.muscle_bias,
    joint_count_level = EXCLUDED.joint_count_level,
    dynamic_isometric = EXCLUDED.dynamic_isometric,
    movement_plane = EXCLUDED.movement_plane,
    primary_joints = EXCLUDED.primary_joints,
    is_active = true,
    updated_at = now();

INSERT INTO exercise_library (name, category, movement_patterns, bilateral_unilateral, posterior_anterior, complexity, equipment, primary_muscle, supporting_muscles, muscle_bias, joint_count_level, dynamic_isometric, movement_plane, primary_joints, is_active)
  VALUES ('Single Leg Barbell Glute Bridge (floor)', 'strength', '{"hip_extension"}'::text[], 'unilateral', 'posterior', 3, '{"barbell"}'::text[], 'Glutes', '{"Hamstrings"}'::text[], 'shortened', 'regional', NULL, NULL, '{"Hip"}'::text[], true)
  ON CONFLICT (name) DO UPDATE SET
    category = EXCLUDED.category,
    movement_patterns = EXCLUDED.movement_patterns,
    bilateral_unilateral = EXCLUDED.bilateral_unilateral,
    posterior_anterior = EXCLUDED.posterior_anterior,
    complexity = EXCLUDED.complexity,
    equipment = EXCLUDED.equipment,
    primary_muscle = EXCLUDED.primary_muscle,
    supporting_muscles = EXCLUDED.supporting_muscles,
    muscle_bias = EXCLUDED.muscle_bias,
    joint_count_level = EXCLUDED.joint_count_level,
    dynamic_isometric = EXCLUDED.dynamic_isometric,
    movement_plane = EXCLUDED.movement_plane,
    primary_joints = EXCLUDED.primary_joints,
    is_active = true,
    updated_at = now();

INSERT INTO exercise_library (name, category, movement_patterns, bilateral_unilateral, posterior_anterior, complexity, equipment, primary_muscle, supporting_muscles, muscle_bias, joint_count_level, dynamic_isometric, movement_plane, primary_joints, is_active)
  VALUES ('Single Leg Barbell Glute Bridge (on bench)', 'strength', '{"hip_extension"}'::text[], 'unilateral', 'posterior', 3, '{"barbell"}'::text[], 'Glutes', '{"Hamstrings"}'::text[], 'shortened', 'regional', NULL, NULL, '{"Hip"}'::text[], true)
  ON CONFLICT (name) DO UPDATE SET
    category = EXCLUDED.category,
    movement_patterns = EXCLUDED.movement_patterns,
    bilateral_unilateral = EXCLUDED.bilateral_unilateral,
    posterior_anterior = EXCLUDED.posterior_anterior,
    complexity = EXCLUDED.complexity,
    equipment = EXCLUDED.equipment,
    primary_muscle = EXCLUDED.primary_muscle,
    supporting_muscles = EXCLUDED.supporting_muscles,
    muscle_bias = EXCLUDED.muscle_bias,
    joint_count_level = EXCLUDED.joint_count_level,
    dynamic_isometric = EXCLUDED.dynamic_isometric,
    movement_plane = EXCLUDED.movement_plane,
    primary_joints = EXCLUDED.primary_joints,
    is_active = true,
    updated_at = now();

INSERT INTO exercise_library (name, category, movement_patterns, bilateral_unilateral, posterior_anterior, complexity, equipment, primary_muscle, supporting_muscles, muscle_bias, joint_count_level, dynamic_isometric, movement_plane, primary_joints, is_active)
  VALUES ('Single Leg Barbell Kas Bridge', 'strength', '{"hip_extension"}'::text[], 'unilateral', 'posterior', 3, '{"barbell"}'::text[], 'Glutes', '{"Hamstrings"}'::text[], 'shortened', 'regional', NULL, NULL, '{"Hip"}'::text[], true)
  ON CONFLICT (name) DO UPDATE SET
    category = EXCLUDED.category,
    movement_patterns = EXCLUDED.movement_patterns,
    bilateral_unilateral = EXCLUDED.bilateral_unilateral,
    posterior_anterior = EXCLUDED.posterior_anterior,
    complexity = EXCLUDED.complexity,
    equipment = EXCLUDED.equipment,
    primary_muscle = EXCLUDED.primary_muscle,
    supporting_muscles = EXCLUDED.supporting_muscles,
    muscle_bias = EXCLUDED.muscle_bias,
    joint_count_level = EXCLUDED.joint_count_level,
    dynamic_isometric = EXCLUDED.dynamic_isometric,
    movement_plane = EXCLUDED.movement_plane,
    primary_joints = EXCLUDED.primary_joints,
    is_active = true,
    updated_at = now();

INSERT INTO exercise_library (name, category, movement_patterns, bilateral_unilateral, posterior_anterior, complexity, equipment, primary_muscle, supporting_muscles, muscle_bias, joint_count_level, dynamic_isometric, movement_plane, primary_joints, is_active)
  VALUES ('Barbell Hip Thrust (bench)', 'strength', '{"hip_extension"}'::text[], 'bilateral', 'posterior', 2, '{"barbell"}'::text[], 'Glutes', '{"Hamstrings"}'::text[], 'shortened', 'regional', NULL, NULL, '{"Hip"}'::text[], true)
  ON CONFLICT (name) DO UPDATE SET
    category = EXCLUDED.category,
    movement_patterns = EXCLUDED.movement_patterns,
    bilateral_unilateral = EXCLUDED.bilateral_unilateral,
    posterior_anterior = EXCLUDED.posterior_anterior,
    complexity = EXCLUDED.complexity,
    equipment = EXCLUDED.equipment,
    primary_muscle = EXCLUDED.primary_muscle,
    supporting_muscles = EXCLUDED.supporting_muscles,
    muscle_bias = EXCLUDED.muscle_bias,
    joint_count_level = EXCLUDED.joint_count_level,
    dynamic_isometric = EXCLUDED.dynamic_isometric,
    movement_plane = EXCLUDED.movement_plane,
    primary_joints = EXCLUDED.primary_joints,
    is_active = true,
    updated_at = now();

INSERT INTO exercise_library (name, category, movement_patterns, bilateral_unilateral, posterior_anterior, complexity, equipment, primary_muscle, supporting_muscles, muscle_bias, joint_count_level, dynamic_isometric, movement_plane, primary_joints, is_active)
  VALUES ('Smith Press Hip Thrust', 'strength', '{"hip_extension"}'::text[], 'bilateral', 'posterior', 1, '{}'::text[], 'Glutes', '{"Hamstrings"}'::text[], 'shortened', 'regional', NULL, NULL, '{"Hip"}'::text[], true)
  ON CONFLICT (name) DO UPDATE SET
    category = EXCLUDED.category,
    movement_patterns = EXCLUDED.movement_patterns,
    bilateral_unilateral = EXCLUDED.bilateral_unilateral,
    posterior_anterior = EXCLUDED.posterior_anterior,
    complexity = EXCLUDED.complexity,
    equipment = EXCLUDED.equipment,
    primary_muscle = EXCLUDED.primary_muscle,
    supporting_muscles = EXCLUDED.supporting_muscles,
    muscle_bias = EXCLUDED.muscle_bias,
    joint_count_level = EXCLUDED.joint_count_level,
    dynamic_isometric = EXCLUDED.dynamic_isometric,
    movement_plane = EXCLUDED.movement_plane,
    primary_joints = EXCLUDED.primary_joints,
    is_active = true,
    updated_at = now();

INSERT INTO exercise_library (name, category, movement_patterns, bilateral_unilateral, posterior_anterior, complexity, equipment, primary_muscle, supporting_muscles, muscle_bias, joint_count_level, dynamic_isometric, movement_plane, primary_joints, is_active)
  VALUES ('Dual DB Hip Thrust', 'strength', '{"hip_extension"}'::text[], 'bilateral', 'posterior', 2, '{"dumbbell"}'::text[], 'Glutes', '{"Hamstrings"}'::text[], 'shortened', 'regional', NULL, NULL, '{"Hip"}'::text[], true)
  ON CONFLICT (name) DO UPDATE SET
    category = EXCLUDED.category,
    movement_patterns = EXCLUDED.movement_patterns,
    bilateral_unilateral = EXCLUDED.bilateral_unilateral,
    posterior_anterior = EXCLUDED.posterior_anterior,
    complexity = EXCLUDED.complexity,
    equipment = EXCLUDED.equipment,
    primary_muscle = EXCLUDED.primary_muscle,
    supporting_muscles = EXCLUDED.supporting_muscles,
    muscle_bias = EXCLUDED.muscle_bias,
    joint_count_level = EXCLUDED.joint_count_level,
    dynamic_isometric = EXCLUDED.dynamic_isometric,
    movement_plane = EXCLUDED.movement_plane,
    primary_joints = EXCLUDED.primary_joints,
    is_active = true,
    updated_at = now();

INSERT INTO exercise_library (name, category, movement_patterns, bilateral_unilateral, posterior_anterior, complexity, equipment, primary_muscle, supporting_muscles, muscle_bias, joint_count_level, dynamic_isometric, movement_plane, primary_joints, is_active)
  VALUES ('Single Leg Barbell Hip Thrust', 'strength', '{"hip_extension"}'::text[], 'unilateral', 'posterior', 3, '{"barbell"}'::text[], 'Glutes', '{"Hamstrings"}'::text[], 'shortened', 'regional', NULL, NULL, '{"Hip"}'::text[], true)
  ON CONFLICT (name) DO UPDATE SET
    category = EXCLUDED.category,
    movement_patterns = EXCLUDED.movement_patterns,
    bilateral_unilateral = EXCLUDED.bilateral_unilateral,
    posterior_anterior = EXCLUDED.posterior_anterior,
    complexity = EXCLUDED.complexity,
    equipment = EXCLUDED.equipment,
    primary_muscle = EXCLUDED.primary_muscle,
    supporting_muscles = EXCLUDED.supporting_muscles,
    muscle_bias = EXCLUDED.muscle_bias,
    joint_count_level = EXCLUDED.joint_count_level,
    dynamic_isometric = EXCLUDED.dynamic_isometric,
    movement_plane = EXCLUDED.movement_plane,
    primary_joints = EXCLUDED.primary_joints,
    is_active = true,
    updated_at = now();

INSERT INTO exercise_library (name, category, movement_patterns, bilateral_unilateral, posterior_anterior, complexity, equipment, primary_muscle, supporting_muscles, muscle_bias, joint_count_level, dynamic_isometric, movement_plane, primary_joints, is_active)
  VALUES ('Single Leg Smith Press Hip Thrust', 'strength', '{"hip_extension"}'::text[], 'unilateral', 'posterior', 2, '{}'::text[], 'Glutes', '{"Hamstrings"}'::text[], 'shortened', 'regional', NULL, NULL, '{"Hip"}'::text[], true)
  ON CONFLICT (name) DO UPDATE SET
    category = EXCLUDED.category,
    movement_patterns = EXCLUDED.movement_patterns,
    bilateral_unilateral = EXCLUDED.bilateral_unilateral,
    posterior_anterior = EXCLUDED.posterior_anterior,
    complexity = EXCLUDED.complexity,
    equipment = EXCLUDED.equipment,
    primary_muscle = EXCLUDED.primary_muscle,
    supporting_muscles = EXCLUDED.supporting_muscles,
    muscle_bias = EXCLUDED.muscle_bias,
    joint_count_level = EXCLUDED.joint_count_level,
    dynamic_isometric = EXCLUDED.dynamic_isometric,
    movement_plane = EXCLUDED.movement_plane,
    primary_joints = EXCLUDED.primary_joints,
    is_active = true,
    updated_at = now();

INSERT INTO exercise_library (name, category, movement_patterns, bilateral_unilateral, posterior_anterior, complexity, equipment, primary_muscle, supporting_muscles, muscle_bias, joint_count_level, dynamic_isometric, movement_plane, primary_joints, is_active)
  VALUES ('Single Leg Dual DB Hip Thrust', 'strength', '{"hip_extension"}'::text[], 'unilateral', 'posterior', 3, '{"dumbbell"}'::text[], 'Glutes', '{"Hamstrings"}'::text[], 'shortened', 'regional', NULL, NULL, '{"Hip"}'::text[], true)
  ON CONFLICT (name) DO UPDATE SET
    category = EXCLUDED.category,
    movement_patterns = EXCLUDED.movement_patterns,
    bilateral_unilateral = EXCLUDED.bilateral_unilateral,
    posterior_anterior = EXCLUDED.posterior_anterior,
    complexity = EXCLUDED.complexity,
    equipment = EXCLUDED.equipment,
    primary_muscle = EXCLUDED.primary_muscle,
    supporting_muscles = EXCLUDED.supporting_muscles,
    muscle_bias = EXCLUDED.muscle_bias,
    joint_count_level = EXCLUDED.joint_count_level,
    dynamic_isometric = EXCLUDED.dynamic_isometric,
    movement_plane = EXCLUDED.movement_plane,
    primary_joints = EXCLUDED.primary_joints,
    is_active = true,
    updated_at = now();

INSERT INTO exercise_library (name, category, movement_patterns, bilateral_unilateral, posterior_anterior, complexity, equipment, primary_muscle, supporting_muscles, muscle_bias, joint_count_level, dynamic_isometric, movement_plane, primary_joints, is_active)
  VALUES ('Strict Supinated Chest to Bar Pull-up', 'strength', '{"vertical_pull"}'::text[], 'bilateral', 'posterior', 3, '{"bodyweight"}'::text[], 'Latissimus dorsi', '{"Biceps brachii","Brachialis","Lower trapezius","Rhomboids","Posterior deltoid","Forearm flexors"}'::text[], 'lengthened', 'regional', NULL, 'vertical', '{"Shoulder","Elbow"}'::text[], true)
  ON CONFLICT (name) DO UPDATE SET
    category = EXCLUDED.category,
    movement_patterns = EXCLUDED.movement_patterns,
    bilateral_unilateral = EXCLUDED.bilateral_unilateral,
    posterior_anterior = EXCLUDED.posterior_anterior,
    complexity = EXCLUDED.complexity,
    equipment = EXCLUDED.equipment,
    primary_muscle = EXCLUDED.primary_muscle,
    supporting_muscles = EXCLUDED.supporting_muscles,
    muscle_bias = EXCLUDED.muscle_bias,
    joint_count_level = EXCLUDED.joint_count_level,
    dynamic_isometric = EXCLUDED.dynamic_isometric,
    movement_plane = EXCLUDED.movement_plane,
    primary_joints = EXCLUDED.primary_joints,
    is_active = true,
    updated_at = now();

INSERT INTO exercise_library (name, category, movement_patterns, bilateral_unilateral, posterior_anterior, complexity, equipment, primary_muscle, supporting_muscles, muscle_bias, joint_count_level, dynamic_isometric, movement_plane, primary_joints, is_active)
  VALUES ('Weighted Strict Supinated Chest to Bar Pull-up', 'strength', '{"vertical_pull"}'::text[], 'bilateral', 'posterior', 3, '{"bodyweight"}'::text[], 'Latissimus dorsi', '{"Biceps brachii","Brachialis","Lower trapezius","Rhomboids","Posterior deltoid","Forearm flexors"}'::text[], 'lengthened', 'regional', NULL, 'vertical', '{"Shoulder","Elbow"}'::text[], true)
  ON CONFLICT (name) DO UPDATE SET
    category = EXCLUDED.category,
    movement_patterns = EXCLUDED.movement_patterns,
    bilateral_unilateral = EXCLUDED.bilateral_unilateral,
    posterior_anterior = EXCLUDED.posterior_anterior,
    complexity = EXCLUDED.complexity,
    equipment = EXCLUDED.equipment,
    primary_muscle = EXCLUDED.primary_muscle,
    supporting_muscles = EXCLUDED.supporting_muscles,
    muscle_bias = EXCLUDED.muscle_bias,
    joint_count_level = EXCLUDED.joint_count_level,
    dynamic_isometric = EXCLUDED.dynamic_isometric,
    movement_plane = EXCLUDED.movement_plane,
    primary_joints = EXCLUDED.primary_joints,
    is_active = true,
    updated_at = now();

INSERT INTO exercise_library (name, category, movement_patterns, bilateral_unilateral, posterior_anterior, complexity, equipment, primary_muscle, supporting_muscles, muscle_bias, joint_count_level, dynamic_isometric, movement_plane, primary_joints, is_active)
  VALUES ('Strict Pronated Chest to Bar Pull-up', 'strength', '{"vertical_pull"}'::text[], 'bilateral', 'posterior', 3, '{"bodyweight"}'::text[], 'Latissimus dorsi', '{"Brachialis","Biceps brachii","Lower trapezius","Rhomboids","Posterior deltoid","Forearm flexors"}'::text[], 'lengthened', 'regional', NULL, 'vertical', '{"Shoulder","Elbow"}'::text[], true)
  ON CONFLICT (name) DO UPDATE SET
    category = EXCLUDED.category,
    movement_patterns = EXCLUDED.movement_patterns,
    bilateral_unilateral = EXCLUDED.bilateral_unilateral,
    posterior_anterior = EXCLUDED.posterior_anterior,
    complexity = EXCLUDED.complexity,
    equipment = EXCLUDED.equipment,
    primary_muscle = EXCLUDED.primary_muscle,
    supporting_muscles = EXCLUDED.supporting_muscles,
    muscle_bias = EXCLUDED.muscle_bias,
    joint_count_level = EXCLUDED.joint_count_level,
    dynamic_isometric = EXCLUDED.dynamic_isometric,
    movement_plane = EXCLUDED.movement_plane,
    primary_joints = EXCLUDED.primary_joints,
    is_active = true,
    updated_at = now();

INSERT INTO exercise_library (name, category, movement_patterns, bilateral_unilateral, posterior_anterior, complexity, equipment, primary_muscle, supporting_muscles, muscle_bias, joint_count_level, dynamic_isometric, movement_plane, primary_joints, is_active)
  VALUES ('Weighted Strict Pronated Chest to Bar Pull-up', 'strength', '{"vertical_pull"}'::text[], 'bilateral', 'posterior', 3, '{"bodyweight"}'::text[], 'Latissimus dorsi', '{"Brachialis","Biceps brachii","Lower trapezius","Rhomboids","Posterior deltoid","Forearm flexors"}'::text[], 'lengthened', 'regional', NULL, 'vertical', '{"Shoulder","Elbow"}'::text[], true)
  ON CONFLICT (name) DO UPDATE SET
    category = EXCLUDED.category,
    movement_patterns = EXCLUDED.movement_patterns,
    bilateral_unilateral = EXCLUDED.bilateral_unilateral,
    posterior_anterior = EXCLUDED.posterior_anterior,
    complexity = EXCLUDED.complexity,
    equipment = EXCLUDED.equipment,
    primary_muscle = EXCLUDED.primary_muscle,
    supporting_muscles = EXCLUDED.supporting_muscles,
    muscle_bias = EXCLUDED.muscle_bias,
    joint_count_level = EXCLUDED.joint_count_level,
    dynamic_isometric = EXCLUDED.dynamic_isometric,
    movement_plane = EXCLUDED.movement_plane,
    primary_joints = EXCLUDED.primary_joints,
    is_active = true,
    updated_at = now();

INSERT INTO exercise_library (name, category, movement_patterns, bilateral_unilateral, posterior_anterior, complexity, equipment, primary_muscle, supporting_muscles, muscle_bias, joint_count_level, dynamic_isometric, movement_plane, primary_joints, is_active)
  VALUES ('Pull-up (pronated)', 'strength', '{"vertical_pull"}'::text[], 'bilateral', 'posterior', 3, '{"bodyweight"}'::text[], 'Latissimus dorsi', '{"Brachialis","Biceps brachii","Lower trapezius","Rhomboids","Posterior deltoid","Forearm flexors"}'::text[], 'lengthened', 'regional', NULL, 'vertical', '{"Shoulder","Elbow"}'::text[], true)
  ON CONFLICT (name) DO UPDATE SET
    category = EXCLUDED.category,
    movement_patterns = EXCLUDED.movement_patterns,
    bilateral_unilateral = EXCLUDED.bilateral_unilateral,
    posterior_anterior = EXCLUDED.posterior_anterior,
    complexity = EXCLUDED.complexity,
    equipment = EXCLUDED.equipment,
    primary_muscle = EXCLUDED.primary_muscle,
    supporting_muscles = EXCLUDED.supporting_muscles,
    muscle_bias = EXCLUDED.muscle_bias,
    joint_count_level = EXCLUDED.joint_count_level,
    dynamic_isometric = EXCLUDED.dynamic_isometric,
    movement_plane = EXCLUDED.movement_plane,
    primary_joints = EXCLUDED.primary_joints,
    is_active = true,
    updated_at = now();

INSERT INTO exercise_library (name, category, movement_patterns, bilateral_unilateral, posterior_anterior, complexity, equipment, primary_muscle, supporting_muscles, muscle_bias, joint_count_level, dynamic_isometric, movement_plane, primary_joints, is_active)
  VALUES ('Weighted Pull-up (pronated)', 'strength', '{"vertical_pull"}'::text[], 'bilateral', 'posterior', 3, '{"bodyweight"}'::text[], 'Latissimus dorsi', '{"Brachialis","Biceps brachii","Lower trapezius","Rhomboids","Posterior deltoid","Forearm flexors"}'::text[], 'lengthened', 'regional', NULL, 'vertical', '{"Shoulder","Elbow"}'::text[], true)
  ON CONFLICT (name) DO UPDATE SET
    category = EXCLUDED.category,
    movement_patterns = EXCLUDED.movement_patterns,
    bilateral_unilateral = EXCLUDED.bilateral_unilateral,
    posterior_anterior = EXCLUDED.posterior_anterior,
    complexity = EXCLUDED.complexity,
    equipment = EXCLUDED.equipment,
    primary_muscle = EXCLUDED.primary_muscle,
    supporting_muscles = EXCLUDED.supporting_muscles,
    muscle_bias = EXCLUDED.muscle_bias,
    joint_count_level = EXCLUDED.joint_count_level,
    dynamic_isometric = EXCLUDED.dynamic_isometric,
    movement_plane = EXCLUDED.movement_plane,
    primary_joints = EXCLUDED.primary_joints,
    is_active = true,
    updated_at = now();

INSERT INTO exercise_library (name, category, movement_patterns, bilateral_unilateral, posterior_anterior, complexity, equipment, primary_muscle, supporting_muscles, muscle_bias, joint_count_level, dynamic_isometric, movement_plane, primary_joints, is_active)
  VALUES ('Pull-up (wide pronated)', 'strength', '{"vertical_pull"}'::text[], 'bilateral', 'posterior', 3, '{"bodyweight"}'::text[], 'Latissimus dorsi', '{"Teres major","Lower trapezius","Rhomboids","Posterior deltoid","Brachialis","Forearm flexors"}'::text[], 'lengthened', 'regional', NULL, 'vertical', '{"Shoulder","Elbow"}'::text[], true)
  ON CONFLICT (name) DO UPDATE SET
    category = EXCLUDED.category,
    movement_patterns = EXCLUDED.movement_patterns,
    bilateral_unilateral = EXCLUDED.bilateral_unilateral,
    posterior_anterior = EXCLUDED.posterior_anterior,
    complexity = EXCLUDED.complexity,
    equipment = EXCLUDED.equipment,
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
