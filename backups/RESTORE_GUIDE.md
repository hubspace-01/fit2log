# Инструкция по откату RPE

## Откат кода:
git reset --hard v1.9.2
git push --force

## Откат БД (Supabase SQL Editor):
ALTER TABLE exercises DROP COLUMN IF EXISTS target_rpe;
ALTER TABLE template_exercises DROP COLUMN IF EXISTS target_rpe;
