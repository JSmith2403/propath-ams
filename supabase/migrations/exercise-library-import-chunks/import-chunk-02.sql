-- Brief 5c exercise library import — chunk 2/5
-- Source: exercise-library-import-2026-04-30.sql
-- Inserts 185-368 of 918.
-- Idempotent: every row uses ON CONFLICT (name) DO UPDATE.

BEGIN;

INSERT INTO exercise_library (name, category, movement_patterns, bilateral_unilateral, posterior_anterior, complexity, equipment, primary_muscle, supporting_muscles, muscle_bias, joint_count_level, dynamic_isometric, movement_plane, primary_joints, is_active)
  VALUES ('Weighted Pull-up (wide pronated)', 'strength', '{"vertical_pull"}'::text[], 'bilateral', 'posterior', 3, '{"bodyweight"}'::text[], 'Latissimus dorsi', '{"Teres major","Lower trapezius","Rhomboids","Posterior deltoid","Brachialis","Forearm flexors"}'::text[], 'lengthened', 'regional', NULL, 'vertical', '{"Shoulder","Elbow"}'::text[], true)
  ON CONFLICT (name) DO UPDATE SET
    category = EXCLUDED.category,
    movement_patterns = EXCLUDED.movement_patterns,
    bilateral_unilateral = EXCLUDED.bilateral_unilateral,
    posterior_anterior = EXCLUDED.posterior_anterior,
    complexity = EXCLUDED.complexity,
    equipment = EXCLUDED.equipment,
    primary_muscle = EXCLUDED.primary_muscle,
    supporting_muscles = EXCLUDED.supporting_muscles,
    muscle_bias = EXCLUDED.muscle_bias,
    joint_count_level = EXCLUDED.joint_count_level,
    dynamic_isometric = EXCLUDED.dynamic_isometric,
    movement_plane = EXCLUDED.movement_plane,
    primary_joints = EXCLUDED.primary_joints,
    is_active = true,
    updated_at = now();

INSERT INTO exercise_library (name, category, movement_patterns, bilateral_unilateral, posterior_anterior, complexity, equipment, primary_muscle, supporting_muscles, muscle_bias, joint_count_level, dynamic_isometric, movement_plane, primary_joints, is_active)
  VALUES ('Pull-up (semi-pronated)', 'strength', '{"vertical_pull"}'::text[], 'bilateral', 'posterior', 3, '{"bodyweight"}'::text[], 'Latissimus dorsi', '{"Biceps brachii","Brachialis","Lower trapezius","Rhomboids","Posterior deltoid","Forearm flexors"}'::text[], 'lengthened', 'regional', NULL, 'vertical', '{"Shoulder","Elbow"}'::text[], true)
  ON CONFLICT (name) DO UPDATE SET
    category = EXCLUDED.category,
    movement_patterns = EXCLUDED.movement_patterns,
    bilateral_unilateral = EXCLUDED.bilateral_unilateral,
    posterior_anterior = EXCLUDED.posterior_anterior,
    complexity = EXCLUDED.complexity,
    equipment = EXCLUDED.equipment,
    primary_muscle = EXCLUDED.primary_muscle,
    supporting_muscles = EXCLUDED.supporting_muscles,
    muscle_bias = EXCLUDED.muscle_bias,
    joint_count_level = EXCLUDED.joint_count_level,
    dynamic_isometric = EXCLUDED.dynamic_isometric,
    movement_plane = EXCLUDED.movement_plane,
    primary_joints = EXCLUDED.primary_joints,
    is_active = true,
    updated_at = now();

INSERT INTO exercise_library (name, category, movement_patterns, bilateral_unilateral, posterior_anterior, complexity, equipment, primary_muscle, supporting_muscles, muscle_bias, joint_count_level, dynamic_isometric, movement_plane, primary_joints, is_active)
  VALUES ('Weighted Pull-up (semi-pronated)', 'strength', '{"vertical_pull"}'::text[], 'bilateral', 'posterior', 3, '{"bodyweight"}'::text[], 'Latissimus dorsi', '{"Biceps brachii","Brachialis","Lower trapezius","Rhomboids","Posterior deltoid","Forearm flexors"}'::text[], 'lengthened', 'regional', NULL, 'vertical', '{"Shoulder","Elbow"}'::text[], true)
  ON CONFLICT (name) DO UPDATE SET
    category = EXCLUDED.category,
    movement_patterns = EXCLUDED.movement_patterns,
    bilateral_unilateral = EXCLUDED.bilateral_unilateral,
    posterior_anterior = EXCLUDED.posterior_anterior,
    complexity = EXCLUDED.complexity,
    equipment = EXCLUDED.equipment,
    primary_muscle = EXCLUDED.primary_muscle,
    supporting_muscles = EXCLUDED.supporting_muscles,
    muscle_bias = EXCLUDED.muscle_bias,
    joint_count_level = EXCLUDED.joint_count_level,
    dynamic_isometric = EXCLUDED.dynamic_isometric,
    movement_plane = EXCLUDED.movement_plane,
    primary_joints = EXCLUDED.primary_joints,
    is_active = true,
    updated_at = now();

INSERT INTO exercise_library (name, category, movement_patterns, bilateral_unilateral, posterior_anterior, complexity, equipment, primary_muscle, supporting_muscles, muscle_bias, joint_count_level, dynamic_isometric, movement_plane, primary_joints, is_active)
  VALUES ('Pull-up (neutral)', 'strength', '{"vertical_pull"}'::text[], 'bilateral', 'posterior', 2, '{"bodyweight"}'::text[], 'Latissimus dorsi', '{"Biceps brachii","Brachialis","Lower trapezius","Rhomboids","Posterior deltoid","Forearm flexors"}'::text[], 'lengthened', 'regional', NULL, 'vertical', '{"Shoulder","Elbow"}'::text[], true)
  ON CONFLICT (name) DO UPDATE SET
    category = EXCLUDED.category,
    movement_patterns = EXCLUDED.movement_patterns,
    bilateral_unilateral = EXCLUDED.bilateral_unilateral,
    posterior_anterior = EXCLUDED.posterior_anterior,
    complexity = EXCLUDED.complexity,
    equipment = EXCLUDED.equipment,
    primary_muscle = EXCLUDED.primary_muscle,
    supporting_muscles = EXCLUDED.supporting_muscles,
    muscle_bias = EXCLUDED.muscle_bias,
    joint_count_level = EXCLUDED.joint_count_level,
    dynamic_isometric = EXCLUDED.dynamic_isometric,
    movement_plane = EXCLUDED.movement_plane,
    primary_joints = EXCLUDED.primary_joints,
    is_active = true,
    updated_at = now();

INSERT INTO exercise_library (name, category, movement_patterns, bilateral_unilateral, posterior_anterior, complexity, equipment, primary_muscle, supporting_muscles, muscle_bias, joint_count_level, dynamic_isometric, movement_plane, primary_joints, is_active)
  VALUES ('Weighted Pull-up (neutral)', 'strength', '{"vertical_pull"}'::text[], 'bilateral', 'posterior', 3, '{"bodyweight"}'::text[], 'Latissimus dorsi', '{"Biceps brachii","Brachialis","Lower trapezius","Rhomboids","Posterior deltoid","Forearm flexors"}'::text[], 'lengthened', 'regional', NULL, 'vertical', '{"Shoulder","Elbow"}'::text[], true)
  ON CONFLICT (name) DO UPDATE SET
    category = EXCLUDED.category,
    movement_patterns = EXCLUDED.movement_patterns,
    bilateral_unilateral = EXCLUDED.bilateral_unilateral,
    posterior_anterior = EXCLUDED.posterior_anterior,
    complexity = EXCLUDED.complexity,
    equipment = EXCLUDED.equipment,
    primary_muscle = EXCLUDED.primary_muscle,
    supporting_muscles = EXCLUDED.supporting_muscles,
    muscle_bias = EXCLUDED.muscle_bias,
    joint_count_level = EXCLUDED.joint_count_level,
    dynamic_isometric = EXCLUDED.dynamic_isometric,
    movement_plane = EXCLUDED.movement_plane,
    primary_joints = EXCLUDED.primary_joints,
    is_active = true,
    updated_at = now();

INSERT INTO exercise_library (name, category, movement_patterns, bilateral_unilateral, posterior_anterior, complexity, equipment, primary_muscle, supporting_muscles, muscle_bias, joint_count_level, dynamic_isometric, movement_plane, primary_joints, is_active)
  VALUES ('Pull-up (wide neutral)', 'strength', '{"vertical_pull"}'::text[], 'bilateral', 'posterior', 3, '{"bodyweight"}'::text[], 'Latissimus dorsi', '{"Teres major","Lower trapezius","Rhomboids","Posterior deltoid","Forearm flexors"}'::text[], 'lengthened', 'regional', NULL, 'vertical', '{"Shoulder","Elbow"}'::text[], true)
  ON CONFLICT (name) DO UPDATE SET
    category = EXCLUDED.category,
    movement_patterns = EXCLUDED.movement_patterns,
    bilateral_unilateral = EXCLUDED.bilateral_unilateral,
    posterior_anterior = EXCLUDED.posterior_anterior,
    complexity = EXCLUDED.complexity,
    equipment = EXCLUDED.equipment,
    primary_muscle = EXCLUDED.primary_muscle,
    supporting_muscles = EXCLUDED.supporting_muscles,
    muscle_bias = EXCLUDED.muscle_bias,
    joint_count_level = EXCLUDED.joint_count_level,
    dynamic_isometric = EXCLUDED.dynamic_isometric,
    movement_plane = EXCLUDED.movement_plane,
    primary_joints = EXCLUDED.primary_joints,
    is_active = true,
    updated_at = now();

INSERT INTO exercise_library (name, category, movement_patterns, bilateral_unilateral, posterior_anterior, complexity, equipment, primary_muscle, supporting_muscles, muscle_bias, joint_count_level, dynamic_isometric, movement_plane, primary_joints, is_active)
  VALUES ('Weighted Pull-up (wide neutral)', 'strength', '{"vertical_pull"}'::text[], 'bilateral', 'posterior', 3, '{"bodyweight"}'::text[], 'Latissimus dorsi', '{"Teres major","Lower trapezius","Rhomboids","Posterior deltoid","Forearm flexors"}'::text[], 'lengthened', 'regional', NULL, 'vertical', '{"Shoulder","Elbow"}'::text[], true)
  ON CONFLICT (name) DO UPDATE SET
    category = EXCLUDED.category,
    movement_patterns = EXCLUDED.movement_patterns,
    bilateral_unilateral = EXCLUDED.bilateral_unilateral,
    posterior_anterior = EXCLUDED.posterior_anterior,
    complexity = EXCLUDED.complexity,
    equipment = EXCLUDED.equipment,
    primary_muscle = EXCLUDED.primary_muscle,
    supporting_muscles = EXCLUDED.supporting_muscles,
    muscle_bias = EXCLUDED.muscle_bias,
    joint_count_level = EXCLUDED.joint_count_level,
    dynamic_isometric = EXCLUDED.dynamic_isometric,
    movement_plane = EXCLUDED.movement_plane,
    primary_joints = EXCLUDED.primary_joints,
    is_active = true,
    updated_at = now();

INSERT INTO exercise_library (name, category, movement_patterns, bilateral_unilateral, posterior_anterior, complexity, equipment, primary_muscle, supporting_muscles, muscle_bias, joint_count_level, dynamic_isometric, movement_plane, primary_joints, is_active)
  VALUES ('Pull-up (supinated)', 'strength', '{"vertical_pull"}'::text[], 'bilateral', 'posterior', 2, '{"bodyweight"}'::text[], 'Latissimus dorsi', '{"Biceps brachii","Brachialis","Rhomboids","Lower trapezius","Posterior deltoid","Forearm flexors"}'::text[], 'lengthened', 'regional', NULL, 'vertical', '{"Shoulder","Elbow"}'::text[], true)
  ON CONFLICT (name) DO UPDATE SET
    category = EXCLUDED.category,
    movement_patterns = EXCLUDED.movement_patterns,
    bilateral_unilateral = EXCLUDED.bilateral_unilateral,
    posterior_anterior = EXCLUDED.posterior_anterior,
    complexity = EXCLUDED.complexity,
    equipment = EXCLUDED.equipment,
    primary_muscle = EXCLUDED.primary_muscle,
    supporting_muscles = EXCLUDED.supporting_muscles,
    muscle_bias = EXCLUDED.muscle_bias,
    joint_count_level = EXCLUDED.joint_count_level,
    dynamic_isometric = EXCLUDED.dynamic_isometric,
    movement_plane = EXCLUDED.movement_plane,
    primary_joints = EXCLUDED.primary_joints,
    is_active = true,
    updated_at = now();

INSERT INTO exercise_library (name, category, movement_patterns, bilateral_unilateral, posterior_anterior, complexity, equipment, primary_muscle, supporting_muscles, muscle_bias, joint_count_level, dynamic_isometric, movement_plane, primary_joints, is_active)
  VALUES ('Weighted Pull-up (supinated)', 'strength', '{"vertical_pull"}'::text[], 'bilateral', 'posterior', 3, '{"bodyweight"}'::text[], 'Latissimus dorsi', '{"Biceps brachii","Brachialis","Rhomboids","Lower trapezius","Posterior deltoid","Forearm flexors"}'::text[], 'lengthened', 'regional', NULL, 'vertical', '{"Shoulder","Elbow"}'::text[], true)
  ON CONFLICT (name) DO UPDATE SET
    category = EXCLUDED.category,
    movement_patterns = EXCLUDED.movement_patterns,
    bilateral_unilateral = EXCLUDED.bilateral_unilateral,
    posterior_anterior = EXCLUDED.posterior_anterior,
    complexity = EXCLUDED.complexity,
    equipment = EXCLUDED.equipment,
    primary_muscle = EXCLUDED.primary_muscle,
    supporting_muscles = EXCLUDED.supporting_muscles,
    muscle_bias = EXCLUDED.muscle_bias,
    joint_count_level = EXCLUDED.joint_count_level,
    dynamic_isometric = EXCLUDED.dynamic_isometric,
    movement_plane = EXCLUDED.movement_plane,
    primary_joints = EXCLUDED.primary_joints,
    is_active = true,
    updated_at = now();

INSERT INTO exercise_library (name, category, movement_patterns, bilateral_unilateral, posterior_anterior, complexity, equipment, primary_muscle, supporting_muscles, muscle_bias, joint_count_level, dynamic_isometric, movement_plane, primary_joints, is_active)
  VALUES ('Pull-up (semi-supinated)', 'strength', '{"vertical_pull"}'::text[], 'bilateral', 'posterior', 3, '{"bodyweight"}'::text[], 'Latissimus dorsi', '{"Biceps brachii","Brachialis","Rhomboids","Lower trapezius","Posterior deltoid","Forearm flexors"}'::text[], 'lengthened', 'regional', NULL, 'vertical', '{"Shoulder","Elbow"}'::text[], true)
  ON CONFLICT (name) DO UPDATE SET
    category = EXCLUDED.category,
    movement_patterns = EXCLUDED.movement_patterns,
    bilateral_unilateral = EXCLUDED.bilateral_unilateral,
    posterior_anterior = EXCLUDED.posterior_anterior,
    complexity = EXCLUDED.complexity,
    equipment = EXCLUDED.equipment,
    primary_muscle = EXCLUDED.primary_muscle,
    supporting_muscles = EXCLUDED.supporting_muscles,
    muscle_bias = EXCLUDED.muscle_bias,
    joint_count_level = EXCLUDED.joint_count_level,
    dynamic_isometric = EXCLUDED.dynamic_isometric,
    movement_plane = EXCLUDED.movement_plane,
    primary_joints = EXCLUDED.primary_joints,
    is_active = true,
    updated_at = now();

INSERT INTO exercise_library (name, category, movement_patterns, bilateral_unilateral, posterior_anterior, complexity, equipment, primary_muscle, supporting_muscles, muscle_bias, joint_count_level, dynamic_isometric, movement_plane, primary_joints, is_active)
  VALUES ('Weighted Pull-up (semi-supinated)', 'strength', '{"vertical_pull"}'::text[], 'bilateral', 'posterior', 3, '{"bodyweight"}'::text[], 'Latissimus dorsi', '{"Biceps brachii","Brachialis","Rhomboids","Lower trapezius","Posterior deltoid","Forearm flexors"}'::text[], 'lengthened', 'regional', NULL, 'vertical', '{"Shoulder","Elbow"}'::text[], true)
  ON CONFLICT (name) DO UPDATE SET
    category = EXCLUDED.category,
    movement_patterns = EXCLUDED.movement_patterns,
    bilateral_unilateral = EXCLUDED.bilateral_unilateral,
    posterior_anterior = EXCLUDED.posterior_anterior,
    complexity = EXCLUDED.complexity,
    equipment = EXCLUDED.equipment,
    primary_muscle = EXCLUDED.primary_muscle,
    supporting_muscles = EXCLUDED.supporting_muscles,
    muscle_bias = EXCLUDED.muscle_bias,
    joint_count_level = EXCLUDED.joint_count_level,
    dynamic_isometric = EXCLUDED.dynamic_isometric,
    movement_plane = EXCLUDED.movement_plane,
    primary_joints = EXCLUDED.primary_joints,
    is_active = true,
    updated_at = now();

INSERT INTO exercise_library (name, category, movement_patterns, bilateral_unilateral, posterior_anterior, complexity, equipment, primary_muscle, supporting_muscles, muscle_bias, joint_count_level, dynamic_isometric, movement_plane, primary_joints, is_active)
  VALUES ('Archer Pull-up', 'strength', '{"vertical_pull"}'::text[], 'unilateral', 'posterior', 3, '{"bodyweight"}'::text[], 'Latissimus dorsi', '{"Biceps brachii","Rhomboids","Lower trapezius","Posterior deltoid","Forearm flexors","Core stabilizers"}'::text[], 'lengthened', 'regional', NULL, 'vertical', '{"Shoulder","Elbow"}'::text[], true)
  ON CONFLICT (name) DO UPDATE SET
    category = EXCLUDED.category,
    movement_patterns = EXCLUDED.movement_patterns,
    bilateral_unilateral = EXCLUDED.bilateral_unilateral,
    posterior_anterior = EXCLUDED.posterior_anterior,
    complexity = EXCLUDED.complexity,
    equipment = EXCLUDED.equipment,
    primary_muscle = EXCLUDED.primary_muscle,
    supporting_muscles = EXCLUDED.supporting_muscles,
    muscle_bias = EXCLUDED.muscle_bias,
    joint_count_level = EXCLUDED.joint_count_level,
    dynamic_isometric = EXCLUDED.dynamic_isometric,
    movement_plane = EXCLUDED.movement_plane,
    primary_joints = EXCLUDED.primary_joints,
    is_active = true,
    updated_at = now();

INSERT INTO exercise_library (name, category, movement_patterns, bilateral_unilateral, posterior_anterior, complexity, equipment, primary_muscle, supporting_muscles, muscle_bias, joint_count_level, dynamic_isometric, movement_plane, primary_joints, is_active)
  VALUES ('Weighted Archer Pull-up', 'strength', '{"vertical_pull"}'::text[], 'unilateral', 'posterior', 3, '{"bodyweight"}'::text[], 'Latissimus dorsi', '{"Biceps brachii","Rhomboids","Lower trapezius","Posterior deltoid","Forearm flexors","Core stabilizers"}'::text[], 'lengthened', 'regional', NULL, 'vertical', '{"Shoulder","Elbow"}'::text[], true)
  ON CONFLICT (name) DO UPDATE SET
    category = EXCLUDED.category,
    movement_patterns = EXCLUDED.movement_patterns,
    bilateral_unilateral = EXCLUDED.bilateral_unilateral,
    posterior_anterior = EXCLUDED.posterior_anterior,
    complexity = EXCLUDED.complexity,
    equipment = EXCLUDED.equipment,
    primary_muscle = EXCLUDED.primary_muscle,
    supporting_muscles = EXCLUDED.supporting_muscles,
    muscle_bias = EXCLUDED.muscle_bias,
    joint_count_level = EXCLUDED.joint_count_level,
    dynamic_isometric = EXCLUDED.dynamic_isometric,
    movement_plane = EXCLUDED.movement_plane,
    primary_joints = EXCLUDED.primary_joints,
    is_active = true,
    updated_at = now();

INSERT INTO exercise_library (name, category, movement_patterns, bilateral_unilateral, posterior_anterior, complexity, equipment, primary_muscle, supporting_muscles, muscle_bias, joint_count_level, dynamic_isometric, movement_plane, primary_joints, is_active)
  VALUES ('Rope Pull-up', 'strength', '{"vertical_pull"}'::text[], 'bilateral', 'posterior', 3, '{"bodyweight"}'::text[], 'Latissimus dorsi', '{"Forearm flexors","Biceps brachii","Brachialis","Rhomboids","Lower trapezius"}'::text[], 'lengthened', 'regional', NULL, 'vertical', '{"Shoulder","Elbow"}'::text[], true)
  ON CONFLICT (name) DO UPDATE SET
    category = EXCLUDED.category,
    movement_patterns = EXCLUDED.movement_patterns,
    bilateral_unilateral = EXCLUDED.bilateral_unilateral,
    posterior_anterior = EXCLUDED.posterior_anterior,
    complexity = EXCLUDED.complexity,
    equipment = EXCLUDED.equipment,
    primary_muscle = EXCLUDED.primary_muscle,
    supporting_muscles = EXCLUDED.supporting_muscles,
    muscle_bias = EXCLUDED.muscle_bias,
    joint_count_level = EXCLUDED.joint_count_level,
    dynamic_isometric = EXCLUDED.dynamic_isometric,
    movement_plane = EXCLUDED.movement_plane,
    primary_joints = EXCLUDED.primary_joints,
    is_active = true,
    updated_at = now();

INSERT INTO exercise_library (name, category, movement_patterns, bilateral_unilateral, posterior_anterior, complexity, equipment, primary_muscle, supporting_muscles, muscle_bias, joint_count_level, dynamic_isometric, movement_plane, primary_joints, is_active)
  VALUES ('Weighted Rope Pull-up', 'strength', '{"vertical_pull"}'::text[], 'bilateral', 'posterior', 3, '{"bodyweight"}'::text[], 'Latissimus dorsi', '{"Forearm flexors","Biceps brachii","Brachialis","Rhomboids","Lower trapezius"}'::text[], 'lengthened', 'regional', NULL, 'vertical', '{"Shoulder","Elbow"}'::text[], true)
  ON CONFLICT (name) DO UPDATE SET
    category = EXCLUDED.category,
    movement_patterns = EXCLUDED.movement_patterns,
    bilateral_unilateral = EXCLUDED.bilateral_unilateral,
    posterior_anterior = EXCLUDED.posterior_anterior,
    complexity = EXCLUDED.complexity,
    equipment = EXCLUDED.equipment,
    primary_muscle = EXCLUDED.primary_muscle,
    supporting_muscles = EXCLUDED.supporting_muscles,
    muscle_bias = EXCLUDED.muscle_bias,
    joint_count_level = EXCLUDED.joint_count_level,
    dynamic_isometric = EXCLUDED.dynamic_isometric,
    movement_plane = EXCLUDED.movement_plane,
    primary_joints = EXCLUDED.primary_joints,
    is_active = true,
    updated_at = now();

INSERT INTO exercise_library (name, category, movement_patterns, bilateral_unilateral, posterior_anterior, complexity, equipment, primary_muscle, supporting_muscles, muscle_bias, joint_count_level, dynamic_isometric, movement_plane, primary_joints, is_active)
  VALUES ('Rope Climb', 'strength', '{"vertical_pull"}'::text[], 'bilateral', 'posterior', 3, '{"bodyweight"}'::text[], 'Latissimus dorsi', '{"Forearm flexors","Biceps brachii","Rhomboids","Trapezius","Core","Hip flexors"}'::text[], 'lengthened', 'global', NULL, 'vertical', '{"Shoulder","Elbow"}'::text[], true)
  ON CONFLICT (name) DO UPDATE SET
    category = EXCLUDED.category,
    movement_patterns = EXCLUDED.movement_patterns,
    bilateral_unilateral = EXCLUDED.bilateral_unilateral,
    posterior_anterior = EXCLUDED.posterior_anterior,
    complexity = EXCLUDED.complexity,
    equipment = EXCLUDED.equipment,
    primary_muscle = EXCLUDED.primary_muscle,
    supporting_muscles = EXCLUDED.supporting_muscles,
    muscle_bias = EXCLUDED.muscle_bias,
    joint_count_level = EXCLUDED.joint_count_level,
    dynamic_isometric = EXCLUDED.dynamic_isometric,
    movement_plane = EXCLUDED.movement_plane,
    primary_joints = EXCLUDED.primary_joints,
    is_active = true,
    updated_at = now();

INSERT INTO exercise_library (name, category, movement_patterns, bilateral_unilateral, posterior_anterior, complexity, equipment, primary_muscle, supporting_muscles, muscle_bias, joint_count_level, dynamic_isometric, movement_plane, primary_joints, is_active)
  VALUES ('Single Arm Rope Pull-up', 'strength', '{"vertical_pull"}'::text[], 'unilateral', 'posterior', 3, '{"bodyweight"}'::text[], 'Latissimus dorsi', '{"Forearm flexors","Biceps brachii","Rhomboids","Trapezius","Core stabilizers"}'::text[], 'lengthened', 'regional', NULL, 'vertical', '{"Shoulder","Elbow"}'::text[], true)
  ON CONFLICT (name) DO UPDATE SET
    category = EXCLUDED.category,
    movement_patterns = EXCLUDED.movement_patterns,
    bilateral_unilateral = EXCLUDED.bilateral_unilateral,
    posterior_anterior = EXCLUDED.posterior_anterior,
    complexity = EXCLUDED.complexity,
    equipment = EXCLUDED.equipment,
    primary_muscle = EXCLUDED.primary_muscle,
    supporting_muscles = EXCLUDED.supporting_muscles,
    muscle_bias = EXCLUDED.muscle_bias,
    joint_count_level = EXCLUDED.joint_count_level,
    dynamic_isometric = EXCLUDED.dynamic_isometric,
    movement_plane = EXCLUDED.movement_plane,
    primary_joints = EXCLUDED.primary_joints,
    is_active = true,
    updated_at = now();

INSERT INTO exercise_library (name, category, movement_patterns, bilateral_unilateral, posterior_anterior, complexity, equipment, primary_muscle, supporting_muscles, muscle_bias, joint_count_level, dynamic_isometric, movement_plane, primary_joints, is_active)
  VALUES ('Ring Pull-up (pronated)', 'strength', '{"vertical_pull"}'::text[], 'bilateral', 'posterior', 3, '{"suspension_trainer"}'::text[], 'Latissimus dorsi', '{"Biceps brachii","Brachialis","Rhomboids","Lower trapezius","Forearm flexors"}'::text[], 'lengthened', 'regional', NULL, 'vertical', '{"Shoulder","Elbow"}'::text[], true)
  ON CONFLICT (name) DO UPDATE SET
    category = EXCLUDED.category,
    movement_patterns = EXCLUDED.movement_patterns,
    bilateral_unilateral = EXCLUDED.bilateral_unilateral,
    posterior_anterior = EXCLUDED.posterior_anterior,
    complexity = EXCLUDED.complexity,
    equipment = EXCLUDED.equipment,
    primary_muscle = EXCLUDED.primary_muscle,
    supporting_muscles = EXCLUDED.supporting_muscles,
    muscle_bias = EXCLUDED.muscle_bias,
    joint_count_level = EXCLUDED.joint_count_level,
    dynamic_isometric = EXCLUDED.dynamic_isometric,
    movement_plane = EXCLUDED.movement_plane,
    primary_joints = EXCLUDED.primary_joints,
    is_active = true,
    updated_at = now();

INSERT INTO exercise_library (name, category, movement_patterns, bilateral_unilateral, posterior_anterior, complexity, equipment, primary_muscle, supporting_muscles, muscle_bias, joint_count_level, dynamic_isometric, movement_plane, primary_joints, is_active)
  VALUES ('Weighted Ring Pull-up (pronated)', 'strength', '{"vertical_pull"}'::text[], 'bilateral', 'posterior', 3, '{"suspension_trainer"}'::text[], 'Latissimus dorsi', '{"Biceps brachii","Brachialis","Rhomboids","Lower trapezius","Forearm flexors"}'::text[], 'lengthened', 'regional', NULL, 'vertical', '{"Shoulder","Elbow"}'::text[], true)
  ON CONFLICT (name) DO UPDATE SET
    category = EXCLUDED.category,
    movement_patterns = EXCLUDED.movement_patterns,
    bilateral_unilateral = EXCLUDED.bilateral_unilateral,
    posterior_anterior = EXCLUDED.posterior_anterior,
    complexity = EXCLUDED.complexity,
    equipment = EXCLUDED.equipment,
    primary_muscle = EXCLUDED.primary_muscle,
    supporting_muscles = EXCLUDED.supporting_muscles,
    muscle_bias = EXCLUDED.muscle_bias,
    joint_count_level = EXCLUDED.joint_count_level,
    dynamic_isometric = EXCLUDED.dynamic_isometric,
    movement_plane = EXCLUDED.movement_plane,
    primary_joints = EXCLUDED.primary_joints,
    is_active = true,
    updated_at = now();

INSERT INTO exercise_library (name, category, movement_patterns, bilateral_unilateral, posterior_anterior, complexity, equipment, primary_muscle, supporting_muscles, muscle_bias, joint_count_level, dynamic_isometric, movement_plane, primary_joints, is_active)
  VALUES ('Ring Pull-up (neutral)', 'strength', '{"vertical_pull"}'::text[], 'bilateral', 'posterior', 3, '{"suspension_trainer"}'::text[], 'Latissimus dorsi', '{"Biceps brachii","Brachialis","Rhomboids","Lower trapezius","Forearm flexors"}'::text[], 'lengthened', 'regional', NULL, 'vertical', '{"Shoulder","Elbow"}'::text[], true)
  ON CONFLICT (name) DO UPDATE SET
    category = EXCLUDED.category,
    movement_patterns = EXCLUDED.movement_patterns,
    bilateral_unilateral = EXCLUDED.bilateral_unilateral,
    posterior_anterior = EXCLUDED.posterior_anterior,
    complexity = EXCLUDED.complexity,
    equipment = EXCLUDED.equipment,
    primary_muscle = EXCLUDED.primary_muscle,
    supporting_muscles = EXCLUDED.supporting_muscles,
    muscle_bias = EXCLUDED.muscle_bias,
    joint_count_level = EXCLUDED.joint_count_level,
    dynamic_isometric = EXCLUDED.dynamic_isometric,
    movement_plane = EXCLUDED.movement_plane,
    primary_joints = EXCLUDED.primary_joints,
    is_active = true,
    updated_at = now();

INSERT INTO exercise_library (name, category, movement_patterns, bilateral_unilateral, posterior_anterior, complexity, equipment, primary_muscle, supporting_muscles, muscle_bias, joint_count_level, dynamic_isometric, movement_plane, primary_joints, is_active)
  VALUES ('Weighted Ring Pull-up (neutral)', 'strength', '{"vertical_pull"}'::text[], 'bilateral', 'posterior', 3, '{"suspension_trainer"}'::text[], 'Latissimus dorsi', '{"Biceps brachii","Brachialis","Rhomboids","Lower trapezius","Forearm flexors"}'::text[], 'lengthened', 'regional', NULL, 'vertical', '{"Shoulder","Elbow"}'::text[], true)
  ON CONFLICT (name) DO UPDATE SET
    category = EXCLUDED.category,
    movement_patterns = EXCLUDED.movement_patterns,
    bilateral_unilateral = EXCLUDED.bilateral_unilateral,
    posterior_anterior = EXCLUDED.posterior_anterior,
    complexity = EXCLUDED.complexity,
    equipment = EXCLUDED.equipment,
    primary_muscle = EXCLUDED.primary_muscle,
    supporting_muscles = EXCLUDED.supporting_muscles,
    muscle_bias = EXCLUDED.muscle_bias,
    joint_count_level = EXCLUDED.joint_count_level,
    dynamic_isometric = EXCLUDED.dynamic_isometric,
    movement_plane = EXCLUDED.movement_plane,
    primary_joints = EXCLUDED.primary_joints,
    is_active = true,
    updated_at = now();

INSERT INTO exercise_library (name, category, movement_patterns, bilateral_unilateral, posterior_anterior, complexity, equipment, primary_muscle, supporting_muscles, muscle_bias, joint_count_level, dynamic_isometric, movement_plane, primary_joints, is_active)
  VALUES ('Ring Pull-up (supinated)', 'strength', '{"vertical_pull"}'::text[], 'bilateral', 'posterior', 3, '{"suspension_trainer"}'::text[], 'Latissimus dorsi', '{"Biceps brachii","Brachialis","Rhomboids","Lower trapezius","Forearm flexors"}'::text[], 'lengthened', 'regional', NULL, 'vertical', '{"Shoulder","Elbow"}'::text[], true)
  ON CONFLICT (name) DO UPDATE SET
    category = EXCLUDED.category,
    movement_patterns = EXCLUDED.movement_patterns,
    bilateral_unilateral = EXCLUDED.bilateral_unilateral,
    posterior_anterior = EXCLUDED.posterior_anterior,
    complexity = EXCLUDED.complexity,
    equipment = EXCLUDED.equipment,
    primary_muscle = EXCLUDED.primary_muscle,
    supporting_muscles = EXCLUDED.supporting_muscles,
    muscle_bias = EXCLUDED.muscle_bias,
    joint_count_level = EXCLUDED.joint_count_level,
    dynamic_isometric = EXCLUDED.dynamic_isometric,
    movement_plane = EXCLUDED.movement_plane,
    primary_joints = EXCLUDED.primary_joints,
    is_active = true,
    updated_at = now();

INSERT INTO exercise_library (name, category, movement_patterns, bilateral_unilateral, posterior_anterior, complexity, equipment, primary_muscle, supporting_muscles, muscle_bias, joint_count_level, dynamic_isometric, movement_plane, primary_joints, is_active)
  VALUES ('Weighted Ring Pull-up (supinated)', 'strength', '{"vertical_pull"}'::text[], 'bilateral', 'posterior', 3, '{"suspension_trainer"}'::text[], 'Latissimus dorsi', '{"Biceps brachii","Brachialis","Rhomboids","Lower trapezius","Forearm flexors"}'::text[], 'lengthened', 'regional', NULL, 'vertical', '{"Shoulder","Elbow"}'::text[], true)
  ON CONFLICT (name) DO UPDATE SET
    category = EXCLUDED.category,
    movement_patterns = EXCLUDED.movement_patterns,
    bilateral_unilateral = EXCLUDED.bilateral_unilateral,
    posterior_anterior = EXCLUDED.posterior_anterior,
    complexity = EXCLUDED.complexity,
    equipment = EXCLUDED.equipment,
    primary_muscle = EXCLUDED.primary_muscle,
    supporting_muscles = EXCLUDED.supporting_muscles,
    muscle_bias = EXCLUDED.muscle_bias,
    joint_count_level = EXCLUDED.joint_count_level,
    dynamic_isometric = EXCLUDED.dynamic_isometric,
    movement_plane = EXCLUDED.movement_plane,
    primary_joints = EXCLUDED.primary_joints,
    is_active = true,
    updated_at = now();

INSERT INTO exercise_library (name, category, movement_patterns, bilateral_unilateral, posterior_anterior, complexity, equipment, primary_muscle, supporting_muscles, muscle_bias, joint_count_level, dynamic_isometric, movement_plane, primary_joints, is_active)
  VALUES ('False Grip Ring Pull-up', 'strength', '{"vertical_pull"}'::text[], 'bilateral', 'posterior', 3, '{"suspension_trainer"}'::text[], 'Latissimus dorsi', '{"Forearm flexors","Biceps brachii","Rhomboids","Lower trapezius"}'::text[], 'lengthened', 'regional', NULL, 'vertical', '{"Shoulder","Elbow"}'::text[], true)
  ON CONFLICT (name) DO UPDATE SET
    category = EXCLUDED.category,
    movement_patterns = EXCLUDED.movement_patterns,
    bilateral_unilateral = EXCLUDED.bilateral_unilateral,
    posterior_anterior = EXCLUDED.posterior_anterior,
    complexity = EXCLUDED.complexity,
    equipment = EXCLUDED.equipment,
    primary_muscle = EXCLUDED.primary_muscle,
    supporting_muscles = EXCLUDED.supporting_muscles,
    muscle_bias = EXCLUDED.muscle_bias,
    joint_count_level = EXCLUDED.joint_count_level,
    dynamic_isometric = EXCLUDED.dynamic_isometric,
    movement_plane = EXCLUDED.movement_plane,
    primary_joints = EXCLUDED.primary_joints,
    is_active = true,
    updated_at = now();

INSERT INTO exercise_library (name, category, movement_patterns, bilateral_unilateral, posterior_anterior, complexity, equipment, primary_muscle, supporting_muscles, muscle_bias, joint_count_level, dynamic_isometric, movement_plane, primary_joints, is_active)
  VALUES ('Weighted False Grip Ring Pull-up', 'strength', '{"vertical_pull"}'::text[], 'bilateral', 'posterior', 3, '{"suspension_trainer"}'::text[], 'Latissimus dorsi', '{"Forearm flexors","Biceps brachii","Rhomboids","Lower trapezius"}'::text[], 'lengthened', 'regional', NULL, 'vertical', '{"Shoulder","Elbow"}'::text[], true)
  ON CONFLICT (name) DO UPDATE SET
    category = EXCLUDED.category,
    movement_patterns = EXCLUDED.movement_patterns,
    bilateral_unilateral = EXCLUDED.bilateral_unilateral,
    posterior_anterior = EXCLUDED.posterior_anterior,
    complexity = EXCLUDED.complexity,
    equipment = EXCLUDED.equipment,
    primary_muscle = EXCLUDED.primary_muscle,
    supporting_muscles = EXCLUDED.supporting_muscles,
    muscle_bias = EXCLUDED.muscle_bias,
    joint_count_level = EXCLUDED.joint_count_level,
    dynamic_isometric = EXCLUDED.dynamic_isometric,
    movement_plane = EXCLUDED.movement_plane,
    primary_joints = EXCLUDED.primary_joints,
    is_active = true,
    updated_at = now();

INSERT INTO exercise_library (name, category, movement_patterns, bilateral_unilateral, posterior_anterior, complexity, equipment, primary_muscle, supporting_muscles, muscle_bias, joint_count_level, dynamic_isometric, movement_plane, primary_joints, is_active)
  VALUES ('Assisted Pull-up (pronated) (machine)', 'strength', '{"vertical_pull"}'::text[], 'bilateral', 'posterior', 2, '{"fixed_machine"}'::text[], 'Latissimus dorsi', '{"Biceps brachii","Brachialis","Rhomboids","Lower trapezius","Posterior deltoid"}'::text[], 'lengthened', 'regional', NULL, 'vertical', '{"Shoulder","Elbow"}'::text[], true)
  ON CONFLICT (name) DO UPDATE SET
    category = EXCLUDED.category,
    movement_patterns = EXCLUDED.movement_patterns,
    bilateral_unilateral = EXCLUDED.bilateral_unilateral,
    posterior_anterior = EXCLUDED.posterior_anterior,
    complexity = EXCLUDED.complexity,
    equipment = EXCLUDED.equipment,
    primary_muscle = EXCLUDED.primary_muscle,
    supporting_muscles = EXCLUDED.supporting_muscles,
    muscle_bias = EXCLUDED.muscle_bias,
    joint_count_level = EXCLUDED.joint_count_level,
    dynamic_isometric = EXCLUDED.dynamic_isometric,
    movement_plane = EXCLUDED.movement_plane,
    primary_joints = EXCLUDED.primary_joints,
    is_active = true,
    updated_at = now();

INSERT INTO exercise_library (name, category, movement_patterns, bilateral_unilateral, posterior_anterior, complexity, equipment, primary_muscle, supporting_muscles, muscle_bias, joint_count_level, dynamic_isometric, movement_plane, primary_joints, is_active)
  VALUES ('Assisted Pull-up (neutral) (machine)', 'strength', '{"vertical_pull"}'::text[], 'bilateral', 'posterior', 2, '{"fixed_machine"}'::text[], 'Latissimus dorsi', '{"Biceps brachii","Brachialis","Rhomboids","Lower trapezius","Posterior deltoid"}'::text[], 'lengthened', 'regional', NULL, 'vertical', '{"Shoulder","Elbow"}'::text[], true)
  ON CONFLICT (name) DO UPDATE SET
    category = EXCLUDED.category,
    movement_patterns = EXCLUDED.movement_patterns,
    bilateral_unilateral = EXCLUDED.bilateral_unilateral,
    posterior_anterior = EXCLUDED.posterior_anterior,
    complexity = EXCLUDED.complexity,
    equipment = EXCLUDED.equipment,
    primary_muscle = EXCLUDED.primary_muscle,
    supporting_muscles = EXCLUDED.supporting_muscles,
    muscle_bias = EXCLUDED.muscle_bias,
    joint_count_level = EXCLUDED.joint_count_level,
    dynamic_isometric = EXCLUDED.dynamic_isometric,
    movement_plane = EXCLUDED.movement_plane,
    primary_joints = EXCLUDED.primary_joints,
    is_active = true,
    updated_at = now();

INSERT INTO exercise_library (name, category, movement_patterns, bilateral_unilateral, posterior_anterior, complexity, equipment, primary_muscle, supporting_muscles, muscle_bias, joint_count_level, dynamic_isometric, movement_plane, primary_joints, is_active)
  VALUES ('Assisted Pull-up (supinated) (machine)', 'strength', '{"vertical_pull"}'::text[], 'bilateral', 'posterior', 2, '{"fixed_machine"}'::text[], 'Latissimus dorsi', '{"Biceps brachii","Brachialis","Rhomboids","Lower trapezius","Posterior deltoid"}'::text[], 'lengthened', 'regional', NULL, 'vertical', '{"Shoulder","Elbow"}'::text[], true)
  ON CONFLICT (name) DO UPDATE SET
    category = EXCLUDED.category,
    movement_patterns = EXCLUDED.movement_patterns,
    bilateral_unilateral = EXCLUDED.bilateral_unilateral,
    posterior_anterior = EXCLUDED.posterior_anterior,
    complexity = EXCLUDED.complexity,
    equipment = EXCLUDED.equipment,
    primary_muscle = EXCLUDED.primary_muscle,
    supporting_muscles = EXCLUDED.supporting_muscles,
    muscle_bias = EXCLUDED.muscle_bias,
    joint_count_level = EXCLUDED.joint_count_level,
    dynamic_isometric = EXCLUDED.dynamic_isometric,
    movement_plane = EXCLUDED.movement_plane,
    primary_joints = EXCLUDED.primary_joints,
    is_active = true,
    updated_at = now();

INSERT INTO exercise_library (name, category, movement_patterns, bilateral_unilateral, posterior_anterior, complexity, equipment, primary_muscle, supporting_muscles, muscle_bias, joint_count_level, dynamic_isometric, movement_plane, primary_joints, is_active)
  VALUES ('Assisted Pull-up (band)', 'strength', '{"vertical_pull"}'::text[], 'bilateral', 'posterior', 2, '{"bodyweight"}'::text[], 'Latissimus dorsi', '{"Biceps brachii","Brachialis","Rhomboids","Lower trapezius","Posterior deltoid"}'::text[], 'lengthened', 'regional', NULL, 'vertical', '{"Shoulder","Elbow"}'::text[], true)
  ON CONFLICT (name) DO UPDATE SET
    category = EXCLUDED.category,
    movement_patterns = EXCLUDED.movement_patterns,
    bilateral_unilateral = EXCLUDED.bilateral_unilateral,
    posterior_anterior = EXCLUDED.posterior_anterior,
    complexity = EXCLUDED.complexity,
    equipment = EXCLUDED.equipment,
    primary_muscle = EXCLUDED.primary_muscle,
    supporting_muscles = EXCLUDED.supporting_muscles,
    muscle_bias = EXCLUDED.muscle_bias,
    joint_count_level = EXCLUDED.joint_count_level,
    dynamic_isometric = EXCLUDED.dynamic_isometric,
    movement_plane = EXCLUDED.movement_plane,
    primary_joints = EXCLUDED.primary_joints,
    is_active = true,
    updated_at = now();

INSERT INTO exercise_library (name, category, movement_patterns, bilateral_unilateral, posterior_anterior, complexity, equipment, primary_muscle, supporting_muscles, muscle_bias, joint_count_level, dynamic_isometric, movement_plane, primary_joints, is_active)
  VALUES ('Assisted Pull-up (supinated) (band)', 'strength', '{"vertical_pull"}'::text[], 'bilateral', 'posterior', 2, '{"bodyweight"}'::text[], 'Latissimus dorsi', '{"Biceps brachii","Brachialis","Rhomboids","Lower trapezius","Posterior deltoid"}'::text[], 'lengthened', 'regional', NULL, 'vertical', '{"Shoulder","Elbow"}'::text[], true)
  ON CONFLICT (name) DO UPDATE SET
    category = EXCLUDED.category,
    movement_patterns = EXCLUDED.movement_patterns,
    bilateral_unilateral = EXCLUDED.bilateral_unilateral,
    posterior_anterior = EXCLUDED.posterior_anterior,
    complexity = EXCLUDED.complexity,
    equipment = EXCLUDED.equipment,
    primary_muscle = EXCLUDED.primary_muscle,
    supporting_muscles = EXCLUDED.supporting_muscles,
    muscle_bias = EXCLUDED.muscle_bias,
    joint_count_level = EXCLUDED.joint_count_level,
    dynamic_isometric = EXCLUDED.dynamic_isometric,
    movement_plane = EXCLUDED.movement_plane,
    primary_joints = EXCLUDED.primary_joints,
    is_active = true,
    updated_at = now();

INSERT INTO exercise_library (name, category, movement_patterns, bilateral_unilateral, posterior_anterior, complexity, equipment, primary_muscle, supporting_muscles, muscle_bias, joint_count_level, dynamic_isometric, movement_plane, primary_joints, is_active)
  VALUES ('Eccentric Pull-up (pronated)', 'strength', '{"vertical_pull"}'::text[], 'bilateral', 'posterior', 2, '{"bodyweight"}'::text[], 'Latissimus dorsi', '{"Biceps brachii","Brachialis","Rhomboids","Lower trapezius","Posterior deltoid","Forearm flexors"}'::text[], 'lengthened', 'regional', NULL, 'vertical', '{"Shoulder","Elbow"}'::text[], true)
  ON CONFLICT (name) DO UPDATE SET
    category = EXCLUDED.category,
    movement_patterns = EXCLUDED.movement_patterns,
    bilateral_unilateral = EXCLUDED.bilateral_unilateral,
    posterior_anterior = EXCLUDED.posterior_anterior,
    complexity = EXCLUDED.complexity,
    equipment = EXCLUDED.equipment,
    primary_muscle = EXCLUDED.primary_muscle,
    supporting_muscles = EXCLUDED.supporting_muscles,
    muscle_bias = EXCLUDED.muscle_bias,
    joint_count_level = EXCLUDED.joint_count_level,
    dynamic_isometric = EXCLUDED.dynamic_isometric,
    movement_plane = EXCLUDED.movement_plane,
    primary_joints = EXCLUDED.primary_joints,
    is_active = true,
    updated_at = now();

INSERT INTO exercise_library (name, category, movement_patterns, bilateral_unilateral, posterior_anterior, complexity, equipment, primary_muscle, supporting_muscles, muscle_bias, joint_count_level, dynamic_isometric, movement_plane, primary_joints, is_active)
  VALUES ('Eccentric Pull-up (wide pronated)', 'strength', '{"vertical_pull"}'::text[], 'bilateral', 'posterior', 2, '{"bodyweight"}'::text[], 'Latissimus dorsi', '{"Teres major","Rhomboids","Lower trapezius","Posterior deltoid","Forearm flexors"}'::text[], 'lengthened', 'regional', NULL, 'vertical', '{"Shoulder","Elbow"}'::text[], true)
  ON CONFLICT (name) DO UPDATE SET
    category = EXCLUDED.category,
    movement_patterns = EXCLUDED.movement_patterns,
    bilateral_unilateral = EXCLUDED.bilateral_unilateral,
    posterior_anterior = EXCLUDED.posterior_anterior,
    complexity = EXCLUDED.complexity,
    equipment = EXCLUDED.equipment,
    primary_muscle = EXCLUDED.primary_muscle,
    supporting_muscles = EXCLUDED.supporting_muscles,
    muscle_bias = EXCLUDED.muscle_bias,
    joint_count_level = EXCLUDED.joint_count_level,
    dynamic_isometric = EXCLUDED.dynamic_isometric,
    movement_plane = EXCLUDED.movement_plane,
    primary_joints = EXCLUDED.primary_joints,
    is_active = true,
    updated_at = now();

INSERT INTO exercise_library (name, category, movement_patterns, bilateral_unilateral, posterior_anterior, complexity, equipment, primary_muscle, supporting_muscles, muscle_bias, joint_count_level, dynamic_isometric, movement_plane, primary_joints, is_active)
  VALUES ('Eccentric Pull-up (semi-pronated)', 'strength', '{"vertical_pull"}'::text[], 'bilateral', 'posterior', 2, '{"bodyweight"}'::text[], 'Latissimus dorsi', '{"Biceps brachii","Brachialis","Rhomboids","Lower trapezius","Posterior deltoid","Forearm flexors"}'::text[], 'lengthened', 'regional', NULL, 'vertical', '{"Shoulder","Elbow"}'::text[], true)
  ON CONFLICT (name) DO UPDATE SET
    category = EXCLUDED.category,
    movement_patterns = EXCLUDED.movement_patterns,
    bilateral_unilateral = EXCLUDED.bilateral_unilateral,
    posterior_anterior = EXCLUDED.posterior_anterior,
    complexity = EXCLUDED.complexity,
    equipment = EXCLUDED.equipment,
    primary_muscle = EXCLUDED.primary_muscle,
    supporting_muscles = EXCLUDED.supporting_muscles,
    muscle_bias = EXCLUDED.muscle_bias,
    joint_count_level = EXCLUDED.joint_count_level,
    dynamic_isometric = EXCLUDED.dynamic_isometric,
    movement_plane = EXCLUDED.movement_plane,
    primary_joints = EXCLUDED.primary_joints,
    is_active = true,
    updated_at = now();

INSERT INTO exercise_library (name, category, movement_patterns, bilateral_unilateral, posterior_anterior, complexity, equipment, primary_muscle, supporting_muscles, muscle_bias, joint_count_level, dynamic_isometric, movement_plane, primary_joints, is_active)
  VALUES ('Eccentric Pull-up (neutral)', 'strength', '{"vertical_pull"}'::text[], 'bilateral', 'posterior', 2, '{"bodyweight"}'::text[], 'Latissimus dorsi', '{"Biceps brachii","Brachialis","Rhomboids","Lower trapezius","Posterior deltoid","Forearm flexors"}'::text[], 'lengthened', 'regional', NULL, 'vertical', '{"Shoulder","Elbow"}'::text[], true)
  ON CONFLICT (name) DO UPDATE SET
    category = EXCLUDED.category,
    movement_patterns = EXCLUDED.movement_patterns,
    bilateral_unilateral = EXCLUDED.bilateral_unilateral,
    posterior_anterior = EXCLUDED.posterior_anterior,
    complexity = EXCLUDED.complexity,
    equipment = EXCLUDED.equipment,
    primary_muscle = EXCLUDED.primary_muscle,
    supporting_muscles = EXCLUDED.supporting_muscles,
    muscle_bias = EXCLUDED.muscle_bias,
    joint_count_level = EXCLUDED.joint_count_level,
    dynamic_isometric = EXCLUDED.dynamic_isometric,
    movement_plane = EXCLUDED.movement_plane,
    primary_joints = EXCLUDED.primary_joints,
    is_active = true,
    updated_at = now();

INSERT INTO exercise_library (name, category, movement_patterns, bilateral_unilateral, posterior_anterior, complexity, equipment, primary_muscle, supporting_muscles, muscle_bias, joint_count_level, dynamic_isometric, movement_plane, primary_joints, is_active)
  VALUES ('Eccentric Pull-up (wide neutral)', 'strength', '{"vertical_pull"}'::text[], 'bilateral', 'posterior', 2, '{"bodyweight"}'::text[], 'Latissimus dorsi', '{"Teres major","Rhomboids","Lower trapezius","Posterior deltoid","Forearm flexors"}'::text[], 'lengthened', 'regional', NULL, 'vertical', '{"Shoulder","Elbow"}'::text[], true)
  ON CONFLICT (name) DO UPDATE SET
    category = EXCLUDED.category,
    movement_patterns = EXCLUDED.movement_patterns,
    bilateral_unilateral = EXCLUDED.bilateral_unilateral,
    posterior_anterior = EXCLUDED.posterior_anterior,
    complexity = EXCLUDED.complexity,
    equipment = EXCLUDED.equipment,
    primary_muscle = EXCLUDED.primary_muscle,
    supporting_muscles = EXCLUDED.supporting_muscles,
    muscle_bias = EXCLUDED.muscle_bias,
    joint_count_level = EXCLUDED.joint_count_level,
    dynamic_isometric = EXCLUDED.dynamic_isometric,
    movement_plane = EXCLUDED.movement_plane,
    primary_joints = EXCLUDED.primary_joints,
    is_active = true,
    updated_at = now();

INSERT INTO exercise_library (name, category, movement_patterns, bilateral_unilateral, posterior_anterior, complexity, equipment, primary_muscle, supporting_muscles, muscle_bias, joint_count_level, dynamic_isometric, movement_plane, primary_joints, is_active)
  VALUES ('Eccentric Pull-up (supinated)', 'strength', '{"vertical_pull"}'::text[], 'bilateral', 'posterior', 2, '{"bodyweight"}'::text[], 'Latissimus dorsi', '{"Biceps brachii","Brachialis","Rhomboids","Lower trapezius","Posterior deltoid","Forearm flexors"}'::text[], 'lengthened', 'regional', NULL, 'vertical', '{"Shoulder","Elbow"}'::text[], true)
  ON CONFLICT (name) DO UPDATE SET
    category = EXCLUDED.category,
    movement_patterns = EXCLUDED.movement_patterns,
    bilateral_unilateral = EXCLUDED.bilateral_unilateral,
    posterior_anterior = EXCLUDED.posterior_anterior,
    complexity = EXCLUDED.complexity,
    equipment = EXCLUDED.equipment,
    primary_muscle = EXCLUDED.primary_muscle,
    supporting_muscles = EXCLUDED.supporting_muscles,
    muscle_bias = EXCLUDED.muscle_bias,
    joint_count_level = EXCLUDED.joint_count_level,
    dynamic_isometric = EXCLUDED.dynamic_isometric,
    movement_plane = EXCLUDED.movement_plane,
    primary_joints = EXCLUDED.primary_joints,
    is_active = true,
    updated_at = now();

INSERT INTO exercise_library (name, category, movement_patterns, bilateral_unilateral, posterior_anterior, complexity, equipment, primary_muscle, supporting_muscles, muscle_bias, joint_count_level, dynamic_isometric, movement_plane, primary_joints, is_active)
  VALUES ('Eccentric Pull-up (semi-supinated)', 'strength', '{"vertical_pull"}'::text[], 'bilateral', 'posterior', 2, '{"bodyweight"}'::text[], 'Latissimus dorsi', '{"Biceps brachii","Brachialis","Rhomboids","Lower trapezius","Posterior deltoid","Forearm flexors"}'::text[], 'lengthened', 'regional', NULL, 'vertical', '{"Shoulder","Elbow"}'::text[], true)
  ON CONFLICT (name) DO UPDATE SET
    category = EXCLUDED.category,
    movement_patterns = EXCLUDED.movement_patterns,
    bilateral_unilateral = EXCLUDED.bilateral_unilateral,
    posterior_anterior = EXCLUDED.posterior_anterior,
    complexity = EXCLUDED.complexity,
    equipment = EXCLUDED.equipment,
    primary_muscle = EXCLUDED.primary_muscle,
    supporting_muscles = EXCLUDED.supporting_muscles,
    muscle_bias = EXCLUDED.muscle_bias,
    joint_count_level = EXCLUDED.joint_count_level,
    dynamic_isometric = EXCLUDED.dynamic_isometric,
    movement_plane = EXCLUDED.movement_plane,
    primary_joints = EXCLUDED.primary_joints,
    is_active = true,
    updated_at = now();

INSERT INTO exercise_library (name, category, movement_patterns, bilateral_unilateral, posterior_anterior, complexity, equipment, primary_muscle, supporting_muscles, muscle_bias, joint_count_level, dynamic_isometric, movement_plane, primary_joints, is_active)
  VALUES ('Eccentric Pull-up (rings, pronated)', 'strength', '{"vertical_pull"}'::text[], 'bilateral', 'posterior', 2, '{"suspension_trainer"}'::text[], 'Latissimus dorsi', '{"Biceps brachii","Brachialis","Rhomboids","Lower trapezius","Forearm flexors"}'::text[], 'lengthened', 'regional', NULL, 'vertical', '{"Shoulder","Elbow"}'::text[], true)
  ON CONFLICT (name) DO UPDATE SET
    category = EXCLUDED.category,
    movement_patterns = EXCLUDED.movement_patterns,
    bilateral_unilateral = EXCLUDED.bilateral_unilateral,
    posterior_anterior = EXCLUDED.posterior_anterior,
    complexity = EXCLUDED.complexity,
    equipment = EXCLUDED.equipment,
    primary_muscle = EXCLUDED.primary_muscle,
    supporting_muscles = EXCLUDED.supporting_muscles,
    muscle_bias = EXCLUDED.muscle_bias,
    joint_count_level = EXCLUDED.joint_count_level,
    dynamic_isometric = EXCLUDED.dynamic_isometric,
    movement_plane = EXCLUDED.movement_plane,
    primary_joints = EXCLUDED.primary_joints,
    is_active = true,
    updated_at = now();

INSERT INTO exercise_library (name, category, movement_patterns, bilateral_unilateral, posterior_anterior, complexity, equipment, primary_muscle, supporting_muscles, muscle_bias, joint_count_level, dynamic_isometric, movement_plane, primary_joints, is_active)
  VALUES ('Eccentric Pull-up (rings, neutral)', 'strength', '{"vertical_pull"}'::text[], 'bilateral', 'posterior', 2, '{"suspension_trainer"}'::text[], 'Latissimus dorsi', '{"Biceps brachii","Brachialis","Rhomboids","Lower trapezius","Forearm flexors"}'::text[], 'lengthened', 'regional', NULL, 'vertical', '{"Shoulder","Elbow"}'::text[], true)
  ON CONFLICT (name) DO UPDATE SET
    category = EXCLUDED.category,
    movement_patterns = EXCLUDED.movement_patterns,
    bilateral_unilateral = EXCLUDED.bilateral_unilateral,
    posterior_anterior = EXCLUDED.posterior_anterior,
    complexity = EXCLUDED.complexity,
    equipment = EXCLUDED.equipment,
    primary_muscle = EXCLUDED.primary_muscle,
    supporting_muscles = EXCLUDED.supporting_muscles,
    muscle_bias = EXCLUDED.muscle_bias,
    joint_count_level = EXCLUDED.joint_count_level,
    dynamic_isometric = EXCLUDED.dynamic_isometric,
    movement_plane = EXCLUDED.movement_plane,
    primary_joints = EXCLUDED.primary_joints,
    is_active = true,
    updated_at = now();

INSERT INTO exercise_library (name, category, movement_patterns, bilateral_unilateral, posterior_anterior, complexity, equipment, primary_muscle, supporting_muscles, muscle_bias, joint_count_level, dynamic_isometric, movement_plane, primary_joints, is_active)
  VALUES ('Eccentric Pull-up (rings, supinated)', 'strength', '{"vertical_pull"}'::text[], 'bilateral', 'posterior', 2, '{"suspension_trainer"}'::text[], 'Latissimus dorsi', '{"Biceps brachii","Brachialis","Rhomboids","Lower trapezius","Forearm flexors"}'::text[], 'lengthened', 'regional', NULL, 'vertical', '{"Shoulder","Elbow"}'::text[], true)
  ON CONFLICT (name) DO UPDATE SET
    category = EXCLUDED.category,
    movement_patterns = EXCLUDED.movement_patterns,
    bilateral_unilateral = EXCLUDED.bilateral_unilateral,
    posterior_anterior = EXCLUDED.posterior_anterior,
    complexity = EXCLUDED.complexity,
    equipment = EXCLUDED.equipment,
    primary_muscle = EXCLUDED.primary_muscle,
    supporting_muscles = EXCLUDED.supporting_muscles,
    muscle_bias = EXCLUDED.muscle_bias,
    joint_count_level = EXCLUDED.joint_count_level,
    dynamic_isometric = EXCLUDED.dynamic_isometric,
    movement_plane = EXCLUDED.movement_plane,
    primary_joints = EXCLUDED.primary_joints,
    is_active = true,
    updated_at = now();

INSERT INTO exercise_library (name, category, movement_patterns, bilateral_unilateral, posterior_anterior, complexity, equipment, primary_muscle, supporting_muscles, muscle_bias, joint_count_level, dynamic_isometric, movement_plane, primary_joints, is_active)
  VALUES ('Eccentric False Grip Ring Pull-up', 'strength', '{"vertical_pull"}'::text[], 'bilateral', 'posterior', 2, '{"suspension_trainer"}'::text[], 'Latissimus dorsi', '{"Forearm flexors","Biceps brachii","Rhomboids","Lower trapezius"}'::text[], 'lengthened', 'regional', NULL, 'vertical', '{"Shoulder","Elbow"}'::text[], true)
  ON CONFLICT (name) DO UPDATE SET
    category = EXCLUDED.category,
    movement_patterns = EXCLUDED.movement_patterns,
    bilateral_unilateral = EXCLUDED.bilateral_unilateral,
    posterior_anterior = EXCLUDED.posterior_anterior,
    complexity = EXCLUDED.complexity,
    equipment = EXCLUDED.equipment,
    primary_muscle = EXCLUDED.primary_muscle,
    supporting_muscles = EXCLUDED.supporting_muscles,
    muscle_bias = EXCLUDED.muscle_bias,
    joint_count_level = EXCLUDED.joint_count_level,
    dynamic_isometric = EXCLUDED.dynamic_isometric,
    movement_plane = EXCLUDED.movement_plane,
    primary_joints = EXCLUDED.primary_joints,
    is_active = true,
    updated_at = now();

INSERT INTO exercise_library (name, category, movement_patterns, bilateral_unilateral, posterior_anterior, complexity, equipment, primary_muscle, supporting_muscles, muscle_bias, joint_count_level, dynamic_isometric, movement_plane, primary_joints, is_active)
  VALUES ('Seated Cable Lat Pulldown (pronated)', 'strength', '{"vertical_pull"}'::text[], 'bilateral', 'posterior', 1, '{"cable"}'::text[], 'Latissimus dorsi', '{"Biceps brachii","Brachialis","Rhomboids","Lower trapezius","Posterior deltoid"}'::text[], 'lengthened', 'regional', NULL, 'vertical', '{"Shoulder","Elbow"}'::text[], true)
  ON CONFLICT (name) DO UPDATE SET
    category = EXCLUDED.category,
    movement_patterns = EXCLUDED.movement_patterns,
    bilateral_unilateral = EXCLUDED.bilateral_unilateral,
    posterior_anterior = EXCLUDED.posterior_anterior,
    complexity = EXCLUDED.complexity,
    equipment = EXCLUDED.equipment,
    primary_muscle = EXCLUDED.primary_muscle,
    supporting_muscles = EXCLUDED.supporting_muscles,
    muscle_bias = EXCLUDED.muscle_bias,
    joint_count_level = EXCLUDED.joint_count_level,
    dynamic_isometric = EXCLUDED.dynamic_isometric,
    movement_plane = EXCLUDED.movement_plane,
    primary_joints = EXCLUDED.primary_joints,
    is_active = true,
    updated_at = now();

INSERT INTO exercise_library (name, category, movement_patterns, bilateral_unilateral, posterior_anterior, complexity, equipment, primary_muscle, supporting_muscles, muscle_bias, joint_count_level, dynamic_isometric, movement_plane, primary_joints, is_active)
  VALUES ('Seated Cable Lat Pulldown (wide pronated)', 'strength', '{"vertical_pull"}'::text[], 'bilateral', 'posterior', 1, '{"cable"}'::text[], 'Latissimus dorsi', '{"Teres major","Rhomboids","Lower trapezius","Posterior deltoid"}'::text[], 'lengthened', 'regional', NULL, 'vertical', '{"Shoulder","Elbow"}'::text[], true)
  ON CONFLICT (name) DO UPDATE SET
    category = EXCLUDED.category,
    movement_patterns = EXCLUDED.movement_patterns,
    bilateral_unilateral = EXCLUDED.bilateral_unilateral,
    posterior_anterior = EXCLUDED.posterior_anterior,
    complexity = EXCLUDED.complexity,
    equipment = EXCLUDED.equipment,
    primary_muscle = EXCLUDED.primary_muscle,
    supporting_muscles = EXCLUDED.supporting_muscles,
    muscle_bias = EXCLUDED.muscle_bias,
    joint_count_level = EXCLUDED.joint_count_level,
    dynamic_isometric = EXCLUDED.dynamic_isometric,
    movement_plane = EXCLUDED.movement_plane,
    primary_joints = EXCLUDED.primary_joints,
    is_active = true,
    updated_at = now();

INSERT INTO exercise_library (name, category, movement_patterns, bilateral_unilateral, posterior_anterior, complexity, equipment, primary_muscle, supporting_muscles, muscle_bias, joint_count_level, dynamic_isometric, movement_plane, primary_joints, is_active)
  VALUES ('Seated Cable Lat Pulldown (neutral)', 'strength', '{"vertical_pull"}'::text[], 'bilateral', 'posterior', 1, '{"cable"}'::text[], 'Latissimus dorsi', '{"Biceps brachii","Brachialis","Rhomboids","Lower trapezius","Posterior deltoid"}'::text[], 'lengthened', 'regional', NULL, 'vertical', '{"Shoulder","Elbow"}'::text[], true)
  ON CONFLICT (name) DO UPDATE SET
    category = EXCLUDED.category,
    movement_patterns = EXCLUDED.movement_patterns,
    bilateral_unilateral = EXCLUDED.bilateral_unilateral,
    posterior_anterior = EXCLUDED.posterior_anterior,
    complexity = EXCLUDED.complexity,
    equipment = EXCLUDED.equipment,
    primary_muscle = EXCLUDED.primary_muscle,
    supporting_muscles = EXCLUDED.supporting_muscles,
    muscle_bias = EXCLUDED.muscle_bias,
    joint_count_level = EXCLUDED.joint_count_level,
    dynamic_isometric = EXCLUDED.dynamic_isometric,
    movement_plane = EXCLUDED.movement_plane,
    primary_joints = EXCLUDED.primary_joints,
    is_active = true,
    updated_at = now();

INSERT INTO exercise_library (name, category, movement_patterns, bilateral_unilateral, posterior_anterior, complexity, equipment, primary_muscle, supporting_muscles, muscle_bias, joint_count_level, dynamic_isometric, movement_plane, primary_joints, is_active)
  VALUES ('Seated Cable Lat Pulldown (wide neutral)', 'strength', '{"vertical_pull"}'::text[], 'bilateral', 'posterior', 1, '{"cable"}'::text[], 'Latissimus dorsi', '{"Teres major","Rhomboids","Lower trapezius","Posterior deltoid"}'::text[], 'lengthened', 'regional', NULL, 'vertical', '{"Shoulder","Elbow"}'::text[], true)
  ON CONFLICT (name) DO UPDATE SET
    category = EXCLUDED.category,
    movement_patterns = EXCLUDED.movement_patterns,
    bilateral_unilateral = EXCLUDED.bilateral_unilateral,
    posterior_anterior = EXCLUDED.posterior_anterior,
    complexity = EXCLUDED.complexity,
    equipment = EXCLUDED.equipment,
    primary_muscle = EXCLUDED.primary_muscle,
    supporting_muscles = EXCLUDED.supporting_muscles,
    muscle_bias = EXCLUDED.muscle_bias,
    joint_count_level = EXCLUDED.joint_count_level,
    dynamic_isometric = EXCLUDED.dynamic_isometric,
    movement_plane = EXCLUDED.movement_plane,
    primary_joints = EXCLUDED.primary_joints,
    is_active = true,
    updated_at = now();

INSERT INTO exercise_library (name, category, movement_patterns, bilateral_unilateral, posterior_anterior, complexity, equipment, primary_muscle, supporting_muscles, muscle_bias, joint_count_level, dynamic_isometric, movement_plane, primary_joints, is_active)
  VALUES ('Seated Cable Lat Pulldown (supinated)', 'strength', '{"vertical_pull"}'::text[], 'bilateral', 'posterior', 1, '{"cable"}'::text[], 'Latissimus dorsi', '{"Biceps brachii","Brachialis","Rhomboids","Lower trapezius","Posterior deltoid"}'::text[], 'lengthened', 'regional', NULL, 'vertical', '{"Shoulder","Elbow"}'::text[], true)
  ON CONFLICT (name) DO UPDATE SET
    category = EXCLUDED.category,
    movement_patterns = EXCLUDED.movement_patterns,
    bilateral_unilateral = EXCLUDED.bilateral_unilateral,
    posterior_anterior = EXCLUDED.posterior_anterior,
    complexity = EXCLUDED.complexity,
    equipment = EXCLUDED.equipment,
    primary_muscle = EXCLUDED.primary_muscle,
    supporting_muscles = EXCLUDED.supporting_muscles,
    muscle_bias = EXCLUDED.muscle_bias,
    joint_count_level = EXCLUDED.joint_count_level,
    dynamic_isometric = EXCLUDED.dynamic_isometric,
    movement_plane = EXCLUDED.movement_plane,
    primary_joints = EXCLUDED.primary_joints,
    is_active = true,
    updated_at = now();

INSERT INTO exercise_library (name, category, movement_patterns, bilateral_unilateral, posterior_anterior, complexity, equipment, primary_muscle, supporting_muscles, muscle_bias, joint_count_level, dynamic_isometric, movement_plane, primary_joints, is_active)
  VALUES ('Seated Cable Lat Pulldown (semi-supinated)', 'strength', '{"vertical_pull"}'::text[], 'bilateral', 'posterior', 1, '{"cable"}'::text[], 'Latissimus dorsi', '{"Biceps brachii","Brachialis","Rhomboids","Lower trapezius","Posterior deltoid"}'::text[], 'lengthened', 'regional', NULL, 'vertical', '{"Shoulder","Elbow"}'::text[], true)
  ON CONFLICT (name) DO UPDATE SET
    category = EXCLUDED.category,
    movement_patterns = EXCLUDED.movement_patterns,
    bilateral_unilateral = EXCLUDED.bilateral_unilateral,
    posterior_anterior = EXCLUDED.posterior_anterior,
    complexity = EXCLUDED.complexity,
    equipment = EXCLUDED.equipment,
    primary_muscle = EXCLUDED.primary_muscle,
    supporting_muscles = EXCLUDED.supporting_muscles,
    muscle_bias = EXCLUDED.muscle_bias,
    joint_count_level = EXCLUDED.joint_count_level,
    dynamic_isometric = EXCLUDED.dynamic_isometric,
    movement_plane = EXCLUDED.movement_plane,
    primary_joints = EXCLUDED.primary_joints,
    is_active = true,
    updated_at = now();

INSERT INTO exercise_library (name, category, movement_patterns, bilateral_unilateral, posterior_anterior, complexity, equipment, primary_muscle, supporting_muscles, muscle_bias, joint_count_level, dynamic_isometric, movement_plane, primary_joints, is_active)
  VALUES ('Seated Single Arm Cable Lat Pulldown', 'strength', '{"vertical_pull"}'::text[], 'unilateral', 'posterior', 2, '{"cable"}'::text[], 'Latissimus dorsi', '{"Biceps brachii","Brachialis","Rhomboids","Lower trapezius","Core stabilizers"}'::text[], 'lengthened', 'regional', NULL, 'vertical', '{"Shoulder","Elbow"}'::text[], true)
  ON CONFLICT (name) DO UPDATE SET
    category = EXCLUDED.category,
    movement_patterns = EXCLUDED.movement_patterns,
    bilateral_unilateral = EXCLUDED.bilateral_unilateral,
    posterior_anterior = EXCLUDED.posterior_anterior,
    complexity = EXCLUDED.complexity,
    equipment = EXCLUDED.equipment,
    primary_muscle = EXCLUDED.primary_muscle,
    supporting_muscles = EXCLUDED.supporting_muscles,
    muscle_bias = EXCLUDED.muscle_bias,
    joint_count_level = EXCLUDED.joint_count_level,
    dynamic_isometric = EXCLUDED.dynamic_isometric,
    movement_plane = EXCLUDED.movement_plane,
    primary_joints = EXCLUDED.primary_joints,
    is_active = true,
    updated_at = now();

INSERT INTO exercise_library (name, category, movement_patterns, bilateral_unilateral, posterior_anterior, complexity, equipment, primary_muscle, supporting_muscles, muscle_bias, joint_count_level, dynamic_isometric, movement_plane, primary_joints, is_active)
  VALUES ('Single Arm Half Kneeling Cable Row', 'strength', '{"horizontal_pull"}'::text[], 'unilateral', 'posterior', 2, '{"cable"}'::text[], 'Lats / Mid back', '{"Rhomboids","Middle trapezius","Posterior deltoid","Biceps brachii","Core stabilizers"}'::text[], 'mid', 'regional', NULL, 'horizontal', '{"Shoulder","Elbow"}'::text[], true)
  ON CONFLICT (name) DO UPDATE SET
    category = EXCLUDED.category,
    movement_patterns = EXCLUDED.movement_patterns,
    bilateral_unilateral = EXCLUDED.bilateral_unilateral,
    posterior_anterior = EXCLUDED.posterior_anterior,
    complexity = EXCLUDED.complexity,
    equipment = EXCLUDED.equipment,
    primary_muscle = EXCLUDED.primary_muscle,
    supporting_muscles = EXCLUDED.supporting_muscles,
    muscle_bias = EXCLUDED.muscle_bias,
    joint_count_level = EXCLUDED.joint_count_level,
    dynamic_isometric = EXCLUDED.dynamic_isometric,
    movement_plane = EXCLUDED.movement_plane,
    primary_joints = EXCLUDED.primary_joints,
    is_active = true,
    updated_at = now();

INSERT INTO exercise_library (name, category, movement_patterns, bilateral_unilateral, posterior_anterior, complexity, equipment, primary_muscle, supporting_muscles, muscle_bias, joint_count_level, dynamic_isometric, movement_plane, primary_joints, is_active)
  VALUES ('Single Arm Half Kneeling Cable Pulldown', 'strength', '{"vertical_pull"}'::text[], 'unilateral', 'posterior', 2, '{"cable"}'::text[], 'Latissimus dorsi', '{"Biceps brachii","Brachialis","Rhomboids","Lower trapezius","Core stabilizers"}'::text[], 'lengthened', 'regional', NULL, 'vertical', '{"Shoulder","Elbow"}'::text[], true)
  ON CONFLICT (name) DO UPDATE SET
    category = EXCLUDED.category,
    movement_patterns = EXCLUDED.movement_patterns,
    bilateral_unilateral = EXCLUDED.bilateral_unilateral,
    posterior_anterior = EXCLUDED.posterior_anterior,
    complexity = EXCLUDED.complexity,
    equipment = EXCLUDED.equipment,
    primary_muscle = EXCLUDED.primary_muscle,
    supporting_muscles = EXCLUDED.supporting_muscles,
    muscle_bias = EXCLUDED.muscle_bias,
    joint_count_level = EXCLUDED.joint_count_level,
    dynamic_isometric = EXCLUDED.dynamic_isometric,
    movement_plane = EXCLUDED.movement_plane,
    primary_joints = EXCLUDED.primary_joints,
    is_active = true,
    updated_at = now();

INSERT INTO exercise_library (name, category, movement_patterns, bilateral_unilateral, posterior_anterior, complexity, equipment, primary_muscle, supporting_muscles, muscle_bias, joint_count_level, dynamic_isometric, movement_plane, primary_joints, is_active)
  VALUES ('Split Stance Single Arm Cable Row', 'strength', '{"horizontal_pull"}'::text[], 'unilateral', 'posterior', 2, '{"cable"}'::text[], 'Lats / Mid back', '{"Rhomboids","Middle trapezius","Posterior deltoid","Biceps brachii","Core stabilizers"}'::text[], 'mid', 'regional', NULL, 'horizontal', '{"Shoulder","Elbow"}'::text[], true)
  ON CONFLICT (name) DO UPDATE SET
    category = EXCLUDED.category,
    movement_patterns = EXCLUDED.movement_patterns,
    bilateral_unilateral = EXCLUDED.bilateral_unilateral,
    posterior_anterior = EXCLUDED.posterior_anterior,
    complexity = EXCLUDED.complexity,
    equipment = EXCLUDED.equipment,
    primary_muscle = EXCLUDED.primary_muscle,
    supporting_muscles = EXCLUDED.supporting_muscles,
    muscle_bias = EXCLUDED.muscle_bias,
    joint_count_level = EXCLUDED.joint_count_level,
    dynamic_isometric = EXCLUDED.dynamic_isometric,
    movement_plane = EXCLUDED.movement_plane,
    primary_joints = EXCLUDED.primary_joints,
    is_active = true,
    updated_at = now();

INSERT INTO exercise_library (name, category, movement_patterns, bilateral_unilateral, posterior_anterior, complexity, equipment, primary_muscle, supporting_muscles, muscle_bias, joint_count_level, dynamic_isometric, movement_plane, primary_joints, is_active)
  VALUES ('Squat Hold Single Arm Cable Row', 'strength', '{"horizontal_pull"}'::text[], 'unilateral', 'posterior', 3, '{"cable"}'::text[], 'Lats / Mid back', '{"Rhomboids","Middle trapezius","Posterior deltoid","Biceps brachii","Core stabilizers"}'::text[], 'lengthened', 'regional', NULL, 'horizontal', '{"Shoulder","Elbow"}'::text[], true)
  ON CONFLICT (name) DO UPDATE SET
    category = EXCLUDED.category,
    movement_patterns = EXCLUDED.movement_patterns,
    bilateral_unilateral = EXCLUDED.bilateral_unilateral,
    posterior_anterior = EXCLUDED.posterior_anterior,
    complexity = EXCLUDED.complexity,
    equipment = EXCLUDED.equipment,
    primary_muscle = EXCLUDED.primary_muscle,
    supporting_muscles = EXCLUDED.supporting_muscles,
    muscle_bias = EXCLUDED.muscle_bias,
    joint_count_level = EXCLUDED.joint_count_level,
    dynamic_isometric = EXCLUDED.dynamic_isometric,
    movement_plane = EXCLUDED.movement_plane,
    primary_joints = EXCLUDED.primary_joints,
    is_active = true,
    updated_at = now();

INSERT INTO exercise_library (name, category, movement_patterns, bilateral_unilateral, posterior_anterior, complexity, equipment, primary_muscle, supporting_muscles, muscle_bias, joint_count_level, dynamic_isometric, movement_plane, primary_joints, is_active)
  VALUES ('Peg Board Pull-up', 'strength', '{"vertical_pull"}'::text[], 'bilateral', 'posterior', 3, '{"bodyweight"}'::text[], 'Latissimus dorsi', '{"Forearm flexors","Biceps brachii","Rhomboids","Trapezius","Core stabilizers"}'::text[], 'lengthened', 'regional', NULL, 'vertical', '{"Shoulder","Elbow"}'::text[], true)
  ON CONFLICT (name) DO UPDATE SET
    category = EXCLUDED.category,
    movement_patterns = EXCLUDED.movement_patterns,
    bilateral_unilateral = EXCLUDED.bilateral_unilateral,
    posterior_anterior = EXCLUDED.posterior_anterior,
    complexity = EXCLUDED.complexity,
    equipment = EXCLUDED.equipment,
    primary_muscle = EXCLUDED.primary_muscle,
    supporting_muscles = EXCLUDED.supporting_muscles,
    muscle_bias = EXCLUDED.muscle_bias,
    joint_count_level = EXCLUDED.joint_count_level,
    dynamic_isometric = EXCLUDED.dynamic_isometric,
    movement_plane = EXCLUDED.movement_plane,
    primary_joints = EXCLUDED.primary_joints,
    is_active = true,
    updated_at = now();

INSERT INTO exercise_library (name, category, movement_patterns, bilateral_unilateral, posterior_anterior, complexity, equipment, primary_muscle, supporting_muscles, muscle_bias, joint_count_level, dynamic_isometric, movement_plane, primary_joints, is_active)
  VALUES ('Peg Board Ascent + Descent', 'strength', '{"vertical_pull"}'::text[], 'bilateral', 'posterior', 3, '{"bodyweight"}'::text[], 'Latissimus dorsi', '{"Forearm flexors","Biceps brachii","Rhomboids","Trapezius","Core","Hip flexors"}'::text[], 'lengthened', 'regional', NULL, 'vertical', '{"Shoulder","Elbow"}'::text[], true)
  ON CONFLICT (name) DO UPDATE SET
    category = EXCLUDED.category,
    movement_patterns = EXCLUDED.movement_patterns,
    bilateral_unilateral = EXCLUDED.bilateral_unilateral,
    posterior_anterior = EXCLUDED.posterior_anterior,
    complexity = EXCLUDED.complexity,
    equipment = EXCLUDED.equipment,
    primary_muscle = EXCLUDED.primary_muscle,
    supporting_muscles = EXCLUDED.supporting_muscles,
    muscle_bias = EXCLUDED.muscle_bias,
    joint_count_level = EXCLUDED.joint_count_level,
    dynamic_isometric = EXCLUDED.dynamic_isometric,
    movement_plane = EXCLUDED.movement_plane,
    primary_joints = EXCLUDED.primary_joints,
    is_active = true,
    updated_at = now();

INSERT INTO exercise_library (name, category, movement_patterns, bilateral_unilateral, posterior_anterior, complexity, equipment, primary_muscle, supporting_muscles, muscle_bias, joint_count_level, dynamic_isometric, movement_plane, primary_joints, is_active)
  VALUES ('Uneven Peg Board Pull-up', 'strength', '{"vertical_pull"}'::text[], 'unilateral', 'posterior', 3, '{"bodyweight"}'::text[], 'Latissimus dorsi', '{"Forearm flexors","Biceps brachii","Rhomboids","Trapezius","Core stabilizers"}'::text[], 'mid', 'regional', NULL, 'vertical', '{"Shoulder","Elbow"}'::text[], true)
  ON CONFLICT (name) DO UPDATE SET
    category = EXCLUDED.category,
    movement_patterns = EXCLUDED.movement_patterns,
    bilateral_unilateral = EXCLUDED.bilateral_unilateral,
    posterior_anterior = EXCLUDED.posterior_anterior,
    complexity = EXCLUDED.complexity,
    equipment = EXCLUDED.equipment,
    primary_muscle = EXCLUDED.primary_muscle,
    supporting_muscles = EXCLUDED.supporting_muscles,
    muscle_bias = EXCLUDED.muscle_bias,
    joint_count_level = EXCLUDED.joint_count_level,
    dynamic_isometric = EXCLUDED.dynamic_isometric,
    movement_plane = EXCLUDED.movement_plane,
    primary_joints = EXCLUDED.primary_joints,
    is_active = true,
    updated_at = now();

INSERT INTO exercise_library (name, category, movement_patterns, bilateral_unilateral, posterior_anterior, complexity, equipment, primary_muscle, supporting_muscles, muscle_bias, joint_count_level, dynamic_isometric, movement_plane, primary_joints, is_active)
  VALUES ('Barbell Bent Over Row (pronated)', 'strength', '{"horizontal_pull"}'::text[], 'bilateral', 'posterior', 3, '{"barbell"}'::text[], 'Lats / Mid back', '{"Rhomboids","Middle trapezius","Posterior deltoid","Biceps brachii","Spinal erectors"}'::text[], 'mid', 'regional', NULL, 'horizontal', '{"Shoulder","Elbow"}'::text[], true)
  ON CONFLICT (name) DO UPDATE SET
    category = EXCLUDED.category,
    movement_patterns = EXCLUDED.movement_patterns,
    bilateral_unilateral = EXCLUDED.bilateral_unilateral,
    posterior_anterior = EXCLUDED.posterior_anterior,
    complexity = EXCLUDED.complexity,
    equipment = EXCLUDED.equipment,
    primary_muscle = EXCLUDED.primary_muscle,
    supporting_muscles = EXCLUDED.supporting_muscles,
    muscle_bias = EXCLUDED.muscle_bias,
    joint_count_level = EXCLUDED.joint_count_level,
    dynamic_isometric = EXCLUDED.dynamic_isometric,
    movement_plane = EXCLUDED.movement_plane,
    primary_joints = EXCLUDED.primary_joints,
    is_active = true,
    updated_at = now();

INSERT INTO exercise_library (name, category, movement_patterns, bilateral_unilateral, posterior_anterior, complexity, equipment, primary_muscle, supporting_muscles, muscle_bias, joint_count_level, dynamic_isometric, movement_plane, primary_joints, is_active)
  VALUES ('Barbell Bent Over Row (supinated)', 'strength', '{"horizontal_pull"}'::text[], 'bilateral', 'posterior', 3, '{"barbell"}'::text[], 'Lats / Mid back', '{"Biceps brachii","Rhomboids","Middle trapezius","Posterior deltoid","Spinal erectors"}'::text[], 'lengthened', 'regional', NULL, 'horizontal', '{"Shoulder","Elbow"}'::text[], true)
  ON CONFLICT (name) DO UPDATE SET
    category = EXCLUDED.category,
    movement_patterns = EXCLUDED.movement_patterns,
    bilateral_unilateral = EXCLUDED.bilateral_unilateral,
    posterior_anterior = EXCLUDED.posterior_anterior,
    complexity = EXCLUDED.complexity,
    equipment = EXCLUDED.equipment,
    primary_muscle = EXCLUDED.primary_muscle,
    supporting_muscles = EXCLUDED.supporting_muscles,
    muscle_bias = EXCLUDED.muscle_bias,
    joint_count_level = EXCLUDED.joint_count_level,
    dynamic_isometric = EXCLUDED.dynamic_isometric,
    movement_plane = EXCLUDED.movement_plane,
    primary_joints = EXCLUDED.primary_joints,
    is_active = true,
    updated_at = now();

INSERT INTO exercise_library (name, category, movement_patterns, bilateral_unilateral, posterior_anterior, complexity, equipment, primary_muscle, supporting_muscles, muscle_bias, joint_count_level, dynamic_isometric, movement_plane, primary_joints, is_active)
  VALUES ('Barbell Pendlay Row', 'strength', '{"horizontal_pull"}'::text[], 'bilateral', 'posterior', 3, '{"barbell"}'::text[], 'Lats / Mid back', '{"Rhomboids","Middle trapezius","Posterior deltoid","Biceps brachii","Spinal erectors"}'::text[], 'mid', 'regional', NULL, 'horizontal', '{"Shoulder","Elbow"}'::text[], true)
  ON CONFLICT (name) DO UPDATE SET
    category = EXCLUDED.category,
    movement_patterns = EXCLUDED.movement_patterns,
    bilateral_unilateral = EXCLUDED.bilateral_unilateral,
    posterior_anterior = EXCLUDED.posterior_anterior,
    complexity = EXCLUDED.complexity,
    equipment = EXCLUDED.equipment,
    primary_muscle = EXCLUDED.primary_muscle,
    supporting_muscles = EXCLUDED.supporting_muscles,
    muscle_bias = EXCLUDED.muscle_bias,
    joint_count_level = EXCLUDED.joint_count_level,
    dynamic_isometric = EXCLUDED.dynamic_isometric,
    movement_plane = EXCLUDED.movement_plane,
    primary_joints = EXCLUDED.primary_joints,
    is_active = true,
    updated_at = now();

INSERT INTO exercise_library (name, category, movement_patterns, bilateral_unilateral, posterior_anterior, complexity, equipment, primary_muscle, supporting_muscles, muscle_bias, joint_count_level, dynamic_isometric, movement_plane, primary_joints, is_active)
  VALUES ('3 Point Stance Single Arm Dumbbell Row', 'strength', '{"horizontal_pull"}'::text[], 'unilateral', 'posterior', 2, '{"dumbbell"}'::text[], 'Lats / Mid back', '{"Biceps brachii","Rhomboids","Middle trapezius","Posterior deltoid","Core stabilizers"}'::text[], 'mid', 'regional', NULL, 'horizontal', '{"Shoulder","Elbow"}'::text[], true)
  ON CONFLICT (name) DO UPDATE SET
    category = EXCLUDED.category,
    movement_patterns = EXCLUDED.movement_patterns,
    bilateral_unilateral = EXCLUDED.bilateral_unilateral,
    posterior_anterior = EXCLUDED.posterior_anterior,
    complexity = EXCLUDED.complexity,
    equipment = EXCLUDED.equipment,
    primary_muscle = EXCLUDED.primary_muscle,
    supporting_muscles = EXCLUDED.supporting_muscles,
    muscle_bias = EXCLUDED.muscle_bias,
    joint_count_level = EXCLUDED.joint_count_level,
    dynamic_isometric = EXCLUDED.dynamic_isometric,
    movement_plane = EXCLUDED.movement_plane,
    primary_joints = EXCLUDED.primary_joints,
    is_active = true,
    updated_at = now();

INSERT INTO exercise_library (name, category, movement_patterns, bilateral_unilateral, posterior_anterior, complexity, equipment, primary_muscle, supporting_muscles, muscle_bias, joint_count_level, dynamic_isometric, movement_plane, primary_joints, is_active)
  VALUES ('Dumbbell 1-Arm Row (bench supported, knee on bench)', 'strength', '{"horizontal_pull"}'::text[], 'unilateral', 'posterior', 2, '{"dumbbell"}'::text[], 'Lats / Mid back', '{"Biceps brachii","Rhomboids","Middle trapezius","Posterior deltoid"}'::text[], 'mid', 'regional', NULL, 'horizontal', '{"Shoulder","Elbow"}'::text[], true)
  ON CONFLICT (name) DO UPDATE SET
    category = EXCLUDED.category,
    movement_patterns = EXCLUDED.movement_patterns,
    bilateral_unilateral = EXCLUDED.bilateral_unilateral,
    posterior_anterior = EXCLUDED.posterior_anterior,
    complexity = EXCLUDED.complexity,
    equipment = EXCLUDED.equipment,
    primary_muscle = EXCLUDED.primary_muscle,
    supporting_muscles = EXCLUDED.supporting_muscles,
    muscle_bias = EXCLUDED.muscle_bias,
    joint_count_level = EXCLUDED.joint_count_level,
    dynamic_isometric = EXCLUDED.dynamic_isometric,
    movement_plane = EXCLUDED.movement_plane,
    primary_joints = EXCLUDED.primary_joints,
    is_active = true,
    updated_at = now();

INSERT INTO exercise_library (name, category, movement_patterns, bilateral_unilateral, posterior_anterior, complexity, equipment, primary_muscle, supporting_muscles, muscle_bias, joint_count_level, dynamic_isometric, movement_plane, primary_joints, is_active)
  VALUES ('Chest Supported Dumbbell Row', 'strength', '{"horizontal_pull"}'::text[], 'bilateral', 'posterior', 2, '{"dumbbell"}'::text[], 'Mid back', '{"Rhomboids","Middle trapezius","Posterior deltoid","Biceps brachii"}'::text[], 'mid', 'regional', NULL, 'horizontal', '{"Shoulder","Elbow"}'::text[], true)
  ON CONFLICT (name) DO UPDATE SET
    category = EXCLUDED.category,
    movement_patterns = EXCLUDED.movement_patterns,
    bilateral_unilateral = EXCLUDED.bilateral_unilateral,
    posterior_anterior = EXCLUDED.posterior_anterior,
    complexity = EXCLUDED.complexity,
    equipment = EXCLUDED.equipment,
    primary_muscle = EXCLUDED.primary_muscle,
    supporting_muscles = EXCLUDED.supporting_muscles,
    muscle_bias = EXCLUDED.muscle_bias,
    joint_count_level = EXCLUDED.joint_count_level,
    dynamic_isometric = EXCLUDED.dynamic_isometric,
    movement_plane = EXCLUDED.movement_plane,
    primary_joints = EXCLUDED.primary_joints,
    is_active = true,
    updated_at = now();

INSERT INTO exercise_library (name, category, movement_patterns, bilateral_unilateral, posterior_anterior, complexity, equipment, primary_muscle, supporting_muscles, muscle_bias, joint_count_level, dynamic_isometric, movement_plane, primary_joints, is_active)
  VALUES ('Incline Chest Supported Dual Dumbbell Row (neutral)', 'strength', '{"horizontal_pull"}'::text[], 'bilateral', 'posterior', 2, '{"dumbbell"}'::text[], 'Mid back', '{"Rhomboids","Middle trapezius","Posterior deltoid","Biceps brachii"}'::text[], 'mid', 'regional', NULL, 'horizontal', '{"Shoulder","Elbow"}'::text[], true)
  ON CONFLICT (name) DO UPDATE SET
    category = EXCLUDED.category,
    movement_patterns = EXCLUDED.movement_patterns,
    bilateral_unilateral = EXCLUDED.bilateral_unilateral,
    posterior_anterior = EXCLUDED.posterior_anterior,
    complexity = EXCLUDED.complexity,
    equipment = EXCLUDED.equipment,
    primary_muscle = EXCLUDED.primary_muscle,
    supporting_muscles = EXCLUDED.supporting_muscles,
    muscle_bias = EXCLUDED.muscle_bias,
    joint_count_level = EXCLUDED.joint_count_level,
    dynamic_isometric = EXCLUDED.dynamic_isometric,
    movement_plane = EXCLUDED.movement_plane,
    primary_joints = EXCLUDED.primary_joints,
    is_active = true,
    updated_at = now();

INSERT INTO exercise_library (name, category, movement_patterns, bilateral_unilateral, posterior_anterior, complexity, equipment, primary_muscle, supporting_muscles, muscle_bias, joint_count_level, dynamic_isometric, movement_plane, primary_joints, is_active)
  VALUES ('Incline Chest Supported Dual Dumbbell Row (semi-pronated, upper back focus)', 'strength', '{"horizontal_pull"}'::text[], 'bilateral', 'posterior', 2, '{"dumbbell"}'::text[], 'Upper back', '{"Middle trapezius","Rhomboids","Rear deltoid","Biceps brachii"}'::text[], 'mid', 'regional', NULL, 'horizontal', '{"Shoulder","Elbow"}'::text[], true)
  ON CONFLICT (name) DO UPDATE SET
    category = EXCLUDED.category,
    movement_patterns = EXCLUDED.movement_patterns,
    bilateral_unilateral = EXCLUDED.bilateral_unilateral,
    posterior_anterior = EXCLUDED.posterior_anterior,
    complexity = EXCLUDED.complexity,
    equipment = EXCLUDED.equipment,
    primary_muscle = EXCLUDED.primary_muscle,
    supporting_muscles = EXCLUDED.supporting_muscles,
    muscle_bias = EXCLUDED.muscle_bias,
    joint_count_level = EXCLUDED.joint_count_level,
    dynamic_isometric = EXCLUDED.dynamic_isometric,
    movement_plane = EXCLUDED.movement_plane,
    primary_joints = EXCLUDED.primary_joints,
    is_active = true,
    updated_at = now();

INSERT INTO exercise_library (name, category, movement_patterns, bilateral_unilateral, posterior_anterior, complexity, equipment, primary_muscle, supporting_muscles, muscle_bias, joint_count_level, dynamic_isometric, movement_plane, primary_joints, is_active)
  VALUES ('Smith Press Bent Over Row (pronated)', 'strength', '{"horizontal_pull"}'::text[], 'bilateral', 'posterior', 2, '{}'::text[], 'Lats / Mid back', '{"Rhomboids","Middle trapezius","Posterior deltoid","Biceps brachii"}'::text[], 'mid', 'regional', NULL, 'horizontal', '{"Shoulder","Elbow"}'::text[], true)
  ON CONFLICT (name) DO UPDATE SET
    category = EXCLUDED.category,
    movement_patterns = EXCLUDED.movement_patterns,
    bilateral_unilateral = EXCLUDED.bilateral_unilateral,
    posterior_anterior = EXCLUDED.posterior_anterior,
    complexity = EXCLUDED.complexity,
    equipment = EXCLUDED.equipment,
    primary_muscle = EXCLUDED.primary_muscle,
    supporting_muscles = EXCLUDED.supporting_muscles,
    muscle_bias = EXCLUDED.muscle_bias,
    joint_count_level = EXCLUDED.joint_count_level,
    dynamic_isometric = EXCLUDED.dynamic_isometric,
    movement_plane = EXCLUDED.movement_plane,
    primary_joints = EXCLUDED.primary_joints,
    is_active = true,
    updated_at = now();

INSERT INTO exercise_library (name, category, movement_patterns, bilateral_unilateral, posterior_anterior, complexity, equipment, primary_muscle, supporting_muscles, muscle_bias, joint_count_level, dynamic_isometric, movement_plane, primary_joints, is_active)
  VALUES ('Smith Press Bent Over Row (supinated)', 'strength', '{"horizontal_pull"}'::text[], 'bilateral', 'posterior', 2, '{}'::text[], 'Lats / Mid back', '{"Biceps brachii","Rhomboids","Middle trapezius","Posterior deltoid"}'::text[], 'mid', 'regional', NULL, 'horizontal', '{"Shoulder","Elbow"}'::text[], true)
  ON CONFLICT (name) DO UPDATE SET
    category = EXCLUDED.category,
    movement_patterns = EXCLUDED.movement_patterns,
    bilateral_unilateral = EXCLUDED.bilateral_unilateral,
    posterior_anterior = EXCLUDED.posterior_anterior,
    complexity = EXCLUDED.complexity,
    equipment = EXCLUDED.equipment,
    primary_muscle = EXCLUDED.primary_muscle,
    supporting_muscles = EXCLUDED.supporting_muscles,
    muscle_bias = EXCLUDED.muscle_bias,
    joint_count_level = EXCLUDED.joint_count_level,
    dynamic_isometric = EXCLUDED.dynamic_isometric,
    movement_plane = EXCLUDED.movement_plane,
    primary_joints = EXCLUDED.primary_joints,
    is_active = true,
    updated_at = now();

INSERT INTO exercise_library (name, category, movement_patterns, bilateral_unilateral, posterior_anterior, complexity, equipment, primary_muscle, supporting_muscles, muscle_bias, joint_count_level, dynamic_isometric, movement_plane, primary_joints, is_active)
  VALUES ('Bent Over Landmine Row (2-arm)', 'strength', '{"horizontal_pull"}'::text[], 'bilateral', 'posterior', 2, '{"landmine"}'::text[], 'Lats / Mid back', '{"Rhomboids","Middle trapezius","Posterior deltoid","Biceps brachii"}'::text[], 'lengthened', 'regional', NULL, 'horizontal', '{"Shoulder","Elbow"}'::text[], true)
  ON CONFLICT (name) DO UPDATE SET
    category = EXCLUDED.category,
    movement_patterns = EXCLUDED.movement_patterns,
    bilateral_unilateral = EXCLUDED.bilateral_unilateral,
    posterior_anterior = EXCLUDED.posterior_anterior,
    complexity = EXCLUDED.complexity,
    equipment = EXCLUDED.equipment,
    primary_muscle = EXCLUDED.primary_muscle,
    supporting_muscles = EXCLUDED.supporting_muscles,
    muscle_bias = EXCLUDED.muscle_bias,
    joint_count_level = EXCLUDED.joint_count_level,
    dynamic_isometric = EXCLUDED.dynamic_isometric,
    movement_plane = EXCLUDED.movement_plane,
    primary_joints = EXCLUDED.primary_joints,
    is_active = true,
    updated_at = now();

INSERT INTO exercise_library (name, category, movement_patterns, bilateral_unilateral, posterior_anterior, complexity, equipment, primary_muscle, supporting_muscles, muscle_bias, joint_count_level, dynamic_isometric, movement_plane, primary_joints, is_active)
  VALUES ('Meadows Row (1-arm landmine row)', 'strength', '{"horizontal_pull"}'::text[], 'unilateral', 'posterior', 3, '{"landmine"}'::text[], 'Lats / Mid back', '{"Rhomboids","Middle trapezius","Posterior deltoid","Biceps brachii","Core stabilizers"}'::text[], 'mid', 'regional', NULL, 'horizontal', '{"Shoulder","Elbow"}'::text[], true)
  ON CONFLICT (name) DO UPDATE SET
    category = EXCLUDED.category,
    movement_patterns = EXCLUDED.movement_patterns,
    bilateral_unilateral = EXCLUDED.bilateral_unilateral,
    posterior_anterior = EXCLUDED.posterior_anterior,
    complexity = EXCLUDED.complexity,
    equipment = EXCLUDED.equipment,
    primary_muscle = EXCLUDED.primary_muscle,
    supporting_muscles = EXCLUDED.supporting_muscles,
    muscle_bias = EXCLUDED.muscle_bias,
    joint_count_level = EXCLUDED.joint_count_level,
    dynamic_isometric = EXCLUDED.dynamic_isometric,
    movement_plane = EXCLUDED.movement_plane,
    primary_joints = EXCLUDED.primary_joints,
    is_active = true,
    updated_at = now();

INSERT INTO exercise_library (name, category, movement_patterns, bilateral_unilateral, posterior_anterior, complexity, equipment, primary_muscle, supporting_muscles, muscle_bias, joint_count_level, dynamic_isometric, movement_plane, primary_joints, is_active)
  VALUES ('Single Arm Bent Over Landmine Row', 'strength', '{"horizontal_pull"}'::text[], 'unilateral', 'posterior', 3, '{"landmine"}'::text[], 'Lats / Mid back', '{"Rhomboids","Middle trapezius","Posterior deltoid","Biceps brachii","Core stabilizers"}'::text[], 'mid', 'regional', NULL, 'horizontal', '{"Shoulder","Elbow"}'::text[], true)
  ON CONFLICT (name) DO UPDATE SET
    category = EXCLUDED.category,
    movement_patterns = EXCLUDED.movement_patterns,
    bilateral_unilateral = EXCLUDED.bilateral_unilateral,
    posterior_anterior = EXCLUDED.posterior_anterior,
    complexity = EXCLUDED.complexity,
    equipment = EXCLUDED.equipment,
    primary_muscle = EXCLUDED.primary_muscle,
    supporting_muscles = EXCLUDED.supporting_muscles,
    muscle_bias = EXCLUDED.muscle_bias,
    joint_count_level = EXCLUDED.joint_count_level,
    dynamic_isometric = EXCLUDED.dynamic_isometric,
    movement_plane = EXCLUDED.movement_plane,
    primary_joints = EXCLUDED.primary_joints,
    is_active = true,
    updated_at = now();

INSERT INTO exercise_library (name, category, movement_patterns, bilateral_unilateral, posterior_anterior, complexity, equipment, primary_muscle, supporting_muscles, muscle_bias, joint_count_level, dynamic_isometric, movement_plane, primary_joints, is_active)
  VALUES ('Seated Cable Row (neutral)', 'strength', '{"horizontal_pull"}'::text[], 'bilateral', 'posterior', 1, '{"cable"}'::text[], 'Lats / Mid back', '{"Rhomboids","Middle trapezius","Posterior deltoid","Biceps brachii"}'::text[], 'mid', 'regional', NULL, 'horizontal', '{"Shoulder","Elbow"}'::text[], true)
  ON CONFLICT (name) DO UPDATE SET
    category = EXCLUDED.category,
    movement_patterns = EXCLUDED.movement_patterns,
    bilateral_unilateral = EXCLUDED.bilateral_unilateral,
    posterior_anterior = EXCLUDED.posterior_anterior,
    complexity = EXCLUDED.complexity,
    equipment = EXCLUDED.equipment,
    primary_muscle = EXCLUDED.primary_muscle,
    supporting_muscles = EXCLUDED.supporting_muscles,
    muscle_bias = EXCLUDED.muscle_bias,
    joint_count_level = EXCLUDED.joint_count_level,
    dynamic_isometric = EXCLUDED.dynamic_isometric,
    movement_plane = EXCLUDED.movement_plane,
    primary_joints = EXCLUDED.primary_joints,
    is_active = true,
    updated_at = now();

INSERT INTO exercise_library (name, category, movement_patterns, bilateral_unilateral, posterior_anterior, complexity, equipment, primary_muscle, supporting_muscles, muscle_bias, joint_count_level, dynamic_isometric, movement_plane, primary_joints, is_active)
  VALUES ('Seated Cable Row (pronated)', 'strength', '{"horizontal_pull"}'::text[], 'bilateral', 'posterior', 1, '{"cable"}'::text[], 'Mid back', '{"Rhomboids","Middle trapezius","Posterior deltoid","Biceps brachii"}'::text[], 'mid', 'regional', NULL, 'horizontal', '{"Shoulder","Elbow"}'::text[], true)
  ON CONFLICT (name) DO UPDATE SET
    category = EXCLUDED.category,
    movement_patterns = EXCLUDED.movement_patterns,
    bilateral_unilateral = EXCLUDED.bilateral_unilateral,
    posterior_anterior = EXCLUDED.posterior_anterior,
    complexity = EXCLUDED.complexity,
    equipment = EXCLUDED.equipment,
    primary_muscle = EXCLUDED.primary_muscle,
    supporting_muscles = EXCLUDED.supporting_muscles,
    muscle_bias = EXCLUDED.muscle_bias,
    joint_count_level = EXCLUDED.joint_count_level,
    dynamic_isometric = EXCLUDED.dynamic_isometric,
    movement_plane = EXCLUDED.movement_plane,
    primary_joints = EXCLUDED.primary_joints,
    is_active = true,
    updated_at = now();

INSERT INTO exercise_library (name, category, movement_patterns, bilateral_unilateral, posterior_anterior, complexity, equipment, primary_muscle, supporting_muscles, muscle_bias, joint_count_level, dynamic_isometric, movement_plane, primary_joints, is_active)
  VALUES ('Seated Cable Row (supinated)', 'strength', '{"horizontal_pull"}'::text[], 'bilateral', 'posterior', 1, '{"cable"}'::text[], 'Lats / Mid back', '{"Biceps brachii","Rhomboids","Middle trapezius","Posterior deltoid"}'::text[], 'mid', 'regional', NULL, 'horizontal', '{"Shoulder","Elbow"}'::text[], true)
  ON CONFLICT (name) DO UPDATE SET
    category = EXCLUDED.category,
    movement_patterns = EXCLUDED.movement_patterns,
    bilateral_unilateral = EXCLUDED.bilateral_unilateral,
    posterior_anterior = EXCLUDED.posterior_anterior,
    complexity = EXCLUDED.complexity,
    equipment = EXCLUDED.equipment,
    primary_muscle = EXCLUDED.primary_muscle,
    supporting_muscles = EXCLUDED.supporting_muscles,
    muscle_bias = EXCLUDED.muscle_bias,
    joint_count_level = EXCLUDED.joint_count_level,
    dynamic_isometric = EXCLUDED.dynamic_isometric,
    movement_plane = EXCLUDED.movement_plane,
    primary_joints = EXCLUDED.primary_joints,
    is_active = true,
    updated_at = now();

INSERT INTO exercise_library (name, category, movement_patterns, bilateral_unilateral, posterior_anterior, complexity, equipment, primary_muscle, supporting_muscles, muscle_bias, joint_count_level, dynamic_isometric, movement_plane, primary_joints, is_active)
  VALUES ('Chest Supported Machine Row (neutral)', 'strength', '{"horizontal_pull"}'::text[], 'bilateral', 'posterior', 1, '{"fixed_machine"}'::text[], 'Mid back', '{"Rhomboids","Middle trapezius","Posterior deltoid","Biceps brachii"}'::text[], 'mid', 'regional', NULL, 'horizontal', '{"Shoulder","Elbow"}'::text[], true)
  ON CONFLICT (name) DO UPDATE SET
    category = EXCLUDED.category,
    movement_patterns = EXCLUDED.movement_patterns,
    bilateral_unilateral = EXCLUDED.bilateral_unilateral,
    posterior_anterior = EXCLUDED.posterior_anterior,
    complexity = EXCLUDED.complexity,
    equipment = EXCLUDED.equipment,
    primary_muscle = EXCLUDED.primary_muscle,
    supporting_muscles = EXCLUDED.supporting_muscles,
    muscle_bias = EXCLUDED.muscle_bias,
    joint_count_level = EXCLUDED.joint_count_level,
    dynamic_isometric = EXCLUDED.dynamic_isometric,
    movement_plane = EXCLUDED.movement_plane,
    primary_joints = EXCLUDED.primary_joints,
    is_active = true,
    updated_at = now();

INSERT INTO exercise_library (name, category, movement_patterns, bilateral_unilateral, posterior_anterior, complexity, equipment, primary_muscle, supporting_muscles, muscle_bias, joint_count_level, dynamic_isometric, movement_plane, primary_joints, is_active)
  VALUES ('Chest Supported Machine Row (pronated)', 'strength', '{"horizontal_pull"}'::text[], 'bilateral', 'posterior', 1, '{"fixed_machine"}'::text[], 'Upper back', '{"Middle trapezius","Rhomboids","Rear deltoid","Biceps brachii"}'::text[], 'mid', 'regional', NULL, 'horizontal', '{"Shoulder","Elbow"}'::text[], true)
  ON CONFLICT (name) DO UPDATE SET
    category = EXCLUDED.category,
    movement_patterns = EXCLUDED.movement_patterns,
    bilateral_unilateral = EXCLUDED.bilateral_unilateral,
    posterior_anterior = EXCLUDED.posterior_anterior,
    complexity = EXCLUDED.complexity,
    equipment = EXCLUDED.equipment,
    primary_muscle = EXCLUDED.primary_muscle,
    supporting_muscles = EXCLUDED.supporting_muscles,
    muscle_bias = EXCLUDED.muscle_bias,
    joint_count_level = EXCLUDED.joint_count_level,
    dynamic_isometric = EXCLUDED.dynamic_isometric,
    movement_plane = EXCLUDED.movement_plane,
    primary_joints = EXCLUDED.primary_joints,
    is_active = true,
    updated_at = now();

INSERT INTO exercise_library (name, category, movement_patterns, bilateral_unilateral, posterior_anterior, complexity, equipment, primary_muscle, supporting_muscles, muscle_bias, joint_count_level, dynamic_isometric, movement_plane, primary_joints, is_active)
  VALUES ('Chest Supported Machine Row (supinated)', 'strength', '{"horizontal_pull"}'::text[], 'bilateral', 'posterior', 1, '{"fixed_machine"}'::text[], 'Lats / Mid back', '{"Biceps brachii","Rhomboids","Middle trapezius","Posterior deltoid"}'::text[], 'mid', 'regional', NULL, 'horizontal', '{"Shoulder","Elbow"}'::text[], true)
  ON CONFLICT (name) DO UPDATE SET
    category = EXCLUDED.category,
    movement_patterns = EXCLUDED.movement_patterns,
    bilateral_unilateral = EXCLUDED.bilateral_unilateral,
    posterior_anterior = EXCLUDED.posterior_anterior,
    complexity = EXCLUDED.complexity,
    equipment = EXCLUDED.equipment,
    primary_muscle = EXCLUDED.primary_muscle,
    supporting_muscles = EXCLUDED.supporting_muscles,
    muscle_bias = EXCLUDED.muscle_bias,
    joint_count_level = EXCLUDED.joint_count_level,
    dynamic_isometric = EXCLUDED.dynamic_isometric,
    movement_plane = EXCLUDED.movement_plane,
    primary_joints = EXCLUDED.primary_joints,
    is_active = true,
    updated_at = now();

INSERT INTO exercise_library (name, category, movement_patterns, bilateral_unilateral, posterior_anterior, complexity, equipment, primary_muscle, supporting_muscles, muscle_bias, joint_count_level, dynamic_isometric, movement_plane, primary_joints, is_active)
  VALUES ('Inverted Bar Row', 'strength', '{"horizontal_pull"}'::text[], 'bilateral', 'posterior', 2, '{"bodyweight"}'::text[], 'Mid back', '{"Rhomboids","Middle trapezius","Posterior deltoid","Biceps brachii"}'::text[], 'mid', 'regional', NULL, 'horizontal', '{"Shoulder","Elbow"}'::text[], true)
  ON CONFLICT (name) DO UPDATE SET
    category = EXCLUDED.category,
    movement_patterns = EXCLUDED.movement_patterns,
    bilateral_unilateral = EXCLUDED.bilateral_unilateral,
    posterior_anterior = EXCLUDED.posterior_anterior,
    complexity = EXCLUDED.complexity,
    equipment = EXCLUDED.equipment,
    primary_muscle = EXCLUDED.primary_muscle,
    supporting_muscles = EXCLUDED.supporting_muscles,
    muscle_bias = EXCLUDED.muscle_bias,
    joint_count_level = EXCLUDED.joint_count_level,
    dynamic_isometric = EXCLUDED.dynamic_isometric,
    movement_plane = EXCLUDED.movement_plane,
    primary_joints = EXCLUDED.primary_joints,
    is_active = true,
    updated_at = now();

INSERT INTO exercise_library (name, category, movement_patterns, bilateral_unilateral, posterior_anterior, complexity, equipment, primary_muscle, supporting_muscles, muscle_bias, joint_count_level, dynamic_isometric, movement_plane, primary_joints, is_active)
  VALUES ('Weighted Inverted Bar Row', 'strength', '{"horizontal_pull"}'::text[], 'bilateral', 'posterior', 3, '{"bodyweight"}'::text[], 'Mid back', '{"Rhomboids","Middle trapezius","Posterior deltoid","Biceps brachii"}'::text[], 'mid', 'regional', NULL, 'horizontal', '{"Shoulder","Elbow"}'::text[], true)
  ON CONFLICT (name) DO UPDATE SET
    category = EXCLUDED.category,
    movement_patterns = EXCLUDED.movement_patterns,
    bilateral_unilateral = EXCLUDED.bilateral_unilateral,
    posterior_anterior = EXCLUDED.posterior_anterior,
    complexity = EXCLUDED.complexity,
    equipment = EXCLUDED.equipment,
    primary_muscle = EXCLUDED.primary_muscle,
    supporting_muscles = EXCLUDED.supporting_muscles,
    muscle_bias = EXCLUDED.muscle_bias,
    joint_count_level = EXCLUDED.joint_count_level,
    dynamic_isometric = EXCLUDED.dynamic_isometric,
    movement_plane = EXCLUDED.movement_plane,
    primary_joints = EXCLUDED.primary_joints,
    is_active = true,
    updated_at = now();

INSERT INTO exercise_library (name, category, movement_patterns, bilateral_unilateral, posterior_anterior, complexity, equipment, primary_muscle, supporting_muscles, muscle_bias, joint_count_level, dynamic_isometric, movement_plane, primary_joints, is_active)
  VALUES ('Feet Elevated Inverted Bar Row', 'strength', '{"horizontal_pull"}'::text[], 'bilateral', 'posterior', 2, '{"bodyweight"}'::text[], 'Mid back', '{"Rhomboids","Middle trapezius","Posterior deltoid","Biceps brachii"}'::text[], 'lengthened', 'regional', NULL, 'horizontal', '{"Shoulder","Elbow"}'::text[], true)
  ON CONFLICT (name) DO UPDATE SET
    category = EXCLUDED.category,
    movement_patterns = EXCLUDED.movement_patterns,
    bilateral_unilateral = EXCLUDED.bilateral_unilateral,
    posterior_anterior = EXCLUDED.posterior_anterior,
    complexity = EXCLUDED.complexity,
    equipment = EXCLUDED.equipment,
    primary_muscle = EXCLUDED.primary_muscle,
    supporting_muscles = EXCLUDED.supporting_muscles,
    muscle_bias = EXCLUDED.muscle_bias,
    joint_count_level = EXCLUDED.joint_count_level,
    dynamic_isometric = EXCLUDED.dynamic_isometric,
    movement_plane = EXCLUDED.movement_plane,
    primary_joints = EXCLUDED.primary_joints,
    is_active = true,
    updated_at = now();

INSERT INTO exercise_library (name, category, movement_patterns, bilateral_unilateral, posterior_anterior, complexity, equipment, primary_muscle, supporting_muscles, muscle_bias, joint_count_level, dynamic_isometric, movement_plane, primary_joints, is_active)
  VALUES ('Weighted Feet Elevated Inverted Bar Row', 'strength', '{"horizontal_pull"}'::text[], 'bilateral', 'posterior', 3, '{"bodyweight"}'::text[], 'Mid back', '{"Rhomboids","Middle trapezius","Posterior deltoid","Biceps brachii"}'::text[], 'lengthened', 'regional', NULL, 'horizontal', '{"Shoulder","Elbow"}'::text[], true)
  ON CONFLICT (name) DO UPDATE SET
    category = EXCLUDED.category,
    movement_patterns = EXCLUDED.movement_patterns,
    bilateral_unilateral = EXCLUDED.bilateral_unilateral,
    posterior_anterior = EXCLUDED.posterior_anterior,
    complexity = EXCLUDED.complexity,
    equipment = EXCLUDED.equipment,
    primary_muscle = EXCLUDED.primary_muscle,
    supporting_muscles = EXCLUDED.supporting_muscles,
    muscle_bias = EXCLUDED.muscle_bias,
    joint_count_level = EXCLUDED.joint_count_level,
    dynamic_isometric = EXCLUDED.dynamic_isometric,
    movement_plane = EXCLUDED.movement_plane,
    primary_joints = EXCLUDED.primary_joints,
    is_active = true,
    updated_at = now();

INSERT INTO exercise_library (name, category, movement_patterns, bilateral_unilateral, posterior_anterior, complexity, equipment, primary_muscle, supporting_muscles, muscle_bias, joint_count_level, dynamic_isometric, movement_plane, primary_joints, is_active)
  VALUES ('Ring Row / Suspension Trainer Row', 'strength', '{"horizontal_pull"}'::text[], 'bilateral', 'posterior', 2, '{"suspension_trainer"}'::text[], 'Mid back', '{"Rhomboids","Middle trapezius","Posterior deltoid","Biceps brachii"}'::text[], 'mid', 'regional', NULL, 'horizontal', '{"Shoulder","Elbow"}'::text[], true)
  ON CONFLICT (name) DO UPDATE SET
    category = EXCLUDED.category,
    movement_patterns = EXCLUDED.movement_patterns,
    bilateral_unilateral = EXCLUDED.bilateral_unilateral,
    posterior_anterior = EXCLUDED.posterior_anterior,
    complexity = EXCLUDED.complexity,
    equipment = EXCLUDED.equipment,
    primary_muscle = EXCLUDED.primary_muscle,
    supporting_muscles = EXCLUDED.supporting_muscles,
    muscle_bias = EXCLUDED.muscle_bias,
    joint_count_level = EXCLUDED.joint_count_level,
    dynamic_isometric = EXCLUDED.dynamic_isometric,
    movement_plane = EXCLUDED.movement_plane,
    primary_joints = EXCLUDED.primary_joints,
    is_active = true,
    updated_at = now();

INSERT INTO exercise_library (name, category, movement_patterns, bilateral_unilateral, posterior_anterior, complexity, equipment, primary_muscle, supporting_muscles, muscle_bias, joint_count_level, dynamic_isometric, movement_plane, primary_joints, is_active)
  VALUES ('Weighted Ring Row / Suspension Trainer Row', 'strength', '{"horizontal_pull"}'::text[], 'bilateral', 'posterior', 3, '{"suspension_trainer"}'::text[], 'Mid back', '{"Rhomboids","Middle trapezius","Posterior deltoid","Biceps brachii"}'::text[], 'mid', 'regional', NULL, 'horizontal', '{"Shoulder","Elbow"}'::text[], true)
  ON CONFLICT (name) DO UPDATE SET
    category = EXCLUDED.category,
    movement_patterns = EXCLUDED.movement_patterns,
    bilateral_unilateral = EXCLUDED.bilateral_unilateral,
    posterior_anterior = EXCLUDED.posterior_anterior,
    complexity = EXCLUDED.complexity,
    equipment = EXCLUDED.equipment,
    primary_muscle = EXCLUDED.primary_muscle,
    supporting_muscles = EXCLUDED.supporting_muscles,
    muscle_bias = EXCLUDED.muscle_bias,
    joint_count_level = EXCLUDED.joint_count_level,
    dynamic_isometric = EXCLUDED.dynamic_isometric,
    movement_plane = EXCLUDED.movement_plane,
    primary_joints = EXCLUDED.primary_joints,
    is_active = true,
    updated_at = now();

INSERT INTO exercise_library (name, category, movement_patterns, bilateral_unilateral, posterior_anterior, complexity, equipment, primary_muscle, supporting_muscles, muscle_bias, joint_count_level, dynamic_isometric, movement_plane, primary_joints, is_active)
  VALUES ('Rope Ring Row', 'strength', '{"horizontal_pull"}'::text[], 'bilateral', 'posterior', 3, '{"suspension_trainer"}'::text[], 'Mid back', '{"Forearm flexors","Rhomboids","Middle trapezius","Posterior deltoid","Biceps brachii"}'::text[], 'mid', 'regional', NULL, 'horizontal', '{"Shoulder","Elbow"}'::text[], true)
  ON CONFLICT (name) DO UPDATE SET
    category = EXCLUDED.category,
    movement_patterns = EXCLUDED.movement_patterns,
    bilateral_unilateral = EXCLUDED.bilateral_unilateral,
    posterior_anterior = EXCLUDED.posterior_anterior,
    complexity = EXCLUDED.complexity,
    equipment = EXCLUDED.equipment,
    primary_muscle = EXCLUDED.primary_muscle,
    supporting_muscles = EXCLUDED.supporting_muscles,
    muscle_bias = EXCLUDED.muscle_bias,
    joint_count_level = EXCLUDED.joint_count_level,
    dynamic_isometric = EXCLUDED.dynamic_isometric,
    movement_plane = EXCLUDED.movement_plane,
    primary_joints = EXCLUDED.primary_joints,
    is_active = true,
    updated_at = now();

INSERT INTO exercise_library (name, category, movement_patterns, bilateral_unilateral, posterior_anterior, complexity, equipment, primary_muscle, supporting_muscles, muscle_bias, joint_count_level, dynamic_isometric, movement_plane, primary_joints, is_active)
  VALUES ('Weighted Rope Ring Row', 'strength', '{"horizontal_pull"}'::text[], 'bilateral', 'posterior', 3, '{"suspension_trainer"}'::text[], 'Mid back', '{"Forearm flexors","Rhomboids","Middle trapezius","Posterior deltoid","Biceps brachii"}'::text[], 'mid', 'regional', NULL, 'horizontal', '{"Shoulder","Elbow"}'::text[], true)
  ON CONFLICT (name) DO UPDATE SET
    category = EXCLUDED.category,
    movement_patterns = EXCLUDED.movement_patterns,
    bilateral_unilateral = EXCLUDED.bilateral_unilateral,
    posterior_anterior = EXCLUDED.posterior_anterior,
    complexity = EXCLUDED.complexity,
    equipment = EXCLUDED.equipment,
    primary_muscle = EXCLUDED.primary_muscle,
    supporting_muscles = EXCLUDED.supporting_muscles,
    muscle_bias = EXCLUDED.muscle_bias,
    joint_count_level = EXCLUDED.joint_count_level,
    dynamic_isometric = EXCLUDED.dynamic_isometric,
    movement_plane = EXCLUDED.movement_plane,
    primary_joints = EXCLUDED.primary_joints,
    is_active = true,
    updated_at = now();

INSERT INTO exercise_library (name, category, movement_patterns, bilateral_unilateral, posterior_anterior, complexity, equipment, primary_muscle, supporting_muscles, muscle_bias, joint_count_level, dynamic_isometric, movement_plane, primary_joints, is_active)
  VALUES ('False Grip Ring Row', 'strength', '{"horizontal_pull"}'::text[], 'bilateral', 'posterior', 3, '{"suspension_trainer"}'::text[], 'Mid back', '{"Forearm flexors","Rhomboids","Middle trapezius","Posterior deltoid","Biceps brachii"}'::text[], 'mid', 'regional', NULL, 'horizontal', '{"Shoulder","Elbow"}'::text[], true)
  ON CONFLICT (name) DO UPDATE SET
    category = EXCLUDED.category,
    movement_patterns = EXCLUDED.movement_patterns,
    bilateral_unilateral = EXCLUDED.bilateral_unilateral,
    posterior_anterior = EXCLUDED.posterior_anterior,
    complexity = EXCLUDED.complexity,
    equipment = EXCLUDED.equipment,
    primary_muscle = EXCLUDED.primary_muscle,
    supporting_muscles = EXCLUDED.supporting_muscles,
    muscle_bias = EXCLUDED.muscle_bias,
    joint_count_level = EXCLUDED.joint_count_level,
    dynamic_isometric = EXCLUDED.dynamic_isometric,
    movement_plane = EXCLUDED.movement_plane,
    primary_joints = EXCLUDED.primary_joints,
    is_active = true,
    updated_at = now();

INSERT INTO exercise_library (name, category, movement_patterns, bilateral_unilateral, posterior_anterior, complexity, equipment, primary_muscle, supporting_muscles, muscle_bias, joint_count_level, dynamic_isometric, movement_plane, primary_joints, is_active)
  VALUES ('Weighted False Grip Ring Row', 'strength', '{"horizontal_pull"}'::text[], 'bilateral', 'posterior', 3, '{"suspension_trainer"}'::text[], 'Mid back', '{"Forearm flexors","Rhomboids","Middle trapezius","Posterior deltoid","Biceps brachii"}'::text[], 'mid', 'regional', NULL, 'horizontal', '{"Shoulder","Elbow"}'::text[], true)
  ON CONFLICT (name) DO UPDATE SET
    category = EXCLUDED.category,
    movement_patterns = EXCLUDED.movement_patterns,
    bilateral_unilateral = EXCLUDED.bilateral_unilateral,
    posterior_anterior = EXCLUDED.posterior_anterior,
    complexity = EXCLUDED.complexity,
    equipment = EXCLUDED.equipment,
    primary_muscle = EXCLUDED.primary_muscle,
    supporting_muscles = EXCLUDED.supporting_muscles,
    muscle_bias = EXCLUDED.muscle_bias,
    joint_count_level = EXCLUDED.joint_count_level,
    dynamic_isometric = EXCLUDED.dynamic_isometric,
    movement_plane = EXCLUDED.movement_plane,
    primary_joints = EXCLUDED.primary_joints,
    is_active = true,
    updated_at = now();

INSERT INTO exercise_library (name, category, movement_patterns, bilateral_unilateral, posterior_anterior, complexity, equipment, primary_muscle, supporting_muscles, muscle_bias, joint_count_level, dynamic_isometric, movement_plane, primary_joints, is_active)
  VALUES ('Barbell Bench Press', 'strength', '{"horizontal_push"}'::text[], 'bilateral', 'anterior', 2, '{"barbell"}'::text[], 'Pectoralis major', '{"Anterior deltoid","Triceps brachii","Serratus anterior"}'::text[], 'mid', 'regional', NULL, 'horizontal', '{"Shoulder","Elbow"}'::text[], true)
  ON CONFLICT (name) DO UPDATE SET
    category = EXCLUDED.category,
    movement_patterns = EXCLUDED.movement_patterns,
    bilateral_unilateral = EXCLUDED.bilateral_unilateral,
    posterior_anterior = EXCLUDED.posterior_anterior,
    complexity = EXCLUDED.complexity,
    equipment = EXCLUDED.equipment,
    primary_muscle = EXCLUDED.primary_muscle,
    supporting_muscles = EXCLUDED.supporting_muscles,
    muscle_bias = EXCLUDED.muscle_bias,
    joint_count_level = EXCLUDED.joint_count_level,
    dynamic_isometric = EXCLUDED.dynamic_isometric,
    movement_plane = EXCLUDED.movement_plane,
    primary_joints = EXCLUDED.primary_joints,
    is_active = true,
    updated_at = now();

INSERT INTO exercise_library (name, category, movement_patterns, bilateral_unilateral, posterior_anterior, complexity, equipment, primary_muscle, supporting_muscles, muscle_bias, joint_count_level, dynamic_isometric, movement_plane, primary_joints, is_active)
  VALUES ('Close Grip Barbell Bench Press', 'strength', '{"horizontal_push"}'::text[], 'bilateral', 'anterior', 2, '{"barbell"}'::text[], 'Triceps brachii', '{"Pectoralis major","Anterior deltoid","Serratus anterior"}'::text[], 'mid', 'regional', NULL, 'horizontal', '{"Shoulder","Elbow"}'::text[], true)
  ON CONFLICT (name) DO UPDATE SET
    category = EXCLUDED.category,
    movement_patterns = EXCLUDED.movement_patterns,
    bilateral_unilateral = EXCLUDED.bilateral_unilateral,
    posterior_anterior = EXCLUDED.posterior_anterior,
    complexity = EXCLUDED.complexity,
    equipment = EXCLUDED.equipment,
    primary_muscle = EXCLUDED.primary_muscle,
    supporting_muscles = EXCLUDED.supporting_muscles,
    muscle_bias = EXCLUDED.muscle_bias,
    joint_count_level = EXCLUDED.joint_count_level,
    dynamic_isometric = EXCLUDED.dynamic_isometric,
    movement_plane = EXCLUDED.movement_plane,
    primary_joints = EXCLUDED.primary_joints,
    is_active = true,
    updated_at = now();

INSERT INTO exercise_library (name, category, movement_patterns, bilateral_unilateral, posterior_anterior, complexity, equipment, primary_muscle, supporting_muscles, muscle_bias, joint_count_level, dynamic_isometric, movement_plane, primary_joints, is_active)
  VALUES ('Close Grip Barbell Bench Press (10 degrees)', 'strength', '{"horizontal_push"}'::text[], 'bilateral', 'anterior', 2, '{"barbell"}'::text[], 'Triceps brachii', '{"Pectoralis major","Anterior deltoid","Serratus anterior"}'::text[], 'mid', 'regional', NULL, 'horizontal', '{"Shoulder","Elbow"}'::text[], true)
  ON CONFLICT (name) DO UPDATE SET
    category = EXCLUDED.category,
    movement_patterns = EXCLUDED.movement_patterns,
    bilateral_unilateral = EXCLUDED.bilateral_unilateral,
    posterior_anterior = EXCLUDED.posterior_anterior,
    complexity = EXCLUDED.complexity,
    equipment = EXCLUDED.equipment,
    primary_muscle = EXCLUDED.primary_muscle,
    supporting_muscles = EXCLUDED.supporting_muscles,
    muscle_bias = EXCLUDED.muscle_bias,
    joint_count_level = EXCLUDED.joint_count_level,
    dynamic_isometric = EXCLUDED.dynamic_isometric,
    movement_plane = EXCLUDED.movement_plane,
    primary_joints = EXCLUDED.primary_joints,
    is_active = true,
    updated_at = now();

INSERT INTO exercise_library (name, category, movement_patterns, bilateral_unilateral, posterior_anterior, complexity, equipment, primary_muscle, supporting_muscles, muscle_bias, joint_count_level, dynamic_isometric, movement_plane, primary_joints, is_active)
  VALUES ('Close Grip Barbell Bench Press (30 degrees)', 'strength', '{"horizontal_push"}'::text[], 'bilateral', 'anterior', 2, '{"barbell"}'::text[], 'Triceps brachii', '{"Pectoralis major","Anterior deltoid","Serratus anterior"}'::text[], 'mid', 'regional', NULL, 'horizontal', '{"Shoulder","Elbow"}'::text[], true)
  ON CONFLICT (name) DO UPDATE SET
    category = EXCLUDED.category,
    movement_patterns = EXCLUDED.movement_patterns,
    bilateral_unilateral = EXCLUDED.bilateral_unilateral,
    posterior_anterior = EXCLUDED.posterior_anterior,
    complexity = EXCLUDED.complexity,
    equipment = EXCLUDED.equipment,
    primary_muscle = EXCLUDED.primary_muscle,
    supporting_muscles = EXCLUDED.supporting_muscles,
    muscle_bias = EXCLUDED.muscle_bias,
    joint_count_level = EXCLUDED.joint_count_level,
    dynamic_isometric = EXCLUDED.dynamic_isometric,
    movement_plane = EXCLUDED.movement_plane,
    primary_joints = EXCLUDED.primary_joints,
    is_active = true,
    updated_at = now();

INSERT INTO exercise_library (name, category, movement_patterns, bilateral_unilateral, posterior_anterior, complexity, equipment, primary_muscle, supporting_muscles, muscle_bias, joint_count_level, dynamic_isometric, movement_plane, primary_joints, is_active)
  VALUES ('Close Grip Barbell Bench Press (45 degrees)', 'strength', '{"horizontal_push"}'::text[], 'bilateral', 'anterior', 2, '{"barbell"}'::text[], 'Triceps brachii', '{"Pectoralis major","Anterior deltoid","Serratus anterior"}'::text[], 'mid', 'regional', NULL, 'horizontal', '{"Shoulder","Elbow"}'::text[], true)
  ON CONFLICT (name) DO UPDATE SET
    category = EXCLUDED.category,
    movement_patterns = EXCLUDED.movement_patterns,
    bilateral_unilateral = EXCLUDED.bilateral_unilateral,
    posterior_anterior = EXCLUDED.posterior_anterior,
    complexity = EXCLUDED.complexity,
    equipment = EXCLUDED.equipment,
    primary_muscle = EXCLUDED.primary_muscle,
    supporting_muscles = EXCLUDED.supporting_muscles,
    muscle_bias = EXCLUDED.muscle_bias,
    joint_count_level = EXCLUDED.joint_count_level,
    dynamic_isometric = EXCLUDED.dynamic_isometric,
    movement_plane = EXCLUDED.movement_plane,
    primary_joints = EXCLUDED.primary_joints,
    is_active = true,
    updated_at = now();

INSERT INTO exercise_library (name, category, movement_patterns, bilateral_unilateral, posterior_anterior, complexity, equipment, primary_muscle, supporting_muscles, muscle_bias, joint_count_level, dynamic_isometric, movement_plane, primary_joints, is_active)
  VALUES ('Close Grip Barbell Bench Press (60 degrees)', 'strength', '{"vertical_push"}'::text[], 'bilateral', 'anterior', 2, '{"barbell"}'::text[], 'Triceps brachii', '{"Anterior deltoid","Upper pectoralis","Serratus anterior"}'::text[], 'mid', 'regional', NULL, 'vertical', '{"Shoulder","Elbow"}'::text[], true)
  ON CONFLICT (name) DO UPDATE SET
    category = EXCLUDED.category,
    movement_patterns = EXCLUDED.movement_patterns,
    bilateral_unilateral = EXCLUDED.bilateral_unilateral,
    posterior_anterior = EXCLUDED.posterior_anterior,
    complexity = EXCLUDED.complexity,
    equipment = EXCLUDED.equipment,
    primary_muscle = EXCLUDED.primary_muscle,
    supporting_muscles = EXCLUDED.supporting_muscles,
    muscle_bias = EXCLUDED.muscle_bias,
    joint_count_level = EXCLUDED.joint_count_level,
    dynamic_isometric = EXCLUDED.dynamic_isometric,
    movement_plane = EXCLUDED.movement_plane,
    primary_joints = EXCLUDED.primary_joints,
    is_active = true,
    updated_at = now();

INSERT INTO exercise_library (name, category, movement_patterns, bilateral_unilateral, posterior_anterior, complexity, equipment, primary_muscle, supporting_muscles, muscle_bias, joint_count_level, dynamic_isometric, movement_plane, primary_joints, is_active)
  VALUES ('Close Grip Barbell Bench Press (75 degrees)', 'strength', '{"vertical_push"}'::text[], 'bilateral', 'anterior', 2, '{"barbell"}'::text[], 'Triceps brachii', '{"Anterior deltoid","Upper pectoralis","Serratus anterior"}'::text[], 'mid', 'regional', NULL, 'vertical', '{"Shoulder","Elbow"}'::text[], true)
  ON CONFLICT (name) DO UPDATE SET
    category = EXCLUDED.category,
    movement_patterns = EXCLUDED.movement_patterns,
    bilateral_unilateral = EXCLUDED.bilateral_unilateral,
    posterior_anterior = EXCLUDED.posterior_anterior,
    complexity = EXCLUDED.complexity,
    equipment = EXCLUDED.equipment,
    primary_muscle = EXCLUDED.primary_muscle,
    supporting_muscles = EXCLUDED.supporting_muscles,
    muscle_bias = EXCLUDED.muscle_bias,
    joint_count_level = EXCLUDED.joint_count_level,
    dynamic_isometric = EXCLUDED.dynamic_isometric,
    movement_plane = EXCLUDED.movement_plane,
    primary_joints = EXCLUDED.primary_joints,
    is_active = true,
    updated_at = now();

INSERT INTO exercise_library (name, category, movement_patterns, bilateral_unilateral, posterior_anterior, complexity, equipment, primary_muscle, supporting_muscles, muscle_bias, joint_count_level, dynamic_isometric, movement_plane, primary_joints, is_active)
  VALUES ('Barbell Floor Press', 'strength', '{"horizontal_push"}'::text[], 'bilateral', 'anterior', 2, '{"barbell"}'::text[], 'Triceps brachii', '{"Pectoralis major","Anterior deltoid","Serratus anterior"}'::text[], 'mid', 'regional', NULL, 'horizontal', '{"Shoulder","Elbow"}'::text[], true)
  ON CONFLICT (name) DO UPDATE SET
    category = EXCLUDED.category,
    movement_patterns = EXCLUDED.movement_patterns,
    bilateral_unilateral = EXCLUDED.bilateral_unilateral,
    posterior_anterior = EXCLUDED.posterior_anterior,
    complexity = EXCLUDED.complexity,
    equipment = EXCLUDED.equipment,
    primary_muscle = EXCLUDED.primary_muscle,
    supporting_muscles = EXCLUDED.supporting_muscles,
    muscle_bias = EXCLUDED.muscle_bias,
    joint_count_level = EXCLUDED.joint_count_level,
    dynamic_isometric = EXCLUDED.dynamic_isometric,
    movement_plane = EXCLUDED.movement_plane,
    primary_joints = EXCLUDED.primary_joints,
    is_active = true,
    updated_at = now();

INSERT INTO exercise_library (name, category, movement_patterns, bilateral_unilateral, posterior_anterior, complexity, equipment, primary_muscle, supporting_muscles, muscle_bias, joint_count_level, dynamic_isometric, movement_plane, primary_joints, is_active)
  VALUES ('Incline Barbell Bench Press', 'strength', '{"horizontal_push"}'::text[], 'bilateral', 'anterior', 2, '{"barbell"}'::text[], 'Upper pectoralis', '{"Anterior deltoid","Triceps brachii","Serratus anterior"}'::text[], 'mid', 'regional', NULL, 'horizontal', '{"Shoulder","Elbow"}'::text[], true)
  ON CONFLICT (name) DO UPDATE SET
    category = EXCLUDED.category,
    movement_patterns = EXCLUDED.movement_patterns,
    bilateral_unilateral = EXCLUDED.bilateral_unilateral,
    posterior_anterior = EXCLUDED.posterior_anterior,
    complexity = EXCLUDED.complexity,
    equipment = EXCLUDED.equipment,
    primary_muscle = EXCLUDED.primary_muscle,
    supporting_muscles = EXCLUDED.supporting_muscles,
    muscle_bias = EXCLUDED.muscle_bias,
    joint_count_level = EXCLUDED.joint_count_level,
    dynamic_isometric = EXCLUDED.dynamic_isometric,
    movement_plane = EXCLUDED.movement_plane,
    primary_joints = EXCLUDED.primary_joints,
    is_active = true,
    updated_at = now();

INSERT INTO exercise_library (name, category, movement_patterns, bilateral_unilateral, posterior_anterior, complexity, equipment, primary_muscle, supporting_muscles, muscle_bias, joint_count_level, dynamic_isometric, movement_plane, primary_joints, is_active)
  VALUES ('Incline Barbell Bench Press (10 degrees)', 'strength', '{"horizontal_push"}'::text[], 'bilateral', 'anterior', 2, '{"barbell"}'::text[], 'Upper pectoralis', '{"Anterior deltoid","Triceps brachii","Serratus anterior"}'::text[], 'mid', 'regional', NULL, 'horizontal', '{"Shoulder","Elbow"}'::text[], true)
  ON CONFLICT (name) DO UPDATE SET
    category = EXCLUDED.category,
    movement_patterns = EXCLUDED.movement_patterns,
    bilateral_unilateral = EXCLUDED.bilateral_unilateral,
    posterior_anterior = EXCLUDED.posterior_anterior,
    complexity = EXCLUDED.complexity,
    equipment = EXCLUDED.equipment,
    primary_muscle = EXCLUDED.primary_muscle,
    supporting_muscles = EXCLUDED.supporting_muscles,
    muscle_bias = EXCLUDED.muscle_bias,
    joint_count_level = EXCLUDED.joint_count_level,
    dynamic_isometric = EXCLUDED.dynamic_isometric,
    movement_plane = EXCLUDED.movement_plane,
    primary_joints = EXCLUDED.primary_joints,
    is_active = true,
    updated_at = now();

INSERT INTO exercise_library (name, category, movement_patterns, bilateral_unilateral, posterior_anterior, complexity, equipment, primary_muscle, supporting_muscles, muscle_bias, joint_count_level, dynamic_isometric, movement_plane, primary_joints, is_active)
  VALUES ('Incline Barbell Bench Press (30 degrees)', 'strength', '{"horizontal_push"}'::text[], 'bilateral', 'anterior', 2, '{"barbell"}'::text[], 'Upper pectoralis', '{"Anterior deltoid","Triceps brachii","Serratus anterior"}'::text[], 'mid', 'regional', NULL, 'horizontal', '{"Shoulder","Elbow"}'::text[], true)
  ON CONFLICT (name) DO UPDATE SET
    category = EXCLUDED.category,
    movement_patterns = EXCLUDED.movement_patterns,
    bilateral_unilateral = EXCLUDED.bilateral_unilateral,
    posterior_anterior = EXCLUDED.posterior_anterior,
    complexity = EXCLUDED.complexity,
    equipment = EXCLUDED.equipment,
    primary_muscle = EXCLUDED.primary_muscle,
    supporting_muscles = EXCLUDED.supporting_muscles,
    muscle_bias = EXCLUDED.muscle_bias,
    joint_count_level = EXCLUDED.joint_count_level,
    dynamic_isometric = EXCLUDED.dynamic_isometric,
    movement_plane = EXCLUDED.movement_plane,
    primary_joints = EXCLUDED.primary_joints,
    is_active = true,
    updated_at = now();

INSERT INTO exercise_library (name, category, movement_patterns, bilateral_unilateral, posterior_anterior, complexity, equipment, primary_muscle, supporting_muscles, muscle_bias, joint_count_level, dynamic_isometric, movement_plane, primary_joints, is_active)
  VALUES ('Incline Barbell Bench Press (45 degrees)', 'strength', '{"horizontal_push"}'::text[], 'bilateral', 'anterior', 2, '{"barbell"}'::text[], 'Upper pectoralis', '{"Anterior deltoid","Triceps brachii","Serratus anterior"}'::text[], 'mid', 'regional', NULL, 'horizontal', '{"Shoulder","Elbow"}'::text[], true)
  ON CONFLICT (name) DO UPDATE SET
    category = EXCLUDED.category,
    movement_patterns = EXCLUDED.movement_patterns,
    bilateral_unilateral = EXCLUDED.bilateral_unilateral,
    posterior_anterior = EXCLUDED.posterior_anterior,
    complexity = EXCLUDED.complexity,
    equipment = EXCLUDED.equipment,
    primary_muscle = EXCLUDED.primary_muscle,
    supporting_muscles = EXCLUDED.supporting_muscles,
    muscle_bias = EXCLUDED.muscle_bias,
    joint_count_level = EXCLUDED.joint_count_level,
    dynamic_isometric = EXCLUDED.dynamic_isometric,
    movement_plane = EXCLUDED.movement_plane,
    primary_joints = EXCLUDED.primary_joints,
    is_active = true,
    updated_at = now();

INSERT INTO exercise_library (name, category, movement_patterns, bilateral_unilateral, posterior_anterior, complexity, equipment, primary_muscle, supporting_muscles, muscle_bias, joint_count_level, dynamic_isometric, movement_plane, primary_joints, is_active)
  VALUES ('Incline Barbell Bench Press (60 degrees)', 'strength', '{"vertical_push"}'::text[], 'bilateral', 'anterior', 2, '{"barbell"}'::text[], 'Anterior deltoid', '{"Upper pectoralis","Triceps brachii","Serratus anterior"}'::text[], 'mid', 'regional', NULL, 'vertical', '{"Shoulder","Elbow"}'::text[], true)
  ON CONFLICT (name) DO UPDATE SET
    category = EXCLUDED.category,
    movement_patterns = EXCLUDED.movement_patterns,
    bilateral_unilateral = EXCLUDED.bilateral_unilateral,
    posterior_anterior = EXCLUDED.posterior_anterior,
    complexity = EXCLUDED.complexity,
    equipment = EXCLUDED.equipment,
    primary_muscle = EXCLUDED.primary_muscle,
    supporting_muscles = EXCLUDED.supporting_muscles,
    muscle_bias = EXCLUDED.muscle_bias,
    joint_count_level = EXCLUDED.joint_count_level,
    dynamic_isometric = EXCLUDED.dynamic_isometric,
    movement_plane = EXCLUDED.movement_plane,
    primary_joints = EXCLUDED.primary_joints,
    is_active = true,
    updated_at = now();

INSERT INTO exercise_library (name, category, movement_patterns, bilateral_unilateral, posterior_anterior, complexity, equipment, primary_muscle, supporting_muscles, muscle_bias, joint_count_level, dynamic_isometric, movement_plane, primary_joints, is_active)
  VALUES ('Incline Barbell Bench Press (75 degrees)', 'strength', '{"vertical_push"}'::text[], 'bilateral', 'anterior', 2, '{"barbell"}'::text[], 'Anterior deltoid', '{"Upper pectoralis","Triceps brachii","Serratus anterior"}'::text[], 'mid', 'regional', NULL, 'vertical', '{"Shoulder","Elbow"}'::text[], true)
  ON CONFLICT (name) DO UPDATE SET
    category = EXCLUDED.category,
    movement_patterns = EXCLUDED.movement_patterns,
    bilateral_unilateral = EXCLUDED.bilateral_unilateral,
    posterior_anterior = EXCLUDED.posterior_anterior,
    complexity = EXCLUDED.complexity,
    equipment = EXCLUDED.equipment,
    primary_muscle = EXCLUDED.primary_muscle,
    supporting_muscles = EXCLUDED.supporting_muscles,
    muscle_bias = EXCLUDED.muscle_bias,
    joint_count_level = EXCLUDED.joint_count_level,
    dynamic_isometric = EXCLUDED.dynamic_isometric,
    movement_plane = EXCLUDED.movement_plane,
    primary_joints = EXCLUDED.primary_joints,
    is_active = true,
    updated_at = now();

INSERT INTO exercise_library (name, category, movement_patterns, bilateral_unilateral, posterior_anterior, complexity, equipment, primary_muscle, supporting_muscles, muscle_bias, joint_count_level, dynamic_isometric, movement_plane, primary_joints, is_active)
  VALUES ('Decline Barbell Bench Press', 'strength', '{"horizontal_push"}'::text[], 'bilateral', 'anterior', 2, '{"barbell"}'::text[], 'Pectoralis major', '{"Triceps brachii","Anterior deltoid","Serratus anterior"}'::text[], 'mid', 'regional', NULL, 'horizontal', '{"Shoulder","Elbow"}'::text[], true)
  ON CONFLICT (name) DO UPDATE SET
    category = EXCLUDED.category,
    movement_patterns = EXCLUDED.movement_patterns,
    bilateral_unilateral = EXCLUDED.bilateral_unilateral,
    posterior_anterior = EXCLUDED.posterior_anterior,
    complexity = EXCLUDED.complexity,
    equipment = EXCLUDED.equipment,
    primary_muscle = EXCLUDED.primary_muscle,
    supporting_muscles = EXCLUDED.supporting_muscles,
    muscle_bias = EXCLUDED.muscle_bias,
    joint_count_level = EXCLUDED.joint_count_level,
    dynamic_isometric = EXCLUDED.dynamic_isometric,
    movement_plane = EXCLUDED.movement_plane,
    primary_joints = EXCLUDED.primary_joints,
    is_active = true,
    updated_at = now();

INSERT INTO exercise_library (name, category, movement_patterns, bilateral_unilateral, posterior_anterior, complexity, equipment, primary_muscle, supporting_muscles, muscle_bias, joint_count_level, dynamic_isometric, movement_plane, primary_joints, is_active)
  VALUES ('Dumbbell Bench Press', 'strength', '{"horizontal_push"}'::text[], 'bilateral', 'anterior', 2, '{"dumbbell"}'::text[], 'Pectoralis major', '{"Anterior deltoid","Triceps brachii","Serratus anterior"}'::text[], 'mid', 'regional', NULL, 'horizontal', '{"Shoulder","Elbow"}'::text[], true)
  ON CONFLICT (name) DO UPDATE SET
    category = EXCLUDED.category,
    movement_patterns = EXCLUDED.movement_patterns,
    bilateral_unilateral = EXCLUDED.bilateral_unilateral,
    posterior_anterior = EXCLUDED.posterior_anterior,
    complexity = EXCLUDED.complexity,
    equipment = EXCLUDED.equipment,
    primary_muscle = EXCLUDED.primary_muscle,
    supporting_muscles = EXCLUDED.supporting_muscles,
    muscle_bias = EXCLUDED.muscle_bias,
    joint_count_level = EXCLUDED.joint_count_level,
    dynamic_isometric = EXCLUDED.dynamic_isometric,
    movement_plane = EXCLUDED.movement_plane,
    primary_joints = EXCLUDED.primary_joints,
    is_active = true,
    updated_at = now();

INSERT INTO exercise_library (name, category, movement_patterns, bilateral_unilateral, posterior_anterior, complexity, equipment, primary_muscle, supporting_muscles, muscle_bias, joint_count_level, dynamic_isometric, movement_plane, primary_joints, is_active)
  VALUES ('Dumbbell Bench Press (neutral grip)', 'strength', '{"horizontal_push"}'::text[], 'bilateral', 'anterior', 2, '{"dumbbell"}'::text[], 'Pectoralis major', '{"Triceps brachii","Anterior deltoid","Serratus anterior"}'::text[], 'mid', 'regional', NULL, 'horizontal', '{"Shoulder","Elbow"}'::text[], true)
  ON CONFLICT (name) DO UPDATE SET
    category = EXCLUDED.category,
    movement_patterns = EXCLUDED.movement_patterns,
    bilateral_unilateral = EXCLUDED.bilateral_unilateral,
    posterior_anterior = EXCLUDED.posterior_anterior,
    complexity = EXCLUDED.complexity,
    equipment = EXCLUDED.equipment,
    primary_muscle = EXCLUDED.primary_muscle,
    supporting_muscles = EXCLUDED.supporting_muscles,
    muscle_bias = EXCLUDED.muscle_bias,
    joint_count_level = EXCLUDED.joint_count_level,
    dynamic_isometric = EXCLUDED.dynamic_isometric,
    movement_plane = EXCLUDED.movement_plane,
    primary_joints = EXCLUDED.primary_joints,
    is_active = true,
    updated_at = now();

INSERT INTO exercise_library (name, category, movement_patterns, bilateral_unilateral, posterior_anterior, complexity, equipment, primary_muscle, supporting_muscles, muscle_bias, joint_count_level, dynamic_isometric, movement_plane, primary_joints, is_active)
  VALUES ('Dumbbell Bench Press (semi-pronated grip)', 'strength', '{"horizontal_push"}'::text[], 'bilateral', 'anterior', 2, '{"dumbbell"}'::text[], 'Pectoralis major', '{"Anterior deltoid","Triceps brachii","Serratus anterior"}'::text[], 'mid', 'regional', NULL, 'horizontal', '{"Shoulder","Elbow"}'::text[], true)
  ON CONFLICT (name) DO UPDATE SET
    category = EXCLUDED.category,
    movement_patterns = EXCLUDED.movement_patterns,
    bilateral_unilateral = EXCLUDED.bilateral_unilateral,
    posterior_anterior = EXCLUDED.posterior_anterior,
    complexity = EXCLUDED.complexity,
    equipment = EXCLUDED.equipment,
    primary_muscle = EXCLUDED.primary_muscle,
    supporting_muscles = EXCLUDED.supporting_muscles,
    muscle_bias = EXCLUDED.muscle_bias,
    joint_count_level = EXCLUDED.joint_count_level,
    dynamic_isometric = EXCLUDED.dynamic_isometric,
    movement_plane = EXCLUDED.movement_plane,
    primary_joints = EXCLUDED.primary_joints,
    is_active = true,
    updated_at = now();

INSERT INTO exercise_library (name, category, movement_patterns, bilateral_unilateral, posterior_anterior, complexity, equipment, primary_muscle, supporting_muscles, muscle_bias, joint_count_level, dynamic_isometric, movement_plane, primary_joints, is_active)
  VALUES ('Dumbbell Bench Press (pronated grip)', 'strength', '{"horizontal_push"}'::text[], 'bilateral', 'anterior', 2, '{"dumbbell"}'::text[], 'Pectoralis major', '{"Anterior deltoid","Triceps brachii","Serratus anterior"}'::text[], 'mid', 'regional', NULL, 'horizontal', '{"Shoulder","Elbow"}'::text[], true)
  ON CONFLICT (name) DO UPDATE SET
    category = EXCLUDED.category,
    movement_patterns = EXCLUDED.movement_patterns,
    bilateral_unilateral = EXCLUDED.bilateral_unilateral,
    posterior_anterior = EXCLUDED.posterior_anterior,
    complexity = EXCLUDED.complexity,
    equipment = EXCLUDED.equipment,
    primary_muscle = EXCLUDED.primary_muscle,
    supporting_muscles = EXCLUDED.supporting_muscles,
    muscle_bias = EXCLUDED.muscle_bias,
    joint_count_level = EXCLUDED.joint_count_level,
    dynamic_isometric = EXCLUDED.dynamic_isometric,
    movement_plane = EXCLUDED.movement_plane,
    primary_joints = EXCLUDED.primary_joints,
    is_active = true,
    updated_at = now();

INSERT INTO exercise_library (name, category, movement_patterns, bilateral_unilateral, posterior_anterior, complexity, equipment, primary_muscle, supporting_muscles, muscle_bias, joint_count_level, dynamic_isometric, movement_plane, primary_joints, is_active)
  VALUES ('Incline Dumbbell Bench Press (10 degrees)', 'strength', '{"horizontal_push"}'::text[], 'bilateral', 'anterior', 2, '{"dumbbell"}'::text[], 'Upper pectoralis', '{"Anterior deltoid","Triceps brachii","Serratus anterior"}'::text[], 'mid', 'regional', NULL, 'horizontal', '{"Shoulder","Elbow"}'::text[], true)
  ON CONFLICT (name) DO UPDATE SET
    category = EXCLUDED.category,
    movement_patterns = EXCLUDED.movement_patterns,
    bilateral_unilateral = EXCLUDED.bilateral_unilateral,
    posterior_anterior = EXCLUDED.posterior_anterior,
    complexity = EXCLUDED.complexity,
    equipment = EXCLUDED.equipment,
    primary_muscle = EXCLUDED.primary_muscle,
    supporting_muscles = EXCLUDED.supporting_muscles,
    muscle_bias = EXCLUDED.muscle_bias,
    joint_count_level = EXCLUDED.joint_count_level,
    dynamic_isometric = EXCLUDED.dynamic_isometric,
    movement_plane = EXCLUDED.movement_plane,
    primary_joints = EXCLUDED.primary_joints,
    is_active = true,
    updated_at = now();

INSERT INTO exercise_library (name, category, movement_patterns, bilateral_unilateral, posterior_anterior, complexity, equipment, primary_muscle, supporting_muscles, muscle_bias, joint_count_level, dynamic_isometric, movement_plane, primary_joints, is_active)
  VALUES ('Incline Dumbbell Bench Press (30 degrees)', 'strength', '{"horizontal_push"}'::text[], 'bilateral', 'anterior', 2, '{"dumbbell"}'::text[], 'Upper pectoralis', '{"Anterior deltoid","Triceps brachii","Serratus anterior"}'::text[], 'mid', 'regional', NULL, 'horizontal', '{"Shoulder","Elbow"}'::text[], true)
  ON CONFLICT (name) DO UPDATE SET
    category = EXCLUDED.category,
    movement_patterns = EXCLUDED.movement_patterns,
    bilateral_unilateral = EXCLUDED.bilateral_unilateral,
    posterior_anterior = EXCLUDED.posterior_anterior,
    complexity = EXCLUDED.complexity,
    equipment = EXCLUDED.equipment,
    primary_muscle = EXCLUDED.primary_muscle,
    supporting_muscles = EXCLUDED.supporting_muscles,
    muscle_bias = EXCLUDED.muscle_bias,
    joint_count_level = EXCLUDED.joint_count_level,
    dynamic_isometric = EXCLUDED.dynamic_isometric,
    movement_plane = EXCLUDED.movement_plane,
    primary_joints = EXCLUDED.primary_joints,
    is_active = true,
    updated_at = now();

INSERT INTO exercise_library (name, category, movement_patterns, bilateral_unilateral, posterior_anterior, complexity, equipment, primary_muscle, supporting_muscles, muscle_bias, joint_count_level, dynamic_isometric, movement_plane, primary_joints, is_active)
  VALUES ('Incline Dumbbell Bench Press (45 degrees)', 'strength', '{"horizontal_push"}'::text[], 'bilateral', 'anterior', 2, '{"dumbbell"}'::text[], 'Upper pectoralis', '{"Anterior deltoid","Triceps brachii","Serratus anterior"}'::text[], 'mid', 'regional', NULL, 'horizontal', '{"Shoulder","Elbow"}'::text[], true)
  ON CONFLICT (name) DO UPDATE SET
    category = EXCLUDED.category,
    movement_patterns = EXCLUDED.movement_patterns,
    bilateral_unilateral = EXCLUDED.bilateral_unilateral,
    posterior_anterior = EXCLUDED.posterior_anterior,
    complexity = EXCLUDED.complexity,
    equipment = EXCLUDED.equipment,
    primary_muscle = EXCLUDED.primary_muscle,
    supporting_muscles = EXCLUDED.supporting_muscles,
    muscle_bias = EXCLUDED.muscle_bias,
    joint_count_level = EXCLUDED.joint_count_level,
    dynamic_isometric = EXCLUDED.dynamic_isometric,
    movement_plane = EXCLUDED.movement_plane,
    primary_joints = EXCLUDED.primary_joints,
    is_active = true,
    updated_at = now();

INSERT INTO exercise_library (name, category, movement_patterns, bilateral_unilateral, posterior_anterior, complexity, equipment, primary_muscle, supporting_muscles, muscle_bias, joint_count_level, dynamic_isometric, movement_plane, primary_joints, is_active)
  VALUES ('Incline Dumbbell Bench Press (60 degrees)', 'strength', '{"vertical_push"}'::text[], 'bilateral', 'anterior', 2, '{"dumbbell"}'::text[], 'Anterior deltoid', '{"Upper pectoralis","Triceps brachii","Serratus anterior"}'::text[], 'mid', 'regional', NULL, 'vertical', '{"Shoulder","Elbow"}'::text[], true)
  ON CONFLICT (name) DO UPDATE SET
    category = EXCLUDED.category,
    movement_patterns = EXCLUDED.movement_patterns,
    bilateral_unilateral = EXCLUDED.bilateral_unilateral,
    posterior_anterior = EXCLUDED.posterior_anterior,
    complexity = EXCLUDED.complexity,
    equipment = EXCLUDED.equipment,
    primary_muscle = EXCLUDED.primary_muscle,
    supporting_muscles = EXCLUDED.supporting_muscles,
    muscle_bias = EXCLUDED.muscle_bias,
    joint_count_level = EXCLUDED.joint_count_level,
    dynamic_isometric = EXCLUDED.dynamic_isometric,
    movement_plane = EXCLUDED.movement_plane,
    primary_joints = EXCLUDED.primary_joints,
    is_active = true,
    updated_at = now();

INSERT INTO exercise_library (name, category, movement_patterns, bilateral_unilateral, posterior_anterior, complexity, equipment, primary_muscle, supporting_muscles, muscle_bias, joint_count_level, dynamic_isometric, movement_plane, primary_joints, is_active)
  VALUES ('Incline Dumbbell Bench Press (75 degrees)', 'strength', '{"vertical_push"}'::text[], 'bilateral', 'anterior', 2, '{"dumbbell"}'::text[], 'Anterior deltoid', '{"Upper pectoralis","Triceps brachii","Serratus anterior"}'::text[], 'mid', 'regional', NULL, 'vertical', '{"Shoulder","Elbow"}'::text[], true)
  ON CONFLICT (name) DO UPDATE SET
    category = EXCLUDED.category,
    movement_patterns = EXCLUDED.movement_patterns,
    bilateral_unilateral = EXCLUDED.bilateral_unilateral,
    posterior_anterior = EXCLUDED.posterior_anterior,
    complexity = EXCLUDED.complexity,
    equipment = EXCLUDED.equipment,
    primary_muscle = EXCLUDED.primary_muscle,
    supporting_muscles = EXCLUDED.supporting_muscles,
    muscle_bias = EXCLUDED.muscle_bias,
    joint_count_level = EXCLUDED.joint_count_level,
    dynamic_isometric = EXCLUDED.dynamic_isometric,
    movement_plane = EXCLUDED.movement_plane,
    primary_joints = EXCLUDED.primary_joints,
    is_active = true,
    updated_at = now();

INSERT INTO exercise_library (name, category, movement_patterns, bilateral_unilateral, posterior_anterior, complexity, equipment, primary_muscle, supporting_muscles, muscle_bias, joint_count_level, dynamic_isometric, movement_plane, primary_joints, is_active)
  VALUES ('Dumbbell Floor Press', 'strength', '{"horizontal_push"}'::text[], 'bilateral', 'anterior', 2, '{"dumbbell"}'::text[], 'Triceps brachii', '{"Pectoralis major","Anterior deltoid","Serratus anterior"}'::text[], 'mid', 'regional', NULL, 'horizontal', '{"Shoulder","Elbow"}'::text[], true)
  ON CONFLICT (name) DO UPDATE SET
    category = EXCLUDED.category,
    movement_patterns = EXCLUDED.movement_patterns,
    bilateral_unilateral = EXCLUDED.bilateral_unilateral,
    posterior_anterior = EXCLUDED.posterior_anterior,
    complexity = EXCLUDED.complexity,
    equipment = EXCLUDED.equipment,
    primary_muscle = EXCLUDED.primary_muscle,
    supporting_muscles = EXCLUDED.supporting_muscles,
    muscle_bias = EXCLUDED.muscle_bias,
    joint_count_level = EXCLUDED.joint_count_level,
    dynamic_isometric = EXCLUDED.dynamic_isometric,
    movement_plane = EXCLUDED.movement_plane,
    primary_joints = EXCLUDED.primary_joints,
    is_active = true,
    updated_at = now();

INSERT INTO exercise_library (name, category, movement_patterns, bilateral_unilateral, posterior_anterior, complexity, equipment, primary_muscle, supporting_muscles, muscle_bias, joint_count_level, dynamic_isometric, movement_plane, primary_joints, is_active)
  VALUES ('Smith Press Bench Press', 'strength', '{"horizontal_push"}'::text[], 'bilateral', 'anterior', 1, '{}'::text[], 'Pectoralis major', '{"Anterior deltoid","Triceps brachii","Serratus anterior"}'::text[], 'mid', 'regional', NULL, 'horizontal', '{"Shoulder","Elbow"}'::text[], true)
  ON CONFLICT (name) DO UPDATE SET
    category = EXCLUDED.category,
    movement_patterns = EXCLUDED.movement_patterns,
    bilateral_unilateral = EXCLUDED.bilateral_unilateral,
    posterior_anterior = EXCLUDED.posterior_anterior,
    complexity = EXCLUDED.complexity,
    equipment = EXCLUDED.equipment,
    primary_muscle = EXCLUDED.primary_muscle,
    supporting_muscles = EXCLUDED.supporting_muscles,
    muscle_bias = EXCLUDED.muscle_bias,
    joint_count_level = EXCLUDED.joint_count_level,
    dynamic_isometric = EXCLUDED.dynamic_isometric,
    movement_plane = EXCLUDED.movement_plane,
    primary_joints = EXCLUDED.primary_joints,
    is_active = true,
    updated_at = now();

INSERT INTO exercise_library (name, category, movement_patterns, bilateral_unilateral, posterior_anterior, complexity, equipment, primary_muscle, supporting_muscles, muscle_bias, joint_count_level, dynamic_isometric, movement_plane, primary_joints, is_active)
  VALUES ('Smith Press Close Grip Bench Press', 'strength', '{"horizontal_push"}'::text[], 'bilateral', 'anterior', 1, '{}'::text[], 'Triceps brachii', '{"Pectoralis major","Anterior deltoid","Serratus anterior"}'::text[], 'mid', 'regional', NULL, 'horizontal', '{"Shoulder","Elbow"}'::text[], true)
  ON CONFLICT (name) DO UPDATE SET
    category = EXCLUDED.category,
    movement_patterns = EXCLUDED.movement_patterns,
    bilateral_unilateral = EXCLUDED.bilateral_unilateral,
    posterior_anterior = EXCLUDED.posterior_anterior,
    complexity = EXCLUDED.complexity,
    equipment = EXCLUDED.equipment,
    primary_muscle = EXCLUDED.primary_muscle,
    supporting_muscles = EXCLUDED.supporting_muscles,
    muscle_bias = EXCLUDED.muscle_bias,
    joint_count_level = EXCLUDED.joint_count_level,
    dynamic_isometric = EXCLUDED.dynamic_isometric,
    movement_plane = EXCLUDED.movement_plane,
    primary_joints = EXCLUDED.primary_joints,
    is_active = true,
    updated_at = now();

INSERT INTO exercise_library (name, category, movement_patterns, bilateral_unilateral, posterior_anterior, complexity, equipment, primary_muscle, supporting_muscles, muscle_bias, joint_count_level, dynamic_isometric, movement_plane, primary_joints, is_active)
  VALUES ('Smith Press Incline Bench Press (10 degrees)', 'strength', '{"horizontal_push"}'::text[], 'bilateral', 'anterior', 1, '{}'::text[], 'Upper pectoralis', '{"Anterior deltoid","Triceps brachii","Serratus anterior"}'::text[], 'mid', 'regional', NULL, 'horizontal', '{"Shoulder","Elbow"}'::text[], true)
  ON CONFLICT (name) DO UPDATE SET
    category = EXCLUDED.category,
    movement_patterns = EXCLUDED.movement_patterns,
    bilateral_unilateral = EXCLUDED.bilateral_unilateral,
    posterior_anterior = EXCLUDED.posterior_anterior,
    complexity = EXCLUDED.complexity,
    equipment = EXCLUDED.equipment,
    primary_muscle = EXCLUDED.primary_muscle,
    supporting_muscles = EXCLUDED.supporting_muscles,
    muscle_bias = EXCLUDED.muscle_bias,
    joint_count_level = EXCLUDED.joint_count_level,
    dynamic_isometric = EXCLUDED.dynamic_isometric,
    movement_plane = EXCLUDED.movement_plane,
    primary_joints = EXCLUDED.primary_joints,
    is_active = true,
    updated_at = now();

INSERT INTO exercise_library (name, category, movement_patterns, bilateral_unilateral, posterior_anterior, complexity, equipment, primary_muscle, supporting_muscles, muscle_bias, joint_count_level, dynamic_isometric, movement_plane, primary_joints, is_active)
  VALUES ('Smith Press Incline Bench Press (30 degrees)', 'strength', '{"horizontal_push"}'::text[], 'bilateral', 'anterior', 1, '{}'::text[], 'Upper pectoralis', '{"Anterior deltoid","Triceps brachii","Serratus anterior"}'::text[], 'mid', 'regional', NULL, 'horizontal', '{"Shoulder","Elbow"}'::text[], true)
  ON CONFLICT (name) DO UPDATE SET
    category = EXCLUDED.category,
    movement_patterns = EXCLUDED.movement_patterns,
    bilateral_unilateral = EXCLUDED.bilateral_unilateral,
    posterior_anterior = EXCLUDED.posterior_anterior,
    complexity = EXCLUDED.complexity,
    equipment = EXCLUDED.equipment,
    primary_muscle = EXCLUDED.primary_muscle,
    supporting_muscles = EXCLUDED.supporting_muscles,
    muscle_bias = EXCLUDED.muscle_bias,
    joint_count_level = EXCLUDED.joint_count_level,
    dynamic_isometric = EXCLUDED.dynamic_isometric,
    movement_plane = EXCLUDED.movement_plane,
    primary_joints = EXCLUDED.primary_joints,
    is_active = true,
    updated_at = now();

INSERT INTO exercise_library (name, category, movement_patterns, bilateral_unilateral, posterior_anterior, complexity, equipment, primary_muscle, supporting_muscles, muscle_bias, joint_count_level, dynamic_isometric, movement_plane, primary_joints, is_active)
  VALUES ('Smith Press Incline Bench Press (45 degrees)', 'strength', '{"horizontal_push"}'::text[], 'bilateral', 'anterior', 1, '{}'::text[], 'Upper pectoralis', '{"Anterior deltoid","Triceps brachii","Serratus anterior"}'::text[], 'mid', 'regional', NULL, 'horizontal', '{"Shoulder","Elbow"}'::text[], true)
  ON CONFLICT (name) DO UPDATE SET
    category = EXCLUDED.category,
    movement_patterns = EXCLUDED.movement_patterns,
    bilateral_unilateral = EXCLUDED.bilateral_unilateral,
    posterior_anterior = EXCLUDED.posterior_anterior,
    complexity = EXCLUDED.complexity,
    equipment = EXCLUDED.equipment,
    primary_muscle = EXCLUDED.primary_muscle,
    supporting_muscles = EXCLUDED.supporting_muscles,
    muscle_bias = EXCLUDED.muscle_bias,
    joint_count_level = EXCLUDED.joint_count_level,
    dynamic_isometric = EXCLUDED.dynamic_isometric,
    movement_plane = EXCLUDED.movement_plane,
    primary_joints = EXCLUDED.primary_joints,
    is_active = true,
    updated_at = now();

INSERT INTO exercise_library (name, category, movement_patterns, bilateral_unilateral, posterior_anterior, complexity, equipment, primary_muscle, supporting_muscles, muscle_bias, joint_count_level, dynamic_isometric, movement_plane, primary_joints, is_active)
  VALUES ('Smith Press Incline Bench Press (60 degrees)', 'strength', '{"vertical_push"}'::text[], 'bilateral', 'anterior', 1, '{}'::text[], 'Anterior deltoid', '{"Upper pectoralis","Triceps brachii","Serratus anterior"}'::text[], 'mid', 'regional', NULL, 'vertical', '{"Shoulder","Elbow"}'::text[], true)
  ON CONFLICT (name) DO UPDATE SET
    category = EXCLUDED.category,
    movement_patterns = EXCLUDED.movement_patterns,
    bilateral_unilateral = EXCLUDED.bilateral_unilateral,
    posterior_anterior = EXCLUDED.posterior_anterior,
    complexity = EXCLUDED.complexity,
    equipment = EXCLUDED.equipment,
    primary_muscle = EXCLUDED.primary_muscle,
    supporting_muscles = EXCLUDED.supporting_muscles,
    muscle_bias = EXCLUDED.muscle_bias,
    joint_count_level = EXCLUDED.joint_count_level,
    dynamic_isometric = EXCLUDED.dynamic_isometric,
    movement_plane = EXCLUDED.movement_plane,
    primary_joints = EXCLUDED.primary_joints,
    is_active = true,
    updated_at = now();

INSERT INTO exercise_library (name, category, movement_patterns, bilateral_unilateral, posterior_anterior, complexity, equipment, primary_muscle, supporting_muscles, muscle_bias, joint_count_level, dynamic_isometric, movement_plane, primary_joints, is_active)
  VALUES ('Smith Press Incline Bench Press (75 degrees)', 'strength', '{"vertical_push"}'::text[], 'bilateral', 'anterior', 1, '{}'::text[], 'Anterior deltoid', '{"Upper pectoralis","Triceps brachii","Serratus anterior"}'::text[], 'mid', 'regional', NULL, 'vertical', '{"Shoulder","Elbow"}'::text[], true)
  ON CONFLICT (name) DO UPDATE SET
    category = EXCLUDED.category,
    movement_patterns = EXCLUDED.movement_patterns,
    bilateral_unilateral = EXCLUDED.bilateral_unilateral,
    posterior_anterior = EXCLUDED.posterior_anterior,
    complexity = EXCLUDED.complexity,
    equipment = EXCLUDED.equipment,
    primary_muscle = EXCLUDED.primary_muscle,
    supporting_muscles = EXCLUDED.supporting_muscles,
    muscle_bias = EXCLUDED.muscle_bias,
    joint_count_level = EXCLUDED.joint_count_level,
    dynamic_isometric = EXCLUDED.dynamic_isometric,
    movement_plane = EXCLUDED.movement_plane,
    primary_joints = EXCLUDED.primary_joints,
    is_active = true,
    updated_at = now();

INSERT INTO exercise_library (name, category, movement_patterns, bilateral_unilateral, posterior_anterior, complexity, equipment, primary_muscle, supporting_muscles, muscle_bias, joint_count_level, dynamic_isometric, movement_plane, primary_joints, is_active)
  VALUES ('Smith Press Decline Bench Press', 'strength', '{"horizontal_push"}'::text[], 'bilateral', 'anterior', 1, '{}'::text[], 'Pectoralis major', '{"Anterior deltoid","Triceps brachii","Serratus anterior"}'::text[], 'shortened', 'regional', NULL, 'horizontal', '{"Shoulder","Elbow"}'::text[], true)
  ON CONFLICT (name) DO UPDATE SET
    category = EXCLUDED.category,
    movement_patterns = EXCLUDED.movement_patterns,
    bilateral_unilateral = EXCLUDED.bilateral_unilateral,
    posterior_anterior = EXCLUDED.posterior_anterior,
    complexity = EXCLUDED.complexity,
    equipment = EXCLUDED.equipment,
    primary_muscle = EXCLUDED.primary_muscle,
    supporting_muscles = EXCLUDED.supporting_muscles,
    muscle_bias = EXCLUDED.muscle_bias,
    joint_count_level = EXCLUDED.joint_count_level,
    dynamic_isometric = EXCLUDED.dynamic_isometric,
    movement_plane = EXCLUDED.movement_plane,
    primary_joints = EXCLUDED.primary_joints,
    is_active = true,
    updated_at = now();

INSERT INTO exercise_library (name, category, movement_patterns, bilateral_unilateral, posterior_anterior, complexity, equipment, primary_muscle, supporting_muscles, muscle_bias, joint_count_level, dynamic_isometric, movement_plane, primary_joints, is_active)
  VALUES ('Smith Press Floor Press', 'strength', '{"horizontal_push"}'::text[], 'bilateral', 'anterior', 1, '{}'::text[], 'Triceps brachii', '{"Pectoralis major","Anterior deltoid","Serratus anterior"}'::text[], 'shortened', 'regional', NULL, 'horizontal', '{"Shoulder","Elbow"}'::text[], true)
  ON CONFLICT (name) DO UPDATE SET
    category = EXCLUDED.category,
    movement_patterns = EXCLUDED.movement_patterns,
    bilateral_unilateral = EXCLUDED.bilateral_unilateral,
    posterior_anterior = EXCLUDED.posterior_anterior,
    complexity = EXCLUDED.complexity,
    equipment = EXCLUDED.equipment,
    primary_muscle = EXCLUDED.primary_muscle,
    supporting_muscles = EXCLUDED.supporting_muscles,
    muscle_bias = EXCLUDED.muscle_bias,
    joint_count_level = EXCLUDED.joint_count_level,
    dynamic_isometric = EXCLUDED.dynamic_isometric,
    movement_plane = EXCLUDED.movement_plane,
    primary_joints = EXCLUDED.primary_joints,
    is_active = true,
    updated_at = now();

INSERT INTO exercise_library (name, category, movement_patterns, bilateral_unilateral, posterior_anterior, complexity, equipment, primary_muscle, supporting_muscles, muscle_bias, joint_count_level, dynamic_isometric, movement_plane, primary_joints, is_active)
  VALUES ('Machine Chest Press', 'strength', '{"horizontal_push"}'::text[], 'bilateral', 'anterior', 1, '{"fixed_machine"}'::text[], 'Pectoralis major', '{"Anterior deltoid","Triceps brachii","Serratus anterior"}'::text[], 'mid', 'regional', NULL, 'horizontal', '{"Shoulder","Elbow"}'::text[], true)
  ON CONFLICT (name) DO UPDATE SET
    category = EXCLUDED.category,
    movement_patterns = EXCLUDED.movement_patterns,
    bilateral_unilateral = EXCLUDED.bilateral_unilateral,
    posterior_anterior = EXCLUDED.posterior_anterior,
    complexity = EXCLUDED.complexity,
    equipment = EXCLUDED.equipment,
    primary_muscle = EXCLUDED.primary_muscle,
    supporting_muscles = EXCLUDED.supporting_muscles,
    muscle_bias = EXCLUDED.muscle_bias,
    joint_count_level = EXCLUDED.joint_count_level,
    dynamic_isometric = EXCLUDED.dynamic_isometric,
    movement_plane = EXCLUDED.movement_plane,
    primary_joints = EXCLUDED.primary_joints,
    is_active = true,
    updated_at = now();

INSERT INTO exercise_library (name, category, movement_patterns, bilateral_unilateral, posterior_anterior, complexity, equipment, primary_muscle, supporting_muscles, muscle_bias, joint_count_level, dynamic_isometric, movement_plane, primary_joints, is_active)
  VALUES ('Incline Machine Chest Press', 'strength', '{"horizontal_push"}'::text[], 'bilateral', 'anterior', 1, '{"fixed_machine"}'::text[], 'Upper pectoralis', '{"Anterior deltoid","Triceps brachii","Serratus anterior"}'::text[], 'mid', 'regional', NULL, 'horizontal', '{"Shoulder","Elbow"}'::text[], true)
  ON CONFLICT (name) DO UPDATE SET
    category = EXCLUDED.category,
    movement_patterns = EXCLUDED.movement_patterns,
    bilateral_unilateral = EXCLUDED.bilateral_unilateral,
    posterior_anterior = EXCLUDED.posterior_anterior,
    complexity = EXCLUDED.complexity,
    equipment = EXCLUDED.equipment,
    primary_muscle = EXCLUDED.primary_muscle,
    supporting_muscles = EXCLUDED.supporting_muscles,
    muscle_bias = EXCLUDED.muscle_bias,
    joint_count_level = EXCLUDED.joint_count_level,
    dynamic_isometric = EXCLUDED.dynamic_isometric,
    movement_plane = EXCLUDED.movement_plane,
    primary_joints = EXCLUDED.primary_joints,
    is_active = true,
    updated_at = now();

INSERT INTO exercise_library (name, category, movement_patterns, bilateral_unilateral, posterior_anterior, complexity, equipment, primary_muscle, supporting_muscles, muscle_bias, joint_count_level, dynamic_isometric, movement_plane, primary_joints, is_active)
  VALUES ('Cable Chest Press (standing, sternal fibers, chest height)', 'strength', '{"horizontal_push"}'::text[], 'bilateral', 'anterior', 2, '{"cable"}'::text[], 'Pectoralis major', '{"Anterior deltoid","Triceps brachii","Serratus anterior"}'::text[], 'mid', 'regional', NULL, 'horizontal', '{"Shoulder","Elbow"}'::text[], true)
  ON CONFLICT (name) DO UPDATE SET
    category = EXCLUDED.category,
    movement_patterns = EXCLUDED.movement_patterns,
    bilateral_unilateral = EXCLUDED.bilateral_unilateral,
    posterior_anterior = EXCLUDED.posterior_anterior,
    complexity = EXCLUDED.complexity,
    equipment = EXCLUDED.equipment,
    primary_muscle = EXCLUDED.primary_muscle,
    supporting_muscles = EXCLUDED.supporting_muscles,
    muscle_bias = EXCLUDED.muscle_bias,
    joint_count_level = EXCLUDED.joint_count_level,
    dynamic_isometric = EXCLUDED.dynamic_isometric,
    movement_plane = EXCLUDED.movement_plane,
    primary_joints = EXCLUDED.primary_joints,
    is_active = true,
    updated_at = now();

INSERT INTO exercise_library (name, category, movement_patterns, bilateral_unilateral, posterior_anterior, complexity, equipment, primary_muscle, supporting_muscles, muscle_bias, joint_count_level, dynamic_isometric, movement_plane, primary_joints, is_active)
  VALUES ('Cable Chest Press (standing, clavicular fibers, low to high)', 'strength', '{"horizontal_push"}'::text[], 'bilateral', 'anterior', 2, '{"cable"}'::text[], 'Upper pectoralis', '{"Anterior deltoid","Triceps brachii","Serratus anterior"}'::text[], 'lengthened', 'regional', NULL, 'horizontal', '{"Shoulder","Elbow"}'::text[], true)
  ON CONFLICT (name) DO UPDATE SET
    category = EXCLUDED.category,
    movement_patterns = EXCLUDED.movement_patterns,
    bilateral_unilateral = EXCLUDED.bilateral_unilateral,
    posterior_anterior = EXCLUDED.posterior_anterior,
    complexity = EXCLUDED.complexity,
    equipment = EXCLUDED.equipment,
    primary_muscle = EXCLUDED.primary_muscle,
    supporting_muscles = EXCLUDED.supporting_muscles,
    muscle_bias = EXCLUDED.muscle_bias,
    joint_count_level = EXCLUDED.joint_count_level,
    dynamic_isometric = EXCLUDED.dynamic_isometric,
    movement_plane = EXCLUDED.movement_plane,
    primary_joints = EXCLUDED.primary_joints,
    is_active = true,
    updated_at = now();

INSERT INTO exercise_library (name, category, movement_patterns, bilateral_unilateral, posterior_anterior, complexity, equipment, primary_muscle, supporting_muscles, muscle_bias, joint_count_level, dynamic_isometric, movement_plane, primary_joints, is_active)
  VALUES ('Cable Chest Press (standing, costal fibers, high to low)', 'strength', '{"horizontal_push"}'::text[], 'bilateral', 'anterior', 2, '{"cable"}'::text[], 'Lower pectoralis', '{"Triceps brachii","Anterior deltoid","Serratus anterior"}'::text[], 'shortened', 'regional', NULL, 'horizontal', '{"Shoulder","Elbow"}'::text[], true)
  ON CONFLICT (name) DO UPDATE SET
    category = EXCLUDED.category,
    movement_patterns = EXCLUDED.movement_patterns,
    bilateral_unilateral = EXCLUDED.bilateral_unilateral,
    posterior_anterior = EXCLUDED.posterior_anterior,
    complexity = EXCLUDED.complexity,
    equipment = EXCLUDED.equipment,
    primary_muscle = EXCLUDED.primary_muscle,
    supporting_muscles = EXCLUDED.supporting_muscles,
    muscle_bias = EXCLUDED.muscle_bias,
    joint_count_level = EXCLUDED.joint_count_level,
    dynamic_isometric = EXCLUDED.dynamic_isometric,
    movement_plane = EXCLUDED.movement_plane,
    primary_joints = EXCLUDED.primary_joints,
    is_active = true,
    updated_at = now();

INSERT INTO exercise_library (name, category, movement_patterns, bilateral_unilateral, posterior_anterior, complexity, equipment, primary_muscle, supporting_muscles, muscle_bias, joint_count_level, dynamic_isometric, movement_plane, primary_joints, is_active)
  VALUES ('Cable Chest Press (seated/bench)', 'strength', '{"horizontal_push"}'::text[], 'bilateral', 'anterior', 2, '{"cable"}'::text[], 'Pectoralis major', '{"Anterior deltoid","Triceps brachii","Serratus anterior"}'::text[], 'mid', 'regional', NULL, 'horizontal', '{"Shoulder","Elbow"}'::text[], true)
  ON CONFLICT (name) DO UPDATE SET
    category = EXCLUDED.category,
    movement_patterns = EXCLUDED.movement_patterns,
    bilateral_unilateral = EXCLUDED.bilateral_unilateral,
    posterior_anterior = EXCLUDED.posterior_anterior,
    complexity = EXCLUDED.complexity,
    equipment = EXCLUDED.equipment,
    primary_muscle = EXCLUDED.primary_muscle,
    supporting_muscles = EXCLUDED.supporting_muscles,
    muscle_bias = EXCLUDED.muscle_bias,
    joint_count_level = EXCLUDED.joint_count_level,
    dynamic_isometric = EXCLUDED.dynamic_isometric,
    movement_plane = EXCLUDED.movement_plane,
    primary_joints = EXCLUDED.primary_joints,
    is_active = true,
    updated_at = now();

INSERT INTO exercise_library (name, category, movement_patterns, bilateral_unilateral, posterior_anterior, complexity, equipment, primary_muscle, supporting_muscles, muscle_bias, joint_count_level, dynamic_isometric, movement_plane, primary_joints, is_active)
  VALUES ('Push-up (floor)', 'strength', '{"horizontal_push"}'::text[], 'bilateral', 'anterior', 2, '{"bodyweight"}'::text[], 'Pectoralis major', '{"Triceps brachii","Anterior deltoid","Serratus anterior","Core stabilizers"}'::text[], 'mid', 'regional', NULL, 'horizontal', '{"Shoulder","Elbow"}'::text[], true)
  ON CONFLICT (name) DO UPDATE SET
    category = EXCLUDED.category,
    movement_patterns = EXCLUDED.movement_patterns,
    bilateral_unilateral = EXCLUDED.bilateral_unilateral,
    posterior_anterior = EXCLUDED.posterior_anterior,
    complexity = EXCLUDED.complexity,
    equipment = EXCLUDED.equipment,
    primary_muscle = EXCLUDED.primary_muscle,
    supporting_muscles = EXCLUDED.supporting_muscles,
    muscle_bias = EXCLUDED.muscle_bias,
    joint_count_level = EXCLUDED.joint_count_level,
    dynamic_isometric = EXCLUDED.dynamic_isometric,
    movement_plane = EXCLUDED.movement_plane,
    primary_joints = EXCLUDED.primary_joints,
    is_active = true,
    updated_at = now();

INSERT INTO exercise_library (name, category, movement_patterns, bilateral_unilateral, posterior_anterior, complexity, equipment, primary_muscle, supporting_muscles, muscle_bias, joint_count_level, dynamic_isometric, movement_plane, primary_joints, is_active)
  VALUES ('Weighted Push-up (floor)', 'strength', '{"horizontal_push"}'::text[], 'bilateral', 'anterior', 3, '{"bodyweight"}'::text[], 'Pectoralis major', '{"Triceps brachii","Anterior deltoid","Serratus anterior","Core stabilizers"}'::text[], 'mid', 'regional', NULL, 'horizontal', '{"Shoulder","Elbow"}'::text[], true)
  ON CONFLICT (name) DO UPDATE SET
    category = EXCLUDED.category,
    movement_patterns = EXCLUDED.movement_patterns,
    bilateral_unilateral = EXCLUDED.bilateral_unilateral,
    posterior_anterior = EXCLUDED.posterior_anterior,
    complexity = EXCLUDED.complexity,
    equipment = EXCLUDED.equipment,
    primary_muscle = EXCLUDED.primary_muscle,
    supporting_muscles = EXCLUDED.supporting_muscles,
    muscle_bias = EXCLUDED.muscle_bias,
    joint_count_level = EXCLUDED.joint_count_level,
    dynamic_isometric = EXCLUDED.dynamic_isometric,
    movement_plane = EXCLUDED.movement_plane,
    primary_joints = EXCLUDED.primary_joints,
    is_active = true,
    updated_at = now();

INSERT INTO exercise_library (name, category, movement_patterns, bilateral_unilateral, posterior_anterior, complexity, equipment, primary_muscle, supporting_muscles, muscle_bias, joint_count_level, dynamic_isometric, movement_plane, primary_joints, is_active)
  VALUES ('Push-up (hands elevated)', 'strength', '{"horizontal_push"}'::text[], 'bilateral', 'anterior', 1, '{"bodyweight"}'::text[], 'Pectoralis major', '{"Triceps brachii","Anterior deltoid","Serratus anterior","Core stabilizers"}'::text[], 'mid', 'regional', NULL, 'horizontal', '{"Shoulder","Elbow"}'::text[], true)
  ON CONFLICT (name) DO UPDATE SET
    category = EXCLUDED.category,
    movement_patterns = EXCLUDED.movement_patterns,
    bilateral_unilateral = EXCLUDED.bilateral_unilateral,
    posterior_anterior = EXCLUDED.posterior_anterior,
    complexity = EXCLUDED.complexity,
    equipment = EXCLUDED.equipment,
    primary_muscle = EXCLUDED.primary_muscle,
    supporting_muscles = EXCLUDED.supporting_muscles,
    muscle_bias = EXCLUDED.muscle_bias,
    joint_count_level = EXCLUDED.joint_count_level,
    dynamic_isometric = EXCLUDED.dynamic_isometric,
    movement_plane = EXCLUDED.movement_plane,
    primary_joints = EXCLUDED.primary_joints,
    is_active = true,
    updated_at = now();

INSERT INTO exercise_library (name, category, movement_patterns, bilateral_unilateral, posterior_anterior, complexity, equipment, primary_muscle, supporting_muscles, muscle_bias, joint_count_level, dynamic_isometric, movement_plane, primary_joints, is_active)
  VALUES ('Push-up (feet elevated + deficit)', 'strength', '{"horizontal_push"}'::text[], 'bilateral', 'anterior', 3, '{"bodyweight"}'::text[], 'Upper pectoralis', '{"Anterior deltoid","Triceps brachii","Serratus anterior","Core stabilizers"}'::text[], 'lengthened', 'regional', NULL, 'horizontal', '{"Shoulder","Elbow"}'::text[], true)
  ON CONFLICT (name) DO UPDATE SET
    category = EXCLUDED.category,
    movement_patterns = EXCLUDED.movement_patterns,
    bilateral_unilateral = EXCLUDED.bilateral_unilateral,
    posterior_anterior = EXCLUDED.posterior_anterior,
    complexity = EXCLUDED.complexity,
    equipment = EXCLUDED.equipment,
    primary_muscle = EXCLUDED.primary_muscle,
    supporting_muscles = EXCLUDED.supporting_muscles,
    muscle_bias = EXCLUDED.muscle_bias,
    joint_count_level = EXCLUDED.joint_count_level,
    dynamic_isometric = EXCLUDED.dynamic_isometric,
    movement_plane = EXCLUDED.movement_plane,
    primary_joints = EXCLUDED.primary_joints,
    is_active = true,
    updated_at = now();

INSERT INTO exercise_library (name, category, movement_patterns, bilateral_unilateral, posterior_anterior, complexity, equipment, primary_muscle, supporting_muscles, muscle_bias, joint_count_level, dynamic_isometric, movement_plane, primary_joints, is_active)
  VALUES ('Push-up (feet elevated)', 'strength', '{"horizontal_push"}'::text[], 'bilateral', 'anterior', 2, '{"bodyweight"}'::text[], 'Upper pectoralis', '{"Anterior deltoid","Triceps brachii","Serratus anterior","Core stabilizers"}'::text[], 'lengthened', 'regional', NULL, 'horizontal', '{"Shoulder","Elbow"}'::text[], true)
  ON CONFLICT (name) DO UPDATE SET
    category = EXCLUDED.category,
    movement_patterns = EXCLUDED.movement_patterns,
    bilateral_unilateral = EXCLUDED.bilateral_unilateral,
    posterior_anterior = EXCLUDED.posterior_anterior,
    complexity = EXCLUDED.complexity,
    equipment = EXCLUDED.equipment,
    primary_muscle = EXCLUDED.primary_muscle,
    supporting_muscles = EXCLUDED.supporting_muscles,
    muscle_bias = EXCLUDED.muscle_bias,
    joint_count_level = EXCLUDED.joint_count_level,
    dynamic_isometric = EXCLUDED.dynamic_isometric,
    movement_plane = EXCLUDED.movement_plane,
    primary_joints = EXCLUDED.primary_joints,
    is_active = true,
    updated_at = now();

INSERT INTO exercise_library (name, category, movement_patterns, bilateral_unilateral, posterior_anterior, complexity, equipment, primary_muscle, supporting_muscles, muscle_bias, joint_count_level, dynamic_isometric, movement_plane, primary_joints, is_active)
  VALUES ('Weighted Push-up (feet elevated)', 'strength', '{"horizontal_push"}'::text[], 'bilateral', 'anterior', 3, '{"bodyweight"}'::text[], 'Upper pectoralis', '{"Anterior deltoid","Triceps brachii","Serratus anterior","Core stabilizers"}'::text[], 'lengthened', 'regional', NULL, 'horizontal', '{"Shoulder","Elbow"}'::text[], true)
  ON CONFLICT (name) DO UPDATE SET
    category = EXCLUDED.category,
    movement_patterns = EXCLUDED.movement_patterns,
    bilateral_unilateral = EXCLUDED.bilateral_unilateral,
    posterior_anterior = EXCLUDED.posterior_anterior,
    complexity = EXCLUDED.complexity,
    equipment = EXCLUDED.equipment,
    primary_muscle = EXCLUDED.primary_muscle,
    supporting_muscles = EXCLUDED.supporting_muscles,
    muscle_bias = EXCLUDED.muscle_bias,
    joint_count_level = EXCLUDED.joint_count_level,
    dynamic_isometric = EXCLUDED.dynamic_isometric,
    movement_plane = EXCLUDED.movement_plane,
    primary_joints = EXCLUDED.primary_joints,
    is_active = true,
    updated_at = now();

INSERT INTO exercise_library (name, category, movement_patterns, bilateral_unilateral, posterior_anterior, complexity, equipment, primary_muscle, supporting_muscles, muscle_bias, joint_count_level, dynamic_isometric, movement_plane, primary_joints, is_active)
  VALUES ('Deficit Push-up', 'strength', '{"horizontal_push"}'::text[], 'bilateral', 'anterior', 3, '{"bodyweight"}'::text[], 'Pectoralis major', '{"Anterior deltoid","Triceps brachii","Serratus anterior","Core stabilizers"}'::text[], 'lengthened', 'regional', NULL, 'horizontal', '{"Shoulder","Elbow"}'::text[], true)
  ON CONFLICT (name) DO UPDATE SET
    category = EXCLUDED.category,
    movement_patterns = EXCLUDED.movement_patterns,
    bilateral_unilateral = EXCLUDED.bilateral_unilateral,
    posterior_anterior = EXCLUDED.posterior_anterior,
    complexity = EXCLUDED.complexity,
    equipment = EXCLUDED.equipment,
    primary_muscle = EXCLUDED.primary_muscle,
    supporting_muscles = EXCLUDED.supporting_muscles,
    muscle_bias = EXCLUDED.muscle_bias,
    joint_count_level = EXCLUDED.joint_count_level,
    dynamic_isometric = EXCLUDED.dynamic_isometric,
    movement_plane = EXCLUDED.movement_plane,
    primary_joints = EXCLUDED.primary_joints,
    is_active = true,
    updated_at = now();

INSERT INTO exercise_library (name, category, movement_patterns, bilateral_unilateral, posterior_anterior, complexity, equipment, primary_muscle, supporting_muscles, muscle_bias, joint_count_level, dynamic_isometric, movement_plane, primary_joints, is_active)
  VALUES ('Weighted Deficit Push-up', 'strength', '{"horizontal_push"}'::text[], 'bilateral', 'anterior', 3, '{"bodyweight"}'::text[], 'Pectoralis major', '{"Anterior deltoid","Triceps brachii","Serratus anterior","Core stabilizers"}'::text[], 'lengthened', 'regional', NULL, 'horizontal', '{"Shoulder","Elbow"}'::text[], true)
  ON CONFLICT (name) DO UPDATE SET
    category = EXCLUDED.category,
    movement_patterns = EXCLUDED.movement_patterns,
    bilateral_unilateral = EXCLUDED.bilateral_unilateral,
    posterior_anterior = EXCLUDED.posterior_anterior,
    complexity = EXCLUDED.complexity,
    equipment = EXCLUDED.equipment,
    primary_muscle = EXCLUDED.primary_muscle,
    supporting_muscles = EXCLUDED.supporting_muscles,
    muscle_bias = EXCLUDED.muscle_bias,
    joint_count_level = EXCLUDED.joint_count_level,
    dynamic_isometric = EXCLUDED.dynamic_isometric,
    movement_plane = EXCLUDED.movement_plane,
    primary_joints = EXCLUDED.primary_joints,
    is_active = true,
    updated_at = now();

INSERT INTO exercise_library (name, category, movement_patterns, bilateral_unilateral, posterior_anterior, complexity, equipment, primary_muscle, supporting_muscles, muscle_bias, joint_count_level, dynamic_isometric, movement_plane, primary_joints, is_active)
  VALUES ('Parallette Push-up', 'strength', '{"horizontal_push"}'::text[], 'bilateral', 'anterior', 3, '{"bodyweight"}'::text[], 'Pectoralis major', '{"Triceps brachii","Anterior deltoid","Serratus anterior","Core stabilizers"}'::text[], 'lengthened', 'regional', NULL, 'horizontal', '{"Shoulder","Elbow"}'::text[], true)
  ON CONFLICT (name) DO UPDATE SET
    category = EXCLUDED.category,
    movement_patterns = EXCLUDED.movement_patterns,
    bilateral_unilateral = EXCLUDED.bilateral_unilateral,
    posterior_anterior = EXCLUDED.posterior_anterior,
    complexity = EXCLUDED.complexity,
    equipment = EXCLUDED.equipment,
    primary_muscle = EXCLUDED.primary_muscle,
    supporting_muscles = EXCLUDED.supporting_muscles,
    muscle_bias = EXCLUDED.muscle_bias,
    joint_count_level = EXCLUDED.joint_count_level,
    dynamic_isometric = EXCLUDED.dynamic_isometric,
    movement_plane = EXCLUDED.movement_plane,
    primary_joints = EXCLUDED.primary_joints,
    is_active = true,
    updated_at = now();

INSERT INTO exercise_library (name, category, movement_patterns, bilateral_unilateral, posterior_anterior, complexity, equipment, primary_muscle, supporting_muscles, muscle_bias, joint_count_level, dynamic_isometric, movement_plane, primary_joints, is_active)
  VALUES ('Weighted Parallette Push-up', 'strength', '{"horizontal_push"}'::text[], 'bilateral', 'anterior', 3, '{"bodyweight"}'::text[], 'Pectoralis major', '{"Triceps brachii","Anterior deltoid","Serratus anterior","Core stabilizers"}'::text[], 'lengthened', 'regional', NULL, 'horizontal', '{"Shoulder","Elbow"}'::text[], true)
  ON CONFLICT (name) DO UPDATE SET
    category = EXCLUDED.category,
    movement_patterns = EXCLUDED.movement_patterns,
    bilateral_unilateral = EXCLUDED.bilateral_unilateral,
    posterior_anterior = EXCLUDED.posterior_anterior,
    complexity = EXCLUDED.complexity,
    equipment = EXCLUDED.equipment,
    primary_muscle = EXCLUDED.primary_muscle,
    supporting_muscles = EXCLUDED.supporting_muscles,
    muscle_bias = EXCLUDED.muscle_bias,
    joint_count_level = EXCLUDED.joint_count_level,
    dynamic_isometric = EXCLUDED.dynamic_isometric,
    movement_plane = EXCLUDED.movement_plane,
    primary_joints = EXCLUDED.primary_joints,
    is_active = true,
    updated_at = now();

INSERT INTO exercise_library (name, category, movement_patterns, bilateral_unilateral, posterior_anterior, complexity, equipment, primary_muscle, supporting_muscles, muscle_bias, joint_count_level, dynamic_isometric, movement_plane, primary_joints, is_active)
  VALUES ('Banded Resisted Push-up', 'strength', '{"horizontal_push"}'::text[], 'bilateral', 'anterior', 2, '{"band"}'::text[], 'Pectoralis major', '{"Triceps brachii","Anterior deltoid","Serratus anterior","Core stabilizers"}'::text[], 'mid', 'regional', NULL, 'horizontal', '{"Shoulder","Elbow"}'::text[], true)
  ON CONFLICT (name) DO UPDATE SET
    category = EXCLUDED.category,
    movement_patterns = EXCLUDED.movement_patterns,
    bilateral_unilateral = EXCLUDED.bilateral_unilateral,
    posterior_anterior = EXCLUDED.posterior_anterior,
    complexity = EXCLUDED.complexity,
    equipment = EXCLUDED.equipment,
    primary_muscle = EXCLUDED.primary_muscle,
    supporting_muscles = EXCLUDED.supporting_muscles,
    muscle_bias = EXCLUDED.muscle_bias,
    joint_count_level = EXCLUDED.joint_count_level,
    dynamic_isometric = EXCLUDED.dynamic_isometric,
    movement_plane = EXCLUDED.movement_plane,
    primary_joints = EXCLUDED.primary_joints,
    is_active = true,
    updated_at = now();

INSERT INTO exercise_library (name, category, movement_patterns, bilateral_unilateral, posterior_anterior, complexity, equipment, primary_muscle, supporting_muscles, muscle_bias, joint_count_level, dynamic_isometric, movement_plane, primary_joints, is_active)
  VALUES ('Band Assisted Push-up', 'strength', '{"horizontal_push"}'::text[], 'bilateral', 'anterior', 1, '{"band"}'::text[], 'Pectoralis major', '{"Triceps brachii","Anterior deltoid","Serratus anterior","Core stabilizers"}'::text[], 'mid', 'regional', NULL, 'horizontal', '{"Shoulder","Elbow"}'::text[], true)
  ON CONFLICT (name) DO UPDATE SET
    category = EXCLUDED.category,
    movement_patterns = EXCLUDED.movement_patterns,
    bilateral_unilateral = EXCLUDED.bilateral_unilateral,
    posterior_anterior = EXCLUDED.posterior_anterior,
    complexity = EXCLUDED.complexity,
    equipment = EXCLUDED.equipment,
    primary_muscle = EXCLUDED.primary_muscle,
    supporting_muscles = EXCLUDED.supporting_muscles,
    muscle_bias = EXCLUDED.muscle_bias,
    joint_count_level = EXCLUDED.joint_count_level,
    dynamic_isometric = EXCLUDED.dynamic_isometric,
    movement_plane = EXCLUDED.movement_plane,
    primary_joints = EXCLUDED.primary_joints,
    is_active = true,
    updated_at = now();

INSERT INTO exercise_library (name, category, movement_patterns, bilateral_unilateral, posterior_anterior, complexity, equipment, primary_muscle, supporting_muscles, muscle_bias, joint_count_level, dynamic_isometric, movement_plane, primary_joints, is_active)
  VALUES ('Dips (on boxes)', 'strength', '{"vertical_push"}'::text[], 'bilateral', 'anterior', 2, '{"plyo_box"}'::text[], 'Triceps brachii', '{"Pectoralis major","Anterior deltoid","Serratus anterior"}'::text[], 'shortened', 'regional', NULL, 'vertical', '{"Shoulder","Elbow"}'::text[], true)
  ON CONFLICT (name) DO UPDATE SET
    category = EXCLUDED.category,
    movement_patterns = EXCLUDED.movement_patterns,
    bilateral_unilateral = EXCLUDED.bilateral_unilateral,
    posterior_anterior = EXCLUDED.posterior_anterior,
    complexity = EXCLUDED.complexity,
    equipment = EXCLUDED.equipment,
    primary_muscle = EXCLUDED.primary_muscle,
    supporting_muscles = EXCLUDED.supporting_muscles,
    muscle_bias = EXCLUDED.muscle_bias,
    joint_count_level = EXCLUDED.joint_count_level,
    dynamic_isometric = EXCLUDED.dynamic_isometric,
    movement_plane = EXCLUDED.movement_plane,
    primary_joints = EXCLUDED.primary_joints,
    is_active = true,
    updated_at = now();

INSERT INTO exercise_library (name, category, movement_patterns, bilateral_unilateral, posterior_anterior, complexity, equipment, primary_muscle, supporting_muscles, muscle_bias, joint_count_level, dynamic_isometric, movement_plane, primary_joints, is_active)
  VALUES ('Dip (parallel or V-bar)', 'strength', '{"vertical_push"}'::text[], 'bilateral', 'anterior', 2, '{"bodyweight"}'::text[], 'Triceps brachii', '{"Pectoralis major","Anterior deltoid","Serratus anterior"}'::text[], 'shortened', 'regional', NULL, 'vertical', '{"Shoulder","Elbow"}'::text[], true)
  ON CONFLICT (name) DO UPDATE SET
    category = EXCLUDED.category,
    movement_patterns = EXCLUDED.movement_patterns,
    bilateral_unilateral = EXCLUDED.bilateral_unilateral,
    posterior_anterior = EXCLUDED.posterior_anterior,
    complexity = EXCLUDED.complexity,
    equipment = EXCLUDED.equipment,
    primary_muscle = EXCLUDED.primary_muscle,
    supporting_muscles = EXCLUDED.supporting_muscles,
    muscle_bias = EXCLUDED.muscle_bias,
    joint_count_level = EXCLUDED.joint_count_level,
    dynamic_isometric = EXCLUDED.dynamic_isometric,
    movement_plane = EXCLUDED.movement_plane,
    primary_joints = EXCLUDED.primary_joints,
    is_active = true,
    updated_at = now();

INSERT INTO exercise_library (name, category, movement_patterns, bilateral_unilateral, posterior_anterior, complexity, equipment, primary_muscle, supporting_muscles, muscle_bias, joint_count_level, dynamic_isometric, movement_plane, primary_joints, is_active)
  VALUES ('Weighted Dip (parallel or V-bar)', 'strength', '{"vertical_push"}'::text[], 'bilateral', 'anterior', 3, '{"bodyweight"}'::text[], 'Triceps brachii', '{"Pectoralis major","Anterior deltoid","Serratus anterior"}'::text[], 'shortened', 'regional', NULL, 'vertical', '{"Shoulder","Elbow"}'::text[], true)
  ON CONFLICT (name) DO UPDATE SET
    category = EXCLUDED.category,
    movement_patterns = EXCLUDED.movement_patterns,
    bilateral_unilateral = EXCLUDED.bilateral_unilateral,
    posterior_anterior = EXCLUDED.posterior_anterior,
    complexity = EXCLUDED.complexity,
    equipment = EXCLUDED.equipment,
    primary_muscle = EXCLUDED.primary_muscle,
    supporting_muscles = EXCLUDED.supporting_muscles,
    muscle_bias = EXCLUDED.muscle_bias,
    joint_count_level = EXCLUDED.joint_count_level,
    dynamic_isometric = EXCLUDED.dynamic_isometric,
    movement_plane = EXCLUDED.movement_plane,
    primary_joints = EXCLUDED.primary_joints,
    is_active = true,
    updated_at = now();

INSERT INTO exercise_library (name, category, movement_patterns, bilateral_unilateral, posterior_anterior, complexity, equipment, primary_muscle, supporting_muscles, muscle_bias, joint_count_level, dynamic_isometric, movement_plane, primary_joints, is_active)
  VALUES ('Ring Dip', 'strength', '{"vertical_push"}'::text[], 'bilateral', 'anterior', 3, '{"suspension_trainer"}'::text[], 'Triceps brachii', '{"Pectoralis major","Anterior deltoid","Serratus anterior","Rotator cuff"}'::text[], 'lengthened', 'regional', NULL, 'vertical', '{"Shoulder","Elbow"}'::text[], true)
  ON CONFLICT (name) DO UPDATE SET
    category = EXCLUDED.category,
    movement_patterns = EXCLUDED.movement_patterns,
    bilateral_unilateral = EXCLUDED.bilateral_unilateral,
    posterior_anterior = EXCLUDED.posterior_anterior,
    complexity = EXCLUDED.complexity,
    equipment = EXCLUDED.equipment,
    primary_muscle = EXCLUDED.primary_muscle,
    supporting_muscles = EXCLUDED.supporting_muscles,
    muscle_bias = EXCLUDED.muscle_bias,
    joint_count_level = EXCLUDED.joint_count_level,
    dynamic_isometric = EXCLUDED.dynamic_isometric,
    movement_plane = EXCLUDED.movement_plane,
    primary_joints = EXCLUDED.primary_joints,
    is_active = true,
    updated_at = now();

INSERT INTO exercise_library (name, category, movement_patterns, bilateral_unilateral, posterior_anterior, complexity, equipment, primary_muscle, supporting_muscles, muscle_bias, joint_count_level, dynamic_isometric, movement_plane, primary_joints, is_active)
  VALUES ('Weighted Ring Dip', 'strength', '{"vertical_push"}'::text[], 'bilateral', 'anterior', 3, '{"suspension_trainer"}'::text[], 'Triceps brachii', '{"Pectoralis major","Anterior deltoid","Serratus anterior","Rotator cuff"}'::text[], 'lengthened', 'regional', NULL, 'vertical', '{"Shoulder","Elbow"}'::text[], true)
  ON CONFLICT (name) DO UPDATE SET
    category = EXCLUDED.category,
    movement_patterns = EXCLUDED.movement_patterns,
    bilateral_unilateral = EXCLUDED.bilateral_unilateral,
    posterior_anterior = EXCLUDED.posterior_anterior,
    complexity = EXCLUDED.complexity,
    equipment = EXCLUDED.equipment,
    primary_muscle = EXCLUDED.primary_muscle,
    supporting_muscles = EXCLUDED.supporting_muscles,
    muscle_bias = EXCLUDED.muscle_bias,
    joint_count_level = EXCLUDED.joint_count_level,
    dynamic_isometric = EXCLUDED.dynamic_isometric,
    movement_plane = EXCLUDED.movement_plane,
    primary_joints = EXCLUDED.primary_joints,
    is_active = true,
    updated_at = now();

INSERT INTO exercise_library (name, category, movement_patterns, bilateral_unilateral, posterior_anterior, complexity, equipment, primary_muscle, supporting_muscles, muscle_bias, joint_count_level, dynamic_isometric, movement_plane, primary_joints, is_active)
  VALUES ('Costal V-bar Dip (feet on box or bench)', 'strength', '{"vertical_push"}'::text[], 'bilateral', 'anterior', 3, '{"bodyweight"}'::text[], 'Lower pectoralis', '{"Triceps brachii","Anterior deltoid","Serratus anterior"}'::text[], 'shortened', 'regional', NULL, 'vertical', '{"Shoulder","Elbow"}'::text[], true)
  ON CONFLICT (name) DO UPDATE SET
    category = EXCLUDED.category,
    movement_patterns = EXCLUDED.movement_patterns,
    bilateral_unilateral = EXCLUDED.bilateral_unilateral,
    posterior_anterior = EXCLUDED.posterior_anterior,
    complexity = EXCLUDED.complexity,
    equipment = EXCLUDED.equipment,
    primary_muscle = EXCLUDED.primary_muscle,
    supporting_muscles = EXCLUDED.supporting_muscles,
    muscle_bias = EXCLUDED.muscle_bias,
    joint_count_level = EXCLUDED.joint_count_level,
    dynamic_isometric = EXCLUDED.dynamic_isometric,
    movement_plane = EXCLUDED.movement_plane,
    primary_joints = EXCLUDED.primary_joints,
    is_active = true,
    updated_at = now();

INSERT INTO exercise_library (name, category, movement_patterns, bilateral_unilateral, posterior_anterior, complexity, equipment, primary_muscle, supporting_muscles, muscle_bias, joint_count_level, dynamic_isometric, movement_plane, primary_joints, is_active)
  VALUES ('Barbell Overhead Strict Press (standing)', 'strength', '{"vertical_push"}'::text[], 'bilateral', 'anterior', 2, '{"barbell"}'::text[], 'Anterior deltoid', '{"Triceps brachii","Upper pectoralis","Serratus anterior","Upper trapezius"}'::text[], 'mid', 'regional', NULL, 'vertical', '{"Shoulder","Elbow"}'::text[], true)
  ON CONFLICT (name) DO UPDATE SET
    category = EXCLUDED.category,
    movement_patterns = EXCLUDED.movement_patterns,
    bilateral_unilateral = EXCLUDED.bilateral_unilateral,
    posterior_anterior = EXCLUDED.posterior_anterior,
    complexity = EXCLUDED.complexity,
    equipment = EXCLUDED.equipment,
    primary_muscle = EXCLUDED.primary_muscle,
    supporting_muscles = EXCLUDED.supporting_muscles,
    muscle_bias = EXCLUDED.muscle_bias,
    joint_count_level = EXCLUDED.joint_count_level,
    dynamic_isometric = EXCLUDED.dynamic_isometric,
    movement_plane = EXCLUDED.movement_plane,
    primary_joints = EXCLUDED.primary_joints,
    is_active = true,
    updated_at = now();

INSERT INTO exercise_library (name, category, movement_patterns, bilateral_unilateral, posterior_anterior, complexity, equipment, primary_muscle, supporting_muscles, muscle_bias, joint_count_level, dynamic_isometric, movement_plane, primary_joints, is_active)
  VALUES ('Barbell Overhead Strict Press (seated)', 'strength', '{"vertical_push"}'::text[], 'bilateral', 'anterior', 2, '{"barbell"}'::text[], 'Anterior deltoid', '{"Triceps brachii","Upper pectoralis","Serratus anterior","Upper trapezius"}'::text[], 'mid', 'regional', NULL, 'vertical', '{"Shoulder","Elbow"}'::text[], true)
  ON CONFLICT (name) DO UPDATE SET
    category = EXCLUDED.category,
    movement_patterns = EXCLUDED.movement_patterns,
    bilateral_unilateral = EXCLUDED.bilateral_unilateral,
    posterior_anterior = EXCLUDED.posterior_anterior,
    complexity = EXCLUDED.complexity,
    equipment = EXCLUDED.equipment,
    primary_muscle = EXCLUDED.primary_muscle,
    supporting_muscles = EXCLUDED.supporting_muscles,
    muscle_bias = EXCLUDED.muscle_bias,
    joint_count_level = EXCLUDED.joint_count_level,
    dynamic_isometric = EXCLUDED.dynamic_isometric,
    movement_plane = EXCLUDED.movement_plane,
    primary_joints = EXCLUDED.primary_joints,
    is_active = true,
    updated_at = now();

INSERT INTO exercise_library (name, category, movement_patterns, bilateral_unilateral, posterior_anterior, complexity, equipment, primary_muscle, supporting_muscles, muscle_bias, joint_count_level, dynamic_isometric, movement_plane, primary_joints, is_active)
  VALUES ('Barbell Behind the Neck Strict Press', 'strength', '{"vertical_push"}'::text[], 'bilateral', 'anterior', 3, '{"barbell"}'::text[], 'Deltoids', '{"Triceps brachii","Upper trapezius","Serratus anterior"}'::text[], 'mid', 'regional', NULL, 'vertical', '{"Shoulder","Elbow"}'::text[], true)
  ON CONFLICT (name) DO UPDATE SET
    category = EXCLUDED.category,
    movement_patterns = EXCLUDED.movement_patterns,
    bilateral_unilateral = EXCLUDED.bilateral_unilateral,
    posterior_anterior = EXCLUDED.posterior_anterior,
    complexity = EXCLUDED.complexity,
    equipment = EXCLUDED.equipment,
    primary_muscle = EXCLUDED.primary_muscle,
    supporting_muscles = EXCLUDED.supporting_muscles,
    muscle_bias = EXCLUDED.muscle_bias,
    joint_count_level = EXCLUDED.joint_count_level,
    dynamic_isometric = EXCLUDED.dynamic_isometric,
    movement_plane = EXCLUDED.movement_plane,
    primary_joints = EXCLUDED.primary_joints,
    is_active = true,
    updated_at = now();

INSERT INTO exercise_library (name, category, movement_patterns, bilateral_unilateral, posterior_anterior, complexity, equipment, primary_muscle, supporting_muscles, muscle_bias, joint_count_level, dynamic_isometric, movement_plane, primary_joints, is_active)
  VALUES ('Push Press', 'strength', '{"vertical_push"}'::text[], 'bilateral', 'anterior', 3, '{"barbell"}'::text[], 'Anterior deltoid', '{"Triceps brachii","Upper trapezius","Serratus anterior","Legs/hips (drive)"}'::text[], 'mid', 'regional', NULL, 'vertical', '{"Shoulder","Elbow"}'::text[], true)
  ON CONFLICT (name) DO UPDATE SET
    category = EXCLUDED.category,
    movement_patterns = EXCLUDED.movement_patterns,
    bilateral_unilateral = EXCLUDED.bilateral_unilateral,
    posterior_anterior = EXCLUDED.posterior_anterior,
    complexity = EXCLUDED.complexity,
    equipment = EXCLUDED.equipment,
    primary_muscle = EXCLUDED.primary_muscle,
    supporting_muscles = EXCLUDED.supporting_muscles,
    muscle_bias = EXCLUDED.muscle_bias,
    joint_count_level = EXCLUDED.joint_count_level,
    dynamic_isometric = EXCLUDED.dynamic_isometric,
    movement_plane = EXCLUDED.movement_plane,
    primary_joints = EXCLUDED.primary_joints,
    is_active = true,
    updated_at = now();

INSERT INTO exercise_library (name, category, movement_patterns, bilateral_unilateral, posterior_anterior, complexity, equipment, primary_muscle, supporting_muscles, muscle_bias, joint_count_level, dynamic_isometric, movement_plane, primary_joints, is_active)
  VALUES ('Barbell Z Press', 'strength', '{"vertical_push"}'::text[], 'bilateral', 'anterior', 3, '{"barbell"}'::text[], 'Anterior deltoid', '{"Triceps brachii","Upper trapezius","Serratus anterior","Core stabilizers"}'::text[], 'mid', 'regional', NULL, 'vertical', '{"Shoulder","Elbow"}'::text[], true)
  ON CONFLICT (name) DO UPDATE SET
    category = EXCLUDED.category,
    movement_patterns = EXCLUDED.movement_patterns,
    bilateral_unilateral = EXCLUDED.bilateral_unilateral,
    posterior_anterior = EXCLUDED.posterior_anterior,
    complexity = EXCLUDED.complexity,
    equipment = EXCLUDED.equipment,
    primary_muscle = EXCLUDED.primary_muscle,
    supporting_muscles = EXCLUDED.supporting_muscles,
    muscle_bias = EXCLUDED.muscle_bias,
    joint_count_level = EXCLUDED.joint_count_level,
    dynamic_isometric = EXCLUDED.dynamic_isometric,
    movement_plane = EXCLUDED.movement_plane,
    primary_joints = EXCLUDED.primary_joints,
    is_active = true,
    updated_at = now();

INSERT INTO exercise_library (name, category, movement_patterns, bilateral_unilateral, posterior_anterior, complexity, equipment, primary_muscle, supporting_muscles, muscle_bias, joint_count_level, dynamic_isometric, movement_plane, primary_joints, is_active)
  VALUES ('Half Kneeling Single Arm Dumbbell Overhead Press', 'strength', '{"vertical_push"}'::text[], 'unilateral', 'anterior', 3, '{"dumbbell"}'::text[], 'Anterior deltoid', '{"Triceps brachii","Upper trapezius","Serratus anterior","Core stabilizers"}'::text[], 'mid', 'regional', NULL, 'vertical', '{"Shoulder","Elbow"}'::text[], true)
  ON CONFLICT (name) DO UPDATE SET
    category = EXCLUDED.category,
    movement_patterns = EXCLUDED.movement_patterns,
    bilateral_unilateral = EXCLUDED.bilateral_unilateral,
    posterior_anterior = EXCLUDED.posterior_anterior,
    complexity = EXCLUDED.complexity,
    equipment = EXCLUDED.equipment,
    primary_muscle = EXCLUDED.primary_muscle,
    supporting_muscles = EXCLUDED.supporting_muscles,
    muscle_bias = EXCLUDED.muscle_bias,
    joint_count_level = EXCLUDED.joint_count_level,
    dynamic_isometric = EXCLUDED.dynamic_isometric,
    movement_plane = EXCLUDED.movement_plane,
    primary_joints = EXCLUDED.primary_joints,
    is_active = true,
    updated_at = now();

INSERT INTO exercise_library (name, category, movement_patterns, bilateral_unilateral, posterior_anterior, complexity, equipment, primary_muscle, supporting_muscles, muscle_bias, joint_count_level, dynamic_isometric, movement_plane, primary_joints, is_active)
  VALUES ('Dumbbell Overhead Press (standing)', 'strength', '{"vertical_push"}'::text[], 'bilateral', 'anterior', 2, '{"dumbbell"}'::text[], 'Anterior deltoid', '{"Triceps brachii","Upper trapezius","Serratus anterior"}'::text[], 'mid', 'regional', NULL, 'vertical', '{"Shoulder","Elbow"}'::text[], true)
  ON CONFLICT (name) DO UPDATE SET
    category = EXCLUDED.category,
    movement_patterns = EXCLUDED.movement_patterns,
    bilateral_unilateral = EXCLUDED.bilateral_unilateral,
    posterior_anterior = EXCLUDED.posterior_anterior,
    complexity = EXCLUDED.complexity,
    equipment = EXCLUDED.equipment,
    primary_muscle = EXCLUDED.primary_muscle,
    supporting_muscles = EXCLUDED.supporting_muscles,
    muscle_bias = EXCLUDED.muscle_bias,
    joint_count_level = EXCLUDED.joint_count_level,
    dynamic_isometric = EXCLUDED.dynamic_isometric,
    movement_plane = EXCLUDED.movement_plane,
    primary_joints = EXCLUDED.primary_joints,
    is_active = true,
    updated_at = now();

INSERT INTO exercise_library (name, category, movement_patterns, bilateral_unilateral, posterior_anterior, complexity, equipment, primary_muscle, supporting_muscles, muscle_bias, joint_count_level, dynamic_isometric, movement_plane, primary_joints, is_active)
  VALUES ('Dumbbell Overhead Press (seated)', 'strength', '{"vertical_push"}'::text[], 'bilateral', 'anterior', 2, '{"dumbbell"}'::text[], 'Anterior deltoid', '{"Triceps brachii","Upper trapezius","Serratus anterior"}'::text[], 'mid', 'global', NULL, 'vertical', '{"Shoulder","Elbow"}'::text[], true)
  ON CONFLICT (name) DO UPDATE SET
    category = EXCLUDED.category,
    movement_patterns = EXCLUDED.movement_patterns,
    bilateral_unilateral = EXCLUDED.bilateral_unilateral,
    posterior_anterior = EXCLUDED.posterior_anterior,
    complexity = EXCLUDED.complexity,
    equipment = EXCLUDED.equipment,
    primary_muscle = EXCLUDED.primary_muscle,
    supporting_muscles = EXCLUDED.supporting_muscles,
    muscle_bias = EXCLUDED.muscle_bias,
    joint_count_level = EXCLUDED.joint_count_level,
    dynamic_isometric = EXCLUDED.dynamic_isometric,
    movement_plane = EXCLUDED.movement_plane,
    primary_joints = EXCLUDED.primary_joints,
    is_active = true,
    updated_at = now();

INSERT INTO exercise_library (name, category, movement_patterns, bilateral_unilateral, posterior_anterior, complexity, equipment, primary_muscle, supporting_muscles, muscle_bias, joint_count_level, dynamic_isometric, movement_plane, primary_joints, is_active)
  VALUES ('Single Arm Dumbbell Overhead Press', 'strength', '{"vertical_push"}'::text[], 'unilateral', 'anterior', 3, '{"dumbbell"}'::text[], 'Anterior deltoid', '{"Triceps brachii","Upper trapezius","Serratus anterior","Core stabilizers"}'::text[], 'mid', 'global', NULL, 'vertical', '{"Shoulder","Elbow"}'::text[], true)
  ON CONFLICT (name) DO UPDATE SET
    category = EXCLUDED.category,
    movement_patterns = EXCLUDED.movement_patterns,
    bilateral_unilateral = EXCLUDED.bilateral_unilateral,
    posterior_anterior = EXCLUDED.posterior_anterior,
    complexity = EXCLUDED.complexity,
    equipment = EXCLUDED.equipment,
    primary_muscle = EXCLUDED.primary_muscle,
    supporting_muscles = EXCLUDED.supporting_muscles,
    muscle_bias = EXCLUDED.muscle_bias,
    joint_count_level = EXCLUDED.joint_count_level,
    dynamic_isometric = EXCLUDED.dynamic_isometric,
    movement_plane = EXCLUDED.movement_plane,
    primary_joints = EXCLUDED.primary_joints,
    is_active = true,
    updated_at = now();

INSERT INTO exercise_library (name, category, movement_patterns, bilateral_unilateral, posterior_anterior, complexity, equipment, primary_muscle, supporting_muscles, muscle_bias, joint_count_level, dynamic_isometric, movement_plane, primary_joints, is_active)
  VALUES ('Single Arm Kettlebell Overhead Press', 'strength', '{"vertical_push"}'::text[], 'unilateral', 'anterior', 3, '{"kettlebell"}'::text[], 'Anterior deltoid', '{"Triceps brachii","Upper trapezius","Serratus anterior","Core stabilizers"}'::text[], 'mid', 'global', NULL, 'vertical', '{"Shoulder","Elbow"}'::text[], true)
  ON CONFLICT (name) DO UPDATE SET
    category = EXCLUDED.category,
    movement_patterns = EXCLUDED.movement_patterns,
    bilateral_unilateral = EXCLUDED.bilateral_unilateral,
    posterior_anterior = EXCLUDED.posterior_anterior,
    complexity = EXCLUDED.complexity,
    equipment = EXCLUDED.equipment,
    primary_muscle = EXCLUDED.primary_muscle,
    supporting_muscles = EXCLUDED.supporting_muscles,
    muscle_bias = EXCLUDED.muscle_bias,
    joint_count_level = EXCLUDED.joint_count_level,
    dynamic_isometric = EXCLUDED.dynamic_isometric,
    movement_plane = EXCLUDED.movement_plane,
    primary_joints = EXCLUDED.primary_joints,
    is_active = true,
    updated_at = now();

INSERT INTO exercise_library (name, category, movement_patterns, bilateral_unilateral, posterior_anterior, complexity, equipment, primary_muscle, supporting_muscles, muscle_bias, joint_count_level, dynamic_isometric, movement_plane, primary_joints, is_active)
  VALUES ('Seated Single Arm Kettlebell Overhead Press', 'strength', '{"vertical_push"}'::text[], 'unilateral', 'anterior', 3, '{"kettlebell"}'::text[], 'Anterior deltoid', '{"Triceps brachii","Upper trapezius","Serratus anterior","Core stabilizers"}'::text[], 'mid', 'global', NULL, 'vertical', '{"Shoulder","Elbow"}'::text[], true)
  ON CONFLICT (name) DO UPDATE SET
    category = EXCLUDED.category,
    movement_patterns = EXCLUDED.movement_patterns,
    bilateral_unilateral = EXCLUDED.bilateral_unilateral,
    posterior_anterior = EXCLUDED.posterior_anterior,
    complexity = EXCLUDED.complexity,
    equipment = EXCLUDED.equipment,
    primary_muscle = EXCLUDED.primary_muscle,
    supporting_muscles = EXCLUDED.supporting_muscles,
    muscle_bias = EXCLUDED.muscle_bias,
    joint_count_level = EXCLUDED.joint_count_level,
    dynamic_isometric = EXCLUDED.dynamic_isometric,
    movement_plane = EXCLUDED.movement_plane,
    primary_joints = EXCLUDED.primary_joints,
    is_active = true,
    updated_at = now();

INSERT INTO exercise_library (name, category, movement_patterns, bilateral_unilateral, posterior_anterior, complexity, equipment, primary_muscle, supporting_muscles, muscle_bias, joint_count_level, dynamic_isometric, movement_plane, primary_joints, is_active)
  VALUES ('Dumbbell Arnold Press', 'strength', '{"vertical_push"}'::text[], 'bilateral', 'anterior', 3, '{"dumbbell"}'::text[], 'Anterior deltoid', '{"Triceps brachii","Upper trapezius","Serratus anterior"}'::text[], 'mid', 'regional', NULL, 'vertical', '{"Shoulder","Elbow"}'::text[], true)
  ON CONFLICT (name) DO UPDATE SET
    category = EXCLUDED.category,
    movement_patterns = EXCLUDED.movement_patterns,
    bilateral_unilateral = EXCLUDED.bilateral_unilateral,
    posterior_anterior = EXCLUDED.posterior_anterior,
    complexity = EXCLUDED.complexity,
    equipment = EXCLUDED.equipment,
    primary_muscle = EXCLUDED.primary_muscle,
    supporting_muscles = EXCLUDED.supporting_muscles,
    muscle_bias = EXCLUDED.muscle_bias,
    joint_count_level = EXCLUDED.joint_count_level,
    dynamic_isometric = EXCLUDED.dynamic_isometric,
    movement_plane = EXCLUDED.movement_plane,
    primary_joints = EXCLUDED.primary_joints,
    is_active = true,
    updated_at = now();

INSERT INTO exercise_library (name, category, movement_patterns, bilateral_unilateral, posterior_anterior, complexity, equipment, primary_muscle, supporting_muscles, muscle_bias, joint_count_level, dynamic_isometric, movement_plane, primary_joints, is_active)
  VALUES ('Half Kneeling Single Arm Kettlebell Overhead Press', 'strength', '{"vertical_push"}'::text[], 'unilateral', 'anterior', 3, '{"kettlebell"}'::text[], 'Anterior deltoid', '{"Triceps brachii","Upper trapezius","Serratus anterior","Core stabilizers"}'::text[], 'mid', 'regional', NULL, 'vertical', '{"Shoulder","Elbow"}'::text[], true)
  ON CONFLICT (name) DO UPDATE SET
    category = EXCLUDED.category,
    movement_patterns = EXCLUDED.movement_patterns,
    bilateral_unilateral = EXCLUDED.bilateral_unilateral,
    posterior_anterior = EXCLUDED.posterior_anterior,
    complexity = EXCLUDED.complexity,
    equipment = EXCLUDED.equipment,
    primary_muscle = EXCLUDED.primary_muscle,
    supporting_muscles = EXCLUDED.supporting_muscles,
    muscle_bias = EXCLUDED.muscle_bias,
    joint_count_level = EXCLUDED.joint_count_level,
    dynamic_isometric = EXCLUDED.dynamic_isometric,
    movement_plane = EXCLUDED.movement_plane,
    primary_joints = EXCLUDED.primary_joints,
    is_active = true,
    updated_at = now();

INSERT INTO exercise_library (name, category, movement_patterns, bilateral_unilateral, posterior_anterior, complexity, equipment, primary_muscle, supporting_muscles, muscle_bias, joint_count_level, dynamic_isometric, movement_plane, primary_joints, is_active)
  VALUES ('Kettlebell Overhead Press (standing)', 'strength', '{"vertical_push"}'::text[], 'bilateral', 'anterior', 2, '{"kettlebell"}'::text[], 'Anterior deltoid', '{"Triceps brachii","Upper trapezius","Serratus anterior"}'::text[], 'mid', 'regional', NULL, 'vertical', '{"Shoulder","Elbow"}'::text[], true)
  ON CONFLICT (name) DO UPDATE SET
    category = EXCLUDED.category,
    movement_patterns = EXCLUDED.movement_patterns,
    bilateral_unilateral = EXCLUDED.bilateral_unilateral,
    posterior_anterior = EXCLUDED.posterior_anterior,
    complexity = EXCLUDED.complexity,
    equipment = EXCLUDED.equipment,
    primary_muscle = EXCLUDED.primary_muscle,
    supporting_muscles = EXCLUDED.supporting_muscles,
    muscle_bias = EXCLUDED.muscle_bias,
    joint_count_level = EXCLUDED.joint_count_level,
    dynamic_isometric = EXCLUDED.dynamic_isometric,
    movement_plane = EXCLUDED.movement_plane,
    primary_joints = EXCLUDED.primary_joints,
    is_active = true,
    updated_at = now();

INSERT INTO exercise_library (name, category, movement_patterns, bilateral_unilateral, posterior_anterior, complexity, equipment, primary_muscle, supporting_muscles, muscle_bias, joint_count_level, dynamic_isometric, movement_plane, primary_joints, is_active)
  VALUES ('Kettlebell Overhead Press (seated)', 'strength', '{"vertical_push"}'::text[], 'bilateral', 'anterior', 2, '{"kettlebell"}'::text[], 'Anterior deltoid', '{"Triceps brachii","Upper trapezius","Serratus anterior"}'::text[], 'mid', 'regional', NULL, 'vertical', '{"Shoulder","Elbow"}'::text[], true)
  ON CONFLICT (name) DO UPDATE SET
    category = EXCLUDED.category,
    movement_patterns = EXCLUDED.movement_patterns,
    bilateral_unilateral = EXCLUDED.bilateral_unilateral,
    posterior_anterior = EXCLUDED.posterior_anterior,
    complexity = EXCLUDED.complexity,
    equipment = EXCLUDED.equipment,
    primary_muscle = EXCLUDED.primary_muscle,
    supporting_muscles = EXCLUDED.supporting_muscles,
    muscle_bias = EXCLUDED.muscle_bias,
    joint_count_level = EXCLUDED.joint_count_level,
    dynamic_isometric = EXCLUDED.dynamic_isometric,
    movement_plane = EXCLUDED.movement_plane,
    primary_joints = EXCLUDED.primary_joints,
    is_active = true,
    updated_at = now();

INSERT INTO exercise_library (name, category, movement_patterns, bilateral_unilateral, posterior_anterior, complexity, equipment, primary_muscle, supporting_muscles, muscle_bias, joint_count_level, dynamic_isometric, movement_plane, primary_joints, is_active)
  VALUES ('Single Arm Kettlebell Press (standing)', 'strength', '{"vertical_push"}'::text[], 'unilateral', 'anterior', 3, '{"kettlebell"}'::text[], 'Anterior deltoid', '{"Triceps brachii","Upper trapezius","Serratus anterior","Core stabilizers"}'::text[], 'mid', 'regional', NULL, 'vertical', '{"Shoulder","Elbow"}'::text[], true)
  ON CONFLICT (name) DO UPDATE SET
    category = EXCLUDED.category,
    movement_patterns = EXCLUDED.movement_patterns,
    bilateral_unilateral = EXCLUDED.bilateral_unilateral,
    posterior_anterior = EXCLUDED.posterior_anterior,
    complexity = EXCLUDED.complexity,
    equipment = EXCLUDED.equipment,
    primary_muscle = EXCLUDED.primary_muscle,
    supporting_muscles = EXCLUDED.supporting_muscles,
    muscle_bias = EXCLUDED.muscle_bias,
    joint_count_level = EXCLUDED.joint_count_level,
    dynamic_isometric = EXCLUDED.dynamic_isometric,
    movement_plane = EXCLUDED.movement_plane,
    primary_joints = EXCLUDED.primary_joints,
    is_active = true,
    updated_at = now();

INSERT INTO exercise_library (name, category, movement_patterns, bilateral_unilateral, posterior_anterior, complexity, equipment, primary_muscle, supporting_muscles, muscle_bias, joint_count_level, dynamic_isometric, movement_plane, primary_joints, is_active)
  VALUES ('Single Arm Kettlebell Press (seated)', 'strength', '{"vertical_push"}'::text[], 'unilateral', 'anterior', 3, '{"kettlebell"}'::text[], 'Anterior deltoid', '{"Triceps brachii","Upper trapezius","Serratus anterior","Core stabilizers"}'::text[], 'mid', 'regional', NULL, 'vertical', '{"Shoulder","Elbow"}'::text[], true)
  ON CONFLICT (name) DO UPDATE SET
    category = EXCLUDED.category,
    movement_patterns = EXCLUDED.movement_patterns,
    bilateral_unilateral = EXCLUDED.bilateral_unilateral,
    posterior_anterior = EXCLUDED.posterior_anterior,
    complexity = EXCLUDED.complexity,
    equipment = EXCLUDED.equipment,
    primary_muscle = EXCLUDED.primary_muscle,
    supporting_muscles = EXCLUDED.supporting_muscles,
    muscle_bias = EXCLUDED.muscle_bias,
    joint_count_level = EXCLUDED.joint_count_level,
    dynamic_isometric = EXCLUDED.dynamic_isometric,
    movement_plane = EXCLUDED.movement_plane,
    primary_joints = EXCLUDED.primary_joints,
    is_active = true,
    updated_at = now();

INSERT INTO exercise_library (name, category, movement_patterns, bilateral_unilateral, posterior_anterior, complexity, equipment, primary_muscle, supporting_muscles, muscle_bias, joint_count_level, dynamic_isometric, movement_plane, primary_joints, is_active)
  VALUES ('Smith Press Overhead Press', 'strength', '{"vertical_push"}'::text[], 'bilateral', 'anterior', 1, '{}'::text[], 'Anterior deltoid', '{"Triceps brachii","Upper trapezius","Serratus anterior"}'::text[], 'mid', 'regional', NULL, 'vertical', '{"Shoulder","Elbow"}'::text[], true)
  ON CONFLICT (name) DO UPDATE SET
    category = EXCLUDED.category,
    movement_patterns = EXCLUDED.movement_patterns,
    bilateral_unilateral = EXCLUDED.bilateral_unilateral,
    posterior_anterior = EXCLUDED.posterior_anterior,
    complexity = EXCLUDED.complexity,
    equipment = EXCLUDED.equipment,
    primary_muscle = EXCLUDED.primary_muscle,
    supporting_muscles = EXCLUDED.supporting_muscles,
    muscle_bias = EXCLUDED.muscle_bias,
    joint_count_level = EXCLUDED.joint_count_level,
    dynamic_isometric = EXCLUDED.dynamic_isometric,
    movement_plane = EXCLUDED.movement_plane,
    primary_joints = EXCLUDED.primary_joints,
    is_active = true,
    updated_at = now();

INSERT INTO exercise_library (name, category, movement_patterns, bilateral_unilateral, posterior_anterior, complexity, equipment, primary_muscle, supporting_muscles, muscle_bias, joint_count_level, dynamic_isometric, movement_plane, primary_joints, is_active)
  VALUES ('Smith Press Seated Overhead Press', 'strength', '{"vertical_push"}'::text[], 'bilateral', 'anterior', 1, '{}'::text[], 'Anterior deltoid', '{"Triceps brachii","Upper trapezius","Serratus anterior"}'::text[], 'mid', 'regional', NULL, 'vertical', '{"Shoulder","Elbow"}'::text[], true)
  ON CONFLICT (name) DO UPDATE SET
    category = EXCLUDED.category,
    movement_patterns = EXCLUDED.movement_patterns,
    bilateral_unilateral = EXCLUDED.bilateral_unilateral,
    posterior_anterior = EXCLUDED.posterior_anterior,
    complexity = EXCLUDED.complexity,
    equipment = EXCLUDED.equipment,
    primary_muscle = EXCLUDED.primary_muscle,
    supporting_muscles = EXCLUDED.supporting_muscles,
    muscle_bias = EXCLUDED.muscle_bias,
    joint_count_level = EXCLUDED.joint_count_level,
    dynamic_isometric = EXCLUDED.dynamic_isometric,
    movement_plane = EXCLUDED.movement_plane,
    primary_joints = EXCLUDED.primary_joints,
    is_active = true,
    updated_at = now();

INSERT INTO exercise_library (name, category, movement_patterns, bilateral_unilateral, posterior_anterior, complexity, equipment, primary_muscle, supporting_muscles, muscle_bias, joint_count_level, dynamic_isometric, movement_plane, primary_joints, is_active)
  VALUES ('Machine Shoulder Press', 'strength', '{"vertical_push"}'::text[], 'bilateral', 'anterior', 1, '{"fixed_machine"}'::text[], 'Anterior deltoid', '{"Triceps brachii","Upper trapezius","Serratus anterior"}'::text[], 'mid', 'regional', NULL, 'vertical', '{"Shoulder","Elbow"}'::text[], true)
  ON CONFLICT (name) DO UPDATE SET
    category = EXCLUDED.category,
    movement_patterns = EXCLUDED.movement_patterns,
    bilateral_unilateral = EXCLUDED.bilateral_unilateral,
    posterior_anterior = EXCLUDED.posterior_anterior,
    complexity = EXCLUDED.complexity,
    equipment = EXCLUDED.equipment,
    primary_muscle = EXCLUDED.primary_muscle,
    supporting_muscles = EXCLUDED.supporting_muscles,
    muscle_bias = EXCLUDED.muscle_bias,
    joint_count_level = EXCLUDED.joint_count_level,
    dynamic_isometric = EXCLUDED.dynamic_isometric,
    movement_plane = EXCLUDED.movement_plane,
    primary_joints = EXCLUDED.primary_joints,
    is_active = true,
    updated_at = now();

INSERT INTO exercise_library (name, category, movement_patterns, bilateral_unilateral, posterior_anterior, complexity, equipment, primary_muscle, supporting_muscles, muscle_bias, joint_count_level, dynamic_isometric, movement_plane, primary_joints, is_active)
  VALUES ('Half Kneeling Landmine Press', 'strength', '{"vertical_push"}'::text[], 'bilateral', 'anterior', 2, '{"landmine"}'::text[], 'Anterior deltoid', '{"Upper pectoralis","Triceps brachii","Serratus anterior","Core stabilizers"}'::text[], 'mid', 'regional', NULL, 'vertical', '{"Shoulder","Elbow"}'::text[], true)
  ON CONFLICT (name) DO UPDATE SET
    category = EXCLUDED.category,
    movement_patterns = EXCLUDED.movement_patterns,
    bilateral_unilateral = EXCLUDED.bilateral_unilateral,
    posterior_anterior = EXCLUDED.posterior_anterior,
    complexity = EXCLUDED.complexity,
    equipment = EXCLUDED.equipment,
    primary_muscle = EXCLUDED.primary_muscle,
    supporting_muscles = EXCLUDED.supporting_muscles,
    muscle_bias = EXCLUDED.muscle_bias,
    joint_count_level = EXCLUDED.joint_count_level,
    dynamic_isometric = EXCLUDED.dynamic_isometric,
    movement_plane = EXCLUDED.movement_plane,
    primary_joints = EXCLUDED.primary_joints,
    is_active = true,
    updated_at = now();

INSERT INTO exercise_library (name, category, movement_patterns, bilateral_unilateral, posterior_anterior, complexity, equipment, primary_muscle, supporting_muscles, muscle_bias, joint_count_level, dynamic_isometric, movement_plane, primary_joints, is_active)
  VALUES ('Single Arm Landmine Press', 'strength', '{"vertical_push"}'::text[], 'unilateral', 'anterior', 3, '{"landmine"}'::text[], 'Anterior deltoid', '{"Upper pectoralis","Triceps brachii","Serratus anterior","Core stabilizers"}'::text[], 'mid', 'regional', NULL, 'vertical', '{"Shoulder","Elbow"}'::text[], true)
  ON CONFLICT (name) DO UPDATE SET
    category = EXCLUDED.category,
    movement_patterns = EXCLUDED.movement_patterns,
    bilateral_unilateral = EXCLUDED.bilateral_unilateral,
    posterior_anterior = EXCLUDED.posterior_anterior,
    complexity = EXCLUDED.complexity,
    equipment = EXCLUDED.equipment,
    primary_muscle = EXCLUDED.primary_muscle,
    supporting_muscles = EXCLUDED.supporting_muscles,
    muscle_bias = EXCLUDED.muscle_bias,
    joint_count_level = EXCLUDED.joint_count_level,
    dynamic_isometric = EXCLUDED.dynamic_isometric,
    movement_plane = EXCLUDED.movement_plane,
    primary_joints = EXCLUDED.primary_joints,
    is_active = true,
    updated_at = now();

INSERT INTO exercise_library (name, category, movement_patterns, bilateral_unilateral, posterior_anterior, complexity, equipment, primary_muscle, supporting_muscles, muscle_bias, joint_count_level, dynamic_isometric, movement_plane, primary_joints, is_active)
  VALUES ('Wall Facing Strict Handstand Push-up', 'strength', '{"vertical_push"}'::text[], 'bilateral', 'anterior', 3, '{"bodyweight"}'::text[], 'Anterior deltoid', '{"Triceps brachii","Upper trapezius","Serratus anterior","Core stabilizers"}'::text[], 'lengthened', 'regional', NULL, 'vertical', '{"Shoulder","Elbow"}'::text[], true)
  ON CONFLICT (name) DO UPDATE SET
    category = EXCLUDED.category,
    movement_patterns = EXCLUDED.movement_patterns,
    bilateral_unilateral = EXCLUDED.bilateral_unilateral,
    posterior_anterior = EXCLUDED.posterior_anterior,
    complexity = EXCLUDED.complexity,
    equipment = EXCLUDED.equipment,
    primary_muscle = EXCLUDED.primary_muscle,
    supporting_muscles = EXCLUDED.supporting_muscles,
    muscle_bias = EXCLUDED.muscle_bias,
    joint_count_level = EXCLUDED.joint_count_level,
    dynamic_isometric = EXCLUDED.dynamic_isometric,
    movement_plane = EXCLUDED.movement_plane,
    primary_joints = EXCLUDED.primary_joints,
    is_active = true,
    updated_at = now();

INSERT INTO exercise_library (name, category, movement_patterns, bilateral_unilateral, posterior_anterior, complexity, equipment, primary_muscle, supporting_muscles, muscle_bias, joint_count_level, dynamic_isometric, movement_plane, primary_joints, is_active)
  VALUES ('Back to Wall Handstand Push-up', 'strength', '{"vertical_push"}'::text[], 'bilateral', 'anterior', 3, '{"bodyweight"}'::text[], 'Anterior deltoid', '{"Triceps brachii","Upper trapezius","Serratus anterior","Core stabilizers"}'::text[], 'lengthened', 'regional', NULL, 'vertical', '{"Shoulder","Elbow"}'::text[], true)
  ON CONFLICT (name) DO UPDATE SET
    category = EXCLUDED.category,
    movement_patterns = EXCLUDED.movement_patterns,
    bilateral_unilateral = EXCLUDED.bilateral_unilateral,
    posterior_anterior = EXCLUDED.posterior_anterior,
    complexity = EXCLUDED.complexity,
    equipment = EXCLUDED.equipment,
    primary_muscle = EXCLUDED.primary_muscle,
    supporting_muscles = EXCLUDED.supporting_muscles,
    muscle_bias = EXCLUDED.muscle_bias,
    joint_count_level = EXCLUDED.joint_count_level,
    dynamic_isometric = EXCLUDED.dynamic_isometric,
    movement_plane = EXCLUDED.movement_plane,
    primary_joints = EXCLUDED.primary_joints,
    is_active = true,
    updated_at = now();

INSERT INTO exercise_library (name, category, movement_patterns, bilateral_unilateral, posterior_anterior, complexity, equipment, primary_muscle, supporting_muscles, muscle_bias, joint_count_level, dynamic_isometric, movement_plane, primary_joints, is_active)
  VALUES ('A-frame Handstand Push-up', 'strength', '{"vertical_push"}'::text[], 'bilateral', 'anterior', 3, '{"bodyweight"}'::text[], 'Anterior deltoid', '{"Triceps brachii","Upper trapezius","Serratus anterior","Core stabilizers"}'::text[], 'lengthened', 'regional', NULL, 'vertical', '{"Shoulder","Elbow"}'::text[], true)
  ON CONFLICT (name) DO UPDATE SET
    category = EXCLUDED.category,
    movement_patterns = EXCLUDED.movement_patterns,
    bilateral_unilateral = EXCLUDED.bilateral_unilateral,
    posterior_anterior = EXCLUDED.posterior_anterior,
    complexity = EXCLUDED.complexity,
    equipment = EXCLUDED.equipment,
    primary_muscle = EXCLUDED.primary_muscle,
    supporting_muscles = EXCLUDED.supporting_muscles,
    muscle_bias = EXCLUDED.muscle_bias,
    joint_count_level = EXCLUDED.joint_count_level,
    dynamic_isometric = EXCLUDED.dynamic_isometric,
    movement_plane = EXCLUDED.movement_plane,
    primary_joints = EXCLUDED.primary_joints,
    is_active = true,
    updated_at = now();

INSERT INTO exercise_library (name, category, movement_patterns, bilateral_unilateral, posterior_anterior, complexity, equipment, primary_muscle, supporting_muscles, muscle_bias, joint_count_level, dynamic_isometric, movement_plane, primary_joints, is_active)
  VALUES ('Feet Elevated on A-frame Handstand Push-up', 'strength', '{"vertical_push"}'::text[], 'bilateral', 'anterior', 3, '{"bodyweight"}'::text[], 'Anterior deltoid', '{"Triceps brachii","Upper trapezius","Serratus anterior","Core stabilizers"}'::text[], 'lengthened', 'regional', NULL, 'vertical', '{"Shoulder","Elbow"}'::text[], true)
  ON CONFLICT (name) DO UPDATE SET
    category = EXCLUDED.category,
    movement_patterns = EXCLUDED.movement_patterns,
    bilateral_unilateral = EXCLUDED.bilateral_unilateral,
    posterior_anterior = EXCLUDED.posterior_anterior,
    complexity = EXCLUDED.complexity,
    equipment = EXCLUDED.equipment,
    primary_muscle = EXCLUDED.primary_muscle,
    supporting_muscles = EXCLUDED.supporting_muscles,
    muscle_bias = EXCLUDED.muscle_bias,
    joint_count_level = EXCLUDED.joint_count_level,
    dynamic_isometric = EXCLUDED.dynamic_isometric,
    movement_plane = EXCLUDED.movement_plane,
    primary_joints = EXCLUDED.primary_joints,
    is_active = true,
    updated_at = now();

INSERT INTO exercise_library (name, category, movement_patterns, bilateral_unilateral, posterior_anterior, complexity, equipment, primary_muscle, supporting_muscles, muscle_bias, joint_count_level, dynamic_isometric, movement_plane, primary_joints, is_active)
  VALUES ('Dual Dumbbell Push Press', 'strength', '{"vertical_push"}'::text[], 'bilateral', 'anterior', 3, '{"dumbbell"}'::text[], 'Anterior deltoid', '{"Triceps brachii","Upper trapezius","Serratus anterior","Legs/hips (drive)"}'::text[], 'mid', 'regional', NULL, 'vertical', '{"Shoulder","Elbow"}'::text[], true)
  ON CONFLICT (name) DO UPDATE SET
    category = EXCLUDED.category,
    movement_patterns = EXCLUDED.movement_patterns,
    bilateral_unilateral = EXCLUDED.bilateral_unilateral,
    posterior_anterior = EXCLUDED.posterior_anterior,
    complexity = EXCLUDED.complexity,
    equipment = EXCLUDED.equipment,
    primary_muscle = EXCLUDED.primary_muscle,
    supporting_muscles = EXCLUDED.supporting_muscles,
    muscle_bias = EXCLUDED.muscle_bias,
    joint_count_level = EXCLUDED.joint_count_level,
    dynamic_isometric = EXCLUDED.dynamic_isometric,
    movement_plane = EXCLUDED.movement_plane,
    primary_joints = EXCLUDED.primary_joints,
    is_active = true,
    updated_at = now();

INSERT INTO exercise_library (name, category, movement_patterns, bilateral_unilateral, posterior_anterior, complexity, equipment, primary_muscle, supporting_muscles, muscle_bias, joint_count_level, dynamic_isometric, movement_plane, primary_joints, is_active)
  VALUES ('Single Dumbbell Push Press', 'strength', '{"vertical_push"}'::text[], 'unilateral', 'anterior', 3, '{"dumbbell"}'::text[], 'Anterior deltoid', '{"Triceps brachii","Upper trapezius","Serratus anterior","Legs/hips (drive)","Core stabilizers"}'::text[], 'mid', 'regional', NULL, 'vertical', '{"Shoulder","Elbow"}'::text[], true)
  ON CONFLICT (name) DO UPDATE SET
    category = EXCLUDED.category,
    movement_patterns = EXCLUDED.movement_patterns,
    bilateral_unilateral = EXCLUDED.bilateral_unilateral,
    posterior_anterior = EXCLUDED.posterior_anterior,
    complexity = EXCLUDED.complexity,
    equipment = EXCLUDED.equipment,
    primary_muscle = EXCLUDED.primary_muscle,
    supporting_muscles = EXCLUDED.supporting_muscles,
    muscle_bias = EXCLUDED.muscle_bias,
    joint_count_level = EXCLUDED.joint_count_level,
    dynamic_isometric = EXCLUDED.dynamic_isometric,
    movement_plane = EXCLUDED.movement_plane,
    primary_joints = EXCLUDED.primary_joints,
    is_active = true,
    updated_at = now();

INSERT INTO exercise_library (name, category, movement_patterns, bilateral_unilateral, posterior_anterior, complexity, equipment, primary_muscle, supporting_muscles, muscle_bias, joint_count_level, dynamic_isometric, movement_plane, primary_joints, is_active)
  VALUES ('Single Kettlebell Push Press', 'strength', '{"vertical_push"}'::text[], 'unilateral', 'anterior', 3, '{"kettlebell"}'::text[], 'Anterior deltoid', '{"Triceps brachii","Upper trapezius","Serratus anterior","Legs/hips (drive)","Core stabilizers"}'::text[], 'mid', 'regional', NULL, 'vertical', '{"Shoulder","Elbow"}'::text[], true)
  ON CONFLICT (name) DO UPDATE SET
    category = EXCLUDED.category,
    movement_patterns = EXCLUDED.movement_patterns,
    bilateral_unilateral = EXCLUDED.bilateral_unilateral,
    posterior_anterior = EXCLUDED.posterior_anterior,
    complexity = EXCLUDED.complexity,
    equipment = EXCLUDED.equipment,
    primary_muscle = EXCLUDED.primary_muscle,
    supporting_muscles = EXCLUDED.supporting_muscles,
    muscle_bias = EXCLUDED.muscle_bias,
    joint_count_level = EXCLUDED.joint_count_level,
    dynamic_isometric = EXCLUDED.dynamic_isometric,
    movement_plane = EXCLUDED.movement_plane,
    primary_joints = EXCLUDED.primary_joints,
    is_active = true,
    updated_at = now();

INSERT INTO exercise_library (name, category, movement_patterns, bilateral_unilateral, posterior_anterior, complexity, equipment, primary_muscle, supporting_muscles, muscle_bias, joint_count_level, dynamic_isometric, movement_plane, primary_joints, is_active)
  VALUES ('Dual Kettlebell Push Press', 'strength', '{"vertical_push"}'::text[], 'bilateral', 'anterior', 3, '{"kettlebell"}'::text[], 'Anterior deltoid', '{"Triceps brachii","Upper trapezius","Serratus anterior","Legs/hips (drive)"}'::text[], 'mid', 'regional', NULL, 'vertical', '{"Shoulder","Elbow"}'::text[], true)
  ON CONFLICT (name) DO UPDATE SET
    category = EXCLUDED.category,
    movement_patterns = EXCLUDED.movement_patterns,
    bilateral_unilateral = EXCLUDED.bilateral_unilateral,
    posterior_anterior = EXCLUDED.posterior_anterior,
    complexity = EXCLUDED.complexity,
    equipment = EXCLUDED.equipment,
    primary_muscle = EXCLUDED.primary_muscle,
    supporting_muscles = EXCLUDED.supporting_muscles,
    muscle_bias = EXCLUDED.muscle_bias,
    joint_count_level = EXCLUDED.joint_count_level,
    dynamic_isometric = EXCLUDED.dynamic_isometric,
    movement_plane = EXCLUDED.movement_plane,
    primary_joints = EXCLUDED.primary_joints,
    is_active = true,
    updated_at = now();

INSERT INTO exercise_library (name, category, movement_patterns, bilateral_unilateral, posterior_anterior, complexity, equipment, primary_muscle, supporting_muscles, muscle_bias, joint_count_level, dynamic_isometric, movement_plane, primary_joints, is_active)
  VALUES ('Dumbbell Z-press', 'strength', '{"vertical_push"}'::text[], 'bilateral', 'anterior', 3, '{"dumbbell"}'::text[], 'Anterior deltoid', '{"Triceps brachii","Upper trapezius","Serratus anterior","Core stabilizers"}'::text[], 'mid', 'regional', NULL, 'vertical', '{"Shoulder","Elbow"}'::text[], true)
  ON CONFLICT (name) DO UPDATE SET
    category = EXCLUDED.category,
    movement_patterns = EXCLUDED.movement_patterns,
    bilateral_unilateral = EXCLUDED.bilateral_unilateral,
    posterior_anterior = EXCLUDED.posterior_anterior,
    complexity = EXCLUDED.complexity,
    equipment = EXCLUDED.equipment,
    primary_muscle = EXCLUDED.primary_muscle,
    supporting_muscles = EXCLUDED.supporting_muscles,
    muscle_bias = EXCLUDED.muscle_bias,
    joint_count_level = EXCLUDED.joint_count_level,
    dynamic_isometric = EXCLUDED.dynamic_isometric,
    movement_plane = EXCLUDED.movement_plane,
    primary_joints = EXCLUDED.primary_joints,
    is_active = true,
    updated_at = now();

INSERT INTO exercise_library (name, category, movement_patterns, bilateral_unilateral, posterior_anterior, complexity, equipment, primary_muscle, supporting_muscles, muscle_bias, joint_count_level, dynamic_isometric, movement_plane, primary_joints, is_active)
  VALUES ('Kettlebell Z Press', 'strength', '{"vertical_push"}'::text[], 'bilateral', 'anterior', 3, '{"kettlebell"}'::text[], 'Anterior deltoid', '{"Triceps brachii","Upper trapezius","Serratus anterior","Core stabilizers"}'::text[], 'mid', 'regional', NULL, 'vertical', '{"Shoulder","Elbow"}'::text[], true)
  ON CONFLICT (name) DO UPDATE SET
    category = EXCLUDED.category,
    movement_patterns = EXCLUDED.movement_patterns,
    bilateral_unilateral = EXCLUDED.bilateral_unilateral,
    posterior_anterior = EXCLUDED.posterior_anterior,
    complexity = EXCLUDED.complexity,
    equipment = EXCLUDED.equipment,
    primary_muscle = EXCLUDED.primary_muscle,
    supporting_muscles = EXCLUDED.supporting_muscles,
    muscle_bias = EXCLUDED.muscle_bias,
    joint_count_level = EXCLUDED.joint_count_level,
    dynamic_isometric = EXCLUDED.dynamic_isometric,
    movement_plane = EXCLUDED.movement_plane,
    primary_joints = EXCLUDED.primary_joints,
    is_active = true,
    updated_at = now();

INSERT INTO exercise_library (name, category, movement_patterns, bilateral_unilateral, posterior_anterior, complexity, equipment, primary_muscle, supporting_muscles, muscle_bias, joint_count_level, dynamic_isometric, movement_plane, primary_joints, is_active)
  VALUES ('Dumbbell Z Press (straddle)', 'strength', '{"vertical_push"}'::text[], 'bilateral', 'anterior', 3, '{"dumbbell"}'::text[], 'Anterior deltoid', '{"Triceps brachii","Upper trapezius","Serratus anterior","Core stabilizers"}'::text[], 'mid', 'regional', NULL, 'vertical', '{"Shoulder","Elbow"}'::text[], true)
  ON CONFLICT (name) DO UPDATE SET
    category = EXCLUDED.category,
    movement_patterns = EXCLUDED.movement_patterns,
    bilateral_unilateral = EXCLUDED.bilateral_unilateral,
    posterior_anterior = EXCLUDED.posterior_anterior,
    complexity = EXCLUDED.complexity,
    equipment = EXCLUDED.equipment,
    primary_muscle = EXCLUDED.primary_muscle,
    supporting_muscles = EXCLUDED.supporting_muscles,
    muscle_bias = EXCLUDED.muscle_bias,
    joint_count_level = EXCLUDED.joint_count_level,
    dynamic_isometric = EXCLUDED.dynamic_isometric,
    movement_plane = EXCLUDED.movement_plane,
    primary_joints = EXCLUDED.primary_joints,
    is_active = true,
    updated_at = now();

INSERT INTO exercise_library (name, category, movement_patterns, bilateral_unilateral, posterior_anterior, complexity, equipment, primary_muscle, supporting_muscles, muscle_bias, joint_count_level, dynamic_isometric, movement_plane, primary_joints, is_active)
  VALUES ('Kettlebell Z Press (straddle)', 'strength', '{"vertical_push"}'::text[], 'bilateral', 'anterior', 3, '{"kettlebell"}'::text[], 'Anterior deltoid', '{"Triceps brachii","Upper trapezius","Serratus anterior","Core stabilizers"}'::text[], 'mid', 'regional', NULL, 'vertical', '{"Shoulder","Elbow"}'::text[], true)
  ON CONFLICT (name) DO UPDATE SET
    category = EXCLUDED.category,
    movement_patterns = EXCLUDED.movement_patterns,
    bilateral_unilateral = EXCLUDED.bilateral_unilateral,
    posterior_anterior = EXCLUDED.posterior_anterior,
    complexity = EXCLUDED.complexity,
    equipment = EXCLUDED.equipment,
    primary_muscle = EXCLUDED.primary_muscle,
    supporting_muscles = EXCLUDED.supporting_muscles,
    muscle_bias = EXCLUDED.muscle_bias,
    joint_count_level = EXCLUDED.joint_count_level,
    dynamic_isometric = EXCLUDED.dynamic_isometric,
    movement_plane = EXCLUDED.movement_plane,
    primary_joints = EXCLUDED.primary_joints,
    is_active = true,
    updated_at = now();

INSERT INTO exercise_library (name, category, movement_patterns, bilateral_unilateral, posterior_anterior, complexity, equipment, primary_muscle, supporting_muscles, muscle_bias, joint_count_level, dynamic_isometric, movement_plane, primary_joints, is_active)
  VALUES ('Towel Pull-up', 'strength', '{"vertical_pull"}'::text[], 'bilateral', 'posterior', 3, '{"bodyweight"}'::text[], 'Latissimus dorsi', '{"Forearm flexors","Biceps brachii","Rhomboids","Lower trapezius"}'::text[], 'lengthened', 'regional', NULL, 'vertical', '{"Shoulder","Elbow"}'::text[], true)
  ON CONFLICT (name) DO UPDATE SET
    category = EXCLUDED.category,
    movement_patterns = EXCLUDED.movement_patterns,
    bilateral_unilateral = EXCLUDED.bilateral_unilateral,
    posterior_anterior = EXCLUDED.posterior_anterior,
    complexity = EXCLUDED.complexity,
    equipment = EXCLUDED.equipment,
    primary_muscle = EXCLUDED.primary_muscle,
    supporting_muscles = EXCLUDED.supporting_muscles,
    muscle_bias = EXCLUDED.muscle_bias,
    joint_count_level = EXCLUDED.joint_count_level,
    dynamic_isometric = EXCLUDED.dynamic_isometric,
    movement_plane = EXCLUDED.movement_plane,
    primary_joints = EXCLUDED.primary_joints,
    is_active = true,
    updated_at = now();

INSERT INTO exercise_library (name, category, movement_patterns, bilateral_unilateral, posterior_anterior, complexity, equipment, primary_muscle, supporting_muscles, muscle_bias, joint_count_level, dynamic_isometric, movement_plane, primary_joints, is_active)
  VALUES ('Weighted Towel Pull-up', 'strength', '{"vertical_pull"}'::text[], 'bilateral', 'posterior', 3, '{"bodyweight"}'::text[], 'Latissimus dorsi', '{"Forearm flexors","Biceps brachii","Rhomboids","Lower trapezius"}'::text[], 'lengthened', 'regional', NULL, 'vertical', '{"Shoulder","Elbow"}'::text[], true)
  ON CONFLICT (name) DO UPDATE SET
    category = EXCLUDED.category,
    movement_patterns = EXCLUDED.movement_patterns,
    bilateral_unilateral = EXCLUDED.bilateral_unilateral,
    posterior_anterior = EXCLUDED.posterior_anterior,
    complexity = EXCLUDED.complexity,
    equipment = EXCLUDED.equipment,
    primary_muscle = EXCLUDED.primary_muscle,
    supporting_muscles = EXCLUDED.supporting_muscles,
    muscle_bias = EXCLUDED.muscle_bias,
    joint_count_level = EXCLUDED.joint_count_level,
    dynamic_isometric = EXCLUDED.dynamic_isometric,
    movement_plane = EXCLUDED.movement_plane,
    primary_joints = EXCLUDED.primary_joints,
    is_active = true,
    updated_at = now();

INSERT INTO exercise_library (name, category, movement_patterns, bilateral_unilateral, posterior_anterior, complexity, equipment, primary_muscle, supporting_muscles, muscle_bias, joint_count_level, dynamic_isometric, movement_plane, primary_joints, is_active)
  VALUES ('Mixed Grip Pull-up', 'strength', '{"vertical_pull"}'::text[], 'bilateral', 'posterior', 3, '{"bodyweight"}'::text[], 'Latissimus dorsi', '{"Biceps brachii","Forearm flexors","Rhomboids","Lower trapezius"}'::text[], 'lengthened', 'regional', NULL, 'vertical', '{"Shoulder","Elbow"}'::text[], true)
  ON CONFLICT (name) DO UPDATE SET
    category = EXCLUDED.category,
    movement_patterns = EXCLUDED.movement_patterns,
    bilateral_unilateral = EXCLUDED.bilateral_unilateral,
    posterior_anterior = EXCLUDED.posterior_anterior,
    complexity = EXCLUDED.complexity,
    equipment = EXCLUDED.equipment,
    primary_muscle = EXCLUDED.primary_muscle,
    supporting_muscles = EXCLUDED.supporting_muscles,
    muscle_bias = EXCLUDED.muscle_bias,
    joint_count_level = EXCLUDED.joint_count_level,
    dynamic_isometric = EXCLUDED.dynamic_isometric,
    movement_plane = EXCLUDED.movement_plane,
    primary_joints = EXCLUDED.primary_joints,
    is_active = true,
    updated_at = now();

INSERT INTO exercise_library (name, category, movement_patterns, bilateral_unilateral, posterior_anterior, complexity, equipment, primary_muscle, supporting_muscles, muscle_bias, joint_count_level, dynamic_isometric, movement_plane, primary_joints, is_active)
  VALUES ('Weighted Mixed Grip Pull-up', 'strength', '{"vertical_pull"}'::text[], 'bilateral', 'posterior', 3, '{"bodyweight"}'::text[], 'Latissimus dorsi', '{"Biceps brachii","Forearm flexors","Rhomboids","Lower trapezius"}'::text[], 'lengthened', 'regional', NULL, 'vertical', '{"Shoulder","Elbow"}'::text[], true)
  ON CONFLICT (name) DO UPDATE SET
    category = EXCLUDED.category,
    movement_patterns = EXCLUDED.movement_patterns,
    bilateral_unilateral = EXCLUDED.bilateral_unilateral,
    posterior_anterior = EXCLUDED.posterior_anterior,
    complexity = EXCLUDED.complexity,
    equipment = EXCLUDED.equipment,
    primary_muscle = EXCLUDED.primary_muscle,
    supporting_muscles = EXCLUDED.supporting_muscles,
    muscle_bias = EXCLUDED.muscle_bias,
    joint_count_level = EXCLUDED.joint_count_level,
    dynamic_isometric = EXCLUDED.dynamic_isometric,
    movement_plane = EXCLUDED.movement_plane,
    primary_joints = EXCLUDED.primary_joints,
    is_active = true,
    updated_at = now();

INSERT INTO exercise_library (name, category, movement_patterns, bilateral_unilateral, posterior_anterior, complexity, equipment, primary_muscle, supporting_muscles, muscle_bias, joint_count_level, dynamic_isometric, movement_plane, primary_joints, is_active)
  VALUES ('Mixed Grip Strict Chest to Bar Pull-up', 'strength', '{"vertical_pull"}'::text[], 'bilateral', 'posterior', 3, '{"bodyweight"}'::text[], 'Latissimus dorsi', '{"Biceps brachii","Forearm flexors","Rhomboids","Lower trapezius"}'::text[], 'lengthened', 'regional', NULL, 'vertical', '{"Shoulder","Elbow"}'::text[], true)
  ON CONFLICT (name) DO UPDATE SET
    category = EXCLUDED.category,
    movement_patterns = EXCLUDED.movement_patterns,
    bilateral_unilateral = EXCLUDED.bilateral_unilateral,
    posterior_anterior = EXCLUDED.posterior_anterior,
    complexity = EXCLUDED.complexity,
    equipment = EXCLUDED.equipment,
    primary_muscle = EXCLUDED.primary_muscle,
    supporting_muscles = EXCLUDED.supporting_muscles,
    muscle_bias = EXCLUDED.muscle_bias,
    joint_count_level = EXCLUDED.joint_count_level,
    dynamic_isometric = EXCLUDED.dynamic_isometric,
    movement_plane = EXCLUDED.movement_plane,
    primary_joints = EXCLUDED.primary_joints,
    is_active = true,
    updated_at = now();

INSERT INTO exercise_library (name, category, movement_patterns, bilateral_unilateral, posterior_anterior, complexity, equipment, primary_muscle, supporting_muscles, muscle_bias, joint_count_level, dynamic_isometric, movement_plane, primary_joints, is_active)
  VALUES ('Weighted Mixed Grip Strict Chest to Bar Pull-up', 'strength', '{"vertical_pull"}'::text[], 'bilateral', 'posterior', 3, '{"bodyweight"}'::text[], 'Latissimus dorsi', '{"Biceps brachii","Forearm flexors","Rhomboids","Lower trapezius"}'::text[], 'lengthened', 'regional', NULL, 'vertical', '{"Shoulder","Elbow"}'::text[], true)
  ON CONFLICT (name) DO UPDATE SET
    category = EXCLUDED.category,
    movement_patterns = EXCLUDED.movement_patterns,
    bilateral_unilateral = EXCLUDED.bilateral_unilateral,
    posterior_anterior = EXCLUDED.posterior_anterior,
    complexity = EXCLUDED.complexity,
    equipment = EXCLUDED.equipment,
    primary_muscle = EXCLUDED.primary_muscle,
    supporting_muscles = EXCLUDED.supporting_muscles,
    muscle_bias = EXCLUDED.muscle_bias,
    joint_count_level = EXCLUDED.joint_count_level,
    dynamic_isometric = EXCLUDED.dynamic_isometric,
    movement_plane = EXCLUDED.movement_plane,
    primary_joints = EXCLUDED.primary_joints,
    is_active = true,
    updated_at = now();

INSERT INTO exercise_library (name, category, movement_patterns, bilateral_unilateral, posterior_anterior, complexity, equipment, primary_muscle, supporting_muscles, muscle_bias, joint_count_level, dynamic_isometric, movement_plane, primary_joints, is_active)
  VALUES ('Rope Lat Pulldown', 'strength', '{"vertical_pull"}'::text[], 'bilateral', 'posterior', 1, '{"cable"}'::text[], 'Latissimus dorsi', '{"Biceps brachii","Brachialis","Rhomboids","Lower trapezius","Posterior deltoid"}'::text[], 'lengthened', 'regional', NULL, 'vertical', '{"Shoulder","Elbow"}'::text[], true)
  ON CONFLICT (name) DO UPDATE SET
    category = EXCLUDED.category,
    movement_patterns = EXCLUDED.movement_patterns,
    bilateral_unilateral = EXCLUDED.bilateral_unilateral,
    posterior_anterior = EXCLUDED.posterior_anterior,
    complexity = EXCLUDED.complexity,
    equipment = EXCLUDED.equipment,
    primary_muscle = EXCLUDED.primary_muscle,
    supporting_muscles = EXCLUDED.supporting_muscles,
    muscle_bias = EXCLUDED.muscle_bias,
    joint_count_level = EXCLUDED.joint_count_level,
    dynamic_isometric = EXCLUDED.dynamic_isometric,
    movement_plane = EXCLUDED.movement_plane,
    primary_joints = EXCLUDED.primary_joints,
    is_active = true,
    updated_at = now();

INSERT INTO exercise_library (name, category, movement_patterns, bilateral_unilateral, posterior_anterior, complexity, equipment, primary_muscle, supporting_muscles, muscle_bias, joint_count_level, dynamic_isometric, movement_plane, primary_joints, is_active)
  VALUES ('T-bar Row', 'strength', '{"horizontal_pull"}'::text[], 'bilateral', 'posterior', 2, '{"landmine"}'::text[], 'Lats / Mid back', '{"Rhomboids","Middle trapezius","Posterior deltoid","Biceps brachii"}'::text[], 'lengthened', 'regional', NULL, 'horizontal', '{"Shoulder","Elbow"}'::text[], true)
  ON CONFLICT (name) DO UPDATE SET
    category = EXCLUDED.category,
    movement_patterns = EXCLUDED.movement_patterns,
    bilateral_unilateral = EXCLUDED.bilateral_unilateral,
    posterior_anterior = EXCLUDED.posterior_anterior,
    complexity = EXCLUDED.complexity,
    equipment = EXCLUDED.equipment,
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
