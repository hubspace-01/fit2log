-- ==========================================
-- Personal Records Tracking
-- ==========================================

-- Таблица личных рекордов
CREATE TABLE IF NOT EXISTS personal_records (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id TEXT NOT NULL,
  exercise_name TEXT NOT NULL,
  exercise_type TEXT NOT NULL CHECK (exercise_type IN ('reps', 'time', 'distance')),
  
  -- Для reps упражнений
  record_weight NUMERIC(6,2),
  record_reps INTEGER,
  
  -- Для time упражнений
  record_duration INTEGER, -- секунды
  
  -- Для distance упражнений
  record_distance NUMERIC(8,2), -- метры
  
  -- Расчётный 1RM (для сравнения)
  estimated_1rm NUMERIC(6,2),
  
  -- Метаданные
  achieved_at TIMESTAMPTZ NOT NULL,
  session_id UUID REFERENCES workout_sessions(id) ON DELETE SET NULL,
  log_id UUID REFERENCES logs(id) ON DELETE SET NULL,
  is_current BOOLEAN DEFAULT true,
  previous_record_id UUID REFERENCES personal_records(id) ON DELETE SET NULL,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Индексы
CREATE INDEX idx_pr_user ON personal_records(user_id);
CREATE INDEX idx_pr_exercise ON personal_records(user_id, exercise_name);
CREATE INDEX idx_pr_current ON personal_records(user_id, is_current) WHERE is_current = true;
CREATE INDEX idx_pr_achieved ON personal_records(achieved_at DESC);

-- RLS
ALTER TABLE personal_records ENABLE ROW LEVEL SECURITY;

-- Политики (базовые для MVP)
CREATE POLICY "personal_records_policy" ON personal_records
FOR ALL
USING (true)
WITH CHECK (true);

-- Комментарии
COMMENT ON TABLE personal_records IS 'Personal Records tracking for workout exercises';
COMMENT ON COLUMN personal_records.is_current IS 'True if this is the current active record, false for historical';
COMMENT ON COLUMN personal_records.estimated_1rm IS 'Calculated 1RM using Brzycki formula for reps exercises';
