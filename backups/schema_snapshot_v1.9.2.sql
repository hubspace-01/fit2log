-- Snapshot схемы exercises ПЕРЕД добавлением target_rpe
-- Версия: v1.9.2
-- Дата: 2025-10-14

-- Текущие колонки exercises:
-- id, program_id, user_id, exercise_name, exercise_type,
-- target_sets, target_reps, target_weight, duration, distance,
-- order_index, notes, created_at, updated_at

-- Текущие колонки template_exercises:
-- id, template_id, exercise_name, exercise_type,
-- target_sets, target_reps, target_weight, duration, distance,
-- order_index, notes, created_at

-- Для восстановления:
-- 1. git reset --hard v1.9.2
-- 2. Применить backups/rollback_target_rpe.sql в Supabase SQL Editor
