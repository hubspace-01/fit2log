export interface User {
  id: string;
  first_name: string;
  last_name?: string;
  username?: string;
  language_code?: string;
}

export interface Program {
  id: string;
  user_id: string;
  program_name: string;
  is_template: boolean;
  day_order?: number;
  weekday_hint?: string;
  created_at: string;
  updated_at: string;
  exercises?: Exercise[];
}

export type ExerciseType = 'reps' | 'time' | 'distance';

export interface Exercise {
  id: string;
  program_id: string;
  user_id: string;
  exercise_name: string;
  exercise_type?: ExerciseType;
  target_sets: number;
  target_reps: number;
  target_weight: number;
  duration?: number;
  distance?: number;
  order_index: number;
  notes?: string;
}

export interface LogItem {
  id: string;
  user_id: string;
  program_id?: string;
  exercise_id?: string;
  session_id?: string;
  datetime: string;
  exercise_name: string;
  set_no: number;
  reps: number;
  weight: number;
  rpe?: number;
  duration?: number;
  distance?: number;
  comments?: string;
}

export interface ProgramTemplate {
  id: string;
  template_name: string;
  description: string;
  category: string;
  is_active: boolean;
  created_at: string;
  template_exercises?: TemplateExercise[];
}

export interface TemplateExercise {
  id: string;
  template_id: string;
  exercise_name: string;
  exercise_type?: ExerciseType;
  target_sets: number;
  target_reps: number;
  target_weight: number;
  duration?: number;
  distance?: number;
  order_index: number;
  notes?: string;
}

export interface WorkoutSessionDB {
  id: string;
  user_id: string;
  program_id: string;
  program_name: string;
  started_at: string;
  completed_at?: string;
  status: 'in_progress' | 'completed' | 'cancelled';
  total_duration?: number;
  created_at: string;
  updated_at: string;
}

export interface WorkoutSession {
  id?: string;
  program_id: string;
  program_name: string;
  started_at: string;
  exercises: Exercise[];
  current_exercise_index: number;
  logs: LogItem[];
}

export interface WorkoutHistoryItem {
  id: string;
  program_name: string;
  completed_at: string;
  total_duration: number;
  exercises_count: number;
  total_sets: number;
}

export interface WorkoutDetailLog {
  exercise_name: string;
  set_no: number;
  display_value: string;
  rpe?: number;
}

export interface AppState {
  screen: AppScreen;
  programs: Program[];
  current_program?: Program;
  workout_session?: WorkoutSession;
  workout_completed_sets?: any[];
  workout_duration?: number;
  workout_history?: WorkoutHistoryItem[];
  current_workout_detail?: WorkoutDetailLog[];
  current_workout_info?: WorkoutHistoryItem;
  loading: boolean;
  error?: string;
}

export enum AppScreen {
  LOADING = 'LOADING',
  AUTH_ERROR = 'AUTH_ERROR',
  PROGRAM_SELECTOR = 'PROGRAM_SELECTOR',
  PROGRAM_EDITOR = 'PROGRAM_EDITOR',
  PROGRAM_DETAILS = 'PROGRAM_DETAILS',
  TEMPLATE_LIST = 'TEMPLATE_LIST',
  WORKOUT_LOGGER = 'WORKOUT_LOGGER',
  WORKOUT_SUMMARY = 'WORKOUT_SUMMARY',
  WORKOUT_HISTORY = 'WORKOUT_HISTORY',
  WORKOUT_DETAIL = 'WORKOUT_DETAIL',
  STATISTICS = 'STATISTICS',
  PERSONAL_RECORDS = 'PERSONAL_RECORDS'
}

export interface PersonalRecord {
  id: string;
  user_id: string;
  exercise_name: string;
  exercise_type: ExerciseType;
  record_weight?: number;
  record_reps?: number;
  record_duration?: number;
  record_distance?: number;
  estimated_1rm?: number;
  achieved_at: string;
  session_id?: string;
  log_id?: string;
  is_current: boolean;
  previous_record_id?: string;
  created_at: string;
  updated_at: string;
}

export interface NewRecordSummary {
  exercise_name: string;
  exercise_type: ExerciseType;
  new_value: string;
  old_value?: string;
  improvement_percent?: number;
  record: PersonalRecord;
}

export interface RecordComparison {
  isNewRecord: boolean;
  currentBest?: PersonalRecord;
  improvement?: number;
}

export interface BasicStats {
  total_workouts: number;
  active_weeks_streak: number;
  total_duration_minutes: number;
}

export interface Last7DaysStats {
  workout_count: number;
  workout_dates: string[];
  split_size?: number;
  progress_percent?: number;
}

export interface TopExercise {
  exercise_name: string;
  total_sets: number;
  secondary_metric?: string;
}
