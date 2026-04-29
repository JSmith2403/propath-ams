-- Brief 5c exercise library import — chunk 3/5
-- Source: exercise-library-import-2026-04-30.sql
-- Inserts 369-552 of 918.
-- Idempotent: every row uses ON CONFLICT (name) DO UPDATE.

BEGIN;

INSERT INTO exercise_library (name, category, movement_patterns, bilateral_unilateral, posterior_anterior, complexity, equipment, primary_muscle, supporting_muscles, muscle_bias, joint_count_level, dynamic_isometric, movement_plane, primary_joints, is_active)
  VALUES ('Trap Bar Bent Over Row', 'strength', '{"horizontal_pull"}'::text[], 'bilateral', 'posterior', 3, '{"trap_bar"}'::text[], 'Lats / Mid back', '{"Rhomboids","Middle trapezius","Posterior deltoid","Biceps brachii","Spinal erectors"}'::text[], 'lengthened', 'regional', NULL, 'horizontal', '{"Shoulder","Elbow"}'::text[], true)
  ON CONFLICT (name) DO UPDATE SET
    category = EXCLUDED.category,
    movement_patterns = EXCLUDED.movement_patterns,
    bilateral_unilateral = EXCLUDED.bilateral_unilateral,
    posterior_anterior = EXCLUDED.posterior_anterior,
    complexity = EXCLUDED.complexity,
    equipment = EXCLUDED.equipment,
    primary_muscle = EXCLUDED.primary_muscle,
    supporting_muscles = EXCLUDED.supporting_muscles,
    muscle_bias = EXCLUDED.muscle_bias,
    joint_count_level = EXCLUDED.joint_count_level,
    dynamic_isometric = EXCLUDED.dynamic_isometric,
    movement_plane = EXCLUDED.movement_plane,
    primary_joints = EXCLUDED.primary_joints,
    is_active = true,
    updated_at = now();

INSERT INTO exercise_library (name, category, movement_patterns, bilateral_unilateral, posterior_anterior, complexity, equipment, primary_muscle, supporting_muscles, muscle_bias, joint_count_level, dynamic_isometric, movement_plane, primary_joints, is_active)
  VALUES ('Incline Dumbbell Bench Press (neutral grip)', 'strength', '{"horizontal_push"}'::text[], 'bilateral', 'anterior', 2, '{"dumbbell"}'::text[], 'Upper pectoralis', '{"Anterior deltoid","Triceps brachii","Serratus anterior"}'::text[], 'mid', 'regional', NULL, 'horizontal', '{"Shoulder","Elbow"}'::text[], true)
  ON CONFLICT (name) DO UPDATE SET
    category = EXCLUDED.category,
    movement_patterns = EXCLUDED.movement_patterns,
    bilateral_unilateral = EXCLUDED.bilateral_unilateral,
    posterior_anterior = EXCLUDED.posterior_anterior,
    complexity = EXCLUDED.complexity,
    equipment = EXCLUDED.equipment,
    primary_muscle = EXCLUDED.primary_muscle,
    supporting_muscles = EXCLUDED.supporting_muscles,
    muscle_bias = EXCLUDED.muscle_bias,
    joint_count_level = EXCLUDED.joint_count_level,
    dynamic_isometric = EXCLUDED.dynamic_isometric,
    movement_plane = EXCLUDED.movement_plane,
    primary_joints = EXCLUDED.primary_joints,
    is_active = true,
    updated_at = now();

INSERT INTO exercise_library (name, category, movement_patterns, bilateral_unilateral, posterior_anterior, complexity, equipment, primary_muscle, supporting_muscles, muscle_bias, joint_count_level, dynamic_isometric, movement_plane, primary_joints, is_active)
  VALUES ('Incline Dumbbell Bench Press (semi-pronated grip)', 'strength', '{"horizontal_push"}'::text[], 'bilateral', 'anterior', 2, '{"dumbbell"}'::text[], 'Upper pectoralis', '{"Anterior deltoid","Triceps brachii","Serratus anterior"}'::text[], 'mid', 'regional', NULL, 'horizontal', '{"Shoulder","Elbow"}'::text[], true)
  ON CONFLICT (name) DO UPDATE SET
    category = EXCLUDED.category,
    movement_patterns = EXCLUDED.movement_patterns,
    bilateral_unilateral = EXCLUDED.bilateral_unilateral,
    posterior_anterior = EXCLUDED.posterior_anterior,
    complexity = EXCLUDED.complexity,
    equipment = EXCLUDED.equipment,
    primary_muscle = EXCLUDED.primary_muscle,
    supporting_muscles = EXCLUDED.supporting_muscles,
    muscle_bias = EXCLUDED.muscle_bias,
    joint_count_level = EXCLUDED.joint_count_level,
    dynamic_isometric = EXCLUDED.dynamic_isometric,
    movement_plane = EXCLUDED.movement_plane,
    primary_joints = EXCLUDED.primary_joints,
    is_active = true,
    updated_at = now();

INSERT INTO exercise_library (name, category, movement_patterns, bilateral_unilateral, posterior_anterior, complexity, equipment, primary_muscle, supporting_muscles, muscle_bias, joint_count_level, dynamic_isometric, movement_plane, primary_joints, is_active)
  VALUES ('Incline Dumbbell Bench Press (pronated grip)', 'strength', '{"horizontal_push"}'::text[], 'bilateral', 'anterior', 2, '{"dumbbell"}'::text[], 'Upper pectoralis', '{"Anterior deltoid","Triceps brachii","Serratus anterior"}'::text[], 'mid', 'regional', NULL, 'horizontal', '{"Shoulder","Elbow"}'::text[], true)
  ON CONFLICT (name) DO UPDATE SET
    category = EXCLUDED.category,
    movement_patterns = EXCLUDED.movement_patterns,
    bilateral_unilateral = EXCLUDED.bilateral_unilateral,
    posterior_anterior = EXCLUDED.posterior_anterior,
    complexity = EXCLUDED.complexity,
    equipment = EXCLUDED.equipment,
    primary_muscle = EXCLUDED.primary_muscle,
    supporting_muscles = EXCLUDED.supporting_muscles,
    muscle_bias = EXCLUDED.muscle_bias,
    joint_count_level = EXCLUDED.joint_count_level,
    dynamic_isometric = EXCLUDED.dynamic_isometric,
    movement_plane = EXCLUDED.movement_plane,
    primary_joints = EXCLUDED.primary_joints,
    is_active = true,
    updated_at = now();

INSERT INTO exercise_library (name, category, movement_patterns, bilateral_unilateral, posterior_anterior, complexity, equipment, primary_muscle, supporting_muscles, muscle_bias, joint_count_level, dynamic_isometric, movement_plane, primary_joints, is_active)
  VALUES ('Ring Push-up', 'strength', '{"horizontal_push"}'::text[], 'bilateral', 'anterior', 3, '{"suspension_trainer"}'::text[], 'Pectoralis major', '{"Triceps brachii","Anterior deltoid","Serratus anterior","Core stabilizers"}'::text[], 'lengthened', 'regional', NULL, 'horizontal', '{"Shoulder","Elbow"}'::text[], true)
  ON CONFLICT (name) DO UPDATE SET
    category = EXCLUDED.category,
    movement_patterns = EXCLUDED.movement_patterns,
    bilateral_unilateral = EXCLUDED.bilateral_unilateral,
    posterior_anterior = EXCLUDED.posterior_anterior,
    complexity = EXCLUDED.complexity,
    equipment = EXCLUDED.equipment,
    primary_muscle = EXCLUDED.primary_muscle,
    supporting_muscles = EXCLUDED.supporting_muscles,
    muscle_bias = EXCLUDED.muscle_bias,
    joint_count_level = EXCLUDED.joint_count_level,
    dynamic_isometric = EXCLUDED.dynamic_isometric,
    movement_plane = EXCLUDED.movement_plane,
    primary_joints = EXCLUDED.primary_joints,
    is_active = true,
    updated_at = now();

INSERT INTO exercise_library (name, category, movement_patterns, bilateral_unilateral, posterior_anterior, complexity, equipment, primary_muscle, supporting_muscles, muscle_bias, joint_count_level, dynamic_isometric, movement_plane, primary_joints, is_active)
  VALUES ('Weighted Ring Push-up', 'strength', '{"horizontal_push"}'::text[], 'bilateral', 'anterior', 3, '{"suspension_trainer"}'::text[], 'Pectoralis major', '{"Triceps brachii","Anterior deltoid","Serratus anterior","Core stabilizers"}'::text[], 'lengthened', 'regional', NULL, 'horizontal', '{"Shoulder","Elbow"}'::text[], true)
  ON CONFLICT (name) DO UPDATE SET
    category = EXCLUDED.category,
    movement_patterns = EXCLUDED.movement_patterns,
    bilateral_unilateral = EXCLUDED.bilateral_unilateral,
    posterior_anterior = EXCLUDED.posterior_anterior,
    complexity = EXCLUDED.complexity,
    equipment = EXCLUDED.equipment,
    primary_muscle = EXCLUDED.primary_muscle,
    supporting_muscles = EXCLUDED.supporting_muscles,
    muscle_bias = EXCLUDED.muscle_bias,
    joint_count_level = EXCLUDED.joint_count_level,
    dynamic_isometric = EXCLUDED.dynamic_isometric,
    movement_plane = EXCLUDED.movement_plane,
    primary_joints = EXCLUDED.primary_joints,
    is_active = true,
    updated_at = now();

INSERT INTO exercise_library (name, category, movement_patterns, bilateral_unilateral, posterior_anterior, complexity, equipment, primary_muscle, supporting_muscles, muscle_bias, joint_count_level, dynamic_isometric, movement_plane, primary_joints, is_active)
  VALUES ('Feet Elevated Ring Push-up', 'strength', '{"horizontal_push"}'::text[], 'bilateral', 'anterior', 3, '{"suspension_trainer"}'::text[], 'Upper pectoralis', '{"Anterior deltoid","Triceps brachii","Serratus anterior","Core stabilizers"}'::text[], 'lengthened', 'regional', NULL, 'horizontal', '{"Shoulder","Elbow"}'::text[], true)
  ON CONFLICT (name) DO UPDATE SET
    category = EXCLUDED.category,
    movement_patterns = EXCLUDED.movement_patterns,
    bilateral_unilateral = EXCLUDED.bilateral_unilateral,
    posterior_anterior = EXCLUDED.posterior_anterior,
    complexity = EXCLUDED.complexity,
    equipment = EXCLUDED.equipment,
    primary_muscle = EXCLUDED.primary_muscle,
    supporting_muscles = EXCLUDED.supporting_muscles,
    muscle_bias = EXCLUDED.muscle_bias,
    joint_count_level = EXCLUDED.joint_count_level,
    dynamic_isometric = EXCLUDED.dynamic_isometric,
    movement_plane = EXCLUDED.movement_plane,
    primary_joints = EXCLUDED.primary_joints,
    is_active = true,
    updated_at = now();

INSERT INTO exercise_library (name, category, movement_patterns, bilateral_unilateral, posterior_anterior, complexity, equipment, primary_muscle, supporting_muscles, muscle_bias, joint_count_level, dynamic_isometric, movement_plane, primary_joints, is_active)
  VALUES ('Weighted Feet Elevated Ring Push-up', 'strength', '{"horizontal_push"}'::text[], 'bilateral', 'anterior', 3, '{"suspension_trainer"}'::text[], 'Upper pectoralis', '{"Anterior deltoid","Triceps brachii","Serratus anterior","Core stabilizers"}'::text[], 'lengthened', 'regional', NULL, 'horizontal', '{"Shoulder","Elbow"}'::text[], true)
  ON CONFLICT (name) DO UPDATE SET
    category = EXCLUDED.category,
    movement_patterns = EXCLUDED.movement_patterns,
    bilateral_unilateral = EXCLUDED.bilateral_unilateral,
    posterior_anterior = EXCLUDED.posterior_anterior,
    complexity = EXCLUDED.complexity,
    equipment = EXCLUDED.equipment,
    primary_muscle = EXCLUDED.primary_muscle,
    supporting_muscles = EXCLUDED.supporting_muscles,
    muscle_bias = EXCLUDED.muscle_bias,
    joint_count_level = EXCLUDED.joint_count_level,
    dynamic_isometric = EXCLUDED.dynamic_isometric,
    movement_plane = EXCLUDED.movement_plane,
    primary_joints = EXCLUDED.primary_joints,
    is_active = true,
    updated_at = now();

INSERT INTO exercise_library (name, category, movement_patterns, bilateral_unilateral, posterior_anterior, complexity, equipment, primary_muscle, supporting_muscles, muscle_bias, joint_count_level, dynamic_isometric, movement_plane, primary_joints, is_active)
  VALUES ('Ring Support Hold (top of dip)', 'strength', '{"vertical_push"}'::text[], 'bilateral', 'anterior', 3, '{"suspension_trainer"}'::text[], 'Triceps brachii', '{"Serratus anterior","Anterior deltoid","Rotator cuff","Lower trapezius"}'::text[], 'shortened', 'regional', NULL, 'vertical', '{"Shoulder","Elbow"}'::text[], true)
  ON CONFLICT (name) DO UPDATE SET
    category = EXCLUDED.category,
    movement_patterns = EXCLUDED.movement_patterns,
    bilateral_unilateral = EXCLUDED.bilateral_unilateral,
    posterior_anterior = EXCLUDED.posterior_anterior,
    complexity = EXCLUDED.complexity,
    equipment = EXCLUDED.equipment,
    primary_muscle = EXCLUDED.primary_muscle,
    supporting_muscles = EXCLUDED.supporting_muscles,
    muscle_bias = EXCLUDED.muscle_bias,
    joint_count_level = EXCLUDED.joint_count_level,
    dynamic_isometric = EXCLUDED.dynamic_isometric,
    movement_plane = EXCLUDED.movement_plane,
    primary_joints = EXCLUDED.primary_joints,
    is_active = true,
    updated_at = now();

INSERT INTO exercise_library (name, category, movement_patterns, bilateral_unilateral, posterior_anterior, complexity, equipment, primary_muscle, supporting_muscles, muscle_bias, joint_count_level, dynamic_isometric, movement_plane, primary_joints, is_active)
  VALUES ('Ring Support Hold (bottom of dip)', 'strength', '{"vertical_push"}'::text[], 'bilateral', 'anterior', 3, '{"suspension_trainer"}'::text[], 'Pectoralis major', '{"Triceps brachii","Anterior deltoid","Serratus anterior","Rotator cuff"}'::text[], 'lengthened', 'regional', NULL, 'vertical', '{"Shoulder","Elbow"}'::text[], true)
  ON CONFLICT (name) DO UPDATE SET
    category = EXCLUDED.category,
    movement_patterns = EXCLUDED.movement_patterns,
    bilateral_unilateral = EXCLUDED.bilateral_unilateral,
    posterior_anterior = EXCLUDED.posterior_anterior,
    complexity = EXCLUDED.complexity,
    equipment = EXCLUDED.equipment,
    primary_muscle = EXCLUDED.primary_muscle,
    supporting_muscles = EXCLUDED.supporting_muscles,
    muscle_bias = EXCLUDED.muscle_bias,
    joint_count_level = EXCLUDED.joint_count_level,
    dynamic_isometric = EXCLUDED.dynamic_isometric,
    movement_plane = EXCLUDED.movement_plane,
    primary_joints = EXCLUDED.primary_joints,
    is_active = true,
    updated_at = now();

INSERT INTO exercise_library (name, category, movement_patterns, bilateral_unilateral, posterior_anterior, complexity, equipment, primary_muscle, supporting_muscles, muscle_bias, joint_count_level, dynamic_isometric, movement_plane, primary_joints, is_active)
  VALUES ('Weighted Wall Facing Strict Handstand Push-up', 'strength', '{"vertical_push"}'::text[], 'bilateral', 'anterior', 3, '{"bodyweight"}'::text[], 'Anterior deltoid', '{"Triceps brachii","Upper trapezius","Serratus anterior","Core stabilizers"}'::text[], 'lengthened', 'regional', NULL, 'vertical', '{"Shoulder","Elbow"}'::text[], true)
  ON CONFLICT (name) DO UPDATE SET
    category = EXCLUDED.category,
    movement_patterns = EXCLUDED.movement_patterns,
    bilateral_unilateral = EXCLUDED.bilateral_unilateral,
    posterior_anterior = EXCLUDED.posterior_anterior,
    complexity = EXCLUDED.complexity,
    equipment = EXCLUDED.equipment,
    primary_muscle = EXCLUDED.primary_muscle,
    supporting_muscles = EXCLUDED.supporting_muscles,
    muscle_bias = EXCLUDED.muscle_bias,
    joint_count_level = EXCLUDED.joint_count_level,
    dynamic_isometric = EXCLUDED.dynamic_isometric,
    movement_plane = EXCLUDED.movement_plane,
    primary_joints = EXCLUDED.primary_joints,
    is_active = true,
    updated_at = now();

INSERT INTO exercise_library (name, category, movement_patterns, bilateral_unilateral, posterior_anterior, complexity, equipment, primary_muscle, supporting_muscles, muscle_bias, joint_count_level, dynamic_isometric, movement_plane, primary_joints, is_active)
  VALUES ('Weighted Back to Wall Handstand Push-up', 'strength', '{"vertical_push"}'::text[], 'bilateral', 'anterior', 3, '{"bodyweight"}'::text[], 'Anterior deltoid', '{"Triceps brachii","Upper trapezius","Serratus anterior","Core stabilizers"}'::text[], 'lengthened', 'regional', NULL, 'vertical', '{"Shoulder","Elbow"}'::text[], true)
  ON CONFLICT (name) DO UPDATE SET
    category = EXCLUDED.category,
    movement_patterns = EXCLUDED.movement_patterns,
    bilateral_unilateral = EXCLUDED.bilateral_unilateral,
    posterior_anterior = EXCLUDED.posterior_anterior,
    complexity = EXCLUDED.complexity,
    equipment = EXCLUDED.equipment,
    primary_muscle = EXCLUDED.primary_muscle,
    supporting_muscles = EXCLUDED.supporting_muscles,
    muscle_bias = EXCLUDED.muscle_bias,
    joint_count_level = EXCLUDED.joint_count_level,
    dynamic_isometric = EXCLUDED.dynamic_isometric,
    movement_plane = EXCLUDED.movement_plane,
    primary_joints = EXCLUDED.primary_joints,
    is_active = true,
    updated_at = now();

INSERT INTO exercise_library (name, category, movement_patterns, bilateral_unilateral, posterior_anterior, complexity, equipment, primary_muscle, supporting_muscles, muscle_bias, joint_count_level, dynamic_isometric, movement_plane, primary_joints, is_active)
  VALUES ('DB bent over row (neutral grip)', 'strength', '{"horizontal_pull"}'::text[], 'bilateral', 'posterior', 2, '{"dumbbell"}'::text[], 'Lats / Mid back', '{"Biceps brachii","Rhomboids","Middle trapezius","Posterior deltoid","Spinal erectors"}'::text[], 'mid', 'regional', NULL, 'horizontal', '{"Shoulder","Elbow","Hip"}'::text[], true)
  ON CONFLICT (name) DO UPDATE SET
    category = EXCLUDED.category,
    movement_patterns = EXCLUDED.movement_patterns,
    bilateral_unilateral = EXCLUDED.bilateral_unilateral,
    posterior_anterior = EXCLUDED.posterior_anterior,
    complexity = EXCLUDED.complexity,
    equipment = EXCLUDED.equipment,
    primary_muscle = EXCLUDED.primary_muscle,
    supporting_muscles = EXCLUDED.supporting_muscles,
    muscle_bias = EXCLUDED.muscle_bias,
    joint_count_level = EXCLUDED.joint_count_level,
    dynamic_isometric = EXCLUDED.dynamic_isometric,
    movement_plane = EXCLUDED.movement_plane,
    primary_joints = EXCLUDED.primary_joints,
    is_active = true,
    updated_at = now();

INSERT INTO exercise_library (name, category, movement_patterns, bilateral_unilateral, posterior_anterior, complexity, equipment, primary_muscle, supporting_muscles, muscle_bias, joint_count_level, dynamic_isometric, movement_plane, primary_joints, is_active)
  VALUES ('DB bent over row (semi-pronated grip)', 'strength', '{"horizontal_pull"}'::text[], 'bilateral', 'posterior', 2, '{"dumbbell"}'::text[], 'Lats / Upper back', '{"Rhomboids","Middle trapezius","Posterior deltoid","Biceps brachii","Spinal erectors"}'::text[], 'shortened', 'regional', NULL, 'horizontal', '{"Shoulder","Elbow","Hip"}'::text[], true)
  ON CONFLICT (name) DO UPDATE SET
    category = EXCLUDED.category,
    movement_patterns = EXCLUDED.movement_patterns,
    bilateral_unilateral = EXCLUDED.bilateral_unilateral,
    posterior_anterior = EXCLUDED.posterior_anterior,
    complexity = EXCLUDED.complexity,
    equipment = EXCLUDED.equipment,
    primary_muscle = EXCLUDED.primary_muscle,
    supporting_muscles = EXCLUDED.supporting_muscles,
    muscle_bias = EXCLUDED.muscle_bias,
    joint_count_level = EXCLUDED.joint_count_level,
    dynamic_isometric = EXCLUDED.dynamic_isometric,
    movement_plane = EXCLUDED.movement_plane,
    primary_joints = EXCLUDED.primary_joints,
    is_active = true,
    updated_at = now();

INSERT INTO exercise_library (name, category, movement_patterns, bilateral_unilateral, posterior_anterior, complexity, equipment, primary_muscle, supporting_muscles, muscle_bias, joint_count_level, dynamic_isometric, movement_plane, primary_joints, is_active)
  VALUES ('Single arm DB bent over row', 'strength', '{"horizontal_pull"}'::text[], 'unilateral', 'posterior', 2, '{"dumbbell"}'::text[], 'Lats / Mid back', '{"Biceps brachii","Rhomboids","Middle trapezius","Posterior deltoid","Spinal erectors"}'::text[], 'mid', 'regional', NULL, 'horizontal', '{"Shoulder","Elbow","Hip"}'::text[], true)
  ON CONFLICT (name) DO UPDATE SET
    category = EXCLUDED.category,
    movement_patterns = EXCLUDED.movement_patterns,
    bilateral_unilateral = EXCLUDED.bilateral_unilateral,
    posterior_anterior = EXCLUDED.posterior_anterior,
    complexity = EXCLUDED.complexity,
    equipment = EXCLUDED.equipment,
    primary_muscle = EXCLUDED.primary_muscle,
    supporting_muscles = EXCLUDED.supporting_muscles,
    muscle_bias = EXCLUDED.muscle_bias,
    joint_count_level = EXCLUDED.joint_count_level,
    dynamic_isometric = EXCLUDED.dynamic_isometric,
    movement_plane = EXCLUDED.movement_plane,
    primary_joints = EXCLUDED.primary_joints,
    is_active = true,
    updated_at = now();

INSERT INTO exercise_library (name, category, movement_patterns, bilateral_unilateral, posterior_anterior, complexity, equipment, primary_muscle, supporting_muscles, muscle_bias, joint_count_level, dynamic_isometric, movement_plane, primary_joints, is_active)
  VALUES ('Split stance single arm DB bent over row', 'strength', '{"horizontal_pull"}'::text[], 'unilateral', 'posterior', 2, '{"dumbbell"}'::text[], 'Lats / Mid back', '{"Biceps brachii","Rhomboids","Middle trapezius","Posterior deltoid","Spinal erectors"}'::text[], 'mid', 'regional', NULL, 'horizontal', '{"Shoulder","Elbow","Hip"}'::text[], true)
  ON CONFLICT (name) DO UPDATE SET
    category = EXCLUDED.category,
    movement_patterns = EXCLUDED.movement_patterns,
    bilateral_unilateral = EXCLUDED.bilateral_unilateral,
    posterior_anterior = EXCLUDED.posterior_anterior,
    complexity = EXCLUDED.complexity,
    equipment = EXCLUDED.equipment,
    primary_muscle = EXCLUDED.primary_muscle,
    supporting_muscles = EXCLUDED.supporting_muscles,
    muscle_bias = EXCLUDED.muscle_bias,
    joint_count_level = EXCLUDED.joint_count_level,
    dynamic_isometric = EXCLUDED.dynamic_isometric,
    movement_plane = EXCLUDED.movement_plane,
    primary_joints = EXCLUDED.primary_joints,
    is_active = true,
    updated_at = now();

INSERT INTO exercise_library (name, category, movement_patterns, bilateral_unilateral, posterior_anterior, complexity, equipment, primary_muscle, supporting_muscles, muscle_bias, joint_count_level, dynamic_isometric, movement_plane, primary_joints, is_active)
  VALUES ('Dumbbell Goblet Squat', 'strength', '{"squat"}'::text[], 'bilateral', 'anterior', 2, '{"dumbbell"}'::text[], 'Quadriceps', '{"Glute max","Adductors","Spinal erectors"}'::text[], 'mid', 'regional', NULL, NULL, '{"Knee","Hip"}'::text[], true)
  ON CONFLICT (name) DO UPDATE SET
    category = EXCLUDED.category,
    movement_patterns = EXCLUDED.movement_patterns,
    bilateral_unilateral = EXCLUDED.bilateral_unilateral,
    posterior_anterior = EXCLUDED.posterior_anterior,
    complexity = EXCLUDED.complexity,
    equipment = EXCLUDED.equipment,
    primary_muscle = EXCLUDED.primary_muscle,
    supporting_muscles = EXCLUDED.supporting_muscles,
    muscle_bias = EXCLUDED.muscle_bias,
    joint_count_level = EXCLUDED.joint_count_level,
    dynamic_isometric = EXCLUDED.dynamic_isometric,
    movement_plane = EXCLUDED.movement_plane,
    primary_joints = EXCLUDED.primary_joints,
    is_active = true,
    updated_at = now();

INSERT INTO exercise_library (name, category, movement_patterns, bilateral_unilateral, posterior_anterior, complexity, equipment, primary_muscle, supporting_muscles, muscle_bias, joint_count_level, dynamic_isometric, movement_plane, primary_joints, is_active)
  VALUES ('Dumbbell Goblet Cyclist Squat', 'strength', '{"squat"}'::text[], 'bilateral', 'anterior', 2, '{"dumbbell"}'::text[], 'Quadriceps', '{"Glute max","Adductors"}'::text[], 'shortened', 'regional', NULL, NULL, '{"Knee","Hip"}'::text[], true)
  ON CONFLICT (name) DO UPDATE SET
    category = EXCLUDED.category,
    movement_patterns = EXCLUDED.movement_patterns,
    bilateral_unilateral = EXCLUDED.bilateral_unilateral,
    posterior_anterior = EXCLUDED.posterior_anterior,
    complexity = EXCLUDED.complexity,
    equipment = EXCLUDED.equipment,
    primary_muscle = EXCLUDED.primary_muscle,
    supporting_muscles = EXCLUDED.supporting_muscles,
    muscle_bias = EXCLUDED.muscle_bias,
    joint_count_level = EXCLUDED.joint_count_level,
    dynamic_isometric = EXCLUDED.dynamic_isometric,
    movement_plane = EXCLUDED.movement_plane,
    primary_joints = EXCLUDED.primary_joints,
    is_active = true,
    updated_at = now();

INSERT INTO exercise_library (name, category, movement_patterns, bilateral_unilateral, posterior_anterior, complexity, equipment, primary_muscle, supporting_muscles, muscle_bias, joint_count_level, dynamic_isometric, movement_plane, primary_joints, is_active)
  VALUES ('Leg Press (Fixed Machine)', 'strength', '{"squat"}'::text[], 'bilateral', 'anterior', 2, '{"fixed_machine"}'::text[], 'Quadriceps', '{"Glute max","Adductors"}'::text[], 'mid', 'regional', NULL, NULL, '{"Knee","Hip"}'::text[], true)
  ON CONFLICT (name) DO UPDATE SET
    category = EXCLUDED.category,
    movement_patterns = EXCLUDED.movement_patterns,
    bilateral_unilateral = EXCLUDED.bilateral_unilateral,
    posterior_anterior = EXCLUDED.posterior_anterior,
    complexity = EXCLUDED.complexity,
    equipment = EXCLUDED.equipment,
    primary_muscle = EXCLUDED.primary_muscle,
    supporting_muscles = EXCLUDED.supporting_muscles,
    muscle_bias = EXCLUDED.muscle_bias,
    joint_count_level = EXCLUDED.joint_count_level,
    dynamic_isometric = EXCLUDED.dynamic_isometric,
    movement_plane = EXCLUDED.movement_plane,
    primary_joints = EXCLUDED.primary_joints,
    is_active = true,
    updated_at = now();

INSERT INTO exercise_library (name, category, movement_patterns, bilateral_unilateral, posterior_anterior, complexity, equipment, primary_muscle, supporting_muscles, muscle_bias, joint_count_level, dynamic_isometric, movement_plane, primary_joints, is_active)
  VALUES ('Leg Press (narrow stance) (Fixed Machine)', 'strength', '{"squat"}'::text[], 'bilateral', 'anterior', 2, '{"fixed_machine"}'::text[], 'Quadriceps', '{"Glute max","Adductors"}'::text[], 'mid', 'regional', NULL, NULL, '{"Knee","Hip"}'::text[], true)
  ON CONFLICT (name) DO UPDATE SET
    category = EXCLUDED.category,
    movement_patterns = EXCLUDED.movement_patterns,
    bilateral_unilateral = EXCLUDED.bilateral_unilateral,
    posterior_anterior = EXCLUDED.posterior_anterior,
    complexity = EXCLUDED.complexity,
    equipment = EXCLUDED.equipment,
    primary_muscle = EXCLUDED.primary_muscle,
    supporting_muscles = EXCLUDED.supporting_muscles,
    muscle_bias = EXCLUDED.muscle_bias,
    joint_count_level = EXCLUDED.joint_count_level,
    dynamic_isometric = EXCLUDED.dynamic_isometric,
    movement_plane = EXCLUDED.movement_plane,
    primary_joints = EXCLUDED.primary_joints,
    is_active = true,
    updated_at = now();

INSERT INTO exercise_library (name, category, movement_patterns, bilateral_unilateral, posterior_anterior, complexity, equipment, primary_muscle, supporting_muscles, muscle_bias, joint_count_level, dynamic_isometric, movement_plane, primary_joints, is_active)
  VALUES ('Leg Press (wide stance) (Fixed Machine)', 'strength', '{"squat"}'::text[], 'bilateral', 'posterior', 2, '{"fixed_machine"}'::text[], 'Glute max', '{"Quadriceps","Adductors"}'::text[], 'mid', 'regional', NULL, NULL, '{"Knee","Hip"}'::text[], true)
  ON CONFLICT (name) DO UPDATE SET
    category = EXCLUDED.category,
    movement_patterns = EXCLUDED.movement_patterns,
    bilateral_unilateral = EXCLUDED.bilateral_unilateral,
    posterior_anterior = EXCLUDED.posterior_anterior,
    complexity = EXCLUDED.complexity,
    equipment = EXCLUDED.equipment,
    primary_muscle = EXCLUDED.primary_muscle,
    supporting_muscles = EXCLUDED.supporting_muscles,
    muscle_bias = EXCLUDED.muscle_bias,
    joint_count_level = EXCLUDED.joint_count_level,
    dynamic_isometric = EXCLUDED.dynamic_isometric,
    movement_plane = EXCLUDED.movement_plane,
    primary_joints = EXCLUDED.primary_joints,
    is_active = true,
    updated_at = now();

INSERT INTO exercise_library (name, category, movement_patterns, bilateral_unilateral, posterior_anterior, complexity, equipment, primary_muscle, supporting_muscles, muscle_bias, joint_count_level, dynamic_isometric, movement_plane, primary_joints, is_active)
  VALUES ('Leg Press (high stance) (Fixed Machine)', 'strength', '{"squat"}'::text[], 'bilateral', 'posterior', 2, '{"fixed_machine"}'::text[], 'Glute max', '{"Hamstrings","Quadriceps"}'::text[], 'lengthened', 'regional', NULL, NULL, '{"Knee","Hip"}'::text[], true)
  ON CONFLICT (name) DO UPDATE SET
    category = EXCLUDED.category,
    movement_patterns = EXCLUDED.movement_patterns,
    bilateral_unilateral = EXCLUDED.bilateral_unilateral,
    posterior_anterior = EXCLUDED.posterior_anterior,
    complexity = EXCLUDED.complexity,
    equipment = EXCLUDED.equipment,
    primary_muscle = EXCLUDED.primary_muscle,
    supporting_muscles = EXCLUDED.supporting_muscles,
    muscle_bias = EXCLUDED.muscle_bias,
    joint_count_level = EXCLUDED.joint_count_level,
    dynamic_isometric = EXCLUDED.dynamic_isometric,
    movement_plane = EXCLUDED.movement_plane,
    primary_joints = EXCLUDED.primary_joints,
    is_active = true,
    updated_at = now();

INSERT INTO exercise_library (name, category, movement_patterns, bilateral_unilateral, posterior_anterior, complexity, equipment, primary_muscle, supporting_muscles, muscle_bias, joint_count_level, dynamic_isometric, movement_plane, primary_joints, is_active)
  VALUES ('Single Leg Leg Press (Fixed Machine)', 'strength', '{"squat"}'::text[], 'unilateral', 'anterior', 2, '{"fixed_machine"}'::text[], 'Quadriceps', '{"Glute max","Adductors"}'::text[], 'mid', 'regional', NULL, NULL, '{"Knee","Hip"}'::text[], true)
  ON CONFLICT (name) DO UPDATE SET
    category = EXCLUDED.category,
    movement_patterns = EXCLUDED.movement_patterns,
    bilateral_unilateral = EXCLUDED.bilateral_unilateral,
    posterior_anterior = EXCLUDED.posterior_anterior,
    complexity = EXCLUDED.complexity,
    equipment = EXCLUDED.equipment,
    primary_muscle = EXCLUDED.primary_muscle,
    supporting_muscles = EXCLUDED.supporting_muscles,
    muscle_bias = EXCLUDED.muscle_bias,
    joint_count_level = EXCLUDED.joint_count_level,
    dynamic_isometric = EXCLUDED.dynamic_isometric,
    movement_plane = EXCLUDED.movement_plane,
    primary_joints = EXCLUDED.primary_joints,
    is_active = true,
    updated_at = now();

INSERT INTO exercise_library (name, category, movement_patterns, bilateral_unilateral, posterior_anterior, complexity, equipment, primary_muscle, supporting_muscles, muscle_bias, joint_count_level, dynamic_isometric, movement_plane, primary_joints, is_active)
  VALUES ('Leg Extension (Fixed Machine)', 'strength', '{"squat"}'::text[], 'bilateral', 'anterior', 1, '{"fixed_machine"}'::text[], 'Quadriceps', '{}'::text[], 'shortened', 'local', NULL, NULL, '{"Knee"}'::text[], true)
  ON CONFLICT (name) DO UPDATE SET
    category = EXCLUDED.category,
    movement_patterns = EXCLUDED.movement_patterns,
    bilateral_unilateral = EXCLUDED.bilateral_unilateral,
    posterior_anterior = EXCLUDED.posterior_anterior,
    complexity = EXCLUDED.complexity,
    equipment = EXCLUDED.equipment,
    primary_muscle = EXCLUDED.primary_muscle,
    supporting_muscles = EXCLUDED.supporting_muscles,
    muscle_bias = EXCLUDED.muscle_bias,
    joint_count_level = EXCLUDED.joint_count_level,
    dynamic_isometric = EXCLUDED.dynamic_isometric,
    movement_plane = EXCLUDED.movement_plane,
    primary_joints = EXCLUDED.primary_joints,
    is_active = true,
    updated_at = now();

INSERT INTO exercise_library (name, category, movement_patterns, bilateral_unilateral, posterior_anterior, complexity, equipment, primary_muscle, supporting_muscles, muscle_bias, joint_count_level, dynamic_isometric, movement_plane, primary_joints, is_active)
  VALUES ('Single Leg Leg Extension (Fixed Machine)', 'strength', '{"squat"}'::text[], 'unilateral', 'anterior', 1, '{"fixed_machine"}'::text[], 'Quadriceps', '{}'::text[], 'shortened', 'local', NULL, NULL, '{"Knee"}'::text[], true)
  ON CONFLICT (name) DO UPDATE SET
    category = EXCLUDED.category,
    movement_patterns = EXCLUDED.movement_patterns,
    bilateral_unilateral = EXCLUDED.bilateral_unilateral,
    posterior_anterior = EXCLUDED.posterior_anterior,
    complexity = EXCLUDED.complexity,
    equipment = EXCLUDED.equipment,
    primary_muscle = EXCLUDED.primary_muscle,
    supporting_muscles = EXCLUDED.supporting_muscles,
    muscle_bias = EXCLUDED.muscle_bias,
    joint_count_level = EXCLUDED.joint_count_level,
    dynamic_isometric = EXCLUDED.dynamic_isometric,
    movement_plane = EXCLUDED.movement_plane,
    primary_joints = EXCLUDED.primary_joints,
    is_active = true,
    updated_at = now();

INSERT INTO exercise_library (name, category, movement_patterns, bilateral_unilateral, posterior_anterior, complexity, equipment, primary_muscle, supporting_muscles, muscle_bias, joint_count_level, dynamic_isometric, movement_plane, primary_joints, is_active)
  VALUES ('Banded Terminal Knee Extension (TKE)', 'strength', '{"squat"}'::text[], 'unilateral', 'anterior', 1, '{"band"}'::text[], 'Quadriceps', '{}'::text[], 'shortened', 'local', NULL, NULL, '{"Knee"}'::text[], true)
  ON CONFLICT (name) DO UPDATE SET
    category = EXCLUDED.category,
    movement_patterns = EXCLUDED.movement_patterns,
    bilateral_unilateral = EXCLUDED.bilateral_unilateral,
    posterior_anterior = EXCLUDED.posterior_anterior,
    complexity = EXCLUDED.complexity,
    equipment = EXCLUDED.equipment,
    primary_muscle = EXCLUDED.primary_muscle,
    supporting_muscles = EXCLUDED.supporting_muscles,
    muscle_bias = EXCLUDED.muscle_bias,
    joint_count_level = EXCLUDED.joint_count_level,
    dynamic_isometric = EXCLUDED.dynamic_isometric,
    movement_plane = EXCLUDED.movement_plane,
    primary_joints = EXCLUDED.primary_joints,
    is_active = true,
    updated_at = now();

INSERT INTO exercise_library (name, category, movement_patterns, bilateral_unilateral, posterior_anterior, complexity, equipment, primary_muscle, supporting_muscles, muscle_bias, joint_count_level, dynamic_isometric, movement_plane, primary_joints, is_active)
  VALUES ('Cable Terminal Knee Extension (TKE)', 'strength', '{"squat"}'::text[], 'unilateral', 'anterior', 1, '{"cable"}'::text[], 'Quadriceps', '{}'::text[], 'shortened', 'local', NULL, NULL, '{"Knee"}'::text[], true)
  ON CONFLICT (name) DO UPDATE SET
    category = EXCLUDED.category,
    movement_patterns = EXCLUDED.movement_patterns,
    bilateral_unilateral = EXCLUDED.bilateral_unilateral,
    posterior_anterior = EXCLUDED.posterior_anterior,
    complexity = EXCLUDED.complexity,
    equipment = EXCLUDED.equipment,
    primary_muscle = EXCLUDED.primary_muscle,
    supporting_muscles = EXCLUDED.supporting_muscles,
    muscle_bias = EXCLUDED.muscle_bias,
    joint_count_level = EXCLUDED.joint_count_level,
    dynamic_isometric = EXCLUDED.dynamic_isometric,
    movement_plane = EXCLUDED.movement_plane,
    primary_joints = EXCLUDED.primary_joints,
    is_active = true,
    updated_at = now();

INSERT INTO exercise_library (name, category, movement_patterns, bilateral_unilateral, posterior_anterior, complexity, equipment, primary_muscle, supporting_muscles, muscle_bias, joint_count_level, dynamic_isometric, movement_plane, primary_joints, is_active)
  VALUES ('Natural Knee Extension', 'strength', '{"squat"}'::text[], 'bilateral', 'anterior', 2, '{"bodyweight"}'::text[], 'Quadriceps', '{"Hip flexors","Core"}'::text[], 'mid', 'local', NULL, NULL, '{"Knee"}'::text[], true)
  ON CONFLICT (name) DO UPDATE SET
    category = EXCLUDED.category,
    movement_patterns = EXCLUDED.movement_patterns,
    bilateral_unilateral = EXCLUDED.bilateral_unilateral,
    posterior_anterior = EXCLUDED.posterior_anterior,
    complexity = EXCLUDED.complexity,
    equipment = EXCLUDED.equipment,
    primary_muscle = EXCLUDED.primary_muscle,
    supporting_muscles = EXCLUDED.supporting_muscles,
    muscle_bias = EXCLUDED.muscle_bias,
    joint_count_level = EXCLUDED.joint_count_level,
    dynamic_isometric = EXCLUDED.dynamic_isometric,
    movement_plane = EXCLUDED.movement_plane,
    primary_joints = EXCLUDED.primary_joints,
    is_active = true,
    updated_at = now();

INSERT INTO exercise_library (name, category, movement_patterns, bilateral_unilateral, posterior_anterior, complexity, equipment, primary_muscle, supporting_muscles, muscle_bias, joint_count_level, dynamic_isometric, movement_plane, primary_joints, is_active)
  VALUES ('Spanish Squat (Resistance band)', 'strength', '{"squat"}'::text[], 'bilateral', 'anterior', 2, '{"band"}'::text[], 'Quadriceps', '{"Glute max","Adductors"}'::text[], 'mid', 'regional', NULL, NULL, '{"Knee","Hip"}'::text[], true)
  ON CONFLICT (name) DO UPDATE SET
    category = EXCLUDED.category,
    movement_patterns = EXCLUDED.movement_patterns,
    bilateral_unilateral = EXCLUDED.bilateral_unilateral,
    posterior_anterior = EXCLUDED.posterior_anterior,
    complexity = EXCLUDED.complexity,
    equipment = EXCLUDED.equipment,
    primary_muscle = EXCLUDED.primary_muscle,
    supporting_muscles = EXCLUDED.supporting_muscles,
    muscle_bias = EXCLUDED.muscle_bias,
    joint_count_level = EXCLUDED.joint_count_level,
    dynamic_isometric = EXCLUDED.dynamic_isometric,
    movement_plane = EXCLUDED.movement_plane,
    primary_joints = EXCLUDED.primary_joints,
    is_active = true,
    updated_at = now();

INSERT INTO exercise_library (name, category, movement_patterns, bilateral_unilateral, posterior_anterior, complexity, equipment, primary_muscle, supporting_muscles, muscle_bias, joint_count_level, dynamic_isometric, movement_plane, primary_joints, is_active)
  VALUES ('Banded Spanish Squat (glute mini band at knees)', 'strength', '{"squat"}'::text[], 'bilateral', 'anterior', 2, '{"band"}'::text[], 'Quadriceps', '{"Glute max","Glute med/min"}'::text[], 'mid', 'regional', NULL, NULL, '{"Knee","Hip"}'::text[], true)
  ON CONFLICT (name) DO UPDATE SET
    category = EXCLUDED.category,
    movement_patterns = EXCLUDED.movement_patterns,
    bilateral_unilateral = EXCLUDED.bilateral_unilateral,
    posterior_anterior = EXCLUDED.posterior_anterior,
    complexity = EXCLUDED.complexity,
    equipment = EXCLUDED.equipment,
    primary_muscle = EXCLUDED.primary_muscle,
    supporting_muscles = EXCLUDED.supporting_muscles,
    muscle_bias = EXCLUDED.muscle_bias,
    joint_count_level = EXCLUDED.joint_count_level,
    dynamic_isometric = EXCLUDED.dynamic_isometric,
    movement_plane = EXCLUDED.movement_plane,
    primary_joints = EXCLUDED.primary_joints,
    is_active = true,
    updated_at = now();

INSERT INTO exercise_library (name, category, movement_patterns, bilateral_unilateral, posterior_anterior, complexity, equipment, primary_muscle, supporting_muscles, muscle_bias, joint_count_level, dynamic_isometric, movement_plane, primary_joints, is_active)
  VALUES ('Wall Sit (isometric)', 'strength', '{"squat"}'::text[], 'bilateral', 'anterior', 1, '{"bodyweight"}'::text[], 'Quadriceps', '{"Glute max"}'::text[], 'mid', 'regional', NULL, NULL, '{"Knee","Hip"}'::text[], true)
  ON CONFLICT (name) DO UPDATE SET
    category = EXCLUDED.category,
    movement_patterns = EXCLUDED.movement_patterns,
    bilateral_unilateral = EXCLUDED.bilateral_unilateral,
    posterior_anterior = EXCLUDED.posterior_anterior,
    complexity = EXCLUDED.complexity,
    equipment = EXCLUDED.equipment,
    primary_muscle = EXCLUDED.primary_muscle,
    supporting_muscles = EXCLUDED.supporting_muscles,
    muscle_bias = EXCLUDED.muscle_bias,
    joint_count_level = EXCLUDED.joint_count_level,
    dynamic_isometric = EXCLUDED.dynamic_isometric,
    movement_plane = EXCLUDED.movement_plane,
    primary_joints = EXCLUDED.primary_joints,
    is_active = true,
    updated_at = now();

INSERT INTO exercise_library (name, category, movement_patterns, bilateral_unilateral, posterior_anterior, complexity, equipment, primary_muscle, supporting_muscles, muscle_bias, joint_count_level, dynamic_isometric, movement_plane, primary_joints, is_active)
  VALUES ('Wall Sit (weighted)', 'strength', '{"squat"}'::text[], 'bilateral', 'anterior', 1, '{"dumbbell"}'::text[], 'Quadriceps', '{"Glute max"}'::text[], 'mid', 'regional', NULL, NULL, '{"Knee","Hip"}'::text[], true)
  ON CONFLICT (name) DO UPDATE SET
    category = EXCLUDED.category,
    movement_patterns = EXCLUDED.movement_patterns,
    bilateral_unilateral = EXCLUDED.bilateral_unilateral,
    posterior_anterior = EXCLUDED.posterior_anterior,
    complexity = EXCLUDED.complexity,
    equipment = EXCLUDED.equipment,
    primary_muscle = EXCLUDED.primary_muscle,
    supporting_muscles = EXCLUDED.supporting_muscles,
    muscle_bias = EXCLUDED.muscle_bias,
    joint_count_level = EXCLUDED.joint_count_level,
    dynamic_isometric = EXCLUDED.dynamic_isometric,
    movement_plane = EXCLUDED.movement_plane,
    primary_joints = EXCLUDED.primary_joints,
    is_active = true,
    updated_at = now();

INSERT INTO exercise_library (name, category, movement_patterns, bilateral_unilateral, posterior_anterior, complexity, equipment, primary_muscle, supporting_muscles, muscle_bias, joint_count_level, dynamic_isometric, movement_plane, primary_joints, is_active)
  VALUES ('Low side Step-up', 'strength', '{"step_up"}'::text[], 'unilateral', 'anterior', 2, '{"bodyweight"}'::text[], 'Quadriceps', '{"Glute max","Adductors"}'::text[], 'mid', 'regional', NULL, NULL, '{"Knee","Hip"}'::text[], true)
  ON CONFLICT (name) DO UPDATE SET
    category = EXCLUDED.category,
    movement_patterns = EXCLUDED.movement_patterns,
    bilateral_unilateral = EXCLUDED.bilateral_unilateral,
    posterior_anterior = EXCLUDED.posterior_anterior,
    complexity = EXCLUDED.complexity,
    equipment = EXCLUDED.equipment,
    primary_muscle = EXCLUDED.primary_muscle,
    supporting_muscles = EXCLUDED.supporting_muscles,
    muscle_bias = EXCLUDED.muscle_bias,
    joint_count_level = EXCLUDED.joint_count_level,
    dynamic_isometric = EXCLUDED.dynamic_isometric,
    movement_plane = EXCLUDED.movement_plane,
    primary_joints = EXCLUDED.primary_joints,
    is_active = true,
    updated_at = now();

INSERT INTO exercise_library (name, category, movement_patterns, bilateral_unilateral, posterior_anterior, complexity, equipment, primary_muscle, supporting_muscles, muscle_bias, joint_count_level, dynamic_isometric, movement_plane, primary_joints, is_active)
  VALUES ('Low side Step-up (weighted)', 'strength', '{"step_up"}'::text[], 'unilateral', 'anterior', 2, '{"dumbbell"}'::text[], 'Quadriceps', '{"Glute max","Adductors"}'::text[], 'mid', 'regional', NULL, NULL, '{"Knee","Hip"}'::text[], true)
  ON CONFLICT (name) DO UPDATE SET
    category = EXCLUDED.category,
    movement_patterns = EXCLUDED.movement_patterns,
    bilateral_unilateral = EXCLUDED.bilateral_unilateral,
    posterior_anterior = EXCLUDED.posterior_anterior,
    complexity = EXCLUDED.complexity,
    equipment = EXCLUDED.equipment,
    primary_muscle = EXCLUDED.primary_muscle,
    supporting_muscles = EXCLUDED.supporting_muscles,
    muscle_bias = EXCLUDED.muscle_bias,
    joint_count_level = EXCLUDED.joint_count_level,
    dynamic_isometric = EXCLUDED.dynamic_isometric,
    movement_plane = EXCLUDED.movement_plane,
    primary_joints = EXCLUDED.primary_joints,
    is_active = true,
    updated_at = now();

INSERT INTO exercise_library (name, category, movement_patterns, bilateral_unilateral, posterior_anterior, complexity, equipment, primary_muscle, supporting_muscles, muscle_bias, joint_count_level, dynamic_isometric, movement_plane, primary_joints, is_active)
  VALUES ('Patrick Step-up', 'strength', '{"step_up"}'::text[], 'unilateral', 'anterior', 2, '{"bodyweight"}'::text[], 'Quadriceps', '{"Glute max","Calves"}'::text[], 'mid', 'regional', NULL, NULL, '{"Knee","Hip"}'::text[], true)
  ON CONFLICT (name) DO UPDATE SET
    category = EXCLUDED.category,
    movement_patterns = EXCLUDED.movement_patterns,
    bilateral_unilateral = EXCLUDED.bilateral_unilateral,
    posterior_anterior = EXCLUDED.posterior_anterior,
    complexity = EXCLUDED.complexity,
    equipment = EXCLUDED.equipment,
    primary_muscle = EXCLUDED.primary_muscle,
    supporting_muscles = EXCLUDED.supporting_muscles,
    muscle_bias = EXCLUDED.muscle_bias,
    joint_count_level = EXCLUDED.joint_count_level,
    dynamic_isometric = EXCLUDED.dynamic_isometric,
    movement_plane = EXCLUDED.movement_plane,
    primary_joints = EXCLUDED.primary_joints,
    is_active = true,
    updated_at = now();

INSERT INTO exercise_library (name, category, movement_patterns, bilateral_unilateral, posterior_anterior, complexity, equipment, primary_muscle, supporting_muscles, muscle_bias, joint_count_level, dynamic_isometric, movement_plane, primary_joints, is_active)
  VALUES ('Patrick Step-up (weighted)', 'strength', '{"step_up"}'::text[], 'unilateral', 'anterior', 2, '{"dumbbell"}'::text[], 'Quadriceps', '{"Glute max","Calves"}'::text[], 'mid', 'regional', NULL, NULL, '{"Knee","Hip"}'::text[], true)
  ON CONFLICT (name) DO UPDATE SET
    category = EXCLUDED.category,
    movement_patterns = EXCLUDED.movement_patterns,
    bilateral_unilateral = EXCLUDED.bilateral_unilateral,
    posterior_anterior = EXCLUDED.posterior_anterior,
    complexity = EXCLUDED.complexity,
    equipment = EXCLUDED.equipment,
    primary_muscle = EXCLUDED.primary_muscle,
    supporting_muscles = EXCLUDED.supporting_muscles,
    muscle_bias = EXCLUDED.muscle_bias,
    joint_count_level = EXCLUDED.joint_count_level,
    dynamic_isometric = EXCLUDED.dynamic_isometric,
    movement_plane = EXCLUDED.movement_plane,
    primary_joints = EXCLUDED.primary_joints,
    is_active = true,
    updated_at = now();

INSERT INTO exercise_library (name, category, movement_patterns, bilateral_unilateral, posterior_anterior, complexity, equipment, primary_muscle, supporting_muscles, muscle_bias, joint_count_level, dynamic_isometric, movement_plane, primary_joints, is_active)
  VALUES ('Poliquin Step-up', 'strength', '{"step_up"}'::text[], 'unilateral', 'anterior', 2, '{"bodyweight"}'::text[], 'Quadriceps', '{"Glute max","Calves"}'::text[], 'mid', 'regional', NULL, NULL, '{"Knee","Hip"}'::text[], true)
  ON CONFLICT (name) DO UPDATE SET
    category = EXCLUDED.category,
    movement_patterns = EXCLUDED.movement_patterns,
    bilateral_unilateral = EXCLUDED.bilateral_unilateral,
    posterior_anterior = EXCLUDED.posterior_anterior,
    complexity = EXCLUDED.complexity,
    equipment = EXCLUDED.equipment,
    primary_muscle = EXCLUDED.primary_muscle,
    supporting_muscles = EXCLUDED.supporting_muscles,
    muscle_bias = EXCLUDED.muscle_bias,
    joint_count_level = EXCLUDED.joint_count_level,
    dynamic_isometric = EXCLUDED.dynamic_isometric,
    movement_plane = EXCLUDED.movement_plane,
    primary_joints = EXCLUDED.primary_joints,
    is_active = true,
    updated_at = now();

INSERT INTO exercise_library (name, category, movement_patterns, bilateral_unilateral, posterior_anterior, complexity, equipment, primary_muscle, supporting_muscles, muscle_bias, joint_count_level, dynamic_isometric, movement_plane, primary_joints, is_active)
  VALUES ('Poliquin Step-up (weighted)', 'strength', '{"step_up"}'::text[], 'unilateral', 'anterior', 2, '{"dumbbell"}'::text[], 'Quadriceps', '{"Glute max","Calves"}'::text[], 'mid', 'regional', NULL, NULL, '{"Knee","Hip"}'::text[], true)
  ON CONFLICT (name) DO UPDATE SET
    category = EXCLUDED.category,
    movement_patterns = EXCLUDED.movement_patterns,
    bilateral_unilateral = EXCLUDED.bilateral_unilateral,
    posterior_anterior = EXCLUDED.posterior_anterior,
    complexity = EXCLUDED.complexity,
    equipment = EXCLUDED.equipment,
    primary_muscle = EXCLUDED.primary_muscle,
    supporting_muscles = EXCLUDED.supporting_muscles,
    muscle_bias = EXCLUDED.muscle_bias,
    joint_count_level = EXCLUDED.joint_count_level,
    dynamic_isometric = EXCLUDED.dynamic_isometric,
    movement_plane = EXCLUDED.movement_plane,
    primary_joints = EXCLUDED.primary_joints,
    is_active = true,
    updated_at = now();

INSERT INTO exercise_library (name, category, movement_patterns, bilateral_unilateral, posterior_anterior, complexity, equipment, primary_muscle, supporting_muscles, muscle_bias, joint_count_level, dynamic_isometric, movement_plane, primary_joints, is_active)
  VALUES ('Step-down (low box)', 'strength', '{"step_up"}'::text[], 'unilateral', 'anterior', 2, '{"plyo_box"}'::text[], 'Quadriceps', '{"Glute max","Adductors"}'::text[], 'mid', 'regional', NULL, NULL, '{"Knee","Hip"}'::text[], true)
  ON CONFLICT (name) DO UPDATE SET
    category = EXCLUDED.category,
    movement_patterns = EXCLUDED.movement_patterns,
    bilateral_unilateral = EXCLUDED.bilateral_unilateral,
    posterior_anterior = EXCLUDED.posterior_anterior,
    complexity = EXCLUDED.complexity,
    equipment = EXCLUDED.equipment,
    primary_muscle = EXCLUDED.primary_muscle,
    supporting_muscles = EXCLUDED.supporting_muscles,
    muscle_bias = EXCLUDED.muscle_bias,
    joint_count_level = EXCLUDED.joint_count_level,
    dynamic_isometric = EXCLUDED.dynamic_isometric,
    movement_plane = EXCLUDED.movement_plane,
    primary_joints = EXCLUDED.primary_joints,
    is_active = true,
    updated_at = now();

INSERT INTO exercise_library (name, category, movement_patterns, bilateral_unilateral, posterior_anterior, complexity, equipment, primary_muscle, supporting_muscles, muscle_bias, joint_count_level, dynamic_isometric, movement_plane, primary_joints, is_active)
  VALUES ('Step-down (Dual Dumbbell)', 'strength', '{"step_up"}'::text[], 'unilateral', 'anterior', 2, '{"dumbbell","plyo_box"}'::text[], 'Quadriceps', '{"Glute max","Adductors"}'::text[], 'mid', 'regional', NULL, NULL, '{"Knee","Hip"}'::text[], true)
  ON CONFLICT (name) DO UPDATE SET
    category = EXCLUDED.category,
    movement_patterns = EXCLUDED.movement_patterns,
    bilateral_unilateral = EXCLUDED.bilateral_unilateral,
    posterior_anterior = EXCLUDED.posterior_anterior,
    complexity = EXCLUDED.complexity,
    equipment = EXCLUDED.equipment,
    primary_muscle = EXCLUDED.primary_muscle,
    supporting_muscles = EXCLUDED.supporting_muscles,
    muscle_bias = EXCLUDED.muscle_bias,
    joint_count_level = EXCLUDED.joint_count_level,
    dynamic_isometric = EXCLUDED.dynamic_isometric,
    movement_plane = EXCLUDED.movement_plane,
    primary_joints = EXCLUDED.primary_joints,
    is_active = true,
    updated_at = now();

INSERT INTO exercise_library (name, category, movement_patterns, bilateral_unilateral, posterior_anterior, complexity, equipment, primary_muscle, supporting_muscles, muscle_bias, joint_count_level, dynamic_isometric, movement_plane, primary_joints, is_active)
  VALUES ('Step-down (Goblet)', 'strength', '{"step_up"}'::text[], 'unilateral', 'anterior', 2, '{"dumbbell","plyo_box"}'::text[], 'Quadriceps', '{"Glute max","Adductors"}'::text[], 'mid', 'regional', NULL, NULL, '{"Knee","Hip"}'::text[], true)
  ON CONFLICT (name) DO UPDATE SET
    category = EXCLUDED.category,
    movement_patterns = EXCLUDED.movement_patterns,
    bilateral_unilateral = EXCLUDED.bilateral_unilateral,
    posterior_anterior = EXCLUDED.posterior_anterior,
    complexity = EXCLUDED.complexity,
    equipment = EXCLUDED.equipment,
    primary_muscle = EXCLUDED.primary_muscle,
    supporting_muscles = EXCLUDED.supporting_muscles,
    muscle_bias = EXCLUDED.muscle_bias,
    joint_count_level = EXCLUDED.joint_count_level,
    dynamic_isometric = EXCLUDED.dynamic_isometric,
    movement_plane = EXCLUDED.movement_plane,
    primary_joints = EXCLUDED.primary_joints,
    is_active = true,
    updated_at = now();

INSERT INTO exercise_library (name, category, movement_patterns, bilateral_unilateral, posterior_anterior, complexity, equipment, primary_muscle, supporting_muscles, muscle_bias, joint_count_level, dynamic_isometric, movement_plane, primary_joints, is_active)
  VALUES ('Split Squat Hold (isometric)', 'strength', '{"lunge"}'::text[], 'unilateral', 'anterior', 2, '{"bodyweight"}'::text[], 'Quadriceps', '{"Glute max","Adductors"}'::text[], 'mid', 'regional', NULL, NULL, '{"Knee","Hip"}'::text[], true)
  ON CONFLICT (name) DO UPDATE SET
    category = EXCLUDED.category,
    movement_patterns = EXCLUDED.movement_patterns,
    bilateral_unilateral = EXCLUDED.bilateral_unilateral,
    posterior_anterior = EXCLUDED.posterior_anterior,
    complexity = EXCLUDED.complexity,
    equipment = EXCLUDED.equipment,
    primary_muscle = EXCLUDED.primary_muscle,
    supporting_muscles = EXCLUDED.supporting_muscles,
    muscle_bias = EXCLUDED.muscle_bias,
    joint_count_level = EXCLUDED.joint_count_level,
    dynamic_isometric = EXCLUDED.dynamic_isometric,
    movement_plane = EXCLUDED.movement_plane,
    primary_joints = EXCLUDED.primary_joints,
    is_active = true,
    updated_at = now();

INSERT INTO exercise_library (name, category, movement_patterns, bilateral_unilateral, posterior_anterior, complexity, equipment, primary_muscle, supporting_muscles, muscle_bias, joint_count_level, dynamic_isometric, movement_plane, primary_joints, is_active)
  VALUES ('Rear Foot Elevated Split Squat Hold (isometric)', 'strength', '{"lunge"}'::text[], 'unilateral', 'anterior', 2, '{"bench"}'::text[], 'Quadriceps', '{"Glute max","Adductors"}'::text[], 'lengthened', 'regional', NULL, NULL, '{"Knee","Hip"}'::text[], true)
  ON CONFLICT (name) DO UPDATE SET
    category = EXCLUDED.category,
    movement_patterns = EXCLUDED.movement_patterns,
    bilateral_unilateral = EXCLUDED.bilateral_unilateral,
    posterior_anterior = EXCLUDED.posterior_anterior,
    complexity = EXCLUDED.complexity,
    equipment = EXCLUDED.equipment,
    primary_muscle = EXCLUDED.primary_muscle,
    supporting_muscles = EXCLUDED.supporting_muscles,
    muscle_bias = EXCLUDED.muscle_bias,
    joint_count_level = EXCLUDED.joint_count_level,
    dynamic_isometric = EXCLUDED.dynamic_isometric,
    movement_plane = EXCLUDED.movement_plane,
    primary_joints = EXCLUDED.primary_joints,
    is_active = true,
    updated_at = now();

INSERT INTO exercise_library (name, category, movement_patterns, bilateral_unilateral, posterior_anterior, complexity, equipment, primary_muscle, supporting_muscles, muscle_bias, joint_count_level, dynamic_isometric, movement_plane, primary_joints, is_active)
  VALUES ('Seated Leg Curl (Fixed Machine)', 'strength', '{"hinge"}'::text[], 'bilateral', 'posterior', 1, '{"fixed_machine"}'::text[], 'Hamstrings', '{}'::text[], 'shortened', 'local', NULL, NULL, '{"Knee"}'::text[], true)
  ON CONFLICT (name) DO UPDATE SET
    category = EXCLUDED.category,
    movement_patterns = EXCLUDED.movement_patterns,
    bilateral_unilateral = EXCLUDED.bilateral_unilateral,
    posterior_anterior = EXCLUDED.posterior_anterior,
    complexity = EXCLUDED.complexity,
    equipment = EXCLUDED.equipment,
    primary_muscle = EXCLUDED.primary_muscle,
    supporting_muscles = EXCLUDED.supporting_muscles,
    muscle_bias = EXCLUDED.muscle_bias,
    joint_count_level = EXCLUDED.joint_count_level,
    dynamic_isometric = EXCLUDED.dynamic_isometric,
    movement_plane = EXCLUDED.movement_plane,
    primary_joints = EXCLUDED.primary_joints,
    is_active = true,
    updated_at = now();

INSERT INTO exercise_library (name, category, movement_patterns, bilateral_unilateral, posterior_anterior, complexity, equipment, primary_muscle, supporting_muscles, muscle_bias, joint_count_level, dynamic_isometric, movement_plane, primary_joints, is_active)
  VALUES ('Single Leg Seated Leg Curl (Fixed Machine)', 'strength', '{"hinge"}'::text[], 'unilateral', 'posterior', 1, '{"fixed_machine"}'::text[], 'Hamstrings', '{}'::text[], 'shortened', 'local', NULL, NULL, '{"Knee"}'::text[], true)
  ON CONFLICT (name) DO UPDATE SET
    category = EXCLUDED.category,
    movement_patterns = EXCLUDED.movement_patterns,
    bilateral_unilateral = EXCLUDED.bilateral_unilateral,
    posterior_anterior = EXCLUDED.posterior_anterior,
    complexity = EXCLUDED.complexity,
    equipment = EXCLUDED.equipment,
    primary_muscle = EXCLUDED.primary_muscle,
    supporting_muscles = EXCLUDED.supporting_muscles,
    muscle_bias = EXCLUDED.muscle_bias,
    joint_count_level = EXCLUDED.joint_count_level,
    dynamic_isometric = EXCLUDED.dynamic_isometric,
    movement_plane = EXCLUDED.movement_plane,
    primary_joints = EXCLUDED.primary_joints,
    is_active = true,
    updated_at = now();

INSERT INTO exercise_library (name, category, movement_patterns, bilateral_unilateral, posterior_anterior, complexity, equipment, primary_muscle, supporting_muscles, muscle_bias, joint_count_level, dynamic_isometric, movement_plane, primary_joints, is_active)
  VALUES ('Lying Leg Curl (Fixed Machine)', 'strength', '{"hinge"}'::text[], 'bilateral', 'posterior', 1, '{"fixed_machine"}'::text[], 'Hamstrings', '{}'::text[], 'mid', 'local', NULL, NULL, '{"Knee"}'::text[], true)
  ON CONFLICT (name) DO UPDATE SET
    category = EXCLUDED.category,
    movement_patterns = EXCLUDED.movement_patterns,
    bilateral_unilateral = EXCLUDED.bilateral_unilateral,
    posterior_anterior = EXCLUDED.posterior_anterior,
    complexity = EXCLUDED.complexity,
    equipment = EXCLUDED.equipment,
    primary_muscle = EXCLUDED.primary_muscle,
    supporting_muscles = EXCLUDED.supporting_muscles,
    muscle_bias = EXCLUDED.muscle_bias,
    joint_count_level = EXCLUDED.joint_count_level,
    dynamic_isometric = EXCLUDED.dynamic_isometric,
    movement_plane = EXCLUDED.movement_plane,
    primary_joints = EXCLUDED.primary_joints,
    is_active = true,
    updated_at = now();

INSERT INTO exercise_library (name, category, movement_patterns, bilateral_unilateral, posterior_anterior, complexity, equipment, primary_muscle, supporting_muscles, muscle_bias, joint_count_level, dynamic_isometric, movement_plane, primary_joints, is_active)
  VALUES ('Single Leg Lying Leg Curl (Fixed Machine)', 'strength', '{"hinge"}'::text[], 'unilateral', 'posterior', 1, '{"fixed_machine"}'::text[], 'Hamstrings', '{}'::text[], 'mid', 'local', NULL, NULL, '{"Knee"}'::text[], true)
  ON CONFLICT (name) DO UPDATE SET
    category = EXCLUDED.category,
    movement_patterns = EXCLUDED.movement_patterns,
    bilateral_unilateral = EXCLUDED.bilateral_unilateral,
    posterior_anterior = EXCLUDED.posterior_anterior,
    complexity = EXCLUDED.complexity,
    equipment = EXCLUDED.equipment,
    primary_muscle = EXCLUDED.primary_muscle,
    supporting_muscles = EXCLUDED.supporting_muscles,
    muscle_bias = EXCLUDED.muscle_bias,
    joint_count_level = EXCLUDED.joint_count_level,
    dynamic_isometric = EXCLUDED.dynamic_isometric,
    movement_plane = EXCLUDED.movement_plane,
    primary_joints = EXCLUDED.primary_joints,
    is_active = true,
    updated_at = now();

INSERT INTO exercise_library (name, category, movement_patterns, bilateral_unilateral, posterior_anterior, complexity, equipment, primary_muscle, supporting_muscles, muscle_bias, joint_count_level, dynamic_isometric, movement_plane, primary_joints, is_active)
  VALUES ('Single Leg Swiss Ball Hamstring Curl', 'strength', '{"hinge"}'::text[], 'unilateral', 'posterior', 2, '{"bodyweight"}'::text[], 'Hamstrings', '{"Glute max","Calves"}'::text[], 'lengthened', 'regional', NULL, NULL, '{"Knee","Hip"}'::text[], true)
  ON CONFLICT (name) DO UPDATE SET
    category = EXCLUDED.category,
    movement_patterns = EXCLUDED.movement_patterns,
    bilateral_unilateral = EXCLUDED.bilateral_unilateral,
    posterior_anterior = EXCLUDED.posterior_anterior,
    complexity = EXCLUDED.complexity,
    equipment = EXCLUDED.equipment,
    primary_muscle = EXCLUDED.primary_muscle,
    supporting_muscles = EXCLUDED.supporting_muscles,
    muscle_bias = EXCLUDED.muscle_bias,
    joint_count_level = EXCLUDED.joint_count_level,
    dynamic_isometric = EXCLUDED.dynamic_isometric,
    movement_plane = EXCLUDED.movement_plane,
    primary_joints = EXCLUDED.primary_joints,
    is_active = true,
    updated_at = now();

INSERT INTO exercise_library (name, category, movement_patterns, bilateral_unilateral, posterior_anterior, complexity, equipment, primary_muscle, supporting_muscles, muscle_bias, joint_count_level, dynamic_isometric, movement_plane, primary_joints, is_active)
  VALUES ('Rower Hamstring Curl', 'strength', '{"hinge"}'::text[], 'bilateral', 'posterior', 2, '{"rower_erg"}'::text[], 'Hamstrings', '{}'::text[], 'mid', 'local', NULL, NULL, '{"Knee"}'::text[], true)
  ON CONFLICT (name) DO UPDATE SET
    category = EXCLUDED.category,
    movement_patterns = EXCLUDED.movement_patterns,
    bilateral_unilateral = EXCLUDED.bilateral_unilateral,
    posterior_anterior = EXCLUDED.posterior_anterior,
    complexity = EXCLUDED.complexity,
    equipment = EXCLUDED.equipment,
    primary_muscle = EXCLUDED.primary_muscle,
    supporting_muscles = EXCLUDED.supporting_muscles,
    muscle_bias = EXCLUDED.muscle_bias,
    joint_count_level = EXCLUDED.joint_count_level,
    dynamic_isometric = EXCLUDED.dynamic_isometric,
    movement_plane = EXCLUDED.movement_plane,
    primary_joints = EXCLUDED.primary_joints,
    is_active = true,
    updated_at = now();

INSERT INTO exercise_library (name, category, movement_patterns, bilateral_unilateral, posterior_anterior, complexity, equipment, primary_muscle, supporting_muscles, muscle_bias, joint_count_level, dynamic_isometric, movement_plane, primary_joints, is_active)
  VALUES ('Single Leg Rower Hamstring Curl', 'strength', '{"hinge"}'::text[], 'unilateral', 'posterior', 2, '{"rower_erg"}'::text[], 'Hamstrings', '{}'::text[], 'mid', 'local', NULL, NULL, '{"Knee"}'::text[], true)
  ON CONFLICT (name) DO UPDATE SET
    category = EXCLUDED.category,
    movement_patterns = EXCLUDED.movement_patterns,
    bilateral_unilateral = EXCLUDED.bilateral_unilateral,
    posterior_anterior = EXCLUDED.posterior_anterior,
    complexity = EXCLUDED.complexity,
    equipment = EXCLUDED.equipment,
    primary_muscle = EXCLUDED.primary_muscle,
    supporting_muscles = EXCLUDED.supporting_muscles,
    muscle_bias = EXCLUDED.muscle_bias,
    joint_count_level = EXCLUDED.joint_count_level,
    dynamic_isometric = EXCLUDED.dynamic_isometric,
    movement_plane = EXCLUDED.movement_plane,
    primary_joints = EXCLUDED.primary_joints,
    is_active = true,
    updated_at = now();

INSERT INTO exercise_library (name, category, movement_patterns, bilateral_unilateral, posterior_anterior, complexity, equipment, primary_muscle, supporting_muscles, muscle_bias, joint_count_level, dynamic_isometric, movement_plane, primary_joints, is_active)
  VALUES ('Hip Abduction (Fixed Machine)', 'strength', '{"hip_extension"}'::text[], 'bilateral', 'posterior', 1, '{"fixed_machine"}'::text[], 'Glute med/min', '{"TFL","Glute max"}'::text[], 'shortened', 'local', NULL, NULL, '{"Hip"}'::text[], true)
  ON CONFLICT (name) DO UPDATE SET
    category = EXCLUDED.category,
    movement_patterns = EXCLUDED.movement_patterns,
    bilateral_unilateral = EXCLUDED.bilateral_unilateral,
    posterior_anterior = EXCLUDED.posterior_anterior,
    complexity = EXCLUDED.complexity,
    equipment = EXCLUDED.equipment,
    primary_muscle = EXCLUDED.primary_muscle,
    supporting_muscles = EXCLUDED.supporting_muscles,
    muscle_bias = EXCLUDED.muscle_bias,
    joint_count_level = EXCLUDED.joint_count_level,
    dynamic_isometric = EXCLUDED.dynamic_isometric,
    movement_plane = EXCLUDED.movement_plane,
    primary_joints = EXCLUDED.primary_joints,
    is_active = true,
    updated_at = now();

INSERT INTO exercise_library (name, category, movement_patterns, bilateral_unilateral, posterior_anterior, complexity, equipment, primary_muscle, supporting_muscles, muscle_bias, joint_count_level, dynamic_isometric, movement_plane, primary_joints, is_active)
  VALUES ('Hip Adduction (Fixed Machine)', 'strength', '{"hip_extension"}'::text[], 'bilateral', 'anterior', 1, '{"fixed_machine"}'::text[], 'Adductors', '{"Gracilis","Pectineus"}'::text[], 'shortened', 'local', NULL, NULL, '{"Hip"}'::text[], true)
  ON CONFLICT (name) DO UPDATE SET
    category = EXCLUDED.category,
    movement_patterns = EXCLUDED.movement_patterns,
    bilateral_unilateral = EXCLUDED.bilateral_unilateral,
    posterior_anterior = EXCLUDED.posterior_anterior,
    complexity = EXCLUDED.complexity,
    equipment = EXCLUDED.equipment,
    primary_muscle = EXCLUDED.primary_muscle,
    supporting_muscles = EXCLUDED.supporting_muscles,
    muscle_bias = EXCLUDED.muscle_bias,
    joint_count_level = EXCLUDED.joint_count_level,
    dynamic_isometric = EXCLUDED.dynamic_isometric,
    movement_plane = EXCLUDED.movement_plane,
    primary_joints = EXCLUDED.primary_joints,
    is_active = true,
    updated_at = now();

INSERT INTO exercise_library (name, category, movement_patterns, bilateral_unilateral, posterior_anterior, complexity, equipment, primary_muscle, supporting_muscles, muscle_bias, joint_count_level, dynamic_isometric, movement_plane, primary_joints, is_active)
  VALUES ('Cable Hip Abduction', 'strength', '{"hip_extension"}'::text[], 'unilateral', 'posterior', 2, '{"cable"}'::text[], 'Glute med/min', '{"TFL","Glute max"}'::text[], 'mid', 'local', NULL, NULL, '{"Hip"}'::text[], true)
  ON CONFLICT (name) DO UPDATE SET
    category = EXCLUDED.category,
    movement_patterns = EXCLUDED.movement_patterns,
    bilateral_unilateral = EXCLUDED.bilateral_unilateral,
    posterior_anterior = EXCLUDED.posterior_anterior,
    complexity = EXCLUDED.complexity,
    equipment = EXCLUDED.equipment,
    primary_muscle = EXCLUDED.primary_muscle,
    supporting_muscles = EXCLUDED.supporting_muscles,
    muscle_bias = EXCLUDED.muscle_bias,
    joint_count_level = EXCLUDED.joint_count_level,
    dynamic_isometric = EXCLUDED.dynamic_isometric,
    movement_plane = EXCLUDED.movement_plane,
    primary_joints = EXCLUDED.primary_joints,
    is_active = true,
    updated_at = now();

INSERT INTO exercise_library (name, category, movement_patterns, bilateral_unilateral, posterior_anterior, complexity, equipment, primary_muscle, supporting_muscles, muscle_bias, joint_count_level, dynamic_isometric, movement_plane, primary_joints, is_active)
  VALUES ('Cable Hip Adduction', 'strength', '{"hip_extension"}'::text[], 'unilateral', 'anterior', 2, '{"cable"}'::text[], 'Adductors', '{"Gracilis","Pectineus"}'::text[], 'mid', 'local', NULL, NULL, '{"Hip"}'::text[], true)
  ON CONFLICT (name) DO UPDATE SET
    category = EXCLUDED.category,
    movement_patterns = EXCLUDED.movement_patterns,
    bilateral_unilateral = EXCLUDED.bilateral_unilateral,
    posterior_anterior = EXCLUDED.posterior_anterior,
    complexity = EXCLUDED.complexity,
    equipment = EXCLUDED.equipment,
    primary_muscle = EXCLUDED.primary_muscle,
    supporting_muscles = EXCLUDED.supporting_muscles,
    muscle_bias = EXCLUDED.muscle_bias,
    joint_count_level = EXCLUDED.joint_count_level,
    dynamic_isometric = EXCLUDED.dynamic_isometric,
    movement_plane = EXCLUDED.movement_plane,
    primary_joints = EXCLUDED.primary_joints,
    is_active = true,
    updated_at = now();

INSERT INTO exercise_library (name, category, movement_patterns, bilateral_unilateral, posterior_anterior, complexity, equipment, primary_muscle, supporting_muscles, muscle_bias, joint_count_level, dynamic_isometric, movement_plane, primary_joints, is_active)
  VALUES ('Copenhagen Plank (isometric)', 'strength', '{"core_anti_lateral_flexion"}'::text[], 'unilateral', 'anterior', 2, '{"bodyweight"}'::text[], 'Adductors', '{"Adductors","Glute med/min","Obliques","glute med/min"}'::text[], 'mid', 'local', 'isometric', NULL, '{"Hip"}'::text[], true)
  ON CONFLICT (name) DO UPDATE SET
    category = EXCLUDED.category,
    movement_patterns = EXCLUDED.movement_patterns,
    bilateral_unilateral = EXCLUDED.bilateral_unilateral,
    posterior_anterior = EXCLUDED.posterior_anterior,
    complexity = EXCLUDED.complexity,
    equipment = EXCLUDED.equipment,
    primary_muscle = EXCLUDED.primary_muscle,
    supporting_muscles = EXCLUDED.supporting_muscles,
    muscle_bias = EXCLUDED.muscle_bias,
    joint_count_level = EXCLUDED.joint_count_level,
    dynamic_isometric = EXCLUDED.dynamic_isometric,
    movement_plane = EXCLUDED.movement_plane,
    primary_joints = EXCLUDED.primary_joints,
    is_active = true,
    updated_at = now();

INSERT INTO exercise_library (name, category, movement_patterns, bilateral_unilateral, posterior_anterior, complexity, equipment, primary_muscle, supporting_muscles, muscle_bias, joint_count_level, dynamic_isometric, movement_plane, primary_joints, is_active)
  VALUES ('Copenhagen Plank (weighed)', 'strength', '{"core_anti_lateral_flexion"}'::text[], 'unilateral', 'anterior', 2, '{"bodyweight"}'::text[], 'Adductors', '{"Obliques","Glute med/min"}'::text[], 'mid', 'local', NULL, NULL, '{"Hip"}'::text[], true)
  ON CONFLICT (name) DO UPDATE SET
    category = EXCLUDED.category,
    movement_patterns = EXCLUDED.movement_patterns,
    bilateral_unilateral = EXCLUDED.bilateral_unilateral,
    posterior_anterior = EXCLUDED.posterior_anterior,
    complexity = EXCLUDED.complexity,
    equipment = EXCLUDED.equipment,
    primary_muscle = EXCLUDED.primary_muscle,
    supporting_muscles = EXCLUDED.supporting_muscles,
    muscle_bias = EXCLUDED.muscle_bias,
    joint_count_level = EXCLUDED.joint_count_level,
    dynamic_isometric = EXCLUDED.dynamic_isometric,
    movement_plane = EXCLUDED.movement_plane,
    primary_joints = EXCLUDED.primary_joints,
    is_active = true,
    updated_at = now();

INSERT INTO exercise_library (name, category, movement_patterns, bilateral_unilateral, posterior_anterior, complexity, equipment, primary_muscle, supporting_muscles, muscle_bias, joint_count_level, dynamic_isometric, movement_plane, primary_joints, is_active)
  VALUES ('90/90 Copenhagen Plank (isometric)', 'strength', '{"core_anti_lateral_flexion"}'::text[], 'unilateral', 'anterior', 2, '{"bodyweight"}'::text[], 'Adductors', '{"Adductors","Glute med/min","Obliques","glute med/min"}'::text[], 'mid', 'local', 'isometric', NULL, '{"Hip"}'::text[], true)
  ON CONFLICT (name) DO UPDATE SET
    category = EXCLUDED.category,
    movement_patterns = EXCLUDED.movement_patterns,
    bilateral_unilateral = EXCLUDED.bilateral_unilateral,
    posterior_anterior = EXCLUDED.posterior_anterior,
    complexity = EXCLUDED.complexity,
    equipment = EXCLUDED.equipment,
    primary_muscle = EXCLUDED.primary_muscle,
    supporting_muscles = EXCLUDED.supporting_muscles,
    muscle_bias = EXCLUDED.muscle_bias,
    joint_count_level = EXCLUDED.joint_count_level,
    dynamic_isometric = EXCLUDED.dynamic_isometric,
    movement_plane = EXCLUDED.movement_plane,
    primary_joints = EXCLUDED.primary_joints,
    is_active = true,
    updated_at = now();

INSERT INTO exercise_library (name, category, movement_patterns, bilateral_unilateral, posterior_anterior, complexity, equipment, primary_muscle, supporting_muscles, muscle_bias, joint_count_level, dynamic_isometric, movement_plane, primary_joints, is_active)
  VALUES ('90/90 Copenhagen Plank (weighted)', 'strength', '{"core_anti_lateral_flexion"}'::text[], 'unilateral', 'anterior', 2, '{"bodyweight","dumbbell"}'::text[], 'Adductors', '{"Adductors","Glute med/min","Obliques","glute med/min"}'::text[], 'mid', 'local', 'isometric', NULL, '{"Hip"}'::text[], true)
  ON CONFLICT (name) DO UPDATE SET
    category = EXCLUDED.category,
    movement_patterns = EXCLUDED.movement_patterns,
    bilateral_unilateral = EXCLUDED.bilateral_unilateral,
    posterior_anterior = EXCLUDED.posterior_anterior,
    complexity = EXCLUDED.complexity,
    equipment = EXCLUDED.equipment,
    primary_muscle = EXCLUDED.primary_muscle,
    supporting_muscles = EXCLUDED.supporting_muscles,
    muscle_bias = EXCLUDED.muscle_bias,
    joint_count_level = EXCLUDED.joint_count_level,
    dynamic_isometric = EXCLUDED.dynamic_isometric,
    movement_plane = EXCLUDED.movement_plane,
    primary_joints = EXCLUDED.primary_joints,
    is_active = true,
    updated_at = now();

INSERT INTO exercise_library (name, category, movement_patterns, bilateral_unilateral, posterior_anterior, complexity, equipment, primary_muscle, supporting_muscles, muscle_bias, joint_count_level, dynamic_isometric, movement_plane, primary_joints, is_active)
  VALUES ('Standing Calf Raise (bodyweight)', 'strength', '{"ankle_extension"}'::text[], 'bilateral', 'posterior', 1, '{"bodyweight"}'::text[], 'Gastrocnemius', '{"Soleus"}'::text[], 'shortened', 'local', NULL, NULL, '{"Ankle"}'::text[], true)
  ON CONFLICT (name) DO UPDATE SET
    category = EXCLUDED.category,
    movement_patterns = EXCLUDED.movement_patterns,
    bilateral_unilateral = EXCLUDED.bilateral_unilateral,
    posterior_anterior = EXCLUDED.posterior_anterior,
    complexity = EXCLUDED.complexity,
    equipment = EXCLUDED.equipment,
    primary_muscle = EXCLUDED.primary_muscle,
    supporting_muscles = EXCLUDED.supporting_muscles,
    muscle_bias = EXCLUDED.muscle_bias,
    joint_count_level = EXCLUDED.joint_count_level,
    dynamic_isometric = EXCLUDED.dynamic_isometric,
    movement_plane = EXCLUDED.movement_plane,
    primary_joints = EXCLUDED.primary_joints,
    is_active = true,
    updated_at = now();

INSERT INTO exercise_library (name, category, movement_patterns, bilateral_unilateral, posterior_anterior, complexity, equipment, primary_muscle, supporting_muscles, muscle_bias, joint_count_level, dynamic_isometric, movement_plane, primary_joints, is_active)
  VALUES ('Single Leg Standing Calf Raise (bodyweight)', 'strength', '{"ankle_extension"}'::text[], 'unilateral', 'posterior', 1, '{"bodyweight"}'::text[], 'Gastrocnemius', '{"Soleus"}'::text[], 'shortened', 'local', NULL, NULL, '{"Ankle"}'::text[], true)
  ON CONFLICT (name) DO UPDATE SET
    category = EXCLUDED.category,
    movement_patterns = EXCLUDED.movement_patterns,
    bilateral_unilateral = EXCLUDED.bilateral_unilateral,
    posterior_anterior = EXCLUDED.posterior_anterior,
    complexity = EXCLUDED.complexity,
    equipment = EXCLUDED.equipment,
    primary_muscle = EXCLUDED.primary_muscle,
    supporting_muscles = EXCLUDED.supporting_muscles,
    muscle_bias = EXCLUDED.muscle_bias,
    joint_count_level = EXCLUDED.joint_count_level,
    dynamic_isometric = EXCLUDED.dynamic_isometric,
    movement_plane = EXCLUDED.movement_plane,
    primary_joints = EXCLUDED.primary_joints,
    is_active = true,
    updated_at = now();

INSERT INTO exercise_library (name, category, movement_patterns, bilateral_unilateral, posterior_anterior, complexity, equipment, primary_muscle, supporting_muscles, muscle_bias, joint_count_level, dynamic_isometric, movement_plane, primary_joints, is_active)
  VALUES ('Standing Calf Raise (Dumbbell)', 'strength', '{"ankle_extension"}'::text[], 'bilateral', 'posterior', 1, '{"dumbbell"}'::text[], 'Gastrocnemius', '{"Soleus"}'::text[], 'shortened', 'local', NULL, NULL, '{"Ankle"}'::text[], true)
  ON CONFLICT (name) DO UPDATE SET
    category = EXCLUDED.category,
    movement_patterns = EXCLUDED.movement_patterns,
    bilateral_unilateral = EXCLUDED.bilateral_unilateral,
    posterior_anterior = EXCLUDED.posterior_anterior,
    complexity = EXCLUDED.complexity,
    equipment = EXCLUDED.equipment,
    primary_muscle = EXCLUDED.primary_muscle,
    supporting_muscles = EXCLUDED.supporting_muscles,
    muscle_bias = EXCLUDED.muscle_bias,
    joint_count_level = EXCLUDED.joint_count_level,
    dynamic_isometric = EXCLUDED.dynamic_isometric,
    movement_plane = EXCLUDED.movement_plane,
    primary_joints = EXCLUDED.primary_joints,
    is_active = true,
    updated_at = now();

INSERT INTO exercise_library (name, category, movement_patterns, bilateral_unilateral, posterior_anterior, complexity, equipment, primary_muscle, supporting_muscles, muscle_bias, joint_count_level, dynamic_isometric, movement_plane, primary_joints, is_active)
  VALUES ('Single Leg Standing Calf Raise (Dumbbell)', 'strength', '{"ankle_extension"}'::text[], 'unilateral', 'posterior', 1, '{"dumbbell"}'::text[], 'Gastrocnemius', '{"Soleus"}'::text[], 'shortened', 'local', NULL, NULL, '{"Ankle"}'::text[], true)
  ON CONFLICT (name) DO UPDATE SET
    category = EXCLUDED.category,
    movement_patterns = EXCLUDED.movement_patterns,
    bilateral_unilateral = EXCLUDED.bilateral_unilateral,
    posterior_anterior = EXCLUDED.posterior_anterior,
    complexity = EXCLUDED.complexity,
    equipment = EXCLUDED.equipment,
    primary_muscle = EXCLUDED.primary_muscle,
    supporting_muscles = EXCLUDED.supporting_muscles,
    muscle_bias = EXCLUDED.muscle_bias,
    joint_count_level = EXCLUDED.joint_count_level,
    dynamic_isometric = EXCLUDED.dynamic_isometric,
    movement_plane = EXCLUDED.movement_plane,
    primary_joints = EXCLUDED.primary_joints,
    is_active = true,
    updated_at = now();

INSERT INTO exercise_library (name, category, movement_patterns, bilateral_unilateral, posterior_anterior, complexity, equipment, primary_muscle, supporting_muscles, muscle_bias, joint_count_level, dynamic_isometric, movement_plane, primary_joints, is_active)
  VALUES ('Standing Calf Raise (Smith press)', 'strength', '{"ankle_extension"}'::text[], 'bilateral', 'posterior', 1, '{"fixed_machine"}'::text[], 'Gastrocnemius', '{"Soleus"}'::text[], 'shortened', 'local', NULL, NULL, '{"Ankle"}'::text[], true)
  ON CONFLICT (name) DO UPDATE SET
    category = EXCLUDED.category,
    movement_patterns = EXCLUDED.movement_patterns,
    bilateral_unilateral = EXCLUDED.bilateral_unilateral,
    posterior_anterior = EXCLUDED.posterior_anterior,
    complexity = EXCLUDED.complexity,
    equipment = EXCLUDED.equipment,
    primary_muscle = EXCLUDED.primary_muscle,
    supporting_muscles = EXCLUDED.supporting_muscles,
    muscle_bias = EXCLUDED.muscle_bias,
    joint_count_level = EXCLUDED.joint_count_level,
    dynamic_isometric = EXCLUDED.dynamic_isometric,
    movement_plane = EXCLUDED.movement_plane,
    primary_joints = EXCLUDED.primary_joints,
    is_active = true,
    updated_at = now();

INSERT INTO exercise_library (name, category, movement_patterns, bilateral_unilateral, posterior_anterior, complexity, equipment, primary_muscle, supporting_muscles, muscle_bias, joint_count_level, dynamic_isometric, movement_plane, primary_joints, is_active)
  VALUES ('Standing Calf Raise (Fixed Machine)', 'strength', '{"ankle_extension"}'::text[], 'bilateral', 'posterior', 1, '{"fixed_machine"}'::text[], 'Gastrocnemius', '{"Soleus"}'::text[], 'shortened', 'local', NULL, NULL, '{"Ankle"}'::text[], true)
  ON CONFLICT (name) DO UPDATE SET
    category = EXCLUDED.category,
    movement_patterns = EXCLUDED.movement_patterns,
    bilateral_unilateral = EXCLUDED.bilateral_unilateral,
    posterior_anterior = EXCLUDED.posterior_anterior,
    complexity = EXCLUDED.complexity,
    equipment = EXCLUDED.equipment,
    primary_muscle = EXCLUDED.primary_muscle,
    supporting_muscles = EXCLUDED.supporting_muscles,
    muscle_bias = EXCLUDED.muscle_bias,
    joint_count_level = EXCLUDED.joint_count_level,
    dynamic_isometric = EXCLUDED.dynamic_isometric,
    movement_plane = EXCLUDED.movement_plane,
    primary_joints = EXCLUDED.primary_joints,
    is_active = true,
    updated_at = now();

INSERT INTO exercise_library (name, category, movement_patterns, bilateral_unilateral, posterior_anterior, complexity, equipment, primary_muscle, supporting_muscles, muscle_bias, joint_count_level, dynamic_isometric, movement_plane, primary_joints, is_active)
  VALUES ('Seated Calf Raise (Fixed Machine)', 'strength', '{"ankle_extension"}'::text[], 'bilateral', 'posterior', 1, '{"fixed_machine"}'::text[], 'Soleus', '{"Gastrocnemius"}'::text[], 'shortened', 'local', NULL, NULL, '{"Ankle"}'::text[], true)
  ON CONFLICT (name) DO UPDATE SET
    category = EXCLUDED.category,
    movement_patterns = EXCLUDED.movement_patterns,
    bilateral_unilateral = EXCLUDED.bilateral_unilateral,
    posterior_anterior = EXCLUDED.posterior_anterior,
    complexity = EXCLUDED.complexity,
    equipment = EXCLUDED.equipment,
    primary_muscle = EXCLUDED.primary_muscle,
    supporting_muscles = EXCLUDED.supporting_muscles,
    muscle_bias = EXCLUDED.muscle_bias,
    joint_count_level = EXCLUDED.joint_count_level,
    dynamic_isometric = EXCLUDED.dynamic_isometric,
    movement_plane = EXCLUDED.movement_plane,
    primary_joints = EXCLUDED.primary_joints,
    is_active = true,
    updated_at = now();

INSERT INTO exercise_library (name, category, movement_patterns, bilateral_unilateral, posterior_anterior, complexity, equipment, primary_muscle, supporting_muscles, muscle_bias, joint_count_level, dynamic_isometric, movement_plane, primary_joints, is_active)
  VALUES ('Seated Calf Raise (Dumbbell on knee)', 'strength', '{"ankle_extension"}'::text[], 'bilateral', 'posterior', 1, '{"bench","dumbbell"}'::text[], 'Soleus', '{"Gastrocnemius"}'::text[], 'shortened', 'local', NULL, NULL, '{"Ankle"}'::text[], true)
  ON CONFLICT (name) DO UPDATE SET
    category = EXCLUDED.category,
    movement_patterns = EXCLUDED.movement_patterns,
    bilateral_unilateral = EXCLUDED.bilateral_unilateral,
    posterior_anterior = EXCLUDED.posterior_anterior,
    complexity = EXCLUDED.complexity,
    equipment = EXCLUDED.equipment,
    primary_muscle = EXCLUDED.primary_muscle,
    supporting_muscles = EXCLUDED.supporting_muscles,
    muscle_bias = EXCLUDED.muscle_bias,
    joint_count_level = EXCLUDED.joint_count_level,
    dynamic_isometric = EXCLUDED.dynamic_isometric,
    movement_plane = EXCLUDED.movement_plane,
    primary_joints = EXCLUDED.primary_joints,
    is_active = true,
    updated_at = now();

INSERT INTO exercise_library (name, category, movement_patterns, bilateral_unilateral, posterior_anterior, complexity, equipment, primary_muscle, supporting_muscles, muscle_bias, joint_count_level, dynamic_isometric, movement_plane, primary_joints, is_active)
  VALUES ('Single Leg Seated Calf Raise (Dumbbell on knee)', 'strength', '{"ankle_extension"}'::text[], 'unilateral', 'posterior', 1, '{"bench","dumbbell"}'::text[], 'Soleus', '{"Gastrocnemius"}'::text[], 'shortened', 'local', NULL, NULL, '{"Ankle"}'::text[], true)
  ON CONFLICT (name) DO UPDATE SET
    category = EXCLUDED.category,
    movement_patterns = EXCLUDED.movement_patterns,
    bilateral_unilateral = EXCLUDED.bilateral_unilateral,
    posterior_anterior = EXCLUDED.posterior_anterior,
    complexity = EXCLUDED.complexity,
    equipment = EXCLUDED.equipment,
    primary_muscle = EXCLUDED.primary_muscle,
    supporting_muscles = EXCLUDED.supporting_muscles,
    muscle_bias = EXCLUDED.muscle_bias,
    joint_count_level = EXCLUDED.joint_count_level,
    dynamic_isometric = EXCLUDED.dynamic_isometric,
    movement_plane = EXCLUDED.movement_plane,
    primary_joints = EXCLUDED.primary_joints,
    is_active = true,
    updated_at = now();

INSERT INTO exercise_library (name, category, movement_patterns, bilateral_unilateral, posterior_anterior, complexity, equipment, primary_muscle, supporting_muscles, muscle_bias, joint_count_level, dynamic_isometric, movement_plane, primary_joints, is_active)
  VALUES ('Leg Press Calf Raise (Fixed Machine)', 'strength', '{"ankle_extension"}'::text[], 'bilateral', 'posterior', 1, '{"fixed_machine"}'::text[], 'Gastrocnemius', '{"Soleus"}'::text[], 'mid', 'local', NULL, NULL, '{"Ankle"}'::text[], true)
  ON CONFLICT (name) DO UPDATE SET
    category = EXCLUDED.category,
    movement_patterns = EXCLUDED.movement_patterns,
    bilateral_unilateral = EXCLUDED.bilateral_unilateral,
    posterior_anterior = EXCLUDED.posterior_anterior,
    complexity = EXCLUDED.complexity,
    equipment = EXCLUDED.equipment,
    primary_muscle = EXCLUDED.primary_muscle,
    supporting_muscles = EXCLUDED.supporting_muscles,
    muscle_bias = EXCLUDED.muscle_bias,
    joint_count_level = EXCLUDED.joint_count_level,
    dynamic_isometric = EXCLUDED.dynamic_isometric,
    movement_plane = EXCLUDED.movement_plane,
    primary_joints = EXCLUDED.primary_joints,
    is_active = true,
    updated_at = now();

INSERT INTO exercise_library (name, category, movement_patterns, bilateral_unilateral, posterior_anterior, complexity, equipment, primary_muscle, supporting_muscles, muscle_bias, joint_count_level, dynamic_isometric, movement_plane, primary_joints, is_active)
  VALUES ('Seated DB calf raise', 'strength', '{"ankle_extension"}'::text[], 'bilateral', 'posterior', 1, '{"bench","dumbbell"}'::text[], 'Soleus', '{"Gastrocnemius"}'::text[], 'shortened', 'local', NULL, NULL, '{"Ankle"}'::text[], true)
  ON CONFLICT (name) DO UPDATE SET
    category = EXCLUDED.category,
    movement_patterns = EXCLUDED.movement_patterns,
    bilateral_unilateral = EXCLUDED.bilateral_unilateral,
    posterior_anterior = EXCLUDED.posterior_anterior,
    complexity = EXCLUDED.complexity,
    equipment = EXCLUDED.equipment,
    primary_muscle = EXCLUDED.primary_muscle,
    supporting_muscles = EXCLUDED.supporting_muscles,
    muscle_bias = EXCLUDED.muscle_bias,
    joint_count_level = EXCLUDED.joint_count_level,
    dynamic_isometric = EXCLUDED.dynamic_isometric,
    movement_plane = EXCLUDED.movement_plane,
    primary_joints = EXCLUDED.primary_joints,
    is_active = true,
    updated_at = now();

INSERT INTO exercise_library (name, category, movement_patterns, bilateral_unilateral, posterior_anterior, complexity, equipment, primary_muscle, supporting_muscles, muscle_bias, joint_count_level, dynamic_isometric, movement_plane, primary_joints, is_active)
  VALUES ('Tibialis Raise (bodyweight, against wall)', 'strength', '{"ankle_extension"}'::text[], 'bilateral', 'anterior', 1, '{"bodyweight"}'::text[], 'Tibialis anterior', '{"Toe extensors"}'::text[], 'shortened', 'local', NULL, NULL, '{"Ankle"}'::text[], true)
  ON CONFLICT (name) DO UPDATE SET
    category = EXCLUDED.category,
    movement_patterns = EXCLUDED.movement_patterns,
    bilateral_unilateral = EXCLUDED.bilateral_unilateral,
    posterior_anterior = EXCLUDED.posterior_anterior,
    complexity = EXCLUDED.complexity,
    equipment = EXCLUDED.equipment,
    primary_muscle = EXCLUDED.primary_muscle,
    supporting_muscles = EXCLUDED.supporting_muscles,
    muscle_bias = EXCLUDED.muscle_bias,
    joint_count_level = EXCLUDED.joint_count_level,
    dynamic_isometric = EXCLUDED.dynamic_isometric,
    movement_plane = EXCLUDED.movement_plane,
    primary_joints = EXCLUDED.primary_joints,
    is_active = true,
    updated_at = now();

INSERT INTO exercise_library (name, category, movement_patterns, bilateral_unilateral, posterior_anterior, complexity, equipment, primary_muscle, supporting_muscles, muscle_bias, joint_count_level, dynamic_isometric, movement_plane, primary_joints, is_active)
  VALUES ('Tibialis Raise (Resistance band)', 'strength', '{"ankle_extension"}'::text[], 'bilateral', 'anterior', 1, '{"band"}'::text[], 'Tibialis anterior', '{"Toe extensors"}'::text[], 'mid', 'local', NULL, NULL, '{"Ankle"}'::text[], true)
  ON CONFLICT (name) DO UPDATE SET
    category = EXCLUDED.category,
    movement_patterns = EXCLUDED.movement_patterns,
    bilateral_unilateral = EXCLUDED.bilateral_unilateral,
    posterior_anterior = EXCLUDED.posterior_anterior,
    complexity = EXCLUDED.complexity,
    equipment = EXCLUDED.equipment,
    primary_muscle = EXCLUDED.primary_muscle,
    supporting_muscles = EXCLUDED.supporting_muscles,
    muscle_bias = EXCLUDED.muscle_bias,
    joint_count_level = EXCLUDED.joint_count_level,
    dynamic_isometric = EXCLUDED.dynamic_isometric,
    movement_plane = EXCLUDED.movement_plane,
    primary_joints = EXCLUDED.primary_joints,
    is_active = true,
    updated_at = now();

INSERT INTO exercise_library (name, category, movement_patterns, bilateral_unilateral, posterior_anterior, complexity, equipment, primary_muscle, supporting_muscles, muscle_bias, joint_count_level, dynamic_isometric, movement_plane, primary_joints, is_active)
  VALUES ('Tibialis Raise (Tib-bar)', 'strength', '{"ankle_extension"}'::text[], 'bilateral', 'anterior', 1, '{"fixed_machine"}'::text[], 'Tibialis anterior', '{"Toe extensors"}'::text[], 'mid', 'local', NULL, NULL, '{"Ankle"}'::text[], true)
  ON CONFLICT (name) DO UPDATE SET
    category = EXCLUDED.category,
    movement_patterns = EXCLUDED.movement_patterns,
    bilateral_unilateral = EXCLUDED.bilateral_unilateral,
    posterior_anterior = EXCLUDED.posterior_anterior,
    complexity = EXCLUDED.complexity,
    equipment = EXCLUDED.equipment,
    primary_muscle = EXCLUDED.primary_muscle,
    supporting_muscles = EXCLUDED.supporting_muscles,
    muscle_bias = EXCLUDED.muscle_bias,
    joint_count_level = EXCLUDED.joint_count_level,
    dynamic_isometric = EXCLUDED.dynamic_isometric,
    movement_plane = EXCLUDED.movement_plane,
    primary_joints = EXCLUDED.primary_joints,
    is_active = true,
    updated_at = now();

INSERT INTO exercise_library (name, category, movement_patterns, bilateral_unilateral, posterior_anterior, complexity, equipment, primary_muscle, supporting_muscles, muscle_bias, joint_count_level, dynamic_isometric, movement_plane, primary_joints, is_active)
  VALUES ('Decline Tibialis Raise (bodyweight, against wall)', 'strength', '{"ankle_extension"}'::text[], 'bilateral', 'anterior', 1, '{"bodyweight"}'::text[], 'Tibialis anterior', '{"Toe extensors"}'::text[], 'lengthened', 'local', NULL, NULL, '{"Ankle"}'::text[], true)
  ON CONFLICT (name) DO UPDATE SET
    category = EXCLUDED.category,
    movement_patterns = EXCLUDED.movement_patterns,
    bilateral_unilateral = EXCLUDED.bilateral_unilateral,
    posterior_anterior = EXCLUDED.posterior_anterior,
    complexity = EXCLUDED.complexity,
    equipment = EXCLUDED.equipment,
    primary_muscle = EXCLUDED.primary_muscle,
    supporting_muscles = EXCLUDED.supporting_muscles,
    muscle_bias = EXCLUDED.muscle_bias,
    joint_count_level = EXCLUDED.joint_count_level,
    dynamic_isometric = EXCLUDED.dynamic_isometric,
    movement_plane = EXCLUDED.movement_plane,
    primary_joints = EXCLUDED.primary_joints,
    is_active = true,
    updated_at = now();

INSERT INTO exercise_library (name, category, movement_patterns, bilateral_unilateral, posterior_anterior, complexity, equipment, primary_muscle, supporting_muscles, muscle_bias, joint_count_level, dynamic_isometric, movement_plane, primary_joints, is_active)
  VALUES ('Decline Tibialis Raise (Resistance band)', 'strength', '{"ankle_extension"}'::text[], 'bilateral', 'anterior', 1, '{"band"}'::text[], 'Tibialis anterior', '{"Toe extensors"}'::text[], 'lengthened', 'local', NULL, NULL, '{"Ankle"}'::text[], true)
  ON CONFLICT (name) DO UPDATE SET
    category = EXCLUDED.category,
    movement_patterns = EXCLUDED.movement_patterns,
    bilateral_unilateral = EXCLUDED.bilateral_unilateral,
    posterior_anterior = EXCLUDED.posterior_anterior,
    complexity = EXCLUDED.complexity,
    equipment = EXCLUDED.equipment,
    primary_muscle = EXCLUDED.primary_muscle,
    supporting_muscles = EXCLUDED.supporting_muscles,
    muscle_bias = EXCLUDED.muscle_bias,
    joint_count_level = EXCLUDED.joint_count_level,
    dynamic_isometric = EXCLUDED.dynamic_isometric,
    movement_plane = EXCLUDED.movement_plane,
    primary_joints = EXCLUDED.primary_joints,
    is_active = true,
    updated_at = now();

INSERT INTO exercise_library (name, category, movement_patterns, bilateral_unilateral, posterior_anterior, complexity, equipment, primary_muscle, supporting_muscles, muscle_bias, joint_count_level, dynamic_isometric, movement_plane, primary_joints, is_active)
  VALUES ('Decline Tibialis Raise (Tib-bar)', 'strength', '{"ankle_extension"}'::text[], 'bilateral', 'anterior', 1, '{"fixed_machine"}'::text[], 'Tibialis anterior', '{"Toe extensors"}'::text[], 'lengthened', 'local', NULL, NULL, '{"Ankle"}'::text[], true)
  ON CONFLICT (name) DO UPDATE SET
    category = EXCLUDED.category,
    movement_patterns = EXCLUDED.movement_patterns,
    bilateral_unilateral = EXCLUDED.bilateral_unilateral,
    posterior_anterior = EXCLUDED.posterior_anterior,
    complexity = EXCLUDED.complexity,
    equipment = EXCLUDED.equipment,
    primary_muscle = EXCLUDED.primary_muscle,
    supporting_muscles = EXCLUDED.supporting_muscles,
    muscle_bias = EXCLUDED.muscle_bias,
    joint_count_level = EXCLUDED.joint_count_level,
    dynamic_isometric = EXCLUDED.dynamic_isometric,
    movement_plane = EXCLUDED.movement_plane,
    primary_joints = EXCLUDED.primary_joints,
    is_active = true,
    updated_at = now();

INSERT INTO exercise_library (name, category, movement_patterns, bilateral_unilateral, posterior_anterior, complexity, equipment, primary_muscle, supporting_muscles, muscle_bias, joint_count_level, dynamic_isometric, movement_plane, primary_joints, is_active)
  VALUES ('Calf Raise iso Hold (top position)', 'strength', '{"ankle_extension"}'::text[], 'bilateral', 'posterior', 1, '{"bodyweight"}'::text[], 'Gastrocnemius', '{"Soleus"}'::text[], 'shortened', 'local', NULL, NULL, '{"Ankle"}'::text[], true)
  ON CONFLICT (name) DO UPDATE SET
    category = EXCLUDED.category,
    movement_patterns = EXCLUDED.movement_patterns,
    bilateral_unilateral = EXCLUDED.bilateral_unilateral,
    posterior_anterior = EXCLUDED.posterior_anterior,
    complexity = EXCLUDED.complexity,
    equipment = EXCLUDED.equipment,
    primary_muscle = EXCLUDED.primary_muscle,
    supporting_muscles = EXCLUDED.supporting_muscles,
    muscle_bias = EXCLUDED.muscle_bias,
    joint_count_level = EXCLUDED.joint_count_level,
    dynamic_isometric = EXCLUDED.dynamic_isometric,
    movement_plane = EXCLUDED.movement_plane,
    primary_joints = EXCLUDED.primary_joints,
    is_active = true,
    updated_at = now();

INSERT INTO exercise_library (name, category, movement_patterns, bilateral_unilateral, posterior_anterior, complexity, equipment, primary_muscle, supporting_muscles, muscle_bias, joint_count_level, dynamic_isometric, movement_plane, primary_joints, is_active)
  VALUES ('Glute Bridge Hold (double leg)', 'strength', '{"hip_extension"}'::text[], 'bilateral', 'posterior', 1, '{"bodyweight"}'::text[], 'Glute max', '{"Hamstrings","Core"}'::text[], 'shortened', 'regional', NULL, NULL, '{"Hip"}'::text[], true)
  ON CONFLICT (name) DO UPDATE SET
    category = EXCLUDED.category,
    movement_patterns = EXCLUDED.movement_patterns,
    bilateral_unilateral = EXCLUDED.bilateral_unilateral,
    posterior_anterior = EXCLUDED.posterior_anterior,
    complexity = EXCLUDED.complexity,
    equipment = EXCLUDED.equipment,
    primary_muscle = EXCLUDED.primary_muscle,
    supporting_muscles = EXCLUDED.supporting_muscles,
    muscle_bias = EXCLUDED.muscle_bias,
    joint_count_level = EXCLUDED.joint_count_level,
    dynamic_isometric = EXCLUDED.dynamic_isometric,
    movement_plane = EXCLUDED.movement_plane,
    primary_joints = EXCLUDED.primary_joints,
    is_active = true,
    updated_at = now();

INSERT INTO exercise_library (name, category, movement_patterns, bilateral_unilateral, posterior_anterior, complexity, equipment, primary_muscle, supporting_muscles, muscle_bias, joint_count_level, dynamic_isometric, movement_plane, primary_joints, is_active)
  VALUES ('Glute Bridge Hold (single leg)', 'strength', '{"hip_extension"}'::text[], 'unilateral', 'posterior', 2, '{"bodyweight"}'::text[], 'Glute max', '{"Hamstrings","Core"}'::text[], 'shortened', 'regional', NULL, NULL, '{"Hip"}'::text[], true)
  ON CONFLICT (name) DO UPDATE SET
    category = EXCLUDED.category,
    movement_patterns = EXCLUDED.movement_patterns,
    bilateral_unilateral = EXCLUDED.bilateral_unilateral,
    posterior_anterior = EXCLUDED.posterior_anterior,
    complexity = EXCLUDED.complexity,
    equipment = EXCLUDED.equipment,
    primary_muscle = EXCLUDED.primary_muscle,
    supporting_muscles = EXCLUDED.supporting_muscles,
    muscle_bias = EXCLUDED.muscle_bias,
    joint_count_level = EXCLUDED.joint_count_level,
    dynamic_isometric = EXCLUDED.dynamic_isometric,
    movement_plane = EXCLUDED.movement_plane,
    primary_joints = EXCLUDED.primary_joints,
    is_active = true,
    updated_at = now();

INSERT INTO exercise_library (name, category, movement_patterns, bilateral_unilateral, posterior_anterior, complexity, equipment, primary_muscle, supporting_muscles, muscle_bias, joint_count_level, dynamic_isometric, movement_plane, primary_joints, is_active)
  VALUES ('Hamstring Bridge Hold (heels elevated)', 'strength', '{"hip_extension"}'::text[], 'bilateral', 'posterior', 2, '{"bench","bodyweight"}'::text[], 'Hamstrings', '{"Glute max","Calves"}'::text[], 'lengthened', 'regional', NULL, NULL, '{"Hip","Knee"}'::text[], true)
  ON CONFLICT (name) DO UPDATE SET
    category = EXCLUDED.category,
    movement_patterns = EXCLUDED.movement_patterns,
    bilateral_unilateral = EXCLUDED.bilateral_unilateral,
    posterior_anterior = EXCLUDED.posterior_anterior,
    complexity = EXCLUDED.complexity,
    equipment = EXCLUDED.equipment,
    primary_muscle = EXCLUDED.primary_muscle,
    supporting_muscles = EXCLUDED.supporting_muscles,
    muscle_bias = EXCLUDED.muscle_bias,
    joint_count_level = EXCLUDED.joint_count_level,
    dynamic_isometric = EXCLUDED.dynamic_isometric,
    movement_plane = EXCLUDED.movement_plane,
    primary_joints = EXCLUDED.primary_joints,
    is_active = true,
    updated_at = now();

INSERT INTO exercise_library (name, category, movement_patterns, bilateral_unilateral, posterior_anterior, complexity, equipment, primary_muscle, supporting_muscles, muscle_bias, joint_count_level, dynamic_isometric, movement_plane, primary_joints, is_active)
  VALUES ('Sandbag Bear Hug Hold (timed)', 'strength', '{"core_anti_extension"}'::text[], 'bilateral', NULL, 2, '{"sandbag_dball"}'::text[], 'Core', '{"Upper back","Glute max","Forearms"}'::text[], 'mid', 'global', NULL, NULL, '{"Hip","Spine","Knee"}'::text[], true)
  ON CONFLICT (name) DO UPDATE SET
    category = EXCLUDED.category,
    movement_patterns = EXCLUDED.movement_patterns,
    bilateral_unilateral = EXCLUDED.bilateral_unilateral,
    posterior_anterior = EXCLUDED.posterior_anterior,
    complexity = EXCLUDED.complexity,
    equipment = EXCLUDED.equipment,
    primary_muscle = EXCLUDED.primary_muscle,
    supporting_muscles = EXCLUDED.supporting_muscles,
    muscle_bias = EXCLUDED.muscle_bias,
    joint_count_level = EXCLUDED.joint_count_level,
    dynamic_isometric = EXCLUDED.dynamic_isometric,
    movement_plane = EXCLUDED.movement_plane,
    primary_joints = EXCLUDED.primary_joints,
    is_active = true,
    updated_at = now();

INSERT INTO exercise_library (name, category, movement_patterns, bilateral_unilateral, posterior_anterior, complexity, equipment, primary_muscle, supporting_muscles, muscle_bias, joint_count_level, dynamic_isometric, movement_plane, primary_joints, is_active)
  VALUES ('Sandbag Bear Hug Carry', 'strength', '{"carry"}'::text[], 'bilateral', NULL, 2, '{"sandbag_dball"}'::text[], 'Core', '{"Upper back","Glute max","Forearms"}'::text[], 'mid', 'global', NULL, NULL, '{"Ankle","Knee","Hip","Spine"}'::text[], true)
  ON CONFLICT (name) DO UPDATE SET
    category = EXCLUDED.category,
    movement_patterns = EXCLUDED.movement_patterns,
    bilateral_unilateral = EXCLUDED.bilateral_unilateral,
    posterior_anterior = EXCLUDED.posterior_anterior,
    complexity = EXCLUDED.complexity,
    equipment = EXCLUDED.equipment,
    primary_muscle = EXCLUDED.primary_muscle,
    supporting_muscles = EXCLUDED.supporting_muscles,
    muscle_bias = EXCLUDED.muscle_bias,
    joint_count_level = EXCLUDED.joint_count_level,
    dynamic_isometric = EXCLUDED.dynamic_isometric,
    movement_plane = EXCLUDED.movement_plane,
    primary_joints = EXCLUDED.primary_joints,
    is_active = true,
    updated_at = now();

INSERT INTO exercise_library (name, category, movement_patterns, bilateral_unilateral, posterior_anterior, complexity, equipment, primary_muscle, supporting_muscles, muscle_bias, joint_count_level, dynamic_isometric, movement_plane, primary_joints, is_active)
  VALUES ('Side plank leg abduction isometric', 'strength', '{"core_anti_lateral_flexion"}'::text[], 'unilateral', 'posterior', 2, '{"bodyweight"}'::text[], 'Glute med/min', '{"Obliques"}'::text[], 'mid', 'regional', NULL, NULL, '{"Hip"}'::text[], true)
  ON CONFLICT (name) DO UPDATE SET
    category = EXCLUDED.category,
    movement_patterns = EXCLUDED.movement_patterns,
    bilateral_unilateral = EXCLUDED.bilateral_unilateral,
    posterior_anterior = EXCLUDED.posterior_anterior,
    complexity = EXCLUDED.complexity,
    equipment = EXCLUDED.equipment,
    primary_muscle = EXCLUDED.primary_muscle,
    supporting_muscles = EXCLUDED.supporting_muscles,
    muscle_bias = EXCLUDED.muscle_bias,
    joint_count_level = EXCLUDED.joint_count_level,
    dynamic_isometric = EXCLUDED.dynamic_isometric,
    movement_plane = EXCLUDED.movement_plane,
    primary_joints = EXCLUDED.primary_joints,
    is_active = true,
    updated_at = now();

INSERT INTO exercise_library (name, category, movement_patterns, bilateral_unilateral, posterior_anterior, complexity, equipment, primary_muscle, supporting_muscles, muscle_bias, joint_count_level, dynamic_isometric, movement_plane, primary_joints, is_active)
  VALUES ('Side plank leg abduction', 'strength', '{"core_anti_lateral_flexion"}'::text[], 'unilateral', 'posterior', 2, '{"bodyweight"}'::text[], 'Glute med/min', '{"Obliques"}'::text[], 'mid', 'regional', NULL, NULL, '{"Hip"}'::text[], true)
  ON CONFLICT (name) DO UPDATE SET
    category = EXCLUDED.category,
    movement_patterns = EXCLUDED.movement_patterns,
    bilateral_unilateral = EXCLUDED.bilateral_unilateral,
    posterior_anterior = EXCLUDED.posterior_anterior,
    complexity = EXCLUDED.complexity,
    equipment = EXCLUDED.equipment,
    primary_muscle = EXCLUDED.primary_muscle,
    supporting_muscles = EXCLUDED.supporting_muscles,
    muscle_bias = EXCLUDED.muscle_bias,
    joint_count_level = EXCLUDED.joint_count_level,
    dynamic_isometric = EXCLUDED.dynamic_isometric,
    movement_plane = EXCLUDED.movement_plane,
    primary_joints = EXCLUDED.primary_joints,
    is_active = true,
    updated_at = now();

INSERT INTO exercise_library (name, category, movement_patterns, bilateral_unilateral, posterior_anterior, complexity, equipment, primary_muscle, supporting_muscles, muscle_bias, joint_count_level, dynamic_isometric, movement_plane, primary_joints, is_active)
  VALUES ('Lying single leg abduction isometric', 'strength', '{"hip_extension"}'::text[], 'unilateral', 'posterior', 1, '{"bodyweight"}'::text[], 'Glute med/min', '{"TFL"}'::text[], 'mid', 'local', NULL, NULL, '{"Hip"}'::text[], true)
  ON CONFLICT (name) DO UPDATE SET
    category = EXCLUDED.category,
    movement_patterns = EXCLUDED.movement_patterns,
    bilateral_unilateral = EXCLUDED.bilateral_unilateral,
    posterior_anterior = EXCLUDED.posterior_anterior,
    complexity = EXCLUDED.complexity,
    equipment = EXCLUDED.equipment,
    primary_muscle = EXCLUDED.primary_muscle,
    supporting_muscles = EXCLUDED.supporting_muscles,
    muscle_bias = EXCLUDED.muscle_bias,
    joint_count_level = EXCLUDED.joint_count_level,
    dynamic_isometric = EXCLUDED.dynamic_isometric,
    movement_plane = EXCLUDED.movement_plane,
    primary_joints = EXCLUDED.primary_joints,
    is_active = true,
    updated_at = now();

INSERT INTO exercise_library (name, category, movement_patterns, bilateral_unilateral, posterior_anterior, complexity, equipment, primary_muscle, supporting_muscles, muscle_bias, joint_count_level, dynamic_isometric, movement_plane, primary_joints, is_active)
  VALUES ('Lying leg abduction', 'strength', '{"hip_extension"}'::text[], 'bilateral', 'posterior', 1, '{"bodyweight"}'::text[], 'Glute med/min', '{"TFL"}'::text[], 'mid', 'local', NULL, NULL, '{"Hip"}'::text[], true)
  ON CONFLICT (name) DO UPDATE SET
    category = EXCLUDED.category,
    movement_patterns = EXCLUDED.movement_patterns,
    bilateral_unilateral = EXCLUDED.bilateral_unilateral,
    posterior_anterior = EXCLUDED.posterior_anterior,
    complexity = EXCLUDED.complexity,
    equipment = EXCLUDED.equipment,
    primary_muscle = EXCLUDED.primary_muscle,
    supporting_muscles = EXCLUDED.supporting_muscles,
    muscle_bias = EXCLUDED.muscle_bias,
    joint_count_level = EXCLUDED.joint_count_level,
    dynamic_isometric = EXCLUDED.dynamic_isometric,
    movement_plane = EXCLUDED.movement_plane,
    primary_joints = EXCLUDED.primary_joints,
    is_active = true,
    updated_at = now();

INSERT INTO exercise_library (name, category, movement_patterns, bilateral_unilateral, posterior_anterior, complexity, equipment, primary_muscle, supporting_muscles, muscle_bias, joint_count_level, dynamic_isometric, movement_plane, primary_joints, is_active)
  VALUES ('glute band iosmetric squat hold', 'strength', '{"squat"}'::text[], 'bilateral', 'anterior', 2, '{"band"}'::text[], 'Quadriceps', '{"Glute med/min","Glute max"}'::text[], 'mid', 'regional', NULL, NULL, '{"Knee","Hip"}'::text[], true)
  ON CONFLICT (name) DO UPDATE SET
    category = EXCLUDED.category,
    movement_patterns = EXCLUDED.movement_patterns,
    bilateral_unilateral = EXCLUDED.bilateral_unilateral,
    posterior_anterior = EXCLUDED.posterior_anterior,
    complexity = EXCLUDED.complexity,
    equipment = EXCLUDED.equipment,
    primary_muscle = EXCLUDED.primary_muscle,
    supporting_muscles = EXCLUDED.supporting_muscles,
    muscle_bias = EXCLUDED.muscle_bias,
    joint_count_level = EXCLUDED.joint_count_level,
    dynamic_isometric = EXCLUDED.dynamic_isometric,
    movement_plane = EXCLUDED.movement_plane,
    primary_joints = EXCLUDED.primary_joints,
    is_active = true,
    updated_at = now();

INSERT INTO exercise_library (name, category, movement_patterns, bilateral_unilateral, posterior_anterior, complexity, equipment, primary_muscle, supporting_muscles, muscle_bias, joint_count_level, dynamic_isometric, movement_plane, primary_joints, is_active)
  VALUES ('RNT splti squat (pulling knee in)', 'strength', '{"lunge"}'::text[], 'unilateral', 'anterior', 2, '{"band"}'::text[], 'Quadriceps', '{"Glute max","Adductors"}'::text[], 'mid', 'regional', NULL, NULL, '{"Knee","Hip"}'::text[], true)
  ON CONFLICT (name) DO UPDATE SET
    category = EXCLUDED.category,
    movement_patterns = EXCLUDED.movement_patterns,
    bilateral_unilateral = EXCLUDED.bilateral_unilateral,
    posterior_anterior = EXCLUDED.posterior_anterior,
    complexity = EXCLUDED.complexity,
    equipment = EXCLUDED.equipment,
    primary_muscle = EXCLUDED.primary_muscle,
    supporting_muscles = EXCLUDED.supporting_muscles,
    muscle_bias = EXCLUDED.muscle_bias,
    joint_count_level = EXCLUDED.joint_count_level,
    dynamic_isometric = EXCLUDED.dynamic_isometric,
    movement_plane = EXCLUDED.movement_plane,
    primary_joints = EXCLUDED.primary_joints,
    is_active = true,
    updated_at = now();

INSERT INTO exercise_library (name, category, movement_patterns, bilateral_unilateral, posterior_anterior, complexity, equipment, primary_muscle, supporting_muscles, muscle_bias, joint_count_level, dynamic_isometric, movement_plane, primary_joints, is_active)
  VALUES ('RNT splti squat (pulling knee out)', 'strength', '{"lunge"}'::text[], 'unilateral', 'posterior', 2, '{"band"}'::text[], 'Glute max', '{"Quadriceps","Glute med/min"}'::text[], 'mid', 'regional', NULL, NULL, '{"Knee","Hip"}'::text[], true)
  ON CONFLICT (name) DO UPDATE SET
    category = EXCLUDED.category,
    movement_patterns = EXCLUDED.movement_patterns,
    bilateral_unilateral = EXCLUDED.bilateral_unilateral,
    posterior_anterior = EXCLUDED.posterior_anterior,
    complexity = EXCLUDED.complexity,
    equipment = EXCLUDED.equipment,
    primary_muscle = EXCLUDED.primary_muscle,
    supporting_muscles = EXCLUDED.supporting_muscles,
    muscle_bias = EXCLUDED.muscle_bias,
    joint_count_level = EXCLUDED.joint_count_level,
    dynamic_isometric = EXCLUDED.dynamic_isometric,
    movement_plane = EXCLUDED.movement_plane,
    primary_joints = EXCLUDED.primary_joints,
    is_active = true,
    updated_at = now();

INSERT INTO exercise_library (name, category, movement_patterns, bilateral_unilateral, posterior_anterior, complexity, equipment, primary_muscle, supporting_muscles, muscle_bias, joint_count_level, dynamic_isometric, movement_plane, primary_joints, is_active)
  VALUES ('Side lyhing Banded clam shell', 'strength', '{"hip_extension"}'::text[], 'bilateral', 'posterior', 1, '{"band"}'::text[], 'Glute med/min', '{"Deep hip external rotators"}'::text[], 'shortened', 'local', NULL, NULL, '{"Hip"}'::text[], true)
  ON CONFLICT (name) DO UPDATE SET
    category = EXCLUDED.category,
    movement_patterns = EXCLUDED.movement_patterns,
    bilateral_unilateral = EXCLUDED.bilateral_unilateral,
    posterior_anterior = EXCLUDED.posterior_anterior,
    complexity = EXCLUDED.complexity,
    equipment = EXCLUDED.equipment,
    primary_muscle = EXCLUDED.primary_muscle,
    supporting_muscles = EXCLUDED.supporting_muscles,
    muscle_bias = EXCLUDED.muscle_bias,
    joint_count_level = EXCLUDED.joint_count_level,
    dynamic_isometric = EXCLUDED.dynamic_isometric,
    movement_plane = EXCLUDED.movement_plane,
    primary_joints = EXCLUDED.primary_joints,
    is_active = true,
    updated_at = now();

INSERT INTO exercise_library (name, category, movement_patterns, bilateral_unilateral, posterior_anterior, complexity, equipment, primary_muscle, supporting_muscles, muscle_bias, joint_count_level, dynamic_isometric, movement_plane, primary_joints, is_active)
  VALUES ('Russian Kettlebell swing', 'strength', '{"hinge"}'::text[], 'bilateral', 'posterior', 2, '{"kettlebell"}'::text[], 'Glute max', '{"Hamstrings","Spinal erectors","grip","lats","spinal erectors"}'::text[], 'mid', 'regional', 'dynamic', NULL, '{"Hip"}'::text[], true)
  ON CONFLICT (name) DO UPDATE SET
    category = EXCLUDED.category,
    movement_patterns = EXCLUDED.movement_patterns,
    bilateral_unilateral = EXCLUDED.bilateral_unilateral,
    posterior_anterior = EXCLUDED.posterior_anterior,
    complexity = EXCLUDED.complexity,
    equipment = EXCLUDED.equipment,
    primary_muscle = EXCLUDED.primary_muscle,
    supporting_muscles = EXCLUDED.supporting_muscles,
    muscle_bias = EXCLUDED.muscle_bias,
    joint_count_level = EXCLUDED.joint_count_level,
    dynamic_isometric = EXCLUDED.dynamic_isometric,
    movement_plane = EXCLUDED.movement_plane,
    primary_joints = EXCLUDED.primary_joints,
    is_active = true,
    updated_at = now();

INSERT INTO exercise_library (name, category, movement_patterns, bilateral_unilateral, posterior_anterior, complexity, equipment, primary_muscle, supporting_muscles, muscle_bias, joint_count_level, dynamic_isometric, movement_plane, primary_joints, is_active)
  VALUES ('Dual Russian Kettlebell swing', 'strength', '{"hinge"}'::text[], 'bilateral', 'posterior', 2, '{"kettlebell"}'::text[], 'Glute max', '{"Hamstrings","Spinal erectors"}'::text[], 'mid', 'regional', NULL, NULL, '{"Hip"}'::text[], true)
  ON CONFLICT (name) DO UPDATE SET
    category = EXCLUDED.category,
    movement_patterns = EXCLUDED.movement_patterns,
    bilateral_unilateral = EXCLUDED.bilateral_unilateral,
    posterior_anterior = EXCLUDED.posterior_anterior,
    complexity = EXCLUDED.complexity,
    equipment = EXCLUDED.equipment,
    primary_muscle = EXCLUDED.primary_muscle,
    supporting_muscles = EXCLUDED.supporting_muscles,
    muscle_bias = EXCLUDED.muscle_bias,
    joint_count_level = EXCLUDED.joint_count_level,
    dynamic_isometric = EXCLUDED.dynamic_isometric,
    movement_plane = EXCLUDED.movement_plane,
    primary_joints = EXCLUDED.primary_joints,
    is_active = true,
    updated_at = now();

INSERT INTO exercise_library (name, category, movement_patterns, bilateral_unilateral, posterior_anterior, complexity, equipment, primary_muscle, supporting_muscles, muscle_bias, joint_count_level, dynamic_isometric, movement_plane, primary_joints, is_active)
  VALUES ('Single arm Russian Kettlebell swing', 'strength', '{"hinge"}'::text[], 'unilateral', 'posterior', 2, '{"kettlebell"}'::text[], 'Glute max', '{"Hamstrings","Obliques"}'::text[], 'mid', 'regional', NULL, NULL, '{"Hip"}'::text[], true)
  ON CONFLICT (name) DO UPDATE SET
    category = EXCLUDED.category,
    movement_patterns = EXCLUDED.movement_patterns,
    bilateral_unilateral = EXCLUDED.bilateral_unilateral,
    posterior_anterior = EXCLUDED.posterior_anterior,
    complexity = EXCLUDED.complexity,
    equipment = EXCLUDED.equipment,
    primary_muscle = EXCLUDED.primary_muscle,
    supporting_muscles = EXCLUDED.supporting_muscles,
    muscle_bias = EXCLUDED.muscle_bias,
    joint_count_level = EXCLUDED.joint_count_level,
    dynamic_isometric = EXCLUDED.dynamic_isometric,
    movement_plane = EXCLUDED.movement_plane,
    primary_joints = EXCLUDED.primary_joints,
    is_active = true,
    updated_at = now();

INSERT INTO exercise_library (name, category, movement_patterns, bilateral_unilateral, posterior_anterior, complexity, equipment, primary_muscle, supporting_muscles, muscle_bias, joint_count_level, dynamic_isometric, movement_plane, primary_joints, is_active)
  VALUES ('American Kettlebell swing', 'strength', '{"hinge"}'::text[], 'bilateral', 'posterior', 2, '{"kettlebell"}'::text[], 'Glute max', '{"Hamstrings","Spinal erectors"}'::text[], 'mid', 'regional', NULL, NULL, '{"Hip"}'::text[], true)
  ON CONFLICT (name) DO UPDATE SET
    category = EXCLUDED.category,
    movement_patterns = EXCLUDED.movement_patterns,
    bilateral_unilateral = EXCLUDED.bilateral_unilateral,
    posterior_anterior = EXCLUDED.posterior_anterior,
    complexity = EXCLUDED.complexity,
    equipment = EXCLUDED.equipment,
    primary_muscle = EXCLUDED.primary_muscle,
    supporting_muscles = EXCLUDED.supporting_muscles,
    muscle_bias = EXCLUDED.muscle_bias,
    joint_count_level = EXCLUDED.joint_count_level,
    dynamic_isometric = EXCLUDED.dynamic_isometric,
    movement_plane = EXCLUDED.movement_plane,
    primary_joints = EXCLUDED.primary_joints,
    is_active = true,
    updated_at = now();

INSERT INTO exercise_library (name, category, movement_patterns, bilateral_unilateral, posterior_anterior, complexity, equipment, primary_muscle, supporting_muscles, muscle_bias, joint_count_level, dynamic_isometric, movement_plane, primary_joints, is_active)
  VALUES ('45° hip Extension', 'strength', '{"hinge"}'::text[], 'bilateral', 'posterior', 2, '{"bodyweight"}'::text[], 'Glute max', '{"Hamstrings","Spinal erectors"}'::text[], 'mid', 'regional', NULL, NULL, '{"Hip","Spine"}'::text[], true)
  ON CONFLICT (name) DO UPDATE SET
    category = EXCLUDED.category,
    movement_patterns = EXCLUDED.movement_patterns,
    bilateral_unilateral = EXCLUDED.bilateral_unilateral,
    posterior_anterior = EXCLUDED.posterior_anterior,
    complexity = EXCLUDED.complexity,
    equipment = EXCLUDED.equipment,
    primary_muscle = EXCLUDED.primary_muscle,
    supporting_muscles = EXCLUDED.supporting_muscles,
    muscle_bias = EXCLUDED.muscle_bias,
    joint_count_level = EXCLUDED.joint_count_level,
    dynamic_isometric = EXCLUDED.dynamic_isometric,
    movement_plane = EXCLUDED.movement_plane,
    primary_joints = EXCLUDED.primary_joints,
    is_active = true,
    updated_at = now();

INSERT INTO exercise_library (name, category, movement_patterns, bilateral_unilateral, posterior_anterior, complexity, equipment, primary_muscle, supporting_muscles, muscle_bias, joint_count_level, dynamic_isometric, movement_plane, primary_joints, is_active)
  VALUES ('45° hip Extension (weighted)', 'strength', '{"hinge"}'::text[], 'bilateral', 'posterior', 1, '{"fixed_machine"}'::text[], 'Glute max', '{"Hamstrings","Spinal erectors"}'::text[], 'mid', 'regional', NULL, NULL, '{"Ankle"}'::text[], true)
  ON CONFLICT (name) DO UPDATE SET
    category = EXCLUDED.category,
    movement_patterns = EXCLUDED.movement_patterns,
    bilateral_unilateral = EXCLUDED.bilateral_unilateral,
    posterior_anterior = EXCLUDED.posterior_anterior,
    complexity = EXCLUDED.complexity,
    equipment = EXCLUDED.equipment,
    primary_muscle = EXCLUDED.primary_muscle,
    supporting_muscles = EXCLUDED.supporting_muscles,
    muscle_bias = EXCLUDED.muscle_bias,
    joint_count_level = EXCLUDED.joint_count_level,
    dynamic_isometric = EXCLUDED.dynamic_isometric,
    movement_plane = EXCLUDED.movement_plane,
    primary_joints = EXCLUDED.primary_joints,
    is_active = true,
    updated_at = now();

INSERT INTO exercise_library (name, category, movement_patterns, bilateral_unilateral, posterior_anterior, complexity, equipment, primary_muscle, supporting_muscles, muscle_bias, joint_count_level, dynamic_isometric, movement_plane, primary_joints, is_active)
  VALUES ('Seated Calf Raise Hold', 'strength', '{"ankle_extension"}'::text[], 'bilateral', 'posterior', 1, '{"fixed_machine"}'::text[], 'Soleus', '{"Gastrocnemius"}'::text[], 'shortened', 'local', NULL, NULL, '{"Ankle"}'::text[], true)
  ON CONFLICT (name) DO UPDATE SET
    category = EXCLUDED.category,
    movement_patterns = EXCLUDED.movement_patterns,
    bilateral_unilateral = EXCLUDED.bilateral_unilateral,
    posterior_anterior = EXCLUDED.posterior_anterior,
    complexity = EXCLUDED.complexity,
    equipment = EXCLUDED.equipment,
    primary_muscle = EXCLUDED.primary_muscle,
    supporting_muscles = EXCLUDED.supporting_muscles,
    muscle_bias = EXCLUDED.muscle_bias,
    joint_count_level = EXCLUDED.joint_count_level,
    dynamic_isometric = EXCLUDED.dynamic_isometric,
    movement_plane = EXCLUDED.movement_plane,
    primary_joints = EXCLUDED.primary_joints,
    is_active = true,
    updated_at = now();

INSERT INTO exercise_library (name, category, movement_patterns, bilateral_unilateral, posterior_anterior, complexity, equipment, primary_muscle, supporting_muscles, muscle_bias, joint_count_level, dynamic_isometric, movement_plane, primary_joints, is_active)
  VALUES ('Bent-knee Calf ISO Hold', 'strength', '{"ankle_extension"}'::text[], 'bilateral', 'posterior', 1, '{"bodyweight"}'::text[], 'Soleus', '{"Gastrocnemius"}'::text[], 'shortened', 'local', NULL, NULL, '{"Ankle"}'::text[], true)
  ON CONFLICT (name) DO UPDATE SET
    category = EXCLUDED.category,
    movement_patterns = EXCLUDED.movement_patterns,
    bilateral_unilateral = EXCLUDED.bilateral_unilateral,
    posterior_anterior = EXCLUDED.posterior_anterior,
    complexity = EXCLUDED.complexity,
    equipment = EXCLUDED.equipment,
    primary_muscle = EXCLUDED.primary_muscle,
    supporting_muscles = EXCLUDED.supporting_muscles,
    muscle_bias = EXCLUDED.muscle_bias,
    joint_count_level = EXCLUDED.joint_count_level,
    dynamic_isometric = EXCLUDED.dynamic_isometric,
    movement_plane = EXCLUDED.movement_plane,
    primary_joints = EXCLUDED.primary_joints,
    is_active = true,
    updated_at = now();

INSERT INTO exercise_library (name, category, movement_patterns, bilateral_unilateral, posterior_anterior, complexity, equipment, primary_muscle, supporting_muscles, muscle_bias, joint_count_level, dynamic_isometric, movement_plane, primary_joints, is_active)
  VALUES ('Box jump (two-foot takeoff → two-foot landing)', 'strength', '{"jumps_plyos"}'::text[], 'bilateral', 'posterior', 2, '{"plyo_box"}'::text[], 'Glute max', '{"Quads","calves","hamstrings","trunk stabilizers"}'::text[], 'mid', 'global', NULL, NULL, '{"Ankle","Knee","Hip"}'::text[], true)
  ON CONFLICT (name) DO UPDATE SET
    category = EXCLUDED.category,
    movement_patterns = EXCLUDED.movement_patterns,
    bilateral_unilateral = EXCLUDED.bilateral_unilateral,
    posterior_anterior = EXCLUDED.posterior_anterior,
    complexity = EXCLUDED.complexity,
    equipment = EXCLUDED.equipment,
    primary_muscle = EXCLUDED.primary_muscle,
    supporting_muscles = EXCLUDED.supporting_muscles,
    muscle_bias = EXCLUDED.muscle_bias,
    joint_count_level = EXCLUDED.joint_count_level,
    dynamic_isometric = EXCLUDED.dynamic_isometric,
    movement_plane = EXCLUDED.movement_plane,
    primary_joints = EXCLUDED.primary_joints,
    is_active = true,
    updated_at = now();

INSERT INTO exercise_library (name, category, movement_patterns, bilateral_unilateral, posterior_anterior, complexity, equipment, primary_muscle, supporting_muscles, muscle_bias, joint_count_level, dynamic_isometric, movement_plane, primary_joints, is_active)
  VALUES ('Box jump with step down', 'strength', '{"jumps_plyos"}'::text[], 'bilateral', 'posterior', 2, '{"plyo_box"}'::text[], 'Glute max', '{"Quads","calves","hamstrings","trunk stabilizers"}'::text[], 'mid', 'global', NULL, NULL, '{"Ankle","Knee","Hip"}'::text[], true)
  ON CONFLICT (name) DO UPDATE SET
    category = EXCLUDED.category,
    movement_patterns = EXCLUDED.movement_patterns,
    bilateral_unilateral = EXCLUDED.bilateral_unilateral,
    posterior_anterior = EXCLUDED.posterior_anterior,
    complexity = EXCLUDED.complexity,
    equipment = EXCLUDED.equipment,
    primary_muscle = EXCLUDED.primary_muscle,
    supporting_muscles = EXCLUDED.supporting_muscles,
    muscle_bias = EXCLUDED.muscle_bias,
    joint_count_level = EXCLUDED.joint_count_level,
    dynamic_isometric = EXCLUDED.dynamic_isometric,
    movement_plane = EXCLUDED.movement_plane,
    primary_joints = EXCLUDED.primary_joints,
    is_active = true,
    updated_at = now();

INSERT INTO exercise_library (name, category, movement_patterns, bilateral_unilateral, posterior_anterior, complexity, equipment, primary_muscle, supporting_muscles, muscle_bias, joint_count_level, dynamic_isometric, movement_plane, primary_joints, is_active)
  VALUES ('Box jump rebound', 'strength', '{"jumps_plyos"}'::text[], 'bilateral', 'posterior', 3, '{"plyo_box"}'::text[], 'Calves', '{"Glute max","quads","hamstrings","trunk stabilizers"}'::text[], 'mid', 'global', NULL, NULL, '{"Ankle","Knee","Hip"}'::text[], true)
  ON CONFLICT (name) DO UPDATE SET
    category = EXCLUDED.category,
    movement_patterns = EXCLUDED.movement_patterns,
    bilateral_unilateral = EXCLUDED.bilateral_unilateral,
    posterior_anterior = EXCLUDED.posterior_anterior,
    complexity = EXCLUDED.complexity,
    equipment = EXCLUDED.equipment,
    primary_muscle = EXCLUDED.primary_muscle,
    supporting_muscles = EXCLUDED.supporting_muscles,
    muscle_bias = EXCLUDED.muscle_bias,
    joint_count_level = EXCLUDED.joint_count_level,
    dynamic_isometric = EXCLUDED.dynamic_isometric,
    movement_plane = EXCLUDED.movement_plane,
    primary_joints = EXCLUDED.primary_joints,
    is_active = true,
    updated_at = now();

INSERT INTO exercise_library (name, category, movement_patterns, bilateral_unilateral, posterior_anterior, complexity, equipment, primary_muscle, supporting_muscles, muscle_bias, joint_count_level, dynamic_isometric, movement_plane, primary_joints, is_active)
  VALUES ('Box jump to stick (pause/hold landing)', 'strength', '{"jumps_plyos"}'::text[], 'bilateral', 'posterior', 2, '{"plyo_box"}'::text[], 'Glute max', '{"Quads","calves","hamstrings","trunk stabilizers"}'::text[], 'lengthened', 'global', NULL, NULL, '{"Ankle","Knee","Hip"}'::text[], true)
  ON CONFLICT (name) DO UPDATE SET
    category = EXCLUDED.category,
    movement_patterns = EXCLUDED.movement_patterns,
    bilateral_unilateral = EXCLUDED.bilateral_unilateral,
    posterior_anterior = EXCLUDED.posterior_anterior,
    complexity = EXCLUDED.complexity,
    equipment = EXCLUDED.equipment,
    primary_muscle = EXCLUDED.primary_muscle,
    supporting_muscles = EXCLUDED.supporting_muscles,
    muscle_bias = EXCLUDED.muscle_bias,
    joint_count_level = EXCLUDED.joint_count_level,
    dynamic_isometric = EXCLUDED.dynamic_isometric,
    movement_plane = EXCLUDED.movement_plane,
    primary_joints = EXCLUDED.primary_joints,
    is_active = true,
    updated_at = now();

INSERT INTO exercise_library (name, category, movement_patterns, bilateral_unilateral, posterior_anterior, complexity, equipment, primary_muscle, supporting_muscles, muscle_bias, joint_count_level, dynamic_isometric, movement_plane, primary_joints, is_active)
  VALUES ('Box jump + squat hold (stick then hold depth)', 'strength', '{"squat"}'::text[], 'bilateral', 'posterior', 2, '{"plyo_box"}'::text[], 'Quads', '{"Glute max","calves","adductors","trunk stabilizers"}'::text[], 'lengthened', 'global', NULL, NULL, '{"Ankle","Knee","Hip"}'::text[], true)
  ON CONFLICT (name) DO UPDATE SET
    category = EXCLUDED.category,
    movement_patterns = EXCLUDED.movement_patterns,
    bilateral_unilateral = EXCLUDED.bilateral_unilateral,
    posterior_anterior = EXCLUDED.posterior_anterior,
    complexity = EXCLUDED.complexity,
    equipment = EXCLUDED.equipment,
    primary_muscle = EXCLUDED.primary_muscle,
    supporting_muscles = EXCLUDED.supporting_muscles,
    muscle_bias = EXCLUDED.muscle_bias,
    joint_count_level = EXCLUDED.joint_count_level,
    dynamic_isometric = EXCLUDED.dynamic_isometric,
    movement_plane = EXCLUDED.movement_plane,
    primary_joints = EXCLUDED.primary_joints,
    is_active = true,
    updated_at = now();

INSERT INTO exercise_library (name, category, movement_patterns, bilateral_unilateral, posterior_anterior, complexity, equipment, primary_muscle, supporting_muscles, muscle_bias, joint_count_level, dynamic_isometric, movement_plane, primary_joints, is_active)
  VALUES ('Lateral box jump (sideways over and onto box)', 'strength', '{"jumps_plyos"}'::text[], 'bilateral', NULL, 3, '{"plyo_box"}'::text[], 'Glute med/min', '{"Glute max","quads","calves","adductors","trunk stabilizers"}'::text[], 'mid', 'global', NULL, NULL, '{"Ankle","Knee","Hip"}'::text[], true)
  ON CONFLICT (name) DO UPDATE SET
    category = EXCLUDED.category,
    movement_patterns = EXCLUDED.movement_patterns,
    bilateral_unilateral = EXCLUDED.bilateral_unilateral,
    posterior_anterior = EXCLUDED.posterior_anterior,
    complexity = EXCLUDED.complexity,
    equipment = EXCLUDED.equipment,
    primary_muscle = EXCLUDED.primary_muscle,
    supporting_muscles = EXCLUDED.supporting_muscles,
    muscle_bias = EXCLUDED.muscle_bias,
    joint_count_level = EXCLUDED.joint_count_level,
    dynamic_isometric = EXCLUDED.dynamic_isometric,
    movement_plane = EXCLUDED.movement_plane,
    primary_joints = EXCLUDED.primary_joints,
    is_active = true,
    updated_at = now();

INSERT INTO exercise_library (name, category, movement_patterns, bilateral_unilateral, posterior_anterior, complexity, equipment, primary_muscle, supporting_muscles, muscle_bias, joint_count_level, dynamic_isometric, movement_plane, primary_joints, is_active)
  VALUES ('Box jump over', 'strength', '{"jumps_plyos"}'::text[], 'bilateral', 'posterior', 3, '{"plyo_box"}'::text[], 'Glute max', '{"Glutes","Quads","calves","core","hamstrings","trunk stabilizers"}'::text[], 'mid', 'global', 'dynamic', NULL, '{"Ankle","Hip","Knee"}'::text[], true)
  ON CONFLICT (name) DO UPDATE SET
    category = EXCLUDED.category,
    movement_patterns = EXCLUDED.movement_patterns,
    bilateral_unilateral = EXCLUDED.bilateral_unilateral,
    posterior_anterior = EXCLUDED.posterior_anterior,
    complexity = EXCLUDED.complexity,
    equipment = EXCLUDED.equipment,
    primary_muscle = EXCLUDED.primary_muscle,
    supporting_muscles = EXCLUDED.supporting_muscles,
    muscle_bias = EXCLUDED.muscle_bias,
    joint_count_level = EXCLUDED.joint_count_level,
    dynamic_isometric = EXCLUDED.dynamic_isometric,
    movement_plane = EXCLUDED.movement_plane,
    primary_joints = EXCLUDED.primary_joints,
    is_active = true,
    updated_at = now();

INSERT INTO exercise_library (name, category, movement_patterns, bilateral_unilateral, posterior_anterior, complexity, equipment, primary_muscle, supporting_muscles, muscle_bias, joint_count_level, dynamic_isometric, movement_plane, primary_joints, is_active)
  VALUES ('Single leg box jump (single leg take off and landing)', 'strength', '{"jumps_plyos"}'::text[], 'unilateral', 'posterior', 3, '{"plyo_box"}'::text[], 'Glute max', '{"Quads","calves","hamstrings","glute med/min","trunk stabilizers"}'::text[], 'mid', 'global', NULL, NULL, '{"Ankle","Knee","Hip"}'::text[], true)
  ON CONFLICT (name) DO UPDATE SET
    category = EXCLUDED.category,
    movement_patterns = EXCLUDED.movement_patterns,
    bilateral_unilateral = EXCLUDED.bilateral_unilateral,
    posterior_anterior = EXCLUDED.posterior_anterior,
    complexity = EXCLUDED.complexity,
    equipment = EXCLUDED.equipment,
    primary_muscle = EXCLUDED.primary_muscle,
    supporting_muscles = EXCLUDED.supporting_muscles,
    muscle_bias = EXCLUDED.muscle_bias,
    joint_count_level = EXCLUDED.joint_count_level,
    dynamic_isometric = EXCLUDED.dynamic_isometric,
    movement_plane = EXCLUDED.movement_plane,
    primary_joints = EXCLUDED.primary_joints,
    is_active = true,
    updated_at = now();

INSERT INTO exercise_library (name, category, movement_patterns, bilateral_unilateral, posterior_anterior, complexity, equipment, primary_muscle, supporting_muscles, muscle_bias, joint_count_level, dynamic_isometric, movement_plane, primary_joints, is_active)
  VALUES ('Box jump with single leg ladning (double leg take off, single leg landing)', 'strength', '{"jumps_plyos"}'::text[], 'bilateral', 'posterior', 3, '{"plyo_box"}'::text[], 'Glute med/min', '{"Glute max","quads","calves","hamstrings","trunk stabilizers"}'::text[], 'lengthened', 'global', NULL, NULL, '{"Ankle","Knee","Hip"}'::text[], true)
  ON CONFLICT (name) DO UPDATE SET
    category = EXCLUDED.category,
    movement_patterns = EXCLUDED.movement_patterns,
    bilateral_unilateral = EXCLUDED.bilateral_unilateral,
    posterior_anterior = EXCLUDED.posterior_anterior,
    complexity = EXCLUDED.complexity,
    equipment = EXCLUDED.equipment,
    primary_muscle = EXCLUDED.primary_muscle,
    supporting_muscles = EXCLUDED.supporting_muscles,
    muscle_bias = EXCLUDED.muscle_bias,
    joint_count_level = EXCLUDED.joint_count_level,
    dynamic_isometric = EXCLUDED.dynamic_isometric,
    movement_plane = EXCLUDED.movement_plane,
    primary_joints = EXCLUDED.primary_joints,
    is_active = true,
    updated_at = now();

INSERT INTO exercise_library (name, category, movement_patterns, bilateral_unilateral, posterior_anterior, complexity, equipment, primary_muscle, supporting_muscles, muscle_bias, joint_count_level, dynamic_isometric, movement_plane, primary_joints, is_active)
  VALUES ('Seated box jump (from seated start; minimal countermovement)', 'strength', '{"jumps_plyos"}'::text[], 'bilateral', 'posterior', 3, '{"plyo_box"}'::text[], 'Glute max', '{"Quads","calves","hamstrings","trunk stabilizers"}'::text[], 'mid', 'global', NULL, NULL, '{"Ankle","Knee","Hip"}'::text[], true)
  ON CONFLICT (name) DO UPDATE SET
    category = EXCLUDED.category,
    movement_patterns = EXCLUDED.movement_patterns,
    bilateral_unilateral = EXCLUDED.bilateral_unilateral,
    posterior_anterior = EXCLUDED.posterior_anterior,
    complexity = EXCLUDED.complexity,
    equipment = EXCLUDED.equipment,
    primary_muscle = EXCLUDED.primary_muscle,
    supporting_muscles = EXCLUDED.supporting_muscles,
    muscle_bias = EXCLUDED.muscle_bias,
    joint_count_level = EXCLUDED.joint_count_level,
    dynamic_isometric = EXCLUDED.dynamic_isometric,
    movement_plane = EXCLUDED.movement_plane,
    primary_joints = EXCLUDED.primary_joints,
    is_active = true,
    updated_at = now();

INSERT INTO exercise_library (name, category, movement_patterns, bilateral_unilateral, posterior_anterior, complexity, equipment, primary_muscle, supporting_muscles, muscle_bias, joint_count_level, dynamic_isometric, movement_plane, primary_joints, is_active)
  VALUES ('Tall box jump (landing with straight legs)', 'strength', '{"jumps_plyos"}'::text[], 'bilateral', 'posterior', 3, '{"plyo_box"}'::text[], 'Calves', '{"Quads","glute max","hamstrings","trunk stabilizers"}'::text[], 'mid', 'global', NULL, NULL, '{"Ankle","Knee","Hip"}'::text[], true)
  ON CONFLICT (name) DO UPDATE SET
    category = EXCLUDED.category,
    movement_patterns = EXCLUDED.movement_patterns,
    bilateral_unilateral = EXCLUDED.bilateral_unilateral,
    posterior_anterior = EXCLUDED.posterior_anterior,
    complexity = EXCLUDED.complexity,
    equipment = EXCLUDED.equipment,
    primary_muscle = EXCLUDED.primary_muscle,
    supporting_muscles = EXCLUDED.supporting_muscles,
    muscle_bias = EXCLUDED.muscle_bias,
    joint_count_level = EXCLUDED.joint_count_level,
    dynamic_isometric = EXCLUDED.dynamic_isometric,
    movement_plane = EXCLUDED.movement_plane,
    primary_joints = EXCLUDED.primary_joints,
    is_active = true,
    updated_at = now();

INSERT INTO exercise_library (name, category, movement_patterns, bilateral_unilateral, posterior_anterior, complexity, equipment, primary_muscle, supporting_muscles, muscle_bias, joint_count_level, dynamic_isometric, movement_plane, primary_joints, is_active)
  VALUES ('Depth drop to box jump (step off small height, rebound up to box)', 'strength', '{"jumps_plyos"}'::text[], 'bilateral', 'posterior', 3, '{"plyo_box"}'::text[], 'Calves', '{"Glute max","quads","hamstrings","trunk stabilizers"}'::text[], 'mid', 'global', NULL, NULL, '{"Ankle","Knee","Hip"}'::text[], true)
  ON CONFLICT (name) DO UPDATE SET
    category = EXCLUDED.category,
    movement_patterns = EXCLUDED.movement_patterns,
    bilateral_unilateral = EXCLUDED.bilateral_unilateral,
    posterior_anterior = EXCLUDED.posterior_anterior,
    complexity = EXCLUDED.complexity,
    equipment = EXCLUDED.equipment,
    primary_muscle = EXCLUDED.primary_muscle,
    supporting_muscles = EXCLUDED.supporting_muscles,
    muscle_bias = EXCLUDED.muscle_bias,
    joint_count_level = EXCLUDED.joint_count_level,
    dynamic_isometric = EXCLUDED.dynamic_isometric,
    movement_plane = EXCLUDED.movement_plane,
    primary_joints = EXCLUDED.primary_joints,
    is_active = true,
    updated_at = now();

INSERT INTO exercise_library (name, category, movement_patterns, bilateral_unilateral, posterior_anterior, complexity, equipment, primary_muscle, supporting_muscles, muscle_bias, joint_count_level, dynamic_isometric, movement_plane, primary_joints, is_active)
  VALUES ('Box jump → depth drop (jump up, step off and land)', 'strength', '{"jumps_plyos"}'::text[], 'bilateral', 'posterior', 3, '{"plyo_box"}'::text[], 'Quads', '{"Glute max","calves","hamstrings","trunk stabilizers"}'::text[], 'lengthened', 'global', NULL, NULL, '{"Ankle","Knee","Hip"}'::text[], true)
  ON CONFLICT (name) DO UPDATE SET
    category = EXCLUDED.category,
    movement_patterns = EXCLUDED.movement_patterns,
    bilateral_unilateral = EXCLUDED.bilateral_unilateral,
    posterior_anterior = EXCLUDED.posterior_anterior,
    complexity = EXCLUDED.complexity,
    equipment = EXCLUDED.equipment,
    primary_muscle = EXCLUDED.primary_muscle,
    supporting_muscles = EXCLUDED.supporting_muscles,
    muscle_bias = EXCLUDED.muscle_bias,
    joint_count_level = EXCLUDED.joint_count_level,
    dynamic_isometric = EXCLUDED.dynamic_isometric,
    movement_plane = EXCLUDED.movement_plane,
    primary_joints = EXCLUDED.primary_joints,
    is_active = true,
    updated_at = now();

INSERT INTO exercise_library (name, category, movement_patterns, bilateral_unilateral, posterior_anterior, complexity, equipment, primary_muscle, supporting_muscles, muscle_bias, joint_count_level, dynamic_isometric, movement_plane, primary_joints, is_active)
  VALUES ('Box jump over (duplicate)', 'strength', '{"jumps_plyos"}'::text[], 'bilateral', 'posterior', 3, '{"plyo_box"}'::text[], 'Glute max', '{"Quads","calves","hamstrings","trunk stabilizers"}'::text[], 'mid', 'global', NULL, NULL, '{"Ankle","Knee","Hip"}'::text[], true)
  ON CONFLICT (name) DO UPDATE SET
    category = EXCLUDED.category,
    movement_patterns = EXCLUDED.movement_patterns,
    bilateral_unilateral = EXCLUDED.bilateral_unilateral,
    posterior_anterior = EXCLUDED.posterior_anterior,
    complexity = EXCLUDED.complexity,
    equipment = EXCLUDED.equipment,
    primary_muscle = EXCLUDED.primary_muscle,
    supporting_muscles = EXCLUDED.supporting_muscles,
    muscle_bias = EXCLUDED.muscle_bias,
    joint_count_level = EXCLUDED.joint_count_level,
    dynamic_isometric = EXCLUDED.dynamic_isometric,
    movement_plane = EXCLUDED.movement_plane,
    primary_joints = EXCLUDED.primary_joints,
    is_active = true,
    updated_at = now();

INSERT INTO exercise_library (name, category, movement_patterns, bilateral_unilateral, posterior_anterior, complexity, equipment, primary_muscle, supporting_muscles, muscle_bias, joint_count_level, dynamic_isometric, movement_plane, primary_joints, is_active)
  VALUES ('Single-leg box jump to single-leg landing (very high skill/stress)', 'strength', '{"jumps_plyos"}'::text[], 'unilateral', 'posterior', 3, '{"plyo_box"}'::text[], 'Glute max', '{"Quads","calves","hamstrings","glute med/min","trunk stabilizers"}'::text[], 'mid', 'global', NULL, NULL, '{"Ankle","Knee","Hip"}'::text[], true)
  ON CONFLICT (name) DO UPDATE SET
    category = EXCLUDED.category,
    movement_patterns = EXCLUDED.movement_patterns,
    bilateral_unilateral = EXCLUDED.bilateral_unilateral,
    posterior_anterior = EXCLUDED.posterior_anterior,
    complexity = EXCLUDED.complexity,
    equipment = EXCLUDED.equipment,
    primary_muscle = EXCLUDED.primary_muscle,
    supporting_muscles = EXCLUDED.supporting_muscles,
    muscle_bias = EXCLUDED.muscle_bias,
    joint_count_level = EXCLUDED.joint_count_level,
    dynamic_isometric = EXCLUDED.dynamic_isometric,
    movement_plane = EXCLUDED.movement_plane,
    primary_joints = EXCLUDED.primary_joints,
    is_active = true,
    updated_at = now();

INSERT INTO exercise_library (name, category, movement_patterns, bilateral_unilateral, posterior_anterior, complexity, equipment, primary_muscle, supporting_muscles, muscle_bias, joint_count_level, dynamic_isometric, movement_plane, primary_joints, is_active)
  VALUES ('Alternating single-leg box jumps (switch takeoff leg each rep)', 'strength', '{"jumps_plyos"}'::text[], 'unilateral', 'posterior', 3, '{"bodyweight"}'::text[], 'Glute max', '{"Quads","calves","hamstrings","glute med/min","trunk stabilizers"}'::text[], 'mid', 'global', NULL, NULL, '{"Ankle","Knee","Hip"}'::text[], true)
  ON CONFLICT (name) DO UPDATE SET
    category = EXCLUDED.category,
    movement_patterns = EXCLUDED.movement_patterns,
    bilateral_unilateral = EXCLUDED.bilateral_unilateral,
    posterior_anterior = EXCLUDED.posterior_anterior,
    complexity = EXCLUDED.complexity,
    equipment = EXCLUDED.equipment,
    primary_muscle = EXCLUDED.primary_muscle,
    supporting_muscles = EXCLUDED.supporting_muscles,
    muscle_bias = EXCLUDED.muscle_bias,
    joint_count_level = EXCLUDED.joint_count_level,
    dynamic_isometric = EXCLUDED.dynamic_isometric,
    movement_plane = EXCLUDED.movement_plane,
    primary_joints = EXCLUDED.primary_joints,
    is_active = true,
    updated_at = now();

INSERT INTO exercise_library (name, category, movement_patterns, bilateral_unilateral, posterior_anterior, complexity, equipment, primary_muscle, supporting_muscles, muscle_bias, joint_count_level, dynamic_isometric, movement_plane, primary_joints, is_active)
  VALUES ('Pogo hops (in place)', 'strength', '{"jumps_plyos"}'::text[], 'bilateral', 'posterior', 1, '{"bodyweight"}'::text[], 'Calves', '{"Foot intrinsics","tibialis anterior","quads (low)","trunk stabilizers"}'::text[], 'shortened', 'global', NULL, NULL, '{"Ankle"}'::text[], true)
  ON CONFLICT (name) DO UPDATE SET
    category = EXCLUDED.category,
    movement_patterns = EXCLUDED.movement_patterns,
    bilateral_unilateral = EXCLUDED.bilateral_unilateral,
    posterior_anterior = EXCLUDED.posterior_anterior,
    complexity = EXCLUDED.complexity,
    equipment = EXCLUDED.equipment,
    primary_muscle = EXCLUDED.primary_muscle,
    supporting_muscles = EXCLUDED.supporting_muscles,
    muscle_bias = EXCLUDED.muscle_bias,
    joint_count_level = EXCLUDED.joint_count_level,
    dynamic_isometric = EXCLUDED.dynamic_isometric,
    movement_plane = EXCLUDED.movement_plane,
    primary_joints = EXCLUDED.primary_joints,
    is_active = true,
    updated_at = now();

INSERT INTO exercise_library (name, category, movement_patterns, bilateral_unilateral, posterior_anterior, complexity, equipment, primary_muscle, supporting_muscles, muscle_bias, joint_count_level, dynamic_isometric, movement_plane, primary_joints, is_active)
  VALUES ('Pogos forward/backward', 'strength', '{"jumps_plyos"}'::text[], 'bilateral', 'posterior', 2, '{"bodyweight"}'::text[], 'Calves', '{"Foot intrinsics","tibialis anterior","hamstrings (low)","trunk stabilizers"}'::text[], 'shortened', 'global', NULL, NULL, '{"Ankle"}'::text[], true)
  ON CONFLICT (name) DO UPDATE SET
    category = EXCLUDED.category,
    movement_patterns = EXCLUDED.movement_patterns,
    bilateral_unilateral = EXCLUDED.bilateral_unilateral,
    posterior_anterior = EXCLUDED.posterior_anterior,
    complexity = EXCLUDED.complexity,
    equipment = EXCLUDED.equipment,
    primary_muscle = EXCLUDED.primary_muscle,
    supporting_muscles = EXCLUDED.supporting_muscles,
    muscle_bias = EXCLUDED.muscle_bias,
    joint_count_level = EXCLUDED.joint_count_level,
    dynamic_isometric = EXCLUDED.dynamic_isometric,
    movement_plane = EXCLUDED.movement_plane,
    primary_joints = EXCLUDED.primary_joints,
    is_active = true,
    updated_at = now();

INSERT INTO exercise_library (name, category, movement_patterns, bilateral_unilateral, posterior_anterior, complexity, equipment, primary_muscle, supporting_muscles, muscle_bias, joint_count_level, dynamic_isometric, movement_plane, primary_joints, is_active)
  VALUES ('Pogos lateral', 'strength', '{"jumps_plyos"}'::text[], 'bilateral', NULL, 2, '{"bodyweight"}'::text[], 'Calves', '{"Foot intrinsics","tibialis anterior","glute med/min (low)","trunk stabilizers"}'::text[], 'shortened', 'global', NULL, NULL, '{"Ankle"}'::text[], true)
  ON CONFLICT (name) DO UPDATE SET
    category = EXCLUDED.category,
    movement_patterns = EXCLUDED.movement_patterns,
    bilateral_unilateral = EXCLUDED.bilateral_unilateral,
    posterior_anterior = EXCLUDED.posterior_anterior,
    complexity = EXCLUDED.complexity,
    equipment = EXCLUDED.equipment,
    primary_muscle = EXCLUDED.primary_muscle,
    supporting_muscles = EXCLUDED.supporting_muscles,
    muscle_bias = EXCLUDED.muscle_bias,
    joint_count_level = EXCLUDED.joint_count_level,
    dynamic_isometric = EXCLUDED.dynamic_isometric,
    movement_plane = EXCLUDED.movement_plane,
    primary_joints = EXCLUDED.primary_joints,
    is_active = true,
    updated_at = now();

INSERT INTO exercise_library (name, category, movement_patterns, bilateral_unilateral, posterior_anterior, complexity, equipment, primary_muscle, supporting_muscles, muscle_bias, joint_count_level, dynamic_isometric, movement_plane, primary_joints, is_active)
  VALUES ('Single-leg pogos (in place; low amplitude)', 'strength', '{"jumps_plyos"}'::text[], 'unilateral', 'posterior', 2, '{"bodyweight"}'::text[], 'Calves', '{"Foot intrinsics","tibialis anterior","glute med/min","trunk stabilizers"}'::text[], 'shortened', 'global', NULL, NULL, '{"Ankle"}'::text[], true)
  ON CONFLICT (name) DO UPDATE SET
    category = EXCLUDED.category,
    movement_patterns = EXCLUDED.movement_patterns,
    bilateral_unilateral = EXCLUDED.bilateral_unilateral,
    posterior_anterior = EXCLUDED.posterior_anterior,
    complexity = EXCLUDED.complexity,
    equipment = EXCLUDED.equipment,
    primary_muscle = EXCLUDED.primary_muscle,
    supporting_muscles = EXCLUDED.supporting_muscles,
    muscle_bias = EXCLUDED.muscle_bias,
    joint_count_level = EXCLUDED.joint_count_level,
    dynamic_isometric = EXCLUDED.dynamic_isometric,
    movement_plane = EXCLUDED.movement_plane,
    primary_joints = EXCLUDED.primary_joints,
    is_active = true,
    updated_at = now();

INSERT INTO exercise_library (name, category, movement_patterns, bilateral_unilateral, posterior_anterior, complexity, equipment, primary_muscle, supporting_muscles, muscle_bias, joint_count_level, dynamic_isometric, movement_plane, primary_joints, is_active)
  VALUES ('Line hops (front-back over a line)', 'strength', '{"jumps_plyos"}'::text[], 'bilateral', 'posterior', 2, '{"bodyweight"}'::text[], 'Calves', '{"Foot intrinsics","tibialis anterior","trunk stabilizers"}'::text[], 'shortened', 'global', NULL, NULL, '{"Ankle"}'::text[], true)
  ON CONFLICT (name) DO UPDATE SET
    category = EXCLUDED.category,
    movement_patterns = EXCLUDED.movement_patterns,
    bilateral_unilateral = EXCLUDED.bilateral_unilateral,
    posterior_anterior = EXCLUDED.posterior_anterior,
    complexity = EXCLUDED.complexity,
    equipment = EXCLUDED.equipment,
    primary_muscle = EXCLUDED.primary_muscle,
    supporting_muscles = EXCLUDED.supporting_muscles,
    muscle_bias = EXCLUDED.muscle_bias,
    joint_count_level = EXCLUDED.joint_count_level,
    dynamic_isometric = EXCLUDED.dynamic_isometric,
    movement_plane = EXCLUDED.movement_plane,
    primary_joints = EXCLUDED.primary_joints,
    is_active = true,
    updated_at = now();

INSERT INTO exercise_library (name, category, movement_patterns, bilateral_unilateral, posterior_anterior, complexity, equipment, primary_muscle, supporting_muscles, muscle_bias, joint_count_level, dynamic_isometric, movement_plane, primary_joints, is_active)
  VALUES ('Line hops (side-side)', 'strength', '{"jumps_plyos"}'::text[], 'bilateral', NULL, 2, '{"bodyweight"}'::text[], 'Calves', '{"Foot intrinsics","tibialis anterior","glute med/min (low)","trunk stabilizers"}'::text[], 'shortened', 'global', NULL, NULL, '{"Ankle"}'::text[], true)
  ON CONFLICT (name) DO UPDATE SET
    category = EXCLUDED.category,
    movement_patterns = EXCLUDED.movement_patterns,
    bilateral_unilateral = EXCLUDED.bilateral_unilateral,
    posterior_anterior = EXCLUDED.posterior_anterior,
    complexity = EXCLUDED.complexity,
    equipment = EXCLUDED.equipment,
    primary_muscle = EXCLUDED.primary_muscle,
    supporting_muscles = EXCLUDED.supporting_muscles,
    muscle_bias = EXCLUDED.muscle_bias,
    joint_count_level = EXCLUDED.joint_count_level,
    dynamic_isometric = EXCLUDED.dynamic_isometric,
    movement_plane = EXCLUDED.movement_plane,
    primary_joints = EXCLUDED.primary_joints,
    is_active = true,
    updated_at = now();

INSERT INTO exercise_library (name, category, movement_patterns, bilateral_unilateral, posterior_anterior, complexity, equipment, primary_muscle, supporting_muscles, muscle_bias, joint_count_level, dynamic_isometric, movement_plane, primary_joints, is_active)
  VALUES ('Plate hops (alternating legs)', 'strength', '{"jumps_plyos"}'::text[], 'unilateral', 'posterior', 2, '{"bodyweight"}'::text[], 'Calves', '{"Quads","glute max","hamstrings","trunk stabilizers"}'::text[], 'mid', 'global', NULL, NULL, '{"Ankle","Knee","Hip"}'::text[], true)
  ON CONFLICT (name) DO UPDATE SET
    category = EXCLUDED.category,
    movement_patterns = EXCLUDED.movement_patterns,
    bilateral_unilateral = EXCLUDED.bilateral_unilateral,
    posterior_anterior = EXCLUDED.posterior_anterior,
    complexity = EXCLUDED.complexity,
    equipment = EXCLUDED.equipment,
    primary_muscle = EXCLUDED.primary_muscle,
    supporting_muscles = EXCLUDED.supporting_muscles,
    muscle_bias = EXCLUDED.muscle_bias,
    joint_count_level = EXCLUDED.joint_count_level,
    dynamic_isometric = EXCLUDED.dynamic_isometric,
    movement_plane = EXCLUDED.movement_plane,
    primary_joints = EXCLUDED.primary_joints,
    is_active = true,
    updated_at = now();

INSERT INTO exercise_library (name, category, movement_patterns, bilateral_unilateral, posterior_anterior, complexity, equipment, primary_muscle, supporting_muscles, muscle_bias, joint_count_level, dynamic_isometric, movement_plane, primary_joints, is_active)
  VALUES ('Plate jump (lateral)', 'strength', '{"jumps_plyos"}'::text[], 'bilateral', NULL, 2, '{"bodyweight"}'::text[], 'Glute med/min', '{"Glute max","quads","calves","adductors","trunk stabilizers"}'::text[], 'mid', 'global', NULL, NULL, '{"Ankle","Knee","Hip"}'::text[], true)
  ON CONFLICT (name) DO UPDATE SET
    category = EXCLUDED.category,
    movement_patterns = EXCLUDED.movement_patterns,
    bilateral_unilateral = EXCLUDED.bilateral_unilateral,
    posterior_anterior = EXCLUDED.posterior_anterior,
    complexity = EXCLUDED.complexity,
    equipment = EXCLUDED.equipment,
    primary_muscle = EXCLUDED.primary_muscle,
    supporting_muscles = EXCLUDED.supporting_muscles,
    muscle_bias = EXCLUDED.muscle_bias,
    joint_count_level = EXCLUDED.joint_count_level,
    dynamic_isometric = EXCLUDED.dynamic_isometric,
    movement_plane = EXCLUDED.movement_plane,
    primary_joints = EXCLUDED.primary_joints,
    is_active = true,
    updated_at = now();

INSERT INTO exercise_library (name, category, movement_patterns, bilateral_unilateral, posterior_anterior, complexity, equipment, primary_muscle, supporting_muscles, muscle_bias, joint_count_level, dynamic_isometric, movement_plane, primary_joints, is_active)
  VALUES ('Plate jump (forward)', 'strength', '{"jumps_plyos"}'::text[], 'bilateral', 'posterior', 2, '{"bodyweight"}'::text[], 'Glute max', '{"Quads","calves","hamstrings","trunk stabilizers"}'::text[], 'mid', 'global', NULL, NULL, '{"Ankle","Knee","Hip"}'::text[], true)
  ON CONFLICT (name) DO UPDATE SET
    category = EXCLUDED.category,
    movement_patterns = EXCLUDED.movement_patterns,
    bilateral_unilateral = EXCLUDED.bilateral_unilateral,
    posterior_anterior = EXCLUDED.posterior_anterior,
    complexity = EXCLUDED.complexity,
    equipment = EXCLUDED.equipment,
    primary_muscle = EXCLUDED.primary_muscle,
    supporting_muscles = EXCLUDED.supporting_muscles,
    muscle_bias = EXCLUDED.muscle_bias,
    joint_count_level = EXCLUDED.joint_count_level,
    dynamic_isometric = EXCLUDED.dynamic_isometric,
    movement_plane = EXCLUDED.movement_plane,
    primary_joints = EXCLUDED.primary_joints,
    is_active = true,
    updated_at = now();

INSERT INTO exercise_library (name, category, movement_patterns, bilateral_unilateral, posterior_anterior, complexity, equipment, primary_muscle, supporting_muscles, muscle_bias, joint_count_level, dynamic_isometric, movement_plane, primary_joints, is_active)
  VALUES ('Deep tier split squat jump', 'strength', '{"lunge"}'::text[], 'unilateral', 'anterior', 3, '{"bodyweight"}'::text[], 'Quads', '{"Glute max","calves","hamstrings","adductors","trunk stabilizers"}'::text[], 'lengthened', 'global', NULL, NULL, '{"Ankle","Knee","Hip"}'::text[], true)
  ON CONFLICT (name) DO UPDATE SET
    category = EXCLUDED.category,
    movement_patterns = EXCLUDED.movement_patterns,
    bilateral_unilateral = EXCLUDED.bilateral_unilateral,
    posterior_anterior = EXCLUDED.posterior_anterior,
    complexity = EXCLUDED.complexity,
    equipment = EXCLUDED.equipment,
    primary_muscle = EXCLUDED.primary_muscle,
    supporting_muscles = EXCLUDED.supporting_muscles,
    muscle_bias = EXCLUDED.muscle_bias,
    joint_count_level = EXCLUDED.joint_count_level,
    dynamic_isometric = EXCLUDED.dynamic_isometric,
    movement_plane = EXCLUDED.movement_plane,
    primary_joints = EXCLUDED.primary_joints,
    is_active = true,
    updated_at = now();

INSERT INTO exercise_library (name, category, movement_patterns, bilateral_unilateral, posterior_anterior, complexity, equipment, primary_muscle, supporting_muscles, muscle_bias, joint_count_level, dynamic_isometric, movement_plane, primary_joints, is_active)
  VALUES ('Deep tier squat jump', 'strength', '{"squat"}'::text[], 'bilateral', 'anterior', 3, '{"bodyweight"}'::text[], 'Quads', '{"Glute max","calves","adductors","trunk stabilizers"}'::text[], 'lengthened', 'global', NULL, NULL, '{"Ankle","Knee","Hip"}'::text[], true)
  ON CONFLICT (name) DO UPDATE SET
    category = EXCLUDED.category,
    movement_patterns = EXCLUDED.movement_patterns,
    bilateral_unilateral = EXCLUDED.bilateral_unilateral,
    posterior_anterior = EXCLUDED.posterior_anterior,
    complexity = EXCLUDED.complexity,
    equipment = EXCLUDED.equipment,
    primary_muscle = EXCLUDED.primary_muscle,
    supporting_muscles = EXCLUDED.supporting_muscles,
    muscle_bias = EXCLUDED.muscle_bias,
    joint_count_level = EXCLUDED.joint_count_level,
    dynamic_isometric = EXCLUDED.dynamic_isometric,
    movement_plane = EXCLUDED.movement_plane,
    primary_joints = EXCLUDED.primary_joints,
    is_active = true,
    updated_at = now();

INSERT INTO exercise_library (name, category, movement_patterns, bilateral_unilateral, posterior_anterior, complexity, equipment, primary_muscle, supporting_muscles, muscle_bias, joint_count_level, dynamic_isometric, movement_plane, primary_joints, is_active)
  VALUES ('Squat jump (stick landing)', 'strength', '{"squat"}'::text[], 'bilateral', 'posterior', 2, '{"bodyweight"}'::text[], 'Glute max', '{"Quads","calves","hamstrings","trunk stabilizers"}'::text[], 'mid', 'global', NULL, NULL, '{"Ankle","Knee","Hip"}'::text[], true)
  ON CONFLICT (name) DO UPDATE SET
    category = EXCLUDED.category,
    movement_patterns = EXCLUDED.movement_patterns,
    bilateral_unilateral = EXCLUDED.bilateral_unilateral,
    posterior_anterior = EXCLUDED.posterior_anterior,
    complexity = EXCLUDED.complexity,
    equipment = EXCLUDED.equipment,
    primary_muscle = EXCLUDED.primary_muscle,
    supporting_muscles = EXCLUDED.supporting_muscles,
    muscle_bias = EXCLUDED.muscle_bias,
    joint_count_level = EXCLUDED.joint_count_level,
    dynamic_isometric = EXCLUDED.dynamic_isometric,
    movement_plane = EXCLUDED.movement_plane,
    primary_joints = EXCLUDED.primary_joints,
    is_active = true,
    updated_at = now();

INSERT INTO exercise_library (name, category, movement_patterns, bilateral_unilateral, posterior_anterior, complexity, equipment, primary_muscle, supporting_muscles, muscle_bias, joint_count_level, dynamic_isometric, movement_plane, primary_joints, is_active)
  VALUES ('Countermovement jump (CMJ)', 'strength', '{"jumps_plyos"}'::text[], 'bilateral', 'posterior', 2, '{"bodyweight"}'::text[], 'Glute max', '{"Quads","calves","hamstrings","trunk stabilizers"}'::text[], 'mid', 'global', NULL, NULL, '{"Ankle","Knee","Hip"}'::text[], true)
  ON CONFLICT (name) DO UPDATE SET
    category = EXCLUDED.category,
    movement_patterns = EXCLUDED.movement_patterns,
    bilateral_unilateral = EXCLUDED.bilateral_unilateral,
    posterior_anterior = EXCLUDED.posterior_anterior,
    complexity = EXCLUDED.complexity,
    equipment = EXCLUDED.equipment,
    primary_muscle = EXCLUDED.primary_muscle,
    supporting_muscles = EXCLUDED.supporting_muscles,
    muscle_bias = EXCLUDED.muscle_bias,
    joint_count_level = EXCLUDED.joint_count_level,
    dynamic_isometric = EXCLUDED.dynamic_isometric,
    movement_plane = EXCLUDED.movement_plane,
    primary_joints = EXCLUDED.primary_joints,
    is_active = true,
    updated_at = now();

INSERT INTO exercise_library (name, category, movement_patterns, bilateral_unilateral, posterior_anterior, complexity, equipment, primary_muscle, supporting_muscles, muscle_bias, joint_count_level, dynamic_isometric, movement_plane, primary_joints, is_active)
  VALUES ('Pause squat jump (from 2–3 sec pause)', 'strength', '{"squat"}'::text[], 'bilateral', 'posterior', 2, '{"bodyweight"}'::text[], 'Glute max', '{"Quads","calves","hamstrings","trunk stabilizers"}'::text[], 'mid', 'global', NULL, NULL, '{"Ankle","Knee","Hip"}'::text[], true)
  ON CONFLICT (name) DO UPDATE SET
    category = EXCLUDED.category,
    movement_patterns = EXCLUDED.movement_patterns,
    bilateral_unilateral = EXCLUDED.bilateral_unilateral,
    posterior_anterior = EXCLUDED.posterior_anterior,
    complexity = EXCLUDED.complexity,
    equipment = EXCLUDED.equipment,
    primary_muscle = EXCLUDED.primary_muscle,
    supporting_muscles = EXCLUDED.supporting_muscles,
    muscle_bias = EXCLUDED.muscle_bias,
    joint_count_level = EXCLUDED.joint_count_level,
    dynamic_isometric = EXCLUDED.dynamic_isometric,
    movement_plane = EXCLUDED.movement_plane,
    primary_joints = EXCLUDED.primary_joints,
    is_active = true,
    updated_at = now();

INSERT INTO exercise_library (name, category, movement_patterns, bilateral_unilateral, posterior_anterior, complexity, equipment, primary_muscle, supporting_muscles, muscle_bias, joint_count_level, dynamic_isometric, movement_plane, primary_joints, is_active)
  VALUES ('Tuck jump (higher intensity)', 'strength', '{"core_flexion"}'::text[], 'bilateral', 'posterior', 3, '{"bodyweight"}'::text[], 'Glute max', '{"Quads","calves","hamstrings","hip flexors","trunk stabilizers"}'::text[], 'mid', 'global', NULL, NULL, '{"Ankle","Knee","Hip"}'::text[], true)
  ON CONFLICT (name) DO UPDATE SET
    category = EXCLUDED.category,
    movement_patterns = EXCLUDED.movement_patterns,
    bilateral_unilateral = EXCLUDED.bilateral_unilateral,
    posterior_anterior = EXCLUDED.posterior_anterior,
    complexity = EXCLUDED.complexity,
    equipment = EXCLUDED.equipment,
    primary_muscle = EXCLUDED.primary_muscle,
    supporting_muscles = EXCLUDED.supporting_muscles,
    muscle_bias = EXCLUDED.muscle_bias,
    joint_count_level = EXCLUDED.joint_count_level,
    dynamic_isometric = EXCLUDED.dynamic_isometric,
    movement_plane = EXCLUDED.movement_plane,
    primary_joints = EXCLUDED.primary_joints,
    is_active = true,
    updated_at = now();

INSERT INTO exercise_library (name, category, movement_patterns, bilateral_unilateral, posterior_anterior, complexity, equipment, primary_muscle, supporting_muscles, muscle_bias, joint_count_level, dynamic_isometric, movement_plane, primary_joints, is_active)
  VALUES ('Alternating jump lunge', 'strength', '{"lunge"}'::text[], 'unilateral', 'anterior', 3, '{"bodyweight"}'::text[], 'Quads', '{"Glute max","calves","hamstrings","adductors","trunk stabilizers"}'::text[], 'lengthened', 'global', NULL, NULL, '{"Ankle","Knee","Hip"}'::text[], true)
  ON CONFLICT (name) DO UPDATE SET
    category = EXCLUDED.category,
    movement_patterns = EXCLUDED.movement_patterns,
    bilateral_unilateral = EXCLUDED.bilateral_unilateral,
    posterior_anterior = EXCLUDED.posterior_anterior,
    complexity = EXCLUDED.complexity,
    equipment = EXCLUDED.equipment,
    primary_muscle = EXCLUDED.primary_muscle,
    supporting_muscles = EXCLUDED.supporting_muscles,
    muscle_bias = EXCLUDED.muscle_bias,
    joint_count_level = EXCLUDED.joint_count_level,
    dynamic_isometric = EXCLUDED.dynamic_isometric,
    movement_plane = EXCLUDED.movement_plane,
    primary_joints = EXCLUDED.primary_joints,
    is_active = true,
    updated_at = now();

INSERT INTO exercise_library (name, category, movement_patterns, bilateral_unilateral, posterior_anterior, complexity, equipment, primary_muscle, supporting_muscles, muscle_bias, joint_count_level, dynamic_isometric, movement_plane, primary_joints, is_active)
  VALUES ('Jump lunge', 'strength', '{"lunge"}'::text[], 'unilateral', 'anterior', 3, '{"bodyweight"}'::text[], 'Quads', '{"Glute max","calves","hamstrings","adductors","trunk stabilizers"}'::text[], 'lengthened', 'global', NULL, NULL, '{"Ankle","Knee","Hip"}'::text[], true)
  ON CONFLICT (name) DO UPDATE SET
    category = EXCLUDED.category,
    movement_patterns = EXCLUDED.movement_patterns,
    bilateral_unilateral = EXCLUDED.bilateral_unilateral,
    posterior_anterior = EXCLUDED.posterior_anterior,
    complexity = EXCLUDED.complexity,
    equipment = EXCLUDED.equipment,
    primary_muscle = EXCLUDED.primary_muscle,
    supporting_muscles = EXCLUDED.supporting_muscles,
    muscle_bias = EXCLUDED.muscle_bias,
    joint_count_level = EXCLUDED.joint_count_level,
    dynamic_isometric = EXCLUDED.dynamic_isometric,
    movement_plane = EXCLUDED.movement_plane,
    primary_joints = EXCLUDED.primary_joints,
    is_active = true,
    updated_at = now();

INSERT INTO exercise_library (name, category, movement_patterns, bilateral_unilateral, posterior_anterior, complexity, equipment, primary_muscle, supporting_muscles, muscle_bias, joint_count_level, dynamic_isometric, movement_plane, primary_joints, is_active)
  VALUES ('Star jump', 'strength', '{"jumps_plyos"}'::text[], 'bilateral', 'posterior', 2, '{"bodyweight"}'::text[], 'Glute max', '{"Quads","calves","glute med/min","trunk stabilizers"}'::text[], 'mid', 'global', NULL, NULL, '{"Ankle","Knee","Hip"}'::text[], true)
  ON CONFLICT (name) DO UPDATE SET
    category = EXCLUDED.category,
    movement_patterns = EXCLUDED.movement_patterns,
    bilateral_unilateral = EXCLUDED.bilateral_unilateral,
    posterior_anterior = EXCLUDED.posterior_anterior,
    complexity = EXCLUDED.complexity,
    equipment = EXCLUDED.equipment,
    primary_muscle = EXCLUDED.primary_muscle,
    supporting_muscles = EXCLUDED.supporting_muscles,
    muscle_bias = EXCLUDED.muscle_bias,
    joint_count_level = EXCLUDED.joint_count_level,
    dynamic_isometric = EXCLUDED.dynamic_isometric,
    movement_plane = EXCLUDED.movement_plane,
    primary_joints = EXCLUDED.primary_joints,
    is_active = true,
    updated_at = now();

INSERT INTO exercise_library (name, category, movement_patterns, bilateral_unilateral, posterior_anterior, complexity, equipment, primary_muscle, supporting_muscles, muscle_bias, joint_count_level, dynamic_isometric, movement_plane, primary_joints, is_active)
  VALUES ('Jumping jacks', 'strength', '{"jumps_plyos"}'::text[], 'bilateral', 'posterior', 1, '{"bodyweight"}'::text[], 'Calves', '{"Glute med/min","quads (low)","trunk stabilizers"}'::text[], 'shortened', 'global', NULL, NULL, '{"Ankle","Knee","Hip"}'::text[], true)
  ON CONFLICT (name) DO UPDATE SET
    category = EXCLUDED.category,
    movement_patterns = EXCLUDED.movement_patterns,
    bilateral_unilateral = EXCLUDED.bilateral_unilateral,
    posterior_anterior = EXCLUDED.posterior_anterior,
    complexity = EXCLUDED.complexity,
    equipment = EXCLUDED.equipment,
    primary_muscle = EXCLUDED.primary_muscle,
    supporting_muscles = EXCLUDED.supporting_muscles,
    muscle_bias = EXCLUDED.muscle_bias,
    joint_count_level = EXCLUDED.joint_count_level,
    dynamic_isometric = EXCLUDED.dynamic_isometric,
    movement_plane = EXCLUDED.movement_plane,
    primary_joints = EXCLUDED.primary_joints,
    is_active = true,
    updated_at = now();

INSERT INTO exercise_library (name, category, movement_patterns, bilateral_unilateral, posterior_anterior, complexity, equipment, primary_muscle, supporting_muscles, muscle_bias, joint_count_level, dynamic_isometric, movement_plane, primary_joints, is_active)
  VALUES ('Skater bounds (side-to-side)', 'strength', '{"jumps_plyos"}'::text[], 'unilateral', NULL, 3, '{"bodyweight"}'::text[], 'Glute med/min', '{"Glute max","quads","calves","adductors","trunk stabilizers"}'::text[], 'mid', 'global', NULL, NULL, '{"Ankle","Knee","Hip"}'::text[], true)
  ON CONFLICT (name) DO UPDATE SET
    category = EXCLUDED.category,
    movement_patterns = EXCLUDED.movement_patterns,
    bilateral_unilateral = EXCLUDED.bilateral_unilateral,
    posterior_anterior = EXCLUDED.posterior_anterior,
    complexity = EXCLUDED.complexity,
    equipment = EXCLUDED.equipment,
    primary_muscle = EXCLUDED.primary_muscle,
    supporting_muscles = EXCLUDED.supporting_muscles,
    muscle_bias = EXCLUDED.muscle_bias,
    joint_count_level = EXCLUDED.joint_count_level,
    dynamic_isometric = EXCLUDED.dynamic_isometric,
    movement_plane = EXCLUDED.movement_plane,
    primary_joints = EXCLUDED.primary_joints,
    is_active = true,
    updated_at = now();

INSERT INTO exercise_library (name, category, movement_patterns, bilateral_unilateral, posterior_anterior, complexity, equipment, primary_muscle, supporting_muscles, muscle_bias, joint_count_level, dynamic_isometric, movement_plane, primary_joints, is_active)
  VALUES ('Skater bound to stick (deceleration focus)', 'strength', '{"jumps_plyos"}'::text[], 'unilateral', NULL, 3, '{"bodyweight"}'::text[], 'Glute med/min', '{"Glute max","quads","calves","adductors","trunk stabilizers"}'::text[], 'lengthened', 'global', NULL, NULL, '{"Ankle","Knee","Hip"}'::text[], true)
  ON CONFLICT (name) DO UPDATE SET
    category = EXCLUDED.category,
    movement_patterns = EXCLUDED.movement_patterns,
    bilateral_unilateral = EXCLUDED.bilateral_unilateral,
    posterior_anterior = EXCLUDED.posterior_anterior,
    complexity = EXCLUDED.complexity,
    equipment = EXCLUDED.equipment,
    primary_muscle = EXCLUDED.primary_muscle,
    supporting_muscles = EXCLUDED.supporting_muscles,
    muscle_bias = EXCLUDED.muscle_bias,
    joint_count_level = EXCLUDED.joint_count_level,
    dynamic_isometric = EXCLUDED.dynamic_isometric,
    movement_plane = EXCLUDED.movement_plane,
    primary_joints = EXCLUDED.primary_joints,
    is_active = true,
    updated_at = now();

INSERT INTO exercise_library (name, category, movement_patterns, bilateral_unilateral, posterior_anterior, complexity, equipment, primary_muscle, supporting_muscles, muscle_bias, joint_count_level, dynamic_isometric, movement_plane, primary_joints, is_active)
  VALUES ('Single-leg hop in place (stick)', 'strength', '{"jumps_plyos"}'::text[], 'unilateral', 'posterior', 2, '{"bodyweight"}'::text[], 'Calves', '{"Glute max","quads","hamstrings","glute med/min","trunk stabilizers"}'::text[], 'lengthened', 'global', NULL, NULL, '{"Ankle","Knee","Hip"}'::text[], true)
  ON CONFLICT (name) DO UPDATE SET
    category = EXCLUDED.category,
    movement_patterns = EXCLUDED.movement_patterns,
    bilateral_unilateral = EXCLUDED.bilateral_unilateral,
    posterior_anterior = EXCLUDED.posterior_anterior,
    complexity = EXCLUDED.complexity,
    equipment = EXCLUDED.equipment,
    primary_muscle = EXCLUDED.primary_muscle,
    supporting_muscles = EXCLUDED.supporting_muscles,
    muscle_bias = EXCLUDED.muscle_bias,
    joint_count_level = EXCLUDED.joint_count_level,
    dynamic_isometric = EXCLUDED.dynamic_isometric,
    movement_plane = EXCLUDED.movement_plane,
    primary_joints = EXCLUDED.primary_joints,
    is_active = true,
    updated_at = now();

INSERT INTO exercise_library (name, category, movement_patterns, bilateral_unilateral, posterior_anterior, complexity, equipment, primary_muscle, supporting_muscles, muscle_bias, joint_count_level, dynamic_isometric, movement_plane, primary_joints, is_active)
  VALUES ('Single-leg hop forward (stick)', 'strength', '{"jumps_plyos"}'::text[], 'unilateral', 'posterior', 3, '{"bodyweight"}'::text[], 'Glute max', '{"Quads","calves","hamstrings","glute med/min","trunk stabilizers"}'::text[], 'lengthened', 'global', NULL, NULL, '{"Ankle","Knee","Hip"}'::text[], true)
  ON CONFLICT (name) DO UPDATE SET
    category = EXCLUDED.category,
    movement_patterns = EXCLUDED.movement_patterns,
    bilateral_unilateral = EXCLUDED.bilateral_unilateral,
    posterior_anterior = EXCLUDED.posterior_anterior,
    complexity = EXCLUDED.complexity,
    equipment = EXCLUDED.equipment,
    primary_muscle = EXCLUDED.primary_muscle,
    supporting_muscles = EXCLUDED.supporting_muscles,
    muscle_bias = EXCLUDED.muscle_bias,
    joint_count_level = EXCLUDED.joint_count_level,
    dynamic_isometric = EXCLUDED.dynamic_isometric,
    movement_plane = EXCLUDED.movement_plane,
    primary_joints = EXCLUDED.primary_joints,
    is_active = true,
    updated_at = now();

INSERT INTO exercise_library (name, category, movement_patterns, bilateral_unilateral, posterior_anterior, complexity, equipment, primary_muscle, supporting_muscles, muscle_bias, joint_count_level, dynamic_isometric, movement_plane, primary_joints, is_active)
  VALUES ('Single-leg hop lateral (stick)', 'strength', '{"jumps_plyos"}'::text[], 'unilateral', NULL, 3, '{"bodyweight"}'::text[], 'Glute med/min', '{"Glute max","quads","calves","adductors","trunk stabilizers"}'::text[], 'lengthened', 'global', NULL, NULL, '{"Ankle","Knee","Hip"}'::text[], true)
  ON CONFLICT (name) DO UPDATE SET
    category = EXCLUDED.category,
    movement_patterns = EXCLUDED.movement_patterns,
    bilateral_unilateral = EXCLUDED.bilateral_unilateral,
    posterior_anterior = EXCLUDED.posterior_anterior,
    complexity = EXCLUDED.complexity,
    equipment = EXCLUDED.equipment,
    primary_muscle = EXCLUDED.primary_muscle,
    supporting_muscles = EXCLUDED.supporting_muscles,
    muscle_bias = EXCLUDED.muscle_bias,
    joint_count_level = EXCLUDED.joint_count_level,
    dynamic_isometric = EXCLUDED.dynamic_isometric,
    movement_plane = EXCLUDED.movement_plane,
    primary_joints = EXCLUDED.primary_joints,
    is_active = true,
    updated_at = now();

INSERT INTO exercise_library (name, category, movement_patterns, bilateral_unilateral, posterior_anterior, complexity, equipment, primary_muscle, supporting_muscles, muscle_bias, joint_count_level, dynamic_isometric, movement_plane, primary_joints, is_active)
  VALUES ('Alternating bounds (running bounds; usually higher intensity)', 'strength', '{"jumps_plyos"}'::text[], 'unilateral', 'posterior', 3, '{"bodyweight"}'::text[], 'Glute max', '{"Calves","hamstrings","quads","glute med/min","trunk stabilizers"}'::text[], 'mid', 'global', NULL, NULL, '{"Ankle","Knee","Hip"}'::text[], true)
  ON CONFLICT (name) DO UPDATE SET
    category = EXCLUDED.category,
    movement_patterns = EXCLUDED.movement_patterns,
    bilateral_unilateral = EXCLUDED.bilateral_unilateral,
    posterior_anterior = EXCLUDED.posterior_anterior,
    complexity = EXCLUDED.complexity,
    equipment = EXCLUDED.equipment,
    primary_muscle = EXCLUDED.primary_muscle,
    supporting_muscles = EXCLUDED.supporting_muscles,
    muscle_bias = EXCLUDED.muscle_bias,
    joint_count_level = EXCLUDED.joint_count_level,
    dynamic_isometric = EXCLUDED.dynamic_isometric,
    movement_plane = EXCLUDED.movement_plane,
    primary_joints = EXCLUDED.primary_joints,
    is_active = true,
    updated_at = now();

INSERT INTO exercise_library (name, category, movement_patterns, bilateral_unilateral, posterior_anterior, complexity, equipment, primary_muscle, supporting_muscles, muscle_bias, joint_count_level, dynamic_isometric, movement_plane, primary_joints, is_active)
  VALUES ('Speed skaters (quick lateral steps with small hop)', 'strength', '{"jumps_plyos"}'::text[], 'unilateral', NULL, 2, '{"bodyweight"}'::text[], 'Glute med/min', '{"Calves","quads","glute max","trunk stabilizers"}'::text[], 'mid', 'global', NULL, NULL, '{"Ankle","Knee","Hip"}'::text[], true)
  ON CONFLICT (name) DO UPDATE SET
    category = EXCLUDED.category,
    movement_patterns = EXCLUDED.movement_patterns,
    bilateral_unilateral = EXCLUDED.bilateral_unilateral,
    posterior_anterior = EXCLUDED.posterior_anterior,
    complexity = EXCLUDED.complexity,
    equipment = EXCLUDED.equipment,
    primary_muscle = EXCLUDED.primary_muscle,
    supporting_muscles = EXCLUDED.supporting_muscles,
    muscle_bias = EXCLUDED.muscle_bias,
    joint_count_level = EXCLUDED.joint_count_level,
    dynamic_isometric = EXCLUDED.dynamic_isometric,
    movement_plane = EXCLUDED.movement_plane,
    primary_joints = EXCLUDED.primary_joints,
    is_active = true,
    updated_at = now();

INSERT INTO exercise_library (name, category, movement_patterns, bilateral_unilateral, posterior_anterior, complexity, equipment, primary_muscle, supporting_muscles, muscle_bias, joint_count_level, dynamic_isometric, movement_plane, primary_joints, is_active)
  VALUES ('Standing broad jump (can be moderate/high)', 'strength', '{"jumps_plyos"}'::text[], 'bilateral', 'posterior', 2, '{"bodyweight"}'::text[], 'Glute max', '{"Hamstrings","quads","calves","trunk stabilizers"}'::text[], 'mid', 'global', NULL, NULL, '{"Ankle","Knee","Hip"}'::text[], true)
  ON CONFLICT (name) DO UPDATE SET
    category = EXCLUDED.category,
    movement_patterns = EXCLUDED.movement_patterns,
    bilateral_unilateral = EXCLUDED.bilateral_unilateral,
    posterior_anterior = EXCLUDED.posterior_anterior,
    complexity = EXCLUDED.complexity,
    equipment = EXCLUDED.equipment,
    primary_muscle = EXCLUDED.primary_muscle,
    supporting_muscles = EXCLUDED.supporting_muscles,
    muscle_bias = EXCLUDED.muscle_bias,
    joint_count_level = EXCLUDED.joint_count_level,
    dynamic_isometric = EXCLUDED.dynamic_isometric,
    movement_plane = EXCLUDED.movement_plane,
    primary_joints = EXCLUDED.primary_joints,
    is_active = true,
    updated_at = now();

INSERT INTO exercise_library (name, category, movement_patterns, bilateral_unilateral, posterior_anterior, complexity, equipment, primary_muscle, supporting_muscles, muscle_bias, joint_count_level, dynamic_isometric, movement_plane, primary_joints, is_active)
  VALUES ('Broad jump to stick (safer)', 'strength', '{"jumps_plyos"}'::text[], 'bilateral', 'posterior', 2, '{"bodyweight"}'::text[], 'Glute max', '{"Hamstrings","quads","calves","trunk stabilizers"}'::text[], 'lengthened', 'global', NULL, NULL, '{"Ankle","Knee","Hip"}'::text[], true)
  ON CONFLICT (name) DO UPDATE SET
    category = EXCLUDED.category,
    movement_patterns = EXCLUDED.movement_patterns,
    bilateral_unilateral = EXCLUDED.bilateral_unilateral,
    posterior_anterior = EXCLUDED.posterior_anterior,
    complexity = EXCLUDED.complexity,
    equipment = EXCLUDED.equipment,
    primary_muscle = EXCLUDED.primary_muscle,
    supporting_muscles = EXCLUDED.supporting_muscles,
    muscle_bias = EXCLUDED.muscle_bias,
    joint_count_level = EXCLUDED.joint_count_level,
    dynamic_isometric = EXCLUDED.dynamic_isometric,
    movement_plane = EXCLUDED.movement_plane,
    primary_joints = EXCLUDED.primary_joints,
    is_active = true,
    updated_at = now();

INSERT INTO exercise_library (name, category, movement_patterns, bilateral_unilateral, posterior_anterior, complexity, equipment, primary_muscle, supporting_muscles, muscle_bias, joint_count_level, dynamic_isometric, movement_plane, primary_joints, is_active)
  VALUES ('Multiple broad jumps (higher intensity)', 'strength', '{"jumps_plyos"}'::text[], 'bilateral', 'posterior', 3, '{"bodyweight"}'::text[], 'Glute max', '{"Hamstrings","quads","calves","trunk stabilizers"}'::text[], 'mid', 'global', NULL, NULL, '{"Ankle","Knee","Hip"}'::text[], true)
  ON CONFLICT (name) DO UPDATE SET
    category = EXCLUDED.category,
    movement_patterns = EXCLUDED.movement_patterns,
    bilateral_unilateral = EXCLUDED.bilateral_unilateral,
    posterior_anterior = EXCLUDED.posterior_anterior,
    complexity = EXCLUDED.complexity,
    equipment = EXCLUDED.equipment,
    primary_muscle = EXCLUDED.primary_muscle,
    supporting_muscles = EXCLUDED.supporting_muscles,
    muscle_bias = EXCLUDED.muscle_bias,
    joint_count_level = EXCLUDED.joint_count_level,
    dynamic_isometric = EXCLUDED.dynamic_isometric,
    movement_plane = EXCLUDED.movement_plane,
    primary_joints = EXCLUDED.primary_joints,
    is_active = true,
    updated_at = now();

INSERT INTO exercise_library (name, category, movement_patterns, bilateral_unilateral, posterior_anterior, complexity, equipment, primary_muscle, supporting_muscles, muscle_bias, joint_count_level, dynamic_isometric, movement_plane, primary_joints, is_active)
  VALUES ('Snap-down to stick (teach landing)', 'strength', '{"jumps_plyos"}'::text[], 'bilateral', 'posterior', 2, '{"bodyweight"}'::text[], 'Quads', '{"Glute max","calves","hamstrings","trunk stabilizers"}'::text[], 'lengthened', 'global', NULL, NULL, '{"Ankle","Knee","Hip"}'::text[], true)
  ON CONFLICT (name) DO UPDATE SET
    category = EXCLUDED.category,
    movement_patterns = EXCLUDED.movement_patterns,
    bilateral_unilateral = EXCLUDED.bilateral_unilateral,
    posterior_anterior = EXCLUDED.posterior_anterior,
    complexity = EXCLUDED.complexity,
    equipment = EXCLUDED.equipment,
    primary_muscle = EXCLUDED.primary_muscle,
    supporting_muscles = EXCLUDED.supporting_muscles,
    muscle_bias = EXCLUDED.muscle_bias,
    joint_count_level = EXCLUDED.joint_count_level,
    dynamic_isometric = EXCLUDED.dynamic_isometric,
    movement_plane = EXCLUDED.movement_plane,
    primary_joints = EXCLUDED.primary_joints,
    is_active = true,
    updated_at = now();

INSERT INTO exercise_library (name, category, movement_patterns, bilateral_unilateral, posterior_anterior, complexity, equipment, primary_muscle, supporting_muscles, muscle_bias, joint_count_level, dynamic_isometric, movement_plane, primary_joints, is_active)
  VALUES ('Snap-down → vertical jump (higher)', 'strength', '{"jumps_plyos"}'::text[], 'bilateral', 'posterior', 3, '{"plyo_box"}'::text[], 'Glute max', '{"Quads","calves","hamstrings","trunk stabilizers"}'::text[], 'mid', 'global', NULL, NULL, '{"Ankle","Knee","Hip"}'::text[], true)
  ON CONFLICT (name) DO UPDATE SET
    category = EXCLUDED.category,
    movement_patterns = EXCLUDED.movement_patterns,
    bilateral_unilateral = EXCLUDED.bilateral_unilateral,
    posterior_anterior = EXCLUDED.posterior_anterior,
    complexity = EXCLUDED.complexity,
    equipment = EXCLUDED.equipment,
    primary_muscle = EXCLUDED.primary_muscle,
    supporting_muscles = EXCLUDED.supporting_muscles,
    muscle_bias = EXCLUDED.muscle_bias,
    joint_count_level = EXCLUDED.joint_count_level,
    dynamic_isometric = EXCLUDED.dynamic_isometric,
    movement_plane = EXCLUDED.movement_plane,
    primary_joints = EXCLUDED.primary_joints,
    is_active = true,
    updated_at = now();

INSERT INTO exercise_library (name, category, movement_patterns, bilateral_unilateral, posterior_anterior, complexity, equipment, primary_muscle, supporting_muscles, muscle_bias, joint_count_level, dynamic_isometric, movement_plane, primary_joints, is_active)
  VALUES ('Depth jump (high intensity; usually not “low intensity”)', 'strength', '{"jumps_plyos"}'::text[], 'bilateral', 'posterior', 3, '{"bodyweight"}'::text[], 'Calves', '{"Glute max","quads","hamstrings","trunk stabilizers"}'::text[], 'mid', 'global', NULL, NULL, '{"Ankle","Knee","Hip"}'::text[], true)
  ON CONFLICT (name) DO UPDATE SET
    category = EXCLUDED.category,
    movement_patterns = EXCLUDED.movement_patterns,
    bilateral_unilateral = EXCLUDED.bilateral_unilateral,
    posterior_anterior = EXCLUDED.posterior_anterior,
    complexity = EXCLUDED.complexity,
    equipment = EXCLUDED.equipment,
    primary_muscle = EXCLUDED.primary_muscle,
    supporting_muscles = EXCLUDED.supporting_muscles,
    muscle_bias = EXCLUDED.muscle_bias,
    joint_count_level = EXCLUDED.joint_count_level,
    dynamic_isometric = EXCLUDED.dynamic_isometric,
    movement_plane = EXCLUDED.movement_plane,
    primary_joints = EXCLUDED.primary_joints,
    is_active = true,
    updated_at = now();

INSERT INTO exercise_library (name, category, movement_patterns, bilateral_unilateral, posterior_anterior, complexity, equipment, primary_muscle, supporting_muscles, muscle_bias, joint_count_level, dynamic_isometric, movement_plane, primary_joints, is_active)
  VALUES ('Rebound jumps (continuous; scale height to keep low)', 'strength', '{"jumps_plyos"}'::text[], 'bilateral', 'posterior', 3, '{"bodyweight"}'::text[], 'Calves', '{"Glute max","quads","hamstrings","trunk stabilizers"}'::text[], 'mid', 'global', NULL, NULL, '{"Ankle","Knee","Hip"}'::text[], true)
  ON CONFLICT (name) DO UPDATE SET
    category = EXCLUDED.category,
    movement_patterns = EXCLUDED.movement_patterns,
    bilateral_unilateral = EXCLUDED.bilateral_unilateral,
    posterior_anterior = EXCLUDED.posterior_anterior,
    complexity = EXCLUDED.complexity,
    equipment = EXCLUDED.equipment,
    primary_muscle = EXCLUDED.primary_muscle,
    supporting_muscles = EXCLUDED.supporting_muscles,
    muscle_bias = EXCLUDED.muscle_bias,
    joint_count_level = EXCLUDED.joint_count_level,
    dynamic_isometric = EXCLUDED.dynamic_isometric,
    movement_plane = EXCLUDED.movement_plane,
    primary_joints = EXCLUDED.primary_joints,
    is_active = true,
    updated_at = now();

INSERT INTO exercise_library (name, category, movement_patterns, bilateral_unilateral, posterior_anterior, complexity, equipment, primary_muscle, supporting_muscles, muscle_bias, joint_count_level, dynamic_isometric, movement_plane, primary_joints, is_active)
  VALUES ('Mini-hurdle hops (low height)', 'strength', '{"hinge"}'::text[], 'bilateral', 'posterior', 2, '{"bodyweight"}'::text[], 'Calves', '{"Quads","glute max","hamstrings","trunk stabilizers"}'::text[], 'mid', 'global', NULL, NULL, '{"Ankle","Knee","Hip"}'::text[], true)
  ON CONFLICT (name) DO UPDATE SET
    category = EXCLUDED.category,
    movement_patterns = EXCLUDED.movement_patterns,
    bilateral_unilateral = EXCLUDED.bilateral_unilateral,
    posterior_anterior = EXCLUDED.posterior_anterior,
    complexity = EXCLUDED.complexity,
    equipment = EXCLUDED.equipment,
    primary_muscle = EXCLUDED.primary_muscle,
    supporting_muscles = EXCLUDED.supporting_muscles,
    muscle_bias = EXCLUDED.muscle_bias,
    joint_count_level = EXCLUDED.joint_count_level,
    dynamic_isometric = EXCLUDED.dynamic_isometric,
    movement_plane = EXCLUDED.movement_plane,
    primary_joints = EXCLUDED.primary_joints,
    is_active = true,
    updated_at = now();

INSERT INTO exercise_library (name, category, movement_patterns, bilateral_unilateral, posterior_anterior, complexity, equipment, primary_muscle, supporting_muscles, muscle_bias, joint_count_level, dynamic_isometric, movement_plane, primary_joints, is_active)
  VALUES ('Lateral mini-hurdle hops', 'strength', '{"hinge"}'::text[], 'bilateral', NULL, 2, '{}'::text[], 'Glute med/min', '{"Calves","quads","glute max","adductors","trunk stabilizers"}'::text[], 'mid', 'global', NULL, NULL, '{"Ankle","Knee","Hip"}'::text[], true)
  ON CONFLICT (name) DO UPDATE SET
    category = EXCLUDED.category,
    movement_patterns = EXCLUDED.movement_patterns,
    bilateral_unilateral = EXCLUDED.bilateral_unilateral,
    posterior_anterior = EXCLUDED.posterior_anterior,
    complexity = EXCLUDED.complexity,
    equipment = EXCLUDED.equipment,
    primary_muscle = EXCLUDED.primary_muscle,
    supporting_muscles = EXCLUDED.supporting_muscles,
    muscle_bias = EXCLUDED.muscle_bias,
    joint_count_level = EXCLUDED.joint_count_level,
    dynamic_isometric = EXCLUDED.dynamic_isometric,
    movement_plane = EXCLUDED.movement_plane,
    primary_joints = EXCLUDED.primary_joints,
    is_active = true,
    updated_at = now();

INSERT INTO exercise_library (name, category, movement_patterns, bilateral_unilateral, posterior_anterior, complexity, equipment, primary_muscle, supporting_muscles, muscle_bias, joint_count_level, dynamic_isometric, movement_plane, primary_joints, is_active)
  VALUES ('Cable Chest Fly (High-to-Low; costal fibers)', 'strength', '{"horizontal_push"}'::text[], 'bilateral', 'anterior', 1, '{"cable"}'::text[], 'Pectoralis major (sternal/costal)', '{"Anterior deltoid","Serratus anterior"}'::text[], 'lengthened', 'local', NULL, 'horizontal', '{"Shoulder"}'::text[], true)
  ON CONFLICT (name) DO UPDATE SET
    category = EXCLUDED.category,
    movement_patterns = EXCLUDED.movement_patterns,
    bilateral_unilateral = EXCLUDED.bilateral_unilateral,
    posterior_anterior = EXCLUDED.posterior_anterior,
    complexity = EXCLUDED.complexity,
    equipment = EXCLUDED.equipment,
    primary_muscle = EXCLUDED.primary_muscle,
    supporting_muscles = EXCLUDED.supporting_muscles,
    muscle_bias = EXCLUDED.muscle_bias,
    joint_count_level = EXCLUDED.joint_count_level,
    dynamic_isometric = EXCLUDED.dynamic_isometric,
    movement_plane = EXCLUDED.movement_plane,
    primary_joints = EXCLUDED.primary_joints,
    is_active = true,
    updated_at = now();

INSERT INTO exercise_library (name, category, movement_patterns, bilateral_unilateral, posterior_anterior, complexity, equipment, primary_muscle, supporting_muscles, muscle_bias, joint_count_level, dynamic_isometric, movement_plane, primary_joints, is_active)
  VALUES ('Cable Chest Fly (Across-Body; sternal fibers)', 'strength', '{"horizontal_push"}'::text[], 'unilateral', 'anterior', 1, '{"cable"}'::text[], 'Pectoralis major (sternal)', '{"Anterior deltoid","Serratus anterior"}'::text[], 'lengthened', 'local', NULL, 'horizontal', '{"Shoulder"}'::text[], true)
  ON CONFLICT (name) DO UPDATE SET
    category = EXCLUDED.category,
    movement_patterns = EXCLUDED.movement_patterns,
    bilateral_unilateral = EXCLUDED.bilateral_unilateral,
    posterior_anterior = EXCLUDED.posterior_anterior,
    complexity = EXCLUDED.complexity,
    equipment = EXCLUDED.equipment,
    primary_muscle = EXCLUDED.primary_muscle,
    supporting_muscles = EXCLUDED.supporting_muscles,
    muscle_bias = EXCLUDED.muscle_bias,
    joint_count_level = EXCLUDED.joint_count_level,
    dynamic_isometric = EXCLUDED.dynamic_isometric,
    movement_plane = EXCLUDED.movement_plane,
    primary_joints = EXCLUDED.primary_joints,
    is_active = true,
    updated_at = now();

INSERT INTO exercise_library (name, category, movement_patterns, bilateral_unilateral, posterior_anterior, complexity, equipment, primary_muscle, supporting_muscles, muscle_bias, joint_count_level, dynamic_isometric, movement_plane, primary_joints, is_active)
  VALUES ('Cable Chest Fly (Low-to-High; clavicular fibers)', 'strength', '{"horizontal_push"}'::text[], 'bilateral', 'anterior', 1, '{"cable"}'::text[], 'Pectoralis major (clavicular)', '{"Anterior deltoid","Serratus anterior"}'::text[], 'lengthened', 'local', NULL, 'horizontal', '{"Shoulder"}'::text[], true)
  ON CONFLICT (name) DO UPDATE SET
    category = EXCLUDED.category,
    movement_patterns = EXCLUDED.movement_patterns,
    bilateral_unilateral = EXCLUDED.bilateral_unilateral,
    posterior_anterior = EXCLUDED.posterior_anterior,
    complexity = EXCLUDED.complexity,
    equipment = EXCLUDED.equipment,
    primary_muscle = EXCLUDED.primary_muscle,
    supporting_muscles = EXCLUDED.supporting_muscles,
    muscle_bias = EXCLUDED.muscle_bias,
    joint_count_level = EXCLUDED.joint_count_level,
    dynamic_isometric = EXCLUDED.dynamic_isometric,
    movement_plane = EXCLUDED.movement_plane,
    primary_joints = EXCLUDED.primary_joints,
    is_active = true,
    updated_at = now();

INSERT INTO exercise_library (name, category, movement_patterns, bilateral_unilateral, posterior_anterior, complexity, equipment, primary_muscle, supporting_muscles, muscle_bias, joint_count_level, dynamic_isometric, movement_plane, primary_joints, is_active)
  VALUES ('Pec Deck / Machine Fly', 'strength', '{"horizontal_push"}'::text[], 'bilateral', 'anterior', 1, '{"fixed_machine"}'::text[], 'Pectoralis major', '{"Anterior deltoid"}'::text[], 'shortened', 'local', NULL, 'horizontal', '{"Shoulder"}'::text[], true)
  ON CONFLICT (name) DO UPDATE SET
    category = EXCLUDED.category,
    movement_patterns = EXCLUDED.movement_patterns,
    bilateral_unilateral = EXCLUDED.bilateral_unilateral,
    posterior_anterior = EXCLUDED.posterior_anterior,
    complexity = EXCLUDED.complexity,
    equipment = EXCLUDED.equipment,
    primary_muscle = EXCLUDED.primary_muscle,
    supporting_muscles = EXCLUDED.supporting_muscles,
    muscle_bias = EXCLUDED.muscle_bias,
    joint_count_level = EXCLUDED.joint_count_level,
    dynamic_isometric = EXCLUDED.dynamic_isometric,
    movement_plane = EXCLUDED.movement_plane,
    primary_joints = EXCLUDED.primary_joints,
    is_active = true,
    updated_at = now();

INSERT INTO exercise_library (name, category, movement_patterns, bilateral_unilateral, posterior_anterior, complexity, equipment, primary_muscle, supporting_muscles, muscle_bias, joint_count_level, dynamic_isometric, movement_plane, primary_joints, is_active)
  VALUES ('DB Fly (Flat)', 'strength', '{"horizontal_push"}'::text[], 'bilateral', 'anterior', 2, '{"bench","dumbbell"}'::text[], 'Pectoralis major', '{"Anterior deltoid","Biceps brachii (stabilizer)"}'::text[], 'lengthened', 'local', NULL, 'horizontal', '{"Shoulder"}'::text[], true)
  ON CONFLICT (name) DO UPDATE SET
    category = EXCLUDED.category,
    movement_patterns = EXCLUDED.movement_patterns,
    bilateral_unilateral = EXCLUDED.bilateral_unilateral,
    posterior_anterior = EXCLUDED.posterior_anterior,
    complexity = EXCLUDED.complexity,
    equipment = EXCLUDED.equipment,
    primary_muscle = EXCLUDED.primary_muscle,
    supporting_muscles = EXCLUDED.supporting_muscles,
    muscle_bias = EXCLUDED.muscle_bias,
    joint_count_level = EXCLUDED.joint_count_level,
    dynamic_isometric = EXCLUDED.dynamic_isometric,
    movement_plane = EXCLUDED.movement_plane,
    primary_joints = EXCLUDED.primary_joints,
    is_active = true,
    updated_at = now();

INSERT INTO exercise_library (name, category, movement_patterns, bilateral_unilateral, posterior_anterior, complexity, equipment, primary_muscle, supporting_muscles, muscle_bias, joint_count_level, dynamic_isometric, movement_plane, primary_joints, is_active)
  VALUES ('DB Fly (Incline)', 'strength', '{"horizontal_push"}'::text[], 'bilateral', 'anterior', 2, '{"bench","dumbbell"}'::text[], 'Pectoralis major (clavicular)', '{"Anterior deltoid"}'::text[], 'lengthened', 'local', NULL, 'horizontal', '{"Shoulder"}'::text[], true)
  ON CONFLICT (name) DO UPDATE SET
    category = EXCLUDED.category,
    movement_patterns = EXCLUDED.movement_patterns,
    bilateral_unilateral = EXCLUDED.bilateral_unilateral,
    posterior_anterior = EXCLUDED.posterior_anterior,
    complexity = EXCLUDED.complexity,
    equipment = EXCLUDED.equipment,
    primary_muscle = EXCLUDED.primary_muscle,
    supporting_muscles = EXCLUDED.supporting_muscles,
    muscle_bias = EXCLUDED.muscle_bias,
    joint_count_level = EXCLUDED.joint_count_level,
    dynamic_isometric = EXCLUDED.dynamic_isometric,
    movement_plane = EXCLUDED.movement_plane,
    primary_joints = EXCLUDED.primary_joints,
    is_active = true,
    updated_at = now();

INSERT INTO exercise_library (name, category, movement_patterns, bilateral_unilateral, posterior_anterior, complexity, equipment, primary_muscle, supporting_muscles, muscle_bias, joint_count_level, dynamic_isometric, movement_plane, primary_joints, is_active)
  VALUES ('DB Fly (Decline)', 'strength', '{"horizontal_push"}'::text[], 'bilateral', 'anterior', 2, '{"bench","dumbbell"}'::text[], 'Pectoralis major (sternal/costal)', '{"Anterior deltoid"}'::text[], 'lengthened', 'local', NULL, 'horizontal', '{"Shoulder"}'::text[], true)
  ON CONFLICT (name) DO UPDATE SET
    category = EXCLUDED.category,
    movement_patterns = EXCLUDED.movement_patterns,
    bilateral_unilateral = EXCLUDED.bilateral_unilateral,
    posterior_anterior = EXCLUDED.posterior_anterior,
    complexity = EXCLUDED.complexity,
    equipment = EXCLUDED.equipment,
    primary_muscle = EXCLUDED.primary_muscle,
    supporting_muscles = EXCLUDED.supporting_muscles,
    muscle_bias = EXCLUDED.muscle_bias,
    joint_count_level = EXCLUDED.joint_count_level,
    dynamic_isometric = EXCLUDED.dynamic_isometric,
    movement_plane = EXCLUDED.movement_plane,
    primary_joints = EXCLUDED.primary_joints,
    is_active = true,
    updated_at = now();

INSERT INTO exercise_library (name, category, movement_patterns, bilateral_unilateral, posterior_anterior, complexity, equipment, primary_muscle, supporting_muscles, muscle_bias, joint_count_level, dynamic_isometric, movement_plane, primary_joints, is_active)
  VALUES ('Incline Push-Up', 'strength', '{"horizontal_push"}'::text[], 'bilateral', 'anterior', 1, '{"bench","bodyweight"}'::text[], 'Pectoralis major', '{"Triceps brachii","Anterior deltoid","Serratus anterior"}'::text[], 'mid', 'regional', NULL, 'horizontal', '{"Shoulder","Elbow"}'::text[], true)
  ON CONFLICT (name) DO UPDATE SET
    category = EXCLUDED.category,
    movement_patterns = EXCLUDED.movement_patterns,
    bilateral_unilateral = EXCLUDED.bilateral_unilateral,
    posterior_anterior = EXCLUDED.posterior_anterior,
    complexity = EXCLUDED.complexity,
    equipment = EXCLUDED.equipment,
    primary_muscle = EXCLUDED.primary_muscle,
    supporting_muscles = EXCLUDED.supporting_muscles,
    muscle_bias = EXCLUDED.muscle_bias,
    joint_count_level = EXCLUDED.joint_count_level,
    dynamic_isometric = EXCLUDED.dynamic_isometric,
    movement_plane = EXCLUDED.movement_plane,
    primary_joints = EXCLUDED.primary_joints,
    is_active = true,
    updated_at = now();

INSERT INTO exercise_library (name, category, movement_patterns, bilateral_unilateral, posterior_anterior, complexity, equipment, primary_muscle, supporting_muscles, muscle_bias, joint_count_level, dynamic_isometric, movement_plane, primary_joints, is_active)
  VALUES ('Machine Chest Press (Neutral Grip)', 'strength', '{"horizontal_push"}'::text[], 'bilateral', 'anterior', 1, '{"fixed_machine"}'::text[], 'Pectoralis major', '{"Triceps brachii","Anterior deltoid"}'::text[], 'mid', 'regional', NULL, 'horizontal', '{"Shoulder","Elbow"}'::text[], true)
  ON CONFLICT (name) DO UPDATE SET
    category = EXCLUDED.category,
    movement_patterns = EXCLUDED.movement_patterns,
    bilateral_unilateral = EXCLUDED.bilateral_unilateral,
    posterior_anterior = EXCLUDED.posterior_anterior,
    complexity = EXCLUDED.complexity,
    equipment = EXCLUDED.equipment,
    primary_muscle = EXCLUDED.primary_muscle,
    supporting_muscles = EXCLUDED.supporting_muscles,
    muscle_bias = EXCLUDED.muscle_bias,
    joint_count_level = EXCLUDED.joint_count_level,
    dynamic_isometric = EXCLUDED.dynamic_isometric,
    movement_plane = EXCLUDED.movement_plane,
    primary_joints = EXCLUDED.primary_joints,
    is_active = true,
    updated_at = now();

INSERT INTO exercise_library (name, category, movement_patterns, bilateral_unilateral, posterior_anterior, complexity, equipment, primary_muscle, supporting_muscles, muscle_bias, joint_count_level, dynamic_isometric, movement_plane, primary_joints, is_active)
  VALUES ('Machine Chest Press (Pronated Grip)', 'strength', '{"horizontal_push"}'::text[], 'bilateral', 'anterior', 1, '{"fixed_machine"}'::text[], 'Pectoralis major', '{"Triceps brachii","Anterior deltoid"}'::text[], 'mid', 'regional', NULL, 'horizontal', '{"Shoulder","Elbow"}'::text[], true)
  ON CONFLICT (name) DO UPDATE SET
    category = EXCLUDED.category,
    movement_patterns = EXCLUDED.movement_patterns,
    bilateral_unilateral = EXCLUDED.bilateral_unilateral,
    posterior_anterior = EXCLUDED.posterior_anterior,
    complexity = EXCLUDED.complexity,
    equipment = EXCLUDED.equipment,
    primary_muscle = EXCLUDED.primary_muscle,
    supporting_muscles = EXCLUDED.supporting_muscles,
    muscle_bias = EXCLUDED.muscle_bias,
    joint_count_level = EXCLUDED.joint_count_level,
    dynamic_isometric = EXCLUDED.dynamic_isometric,
    movement_plane = EXCLUDED.movement_plane,
    primary_joints = EXCLUDED.primary_joints,
    is_active = true,
    updated_at = now();

INSERT INTO exercise_library (name, category, movement_patterns, bilateral_unilateral, posterior_anterior, complexity, equipment, primary_muscle, supporting_muscles, muscle_bias, joint_count_level, dynamic_isometric, movement_plane, primary_joints, is_active)
  VALUES ('Cable Serratus Reach (Supine or Standing)', 'strength', '{"horizontal_push"}'::text[], 'bilateral', 'anterior', 1, '{"cable"}'::text[], 'Serratus anterior', '{"Upper trapezius","Lower trapezius"}'::text[], 'mid', 'local', NULL, 'horizontal', '{"Scapulothoracic"}'::text[], true)
  ON CONFLICT (name) DO UPDATE SET
    category = EXCLUDED.category,
    movement_patterns = EXCLUDED.movement_patterns,
    bilateral_unilateral = EXCLUDED.bilateral_unilateral,
    posterior_anterior = EXCLUDED.posterior_anterior,
    complexity = EXCLUDED.complexity,
    equipment = EXCLUDED.equipment,
    primary_muscle = EXCLUDED.primary_muscle,
    supporting_muscles = EXCLUDED.supporting_muscles,
    muscle_bias = EXCLUDED.muscle_bias,
    joint_count_level = EXCLUDED.joint_count_level,
    dynamic_isometric = EXCLUDED.dynamic_isometric,
    movement_plane = EXCLUDED.movement_plane,
    primary_joints = EXCLUDED.primary_joints,
    is_active = true,
    updated_at = now();

INSERT INTO exercise_library (name, category, movement_patterns, bilateral_unilateral, posterior_anterior, complexity, equipment, primary_muscle, supporting_muscles, muscle_bias, joint_count_level, dynamic_isometric, movement_plane, primary_joints, is_active)
  VALUES ('Serratus Wall Slide (Band)', 'strength', '{"vertical_push"}'::text[], 'bilateral', 'anterior', 1, '{"band"}'::text[], 'Serratus anterior', '{"Lower trapezius","Rotator cuff"}'::text[], 'mid', 'local', NULL, 'vertical', '{"Scapulothoracic"}'::text[], true)
  ON CONFLICT (name) DO UPDATE SET
    category = EXCLUDED.category,
    movement_patterns = EXCLUDED.movement_patterns,
    bilateral_unilateral = EXCLUDED.bilateral_unilateral,
    posterior_anterior = EXCLUDED.posterior_anterior,
    complexity = EXCLUDED.complexity,
    equipment = EXCLUDED.equipment,
    primary_muscle = EXCLUDED.primary_muscle,
    supporting_muscles = EXCLUDED.supporting_muscles,
    muscle_bias = EXCLUDED.muscle_bias,
    joint_count_level = EXCLUDED.joint_count_level,
    dynamic_isometric = EXCLUDED.dynamic_isometric,
    movement_plane = EXCLUDED.movement_plane,
    primary_joints = EXCLUDED.primary_joints,
    is_active = true,
    updated_at = now();

INSERT INTO exercise_library (name, category, movement_patterns, bilateral_unilateral, posterior_anterior, complexity, equipment, primary_muscle, supporting_muscles, muscle_bias, joint_count_level, dynamic_isometric, movement_plane, primary_joints, is_active)
  VALUES ('Wall Slide (Band)', 'strength', '{"vertical_push"}'::text[], 'bilateral', 'anterior', 1, '{"band"}'::text[], 'Lower trapezius', '{"Serratus anterior","Rotator cuff"}'::text[], 'lengthened', 'local', NULL, 'vertical', '{"Scapulothoracic"}'::text[], true)
  ON CONFLICT (name) DO UPDATE SET
    category = EXCLUDED.category,
    movement_patterns = EXCLUDED.movement_patterns,
    bilateral_unilateral = EXCLUDED.bilateral_unilateral,
    posterior_anterior = EXCLUDED.posterior_anterior,
    complexity = EXCLUDED.complexity,
    equipment = EXCLUDED.equipment,
    primary_muscle = EXCLUDED.primary_muscle,
    supporting_muscles = EXCLUDED.supporting_muscles,
    muscle_bias = EXCLUDED.muscle_bias,
    joint_count_level = EXCLUDED.joint_count_level,
    dynamic_isometric = EXCLUDED.dynamic_isometric,
    movement_plane = EXCLUDED.movement_plane,
    primary_joints = EXCLUDED.primary_joints,
    is_active = true,
    updated_at = now();

INSERT INTO exercise_library (name, category, movement_patterns, bilateral_unilateral, posterior_anterior, complexity, equipment, primary_muscle, supporting_muscles, muscle_bias, joint_count_level, dynamic_isometric, movement_plane, primary_joints, is_active)
  VALUES ('Scapular Push-Up Plus', 'strength', '{"horizontal_push"}'::text[], 'bilateral', 'anterior', 1, '{"bodyweight"}'::text[], 'Serratus anterior', '{"Pectoralis minor","Rotator cuff"}'::text[], 'mid', 'local', NULL, 'horizontal', '{"Scapulothoracic"}'::text[], true)
  ON CONFLICT (name) DO UPDATE SET
    category = EXCLUDED.category,
    movement_patterns = EXCLUDED.movement_patterns,
    bilateral_unilateral = EXCLUDED.bilateral_unilateral,
    posterior_anterior = EXCLUDED.posterior_anterior,
    complexity = EXCLUDED.complexity,
    equipment = EXCLUDED.equipment,
    primary_muscle = EXCLUDED.primary_muscle,
    supporting_muscles = EXCLUDED.supporting_muscles,
    muscle_bias = EXCLUDED.muscle_bias,
    joint_count_level = EXCLUDED.joint_count_level,
    dynamic_isometric = EXCLUDED.dynamic_isometric,
    movement_plane = EXCLUDED.movement_plane,
    primary_joints = EXCLUDED.primary_joints,
    is_active = true,
    updated_at = now();

INSERT INTO exercise_library (name, category, movement_patterns, bilateral_unilateral, posterior_anterior, complexity, equipment, primary_muscle, supporting_muscles, muscle_bias, joint_count_level, dynamic_isometric, movement_plane, primary_joints, is_active)
  VALUES ('Dip Isometric Hold (Parallel Bar; Top Position)', 'strength', '{"vertical_push"}'::text[], 'bilateral', 'anterior', 2, '{}'::text[], 'Pectoralis major', '{"Triceps brachii","Anterior deltoid"}'::text[], 'shortened', 'regional', NULL, 'vertical', '{"Shoulder","Elbow"}'::text[], true)
  ON CONFLICT (name) DO UPDATE SET
    category = EXCLUDED.category,
    movement_patterns = EXCLUDED.movement_patterns,
    bilateral_unilateral = EXCLUDED.bilateral_unilateral,
    posterior_anterior = EXCLUDED.posterior_anterior,
    complexity = EXCLUDED.complexity,
    equipment = EXCLUDED.equipment,
    primary_muscle = EXCLUDED.primary_muscle,
    supporting_muscles = EXCLUDED.supporting_muscles,
    muscle_bias = EXCLUDED.muscle_bias,
    joint_count_level = EXCLUDED.joint_count_level,
    dynamic_isometric = EXCLUDED.dynamic_isometric,
    movement_plane = EXCLUDED.movement_plane,
    primary_joints = EXCLUDED.primary_joints,
    is_active = true,
    updated_at = now();

INSERT INTO exercise_library (name, category, movement_patterns, bilateral_unilateral, posterior_anterior, complexity, equipment, primary_muscle, supporting_muscles, muscle_bias, joint_count_level, dynamic_isometric, movement_plane, primary_joints, is_active)
  VALUES ('Dip Isometric Hold (Parallel Bar; Bottom Position)', 'strength', '{"vertical_push"}'::text[], 'bilateral', 'anterior', 2, '{}'::text[], 'Pectoralis major', '{"Triceps brachii","Anterior deltoid"}'::text[], 'lengthened', 'regional', NULL, 'vertical', '{"Shoulder","Elbow"}'::text[], true)
  ON CONFLICT (name) DO UPDATE SET
    category = EXCLUDED.category,
    movement_patterns = EXCLUDED.movement_patterns,
    bilateral_unilateral = EXCLUDED.bilateral_unilateral,
    posterior_anterior = EXCLUDED.posterior_anterior,
    complexity = EXCLUDED.complexity,
    equipment = EXCLUDED.equipment,
    primary_muscle = EXCLUDED.primary_muscle,
    supporting_muscles = EXCLUDED.supporting_muscles,
    muscle_bias = EXCLUDED.muscle_bias,
    joint_count_level = EXCLUDED.joint_count_level,
    dynamic_isometric = EXCLUDED.dynamic_isometric,
    movement_plane = EXCLUDED.movement_plane,
    primary_joints = EXCLUDED.primary_joints,
    is_active = true,
    updated_at = now();

INSERT INTO exercise_library (name, category, movement_patterns, bilateral_unilateral, posterior_anterior, complexity, equipment, primary_muscle, supporting_muscles, muscle_bias, joint_count_level, dynamic_isometric, movement_plane, primary_joints, is_active)
  VALUES ('Dip Isometric Hold (V-Bar; Top Position)', 'strength', '{"vertical_push"}'::text[], 'bilateral', 'anterior', 2, '{}'::text[], 'Pectoralis major', '{"Triceps brachii","Anterior deltoid"}'::text[], 'shortened', 'regional', NULL, 'vertical', '{"Shoulder","Elbow"}'::text[], true)
  ON CONFLICT (name) DO UPDATE SET
    category = EXCLUDED.category,
    movement_patterns = EXCLUDED.movement_patterns,
    bilateral_unilateral = EXCLUDED.bilateral_unilateral,
    posterior_anterior = EXCLUDED.posterior_anterior,
    complexity = EXCLUDED.complexity,
    equipment = EXCLUDED.equipment,
    primary_muscle = EXCLUDED.primary_muscle,
    supporting_muscles = EXCLUDED.supporting_muscles,
    muscle_bias = EXCLUDED.muscle_bias,
    joint_count_level = EXCLUDED.joint_count_level,
    dynamic_isometric = EXCLUDED.dynamic_isometric,
    movement_plane = EXCLUDED.movement_plane,
    primary_joints = EXCLUDED.primary_joints,
    is_active = true,
    updated_at = now();

INSERT INTO exercise_library (name, category, movement_patterns, bilateral_unilateral, posterior_anterior, complexity, equipment, primary_muscle, supporting_muscles, muscle_bias, joint_count_level, dynamic_isometric, movement_plane, primary_joints, is_active)
  VALUES ('Dip Isometric Hold (V-Bar; Bottom Position)', 'strength', '{"vertical_push"}'::text[], 'bilateral', 'anterior', 2, '{}'::text[], 'Pectoralis major', '{"Triceps brachii","Anterior deltoid"}'::text[], 'lengthened', 'regional', NULL, 'vertical', '{"Shoulder","Elbow"}'::text[], true)
  ON CONFLICT (name) DO UPDATE SET
    category = EXCLUDED.category,
    movement_patterns = EXCLUDED.movement_patterns,
    bilateral_unilateral = EXCLUDED.bilateral_unilateral,
    posterior_anterior = EXCLUDED.posterior_anterior,
    complexity = EXCLUDED.complexity,
    equipment = EXCLUDED.equipment,
    primary_muscle = EXCLUDED.primary_muscle,
    supporting_muscles = EXCLUDED.supporting_muscles,
    muscle_bias = EXCLUDED.muscle_bias,
    joint_count_level = EXCLUDED.joint_count_level,
    dynamic_isometric = EXCLUDED.dynamic_isometric,
    movement_plane = EXCLUDED.movement_plane,
    primary_joints = EXCLUDED.primary_joints,
    is_active = true,
    updated_at = now();

INSERT INTO exercise_library (name, category, movement_patterns, bilateral_unilateral, posterior_anterior, complexity, equipment, primary_muscle, supporting_muscles, muscle_bias, joint_count_level, dynamic_isometric, movement_plane, primary_joints, is_active)
  VALUES ('Ring Dip Isometric Hold (Top Position)', 'strength', '{"vertical_push"}'::text[], 'bilateral', 'anterior', 3, '{}'::text[], 'Pectoralis major', '{"Triceps brachii","Anterior deltoid","Rotator cuff"}'::text[], 'shortened', 'regional', NULL, 'vertical', '{"Shoulder","Elbow"}'::text[], true)
  ON CONFLICT (name) DO UPDATE SET
    category = EXCLUDED.category,
    movement_patterns = EXCLUDED.movement_patterns,
    bilateral_unilateral = EXCLUDED.bilateral_unilateral,
    posterior_anterior = EXCLUDED.posterior_anterior,
    complexity = EXCLUDED.complexity,
    equipment = EXCLUDED.equipment,
    primary_muscle = EXCLUDED.primary_muscle,
    supporting_muscles = EXCLUDED.supporting_muscles,
    muscle_bias = EXCLUDED.muscle_bias,
    joint_count_level = EXCLUDED.joint_count_level,
    dynamic_isometric = EXCLUDED.dynamic_isometric,
    movement_plane = EXCLUDED.movement_plane,
    primary_joints = EXCLUDED.primary_joints,
    is_active = true,
    updated_at = now();

INSERT INTO exercise_library (name, category, movement_patterns, bilateral_unilateral, posterior_anterior, complexity, equipment, primary_muscle, supporting_muscles, muscle_bias, joint_count_level, dynamic_isometric, movement_plane, primary_joints, is_active)
  VALUES ('Ring Dip Isometric Hold (Bottom Position)', 'strength', '{"vertical_push"}'::text[], 'bilateral', 'anterior', 3, '{}'::text[], 'Pectoralis major', '{"Triceps brachii","Anterior deltoid","Rotator cuff"}'::text[], 'lengthened', 'regional', NULL, 'vertical', '{"Shoulder","Elbow"}'::text[], true)
  ON CONFLICT (name) DO UPDATE SET
    category = EXCLUDED.category,
    movement_patterns = EXCLUDED.movement_patterns,
    bilateral_unilateral = EXCLUDED.bilateral_unilateral,
    posterior_anterior = EXCLUDED.posterior_anterior,
    complexity = EXCLUDED.complexity,
    equipment = EXCLUDED.equipment,
    primary_muscle = EXCLUDED.primary_muscle,
    supporting_muscles = EXCLUDED.supporting_muscles,
    muscle_bias = EXCLUDED.muscle_bias,
    joint_count_level = EXCLUDED.joint_count_level,
    dynamic_isometric = EXCLUDED.dynamic_isometric,
    movement_plane = EXCLUDED.movement_plane,
    primary_joints = EXCLUDED.primary_joints,
    is_active = true,
    updated_at = now();

INSERT INTO exercise_library (name, category, movement_patterns, bilateral_unilateral, posterior_anterior, complexity, equipment, primary_muscle, supporting_muscles, muscle_bias, joint_count_level, dynamic_isometric, movement_plane, primary_joints, is_active)
  VALUES ('Chest-Supported Incline Bench Row (Dual DB; Neutral Grip)', 'strength', '{"horizontal_pull"}'::text[], 'bilateral', 'posterior', 2, '{"bench","dumbbell"}'::text[], 'Latissimus dorsi', '{"Biceps brachii","Rhomboid","Mid trapezius"}'::text[], 'mid', 'regional', NULL, 'horizontal', '{"Shoulder","Elbow"}'::text[], true)
  ON CONFLICT (name) DO UPDATE SET
    category = EXCLUDED.category,
    movement_patterns = EXCLUDED.movement_patterns,
    bilateral_unilateral = EXCLUDED.bilateral_unilateral,
    posterior_anterior = EXCLUDED.posterior_anterior,
    complexity = EXCLUDED.complexity,
    equipment = EXCLUDED.equipment,
    primary_muscle = EXCLUDED.primary_muscle,
    supporting_muscles = EXCLUDED.supporting_muscles,
    muscle_bias = EXCLUDED.muscle_bias,
    joint_count_level = EXCLUDED.joint_count_level,
    dynamic_isometric = EXCLUDED.dynamic_isometric,
    movement_plane = EXCLUDED.movement_plane,
    primary_joints = EXCLUDED.primary_joints,
    is_active = true,
    updated_at = now();

INSERT INTO exercise_library (name, category, movement_patterns, bilateral_unilateral, posterior_anterior, complexity, equipment, primary_muscle, supporting_muscles, muscle_bias, joint_count_level, dynamic_isometric, movement_plane, primary_joints, is_active)
  VALUES ('Chest-Supported Incline Bench Row (Dual DB; Semi-Pronated Grip)', 'strength', '{"horizontal_pull"}'::text[], 'bilateral', 'posterior', 2, '{"bench","dumbbell"}'::text[], 'Rhomboid, Mid trapezius', '{"Biceps brachii","Posterior deltoid"}'::text[], 'mid', 'regional', NULL, 'horizontal', '{"Shoulder","Elbow"}'::text[], true)
  ON CONFLICT (name) DO UPDATE SET
    category = EXCLUDED.category,
    movement_patterns = EXCLUDED.movement_patterns,
    bilateral_unilateral = EXCLUDED.bilateral_unilateral,
    posterior_anterior = EXCLUDED.posterior_anterior,
    complexity = EXCLUDED.complexity,
    equipment = EXCLUDED.equipment,
    primary_muscle = EXCLUDED.primary_muscle,
    supporting_muscles = EXCLUDED.supporting_muscles,
    muscle_bias = EXCLUDED.muscle_bias,
    joint_count_level = EXCLUDED.joint_count_level,
    dynamic_isometric = EXCLUDED.dynamic_isometric,
    movement_plane = EXCLUDED.movement_plane,
    primary_joints = EXCLUDED.primary_joints,
    is_active = true,
    updated_at = now();

INSERT INTO exercise_library (name, category, movement_patterns, bilateral_unilateral, posterior_anterior, complexity, equipment, primary_muscle, supporting_muscles, muscle_bias, joint_count_level, dynamic_isometric, movement_plane, primary_joints, is_active)
  VALUES ('Chest-Supported Machine Row (Neutral Grip)', 'strength', '{"horizontal_pull"}'::text[], 'bilateral', 'posterior', 1, '{"fixed_machine"}'::text[], 'Latissimus dorsi', '{"Biceps brachii","Rhomboid","Mid trapezius"}'::text[], 'mid', 'regional', NULL, 'horizontal', '{"Shoulder","Elbow"}'::text[], true)
  ON CONFLICT (name) DO UPDATE SET
    category = EXCLUDED.category,
    movement_patterns = EXCLUDED.movement_patterns,
    bilateral_unilateral = EXCLUDED.bilateral_unilateral,
    posterior_anterior = EXCLUDED.posterior_anterior,
    complexity = EXCLUDED.complexity,
    equipment = EXCLUDED.equipment,
    primary_muscle = EXCLUDED.primary_muscle,
    supporting_muscles = EXCLUDED.supporting_muscles,
    muscle_bias = EXCLUDED.muscle_bias,
    joint_count_level = EXCLUDED.joint_count_level,
    dynamic_isometric = EXCLUDED.dynamic_isometric,
    movement_plane = EXCLUDED.movement_plane,
    primary_joints = EXCLUDED.primary_joints,
    is_active = true,
    updated_at = now();

INSERT INTO exercise_library (name, category, movement_patterns, bilateral_unilateral, posterior_anterior, complexity, equipment, primary_muscle, supporting_muscles, muscle_bias, joint_count_level, dynamic_isometric, movement_plane, primary_joints, is_active)
  VALUES ('Chest-Supported Machine Row (Pronated Grip)', 'strength', '{"horizontal_pull"}'::text[], 'bilateral', 'posterior', 1, '{"fixed_machine"}'::text[], 'Rhomboid, Mid trapezius', '{"Biceps brachii","Posterior deltoid"}'::text[], 'mid', 'regional', NULL, 'horizontal', '{"Shoulder","Elbow"}'::text[], true)
  ON CONFLICT (name) DO UPDATE SET
    category = EXCLUDED.category,
    movement_patterns = EXCLUDED.movement_patterns,
    bilateral_unilateral = EXCLUDED.bilateral_unilateral,
    posterior_anterior = EXCLUDED.posterior_anterior,
    complexity = EXCLUDED.complexity,
    equipment = EXCLUDED.equipment,
    primary_muscle = EXCLUDED.primary_muscle,
    supporting_muscles = EXCLUDED.supporting_muscles,
    muscle_bias = EXCLUDED.muscle_bias,
    joint_count_level = EXCLUDED.joint_count_level,
    dynamic_isometric = EXCLUDED.dynamic_isometric,
    movement_plane = EXCLUDED.movement_plane,
    primary_joints = EXCLUDED.primary_joints,
    is_active = true,
    updated_at = now();

INSERT INTO exercise_library (name, category, movement_patterns, bilateral_unilateral, posterior_anterior, complexity, equipment, primary_muscle, supporting_muscles, muscle_bias, joint_count_level, dynamic_isometric, movement_plane, primary_joints, is_active)
  VALUES ('Seated Cable Row (Neutral Grip)', 'strength', '{"horizontal_pull"}'::text[], 'bilateral', 'posterior', 1, '{"cable"}'::text[], 'Latissimus dorsi', '{"Biceps brachii","Rhomboid","Mid trapezius"}'::text[], 'mid', 'regional', NULL, 'horizontal', '{"Shoulder","Elbow"}'::text[], true)
  ON CONFLICT (name) DO UPDATE SET
    category = EXCLUDED.category,
    movement_patterns = EXCLUDED.movement_patterns,
    bilateral_unilateral = EXCLUDED.bilateral_unilateral,
    posterior_anterior = EXCLUDED.posterior_anterior,
    complexity = EXCLUDED.complexity,
    equipment = EXCLUDED.equipment,
    primary_muscle = EXCLUDED.primary_muscle,
    supporting_muscles = EXCLUDED.supporting_muscles,
    muscle_bias = EXCLUDED.muscle_bias,
    joint_count_level = EXCLUDED.joint_count_level,
    dynamic_isometric = EXCLUDED.dynamic_isometric,
    movement_plane = EXCLUDED.movement_plane,
    primary_joints = EXCLUDED.primary_joints,
    is_active = true,
    updated_at = now();

INSERT INTO exercise_library (name, category, movement_patterns, bilateral_unilateral, posterior_anterior, complexity, equipment, primary_muscle, supporting_muscles, muscle_bias, joint_count_level, dynamic_isometric, movement_plane, primary_joints, is_active)
  VALUES ('Seated Cable Row (Pronated Grip)', 'strength', '{"horizontal_pull"}'::text[], 'bilateral', 'posterior', 1, '{"cable"}'::text[], 'Rhomboid, Mid trapezius', '{"Biceps brachii","Posterior deltoid"}'::text[], 'mid', 'regional', NULL, 'horizontal', '{"Shoulder","Elbow"}'::text[], true)
  ON CONFLICT (name) DO UPDATE SET
    category = EXCLUDED.category,
    movement_patterns = EXCLUDED.movement_patterns,
    bilateral_unilateral = EXCLUDED.bilateral_unilateral,
    posterior_anterior = EXCLUDED.posterior_anterior,
    complexity = EXCLUDED.complexity,
    equipment = EXCLUDED.equipment,
    primary_muscle = EXCLUDED.primary_muscle,
    supporting_muscles = EXCLUDED.supporting_muscles,
    muscle_bias = EXCLUDED.muscle_bias,
    joint_count_level = EXCLUDED.joint_count_level,
    dynamic_isometric = EXCLUDED.dynamic_isometric,
    movement_plane = EXCLUDED.movement_plane,
    primary_joints = EXCLUDED.primary_joints,
    is_active = true,
    updated_at = now();

INSERT INTO exercise_library (name, category, movement_patterns, bilateral_unilateral, posterior_anterior, complexity, equipment, primary_muscle, supporting_muscles, muscle_bias, joint_count_level, dynamic_isometric, movement_plane, primary_joints, is_active)
  VALUES ('Seated Cable Row (Semi-Pronated Grip)', 'strength', '{"horizontal_pull"}'::text[], 'bilateral', 'posterior', 1, '{"cable"}'::text[], 'Latissimus dorsi, Mid-back', '{"Biceps brachii","Rhomboid"}'::text[], 'mid', 'regional', NULL, 'horizontal', '{"Shoulder","Elbow"}'::text[], true)
  ON CONFLICT (name) DO UPDATE SET
    category = EXCLUDED.category,
    movement_patterns = EXCLUDED.movement_patterns,
    bilateral_unilateral = EXCLUDED.bilateral_unilateral,
    posterior_anterior = EXCLUDED.posterior_anterior,
    complexity = EXCLUDED.complexity,
    equipment = EXCLUDED.equipment,
    primary_muscle = EXCLUDED.primary_muscle,
    supporting_muscles = EXCLUDED.supporting_muscles,
    muscle_bias = EXCLUDED.muscle_bias,
    joint_count_level = EXCLUDED.joint_count_level,
    dynamic_isometric = EXCLUDED.dynamic_isometric,
    movement_plane = EXCLUDED.movement_plane,
    primary_joints = EXCLUDED.primary_joints,
    is_active = true,
    updated_at = now();

INSERT INTO exercise_library (name, category, movement_patterns, bilateral_unilateral, posterior_anterior, complexity, equipment, primary_muscle, supporting_muscles, muscle_bias, joint_count_level, dynamic_isometric, movement_plane, primary_joints, is_active)
  VALUES ('Single-Arm Cable Row (Neutral Grip)', 'strength', '{"horizontal_pull"}'::text[], 'unilateral', 'posterior', 1, '{"cable"}'::text[], 'Latissimus dorsi', '{"Biceps brachii","Rhomboid"}'::text[], 'mid', 'regional', NULL, 'horizontal', '{"Shoulder","Elbow"}'::text[], true)
  ON CONFLICT (name) DO UPDATE SET
    category = EXCLUDED.category,
    movement_patterns = EXCLUDED.movement_patterns,
    bilateral_unilateral = EXCLUDED.bilateral_unilateral,
    posterior_anterior = EXCLUDED.posterior_anterior,
    complexity = EXCLUDED.complexity,
    equipment = EXCLUDED.equipment,
    primary_muscle = EXCLUDED.primary_muscle,
    supporting_muscles = EXCLUDED.supporting_muscles,
    muscle_bias = EXCLUDED.muscle_bias,
    joint_count_level = EXCLUDED.joint_count_level,
    dynamic_isometric = EXCLUDED.dynamic_isometric,
    movement_plane = EXCLUDED.movement_plane,
    primary_joints = EXCLUDED.primary_joints,
    is_active = true,
    updated_at = now();

INSERT INTO exercise_library (name, category, movement_patterns, bilateral_unilateral, posterior_anterior, complexity, equipment, primary_muscle, supporting_muscles, muscle_bias, joint_count_level, dynamic_isometric, movement_plane, primary_joints, is_active)
  VALUES ('Single-Arm Cable Row (Semi-Pronated Grip)', 'strength', '{"horizontal_pull"}'::text[], 'unilateral', 'posterior', 1, '{"cable"}'::text[], 'Rhomboid, Mid trapezius', '{"Biceps brachii","Posterior deltoid"}'::text[], 'mid', 'regional', NULL, 'horizontal', '{"Shoulder","Elbow"}'::text[], true)
  ON CONFLICT (name) DO UPDATE SET
    category = EXCLUDED.category,
    movement_patterns = EXCLUDED.movement_patterns,
    bilateral_unilateral = EXCLUDED.bilateral_unilateral,
    posterior_anterior = EXCLUDED.posterior_anterior,
    complexity = EXCLUDED.complexity,
    equipment = EXCLUDED.equipment,
    primary_muscle = EXCLUDED.primary_muscle,
    supporting_muscles = EXCLUDED.supporting_muscles,
    muscle_bias = EXCLUDED.muscle_bias,
    joint_count_level = EXCLUDED.joint_count_level,
    dynamic_isometric = EXCLUDED.dynamic_isometric,
    movement_plane = EXCLUDED.movement_plane,
    primary_joints = EXCLUDED.primary_joints,
    is_active = true,
    updated_at = now();

INSERT INTO exercise_library (name, category, movement_patterns, bilateral_unilateral, posterior_anterior, complexity, equipment, primary_muscle, supporting_muscles, muscle_bias, joint_count_level, dynamic_isometric, movement_plane, primary_joints, is_active)
  VALUES ('Straight-Arm Cable Pulldown (Pronated Grip)', 'strength', '{"vertical_pull"}'::text[], 'bilateral', 'posterior', 1, '{"cable"}'::text[], 'Latissimus dorsi', '{"Teres major","Triceps brachii (long head","stabilizer)"}'::text[], 'lengthened', 'regional', NULL, 'vertical', '{"Shoulder"}'::text[], true)
  ON CONFLICT (name) DO UPDATE SET
    category = EXCLUDED.category,
    movement_patterns = EXCLUDED.movement_patterns,
    bilateral_unilateral = EXCLUDED.bilateral_unilateral,
    posterior_anterior = EXCLUDED.posterior_anterior,
    complexity = EXCLUDED.complexity,
    equipment = EXCLUDED.equipment,
    primary_muscle = EXCLUDED.primary_muscle,
    supporting_muscles = EXCLUDED.supporting_muscles,
    muscle_bias = EXCLUDED.muscle_bias,
    joint_count_level = EXCLUDED.joint_count_level,
    dynamic_isometric = EXCLUDED.dynamic_isometric,
    movement_plane = EXCLUDED.movement_plane,
    primary_joints = EXCLUDED.primary_joints,
    is_active = true,
    updated_at = now();

INSERT INTO exercise_library (name, category, movement_patterns, bilateral_unilateral, posterior_anterior, complexity, equipment, primary_muscle, supporting_muscles, muscle_bias, joint_count_level, dynamic_isometric, movement_plane, primary_joints, is_active)
  VALUES ('Lat Pulldown (Neutral Grip)', 'strength', '{"vertical_pull"}'::text[], 'bilateral', 'posterior', 1, '{"cable","fixed_machine"}'::text[], 'Latissimus dorsi', '{"Biceps brachii","Lower trapezius"}'::text[], 'mid', 'regional', NULL, 'vertical', '{"Shoulder","Elbow"}'::text[], true)
  ON CONFLICT (name) DO UPDATE SET
    category = EXCLUDED.category,
    movement_patterns = EXCLUDED.movement_patterns,
    bilateral_unilateral = EXCLUDED.bilateral_unilateral,
    posterior_anterior = EXCLUDED.posterior_anterior,
    complexity = EXCLUDED.complexity,
    equipment = EXCLUDED.equipment,
    primary_muscle = EXCLUDED.primary_muscle,
    supporting_muscles = EXCLUDED.supporting_muscles,
    muscle_bias = EXCLUDED.muscle_bias,
    joint_count_level = EXCLUDED.joint_count_level,
    dynamic_isometric = EXCLUDED.dynamic_isometric,
    movement_plane = EXCLUDED.movement_plane,
    primary_joints = EXCLUDED.primary_joints,
    is_active = true,
    updated_at = now();

INSERT INTO exercise_library (name, category, movement_patterns, bilateral_unilateral, posterior_anterior, complexity, equipment, primary_muscle, supporting_muscles, muscle_bias, joint_count_level, dynamic_isometric, movement_plane, primary_joints, is_active)
  VALUES ('Lat Pulldown (Pronated Grip)', 'strength', '{"vertical_pull"}'::text[], 'bilateral', 'posterior', 1, '{"cable","fixed_machine"}'::text[], 'Latissimus dorsi', '{"Biceps brachii","Rhomboid"}'::text[], 'mid', 'regional', NULL, 'vertical', '{"Shoulder","Elbow"}'::text[], true)
  ON CONFLICT (name) DO UPDATE SET
    category = EXCLUDED.category,
    movement_patterns = EXCLUDED.movement_patterns,
    bilateral_unilateral = EXCLUDED.bilateral_unilateral,
    posterior_anterior = EXCLUDED.posterior_anterior,
    complexity = EXCLUDED.complexity,
    equipment = EXCLUDED.equipment,
    primary_muscle = EXCLUDED.primary_muscle,
    supporting_muscles = EXCLUDED.supporting_muscles,
    muscle_bias = EXCLUDED.muscle_bias,
    joint_count_level = EXCLUDED.joint_count_level,
    dynamic_isometric = EXCLUDED.dynamic_isometric,
    movement_plane = EXCLUDED.movement_plane,
    primary_joints = EXCLUDED.primary_joints,
    is_active = true,
    updated_at = now();

INSERT INTO exercise_library (name, category, movement_patterns, bilateral_unilateral, posterior_anterior, complexity, equipment, primary_muscle, supporting_muscles, muscle_bias, joint_count_level, dynamic_isometric, movement_plane, primary_joints, is_active)
  VALUES ('Lat Pulldown (Supinated Grip)', 'strength', '{"vertical_pull"}'::text[], 'bilateral', 'posterior', 1, '{"cable","fixed_machine"}'::text[], 'Latissimus dorsi', '{"Biceps brachii"}'::text[], 'mid', 'regional', NULL, 'vertical', '{"Shoulder","Elbow"}'::text[], true)
  ON CONFLICT (name) DO UPDATE SET
    category = EXCLUDED.category,
    movement_patterns = EXCLUDED.movement_patterns,
    bilateral_unilateral = EXCLUDED.bilateral_unilateral,
    posterior_anterior = EXCLUDED.posterior_anterior,
    complexity = EXCLUDED.complexity,
    equipment = EXCLUDED.equipment,
    primary_muscle = EXCLUDED.primary_muscle,
    supporting_muscles = EXCLUDED.supporting_muscles,
    muscle_bias = EXCLUDED.muscle_bias,
    joint_count_level = EXCLUDED.joint_count_level,
    dynamic_isometric = EXCLUDED.dynamic_isometric,
    movement_plane = EXCLUDED.movement_plane,
    primary_joints = EXCLUDED.primary_joints,
    is_active = true,
    updated_at = now();

INSERT INTO exercise_library (name, category, movement_patterns, bilateral_unilateral, posterior_anterior, complexity, equipment, primary_muscle, supporting_muscles, muscle_bias, joint_count_level, dynamic_isometric, movement_plane, primary_joints, is_active)
  VALUES ('DB Pullover (Incline Bench)', 'strength', '{"vertical_pull"}'::text[], 'bilateral', 'posterior', 2, '{"bench","dumbbell"}'::text[], 'Latissimus dorsi', '{"Pectoralis major","Serratus anterior"}'::text[], 'lengthened', 'regional', NULL, 'vertical', '{"Shoulder"}'::text[], true)
  ON CONFLICT (name) DO UPDATE SET
    category = EXCLUDED.category,
    movement_patterns = EXCLUDED.movement_patterns,
    bilateral_unilateral = EXCLUDED.bilateral_unilateral,
    posterior_anterior = EXCLUDED.posterior_anterior,
    complexity = EXCLUDED.complexity,
    equipment = EXCLUDED.equipment,
    primary_muscle = EXCLUDED.primary_muscle,
    supporting_muscles = EXCLUDED.supporting_muscles,
    muscle_bias = EXCLUDED.muscle_bias,
    joint_count_level = EXCLUDED.joint_count_level,
    dynamic_isometric = EXCLUDED.dynamic_isometric,
    movement_plane = EXCLUDED.movement_plane,
    primary_joints = EXCLUDED.primary_joints,
    is_active = true,
    updated_at = now();

INSERT INTO exercise_library (name, category, movement_patterns, bilateral_unilateral, posterior_anterior, complexity, equipment, primary_muscle, supporting_muscles, muscle_bias, joint_count_level, dynamic_isometric, movement_plane, primary_joints, is_active)
  VALUES ('Lean-Away Lateral Raise (Single-Arm DB)', 'strength', '{"vertical_push"}'::text[], 'unilateral', 'anterior', 2, '{"dumbbell"}'::text[], 'Lateral deltoid', '{"Supraspinatus","Upper trapezius"}'::text[], 'lengthened', 'local', NULL, 'vertical', '{"Shoulder"}'::text[], true)
  ON CONFLICT (name) DO UPDATE SET
    category = EXCLUDED.category,
    movement_patterns = EXCLUDED.movement_patterns,
    bilateral_unilateral = EXCLUDED.bilateral_unilateral,
    posterior_anterior = EXCLUDED.posterior_anterior,
    complexity = EXCLUDED.complexity,
    equipment = EXCLUDED.equipment,
    primary_muscle = EXCLUDED.primary_muscle,
    supporting_muscles = EXCLUDED.supporting_muscles,
    muscle_bias = EXCLUDED.muscle_bias,
    joint_count_level = EXCLUDED.joint_count_level,
    dynamic_isometric = EXCLUDED.dynamic_isometric,
    movement_plane = EXCLUDED.movement_plane,
    primary_joints = EXCLUDED.primary_joints,
    is_active = true,
    updated_at = now();

INSERT INTO exercise_library (name, category, movement_patterns, bilateral_unilateral, posterior_anterior, complexity, equipment, primary_muscle, supporting_muscles, muscle_bias, joint_count_level, dynamic_isometric, movement_plane, primary_joints, is_active)
  VALUES ('Lateral Raise (Dual DB; Standing)', 'strength', '{"vertical_push"}'::text[], 'bilateral', 'anterior', 1, '{"dumbbell"}'::text[], 'Lateral deltoid', '{"Supraspinatus","Upper trapezius"}'::text[], 'mid', 'local', NULL, 'vertical', '{"Shoulder"}'::text[], true)
  ON CONFLICT (name) DO UPDATE SET
    category = EXCLUDED.category,
    movement_patterns = EXCLUDED.movement_patterns,
    bilateral_unilateral = EXCLUDED.bilateral_unilateral,
    posterior_anterior = EXCLUDED.posterior_anterior,
    complexity = EXCLUDED.complexity,
    equipment = EXCLUDED.equipment,
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
